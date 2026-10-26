import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import MarketAnalyzerClient from './MarketAnalyzerClient';

export const metadata: Metadata = {
  title: 'Analizador Universal de Mercado & Escucha Social | MiPortal',
  description:
    'Pega la URL de tu web, canal de YouTube o competidor para extraer al instante su ecosistema digital, preguntas frecuentes AnswerThePublic, tendencias en Google Trends y filtros de captación de clientes.',
  keywords: [
    'análisis de mercado',
    'escucha social',
    'social listening',
    'AnswerThePublic',
    'Google Trends',
    'análisis de competidores',
    'estrategia SEO',
    'matriz de palabras clave',
    'monitoreo de marca',
    'MiPortal',
  ],
  alternates: {
    canonical: 'https://deliverabilityguard.miportal.me/market-analyzer',
  },
  openGraph: {
    title: 'Analizador Universal de Mercado & Escucha Social | MiPortal',
    description:
      'Extrae con un solo enlace la presencia digital, preguntas frecuentes, tendencias y oportunidades comerciales de cualquier marca o competidor.',
    url: 'https://deliverabilityguard.miportal.me/market-analyzer',
    siteName: 'MiPortal',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Analizador Universal de Mercado & Escucha Social | MiPortal',
    description:
      'Escanea cualquier URL para obtener preguntas AnswerThePublic, tendencias y filtros de captación de leads en redes.',
  },
};

export default function MarketAnalyzerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />

      <main className="pb-16">
        <MarketAnalyzerClient />
      </main>

      {/* Footer Global MiPortal */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MiPortal Suite. Inteligencia de Negocio y Entregabilidad de Correo.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/" className="hover:text-emerald-400 transition">
              Auditoría DNS
            </Link>
            <Link href="/market-analyzer" className="text-emerald-400 font-semibold transition">
              Analizador de Mercado
            </Link>
            <Link href="/tools/generator" className="hover:text-emerald-400 transition">
              Generador RFC
            </Link>
            <Link href="/guide" className="hover:text-emerald-400 transition">
              Guía RFC
            </Link>
            <Link href="/sites/builder" className="hover:text-emerald-400 transition">
              Sitios Bio
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
