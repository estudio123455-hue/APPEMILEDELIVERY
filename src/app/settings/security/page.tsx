'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import EnrollMFA from '@/components/mfa/EnrollMFA';
import type { Factor } from '@supabase/supabase-js';

export default function SecuritySettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [unenrollLoading, setUnenrollLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const fetchSecurityState = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || null);

      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      setFactors(data.all || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar factores de seguridad.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSecurityState();
  }, [fetchSecurityState]);

  const verifiedTotpFactor = factors.find(
    (f) => f.factor_type === 'totp' && f.status === 'verified'
  );

  const handleUnenroll = async (factorId: string) => {
    const confirm = window.confirm(
      '¿Estás seguro de que deseas desactivar la autenticación en dos factores (2FA)? Tu cuenta quedará protegida únicamente con tu contraseña.'
    );
    if (!confirm) return;

    setUnenrollLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;

      setIsEnrolling(false);
      await fetchSecurityState();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al desvincular el factor 2FA.';
      setErrorMsg(msg);
    } finally {
      setUnenrollLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-4 h-4 text-slate-950 font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-50">
              DeliverabilityGuard
            </span>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
          >
            ← Volver al Panel
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 flex flex-col gap-8">
        <div>
          <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            Ajustes de Cuenta
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight mt-1">
            Seguridad & Autenticación Multifactor (2FA)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Administra los métodos de verificación en dos pasos y protege el acceso a tus auditorías DNS.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-slate-400 text-sm">
            Cargando configuración de seguridad...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Account Info Card */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Usuario autenticado:</span>
                <span className="text-sm font-bold font-mono text-slate-200">{userEmail}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Sesión Activa
              </span>
            </div>

            {/* 2FA Status Card */}
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      verifiedTotpFactor
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
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
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100">
                        Aplicación Autenticadora (TOTP)
                      </h3>
                      {verifiedTotpFactor ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ACTIVO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          DESACTIVADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-lg">
                      {verifiedTotpFactor
                        ? 'Tu cuenta requiere un código de 6 dígitos desde tu aplicación autenticadora en cada inicio de sesión.'
                        : 'Protege tu cuenta contra robo de contraseñas requiriendo un código temporal desde Google Authenticator o Authy.'}
                    </p>
                  </div>
                </div>

                {verifiedTotpFactor && (
                  <button
                    type="button"
                    disabled={unenrollLoading}
                    onClick={() => handleUnenroll(verifiedTotpFactor.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition disabled:opacity-50 self-start sm:self-auto flex-shrink-0"
                  >
                    {unenrollLoading ? 'Desactivando...' : 'Desactivar 2FA'}
                  </button>
                )}
              </div>

              {/* Enrollment View */}
              {!verifiedTotpFactor && (
                <div className="pt-4 border-t border-slate-800">
                  {isEnrolling ? (
                    <EnrollMFA
                      onEnrolled={() => {
                        setIsEnrolling(false);
                        fetchSecurityState();
                      }}
                      onCancel={() => setIsEnrolling(false)}
                    />
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">
                        Aún no tienes configurado ningún factor de autenticación.
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEnrolling(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20"
                      >
                        Comenzar Activación
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
