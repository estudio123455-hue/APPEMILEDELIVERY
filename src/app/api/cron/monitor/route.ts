import { NextRequest, NextResponse } from 'next/server';
import { executeDomainAudit } from '@/lib/dns';
import { getActiveSubscriptions } from '@/lib/db/subscriptions';
import { sendDomainAlertEmail } from '@/lib/email/resend';
import { getSupabaseAdmin } from '@/utils/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface MonitorAuditResult {
  domain: string;
  email: string;
  score: number;
  status: string;
  alertTriggered: boolean;
  emailSent: boolean;
  reason?: string;
  error?: string;
}

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

  const supabase = getSupabaseAdmin();
  const allResults: MonitorAuditResult[] = [];

  // 1. Fetch monitored domains from Supabase `public.monitored_domains`
  const { data: dbMonitored, error: dbError } = await supabase
    .from('monitored_domains')
    .select('*');

  if (dbError) {
    console.warn('[CRON MONITOR] Error al consultar monitored_domains:', dbError.message);
  }

  if (dbMonitored && dbMonitored.length > 0) {
    const dbPromises = dbMonitored.map(async (item) => {
      let recipientEmail = 'admin@miportal.me';
      try {
        if (item.user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', item.user_id)
            .single();

          if (profile?.email) {
            recipientEmail = profile.email;
          }
        }

        const report = await executeDomainAudit(item.domain);
        const criticalIssues = report.issues.filter((i) => i.severity === 'CRITICAL');
        const isBlacklistedNow = report.blacklists.listed > 0;
        const currentPolicy = report.dmarc.policy || 'none';

        // Detect degradation conditions
        const isScoreDegraded = report.score < 70;
        const hasScoreDropped = item.last_score > 0 && report.score <= item.last_score - 10;
        const isDmarcWeakened =
          item.last_dmarc_policy &&
          item.last_dmarc_policy !== 'none' &&
          ((currentPolicy as string) === 'none' || (currentPolicy as string) === 'AUSENTE');
        const isNewlyBlacklisted = isBlacklistedNow && !item.is_blacklisted;

        const isAlertTriggered =
          isScoreDegraded ||
          hasScoreDropped ||
          isDmarcWeakened ||
          isNewlyBlacklisted ||
          criticalIssues.length > 0;

        let emailResult: { success: boolean; messageId?: string } | null = null;

        if (isAlertTriggered) {
          const reasons: string[] = [];
          if (isScoreDegraded) reasons.push(`Puntaje bajo crítico: ${report.score}/100.`);
          if (hasScoreDropped) reasons.push(`Caída de reputación de ${item.last_score} a ${report.score}.`);
          if (isDmarcWeakened) reasons.push(`Política DMARC debilitada a ${currentPolicy}.`);
          if (isNewlyBlacklisted) reasons.push(`Dominio listado en ${report.blacklists.listed} listas negras RBL.`);
          if (criticalIssues.length > 0) {
            reasons.push(...criticalIssues.map((c) => `${c.title}: ${c.description}`));
          }

          emailResult = await sendDomainAlertEmail({
            to: recipientEmail,
            domain: item.domain,
            score: report.score,
            issues: reasons,
          });

          console.warn(
            `[RADAR ALERTA] Dominio: ${item.domain} | Score: ${report.score}/100 | Notificado a: ${recipientEmail}`
          );
        }

        // Update monitored_domains in Supabase
        await supabase
          .from('monitored_domains')
          .update({
            last_score: report.score,
            last_dmarc_policy: currentPolicy,
            is_blacklisted: isBlacklistedNow,
            last_checked_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        return {
          domain: item.domain,
          email: recipientEmail,
          score: report.score,
          status: report.status,
          alertTriggered: isAlertTriggered,
          emailSent: emailResult ? emailResult.success : false,
          reason: isAlertTriggered ? 'Degradación detectada' : 'Saludable',
        };
      } catch (err) {
        console.error(`[RADAR ERROR] Fallo auditando ${item.domain}:`, err);
        return {
          domain: item.domain,
          email: recipientEmail,
          score: 0,
          status: 'CRITICAL',
          alertTriggered: true,
          emailSent: false,
          error: err instanceof Error ? err.message : 'Error inesperado',
        };
      }
    });

    const settledDb = await Promise.allSettled(dbPromises);
    settledDb.forEach((res) => {
      if (res.status === 'fulfilled') {
        allResults.push(res.value);
      }
    });
  }

  // 2. Fallback / legacy active subscriptions check
  const subscriptions = await getActiveSubscriptions();
  const unmonitoredSubs = subscriptions.filter(
    (sub) => !allResults.some((r) => r.domain.toLowerCase() === sub.domain.toLowerCase())
  );

  if (unmonitoredSubs.length > 0) {
    const subPromises = unmonitoredSubs.map(async (sub) => {
      try {
        const report = await executeDomainAudit(sub.domain);
        const criticalIssues = report.issues.filter((i) => i.severity === 'CRITICAL');
        const isDegraded = report.score < 70 || criticalIssues.length > 0;
        let emailResult: { success: boolean; messageId?: string } | null = null;

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
        }

        return {
          domain: sub.domain,
          email: sub.email,
          score: report.score,
          status: report.status,
          alertTriggered: isDegraded,
          emailSent: emailResult ? emailResult.success : false,
        };
      } catch (err) {
        return {
          domain: sub.domain,
          email: sub.email,
          score: 0,
          status: 'CRITICAL',
          alertTriggered: true,
          emailSent: false,
          error: err instanceof Error ? err.message : 'Error de red',
        };
      }
    });

    const settledSubs = await Promise.allSettled(subPromises);
    settledSubs.forEach((res) => {
      if (res.status === 'fulfilled') {
        allResults.push(res.value);
      }
    });
  }

  const alertsTriggered = allResults.filter((r) => r.alertTriggered).length;

  return NextResponse.json(
    {
      checked: allResults.length,
      alertsTriggered,
      timestamp: new Date().toISOString(),
      results: allResults,
    },
    { status: 200 }
  );
}
