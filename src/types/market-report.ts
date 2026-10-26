export interface ProjectInfo {
  title: string;
  subtitle: string;
  analyzedEntity: string;
  date: string;
  industry: string;
  author?: string;
  institution?: string;
  course?: string;
}

export interface Tabla1Keyword {
  id: number;
  dimension: 'Marca' | 'Competencia' | 'Problemas / Necesidades' | 'Oportunidades' | 'Comunidad';
  keyword: string;
  intencion: 'Navegacional' | 'Comercial' | 'Informativa' | 'Transaccional';
  volumenRelativo: 'Muy Alto' | 'Alto' | 'Medio' | 'Emergente';
  canalPrioritario: string;
}

export interface Tabla2FaqRespuesta {
  id: number;
  modificador: 'Qué' | 'Cómo' | 'Por qué' | 'Cuándo' | 'Dónde' | 'Cuál' | 'Quién';
  pregunta: string;
  respuestaExperta: string;
  insightEstrategico: string;
}

export interface Tabla3TendenciaArquetipo {
  id: number;
  tendenciaEsquematica: string;
  arquetipoConsumidor: string;
  driversCompra: string;
  zeitgeistCultural: string;
}

export interface Tabla4TrianguloCompetitivo {
  id: number;
  clasificacion:
    | 'Competidor Directo 1'
    | 'Competidor Directo 2'
    | 'Referente Aspiracional'
    | 'Competidor Indirecto'
    | 'Competidor Inesperado';
  marca: string;
  propuestaValor: string;
  activosDigitalesClave: string;
  ventajaCompetitiva: string;
  amenazaOportunidad: string;
}

export interface Tabla5BenchmarkEstrategia {
  id: number;
  marca: string;
  estrategiaAtraccion: {
    canalesTrafico: string;
    herramientasBenchmark: string;
    metricasClave: string;
  };
  estrategiaContenido: {
    formatosDominantes: string;
    herramientasAnalisis: string;
    tonoYEngagement: string;
  };
  estrategiaPublicitaria: {
    plataformasActivas: string;
    ganchosYTacticas: string;
    bibliotecaAnuncios: string;
  };
}

export interface ConclusionesFinales {
  escuchaSocial: string;
  benchmarkingDigital: string;
  recomendacionesEstrategicas: string[];
  dictamenConsultoria: string;
}

export interface BusinessModelNode {
  title: string;
  desc: string;
}

export interface BusinessModelCategory {
  id: string;
  label: string;
  color: string;
  nodes: BusinessModelNode[];
}

export interface BusinessModelWheelData {
  coreEntity: string;
  categories: BusinessModelCategory[];
}

export interface MarketReportData {
  projectInfo: ProjectInfo;
  tabla1_keywords: Tabla1Keyword[];
  tabla2_faq_respuestas: Tabla2FaqRespuesta[];
  tabla3_tendencias_arquetipos: Tabla3TendenciaArquetipo[];
  tabla4_triangulo_competitivo: Tabla4TrianguloCompetitivo[];
  tabla5_benchmark_estrategias: Tabla5BenchmarkEstrategia[];
  conclusionesFinales: ConclusionesFinales;
  businessModelWheel: BusinessModelWheelData;
}

export interface MarketReportResponse {
  success: boolean;
  error?: string;
  report?: MarketReportData;
}
