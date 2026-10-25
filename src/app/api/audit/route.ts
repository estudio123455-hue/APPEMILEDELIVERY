import { NextRequest, NextResponse } from 'next/server';
import { executeDomainAudit } from '@/lib/dns';
import { AuditRequestSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/simple-ratelimit';

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
  // Extract client IP safely (supports proxies / cloudflare / vercel)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';

  // Rate Limiting: Max 10 audits per minute per IP
  const { success, remaining } = checkRateLimit(clientIp, 10, 60000);

  if (!success) {
    return NextResponse.json(
      {
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes. Has superado el límite de 10 auditorías por minuto. Por favor, espera antes de reintentar.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: 'INVALID_PAYLOAD',
          message: 'El cuerpo de la petición debe ser un objeto JSON válido.',
        },
        { status: 400 }
      );
    }

    // Strict validation and SSRF sanitization
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

    const isForceRefresh = Boolean(validation.data.forceRefresh);
    const report = await executeDomainAudit(validation.data.domain, {
      forceRefresh: isForceRefresh,
    });

    const cacheHeader = isForceRefresh
      ? 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      : 'public, s-maxage=60, stale-while-revalidate=300';

    return NextResponse.json(report, {
      status: 200,
      headers: {
        'Cache-Control': cacheHeader,
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  } catch (error) {
    console.error('[API /api/audit] Error processing domain audit:', error);
    return NextResponse.json(
      {
        error: 'AUDIT_FAILED',
        message: 'Ocurrió un error inesperado al procesar la auditoría DNS del dominio.',
      },
      { status: 500 }
    );
  }
}
