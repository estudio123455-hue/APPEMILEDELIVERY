'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Copy,
  Check,
  Server,
  Mail,
  Layers,
  HelpCircle,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Globe,
  Settings,
} from 'lucide-react';

// ==========================================
// TIPOS Y DATOS DE PROVEEDORES SPF
// ==========================================
interface EmailProviderConfig {
  id: string;
  name: string;
  badge: string;
  include: string;
  description: string;
  category: 'suite' | 'transactional' | 'marketing';
}

const POPULAR_PROVIDERS: EmailProviderConfig[] = [
  {
    id: 'google',
    name: 'Google Workspace',
    badge: 'Gmail Corporativo',
    include: '_spf.google.com',
    description: 'Para empresas usando Gmail con dominio propio.',
    category: 'suite',
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365 / Outlook',
    badge: 'Exchange Online',
    include: 'spf.protection.outlook.com',
    description: 'Para suscripciones de Office 365 y buzones corporativos Outlook.',
    category: 'suite',
  },
  {
    id: 'resend',
    name: 'Resend',
    badge: 'Email API Moderno',
    include: 'resend.com',
    description: 'Envíos transaccionales para desarrolladores y SaaS.',
    category: 'transactional',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid (Twilio)',
    badge: 'Transaccional & Masivo',
    include: 'sendgrid.net',
    description: 'Infraestructura de entrega de correos de alto volumen.',
    category: 'transactional',
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    badge: 'Email API',
    include: 'mailgun.org',
    description: 'Servicio de entrega y validación de correos para apps.',
    category: 'transactional',
  },
  {
    id: 'brevo',
    name: 'Brevo (Sendinblue)',
    badge: 'Marketing & CRM',
    include: 'spf.brevo.com',
    description: 'Campañas de email marketing y automatización.',
    category: 'marketing',
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    badge: 'AWS Cloud',
    include: 'amazonses.com',
    description: 'Simple Email Service en la nube de Amazon Web Services.',
    category: 'transactional',
  },
];

type SpfStrictness = '~all' | '-all' | '?all';
type DmarcPolicy = 'none' | 'quarantine' | 'reject';
type DmarcAlignment = 'r' | 's';

