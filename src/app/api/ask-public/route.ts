import { NextResponse } from 'next/server';
import type { AskPublicResponse, AskPublicCategories } from '@/types/ask-public';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODIFIERS: Array<{ key: keyof AskPublicCategories; queryMod: string; label: string }> = [
  { key: 'que', queryMod: 'que', label: 'Qué' },
  { key: 'como', queryMod: 'como', label: 'Cómo' },
  { key: 'por_que', queryMod: 'por que', label: 'Por qué' },
  { key: 'donde', queryMod: 'donde', label: 'Dónde' },
  { key: 'cuando', queryMod: 'cuando', label: 'Cuándo' },
  { key: 'cual', queryMod: 'cual', label: 'Cuál' },
  { key: 'quien', queryMod: 'quien', label: 'Quién' },
  { key: 'puede', queryMod: 'puede', label: 'Puede' },
  { key: 'son', queryMod: 'son', label: 'Son' },
];

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/[-|–—:•·].*$/g, '') // remove brand suffixes
    .replace(/\s*-\s*YouTube/gi, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // remove symbols/emojis
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRootKeywords(titleOrText: string): string {
  const words = titleOrText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Common stop words in Spanish & English
  const stopWords = new Set([
    'de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas',
    'en', 'para', 'por', 'con', 'sin', 'sobre', 'del', 'al',
    'and', 'the', 'for', 'with', 'from', 'official', 'oficial',
    'home', 'inicio', 'web', 'site', 'sitio', 'channel', 'canal',
    'video', 'videos', 'online', 'free', 'gratis'
  ]);

  const meaningful = words.filter((w) => !stopWords.has(w));
  if (meaningful.length > 0) {
    // Pick the top 2-3 most relevant terms
    return meaningful.slice(0, 3).join(' ');
  }

  return titleOrText.slice(0, 30).trim();
}

function generateSmartFallback(term: string, key: keyof AskPublicCategories): string[] {
  const cap = term.trim();
  switch (key) {
    case 'que':
      return [
        `qué es ${cap} y cómo funciona`,
        `qué significa ${cap}`,
        `qué hace ${cap} exactamente`,
        `qué precio tiene ${cap}`,
        `qué beneficios ofrece ${cap}`,
        `qué se necesita para empezar con ${cap}`,
      ];
    case 'como':
      return [
        `cómo funciona ${cap}`,
        `cómo usar ${cap} paso a paso`,
        `cómo configurar ${cap} correctamente`,
        `cómo contratar ${cap}`,
        `cómo solucionar problemas con ${cap}`,
        `cómo integrar ${cap} en mi negocio`,
      ];
    case 'por_que':
      return [
        `por qué es importante ${cap}`,
        `por qué elegir ${cap} frente a la competencia`,
        `por qué falla ${cap}`,
        `por qué contratar ${cap}`,
        `por qué las empresas recomiendan ${cap}`,
      ];
    case 'donde':
      return [
        `dónde encontrar ${cap}`,
        `dónde se configura ${cap}`,
        `dónde comprar ${cap} oficial`,
        `dónde ver opiniones y reseñas sobre ${cap}`,
        `dónde aprender más sobre ${cap}`,
      ];
    case 'cuando':
      return [
        `cuándo es necesario usar ${cap}`,
        `cuándo actualizar ${cap}`,
        `cuándo se ven resultados con ${cap}`,
        `cuándo es obligatorio implementar ${cap}`,
        `cuándo conviene cambiar de ${cap}`,
      ];
    case 'cual':
      return [
        `cuál es la mejor opción de ${cap}`,
        `cuál es la diferencia entre ${cap} y alternativas`,
        `cuál es el precio real de ${cap}`,
        `cuál es la ventaja principal de ${cap}`,
        `cuál elegir para empezar`,
      ];
    case 'quien':
      return [
        `quién necesita ${cap}`,
        `quién ofrece soporte para ${cap}`,
        `quién debe configurar ${cap}`,
        `quién regula o certifica ${cap}`,
        `quién puede usar ${cap}`,
      ];
    case 'puede':
      return [
        `puede ${cap} mejorar mis resultados`,
        `puede ${cap} tener errores o fallar`,
        `puede ${cap} ser gratis`,
        `puede ${cap} integrarse fácilmente`,
        `puede cualquier empresa usar ${cap}`,
      ];
    case 'son':
      return [
        `cuáles son las ventajas de ${cap}`,
        `son seguros los servicios de ${cap}`,
        `son confiables las opiniones sobre ${cap}`,
        `son obligatorios los requisitos de ${cap}`,
        `cuáles son los precios de ${cap}`,
      ];
    default:
      return [`${key} ${cap}`];
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      query?: string;
      lang?: string;
      country?: string;
    };

    let rawQuery = (body.query || '').trim();
    const lang = (body.lang || 'es').toLowerCase();
    const country = (body.country || 'es').toLowerCase();

    if (!rawQuery) {
      return NextResponse.json(
        { success: false, error: 'Por favor proporciona un término de búsqueda o enlace web.' },
        { status: 400 }
      );
    }

    const isUrl = /^https?:\/\//i.test(rawQuery) || /\.[a-z]{2,}(\/.*)?$/i.test(rawQuery);
    let term = rawQuery;
    let detectedTitle = '';
    let analyzedDomain: string | undefined = undefined;

    // 1. Extraer término si es una URL o canal
    if (isUrl) {
      if (!/^https?:\/\//i.test(rawQuery)) {
        rawQuery = `https://${rawQuery}`;
      }

      try {
        const parsedUrl = new URL(rawQuery);
        analyzedDomain = parsedUrl.hostname.toLowerCase().replace(/^www\./i, '');

        // Detectar YouTube
        if (analyzedDomain.includes('youtube.com') || analyzedDomain.includes('youtu.be')) {
          const path = parsedUrl.pathname;
          if (path.includes('/@')) {
            const handle = path.split('/@')[1]?.split('/')[0] || '';
            detectedTitle = `@${handle}`;
            term = handle.replace(/[-_.]/g, ' ');
          } else {
            term = 'videos youtube';
          }
        }

        // Fetch liviano para extraer el <title> u <og:title>
        if (!detectedTitle) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4500);

            const res = await fetch(parsedUrl.toString(), {
              method: 'GET',
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (res.ok) {
              const html = (await res.text()).slice(0, 150000);
              const titleMatch =
                html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);

              if (titleMatch && titleMatch[1]) {
                detectedTitle = titleMatch[1].trim();
                const cleaned = cleanTitle(detectedTitle);
                const rootTerm = extractRootKeywords(cleaned);
                if (rootTerm) {
                  term = rootTerm;
                }
              }
            }
          } catch {
            // Fallback a hostname
          }
        }

        if (!detectedTitle) {
          detectedTitle = analyzedDomain;
          const hostParts = analyzedDomain.split('.');
          if (hostParts.length >= 2) {
            term = hostParts[hostParts.length - 2];
          } else {
            term = analyzedDomain;
          }
        }
      } catch {
        // En caso de parse error, usar query directa
      }
    }

    term = term.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    if (!term) {
      term = 'correo dmarc';
    }

    // 2. Consultar en paralelo Google Suggest para cada modificador
    const categories: AskPublicCategories = {
      que: [],
      como: [],
      por_que: [],
      donde: [],
      cuando: [],
      cual: [],
      quien: [],
      puede: [],
      son: [],
    };

    const requests = MODIFIERS.map(async ({ key, queryMod }) => {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${lang}&gl=${country}&q=${encodeURIComponent(
        `${queryMod} ${term}`
      )}`;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const resp = await fetch(suggestUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = (await resp.json()) as [string, string[]];
          if (Array.isArray(data) && Array.isArray(data[1]) && data[1].length > 0) {
            // Filtrar y limpiar sugerencias
            const cleanedList = data[1]
              .map((s) => s.trim().toLowerCase())
              .filter((s, idx, self) => s.length > 3 && self.indexOf(s) === idx);

            return { key, questions: cleanedList };
          }
        }
      } catch {
        // Fallback a preguntas heurísticas inteligentes
      }

      return { key, questions: generateSmartFallback(term, key) };
    });

    const results = await Promise.allSettled(requests);

    let totalQuestions = 0;
    for (const res of results) {
      if (res.status === 'fulfilled' && res.value) {
        const { key, questions } = res.value;
        const validList = questions.length > 0 ? questions : generateSmartFallback(term, key);
        categories[key] = validList;
        totalQuestions += validList.length;
      }
    }

    // Asegurar que ninguna categoría esté vacía
    for (const { key } of MODIFIERS) {
      if (!categories[key] || categories[key].length === 0) {
        const fb = generateSmartFallback(term, key);
        categories[key] = fb;
        totalQuestions += fb.length;
      }
    }

    const payload: AskPublicResponse = {
      success: true,
      searchTerm: term,
      isUrl,
      detectedTitle: detectedTitle || undefined,
      totalQuestions,
      categories,
      analyzedDomain,
      lang,
      country,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error interno al consultar preguntas.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
