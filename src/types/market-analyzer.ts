export type PlatformType =
  | 'website'
  | 'youtube'
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'facebook'
  | 'other';

export interface SocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface DomainHealthPreview {
  domain: string;
  status: 'healthy' | 'warning' | 'pending';
  auditUrl: string;
  hasDmarc: boolean;
  notes: string;
}

export interface DigitalEcosystem {
  url: string;
  canonicalUrl: string;
  domain: string;
  brandName: string;
  title: string;
  description: string;
  category: string;
  isSocialProfile: boolean;
  platformType: PlatformType;
  socialLinks: SocialLink[];
  domainHealth: DomainHealthPreview;
}

export interface QuestionItem {
  id: string;
  query: string;
  intent: string;
  volumeEstimate: 'Alta' | 'Media' | 'Tendencia';
}

export interface AnswerThePublicCategory {
  category: 'Qué' | 'Cómo' | 'Por qué' | 'Cuándo';
  title: string;
  description: string;
  questions: QuestionItem[];
}

export interface TrendTopic {
  name: string;
  growth: string;
  type: 'Tendencia en alza' | 'Consulta frecuente' | 'Búsqueda emergente';
}

export interface TrendAnalysis {
  brandQuery: string;
  categoryQuery: string;
  googleTrendsUrl: string;
  googleTrendsCategoryUrl: string;
  googleAlertsUrl: string;
  topics: TrendTopic[];
}

export interface SocialSearchFilter {
  query: string;
  description: string;
  xSearchUrl: string;
  redditSearchUrl: string;
  googleSearchUrl: string;
}

export interface SocialMonitoring {
  sentimentScore: number; // 0 - 100
  sentimentLabel: 'Muy Favorable' | 'Mayormente Favorable' | 'Neutral Estable' | 'Atención Requerida';
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  complaintFilter: SocialSearchFilter;
  leadCaptureFilter: SocialSearchFilter;
}

export interface KeywordItem {
  term: string;
  intent: 'Navegacional' | 'Comercial' | 'Informativa' | 'Transaccional';
  searchVolumeHint: string;
}

export interface KeywordDimension {
  id: string;
  dimension:
    | 'Marca'
    | 'Competencia'
    | 'Problemas y Necesidades'
    | 'Oportunidades de Compra'
    | 'Comunidad y Opiniones';
  description: string;
  color: string;
  keywords: KeywordItem[];
}

export interface MarketAnalyzeResponse {
  success: boolean;
  error?: string;
  ecosystem: DigitalEcosystem;
  questions: AnswerThePublicCategory[];
  trends: TrendAnalysis;
  monitoring: SocialMonitoring;
  keywordMatrix: KeywordDimension[];
  generatedAt: string;
}
