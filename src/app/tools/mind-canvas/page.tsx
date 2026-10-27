'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/navigation/Navbar';
import MindCanvas from '@/components/mind/MindCanvas';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Brain,
  Lightbulb,
  Target,
  Users,
  Zap,
  Rocket,
  Layers,
  Smartphone,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

export default function MindCanvasPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-slate-950">
      <Navbar />

      {/* Header y Metodología */}
      <div className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition mt-0.5 sm:mt-0"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
                  MiPortal Mind • Metodología TUNNELVISION
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Canvas Creativo Infinito
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Lienzo de Ideación: De Caos Mental a Orden Estructurado</span>
              </h1>
            </div>
          </div>

          {/* Enlaces de Continuidad a la Suite */}
          <div className="flex items-center gap-2">
            <Link
              href="/sites/builder"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Crear Bio Site</span>
            </Link>

            <Link
              href="/business"
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500 hover:bg-purple-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-purple-500/20 active:scale-95"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Cotizar Proyecto</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenedor Principal con el Lienzo */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-10">
        {/* Lienzo SVG Interactivo */}
        <section className="w-full">
          <MindCanvas />
        </section>

        {/* Guía Metodológica de 5 Fases TUNNELVISION */}
        <section className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Framework de Pensamiento
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Las 5 Fases de la Metodología TUNNELVISION
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Diseñado para creativos, fundadores y consultores que sufren de saturación mental. Pasa de ideas dispersas
              a una oferta comercial validada y facturable en 5 pasos lógicos:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            {/* 1. Caos */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-700/60 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-xs font-bold text-white">1. Caos / Idea Cruda</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Vuelca todo sin filtro: notas, frustraciones, dolores de clientes y pensamientos sin estructurar.
              </p>
            </div>

            {/* 2. Esencia */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-xs font-bold text-emerald-300">2. Esencia & Problema</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Filtra el insight fundamental: ¿cuál es el verdadero dolor que nadie más está resolviendo bien?
              </p>
            </div>

            {/* 3. Audiencia */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-xs font-bold text-cyan-300">3. Arquetipos & Audiencia</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Define la personalidad y arquetipo psicológico de tu cliente ideal (ej. Sabio, Creador, Explorador).
              </p>
            </div>

            {/* 4. Benchmarking */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-xs font-bold text-amber-300">4. Benchmarking</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Cruza lo mejor de tus competidores directos e indirectos para encontrar tu diferencial único.
              </p>
            </div>

            {/* 5. Solución */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                5
              </div>
              <h3 className="text-xs font-bold text-purple-300">5. Solución & Oferta</h3>
              <p className="text-[11px] text-slate-400 leading-snug">
                Materializa la solución en un entregable concreto, cotizable en MiPortal Business y publicable en Bio Sites.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
