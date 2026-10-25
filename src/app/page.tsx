'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DomainAuditReport, Severity } from '@/lib/dns/types';

export default function Home() {
  const [domainInput, setDomainInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DomainAuditReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const cleanDomainForSubmit = (input: string): string => {
    return input
      .trim()
      .toLowerCase()
      .replace(/^[a-z]+:\/\//i, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0]
      .split('#')[0]
      .split(':')[0]
      .replace(/^\.+|\.+$/g, '');
  };

  const handleAudit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleaned = cleanDomainForSubmit(domainInput);
    if (!cleaned) {
      setErrorMsg('Por favor ingresa un nombre de dominio válido (ej. tuempresa.com).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: cleaned }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details?.fieldErrors?.domain?.[0]) {
          setErrorMsg(data.details.fieldErrors.domain[0]);
        } else {
          setErrorMsg(data.message || 'No fue posible auditar el dominio especificado.');
        }
        setReport(null);
      } else {
        setReport(data as DomainAuditReport);
        setDomainInput(cleaned);
      }
    } catch {
      setErrorMsg('Error de conexión con el motor de auditoría. Intenta nuevamente.');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!report?.domain) return;

    setCheckoutLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: report.domain }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar la sesión de pago.');
      }

      if (data.url) {
        // Redirección inmediata y desatendida a Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió la URL de redirección a Stripe.');
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error inesperado al conectar con Stripe.';
      alert(`No fue posible iniciar el proceso de suscripción: ${message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-lime-400 border-lime-500/30 bg-lime-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            CRÍTICO
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            ADVERTENCIA
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            INFO
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-5 h-5 text-slate-950 font-bold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-200 to-emerald-400">
                DeliverabilityGuard
              </span>
              <span className="hidden sm:inline-block text-[11px] font-mono tracking-wider text-emerald-400/90 uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                Autoservicio B2B
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-mono mr-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Motor DNS Nativo RFC</span>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('pricing-card');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Planes Pro
            </button>
            <div className="flex items-center gap-2 sm:gap-3 ml-1">
              <Link
                href="/login"
                className="text-xs font-medium text-slate-300 hover:text-white transition"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Auditoría de Entregabilidad en Tiempo Real
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 leading-tight">
            ¿Tus cotizaciones y correos caen en{' '}
            <span className="text-rose-400 underline decoration-rose-500/40 decoration-wavy">
              Spam
            </span>
            ? <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Audita tu dominio en segundos.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Inspección profunda de registros <strong>SPF, DMARC, DKIM, MX y BIMI</strong> conforme
            a las directivas estrictas de Google y Yahoo 2024+. Resolución nativa sin intermediarios.
          </p>
        </div>

        {/* Diagnostic Input Bar */}
        <div className="max-w-2xl w-full mx-auto">
          <form
            onSubmit={handleAudit}
            className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-emerald-950/20 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <svg
                className="w-5 h-5 text-slate-500 mr-2.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="tuempresa.com"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 transition-all"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4 text-slate-950"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Auditando...</span>
                </>
              ) : (
                <>
                  <span>Auditar Dominio</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Example Chips */}
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Ejemplos rápidos:</span>
            <button
              type="button"
              onClick={() => {
                setDomainInput('uniandes.edu.co');
              }}
              className="hover:text-emerald-400 underline font-mono transition"
            >
              uniandes.edu.co
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setDomainInput('google.com');
              }}
              className="hover:text-emerald-400 underline font-mono transition"
            >
              google.com
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <svg
                className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="font-semibold">Error al auditar</p>
                <p className="text-rose-300/90 text-xs mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Results Section */}
        {report && (
          <div className="flex flex-col gap-10 animate-fade-in">
            {/* Score & Summary Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                {/* Score Circular Badge */}
                <div
                  className={`w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-3 shadow-inner ${getScoreColor(
                    report.score
                  )}`}
                >
                  <span className="text-4xl font-black tracking-tight">{report.score}</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                    / 100 PTS
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-mono text-slate-400">Dominio auditado:</span>
                    <span className="font-mono text-emerald-400 font-bold">{report.domain}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-100">
                    Estado:{' '}
                    <span
                      className={
                        report.status === 'EXCELLENT'
                          ? 'text-emerald-400'
                          : report.status === 'GOOD'
                          ? 'text-lime-400'
                          : report.status === 'NEEDS_ATTENTION'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {report.status === 'EXCELLENT' && 'Excelente Entregabilidad'}
                      {report.status === 'GOOD' && 'Buena Configuración'}
                      {report.status === 'NEEDS_ATTENTION' && 'Requiere Atención Inmediata'}
                      {report.status === 'CRITICAL' && 'Riesgo Crítico de Spam'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Fecha y hora:{' '}
                    {new Date(report.timestamp).toLocaleString('es-CO', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              </div>

              {/* Counters */}
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="block text-xl font-bold text-rose-400">
                    {report.summary.criticalCount}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Críticos</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="block text-xl font-bold text-amber-400">
                    {report.summary.warningCount}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Alertas</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                  <span className="block text-xl font-bold text-sky-400">
                    {report.summary.infoCount}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">Informativos</span>
                </div>
              </div>
            </div>

            {/* 5 Pillars Grid */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                Pilares Fundamentales de Autenticación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. MX */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                      MX RECORDS
                    </span>
                    {report.mx.isValid ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Válido
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Faltante
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Enrutamiento</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {report.mx.records.length > 0
                        ? `${report.mx.records.length} servidores configurados`
                        : 'Sin servidores receptores'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {report.mx.records[0]?.exchange || 'No detectado'}
                  </div>
                </div>

                {/* 2. SPF */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                      SPF
                    </span>
                    {report.spf.isValid && report.spf.errors.length === 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Válido
                      </span>
                    ) : report.spf.raw ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Atención
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Faltante
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Remitentes</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Directiva: {report.spf.qualifier || 'N/A'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Consultas DNS: {report.spf.dnsLookupCount}/10
                  </div>
                </div>

                {/* 3. DMARC */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                      DMARC
                    </span>
                    {report.dmarc.policy === 'reject' || report.dmarc.policy === 'quarantine' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Protegido
                      </span>
                    ) : report.dmarc.policy === 'none' ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        p=none
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                        Faltante
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Política Antifraude</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      p={report.dmarc.policy || 'none'} | pct={report.dmarc.percentage ?? 100}%
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    RUA: {report.dmarc.rua.length > 0 ? 'Configurado' : 'Ausente'}
                  </div>
                </div>

                {/* 4. DKIM */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                      DKIM
                    </span>
                    {report.dkim.found ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        Detectado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        No común
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Firma Criptográfica</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {report.dkim.records.length > 0
                        ? `${report.dkim.records.length} claves activas`
                        : 'Selectores propios'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {report.dkim.records[0]?.selector
                      ? `Sel: ${report.dkim.records[0].selector}`
                      : 'Sin selector estándar'}
                  </div>
                </div>

                {/* 5. BIMI */}
                <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                      BIMI
                    </span>
                    {report.bimi.isValid && report.bimi.hasVmc ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        VMC Listo
                      </span>
                    ) : report.bimi.isValid ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Sin VMC
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-700 text-slate-400">
                        Opcional
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Logo en Bandeja</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {report.bimi.hasVmc ? 'VMC Certificado' : 'Avatar estándar'}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">
                    {report.bimi.logoUrl ? 'SVG configurado' : 'No configurado'}
                  </div>
                </div>
              </div>
            </div>

            {/* Issues and Remediation List */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Diagnóstico Detallado y Correcciones Recomendadas
              </h3>

              {report.issues.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center">
                  <p className="font-bold text-base">¡Configuración Impecable!</p>
                  <p className="text-xs text-emerald-300/80 mt-1">
                    No se encontraron fallos ni advertencias de entregabilidad para este dominio.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {report.issues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {getSeverityBadge(issue.severity)}
                          <span className="text-xs font-mono font-bold text-slate-400">
                            [{issue.category}]
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-slate-100">
                            {issue.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {issue.description}
                      </p>

                      {issue.recommendation && (
                        <div className="mt-1 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-2.5">
                          <svg
                            className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-xs">
                            <span className="font-semibold text-emerald-400">
                              Solución Técnica:{' '}
                            </span>
                            <span className="text-slate-300 font-mono">
                              {issue.recommendation}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Monetization / Conversion Card */}
            <div
              id="pricing-card"
              className="relative overflow-hidden p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/40 flex flex-col lg:flex-row items-center justify-between gap-8"
            >
              {/* Background ambient glow */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

              <div className="flex flex-col gap-4 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Monitoreo Continuo 24/7 & Protección Activa
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight">
                  Evita que tus correos caigan en spam de forma permanente
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Las zonas DNS cambian y las IPs son reportadas en listas negras sin previo aviso.
                  Recibe alertas instantáneas en Slack o correo antes de que afecte tus ventas.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Escaneo de DNS cada 60 min</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Alertas Spamhaus & Barracuda</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Generador SPF Flattening</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-400 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Telemetría DMARC RUA en vivo</span>
                  </li>
                </ul>
              </div>

              {/* Pricing Box & CTA */}
              <div className="w-full lg:w-auto p-6 sm:p-7 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col items-center gap-4 text-center min-w-[280px]">
                <div className="flex flex-col">
                  <span className="text-xs uppercase font-mono tracking-wider text-emerald-400 font-bold">
                    Plan Deliverability Pro
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-1">
                    <span className="text-4xl font-extrabold text-slate-50">$19</span>
                    <span className="text-xs text-slate-400 font-mono">USD / mes</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Sin permanencia mínima • Cancela cuando quieras
                  </span>
                </div>

                <button
                  type="button"
                  disabled={checkoutLoading}
                  onClick={handleCheckout}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 active:scale-[0.98] shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-60"
                >
                  {checkoutLoading ? (
                    <span>Procesando...</span>
                  ) : (
                    <>
                      <span>Activar Protección por $19/mes</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg
                    className="w-3.5 h-3.5 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Pago seguro procesado por Stripe</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} DeliverabilityGuard. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>RFC 7208 (SPF)</span>
            <span>•</span>
            <span>RFC 7489 (DMARC)</span>
            <span>•</span>
            <span>RFC 6376 (DKIM)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
