'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutGrid,
  ChevronDown,
  Check,
  Smartphone,
  Radar,
  Briefcase,
  Wrench,
  Sparkles,
  Brain,
} from 'lucide-react';

export interface SuiteProduct {
  id: string;
  name: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeWhen: (pathname: string) => boolean;
}

export const SUITE_PRODUCTS: SuiteProduct[] = [
  {
    id: 'market-search',
    name: 'Market & Search',
    badge: 'IA & Radar',
    badgeColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    description: 'Inteligencia de mercado, ruedas radiales SVG y benchmarking.',
    href: '/tools/ask-the-public',
    icon: Radar,
    accentColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    activeWhen: (path) => path.startsWith('/tools/ask-the-public') || path.startsWith('/market-analyzer'),
  },
  {
    id: 'bio-sites',
    name: 'Bio & Sites Builder',
    badge: 'Squarespace UX',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    description: 'Constructor de páginas comerciales y perfiles rápidos.',
    href: '/sites/builder',
    icon: Smartphone,
    accentColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    activeWhen: (path) => path.startsWith('/sites') || path.startsWith('/p/'),
  },
  {
    id: 'deliverability-core',
    name: 'DeliverabilityGuard Core',
    badge: 'Motor RFC',
    badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    description: 'Auditoría DNS autoritativa y reputación de correo.',
    href: '/#quick-audit',
    icon: Shield,
    accentColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
    activeWhen: (path) => path === '/' || path.startsWith('/dashboard'),
  },
  {
    id: 'business',
    name: 'MiPortal Business',
    badge: 'Nuevo',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
    description: 'Presupuestos, cotizaciones ejecutivas y cobros directos.',
    href: '/business',
    icon: Briefcase,
    accentColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    activeWhen: (path) => path.startsWith('/business'),
  },
  {
    id: 'mind-canvas',
    name: 'Mind & Canvas',
    badge: 'Beta',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold',
    description: 'Organización visual de ideas: transforma el caos en proyectos estructurados.',
    href: '/tools/mind-canvas',
    icon: Brain,
    accentColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
    activeWhen: (path) => path.startsWith('/tools/mind-canvas'),
  },
  {
    id: 'dns-wizard',
    name: 'DNS Tools & Wizard',
    badge: '1-Clic',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    description: 'Generador guiado de registros SPF y DMARC.',
    href: '/tools/generator',
    icon: Wrench,
    accentColor: 'text-teal-400 bg-teal-500/15 border-teal-500/30',
    activeWhen: (path) => path.startsWith('/tools/generator'),
  },
];

export default function SuiteSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Botón App Launcher estilo SaaS moderno */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-200 flex items-center gap-2 transition-all group shadow-sm active:scale-95"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Abrir selector de módulos de MiPortal Suite"
      >
        <div className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
          <LayoutGrid className="w-3 h-3 group-hover:rotate-45 transition-transform duration-300" />
        </div>
        <span className="font-semibold text-slate-100">Suite MiPortal</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : 'group-hover:text-slate-200'
          }`}
        />
      </button>

      {/* Menú flotante desplegable (Dark Slate / Obsidian) */}
      {isOpen && (
        <div className="absolute left-0 mt-2.5 w-[330px] sm:w-[370px] rounded-2xl bg-[#0B0F17]/95 border border-slate-800/90 shadow-2xl shadow-black/80 backdrop-blur-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-800/80">
          {/* Header */}
          <div className="pb-2 px-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Ecosistema MiPortal Suite
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              6 Módulos Activos
            </span>
          </div>

          {/* Lista de Productos */}
          <div className="py-2 space-y-1">
            {SUITE_PRODUCTS.map((prod) => {
              const Icon = prod.icon;
              const isActive = prod.activeWhen(pathname);

              return (
                <Link
                  key={prod.id}
                  href={prod.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900/90 border border-slate-700/80 shadow-inner'
                      : 'hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-xl shrink-0 border transition-transform group-hover:scale-105 ${prod.accentColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 group-hover:text-white transition-colors">
                        {prod.name}
                      </span>
                      {prod.badge && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                            prod.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {prod.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 group-hover:text-slate-300 leading-snug mt-0.5">
                      {prod.description}
                    </p>
                  </div>

                  {isActive && (
                    <div className="shrink-0 self-center">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Footer del Switcher */}
          <div className="pt-2 px-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>¿Auditoría o setup a medida?</span>
            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition"
            >
              Ver Guías RFC &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
