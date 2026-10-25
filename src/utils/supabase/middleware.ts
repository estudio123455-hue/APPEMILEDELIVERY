import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

const FALLBACK_URL = 'https://xlmxfatjupdvuqzzciuj.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbXhmYXRqdXBkdnVxenpjaXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Nzc3MTUsImV4cCI6MjEwODQ1MzcxNX0.1XDKcTWLUZtBPmr0zsPqalOxHZ9Pk8Qj7hFfG0b4xIA';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const pathname = request.nextUrl.pathname;

  // Rutas exentas de redirección obligatoria a setup-2fa
  const isAuthExemptPath =
    pathname.startsWith('/setup-2fa') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.');

  // 1. Revalidar usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Si el usuario está autenticado en una ruta protegida (como '/', '/dashboard', '/settings', etc.), verificar si tiene 2FA obligatorio activo
  if (user && !isAuthExemptPath) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factors?.totp?.some((f) => f.status === 'verified');

    if (!hasVerifiedTotp) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/setup-2fa';
      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Preservar cookies de sesión en la redirección
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });

      return redirectResponse;
    }
  }

  // 3. Proteger rutas estrictamente privadas si no hay usuario autenticado
  const isStrictlyPrivateRoute =
    pathname.startsWith('/settings') ||
    pathname.startsWith('/dashboard');

  if (!user && isStrictlyPrivateRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
