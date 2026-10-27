'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MindNode,
  MindConnection,
  MindNodeCategory,
  CATEGORY_CONFIG,
  TUNNELVISION_DEFAULT_NODES,
  TUNNELVISION_DEFAULT_CONNECTIONS,
} from './types';
import {
  Plus,
  Trash2,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Layers,
  ArrowRight,
  Move,
  Lightbulb,
  Target,
  Users,
  Zap,
  Rocket,
  X,
  Link as LinkIcon,
  Check,
} from 'lucide-react';

const STORAGE_KEY = 'miportal_mind_canvas_state';
const NODE_WIDTH = 250;
const NODE_HEIGHT = 130;

export default function MindCanvas() {
  const [nodes, setNodes] = useState<MindNode[]>(TUNNELVISION_DEFAULT_NODES);
  const [connections, setConnections] = useState<MindConnection[]>(TUNNELVISION_DEFAULT_CONNECTIONS);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Pan / Dragging states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Connection creation mode
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // New Node Modal
  const [isNewNodeOpen, setIsNewNodeOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<MindNodeCategory>('essence');

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Cargar estado desde localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
            setNodes(parsed.nodes);
            setConnections(parsed.connections || []);
            if (parsed.zoom) setZoom(parsed.zoom);
            if (parsed.pan) setPan(parsed.pan);
          }
        }
      } catch {
        // mantener por defecto
      }
    }
  }, []);

  // Persistir en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ nodes, connections, zoom, pan })
        );
      } catch {
        // ignorar
      }
    }
  }, [nodes, connections, zoom, pan]);

  // Zoom con rueda del ratón
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.0, Math.max(0.4, prev * zoomFactor)));
  };

  // Iniciar Pan del lienzo
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Solo si el click es directo en el fondo
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setConnectingFromId(null);
    }
  };

  // Mover ratón (Pan del lienzo o Drag de nodo)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggedNodeId) {
      const newX = (e.clientX - pan.x) / zoom - dragOffset.x;
      const newY = (e.clientY - pan.y) / zoom - dragOffset.y;

      setNodes((prev) =>
        prev.map((n) => (n.id === draggedNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n))
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Iniciar arrastre de un nodo
  const handleNodeMouseDown = (e: React.MouseEvent, node: MindNode) => {
    e.stopPropagation();
    if (connectingFromId) {
      // Si estamos en modo conectar y hacemos clic en otro nodo
      if (connectingFromId !== node.id) {
        const newConn: MindConnection = {
          id: `conn-${Date.now()}`,
          fromId: connectingFromId,
          toId: node.id,
        };
        setConnections((prev) => [...prev, newConn]);
      }
      setConnectingFromId(null);
      return;
    }

    setDraggedNodeId(node.id);
    const mouseCanvasX = (e.clientX - pan.x) / zoom;
    const mouseCanvasY = (e.clientY - pan.y) / zoom;
    setDragOffset({
      x: mouseCanvasX - node.x,
      y: mouseCanvasY - node.y,
    });
  };

  // Añadir nuevo nodo
  const handleAddNode = () => {
    if (!newTitle.trim()) return;

    // Calcular posición cerca del centro actual del viewport
    const centerX = (-pan.x + (containerRef.current?.clientWidth || 800) / 2) / zoom;
    const centerY = (-pan.y + (containerRef.current?.clientHeight || 600) / 2) / zoom;

    const newNode: MindNode = {
      id: `node-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      x: Math.round(centerX - NODE_WIDTH / 2),
      y: Math.round(centerY - NODE_HEIGHT / 2),
    };

    setNodes((prev) => [...prev, newNode]);
    setNewTitle('');
    setNewDescription('');
    setIsNewNodeOpen(false);
  };

  // Eliminar nodo y sus conexiones
  const handleDeleteNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setConnections((prev) => prev.filter((c) => c.fromId !== id && c.toId !== id));
  };

  // Eliminar conexión
  const handleDeleteConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  // Cargar plantilla TUNNELVISION
  const handleLoadTemplate = () => {
    if (confirm('¿Cargar la plantilla oficial TUNNELVISION (De Caos a Orden)?')) {
      setNodes(TUNNELVISION_DEFAULT_NODES);
      setConnections(TUNNELVISION_DEFAULT_CONNECTIONS);
      setZoom(1);
      setPan({ x: 50, y: 50 });
    }
  };

  // Limpiar lienzo
  const handleClearCanvas = () => {
    if (confirm('¿Limpiar todo el lienzo creativo?')) {
      setNodes([
        {
          id: 'node-start',
          title: 'Nueva Gran Idea',
          description: 'Escribe aquí tu pensamiento inicial para estructurarlo.',
          category: 'chaos',
          x: 200,
          y: 200,
        },
      ]);
      setConnections([]);
      setZoom(1);
      setPan({ x: 50, y: 50 });
    }
  };

  // Exportar SVG
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    try {
      const svgElement = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgElement);

      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = svgUrl;
      downloadLink.download = `miportal-mind-canvas-${Date.now()}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      alert('Error exportando SVG');
    }
  };

  // Helper para renderizar iconos según categoría
  const renderCategoryIcon = (category: MindNodeCategory) => {
    switch (category) {
      case 'chaos':
        return <Lightbulb className="w-4 h-4 text-slate-400" />;
      case 'essence':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'audience':
        return <Users className="w-4 h-4 text-cyan-400" />;
      case 'benchmarking':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'solution':
        return <Rocket className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="relative w-full h-[760px] bg-[#07090E] border border-slate-800 rounded-3xl overflow-hidden select-none flex flex-col shadow-2xl">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR DE HERRAMIENTAS Y ACCIONES                  */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Grupo Izquierdo: Título y Plantilla */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-2xl px-3.5 py-2 flex items-center gap-2.5 shadow-lg">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>MiPortal Mind Canvas</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  TUNNELVISION
                </span>
              </span>
              <p className="text-[10px] text-slate-400">De caos mental a proyecto estructurado</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadTemplate}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Cargar el mapa mental modelo de 5 pasos de TUNNELVISION"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Plantilla TUNNELVISION</span>
          </button>
        </div>

        {/* Grupo Derecho: Agregar Idea & Exportar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setIsNewNodeOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>+ Agregar Idea</span>
          </button>

          <button
            type="button"
            onClick={handleExportSvg}
            className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 backdrop-blur-md text-xs font-semibold text-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg active:scale-95"
            title="Descargar diagrama en formato vectorial SVG"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Exportar SVG</span>
          </button>

          <button
            type="button"
            onClick={handleClearCanvas}
            className="bg-slate-900/90 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 backdrop-blur-md p-2 rounded-xl transition shadow-lg active:scale-95"
            title="Limpiar lienzo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Controles Flotantes de Zoom (Abajo a la derecha) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl">
        <button
          type="button"
          onClick={() => setZoom((prev) => Math.min(2.0, prev * 1.15))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1 min-w-[42px] text-center font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((prev) => Math.max(0.4, prev * 0.85))}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setZoom(1);
            setPan({ x: 50, y: 50 });
          }}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Restablecer vista 100%"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Leyenda de Categorías (Abajo a la izquierda) */}
      <div className="absolute bottom-5 left-5 z-20 hidden md:flex items-center gap-2 bg-slate-950/80 border border-slate-800/90 backdrop-blur-md px-3 py-2 rounded-2xl text-[11px]">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Fases:</span>
        {(Object.keys(CATEGORY_CONFIG) as MindNodeCategory[]).map((cat) => {
          const config = CATEGORY_CONFIG[cat];
          return (
            <div key={cat} className="flex items-center gap-1 text-slate-300">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
              <span>{config.name.split('/')[0]}</span>
            </div>
          );
        })}
      </div>

      {/* Aviso de modo conectar activo */}
      {connectingFromId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-2 animate-pulse">
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Haz clic en otro nodo para crear la conexión Bézier</span>
          <button
            type="button"
            onClick={() => setConnectingFromId(null)}
            className="hover:text-white text-cyan-400 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIENZO INTERACTIVO INFINITO (PAN & ZOOM)                   */}
      {/* ========================================================= */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden relative"
        style={{
          backgroundImage: `radial-gradient(circle, #1E293B 1px, transparent 1px)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      >
        {/* Capa de Transformación SVG y Nodos */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG para Conectores Bézier */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-[5000px] h-[5000px] overflow-visible pointer-events-auto"
            style={{ pointerEvents: 'none' }}
          >
            <defs>
              <linearGradient id="conn-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>

              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
              </marker>
            </defs>

            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.fromId);
              const toNode = nodes.find((n) => n.id === conn.toId);
              if (!fromNode || !toNode) return null;

              // Coordenadas de los centros de los nodos
              const x1 = fromNode.x + NODE_WIDTH;
              const y1 = fromNode.y + NODE_HEIGHT / 2;
              const x2 = toNode.x;
              const y2 = toNode.y + NODE_HEIGHT / 2;

              // Curva Bézier suave
              const dx = Math.abs(x2 - x1) * 0.55;
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              return (
                <g key={conn.id} className="group/conn cursor-pointer pointer-events-auto">
                  {/* Línea invisible más ancha para facilitar clic */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={16}
                    onClick={() => handleDeleteConnection(conn.id)}
                  />

                  {/* Curva visible con resplandor */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#conn-gradient)"
                    strokeWidth={2.5}
                    markerEnd="url(#arrow)"
                    className="transition-all duration-200 group-hover/conn:stroke-rose-400 group-hover/conn:stroke-[3.5]"
                  />

                  {/* Etiqueta opcional */}
                  {conn.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 8}
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="bg-slate-900"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Renderizado de Nodos de Ideas */}
          {nodes.map((node) => {
            const config = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.essence;
            const isConnecting = connectingFromId === node.id;

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                className={`absolute rounded-2xl p-4 border transition-shadow duration-200 pointer-events-auto cursor-move select-none shadow-xl backdrop-blur-md ${
                  config.bgColor
                } ${config.borderColor} ${
                  isConnecting ? 'ring-4 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
                } hover:shadow-2xl hover:border-white/50 group/node`}
                style={{
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${NODE_WIDTH}px`,
                  minHeight: `${NODE_HEIGHT}px`,
                }}
              >
                {/* Cabecera del Nodo: Categoría y Acciones */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    {renderCategoryIcon(node.category)}
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.badgeBg}`}
                    >
                      {config.name.split('/')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover/node:opacity-100 transition-opacity">
                    {/* Botón para iniciar conexión */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConnectingFromId(node.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                      title="Conectar con otra idea"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Botón para eliminar nodo */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteNode(node.id, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition"
                      title="Eliminar idea"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Título de la Idea */}
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight leading-snug">
                  {node.title}
                </h3>

                {/* Descripción / Insight */}
                {node.description && (
                  <p className="text-[11px] text-slate-300/80 leading-relaxed mt-1.5 font-normal line-clamp-3">
                    {node.description}
                  </p>
                )}

                {/* Conector derecho (anclaje visual) */}
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-cyan-400 cursor-crosshair opacity-0 group-hover/node:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConnectingFromId(node.id);
                  }}
                  title="Arrastra o haz clic para conectar"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL / POPUP: AGREGAR NUEVA IDEA                         */}
      {/* ========================================================= */}
      {isNewNodeOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Añadir Nueva Idea o Insight</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewNodeOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector de Categoría / Fase */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Fase Metodológica</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(CATEGORY_CONFIG) as MindNodeCategory[]).map((cat) => {
                  const conf = CATEGORY_CONFIG[cat];
                  const isSelected = newCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`p-2 rounded-xl text-left text-xs font-semibold border transition flex items-center gap-2 ${
                        isSelected
                          ? `${conf.bgColor} ${conf.borderColor} text-white shadow-sm ring-1 ring-white/30`
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: conf.color }} />
                      <span className="truncate">{conf.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Título */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Título / Idea Central</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="ej. Arquetipo: El Sabio Analítico"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Detalle / Problema / Hipótesis</label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe el contexto, dolores del cliente o solución propuesta..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none resize-none"
              />
            </div>

            {/* Acciones */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewNodeOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddNode}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition shadow-md"
              >
                Añadir al Lienzo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
