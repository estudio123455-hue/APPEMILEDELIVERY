'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function Setup2FAPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const initMfaSetup = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Validar sesión activa
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || null);

      // 2. Si el usuario ya cuenta con un factor TOTP verificado (AAL2), redirigir directamente al panel
      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();

      if (factorsError) {
        throw factorsError;
      }

      const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
      if (verifiedFactor) {
        router.push('/');
        router.refresh();
        return;
      }

      // 3. Limpiar cualquier factor no verificado previo para evitar errores de límite en Supabase
      const unverifiedFactors = factors?.all?.filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified'
      );

      if (unverifiedFactors && unverifiedFactors.length > 0) {
        for (const uf of unverifiedFactors) {
          await supabase.auth.mfa.unenroll({ factorId: uf.id });
        }
      }

      // 4. Iniciar enrolamiento nuevo para generar QR y secreto
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'DeliverabilityGuard',
      });

      if (enrollError) {
        throw enrollError;
      }

      setFactorId(enrollData.id);
      setQrCode(enrollData.totp.qr_code);
      setSecret(enrollData.totp.secret);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error al generar la configuración obligatoria de 2FA.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    initMfaSetup();
  }, [initMfaSetup]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    const cleanCode = verifyCode.trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      setError('El código de verificación debe contener exactamente 6 dígitos numéricos.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // 1. Crear el desafío para el factor TOTP
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // 2. Resolver el desafío con el código de 6 dígitos
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: cleanCode,
      });

      if (verify.error) throw verify.error;

      setSuccess(true);

      // Redirigir al panel principal una vez guardada la sesión verificada
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message.includes('Invalid') || err.message.includes('code')
            ? 'Código de verificación incorrecto o expirado. Revisa tu aplicación Authenticator e inténtalo de nuevo.'
            : err.message
          : 'Error al verificar el código TOTP.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-12 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col gap-6">
        {/* Header Badge */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-1 shadow-lg shadow-emerald-500/10">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Requisito Obligatorio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight mt-1">
            Configuración Obligatoria 2FA
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
            Por política de seguridad de DeliverabilityGuard, el uso de Google Authenticator o Microsoft Authenticator es 100% obligatorio para acceder a tu panel.
          </p>
          {userEmail && (
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Configurando para: <span className="text-slate-300 font-semibold">{userEmail}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-100">¡2FA Verificado y Activado!</h3>
            <p className="text-xs text-slate-400">
              Redirigiéndote automáticamente a tu panel principal...
            </p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span>Generando clave criptográfica de seguridad...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Paso 1: Escaneo del Código QR */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Escanea este código QR con tu Authenticator</span>
              </div>

              {qrCode && (
                <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCode}
                    alt="Código QR de Enrolamiento 2FA Obligatorio"
                    className="w-48 h-48 select-none"
                  />
                </div>
              )}

              {secret && (
                <div className="flex flex-col items-center gap-1.5 w-full mt-1">
                  <span className="text-[11px] text-slate-400">
                    O introduce esta clave secreta manualmente:
                  </span>
                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl max-w-full">
                    <code className="text-xs font-mono text-emerald-400 tracking-wider break-all font-bold">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={copySecret}
                      className="text-[11px] font-semibold text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 transition"
                    >
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Paso 2: Validación con código de 6 dígitos */}
            <form onSubmit={handleVerify} className="flex flex-col gap-4 pt-4 border-t border-slate-800">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Ingresa el código de 6 dígitos generado</span>
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || verifyCode.length !== 6}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Verificando...' : 'Verificar y Activar Cuenta'}
              </button>
            </form>

            {/* Support Message Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
              ¿Problemas con tu dispositivo o perdiste acceso? Contacta al administrador en{' '}
              <a href="mailto:admin@miportal.me" className="text-emerald-400 underline hover:text-emerald-300">
                admin@miportal.me
              </a>{' '}
              para restablecimiento de seguridad.
            </div>

            {/* Sign Out */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs text-slate-500 hover:text-slate-300 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
