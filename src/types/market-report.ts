export interface ProjectInfo {
  title: string;
  analyzedEntity: string;
  date: string;
  industry: string;
  author?: string;
  institution?: string;
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

export interface Tabla4ComparativaCompetidor {
  id: number;
  marca: string;
  propuestaValor: string;
  sentimientoPredominante: string;
  reputacionEntregaEmail: string;
  puntosDebilesQuejas: string;
  estrategiaDiferenciadora: string;
}

export interface ConclusionesPorObjetivo {
  objetivo1_preguntas: string;
  objetivo2_tendencias: string;
  objetivo3_conversaciones: string;
}

export interface MarketReportData {
  projectInfo: ProjectInfo;
  tabla1_keywords: Tabla1Keyword[];
  tabla2_faq_respuestas: Tabla2FaqRespuesta[];
  tabla3_tendencias_arquetipos: Tabla3TendenciaArquetipo[];
  tabla4_comparativa_competidores: Tabla4ComparativaCompetidor[];
  conclusionesPorObjetivo: ConclusionesPorObjetivo;
}

export interface MarketReportResponse {
  success: boolean;
  error?: string;
  report?: MarketReportData;
}
