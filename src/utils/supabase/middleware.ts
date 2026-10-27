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

  // 1. Rutas estrictamente privadas del panel de usuario que requieren autenticación y 2FA/AAL2
  const isStrictlyPrivateRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/account');

  // Ruta de configuración de segundo factor
  const isSetup2faRoute = pathname.startsWith('/setup-2fa');

  // 2. Si la ruta NO es privada ni de setup-2fa, es 100% PÚBLICA:
  //    - / (Home)
  //    - /business (Generador de presupuestos y facturación sin login obligatorio)
  //    - /sites/* (Constructor de Bio Sites)
  //    - /p/* (Perfiles públicos y demos)
  //    - /tools/* (/tools/ask-the-public, /tools/generator, /tools/mind-canvas)
  //    - /guide
  //    - /login, /register, /auth/*
  // NUNCA bloquear ni exigir 2FA/login en rutas públicas.
  if (!isStrictlyPrivateRoute && !isSetup2faRoute) {
    return supabaseResponse;
  }

  // 3. Para rutas privadas o /setup-2fa, obtener el usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay sesión y trata de acceder a rutas privadas -> Redirigir a /login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // 4. Para usuarios en rutas privadas, validar estricto AAL2 (Prevención de Bypass MFA)
  const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const currentLevel = aalData?.currentLevel;
  const nextLevel = aalData?.nextLevel;
  const isMfaPending = nextLevel === 'aal2' && currentLevel !== 'aal2';

  // Si tiene TOTP configurado pero la sesión solo está en AAL1 -> Forzar /login?mfa=required
  if (isMfaPending) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('mfa', 'required');
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Preservar cookies de sesión en la redirección
    request.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });

    return redirectResponse;
  }

  // 5. Si está en ruta privada pero no tiene 2FA configurado -> Redirigir a /setup-2fa
  if (isStrictlyPrivateRoute) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedTotp = factors?.totp?.some((f) => f.status === 'verified');

    if (!hasVerifiedTotp) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/setup-2fa';
      const redirectResponse = NextResponse.redirect(redirectUrl);

      request.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value);
      });

      return redirectResponse;
    }
  }

  return supabaseResponse;
}
