import dns from 'node:dns/promises';
import type { MxRecord as NodeMxRecord } from 'node:dns';
import {
  AuditIssue,
  BlacklistAuditResult,
  BlacklistDetail,
  DkimAuditResult,
  DkimRecord,
  DomainAuditReport,
  DomainAuditStatus,
  MxAuditResult,
  MxRecordItem,
  TlsAuditResult,
} from './types';
import { sanitizeDomain, withTimeout } from './utils';
import { parseBimi, parseDkimSelector, parseDmarc, parseSpf } from './parsers';
import { verifyMailServerTls } from './tls-check';

const COMMON_DKIM_SELECTORS = ['google', 'selector1', 's1', 'k1'] as const;
const DNSBL_PROVIDERS = [
  'zen.spamhaus.org',
  'bl.spamcop.net',
  'b.barracudacentral.org',
  'dnsbl.sorbs.net',
] as const;
const DNS_TIMEOUT_MS = 3500;
const DNSBL_TIMEOUT_MS = 2000;

/**
 * Executes a comprehensive DNS deliverability and security audit for a given domain.
 * Evaluates SPF, DMARC, DKIM, MX, BIMI, and DNSBL Blacklists natively using node:dns/promises in parallel.
 */
export async function executeDomainAudit(
  inputDomain: string,
  options?: { forceRefresh?: boolean }
): Promise<DomainAuditReport> {
  const domain = sanitizeDomain(inputDomain);

  if (!domain || !domain.includes('.')) {
    throw new Error(`Dominio inválido o malformado: "${inputDomain}"`);
  }

  // Si se solicita forceRefresh, consultar directamente a resolvers globales para omitir caché local
  let dnsResolver: {
    resolveTxt: (hostname: string) => Promise<string[][]>;
    resolveMx: (hostname: string) => Promise<NodeMxRecord[]>;
    resolve4: (hostname: string) => Promise<string[]>;
  } = dns;

  if (options?.forceRefresh) {
    try {
      const freshResolver = new dns.Resolver();
      freshResolver.setServers(['1.1.1.1', '8.8.8.8', '8.8.4.4']);
      dnsResolver = freshResolver;
    } catch {
      dnsResolver = dns;
    }
  }

  // Safe DNS TXT resolver with timeout and standard error silencing (ENOTFOUND/ENODATA)
  const safeResolveTxt = async (lookupName: string): Promise<string[][]> => {
    try {
      return await withTimeout(
        dnsResolver.resolveTxt(lookupName),
        DNS_TIMEOUT_MS,
        `Tiempo de espera agotado al consultar TXT para ${lookupName}`
      );
    } catch {
      return [];
    }
  };

  // Safe DNS MX resolver
  const safeResolveMx = async (lookupName: string): Promise<NodeMxRecord[]> => {
    try {
      return await withTimeout(
        dnsResolver.resolveMx(lookupName),
        DNS_TIMEOUT_MS,
        `Tiempo de espera agotado al consultar MX para ${lookupName}`
      );
    } catch {
      return [];
    }
  };

  // Safe DNS IPv4 resolver
  const safeResolve4 = async (lookupName: string): Promise<string[]> => {
    try {
      return await withTimeout(
        dnsResolver.resolve4(lookupName),
        DNS_TIMEOUT_MS,
        `Tiempo de espera agotado al consultar IPv4 para ${lookupName}`
      );
    } catch {
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

  // 7. Check DNSBL / RBL Blacklists
  let mailServerIp: string | null = null;
  if (mxRecords.length > 0) {
    const primaryMx = mxRecords[0].exchange;
    const mxIps = await safeResolve4(primaryMx);
    if (mxIps.length > 0) {
      mailServerIp = mxIps[0];
    }
  }

  // Fallback a la IP A del dominio si no hay MX o no resolvió
  if (!mailServerIp) {
    const domainIps = await safeResolve4(domain);
    if (domainIps.length > 0) {
      mailServerIp = domainIps[0];
    }
  }

  let blacklistDetails: BlacklistDetail[] = [];
  let blacklistsListed = 0;

  if (mailServerIp && mailServerIp.includes('.')) {
    const reversedIp = mailServerIp.trim().split('.').reverse().join('.');

    blacklistDetails = await Promise.all(
      DNSBL_PROVIDERS.map(async (provider) => {
        const queryHost = `${reversedIp}.${provider}`;
        try {
          const ips = await withTimeout(
            dnsResolver.resolve4(queryHost),
            DNSBL_TIMEOUT_MS,
            'Timeout en consulta DNSBL'
          );
          const returnCode = ips[0];

          // Spamhaus deniega consultas públicas de 1.1.1.1/8.8.8.8 retornando 127.255.255.254/255
          const isSpamhausDenied =
            provider === 'zen.spamhaus.org' &&
            (returnCode === '127.255.255.254' || returnCode === '127.255.255.255');

          const isListed =
            !isSpamhausDenied && Boolean(returnCode && returnCode.startsWith('127.0.0.'));

          return {
            provider,
            listed: isListed,
            returnCode: isListed ? returnCode : undefined,
          };
        } catch {
          // NXDOMAIN / ENOTFOUND significa que no está listado (limpio)
          return {
            provider,
            listed: false,
          };
        }
      })
    );

    blacklistsListed = blacklistDetails.filter((d) => d.listed).length;
  } else {
    blacklistDetails = DNSBL_PROVIDERS.map((provider) => ({
      provider,
      listed: false,
    }));
  }

  const blacklistResult: BlacklistAuditResult = {
    ip: mailServerIp || 'No detectada',
    checked: DNSBL_PROVIDERS.length,
    listed: blacklistsListed,
    details: blacklistDetails,
  };

  const blacklistIssues: AuditIssue[] = [];
  if (blacklistsListed > 0) {
    const listedNames = blacklistDetails
      .filter((d) => d.listed)
      .map((d) => d.provider)
      .join(', ');

    blacklistIssues.push({
      id: 'blacklist-listed',
      category: 'BLACKLIST',
      severity: 'CRITICAL',
      title: `Servidor de correo listado en ${blacklistsListed} lista(s) negra(s) DNSBL`,
      description: `La IP pública de tu servidor de correo (${blacklistResult.ip}) aparece reportada en: ${listedNames}. Esto provocará rechazos inmediatos o clasificación masiva en SPAM por parte de Gmail, Outlook y Yahoo.`,
      recommendation: 'Solicita el desliste inmediato (delisting) en las páginas oficiales de las RBLs afectadas y audita envíos anómalos o cuentas vulneradas en tu red.',
    });
  }

  // 8. Verify In-Transit TLS & STARTTLS Encryption
  let tlsResult: TlsAuditResult = {
    mxHost: mxRecords[0]?.exchange || 'Sin servidores MX',
    supported: false,
    certValid: false,
  };

  const tlsIssues: AuditIssue[] = [];
  if (mxRecords.length > 0) {
    const primaryMx = mxRecords[0].exchange;
    tlsResult = await verifyMailServerTls(primaryMx);

    if (!tlsResult.supported) {
      tlsIssues.push({
        id: 'tls-unsupported',
        category: 'TLS',
        severity: 'WARNING',
        title: 'Cifrado en tránsito STARTTLS no soportado en servidor MX',
        description: `El servidor MX principal (${tlsResult.mxHost}) no tiene activo el protocolo STARTTLS o no acepta conexiones seguras cifradas. Los mensajes podrían viajar en texto plano vulnerable a espionaje o interceptación en tránsito.`,
        recommendation: 'Habilita STARTTLS con cifrado TLS 1.2 o TLS 1.3 en la configuración de tu servidor de correo entrante.',
      });
    } else if (tlsResult.certValid === false) {
      tlsIssues.push({
        id: 'tls-cert-invalid',
        category: 'TLS',
        severity: 'WARNING',
        title: 'Certificado TLS no válido o caducado en servidor MX',
        description: `El certificado de seguridad TLS presentado por el host (${tlsResult.mxHost}) no pudo ser validado por una Autoridad de Certificación reconocida o está próximo a expirar.`,
        recommendation: 'Instala o renueva el certificado digital SSL/TLS de tu servidor de correo.',
      });
    }
  }

  // 9. Aggregate all issues
  const allIssues: AuditIssue[] = [
    ...spfIssues,
    ...dmarcIssues,
    ...dkimIssues,
    ...mxIssues,
    ...bimiIssues,
    ...blacklistIssues,
    ...tlsIssues,
  ];

  // 10. Calculate score & summary
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
    blacklists: blacklistResult,
    tls: tlsResult,
  };
}
