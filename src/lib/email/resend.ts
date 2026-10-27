import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'DeliverabilityGuard <onboarding@resend.dev>';

/**
 * Plantilla HTML con tema Dark/Obsidian para Alertas de Salud DNS
 */
function renderDomainAlertHtml({
  domain,
  score,
  issues,
}: {
  domain: string;
  score: number;
  issues: string[];
}): string {
  const isCritical = score < 50;
  const accentColor = isCritical ? '#EF4444' : '#F59E0B';
  const badgeBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  const badgeBorder = isCritical ? '#7F1D1D' : '#78350F';
  const scoreColor = isCritical ? '#F87171' : '#FBBF24';

  const issuesListHtml =
    issues.length > 0
      ? issues
          .map(
            (issue) => `
        <li style="margin-bottom: 10px; padding: 10px 14px; background-color: #1A2234; border: 1px solid #28354D; border-radius: 8px; color: #E2E8F0; font-size: 13px; line-height: 1.5; list-style: none;">
          <span style="color: ${accentColor}; font-weight: bold; margin-right: 6px;">&#9888;</span> ${issue}
        </li>`
          )
          .join('')
      : `<li style="padding: 10px 14px; background-color: #1A2234; border-radius: 8px; color: #94A3B8; font-size: 13px; list-style: none;">Se detectó una degradación general en los registros DNS.</li>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Alerta de Seguridad DNS - DeliverabilityGuard</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid ${accentColor}; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
    <!-- Top Alert Stripe -->
    <tr>
      <td height="4" style="background-color: ${accentColor};"></td>
    </tr>
    <!-- Header -->
    <tr>
      <td style="padding: 24px 30px; background-color: #0F172A; border-bottom: 1px solid #1E293B;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${accentColor}; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; border-radius: 9999px;">
                &#128737; DELIVERABILITYGUARD &bull; ALERTA DE SEGURIDAD
              </span>
            </td>
            <td align="right">
              <span style="font-size: 12px; color: #64748B;">Monitor Nocturno</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Body Content -->
    <tr>
      <td style="padding: 30px;">
        <h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">
          Degradación Crítica Detectada
        </h1>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94A3B8;">
          Nuestro escáner de reputación y entregabilidad detectó fallas o reportes en listas negras para su dominio monitoreado.
        </p>

        <!-- Domain & Score Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #090D16; border: 1px solid #1F2937; border-radius: 10px; padding: 18px 20px;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 4px;">Dominio Auditado</div>
              <div style="font-size: 17px; font-weight: 700; color: #F1F5F9; font-family: monospace;">${domain}</div>
            </td>
            <td align="right">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 4px;">Salud DNS</div>
              <div style="font-size: 22px; font-weight: 800; color: ${scoreColor};">${score}<span style="font-size: 14px; color: #64748B;">/100</span></div>
            </td>
          </tr>
        </table>

        <!-- Issues List -->
        <div style="margin-bottom: 16px;">
          <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #CBD5E1;">
            Vulnerabilidades Identificadas
          </h3>
          <ul style="margin: 0; padding: 0;">
            ${issuesListHtml}
          </ul>
        </div>

        <p style="margin: 20px 0 28px; font-size: 13px; line-height: 1.6; color: #94A3B8;">
          Estas advertencias pueden causar que los correos salientes terminen en la bandeja de Spam o sean rechazados por Google Workspace y Microsoft 365.
        </p>

        <!-- CTA Button -->
        <div style="text-align: center; margin-top: 25px; margin-bottom: 10px;">
          <a href="https://www.miportal.me" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: linear-block; background-color: #10B981; color: #042F2E; padding: 14px 28px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">
            Ver Diagnóstico y Reparar en MiPortal &rarr;
          </a>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; background-color: #0A0E17; border-top: 1px solid #1E293B; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #64748B;">
          DeliverabilityGuard &bull; Sistema Automatizado de Monitoreo DNS y Entregabilidad
        </p>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          &copy; 2026 MiPortal Suite. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Plantilla HTML con tema Dark/Obsidian para Cotizaciones Comerciales
 */
function renderCommercialQuoteHtml({
  clientName,
  quoteTitle,
  amountCOP,
  paymentUrl,
}: {
  clientName: string;
  quoteTitle: string;
  amountCOP: number;
  paymentUrl: string;
}): string {
  const formattedAmount = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amountCOP);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Cotización Oficial - MiPortal Business</title>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F8FAFC;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1E293B; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
    <!-- Top Accent Stripe -->
    <tr>
      <td height="4" style="background: linear-gradient(90deg, #10B981, #3B82F6);"></td>
    </tr>
    <!-- Header -->
    <tr>
      <td style="padding: 24px 30px; background-color: #0F172A; border-bottom: 1px solid #1E293B;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #10B981; background-color: rgba(16, 185, 129, 0.12); border: 1px solid #064E3B; border-radius: 9999px;">
                &#128188; MIPORTAL BUSINESS &bull; COTIZACI&Oacute;N
              </span>
            </td>
            <td align="right">
              <span style="font-size: 12px; color: #64748B;">Documento Comercial</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <!-- Body Content -->
    <tr>
      <td style="padding: 30px;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #94A3B8;">
          Estimado/a <strong style="color: #F1F5F9;">${clientName}</strong>,
        </p>
        <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em;">
          Propuesta y Cotización de Servicio
        </h1>
        <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94A3B8;">
          Hemos generado tu cotización personalizada con las especificaciones acordadas para impulsar la presencia y seguridad de tu infraestructura digital.
        </p>

        <!-- Executive Quote Details Card -->
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #090D16; border: 1px solid #1E293B; border-radius: 10px; padding: 22px 24px;">
          <tr>
            <td style="padding-bottom: 16px; border-bottom: 1px solid #1F2937;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 6px;">Servicio Cotizado</div>
              <div style="font-size: 18px; font-weight: 700; color: #F8FAFC;">${quoteTitle}</div>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 16px;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: #64748B; letter-spacing: 0.05em; margin-bottom: 6px;">Total Liquidado</div>
              <div style="font-size: 28px; font-weight: 800; color: #10B981; letter-spacing: -0.02em;">
                ${formattedAmount}
              </div>
            </td>
          </tr>
        </table>

        <!-- Security & Guarantee Notice -->
        <div style="padding: 12px 16px; background-color: rgba(30, 41, 59, 0.5); border: 1px solid #1E293B; border-radius: 8px; margin-bottom: 26px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="24" valign="top" style="font-size: 16px; color: #10B981;">&#128274;</td>
              <td style="font-size: 12px; line-height: 1.5; color: #94A3B8; padding-left: 8px;">
                Pago procesado de forma segura y encriptada a través de la pasarela oficial de <strong style="color: #E2E8F0;">Bold</strong>. Tu activación y soporte comenzarán inmediatamente tras la confirmación.
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA Direct Button -->
        <div style="text-align: center; margin-top: 10px; margin-bottom: 10px;">
          <a href="${paymentUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; padding: 15px 34px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);">
            Pagar Ahora con Bold &rarr;
          </a>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding: 20px 30px; background-color: #0A0E17; border-top: 1px solid #1E293B; text-align: center;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #64748B;">
          MiPortal Business &bull; Facturación y Cotizaciones Inteligentes
        </p>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          &copy; 2026 MiPortal Suite &bull; <a href="https://www.miportal.me" style="color: #64748B; text-decoration: underline;">www.miportal.me</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envío de alertas de salud y fallas DNS desde el Monitor Nocturno
 */
export async function sendDomainAlertEmail({
  to,
  domain,
  score,
  issues,
}: {
  to: string;
  domain: string;
  score: number;
  issues: string[];
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `⚠️ [Alerta DNS] Degradación detectada en ${domain} (${score}/100)`;
  const html = renderDomainAlertHtml({ domain, score, issues });

  if (!resend) {
    console.warn(
      `[RESEND SIMULADO] RESEND_API_KEY no configurado. Simulando envío de alerta para ${to} (Dominio: ${domain})`
    );
    return {
      success: true,
      messageId: `simulated_alert_${Date.now()}`,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[RESEND] Error enviando alerta DNS:', error);
      return { success: false, error: error.message };
    }

    console.log(`[RESEND] Alerta DNS enviada exitosamente a ${to}. ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[RESEND] Excepción al enviar alerta DNS:', err);
    return { success: false, error: err?.message || 'Error inesperado de Resend' };
  }
}

/**
 * Envío de cotizaciones comerciales ejecutivas con botón de pago a Bold
 */
export async function sendCommercialQuoteEmail({
  to,
  clientName,
  quoteTitle,
  amountCOP,
  paymentUrl,
}: {
  to: string;
  clientName: string;
  quoteTitle: string;
  amountCOP: number;
  paymentUrl: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const subject = `Cotización Comercial: ${quoteTitle} — MiPortal Business`;
  const html = renderCommercialQuoteHtml({
    clientName,
    quoteTitle,
    amountCOP,
    paymentUrl,
  });

  if (!resend) {
    console.warn(
      `[RESEND SIMULADO] RESEND_API_KEY no configurado. Simulando envío de cotización para ${to} ($${amountCOP} COP)`
    );
    return {
      success: true,
      messageId: `simulated_quote_${Date.now()}`,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[RESEND] Error enviando cotización comercial:', error);
      return { success: false, error: error.message };
    }

    console.log(`[RESEND] Cotización enviada exitosamente a ${to}. ID: ${data?.id}`);
    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[RESEND] Excepción al enviar cotización comercial:', err);
    return { success: false, error: err?.message || 'Error inesperado de Resend' };
  }
}
