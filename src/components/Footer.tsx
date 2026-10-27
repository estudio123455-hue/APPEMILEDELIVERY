'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectAuditAction?: () => void;
}

export default function Footer({ onSelectAuditAction }: FooterProps) {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-12 sm:py-16 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group transition-opacity hover:opacity-90 cursor-pointer"
              title="Volver al inicio de MiPortal Suite"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">MiPortal Suite</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ecosistema digital todo-en-uno: Inteligencia de mercado con IA, organización de ideas con Mind Canvas,
              generador de Bio Sites, presupuestos ejecutivos y ciberseguridad DNS de entregabilidad.
            </p>
            <div className="pt-2 text-[11px] font-mono text-emerald-400/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>DeliverabilityGuard Enterprise Engine</span>
            </div>
          </div>

          {/* Herramientas de la Suite */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Herramientas
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  href="/tools/ask-the-public"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>Market & Search (Escucha Social)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/sites/builder"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>Constructor de Bio Sites</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/mind-canvas"
                  className="hover:text-purple-400 transition flex items-center gap-1.5"
                >
                  <span>Mind & Canvas Creativo</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Beta
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="hover:text-amber-400 transition flex items-center gap-1.5"
                >
                  <span>Presupuestos y Facturación</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Nuevo
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/generator"
                  className="hover:text-emerald-400 transition flex items-center gap-1.5"
                >
                  <span>Generador de Registros SPF/DMARC</span>
                </Link>
              </li>
              <li>
                <a
                  href="/#quick-audit"
                  onClick={onSelectAuditAction}
                  className="hover:text-emerald-400 transition text-left cursor-pointer"
                >
                  Auditor DNS de Dominio en Vivo
                </a>
              </li>
            </ul>
          </div>

          {/* Recursos & Documentación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Recursos
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/guide" className="hover:text-emerald-400 transition">
                  Base de Conocimiento y Guías DNS
                </Link>
              </li>
              <li>
                <Link href="/p/demo" className="hover:text-emerald-400 transition">
                  Ejemplo de Perfil Bio Site Verificado
                </Link>
              </li>
              <li>
                <Link href="/p/tunnelvision" className="hover:text-purple-400 transition flex items-center gap-1.5">
                  <span>Showcase TUNNELVISION Studio</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Showcase
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition">
                  Centro de Monitoreo Continuo
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Cumplimiento Técnico */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Protocolos & Seguridad
            </h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RFC 7208 (SPF Protocol)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RFC 7489 (DMARC Policy)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>RFC 6376 (DKIM Signatures)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cifrado TLSv1.2+ / STARTTLS</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} MiPortal Suite / DeliverabilityGuard. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Hecho para Creadores & Empresas</span>
            <span>•</span>
            <span className="text-emerald-400">DNS Global 1.1.1.1 & 8.8.8.8</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
