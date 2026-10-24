/**
 * Executes a promise with an enforced timeout threshold.
 * Uses native setTimeout and cleans up listeners upon completion.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms = 3500,
  timeoutMessage = 'DNS query timed out'
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error(timeoutMessage);
      error.name = 'TimeoutError';
      reject(error);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

/**
 * Sanitizes and normalizes an input domain string.
 * Strips protocols (http/https), www prefix, ports, paths, query strings, and whitespace.
 */
export function sanitizeDomain(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let cleaned = input.trim().toLowerCase();

  // Strip protocol if present
  cleaned = cleaned.replace(/^[a-z]+:\/\//i, '');

  // Strip userinfo if present (e.g., user@domain.com)
  if (cleaned.includes('@')) {
    cleaned = cleaned.split('@').pop() || '';
  }

  // Strip path, query params, hash
  cleaned = cleaned.split('/')[0] || '';
  cleaned = cleaned.split('?')[0] || '';
  cleaned = cleaned.split('#')[0] || '';

  // Strip port
  cleaned = cleaned.split(':')[0] || '';

  // Strip www. prefix
  cleaned = cleaned.replace(/^www\./, '');

  // Strip leading and trailing dots or spaces
  cleaned = cleaned.replace(/^\.+|\.+$/g, '').trim();

  return cleaned;
}

/**
 * Normalizes TXT records returned by node:dns/promises.
 * Node.js resolveTxt returns string[][], where each inner array contains
 * RFC 1035 character-string chunks that must be concatenated.
 */
export function normalizeTxtRecords(rawRecords: string[][] | string[]): string[] {
  if (!Array.isArray(rawRecords)) {
    return [];
  }

  return rawRecords.map((entry) => {
    if (Array.isArray(entry)) {
      return entry.join('');
    }
    return String(entry);
  });
}
