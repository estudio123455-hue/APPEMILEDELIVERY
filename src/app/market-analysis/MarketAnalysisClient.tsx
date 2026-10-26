'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import {
  TrendingUp,
  Search,
  MessageSquare,
  HelpCircle,
  Activity,
  Sparkles,
  Filter,
  Copy,
  Check,
  Download,
  ExternalLink,
  Share2,
  Compass,
  BarChart3,
  PieChart,
  Bell,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Tag,
} from 'lucide-react';

interface QuestionBranch {
  label: string;
  badgeColor: string;
  questions: string[];
}

interface NichePreset {
  name: string;
  queries: Record<string, QuestionBranch>;
}

const NICHE_PRESETS: Record<string, NichePreset> = {
  dns: {
    name: 'Ciberseguridad & Entregabilidad DNS',
    queries: {
      que: {
        label: '¿QUÉ? (Definición & Alcance)',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        questions: [
          '¿Qué pasa si mi dominio no tiene política DMARC configurada?',
          '¿Qué es la nueva normativa de remitentes masivos de Google y Yahoo 2024?',
          '¿Qué diferencia técnica existe entre los protocolos SPF y DKIM?',
          '¿Qué significa un reporte DMARC con policy p=quarantine o reject?',
        ],
      },
      como: {
        label: '¿CÓMO? (Implementación & Procesos)',
        badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        questions: [
          '¿Cómo evitar que mis cotizaciones y propuestas caigan en la carpeta de Spam?',
          '¿Cómo configurar el registro SPF en Squarespace sin duplicar el campo Host?',
          '¿Cómo comprobar si la IP de mi servidor de correo está en listas negras (DNSBL)?',
          '¿Cómo implementar certificados BIMI para mostrar el logotipo de mi empresa en buzones?',
        ],
      },
      porque: {
        label: '¿POR QUÉ? (Causas de Rechazo & Fricción)',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        questions: [
          '¿Por qué Gmail rechaza los correos de mi dominio con el código de rebote 550?',
          '¿Por qué mis mensajes van a la pestaña "Promociones" en lugar de la Bandeja Principal?',
          '¿Por qué Outlook clasifica mis correos entrantes como remitente no seguro?',
          '¿Por qué el límite de 10 lookups DNS de SPF bloquea la entrega de mis emails?',
        ],
      },
      cuando: {
        label: '¿CUÁNDO? (Oportunidad & Urgencia)',
        badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        questions: [
          '¿Cuándo es el momento adecuado para endurecer DMARC de p=none a p=reject?',
          '¿Cuándo debo migrar de una IP compartida a una IP dedicada para mis campañas?',
          '¿Cuándo caducan las firmas criptográficas DKIM de mis servidores MX?',
        ],
      },
      donde: {
        label: '¿DÓNDE? (Herramientas & Zonas)',
        badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        questions: [
          '¿Dónde revisar si mi servidor MX tiene soporte de cifrado STARTTLS activo?',
          '¿Dónde añadir los registros TXT de autenticación en Cloudflare o GoDaddy?',
          '¿Dónde consultar las reputaciones de Spamhaus y Barracuda sin costo?',
        ],
      },
    },
  },
  saas: {
    name: 'Software SaaS B2B & Startups',
    queries: {
      que: {
        label: '¿QUÉ? (Definición & Alcance)',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        questions: [
          '¿Qué pasarela de correo transaccional tiene mejor entregabilidad: Resend o SendGrid?',
          '¿Qué métricas de onboarding definen el churn en los primeros 30 días?',
          '¿Qué es un acuerdo SLA empresarial de 99.9% de disponibilidad?',
        ],
      },
      como: {
        label: '¿CÓMO? (Implementación & Procesos)',
        badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        questions: [
          '¿Cómo automatizar los correos de bienvenida sin que caigan en la carpeta de spam?',
          '¿Cómo cobrar suscripciones recurrentes con Stripe y generar facturas automáticas?',
          '¿Cómo integrar autenticación de dos factores (2FA) en Next.js con Supabase?',
        ],
      },
      porque: {
        label: '¿POR QUÉ? (Causas de Rechazo & Fricción)',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        questions: [
          '¿Por qué los usuarios abandonan el checkout antes de ingresar su tarjeta?',
          '¿Por qué mis correos de reseteo de contraseña no llegan a cuentas corporativas?',
          '¿Por qué las APIs de correo devuelven errores de alineación DMARC en subdominios?',
        ],
      },
      cuando: {
        label: '¿CUÁNDO? (Oportunidad & Urgencia)',
        badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        questions: [
          '¿Cuándo pasar de un modelo de prueba gratis a un modelo freemium?',
          '¿Cuándo implementar contratos anuales con descuento?',
        ],
      },
      donde: {
        label: '¿DÓNDE? (Herramientas & Zonas)',
        badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        questions: [
          '¿Dónde encontrar comunidades de beta testers de software en español?',
          '¿Dónde hospedar servidores de correo con baja latencia en Latinoamérica?',
        ],
      },
    },
  },
  ecommerce: {
    name: 'E-Commerce & Ventas Online',
    queries: {
      que: {
        label: '¿QUÉ? (Definición & Alcance)',
        badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        questions: [
          '¿Qué correos transaccionales son obligatorios por ley para tiendas online?',
          '¿Qué porcentaje de apertura promedio tienen los correos de carrito abandonado?',
          '¿Qué métodos de pago convierten mejor en Colombia y México?',
        ],
      },
      como: {
        label: '¿CÓMO? (Implementación & Procesos)',
        badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        questions: [
          '¿Cómo garantizar que los correos de confirmación de pedido lleguen a la bandeja principal?',
          '¿Cómo reducir los contracargos y fraudes con tarjeta de crédito?',
          '¿Cómo configurar notificaciones automáticas por WhatsApp para pedidos?',
        ],
      },
      porque: {
        label: '¿POR QUÉ? (Causas de Rechazo & Fricción)',
        badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        questions: [
          '¿Por qué mis clientes dicen que nunca les llegó la factura de compra?',
          '¿Por qué los filtros de Hotmail y Outlook bloquean los correos de mi tienda?',
        ],
      },
      cuando: {
        label: '¿CUÁNDO? (Oportunidad & Urgencia)',
        badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        questions: [
          '¿Cuándo enviar el primer correo de recuperación de carrito después del abandono?',
          '¿Cuándo solicitar una reseña o calificación al comprador?',
        ],
      },
      donde: {
        label: '¿DÓNDE? (Herramientas & Zonas)',
        badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        questions: [
          '¿Dónde auditar la reputación del dominio de mi tienda online?',
          '¿Dónde descargar certificados de autenticidad para envíos comerciales?',
        ],
      },
    },
  },
};

