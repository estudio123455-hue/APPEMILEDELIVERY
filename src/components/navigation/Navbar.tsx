'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Search,
  Briefcase,
} from 'lucide-react';
import SuiteSwitcher from './SuiteSwitcher';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  initialUser?: User | null;
  onSignOut?: () => void;
}

export default function Navbar({ initialUser, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialUser !== undefined) {
      setUser(initialUser);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      if (onSignOut) {
        onSignOut();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    }
  };

  const userInitial = (
    user?.user_metadata?.full_name ||
    user?.email ||
    'U'
  )[0].toUpperCase();

  const userDisplayName =
    user?.user_metadata?.full_name || user?.email || 'Usuario';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ========================================================= */}
        {/* LADO IZQUIERDO: BRANDING LIMPIO & SUITE SWITCHER          */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 transition-all group-hover:shadow-emerald-500/30">
              <Shield className="w-4 h-4 fill-slate-950/20 stroke-[2.5]" />
            </div>
            <span className="font-semibold text-white tracking-tight text-base sm:text-lg">
              DeliverabilityGuard
            </span>
          </Link>

          {/* Suite Switcher (Selector de Productos MiPortal) */}
          <SuiteSwitcher />
        </div>

        {/* ========================================================= */}
        {/* CENTRO: ENLACES DE NAVEGACIÓN PRINCIPAL (DESKTOP)         */}
        {/* ========================================================= */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auditoría
          </Link>

          <Link
            href="/#business-suite"
            className="text-sm font-medium transition-colors text-slate-400 hover:text-white"
          >
            MiPortal Business
          </Link>

          <Link
            href="/tools/generator"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/tools/generator')
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generador DNS</span>
          </Link>

          <Link
            href="/guide"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/guide')
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guía & RFCs
          </Link>
        </nav>

        {/* ========================================================= */}
        {/* LADO DERECHO: ÁREA DE USUARIO Y AUTENTICACIÓN             */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botón Primario: Dashboard */}
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
                title="Centro de Monitoreo de Dominios"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Acceso a Seguridad / 2FA */}
              <Link
                href="/settings/security"
                className="text-slate-400 hover:text-white hover:bg-slate-800/60 p-2 rounded-lg text-sm transition-all"
                title="Ajustes de Seguridad y 2FA"
                aria-label="Ajustes de Seguridad y 2FA"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400 hover:text-emerald-400 transition-colors" />
              </Link>

              {/* Indicador de Usuario Legible */}
              <div
                className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded-lg text-slate-300 max-w-[150px] shadow-inner"
                title={user.email ?? ''}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <span className="truncate">{userDisplayName}</span>
              </div>

              {/* Botón Cerrar Sesión (Ghost) */}
              <button
                type="button"
                onClick={handleSignOut}
                className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                title="Cerrar sesión"
              >
                <span className="hidden sm:inline">Cerrar sesión</span>
                <LogOut className="w-3.5 h-3.5 sm:hidden" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium px-3.5 py-1.5 rounded-lg text-sm shadow-sm shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                Registrarse
              </Link>
            </div>
          )}

          {/* Botón Menú Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MENÚ MÓVIL DESPLEGABLE                                    */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-3 animate-fade-in">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 transition ${
              pathname === '/'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Auditoría de Entregabilidad</span>
          </Link>

          <Link
            href="/#business-suite"
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 text-slate-300 hover:bg-slate-900 hover:text-white transition"
          >
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>MiPortal Business</span>
          </Link>

          <Link
            href="/tools/generator"
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 transition ${
              pathname.startsWith('/tools/generator')
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Generador SPF & DMARC</span>
          </Link>

          <Link
            href="/guide"
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 transition ${
              pathname.startsWith('/guide')
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Guía & RFCs</span>
          </Link>

          {user && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <span className="truncate">{userDisplayName}</span>
              </div>

              <Link
                href="/settings/security"
                className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Seguridad y 2FA</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
