'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  ShieldCheck,
  Lock,
  ExternalLink,
  Sparkles,
  Server,
  Cloud,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DomainAuditReport } from '@/lib/dns/types';
import { isUserSuperAdmin } from '@/config/admin';
import { BOLD_SERVICES } from '@/config/payments';

interface DnsFixGeneratorProps {
  report: DomainAuditReport;
  user?: any;
  isUnlockedOverride?: boolean;
}

export default function DnsFixGenerator({
  report,
  user,
  isUnlockedOverride = false,
}: DnsFixGeneratorProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'cloudflare' | 'cpanel' | 'google'>('cloudflare');
  const [showGuides, setShowGuides] = useState(false);

  // Determinar si el usuario tiene acceso desbloqueado (Super Admin o Pro/Shield activo)
  const isSuperAdmin = isUserSuperAdmin(user);
  const hasAccess = isSuperAdmin || isUnlockedOverride;

  // 1. Generar SPF sugerido corregido
  const generateSuggestedSpf = (): string => {
    const raw = report.spf.raw || '';
    const mxHosts = report.mx.records.map((m) => m.exchange.toLowerCase());
    const isGoogle = mxHosts.some((h) => h.includes('google') || h.includes('aspmx'));
    const isOutlook = mxHosts.some((h) => h.includes('outlook') || h.includes('protection.outlook.com'));

    if (raw && report.spf.isValid) {
      // Reemplazar terminador laxo (?all o +all) por ~all estricto
      return raw.replace(/(\+all|\?all)/gi, '~all');
    }

    if (isGoogle) {
      return 'v=spf1 include:_spf.google.com ~all';
    }
    if (isOutlook) {
      return 'v=spf1 include:spf.protection.outlook.com -all';
    }
    return 'v=spf1 mx ~all';
  };

  // 2. Generar DMARC endurecido
  const generateSuggestedDmarc = (): string => {
    return `v=DMARC1; p=quarantine; pct=100; rua=mailto:reports@miportal.me; aspf=r;`;
  };

  // 3. Recomendación DKIM
  const dkimSelector = report.dkim.records?.[0]?.selector || report.dkim.checkedSelectors?.[0] || 'google';
  const dkimHost = `${dkimSelector}._domainkey.${report.domain}`;
  const dkimSampleValue = `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA[CLAVE_PUBLICA_2048_BITS]...`;

  const suggestedSpf = generateSuggestedSpf();
  const suggestedDmarc = generateSuggestedDmarc();

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="w-full rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
      {/* Header del Generador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-tight">
                One-Click DNS Fix & Registros Blindados
              </h3>
              {hasAccess && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  DESBLOQUEADO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valores TXT corregidos y autoritativos según directivas RFC para {report.domain}.
            </p>
          </div>
        </div>

        {hasAccess && (
          <button
            type="button"
            onClick={() => setShowGuides(!showGuides)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 border border-slate-700"
          >
            <span>Guías por Proveedor</span>
            {showGuides ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Contenedor de Registros con Bloqueo / Blur si no es Pro o Admin */}
      <div className="relative mt-6">
        <div className={`space-y-5 ${!hasAccess ? 'filter blur-md select-none pointer-events-none' : ''}`}>
          {/* Registro 1: SPF */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  TXT (SPF)
                </span>
                <span className="text-xs text-slate-400 font-mono">Host: @ o {report.domain}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(suggestedSpf, 'spf')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copiedKey === 'spf' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Registro SPF</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-emerald-400 bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl break-all">
              {suggestedSpf}
            </code>
            <p className="text-[11px] text-slate-400">
              Autoriza tus servidores salientes legítimos y mitiga phishing terminando en directiva estricta (~all).
            </p>
          </div>

          {/* Registro 2: DMARC */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  TXT (DMARC)
                </span>
                <span className="text-xs text-slate-400 font-mono">Host: _dmarc.{report.domain}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(suggestedDmarc, 'dmarc')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copiedKey === 'dmarc' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Registro DMARC</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-cyan-400 bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl break-all">
              {suggestedDmarc}
            </code>
            <p className="text-[11px] text-slate-400">
              Aplica política de cuarentena al 100% y enruta reportes agregados para blindaje total contra suplantación.
            </p>
          </div>

          {/* Registro 3: DKIM */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  TXT (DKIM 2048 bits)
                </span>
                <span className="text-xs text-slate-400 font-mono">Host: {dkimHost}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(dkimSampleValue, 'dkim')}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copiedKey === 'dkim' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Formato DKIM</span>
                  </>
                )}
              </button>
            </div>
            <code className="text-xs font-mono text-indigo-300 bg-slate-900/90 border border-slate-800 px-3.5 py-2.5 rounded-xl break-all">
              {dkimSampleValue}
            </code>
            <p className="text-[11px] text-slate-400">
              Firma criptográfica con longitud recomendada de 2048 bits generada por tu proveedor (Google Workspace o Microsoft 365).
            </p>
          </div>
        </div>

        {/* OVERLAY DE PAGO SI NO TIENE ACCESO */}
        {!hasAccess && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-slate-950/70 backdrop-blur-sm rounded-2xl border border-emerald-500/30">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-2">
              ACCESO RESTRINGIDO &bull; MÓDULO DE BLINDAJE
            </span>
            <h4 className="text-base sm:text-lg font-black text-white max-w-md">
              Desbloquea los Registros TXT Blindados y Asistidos en 1 Clic
            </h4>
            <p className="text-xs text-slate-300 max-w-md mt-1 mb-5 leading-relaxed">
              Obtén las directivas SPF, DMARC y selectores DKIM autoritativos generados a la medida de tu infraestructura DNS para resolver todas las alertas.
            </p>
            <a
              href={BOLD_SERVICES.dnsBlindaje.checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl text-xs sm:text-sm font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-95"
            >
              <span>Desbloquear Blindaje DNS — $150.000 COP</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      {/* GUÍAS RÁPIDAS POR PROVEEDOR (DESPLEGABLE) */}
      {hasAccess && showGuides && (
        <div className="mt-6 pt-6 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guía de Implementación Paso a Paso:
            </span>
            <div className="flex gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveGuideTab('cloudflare')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeGuideTab === 'cloudflare'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cloudflare
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('cpanel')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeGuideTab === 'cpanel'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                cPanel / WHM
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('google')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  activeGuideTab === 'google'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Google Workspace
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5 leading-relaxed font-sans">
            {activeGuideTab === 'cloudflare' && (
              <>
                <p className="font-bold text-white">Instrucciones para Cloudflare DNS:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Inicia sesión en Cloudflare y entra a tu dominio.</li>
                  <li>Ve a la pestaña <strong>DNS &gt; Records</strong> y haz clic en <strong>Add Record</strong>.</li>
                  <li>Selecciona tipo <strong>TXT</strong>. En <strong>Name</strong> escribe <code className="text-emerald-400 font-mono">@</code> para SPF y <code className="text-cyan-400 font-mono">_dmarc</code> para DMARC.</li>
                  <li>Pega el valor en el campo <strong>Content</strong>, deja el TTL en <strong>Auto</strong> y guarda.</li>
                </ol>
              </>
            )}

            {activeGuideTab === 'cpanel' && (
              <>
                <p className="font-bold text-white">Instrucciones para cPanel / Hosting:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Entra a tu cPanel y busca la herramienta <strong>Zone Editor (Editor de Zona)</strong>.</li>
                  <li>Ubica tu dominio y haz clic en <strong>Administrar (Manage)</strong>.</li>
                  <li>Haz clic en <strong>+ Añadir Registro (Add Record)</strong> y elige tipo <strong>TXT</strong>.</li>
                  <li>Para DMARC, escribe <code className="text-cyan-400 font-mono">_dmarc.tu-dominio.com.</code> y pega el valor sugerido.</li>
                  <li>Para SPF, edita el registro TXT existente para evitar tener 2 registros SPF duplicados.</li>
                </ol>
              </>
            )}

            {activeGuideTab === 'google' && (
              <>
                <p className="font-bold text-white">Instrucciones para Google Workspace:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>Abre <strong>admin.google.com</strong> con tu cuenta de administrador.</li>
                  <li>Ve a <strong>Aplicaciones &gt; Google Workspace &gt; Gmail &gt; Autenticar correo</strong>.</li>
                  <li>Selecciona tu dominio y genera el registro <strong>DKIM (2048 bits)</strong> con el selector <code className="text-indigo-400 font-mono">google</code>.</li>
                  <li>Copia el registro y agrégalo en tu panel DNS. Vuelve a Google Admin y presiona <strong>Iniciar Autenticación</strong>.</li>
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
