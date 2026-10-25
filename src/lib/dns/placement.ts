import type { DomainAuditReport } from './types';

export type PlacementStatus = 'INBOX' | 'PROMOTIONS_SUSPICIOUS' | 'SPAM';

export interface PlacementPrediction {
  providerId: 'gmail' | 'outlook' | 'yahoo';
  name: string;
  tagline: string;
  status: PlacementStatus;
  badgeLabel: string;
  estimatedRate: number; // 0 - 100 percentage
  headline: string;
  folderName: string;
  reasons: string[];
  technicalRequirement: string;
}

export interface PlacementSimulationResult {
  overallStatus: PlacementStatus;
  averageRate: number;
  predictions: PlacementPrediction[];
}

/**
 * Calculates email inbox placement predictions for Gmail, Microsoft 365, and Yahoo/Apple
 * using deterministic heuristics based on RFC compliance and 2024+ enforcement rules.
 */
export function calculatePlacementPrediction(report: DomainAuditReport): PlacementSimulationResult {
  const isSpfValid = report.spf.isValid && report.spf.errors.length === 0;
  const isDmarcPresent = report.dmarc.isValid;
  const isDmarcStrict = report.dmarc.isValid && (report.dmarc.policy === 'quarantine' || report.dmarc.policy === 'reject');
  const isDmarcNone = report.dmarc.isValid && report.dmarc.policy === 'none';
  const hasDkim = report.dkim.found;
  const isBlacklisted = report.blacklists.listed > 0;
  const hasStartTls = report.tls.supported;
  const hasBimi = report.bimi.isValid && Boolean(report.bimi.logoUrl);

  // -------------------------------------------------------------
  // 1. Gmail / Google Workspace Heuristics (2024+ Enforcement)
  // -------------------------------------------------------------
  let gmailStatus: PlacementStatus = 'INBOX';
  let gmailRate = 95;
  let gmailFolder = 'Bandeja Principal (Primary)';
  let gmailHeadline = 'Máxima entregabilidad en Gmail y Google Workspace';
  const gmailReasons: string[] = [];

  if (isBlacklisted) {
    gmailStatus = 'SPAM';
    gmailRate = 12;
    gmailFolder = 'Carpeta de Spam (Rechazo Inmediato)';
    gmailHeadline = 'Bloqueado por reputación en Listas Negras (DNSBL)';
    gmailReasons.push(
      `La IP emisora aparece listada en ${report.blacklists.listed} lista(s) negra(s). Los filtros antispam de Google descartan o envían directo a Spam.`
    );
  } else if (!isSpfValid && (!isDmarcPresent || isDmarcNone)) {
    gmailStatus = 'SPAM';
    gmailRate = 18;
    gmailFolder = 'Carpeta de Spam / Rechazo 550';
    gmailHeadline = 'Incumplimiento de requisitos obligatorios Google 2024+';
    gmailReasons.push(
      'Google exige autenticación simultánea de SPF y DMARC para remitentes. La ausencia de SPF válido provoca desvío directo a Spam o rebote 550.'
    );
  } else if (!isDmarcStrict) {
    gmailStatus = 'PROMOTIONS_SUSPICIOUS';
    gmailRate = 65;
    gmailFolder = 'Pestaña Promociones / Notificaciones';
    gmailHeadline = 'Política DMARC permisiva (p=none) o no detectada';
    gmailReasons.push(
      'Tu dominio no tiene política DMARC de cuarentena/rechazo (`p=quarantine` o `p=reject`). Google clasifica tus mensajes en Promociones y resta prioridad en la bandeja principal.'
    );
    if (!hasDkim) {
      gmailReasons.push('No se detectó firma criptográfica DKIM en selectores estándar.');
    }
  } else {
    gmailStatus = 'INBOX';
    gmailRate = 96;
    gmailFolder = 'Bandeja Principal (Inbox)';
    gmailHeadline = 'Cumplimiento total de directivas Google';
    gmailReasons.push('SPF válido y política DMARC estricta activos.');
    gmailReasons.push('IP del servidor limpia sin reportes en listas negras.');
  }

  // -------------------------------------------------------------
  // 2. Microsoft 365 / Outlook Heuristics (Exchange SmartScreen)
  // -------------------------------------------------------------
  let outlookStatus: PlacementStatus = 'INBOX';
  let outlookRate = 92;
  let outlookFolder = 'Bandeja Prioritarios (Focused Inbox)';
  let outlookHeadline = 'Acceso directo a la bandeja prioritaria de Outlook';
  const outlookReasons: string[] = [];

  if (isBlacklisted) {
    outlookStatus = 'SPAM';
    outlookRate = 15;
    outlookFolder = 'Carpeta de Correo No Deseado (Junk)';
    outlookHeadline = 'Filtro SmartScreen de Microsoft activó cuarentena';
    outlookReasons.push(
      'La IP de tu servidor está reportada en RBLs globales. Microsoft Exchange Online asigna un SCL (Spam Confidence Level) alto y desvía a Correo No Deseado.'
    );
  } else if (!isSpfValid) {
    outlookStatus = 'SPAM';
    outlookRate = 28;
    outlookFolder = 'Carpeta de Correo No Deseado (Junk)';
    outlookHeadline = 'Fallo de autenticación SPF en Microsoft Exchange';
    outlookReasons.push(
      'Outlook rechaza la validación SPF SenderID. Sin SPF válido, la probabilidad de caer en Correo No Deseado supera el 70%.'
    );
  } else if (!hasStartTls || !isDmarcStrict) {
    outlookStatus = 'PROMOTIONS_SUSPICIOUS';
    outlookRate = 68;
    outlookFolder = 'Bandeja "Otros" (Other tab)';
    outlookHeadline = 'Falta cifrado TLS o DMARC restrictivo';
    if (!hasStartTls) {
      outlookReasons.push('El servidor MX no tiene STARTTLS verificado para cifrado en tránsito.');
    }
    if (!isDmarcStrict) {
      outlookReasons.push('DMARC no está en modo de protección activa (p=quarantine o reject).');
    }
  } else {
    outlookStatus = 'INBOX';
    outlookRate = 94;
    outlookFolder = 'Bandeja Prioritarios (Focused)';
    outlookHeadline = 'Confianza alta en Microsoft Exchange';
    outlookReasons.push('SPF alineado, STARTTLS activo y reputación IP limpia.');
  }

  // -------------------------------------------------------------
  // 3. Yahoo Mail / Apple Mail Heuristics (Normativa 2024 & BIMI)
  // -------------------------------------------------------------
  let yahooStatus: PlacementStatus = 'INBOX';
  let yahooRate = 90;
  let yahooFolder = 'Bandeja de Entrada (Inbox)';
  let yahooHeadline = 'Entregabilidad óptima en Yahoo y Apple Mail';
  const yahooReasons: string[] = [];

  if (isBlacklisted || (!isSpfValid && !isDmarcPresent)) {
    yahooStatus = 'SPAM';
    yahooRate = 10;
    yahooFolder = 'Carpeta de Spam';
    yahooHeadline = 'Rechazo por las directivas estrictas de Yahoo 2024';
    yahooReasons.push(
      'Yahoo aplica bloqueo automático a remitentes sin autenticación DNS básica o con IP catalogada en Spamhaus.'
    );
  } else if (!isDmarcStrict) {
    yahooStatus = 'PROMOTIONS_SUSPICIOUS';
    yahooRate = 60;
    yahooFolder = 'Bandeja de Promociones / Sospechosos';
    yahooHeadline = 'Alineación incompleta según el estándar Yahoo';
    yahooReasons.push(
      'Yahoo requiere que el dominio del encabezado From coincida estrictamente con DMARC activo para garantizar la bandeja principal.'
    );
  } else if (hasBimi) {
    yahooStatus = 'INBOX';
    yahooRate = 99;
    yahooFolder = 'Bandeja Principal + Avatar Oficial Verificado';
    yahooHeadline = 'Máxima distinción visual de marca con BIMI';
    yahooReasons.push('Registro BIMI configurado con logotipo oficial en Apple Mail y Yahoo.');
    yahooReasons.push('Autenticación SPF y DMARC blindadas.');
  } else {
    yahooStatus = 'INBOX';
    yahooRate = 91;
    yahooFolder = 'Bandeja de Entrada';
    yahooHeadline = 'Aceptado en bandeja de entrada';
    yahooReasons.push('SPF y DMARC cumplen con las normativas actuales.');
    yahooReasons.push('Tip: Configura BIMI para mostrar tu logotipo corporativo al lado de tus correos.');
  }

  const predictions: PlacementPrediction[] = [
    {
      providerId: 'gmail',
      name: 'Gmail / Google Workspace',
      tagline: 'Filtros Google Anti-Spam 2024+',
      status: gmailStatus,
      badgeLabel:
        gmailStatus === 'INBOX'
          ? 'Bandeja Principal'
          : gmailStatus === 'PROMOTIONS_SUSPICIOUS'
          ? 'Promociones / Alerta'
          : 'Carpeta de Spam',
      estimatedRate: gmailRate,
      headline: gmailHeadline,
      folderName: gmailFolder,
      reasons: gmailReasons,
      technicalRequirement: 'Obligatorio SPF + DKIM + DMARC alineado con From.',
    },
    {
      providerId: 'outlook',
      name: 'Microsoft 365 / Outlook',
      tagline: 'Filtro Exchange SmartScreen',
      status: outlookStatus,
      badgeLabel:
        outlookStatus === 'INBOX'
          ? 'Bandeja Prioritarios'
          : outlookStatus === 'PROMOTIONS_SUSPICIOUS'
          ? 'Pestaña "Otros"'
          : 'Correo No Deseado',
      estimatedRate: outlookRate,
      headline: outlookHeadline,
      folderName: outlookFolder,
      reasons: outlookReasons,
      technicalRequirement: 'Obligatorio SPF + STARTTLS cifrado + IP limpia.',
    },
    {
      providerId: 'yahoo',
      name: 'Yahoo Mail / Apple Mail',
      tagline: 'Filtros Yahoo Anti-Abuse & BIMI',
      status: yahooStatus,
      badgeLabel:
        yahooStatus === 'INBOX'
          ? hasBimi
            ? 'Bandeja + Logo Verificado'
            : 'Bandeja de Entrada'
          : yahooStatus === 'PROMOTIONS_SUSPICIOUS'
          ? 'Pestaña Promociones'
          : 'Carpeta de Spam',
      estimatedRate: yahooRate,
      headline: yahooHeadline,
      folderName: yahooFolder,
      reasons: yahooReasons,
      technicalRequirement: 'Obligatorio DMARC estricto; soporte para marcas BIMI.',
    },
  ];

  const averageRate = Math.round(
    predictions.reduce((acc, p) => acc + p.estimatedRate, 0) / predictions.length
  );

  let overallStatus: PlacementStatus = 'INBOX';
  if (predictions.some((p) => p.status === 'SPAM')) {
    overallStatus = 'SPAM';
  } else if (predictions.some((p) => p.status === 'PROMOTIONS_SUSPICIOUS')) {
    overallStatus = 'PROMOTIONS_SUSPICIOUS';
  }

  return {
    overallStatus,
    averageRate,
    predictions,
  };
}
