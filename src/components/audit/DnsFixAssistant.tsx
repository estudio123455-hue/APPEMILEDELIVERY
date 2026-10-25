'use client';

import { useState } from 'react';

export interface DnsFixAssistantProps {
  domain: string;
  hasSpf: boolean;
  hasDmarc: boolean;
  userEmail?: string;
}

type EmailProviderKey = 'google' | 'microsoft' | 'zoho' | 'cpanel';

interface EmailProviderOption {
  key: EmailProviderKey;
  name: string;
  badge: string;
  spfRecord: string;
}

const EMAIL_PROVIDERS: EmailProviderOption[] = [
  {
    key: 'google',
    name: 'Google Workspace',
    badge: 'Gmail Empresarial',
    spfRecord: 'v=spf1 include:_spf.google.com ~all',
  },
  {
    key: 'microsoft',
    name: 'Microsoft 365',
    badge: 'Outlook / Exchange',
    spfRecord: 'v=spf1 include:spf.protection.outlook.com ~all',
  },
  {
    key: 'zoho',
    name: 'Zoho Mail',
    badge: 'Zoho Workplace',
    spfRecord: 'v=spf1 include:zoho.com ~all',
  },
  {
    key: 'cpanel',
    name: 'Webmail / cPanel',
    badge: 'Servidor Propio',
    spfRecord: 'v=spf1 +a +mx ~all',
  },
];

type RegistrarKey = 'cloudflare' | 'godaddy' | 'namecheap' | 'squarespace';

interface RegistrarGuide {
  key: RegistrarKey;
  name: string;
  steps: string[];
}

const REGISTRAR_GUIDES: RegistrarGuide[] = [
  {
    key: 'cloudflare',
    name: 'Cloudflare',
    steps: [
      'Inicia sesión en Cloudflare, selecciona tu dominio y ve a la sección "DNS" > "Registros".',
      'Haz clic en el botón azul "Añadir registro" y selecciona Tipo "TXT".',
      'En "Nombre" coloca @ (para SPF) o _dmarc (para DMARC). Pega el Valor en "Contenido" y haz clic en "Guardar".',
    ],
  },
  {
    key: 'godaddy',
    name: 'GoDaddy',
    steps: [
      'Ve a "Mis productos" en GoDaddy, busca tu dominio y haz clic en "Administrar DNS".',
      'En la sección Registros DNS, haz clic en "Añadir nuevo registro" y elige Tipo "TXT".',
      'En "Nombre" ingresa @ o _dmarc. En "Valor" pega el contenido generado y presiona "Guardar".',
    ],
  },
  {
    key: 'namecheap',
    name: 'Namecheap',
    steps: [
      'En tu "Dashboard", ve a "Domain List", haz clic en "Manage" y luego entra en la pestaña "Advanced DNS".',
      'Haz clic en "Add New Record" y selecciona "TXT Record" en el menú desplegable.',
      'En "Host" escribe @ o _dmarc, pega el texto en "Value" y haz clic en el visto bueno verde (Save Changes).',
    ],
  },
  {
    key: 'squarespace',
    name: 'Squarespace / Google Domains',
    steps: [
      'Entra a tu panel de Dominios en Squarespace, selecciona el dominio y abre "Configuración de DNS".',
      'Desplázate hasta "Registros personalizados" y haz clic en "Añadir registro".',
      'Selecciona Tipo "TXT", en Host escribe @ o _dmarc, pega el valor en "Datos" y guarda los cambios.',
    ],
  },
];

