import { NextRequest, NextResponse } from 'next/server';
import { stripe, NEXT_PUBLIC_APP_URL } from '@/lib/stripe';
import { AuditRequestSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'INVALID_BODY',
          message: 'El cuerpo de la petición debe ser un JSON válido.',
        },
        { status: 400 }
      );
    }

    const validation = AuditRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'INVALID_DOMAIN',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const domain = validation.data.domain;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || NEXT_PUBLIC_APP_URL;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 1900, // $19.00 USD
            recurring: {
              interval: 'month',
            },
            product_data: {
              name: 'DeliverabilityGuard Pro - Monitoreo 24/7 y Alertas DNS',
              description: `Monitoreo continuo cada 60 min, alertas Spamhaus/Barracuda y generador de registros DNS para ${domain}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        domain,
      },
      subscription_data: {
        metadata: {
          domain,
        },
      },
      success_url: `${baseUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}&domain=${encodeURIComponent(
        domain
      )}`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        {
          error: 'CHECKOUT_SESSION_FAILED',
          message: 'No fue posible generar la URL de Stripe Checkout.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: unknown) {
    console.error('[Stripe Checkout Error]:', error);
    const message =
      error instanceof Error ? error.message : 'Error inesperado al crear la sesión de pago.';
    return NextResponse.json(
      {
        error: 'STRIPE_CHECKOUT_ERROR',
        message,
      },
      { status: 500 }
    );
  }
}
