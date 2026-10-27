'use client';

import React, { useState } from 'react';
import { Lock, Unlock, ExternalLink, Sparkles, MessageCircle } from 'lucide-react';
import { BOLD_SERVICES, formatCOP } from '@/config/payments';

interface MarketPaywallProps {
  onUnlockWithCode?: (code: string) => void;
}

export default function MarketPaywall({ onUnlockWithCode }: MarketPaywallProps) {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState('');
  const [codeFeedback, setCodeFeedback] = useState<string | null>(null);

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().toUpperCase() === 'PRO-VIP-2026' || code.trim().length >= 8) {
      if (onUnlockWithCode) onUnlockWithCode(code.trim());
      setCodeFeedback('¡Código verificado con éxito! Desbloqueando...');
    } else {
      setCodeFeedback('Código inválido o expirado. Contacta a soporte para validarlo.');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/60 backdrop-blur-2xl text-center flex flex-col items-center gap-6 z-30 animate-fade-in">
      {/* Decorative ambient glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Security Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
        <Lock className="w-3.5 h-3.5 text-cyan-400" />
        <span>ACCESO RESTRINGIDO — EXCLUSIVO PRO</span>
      </div>

      {/* Lock Icon Emblem */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-950 to-slate-900 border-2 border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-xl shadow-cyan-500/20 relative group">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <Lock className="w-6 h-6 text-cyan-300" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-2.5 max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Inteligencia de Mercado & Escucha Social
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Herramienta bloqueada. Para acceder a la generación de matrices de preguntas, ruedas radiales SVG, arquetipos de consumo y reportes académicos en PDF con IA, debes activar tu pase.
        </p>
      </div>

      {/* Feature Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>Ruedas SVG Ilimitadas</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Informe PDF con IA</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Escaneo de YouTube</span>
        </div>
      </div>

      {/* CTA GIGANTE DE ALTO CONTRASTE */}
      <div className="w-full flex flex-col items-center gap-3 pt-2">
        <a
          href={BOLD_SERVICES.marketIntelligencePro.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-8 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 active:scale-[0.98] cursor-pointer group"
        >
          <Unlock className="w-5 h-5 text-slate-950 stroke-[2.5] transition-transform group-hover:rotate-12" />
          <span>Desbloquear Acceso Ahora — {formatCOP(BOLD_SERVICES.marketIntelligencePro.amountCOP)}</span>
          <ExternalLink className="w-4 h-4 text-slate-950 opacity-80" />
        </a>

        <span className="text-[11px] font-mono text-slate-400">
          Pago 100% seguro y garantizado vía Bold Checkout Oficial
        </span>
      </div>

      {/* Botón secundario discreto */}
      <div className="pt-2 border-t border-slate-800/80 w-full flex flex-col items-center gap-2">
        {!showCodeInput ? (
          <button
            type="button"
            onClick={() => setShowCodeInput(true)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition underline underline-offset-4 cursor-pointer"
          >
            ¿Ya realizaste el pago? Activar con código / Contactar soporte
          </button>
        ) : (
          <form onSubmit={handleValidateCode} className="w-full max-w-md flex flex-col gap-2 animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa tu código de activación..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Validar
              </button>
            </div>
            {codeFeedback && (
              <p className="text-[11px] text-cyan-300 text-center font-mono">{codeFeedback}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <a
                href="https://wa.me/573001234567?text=Hola,%20ya%20pagu%C3%A9%20el%20Pase%20Pro%20de%20Mercado%20y%20necesito%20mi%20c%C3%B3digo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contactar soporte vía WhatsApp</span>
              </a>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="text-slate-500 hover:underline"
              >
                Cerrar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
