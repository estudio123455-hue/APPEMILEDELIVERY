import type { Metadata } from 'next';
import SpamTesterClient from './SpamTesterClient';

export const metadata: Metadata = {
  title: 'Probador de Asuntos, Detección de Spam y Previsualizador de Correo | DeliverabilityGuard',
  description:
    'Analiza la entregabilidad de tus asuntos y cuerpos de email en tiempo real. Detecta palabras gatillo de spam, calcula el Spam Risk Score y previsualiza en Gmail y Outlook.',
  keywords: [
    'probador de spam email',
    'analizador de asuntos de correo',
    'evitar carpeta de spam',
    'palabras gatillo spam',
    'preview gmail outlook',
    'spam score tester',
    'entregabilidad de correos',
  ],
  openGraph: {
    title: 'Probador de Asuntos y Detección de Spam | DeliverabilityGuard',
    description:
      'Calcula el Spam Risk Score de tus correos en vivo y previsualiza cómo se leen en Gmail y Outlook móvil y escritorio.',
    url: 'https://deliverabilityguard.miportal.me/tools/spam-tester',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function SpamTesterPage() {
  return <SpamTesterClient />;
}
