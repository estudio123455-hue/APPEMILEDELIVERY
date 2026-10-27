'use client';

import React from 'react';
import { Sparkles, Check, X, ExternalLink, Zap, Shield, ArrowRight } from 'lucide-react';
import { BOLD_SERVICES, formatCOP } from '@/config/payments';

interface MarketProModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function MarketProModal({
  isOpen,
  onClose,
  title = 'Has alcanzado el límite gratuito diario',
  subtitle = 'Desbloquea búsquedas ilimitadas, matrices completas de 10 keywords y reportes PDF con IA.',
}: MarketProModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:hidden">
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl shadow-cyan-950/80 flex flex-col gap-6 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Pro Badge */}
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PASE PRO • MI_PORTAL SUITE</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Feature Comparison (Gratis vs Pro) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800/80">
            <span>Plan Gratuito Actual</span>
            <span className="font-mono text-amber-400">1 búsqueda / día</span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Búsquedas y análisis de palabras clave <strong>100% ilimitadas</strong></span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Generación de <strong>Ruedas Radiales SVG</strong> y árboles visuales completos</span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Generación y descarga de <strong>Informes Académicos en PDF</strong> con IA</span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Escaneo temático de <strong>enlaces web y canales de YouTube</strong></span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <a
            href={BOLD_SERVICES.marketIntelligencePro.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl text-sm font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 group"
          >
            <span>Actualizar a Pase Pro — {formatCOP(BOLD_SERVICES.marketIntelligencePro.amountCOP)}</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
          <span className="text-[11px] font-mono text-slate-400 text-center">
            Acceso permanente vía Bold Checkout Oficial
          </span>
        </div>
      </div>
    </div>
  );
}
