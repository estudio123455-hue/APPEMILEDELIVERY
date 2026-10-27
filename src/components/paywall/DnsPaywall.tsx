'use client';

import React, { useState } from 'react';
import { ShieldCheck, Shield, ExternalLink, MessageCircle } from 'lucide-react';
import { BOLD_SERVICES, formatCOP } from '@/config/payments';

interface DnsPaywallProps {
  onUnlockWithToken?: (token: string) => void;
  domain?: string;
}

export default function DnsPaywall({ onUnlockWithToken, domain }: DnsPaywallProps) {
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [token, setToken] = useState('');
  const [tokenFeedback, setTokenFeedback] = useState<string | null>(null);

  const handleValidateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim().toUpperCase() === 'DNS-BLINDAJE-2026' || token.trim().length >= 8) {
      if (onUnlockWithToken) onUnlockWithToken(token.trim());
      setTokenFeedback('¡Token autorizado! Inicializando auditoría autoritativa...');
    } else {
      setTokenFeedback('Token no reconocido. Contacta con tu especialista técnico asignado.');
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-8 sm:p-10 rounded-3xl bg-slate-900/95 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/60 backdrop-blur-2xl text-center flex flex-col items-center gap-6 z-30 animate-fade-in">
      {/* Decorative ambient glow */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Security Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>SERVICIO OFICIAL BOLD — DELIVERABILITYGUARD</span>
      </div>

      {/* Shield Icon Emblem */}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-950 to-slate-900 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 relative group">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-emerald-300 stroke-[2.2]" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-2.5 max-w-lg">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Blindaje de Dominio & Ciberseguridad DNS
        </h2>
        {domain && (
          <p className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block font-semibold">
            Dominio objetivo: {domain}
          </p>
        )}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Módulo reservado. Incluye auditoría autoritativa RFC, diagnóstico profundo de listas negras DNSBL, alineación estricta DMARC/SPF/DKIM y blindaje en 24h para garantizar que tus correos no vayan a spam.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full pt-1">
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Alineación SPF / DKIM</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>DMARC p=reject</span>
        </div>
        <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Limpieza RBL 24h</span>
        </div>
      </div>

      {/* CTA GIGANTE DE ALTO CONTRASTE */}
      <div className="w-full flex flex-col items-center gap-3 pt-2">
        <a
          href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 px-8 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 hover:brightness-110 text-slate-950 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 active:scale-[0.98] cursor-pointer group"
        >
          <ShieldCheck className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          <span>Adquirir Blindaje de Dominio — {formatCOP(BOLD_SERVICES.dnsBlindaje.amountCOP)}</span>
          <ExternalLink className="w-4 h-4 text-slate-950 opacity-80" />
        </a>

        <span className="text-[11px] font-mono text-slate-400">
          Atención técnica personalizada en 24h vía Bold Checkout Oficial
        </span>
      </div>

      {/* Botón secundario discreto */}
      <div className="pt-2 border-t border-slate-800/80 w-full flex flex-col items-center gap-2">
        {!showTokenInput ? (
          <button
            type="button"
            onClick={() => setShowTokenInput(true)}
            className="text-xs text-slate-400 hover:text-emerald-400 transition underline underline-offset-4 cursor-pointer"
          >
            ¿Ya contrataste el servicio? Activar con token / Contactar especialista
          </button>
        ) : (
          <form onSubmit={handleValidateToken} className="w-full max-w-md flex flex-col gap-2 animate-fade-in">
            <div className="flex gap-2">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Ingresa tu token de blindaje..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Validar
              </button>
            </div>
            {tokenFeedback && (
              <p className="text-[11px] text-emerald-300 text-center font-mono">{tokenFeedback}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 pt-1">
              <a
                href="https://wa.me/573001234567?text=Hola,%20contrat%C3%A9%20el%20Blindaje%20de%20Dominio%20DNS%20en%20Bold%20y%20deseo%20activarlo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Hablar con especialista técnico</span>
              </a>
              <span>•</span>
              <button
                type="button"
                onClick={() => setShowTokenInput(false)}
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
