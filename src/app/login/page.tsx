'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isVerifiedQuery = searchParams.get('verified') === 'true';
  const isConfirmedQuery = searchParams.get('confirmed') === 'true';
  const isMfaQuery = searchParams.get('mfa') === 'required';
  const callbackError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [totpFactorId, setTotpFactorId] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [showHelperBanner, setShowHelperBanner] = useState(isConfirmedQuery);

  // Manejar errores de callback
  useEffect(() => {
    if (callbackError) {
      setError(
        'El enlace de verificación expiró o ya fue utilizado. Si hiciste clic previamente, tu cuenta ya fue validada. Por favor intenta iniciar sesión.'
      );
    }
  }, [callbackError]);

  // Si viene con ?mfa=required y no hay error explícito, alertar al usuario
  useEffect(() => {
    if (isMfaQuery && !error) {
      setError('Debes verificar tu código de autenticación en dos pasos (2FA) para acceder.');
    }
  }, [isMfaQuery, error]);

  // Blindaje al recargar la página (F5): Verificar si hay sesión en AAL1 con reto AAL2 pendiente
  useEffect(() => {
    let isMounted = true;

    async function checkExistingMfaSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) setCheckingSession(false);
          return;
        }

        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const currentLevel = aalData?.currentLevel;
        const nextLevel = aalData?.nextLevel;

        // Si la sesión está en AAL1 pero requiere elevación a AAL2
        if (nextLevel === 'aal2' && currentLevel !== 'aal2') {
          const factorsResponse = await supabase.auth.mfa.listFactors();
          const verifiedFactor = factorsResponse.data?.totp?.find((f) => f.status === 'verified');

          if (verifiedFactor && isMounted) {
            setTotpFactorId(verifiedFactor.id);
            setMfaRequired(true);
          }
        } else if (currentLevel === 'aal2' || (nextLevel === 'aal1' && currentLevel === 'aal1')) {
          // Ya completó AAL2 o no requiere MFA: Redirigir fuera de /login
          router.push('/');
          router.refresh();
          return;
        }
      } catch (err) {
        console.error('Error verificando estado de sesión MFA:', err);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    checkExistingMfaSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Paso 1: Autenticación inicial con usuario y contraseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        throw signInError;
      }

      // 1. Obtener nivel de aseguramiento MFA y factores registrados
      const { data: mfaData, error: mfaError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (mfaError) {
        throw mfaError;
      }

      const factorsResponse = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factorsResponse.data?.totp?.find((f) => f.status === 'verified');

      // 2. Si el usuario aún no tiene un factor 2FA configurado, redirigir obligatoriamente a /setup-2fa
      if (!verifiedFactor) {
        router.push('/setup-2fa');
        router.refresh();
        return;
      }

      // 3. Si tiene factor verificado y su nivel actual requiere elevación a AAL2 (Bloqueo estricto)
      if (mfaData.nextLevel === 'aal2' || mfaData.currentLevel !== 'aal2') {
        setTotpFactorId(verifiedFactor.id);
        setMfaRequired(true);
        return;
      }

      // 4. Si ya está verificado en AAL2
      if (data.user && mfaData.currentLevel === 'aal2') {
        router.push('/');
        router.refresh();
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message === 'Invalid login credentials'
            ? 'Credenciales inválidas. Verifica tu correo y contraseña.'
            : err.message === 'Email not confirmed'
            ? 'Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada o spam.'
            : err.message
          : 'Error inesperado al iniciar sesión.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Desafío de código TOTP (AAL2)
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpFactorId) return;

    const cleanCode = totpCode.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('El código de verificación debe tener exactamente 6 dígitos numéricos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpFactorId,
        code: cleanCode,
      });

      if (verifyError) {
        throw verifyError;
      }

      // Validar que se alcanzó efectivamente AAL2 antes de redirigir
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel !== 'aal2') {
        throw new Error('No se pudo validar el segundo factor. Por favor intenta de nuevo.');
      }

      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.includes('Invalid') || err.message.includes('code')
            ? 'Código de verificación incorrecto o expirado. Revisa tu aplicación Authenticator.'
            : err.message
          : 'Error al verificar el segundo factor.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar reto MFA y cerrar sesión completamente (evita sesión huérfana en AAL1)
  const handleCancelAndSignOut = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      setMfaRequired(false);
      setTotpFactorId(null);
      setTotpCode('');
      setEmail('');
      setPassword('');
      setError(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  // Spinner mientras se evalúa si hay una sesión activa o reto 2FA pendiente
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 py-12 antialiased">
        <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-mono">Verificando sesión segura...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 py-12 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        {mfaRequired ? (
          /* Paso 2: Desafío Obligatorio 2FA (AAL2) */
          <div className="flex flex-col gap-5">
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Verificación en Dos Pasos (2FA)</h2>
              <p className="text-neutral-400 text-xs mt-1 max-w-xs">
                Ingresa el código temporal de 6 dígitos generado por tu aplicación Authenticator (Google Authenticator, Authy, etc.).
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-lg text-xs text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1 text-center font-mono">
                  Código de Autenticación TOTP
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95"
              >
                {loading ? 'Verificando código...' : 'Verificar y Acceder'}
              </button>
            </form>

            <div className="p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-center text-xs text-neutral-400 leading-relaxed">
              ¿Perdiste acceso a tu app autenticadora? El 2FA es obligatorio. Escribe a{' '}
              <a href="mailto:admin@miportal.me" className="text-emerald-400 underline hover:text-emerald-300">
                admin@miportal.me
              </a>{' '}
              para solicitar la revocación administrativa de tu factor.
            </div>

            {/* Botón de Cancelar y Cerrar Sesión (Cierra la sesión AAL1 de inmediato) */}
            <button
              type="button"
              onClick={handleCancelAndSignOut}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancelar y cerrar sesión</span>
            </button>
          </div>
        ) : (
          /* Paso 1: Correo y Contraseña */
          <>
            <h2 className="text-2xl font-bold text-center tracking-tight mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-neutral-400 text-sm text-center mb-5">
              Ingresa a tu panel de DeliverabilityGuard
            </p>

            {/* Alerta de Correo Verificado si viene ?verified=true */}
            {isVerifiedQuery && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  ✓
                </div>
                <span>Correo electrónico verificado correctamente. Ya puedes iniciar sesión.</span>
              </div>
            )}

            {/* Banner Informativo Anti-Confusión: Solo si ?confirmed=true */}
            {isConfirmedQuery && showHelperBanner && (
              <div className="mb-4 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start justify-between gap-3 shadow-inner">
                <div className="flex items-start gap-2.5">
                  <span className="text-base select-none mt-0.5">💡</span>
                  <p className="leading-relaxed text-slate-300">
                    ¿Confirmaste tu correo y viste un error en el navegador? Tu cuenta ya está validada. Ingresa tu correo y contraseña aquí para continuar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHelperBanner(false)}
                  className="text-slate-500 hover:text-slate-300 text-sm font-semibold transition px-1"
                  title="Ocultar aviso"
                >
                  ✕
                </button>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@dominio.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {loading ? 'Iniciando sesión...' : 'Acceder'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-blue-400 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
