'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  ExternalLink,
  Download,
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  Lock,
  MessageCircle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import { createClient } from '@/utils/supabase/client';
import { isUserSuperAdmin } from '@/config/admin';
import type { User } from '@supabase/supabase-js';

export interface BatchDomainResult {
  domain: string;
  score: number;
  status: string;
  dmarcPolicy: string;
  dmarcValid: boolean;
  spfValid: boolean;
  dkimFound: boolean;
  mxValid: boolean;
  isBlacklisted: boolean;
  blacklistsCount: number;
  criticalCount: number;
  warningCount: number;
  topIssue: string;
  salesPitchWhatsApp: string;
  salesPitchLinkedIn: string;
}

const DEMO_DOMAINS = [
  'uniandes.edu.co',
  'bancolombia.com',
  'tiendasd1.com',
  'platzi.com',
  'mercadolibre.com.co',
  'segurosbolivar.com.co',
];

export default function AdminLeadsClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form states
  const [domainsInput, setDomainsInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [results, setResults] = useState<BatchDomainResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);

  // Verify Super Admin
  useEffect(() => {
    async function checkAuth() {
      setAuthLoading(true);
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      const authorized = isUserSuperAdmin(currentUser);
      setIsAdmin(authorized);
      setAuthLoading(false);
    }
    checkAuth();
  }, []);

  const inputDomainCount = useMemo(() => {
    return domainsInput
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0).length;
  }, [domainsInput]);

  const handleLoadDemo = () => {
    setDomainsInput(DEMO_DOMAINS.join('\n'));
    setErrorMsg(null);
  };

  const handleStartScan = async () => {
    setErrorMsg(null);
    const domainList = domainsInput
      .split('\n')
      .map((d) => d.trim().toLowerCase())
      .filter((d) => d.length > 0);

    if (domainList.length === 0) {
      setErrorMsg('Ingresa al menos 1 dominio para iniciar la prospección.');
      return;
    }

    if (domainList.length > 30) {
      setErrorMsg('El límite máximo por lote es de 30 dominios. Reduce la lista.');
      return;
    }

    setIsScanning(true);
    setScanProgress(`Iniciando escaneo DNS de ${domainList.length} dominios...`);

    try {
      const res = await fetch('/api/admin/batch-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: domainList }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al procesar el lote de dominios');
      }

      setResults(data.results || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al auditar lote.');
    } finally {
      setIsScanning(false);
      setScanProgress('');
    }
  };

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    } catch {
      alert('No se pudo copiar automáticamente. Por favor copia manualmente.');
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'Dominio',
      'Puntaje',
      'Estado',
      'Politica DMARC',
      'SPF Valido',
      'DKIM Configurado',
      'Incidencias Criticas',
      'En Lista Negra',
      'Oportunidad Servicio',
      'URL Auditoria',
    ];

    const rows = results.map((r) => [
      r.domain,
      r.score,
      r.status,
      r.dmarcPolicy,
      r.spfValid ? 'SI' : 'NO',
      r.dkimFound ? 'SI' : 'NO',
      r.criticalCount,
      r.isBlacklisted ? 'SI' : 'NO',
      r.score < 80 ? '$150.000 COP Blindaje' : 'Protegido',
      `https://www.miportal.me/audit/${r.domain}`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_deliverability_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch = item.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRiskOnly ? item.score < 75 || item.criticalCount > 0 : true;
      return matchesSearch && matchesRisk;
    });
  }, [results, searchTerm, filterRiskOnly]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const vulnerableCount = results.filter((r) => r.score < 75 || r.criticalCount > 0).length;
    const potentialCOP = vulnerableCount * 150000;
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length);
    return {
      total: results.length,
      vulnerableCount,
      potentialCOP,
      avgScore,
    };
  }, [results]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
            <span>Validando permisos de Super Administrador...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Acceso Restringido</h1>
            <p className="text-sm text-slate-400 mb-6">
              El panel de prospección masiva de leads B2B es exclusivo para usuarios con rango{' '}
              <span className="text-amber-400 font-semibold">Super Admin Pro</span>.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition"
            >
              Volver al Centro de Monitoreo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Super Admin Lead Engine • Deliverability B2B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Prospección Masiva de Leads
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Audita hasta 30 dominios comerciales simultáneamente. Identifica vulnerabilidades RFC
              en segundos y genera enlaces de diagnóstico con argumentos de venta de $150.000 COP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {results.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-medium text-sm transition shadow-lg shadow-emerald-950/20"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Exportar Leads (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Input & Configuración de Auditoría Masiva */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="domains" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Dominios a Prospectar (1 por línea, máx. 30):</span>
              </label>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded ${
                    inputDomainCount > 30
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {inputDomainCount} / 30
                </span>
                <button
                  type="button"
                  onClick={handleLoadDemo}
                  className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Cargar lote demo</span>
                </button>
              </div>
            </div>

            <textarea
              id="domains"
              rows={6}
              value={domainsInput}
              onChange={(e) => setDomainsInput(e.target.value)}
              disabled={isScanning}
              placeholder={`ejemploempresa.com\nagenciamarketing.co\nsoftwareb2b.com\n...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition"
            />

            {errorMsg && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Auditoría paralela en servidor con <code className="text-emerald-400">Promise.allSettled</code>
              </span>

              <button
                type="button"
                onClick={handleStartScan}
                disabled={isScanning || inputDomainCount === 0 || inputDomainCount > 30}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AudQueue en progreso...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Escanear Lote ({inputDomainCount})</span>
                  </>
                )}
              </button>
            </div>

            {scanProgress && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{scanProgress}</span>
              </div>
            )}
          </div>

          {/* Tarjeta de Ventas y Proyección */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-4 h-4" />
                <span>Métricas de Pipeline</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Oportunidades de Conversión</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Cada dominio con score &lt; 70 o sin DMARC es un prospecto de alta urgencia comercial
                dispuesto a pagar $150.000 COP por el blindaje DNS.
              </p>

              {stats ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Analizados:</span>
                    <span className="text-sm font-bold text-white font-mono">{stats.total}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                    <span className="text-xs text-red-300">Vulnerables (Cierre fácil):</span>
                    <span className="text-sm font-bold text-red-400 font-mono">{stats.vulnerableCount}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-xs text-emerald-300">Pipeline Potencial:</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      ${stats.potentialCOP.toLocaleString('es-CO')} COP
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  Ingresa dominios a la izquierda y presiona "Escanear Lote" para calcular tu pipeline.
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6 text-[11px] text-slate-400">
              💡 <span className="text-slate-300 font-medium">Tip de Venta:</span> Copia el pitch de WhatsApp y envíalo
              al tomador de decisiones junto al enlace público de auditoría.
            </div>
          </div>
        </div>

        {/* Tabla de Resultados de Prospección */}
        {results.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Resultados del Diagnóstico ({filteredResults.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Haz clic en cualquier dominio para abrir su reporte público o copia su mensaje comercial.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filtrar por dominio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 w-48 sm:w-64"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setFilterRiskOnly(!filterRiskOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    filterRiskOnly
                      ? 'bg-red-500/20 text-red-300 border-red-500/40'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {filterRiskOnly ? 'Mostrando solo vulnerables' : 'Solo vulnerables'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Dominio</th>
                    <th className="py-3 px-4">Salud DNS</th>
                    <th className="py-3 px-4">DMARC</th>
                    <th className="py-3 px-4">SPF</th>
                    <th className="py-3 px-4">Blacklist</th>
                    <th className="py-3 px-4">Diagnóstico Principal</th>
                    <th className="py-3 px-4 text-right">Acciones de Venta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredResults.map((item) => {
                    const isCritical = item.score < 60 || item.criticalCount > 0;
                    const isWarning = item.score >= 60 && item.score < 80;

                    return (
                      <tr key={item.domain} className="hover:bg-slate-800/30 transition">
                        {/* Dominio */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-200">
                          <Link
                            href={`/audit/${item.domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400 flex items-center gap-1.5 group"
                          >
                            <span>{item.domain}</span>
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 opacity-70 transition" />
                          </Link>
                        </td>

                        {/* Salud DNS Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono text-sm ${
                                isCritical
                                  ? 'text-red-400'
                                  : isWarning
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {item.score}/100
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                                isCritical
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isWarning
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                        </td>

                        {/* DMARC Policy */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                              item.dmarcPolicy === 'reject'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : item.dmarcPolicy === 'quarantine'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {item.dmarcPolicy}
                          </span>
                        </td>

                        {/* SPF */}
                        <td className="py-3.5 px-4">
                          {item.spfValid ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Válido</span>
                            </span>
                          ) : (
                            <span className="text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Fallo</span>
                            </span>
                          )}
                        </td>

                        {/* Blacklist */}
                        <td className="py-3.5 px-4">
                          {item.isBlacklisted ? (
                            <span className="text-red-400 font-bold">Listado ({item.blacklistsCount})</span>
                          ) : (
                            <span className="text-slate-400">Limpio</span>
                          )}
                        </td>

                        {/* Top Issue */}
                        <td className="py-3.5 px-4 max-w-xs truncate text-slate-400" title={item.topIssue}>
                          {item.topIssue}
                        </td>

                        {/* Acciones de Venta */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copiar WhatsApp */}
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.salesPitchWhatsApp, `wa_${item.domain}`)}
                              title="Copiar pitch comercial para WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1 text-[11px]"
                            >
                              {copiedId === `wa_${item.domain}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                                  <span className="text-[10px]">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline text-[10px]">WhatsApp</span>
                                </>
                              )}
                            </button>

                            {/* Copiar LinkedIn */}
                            <button
                              type="button"
                              onClick={() => handleCopyText(item.salesPitchLinkedIn, `li_${item.domain}`)}
                              title="Copiar pitch ejecutivo para LinkedIn"
                              className="p-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 border border-cyan-500/30 transition flex items-center gap-1 text-[11px]"
                            >
                              {copiedId === `li_${item.domain}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-cyan-300" />
                                  <span className="text-[10px]">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                                  <span className="hidden sm:inline text-[10px]">LinkedIn</span>
                                </>
                              )}
                            </button>

                            {/* Abrir Auditoría */}
                            <Link
                              href={`/audit/${item.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir auditoría pública"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
