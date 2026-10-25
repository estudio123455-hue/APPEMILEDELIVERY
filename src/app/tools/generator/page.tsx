import type { Metadata } from 'next';
import Link from 'next/link';
import DnsGeneratorWizard from '@/components/tools/DnsGeneratorWizard';

export const metadata: Metadata = {
  title: 'Generador de Registros SPF y DMARC | DeliverabilityGuard',
  description:
    'Crea registros SPF y DMARC correctos en segundos para Google Workspace, Microsoft 365, Resend, SendGrid y más. Asistente interactivo sin errores de sintaxis.',
  keywords: [
    'generador SPF',
    'generador DMARC',
    'crear registro SPF',
    'crear registro DMARC',
    'Google Workspace SPF',
    'Microsoft 365 SPF',
    'Resend SPF',
    'SendGrid DMARC',
    'evitar spam',
    'seguridad DNS',
  ],
  alternates: {
    canonical: 'https://deliverabilityguard.miportal.me/tools/generator',
  },
  openGraph: {
    title: 'Generador Guiado de Registros SPF y DMARC | DeliverabilityGuard',
    description:
      'Configura y personaliza tus registros TXT de SPF y DMARC con asistencia en vivo y validación RFC.',
    url: 'https://deliverabilityguard.miportal.me/tools/generator',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Generador Guiado de Registros SPF y DMARC | DeliverabilityGuard',
    description:
      'Genera registros SPF y DMARC en 1 clic para tus proveedores de correo. Libre de errores de sintaxis.',
  },
};

export default function DnsGeneratorPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Generador de Registros SPF y DMARC - DeliverabilityGuard',
    url: 'https://deliverabilityguard.miportal.me/tools/generator',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'All',
    description:
      'Asistente interactivo para generar registros TXT DNS de SPF y DMARC según estándares RFC para Google Workspace, Microsoft 365 y pasarelas de email.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Generador interactivo de registros SPF v=spf1',
      'Configuración de DMARC con políticas p=none, quarantine y reject',
      'Cálculo y alerta de límite de 10 lookups DNS RFC 7208',
      'Instrucciones paso a paso para Cloudflare, GoDaddy, Namecheap y Squarespace',
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Schema.org JSON-LD para SEO y Google Gemini */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar Superior */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-4 h-4 text-slate-950 font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-50">
              DeliverabilityGuard
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Auditar Dominio</span>
            </Link>

            <Link
              href="/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
        {/* Breadcrumb y Encabezado */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-slate-300">Herramientas</span>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Generador SPF & DMARC</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-50 flex items-center gap-3">
                Generador Guiado de Registros DNS
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-1.5 leading-relaxed">
                Construye registros SPF y DMARC perfectamente estructurados para proteger la
                reputación de tu dominio y asegurar que tus correos lleguen a la bandeja de entrada.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                100% Gratuito & Sin Límites
              </span>
            </div>
          </div>
        </div>

        {/* Componente del Asistente */}
        <DnsGeneratorWizard />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DeliverabilityGuard. Seguridad y Entregabilidad de Correo Electrónico.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition">
              Auditoría DNS
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition">
              Dashboard de Monitoreo
            </Link>
            <Link href="/tools/generator" className="hover:text-emerald-400 transition">
              Generador DNS
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
