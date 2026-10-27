'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Briefcase,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FileDown,
  Receipt,
  CreditCard,
  ShoppingBag,
  Rocket,
  Lock,
  Mail,
  Zap,
  Globe,
  Server,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MiPortalSuiteShowcaseProps {
  onSelectAuditAction: () => void;
}

type IndustryCategory = 'all' | 'agencies' | 'freelance' | 'ecommerce' | 'saas';

interface SolutionCard {
  id: string;
  category: 'agencies' | 'freelance' | 'ecommerce' | 'saas';
  badge: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentGlow: string;
  badgeColor: string;
  features: string[];
  ctaText: string;
  ctaAction: 'audit' | 'tools' | 'guide' | 'business';
}

const SOLUTIONS: SolutionCard[] = [
  {
    id: 'agencies',
    category: 'agencies',
    badge: 'Servicios Profesionales & Agencias',
    title: 'Auditorías Técnicas en PDF con Marca Blanca',
    description:
      'Entrega a tus clientes informes de diagnóstico de ciberseguridad y entregabilidad listos para imprimir, justificando optimizaciones IT y blindaje contra fraudes.',
    icon: Briefcase,
    accentGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    features: [
      'Reporte ejecutivo descargable en PDF con directivas RFC',
      'Diagnóstico de servidores MX, SPF, DMARC y selectores DKIM',
      'Monitoreo de reputación en listas negras DNSBL (Spamhaus, Barracuda)',
    ],
    ctaText: 'Auditar Dominio de Cliente',
    ctaAction: 'audit',
  },
  {
    id: 'freelance',
    category: 'freelance',
    badge: 'Creadores & Autónomos',
    title: 'Propuestas Comerciales y Facturas sin Caer en Spam',
    description:
      'Garantiza que tus cotizaciones de proyectos, acuerdos de servicios y recordatorios de pago lleguen directamente a la bandeja principal de tus prospectos.',
    icon: Receipt,
    accentGlow: 'from-amber-500/10 via-orange-500/5 to-transparent',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    features: [
      'Presupuestos y cotizaciones ejecutivas en PDF',
      'Importación automática de servicios desde Bio Sites',
      'Garantía de entrega en bandeja principal sin marcas de spam',
    ],
    ctaText: 'Crear Cotización / Factura',
    ctaAction: 'business',
  },
  {
    id: 'ecommerce',
    category: 'ecommerce',
    badge: 'E-Commerce & Retail',
    title: 'Confirmaciones de Compra y Facturación Instantánea',
    description:
      'Maximiza el ratio de apertura de tus confirmaciones de pedido, tickets de soporte y carritos recuperados eliminando el riesgo de cuarentena.',
    icon: ShoppingBag,
    accentGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    features: [
      'Alineación estricta de remitente DMARC (quarantine / reject)',
      'Soporte para logotipo verificado BIMI en Apple Mail y Yahoo',
      'Cifrado en tránsito STARTTLS para privacidad de clientes',
    ],
    ctaText: 'Blindar Tienda Online',
    ctaAction: 'audit',
  },
  {
    id: 'saas',
    category: 'saas',
    badge: 'Startups & Equipos B2B',
    title: 'Infraestructura Transaccional para Escalar sin Bloqueos',
    description:
      'Configura pasarelas masivas (Resend, SendGrid, Amazon SES) con políticas autoritativas que superan los filtros antispam más exigentes de Google Workspace.',
    icon: Rocket,
    accentGlow: 'from-indigo-500/10 via-purple-500/5 to-transparent',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    features: [
      'Detección inteligente de pasarelas e includes SPF redundantes',
      'Validación de límites de búsqueda DNS (máximo 10 lookups RFC)',
      'Monitoreo centralizado multi-dominio en panel de control',
    ],
    ctaText: 'Ver Herramientas DNS',
    ctaAction: 'tools',
  },
];

