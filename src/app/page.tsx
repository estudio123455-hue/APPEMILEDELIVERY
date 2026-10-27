'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DomainAuditReport, Severity } from '@/lib/dns/types';
import { createClient } from '@/utils/supabase/client';
import DnsFixAssistant from '@/components/audit/DnsFixAssistant';
import PrintableAuditReport from '@/components/audit/PrintableAuditReport';
import InboxPlacementSimulator from '@/components/audit/InboxPlacementSimulator';
import MiPortalSuiteShowcase from '@/components/home/MiPortalSuiteShowcase';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/Footer';
import { BOLD_SERVICES } from '@/config/payments';
import {
  FileDown,
  Sparkles,
  Lightbulb,
  Shield,
  ShieldCheck,
  Search,
  Smartphone,
  Layout,
  Radar,
  Lock,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Globe,
  Server,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Json } from '@/types/database';

export default function Home() {
  const router = useRouter();

  // Dual Action Bar State ('audit' | 'market')
  const [actionTab, setActionTab] = useState<'audit' | 'market'>('audit');
  const [dualInput, setDualInput] = useState('');

  // DNS Audit State
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DomainAuditReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [saveDomainFeedback, setSaveDomainFeedback] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    async function evaluateAssuranceLevel(candidateUser: User | null) {
      if (!candidateUser) {
        if (isMounted) setUser(null);
        return;
      }

      try {
        const { data: aalData, error } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

        if (error) {
          if (isMounted) setUser(null);
          return;
        }

        if (aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
          if (isMounted) setUser(null);
          return;
        }

        if (isMounted) setUser(candidateUser);
      } catch {
        if (isMounted) setUser(null);
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      evaluateAssuranceLevel(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      evaluateAssuranceLevel(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  };

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

  const handleAudit = async (targetDomain?: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const rawDomain = targetDomain || dualInput;
    const cleaned = cleanDomainForSubmit(rawDomain);
    if (!cleaned) {
      setErrorMsg('Por favor ingresa un nombre de dominio válido (ej. tuempresa.com).');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setDualInput(cleaned);

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
        setDualInput(cleaned);
        // Scroll suave al contenedor interactivo de resultados
        setTimeout(() => {
          const el = document.getElementById('audit-results-view');
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } catch {
      setErrorMsg('Error de conexión con el motor de auditoría. Intenta nuevamente.');
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dualInput.trim()) return;

    if (actionTab === 'market') {
      router.push(`/tools/ask-the-public?query=${encodeURIComponent(dualInput.trim())}`);
    } else {
      handleAudit(undefined, e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const domainQuery = params.get('domain');
      if (domainQuery) {
        setActionTab('audit');
        handleAudit(domainQuery);
      }
    }
  }, []);

  const handleSaveDomain = async () => {
    if (!user || !report) return;
    setIsSavingDomain(true);
    setSaveDomainFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.from('domain_audits').insert({
        user_id: user.id,
        domain: report.domain,
        score: report.score,
        status: report.status,
        spf_valid: report.spf.isValid,
        dmarc_valid: report.dmarc.isValid,
        dkim_valid: report.dkim.found,
        mx_valid: report.mx.isValid,
        bimi_valid: report.bimi.isValid,
        critical_count: report.summary.criticalCount,
        warning_count: report.summary.warningCount,
        issues: report.issues as unknown as Json,
        raw_report: report as unknown as Json,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSaveDomainFeedback('✓ Dominio guardado en tu panel');
      setTimeout(() => {
        setSaveDomainFeedback(null);
      }, 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el dominio.';
      setSaveDomainFeedback(`Error: ${msg}`);
      setTimeout(() => {
        setSaveDomainFeedback(null);
      }, 4000);
    } finally {
      setIsSavingDomain(false);
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

  const focusAuditInput = () => {
    setActionTab('audit');
    const el = document.getElementById('dual-action-input');
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar initialUser={user} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-16 sm:gap-24 print:p-0 print:m-0 print:max-w-none">
        {/* ========================================================== */}
        {/* A. HERO SECTION: Ecosistema Matriz Todo-en-Uno */}
        {/* ========================================================== */}
        <section className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6 print:hidden relative">
          {/* Ambient radial glow background */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/40">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>MiPortal Suite — Presencia, Inteligencia y Seguridad Digital</span>
          </div>

          {/* Titular Principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            De la idea a un negocio digital{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              blindado y validado.
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-base sm:text-xl text-slate-300/90 leading-relaxed max-w-3xl font-normal">
            Investiga tu mercado y competencia con IA, crea tu presencia comercial con Bio Sites en minutos y protege la
            reputación de tu dominio para que tus correos nunca caigan a spam.
          </p>

          {/* Barra de Acción Rápida (Input Dual) */}
          <div className="w-full max-w-2xl mt-4">
            {/* Tabs de Selector Rápido */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setActionTab('audit');
                    setErrorMsg(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    actionTab === 'audit'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Auditar Dominio</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionTab('market');
                    setErrorMsg(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                    actionTab === 'market'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Analizar Mercado & Competencia</span>
                </button>
              </div>
            </div>

            {/* Input Dual */}
            <form
              onSubmit={handleDualSubmit}
              className={`relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-slate-900/90 border shadow-2xl transition-all ${
                actionTab === 'audit'
                  ? 'border-emerald-500/40 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20'
                  : 'border-cyan-500/40 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20'
              }`}
            >
              <div className="relative flex-1 flex items-center pl-3">
                {actionTab === 'audit' ? (
                  <Globe className="w-5 h-5 text-emerald-400 mr-2.5 flex-shrink-0" />
                ) : (
                  <Radar className="w-5 h-5 text-cyan-400 mr-2.5 flex-shrink-0" />
                )}
                <input
                  id="dual-action-input"
                  type="text"
                  value={dualInput}
                  onChange={(e) => setDualInput(e.target.value)}
                  placeholder={
                    actionTab === 'audit'
                      ? 'tuempresa.com (ej. mercadolibre.com)'
                      : 'Nicho, producto o mercado (ej. café de especialidad)'
                  }
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="none"
                  className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all ${
                  actionTab === 'audit'
                    ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25'
                    : 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-500/25'
                }`}
              >
                {isLoading ? (
                  <span>Auditando en tiempo real...</span>
                ) : (
                  <>
                    <span>{actionTab === 'audit' ? 'Auditar Dominio' : 'Analizar Mercado'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Ejemplos dinámicos */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium">Sugerencias:</span>
              {actionTab === 'audit' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDualInput('uniandes.edu.co');
                      handleAudit('uniandes.edu.co');
                    }}
                    className="hover:text-emerald-400 underline font-mono transition"
                  >
                    uniandes.edu.co
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDualInput('mercadolibre.com');
                      handleAudit('mercadolibre.com');
                    }}
                    className="hover:text-emerald-400 underline font-mono transition"
                  >
                    mercadolibre.com
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDualInput('google.com');
                      handleAudit('google.com');
                    }}
                    className="hover:text-emerald-400 underline font-mono transition"
                  >
                    google.com
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDualInput('Moda sostenible colombiana');
                      router.push('/tools/ask-the-public?query=Moda%20sostenible%20colombiana');
                    }}
                    className="hover:text-cyan-400 underline transition"
                  >
                    Moda sostenible colombiana
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setDualInput('Café de especialidad');
                      router.push('/tools/ask-the-public?query=Café%20de%20especialidad');
                    }}
                    className="hover:text-cyan-400 underline transition"
                  >
                    Café de especialidad
                  </button>
                </>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3 text-left">
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
                  <p className="font-semibold">Atención requerida</p>
                  <p className="text-rose-300/90 text-xs mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================== */}
        {/* B. SECCIÓN: LOS 3 PILARES DE MIPORTAL */}
        {/* ========================================================== */}
        <section className="print:hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
              Arquitectura de Solución
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
              Los 3 Pilares Fundamentales de MiPortal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Un conjunto unificado de herramientas para validar, construir y blindar cualquier iniciativa comercial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Pilar 1: Market & Search */}
            <div className="group relative rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-cyan-950/30 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Radar className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Pilar 1 • Inteligencia
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Inteligencia de Mercado & Escucha Social
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed mt-2.5">
                    Mapeo de preguntas de Google en ruedas radiales interactivas, análisis de arquetipos de
                    moda/consumo, benchmarking del triángulo competitivo e informes académicos en PDF listos para
                    entregar.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Ruedas Radiales SVG
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Triángulo Competitivo
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Reporte Académico PDF
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60">
                <Link
                  href="/tools/ask-the-public"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:text-cyan-300 transition"
                >
                  <span>Explorar Analizador</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Pilar 2: Bio & Sites */}
            <div className="group relative rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-emerald-950/30 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-110">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Pilar 2 • Presencia
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Presencia Comercial & Bio Sites
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed mt-2.5">
                    Creador de páginas de enlaces y venta de servicios en tiempo real con 5 temas editoriales,
                    monetización directa y visualización pública ultrarrápida en <code className="text-emerald-400 font-mono text-xs">/p/[slug]</code>.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    5 Temas Editoriales
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Monetización de Servicios
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Insignia DeliverabilityGuard
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60">
                <Link
                  href="/sites/builder"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition"
                >
                  <span>Crear mi Bio Site</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Pilar 3: DeliverabilityGuard Core */}
            <div className="group relative rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-indigo-950/30 hover:-translate-y-1">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                    Pilar 3 • Seguridad
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Ciberseguridad & Entregabilidad DNS
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300/80 leading-relaxed mt-2.5">
                    Auditoría autoritativa de registros SPF, DKIM, DMARC y BIMI, verificación TLS/STARTTLS y monitoreo de
                    listas negras (DNSBL) para blindar la reputación de tu correo corporativo.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Validación RFC 2024+
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Listas Negras DNSBL
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-950 border border-slate-800 text-slate-300">
                    Asistente Fix 1-Clic
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/60">
                <a
                  href="#quick-audit"
                  onClick={focusAuditInput}
                  className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition"
                >
                  <span>Probar Auditor DNS</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* C. SECCIÓN INTERACTIVA: EL AUDITOR RÁPIDO EN VIVO */}
        {/* ========================================================== */}
        <section id="quick-audit" className="scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-8 print:hidden">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
              Motor en Tiempo Real
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Auditor Rápido de Dominio & Entregabilidad
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
              Sin intermediarios ni caché: resolución autoritativa directa contra servidores DNS raíz y RBLs globales.
            </p>
          </div>

          {/* Formulario Rápido de Auditoría si no hay reporte activo */}
          {!report && (
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl flex flex-col items-center text-center max-w-3xl mx-auto print:hidden">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Ingresa tu dominio para obtener el diagnóstico completo
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6">
                Evaluaremos en segundos tus políticas SPF, selectores DKIM, directivas DMARC y reputación en listas negras.
              </p>
              <button
                type="button"
                onClick={focusAuditInput}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
              >
                <span>Auditar Dominio Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Resultados Dinámicos del Reporte */}
          {report && (
            <div id="audit-results-view">
              {/* Reporte Estilizado Listo para Impresión / Descarga PDF */}
              <PrintableAuditReport report={report} />

              {/* Vista Interactiva Web (Oculta en PDF de impresión) */}
              <div className="flex flex-col gap-10 animate-fade-in print:hidden">
                {/* Score & Summary Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
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

                      {/* Acciones del Dominio: Exportar PDF y Guardar */}
                      <div className="pt-2 flex flex-wrap items-center gap-3">
                        {/* Botón Exportar Reporte PDF */}
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
                          title="Descargar o imprimir reporte técnico en formato PDF"
                        >
                          <FileDown className="w-4 h-4 text-emerald-400" />
                          <span>Exportar Reporte PDF</span>
                        </button>

                        {/* Botón Guardar dominio para monitoreo */}
                        {user && (
                          <button
                            type="button"
                            onClick={handleSaveDomain}
                            disabled={isSavingDomain}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition active:scale-[0.98] disabled:opacity-50"
                          >
                            {isSavingDomain ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                <span>Guardando...</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3.5 h-3.5 text-emerald-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                                  />
                                </svg>
                                <span>Guardar dominio</span>
                              </>
                            )}
                          </button>
                        )}

                        {saveDomainFeedback && (
                          <span className="text-xs font-medium text-emerald-400 animate-fade-in flex items-center gap-1">
                            {saveDomainFeedback}
                          </span>
                        )}
                      </div>
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

                {/* Banner Destacado de Resolución Asistida / Monetización Bold */}
                {(report.issues.length > 0 ||
                  !report.dmarc.isValid ||
                  report.dmarc.policy === 'none' ||
                  !report.spf.isValid ||
                  report.spf.errors.length > 0 ||
                  report.blacklists.listed > 0 ||
                  report.summary.criticalCount > 0 ||
                  report.summary.warningCount > 0 ||
                  report.status !== 'EXCELLENT') && (
                  <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border-2 border-emerald-500/40 shadow-2xl shadow-emerald-950/50 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
                    <div className="flex items-start sm:items-center gap-4 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Resolución Asistida DeliverabilityGuard
                          </span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                            Fallas Detectadas en {report.domain}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          Blindaje y Reparación de Entregabilidad en 24h
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                          Corregimos tus registros SPF/DMARC/BIMI para evitar que tus correos y cotizaciones caigan a spam.
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 w-full md:w-auto relative z-10 flex flex-col items-center md:items-end gap-1.5">
                      <a
                        href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto px-6 py-3.5 rounded-xl text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 cursor-pointer group"
                      >
                        <span>Contratar Blindaje — $150.000 COP</span>
                        <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                      <span className="text-[10px] font-mono text-slate-400 text-center md:text-right">
                        Pago 100% seguro con tarjeta o PSE vía Bold Checkout Oficial
                      </span>
                    </div>
                  </div>
                )}

                {/* Asistente de Corrección Inmediata (Doctor de Entregabilidad) */}
                {(!report.spf.isValid || !report.dmarc.isValid || report.dmarc.policy === 'none' || report.spf.errors.length > 0) && (
                  <DnsFixAssistant
                    domain={report.domain}
                    hasSpf={report.spf.isValid && report.spf.errors.length === 0}
                    hasDmarc={report.dmarc.isValid && report.dmarc.policy !== 'none' && report.dmarc.errors.length === 0}
                    userEmail={user?.email}
                    onAuditUpdate={(newReport) => setReport(newReport)}
                    fingerprint={report.fingerprint}
                  />
                )}

                {/* Smart Provider Fingerprint Banner */}
                {report.fingerprint && (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                              Fingerprint DNS Inteligente
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-100 flex flex-wrap items-center gap-2 mt-1">
                            <span>Infraestructura Detectada:</span>
                            <span className="text-emerald-400 font-extrabold">{report.fingerprint.emailProvider}</span>
                            <span className="text-slate-500 font-light">+</span>
                            <span className="text-cyan-400 font-extrabold">{report.fingerprint.dnsHost}</span>
                          </h3>
                        </div>
                      </div>

                      {/* Pasarelas Transaccionales Detectadas */}
                      {report.fingerprint.transactionalServices.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-slate-400 font-medium">Pasarelas en SPF:</span>
                          {report.fingerprint.transactionalServices.map((service) => (
                            <span
                              key={service}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25 flex items-center gap-1.5"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contextual Technical Recommendations */}
                    {report.fingerprint.contextualTips.length > 0 && (
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                        {report.fingerprint.contextualTips.map((tip, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
                          >
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Inbox Placement Simulator (Simulador de Ubicación de Bandeja) */}
                <InboxPlacementSimulator report={report} />

                {/* Pilares Fundamentales de Autenticación */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Pilares Fundamentales de Autenticación</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

                    {/* 6. DNSBL BLACKLIST */}
                    <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold tracking-wider text-slate-400">
                          DNSBL RBL
                        </span>
                        {report.blacklists.listed === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Limpio
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            {report.blacklists.listed} Listado
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">Listas Negras</p>
                        <p className="text-xs text-slate-400 mt-0.5 font-mono truncate" title={report.blacklists.ip}>
                          IP: {report.blacklists.ip}
                        </p>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {report.blacklists.details.length} listas consultadas
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico Detallado de Listas Negras (DNSBL / RBL) */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          report.blacklists.listed === 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          Diagnóstico de Listas Negras (DNSBL / RBL)
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                              report.blacklists.listed === 0
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {report.blacklists.listed === 0
                              ? 'Sin Reportes Activos'
                              : `${report.blacklists.listed} Reporte(s)`}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          IP del Servidor de Correo:{' '}
                          <span className="font-mono text-slate-200 font-bold">{report.blacklists.ip}</span>
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      {report.blacklists.checked} listas auditadas en tiempo real
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {report.blacklists.details.map((bl) => (
                      <div
                        key={bl.provider}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition ${
                          bl.listed
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-200">{bl.provider}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              bl.listed
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {bl.listed ? 'LISTADO' : 'LIMPIO'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {bl.listed ? `Respuesta: ${bl.returnCode}` : 'Sin reportes en esta lista'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cifrado en Tránsito (STARTTLS & Certificados SSL/TLS) */}
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          report.tls.supported && report.tls.certValid
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : report.tls.supported
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                          Cifrado en Tránsito (STARTTLS & SSL/TLS)
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border ${
                              report.tls.supported && report.tls.certValid
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : report.tls.supported
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {report.tls.supported
                              ? `STARTTLS Activo (${report.tls.version || 'TLSv1.2+'})`
                              : 'Sin STARTTLS'}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Protección contra espionaje y ataques Man-in-the-Middle (MitM) en el servidor de correo.
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-mono">
                      Protocolo de Encriptación de Enrutamiento
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {/* 1. Host MX */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Servidor MX Evaluado</span>
                      <span className="text-xs font-mono font-bold text-slate-200 truncate" title={report.tls.mxHost}>
                        {report.tls.mxHost}
                      </span>
                      <span className="text-[10px] text-slate-500">Host de recepción principal</span>
                    </div>

                    {/* 2. Protocolo */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Protocolo Negociado</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {report.tls.version || (report.tls.supported ? 'TLSv1.2+' : 'Sin Cifrado')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {report.tls.supported ? 'Cifrado robusto en tránsito' : 'Texto plano vulnerable'}
                      </span>
                    </div>

                    {/* 3. Emisor Certificado */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Autoridad Certificadora</span>
                      <span className="text-xs font-semibold text-slate-200 truncate" title={report.tls.issuer || 'N/A'}>
                        {report.tls.issuer || (report.tls.supported ? 'CA Reconocida' : 'N/A')}
                      </span>
                      <span className="text-[10px] text-slate-500">Entidad emisora del certificado</span>
                    </div>

                    {/* 4. Validez y Expiración */}
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Vigencia del Certificado</span>
                      <span className={`text-xs font-bold ${
                        report.tls.certValid ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {report.tls.expiresInDays !== undefined
                          ? `${report.tls.expiresInDays} días restantes`
                          : report.tls.certValid
                          ? 'Certificado Válido'
                          : 'No validado'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {report.tls.certValid ? 'Certificado vigente' : 'Requiere revisión'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico Detallado de Problemas */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <span>Diagnóstico Detallado y Correcciones Recomendadas</span>
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
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
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

                      {/* Solución Asistida para resolver todos los hallazgos */}
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2 print:hidden shadow-lg">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              ¿Prefieres que un especialista aplique estas correcciones?
                            </h4>
                            <p className="text-xs text-slate-300 mt-0.5">
                              Blindaje completo de registros SPF, DMARC y BIMI en menos de 24 horas.
                            </p>
                          </div>
                        </div>
                        <a
                          href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 shrink-0"
                        >
                          <span>Contratar Blindaje — $150.000 COP</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================== */}
        {/* D. BARRA DE MÉTRICAS Y CONFIANZA ENTERPRISE */}
        {/* ========================================================== */}
        <section className="print:hidden">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative z-10 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
              <div className="flex flex-col items-center gap-2 pt-4 sm:pt-0">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                  100%
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 uppercase tracking-wider">
                  Directivas RFC Validadas
                </span>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Inspección nativa de RFC 7208 (SPF), RFC 7489 (DMARC), RFC 6376 (DKIM) y BIMI sin intermediarios.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 pt-6 sm:pt-0">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                  5 Dimensiones
                </span>
                <span className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Inteligencia de Mercado
                </span>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Preguntas de intención, preposiciones, comparativas, arquetipos de consumo y benchmarking competitivo.
                </p>
              </div>

              <div className="flex flex-col items-center gap-2 pt-6 sm:pt-0">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                  5 Temas
                </span>
                <span className="text-xs sm:text-sm font-bold text-indigo-400 uppercase tracking-wider">
                  Diseño de Alta Conversión
                </span>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Bio Sites optimizados para creadores, venta directa de servicios e insignia oficial de ciberseguridad.
                </p>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800/80 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-slate-200">
                  Plataforma integral verificada y optimizada para creadores, agencias y consultores
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* Soluciones por Industria de la Suite */}
        {/* ========================================================== */}
        <MiPortalSuiteShowcase onSelectAuditAction={focusAuditInput} />
      </main>

      {/* ========================================================== */}
      {/* E. FOOTER UNIFICADO MATRIZ */}
      {/* ========================================================== */}
      <Footer onSelectAuditAction={focusAuditInput} />
    </div>
  );
}
