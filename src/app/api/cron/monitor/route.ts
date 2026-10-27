import { NextRequest, NextResponse } from 'next/server';
import { executeDomainAudit } from '@/lib/dns';
import { getActiveSubscriptions } from '@/lib/db/subscriptions';
import { sendDomainAlertEmail } from '@/lib/email/resend';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'cron_secret_deliverabilityguard_dev';

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Acceso no autorizado. Se requiere header Authorization Bearer válido.',
      },
      { status: 401 }
    );
  }

  const subscriptions = await getActiveSubscriptions();

  if (subscriptions.length === 0) {
    return NextResponse.json(
      {
        checked: 0,
        alertsTriggered: 0,
        timestamp: new Date().toISOString(),
        message: 'No hay suscripciones activas para auditar en este ciclo.',
      },
      { status: 200 }
    );
  }

  // Execute audits with controlled parallel settlement
  const auditPromises = subscriptions.map(async (sub) => {
    try {
      const report = await executeDomainAudit(sub.domain);
      const criticalIssues = report.issues.filter((i) => i.severity === 'CRITICAL');
      const isDegraded = report.score < 70 || criticalIssues.length > 0;
      let emailResult: { success: boolean; messageId?: string; error?: string } | null = null;

      if (isDegraded) {
        const issuesSummary = report.issues
          .filter((i) => i.severity === 'CRITICAL' || i.severity === 'WARNING')
          .map((i) => `${i.title}: ${i.description}`);

        emailResult = await sendDomainAlertEmail({
          to: sub.email,
          domain: sub.domain,
          score: report.score,
          issues:
            issuesSummary.length > 0
              ? issuesSummary
              : ['Puntaje de reputación y salud DNS degradado por debajo de 70/100.'],
        });

        console.warn(
          `[CRON MONITOR ALERTA] Dominio: ${sub.domain} | Score: ${report.score}/100 | Notificado a: ${sub.email} | EmailId: ${emailResult.messageId || 'N/A'}`
        );
      }

      return {
        domain: sub.domain,
        email: sub.email,
        score: report.score,
        status: report.status,
        alertTriggered: isDegraded,
        emailSent: emailResult ? emailResult.success : false,
        criticalCount: criticalIssues.length,
        warningCount: report.summary.warningCount,
      };
    } catch (err: unknown) {
      console.error(`[CRON MONITOR ERROR] Fallo al auditar ${sub.domain}:`, err);
      return {
        domain: sub.domain,
        email: sub.email,
        score: 0,
        status: 'CRITICAL',
        alertTriggered: true,
        error: err instanceof Error ? err.message : 'Error inesperado de red/DNS',
      };
    }
  });

  const settledResults = await Promise.allSettled(auditPromises);

  const results = settledResults.map((res) => {
    if (res.status === 'fulfilled') {
      return res.value;
    }
    return {
      domain: 'unknown',
      score: 0,
      status: 'CRITICAL',
      alertTriggered: true,
      error: 'Promise rejected',
    };
  });

  const alertsTriggered = results.filter((r) => r.alertTriggered).length;

  return NextResponse.json(
    {
      checked: results.length,
      alertsTriggered,
      timestamp: new Date().toISOString(),
      results,
    },
    { status: 200 }
  );
}