interface KeywordItem {
  id: string;
  term: string;
  intent: 'Informacional' | 'Comercial' | 'Transaccional' | 'Navegacional';
  volumeScore: number; // 0 - 100
}

interface KeywordMatrixState {
  brand: KeywordItem[];
  competitors: KeywordItem[];
  problems: KeywordItem[];
  opportunities: KeywordItem[];
  community: KeywordItem[];
}

const INITIAL_KEYWORD_MATRIX: KeywordMatrixState = {
  brand: [
    { id: 'b1', term: 'DeliverabilityGuard', intent: 'Navegacional', volumeScore: 88 },
    { id: 'b2', term: 'MiPortal.me suite', intent: 'Navegacional', volumeScore: 76 },
  ],
  competitors: [
    { id: 'c1', term: 'MXToolbox alternative', intent: 'Comercial', volumeScore: 92 },
    { id: 'c2', term: 'ShowMyIP blacklist check', intent: 'Informacional', volumeScore: 84 },
    { id: 'c3', term: 'EasyDMARC precios', intent: 'Comercial', volumeScore: 78 },
  ],
  problems: [
    { id: 'p1', term: 'mis cotizaciones caen en spam', intent: 'Informacional', volumeScore: 95 },
    { id: 'p2', term: 'error rebote 550 google gmail', intent: 'Informacional', volumeScore: 91 },
    { id: 'p3', term: 'como configurar dmarc squarespace', intent: 'Informacional', volumeScore: 86 },
  ],
  opportunities: [
    { id: 'o1', term: 'auditoria dmarc spf colombia precio', intent: 'Transaccional', volumeScore: 89 },
    { id: 'o2', term: 'servicio blindaje correo corporativo', intent: 'Transaccional', volumeScore: 82 },
  ],
  community: [
    { id: 'cm1', term: 'RFC 7208 SPF directivas', intent: 'Informacional', volumeScore: 70 },
    { id: 'cm2', term: 'Google Yahoo bulk sender requirements 2024', intent: 'Informacional', volumeScore: 98 },
  ],
};

