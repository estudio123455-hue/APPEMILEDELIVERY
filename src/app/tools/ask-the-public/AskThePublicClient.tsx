'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  RefreshCw,
  Globe,
  Radio,
  Share2,
  ShieldAlert,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  CircleDot,
  LayoutGrid,
  ChevronRight,
  FileText,
  X,
  Printer,
  Sparkle,
} from 'lucide-react';
import type { AskPublicResponse, AskPublicCategories } from '@/types/ask-public';
import type { MarketReportData } from '@/types/market-report';
import PrintableMarketReport from '@/components/market/PrintableMarketReport';

const CATEGORY_CONFIG: Record<
  keyof AskPublicCategories,
  { label: string; color: string; badgeBg: string; angle: number }
> = {
  que: { label: 'Qué', color: '#10b981', badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', angle: 0 },
  como: { label: 'Cómo', color: '#06b6d4', badgeBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', angle: 40 },
  por_que: { label: 'Por qué', color: '#f59e0b', badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', angle: 80 },
  donde: { label: 'Dónde', color: '#8b5cf6', badgeBg: 'bg-violet-500/15 text-violet-400 border-violet-500/30', angle: 120 },
  cuando: { label: 'Cuándo', color: '#ec4899', badgeBg: 'bg-pink-500/15 text-pink-400 border-pink-500/30', angle: 160 },
  cual: { label: 'Cuál', color: '#3b82f6', badgeBg: 'bg-blue-500/15 text-blue-400 border-blue-500/30', angle: 200 },
  quien: { label: 'Quién', color: '#14b8a6', badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30', angle: 240 },
  puede: { label: 'Puede', color: '#eab308', badgeBg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30', angle: 280 },
  son: { label: 'Son', color: '#f97316', badgeBg: 'bg-orange-500/15 text-orange-400 border-orange-500/30', angle: 320 },
};

export default function AskThePublicClient() {
  const [queryInput, setQueryInput] = useState('');
  const [lang, setLang] = useState('es');
  const [country, setCountry] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<AskPublicResponse | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'wheel'>('cards');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Estados para el Generador de Informe Académico con IA
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<MarketReportData | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSearch = async (overrideQuery?: string) => {
    const q = (overrideQuery || queryInput).trim();
    if (!q) {
      setErrorMsg('Por favor ingresa un término de búsqueda o enlace web.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setReportData(null);
    setShowReportModal(false);

    try {
      const res = await fetch('/api/ask-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, lang, country }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudieron obtener preguntas.');
      }

      setResult(data);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al conectar con el servicio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!result) return;
    setIsGeneratingReport(true);
    setReportError(null);

    try {
      const res = await fetch('/api/market-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: result.searchTerm,
          detectedTitle: result.detectedTitle,
          isUrl: result.isUrl,
          categories: result.categories,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.report) {
        throw new Error(data.error || 'No se pudo generar el informe académico.');
      }

      setReportData(data.report);
      setShowReportModal(true);
    } catch (err: unknown) {
      setReportError(err instanceof Error ? err.message : 'Error al generar el informe con IA.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadCSV = () => {
    if (!result) return;
    const lines = ['"Modificador","Pregunta"'];
    (Object.keys(result.categories) as Array<keyof AskPublicCategories>).forEach((cat) => {
      result.categories[cat].forEach((q) => {
        lines.push(`"${CATEGORY_CONFIG[cat]?.label || cat}","${q.replace(/"/g, '""')}"`);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.href = csvContent;
    link.download = `preguntas-${result.searchTerm.replace(/[^a-z0-9]/gi, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyAllQuestions = () => {
    if (!result) return;
    const lines: string[] = [
      `# PREGUNTAS DEL PÚBLICO: ${result.searchTerm.toUpperCase()}`,
      `# Total: ${result.totalQuestions} consultas`,
      '',
    ];

    (Object.keys(result.categories) as Array<keyof AskPublicCategories>).forEach((cat) => {
      lines.push(`## ${CATEGORY_CONFIG[cat]?.label || cat}:`);
      result.categories[cat].forEach((q) => lines.push(`- ${q}`));
      lines.push('');
    });

    handleCopy(lines.join('\n'), 'todas');
  };

  const sampleSearches = [
    { label: 'DMARC', query: 'dmarc' },
    { label: 'Google Workspace', query: 'google workspace' },
    { label: 'DeliverabilityGuard', query: 'https://deliverabilityguard.miportal.me' },
    { label: 'Canal Google', query: 'https://youtube.com/@google' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ========================================================= */}
      {/* HERO & SEARCH ENGINE BAR                                  */}
      {/* ========================================================= */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4 tracking-wide shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Motor de Búsqueda & Escucha de Audiencia en Tiempo Real</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Descubre lo que la gente pregunta con{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            AnswerThePublic
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Escribe una palabra clave o pega una dirección web (incluyendo canales de YouTube) para extraer al instante todas las preguntas y dudas que busca tu audiencia.
        </p>

        {/* Input Bar Principal */}
        <div className="mt-8 max-w-3xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl focus-within:border-emerald-500/70 transition-all"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 min-w-0">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ej. 'dmarc', 'resend', 'https://miweb.com' o canal de YouTube..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Selectores de País e Idioma */}
            <div className="flex items-center gap-1.5 px-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-slate-950 text-xs text-slate-300 rounded-lg px-2.5 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500"
                title="País de búsqueda"
              >
                <option value="es">🇪🇸 España</option>
                <option value="mx">🇲🇽 México</option>
                <option value="co">🇨🇴 Colombia</option>
                <option value="ar">🇦🇷 Argentina</option>
                <option value="us">🇺🇸 Estados Unidos</option>
              </select>

              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-slate-950 text-xs text-slate-300 rounded-lg px-2 py-2 border border-slate-800 focus:outline-none focus:border-emerald-500"
                title="Idioma de resultados"
              >
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Obtener Preguntas</span>
                </>
              )}
            </button>
          </form>

          {/* Sugerencias Rápidas */}
          <div className="flex items-center justify-center gap-2 mt-3.5 text-xs text-slate-400 flex-wrap">
            <span className="text-slate-500">Pruebas rápidas:</span>
            {sampleSearches.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setQueryInput(s.query);
                  handleSearch(s.query);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700 hover:text-white border border-slate-700/50 transition text-slate-300 text-[11px]"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-5 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-2.5 justify-center max-w-xl mx-auto">
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SKELETON LOADER ANIMADO                                   */}
      {/* ========================================================= */}
      {isLoading && (
        <div className="space-y-6 animate-pulse max-w-5xl mx-auto">
          <div className="h-14 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
            <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
            <div className="h-48 bg-slate-900/60 rounded-2xl border border-slate-800" />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RESULTADOS EN VIVO                                        */}
      {/* ========================================================= */}
      {result && !isLoading && (
        <div className="space-y-8 animate-fade-in">
          {/* Barra de Resumen & Acciones */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Término Analizado:
                </span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  "{result.searchTerm}"
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {result.totalQuestions} Preguntas Encontradas
                </span>
              </div>

              {result.detectedTitle && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Título / Canal detectado: <strong className="text-slate-200">{result.detectedTitle}</strong></span>
                </p>
              )}
            </div>

            {/* Alternador de Vista (Tarjetas vs Rueda) y Exportación */}
            <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end flex-wrap">
              {/* Botón Destacado: Generador de Informe Académico con IA */}
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                title="Resuelve la actividad de 4 puntos del PDF oficial con formato académico formal para entrega"
              >
                {isGeneratingReport ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Redactando Informe con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Generar Informe Académico con IA (PDF)</span>
                  </>
                )}
              </button>

              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    viewMode === 'cards'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Tarjetas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('wheel')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    viewMode === 'wheel'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CircleDot className="w-3.5 h-3.5" />
                  <span>Rueda Visual</span>
                </button>
              </div>

              <button
                type="button"
                onClick={copyAllQuestions}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 hover:text-white transition flex items-center gap-1.5"
              >
                {copiedKey === 'todas' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Todo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={downloadCSV}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 border border-slate-700 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Banner de Estado de Generación de Informe */}
          {isGeneratingReport && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-semibold">
                  La IA está estructurando la actividad oficial del PDF de Escucha Social...
                </strong>
                <span>
                  Construyendo la matriz de 10 palabras clave, evidencias de los 3 objetivos, análisis táctico y dictamen de consultoría.
                </span>
              </div>
            </div>
          )}

          {/* Error en generación de informe */}
          {reportError && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between">
              <span>{reportError}</span>
              <button
                type="button"
                onClick={() => setReportError(null)}
                className="text-xs text-rose-400 hover:underline"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Banner de Conexión con DeliverabilityGuard si es dominio */}
          {result.analyzedDomain && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    ¿Este dominio envía correos corporativos? ({result.analyzedDomain})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Verifica si tiene DMARC, SPF, STARTTLS y listas negras para evitar que caiga en spam.
                  </p>
                </div>
              </div>

              <Link
                href={`/?domain=${encodeURIComponent(result.analyzedDomain)}`}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Auditar en DeliverabilityGuard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 1: VISTA DE RUEDA VISUAL (SIGNATURE ANSWERTHEPUBLIC)*/}
          {/* ========================================================= */}
          {viewMode === 'wheel' && (
            <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Rueda de Preguntas (Radial Wheel)
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Mapeo Circular de Intenciones de Búsqueda
                </h3>
              </div>

              {/* Rueda en Pantalla Grande / Mediana */}
              <div className="relative min-h-[620px] flex items-center justify-center p-4">
                {/* Nodo Central */}
                <div className="z-20 w-36 h-36 rounded-full bg-slate-950 border-4 border-emerald-500 shadow-2xl shadow-emerald-500/30 flex flex-col items-center justify-center text-center p-3 animate-pulse">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Búsqueda Raíz
                  </span>
                  <span className="text-sm font-extrabold text-white line-clamp-2 leading-tight">
                    {result.searchTerm}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    {result.totalQuestions} consultas
                  </span>
                </div>

                {/* Órbitas / Pétalos por Categoría en Cuadrantes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl z-10">
                  {(Object.keys(result.categories) as Array<keyof AskPublicCategories>).map((cat) => {
                    const conf = CATEGORY_CONFIG[cat];
                    const list = result.categories[cat];

                    return (
                      <div
                        key={cat}
                        className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition space-y-2.5 shadow-lg group"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider"
                            style={{
                              color: conf.color,
                              borderColor: `${conf.color}40`,
                              backgroundColor: `${conf.color}15`,
                            }}
                          >
                            {conf.label}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {list.length} preguntas
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          {list.slice(0, 4).map((q, idx) => (
                            <a
                              key={idx}
                              href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 text-[11px] text-slate-300 hover:text-white transition group/link relative"
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className="line-clamp-2 leading-snug">{q}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500 group-hover/link:text-emerald-400 shrink-0 mt-0.5" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VISTA 2: VISTA DE TARJETAS POR CATEGORÍA                  */}
          {/* ========================================================= */}
          {viewMode === 'cards' && (
            <div className="space-y-6">
              {/* Filtro por modificador */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-semibold mr-1">Filtrar:</span>
                <button
                  type="button"
                  onClick={() => setActiveCategoryFilter('all')}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    activeCategoryFilter === 'all'
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({result.totalQuestions})
                </button>

                {(Object.keys(result.categories) as Array<keyof AskPublicCategories>).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg transition font-medium ${
                      activeCategoryFilter === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {CATEGORY_CONFIG[cat].label} ({result.categories[cat].length})
                  </button>
                ))}
              </div>

              {/* Grid de Tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(Object.keys(result.categories) as Array<keyof AskPublicCategories>)
                  .filter((cat) => activeCategoryFilter === 'all' || activeCategoryFilter === cat)
                  .map((cat) => {
                    const conf = CATEGORY_CONFIG[cat];
                    const questions = result.categories[cat];

                    return (
                      <div
                        key={cat}
                        className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <span
                              className="text-sm font-black px-2.5 py-0.5 rounded-lg border uppercase tracking-wider"
                              style={{
                                color: conf.color,
                                borderColor: `${conf.color}40`,
                                backgroundColor: `${conf.color}15`,
                              }}
                            >
                              {conf.label}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {questions.length} preguntas
                            </span>
                          </div>

                          <div className="divide-y divide-slate-800/60 pt-1">
                            {questions.map((q, idx) => (
                              <div
                                key={idx}
                                className="py-2.5 flex items-start justify-between gap-2 group/item"
                              >
                                <span className="text-xs text-slate-200 select-all leading-snug">
                                  {q}
                                </span>

                                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover/item:opacity-100 transition">
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(q, `${cat}-${idx}`)}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                    title="Copiar pregunta"
                                  >
                                    {copiedKey === `${cat}-${idx}` ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(q)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400"
                                    title="Buscar en Google"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Botón copiar categoría completa */}
                        <button
                          type="button"
                          onClick={() => handleCopy(questions.join('\n'), `cat-${cat}`)}
                          className="w-full text-center py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition flex items-center justify-center gap-1.5"
                        >
                          {copiedKey === `cat-${cat}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-bold">Preguntas copiadas</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar {conf.label} ({questions.length})</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* BENEFICIOS & CASOS DE USO (ESTADO VACÍO)                  */}
      {/* ========================================================= */}
      {!result && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Preguntas del Consumidor Real</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Descubre las consultas no filtradas que los usuarios hacen directamente en los motores de búsqueda para crear contenidos que posicionen en primer lugar.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Escaneo de Enlaces & YouTube</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pega cualquier URL de producto, blog o canal de YouTube para extraer su temática y generar automáticamente preguntas asociadas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Informe Académico con IA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resuelve al instante la actividad formal de 4 puntos del PDF de Escucha Social con matriz de 10 keywords, evidencias y conclusiones listo para imprimir en PDF.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL / VISUALIZADOR DEL INFORME ACADÉMICO EN PDF        */}
      {/* ========================================================= */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto print:static print:bg-white print:overflow-visible">
          <div className="min-h-screen">
            <PrintableMarketReport
              report={reportData}
              onClose={() => setShowReportModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
