'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileDown,
  ExternalLink,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Server,
  Lock,
  Mail,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import type { DomainAuditReport, Severity } from '@/lib/dns/types';
import PrintableAuditReport from '@/components/audit/PrintableAuditReport';
import DnsFixGenerator from '@/components/dns/DnsFixGenerator';
import Navbar from '@/components/navigation/Navbar';
import Footer from '@/components/Footer';
import { BOLD_SERVICES } from '@/config/payments';
import { isUserSuperAdmin } from '@/config/admin';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface PublicAuditClientPageProps {
  initialReport: DomainAuditReport;
  domain: string;
}

export default function PublicAuditClientPage({
  initialReport,
  domain,
}: PublicAuditClientPageProps) {
  const [report, setReport] = useState<DomainAuditReport>(initialReport);
  const [user, setUser] = useState<User | null>(null);
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuthAndPrivileges() {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          if (isUserSuperAdmin(currentUser)) {
            setIsShieldActive(true);
            return;
          }

          const { data: usage } = await (supabase as any)
            .from('user_usage')
            .select('dns_shield_active, is_pro')
            .eq('user_id', currentUser.id)
            .maybeSingle();

          if (usage) {
            setIsShieldActive(Boolean(usage.dns_shield_active || usage.is_pro));
          }
        }
      } catch (err) {
        console.warn('Error checking user session in public audit:', err);
      }
    }

    checkAuthAndPrivileges();
  }, []);

  const handleDownloadPdf = () => {
    try {
      window.print();
    } catch (err) {
      console.error('Error al imprimir informe PDF:', err);
    }
  };

  const handleRefreshAudit = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Error al actualizar auditoría:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', label: 'Excelente' };
    if (score >= 70) return { color: 'text-lime-400 border-lime-500/30 bg-lime-500/10', label: 'Buena' };
    if (score >= 40) return { color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', label: 'Requiere Atención' };
    return { color: 'text-rose-400 border-rose-500/30 bg-rose-500/10', label: 'Riesgo Crítico' };
  };

  const scoreInfo = getScoreBadge(report.score);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar principal */}
      <Navbar initialUser={user} />

      {/* Componente listo para exportación A4 al imprimir o guardar en PDF */}
      <PrintableAuditReport report={report} />

      {/* Sub-header de Acciones */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6 py-3 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  Auditoría Pública Certificada
                </span>
                <span className="text-slate-600 hidden sm:inline">&bull;</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">{domain}</span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>{domain}</span>
                <span className="text-slate-500 font-light">—</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-900 text-slate-300">
                  {report.score}/100 PTS
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefreshAudit}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              title="Re-escanear registros DNS en vivo"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar Informe PDF</span>
            </button>

            <a
              href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <span>Contratar Blindaje ($150.000 COP)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Contenedor Principal */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-8 print:hidden">
        {/* Banner Superior de Diagnóstico Ejecutivo */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Score Badge Circular */}
            <div
              className={`w-28 h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-3 shadow-inner ${scoreInfo.color}`}
            >
              <span className="text-4xl font-black tracking-tight">{report.score}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider opacity-80 mt-0.5">/ 100 PTS</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs font-mono text-slate-400">Dominio certificado:</span>
                <span className="font-mono text-emerald-400 font-bold text-sm sm:text-base">{report.domain}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Diagnóstico de Entregabilidad: <span className="underline decoration-emerald-500/50">{scoreInfo.label}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Auditoría autoritativa ejecutada el{' '}
                {new Date(report.timestamp).toLocaleString('es-CO', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Exportar Reporte Ejecutivo</span>
            </button>
            <a
              href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
            >
              <span>Blindaje Asistido 24h &rarr;</span>
            </a>
          </div>
        </div>

        {/* MÓDULO ESTRATÉGICO: ONE-CLICK DNS FIX */}
        <DnsFixGenerator report={report} user={user} isUnlockedOverride={isShieldActive} />

        {/* Cuadrícula de Verificaciones RFC */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card SPF */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Protocolo SPF</span>
                {report.spf.isValid ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    VÁLIDO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    CRÍTICO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono break-all bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {report.spf.raw || 'Registro SPF ausente'}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Define los servidores autorizados para emitir correo a nombre de {domain}.
            </p>
          </div>

          {/* Card DMARC */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Política DMARC</span>
                {report.dmarc.isValid && report.dmarc.policy !== 'none' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    PROTEGIDO ({report.dmarc.policy?.toUpperCase()})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {report.dmarc.raw ? 'POLÍTICA LAXA (p=none)' : 'AUSENTE'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono break-all bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {report.dmarc.raw || 'Directiva DMARC ausente'}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Instruye a Gmail y Microsoft qué hacer con los correos no autorizados.
            </p>
          </div>

          {/* Card DKIM */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Firma DKIM</span>
                {report.dkim.found ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    DETECTADO ({report.dkim.records?.[0]?.selector || 'Estándar'})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    NO DETECTADO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 font-mono break-all bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {report.dkim.records?.[0]?.raw || 'Selector estándar no detectado públicamente'}
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Garantiza que el contenido del correo no fue interceptado ni alterado en tránsito.
            </p>
          </div>

          {/* Card MX */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Servidores MX</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  {report.mx.records.length} SERVIDORES
                </span>
              </div>
              <div className="space-y-1">
                {report.mx.records.slice(0, 3).map((mx, i) => (
                  <p key={i} className="text-xs font-mono text-slate-300 truncate">
                    {mx.exchange} (Pri: {mx.priority})
                  </p>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Enrutamiento de correo entrante hacia proveedores certificados.
            </p>
          </div>

          {/* Card TLS */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Cifrado STARTTLS</span>
                {report.tls.supported ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    ACTIVO ({report.tls.version || 'TLSv1.2+'})
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    SIN CIFRADO
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Certificado:{' '}
                <span className="font-semibold text-emerald-400">{report.tls.certValid ? 'Válido' : 'No verificado'}</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cifra la comunicación de servidor a servidor para prevenir espionaje o intercepción.
            </p>
          </div>

          {/* Card Blacklist */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">Listas Negras (DNSBL)</span>
                {report.blacklists.listed > 0 ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    REPORTADO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    LIMPIO (0 LISTAS)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Spamhaus, Barracuda, SpamCop y SORBS analizados.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Evalúa si la IP o dominio se encuentran penalizados por envíos masivos o spam previo.
            </p>
          </div>
        </div>

        {/* Hallazgos y Vulnerabilidades */}
        {report.issues.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Vulnerabilidades Detectadas ({report.issues.length})</span>
            </h3>

            <div className="space-y-3">
              {report.issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-white">{issue.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400">
                      [{issue.category}]
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{issue.description}</p>
                  {issue.recommendation && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <strong>Recomendación:</strong> {issue.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating CTA Button (Bottom Right) para cierre de ventas directo */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <a
          href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 rounded-full text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-emerald-300/40"
        >
          <ShieldCheck className="w-5 h-5 text-slate-950" />
          <span>Blindar Dominio en 24h &bull; $150.000 COP</span>
        </a>
      </div>

      <Footer />
    </div>
  );
}
