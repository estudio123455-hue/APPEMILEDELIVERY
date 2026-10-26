'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Briefcase,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Check,
  Globe,
  Receipt,
  BookOpen,
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
    description: 'Auditoría DNS autoritativa, DMARC/SPF, listas negras DNSBL y cifrado TLS.',
    href: '/',
    icon: Shield,
    accentColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
    activeWhen: (path) => path === '/' || path.startsWith('/dashboard'),
  },
  {
    id: 'sites',
    name: 'MiPortal Bio & Sites',
    badge: 'Creador Web',
    description: 'Páginas comerciales rápidas, enlaces verificados y catálogo de servicios.',
    href: '/sites/builder',
    icon: Globe,
    accentColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
    activeWhen: (path) => path.startsWith('/sites') || path.startsWith('/p/'),
  },
  {
    id: 'business',
    name: 'MiPortal Facturas',
    badge: 'Suite B2B',
    description: 'Cotizaciones rápidas, facturación y cobros digitales sin comisiones ocultas.',
    href: '/#business-suite',
    icon: Receipt,
    accentColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    activeWhen: () => false,
  },
  {
    id: 'dns-tools',
    name: 'DNS Tools & Wizard',
    badge: 'Asistente',
    description: 'Generador guiado para Squarespace, Cloudflare, GoDaddy y Namecheap.',
    href: '/tools/generator',
    icon: Sparkles,
    accentColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
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

  // Determine current active product
  const activeProduct =
    SUITE_PRODUCTS.find((p) => p.activeWhen(pathname)) || SUITE_PRODUCTS[0];

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Selector de Suite: Botón compacto con borde fino */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-xs text-slate-300 flex items-center gap-1.5 transition-colors group"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Cambiar de producto en la Suite MiPortal"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
        <span className="font-medium text-slate-200">{activeProduct.name}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-400' : ''
          }`}
        />
      </button>

      {/* Menú flotante desplegable */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-[320px] sm:w-[350px] rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-2.5 z-50 animate-fade-in divide-y divide-slate-800/80">
          {/* Header */}
          <div className="pb-2 px-2 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Suite MiPortal
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Ecosistema
            </span>
          </div>

          {/* Lista de Productos */}
          <div className="py-2 space-y-1">
            {SUITE_PRODUCTS.map((product) => {
              const Icon = product.icon;
              const isActive = product.activeWhen(pathname);

              return (
                <Link
                  key={product.id}
                  href={product.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl transition-all border ${
                    isActive
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                      : 'hover:bg-slate-900/60 border-transparent hover:border-slate-800'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${product.accentColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100">{product.name}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-2 px-2 flex items-center justify-between text-[11px] text-slate-400">
            <Link
              href="/guide"
              onClick={() => setIsOpen(false)}
              className="hover:text-emerald-400 transition flex items-center gap-1.5 font-medium"
            >
              <BookOpen className="w-3 h-3 text-slate-400" />
              <span>Guía Técnica & Normativas RFC</span>
            </Link>
            <span className="text-[10px] font-mono text-slate-500">v2.4</span>
          </div>
        </div>
      )}
    </div>
  );
}
