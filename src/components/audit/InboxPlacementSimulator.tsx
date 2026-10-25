'use client';

import React, { useState } from 'react';
import type { DomainAuditReport } from '@/lib/dns/types';
import {
  calculatePlacementPrediction,
  type PlacementPrediction,
  type PlacementStatus,
} from '@/lib/dns/placement';
import {
  Inbox,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

interface InboxPlacementSimulatorProps {
  report: DomainAuditReport;
}

export default function InboxPlacementSimulator({ report }: InboxPlacementSimulatorProps) {
  const simulation = calculatePlacementPrediction(report);
  const [selectedProviderId, setSelectedProviderId] = useState<'all' | 'gmail' | 'outlook' | 'yahoo'>('all');

  const getStatusBadge = (status: PlacementStatus, label: string) => {
    switch (status) {
      case 'INBOX':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {label}
          </span>
        );
      case 'PROMOTIONS_SUSPICIOUS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {label}
          </span>
        );
      case 'SPAM':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-500/10">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            {label}
          </span>
        );
    }
  };

  const getProgressBarColor = (status: PlacementStatus) => {
    switch (status) {
      case 'INBOX':
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'PROMOTIONS_SUSPICIOUS':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400';
      case 'SPAM':
        return 'bg-gradient-to-r from-rose-600 to-red-500';
    }
  };

  const getProviderIcon = (id: string) => {
    switch (id) {
      case 'gmail':
        return (
          <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-black text-sm">
            G
          </div>
        );
      case 'outlook':
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-black text-sm">
            O
          </div>
        );
      case 'yahoo':
        return (
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm">
            Y!
          </div>
        );
      default:
        return <Inbox className="w-5 h-5 text-emerald-400" />;
    }
  };

  const visiblePredictions =
    selectedProviderId === 'all'
      ? simulation.predictions
      : simulation.predictions.filter((p) => p.providerId === selectedProviderId);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col gap-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Sub-title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-sky-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Inbox className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Simulador Heurístico RFC 2024+
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                Predicción en Vivo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mt-1 flex items-center gap-2">
              Simulador de Ubicación de Bandeja
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
              Predicción algorítmica de destino (Bandeja Principal vs. Spam vs. Promociones) para{' '}
              <span className="font-mono text-emerald-400 font-semibold">{report.domain}</span>{' '}
              en los 3 clientes de correo más utilizados del mundo.
            </p>
          </div>
        </div>

        {/* Global Average Placement Gauge */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/90 p-3.5 rounded-2xl shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Tasa Media de Entrega
            </span>
            <span className="text-2xl font-black text-slate-100 leading-tight">
              {simulation.averageRate}%
            </span>
          </div>
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-xs ${
              simulation.averageRate >= 85
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : simulation.averageRate >= 50
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {simulation.averageRate >= 85 ? 'ALTA' : simulation.averageRate >= 50 ? 'MEDIA' : 'CRÍTICA'}
          </div>
        </div>
      </div>

      {/* Filter Tabs / Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedProviderId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedProviderId === 'all'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Comparativa Global (3)
          </button>
          <button
            type="button"
            onClick={() => setSelectedProviderId('gmail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedProviderId === 'gmail'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Gmail
          </button>
          <button
            type="button"
            onClick={() => setSelectedProviderId('outlook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedProviderId === 'outlook'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Outlook / 365
          </button>
          <button
            type="button"
            onClick={() => setSelectedProviderId('yahoo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              selectedProviderId === 'yahoo'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Yahoo / Apple
          </button>
        </div>

        <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Basado en SPF, DMARC, DKIM, TLS y DNSBL
        </span>
      </div>

      {/* Simulator Cards Grid */}
      <div
        className={`grid gap-5 relative z-10 ${
          visiblePredictions.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'
        }`}
      >
        {visiblePredictions.map((pred: PlacementPrediction) => (
          <div
            key={pred.providerId}
            className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between gap-5 hover:border-slate-700/80 transition shadow-lg group"
          >
            {/* Top Provider Brand & Badge */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getProviderIcon(pred.providerId)}
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight">{pred.name}</h3>
                    <span className="text-[11px] font-mono text-slate-400">{pred.tagline}</span>
                  </div>
                </div>
                {getStatusBadge(pred.status, pred.badgeLabel)}
              </div>

              {/* Progress & Rate Bar */}
              <div className="mt-2 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Probabilidad en Bandeja:</span>
                  <span className="font-mono font-black text-slate-200">{pred.estimatedRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                      pred.status
                    )}`}
                    style={{ width: `${pred.estimatedRate}%` }}
                  />
                </div>
              </div>

              {/* Simulated Client Mockup Box */}
              <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex flex-col gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Destino Simulado en el Cliente:
                </span>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  {pred.providerId === 'gmail' && (
                    <>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'INBOX'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        📥 Principal {pred.status === 'INBOX' && `(${pred.estimatedRate}%)`}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'PROMOTIONS_SUSPICIOUS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        🏷️ Promociones
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'SPAM'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        🚫 Spam
                      </span>
                    </>
                  )}

                  {pred.providerId === 'outlook' && (
                    <>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'INBOX'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        ⭐ Prioritarios {pred.status === 'INBOX' && `(${pred.estimatedRate}%)`}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'PROMOTIONS_SUSPICIOUS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        📁 Otros
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'SPAM'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        🗑️ No deseado
                      </span>
                    </>
                  )}

                  {pred.providerId === 'yahoo' && (
                    <>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'INBOX'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        📬 Entrada {pred.status === 'INBOX' && `(${pred.estimatedRate}%)`}
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'PROMOTIONS_SUSPICIOUS'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        🔔 Promociones
                      </span>
                      <span
                        className={`px-2.5 py-1 rounded-lg font-medium border ${
                          pred.status === 'SPAM'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                            : 'bg-slate-950/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        ⚠️ Spam
                      </span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-slate-300 font-semibold mt-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pred.headline}</span>
                </div>
              </div>

              {/* Razón técnica y factores determinantes */}
              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Factores Determinantes:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  {pred.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {pred.status === 'INBOX' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : pred.status === 'PROMOTIONS_SUSPICIOUS' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Technical Guideline */}
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-500">
                {pred.technicalRequirement}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
