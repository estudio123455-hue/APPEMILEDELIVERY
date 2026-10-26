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
} from 'lucide-react';
import type { AskPublicResponse, AskPublicCategories } from '@/types/ask-public';

interface AnswerThePublicWheelProps {
  result: AskPublicResponse;
}

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

type DiagramMode = 'radial' | 'tree';

interface SelectedQuestionInfo {
  question: string;
  categoryKey: string;
  categoryLabel: string;
  color: string;
}

export default function AnswerThePublicWheel({ result }: AnswerThePublicWheelProps) {
  const [mode, setMode] = useState<DiagramMode>('radial');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hover states for dynamic path illumination
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredQuestion, setHoveredQuestion] = useState<string | null>(null);

  // Expanded categories in horizontal tree mode
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Tooltip / Popover state for clicked question
  const [selectedQuestion, setSelectedQuestion] = useState<SelectedQuestionInfo | null>(null);
  const [copiedQuestion, setCopiedQuestion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Filter categories with questions
  const activeCategories = useMemo(() => {
    const keys = Object.keys(result.categories) as Array<keyof AskPublicCategories>;
    return keys.filter((key) => result.categories[key] && result.categories[key].length > 0);
  }, [result]);

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
    setCopiedQuestion(true);
    setTimeout(() => setCopiedQuestion(false), 2000);
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
    a.download = `diagrama-answerthepublic-${result.searchTerm.replace(/[^a-z0-9]/gi, '-')}.svg`;
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
        ctx.fillStyle = '#020617'; // slate-950 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `diagrama-answerthepublic-${result.searchTerm.replace(/[^a-z0-9]/gi, '-')}.png`;
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
      style={{ height: '740px' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* ========================================================= */}
      {/* BARRA DE CONTROLES FLOTANTE DEL LIENZO (TOP BAR)          */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
        {/* Selector de Modo de Diagrama */}
        <div className="pointer-events-auto flex items-center p-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => {
              setMode('radial');
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'radial'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Rueda Radial (Sunburst)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('tree');
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              mode === 'tree'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Árbol Horizontal (Mindmap)</span>
          </button>
        </div>

        {/* Herramientas de Pan, Zoom y Descargas */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl text-xs">
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
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Centrar Vista (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={downloadSVG}
            className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1 font-medium cursor-pointer"
            title="Descargar Vector SVG"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            onClick={downloadPNG}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1 font-bold cursor-pointer"
            title="Descargar Imagen PNG de Alta Resolución"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>PNG</span>
          </button>
        </div>
      </div>

      {/* Indicador de ayuda de interacción */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 backdrop-blur-md">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
        <span>Arrastra para desplazar • Rueda para Zoom • Clic en nodo para ver detalles</span>
      </div>

      {/* ========================================================= */}
      {/* LIENZO SVG INTERACTIVO CON CONECTORES VECTORIALES         */}
      {/* ========================================================= */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Filtro de Resplandor Neón */}
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradiente Radial para Conectores */}
          <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Marcadores de inicio y fin */}
          <marker id="dot-marker" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4">
            <circle cx="5" cy="5" r="4" fill="#10b981" />
          </marker>
        </defs>

        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.08s ease-out' }}
        >
          {/* ========================================================= */}
          {/* MODO 1: RUEDA RADIAL CONECTADA (RADIAL SUNBURST)          */}
          {/* ========================================================= */}
          {mode === 'radial' && (
            <g transform="translate(600, 370)">
              {/* Anillo de Referencia Órbita 1 */}
              <circle cx="0" cy="0" r="160" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              {/* Anillo de Referencia Órbita 2 */}
              <circle cx="0" cy="0" r="320" fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="3 3" />

              {/* Conectores y Nodos de Cada Categoría */}
              {activeCategories.map((catKey, catIdx) => {
                const conf = CATEGORY_COLORS[catKey] || { label: catKey, color: '#10b981', bg: '' };
                const numCats = activeCategories.length;
                const catAngle = (2 * Math.PI * catIdx) / numCats - Math.PI / 2;
                const catRadius = 160;
                const catX = catRadius * Math.cos(catAngle);
                const catY = catRadius * Math.sin(catAngle);

                const questions = result.categories[catKey] || [];
                const isCatActive = hoveredCategory === catKey || hoveredCategory === null;

                return (
                  <g key={catKey}>
                    {/* Conector Bézier desde el Centro al Nodo de Categoría */}
                    <path
                      d={`M 0 0 Q ${catX * 0.4} ${catY * 0.4} ${catX} ${catY}`}
                      fill="none"
                      stroke={conf.color}
                      strokeWidth={hoveredCategory === catKey ? 3.5 : 1.8}
                      opacity={isCatActive ? 0.85 : 0.15}
                      filter={hoveredCategory === catKey ? 'url(#glow)' : undefined}
                      className="transition-all duration-300"
                    />

                    {/* Nodo de Categoría Intermedio */}
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

                    {/* Conectores y Nodos de las Preguntas (Anillo Exterior) */}
                    {questions.slice(0, 6).map((qText, qIdx) => {
                      const totalQ = Math.min(questions.length, 6);
                      // Fan out angles around the category's angle
                      const angleSpan = 0.55; // Spread in radians
                      const step = totalQ > 1 ? angleSpan / (totalQ - 1) : 0;
                      const qAngle = catAngle - angleSpan / 2 + qIdx * step;
                      const qRadius = 320;
                      const qX = qRadius * Math.cos(qAngle);
                      const qY = qRadius * Math.sin(qAngle);

                      const isQHovered = hoveredQuestion === qText;
                      const isHighlighted = isQHovered || (hoveredCategory === catKey && hoveredQuestion === null);
                      const pathOpacity = isHighlighted ? 1 : hoveredCategory === null && hoveredQuestion === null ? 0.45 : 0.12;

                      // Cubic Bezier curve from Category Node to Question Node
                      const cpx1 = catX + Math.cos(catAngle) * 50;
                      const cpy1 = catY + Math.sin(catAngle) * 50;
                      const cpx2 = qX - Math.cos(qAngle) * 50;
                      const cpy2 = qY - Math.sin(qAngle) * 50;

                      // Rotation for radial text alignment
                      const isRightSide = Math.cos(qAngle) >= 0;
                      const textRotation = (qAngle * 180) / Math.PI + (isRightSide ? 0 : 180);

                      return (
                        <g key={qIdx}>
                          {/* Conector Bézier Cúbico hacia la Pregunta */}
                          <path
                            d={`M ${catX} ${catY} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${qX} ${qY}`}
                            fill="none"
                            stroke={isHighlighted ? '#34d399' : conf.color}
                            strokeWidth={isHighlighted ? 3 : 1.2}
                            opacity={pathOpacity}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                            className="transition-all duration-200"
                          />

                          {/* Nodo Terminal de Pregunta */}
                          <g
                            transform={`translate(${qX}, ${qY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredQuestion(qText);
                              setHoveredCategory(catKey);
                            }}
                            onMouseLeave={() => {
                              setHoveredQuestion(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedQuestion({
                                question: qText,
                                categoryKey: catKey,
                                categoryLabel: conf.label,
                                color: conf.color,
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

                            {/* Etiqueta de Texto Orientada Radialmente */}
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

              {/* NODO CENTRAL RAÍZ (TÉRMINO ANALIZADO) */}
              <g className="cursor-pointer" onClick={() => handleReset()}>
                <circle
                  r="56"
                  fill="#020617"
                  stroke="#10b981"
                  strokeWidth="3.5"
                  filter="url(#glow)"
                />
                <circle r="52" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
                <text
                  textAnchor="middle"
                  y="-12"
                  fill="#10b981"
                  fontSize="9"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  BÚSQUEDA RAÍZ
                </text>
                <text
                  textAnchor="middle"
                  y="7"
                  fill="#ffffff"
                  fontSize="13"
                  fontWeight="900"
                  className="font-mono"
                >
                  {result.searchTerm.length > 18
                    ? `${result.searchTerm.slice(0, 18)}...`
                    : result.searchTerm}
                </text>
                <text
                  textAnchor="middle"
                  y="24"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {result.totalQuestions} preguntas
                </text>
              </g>
            </g>
          )}

          {/* ========================================================= */}
          {/* MODO 2: DIAGRAMA DE ÁRBOL HORIZONTAL (MINDMAP / ALSOASKED)*/}
          {/* ========================================================= */}
          {mode === 'tree' && (
            <g transform="translate(60, 40)">
              {/* Nodo Raíz Izquierdo */}
              <g transform="translate(80, 320)">
                <rect
                  x="-70"
                  y="-28"
                  width="140"
                  height="56"
                  rx="14"
                  fill="#020617"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  filter="url(#glow)"
                />
                <text textAnchor="middle" y="-6" fill="#10b981" fontSize="9" fontWeight="bold">
                  BÚSQUEDA RAÍZ
                </text>
                <text textAnchor="middle" y="14" fill="#ffffff" fontSize="13" fontWeight="900">
                  {result.searchTerm.length > 14
                    ? `${result.searchTerm.slice(0, 14)}...`
                    : result.searchTerm}
                </text>
              </g>

              {/* Ramificaciones a Categorías y Preguntas */}
              {activeCategories.map((catKey, catIdx) => {
                const conf = CATEGORY_COLORS[catKey] || { label: catKey, color: '#10b981', bg: '' };
                const numCats = activeCategories.length;
                const catY = 50 + catIdx * (620 / Math.max(numCats - 1, 1));
                const catX = 360;
                const isCollapsed = collapsedCategories[catKey];
                const questions = isCollapsed ? [] : result.categories[catKey] || [];

                // Root to Category Horizontal Bézier Curve
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
                      className="transition-all duration-200"
                    />

                    {/* Nodo de Categoría con botón colapsable */}
                    <g
                      transform={`translate(${catX}, ${catY})`}
                      className="cursor-pointer"
                      onClick={() => toggleCategoryCollapse(catKey)}
                      onMouseEnter={() => setHoveredCategory(catKey)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <rect
                        x="-30"
                        y="-16"
                        width="80"
                        height="32"
                        rx="10"
                        fill="#020617"
                        stroke={conf.color}
                        strokeWidth="2"
                        filter={isCatHovered ? 'url(#glow)' : undefined}
                      />
                      <text
                        textAnchor="middle"
                        y="4"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {conf.label}
                      </text>
                      {/* Badge colapsar/expandir */}
                      <circle cx="44" cy="0" r="8" fill="#1e293b" stroke={conf.color} strokeWidth="1" />
                      <text textAnchor="middle" y="3" x="44" fill={conf.color} fontSize="10" fontWeight="bold">
                        {isCollapsed ? '+' : '−'}
                      </text>
                    </g>

                    {/* Ramificaciones de Preguntas */}
                    {questions.slice(0, 5).map((qText, qIdx) => {
                      const totalQ = Math.min(questions.length, 5);
                      const qY = catY - ((totalQ - 1) * 26) / 2 + qIdx * 26;
                      const qX = 520;
                      const isQHovered = hoveredQuestion === qText;
                      const isHighlighted = isQHovered || (hoveredCategory === catKey && hoveredQuestion === null);

                      return (
                        <g key={qIdx}>
                          {/* Conector Bézier de Categoría a Pregunta */}
                          <path
                            d={`M ${catX + 54} ${catY} C ${(catX + 54 + qX) / 2} ${catY}, ${(catX + 54 + qX) / 2} ${qY}, ${qX} ${qY}`}
                            fill="none"
                            stroke={isHighlighted ? '#34d399' : conf.color}
                            strokeWidth={isHighlighted ? 2.5 : 1.2}
                            opacity={isHighlighted ? 1 : hoveredCategory === null ? 0.5 : 0.15}
                            filter={isHighlighted ? 'url(#glow)' : undefined}
                          />

                          {/* Nodo de Pregunta */}
                          <g
                            transform={`translate(${qX}, ${qY})`}
                            className="cursor-pointer group"
                            onMouseEnter={() => {
                              setHoveredQuestion(qText);
                              setHoveredCategory(catKey);
                            }}
                            onMouseLeave={() => {
                              setHoveredQuestion(null);
                              setHoveredCategory(null);
                            }}
                            onClick={() => {
                              setSelectedQuestion({
                                question: qText,
                                categoryKey: catKey,
                                categoryLabel: conf.label,
                                color: conf.color,
                              });
                            }}
                          >
                            <circle
                              r={isHighlighted ? 4.5 : 3.5}
                              fill={isHighlighted ? '#34d399' : conf.color}
                              stroke="#020617"
                              strokeWidth="1.5"
                            />
                            <text
                              x="10"
                              y="3.5"
                              fill={isHighlighted ? '#ffffff' : '#cbd5e1'}
                              fontSize="11"
                              fontWeight={isHighlighted ? 'bold' : 'normal'}
                            >
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
        </g>
      </svg>

      {/* ========================================================= */}
      {/* TOOLTIP / POPOVER FLOTANTE AL HACER CLIC EN PREGUNTA      */}
      {/* ========================================================= */}
      {selectedQuestion && (
        <div className="absolute bottom-6 right-6 z-30 w-80 sm:w-96 p-4 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl animate-fade-in text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                color: selectedQuestion.color,
                backgroundColor: `${selectedQuestion.color}20`,
                borderColor: `${selectedQuestion.color}40`,
                borderWidth: 1,
              }}
            >
              Consulta: {selectedQuestion.categoryLabel}
            </span>
            <button
              type="button"
              onClick={() => setSelectedQuestion(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-sm font-semibold text-white leading-snug">
            "{selectedQuestion.question}"
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => copyToClipboard(selectedQuestion.question)}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedQuestion ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Pregunta</span>
                </>
              )}
            </button>

            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(selectedQuestion.question)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Buscar en Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
