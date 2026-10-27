import { NextRequest, NextResponse } from 'next/server';
import { sendCommercialQuoteEmail } from '@/lib/email/resend';
import { BOLD_SERVICES } from '@/config/payments';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientEmail, clientName, quoteTitle, amountCOP, paymentUrl } = body;

    if (!clientEmail || typeof clientEmail !== 'string' || !clientEmail.includes('@')) {
      return NextResponse.json(
        { error: 'INVALID_CLIENT_EMAIL', message: 'Se requiere un correo de cliente válido.' },
        { status: 400 }
      );
    }

    if (!quoteTitle || typeof quoteTitle !== 'string') {
      return NextResponse.json(
        { error: 'INVALID_QUOTE_TITLE', message: 'El título de la cotización es requerido.' },
        { status: 400 }
      );
    }

    const numericAmount = Number(amountCOP);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'INVALID_AMOUNT', message: 'El monto en COP debe ser un número válido mayor a 0.' },
        { status: 400 }
      );
    }

    const resolvedPaymentUrl =
      typeof paymentUrl === 'string' && paymentUrl.trim().length > 0
        ? paymentUrl.trim()
        : BOLD_SERVICES.dnsBlindaje.checkoutUrl;

    const result = await sendCommercialQuoteEmail({
      to: clientEmail.trim().toLowerCase(),
      clientName: (clientName || 'Cliente').trim(),
      quoteTitle: quoteTitle.trim(),
      amountCOP: numericAmount,
      paymentUrl: resolvedPaymentUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Error al enviar la cotización con Resend.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[API SEND-QUOTE ERROR]:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: err?.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
