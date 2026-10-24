import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeliverabilityGuard | Auditoría DNS & Entregabilidad B2B',
  description:
    'Audita SPF, DMARC, DKIM, MX y BIMI sin intermediarios. Protege tus cotizaciones y correos corporativos de caer en la bandeja de spam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
