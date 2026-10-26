export interface AskPublicCategories {
  que: string[];
  como: string[];
  por_que: string[];
  donde: string[];
  cuando: string[];
  cual: string[];
  quien: string[];
  puede: string[];
  son: string[];
}

export interface AskPublicResponse {
  success: boolean;
  error?: string;
  searchTerm: string;
  isUrl: boolean;
  detectedTitle?: string;
  totalQuestions: number;
  categories: AskPublicCategories;
  analyzedDomain?: string;
  lang?: string;
  country?: string;
}