export default function DnsGeneratorWizard() {
  // Pestaña principal: 'spf' | 'dmarc'
  const [activeTab, setActiveTab] = useState<'spf' | 'dmarc'>('spf');

  // Estados de copiado
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };

  // ==========================================
  // ESTADOS DEL GENERADOR SPF
  // ==========================================
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['google']);
  const [includeMx, setIncludeMx] = useState<boolean>(true);
  const [includeA, setIncludeA] = useState<boolean>(false);
  const [ipAddresses, setIpAddresses] = useState<string>('');
  const [customIncludes, setCustomIncludes] = useState<string>('');
  const [strictness, setStrictness] = useState<SpfStrictness>('~all');

  const toggleProvider = (id: string) => {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // Cálculo de resultado SPF
  const spfRecord = useMemo(() => {
    const parts: string[] = ['v=spf1'];

    if (includeMx) parts.push('mx');
    if (includeA) parts.push('a');

    // Proveedores seleccionados
    selectedProviders.forEach((provId) => {
      const prov = POPULAR_PROVIDERS.find((p) => p.id === provId);
      if (prov) {
        parts.push(`include:${prov.include}`);
      }
    });

    // Includes personalizados
    if (customIncludes.trim()) {
      const items = customIncludes
        .split(/[\s,]+/)
        .map((s) => s.trim().replace(/^include:/i, ''))
        .filter(Boolean);
      items.forEach((item) => {
        parts.push(`include:${item}`);
      });
    }

    // Direcciones IP
    if (ipAddresses.trim()) {
      const ips = ipAddresses
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      ips.forEach((ip) => {
        if (ip.includes(':')) {
          parts.push(`ip6:${ip.replace(/^ip6:/i, '')}`);
        } else {
          parts.push(`ip4:${ip.replace(/^ip4:/i, '')}`);
        }
      });
    }

    // Calificador final
    parts.push(strictness);

    return parts.join(' ');
  }, [includeMx, includeA, selectedProviders, customIncludes, ipAddresses, strictness]);

  // Estimador de lookups DNS RFC 7208 (Máximo 10)
  const estimatedLookups = useMemo(() => {
    let count = 0;
    if (includeMx) count += 1;
    if (includeA) count += 1;
    count += selectedProviders.length;
    if (customIncludes.trim()) {
      count += customIncludes.split(/[\s,]+/).filter(Boolean).length;
    }
    return count;
  }, [includeMx, includeA, selectedProviders, customIncludes]);

  // ==========================================
  // ESTADOS DEL GENERADOR DMARC
  // ==========================================
  const [policy, setPolicy] = useState<DmarcPolicy>('none');
  const [percentage, setPercentage] = useState<number>(100);
  const [ruaEmail, setRuaEmail] = useState<string>('seguridad@tudominio.com');
  const [rufEmail, setRufEmail] = useState<string>('');
  const [subdomainPolicy, setSubdomainPolicy] = useState<'inherit' | DmarcPolicy>('inherit');
  const [adkim, setAdkim] = useState<DmarcAlignment>('r');
  const [aspf, setAspf] = useState<DmarcAlignment>('r');

  // Cálculo de resultado DMARC
  const dmarcRecord = useMemo(() => {
    const parts: string[] = ['v=DMARC1', `p=${policy}`];

    if (percentage < 100) {
      parts.push(`pct=${percentage}`);
    }

    if (subdomainPolicy !== 'inherit') {
      parts.push(`sp=${subdomainPolicy}`);
    }

    const cleanRua = ruaEmail.trim().replace(/^mailto:/i, '');
    if (cleanRua) {
      parts.push(`rua=mailto:${cleanRua}`);
    }

    const cleanRuf = rufEmail.trim().replace(/^mailto:/i, '');
    if (cleanRuf) {
      parts.push(`ruf=mailto:${cleanRuf}`);
    }

    if (adkim === 's') {
      parts.push('adkim=s');
    }
    if (aspf === 's') {
      parts.push('aspf=s');
    }

    return parts.join('; ') + ';';
  }, [policy, percentage, subdomainPolicy, ruaEmail, rufEmail, adkim, aspf]);

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Pestañas de Navegación del Asistente */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Asistente DNS en Tiempo Real
              <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                RFC Compliant
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Genera registros TXT sintácticamente válidos listos para copiar y pegar.
            </p>
          </div>
        </div>

        {/* Botones de Tab */}
        <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('spf')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'spf'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Generador SPF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dmarc')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'dmarc'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Generador DMARC</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECCIÓN 1: GENERADOR SPF                                  */}
      {/* ========================================================= */}
      {activeTab === 'spf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario Guiado */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Paso A: Proveedores de Correo Populares */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                    1
                  </span>
                  <h3 className="text-sm font-bold text-slate-200">
                    Proveedores de Correo Electrónico
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Selecciona todos los servicios que envían correos por ti
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {POPULAR_PROVIDERS.map((provider) => {
                  const isSelected = selectedProviders.includes(provider.id);
                  return (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => toggleProvider(provider.id)}
                      className={`text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 relative ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {provider.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        include:{provider.include}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Includes Personalizados */}
              <div className="pt-2 border-t border-slate-800/60 flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <span>Otros proveedores personalizados (include:):</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. mailerlite.com, klaviyo.com (separados por espacio o coma)"
                  value={customIncludes}
                  onChange={(e) => setCustomIncludes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            {/* Paso B: Servidores Propios & IPs */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  2
                </span>
                <h3 className="text-sm font-bold text-slate-200">
                  Servidores Propios e Infraestructura (IP / MX / A)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={includeMx}
                    onChange={(e) => setIncludeMx(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Servidores de correo MX (+mx)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Permite el envío desde los servidores que reciben tu correo.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={includeA}
                    onChange={(e) => setIncludeA(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">
                      Servidor web principal (+a)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Permite envíos directos desde la IP del dominio web principal.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
                <label className="text-xs font-medium text-slate-300">
                  Direcciones IPv4 o IPv6 dedicadas (ip4: o ip6:):
                </label>
                <input
                  type="text"
                  placeholder="ej. 192.0.2.1, 198.51.100.0/24 (separadas por coma o espacio)"
                  value={ipAddresses}
                  onChange={(e) => setIpAddresses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            {/* Paso C: Calificador de Estrictez (~all, -all, ?all) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-200">
                  Calificador de Aplicación Final (Estrictez)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* ~all */}
                <button
                  type="button"
                  onClick={() => setStrictness('~all')}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                    strictness === '~all'
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">~all</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Recomendado
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">SoftFail</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      No rechaza tajantemente correos legítimos desviados, pero avisa a los filtros.
                    </p>
                  </div>
                </button>

                {/* -all */}
                <button
                  type="button"
                  onClick={() => setStrictness('-all')}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                    strictness === '-all'
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">-all</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Estricto
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Fail (Hard)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Máxima seguridad. Rechaza cualquier servidor no especificado explícitamente.
                    </p>
                  </div>
                </button>

                {/* ?all */}
                <button
                  type="button"
                  onClick={() => setStrictness('?all')}
                  className={`text-left p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                    strictness === '?all'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">?all</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Neutral
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Neutral</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Solo para períodos de prueba o migración inicial. Sin efecto punitivo.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resultado en Vivo y Copiar */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-5">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Registro SPF Generado
                </span>
                {/* Lookups count */}
                <div
                  className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                    estimatedLookups > 10
                      ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                      : estimatedLookups > 7
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="El estándar RFC 7208 impone un límite estricto de máximo 10 consultas DNS"
                >
                  Lookups DNS: {estimatedLookups}/10
                </div>
              </div>

              {estimatedLookups > 10 && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>¡Límite excedido!</strong> El estándar RFC 7208 invalida registros SPF
                    con más de 10 consultas DNS (PermError). Reduce los includes o agrupa servidores.
                  </span>
                </div>
              )}

              {/* Tarjeta de Datos DNS para el Proveedor */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* Tipo de Registro */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-xs">Tipo de Registro:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      TXT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('spf-type', 'TXT')}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title="Copiar tipo"
                    >
                      {copiedKey === 'spf-type' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Host / Nombre */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-sans text-xs block">Nombre / Host:</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      (En Cloudflare usa @, en otros deja en blanco o tu dominio)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">@</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('spf-host', '@')}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title="Copiar Host @"
                    >
                      {copiedKey === 'spf-host' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Valor Completo TXT */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-xs">Valor / Contenido:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('spf-value', spfRecord)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'spf-value' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-emerald-300 font-mono text-xs break-all select-all leading-relaxed">
                    {spfRecord}
                  </div>
                </div>
              </div>

              {/* Botón Acción Principal: Copiar Registro Completo */}
              <button
                type="button"
                onClick={() => handleCopy('spf-full', spfRecord)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedKey === 'spf-full' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>¡Registro Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>Copiar Registro SPF Completo</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-emerald-400 transition inline-flex items-center gap-1"
                >
                  <span>¿Ya lo añadiste? Probar en una auditoría en vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN 2: GENERADOR DMARC                                */}
      {/* ========================================================= */}
      {activeTab === 'dmarc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario Guiado */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Paso A: Política de Aplicación (p=) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-200">
                  Política de Aplicación Principal (p=)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Determina qué deben hacer los servidores receptores (Gmail, Yahoo, Outlook) cuando
                reciben correos no autorizados con tu dominio.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* p=none */}
                <button
                  type="button"
                  onClick={() => setPolicy('none')}
                  className={`text-left p-4 rounded-xl border transition flex flex-col gap-2 ${
                    policy === 'none'
                      ? 'bg-sky-500/10 border-sky-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-400">p=none</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      Inicial
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Monitoreo Solo</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      No bloquea correos. Solo recolecta reportes RUA para auditar remitentes.
                    </p>
                  </div>
                </button>

                {/* p=quarantine */}
                <button
                  type="button"
                  onClick={() => setPolicy('quarantine')}
                  className={`text-left p-4 rounded-xl border transition flex flex-col gap-2 ${
                    policy === 'quarantine'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">p=quarantine</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Equilibrado
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Cuarentena</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Envía correos fraudulentos a la carpeta de Spam / Correo no deseado.
                    </p>
                  </div>
                </button>

                {/* p=reject */}
                <button
                  type="button"
                  onClick={() => setPolicy('reject')}
                  className={`text-left p-4 rounded-xl border transition flex flex-col gap-2 ${
                    policy === 'reject'
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">p=reject</span>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Blindaje Total
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Rechazo Total</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      Rechaza en el servidor de destino cualquier correo falso. Máxima protección.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Paso B: Porcentaje de Cobertura (pct=) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-slate-200">
                    Porcentaje de Aplicación (pct=)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                  {percentage}% de los mensajes
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Permite un despliegue gradual de tu política (ej. empezar con 25% y aumentar al 100%).
              </p>

              <div className="flex items-center gap-4 pt-2">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>1% (Muestreo gradual)</span>
                <span>50%</span>
                <span className="font-bold text-emerald-400">100% (Protección Total)</span>
              </div>
            </div>

            {/* Paso C: Correo para Informes RUA y RUF */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  3
                </span>
                <h3 className="text-sm font-bold text-slate-200">
                  Dirección de Correo para Informes Agregados (rua=)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Los proveedores te enviarán reportes XML diarios detallando quién envía correos en tu nombre.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-slate-300">
                  Buzón de Reportes RUA:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={ruaEmail}
                    onChange={(e) => setRuaEmail(e.target.value)}
                    placeholder="seguridad@tudominio.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/60">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span>Buzón de Reportes Forenses RUF (Opcional):</span>
                  <span className="text-[10px] text-slate-400">Solo fallos inmediatos</span>
                </label>
                <input
                  type="email"
                  value={rufEmail}
                  onChange={(e) => setRufEmail(e.target.value)}
                  placeholder="forensics@tudominio.com (opcional)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 font-mono placeholder:text-slate-600 outline-none transition"
                />
              </div>
            </div>

            {/* Paso D: Alineación DKIM y SPF (adkim= y aspf=) */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                  4
                </span>
                <h3 className="text-sm font-bold text-slate-200">
                  Modos de Alineación DKIM y SPF
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* adkim */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Alineación DKIM (adkim=)</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {adkim === 'r' ? 'Relajada' : 'Estricta'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdkim('r')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                        adkim === 'r'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Relajada (r)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdkim('s')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                        adkim === 's'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Estricta (s)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {adkim === 'r'
                      ? 'Permite que subdominios coincidan con el dominio principal (Recomendado).'
                      : 'Requiere coincidencia de dominio exacta 1:1 en la firma DKIM.'}
                  </p>
                </div>

                {/* aspf */}
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Alineación SPF (aspf=)</span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {aspf === 'r' ? 'Relajada' : 'Estricta'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAspf('r')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                        aspf === 'r'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Relajada (r)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAspf('s')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition ${
                        aspf === 's'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Estricta (s)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {aspf === 'r'
                      ? 'Acepta remitentes en subdominios (ej. mail.tudominio.com).'
                      : 'Exige que el Return-Path sea idéntico al encabezado From.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resultado DMARC y Copiar */}
          <div className="lg:col-span-5 sticky top-24 flex flex-col gap-5">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  Registro DMARC Generado
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    policy === 'reject'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : policy === 'quarantine'
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  }`}
                >
                  {policy.toUpperCase()}
                </span>
              </div>

              {/* Tarjeta de Datos DNS para el Proveedor */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                {/* Tipo de Registro */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans text-xs">Tipo de Registro:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                      TXT
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy('dmarc-type', 'TXT')}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title="Copiar tipo"
                    >
                      {copiedKey === 'dmarc-type' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Host / Nombre */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-sans text-xs block">Nombre / Host:</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      (Siempre debe ser exactamente _dmarc)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-300">_dmarc</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('dmarc-host', '_dmarc')}
                      className="text-slate-400 hover:text-slate-200 transition"
                      title="Copiar Host _dmarc"
                    >
                      {copiedKey === 'dmarc-host' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Valor Completo TXT */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-xs">Valor / Contenido:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('dmarc-value', dmarcRecord)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-sans font-semibold transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'dmarc-value' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-teal-300 font-mono text-xs break-all select-all leading-relaxed">
                    {dmarcRecord}
                  </div>
                </div>
              </div>

              {/* Botón Acción Principal: Copiar Registro Completo */}
              <button
                type="button"
                onClick={() => handleCopy('dmarc-full', dmarcRecord)}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedKey === 'dmarc-full' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>¡Registro Copiado al Portapapeles!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>Copiar Registro DMARC Completo</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/"
                  className="text-xs text-slate-400 hover:text-teal-400 transition inline-flex items-center gap-1"
                >
                  <span>¿Ya lo añadiste? Probar en una auditoría en vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECCIÓN 3: GUÍA RÁPIDA DE PUBLICACIÓN EN REGISTRADORES   */}
      {/* ========================================================= */}
      <div className="mt-6 p-8 rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                ¿Dónde y cómo pego estos registros en mi proveedor DNS?
              </h3>
              <p className="text-xs text-slate-400">
                Pega siempre como tipo <strong>TXT</strong> en el panel de control de tu registrador.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cloudflare */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Cloudflare DNS</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                TTL Auto
              </span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Entra a tu zona y haz clic en <strong>DNS &gt; Records</strong>.</li>
              <li>Presiona <strong>Add record</strong> y selecciona Tipo <strong>TXT</strong>.</li>
              <li>En <em>Name</em> ingresa <code className="text-emerald-300 font-mono">@</code> (para SPF) o <code className="text-teal-300 font-mono">_dmarc</code>.</li>
              <li>Pega el valor generado en <em>Content</em> y guarda.</li>
            </ol>
          </div>

          {/* GoDaddy */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">GoDaddy</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                TTL 1/2 hora
              </span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Ve a <strong>Mis productos &gt; DNS</strong> de tu dominio.</li>
              <li>Haz clic en <strong>Agregar nuevo registro</strong>.</li>
              <li>Selecciona Tipo <strong>TXT</strong>.</li>
              <li>En <em>Nombre</em> pon <code className="text-emerald-300 font-mono">@</code> o <code className="text-teal-300 font-mono">_dmarc</code> y en <em>Valor</em> pega el registro.</li>
            </ol>
          </div>

          {/* Namecheap */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Namecheap</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Advanced DNS
              </span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Abre <strong>Domain List</strong> y pulsa en <strong>Manage</strong>.</li>
              <li>Pestaña <strong>Advanced DNS &gt; Add New Record</strong>.</li>
              <li>Tipo <strong>TXT Record</strong>.</li>
              <li>Host: <code className="text-emerald-300 font-mono">@</code> o <code className="text-teal-300 font-mono">_dmarc</code>. Valor: Pega el texto y pulsa el check verde.</li>
            </ol>
          </div>

          {/* Squarespace */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Squarespace</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Custom Records
              </span>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Menú <strong>Configuración &gt; Dominios &gt; Configuración DNS</strong>.</li>
              <li>Baja hasta <strong>Registros personalizados</strong> y pulsa <strong>Añadir registro</strong>.</li>
              <li>Tipo <strong>TXT</strong>.</li>
              <li>Host: <code className="text-emerald-300 font-mono">@</code> o <code className="text-teal-300 font-mono">_dmarc</code>. Guarda los cambios.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
