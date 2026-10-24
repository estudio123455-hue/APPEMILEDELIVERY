import {
  AuditIssue,
  BimiRecord,
  DkimRecord,
  DmarcPolicy,
  DmarcRecord,
  SpfQualifier,
  SpfRecord,
} from './types';
import { normalizeTxtRecords } from './utils';

/**
 * Parses SPF (Sender Policy Framework) TXT records.
 * - Detects missing record
 * - Penalizes '+all' or unbounded 'all' severely (CRITICAL)
 * - Counts DNS lookup mechanisms (RFC 7208 limits lookups to 10 max)
 * - Validates ~all (SoftFail) or -all (Fail)
 */
export function parseSpf(rawRecords: string[][] | string[]): {
  record: SpfRecord;
  issues: AuditIssue[];
} {
  const issues: AuditIssue[] = [];
  const txts = normalizeTxtRecords(rawRecords);
  const spfRecords = txts.filter((txt) => txt.trim().toLowerCase().startsWith('v=spf1'));

  if (spfRecords.length === 0) {
    const missingIssue: AuditIssue = {
      id: 'spf-missing',
      category: 'SPF',
      severity: 'CRITICAL',
      title: 'Registro SPF no encontrado',
      description: 'El dominio no tiene un registro SPF configurado. Los remitentes no autorizados pueden suplantar la identidad de tu dominio sin restricciones.',
      recommendation: 'Crea un registro TXT con "v=spf1 include:_spf.tudominio.com ~all" configurando tus servidores autorizados.',
    };
    return {
      record: {
        raw: null,
        isValid: false,
        qualifier: null,
        mechanisms: [],
        dnsLookupCount: 0,
        warnings: ['No se detectó registro SPF'],
        errors: ['Registro SPF faltante'],
      },
      issues: [missingIssue],
    };
  }

  if (spfRecords.length > 1) {
    issues.push({
      id: 'spf-multiple-records',
      category: 'SPF',
      severity: 'CRITICAL',
      title: 'Múltiples registros SPF detectados',
      description: `Se detectaron ${spfRecords.length} registros SPF. RFC 7208 prohíbe múltiples registros, lo cual genera un estado PermError y causa el rechazo de correos.`,
      recommendation: 'Combina todos los servidores de envío en un único registro TXT "v=spf1".',
    });
  }

  const raw = spfRecords[0].trim();
  const tokens = raw.split(/\s+/).filter(Boolean);
  const mechanisms: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  let qualifier: SpfQualifier | null = null;
  let dnsLookupCount = 0;

  // DNS lookup mechanisms per RFC 7208: include, a, mx, ptr, exists, redirect
  const lookupRegex = /^(include:|a$|a:|mx$|mx:|ptr$|ptr:|exists:|redirect=)/i;

  for (const token of tokens) {
    const lower = token.toLowerCase();

    if (lower === 'v=spf1') {
      continue;
    }

    mechanisms.push(token);

    // Count lookups
    const strippedQualifier = lower.replace(/^[+\-~?]/, '');
    if (lookupRegex.test(strippedQualifier) || lookupRegex.test(lower)) {
      dnsLookupCount += 1;
    }

    // Inspect 'all' mechanism
    if (lower.endsWith('all')) {
      if (lower === '+all' || lower === 'all') {
        qualifier = '+all';
      } else if (lower === '-all') {
        qualifier = '-all';
      } else if (lower === '~all') {
        qualifier = '~all';
      } else if (lower === '?all') {
        qualifier = '?all';
      }
    }
  }

  // Validate 'all' directive
  if (qualifier === '+all') {
    const issue: AuditIssue = {
      id: 'spf-permissive-all',
      category: 'SPF',
      severity: 'CRITICAL',
      title: 'Política SPF altamente permisiva (+all)',
      description: 'El mecanismo "+all" o "all" sin calificador autoriza a cualquier servidor del mundo a enviar correos en nombre de tu dominio.',
      recommendation: 'Reemplaza "+all" por "-all" (rechazo estricto) o "~all" (SoftFail) para proteger la reputación de tu dominio.',
    };
    issues.push(issue);
    errors.push('Mecanismo +all detectado');
  } else if (qualifier === '?all') {
    const issue: AuditIssue = {
      id: 'spf-neutral-all',
      category: 'SPF',
      severity: 'WARNING',
      title: 'Política SPF neutral (?all)',
      description: 'El calificador "?all" no define una política de validación concluyente, permitiendo que atacantes intenten suplantar tu identidad.',
      recommendation: 'Actualiza el calificador a "~all" o idealmente "-all".',
    };
    issues.push(issue);
    warnings.push('Mecanismo ?all detectado');
  } else if (!qualifier) {
    const issue: AuditIssue = {
      id: 'spf-missing-all',
      category: 'SPF',
      severity: 'WARNING',
      title: 'Falta mecanismo "all" en SPF',
      description: 'El registro SPF no define explícitamente cómo tratar remitentes no especificados.',
      recommendation: 'Añade "~all" o "-all" al final de tu registro SPF.',
    };
    issues.push(issue);
    warnings.push('Falta mecanismo all en SPF');
  }

  // Lookup limit check (RFC 7208 allows max 10 DNS lookups)
  if (dnsLookupCount > 10) {
    const issue: AuditIssue = {
      id: 'spf-lookup-limit-exceeded',
      category: 'SPF',
      severity: 'CRITICAL',
      title: 'Límite de consultas DNS en SPF excedido (>10)',
      description: `El registro requiere ${dnsLookupCount} consultas DNS directas, superando el límite RFC 7208 de 10. Esto resulta en PermError automático en Gmail, Outlook y otros proveedores.`,
      recommendation: 'Usa una solución de aplanamiento SPF (SPF flattening) o consolida directivas con rangos ip4/ip6.',
    };
    issues.push(issue);
    errors.push(`Consultas DNS excedidas: ${dnsLookupCount}/10`);
  } else if (dnsLookupCount >= 8) {
    const issue: AuditIssue = {
      id: 'spf-lookup-limit-warning',
      category: 'SPF',
      severity: 'WARNING',
      title: 'Registro SPF cerca del límite de 10 consultas DNS',
      description: `Tu registro utiliza ${dnsLookupCount} consultas de las 10 permitidas por RFC 7208. Agregar un servicio adicional provocará fallos de entrega.`,
      recommendation: 'Optimiza o aplana las directivas include/a/mx antes de añadir nuevos remitentes.',
    };
    issues.push(issue);
    warnings.push(`Consultas DNS al límite: ${dnsLookupCount}/10`);
  }

  const isValid = errors.length === 0 && spfRecords.length === 1;

  return {
    record: {
      raw,
      isValid,
      qualifier,
      mechanisms,
      dnsLookupCount,
      warnings,
      errors,
    },
    issues,
  };
}

