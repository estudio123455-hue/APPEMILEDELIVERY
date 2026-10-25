'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/setup-2fa`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // Si la sesión se inicia inmediatamente, redirigir directo a la configuración forzada de 2FA
      if (data.session) {
        router.push("/setup-2fa");
        router.refresh();
      } else {
        setSuccessMsg(
          "¡Cuenta creada con éxito! Revisa tu correo para confirmar tu registro. Tras confirmarlo, el sistema te redirigirá obligatoriamente a activar tu aplicación Authenticator (2FA)."
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error desconocido al registrar la cuenta.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white px-4">
      <div className="w-full max-w-md bg-[#121212] border border-neutral-800 rounded-2xl p-8 shadow-xl">
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

        {successMsg ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-lg text-sm text-center space-y-3">
            <p>{successMsg}</p>
            <Link
              href="/login"
              className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        ) : (
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
              El 2FA con app autenticadora es obligatorio. Al registrarte deberás vincular Google Authenticator o Microsoft Authenticator.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all"
            >
              {loading ? "Creando cuenta..." : "Registrarse y Configurar 2FA"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-neutral-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
