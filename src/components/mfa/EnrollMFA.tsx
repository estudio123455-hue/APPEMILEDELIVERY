'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface EnrollMFAProps {
  onEnrolled?: () => void;
  onCancel?: () => void;
}

export default function EnrollMFA({ onEnrolled, onCancel }: EnrollMFAProps) {
  const supabase = createClient();

  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const startEnrollment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'DeliverabilityGuard',
      });

      if (enrollError) throw enrollError;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al iniciar la activación de 2FA.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    const cleanCode = verifyCode.trim().replace(/\s+/g, '');
    if (cleanCode.length !== 6) {
      setError('El código debe contener exactamente 6 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Crear el desafío para el factor TOTP
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // 2. Verificar el código con el desafío creado
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: cleanCode,
      });

      if (verify.error) throw verify.error;

      setSuccess(true);
      if (onEnrolled) {
        setTimeout(() => {
          onEnrolled();
        }, 1200);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message.includes('Invalid') || err.message.includes('code')
            ? 'Código de verificación incorrecto o expirado. Inténtalo de nuevo.'
            : err.message
          : 'Error al verificar el código TOTP.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (success) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-base font-bold text-slate-100">¡2FA Activado Correctamente!</h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Tu cuenta ahora está protegida con verificación en dos pasos mediante aplicación autenticadora.
        </p>
      </div>
    );
  }

  if (!qrCode) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <h4 className="text-sm sm:text-base font-bold text-slate-100">
            Autenticación en Dos Factores (TOTP)
          </h4>
          <p className="text-xs text-slate-400 max-w-md">
            Agrega una capa adicional de seguridad exigiendo un código temporal de 6 dígitos al iniciar sesión desde Google Authenticator, Authy o Microsoft Authenticator.
          </p>
          {error && <p className="text-xs text-rose-400 mt-2">{error}</p>}
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={startEnrollment}
          className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-lg shadow-emerald-500/20 disabled:opacity-60 flex-shrink-0"
        >
          {loading ? 'Generando...' : 'Activar 2FA'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Configurar Aplicación Autenticadora</h3>
          <p className="text-xs text-slate-400 mt-0.5">Escanea el código QR con tu aplicación 2FA</p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Cancelar
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* QR Code Container */}
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
          {/* Supabase TOTP qr_code is an SVG data URI */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCode}
            alt="Código QR de Enrolamiento 2FA"
            className="w-48 h-48 select-none"
          />
        </div>

        {/* Manual secret backup */}
        {secret && (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <span className="text-[11px] text-slate-400 font-medium">
              ¿No puedes escanear el código? Ingresa esta clave manualmente:
            </span>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg max-w-full">
              <code className="text-xs font-mono text-emerald-400 tracking-wider break-all">
                {secret}
              </code>
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 ml-1 px-1.5 py-0.5 rounded bg-slate-800"
              >
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verification Code Form */}
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">
            Ingresa el código de 6 dígitos generado por tu app:
          </label>
          <input
            type="text"
            required
            maxLength={6}
            pattern="[0-9]*"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full text-center tracking-[0.5em] font-mono text-2xl font-bold bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || verifyCode.length !== 6}
          className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : 'Verificar y Activar 2FA'}
        </button>
      </form>
    </div>
  );
}
