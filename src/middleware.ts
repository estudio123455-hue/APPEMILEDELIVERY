import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

// Almacén en memoria para Rate Limiting preventivo por IP
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(
  ip: string,
  routeKey: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const key = `${ip}:${routeKey}`;

  if (rateLimitMap.size > 5000) {
    cleanupExpired();
  }

  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: Math.ceil((now + windowMs) / 1000) };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, reset: Math.ceil(existing.resetAt / 1000) };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, reset: Math.ceil(existing.resetAt / 1000) };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate Limiting Preventivo para /api/ y /tools/ask-the-public
  const isApiRoute = pathname.startsWith('/api/');
  const isAskThePublic =
    pathname.startsWith('/tools/ask-the-public') || pathname.startsWith('/market-analyzer');

  if (isApiRoute || isAskThePublic) {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 60 solicitudes por minuto para endpoints API, 30 consultas por minuto para el analizador
    const limit = isApiRoute ? 60 : 30;
    const windowMs = 60 * 1000;
    const routeCategory = isApiRoute ? 'api' : 'ask-the-public';

    const { allowed, remaining, reset } = checkRateLimit(ip, routeCategory, limit, windowMs);

    if (!allowed) {
      if (isApiRoute) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too Many Requests',
            message:
              'Has excedido el límite preventivo de solicitudes. Por favor espera 60 segundos antes de intentar nuevamente.',
            status: 429,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '60',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      } else {
        return new NextResponse(
          `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>429 Límite Excedido - MiPortal Suite</title></head><body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#07090E;color:#f8fafc;display:flex;align-items:center;justify-content:center;height:100vh;padding:1rem;"><div style="background:#0F172A;border:1px solid #1E293B;padding:2.5rem;border-radius:1.5rem;max-width:440px;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);"><div style="display:inline-flex;padding:0.75rem;border-radius:1rem;background:rgba(239,68,68,0.15);color:#EF4444;font-size:1.75rem;margin-bottom:1rem;">⚡</div><h1 style="font-size:1.25rem;font-weight:800;margin:0 0 0.5rem 0;">Límite Preventivo de Consultas Excedido</h1><p style="font-size:0.875rem;color:#94A3B8;line-height:1.5;margin:0 0 1.5rem 0;">Has alcanzado el límite de análisis por minuto. Para proteger la estabilidad del servicio, por favor espera 60 segundos antes de realizar una nueva búsqueda.</p><a href="/" style="display:inline-block;padding:0.625rem 1.25rem;border-radius:0.75rem;background:#10B981;color:#022C22;font-size:0.8125rem;font-weight:700;text-decoration:none;">Volver a MiPortal Suite</a></div></body></html>`,
          {
            status: 429,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Retry-After': '60',
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': reset.toString(),
            },
          }
        );
      }
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets (.svg, .png, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
