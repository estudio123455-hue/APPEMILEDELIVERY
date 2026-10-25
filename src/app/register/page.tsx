'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const targetEmail = formData.email.trim().toLowerCase();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: targetEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup-2fa`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Si la sesión se genera inmediatamente (sin confirmación de correo requerida)
      if (data.session) {
        router.push('/setup-2fa');
        router.refresh();
        return;
      }

      // Ocultar el formulario y activar la tarjeta de confirmación y anti-pánico
      setRegisteredEmail(targetEmail);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Error desconocido al registrar la cuenta.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4 py-12 antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="w-full max-w-lg bg-[#121212] border border-neutral-800 rounded-2xl p-6 sm:p-9 shadow-2xl">
        {isSuccess ? (
          /* Tarjeta Destacada de Éxito e Instrucciones Claras Anti-Pánico */
          <div className="flex flex-col gap-6">
            {/* Cabecera con Icono Destacado */}
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
              </div>

              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Registro Completado
              </span>

              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                ¡Cuenta creada exitosamente! Revisa tu correo
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                Te hemos enviado un enlace de confirmación a tu bandeja de entrada{' '}
                {registeredEmail && (
                  <span className="font-semibold text-emerald-400 font-mono">
                    ({registeredEmail})
                  </span>
                )}
                .
              </p>
            </div>

            {/* Recuadro Destacado en Tonos Ámbar y Esmeralda: Nota Importante Anti-Pánico */}
            <div className="p-4 sm:p-5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3.5 shadow-inner">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-slate-200 leading-relaxed">
                <span className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                  Paso importante sobre el enlace
                </span>
                <p className="text-slate-300">
                  Al hacer clic en el correo, tu cuenta quedará validada de inmediato en nuestros servidores. Si tu navegador muestra una pantalla de error o fallo de redirección,{' '}
                  <strong className="text-white font-semibold">no te preocupes</strong>: tu cuenta ya está activa.
                </p>
              </div>
            </div>

            {/* Instrucción Siguiente */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-100">¿Qué sigue ahora?</span>{' '}
              Simplemente regresa a la plataforma e inicia sesión normalmente para completar la vinculación obligatoria de tu aplicación Authenticator (2FA).
            </div>

            {/* Botón de Acción Principal */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/login?verified=true"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-center bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <span>Ir a Iniciar Sesión</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setError(null);
                }}
                className="text-xs text-neutral-400 hover:text-neutral-200 text-center transition py-1"
              >
                ¿Escribiste mal el correo? Volver al formulario
              </button>
            </div>
          </div>
        ) : (
          /* Formulario de Entrada de Registro */
          <>
            <h2 className="text-2xl font-bold text-center tracking-tight mb-2">
              Crear Cuenta
            </h2>
            <p className="text-neutral-400 text-sm text-center mb-6">
              Comienza a monitorear y optimizar la entregabilidad de tus dominios
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/50 text-red-300 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tu nombre"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@dominio.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-[11px] text-neutral-400 leading-relaxed">
                <span className="font-semibold text-emerald-400">Aviso de Seguridad:</span>{' '}
                El 2FA con app autenticadora es obligatorio. Al confirmar tu cuenta deberás vincular Google Authenticator o Microsoft Authenticator.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all"
              >
                {loading ? 'Creando cuenta...' : 'Registrarse y Continuar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-neutral-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
