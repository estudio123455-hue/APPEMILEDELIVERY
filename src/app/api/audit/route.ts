import { NextRequest, NextResponse } from 'next/server';
import { executeDomainAudit } from '@/lib/dns';
import { AuditRequestSchema } from '@/lib/schemas/audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'dns-audit-engine',
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'INVALID_DOMAIN',
          details: {
            formErrors: ['El cuerpo de la petición debe ser un JSON válido.'],
            fieldErrors: {},
          },
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

    const report = await executeDomainAudit(validation.data.domain);

    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('[API /api/audit] Error processing domain audit:', error);
    return NextResponse.json(
      {
        error: 'AUDIT_FAILED',
        message: 'Ocurrió un error al procesar el dominio.',
      },
      { status: 500 }
    );
  }
}
