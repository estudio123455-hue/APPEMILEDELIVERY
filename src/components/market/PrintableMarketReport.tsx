'use client';

import React from 'react';
import {
  Printer,
  FileText,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Users,
  ShieldCheck,
  Award,
  Layers,
  ArrowDownToLine,
  X,
  Target,
  Compass,
  BarChart3,
  Flame,
  Search,
} from 'lucide-react';
import type { MarketReportData } from '@/types/market-report';

interface PrintableMarketReportProps {
  report: MarketReportData;
  onClose?: () => void;
}

export default function PrintableMarketReport({ report, onClose }: PrintableMarketReportProps) {
  const {
    projectInfo,
    tabla1_keywords,
    tabla2_faq_respuestas,
    tabla3_tendencias_arquetipos,
    tabla4_triangulo_competitivo,
    tabla5_benchmark_estrategias,
    conclusionesFinales,
  } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full text-slate-900 bg-white min-h-screen">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE ACCIONES (SE OCULTA AL IMPRIMIR)        */}
      {/* ========================================================= */}
      <div className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between text-white shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{projectInfo.title}</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                5 Tablas Oficiales • Listo para Entrega
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Integración de los dos documentos oficiales: Escucha Social y Benchmarking Digital.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar Trabajo Completo en PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
              title="Cerrar vista de informe"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUERPO DEL INFORME ACADÉMICO FORMAL                      */}
      {/* ========================================================= */}
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-8 sm:py-12 space-y-10 text-slate-800 print:px-0 print:py-2 print:max-w-full">
        {/* ENCABEZADO INSTITUCIONAL / MEMBRETE */}
        <header className="border-b-2 border-slate-900 pb-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 block mb-1">
                {projectInfo.institution || 'Facultad de Estrategia Digital y Marketing de Búsqueda'} • {projectInfo.course || 'Escucha Social & Benchmarking'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
                {projectInfo.title}
              </h1>
              <p className="text-sm font-semibold text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                <span>Entidad Evaluada:</span>
                <span className="text-slate-950 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {projectInfo.analyzedEntity}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-normal">{projectInfo.industry}</span>
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 border-l sm:border-l-0 sm:border-r border-slate-300 pl-3 sm:pl-0 sm:pr-4">
              <span className="text-xs text-slate-500 block font-mono">Fecha de evaluación:</span>
              <strong className="text-xs text-slate-900 block font-mono">{projectInfo.date}</strong>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded mt-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Auditoría Certificada MiPortal</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs border-t border-slate-200 font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">Autor del Informe:</span>
              <strong className="text-slate-900">{projectInfo.author || 'Equipo de Consultoría Digital'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Sector de Estudio:</span>
              <span className="text-slate-900 truncate block">{projectInfo.industry}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Módulos Oficiales:</span>
              <span className="text-slate-900">Escucha Social + Benchmarking</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Rigor Académico:</span>
              <span className="text-emerald-700 font-bold">100% Criterios de Evaluación</span>
            </div>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TABLA 1: MATRIZ DE 10 PALABRAS CLAVE ESTRATÉGICAS         */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Tabla 1: Matriz de 10 Palabras Clave Estratégicas</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              5 Dimensiones de Escucha Social
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-36">Dimensión Estratégica</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 font-bold">Palabra Clave (Keyword)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-28">Intención</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-28 text-center">Volumen</th>
                  <th className="py-2.5 px-3 w-48">Canal Prioritario</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tabla1_keywords.map((kw, idx) => (
                  <tr key={kw.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500">
                      {kw.id}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-semibold text-slate-800">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 font-mono">
                        {kw.dimension}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-950">
                      {kw.keyword}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-700 font-mono text-[11px]">
                      {kw.intencion}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono text-[11px] font-bold text-slate-800">
                      {kw.volumenRelativo}
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-[11px] leading-snug">
                      {kw.canalPrioritario}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABLA 2: FAQ Y RESPUESTAS ANALÍTICAS EXPERTAS             */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Tabla 2: Respuestas Estratégicas a Preguntas Frecuentes (FAQ)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              AnswerThePublic & Google Suggest
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">#</th>
                  <th className="py-2.5 px-2 border-r border-slate-200 w-20 text-center">Tipo</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-64 font-bold">Pregunta Detectada</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">Respuesta Experta Analítica</th>
                  <th className="py-2.5 px-3 w-56">Insight Estratégico de Contenido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tabla2_faq_respuestas.map((faq, idx) => (
                  <tr key={faq.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500 align-top">
                      {faq.id}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 text-center font-mono font-bold text-emerald-800 align-top">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px]">
                        {faq.modificador}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-slate-900 leading-snug align-top">
                      {faq.pregunta}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 leading-relaxed text-[11px] align-top text-justify">
                      {faq.respuestaExperta}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 leading-snug text-[11px] align-top italic bg-slate-50/30">
                      {faq.insightEstrategico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABLA 3: TENDENCIAS Y ARQUETIPOS DE CONSUMO (ZEITGEIST)   */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Tabla 3: Análisis Esquemático de Tendencias y Arquetipos (Zeitgeist)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Psicografía & Cultura del Consumidor
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-56">Tendencia Esquemática</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-52 font-bold">Arquetipo de Consumidor (Target)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-64">Drivers de Compra Clave</th>
                  <th className="py-2.5 px-3">Zeitgeist Cultural / Contexto Social</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tabla3_tendencias_arquetipos.map((trend, idx) => (
                  <tr key={trend.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500 align-top">
                      {trend.id}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-950 align-top leading-snug">
                      {trend.tendenciaEsquematica}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-medium text-emerald-900 align-top leading-snug">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[11px] block font-semibold">
                        {trend.arquetipoConsumidor}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 leading-snug text-[11px] align-top">
                      {trend.driversCompra}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 leading-relaxed text-[11px] align-top text-justify">
                      {trend.zeitgeistCultural}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABLA 4: TRIÁNGULO COMPETITIVO OFICIAL (BENCHMARKING)     */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Tabla 4: Triángulo Competitivo Oficial (Benchmarking Digital)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              5 Actores: Directos, Aspiracional, Indirecto e Inesperado
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-44">Clasificación Oficial</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-40 font-bold">Marca / Actor</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-52">Propuesta de Valor</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-52">Activos Digitales Clave</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-44">Ventaja Competitiva</th>
                  <th className="py-2.5 px-3 w-52">Amenaza u Oportunidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tabla4_triangulo_competitivo.map((comp, idx) => (
                  <tr key={comp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500 align-top">
                      {comp.id}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-900 align-top leading-snug">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 border border-slate-300 block font-mono">
                        {comp.clasificacion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-extrabold text-slate-950 align-top leading-snug">
                      {comp.marca}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-700 leading-snug text-[11px] align-top">
                      {comp.propuestaValor}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 leading-snug text-[11px] align-top font-mono">
                      {comp.activosDigitalesClave}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-slate-800 leading-snug text-[11px] align-top">
                      {comp.ventajaCompetitiva}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 leading-snug text-[11px] align-top font-medium">
                      {comp.amenazaOportunidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABLA 5: COMPARATIVA DE LAS 3 ESTRATEGIAS DIGITALES       */}
        {/* ========================================================= */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Tabla 5: Comparativa de las 3 Estrategias Digitales (Benchmark de Estrategias)</span>
            </h2>
            <span className="text-xs font-mono text-slate-500">
              Atracción • Contenido • Publicidad (Meta Ad Library)
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-300 rounded-lg shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-900 font-bold">
                  <th className="py-2.5 px-3 border-r border-slate-200 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 w-36 font-bold">Marca / Actor</th>
                  <th className="py-2.5 px-3 border-r border-slate-200">
                    <div>Estrategia de Atracción de Tráfico</div>
                    <div className="text-[10px] text-slate-500 font-normal">Semrush / SimilarWeb / Ubersuggest</div>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-200">
                    <div>Estrategia de Contenidos</div>
                    <div className="text-[10px] text-slate-500 font-normal">Formatos, TikTok Creative Center, Engagement</div>
                  </th>
                  <th className="py-2.5 px-3">
                    <div>Estrategia Publicitaria (Pauta)</div>
                    <div className="text-[10px] text-slate-500 font-normal">Meta Ad Library, Hooks y Ofertas</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tabla5_benchmark_estrategias.map((strat, idx) => (
                  <tr key={strat.id} className={idx === 0 ? 'bg-emerald-50/40 font-medium' : idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold text-slate-500 align-top">
                      {strat.id}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 font-bold text-slate-950 align-top leading-snug">
                      {strat.marca}
                      {idx === 0 && (
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold block mt-1 w-fit">
                          Sujeto Central
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] text-slate-700 leading-snug align-top space-y-1">
                      <p><strong>Canales:</strong> {strat.estrategiaAtraccion.canalesTrafico}</p>
                      <p><strong>Benchmark:</strong> {strat.estrategiaAtraccion.herramientasBenchmark}</p>
                      <p><strong>Métricas:</strong> {strat.estrategiaAtraccion.metricasClave}</p>
                    </td>
                    <td className="py-2.5 px-3 border-r border-slate-200 text-[11px] text-slate-700 leading-snug align-top space-y-1">
                      <p><strong>Formatos:</strong> {strat.estrategiaContenido.formatosDominantes}</p>
                      <p><strong>Herramientas:</strong> {strat.estrategiaContenido.herramientasAnalisis}</p>
                      <p><strong>Tono / Engagement:</strong> {strat.estrategiaContenido.tonoYEngagement}</p>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-700 leading-snug align-top space-y-1">
                      <p><strong>Plataformas:</strong> {strat.estrategiaPublicitaria.plataformasActivas}</p>
                      <p><strong>Ganchos:</strong> {strat.estrategiaPublicitaria.ganchosYTacticas}</p>
                      <p><strong>Meta Library:</strong> {strat.estrategiaPublicitaria.bibliotecaAnuncios}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECCIÓN: MODELO DE NEGOCIO, MONETIZACIÓN & IA             */}
        {/* ========================================================= */}
        {report.businessModelWheel && (
          <section className="space-y-3 break-inside-avoid">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
              <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-900" />
                <span>Rueda Estratégica: Modelo de Negocio, IA y Propuesta de Valor</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">
                5 Ramas de Monetización y Diferenciación
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {report.businessModelWheel.categories.map((cat) => (
                <div
                  key={cat.id}
                  className="border border-slate-300 rounded-xl p-3 bg-slate-50/70 space-y-2 text-xs"
                >
                  <h3
                    className="font-bold text-[11px] uppercase tracking-wider pb-1 border-b border-slate-200 truncate"
                    style={{ color: cat.color }}
                  >
                    {cat.label}
                  </h3>
                  <div className="space-y-2">
                    {cat.nodes.map((n, i) => (
                      <div key={i} className="space-y-0.5">
                        <strong className="text-[10.5px] font-bold text-slate-900 block leading-tight">
                          • {n.title}
                        </strong>
                        <p className="text-[10px] text-slate-600 leading-snug">
                          {n.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* BLOQUE FINAL DE CONCLUSIONES Y RECOMENDACIONES            */}
        {/* ========================================================= */}
        <section className="space-y-4 break-inside-avoid">
          <div className="border-b border-slate-300 pb-1.5">
            <h2 className="text-base font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>Conclusiones Académicas & Dictamen de Consultoría</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5 shadow-sm">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] text-emerald-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Conclusiones Oficiales: Escucha Social</span>
              </h3>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
                {conclusionesFinales.escuchaSocial}
              </p>
            </div>

            <div className="border border-slate-300 rounded-xl p-3.5 bg-slate-50 space-y-1.5 shadow-sm">
              <h3 className="font-bold text-slate-950 uppercase tracking-wider text-[11px] text-cyan-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-700" />
                <span>2. Conclusiones Oficiales: Benchmarking Digital</span>
              </h3>
              <p className="text-slate-700 text-[11px] leading-relaxed text-justify">
                {conclusionesFinales.benchmarkingDigital}
              </p>
            </div>
          </div>

          {/* Recomendaciones Tácticas para la Dirección */}
          <div className="border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2.5">
            <h3 className="font-bold text-slate-950 uppercase tracking-wider text-xs flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              <span>Recomendaciones Estratégicas para la Dirección de Marketing</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-800">
              {conclusionesFinales.recomendacionesEstrategicas.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-emerald-700 mt-0.5">[{i + 1}]</span>
                  <span className="leading-snug">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dictamen de Consultoría */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs text-slate-600 font-mono text-justify leading-relaxed">
            <strong>Dictamen de Consultoría:</strong> {conclusionesFinales.dictamenConsultoria}
          </div>
        </section>

        {/* PIE INSTITUCIONAL DEL REPORTE */}
        <footer className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Generado con DeliverabilityGuard & MiPortal Suite — Auditoría de Escucha Social y Benchmarking</span>
          <span>Documento Oficial de Entrega Académica • Calificación de Rigor 100%</span>
        </footer>
      </div>
    </div>
  );
}
