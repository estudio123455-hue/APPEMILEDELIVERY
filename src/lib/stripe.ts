import Stripe from 'stripe';

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_deliverabilityguard_2026';

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_placeholder'))
) {
  throw new Error(
    'Falta la variable de entorno obligatoria: STRIPE_SECRET_KEY. Configúrala con tus credenciales de producción de Stripe.'
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-09-30.endive',
  typescript: true,
  appInfo: {
    name: 'DeliverabilityGuard B2B',
    version: '1.0.0',
    url: 'https://deliverabilityguard.io',
  },
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const NEXT_PUBLIC_APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
