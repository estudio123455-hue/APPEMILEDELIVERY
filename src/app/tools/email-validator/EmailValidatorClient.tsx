'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  Zap,
  Lock,
  Search,
  Filter,
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';

interface ValidationResult {
  email: string;
  domain: string;
  status: 'VALID' | 'NO_MX' | 'INVALID_SYNTAX' | 'DISPOSABLE' | 'RISKY';
  syntaxValid: boolean;
  isDisposable: boolean;
  hasMx: boolean;
  isFreeWebmail: boolean;
  reason: string;
  mxRecords?: string[];
}

const DEMO_EMAILS = [
  'contacto@uniandes.edu.co',
  'usuario_prueba@gmail.com',
  'invalido@@dominio..com',
  'desechable123@tempmail.com',
  'soporte@empresa-inexistente-129384719.com',
  'info@platzi.com',
  'ventas@bancolombia.com.co',
  'spam_user@10minutemail.com',
];

export default function EmailValidatorClient() {
  const [inputText, setInputText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [hasFullAccess, setHasFullAccess] = useState(true);
  const [isLimited, setIsLimited] = useState(false);
  const [maxAllowed, setMaxAllowed] = useState(50);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const inputEmailCount = useMemo(() => {
    return inputText
      .split('\n')
      .map((e) => e.trim())
      .filter((e) => e.length > 0).length;
  }, [inputText]);

  const handleLoadDemo = () => {
    setInputText(DEMO_EMAILS.join('\n'));
    setErrorMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Extraer correos usando regex o líneas
        const lines = content
          .split(/[\r\n,;]+/)
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter((s) => s.includes('@'));
        setInputText(lines.join('\n'));
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    setErrorMessage(null);
    const emails = inputText
      .split('\n')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0);

    if (emails.length === 0) {
      setErrorMessage('Ingresa al menos 1 correo electrónico para verificar.');
      return;
    }

    setIsValidating(true);

    try {
      const res = await fetch('/api/tools/validate-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al validar la lista.');
      }

      setResults(data.results || []);
      setHasFullAccess(Boolean(data.hasFullAccess));
      setIsLimited(Boolean(data.isLimited));
      setMaxAllowed(data.maxAllowed || 50);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Ocurrió un error inesperado al validar la lista.'
      );
    } finally {
      setIsValidating(false);
    }
  };

  const validEmails = useMemo(() => {
    return results.filter((r) => r.status === 'VALID').map((r) => r.email);
  }, [results]);

  const stats = useMemo(() => {
    if (results.length === 0) return null;
    const total = results.length;
    const valid = results.filter((r) => r.status === 'VALID').length;
    const invalid = total - valid;
    const bounceSavedPct = Math.round((invalid / total) * 100);
    return { total, valid, invalid, bounceSavedPct };
  }, [results]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchesSearch =
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (activeFilter === 'valid') return item.status === 'VALID';
      if (activeFilter === 'invalid') return item.status !== 'VALID';
      return true;
    });
  }, [results, searchTerm, activeFilter]);

  const handleCopyValid = () => {
    if (validEmails.length === 0) return;
    navigator.clipboard.writeText(validEmails.join('\n'));
    setCopiedKey('valid');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleExportCSV = () => {
    if (validEmails.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,Email,Estado\n' +
      validEmails.map((e) => `"${e}","VALID"`).join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `correos_limpios_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportTXT = () => {
    if (validEmails.length === 0) return;
    const blob = new Blob([validEmails.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `correos_limpios_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deliverability Lab • Email List Hygiene & Bounce Preventer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Validador y Limpiador de Listas de Correo
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Elimina correos falsos, temporales y dominios sin registros MX antes de enviar campañas.
              Protege la reputación de tu dominio y evita suspensiones por alta tasa de rebote.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadDemo}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cargar Lote Demo</span>
            </button>
          </div>
        </div>

        {/* Input y Configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: ENTRADA DE DATOS (7 cols)              */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="emailList" className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>Pega tu lista de correos (1 por línea):</span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  {inputEmailCount} correos
                </span>

                <label className="cursor-pointer text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  <span>Subir .txt/.csv</span>
                  <input
                    type="file"
                    accept=".txt,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <textarea
              id="emailList"
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isValidating}
              placeholder={`juan@empresa.com\ncontacto@miportal.me\nventas@startup.co\n...`}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition"
            />

            {errorMessage && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-400">
                <span>Límite: </span>
                <strong className="text-emerald-400">{hasFullAccess ? 'Hasta 50 correos por lote' : '5 correos (Modo Demo)'}</strong>
              </div>

              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || inputEmailCount === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Resolviendo MX & RFC...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>Validar Lista ({inputEmailCount})</span>
                  </>
                )}
              </button>
            </div>

            {isLimited && (
              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Validamos los primeros 5 correos de tu lista. Desbloquea validaciones masivas con el Blindaje DNS.
                  </span>
                </div>
                <Link
                  href="/"
                  className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shrink-0"
                >
                  Ver Blindaje
                </Link>
              </div>
            )}
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: MÉTRICAS DE HIGIENE (5 cols)             */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Impacto en Entregabilidad
              </span>
              <h2 className="text-lg font-bold text-white">Salud de tu Base de Datos</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google y Yahoo marcan como spam a remitentes que superan el <strong>0.3% de quejas</strong> o{' '}
                <strong>2% de rebotes duros</strong>. Limpiar tu lista antes del envío protege tu dominio permanentemente.
              </p>

              {stats ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Total Auditados:</span>
                    <span className="text-sm font-bold text-white font-mono">{stats.total}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-xs text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Correos Válidos (Seguros):</span>
                    </span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">{stats.valid}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
                    <span className="text-xs text-red-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Riesgosos / Desechables:</span>
                    </span>
                    <span className="text-sm font-bold text-red-400 font-mono">{stats.invalid}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Tasa de Rebote Prevenida:</span>
                    <span className="text-sm font-bold text-cyan-400 font-mono">
                      ~{stats.bounceSavedPct}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                  Pega tu lista a la izquierda para diagnosticar servidores MX y detectar correos desechables.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABLA DE RESULTADOS DE VALIDACIÓN                         */}
        {/* ========================================================= */}
        {results.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm space-y-4 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Resultados de Higiene ({filteredResults.length})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Filtra tu lista y descarga únicamente los correos verificados para tu CRM o plataforma de email.
                </p>
              </div>

              {/* Botones de Exportar */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyValid}
                  disabled={validEmails.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  {copiedKey === 'valid' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'valid' ? '¡Válidos copiados!' : 'Copiar Válidos'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={validEmails.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportTXT}
                  disabled={validEmails.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>TXT</span>
                </button>
              </div>
            </div>

            {/* Barra de Filtro y Búsqueda */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    activeFilter === 'all'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos ({results.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('valid')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    activeFilter === 'valid'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Válidos ({validEmails.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('invalid')}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    activeFilter === 'invalid'
                      ? 'bg-red-500/20 text-red-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Riesgosos ({results.length - validEmails.length})
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar correo o dominio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 w-52 sm:w-64"
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Correo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Servidor MX</th>
                    <th className="py-3 px-4">Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                  {filteredResults.map((item, idx) => {
                    const isValid = item.status === 'VALID';
                    const isDisposable = item.status === 'DISPOSABLE';
                    const isNoMx = item.status === 'NO_MX';

                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-3 px-4 text-slate-200 font-medium">{item.email}</td>
                        <td className="py-3 px-4">
                          {isValid ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>VÁLIDO</span>
                            </span>
                          ) : isDisposable ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>DESECHABLE</span>
                            </span>
                          ) : isNoMx ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>SIN MX</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>SINTAXIS ERROR</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 truncate max-w-xs font-sans">
                          {item.mxRecords && item.mxRecords.length > 0 ? (
                            <span className="text-slate-300 text-xs font-mono">{item.mxRecords[0]}</span>
                          ) : (
                            <span className="text-slate-500 italic">No detectado</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                          {item.reason}
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