/**
 * Parses DMARC TXT record (_dmarc.domain).
 * - Parses tags (p, pct, sp, rua, ruf, etc.)
 * - Warns if p=none
 * - Warns if rua is missing
 */
export function parseDmarc(rawRecords: string[][] | string[]): {
  record: DmarcRecord;
  issues: AuditIssue[];
} {
  const issues: AuditIssue[] = [];
  const txts = normalizeTxtRecords(rawRecords);
  const dmarcRecords = txts.filter((txt) => {
    const trimmed = txt.trim().toLowerCase();
    return trimmed.startsWith('v=dmarc1') || trimmed.includes('v=dmarc1;');
  });

  if (dmarcRecords.length === 0) {
    const issue: AuditIssue = {
      id: 'dmarc-missing',
      category: 'DMARC',
      severity: 'CRITICAL',
      title: 'Registro DMARC no encontrado',
      description: 'El dominio no tiene una política DMARC configurada en _dmarc. Sin DMARC, tus correos carecen de protección contra phishing y spoofing directo.',
      recommendation: 'Configura un registro TXT en _dmarc con "v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com;".',
    };
    return {
      record: {
        raw: null,
        isValid: false,
        policy: null,
        subdomainPolicy: null,
        percentage: null,
        rua: [],
        ruf: [],
        tags: {},
        warnings: ['Registro DMARC ausente'],
        errors: ['Falta DMARC'],
      },
      issues: [issue],
    };
  }

  if (dmarcRecords.length > 1) {
    issues.push({
      id: 'dmarc-multiple-records',
      category: 'DMARC',
      severity: 'CRITICAL',
      title: 'Múltiples registros DMARC encontrados',
      description: 'RFC 7489 estipula que un dominio no debe tener más de un registro DMARC. La presencia de múltiples registros anula la protección DMARC.',
      recommendation: 'Elimina los registros DMARC duplicados y conserva únicamente uno.',
    });
  }

  const raw = dmarcRecords[0].trim();
  const tags: Record<string, string> = {};
  const warnings: string[] = [];
  const errors: string[] = [];

  const rawTags = raw.split(';').map((tag) => tag.trim()).filter(Boolean);

  for (const item of rawTags) {
    const eqIdx = item.indexOf('=');
    if (eqIdx !== -1) {
      const key = item.substring(0, eqIdx).trim().toLowerCase();
      const value = item.substring(eqIdx + 1).trim();
      tags[key] = value;
    }
  }

  const policyRaw = tags['p']?.toLowerCase();
  let policy: DmarcPolicy | null = null;
  if (policyRaw === 'reject' || policyRaw === 'quarantine' || policyRaw === 'none') {
    policy = policyRaw;
  }

  const spRaw = tags['sp']?.toLowerCase();
  let subdomainPolicy: DmarcPolicy | null = null;
  if (spRaw === 'reject' || spRaw === 'quarantine' || spRaw === 'none') {
    subdomainPolicy = spRaw;
  }

  let percentage: number | null = null;
  if (tags['pct']) {
    const parsedPct = parseInt(tags['pct'], 10);
    if (!isNaN(parsedPct)) {
      percentage = parsedPct;
    }
  }

  const rua = tags['rua']
    ? tags['rua'].split(',').map((email) => email.trim()).filter(Boolean)
    : [];

  const ruf = tags['ruf']
    ? tags['ruf'].split(',').map((email) => email.trim()).filter(Boolean)
    : [];

  // Policy validation
  if (!policy) {
    issues.push({
      id: 'dmarc-policy-missing',
      category: 'DMARC',
      severity: 'CRITICAL',
      title: 'Directiva de política "p" faltante en DMARC',
      description: 'El registro DMARC debe incluir obligatoriamente el tag "p=" indicando "none", "quarantine" o "reject".',
      recommendation: 'Añade "p=quarantine" o "p=reject" a tu registro DMARC.',
    });
    errors.push('Falta directiva p en DMARC');
  } else if (policy === 'none') {
    issues.push({
      id: 'dmarc-policy-none',
      category: 'DMARC',
      severity: 'WARNING',
      title: 'Política DMARC configurada solo en monitoreo (p=none)',
      description: 'La política "p=none" solo monitoriza y no bloquea correos fraudulentos o de phishing enviados en tu nombre.',
      recommendation: 'Avanza hacia "p=quarantine" o "p=reject" una vez alineados tus remitentes legítimos.',
    });
    warnings.push('Política DMARC en modo none');
  }

  // rua tag validation
  if (rua.length === 0) {
    issues.push({
      id: 'dmarc-rua-missing',
      category: 'DMARC',
      severity: 'WARNING',
      title: 'Falta etiqueta de reportes agregados "rua" en DMARC',
      description: 'Sin la etiqueta "rua", los servidores de correo (Google, Microsoft, etc.) no enviarán reportes de entregabilidad o intentos de suplantación.',
      recommendation: 'Añade "rua=mailto:dmarc-reports@tudominio.com" para recibir telemetría de entregabilidad.',
    });
    warnings.push('Falta etiqueta rua');
  }

  // Percentage check
  if (percentage !== null && percentage < 100) {
    issues.push({
      id: 'dmarc-pct-sub100',
      category: 'DMARC',
      severity: 'WARNING',
      title: 'Aplicación DMARC parcial (pct < 100)',
      description: `El valor pct=${percentage}% aplica la política solo a una fracción del correo saliente. El ${100 - percentage}% restante queda desprotegido.`,
      recommendation: 'Ajusta "pct=100" para asegurar una protección completa.',
    });
    warnings.push(`pct reducido: ${percentage}%`);
  }

  const isValid = errors.length === 0 && dmarcRecords.length === 1 && !!policy;

  return {
    record: {
      raw,
      isValid,
      policy,
      subdomainPolicy,
      percentage,
      rua,
      ruf,
      tags,
      warnings,
      errors,
    },
    issues,
  };
}

