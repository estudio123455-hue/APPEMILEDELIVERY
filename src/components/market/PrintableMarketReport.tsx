'use client';

import React from 'react';
import {
  Printer,
  FileText,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  MessageSquare,
  Award,
  Layers,
  ArrowDownToLine,
  X,
  ExternalLink,
} from 'lucide-react';
import type { MarketReportData } from '@/types/market-report';

interface PrintableMarketReportProps {
  report: MarketReportData;
  onClose?: () => void;
}

export default function PrintableMarketReport({ report, onClose }: PrintableMarketReportProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full text-slate-900 bg-white min-h-screen">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE ACCIONES (SE OCULTA AL IMPRIMIR)        */}
      {/* ========================================================= */}
      <div className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between text-white shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Informe Académico Listo para Entrega</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                Actividad Escucha Social PDF
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Formato formal con matriz de 10 palabras clave y desarrollo de los 3 objetivos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition"
              title="Cerrar vista de informe"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUERPO DEL INFORME ACADÉMICO                              */}
      {/* ========================================================= */}
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-14 space-y-10 text-slate-800 print:px-0 print:py-4 print:max-w-full">
        {/* ENCABEZADO INSTITUCIONAL FORMAL */}
        <header className="border-b-2 border-slate-900 pb-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 block mb-1">
                {report.institution} • {report.course}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                {report.title}
              </h1>
              <p className="text-sm font-medium text-slate-600 mt-1">
                {report.subtitle}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 border-l sm:border-l-0 sm:border-r border-slate-300 pl-3 sm:pl-0 sm:pr-3">
              <span className="text-xs text-slate-500 block font-mono">Fecha de emisión:</span>
              <strong className="text-xs text-slate-900 block">{report.date}</strong>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Auditoría Verificada</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Tema / Marca:</span>
              <strong className="text-slate-900 font-bold">{report.subjectOrBrand}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Autor del informe:</span>
              <span className="text-slate-900">{report.author}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Cumplimiento:</span>
              <span className="text-emerald-700 font-bold">{report.metadata.complianceScore}% de Criterios</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Formato:</span>
              <span className="text-slate-700">{report.metadata.suggestedFormat}</span>
            </div>
          </div>
        </header>

        {/* INTRODUCCIÓN ACADÉMICA */}
        <section className="space-y-2.5">
          <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>Introducción y Contexto Metodológico</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
            {report.academicIntroduction}
          </p>
        </section>

        {/* ========================================================= */}
        {/* PUNTO 1: MATRIZ DE 10 PALABRAS CLAVE ESTRATÉGICAS         */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Punto 1: Matriz de 10 Palabras Clave Estratégicas</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              5 Dimensiones • 2 Keywords c/u
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-32">Dimensión</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold w-48">Palabra Clave</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-28">Intención</th>
                  <th className="py-2.5 px-3">Justificación Estratégica</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.keywords.map((kw, idx) => (
                  <tr key={kw.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-800">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 font-mono">
                        {kw.category}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-950">
                      {kw.keyword}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                      {kw.intent}
                    </td>
                    <td className="py-2 px-3 text-slate-700 leading-snug text-[11px]">
                      {kw.justification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PUNTO 2: EVIDENCIAS Y DESARROLLO DE LOS 3 OBJETIVOS       */}
        {/* ========================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Punto 2: Evidencias y Cobertura de los 3 Objetivos</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Preguntas • Tendencias • Sentimiento
            </span>
          </div>

          <div className="space-y-5">
            {report.keywords.map((kw, idx) => (
              <div
                key={kw.id}
                className="border border-slate-300 rounded-xl p-4 bg-white shadow-sm space-y-3 break-inside-avoid"
              >
                {/* Header de la Keyword */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <strong className="text-sm font-bold text-slate-950 font-mono">
                      "{kw.keyword}"
                    </strong>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                      {kw.category}
                    </span>
                  </div>

                  <span className="text-xs text-slate-500 font-mono font-medium">
                    Intención: {kw.intent}
                  </span>
                </div>

                {/* Subsecciones de los 3 Objetivos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Objetivo 1: Preguntas y Necesidades */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-800">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Obj 1: Preguntas (FAQ)</span>
                    </h4>
                    <ul className="space-y-1 text-[11px] text-slate-700 font-mono">
                      <li>• <strong>Qué:</strong> {kw.objective1.que}</li>
                      <li>• <strong>Cómo:</strong> {kw.objective1.como}</li>
                      <li>• <strong>Cuándo:</strong> {kw.objective1.cuando}</li>
                      <li>• <strong>Por qué:</strong> {kw.objective1.porQue}</li>
                    </ul>
                    <p className="text-[10px] text-slate-600 pt-1 border-t border-slate-200 italic">
                      <strong>Necesidad:</strong> {kw.objective1.consumerNeed}
                    </p>
                  </div>

                  {/* Objetivo 2: Tendencias y Zeitgeist */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-cyan-800">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Obj 2: Tendencias & Zeitgeist</span>
                    </h4>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <p>• <strong>Estacionalidad:</strong> {kw.objective2.seasonalBehavior}</p>
                      <p>• <strong>Volumen Relativo:</strong> <span className="font-bold text-slate-900">{kw.objective2.relativeVolume}</span></p>
                      <p>• <strong>Google Alerts:</strong> <code className="text-[10px] bg-white px-1 border rounded">{kw.objective2.googleAlertsTerm}</code></p>
                    </div>
                    <p className="text-[10px] text-slate-600 pt-1 border-t border-slate-200">
                      <strong>Insight:</strong> {kw.objective2.trendInsight}
                    </p>
                  </div>

                  {/* Objetivo 3: Conversaciones y Sentimiento */}
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-1.5">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-amber-800">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Obj 3: Sentimiento en Redes</span>
                    </h4>
                    <div className="space-y-1 text-[10px] text-slate-700">
                      <p>
                        <strong>Filtro Quejas:</strong>{' '}
                        <code className="bg-white px-1 border rounded text-rose-700 block mt-0.5 truncate select-all">
                          {kw.objective3.complaintBooleanQuery}
                        </code>
                      </p>
                      <p>
                        <strong>Filtro Leads:</strong>{' '}
                        <code className="bg-white px-1 border rounded text-emerald-700 block mt-0.5 truncate select-all">
                          {kw.objective3.leadBooleanQuery}
                        </code>
                      </p>
                    </div>
                    {/* Barra de Polaridad */}
                    <div className="pt-1 border-t border-slate-200">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 flex overflow-hidden">
                        <div
                          style={{ width: `${kw.objective3.sentimentBreakdown.positive}%` }}
                          className="bg-emerald-600"
                        />
                        <div
                          style={{ width: `${kw.objective3.sentimentBreakdown.neutral}%` }}
                          className="bg-slate-400"
                        />
                        <div
                          style={{ width: `${kw.objective3.sentimentBreakdown.negative}%` }}
                          className="bg-rose-500"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-0.5">
                        <span>+{kw.objective3.sentimentBreakdown.positive}%</span>
                        <span>={kw.objective3.sentimentBreakdown.neutral}%</span>
                        <span>-{kw.objective3.sentimentBreakdown.negative}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Punto 3: Conclusión Específica de la Keyword */}
                <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-2.5 text-xs">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block mb-0.5">
                    Punto 3: Hallazgo Táctico y Conclusión Específica
                  </span>
                  <p className="text-slate-800 text-[11px] leading-relaxed">
                    {kw.specificConclusion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* PUNTO 4: CONCLUSIONES GENERALES Y RECOMENDACIONES         */}
        {/* ========================================================= */}
        <section className="space-y-4 break-inside-avoid">
          <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-1">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>Punto 4: Conclusiones Estratégicas Generales</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] text-emerald-800">
                1. Conclusión: Preguntas y Necesidades
              </h3>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
                {report.conclusions.objective1Conclusion}
              </p>
            </div>

            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] text-cyan-800">
                2. Conclusión: Tendencias y Zeitgeist
              </h3>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
                {report.conclusions.objective2Conclusion}
              </p>
            </div>

            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] text-amber-800">
                3. Conclusión: Sentimiento en Redes
              </h3>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
                {report.conclusions.objective3Conclusion}
              </p>
            </div>
          </div>

          {/* Recomendaciones Tácticas Aplicadas */}
          <div className="border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2.5">
            <h3 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Recomendaciones Estratégicas para la Dirección</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {report.conclusions.strategicRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-emerald-700 mt-0.5">[{i + 1}]</span>
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resumen Ejecutivo Final */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs text-slate-600 font-mono text-justify leading-relaxed">
            <strong>Dictamen de Consultoría:</strong> {report.conclusions.academicSummary}
          </div>
        </section>

        {/* PIE DEL INFORME */}
        <footer className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Generado con DeliverabilityGuard & MiPortal Suite — Auditoría de Escucha Social</span>
          <span>Página 1 de 1 • Documento Oficial</span>
        </footer>
      </div>
    </div>
  );
}
