/**
 * Motor de Detección de Palabras Gatillo de Spam y Cálculo de Entregabilidad
 * Normaliza acentos/diacríticos y mayúsculas/minúsculas para una detección infalible.
 */

export interface SpamTriggerMatch {
  word: string;
  phrase: string;
  category: string;
  categoryKey: 'urgency' | 'financial' | 'guarantee' | 'cta' | 'phishing';
  severity: 'Alta' | 'Media' | 'Baja';
  severityKey: 'high' | 'medium' | 'low';
  suggestion: string;
  replacement: string;
  foundIn: 'subject' | 'body' | 'both';
  count: number;
}

export interface SpamAnalysisResult {
  score: number; // 0 a 100 (100 = Limpio)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  subjectLength: number;
  subjectCharWarning?: string;
  capsCount: number;
  exclamationCount: number;
  questionCount: number;
  emojisCount: number;
  triggers: SpamTriggerMatch[];
  recommendations: string[];
}

interface InternalRule {
  pattern: RegExp;
  category: 'urgency' | 'financial' | 'guarantee' | 'cta' | 'phishing';
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

const CATEGORY_NAMES: Record<InternalRule['category'], string> = {
  urgency: 'Urgencia',
  financial: 'Financiero',
  guarantee: 'Garantía / Exageración',
  cta: 'Llamado a la Acción (CTA)',
  phishing: 'Phishing / Seguridad',
};

const SEVERITY_NAMES: Record<InternalRule['severity'], 'Alta' | 'Media' | 'Baja'> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

/**
 * Normaliza el texto removiendo acentos y diacríticos preservando la longitud 1 a 1.
 */
export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Reglas de detección ejecutadas sobre texto normalizado (sin diacríticos, case-insensitive).
 */
const NORMALIZED_SPAM_RULES: InternalRule[] = [
  // 1. Urgencia y Presión
  {
    pattern: /\bprioritari[oa]s?\b/gi,
    category: 'urgency',
    severity: 'high',
    suggestion: 'importante / sugerido',
  },
  {
    pattern: /\burgente|urgentes|urgent|urgently\b/gi,
    category: 'urgency',
    severity: 'high',
    suggestion: 'prioritario / de tu interés',
  },
  {
    pattern: /\bactua ya|act now\b/gi,
    category: 'urgency',
    severity: 'high',
    suggestion: 'cuando puedas revisarlo',
  },
  {
    pattern: /\bultima oportunidad|last chance\b/gi,
    category: 'urgency',
    severity: 'high',
    suggestion: 'recordatorio final',
  },
  {
    pattern: /\btiempo limitado|limited time\b/gi,
    category: 'urgency',
    severity: 'medium',
    suggestion: 'disponible hasta [fecha]',
  },
  {
    pattern: /\bhazlo ahora|do it now\b/gi,
    category: 'urgency',
    severity: 'medium',
    suggestion: 'puedes gestionarlo aquí',
  },
  {
    pattern: /\binmediat[oa]|immediately\b/gi,
    category: 'urgency',
    severity: 'high',
    suggestion: 'a la brevedad',
  },
  {
    pattern: /\bexpira hoy|expires today\b/gi,
    category: 'urgency',
    severity: 'medium',
    suggestion: 'fecha límite estimada',
  },
  {
    pattern: /\bno te quedes fuera|don't miss out\b/gi,
    category: 'urgency',
    severity: 'medium',
    suggestion: 'invitación abierta',
  },

  // 2. Financiero y Dinero
  {
    pattern: /\b(?:100%\s*)?gratis|totalmente gratis|(?:100%\s*)?free|completely free\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'sin costo adicional / de cortesía',
  },
  {
    pattern: /\bsin cost[oe](?:\s+adicional|\s+alguno)?|costo cero|no cost\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'incluido en tu plan / de cortesía',
  },
  {
    pattern: /\bgana dinero|ganar dinero|make money|earn cash\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'mejora tus ingresos',
  },
  {
    pattern: /\bmejora tus ingresos|aumenta tus ingresos\b/gi,
    category: 'financial',
    severity: 'medium',
    suggestion: 'optimiza tu presupuesto',
  },
  {
    pattern: /\bdinero facil|easy cash|easy money\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'optimización de recursos',
  },
  {
    pattern: /\b(?:dinero|ingresos?)\s+extras?|extra income|extra cash\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'nuevas oportunidades comerciales',
  },
  {
    pattern: /\bmillonari[oa]|millionaire\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'crecimiento financiero',
  },
  {
    pattern: /\bpremio|premios|cash prize|recompensa en efectivo\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'reconocimiento especial',
  },
  {
    pattern: /\bloteria|sorteo exclusivo|lottery\b/gi,
    category: 'financial',
    severity: 'high',
    suggestion: 'beneficio exclusivo',
  },
  {
    pattern: /\bcripto|bitcoin|criptomoneda|crypto\b/gi,
    category: 'financial',
    severity: 'medium',
    suggestion: 'activo digital',
  },

  // 3. Promesas y Garantías Excesivas
  {
    pattern: /\b(?:100%\s*)?garantizad[oa]s?|garantia (?:total|de por vida)|(?:100%\s*)?guaranteed|lifetime guarantee\b/gi,
    category: 'guarantee',
    severity: 'high',
    suggestion: 'respaldado con garantía / verificado',
  },
  {
    pattern: /\bsin riesgo|risk[\s-]free|cero riesgo\b/gi,
    category: 'guarantee',
    severity: 'medium',
    suggestion: 'con respaldo seguro',
  },
  {
    pattern: /\bsatisfaccion garantizada|satisfaction guaranteed\b/gi,
    category: 'guarantee',
    severity: 'medium',
    suggestion: 'compromiso de calidad',
  },
  {
    pattern: /\bmilagros[oa]s?|miracle\b/gi,
    category: 'guarantee',
    severity: 'high',
    suggestion: 'efectivo / comprobado',
  },
  {
    pattern: /\binfalible|infallible\b/gi,
    category: 'guarantee',
    severity: 'high',
    suggestion: 'altamente confiable',
  },

  // 4. Llamados a la Acción Agresivos (CTA)
  {
    pattern: /\b(?:haz\s+)?(?:clic|click)\s+aqui|click here\b/gi,
    category: 'cta',
    severity: 'high',
    suggestion: 'conoce más en el portal / revisa el informe',
  },
  {
    pattern: /\bcompra ya|ordena ya|buy now|order now\b/gi,
    category: 'cta',
    severity: 'medium',
    suggestion: 'disponible para adquirir',
  },
  {
    pattern: /\bno lo borres|don't delete|no borrar\b/gi,
    category: 'cta',
    severity: 'high',
    suggestion: 'información de archivo',
  },
  {
    pattern: /\bregistrate ahora|sign up now\b/gi,
    category: 'cta',
    severity: 'medium',
    suggestion: 'accede al registro',
  },
  {
    pattern: /\breserva tu lugar|claim your spot\b/gi,
    category: 'cta',
    severity: 'medium',
    suggestion: 'confirma tu asistencia',
  },

  // 5. Phishing y Seguridad
  {
    pattern: /\bconfirma tu cuenta|verify your account\b/gi,
    category: 'phishing',
    severity: 'high',
    suggestion: 'gestiona tus credenciales',
  },
  {
    pattern: /\bactualiza tus datos bancarios|update billing info\b/gi,
    category: 'phishing',
    severity: 'high',
    suggestion: 'revisa tu perfil de facturación',
  },
  {
    pattern: /\brestablecer contrasena|reset password\b/gi,
    category: 'phishing',
    severity: 'high',
    suggestion: 'asistencia de acceso',
  },
  {
    pattern: /\bcuenta suspendida|account suspended\b/gi,
    category: 'phishing',
    severity: 'high',
    suggestion: 'notificación de estado',
  },
];

/**
 * Reemplaza de forma segura una palabra o frase gatillo respetando acentos y variaciones.
 */
export function replaceSpamWord(text: string, phraseToReplace: string, replacement: string): string {
  if (!text || !phraseToReplace) return text;

  // 1. Reemplazo directo con límites Unicode
  const escaped = phraseToReplace.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const directRegex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
  if (directRegex.test(text)) {
    return text.replace(directRegex, replacement);
  }

  // 2. Reemplazo normalizando diacríticos (preservando índices)
  const normText = stripDiacritics(text).toLowerCase();
  const normPhrase = stripDiacritics(phraseToReplace).toLowerCase();
  const idx = normText.indexOf(normPhrase);
  if (idx !== -1) {
    return text.slice(0, idx) + replacement + text.slice(idx + phraseToReplace.length);
  }

  return text.replace(new RegExp(escaped, 'gi'), replacement);
}

/**
 * Analiza el asunto y cuerpo de correo en busca de palabras gatillo y calcula el Spam Risk Score.
 */
export function analyzeEmailSpam({
  subject,
  body,
}: {
  subject: string;
  body: string;
}): SpamAnalysisResult {
  const normSubjectRaw = subject || '';
  const normBodyRaw = body || '';

  // Texto con diacríticos normalizados para comparación universal
  const normSubject = stripDiacritics(normSubjectRaw);
  const normBody = stripDiacritics(normBodyRaw);

  let score = 100;
  const triggersMap = new Map<string, SpamTriggerMatch>();
  const recommendations: string[] = [];

  // 1. Longitud del asunto
  const subjectLen = normSubjectRaw.trim().length;
  let subjectCharWarning: string | undefined;

  if (subjectLen > 0 && subjectLen < 15) {
    score -= 8;
    subjectCharWarning =
      'Asunto muy corto (<15 caracteres). Los filtros bayesianos reducen la relevancia al carecer de contexto.';
    recommendations.push('Amplía tu asunto a entre 35 y 50 caracteres para dar contexto profesional.');
  } else if (subjectLen > 65) {
    score -= 10;
    subjectCharWarning =
      'Asunto excesivamente largo (>65 caracteres). En celulares se cortará después de ~35 caracteres.';
    recommendations.push('Reduce el asunto a menos de 55 caracteres para que sea legible en smartphones.');
  }

  // 2. Mayúsculas sostenidas en el asunto (ALL CAPS)
  const wordsInSubject = normSubjectRaw.split(/\s+/).filter((w) => w.length >= 3);
  const capsWords = wordsInSubject.filter(
    (w) => w === w.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(w)
  );

  if (capsWords.length > 0) {
    const penalty = Math.min(capsWords.length * 6, 20);
    score -= penalty;
    recommendations.push(
      `Evita palabras en MAYÚSCULAS sostenidas en el asunto (${capsWords.slice(0, 3).join(', ')}). Los filtros de Gmail y Outlook lo consideran un grito comercial.`
    );
  }

  // 3. Puntuación excesiva (!! o ??)
  const exclamationMatches = (normSubjectRaw + ' ' + normBodyRaw).match(/!{2,}/g) || [];
  const questionMatches = (normSubjectRaw + ' ' + normBodyRaw).match(/\?{2,}/g) || [];
  const exclamationCount = (normSubjectRaw.match(/!/g) || []).length;
  const questionCount = (normSubjectRaw.match(/\?/g) || []).length;

  if (exclamationMatches.length > 0 || exclamationCount > 2) {
    score -= 12;
    recommendations.push(
      'Elimina los signos de exclamación múltiples ("!!"). Provocan penalización directa en SpamAssassin y Microsoft SmartScreen.'
    );
  }
  if (questionMatches.length > 0) {
    score -= 6;
    recommendations.push('Evita signos de interrogación consecutivos ("??") en asuntos corporativos.');
  }

  // 4. Emojis en el asunto
  const emojiRegex = /[\p{Extended_Pictographic}]/u;
  const emojisFound = Array.from(normSubjectRaw).filter((char) => emojiRegex.test(char));
  if (emojisFound.length > 2) {
    score -= 8;
    recommendations.push(
      `Detectamos ${emojisFound.length} emojis en el asunto. Usar más de 1 emoji reduce la credibilidad en correos B2B.`
    );
  }

  // 5. Palabras Gatillo (Spam Triggers) con matcher normalizado
  for (const rule of NORMALIZED_SPAM_RULES) {
    // Subject matching
    for (const match of normSubject.matchAll(rule.pattern)) {
      if (typeof match.index !== 'number') continue;
      const origText = normSubjectRaw.slice(match.index, match.index + match[0].length);
      const key = origText.toLowerCase();

      let deduction = rule.severity === 'high' ? 14 : rule.severity === 'medium' ? 8 : 5;
      score -= deduction;

      const existing = triggersMap.get(key);
      if (!existing) {
        triggersMap.set(key, {
          word: origText,
          phrase: origText,
          category: CATEGORY_NAMES[rule.category],
          categoryKey: rule.category,
          severity: SEVERITY_NAMES[rule.severity],
          severityKey: rule.severity,
          suggestion: rule.suggestion,
          replacement: rule.suggestion,
          foundIn: 'subject',
          count: 1,
        });
      } else {
        existing.count += 1;
        if (existing.foundIn === 'body') existing.foundIn = 'both';
      }
    }

    // Body matching
    for (const match of normBody.matchAll(rule.pattern)) {
      if (typeof match.index !== 'number') continue;
      const origText = normBodyRaw.slice(match.index, match.index + match[0].length);
      const key = origText.toLowerCase();

      let deduction = rule.severity === 'high' ? 6 : rule.severity === 'medium' ? 4 : 2;
      score -= deduction;

      const existing = triggersMap.get(key);
      if (!existing) {
        triggersMap.set(key, {
          word: origText,
          phrase: origText,
          category: CATEGORY_NAMES[rule.category],
          categoryKey: rule.category,
          severity: SEVERITY_NAMES[rule.severity],
          severityKey: rule.severity,
          suggestion: rule.suggestion,
          replacement: rule.suggestion,
          foundIn: 'body',
          count: 1,
        });
      } else {
        existing.count += 1;
        if (existing.foundIn === 'subject') existing.foundIn = 'both';
      }
    }
  }

  const triggers = Array.from(triggersMap.values());

  if (triggers.length > 0) {
    recommendations.push(
      `Reemplaza las ${triggers.length} palabras gatillo detectadas usando los sustitutos sugeridos a continuación.`
    );
  }

  // Acotar score entre 0 y 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (finalScore < 60) {
    riskLevel = 'HIGH';
  } else if (finalScore < 82) {
    riskLevel = 'MEDIUM';
  }

  return {
    score: finalScore,
    riskLevel,
    subjectLength: subjectLen,
    subjectCharWarning,
    capsCount: capsWords.length,
    exclamationCount,
    questionCount,
    emojisCount: emojisFound.length,
    triggers,
    recommendations,
  };
}
