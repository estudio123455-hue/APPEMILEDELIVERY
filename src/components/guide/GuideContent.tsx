'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Server,
  Mail,
  Lock,
  Layers,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Globe,
  FileText,
  Info,
  CheckCircle,
  HelpCircle,
  Clock,
  Zap,
} from 'lucide-react';

type RegistrarTab = 'squarespace' | 'namecheap' | 'cloudflare' | 'godaddy';
type RfcTab = 'spf' | 'dmarc' | 'dkim' | 'bulk2024';

export default function GuideContent() {
  const [activeRfcTab, setActiveRfcTab] = useState<RfcTab>('spf');
  const [activeRegistrarTab, setActiveRegistrarTab] = useState<RegistrarTab>('squarespace');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="w-full flex flex-col gap-16">
      {/* ========================================================= */}
      {/* SECCIÓN 1: ESTÁNDARES OFICIALES IETF (RFCs)               */}
      {/* ========================================================= */}
      <section id="rfcs" className="flex flex-col gap-8 scroll-mt-24">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Normativas Oficiales de Internet
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Estándares IETF Explicados en Lenguaje Humano
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            La entregabilidad de correo no es magia ni suerte: se rige por protocolos RFC estrictos
            que los proveedores como Google, Yahoo y Microsoft validan antes de aceptar cada mensaje.
          </p>
        </div>

        {/* Selector de Pestañas de RFC */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveRfcTab('spf')}
            className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRfcTab === 'spf'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>RFC 7208 (SPF)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRfcTab('dmarc')}
            className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRfcTab === 'dmarc'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>RFC 7489 (DMARC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRfcTab('dkim')}
            className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRfcTab === 'dkim'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>RFC 6376 (DKIM)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRfcTab('bulk2024')}
            className={`p-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeRfcTab === 'bulk2024'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Reglas 2024+ (Google/Yahoo)</span>
          </button>
        </div>

        {/* Contenido Dinámico de la Pestaña Seleccionada */}

        {/* 1. RFC 7208 - SPF */}
        {activeRfcTab === 'spf' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Estándar IETF RFC 7208
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  Sender Policy Framework (SPF)
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Registro DNS Tipo TXT en Host @
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  ¿Qué es y cómo funciona?
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  SPF es una lista pública en tus DNS que le dice al mundo exactamente cuáles servidores
                  e IPs tienen permiso de enviar correos con tu nombre de dominio en la cabecera{' '}
                  <code className="text-emerald-300 font-mono">Return-Path</code> (envelope sender).
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cuando envías un correo, el servidor de Google o Microsoft consulta el DNS de tu
                  dominio. Si la IP del servidor emisor está en tu lista SPF, el correo pasa la
                  autenticación (<code className="text-emerald-300 font-mono">spf=pass</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-2.5">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  El Peligro Crítico: Límite de 10 DNS Lookups
                </h4>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  El estándar RFC 7208 estipula que un registro SPF <strong>no puede requerir más de 10 consultas DNS</strong>{' '}
                  para resolver todos sus <code className="font-mono">include:</code>, <code className="font-mono">a</code>,{' '}
                  <code className="font-mono">mx</code> y <code className="font-mono">redirect</code>.
                </p>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Si acumulas demasiadas herramientas (ej. Google + HubSpot + SendGrid + Klaviyo + Zendesk),
                  el servidor receptor aborta la evaluación con error <strong>PermError</strong>, lo que equivale a no
                  tener SPF y manda tus correos directamente a Spam.
                </p>
              </div>
            </div>

            {/* Comparativa de Políticas de Calificador */}
            <div className="flex flex-col gap-3 pt-2">
              <h4 className="text-sm font-bold text-slate-200">
                Calificadores Finales: ¿Cuándo usar <code className="text-emerald-400 font-mono">~all</code> vs <code className="text-indigo-400 font-mono">-all</code>?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">~all (SoftFail)</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Recomendado por la industria
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Si un servidor no listado envía un correo, el receptor lo acepta pero lo marca con sospecha.
                    Evita que correos legítimos desviados por reenvíos automáticos (email forwarding) sean rebotados
                    bruscamente antes de que DMARC pueda evaluarlos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400">-all (HardFail)</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      Estricto / Riguroso
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Instruye al receptor a descartar o rebotar inmediatamente cualquier mensaje proveniente de IPs
                    no autorizadas. Debe usarse solo cuando tengas el 100% de control sobre todos tus flujos de envío
                    y DKIM esté perfectamente alineado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. RFC 7489 - DMARC */}
        {activeRfcTab === 'dmarc' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Estándar IETF RFC 7489
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  DMARC: El Escudo Definitivo contra la Suplantación
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Registro DNS TXT en Host _dmarc
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              DMARC resuelve la mayor falla del correo tradicional: mientras SPF y DKIM operan en capas técnicas
              invisibles, los estafadores falsifican el encabezado visual <strong>&quot;De:&quot; (From:)</strong> que ve el usuario.
              DMARC exige que el dominio visible coincida con los certificados criptográficos (Alineación) y te da el control de ordenar qué hacer si alguien finge ser tú.
            </p>

            {/* Fases de Implementación DMARC */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-slate-200">
                Ruta de Implementación Gradual Recomendada (3 Fases):
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fase 1 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-400">p=none</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300">
                      Fase 1: Auditoría
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">Solo Monitoreo</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    No bloquea ni altera ningún correo. Solo activa la recolección de reportes RUA para que descubras
                    todos los servicios que envían en tu nombre sin riesgo de romper entregas legítimas.
                  </p>
                </div>

                {/* Fase 2 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">p=quarantine</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Fase 2: Aislamiento
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">Cuarentena a Spam</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Los correos no autorizados dejan de llegar a la bandeja de entrada y son desviados a la carpeta
                    de Correo No Deseado o Spam. Protege a tus clientes mientras ajustas servicios secundarios.
                  </p>
                </div>

                {/* Fase 3 */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">p=reject</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Fase 3: Blindaje Total
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-200">Rechazo Inmediato</h5>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El estándar más seguro del mundo. Los servidores de Google, Yahoo y Microsoft rechazan la conexión
                    en el acto. Ningún estafador en el planeta puede enviar correos que digan venir de tu dominio.
                  </p>
                </div>
              </div>
            </div>

            {/* RUA vs RUF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-teal-400">rua=mailto:... (Reportes Agregados)</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Archivos XML comprimidos enviados diariamente por los proveedores de correo con estadísticas
                  de volumen, porcentaje de éxito y las direcciones IP emisoras.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-mono font-bold text-teal-400">ruf=mailto:... (Reportes Forenses)</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Notificaciones instantáneas enviadas en el milisegundo exacto en que un correo individual falla la prueba,
                  incluyendo las cabeceras originales del intento de fraude.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. RFC 6376 - DKIM */}
        {activeRfcTab === 'dkim' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Estándar IETF RFC 6376
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  DomainKeys Identified Mail (DKIM)
                </h3>
              </div>
              <span className="text-xs font-mono bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg self-start sm:self-auto">
                Registros CNAME / TXT por Selector
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Criptografía de Clave Pública y Firma Digital
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  DKIM coloca una firma criptográfica invisible en los encabezados de cada correo
                  (<code className="text-emerald-300 font-mono">DKIM-Signature</code>). Esta firma se genera usando una{' '}
                  <strong>clave privada</strong> que solo tu proveedor de correo conoce.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La <strong>clave pública</strong> se aloja en un registro DNS bajo un selector específico{' '}
                  (<code className="text-emerald-300 font-mono">selector._domainkey.tudominio.com</code>). Si el correo es interceptado o alterado en tránsito, la firma se rompe y el receptor lo marca como ilegítimo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-3">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  El Estándar de Llaves RSA de 2048 Bits
                </h4>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Históricamente, muchos servidores usaban llaves de 1024 bits. Sin embargo, debido a la capacidad de
                  cómputo moderna, <strong>Google, Yahoo y Apple exigen llaves de al menos 2048 bits</strong> para considerar un mensaje confiable.
                </p>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Asegúrate de que en Google Workspace o en tus APIs de correo (Resend, SendGrid) selecciones siempre
                  longitud de clave <strong>2048 bits</strong> al generar el selector.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Requisitos 2024+ Google & Yahoo */}
        {activeRfcTab === 'bulk2024' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Obligatorio desde Febrero 2024
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">
                  Reglas de Google & Yahoo para Remitentes (Bulk Senders)
                </h3>
              </div>
              <span className="text-xs font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1.5 rounded-lg self-start sm:self-auto font-bold">
                Aplicación Estricta Activa
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Si tu dominio envía más de 5,000 correos al día (o envíos masivos comerciales), Google y Yahoo
              bloquean o envían a Spam directamente a los dominios que no cumplan simultáneamente con estas 4 exigencias:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-200">1. DMARC Obligatorio</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Debes tener al menos <code className="text-emerald-300 font-mono">p=none</code> configurado en{' '}
                  <code className="text-emerald-300 font-mono">_dmarc.tudominio.com</code> con reporte RUA activo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-200">2. Alineación SPF y DKIM</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  El dominio en el encabezado visible <code className="text-emerald-300 font-mono">From:</code> debe
                  estar alineado con el dominio autenticado por SPF o por DKIM.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-200">3. Tasa de Spam Menor al 0.3%</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Si más de 3 de cada 1,000 destinatarios marcan tus correos como spam en Google Postmaster Tools,
                  tu dominio es degradado a Spam de manera automática.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-200">4. Desuscripción en 1 Clic (RFC 8058)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Los correos masivos deben incluir las cabeceras{' '}
                  <code className="text-emerald-300 font-mono">List-Unsubscribe-Post: List-Unsubscribe=One-Click</code>{' '}
                  permitiendo desuscribirse con un botón nativo en el cliente de correo.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 2: GUÍAS PRÁCTICAS POR REGISTRADOR                */}
      {/* ========================================================= */}
      <section id="registradores" className="flex flex-col gap-8 scroll-mt-24">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider font-bold">
            <Globe className="w-3.5 h-3.5" />
            Configuración Práctica de Registradores
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Dónde y Cómo Pegar Tus Registros DNS
          </h2>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Instrucciones exactas paso a paso para los proveedores de dominio más populares,
            evitando los errores de sintaxis comunes que invalidan los registros.
          </p>
        </div>

        {/* Tabs de Registradores */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveRegistrarTab('squarespace')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeRegistrarTab === 'squarespace'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Squarespace Domains (ex Google Domains)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRegistrarTab('namecheap')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeRegistrarTab === 'namecheap'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Namecheap (Advanced DNS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRegistrarTab('cloudflare')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeRegistrarTab === 'cloudflare'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Cloudflare DNS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRegistrarTab('godaddy')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeRegistrarTab === 'godaddy'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>GoDaddy</span>
          </button>
        </div>

        {/* Contenido Registrador: Squarespace */}
        {activeRegistrarTab === 'squarespace' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Configuración en Squarespace Domains</span>
                <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded">
                  Incluye dominios migrados de Google Domains
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sigue esta ruta en tu cuenta de Squarespace para acceder a la zona DNS autoritativa.
              </p>
            </div>

            <ol className="text-xs sm:text-sm text-slate-300 space-y-3 list-decimal list-inside leading-relaxed bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <li>Inicia sesión en tu panel de control de Squarespace y ve a <strong>Dominios</strong>.</li>
              <li>Haz clic en el nombre de tu dominio y selecciona <strong>Configuración de DNS</strong> (en el menú lateral o superior).</li>
              <li>Baja por la página hasta encontrar la sección <strong>Registros personalizados</strong> (Custom Records).</li>
              <li>Haz clic en el botón <strong>Añadir registro</strong> (Add Record).</li>
              <li>Selecciona el tipo de registro (<strong>TXT</strong> o <strong>CNAME</strong>) y llena los campos correspondientes.</li>
            </ol>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block font-bold">¡Alerta Importante de Sintaxis en Squarespace!</strong>
                <span>
                  No escribas tu nombre de dominio completo en el campo <em>Host</em>. Para el registro SPF raíz, ingresa{' '}
                  <code className="text-amber-200 font-mono font-bold">@</code>. Para DMARC, escribe únicamente{' '}
                  <code className="text-amber-200 font-mono font-bold">_dmarc</code> (sin tu dominio al final).
                </span>
              </div>
            </div>

            {/* Tabla de Ejemplo */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-300">Valores de Ejemplo para Pegar:</span>
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">Tipo</th>
                      <th className="py-2.5 px-3">Host</th>
                      <th className="py-2.5 px-3">Datos / Valor</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    <tr>
                      <td className="py-3 px-3 text-emerald-400 font-bold">TXT</td>
                      <td className="py-3 px-3">@</td>
                      <td className="py-3 px-3 break-all">v=spf1 include:_spf.google.com ~all</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy('sq-spf', 'v=spf1 include:_spf.google.com ~all')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                        >
                          {copiedKey === 'sq-spf' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-teal-400 font-bold">TXT</td>
                      <td className="py-3 px-3">_dmarc</td>
                      <td className="py-3 px-3 break-all">v=DMARC1; p=quarantine; rua=mailto:seguridad@tudominio.com;</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleCopy('sq-dmarc', 'v=DMARC1; p=quarantine; rua=mailto:seguridad@tudominio.com;')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px]"
                        >
                          {copiedKey === 'sq-dmarc' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Registrador: Namecheap */}
        {activeRegistrarTab === 'namecheap' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-100">
                Configuración en Namecheap (Advanced DNS)
              </h3>
              <p className="text-xs text-slate-400">
                Paso a paso para publicar registros cuando usas los Namecheap BasicDNS o PremiumDNS.
              </p>
            </div>

            <ol className="text-xs sm:text-sm text-slate-300 space-y-3 list-decimal list-inside leading-relaxed bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <li>Inicia sesión y abre el menú <strong>Domain List</strong> en la barra lateral izquierda.</li>
              <li>Busca tu dominio y pulsa el botón <strong>Manage</strong> a la derecha.</li>
              <li>Haz clic en la pestaña superior <strong>Advanced DNS</strong>.</li>
              <li>Bajo la tabla de registros, pulsa el botón rojo <strong>+ ADD NEW RECORD</strong>.</li>
              <li>Selecciona <strong>TXT Record</strong> o <strong>CNAME Record</strong>.</li>
              <li>Rellena <em>Host</em>, <em>Value</em> y pulsa el <strong>icono verde de confirmación (✓)</strong> para guardar.</li>
            </ol>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-200 block mb-1">Consejo de TTL en Namecheap:</strong>
              Puedes dejar el TTL en <strong>Automatic</strong> o colocarlo en <strong>1 min / 30 min</strong> durante períodos de prueba para que los cambios se propaguen rápidamente.
            </div>
          </div>
        )}

        {/* Contenido Registrador: Cloudflare */}
        {activeRegistrarTab === 'cloudflare' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Configuración en Cloudflare DNS</span>
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Propagación Ultra Rápida
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cloudflare cuenta con una de las infraestructuras DNS más rápidas del mundo.
              </p>
            </div>

            <ol className="text-xs sm:text-sm text-slate-300 space-y-3 list-decimal list-inside leading-relaxed bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <li>Ingresa a tu cuenta de Cloudflare y selecciona el sitio web o dominio.</li>
              <li>En el menú lateral izquierdo, haz clic en <strong>DNS &gt; Records</strong>.</li>
              <li>Pulsa el botón azul <strong>Add record</strong>.</li>
              <li>En <em>Type</em> elige <strong>TXT</strong> (para SPF y DMARC) o <strong>CNAME</strong> (para selectores DKIM).</li>
              <li>En <em>Name</em> ingresa <code className="text-emerald-300 font-mono">@</code> para la raíz o <code className="text-teal-300 font-mono">_dmarc</code>.</li>
              <li>En <em>Content</em> pega el valor del registro y presiona <strong>Save</strong>.</li>
            </ol>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong className="block font-bold">¡Atención con el Proxy Naranja de Cloudflare!</strong>
                <span>
                  Los registros de correo y verificación TXT siempre se manejan en modo directo. Si agregas registros{' '}
                  <strong>CNAME de DKIM</strong>, asegúrate de cambiar el estado de Proxy a{' '}
                  <strong>DNS Only (Nube Gris)</strong>; de lo contrario, los servidores receptores no podrán resolver las firmas.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contenido Registrador: GoDaddy */}
        {activeRegistrarTab === 'godaddy' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-slate-100">
                Configuración en GoDaddy
              </h3>
              <p className="text-xs text-slate-400">
                Instrucciones para la interfaz actualizada de gestión de dominios de GoDaddy.
              </p>
            </div>

            <ol className="text-xs sm:text-sm text-slate-300 space-y-3 list-decimal list-inside leading-relaxed bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
              <li>Inicia sesión y dirígete a tu página de <strong>Mis productos</strong>.</li>
              <li>Localiza tu dominio y haz clic en los tres puntos o directamente en <strong>DNS</strong>.</li>
              <li>En la sección <strong>Registros DNS</strong>, pulsa <strong>Agregar nuevo registro</strong>.</li>
              <li>Selecciona Tipo <strong>TXT</strong> en el menú desplegable.</li>
              <li>En el campo <em>Nombre</em> escribe <code className="text-emerald-300 font-mono">@</code> (para SPF) o <code className="text-teal-300 font-mono">_dmarc</code> (para DMARC).</li>
              <li>En el campo <em>Valor</em> pega el registro completo y haz clic en <strong>Guardar</strong>.</li>
            </ol>
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECCIÓN 3: CALL TO ACTION (CTA) INTEGRADO                 */}
      {/* ========================================================= */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center justify-center md:justify-start gap-2 text-xs font-mono font-bold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Automatización en 1 Clic</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ¿No quieres lidiar con la sintaxis manual?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Nuestro Asistente Interactivo genera tus registros SPF y DMARC sin errores tipográficos,
            calculando en tiempo real los límites de lookups y políticas de cuarentena.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link
            href="/tools/generator"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Usar Generador DNS</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition flex items-center justify-center gap-2"
          >
            <span>Auditar mi Dominio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
