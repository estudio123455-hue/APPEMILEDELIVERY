/**
 * Motor de Detección de Palabras Gatillo de Spam y Cálculo de Entregabilidad
 * Soporta análisis bilingüe (Español e Inglés), límites Unicode y verificación RFC.
 */

export interface SpamTriggerMatch {
  word: string;
  category: 'urgency' | 'financial' | 'guarantee' | 'cta' | 'phishing';
  severity: 'high' | 'medium' | 'low';
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

interface SpamRule {
  pattern: RegExp;
  category: 'urgency' | 'financial' | 'guarantee' | 'cta' | 'phishing';
  severity: 'high' | 'medium' | 'low';
  replacement: string;
}

/**
 * Crea un RegExp con límites de palabra conscientes de Unicode (soporta acentos y eñes).
 */
function createUnicodePattern(patternStr: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])${patternStr}(?![\\p{L}\\p{N}])`, 'giu');
}

export const SPAM_RULES: SpamRule[] = [
  // 1. Urgencia y Presión
  {
    pattern: createUnicodePattern('urgente|urgentes'),
    category: 'urgency',
    severity: 'high',
    replacement: 'prioritario / de tu interés',
  },
  {
    pattern: createUnicodePattern('act[uú]a\\s+ya'),
    category: 'urgency',
    severity: 'high',
    replacement: 'cuando puedas revisarlo',
  },
  {
    pattern: createUnicodePattern('[uú]ltima\\s+oportunidad'),
    category: 'urgency',
    severity: 'high',
    replacement: 'recordatorio final',
  },
  {
    pattern: createUnicodePattern('tiempo\\s+limitado'),
    category: 'urgency',
    severity: 'medium',
    replacement: 'disponible hasta [fecha]',
  },
  {
    pattern: createUnicodePattern('hazlo\\s+ahora'),
    category: 'urgency',
    severity: 'medium',
    replacement: 'puedes gestionarlo aquí',
  },
  {
    pattern: createUnicodePattern('urgent|urgently'),
    category: 'urgency',
    severity: 'high',
    replacement: 'priority / time-sensitive',
  },
  {
    pattern: createUnicodePattern('act\\s+now'),
    category: 'urgency',
    severity: 'high',
    replacement: 'review when convenient',
  },
  {
    pattern: createUnicodePattern('last\\s+chance'),
    category: 'urgency',
    severity: 'high',
    replacement: 'final reminder',
  },
  {
    pattern: createUnicodePattern('limited\\s+time'),
    category: 'urgency',
    severity: 'medium',
    replacement: 'valid until [date]',
  },

  // 2. Financiero y Dinero
  {
    pattern: createUnicodePattern('(?:100%\\s*)?gratis|totalmente\\s+gratis'),
    category: 'financial',
    severity: 'high',
    replacement: 'sin costo adicional / de cortesía',
  },
  {
    pattern: createUnicodePattern('sin\\s+cost[oe](?:\\s+alguno)?|costo\\s+cero'),
    category: 'financial',
    severity: 'high',
    replacement: 'incluido en tu plan / de cortesía',
  },
  {
    pattern: createUnicodePattern('gana\\s+dinero'),
    category: 'financial',
    severity: 'high',
    replacement: 'mejora tus ingresos',
  },
  {
    pattern: createUnicodePattern('dinero\\s+f[aá]cil'),
    category: 'financial',
    severity: 'high',
    replacement: 'optimización de presupuesto',
  },
  {
    pattern: createUnicodePattern('(?:dinero|ingresos?)\\s+extras?'),
    category: 'financial',
    severity: 'high',
    replacement: 'nuevas oportunidades comerciales',
  },
  {
    pattern: createUnicodePattern('millonario|millonaria'),
    category: 'financial',
    severity: 'high',
    replacement: 'crecimiento financiero',
  },
  {
    pattern: createUnicodePattern('premio|premios|recompensa\\s+en\\s+efectivo'),
    category: 'financial',
    severity: 'high',
    replacement: 'reconocimiento especial',
  },
  {
    pattern: createUnicodePattern('loter[ií]a|sorteo\\s+exclusivo'),
    category: 'financial',
    severity: 'high',
    replacement: 'beneficio exclusivo',
  },
  {
    pattern: createUnicodePattern('(?:100%\\s*)?free|completely\\s+free'),
    category: 'financial',
    severity: 'high',
    replacement: 'complimentary / at no extra charge',
  },
  {
    pattern: createUnicodePattern('make\\s+money|earn\\s+cash'),
    category: 'financial',
    severity: 'high',
    replacement: 'increase revenue',
  },
  {
    pattern: createUnicodePattern('easy\\s+cash|extra\\s+income'),
    category: 'financial',
    severity: 'high',
    replacement: 'commercial growth',
  },
  {
    pattern: createUnicodePattern('cash\\s+prize'),
    category: 'financial',
    severity: 'high',
    replacement: 'reward',
  },

  // 3. Promesas y Garantías Excesivas
  {
    pattern: createUnicodePattern('(?:100%\\s*)?garantizad[oa]s?|garant[ií]a\\s+(?:total|de\\s+por\\s+vida)'),
    category: 'guarantee',
    severity: 'high',
    replacement: 'respaldado con garantía / verificado',
  },
  {
    pattern: createUnicodePattern('sin\\s+riesgo'),
    category: 'guarantee',
    severity: 'medium',
    replacement: 'con respaldo seguro',
  },
  {
    pattern: createUnicodePattern('satisfacci[oó]n\\s+garantizada'),
    category: 'guarantee',
    severity: 'medium',
    replacement: 'compromiso de calidad',
  },
  {
    pattern: createUnicodePattern('milagros[oa]s?'),
    category: 'guarantee',
    severity: 'high',
    replacement: 'efectivo / comprobado',
  },
  {
    pattern: createUnicodePattern('(?:100%\\s*)?guaranteed|lifetime\\s+guarantee'),
    category: 'guarantee',
    severity: 'high',
    replacement: 'backed by policy',
  },
  {
    pattern: createUnicodePattern('risk[\\s-]free'),
    category: 'guarantee',
    severity: 'medium',
    replacement: 'secure agreement',
  },

  // 4. Llamados a la Acción Agresivos (CTA)
  {
    pattern: createUnicodePattern('(?:haz\\s+)?(?:clic|click)\\s+aqu[ií]'),
    category: 'cta',
    severity: 'high',
    replacement: 'conoce más en el portal / revisa el informe',
  },
  {
    pattern: createUnicodePattern('click\\s+here'),
    category: 'cta',
    severity: 'high',
    replacement: 'view the report / access here',
  },
  {
    pattern: createUnicodePattern('compra\\s+ya|ordena\\s+ya'),
    category: 'cta',
    severity: 'medium',
    replacement: 'disponible para adquirir',
  },
  {
    pattern: createUnicodePattern('buy\\s+now|order\\s+now'),
    category: 'cta',
    severity: 'medium',
    replacement: 'place your order',
  },
  {
    pattern: createUnicodePattern('no\\s+lo\\s+borres'),
    category: 'cta',
    severity: 'high',
    replacement: 'información de archivo',
  },
  {
    pattern: createUnicodePattern("don't\\s+delete"),
    category: 'cta',
    severity: 'high',
    replacement: 'important record',
  },

  // 5. Patrones Phishing / Riesgo Crítico
  {
    pattern: createUnicodePattern('confirma\\s+tu\\s+cuenta'),
    category: 'phishing',
    severity: 'high',
    replacement: 'gestiona tus credenciales',
  },
  {
    pattern: createUnicodePattern('actualiza\\s+tus\\s+datos\\s+bancarios'),
    category: 'phishing',
    severity: 'high',
    replacement: 'revisa tu perfil de facturación',
  },
  {
    pattern: createUnicodePattern('verify\\s+your\\s+account'),
    category: 'phishing',
    severity: 'high',
    replacement: 'security check',
  },
  {
    pattern: createUnicodePattern('update\\s+billing\\s+info'),
    category: 'phishing',
    severity: 'high',
    replacement: 'review your billing portal',
  },
];

/**
 * Reemplaza de forma segura una palabra o frase gatillo respetando límites de palabras Unicode.
 */
export function replaceSpamWord(text: string, word: string, replacement: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, 'giu');
  return text.replace(regex, replacement);
}

/**
 * Analiza el asunto y el cuerpo del correo en busca de señales de spam y retorna
 * métricas detalladas, score de 0 a 100 y lista de palabras encontradas.
 */
export function analyzeEmailSpam({
  subject,
  body,
}: {
  subject: string;
  body: string;
}): SpamAnalysisResult {
  const normSubject = subject || '';
  const normBody = body || '';

  let score = 100;
  const triggersMap = new Map<string, SpamTriggerMatch>();
  const recommendations: string[] = [];

  // 1. Longitud del asunto
  const subjectLen = normSubject.trim().length;
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
    recommendations.push('Reduce el asunto a menos de 55 caracteres para que sea legible en pantallas de smartphones.');
  }

  // 2. Mayúsculas sostenidas en el asunto (ALL CAPS)
  const wordsInSubject = normSubject.split(/\s+/).filter((w) => w.length >= 3);
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
  const exclamationMatches = (normSubject + ' ' + normBody).match(/!{2,}/g) || [];
  const questionMatches = (normSubject + ' ' + normBody).match(/\?{2,}/g) || [];
  const exclamationCount = (normSubject.match(/!/g) || []).length;
  const questionCount = (normSubject.match(/\?/g) || []).length;

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
  const emojisFound = Array.from(normSubject).filter((char) => emojiRegex.test(char));
  if (emojisFound.length > 2) {
    score -= 8;
    recommendations.push(
      `Detectamos ${emojisFound.length} emojis en el asunto. Usar más de 1 emoji reduce la credibilidad en correos B2B.`
    );
  }

  // 5. Palabras Gatillo (Spam Triggers con soporte Unicode)
  for (const rule of SPAM_RULES) {
    const subjectMatches = [...normSubject.matchAll(rule.pattern)].map((m) => m[0]);
    const bodyMatches = [...normBody.matchAll(rule.pattern)].map((m) => m[0]);

    const countInSubject = subjectMatches.length;
    const countInBody = bodyMatches.length;
    const totalCount = countInSubject + countInBody;

    if (totalCount > 0) {
      let foundIn: 'subject' | 'body' | 'both' = 'body';
      if (countInSubject > 0 && countInBody > 0) foundIn = 'both';
      else if (countInSubject > 0) foundIn = 'subject';

      // Deducción ponderada según severidad y ubicación
      let deduction = 0;
      if (rule.severity === 'high') {
        deduction = countInSubject * 14 + countInBody * 6;
      } else if (rule.severity === 'medium') {
        deduction = countInSubject * 8 + countInBody * 4;
      } else {
        deduction = countInSubject * 5 + countInBody * 2;
      }
      score -= deduction;

      // Extraer coincidencias únicas
      const allMatchedTexts = Array.from(new Set([...subjectMatches, ...bodyMatches]));
      for (const matchedText of allMatchedTexts) {
        const key = matchedText.toLowerCase();
        if (!triggersMap.has(key)) {
          triggersMap.set(key, {
            word: matchedText,
            category: rule.category,
            severity: rule.severity,
            replacement: rule.replacement,
            foundIn,
            count: totalCount,
          });
        }
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
