import dns from 'node:dns/promises';
import type { MxRecord as NodeMxRecord } from 'node:dns';
import {
  AuditIssue,
  DkimAuditResult,
  DkimRecord,
  DomainAuditReport,
  DomainAuditStatus,
  MxAuditResult,
  MxRecordItem,
} from './types';
import { sanitizeDomain, withTimeout } from './utils';
import { parseBimi, parseDkimSelector, parseDmarc, parseSpf } from './parsers';

const COMMON_DKIM_SELECTORS = ['google', 'selector1', 's1', 'k1'] as const;
const DNS_TIMEOUT_MS = 3500;

/**
 * Executes a comprehensive DNS deliverability and security audit for a given domain.
 * Evaluates SPF, DMARC, DKIM, MX, and BIMI records natively using node:dns/promises in parallel.
 */
export async function executeDomainAudit(inputDomain: string): Promise<DomainAuditReport> {
  const domain = sanitizeDomain(inputDomain);

  if (!domain || !domain.includes('.')) {
    throw new Error(`Dominio inválido o malformado: "${inputDomain}"`);
  }

  // Safe DNS TXT resolver with timeout and standard error silencing (ENOTFOUND/ENODATA)
  const safeResolveTxt = async (lookupName: string): Promise<string[][]> => {
    try {
      return await withTimeout(
        dns.resolveTxt(lookupName),
        DNS_TIMEOUT_MS,
        `Tiempo de espera agotado al consultar TXT para ${lookupName}`
      );
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NODATA') {
        return [];
      }
      return [];
    }
  };

  // Safe DNS MX resolver
  const safeResolveMx = async (lookupName: string): Promise<NodeMxRecord[]> => {
    try {
      return await withTimeout(
        dns.resolveMx(lookupName),
        DNS_TIMEOUT_MS,
        `Tiempo de espera agotado al consultar MX para ${lookupName}`
      );
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NODATA') {
        return [];
      }
      return [];
    }
  };

  // 1. Parallel DNS queries
  const [rootTxts, mxRawRecords, dmarcTxts, bimiTxts, ...dkimResults] =
    await Promise.all([
      // Root TXT for SPF
      safeResolveTxt(domain),
      // MX records for mail routing
      safeResolveMx(domain),
      // DMARC TXT
      safeResolveTxt(`_dmarc.${domain}`),
      // BIMI TXT
      safeResolveTxt(`default._bimi.${domain}`),
      // Common DKIM selectors
      ...COMMON_DKIM_SELECTORS.map((sel) =>
        safeResolveTxt(`${sel}._domainkey.${domain}`)
      ),
    ]);

  // 2. Parse SPF
  const { record: spfRecord, issues: spfIssues } = parseSpf(rootTxts);

  // 3. Parse DMARC
  const { record: dmarcRecord, issues: dmarcIssues } = parseDmarc(dmarcTxts);

  // 4. Parse BIMI
  const { record: bimiRecord, issues: bimiIssues } = parseBimi(bimiTxts);

  // 5. Parse MX
  const mxIssues: AuditIssue[] = [];
  const mxRecords: MxRecordItem[] = mxRawRecords.map((item) => ({
    exchange: item.exchange,
    priority: item.priority,
  }));

  let isMxValid = false;
  const mxWarnings: string[] = [];
  const mxErrors: string[] = [];

  if (mxRecords.length === 0) {
    mxIssues.push({
      id: 'mx-missing',
      category: 'MX',
      severity: 'CRITICAL',
      title: 'Registros MX no encontrados',
      description: 'El dominio no tiene servidores de correo MX configurados. No podrá recibir mensajes de correo electrónico ni respuestas a campañas.',
      recommendation: 'Apunta los registros MX hacia la infraestructura de tu proveedor de correo (Google Workspace, Microsoft 365, etc.).',
    });
    mxErrors.push('No hay registros MX configurados');
  } else {
    isMxValid = true;
  }

  const mxResult: MxAuditResult = {
    records: mxRecords.sort((a, b) => a.priority - b.priority),
    isValid: isMxValid,
    warnings: mxWarnings,
    errors: mxErrors,
  };

  // 6. Parse DKIM
  const dkimIssues: AuditIssue[] = [];
  const validDkimRecords: DkimRecord[] = [];
  const checkedSelectors = [...COMMON_DKIM_SELECTORS];

  COMMON_DKIM_SELECTORS.forEach((selector, index) => {
    const rawResult = dkimResults[index];
    if (rawResult && rawResult.length > 0) {
      const parsed = parseDkimSelector(selector, rawResult);
      if (parsed) {
        validDkimRecords.push(parsed);
      }
    }
  });

  const hasDkim = validDkimRecords.length > 0;
  const dkimWarnings: string[] = [];
  const dkimErrors: string[] = [];

  if (!hasDkim) {
    dkimIssues.push({
      id: 'dkim-common-missing',
      category: 'DKIM',
      severity: 'WARNING',
      title: 'No se detectó DKIM en los selectores comunes',
      description: `No se encontraron firmas DKIM bajo los selectores predeterminados probados (${COMMON_DKIM_SELECTORS.join(', ')}). Si usas un selector personalizado, tu correo podría estar autenticado pero no fue detectado en el barrido estándar.`,
      recommendation: 'Verifica en tu proveedor de correo (SendGrid, Postmark, Google) cuál selector DKIM específico está configurado en tu zona DNS.',
    });
    dkimWarnings.push('DKIM no detectado en selectores estándar');
  }

  const dkimResult: DkimAuditResult = {
    found: hasDkim,
    records: validDkimRecords,
    checkedSelectors,
    warnings: dkimWarnings,
    errors: dkimErrors,
  };

  // 7. Aggregate all issues
  const allIssues: AuditIssue[] = [
    ...spfIssues,
    ...dmarcIssues,
    ...dkimIssues,
    ...mxIssues,
    ...bimiIssues,
  ];

  // 8. Calculate score & summary
  let criticalCount = 0;
  let warningCount = 0;
  let infoCount = 0;

  for (const issue of allIssues) {
    if (issue.severity === 'CRITICAL') {
      criticalCount += 1;
    } else if (issue.severity === 'WARNING') {
      warningCount += 1;
    } else if (issue.severity === 'INFO') {
      infoCount += 1;
    }
  }

  // Base score 100: -30 per CRITICAL, -10 per WARNING
  const calculatedScore = 100 - (criticalCount * 30 + warningCount * 10);
  const score = Math.max(0, Math.min(100, calculatedScore));

  let status: DomainAuditStatus = 'EXCELLENT';
  if (score < 40 || criticalCount > 0) {
    status = 'CRITICAL';
  } else if (score < 70) {
    status = 'NEEDS_ATTENTION';
  } else if (score < 90) {
    status = 'GOOD';
  }

  return {
    domain,
    timestamp: new Date().toISOString(),
    score,
    status,
    summary: {
      criticalCount,
      warningCount,
      infoCount,
    },
    issues: allIssues,
    spf: spfRecord,
    dmarc: dmarcRecord,
    dkim: dkimResult,
    mx: mxResult,
    bimi: bimiRecord,
  };
}
