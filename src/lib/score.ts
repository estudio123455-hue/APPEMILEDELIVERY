export interface DnsAuditResults {
  spf: { valid: boolean; record?: string };
  dmarc: { valid: boolean; policy?: string; record?: string };
  dkim: { valid: boolean; record?: string };
  mx: { valid: boolean; records?: string[] };
  bimi: { valid: boolean; record?: string };
}

export interface AuditReport {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: Array<{
    type: 'SPF' | 'DMARC' | 'DKIM' | 'MX' | 'BIMI';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    fixSuggestion?: string;
  }>;
}

export function calculateDeliverabilityScore(results: DnsAuditResults, domain: string): AuditReport {
  let score = 0;
  const recommendations: AuditReport['recommendations'] = [];

  // 1. Evaluación SPF (30 pts)
  if (results.spf.valid && results.spf.record) {
    if (results.spf.record.includes('~all') || results.spf.record.includes('-all')) {
      score += 30;
    } else {
      score += 15;
      recommendations.push({
        type: 'SPF',
        severity: 'warning',
        message: 'El registro SPF utiliza directiva permisiva (?all o +all).',
        fixSuggestion: `v=spf1 include:_spf.google.com ~all`
      });
    }
  } else {
    recommendations.push({
      type: 'SPF',
      severity: 'critical',
      message: 'No se detectó registro SPF válido. Tus correos corren alto riesgo de caer en SPAM.',
      fixSuggestion: `v=spf1 include:_spf.google.com ~all`
    });
  }

  // 2. Evaluación DMARC (35 pts)
  if (results.dmarc.valid && results.dmarc.record) {
    const policy = results.dmarc.policy?.toLowerCase();
    if (policy === 'reject') {
      score += 35;
    } else if (policy === 'quarantine') {
      score += 25;
      recommendations.push({
        type: 'DMARC',
        severity: 'info',
        message: 'Política DMARC configurada en "quarantine". Considera avanzar a "reject" para máxima protección.',
        fixSuggestion: `v=DMARC1; p=reject; rua=mailto:dmarc-reports@${domain}; pct=100`
      });
    } else {
      score += 15;
      recommendations.push({
        type: 'DMARC',
        severity: 'warning',
        message: 'DMARC está en modo monitoreo (p=none). No previene suplantación de identidad.',
        fixSuggestion: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@${domain}`
      });
    }
  } else {
    recommendations.push({
      type: 'DMARC',
      severity: 'critical',
      message: 'Falta registro DMARC. Cualquier atacante puede falsificar correos desde tu dominio.',
      fixSuggestion: `v=DMARC1; p=quarantine; rua=mailto:seguridad@${domain}`
    });
  }

  // 3. Evaluación DKIM (25 pts)
  if (results.dkim.valid) {
    score += 25;
  } else {
    recommendations.push({
      type: 'DKIM',
      severity: 'critical',
      message: 'No se verificó firma DKIM activa en los selectores comunes.',
      fixSuggestion: 'Genera llaves DKIM de 2048-bit desde tu proveedor de correo (Google Workspace, Microsoft 365, Resend).'
    });
  }

  // 4. Evaluación MX y BIMI (10 pts)
  if (results.mx.valid && (results.mx.records?.length ?? 0) > 0) {
    score += 8;
  } else {
    recommendations.push({
      type: 'MX',
      severity: 'critical',
      message: 'El dominio no tiene servidores de correo MX configurados para recibir mensajes.'
    });
  }

  if (results.bimi.valid) {
    score += 2;
  } else {
    recommendations.push({
      type: 'BIMI',
      severity: 'info',
      message: 'BIMI no configurado (opcional). BIMI permite mostrar tu logotipo verificado en bandejas de entrada.'
    });
  }

  // Grado
  let grade: AuditReport['grade'] = 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 40) grade = 'D';

  return { score, grade, recommendations };
}
