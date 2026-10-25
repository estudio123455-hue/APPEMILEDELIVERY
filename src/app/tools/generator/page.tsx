import type { Metadata } from 'next';
import Link from 'next/link';
import DnsGeneratorWizard from '@/components/tools/DnsGeneratorWizard';
import Navbar from '@/components/navigation/Navbar';

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
      <Navbar />

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
