import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe';
import {
  saveSubscription,
  deactivateSubscription,
} from '@/lib/db/subscriptions';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'MISSING_SIGNATURE', message: 'Falta el header stripe-signature.' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Error: STRIPE_WEBHOOK_SECRET no está configurada.');
    return NextResponse.json(
      { error: 'CONFIGURATION_ERROR', message: 'Webhook secret no configurado.' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al validar firma.';
    console.error(`[Stripe Webhook Signature Verification Failed]: ${message}`);
    return NextResponse.json(
      { error: 'INVALID_SIGNATURE', message: `Firma inválida: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const domain = session.metadata?.domain;
        const customerEmail = session.customer_details?.email || 'admin@' + (domain || 'example.com');
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || session.id;

        if (domain && subscriptionId) {
          await saveSubscription(domain, subscriptionId, customerEmail);
        }

        console.log('[Stripe Webhook: checkout.session.completed]', {
          domain,
          customerEmail,
          subscriptionId,
          status: 'ACTIVE_MONITORING_ENABLED',
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer;
        const subscriptionId = invoice.parent?.subscription_details?.subscription;
        const amountPaid = invoice.amount_paid / 100;

        console.log('[Stripe Webhook: invoice.payment_succeeded]', {
          customerId,
          subscriptionId,
          amountPaid: `$${amountPaid} USD`,
          status: 'RENEWAL_CONFIRMED',
          timestamp: new Date().toISOString(),
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const domain = subscription.metadata?.domain;
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;

        await deactivateSubscription(subscriptionId);

        console.log('[Stripe Webhook: customer.subscription.deleted]', {
          domain,
          customerId,
          subscriptionId,
          status: 'MONITORING_SUSPENDED',
          timestamp: new Date().toISOString(),
        });
        break;
      }

      default:
        console.log(`[Stripe Webhook Event Ignored]: ${event.type}`);
    }

    return NextResponse.json({ received: true, eventType: event.type }, { status: 200 });
  } catch (error: unknown) {
    console.error(`[Stripe Webhook Processing Error on ${event.type}]:`, error);
    return NextResponse.json(
      { error: 'WEBHOOK_HANDLER_FAILED', message: 'Fallo al procesar el evento del webhook.' },
      { status: 500 }
    );
  }
}
