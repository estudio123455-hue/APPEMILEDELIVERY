'use client';

import React from 'react';
import { ShieldCheck, Shield, X, ExternalLink, Check, Lock } from 'lucide-react';
import { BOLD_SERVICES, formatCOP } from '@/config/payments';

interface DnsBlindajeModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain?: string;
}

export default function DnsBlindajeModal({
  isOpen,
  onClose,
  domain,
}: DnsBlindajeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in print:hidden">
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/80 flex flex-col gap-6 text-slate-100"
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

        {/* Header with Security Badge */}
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>BLINDAJE AUTORITATIVO • DELIVERABILITYGUARD</span>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Blindaje de Dominio & Ciberseguridad 24h
            </h3>
            {domain && (
              <p className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block">
                {domain}
              </p>
            )}
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              Garantizamos que tus correos no vayan a spam configurando tus registros SPF, DKIM, DMARC y BIMI.
            </p>
          </div>
        </div>

        {/* Features / Benefits */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Configuración asistida y validación estricta de registros <strong>SPF y DKIM</strong></span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Alineación de política <strong>DMARC contra suplantación</strong> (p=quarantine/reject)</span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Revisión y solicitud de <strong>deslistado de listas negras (DNSBL/RBL)</strong></span>
          </div>
          <div className="flex items-start gap-2.5 text-slate-200">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Emisión de <strong>Informe PDF Ejecutivo Certificado</strong> para tus clientes o empresa</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-2.5 pt-1">
          <a
            href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-6 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95 group"
          >
            <span>Contratar Blindaje — {formatCOP(BOLD_SERVICES.dnsBlindaje.amountCOP)}</span>
            <ExternalLink className="w-4 h-4 text-slate-950" />
          </a>
          <span className="text-[11px] font-mono text-slate-400 text-center">
            Atención e implementación técnica en menos de 24h vía Bold Oficial
          </span>
        </div>
      </div>
    </div>
  );
}
