import type { Metadata } from 'next';
import EmailValidatorClient from './EmailValidatorClient';

export const metadata: Metadata = {
  title: 'Validador y Limpiador de Listas de Correo | DeliverabilityGuard',
  description:
    'Limpia tus listas de correo antes de enviar campañas. Verifica sintaxis RFC 5322, detecta dominios temporales/desechables y comprueba servidores MX para evitar rebotes.',
  keywords: [
    'validador de correos',
    'limpiador de listas de email',
    'email list hygiene',
    'bounce preventer',
    'detectar correos temporales',
    'verificar servidor MX',
    'reducir rebotes email',
  ],
  openGraph: {
    title: 'Validador y Limpiador de Listas de Correo | DeliverabilityGuard',
    description:
      'Comprueba sintaxis, existencia de registros MX y descarta correos desechables para blindar la entregabilidad de tus campañas.',
    url: 'https://deliverabilityguard.miportal.me/tools/email-validator',
    siteName: 'DeliverabilityGuard',
    locale: 'es_ES',
    type: 'website',
  },
};

export default function EmailValidatorPage() {
  return <EmailValidatorClient />;
}
