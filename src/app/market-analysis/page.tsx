import type { Metadata } from 'next';
import MarketAnalysisClient from './MarketAnalysisClient';

export const metadata: Metadata = {
  title: 'Análisis de Mercado & Escucha Social Estratégica | MiPortal',
  description:
    'Centro de inteligencia competitiva, mapeo de preguntas AlsoAsked, análisis de sentimiento y generador de consultas booleanas para Google Alerts y redes sociales.',
  metadataBase: new URL('https://deliverabilityguard.miportal.me'),
  openGraph: {
    title: 'Análisis de Mercado y Escucha Social Estratégica',
    description:
      'Comprende las preguntas reales de tus clientes, rastrea tendencias con Google Alerts y clasifica tus palabras clave en 5 dimensiones estratégicas.',
    url: 'https://deliverabilityguard.miportal.me/market-analysis',
  },
};

export default function MarketAnalysisPage() {
  return <MarketAnalysisClient />;
}
