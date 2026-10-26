'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy,
  Check,
  ExternalLink,
  CircleDot,
  GitFork,
  Layers,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Info,
  HelpCircle,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import type { AskPublicResponse, AskPublicCategories } from '@/types/ask-public';
import type { BusinessModelWheelData, BusinessModelCategory, BusinessModelNode } from '@/types/market-report';

export type WheelType = 'questions' | 'business_model';
export type DiagramMode = 'radial' | 'tree';

const CATEGORY_COLORS: Record<string, { label: string; color: string; bg: string }> = {
  que: { label: 'Qué', color: '#10b981', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  como: { label: 'Cómo', color: '#06b6d4', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
  por_que: { label: 'Por qué', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  donde: { label: 'Dónde', color: '#8b5cf6', bg: 'bg-violet-500/20 text-violet-400 border-violet-500/40' },
  cuando: { label: 'Cuándo', color: '#ec4899', bg: 'bg-pink-500/20 text-pink-400 border-pink-500/40' },
  cual: { label: 'Cuál', color: '#3b82f6', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  quien: { label: 'Quién', color: '#14b8a6', bg: 'bg-teal-500/20 text-teal-400 border-teal-500/40' },
  puede: { label: 'Puede', color: '#eab308', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  son: { label: 'Son', color: '#f97316', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40' },
};

interface AnswerThePublicWheelProps {
  result: AskPublicResponse;
  businessModelWheel?: BusinessModelWheelData;
  activeWheelTab?: WheelType;
  onWheelTabChange?: (tab: WheelType) => void;
}

interface SelectedNodeInfo {
  title: string;
  desc?: string;
  categoryLabel: string;
  color: string;
  isQuestion?: boolean;
}

export default function AnswerThePublicWheel({
  result,
  businessModelWheel,
  activeWheelTab,
  onWheelTabChange,
}: AnswerThePublicWheelProps) {
  // Selector de Rueda 1 (Preguntas) vs Rueda 2 (Modelo de Negocio con IA)
  const [internalWheelType, setInternalWheelType] = useState<WheelType>('questions');
  const wheelType = activeWheelTab ?? internalWheelType;

  const handleWheelTypeChange = (nextType: WheelType) => {
    setInternalWheelType(nextType);
    onWheelTabChange?.(nextType);
    handleReset();
  };

  const [mode, setMode] = useState<DiagramMode>('radial');

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hover states for vector highlighting
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Expanded categories in horizontal tree mode
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Tooltip / Popover state
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Active question categories
  const activeQuestionCategories = useMemo(() => {
    const keys = Object.keys(result.categories) as Array<keyof AskPublicCategories>;
    return keys.filter((key) => result.categories[key] && result.categories[key].length > 0);
  }, [result]);

  // Contextual Business Model Wheel Data (Default or AI generated)
  const effectiveBusinessModel = useMemo<BusinessModelWheelData>(() => {
    if (businessModelWheel) return businessModelWheel;

    const brand = result.searchTerm.charAt(0).toUpperCase() + result.searchTerm.slice(1);
    return {
      coreEntity: brand,
      categories: [
        {
          id: 'segmentos',
          label: 'Segmentos de Mercado',
          color: '#10b981', // Esmeralda
          nodes: [
            {
              title: 'B2B Profesionales / Agencias',
              desc: 'Equipos que necesitan automatizar auditorías sin fricción y entregar reportes con marca propia.',
            },
            {
              title: 'Creadores / Solo-founders',
              desc: 'Usuarios buscando presencia comercial rápida, económica y posicionamiento en buscadores.',
            },
            {
              title: 'Comercio Local & Servicios',
              desc: 'Negocios tradicionales digitalizando captación, citas y comunicación omnicanal con sus clientes.',
            },
          ],
        },
        {
          id: 'monetizacion_ia',
          label: 'Modelo de Negocio & IA',
          color: '#06b6d4', // Cian
          nodes: [
            {
              title: 'SaaS Freemium con Paywall Inteligente',
              desc: 'Escaneos básicos gratis + Auditorías profundas y monitoreo continuo bajo suscripción recurrente.',
            },
            {
              title: 'IA Copilot de Diagnóstico',
              desc: 'Generación automática de entregables académicos, planes de acción y copys estratégicos.',
            },
            {
              title: 'Cobros por Uso / API Tokens',
              desc: 'Monetización de consultas automatizadas para integraciones en agencias y desarrolladores aliados.',
            },
          ],
        },
        {
          id: 'comparacion_competidores',
          label: 'Comparativa de Competidores',
          color: '#f59e0b', // Ámbar
          nodes: [
            {
              title: 'Vs Competidor Directo',
              desc: 'Menor costo, interfaz en español y configuración en 1 clic.',
            },
            {
              title: 'Vs Referente Aspiracional (Squarespace/Vercel)',
              desc: 'Especialización vertical en entregabilidad de correo y reputación de dominio.',
            },
            {
              title: 'Vs Competidor Indirecto (Herramientas manuales)',
              desc: 'Automatización sin necesidad de conocimientos de consola ni configuraciones complejas.',
            },
          ],
        },
        {
          id: 'valor_agregado',
          label: 'Valor Agregado Diferencial',
          color: '#8b5cf6', // Violeta
          nodes: [
            {
              title: 'Suite Todo-en-Uno Unificada',
              desc: 'Combina seguridad DNS, benchmarking y páginas de negocio en un solo SaaS.',
            },
            {
              title: 'Reportes Académicos y Ejecutivos en 1 Clic',
              desc: 'PDFs formales listos para presentar ante directivos o profesores sin redactar manualmente.',
            },
            {
              title: 'Diagnósticos Predictivos DNSBL & TLS',
              desc: 'Prevención proactiva antes de que los correos reboten o caigan a spam.',
            },
          ],
        },
        {
          id: 'propuesta_valor',
          label: 'Sugerencias de Propuesta de Valor',
          color: '#ec4899', // Rosa
          nodes: [
            {
              title: 'Propuesta 1 (Enfocada en Seguridad)',
              desc: "'Blinda la reputación de tu dominio y asegura que tus cotizaciones jamás caigan en spam'",
            },
            {
              title: 'Propuesta 2 (Enfocada en Crecimiento)',
              desc: "'Tu ecosistema comercial digital completo en minutos con inteligencia de mercado'",
            },
            {
              title: 'Propuesta 3 (Enfocada en Agilidad)',
              desc: "'De la idea al mercado: auditoría, presencia web y benchmarking sin código'",
            },
          ],
        },
      ],
    };
  }, [businessModelWheel, result.searchTerm]);

  const toggleCategoryCollapse = (catKey: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(Math.max(prev + delta, 0.4), 2.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-control')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(Math.max(prev + zoomDelta, 0.4), 2.5));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Export SVG file
  const downloadSVG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const prefix = wheelType === 'business_model' ? 'modelo-negocio-ia' : 'preguntas-answerthepublic';
    a.download = `diagrama-${prefix}-${result.searchTerm.replace(/[^a-z0-9]/gi, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export High Resolution PNG
  const downloadPNG = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 2400;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        const prefix = wheelType === 'business_model' ? 'modelo-negocio-ia' : 'preguntas-answerthepublic';
        a.download = `diagrama-${prefix}-${result.searchTerm.replace(/[^a-z0-9]/gi, '-')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URLObject.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden select-none"
      style={{ height: '760px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE SELECTOR DE RUEDAS & CONTROLES          */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pointer-events-none">
        {/* Selector de Ruedas: Rueda 1 vs Rueda 2 */}
        <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleWheelTypeChange('questions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              wheelType === 'questions'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>🌐 Rueda 1: Escucha Social (Preguntas Google)</span>
          </button>

          <button
            type="button"
            onClick={() => handleWheelTypeChange('business_model')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              wheelType === 'business_model'
                ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>⚡ Rueda 2: Modelo de Negocio & Estrategia IA</span>
          </button>
        </div>

        {/* Selector de Modo de Diagrama (Radial Sunburst vs Árbol Jerárquico) y Zoom */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => {
                setMode('radial');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                mode === 'radial'
                  ? 'bg-slate-800 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Radial Sunburst</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('tree');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                mode === 'tree'
                  ? 'bg-slate-800 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Árbol Jerárquico (Mindmap)</span>
            </button>
          </div>

          {/* Botones de Zoom, Reset y Exportar */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs">
            <button
              type="button"
              onClick={() => handleZoom(0.15)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleZoom(-0.15)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer font-medium flex items-center gap-1"
              title="Centrar Vista (Reset 100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset 100%</span>
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              type="button"
              onClick={downloadSVG}
              className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 font-medium cursor-pointer"
              title="Descargar SVG Vectorial"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Descargar SVG</span>
            </button>

            <button
              type="button"
              onClick={downloadPNG}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1 font-bold cursor-pointer"
              title="Exportar Imagen PNG Alta Resolución (2400x2400)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar PNG (2400x2400)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de ayuda */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>
          {wheelType === 'business_model'
            ? 'Rueda de Modelo de Negocio & IA activa • Clic en nodo para ver detalles estratégicos'
            : 'Rueda de Escucha activa • Clic en nodo para ver la consulta y buscarla en Google'}
        </span>
      </div>

      {/* ========================================================= */}
      {/* LIENZO SVG INTERACTIVO                                    */}
      {/* ========================================================= */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.08s ease-out' }}
        >
          {/* ========================================================= */}
          {/* RUEDA 1: ESCUCHA DE PREGUNTAS (GOOGLE SUGGEST)            */}
          {/* ========================================================= */}
          {wheelType === 'questions' && mode === 'radial' && (
            <g transform="translate(600, 390)">
              <circle cx="0" cy="0" r="160" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="0" cy="0" r="320" fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />

              {activeQuestionCategories.map((catKey, catIdx) => {
                const conf = CATEGORY_COLORS[catKey] || { label: catKey, color: '#10b981', bg: '' };
                const numCats = activeQuestionCategories.length;
                const catAngle = (2 * Math.PI * catIdx) / numCats - Math.PI / 2;
                const catRadius = 160;
                const catX = catRadius * Math.cos(catAngle);
                const catY = catRadius * Math.sin(catAngle);
                const questions = result.categories[catKey] || [];
                const isCatActive = hoveredCategory === catKey || hoveredCategory === null;

                return (
                  <g key={catKey}>
                    <path
                      d={`M 0 0 Q ${catX * 0.4} ${catY * 0.4} ${catX} ${catY}`}
                      fill="none"
                      stroke={conf.color}
                      strokeWidth={hoveredCategory === catKey ? 3.5 : 1.8}
                      opacity={isCatActive ? 0.85 : 0.15}
                      filter={hoveredCategory === catKey ? 'url(#glow)' : undefined}
                      className="transition-all duration-300"
                    />

                    <g
                      transform={`translate(${catX}, ${catY})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(catKey)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <circle
                        r="24"
                        fill="#020617"
                        stroke={conf.color}
                        strokeWidth="2.5"
                        filter={hoveredCategory === catKey ? 'url(#glow)' : undefined}
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {conf.label}
                      </text>
                    </g>

                    {questions.slice(0, 6).map((qText, qIdx) => {
                      const totalQ = Math.min(questions.length, 6);
                      const angleSpan = 0.55;
                      const step = totalQ > 1 ? angleSpan / (totalQ - 1) : 0;
                      const qAngle = catAngle - angleSpan / 2 + qIdx * step;
                      const qRadius = 320;
                      const qX = qRadius * Math.cos(qAngle);
                      const qY = qRadius * Math.sin(qAngle);

                      const isQHovered = hoveredNode === qText;
                      const isHighlighted = isQHovered || (hoveredCategory === catKey && hoveredNode === null);
                      const pathOpacity = isHighlighted ? 1 : hoveredCategory === null && hoveredNode === null ? 0.45 : 0.12;

                      const cpx1 = catX + Math.cos(catAngle) * 50;
                      const cpy1 = catY + Math.sin(catAngle) * 50;
                      const cpx2 = qX - Math.cos(qAngle) * 50;
                      const cpy2 = qY - Math.sin(qAngle) * 50;

                      const isRightSide = Math.cos(qAngle) >= 0;
                      const textRotation = (qAngle * 180) / Math.PI + (isRightSide ? 0 : 180);

                      return (
                        <g key={qIdx}>
                          <path
                            d={`M ${catX} ${catY} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${qX} ${qY}`}
                            fill="none"
                            stroke={isHighlighted ? '#34d399' : conf.color}
                            strokeWidth={isHighlighted ? 3 : 1.2}
                            opacity={pathOpacity}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                            className="transition-all duration-200"
                          />

                          <g
                            transform={`translate(${qX}, ${qY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredNode(qText);
                              setHoveredCategory(catKey);
                            }}
                            onMouseLeave={() => {
                              setHoveredNode(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedNode({
                                title: qText,
                                categoryLabel: conf.label,
                                color: conf.color,
                                isQuestion: true,
                              });
                            }}
                          >
                            <circle
                              r={isHighlighted ? 6 : 4}
                              fill={isHighlighted ? '#34d399' : conf.color}
                              stroke="#020617"
                              strokeWidth="2"
                              className="transition-transform group-hover:scale-125"
                            />
                            <g transform={`rotate(${textRotation})`}>
                              <text
                                x={isRightSide ? 10 : -10}
                                y="3"
                                textAnchor={isRightSide ? 'start' : 'end'}
                                fill={isHighlighted ? '#ffffff' : '#94a3b8'}
                                fontSize="10"
                                fontWeight={isHighlighted ? 'bold' : 'normal'}
                                className="transition-colors select-none"
                              >
                                {qText.length > 36 ? `${qText.slice(0, 36)}...` : qText}
                              </text>
                            </g>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Nodo Central Raíz */}
              <g className="cursor-pointer" onClick={() => handleReset()}>
                <circle r="56" fill="#020617" stroke="#10b981" strokeWidth="3.5" filter="url(#glow)" />
                <circle r="52" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
                <text textAnchor="middle" y="-12" fill="#10b981" fontSize="9" fontWeight="bold" letterSpacing="1">
                  BÚSQUEDA RAÍZ
                </text>
                <text textAnchor="middle" y="7" fill="#ffffff" fontSize="13" fontWeight="900" className="font-mono">
                  {result.searchTerm.length > 18 ? `${result.searchTerm.slice(0, 18)}...` : result.searchTerm}
                </text>
                <text textAnchor="middle" y="24" fill="#64748b" fontSize="10" fontFamily="monospace">
                  {result.totalQuestions} preguntas
                </text>
              </g>
            </g>
          )}

          {/* ========================================================= */}
          {/* RUEDA 1: MODO ÁRBOL HORIZONTAL (PREGUNTAS)                 */}
          {/* ========================================================= */}
          {wheelType === 'questions' && mode === 'tree' && (
            <g transform="translate(60, 40)">
              <g transform="translate(80, 320)">
                <rect x="-70" y="-28" width="140" height="56" rx="14" fill="#020617" stroke="#10b981" strokeWidth="2.5" filter="url(#glow)" />
                <text textAnchor="middle" y="-6" fill="#10b981" fontSize="9" fontWeight="bold">
                  BÚSQUEDA RAÍZ
                </text>
                <text textAnchor="middle" y="14" fill="#ffffff" fontSize="13" fontWeight="900">
                  {result.searchTerm.length > 14 ? `${result.searchTerm.slice(0, 14)}...` : result.searchTerm}
                </text>
              </g>

              {activeQuestionCategories.map((catKey, catIdx) => {
                const conf = CATEGORY_COLORS[catKey] || { label: catKey, color: '#10b981', bg: '' };
                const numCats = activeQuestionCategories.length;
                const catY = 50 + catIdx * (620 / Math.max(numCats - 1, 1));
                const catX = 360;
                const isCollapsed = collapsedCategories[catKey];
                const questions = isCollapsed ? [] : result.categories[catKey] || [];
                const rootX = 150;
                const rootY = 320;
                const isCatHovered = hoveredCategory === catKey;

                return (
                  <g key={catKey}>
                    <path
                      d={`M ${rootX} ${rootY} C ${(rootX + catX) / 2} ${rootY}, ${(rootX + catX) / 2} ${catY}, ${catX - 30} ${catY}`}
                      fill="none"
                      stroke={conf.color}
                      strokeWidth={isCatHovered ? 3 : 1.6}
                      opacity={hoveredCategory === null || isCatHovered ? 0.85 : 0.15}
                      filter={isCatHovered ? 'url(#glow)' : undefined}
                    />

                    <g
                      transform={`translate(${catX}, ${catY})`}
                      className="cursor-pointer"
                      onClick={() => toggleCategoryCollapse(catKey)}
                      onMouseEnter={() => setHoveredCategory(catKey)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect x="-30" y="-16" width="80" height="32" rx="10" fill="#020617" stroke={conf.color} strokeWidth="2" filter={isCatHovered ? 'url(#glow)' : undefined} />
                      <text textAnchor="middle" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" className="pointer-events-none">
                        {conf.label}
                      </text>
                      <circle cx="44" cy="0" r="8" fill="#1e293b" stroke={conf.color} strokeWidth="1" />
                      <text textAnchor="middle" y="3" x="44" fill={conf.color} fontSize="10" fontWeight="bold">
                        {isCollapsed ? '+' : '−'}
                      </text>
                    </g>

                    {questions.slice(0, 5).map((qText, qIdx) => {
                      const totalQ = Math.min(questions.length, 5);
                      const qY = catY - ((totalQ - 1) * 26) / 2 + qIdx * 26;
                      const qX = 520;
                      const isQHovered = hoveredNode === qText;
                      const isHighlighted = isQHovered || (hoveredCategory === catKey && hoveredNode === null);

                      return (
                        <g key={qIdx}>
                          <path
                            d={`M ${catX + 54} ${catY} C ${(catX + 54 + qX) / 2} ${catY}, ${(catX + 54 + qX) / 2} ${qY}, ${qX} ${qY}`}
                            fill="none"
                            stroke={isHighlighted ? '#34d399' : conf.color}
                            strokeWidth={isHighlighted ? 2.5 : 1.2}
                            opacity={isHighlighted ? 1 : hoveredCategory === null ? 0.5 : 0.15}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                          />

                          <g
                            transform={`translate(${qX}, ${qY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredNode(qText);
                              setHoveredCategory(catKey);
                            }}
                            onMouseLeave={() => {
                              setHoveredNode(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedNode({
                                title: qText,
                                categoryLabel: conf.label,
                                color: conf.color,
                                isQuestion: true,
                              });
                            }}
                          >
                            <circle r={isHighlighted ? 4.5 : 3.5} fill={isHighlighted ? '#34d399' : conf.color} stroke="#020617" strokeWidth="1.5" />
                            <text x="10" y="3.5" fill={isHighlighted ? '#ffffff' : '#cbd5e1'} fontSize="11" fontWeight={isHighlighted ? 'bold' : 'normal'}>
                              {qText.length > 55 ? `${qText.slice(0, 55)}...` : qText}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* ========================================================= */}
          {/* RUEDA 2: MODELO DE NEGOCIO & ESTRATEGIA CON IA (RADIAL)    */}
          {/* ========================================================= */}
          {wheelType === 'business_model' && mode === 'radial' && (
            <g transform="translate(600, 390)">
              <circle cx="0" cy="0" r="175" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="0" cy="0" r="330" fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />

              {effectiveBusinessModel.categories.map((cat, catIdx) => {
                const numCats = effectiveBusinessModel.categories.length; // 5
                const catAngle = (2 * Math.PI * catIdx) / numCats - Math.PI / 2;
                const catRadius = 175;
                const catX = catRadius * Math.cos(catAngle);
                const catY = catRadius * Math.sin(catAngle);
                const isCatActive = hoveredCategory === cat.id || hoveredCategory === null;

                return (
                  <g key={cat.id}>
                    {/* Conector Central hacia la Rama de Negocio */}
                    <path
                      d={`M 0 0 Q ${catX * 0.4} ${catY * 0.4} ${catX} ${catY}`}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={hoveredCategory === cat.id ? 3.5 : 2}
                      opacity={isCatActive ? 0.9 : 0.15}
                      filter={hoveredCategory === cat.id ? 'url(#glow)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Nodo de Rama Estratégica */}
                    <g
                      transform={`translate(${catX}, ${catY})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect
                        x="-55"
                        y="-16"
                        width="110"
                        height="32"
                        rx="10"
                        fill="#020617"
                        stroke={cat.color}
                        strokeWidth="2.5"
                        filter={hoveredCategory === cat.id ? 'url(#glow)' : undefined}
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {cat.label}
                      </text>
                    </g>

                    {/* Conectores y Nodos de las 3 Estrategias / Tácticas */}
                    {cat.nodes.map((node, nodeIdx) => {
                      const totalNodes = cat.nodes.length;
                      const angleSpan = 0.52;
                      const step = totalNodes > 1 ? angleSpan / (totalNodes - 1) : 0;
                      const nodeAngle = catAngle - angleSpan / 2 + nodeIdx * step;
                      const nodeRadius = 330;
                      const nodeX = nodeRadius * Math.cos(nodeAngle);
                      const nodeY = nodeRadius * Math.sin(nodeAngle);

                      const isNodeHovered = hoveredNode === node.title;
                      const isHighlighted = isNodeHovered || (hoveredCategory === cat.id && hoveredNode === null);
                      const pathOpacity = isHighlighted ? 1 : hoveredCategory === null && hoveredNode === null ? 0.5 : 0.15;

                      const cpx1 = catX + Math.cos(catAngle) * 60;
                      const cpy1 = catY + Math.sin(catAngle) * 60;
                      const cpx2 = nodeX - Math.cos(nodeAngle) * 60;
                      const cpy2 = nodeY - Math.sin(nodeAngle) * 60;

                      const isRightSide = Math.cos(nodeAngle) >= 0;
                      const textRotation = (nodeAngle * 180) / Math.PI + (isRightSide ? 0 : 180);

                      return (
                        <g key={node.title}>
                          <path
                            d={`M ${catX} ${catY} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${nodeX} ${nodeY}`}
                            fill="none"
                            stroke={isHighlighted ? '#ffffff' : cat.color}
                            strokeWidth={isHighlighted ? 3 : 1.4}
                            opacity={pathOpacity}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                            className="transition-all duration-200"
                          />

                          <g
                            transform={`translate(${nodeX}, ${nodeY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredNode(node.title);
                              setHoveredCategory(cat.id);
                            }}
                            onMouseLeave={() => {
                              setHoveredNode(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedNode({
                                title: node.title,
                                desc: node.desc,
                                categoryLabel: cat.label,
                                color: cat.color,
                                isQuestion: false,
                              });
                            }}
                          >
                            <circle
                              r={isHighlighted ? 6 : 4.5}
                              fill={isHighlighted ? '#ffffff' : cat.color}
                              stroke="#020617"
                              strokeWidth="2"
                              className="transition-transform group-hover:scale-125"
                            />
                            <g transform={`rotate(${textRotation})`}>
                              <text
                                x={isRightSide ? 12 : -12}
                                y="3"
                                textAnchor={isRightSide ? 'start' : 'end'}
                                fill={isHighlighted ? '#ffffff' : '#cbd5e1'}
                                fontSize="10.5"
                                fontWeight={isHighlighted ? 'bold' : '500'}
                                className="transition-colors select-none font-medium"
                              >
                                {node.title.length > 32 ? `${node.title.slice(0, 32)}...` : node.title}
                              </text>
                            </g>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* NÚCLEO ESTRATÉGICO CENTRAL */}
              <g className="cursor-pointer" onClick={() => handleReset()}>
                <circle r="60" fill="#020617" stroke="#06b6d4" strokeWidth="3.5" filter="url(#glow)" />
                <circle r="56" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                <rect x="-50" y="-26" width="100" height="15" rx="7.5" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1" />
                <text textAnchor="middle" y="-15" fill="#38bdf8" fontSize="8" fontWeight="bold" letterSpacing="0.8">
                  MODELO DE NEGOCIO
                </text>
                <text textAnchor="middle" y="5" fill="#ffffff" fontSize="13" fontWeight="900" className="font-mono">
                  {effectiveBusinessModel.coreEntity.length > 16
                    ? `${effectiveBusinessModel.coreEntity.slice(0, 16)}...`
                    : effectiveBusinessModel.coreEntity}
                </text>
                <text textAnchor="middle" y="23" fill="#10b981" fontSize="9.5" fontWeight="bold">
                  Estrategia & IA
                </text>
              </g>
            </g>
          )}

          {/* ========================================================= */}
          {/* RUEDA 2: MODO ÁRBOL HORIZONTAL (MODELO DE NEGOCIO)        */}
          {/* ========================================================= */}
          {wheelType === 'business_model' && mode === 'tree' && (
            <g transform="translate(60, 40)">
              {/* Raíz Izquierda */}
              <g transform="translate(90, 320)">
                <rect x="-80" y="-30" width="160" height="60" rx="14" fill="#020617" stroke="#06b6d4" strokeWidth="2.5" filter="url(#glow)" />
                <rect x="-55" y="-23" width="110" height="14" rx="7" fill="#06b6d4" fillOpacity="0.2" stroke="#06b6d4" strokeWidth="1" />
                <text textAnchor="middle" y="-13" fill="#38bdf8" fontSize="8" fontWeight="bold" letterSpacing="0.8">
                  MODELO DE NEGOCIO
                </text>
                <text textAnchor="middle" y="10" fill="#ffffff" fontSize="13" fontWeight="900">
                  {effectiveBusinessModel.coreEntity.length > 14
                    ? `${effectiveBusinessModel.coreEntity.slice(0, 14)}...`
                    : effectiveBusinessModel.coreEntity}
                </text>
              </g>

              {effectiveBusinessModel.categories.map((cat, catIdx) => {
                const numCats = effectiveBusinessModel.categories.length; // 5
                const catY = 80 + catIdx * (520 / Math.max(numCats - 1, 1));
                const catX = 390;
                const isCollapsed = collapsedCategories[cat.id];
                const nodes = isCollapsed ? [] : cat.nodes;
                const rootX = 170;
                const rootY = 320;
                const isCatHovered = hoveredCategory === cat.id;

                return (
                  <g key={cat.id}>
                    <path
                      d={`M ${rootX} ${rootY} C ${(rootX + catX) / 2} ${rootY}, ${(rootX + catX) / 2} ${catY}, ${catX - 50} ${catY}`}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={isCatHovered ? 3 : 1.6}
                      opacity={hoveredCategory === null || isCatHovered ? 0.9 : 0.15}
                      filter={isCatHovered ? 'url(#glow)' : undefined}
                    />

                    <g
                      transform={`translate(${catX}, ${catY})`}
                      className="cursor-pointer"
                      onClick={() => toggleCategoryCollapse(cat.id)}
                      onMouseEnter={() => setHoveredCategory(cat.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect x="-50" y="-18" width="125" height="36" rx="10" fill="#020617" stroke={cat.color} strokeWidth="2" filter={isCatHovered ? 'url(#glow)' : undefined} />
                      <text textAnchor="middle" y="4" fill="#ffffff" fontSize="10.5" fontWeight="bold" className="pointer-events-none">
                        {cat.label}
                      </text>
                      <circle cx="70" cy="0" r="8" fill="#1e293b" stroke={cat.color} strokeWidth="1" />
                      <text textAnchor="middle" y="3" x="70" fill={cat.color} fontSize="10" fontWeight="bold">
                        {isCollapsed ? '+' : '−'}
                      </text>
                    </g>

                    {nodes.map((node, nodeIdx) => {
                      const totalNodes = nodes.length;
                      const nodeY = catY - ((totalNodes - 1) * 32) / 2 + nodeIdx * 32;
                      const nodeX = 570;
                      const isNodeHovered = hoveredNode === node.title;
                      const isHighlighted = isNodeHovered || (hoveredCategory === cat.id && hoveredNode === null);

                      return (
                        <g key={node.title}>
                          <path
                            d={`M ${catX + 78} ${catY} C ${(catX + 78 + nodeX) / 2} ${catY}, ${(catX + 78 + nodeX) / 2} ${nodeY}, ${nodeX} ${nodeY}`}
                            fill="none"
                            stroke={isHighlighted ? '#ffffff' : cat.color}
                            strokeWidth={isHighlighted ? 2.5 : 1.2}
                            opacity={isHighlighted ? 1 : hoveredCategory === null ? 0.6 : 0.15}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                          />

                          <g
                            transform={`translate(${nodeX}, ${nodeY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredNode(node.title);
                              setHoveredCategory(cat.id);
                            }}
                            onMouseLeave={() => {
                              setHoveredNode(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedNode({
                                title: node.title,
                                desc: node.desc,
                                categoryLabel: cat.label,
                                color: cat.color,
                                isQuestion: false,
                              });
                            }}
                          >
                            <circle r={isHighlighted ? 5 : 3.5} fill={isHighlighted ? '#ffffff' : cat.color} stroke="#020617" strokeWidth="1.5" />
                            <text x="12" y="4" fill={isHighlighted ? '#ffffff' : '#e2e8f0'} fontSize="11" fontWeight={isHighlighted ? 'bold' : 'normal'}>
                              {node.title}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}
        </g>
      </svg>

      {/* ========================================================= */}
      {/* TOOLTIP / POPOVER FLOTANTE                                */}
      {/* ========================================================= */}
      {selectedNode && (
        <div className="absolute bottom-6 right-6 z-30 w-80 sm:w-[420px] p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl animate-fade-in text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: selectedNode.color,
                backgroundColor: `${selectedNode.color}20`,
                borderColor: `${selectedNode.color}40`,
                borderWidth: 1,
              }}
            >
              {selectedNode.categoryLabel}
            </span>
            <button
              type="button"
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white leading-snug">
              {selectedNode.title}
            </h4>
            {selectedNode.desc && (
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                {selectedNode.desc}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => copyToClipboard(selectedNode.desc ? `${selectedNode.title}: ${selectedNode.desc}` : selectedNode.title)}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Información</span>
                </>
              )}
            </button>

            {selectedNode.isQuestion && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(selectedNode.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Buscar en Google</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
