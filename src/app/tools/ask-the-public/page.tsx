import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import AskThePublicClient from './AskThePublicClient';

export const metadata: Metadata = {
  title: 'AnswerThePublic en Español: Escucha de Mercado & Preguntas del Público | DeliverabilityGuard',
  description:
    'Generador de preguntas y escucha de audiencia en tiempo real al estilo AnswerThePublic. Analiza palabras clave, enlaces web y canales de YouTube para descubrir dudas, intenciones de compra y objeciones.',
  keywords: [
    'AnswerThePublic en español',
    'preguntas del publico',
    'escucha de mercado',
    'investigación de palabras clave',
    'ideas de contenido',
    'estrategia SEO',
    'Google Suggest en tiempo real',
    'DeliverabilityGuard',
  ],
  alternates: {
    canonical: 'https://deliverabilityguard.miportal.me/tools/ask-the-public',
  },
  openGraph: {
    title: 'AnswerThePublic en Español: Escucha de Mercado & Preguntas en Vivo | DeliverabilityGuard',
    description:
      'Descubre qué busca la gente en Google sobre cualquier tema, marca o URL con la rueda de preguntas de AnswerThePublic.',
    url: 'https://deliverabilityguard.miportal.me/tools/ask-the-public',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AnswerThePublic en Español: Escucha de Mercado | DeliverabilityGuard',
    description:
      'Mapea en segundos todas las preguntas e intenciones de búsqueda de tu nicho con exportación en CSV.',
  },
};

export default function AskThePublicPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
      <Navbar />

      <main className="pb-16">
        <AskThePublicClient />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DeliverabilityGuard & MiPortal Suite. Ciberseguridad, Entregabilidad y Marketing de Búsqueda.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/" className="hover:text-emerald-400 transition">
              Auditoría DNS
            </Link>
            <Link href="/tools/ask-the-public" className="text-emerald-400 font-semibold transition">
              Escucha de Mercado
            </Link>
            <Link href="/tools/generator" className="hover:text-emerald-400 transition">
              Generador DNS
            </Link>
            <Link href="/guide" className="hover:text-emerald-400 transition">
              Guía RFC
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
