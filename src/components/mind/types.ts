export type MindNodeCategory = 'chaos' | 'essence' | 'audience' | 'benchmarking' | 'solution';

export interface MindNode {
  id: string;
  title: string;
  description: string;
  category: MindNodeCategory;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export interface MindConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
}

export interface MindCanvasState {
  nodes: MindNode[];
  connections: MindConnection[];
  zoom: number;
  pan: { x: number; y: number };
}

export interface CategoryMeta {
  id: MindNodeCategory;
  name: string;
  color: string;
  borderColor: string;
  bgColor: string;
  badgeBg: string;
  textColor: string;
  iconName: string;
}

export const CATEGORY_CONFIG: Record<MindNodeCategory, CategoryMeta> = {
  chaos: {
    id: 'chaos',
    name: 'Caos / Idea Cruda',
    color: '#94a3b8',
    borderColor: 'border-slate-600',
    bgColor: 'bg-slate-900/90',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    textColor: 'text-slate-200',
    iconName: 'lightbulb',
  },
  essence: {
    id: 'essence',
    name: 'Esencia & Problema',
    color: '#10b981',
    borderColor: 'border-emerald-500/70',
    bgColor: 'bg-emerald-950/80',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    textColor: 'text-emerald-100',
    iconName: 'target',
  },
  audience: {
    id: 'audience',
    name: 'Arquetipos & Audiencia',
    color: '#06b6d4',
    borderColor: 'border-cyan-500/70',
    bgColor: 'bg-cyan-950/80',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    textColor: 'text-cyan-100',
    iconName: 'users',
  },
  benchmarking: {
    id: 'benchmarking',
    name: 'Competencia & Benchmark',
    color: '#f59e0b',
    borderColor: 'border-amber-500/70',
    bgColor: 'bg-amber-950/80',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    textColor: 'text-amber-100',
    iconName: 'zap',
  },
  solution: {
    id: 'solution',
    name: 'Acciones & Solución',
    color: '#8b5cf6',
    borderColor: 'border-purple-500/70',
    bgColor: 'bg-purple-950/80',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    textColor: 'text-purple-100',
    iconName: 'rocket',
  },
};

export const TUNNELVISION_DEFAULT_NODES: MindNode[] = [
  {
    id: 'node-1',
    title: '1. Caos Inicial',
    description: 'Demasiadas ideas dispersas, notas en cuadernos y falta de tiempo para ejecutarlas.',
    category: 'chaos',
    x: 100,
    y: 220,
  },
  {
    id: 'node-2',
    title: '2. Insight Clave',
    description: 'Quiero que mi caos tenga orden sin perder mi esencia creativa.',
    category: 'essence',
    x: 400,
    y: 120,
  },
  {
    id: 'node-3',
    title: '3. Arquetipo de Audiencia',
    description: 'Sabio & Creador: busca control, velocidad y herramientas no convencionales.',
    category: 'audience',
    x: 400,
    y: 340,
  },
  {
    id: 'node-4',
    title: '4. Benchmarking Competitivo',
    description: 'Simplicidad visual de Milanote combinada con la estructura relacional de Obsidian.',
    category: 'benchmarking',
    x: 720,
    y: 120,
  },
  {
    id: 'node-5',
    title: '5. Solución Tangible',
    description: 'Mind Diary / Organización visual rápida para convertir pensamientos en presupuestos y perfiles.',
    category: 'solution',
    x: 720,
    y: 340,
  },
];

export const TUNNELVISION_DEFAULT_CONNECTIONS: MindConnection[] = [
  { id: 'conn-1-2', fromId: 'node-1', toId: 'node-2', label: 'Evoluciona a' },
  { id: 'conn-1-3', fromId: 'node-1', toId: 'node-3', label: 'Dirigido a' },
  { id: 'conn-2-4', fromId: 'node-2', toId: 'node-4', label: 'Inspirado en' },
  { id: 'conn-3-5', fromId: 'node-3', toId: 'node-5', label: 'Genera' },
  { id: 'conn-4-5', fromId: 'node-4', toId: 'node-5', label: 'Materializa' },
];
