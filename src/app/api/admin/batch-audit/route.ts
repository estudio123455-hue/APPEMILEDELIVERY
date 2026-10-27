import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { isUserSuperAdmin } from '@/config/admin';
import { executeDomainAudit } from '@/lib/dns';
import type { DomainAuditReport } from '@/lib/dns/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function cleanDomain(input: string): string {
  let cleaned = input.trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  cleaned = cleaned.replace(/:\d+$/, '');
  return cleaned;
}

function generateWhatsAppPitch(domain: string, report: DomainAuditReport): string {
  const score = report.score;
  const dmarcPolicy = report.dmarc.policy || 'AUSENTE';
  const hasSpf = report.spf.isValid;
  const criticalCount = report.issues.filter((i) => i.severity === 'CRITICAL').length;

  let riskMsg = '';
  if (dmarcPolicy === 'AUSENTE' || dmarcPolicy === 'none') {
    riskMsg = 'Cualquier persona puede falsificar correos usando tu dominio y tus clientes no pueden distinguir los reales de intentos de estafa o phishing.';
  } else if (!hasSpf) {
    riskMsg = 'Tu registro SPF presenta errores, provocando que Gmail y Outlook manden tus correos comerciales directo a la carpeta de Spam.';
  } else {
    riskMsg = 'Tu reputación de dominio está en riesgo técnico ante las nuevas políticas de entregabilidad 2026.';
  }

  return `*🚨 Diagnóstico de Entregabilidad y Seguridad para ${domain}*

Hola, realizamos un escaneo técnico de infraestructura de correo sobre *${domain}* y detectamos oportunidades críticas de mejora:

• *Calificación DNS:* ${score}/100 ${score < 60 ? '⚠️ (Riesgo Alto)' : '📊'}
• *Política DMARC:* ${dmarcPolicy.toUpperCase()}
• *Vulnerabilidades Detectadas:* ${criticalCount} críticas

*Impacto Directo:*
${riskMsg}

📄 *Puedes revisar el reporte técnico interactivo aquí:*
https://www.miportal.me/audit/${domain}

🛡️ *Blindaje Completo en 24 Horas:*
Podemos configurar tus registros DMARC, SPF estricto y DKIM para asegurar 100% de llegada a la Bandeja de Entrada por $150.000 COP (Pago seguro con Bold):
https://checkout.bold.co/payment/LNK_33UADDKUTL`;
}

function generateLinkedInPitch(domain: string, report: DomainAuditReport): string {
  const score = report.score;
  const dmarcPolicy = report.dmarc.policy || 'sin configurar';

  return `Estimado equipo,

Monitoreando métricas de entregabilidad e higiene DNS para dominios corporativos, analizamos los registros de ${domain}.

Actualmente su puntaje de salud DNS es de ${score}/100, con política DMARC en estado "${dmarcPolicy}". Con las regulaciones estrictas de Google y Yahoo, esto impacta directamente la tasa de apertura de sus correos de prospección y ventas.

Pueden consultar el desglose técnico y las directivas recomendadas en este enlace público:
https://www.miportal.me/audit/${domain}

Quedo a su disposición si desean resolver esto de manera inmediata con nuestro servicio de blindaje garantizado.`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!isUserSuperAdmin(user)) {
      return NextResponse.json(
        {
          error: 'FORBIDDEN',
          message: 'Acceso restringido. Esta función es de uso exclusivo para Super Administradores.',
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawDomains: unknown = body.domains;

    if (!rawDomains || !Array.isArray(rawDomains)) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Se esperaba un arreglo de dominios en la propiedad "domains".' },
        { status: 400 }
      );
    }

    // Sanitize & unique up to 30 domains
    const domainList = Array.from(
      new Set(
        rawDomains
          .filter((d): d is string => typeof d === 'string')
          .map(cleanDomain)
          .filter((d) => d.length > 3 && d.includes('.'))
      )
    ).slice(0, 30);

    if (domainList.length === 0) {
      return NextResponse.json(
        { error: 'EMPTY_LIST', message: 'No se encontraron dominios válidos para auditar.' },
        { status: 400 }
      );
    }

    // Parallel analysis with Promise.allSettled
    const auditPromises = domainList.map(async (domain) => {
      try {
        const report = await executeDomainAudit(domain);
        const criticalIssues = report.issues.filter((i) => i.severity === 'CRITICAL');

        return {
          domain,
          score: report.score,
          status: report.status,
          dmarcPolicy: report.dmarc.policy || 'AUSENTE',
          dmarcValid: report.dmarc.isValid,
          spfValid: report.spf.isValid,
          dkimFound: report.dkim.found,
          mxValid: report.mx.isValid,
          isBlacklisted: report.blacklists.listed > 0,
          blacklistsCount: report.blacklists.listed,
          criticalCount: criticalIssues.length,
          warningCount: report.summary.warningCount,
          topIssue: criticalIssues[0]?.title || report.issues[0]?.title || 'Sin incidencias graves',
          salesPitchWhatsApp: generateWhatsAppPitch(domain, report),
          salesPitchLinkedIn: generateLinkedInPitch(domain, report),
        };
      } catch (err) {
        return {
          domain,
          score: 0,
          status: 'CRITICAL',
          dmarcPolicy: 'ERROR',
          dmarcValid: false,
          spfValid: false,
          dkimFound: false,
          mxValid: false,
          isBlacklisted: false,
          blacklistsCount: 0,
          criticalCount: 1,
          warningCount: 0,
          topIssue: err instanceof Error ? err.message : 'Error resolviendo DNS',
          salesPitchWhatsApp: `*🚨 Alerta de Entregabilidad para ${domain}*\n\nDetectamos problemas graves de resolución de registros de correo en tu dominio. Revisa el reporte: https://www.miportal.me/audit/${domain}`,
          salesPitchLinkedIn: `Hola, detectamos fallos críticos en la infraestructura de correo de ${domain}. Puedes ver el análisis en https://www.miportal.me/audit/${domain}`,
        };
      }
    });

    const resultsSettled = await Promise.allSettled(auditPromises);
    const results = resultsSettled.map((r, idx) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        domain: domainList[idx],
        score: 0,
        status: 'CRITICAL',
        dmarcPolicy: 'ERROR',
        dmarcValid: false,
        spfValid: false,
        dkimFound: false,
        mxValid: false,
        isBlacklisted: false,
        blacklistsCount: 0,
        criticalCount: 1,
        warningCount: 0,
        topIssue: 'Fallo al ejecutar auditoría',
        salesPitchWhatsApp: '',
        salesPitchLinkedIn: '',
      };
    });

    return NextResponse.json({
      success: true,
      total: results.length,
      analyzedAt: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error('[BATCH AUDIT ERROR]:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado al procesar el lote.' },
      { status: 500 }
    );
  }
}
