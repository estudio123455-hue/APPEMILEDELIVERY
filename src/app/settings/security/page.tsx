'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { Factor } from '@supabase/supabase-js';

export default function SecuritySettingsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
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
            Políticas de autenticación obligatoria y protección de tus auditorías DNS.
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
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/20 text-emerald-400">
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
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      Autenticación en Dos Pasos: Activada (Requerida por la plataforma)
                    </h3>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      OBLIGATORIO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                    Tu cuenta está vinculada a una aplicación de autenticación TOTP (Google Authenticator / Microsoft Authenticator). Cada inicio de sesión requiere un código dinámico de 6 dígitos.
                  </p>
                </div>
              </div>

              {/* Informative Security Policy Box */}
              <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-300">Política de Seguridad Estricta</span>
                  <p className="text-slate-400">
                    Por motivos de seguridad y auditoría de entregabilidad, el 2FA es obligatorio y no puede ser desactivado por el usuario. Si perdiste acceso a tu app autenticadora o cambiaste de dispositivo, escribe a soporte:{' '}
                    <a
                      href="mailto:admin@miportal.me"
                      className="font-mono text-emerald-400 underline hover:text-emerald-300 transition"
                    >
                      admin@miportal.me
                    </a>
                  </p>
                </div>
              </div>

              {/* Si por alguna razón técnica el usuario no tiene factor verificado aún */}
              {!verifiedTotpFactor && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <span className="text-xs text-rose-300 font-semibold">
                    Tu cuenta requiere configurar de inmediato tu factor 2FA para seguir navegando.
                  </span>
                  <Link
                    href="/setup-2fa"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition"
                  >
                    Configurar Ahora
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
