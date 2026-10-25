'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import type { Database, Json } from '@/types/database';
import type { DomainAuditReport } from '@/lib/dns/types';

type DomainAuditRow = Database['public']['Tables']['domain_audits']['Row'];

type FilterTab = 'all' | 'protected' | 'risk';

function DashboardContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainAuditRow[]>([]);

  // Estados de interacción
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [recheckingDomain, setRecheckingDomain] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  // 1. Cargar sesión y dominios del usuario
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setFeedbackMsg(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || null);

      const { data, error } = await supabase
        .from('domain_audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Agrupar por dominio para mostrar el último análisis registrado de cada uno
      const domainMap = new Map<string, DomainAuditRow>();
      (data || []).forEach((row) => {
        const normalized = row.domain.toLowerCase().trim();
        if (!domainMap.has(normalized)) {
          domainMap.set(normalized, row);
        }
      });

      setDomains(Array.from(domainMap.values()));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar el panel de monitoreo.';
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 2. Re-evaluación en 1 Clic ("Comprobar ahora")
  const handleRecheckDomain = async (domainName: string) => {
    if (!userId) return;
    setRecheckingDomain(domainName);
    setFeedbackMsg(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainName, forceRefresh: true }),
      });

      if (!response.ok) {
        throw new Error('No se pudo re-evaluar el dominio en los servidores DNS.');
      }

      const report: DomainAuditReport = await response.json();

      const supabase = createClient();
      const { data: newRow, error: insertError } = await supabase
        .from('domain_audits')
        .insert({
          user_id: userId,
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
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Actualizar la lista en el estado local (refresca fila y métricas superiores)
      setDomains((prev) =>
        prev.map((d) => (d.domain.toLowerCase() === domainName.toLowerCase() ? newRow : d))
      );

      setFeedbackMsg({
        type: 'success',
        text: `✓ "${domainName}" actualizado con éxito. Score actual: ${report.score}/100.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al comprobar el dominio.';
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setRecheckingDomain(null);
    }
  };

  // 3. Confirmación y Eliminación de Dominio
  const handleConfirmDelete = async () => {
    if (!userId || !domainToDelete) return;
    setIsDeleting(true);
    setFeedbackMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('domain_audits')
        .delete()
        .eq('user_id', userId)
        .eq('domain', domainToDelete);

      if (error) throw error;

      setDomains((prev) =>
        prev.filter((d) => d.domain.toLowerCase() !== domainToDelete.toLowerCase())
      );
      setFeedbackMsg({
        type: 'info',
        text: `Dominio "${domainToDelete}" eliminado de tu panel de monitoreo.`,
      });
      setDomainToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar el dominio.';
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Métricas superiores
  const totalCount = domains.length;
  const protectedCount = useMemo(
    () => domains.filter((d) => d.spf_valid && d.dmarc_valid && d.score >= 80).length,
    [domains]
  );
  const riskCount = totalCount - protectedCount;

  // Filtrado y Búsqueda en Vivo
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const matchesSearch = d.domain
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      if (!matchesSearch) return false;

      const isProtected = d.spf_valid && d.dmarc_valid && d.score >= 80;

      if (activeFilter === 'protected') {
        return isProtected;
      }
      if (activeFilter === 'risk') {
        return !isProtected;
      }
      return true;
    });
  }, [domains, searchTerm, activeFilter]);

  // Formato de tiempo relativo en español
  const formatRelativeTime = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Hace un momento';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      return date.toLocaleDateString('es-CO', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
    if (score >= 50) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg
                className="w-4 h-4 text-slate-950 font-bold"
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
            <span className="font-extrabold text-base tracking-tight text-slate-50">
              DeliverabilityGuard
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Nueva Auditoría</span>
            </Link>

            <Link
              href="/settings/security"
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
              title="Ajustes de Seguridad y 2FA"
            >
              2FA
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8">
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Centro de Monitoreo Gratuito 24/7
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-50 tracking-tight mt-1">
              Monitoreo y Protección de Dominios
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Vigila en tiempo real la salud de tus registros SPF, DMARC y entregabilidad de forma 100% libre y gratuita.
            </p>
          </div>

          {userEmail && (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl self-start sm:self-auto shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Cuenta Conectada
                </span>
                <span className="text-xs font-mono text-slate-300 font-bold">{userEmail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Notificación de Feedback */}
        {feedbackMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between shadow-sm animate-fade-in ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                : 'bg-sky-950/40 border border-sky-500/40 text-sky-300'
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-white ml-2 text-sm"
            >
              ✕
            </button>
          </div>
        )}

        {/* Barra de Estadísticas Rápidas (3 tarjetas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total */}
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`p-5 rounded-2xl border text-left transition flex items-center justify-between shadow-sm ${
              activeFilter === 'all'
                ? 'bg-slate-900/90 border-slate-700 ring-1 ring-slate-600'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Total Vigilados
              </span>
              <span className="text-3xl font-extrabold text-slate-100 mt-1">{totalCount}</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Dominios en tu cuenta</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
          </button>

          {/* Protegidos */}
          <button
            type="button"
            onClick={() => setActiveFilter('protected')}
            className={`p-5 rounded-2xl border text-left transition flex items-center justify-between shadow-sm ${
              activeFilter === 'protected'
                ? 'bg-slate-900/90 border-emerald-500/60 ring-1 ring-emerald-500/40'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Dominios Protegidos
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 mt-1">{protectedCount}</span>
              <span className="text-[11px] text-slate-500 mt-0.5">SPF y DMARC blindados</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </button>

          {/* En Riesgo */}
          <button
            type="button"
            onClick={() => setActiveFilter('risk')}
            className={`p-5 rounded-2xl border text-left transition flex items-center justify-between shadow-sm ${
              activeFilter === 'risk'
                ? 'bg-slate-900/90 border-rose-500/60 ring-1 ring-rose-500/40'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex flex-col">
              <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
                En Riesgo
              </span>
              <span className="text-3xl font-extrabold text-rose-400 mt-1">{riskCount}</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Requieren configuración</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </button>
        </div>

        {/* 1. Barra de Filtros y Búsqueda en Vivo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por dominio (ej. miempresa.com)..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros Rápidos (Pills) */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              <span>Todos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-900 border border-slate-800">
                {totalCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('protected')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === 'protected'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-emerald-300 border border-transparent'
              }`}
            >
              <span>Protegidos</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {protectedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('risk')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                activeFilter === 'risk'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 hover:text-rose-300 border border-transparent'
              }`}
            >
              <span>En Riesgo</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {riskCount}
              </span>
            </button>
          </div>
        </div>

        {/* Lista de Dominios */}
        {loading ? (
          <div className="p-16 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Cargando tus dominios monitoreados...</span>
          </div>
        ) : domains.length === 0 ? (
          /* Estado Vacío Total (Sin dominios guardados aún) */
          <div className="p-12 sm:p-16 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center flex flex-col items-center gap-5 shadow-inner">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>

            <div className="flex flex-col gap-1.5 max-w-md">
              <h3 className="text-xl font-bold text-slate-100">
                Aún no tienes dominios en monitoreo
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Audita tu primer dominio y haz clic en &apos;Guardar dominio para monitoreo&apos; para vigilarlo 24/7 contra caídas en spam y suplantación.
              </p>
            </div>

            <Link
              href="/"
              className="mt-2 px-6 py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>Auditar un Dominio Ahora</span>
            </Link>
          </div>
        ) : filteredDomains.length === 0 ? (
          /* Estado Vacío de Búsqueda / Filtro */
          <div className="p-12 rounded-3xl bg-slate-900/40 border border-slate-800 text-center flex flex-col items-center gap-3">
            <span className="text-2xl">🔍</span>
            <h3 className="text-sm font-bold text-slate-200">
              No se encontraron dominios que coincidan con la búsqueda
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Prueba modificando el término de búsqueda o cambiando el filtro seleccionado.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          /* Tabla de Dominios con Microinteracciones */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Mostrando <strong className="text-slate-200">{filteredDomains.length}</strong> de{' '}
                {totalCount} {totalCount === 1 ? 'dominio' : 'dominios'}
              </span>
              <span className="hidden sm:inline">Haz clic en &apos;Ver detalles&apos; para abrir el Asistente de Reparación</span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Dominio</th>
                    <th className="py-3.5 px-4 font-bold text-center">Puntuación</th>
                    <th className="py-3.5 px-4 font-bold">Pilares (SPF / DMARC / MX)</th>
                    <th className="py-3.5 px-4 font-bold">Último Análisis</th>
                    <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredDomains.map((d) => {
                    const isRechecking = recheckingDomain === d.domain;

                    return (
                      <tr
                        key={d.id}
                        className="hover:bg-slate-800/40 transition-colors duration-150 group"
                      >
                        {/* Dominio */}
                        <td className="py-4 px-4 font-bold">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-mono text-emerald-400 text-xs shadow-sm flex-shrink-0">
                              🌐
                            </div>
                            <div className="flex flex-col">
                              <span className="font-mono text-slate-100 text-sm font-bold tracking-tight">
                                {d.domain}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                {d.status === 'EXCELLENT'
                                  ? 'Excelente entregabilidad'
                                  : d.status === 'GOOD'
                                  ? 'Buena configuración'
                                  : d.status === 'NEEDS_ATTENTION'
                                  ? 'Requiere atención'
                                  : 'Riesgo crítico'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Puntuación */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-mono font-black text-xs border ${getScoreBadge(
                              d.score
                            )}`}
                          >
                            {d.score} / 100
                          </span>
                        </td>

                        {/* Pilares */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                d.spf_valid
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              SPF {d.spf_valid ? '✓' : '✕'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                d.dmarc_valid
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              DMARC {d.dmarc_valid ? '✓' : '✕'}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                                d.mx_valid
                                  ? 'bg-slate-800 text-slate-300 border-slate-700/80'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}
                            >
                              MX {d.mx_valid ? '✓' : '✕'}
                            </span>
                          </div>
                        </td>

                        {/* Fecha */}
                        <td className="py-4 px-4 text-slate-400 text-xs">
                          {formatRelativeTime(d.created_at)}
                        </td>

                        {/* Acciones */}
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Botón 1: Comprobar ahora */}
                            <button
                              type="button"
                              disabled={isRechecking}
                              onClick={() => handleRecheckDomain(d.domain)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 disabled:opacity-50"
                              title="Re-auditar registros DNS en vivo"
                            >
                              {isRechecking ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                  <span className="hidden sm:inline">Auditando...</span>
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
                                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                    />
                                  </svg>
                                  <span className="hidden sm:inline">Comprobar</span>
                                </>
                              )}
                            </button>

                            {/* Botón 2: Ver detalles */}
                            <Link
                              href={`/?domain=${encodeURIComponent(d.domain)}`}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1"
                              title="Ver diagnóstico completo y asistente"
                            >
                              <svg className="w-3.5 h-3.5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="hidden md:inline">Detalles</span>
                            </Link>

                            {/* Botón 3: Eliminar */}
                            <button
                              type="button"
                              onClick={() => setDomainToDelete(d.domain)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition"
                              title="Eliminar de mi monitoreo"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
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

      {/* Modal de Confirmación Visual para Eliminar */}
      {domainToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-slate-100">
                  ¿Eliminar dominio de monitoreo?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Estás a punto de desvincular el dominio{' '}
                  <span className="font-mono text-slate-200 font-bold">{domainToDelete}</span>. Se
                  eliminará su registro de auditoría de tu lista.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDomainToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar Definitivamente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