export default function MarketAnalysisClient() {
  const [selectedObjectiveTab, setSelectedObjectiveTab] = useState<'questions' | 'trends' | 'sentiment'>('questions');
  const [selectedNiche, setSelectedNiche] = useState<string>('dns');
  const [customKeywordSearch, setCustomKeywordSearch] = useState<string>('');

  // Google Alerts Generator Inputs
  const [alertBrand, setAlertBrand] = useState('DeliverabilityGuard');
  const [alertCompetitor, setAlertCompetitor] = useState('MXToolbox, ShowMyIP');
  const [alertProblem, setAlertProblem] = useState('caer en spam, DMARC, rebote 550');

  // Keyword Matrix State
  const [matrix, setMatrix] = useState<KeywordMatrixState>(INITIAL_KEYWORD_MATRIX);
  const [newKeywordTerm, setNewKeywordTerm] = useState('');
  const [newKeywordCategory, setNewKeywordCategory] = useState<keyof KeywordMatrixState>('problems');
  const [newKeywordIntent, setNewKeywordIntent] = useState<'Informacional' | 'Comercial' | 'Transaccional' | 'Navegacional'>('Informacional');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Google Alerts Query Construction
  const generatedAlertQuery = `("${alertBrand}" OR "${alertProblem.split(',')[0]?.trim() || 'entregabilidad'}") -site:${alertBrand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com (${alertProblem
    .split(',')
    .map((p) => `"${p.trim()}"`)
    .join(' OR ')}) OR (${alertCompetitor
    .split(',')
    .map((c) => `"${c.trim()}" :(`)
    .join(' OR ')})`;

  // Add keyword to matrix
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordTerm.trim()) return;

    const newItem: KeywordItem = {
      id: `kw-${Date.now()}`,
      term: newKeywordTerm.trim(),
      intent: newKeywordIntent,
      volumeScore: Math.floor(Math.random() * 30) + 70, // Simulated relevance
    };

    setMatrix((prev) => ({
      ...prev,
      [newKeywordCategory]: [...prev[newKeywordCategory], newItem],
    }));

    setNewKeywordTerm('');
  };

  // Remove keyword from matrix
  const handleRemoveKeyword = (category: keyof KeywordMatrixState, id: string) => {
    setMatrix((prev) => ({
      ...prev,
      [category]: prev[category].filter((k) => k.id !== id),
    }));
  };

  // Export matrix to JSON/CSV
  const handleExportMatrix = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(matrix, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'matriz-escucha-social-miportal.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activePreset = NICHE_PRESETS[selectedNiche] || NICHE_PRESETS.dns;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Global Navbar */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-12">
        {/* ========================================================= */}
        {/* HERO SECTION                                              */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Inteligencia Competitiva & Social Listening
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-50 leading-tight">
            Análisis de Mercado y{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Escucha Social Estratégica.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl">
            Monitorea conversaciones, detecta oportunidades en tiempo real y comprende las necesidades
            reales de tu audiencia antes que tu competencia. Metodología basada en datos de intención.
          </p>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Mapeo de Intención
              </span>
              <span className="text-lg font-black text-emerald-400 mt-0.5">AlsoAsked & FAQs</span>
              <span className="text-[11px] text-slate-400">5 ramas interrogativas</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Filtros Booleanos
              </span>
              <span className="text-lg font-black text-cyan-400 mt-0.5">Google Alerts & X</span>
              <span className="text-[11px] text-slate-400">Captación de leads activos</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Estructura Táctica
              </span>
              <span className="text-lg font-black text-amber-400 mt-0.5">Matriz 5D</span>
              <span className="text-[11px] text-slate-400">Clasificación de palabras clave</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* LOS 3 OBJETIVOS DEL ANÁLISIS: TABS INTERACTIVAS           */}
        {/* ========================================================= */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Metodología Social Listening
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-0.5">
                Los 3 Objetivos del Análisis Estratégico
              </h2>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold overflow-x-auto">
              <button
                type="button"
                onClick={() => setSelectedObjectiveTab('questions')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  selectedObjectiveTab === 'questions'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>1. Preguntas & Necesidades</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedObjectiveTab('trends')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  selectedObjectiveTab === 'trends'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>2. Tendencias & Alertas</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedObjectiveTab('sentiment')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                  selectedObjectiveTab === 'sentiment'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>3. Sentimiento & Redes</span>
              </button>
            </div>
          </div>

          {/* TAB 1: ENTENDER PREGUNTAS Y NECESIDADES (Answer The Public / AlsoAsked) */}
          {selectedObjectiveTab === 'questions' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Selecciona un Nicho de Mercado para Simulación:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Preguntas extraídas por pronombres interrogativos conforme a Google People Also Ask.
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(NICHE_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedNiche(key)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        selectedNiche === key
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Question Clusters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(activePreset.queries).map(([qKey, branch]) => (
                  <div
                    key={qKey}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${branch.badgeColor}`}
                        >
                          {branch.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {branch.questions.length} preguntas
                        </span>
                      </div>

                      <ul className="space-y-2 mt-1">
                        {branch.questions.map((q, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-300 leading-snug p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition"
                          >
                            <span className="text-emerald-400 font-mono font-bold mr-1.5">›</span>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(branch.questions.join('\n'), `branch-${qKey}`)
                        }
                        className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                      >
                        {copiedKey === `branch-${qKey}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Copiadas!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar preguntas</span>
                          </>
                        )}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">Intención activa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MONITOREO DE TENDENCIAS Y ZEITGEIST */}
          {selectedObjectiveTab === 'trends' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Tendencias de Búsqueda Visual (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        Curva de Interés a lo Largo del Tiempo (Google Trends)
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        +320% en 2024
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      Término: &quot;Entregabilidad de Correo & DMARC Enforcement&quot;
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      El pico histórico de interés se disparó tras el bloqueo de remitentes no autenticados en Gmail y Yahoo.
                    </p>
                  </div>

                  {/* Sparkline / Bar Chart Mockup */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-end justify-between gap-1.5 h-32 px-2 pt-6 pb-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                      {[25, 28, 30, 35, 42, 48, 55, 68, 82, 95, 100, 92].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className={`w-full rounded-t transition-all ${
                              idx >= 8 ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : 'bg-slate-700'
                            }`}
                            style={{ height: `${val}%` }}
                            title={`Mes ${idx + 1}: ${val}%`}
                          />
                          <span className="text-[9px] font-mono text-slate-500">M{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-mono">
                      <span>Enero (Normativa IETF)</span>
                      <span className="text-emerald-400 font-bold">Pico Máximo (Google 2024)</span>
                      <span>Actual</span>
                    </div>
                  </div>

                  {/* Breakout Topics */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Consultas en Aumento Repentino (Breakout Queries):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        &quot;Squarespace dmarc host duplicado&quot; (+450%)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-semibold">
                        &quot;SPF lookup limit 10 fix&quot; (+280%)
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-semibold">
                        &quot;Spamhaus delisting automático&quot; (+190%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Generador de Google Alerts (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      Generador de Consultas para Google Alerts
                    </span>
                    <h3 className="text-sm font-bold text-slate-100">
                      Rastrea Menciones de tu Marca y la Competencia
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Construye operadores booleanos precisos para recibir un email cada vez que alguien hable de tu nicho o exprese un dolor.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Tu Marca / Producto:
                      </label>
                      <input
                        type="text"
                        value={alertBrand}
                        onChange={(e) => setAlertBrand(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Competidores a Monitorear:
                      </label>
                      <input
                        type="text"
                        value={alertCompetitor}
                        onChange={(e) => setAlertCompetitor(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">
                        Términos de Dolor / Problemas:
                      </label>
                      <input
                        type="text"
                        value={alertProblem}
                        onChange={(e) => setAlertProblem(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    {/* Resulting Boolean String */}
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 break-all select-all">
                      {generatedAlertQuery}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(generatedAlertQuery, 'alerts-query')}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                    >
                      {copiedKey === 'alerts-query' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiada!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar Consulta</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`https://www.google.com/alerts#create:q=${encodeURIComponent(
                        generatedAlertQuery
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Abrir Google Alerts</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONVERSACIONES Y SENTIMIENTO EN TIEMPO REAL */}
          {selectedObjectiveTab === 'sentiment' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Medidor de Sentimiento (5 cols) */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      Termómetro de Sentimiento del Mercado
                    </span>
                    <h3 className="text-base font-bold text-slate-100">
                      Balance Emocional en Conversaciones IT
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Análisis de tono en comentarios de foros, foros de desarrolladores y reseñas públicas.
                    </p>
                  </div>

                  {/* Multi-Bar Sentiment Gauge */}
                  <div className="space-y-3">
                    <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 flex overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: '64%' }} title="Positivo 64%" />
                      <div className="bg-sky-500 h-full" style={{ width: '24%' }} title="Neutro 24%" />
                      <div className="bg-rose-500 h-full" style={{ width: '12%' }} title="Negativo / Frustración 12%" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="block font-black text-emerald-400 text-base">64%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Positivo / Adopción</span>
                      </div>
                      <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20">
                        <span className="block font-black text-sky-400 text-base">24%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Neutro / Preguntas</span>
                      </div>
                      <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="block font-black text-rose-400 text-base">12%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Fricción / Spam</span>
                      </div>
                    </div>
                  </div>

                  {/* Insights de Dolor Detectado */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Mayor Foco de Dolor (Punto de Fricción):
                    </span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      El 78% de las quejas negativas se concentran en la pérdida de cotizaciones comerciales por caer en spam sin saber la causa.
                    </p>
                  </div>
                </div>

                {/* Asistente de Filtros Avanzados para Redes Sociales (7 cols) */}
                <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-cyan-400" />
                      Filtros Avanzados de Búsqueda Social (Dorks)
                    </span>
                    <h3 className="text-base font-bold text-slate-100">
                      Operadores para Captación de Leads y Escucha en X (Twitter) & Reddit
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Pega estos operadores booleanos directamente en el buscador de X o Google para aislar conversaciones de alto valor comercial.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Dork 1: Quejas de la Competencia */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-300">
                          1. Detección de Quejas sobre la Competencia:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `("MXToolbox" OR "Mailtrap") ("pésimo" OR "falla" OR "cae en spam" OR "no funciona" OR ":(")`,
                              'dork-complaints'
                            )
                          }
                          className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1"
                        >
                          {copiedKey === 'dork-complaints' ? '¡Copiado!' : 'Copiar Dork'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 select-all">
                        (&quot;MXToolbox&quot; OR &quot;Mailtrap&quot;) (&quot;pésimo&quot; OR &quot;falla&quot; OR &quot;cae en spam&quot; OR &quot;no funciona&quot; OR &quot;:(&quot;)
                      </div>
                    </div>

                    {/* Dork 2: Captación de Leads Calificados */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">
                          2. Captación de Leads Activos (Busco Recomendación):
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `("busco recomendación" OR "alguien que recomiende" OR "necesito ayuda con") ("auditoría DNS" OR "entregabilidad" OR "configurar DMARC")`,
                              'dork-leads'
                            )
                          }
                          className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1"
                        >
                          {copiedKey === 'dork-leads' ? '¡Copiado!' : 'Copiar Dork'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 select-all">
                        (&quot;busco recomendación&quot; OR &quot;alguien que recomiende&quot; OR &quot;necesito ayuda con&quot;) (&quot;auditoría DNS&quot; OR &quot;entregabilidad&quot; OR &quot;configurar DMARC&quot;)
                      </div>
                    </div>

                    {/* Dork 3: Necesidades no Satisfechas */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-300">
                          3. Necesidades no Satisfechas en el Mercado:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              `("por qué ninguna herramienta" OR "ojalá existiera una app que") ("correo corporativo" OR "DNS" OR "cotizaciones")`,
                              'dork-unmet'
                            )
                          }
                          className="text-[10px] text-emerald-400 font-mono hover:underline flex items-center gap-1"
                        >
                          {copiedKey === 'dork-unmet' ? '¡Copiado!' : 'Copiar Dork'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-slate-300 select-all">
                        (&quot;por qué ninguna herramienta&quot; OR &quot;ojalá existiera una app que&quot;) (&quot;correo corporativo&quot; OR &quot;DNS&quot; OR &quot;cotizaciones&quot;)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* MATRIZ DE CLASIFICACIÓN DE PALABRAS CLAVE (5 DIMENSIONES) */}
        {/* ========================================================= */}
        <section className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Herramienta Táctica
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {Object.values(matrix).flat().length} keywords registradas
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight mt-1">
                Matriz de Clasificación de Palabras Clave (5 Dimensiones)
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mt-0.5">
                Organiza tus términos prioritarios para alimentar campañas de contenido, SEO y alertas de escucha sin dispersar el presupuesto.
              </p>
            </div>

            {/* Export and Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(JSON.stringify(matrix, null, 2), 'matrix-copy')
                }
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copiedKey === 'matrix-copy' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">¡Matriz Copiada!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copiar Matriz</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportMatrix}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Matriz (JSON)</span>
              </button>
            </div>
          </div>

          {/* Quick Add Form */}
          <form
            onSubmit={handleAddKeyword}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
          >
            <div className="flex-1">
              <input
                type="text"
                value={newKeywordTerm}
                onChange={(e) => setNewKeywordTerm(e.target.value)}
                placeholder="Ingresa una palabra clave o consulta de búsqueda..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newKeywordCategory}
                onChange={(e) => setNewKeywordCategory(e.target.value as keyof KeywordMatrixState)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="brand">1. Marca</option>
                <option value="competitors">2. Competidores</option>
                <option value="problems">3. Problemas / Dolor</option>
                <option value="opportunities">4. Oportunidades</option>
                <option value="community">5. Comunidad</option>
              </select>

              <select
                value={newKeywordIntent}
                onChange={(e) =>
                  setNewKeywordIntent(
                    e.target.value as 'Informacional' | 'Comercial' | 'Transaccional' | 'Navegacional'
                  )
                }
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="Informacional">Informacional</option>
                <option value="Comercial">Comercial</option>
                <option value="Transaccional">Transaccional</option>
                <option value="Navegacional">Navegacional</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </form>

          {/* 5 Dimensions Grid Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Marca */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-emerald-400">1. Keywords de Marca</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    ({matrix.brand.length})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Términos propios y variaciones de nombre.</p>

                <div className="space-y-1.5 mt-1">
                  {matrix.brand.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{k.term}</span>
                        <span className="text-[9px] font-mono text-emerald-400">{k.intent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword('brand', k.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Competidores */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-cyan-400">2. Competidores</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    ({matrix.competitors.length})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Alternativas directas e indirectas.</p>

                <div className="space-y-1.5 mt-1">
                  {matrix.competitors.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{k.term}</span>
                        <span className="text-[9px] font-mono text-cyan-400">{k.intent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword('competitors', k.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Problemas / Dolor */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-rose-400">3. Problemas / Dolor</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    ({matrix.problems.length})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Consultas de clientes con un dolor real.</p>

                <div className="space-y-1.5 mt-1">
                  {matrix.problems.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{k.term}</span>
                        <span className="text-[9px] font-mono text-rose-400">{k.intent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword('problems', k.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Oportunidades */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-amber-400">4. Oportunidades</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    ({matrix.opportunities.length})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Búsquedas comerciales y de compra.</p>

                <div className="space-y-1.5 mt-1">
                  {matrix.opportunities.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{k.term}</span>
                        <span className="text-[9px] font-mono text-amber-400">{k.intent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword('opportunities', k.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Comunidad */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-xs font-bold text-purple-400">5. Comunidad</span>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    ({matrix.community.length})
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Jerga técnica, normativas y foros.</p>

                <div className="space-y-1.5 mt-1">
                  {matrix.community.map((k) => (
                    <div
                      key={k.id}
                      className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-1 text-xs group"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-200 truncate">{k.term}</span>
                        <span className="text-[9px] font-mono text-purple-400">{k.intent}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword('community', k.id)}
                        className="text-slate-600 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} MiPortal.me — Inteligencia de Mercado & Social Listening.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-emerald-400 transition">
              Auditoría DNS
            </Link>
            <span>•</span>
            <Link href="/tools/generator" className="hover:text-emerald-400 transition">
              Generador RFC
            </Link>
            <span>•</span>
            <Link href="/guide" className="hover:text-emerald-400 transition">
              Guía Técnica
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
