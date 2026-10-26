export type KeywordCategory =
  | 'Marca'
  | 'Competencia'
  | 'Problemas y Necesidades'
  | 'Oportunidades'
  | 'Comunidad';

export interface StrategicKeywordItem {
  id: string;
  category: KeywordCategory;
  keyword: string;
  intent: 'Navegacional' | 'Comercial' | 'Informativa' | 'Transaccional';
  justification: string;
  // Objetivo 1: Preguntas y Necesidades (AnswerThePublic / AlsoAsked)
  objective1: {
    que: string;
    como: string;
    cuando: string;
    porQue: string;
    consumerNeed: string;
  };
  // Objetivo 2: Tendencias y Zeitgeist (Google Trends & Alerts)
  objective2: {
    seasonalBehavior: string;
    relativeVolume: 'Muy Alto' | 'Alto' | 'Medio' | 'Emergente';
    googleTrendsQuery: string;
    googleAlertsTerm: string;
    trendInsight: string;
  };
  // Objetivo 3: Conversaciones y Sentimiento (X & Reddit)
  objective3: {
    complaintBooleanQuery: string;
    leadBooleanQuery: string;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
    sentimentSynthesis: string;
  };
  // Punto 3: Análisis y Conclusión Específica de la Keyword
  specificConclusion: string;
}

export interface GeneralConclusions {
  objective1Conclusion: string; // Preguntas y Necesidades
  objective2Conclusion: string; // Tendencias y Zeitgeist
  objective3Conclusion: string; // Sentimiento y Conversaciones
  strategicRecommendations: string[]; // Recomendaciones tácticas del consultor
  academicSummary: string; // Resumen ejecutivo del trabajo
}

export interface MarketReportData {
  title: string;
  subtitle: string;
  subjectOrBrand: string;
  isUrl: boolean;
  domain?: string;
  author: string;
  institution: string;
  course: string;
  date: string;
  academicIntroduction: string;
  keywords: StrategicKeywordItem[];
  conclusions: GeneralConclusions;
  metadata: {
    sourcesConsulted: string[];
    suggestedFormat: string;
    complianceScore: number;
  };
}

export interface MarketReportResponse {
  success: boolean;
  error?: string;
  report?: MarketReportData;
}
