import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://deliverabilityguard.miportal.me'),
  title: 'DeliverabilityGuard | Auditoría DNS y Protección de Entregabilidad de Correo',
  description:
    'Diagnostica y soluciona problemas de entregabilidad de correo. Asistente en 1 clic para configurar registros SPF, DKIM y DMARC y evitar que tus correos caigan en spam o sufran suplantación de identidad.',
  keywords: [
    'entregabilidad de correo',
    'evitar spam',
    'configurar DMARC',
    'registro SPF',
    'auditoría DNS',
    'seguridad de correo electrónico',
    'Google Workspace SPF',
    'Squarespace DNS',
  ],
  authors: [{ name: 'DeliverabilityGuard Team', url: 'https://deliverabilityguard.miportal.me' }],
  creator: 'DeliverabilityGuard',
  publisher: 'DeliverabilityGuard',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'DeliverabilityGuard | Auditoría DNS y Protección de Entregabilidad de Correo',
    description:
      'Diagnostica y soluciona problemas de entregabilidad de correo. Asistente en 1 clic para configurar registros SPF, DKIM y DMARC y evitar que tus correos caigan en spam o sufran suplantación de identidad.',
    url: 'https://deliverabilityguard.miportal.me',
    siteName: 'DeliverabilityGuard',
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeliverabilityGuard | Auditoría DNS y Protección de Entregabilidad de Correo',
    description:
      'Diagnostica y soluciona problemas de entregabilidad de correo. Asistente en 1 clic para configurar registros SPF, DKIM y DMARC y evitar que tus correos caigan en spam o sufran suplantación de identidad.',
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
  name: 'DeliverabilityGuard',
  url: 'https://deliverabilityguard.miportal.me',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'All',
  description:
    'Herramienta gratuita de auditoría de registros DNS y asistente de reparación para SPF, DKIM y DMARC.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Auditoría DNS en tiempo real sin caché',
    'Doctor de entregabilidad con traducción en lenguaje humano',
    'Asistente de reparación DNS en 1 clic',
    'Centro de monitoreo continuo de dominios',
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