/**
 * Parses BIMI TXT records (default._bimi.domain).
 * - Parses 'l' (logo SVG) and 'a' (VMC certificate)
 * - Warns if VMC certificate is missing
 */
export function parseBimi(rawRecords: string[][] | string[]): {
  record: BimiRecord;
  issues: AuditIssue[];
} {
  const issues: AuditIssue[] = [];
  const txts = normalizeTxtRecords(rawRecords);
  const bimiRecords = txts.filter((txt) => {
    const trimmed = txt.trim().toLowerCase();
    return trimmed.startsWith('v=bimi1') || trimmed.includes('v=bimi1;');
  });

  if (bimiRecords.length === 0) {
    issues.push({
      id: 'bimi-missing',
      category: 'BIMI',
      severity: 'INFO',
      title: 'Registro BIMI no configurado',
      description: 'El dominio no tiene un registro BIMI en default._bimi. BIMI permite desplegar el logo oficial de tu marca en las bandejas de entrada de Gmail y Apple Mail.',
      recommendation: 'Configura un registro TXT en default._bimi con el logo SVG y certificado VMC para aumentar la confianza y tasas de apertura.',
    });

    return {
      record: {
        raw: null,
        isValid: false,
        logoUrl: null,
        authorityUrl: null,
        hasVmc: false,
        tags: {},
        warnings: [],
        errors: [],
      },
      issues,
    };
  }

  const raw = bimiRecords[0].trim();
  const tags: Record<string, string> = {};
  const warnings: string[] = [];
  const errors: string[] = [];

  const rawTags = raw.split(';').map((tag) => tag.trim()).filter(Boolean);
  for (const item of rawTags) {
    const eqIdx = item.indexOf('=');
    if (eqIdx !== -1) {
      const key = item.substring(0, eqIdx).trim().toLowerCase();
      const value = item.substring(eqIdx + 1).trim();
      tags[key] = value;
    }
  }

  const logoUrl = tags['l'] || null;
  const authorityUrl = tags['a'] || null;
  const hasVmc = !!(authorityUrl && authorityUrl.startsWith('https://') && authorityUrl.length > 10);

  if (!logoUrl) {
    issues.push({
      id: 'bimi-missing-logo',
      category: 'BIMI',
      severity: 'WARNING',
      title: 'BIMI no define la URL del logo (l=)',
      description: 'El registro BIMI debe especificar una URL HTTPS válida que apunte a un archivo SVG Tiny PS.',
      recommendation: 'Añade la etiqueta "l=https://tudominio.com/logo.svg" a tu registro BIMI.',
    });
    warnings.push('Falta etiqueta l (logo)');
  }

  if (!hasVmc) {
    issues.push({
      id: 'bimi-missing-vmc',
      category: 'BIMI',
      severity: 'WARNING',
      title: 'Certificado VMC ausente en registro BIMI (a=)',
      description: 'Falta el certificado Verified Mark Certificate (etiqueta "a="). Proveedores principales como Gmail y Apple Mail requieren obligatoriamente un VMC para proyectar tu logo.',
      recommendation: 'Adquiere y enlaza un certificado VMC (e.g. DigiCert o Entrust) en el atributo "a=" de BIMI.',
    });
    warnings.push('Falta certificado VMC');
  }

  const isValid = !!logoUrl;

  return {
    record: {
      raw,
      isValid,
      logoUrl,
      authorityUrl,
      hasVmc,
      tags,
      warnings,
      errors,
    },
    issues,
  };
}

/**
 * Parses individual DKIM TXT record found under a selector.
 */
export function parseDkimSelector(
  selector: string,
  rawRecords: string[][] | string[]
): DkimRecord | null {
  const txts = normalizeTxtRecords(rawRecords);
  const dkimTxt = txts.find((txt) => {
    const lower = txt.trim().toLowerCase();
    return lower.startsWith('v=dkim1') || lower.includes('p=');
  });

  if (!dkimTxt) {
    return null;
  }

  const raw = dkimTxt.trim();
  const tags: Record<string, string> = {};
  const rawTags = raw.split(';').map((tag) => tag.trim()).filter(Boolean);

  for (const item of rawTags) {
    const eqIdx = item.indexOf('=');
    if (eqIdx !== -1) {
      const key = item.substring(0, eqIdx).trim().toLowerCase();
      const value = item.substring(eqIdx + 1).trim();
      tags[key] = value;
    }
  }

  const publicKey = tags['p'] || null;
  const keyType = tags['k'] || 'rsa';
  const isValid = !!(publicKey && publicKey.length > 10);

  return {
    selector,
    raw,
    isValid,
    publicKey,
    keyType,
    tags,
  };
}
