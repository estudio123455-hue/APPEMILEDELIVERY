/**
 * Motor de Detección de Palabras Gatillo de Spam y Cálculo de Entregabilidad
 * Soporta análisis bilingüe (Español e Inglés) y verificación de buenas prácticas RFC.
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

const SPAM_RULES: SpamRule[] = [
  // Urgencia y Presión
  { pattern: /\burgente\b/gi, category: 'urgency', severity: 'high', replacement: 'prioritario / de tu interés' },
  { pattern: /\bact[uú]a ya\b/gi, category: 'urgency', severity: 'high', replacement: 'cuando puedas revisarlo' },
  { pattern: /\b[uú]ltima oportunidad\b/gi, category: 'urgency', severity: 'high', replacement: 'recordatorio final' },
  { pattern: /\btiempo limitado\b/gi, category: 'urgency', severity: 'medium', replacement: 'disponible hasta [fecha]' },
  { pattern: /\bhazlo ahora\b/gi, category: 'urgency', severity: 'medium', replacement: 'puedes gestionarlo aquí' },
  { pattern: /\burgent\b/gi, category: 'urgency', severity: 'high', replacement: 'priority / time-sensitive' },
  { pattern: /\bact now\b/gi, category: 'urgency', severity: 'high', replacement: 'review when convenient' },
  { pattern: /\blast chance\b/gi, category: 'urgency', severity: 'high', replacement: 'final reminder' },
  { pattern: /\blimited time\b/gi, category: 'urgency', severity: 'medium', replacement: 'valid until [date]' },

  // Financiero y Dinero
  { pattern: /\bgratis\b/gi, category: 'financial', severity: 'high', replacement: 'sin costo adicional / de cortesía' },
  { pattern: /\b100%\s*gratis\b/gi, category: 'financial', severity: 'high', replacement: 'incluido sin costo' },
  { pattern: /\bgana dinero\b/gi, category: 'financial', severity: 'high', replacement: 'mejora tus ingresos' },
  { pattern: /\bdinero f[aá]cil\b/gi, category: 'financial', severity: 'high', replacement: 'optimización de presupuesto' },
  { pattern: /\bingresos extra\b/gi, category: 'financial', severity: 'medium', replacement: 'nuevas oportunidades de negocio' },
  { pattern: /\bmillonario\b/gi, category: 'financial', severity: 'high', replacement: 'crecimiento financiero' },
  { pattern: /\bpremio\b/gi, category: 'financial', severity: 'high', replacement: 'reconocimiento especial' },
  { pattern: /\bloter[ií]a\b/gi, category: 'financial', severity: 'high', replacement: 'beneficio' },
  { pattern: /\bfree\b/gi, category: 'financial', severity: 'high', replacement: 'complimentary / at no extra charge' },
  { pattern: /\bmake money\b/gi, category: 'financial', severity: 'high', replacement: 'increase revenue' },
  { pattern: /\beasy cash\b/gi, category: 'financial', severity: 'high', replacement: 'commercial growth' },
  { pattern: /\bcash prize\b/gi, category: 'financial', severity: 'high', replacement: 'reward' },

  // Promesas y Garantías Excesivas
  { pattern: /\b100%\s*garantizado\b/gi, category: 'guarantee', severity: 'high', replacement: 'respaldado con garantía' },
  { pattern: /\bsin riesgo\b/gi, category: 'guarantee', severity: 'medium', replacement: 'con respaldo seguro' },
  { pattern: /\bsatisfacci[oó]n garantizada\b/gi, category: 'guarantee', severity: 'medium', replacement: 'compromiso de calidad' },
  { pattern: /\bmilagroso\b/gi, category: 'guarantee', severity: 'high', replacement: 'efectivo' },
  { pattern: /\b100%\s*guaranteed\b/gi, category: 'guarantee', severity: 'high', replacement: 'backed by policy' },
  { pattern: /\brisk[\s-]free\b/gi, category: 'guarantee', severity: 'medium', replacement: 'secure agreement' },

  // Llamados a la Acción Agresivos (CTA)
  { pattern: /\bhaz clic aqu[ií]\b/gi, category: 'cta', severity: 'high', replacement: 'conoce más en el portal / revisa el informe' },
  { pattern: /\bclick here\b/gi, category: 'cta', severity: 'high', replacement: 'view the report / access here' },
  { pattern: /\bcompra ya\b/gi, category: 'cta', severity: 'medium', replacement: 'disponible para adquirir' },
  { pattern: /\bbuy now\b/gi, category: 'cta', severity: 'medium', replacement: 'place your order' },
  { pattern: /\bno lo borres\b/gi, category: 'cta', severity: 'high', replacement: 'información de archivo' },
  { pattern: /\bdon't delete\b/gi, category: 'cta', severity: 'high', replacement: 'important record' },

  // Patrones Phishing / Riesgo Crítico
  { pattern: /\bconfirma tu cuenta\b/gi, category: 'phishing', severity: 'high', replacement: 'gestiona tus credenciales' },
  { pattern: /\bactualiza tus datos bancarios\b/gi, category: 'phishing', severity: 'high', replacement: 'revisa tu perfil de facturación' },
  { pattern: /\bverify your account\b/gi, category: 'phishing', severity: 'high', replacement: 'security check' },
  { pattern: /\bupdate billing info\b/gi, category: 'phishing', severity: 'high', replacement: 'review your billing portal' },
];

/**
 * Analiza el asunto y el cuerpo del correo en busca de señales de spam.
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
    subjectCharWarning = 'Asunto muy corto. Los asuntos menores a 15 caracteres carecen de contexto y tienen menor tasa de apertura.';
    recommendations.push('Amplía tu asunto a entre 35 y 50 caracteres para dar contexto profesional.');
  } else if (subjectLen > 65) {
    score -= 10;
    subjectCharWarning = 'Asunto excesivamente largo (>65 caracteres). En celulares se cortará después de ~35 caracteres.';
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
      `Evita palabras en MAYÚSCULAS sostenidas en el asunto (${capsWords.slice(0, 3).join(', ')}). Los filtros bayesianos de Gmail lo consideran un grito comercial.`
    );
  }

  // 3. Puntuación excesiva (!!! o ???)
  const exclamationMatches = (normSubject + ' ' + normBody).match(/!{2,}/g) || [];
  const questionMatches = (normSubject + ' ' + normBody).match(/\?{2,}/g) || [];
  const exclamationCount = (normSubject.match(/!/g) || []).length;
  const questionCount = (normSubject.match(/\?/g) || []).length;

  if (exclamationMatches.length > 0 || exclamationCount > 2) {
    score -= 12;
    recommendations.push('Elimina los signos de exclamación múltiples ("!!"). Provocan penalización directa en SpamAssassin y Microsoft SmartScreen.');
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
    recommendations.push(`Detectamos ${emojisFound.length} emojis en el asunto. Usar más de 1 emoji reduce la credibilidad en correos B2B.`);
  }

  // 5. Palabras Gatillo (Spam Triggers)
  for (const rule of SPAM_RULES) {
    const subjectMatches = normSubject.match(rule.pattern);
    const bodyMatches = normBody.match(rule.pattern);

    const countInSubject = subjectMatches ? subjectMatches.length : 0;
    const countInBody = bodyMatches ? bodyMatches.length : 0;
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

      const matchedText = subjectMatches?.[0] || bodyMatches?.[0] || '';
      const key = matchedText.toLowerCase();

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
