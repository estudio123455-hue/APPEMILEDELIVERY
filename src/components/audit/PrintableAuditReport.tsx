'use client';

import React from 'react';
import type { DomainAuditReport } from '@/lib/dns/types';
import { calculatePlacementPrediction } from '@/lib/dns/placement';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Server,
  Lock,
  Mail,
  Layers,
  FileText,
  Calendar,
  Globe,
  Inbox,
} from 'lucide-react';

interface PrintableAuditReportProps {
  report: DomainAuditReport;
}

export default function PrintableAuditReport({ report }: PrintableAuditReportProps) {
  const placementSimulation = calculatePlacementPrediction(report);
  const formattedDate = new Date(report.timestamp).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case 'EXCELLENT':
        return 'Excelente — Dominio Blindado y Confiable';
      case 'GOOD':
        return 'Bueno — Configuración Aceptable';
      case 'NEEDS_ATTENTION':
        return 'Atención — Requiere Correcciones Inmediatas';
      case 'CRITICAL':
        return 'Crítico — Alto Riesgo de Suplantación y Caída en Spam';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  return (
    <div className="hidden print:block w-full max-w-4xl mx-auto p-4 text-slate-900 bg-white font-sans text-xs">
      {/* ========================================================= */}
      {/* 1. ENCABEZADO / LETTERHEAD CORPORATIVO                    */}
      {/* ========================================================= */}
      <header className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              DeliverabilityGuard
            </h1>
            <p className="text-[11px] text-slate-600 font-medium">
              Informe Técnico de Auditoría DNS y Entregabilidad de Correo
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] text-slate-600 flex flex-col gap-0.5">
          <span className="font-bold text-slate-900">ID del Informe:</span>
          <span className="font-mono text-[10px] text-slate-500">
            DG-{report.domain.replace(/[^a-zA-Z0-9]/g, '')}-{Date.now().toString(36).toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-500">deliverabilityguard.miportal.me</span>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. RESUMEN EJECUTIVO & SCORE                              */}
      {/* ========================================================= */}
      <section className="mb-6 border border-slate-200 rounded-xl p-5 bg-slate-50/70">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            {/* Score Box */}
            <div
              className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-sm ${getStatusBadgeClass(
                report.score
              )}`}
            >
              <span className="text-3xl font-black leading-none">{report.score}</span>
              <span className="text-[9px] font-mono uppercase tracking-wider font-bold mt-1">
                / 100 PTS
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Dominio Evaluado:
                </span>
                <span className="text-base font-mono font-black text-slate-900">
                  {report.domain}
                </span>
              </div>
              <h2 className="text-sm font-bold text-slate-800">
                Diagnóstico: {getStatusText(report.status)}
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha de auditoría: {formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Tarjetas de Conteo */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/80 min-w-[70px]">
              <span className="block text-lg font-black text-rose-700">
                {report.summary.criticalCount}
              </span>
              <span className="text-[10px] font-bold text-rose-800 uppercase">Críticos</span>
            </div>
            <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/80 min-w-[70px]">
              <span className="block text-lg font-black text-amber-700">
                {report.summary.warningCount}
              </span>
              <span className="text-[10px] font-bold text-amber-800 uppercase">Alertas</span>
            </div>
            <div className="p-2.5 rounded-lg border border-sky-200 bg-sky-50/80 min-w-[70px]">
              <span className="block text-lg font-black text-sky-700">
                {report.summary.infoCount}
              </span>
              <span className="text-[10px] font-bold text-sky-800 uppercase">Avisos</span>
            </div>
          </div>
        </div>

        {/* Ecosistema Tecnológico Detectado (Smart Provider Fingerprint) */}
        {report.fingerprint && (
          <div className="mt-4 pt-3.5 border-t border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                Infraestructura Detectada (Smart Fingerprinting)
              </span>
              <span className="text-[9px] font-mono text-slate-500">Resolución NS & MX</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Proveedor de Correo:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{report.fingerprint.emailProvider}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Gestor DNS / NS:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">{report.fingerprint.dnsHost}</span>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200">
                <span className="text-slate-500 block text-[9px] font-bold uppercase">Pasarelas SPF:</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">
                  {report.fingerprint.transactionalServices.length > 0
                    ? report.fingerprint.transactionalServices.join(', ')
                    : 'Ninguna adicional'}
                </span>
              </div>
            </div>

            {report.fingerprint.contextualTips.length > 0 && (
              <div className="mt-2.5 space-y-1">
                {report.fingerprint.contextualTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-amber-50/70 border border-amber-200 text-slate-800 text-[10px] leading-relaxed"
                  >
                    <strong className="text-amber-900">Nota de compatibilidad:</strong> {tip}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2.1 PRONÓSTICO DE ENTREGABILIDAD (SIMULADOR DE BANDEJA)   */}
      {/* ========================================================= */}
      <section className="mb-6 border border-slate-200 rounded-xl p-4 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Inbox className="w-3.5 h-3.5 text-slate-700" />
            Pronóstico de Entregabilidad por Cliente (Inbox Placement)
          </h3>
          <span className="text-[10px] font-mono text-slate-600 font-bold">
            Tasa Media Estimada: {placementSimulation.averageRate}%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {placementSimulation.predictions.map((p) => (
            <div
              key={p.providerId}
              className={`p-3 rounded-lg border ${
                p.status === 'INBOX'
                  ? 'border-emerald-200 bg-emerald-50/40'
                  : p.status === 'PROMOTIONS_SUSPICIOUS'
                  ? 'border-amber-200 bg-amber-50/40'
                  : 'border-rose-200 bg-rose-50/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900 text-[11px] truncate">{p.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    p.status === 'INBOX'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : p.status === 'PROMOTIONS_SUSPICIOUS'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  {p.badgeLabel} ({p.estimatedRate}%)
                </span>
              </div>

              <div className="text-[10px] text-slate-600 mb-1.5">
                <strong className="text-slate-800 block">Destino previsto:</strong>
                <span className="font-semibold text-slate-900">{p.folderName}</span>
              </div>

              <p className="text-[10px] text-slate-700 leading-snug">
                {p.reasons[0] || p.headline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DESGLOSE TÉCNICO DE REGISTROS (5 PILARES RFC)          */}
      {/* ========================================================= */}
      <section className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-2 mb-3">
          1. Estado de los Pilares de Autenticación DNS
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {/* SPF */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-700" />
                SPF (RFC 7208)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  report.spf.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {report.spf.isValid ? 'VÁLIDO' : 'AUSENTE / INVÁLIDO'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>Lookups DNS:</strong> {report.spf.dnsLookupCount}/10{' '}
                {report.spf.dnsLookupCount > 10 && '(¡Excede límite RFC!)'}
              </div>
              <div>
                <strong>Calificador:</strong> {report.spf.qualifier || 'N/A'}
              </div>
              <div className="mt-1.5">
                <strong className="block mb-1 text-slate-700">Registro Detectado (Host @):</strong>
                <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 break-all whitespace-pre-wrap select-all">
                  <code>{report.spf.raw || 'No se encontró registro TXT v=spf1'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* DMARC */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-700" />
                DMARC (RFC 7489)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  report.dmarc.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {report.dmarc.isValid ? `ACTIVO (p=${report.dmarc.policy})` : 'AUSENTE / ERROR'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>Política:</strong> {report.dmarc.policy || 'none'}{' '}
                {report.dmarc.policy === 'reject'
                  ? '(Rechazo total — Máxima protección)'
                  : report.dmarc.policy === 'quarantine'
                  ? '(Cuarentena a Spam)'
                  : '(Solo monitoreo)'}
              </div>
              <div>
                <strong>Cobertura (pct):</strong> {report.dmarc.percentage ?? 100}% |{' '}
                <strong>Reportes (rua):</strong>{' '}
                {report.dmarc.rua.length > 0 ? report.dmarc.rua.join(', ') : 'Ninguno'}
              </div>
              <div className="mt-1.5">
                <strong className="block mb-1 text-slate-700">Registro Detectado (Host _dmarc):</strong>
                <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 break-all whitespace-pre-wrap select-all">
                  <code>{report.dmarc.raw || 'No se encontró registro TXT en _dmarc'}</code>
                </div>
              </div>
            </div>
          </div>

          {/* DKIM */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-700" />
                DKIM (RFC 6376)
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  report.dkim.found
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {report.dkim.found ? 'FIRMAS DETECTADAS' : 'REQUIERE VERIFICACIÓN'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>Selectores Comprobados:</strong>{' '}
                {report.dkim.checkedSelectors.join(', ')}
              </div>
              <div>
                <strong>Claves Públicas Validadas:</strong>{' '}
                {report.dkim.records.length > 0
                  ? `${report.dkim.records.length} registro(s) encontrado(s)`
                  : 'No se detectaron claves en los selectores comunes.'}
              </div>
              <div className="mt-1.5">
                <strong className="block mb-1 text-slate-700">Registros de Clave Pública DKIM:</strong>
                {report.dkim.records.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {report.dkim.records.map((rec, i) => (
                      <div key={i} className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Selector: {rec.selector}._domainkey
                        </span>
                        <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 break-all whitespace-pre-wrap select-all">
                          <code>{rec.raw || rec.publicKey || 'Clave pública detectada'}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 break-all whitespace-pre-wrap select-all">
                    <code>No se detectaron registros en los selectores comunes analizados.</code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MX & BIMI */}
          <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-700" />
                MX (Mail Exchange) & BIMI
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  report.mx.isValid
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {report.mx.isValid ? 'MX ACTIVO' : 'SIN MX'}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 space-y-1">
              <div>
                <strong>BIMI (Identidad Visual):</strong>{' '}
                {report.bimi.isValid ? 'Configurado con logotipo' : 'No configurado'}
              </div>
              <div className="mt-1.5">
                <strong className="block mb-1 text-slate-700">Registros MX Detectados:</strong>
                <div className="bg-slate-50 border border-slate-200 rounded p-2 font-mono text-xs text-slate-800 break-all whitespace-pre-wrap select-all">
                  <code>
                    {report.mx.records.length > 0
                      ? report.mx.records.map((r) => `${r.priority} ${r.exchange}`).join('\n')
                      : 'Ningún servidor de correo MX detectado.'}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnóstico de Listas Negras DNSBL / RBL */}
        <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-700" />
              Reputación de IP y Listas Negras (DNSBL / RBL)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                report.blacklists.listed === 0
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {report.blacklists.listed === 0
                ? 'LIMPIO (0 LISTAS NEGRAS)'
                : `LISTADO EN ${report.blacklists.listed} LISTA(S)`}
            </span>
          </div>

          <div className="text-[11px] text-slate-600 mb-2 flex items-center gap-2">
            <strong>IP Evaluada del Servidor de Correo:</strong>
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-900 font-mono font-bold text-xs">
              {report.blacklists.ip}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {report.blacklists.details.map((bl) => (
              <div
                key={bl.provider}
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono"
              >
                <span className="text-slate-800 font-semibold">{bl.provider}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    bl.listed
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {bl.listed ? `Listado (${bl.returnCode || '127.0.0.X'})` : 'Limpio'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Verificación de Cifrado en Tránsito (STARTTLS & SSL/TLS de Servidores MX) */}
        <div className="mt-3 border border-slate-200 rounded-lg p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-700" />
              Cifrado en Tránsito y Certificados (STARTTLS & SSL/TLS)
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                report.tls.supported && report.tls.certValid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : report.tls.supported
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {report.tls.supported
                ? `STARTTLS ACTIVO (${report.tls.version || 'TLSv1.2+'})`
                : 'SIN STARTTLS (TEXTO PLANO)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">Servidor MX Evaluado:</span>
              <span className="font-mono font-semibold text-slate-900">{report.tls.mxHost}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">Protocolo Negociado:</span>
              <span className="font-mono font-semibold text-slate-900">{report.tls.version || 'No disponible'}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">Emisor del Certificado (CA):</span>
              <span className="font-semibold text-slate-900">{report.tls.issuer || 'Desconocido'}</span>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold">Vigencia del Certificado:</span>
              <span className="font-semibold text-slate-900">
                {report.tls.expiresInDays !== undefined
                  ? `${report.tls.expiresInDays} días restantes`
                  : report.tls.certValid
                  ? 'Certificado Válido'
                  : 'No validado'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. HALLAZGOS Y ACCIONES DE REMEDIACIÓN                    */}
      {/* ========================================================= */}
      <section className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-300 pb-2 mb-3">
          2. Plan de Remediación y Hallazgos Técnicos ({report.issues.length})
        </h3>

        {report.issues.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
            ✓ Felicitaciones: No se detectaron fallos de seguridad o entregabilidad en el dominio.
          </div>
        ) : (
          <div className="space-y-2.5">
            {report.issues.map((issue, idx) => (
              <div
                key={issue.id || idx}
                className={`p-3 rounded-lg border text-left ${
                  issue.severity === 'CRITICAL'
                    ? 'border-rose-200 bg-rose-50/60'
                    : issue.severity === 'WARNING'
                    ? 'border-amber-200 bg-amber-50/60'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {issue.severity === 'CRITICAL' && (
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {issue.severity === 'WARNING' && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {issue.severity === 'INFO' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                    )}
                    {issue.title}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : issue.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {issue.category} • {issue.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">{issue.description}</p>
                {issue.recommendation && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[11px] text-slate-800">
                    <strong className="text-emerald-800">Acción recomendada:</strong>{' '}
                    {issue.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 5. PIE DE PÁGINA Y CERTIFICACIÓN OFICIAL                  */}
      {/* ========================================================= */}
      <footer className="mt-8 pt-4 border-t-2 border-slate-900 text-center text-[10px] text-slate-500 flex flex-col gap-1">
        <p className="font-medium text-slate-700">
          Generado por DeliverabilityGuard (https://deliverabilityguard.miportal.me) — Resolución DNS sin caché autoritativa conforme a normativas RFC 7208, RFC 7489 y RFC 6376 de la IETF.
        </p>
        <p className="text-slate-400">
          Documento confidencial para uso exclusivo del administrador del dominio {report.domain}. Emitido el {formattedDate}.
        </p>
      </footer>
    </div>
  );
}
