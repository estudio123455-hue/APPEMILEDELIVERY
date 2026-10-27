import Stripe from 'stripe';

const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_deliverabilityguard_2026';

if (
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build' &&
  (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_placeholder'))
) {
  console.warn(
    '[STRIPE WARNING] STRIPE_SECRET_KEY no configurado o usando placeholder. Configúralo para procesar pagos en vivo.'
  );
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-09-30.endive' as any,
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
