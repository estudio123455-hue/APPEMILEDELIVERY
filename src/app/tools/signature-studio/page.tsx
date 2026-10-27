import type { Metadata } from 'next';
import SignatureStudioClient from './SignatureStudioClient';

export const metadata: Metadata = {
  title: 'Generador y Estudio de Firmas Corporativas de Correo | DeliverabilityGuard',
  description:
    'Crea firmas de email profesionales para Gmail, Outlook y Apple Mail con sello de seguridad RFC, enlaces sociales y diseño responsivo.',
  keywords: [
    'generador de firmas de correo',
    'email signature generator',
    'firma gmail corporativa',
    'firma outlook profesional',
    'firma html correo',
    'sello de seguridad deliverabilityguard',
  ],
  openGraph: {
    title: 'Estudio de Firmas Corporativas | DeliverabilityGuard',
    description:
      'Diseña y copia firmas HTML profesionales compatibles con todos los clientes de correo electrónico.',
    url: 'https://deliverabilityguard.miportal.me/tools/signature-studio',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function SignatureStudioPage() {
  return <SignatureStudioClient />;
}
