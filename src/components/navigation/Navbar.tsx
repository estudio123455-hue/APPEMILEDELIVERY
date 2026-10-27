'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Search,
  Sparkles,
  BookOpen,
  Globe,
  Radio,
} from 'lucide-react';
import SuiteSwitcher from './SuiteSwitcher';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface NavbarProps {
  initialUser?: User | null;
  onSignOut?: () => void;
}

export default function Navbar({ initialUser, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync auth state con validación estricta de AAL2 (MFA Bypass Prevention)
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function evaluateAssuranceLevel(candidateUser: User | null) {
      if (!candidateUser) {
        if (isMounted) setUser(null);
        return;
      }

      try {
        const { data: aalData, error } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (error) {
          if (isMounted) setUser(null);
          return;
        }

        // Si el usuario requiere AAL2 pero su nivel actual no es AAL2 (reto pendiente)
        // el Navbar debe tratarse estrictamente como usuario invitado / no autenticado
        if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
          if (isMounted) setUser(null);
          return;
        }

        if (isMounted) setUser(candidateUser);
      } catch {
        if (isMounted) setUser(null);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      evaluateAssuranceLevel(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluateAssuranceLevel(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setUserMenuOpen(false);
      if (onSignOut) {
        onSignOut();
      } else {
        router.push('/');
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
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ========================================================= */}
        {/* ZONA IZQUIERDA: BRANDING & SWITCHER                       */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Logo Principal con Isotipo Escudo Esmeralda */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-[0.98]"
            title="DeliverabilityGuard — Suite MiPortal"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 transition-all group-hover:shadow-emerald-500/35">
              <Shield className="w-4 h-4 fill-slate-950/20 stroke-[2.5]" />
            </div>
            <span className="font-semibold text-white tracking-tight text-base sm:text-lg">
              DeliverabilityGuard
            </span>
          </Link>

          {/* Barra divisoria vertical sutil */}
          <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block" />

          {/* Selector de Suite Compacto */}
          <div className="hidden sm:block">
            <SuiteSwitcher />
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONA CENTRAL: NAVEGACIÓN LIMPIA (DESKTOP)                 */}
        {/* ========================================================= */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Auditoría DNS
          </Link>

          <Link
            href="/tools/ask-the-public"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith('/tools/ask-the-public')
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Escucha de Mercado</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              En Vivo
            </span>
          </Link>

          <Link
            href="/tools/generator"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/tools/generator')
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Generador DNS
          </Link>

          <Link
            href="/guide"
            className={`text-sm font-medium transition-colors ${
              pathname.startsWith('/guide')
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guía RFC
          </Link>
        </nav>

        {/* ========================================================= */}
        {/* ZONA DERECHA: SESIÓN & DASHBOARD                          */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              {/* Botón Directo al Dashboard */}
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border shadow-sm active:scale-95 ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-emerald-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/60'
                }`}
                title="Centro de Monitoreo"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Avatar / Menú Desplegable de Perfil */}
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/70 hover:border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xs transition relative group focus:outline-none"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  title={`Sesión activa: ${userDisplayName}`}
                >
                  <span>{userInitial}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 border-2 border-slate-950 absolute -bottom-0.5 -right-0.5" />
                </button>

                {/* Dropdown de Usuario con Logout adentro */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-2 z-50 animate-fade-in divide-y divide-slate-800/80">
                    <div className="px-3 py-2">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {userDisplayName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Centro de Monitoreo</span>
                      </Link>

                      <Link
                        href="/settings/security"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Seguridad y 2FA</span>
                      </Link>

                      <Link
                        href="/sites/builder"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-900 transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Mis Sitios Bio</span>
                      </Link>
                    </div>

                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3.5 py-1.5 rounded-lg text-sm shadow-sm shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                Comenzar gratis
              </Link>
            </div>
          )}

          {/* Botón Menú Móvil */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MENÚ MÓVIL DESPLEGABLE                                    */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2.5 animate-fade-in shadow-2xl">
          <div className="pb-2 mb-1 border-b border-slate-800/80">
            <SuiteSwitcher />
          </div>

          <Link
            href="/"
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition ${
              pathname === '/'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Auditoría DNS</span>
          </Link>

          <Link
            href="/tools/ask-the-public"
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-between transition ${
              pathname.startsWith('/tools/ask-the-public')
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span>Escucha de Mercado</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              En Vivo
            </span>
          </Link>

          <Link
            href="/tools/generator"
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition ${
              pathname.startsWith('/tools/generator')
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Generador DNS</span>
          </Link>

          <Link
            href="/guide"
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2.5 transition ${
              pathname.startsWith('/guide')
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Guía RFC</span>
          </Link>

          {user ? (
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs text-slate-300">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {userInitial}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-semibold text-slate-100">{userDisplayName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{user.email}</span>
                </div>
              </div>

              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Ir al Dashboard</span>
              </Link>

              <Link
                href="/settings/security"
                className="px-3 py-2 rounded-xl text-sm text-slate-300 hover:bg-slate-900 hover:text-white flex items-center gap-2.5 transition"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Seguridad y 2FA</span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 transition text-left"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center py-2 text-sm text-slate-300 hover:text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="w-full text-center py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm shadow-md shadow-emerald-500/20"
              >
                Comenzar gratis
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
