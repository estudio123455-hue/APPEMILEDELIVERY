import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://deliverabilityguard.miportal.me'),
  title: 'MiPortal Suite — Inteligencia de Mercado, Bio Sites y Seguridad Digital',
  description:
    'Investiga tu mercado y competencia con IA, crea tu presencia comercial con Bio Sites en minutos y protege la reputación de tu dominio para que tus correos nunca caigan a spam.',
  keywords: [
    'MiPortal Suite',
    'inteligencia de mercado',
    'bio sites',
    'entregabilidad de correo',
    'auditoría DNS',
    'escucha de mercado',
    'configurar DMARC',
    'registro SPF',
    'Squarespace Bio Sites',
  ],
  authors: [{ name: 'MiPortal Team', url: 'https://deliverabilityguard.miportal.me' }],
  creator: 'MiPortal',
  publisher: 'MiPortal',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MiPortal Suite — Inteligencia de Mercado, Bio Sites y Seguridad Digital',
    description:
      'Investiga tu mercado y competencia con IA, crea tu presencia comercial con Bio Sites en minutos y protege la reputación de tu dominio para que tus correos nunca caigan a spam.',
    url: 'https://deliverabilityguard.miportal.me',
    siteName: 'MiPortal Suite',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MiPortal Suite — Inteligencia de Mercado, Bio Sites y Seguridad Digital',
    description:
      'Investiga tu mercado y competencia con IA, crea tu presencia comercial con Bio Sites en minutos y protege la reputación de tu dominio para que tus correos nunca caigan a spam.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MiPortal Suite',
  url: 'https://deliverabilityguard.miportal.me',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'All',
  description:
    'Ecosistema integral para creadores y empresas: Inteligencia de mercado con IA, generador de Bio Sites y ciberseguridad DNS.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Inteligencia de Mercado y Escucha Social con IA',
    'Constructor de Bio Sites con temas editoriales en tiempo real',
    'Auditoría DNS autoritativa en tiempo real (SPF, DKIM, DMARC, BIMI)',
    'Simulador de ubicación de bandeja y protección antifraude',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
