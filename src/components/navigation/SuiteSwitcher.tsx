'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutGrid,
  ChevronDown,
  Check,
  Globe,
  Receipt,
} from 'lucide-react';

interface SuiteProduct {
  id: string;
  name: string;
  badge: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  activeWhen: (pathname: string) => boolean;
}

const SUITE_PRODUCTS: SuiteProduct[] = [
  {
    id: 'deliverability',
    name: 'DeliverabilityGuard',
    badge: 'Motor RFC',
    description: 'Auditoría DNS, SPF, DMARC, DNSBL y STARTTLS.',
    href: '/',
    icon: Shield,
    accentColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    activeWhen: (path) => path === '/' || path.startsWith('/dashboard') || path.startsWith('/tools') || path.startsWith('/guide'),
  },
  {
    id: 'sites',
    name: 'MiPortal Bio & Sites',
    badge: 'Creador Web',
    description: 'Creador de páginas comerciales y enlaces.',
    href: '/sites/builder',
    icon: Globe,
    accentColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    activeWhen: (path) => path.startsWith('/sites') || path.startsWith('/p/'),
  },
  {
    id: 'business',
    name: 'MiPortal Facturas',
    badge: 'Suite B2B',
    description: 'Cotizaciones y cobros digitales.',
    href: '/#business-suite',
    icon: Receipt,
    accentColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    activeWhen: () => false,
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

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Botón compacto estilo Vercel / Linear */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300 flex items-center gap-1.5 transition-colors group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Ecosistema Suite MiPortal"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
        <span className="font-medium text-slate-200">Suite MiPortal</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Menú flotante desplegable */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[310px] sm:w-[340px] rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-2.5 z-50 animate-fade-in divide-y divide-slate-800/80">
          {/* Header */}
          <div className="pb-2 px-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Ecosistema MiPortal
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              v2.5
            </span>
          </div>

          {/* Lista de Productos */}
          <div className="py-1.5 space-y-1">
            {SUITE_PRODUCTS.map((prod) => {
              const Icon = prod.icon;
              const isActive = prod.activeWhen(pathname);

              return (
                <Link
                  key={prod.id}
                  href={prod.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-start gap-3 p-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900 border border-slate-700/80'
                      : 'hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 border transition-all ${prod.accentColor} group-hover:scale-105`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-100 group-hover:text-white transition-colors">
                        {prod.name}
                      </span>
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 group-hover:text-slate-300">
                        {prod.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-1">
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
          <div className="pt-2 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>¿Necesitas una solución a medida?</span>
            <a
              href="https://wa.me/573009120000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-medium"
            >
              Contactar
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