export default function MiPortalSuiteShowcase({ onSelectAuditAction }: MiPortalSuiteShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<IndustryCategory>('all');

  const filteredSolutions =
    selectedCategory === 'all'
      ? SOLUTIONS
      : SOLUTIONS.filter((s) => s.category === selectedCategory);

  return (
    <div className="flex flex-col gap-16 print:hidden">
      {/* ========================================================= */}
      {/* 1. SECCIÓN DE SOLUCIONES POR INDUSTRIA (ESTILO SQUARESPACE) */}
      {/* ========================================================= */}
      <section className="flex flex-col gap-8">
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ecosistema de Soluciones MiPortal</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
            Diseñado para la realidad operativa de tu negocio.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            Desde profesionales independientes hasta agencias consolidadas. Soluciones modulares creadas para resolver problemas técnicos y comerciales concretos.
          </p>

          {/* Selector de Categorías / Pestañas */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos los Sectores
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('agencies')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === 'agencies'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agencias & IT
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('freelance')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === 'freelance'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Creadores & Autónomos
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('ecommerce')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === 'ecommerce'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              E-Commerce & Retail
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('saas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === 'saas'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Startups & SaaS
            </button>
          </div>
        </div>

        {/* Cuadrícula de Tarjetas Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSolutions.map((solution) => {
            const Icon = solution.icon;
            return (
              <div
                key={solution.id}
                className={`p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800/90 hover:border-slate-700 relative overflow-hidden transition-all duration-300 flex flex-col justify-between gap-6 group hover:shadow-2xl hover:shadow-emerald-950/20 bg-gradient-to-br ${solution.accentGlow}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Top Badge and Icon */}
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${solution.badgeColor}`}
                    >
                      {solution.badge}
                    </span>
                    <div className="w-10 h-10 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:text-emerald-400 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mt-2">
                      {solution.description}
                    </p>
                  </div>

                  {/* Key Features Bullet List */}
                  <div className="pt-2 border-t border-slate-800/70 space-y-2">
                    {solution.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card CTA Action Funcional */}
                <div className="pt-4 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-2">
                  {solution.id === 'freelance' ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/business"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition group/btn"
                      >
                        <span>Crear Cotización / Factura</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <span className="text-slate-600">•</span>
                      <a
                        href="#quick-audit"
                        onClick={onSelectAuditAction}
                        className="text-[11px] text-slate-400 hover:text-emerald-400 transition"
                      >
                        Auditar Remitente
                      </a>
                    </div>
                  ) : solution.ctaAction === 'audit' ? (
                    <a
                      href="#quick-audit"
                      onClick={onSelectAuditAction}
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition group/btn"
                    >
                      <span>{solution.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <Link
                      href="/tools/generator"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition group/btn"
                    >
                      <span>{solution.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  )}

                  <span className="text-[10px] font-mono text-slate-500">Módulo Integrado</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CATÁLOGO DE MÓDULOS DE NEGOCIO (SECTION #business-suite) */}
      {/* ========================================================= */}
      <section
        id="business-suite"
        className="p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col gap-8 scroll-mt-24"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Suite MiPortal Business & DNS</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Los 3 Pilares del Ecosistema MiPortal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Herramientas concebidas para operar de manera sincronizada. Sin suscripciones infladas ni configuraciones enredadas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tools/generator"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Abrir Generador DNS</span>
            </Link>
          </div>
        </div>

        {/* 3 Pilares Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pilar 1: DeliverabilityGuard */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col justify-between gap-6 relative shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Motor de Ciberseguridad
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">DeliverabilityGuard</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Auditoría DNS autoritativa que evalúa SPF, DMARC, DKIM, listas negras DNSBL (RBL) y cifrado STARTTLS en tiempo real sin almacenamiento de datos privados.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Simulador de bandeja Gmail / Outlook</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Informe PDF técnico descargable</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Doctor DNS con reparación asistida</span>
                </div>
              </div>
            </div>

            <a
              href="#quick-audit"
              onClick={onSelectAuditAction}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <span>Ejecutar Auditoría Ahora</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Pilar 2: MiPortal Business (CONECTADO) */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex flex-col justify-between gap-6 relative shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Briefcase className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    Suite Comercial B2B
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Nuevo
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1">MiPortal Business</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Generación ágil de presupuestos, cotizaciones ejecutivas y enlaces de cobro digital para cerrar acuerdos sin intermediarios lentos.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Cotizaciones profesionales en PDF</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Importación desde Bio Sites en 1 clic</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Sin comisiones recurrentes ocultas</span>
                </div>
              </div>
            </div>

            {/* Acción Conectada a /business */}
            <div className="space-y-2">
              <Link
                href="/business"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
              >
                <span>Crear Presupuesto o Factura</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-[11px] text-center text-slate-400">
                Herramienta gratuita sin registro obligatorio
              </p>
            </div>
          </div>

          {/* Pilar 3: DNS Wizard & Tools */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-indigo-500/30 flex flex-col justify-between gap-6 relative shadow-lg">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Asistente de Zona DNS
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">DNS Tools & Wizard</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Generador paso a paso de registros SPF y directivas DMARC personalizadas, con advertencias automáticas para Squarespace Domains, Cloudflare y Namecheap.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Checkboxes de proveedores (Google, M365, Brevo)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Sintaxis estricta RFC 7208 / RFC 7489</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Copiado en 1 clic de registros TXT</span>
                </div>
              </div>
            </div>

            <Link
              href="/tools/generator"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition flex items-center justify-center gap-2"
            >
              <span>Abrir Generador de Registros</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
