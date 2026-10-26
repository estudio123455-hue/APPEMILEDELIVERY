'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Globe,
  Sparkles,
  ExternalLink,
  Download,
  Copy,
  Check,
  TrendingUp,
  HelpCircle,
  MessageSquareQuote,
  ShieldAlert,
  Users,
  Filter,
  BarChart3,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Layers,
  Flame,
  Radio,
  SearchCode,
  Share2,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  MarketAnalyzeResponse,
  DigitalEcosystem,
  AnswerThePublicCategory,
  TrendAnalysis,
  SocialMonitoring,
  KeywordDimension,
  KeywordItem,
} from '@/types/market-analyzer';

export default function MarketAnalyzerClient() {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [data, setData] = useState<MarketAnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'questions' | 'trends' | 'sentiment'>('questions');
  const [selectedDimensionFilter, setSelectedDimensionFilter] = useState<string>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2500);
  };

  const handleAnalyze = async (targetUrl?: string) => {
    const rawUrl = (targetUrl || urlInput).trim();
    if (!rawUrl) {
      setErrorMsg('Por favor ingresa una dirección URL o enlace web.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/market-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rawUrl }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'No se pudo completar el análisis del mercado.');
      }

      setData(result);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Error de conexión al escanear la URL.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!data) return;
    const rows: string[] = ['"Dimensión","Palabra Clave","Intención de Búsqueda","Estimación de Volumen"'];

    data.keywordMatrix.forEach((dim) => {
      dim.keywords.forEach((kw) => {
        rows.push(`"${dim.dimension}","${kw.term}","${kw.intent}","${kw.searchVolumeHint}"`);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(rows.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `matriz-keywords-${data.ecosystem.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyFullMatrix = () => {
    if (!data) return;
    const lines: string[] = [
      `# MATRIZ DE PALABRAS CLAVE — ${data.ecosystem.brandName.toUpperCase()}`,
      `# Sector: ${data.ecosystem.category}`,
      `# Generado: ${new Date(data.generatedAt).toLocaleDateString()}`,
      '',
    ];

    data.keywordMatrix.forEach((dim) => {
      lines.push(`## Dimensión: ${dim.dimension}`);
      dim.keywords.forEach((kw) => {
        lines.push(`- ${kw.term} [Intención: ${kw.intent} | Volumen: ${kw.searchVolumeHint}]`);
      });
      lines.push('');
    });

    handleCopy(lines.join('\n'), 'matriz-completa');
  };

  const sampleUrls = [
    { label: 'DeliverabilityGuard', url: 'https://deliverabilityguard.miportal.me' },
    { label: 'Stripe', url: 'https://stripe.com' },
    { label: 'Canal YouTube', url: 'https://youtube.com/@google' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ========================================================= */}
      {/* HERO SECTION & SCANNER INPUT                              */}
      {/* ========================================================= */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inteligencia de Mercado & Social Listening Universal</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Analizador de Mercado &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Escucha Social
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Pega la URL de tu página web, canal de YouTube o perfil de competidor para extraer al instante su presencia digital, preguntas de clientes y sentimiento.
        </p>

        {/* Input Bar */}
        <div className="mt-8 relative max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2.5 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/70 transition-all"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3">
              <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ejemplo.com o https://youtube.com/@canal"
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Escaneando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Escanear Mercado & Redes</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Example Pills */}
          <div className="flex items-center justify-center gap-2 mt-3.5 text-xs text-slate-400 flex-wrap">
            <span className="text-slate-500">Ejemplos rápidos:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setUrlInput(s.url);
                  handleAnalyze(s.url);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/50 transition text-slate-300 text-[11px]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mt-5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-2.5 justify-center">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SKELETON LOADER ANIMADO                                   */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-8 animate-pulse">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="h-6 w-1/3 bg-slate-800 rounded-md" />
            <div className="h-4 w-2/3 bg-slate-800/60 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="h-20 bg-slate-800/40 rounded-xl" />
              <div className="h-20 bg-slate-800/40 rounded-xl" />
              <div className="h-20 bg-slate-800/40 rounded-xl" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="h-6 w-1/4 bg-slate-800 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-40 bg-slate-800/40 rounded-xl" />
              <div className="h-40 bg-slate-800/40 rounded-xl" />
              <div className="h-40 bg-slate-800/40 rounded-xl" />
              <div className="h-40 bg-slate-800/40 rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESULTADOS DEL ANÁLISIS                                   */}
      {/* ========================================================= */}
      {data && !isLoading && (
        <div className="space-y-12">
          {/* ========================================================= */}
          {/* BLOQUE 1: ECOSISTEMA DIGITAL DETECTADO                    */}
          {/* ========================================================= */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {data.ecosystem.brandName}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {data.ecosystem.category}
                  </span>
                  {data.ecosystem.isSocialProfile && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      Canal / Perfil Social
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-mono">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <a
                    href={data.ecosystem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>{data.ecosystem.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {/* Botón de auditoría DNS enlazado a DeliverabilityGuard */}
              <Link
                href={data.ecosystem.domainHealth.auditUrl}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition flex items-center gap-2 shadow-sm shrink-0"
              >
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Auditar Entregabilidad ({data.ecosystem.domain})</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

            {/* Descripción y Presencia */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
              {/* Resumen Comercial */}
              <div className="lg:col-span-2 space-y-4">
                <div className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-emerald-400" />
                  <span>Propuesta de Valor & Metadatos Extraídos</span>
                </div>
                <blockquote className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-sm text-slate-300 leading-relaxed italic">
                  "{data.ecosystem.description}"
                </blockquote>

                {/* Redes Sociales Encontradas */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Canales y Redes Oficiales Encontradas ({data.ecosystem.socialLinks.length}):</span>
                  </div>

                  {data.ecosystem.socialLinks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {data.ecosystem.socialLinks.map((social) => (
                        <a
                          key={social.url}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/70 text-xs text-slate-300 hover:text-white transition flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-medium">{social.platform}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No se detectaron enlaces sociales directos en la página principal.
                    </p>
                  )}
                </div>
              </div>

              {/* Tarjeta de Salud del Dominio (DeliverabilityGuard) */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Salud Técnica
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      DeliverabilityGuard
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1.5 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>{data.ecosystem.domain}</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {data.ecosystem.domainHealth.notes}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">¿Envías correos desde aquí?</span>
                  <Link
                    href={data.ecosystem.domainHealth.auditUrl}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                  >
                    <span>Auditar DMARC</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================================= */}
          {/* BLOQUE 2: RADAR DE ESCUCHA SOCIAL                         */}
          {/* ========================================================= */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Radar de Escucha Social Activa</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Preguntas de la Audiencia, Tendencias y Sentimiento
                </h3>
              </div>

              {/* Selector de pestañas */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'questions'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Preguntas (FAQ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('trends')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'trends'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Tendencias</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('sentiment')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    activeTab === 'sentiment'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Sentimiento & Filtros</span>
                </button>
              </div>
            </div>

            {/* PESTAÑA 1: PREGUNTAS FRECUENTES (AnswerThePublic) */}
            {activeTab === 'questions' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Mapeo de intenciones basado en la metodología AnswerThePublic (Qué, Cómo, Por qué y Cuándo).
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const allQueries = data.questions
                        .flatMap((c) => c.questions.map((q) => `${c.category}: ${q.query}`))
                        .join('\n');
                      handleCopy(allQueries, 'todas-preguntas');
                    }}
                    className="text-xs text-slate-300 hover:text-emerald-400 flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg transition"
                  >
                    {copiedText === 'todas-preguntas' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">¡Copiadas!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Todas las Preguntas</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.questions.map((cat) => (
                    <div
                      key={cat.category}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-black text-emerald-400 tracking-tight">
                            {cat.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {cat.questions.length} consultas
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mb-1">{cat.title}</h4>
                        <p className="text-[11px] text-slate-500 mb-3">{cat.description}</p>

                        <div className="space-y-2">
                          {cat.questions.map((q) => (
                            <div
                              key={q.id}
                              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group relative"
                            >
                              <p className="text-xs text-slate-200 font-medium leading-snug">
                                {q.query}
                              </p>
                              <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[10px]">
                                <span className="text-slate-400 font-mono">{q.intent}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-bold ${
                                    q.volumeEstimate === 'Alta'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : q.volumeEstimate === 'Tendencia'
                                      ? 'bg-amber-500/20 text-amber-300'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {q.volumeEstimate}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: TENDENCIAS Y GOOGLE SEARCH */}
            {activeTab === 'trends' && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Google Trends Marca */}
                  <a
                    href={data.trends.googleTrendsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                        <span>Google Trends: {data.trends.brandQuery}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Historial de interés y volumen de búsquedas para la marca en los últimos 12 meses.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 mt-4 inline-flex items-center gap-1">
                      Abrir reporte en vivo →
                    </span>
                  </a>

                  {/* Google Trends Categoría */}
                  <a
                    href={data.trends.googleTrendsCategoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 hover:border-cyan-500/50 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                        <Flame className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                        <span>Tendencia del Sector: {data.ecosystem.category}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Crecimiento de la demanda global y oportunidades emergentes en la industria.
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-cyan-400 mt-4 inline-flex items-center gap-1">
                      Explorar sector →
                    </span>
                  </a>

                  {/* Google Alerts */}
                  <a
                    href={data.trends.googleAlertsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
                        <Radio className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition flex items-center gap-1.5">
                        <span>Configurar Alerta Google</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Recibe correos automáticos cada vez que medios o blogs mencionen "{data.trends.brandQuery}".
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-400 mt-4 inline-flex items-center gap-1">
                      Crear alerta oficial →
                    </span>
                  </a>
                </div>

                {/* Temas Emergentes */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Consultas Relacionadas y Crecimiento Estimado
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.trends.topics.map((t) => (
                      <div
                        key={t.name}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3"
                      >
                        <div className="truncate">
                          <p className="text-xs text-slate-200 font-semibold truncate">{t.name}</p>
                          <span className="text-[10px] text-slate-400">{t.type}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 font-mono shrink-0">
                          {t.growth}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 3: SENTIMIENTO & FILTROS SOCIALES */}
            {activeTab === 'sentiment' && (
              <div className="space-y-6 animate-fade-in">
                {/* Medidor de Sentimiento */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Índice Heurístico de Sentimiento
                    </span>
                    <h4 className="text-3xl font-black text-white flex items-center gap-3 justify-center md:justify-start">
                      <span>{data.monitoring.sentimentScore} / 100</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {data.monitoring.sentimentLabel}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md">
                      Basado en menciones públicas, ratio de consultas informativas frente a quejas de soporte.
                    </p>
                  </div>

                  {/* Barra de progreso desglosada */}
                  <div className="w-full md:w-80 space-y-2">
                    <div className="h-3 w-full rounded-full bg-slate-800 flex overflow-hidden">
                      <div
                        style={{ width: `${data.monitoring.sentimentBreakdown.positive}%` }}
                        className="bg-emerald-500 transition-all"
                        title={`Positivo: ${data.monitoring.sentimentBreakdown.positive}%`}
                      />
                      <div
                        style={{ width: `${data.monitoring.sentimentBreakdown.neutral}%` }}
                        className="bg-cyan-500 transition-all"
                        title={`Neutral: ${data.monitoring.sentimentBreakdown.neutral}%`}
                      />
                      <div
                        style={{ width: `${data.monitoring.sentimentBreakdown.negative}%` }}
                        className="bg-rose-500 transition-all"
                        title={`Negativo: ${data.monitoring.sentimentBreakdown.negative}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span className="text-emerald-400">
                        ● {data.monitoring.sentimentBreakdown.positive}% Positivo
                      </span>
                      <span className="text-cyan-400">
                        ● {data.monitoring.sentimentBreakdown.neutral}% Neutral
                      </span>
                      <span className="text-rose-400">
                        ● {data.monitoring.sentimentBreakdown.negative}% Negativo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filtros de Escucha Social (Quejas & Leads) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Filtro 1: Detección de Quejas */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-rose-900/40 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Filtro de Detección de Quejas (Sentimiento Negativo)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {data.monitoring.complaintFilter.description}
                      </p>
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-rose-300 select-all break-all">
                        {data.monitoring.complaintFilter.query}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                      <a
                        href={data.monitoring.complaintFilter.xSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Buscar en X (Twitter)</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <a
                        href={data.monitoring.complaintFilter.redditSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Buscar en Reddit</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <a
                        href={data.monitoring.complaintFilter.googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Google Noticias</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>

                  {/* Filtro 2: Captación de Leads */}
                  <div className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-900/40 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Users className="w-4 h-4" />
                        <span>Filtro de Captación de Clientes (Leads & Oportunidades)</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {data.monitoring.leadCaptureFilter.description}
                      </p>
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-300 select-all break-all">
                        {data.monitoring.leadCaptureFilter.query}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                      <a
                        href={data.monitoring.leadCaptureFilter.xSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Ver Oportunidades en X</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <a
                        href={data.monitoring.leadCaptureFilter.redditSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Recomendaciones Reddit</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                      <a
                        href={data.monitoring.leadCaptureFilter.googleSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-slate-800 transition inline-flex items-center gap-1.5"
                      >
                        <span>Búsquedas Google</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ========================================================= */}
          {/* BLOQUE 3: MATRIZ ESTRATÉGICA DE PALABRAS CLAVE            */}
          {/* ========================================================= */}
          <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  <SearchCode className="w-3.5 h-3.5" />
                  <span>Posicionamiento & Contenidos</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Matriz Estratégica de Palabras Clave (5 Dimensiones)
                </h3>
              </div>

              {/* Botones de Acción: CSV & Copiar */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyFullMatrix}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  {copiedText === 'matriz-completa' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Matriz</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={downloadCSV}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar CSV</span>
                </button>
              </div>
            </div>

            {/* Filtros por Dimensión */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Filtrar:</span>
              </span>

              <button
                type="button"
                onClick={() => setSelectedDimensionFilter('all')}
                className={`px-3 py-1 rounded-lg transition font-medium ${
                  selectedDimensionFilter === 'all'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Todas las Dimensiones (25)
              </button>

              {data.keywordMatrix.map((dim) => (
                <button
                  key={dim.id}
                  type="button"
                  onClick={() => setSelectedDimensionFilter(dim.id)}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    selectedDimensionFilter === dim.id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  {dim.dimension}
                </button>
              ))}
            </div>

            {/* Grid de Dimensiones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.keywordMatrix
                .filter(
                  (dim) =>
                    selectedDimensionFilter === 'all' || selectedDimensionFilter === dim.id
                )
                .map((dim) => (
                  <div
                    key={dim.id}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          {dim.dimension}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {dim.keywords.length} términos
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-3 leading-snug">
                        {dim.description}
                      </p>

                      <div className="divide-y divide-slate-800/70 border-t border-b border-slate-800/70">
                        {dim.keywords.map((kw) => (
                          <div
                            key={kw.term}
                            className="py-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="font-mono text-slate-200 select-all truncate">
                              {kw.term}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {kw.intent}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {kw.searchVolumeHint}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const kwList = dim.keywords.map((k) => k.term).join('\n');
                        handleCopy(kwList, `dim-${dim.id}`);
                      }}
                      className="w-full text-center py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center justify-center gap-1"
                    >
                      {copiedText === `dim-${dim.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Términos copiados</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar términos de {dim.dimension}</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </section>
        </div>
      )}

      {/* ========================================================= */}
      {/* ESTADO INICIAL / VALOR DEL SISTEMA                        */}
      {/* ========================================================= */}
      {!data && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Preguntas AnswerThePublic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mapea automáticamente las dudas que los prospectos escriben en Google: Qué, Cómo, Por qué y Cuándo comprar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Tendencias en Tiempo Real</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Descubre qué temas y búsquedas están creciendo respecto a tu competencia con accesos directos a Google Trends.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Captación de Leads Sociales</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Filtros avanzados de búsqueda para detectar usuarios en X y Reddit que piden recomendaciones de tu sector.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
