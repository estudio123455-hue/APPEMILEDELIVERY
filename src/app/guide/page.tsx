import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import GuideContent from '@/components/guide/GuideContent';
import { BookOpen, Shield, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  metadataBase: new URL('https://deliverabilityguard.miportal.me'),
  title: 'Guía de Entregabilidad, Normativas RFC y Configuración DNS | DeliverabilityGuard',
  description:
    'Aprende cómo cumplir los estándares RFC 7208 (SPF), RFC 7489 (DMARC) y RFC 6376 (DKIM). Guías prácticas de configuración en Squarespace, Namecheap, Cloudflare y GoDaddy para evitar caer en spam.',
  keywords: [
    'RFC 7208',
    'RFC 7489',
    'RFC 6376',
    'guía DMARC',
    'configurar SPF',
    'límite 10 lookups SPF',
    'Squarespace DNS SPF',
    'Cloudflare DMARC',
    'Google Postmaster Tools',
    'evitar spam',
    'autenticación de correo',
  ],
  alternates: {
    canonical: 'https://deliverabilityguard.miportal.me/guide',
  },
  openGraph: {
    title: 'Guía de Entregabilidad, Normativas RFC y Configuración DNS | DeliverabilityGuard',
    description:
      'Aprende cómo cumplir los estándares RFC 7208 (SPF), RFC 7489 (DMARC) y RFC 6376 (DKIM). Guías prácticas para evitar caer en spam.',
    url: 'https://deliverabilityguard.miportal.me/guide',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guía de Entregabilidad, Normativas RFC y Configuración DNS | DeliverabilityGuard',
    description:
      'Aprende cómo configurar tus registros SPF, DKIM y DMARC según normativas IETF y requisitos 2024 de Google y Yahoo.',
  },
};

export default function GuidePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: 'Guía de Entregabilidad de Correo, Estándares RFC y Configuración DNS',
    description:
      'Tutorial exhaustivo y referencia técnica sobre cómo configurar registros SPF (RFC 7208), DMARC (RFC 7489) y DKIM (RFC 6376) en proveedores DNS para maximizar la entregabilidad a la bandeja de entrada.',
    url: 'https://deliverabilityguard.miportal.me/guide',
    author: {
      '@type': 'Organization',
      name: 'DeliverabilityGuard',
      url: 'https://deliverabilityguard.miportal.me',
    },
    publisher: {
      '@type': 'Organization',
      name: 'DeliverabilityGuard',
      url: 'https://deliverabilityguard.miportal.me',
    },
    inLanguage: 'es-ES',
    about: [
      { '@type': 'Thing', name: 'SPF RFC 7208' },
      { '@type': 'Thing', name: 'DMARC RFC 7489' },
      { '@type': 'Thing', name: 'DKIM RFC 6376' },
      { '@type': 'Thing', name: 'DNS Configuration' },
    ],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Schema.org JSON-LD para SEO y Motores de IA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navbar Superior Unificado */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10">
        {/* Breadcrumb y Encabezado Principal */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Link href="/" className="hover:text-emerald-400 transition">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-slate-300">Documentación</span>
            <span>/</span>
            <span className="text-emerald-400 font-semibold">Guía & RFCs</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Base de Conocimiento Técnico & Ciberseguridad</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-50">
                Guía de Entregabilidad & Estándares RFC
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed">
                Todo lo que necesitas saber para blindar tu dominio contra la suplantación, evitar el
                filtro de spam de Google y Yahoo, y configurar registros DNS sin errores de sintaxis.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link
                href="/tools/generator"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 hover:border-slate-700 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generador DNS en 1 Clic</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Contenido Completo de la Guía */}
        <GuideContent />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 mt-16 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DeliverabilityGuard. Documentación y Estándares de Entregabilidad.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition">
              Auditoría DNS
            </Link>
            <Link href="/tools/generator" className="hover:text-emerald-400 transition">
              Generador DNS
            </Link>
            <Link href="/guide" className="hover:text-emerald-400 transition">
              Guía & RFCs
            </Link>
            <Link href="/dashboard" className="hover:text-emerald-400 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
