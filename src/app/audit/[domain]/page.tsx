import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { executeDomainAudit } from '@/lib/dns';
import type { DomainAuditReport } from '@/lib/dns/types';
import PublicAuditClientPage from './PublicAuditClientPage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface PageProps {
  params: Promise<{ domain: string }>;
}

function cleanDomainParam(rawDomain: string): string {
  return decodeURIComponent(rawDomain)
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .split('#')[0]
    .replace(/^\.+|\.+$/g, '');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain: rawDomain } = await params;
  const domain = cleanDomainParam(rawDomain);

  let score = 0;
  let dmarcPolicy = 'ausente';
  let isSpfValid = false;

  try {
    const report = await executeDomainAudit(domain);
    score = report.score;
    dmarcPolicy = report.dmarc.policy || (report.dmarc.raw ? 'configurado' : 'ausente');
    isSpfValid = report.spf.isValid;
  } catch {
    // Mantener valores base si el dominio no resuelve
  }

  const title = `Auditoría DNS de ${domain} - Calificación ${score}/100 | DeliverabilityGuard`;
  const description = `Diagnóstico RFC de entregabilidad para ${domain}. Estado DMARC (${dmarcPolicy}), SPF (${isSpfValid ? 'válido' : 'fallido'}) y prevención de spam.`;
  const canonicalUrl = `https://deliverabilityguard.miportal.me/audit/${domain}`;

  return {
    title,
    description,
    metadataBase: new URL('https://deliverabilityguard.miportal.me'),
    alternates: {
      canonical: `/audit/${domain}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'DeliverabilityGuard & MiPortal Suite',
      locale: 'es_CO',
      type: 'article',
      images: [
        {
          url: 'https://deliverabilityguard.miportal.me/apple-icon',
          width: 1200,
          height: 630,
          alt: `Auditoría DNS de ${domain} - DeliverabilityGuard`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://deliverabilityguard.miportal.me/apple-icon'],
    },
  };
}

export default async function PublicAuditPage({ params }: PageProps) {
  const { domain: rawDomain } = await params;
  const domain = cleanDomainParam(rawDomain);

  if (!domain || !domain.includes('.')) {
    notFound();
  }

  let report: DomainAuditReport;

  try {
    report = await executeDomainAudit(domain);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido al auditar dominio.';
    // Si falla la auditoría, construimos un reporte base de error amigable
    report = {
      domain,
      timestamp: new Date().toISOString(),
      score: 0,
      status: 'CRITICAL',
      spf: {
        raw: null,
        isValid: false,
        qualifier: null,
        mechanisms: [],
        dnsLookupCount: 0,
        warnings: [],
        errors: [msg],
      },
      dmarc: {
        raw: null,
        isValid: false,
        policy: null,
        subdomainPolicy: null,
        percentage: null,
        rua: [],
        ruf: [],
        tags: {},
        warnings: [],
        errors: [msg],
      },
      dkim: {
        found: false,
        records: [],
        checkedSelectors: ['default', 'google'],
        warnings: [],
        errors: [msg],
      },
      mx: {
        records: [],
        isValid: false,
        warnings: [],
        errors: [msg],
      },
      bimi: {
        raw: null,
        isValid: false,
        logoUrl: null,
        authorityUrl: null,
        hasVmc: false,
        tags: {},
        warnings: [],
        errors: [],
      },
      blacklists: {
        ip: '',
        checked: 0,
        listed: 0,
        details: [],
      },
      tls: {
        mxHost: 'mail.' + domain,
        supported: false,
        certValid: false,
      },
      fingerprint: {
        emailProvider: 'Desconocido',
        dnsHost: 'Desconocido',
        transactionalServices: [],
        contextualTips: [],
      },
      summary: {
        criticalCount: 1,
        warningCount: 0,
        infoCount: 0,
      },
      issues: [
        {
          id: 'dns-resolution-error',
          category: 'GENERAL',
          severity: 'CRITICAL',
          title: 'Error de resolución DNS del dominio',
          description: `No fue posible resolver los registros DNS para el dominio "${domain}". Verifique que el dominio esté activo y correctamente registrado.`,
          recommendation: 'Compruebe en whois si el dominio tiene nameservers autoritativos delegados.',
        },
      ],
    };
  }

  return <PublicAuditClientPage initialReport={report} domain={domain} />;
}