export default function DnsFixAssistant({
  domain,
  hasSpf,
  hasDmarc,
  userEmail,
}: DnsFixAssistantProps) {
  const [selectedProvider, setSelectedProvider] = useState<EmailProviderKey>('google');
  const [selectedRegistrar, setSelectedRegistrar] = useState<RegistrarKey>('cloudflare');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Si ambos registros son válidos y robustos, no es necesario mostrar el asistente
  if (hasSpf && hasDmarc) {
    return null;
  }

  const currentProvider =
    EMAIL_PROVIDERS.find((p) => p.key === selectedProvider) || EMAIL_PROVIDERS[0];

  const currentRegistrar =
    REGISTRAR_GUIDES.find((r) => r.key === selectedRegistrar) || REGISTRAR_GUIDES[0];

  const dmarcRecordValue = `v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@${domain};`;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <section className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col gap-8 relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-sky-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/10">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.67 2.67 0 0021 17.25l-5.83-5.83m0 0a5.25 5.25 0 10-7.42-7.42 5.25 5.25 0 007.42 7.42zm0 0L4.75 19.5"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Doctor de Entregabilidad
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full">
                Reparación en 1 Clic
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mt-1">
              Asistente de Corrección Inmediata
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-xl">
              No necesitas ser un experto en DNS. Generamos los registros exactos para{' '}
              <span className="text-slate-200 font-semibold">{domain}</span> listos para copiar y
              proteger tus envíos.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Traductor de Impacto Real (Lenguaje claro) */}
      <div className="flex flex-col gap-3.5 relative z-10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
          <span>🚨</span> Impacto Directo en tu Negocio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Alerta DMARC */}
          {!hasDmarc && (
            <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286zm0 13.036h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-rose-300">
                  Peligro de Suplantación de Identidad (Sin DMARC)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cualquier estafador en internet puede enviar correos usando{' '}
                  <strong className="text-rose-200">@{domain}</strong> y engañar a tus clientes
                  porque tu dominio no tiene blindaje DMARC.
                </p>
              </div>
            </div>
          )}

          {/* Alerta SPF */}
          {!hasSpf && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-3.5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-amber-300">
                  Peligro de Caída en Spam (Sin SPF)
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Proveedores como Gmail, Yahoo y Outlook desconfían de tus envíos y están enviando
                  tus cotizaciones a la carpeta de correo no deseado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Selector de Proveedor de Correo */}
      <div className="flex flex-col gap-3 relative z-10">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
          <span>⚙️</span> Selecciona tu Proveedor de Correo:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EMAIL_PROVIDERS.map((provider) => {
            const isSelected = selectedProvider === provider.key;
            return (
              <button
                key={provider.key}
                type="button"
                onClick={() => setSelectedProvider(provider.key)}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-tight">{provider.name}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{provider.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Cajas de Copiado Asistido */}
      <div className="flex flex-col gap-4 relative z-10">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
          <span>📋</span> Registros Listos para Copiar y Pegar
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Caja SPF (si falta) */}
          {!hasSpf ? (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4 shadow-sm hover:border-slate-700 transition">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      REGISTRO SPF
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Para {currentProvider.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Tipo: TXT</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500">Tipo</span>
                    <span className="font-mono font-bold text-emerald-400">TXT</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500">Host / Nombre</span>
                    <span className="font-mono font-bold text-slate-200">
                      @ <span className="text-[10px] font-normal text-slate-400">(o vacío)</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Valor / Contenido:</span>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-amber-300/90 break-all select-all">
                    {currentProvider.spfRecord}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(currentProvider.spfRecord, 'spf')}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                {copiedField === 'spf' ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-emerald-400">¡Registro SPF Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    <span>Copiar Registro SPF</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-300">SPF Configurado</span>
                <span className="text-[11px] text-slate-400">
                  Tu dominio ya cuenta con un registro SPF válido.
                </span>
              </div>
            </div>
          )}

          {/* Caja DMARC (si falta) */}
          {!hasDmarc ? (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4 shadow-sm hover:border-slate-700 transition">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      REGISTRO DMARC
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Blindaje Recomendado
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Tipo: TXT</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500">Tipo</span>
                    <span className="font-mono font-bold text-emerald-400">TXT</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-500">Host / Nombre</span>
                    <span className="font-mono font-bold text-sky-400">_dmarc</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-medium text-slate-400">Valor / Contenido:</span>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-sky-300/90 break-all select-all">
                    {dmarcRecordValue}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(dmarcRecordValue, 'dmarc')}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition flex items-center justify-center gap-2"
              >
                {copiedField === 'dmarc' ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <span className="text-emerald-400">¡Registro DMARC Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    <span>Copiar Registro DMARC</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-950/10 border border-emerald-500/20 flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                ✓
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-emerald-300">DMARC Configurado</span>
                <span className="text-[11px] text-slate-400">
                  Tu dominio ya cuenta con una política de protección DMARC.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Guía Rápida de Aplicación en 3 Pasos */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col gap-4 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">📖</span>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
              Guía de Aplicación en 3 Pasos Universales
            </h4>
          </div>

          {/* Selector de Proveedor de Dominio */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {REGISTRAR_GUIDES.map((registrar) => (
              <button
                key={registrar.key}
                type="button"
                onClick={() => setSelectedRegistrar(registrar.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedRegistrar === registrar.key
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {registrar.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pasos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          {currentRegistrar.steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {idx === 0
                    ? 'Administración DNS'
                    : idx === 1
                    ? 'Añadir Registro TXT'
                    : 'Guardar y Aplicar'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 italic text-center sm:text-left pt-1">
          * Nota: La propagación de los registros DNS en internet suele tomar entre 5 y 30 minutos. Tras guardar, vuelve a auditar tu dominio en DeliverabilityGuard.
        </p>
      </div>
    </section>
  );
}
