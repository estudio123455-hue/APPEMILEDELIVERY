'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DashboardContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || 'tudominio.com';
  const sessionId = searchParams.get('session_id');

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-8">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
        <svg
          className="w-8 h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
          Suscripción Activa • DeliverabilityGuard Pro
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-50 tracking-tight">
          ¡Protección 24/7 Activada Exitosamente!
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl">
          El dominio <span className="font-mono font-bold text-emerald-400">{domain}</span> ahora
          está bajo monitoreo continuo de reputación y validación de registros RFC.
        </p>
      </div>

      {/* Details Box */}
      <div className="w-full p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left flex flex-col gap-4 font-mono text-xs">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-slate-400">Estado del Monitoreo:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            VIGILANCIA ACTIVA (CADA 60 MIN)
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-slate-400">Dominio Protegido:</span>
          <span className="text-slate-200 font-semibold">{domain}</span>
        </div>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-slate-400">Plan Contratado:</span>
          <span className="text-slate-200">$19.00 USD / mes (Recurrente)</span>
        </div>
        {sessionId && (
          <div className="flex justify-between items-center truncate">
            <span className="text-slate-400 flex-shrink-0">ID de Sesión Stripe:</span>
            <span className="text-slate-500 truncate ml-4">{sessionId}</span>
          </div>
        )}
      </div>

      {/* Next Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/25"
        >
          Volver al Inicio / Nueva Auditoría
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          Cargando panel de control...
        </div>
      }
    >
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <DashboardContent />
      </div>
    </Suspense>
  );
}
