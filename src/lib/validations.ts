import { z } from 'zod';

/**
 * Standard FQDN Regex (RFC 1035 / RFC 1123).
 * Accepts labels with alphanumeric characters and hyphens, separated by dots,
 * ending in a valid TLD of 2 to 63 letters.
 */
export const STRICT_FQDN_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

/**
 * List of disallowed hostnames, loopbacks, and cloud metadata targets (SSRF protection).
 */
const FORBIDDEN_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal',
  'instance-data',
]);

/**
 * Disallowed private network suffixes / internal TLDs.
 */
const FORBIDDEN_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.home',
  '.corp',
  '.arpa',
  '.onion',
  '.test',
  '.example',
  '.invalid',
];

/**
 * Disallowed IP prefixes (RFC 1918 private subnets and link-local ranges).
 */
const PRIVATE_IP_PREFIXES = [
  '10.',
  '127.',
  '169.254.',
  '192.168.',
  '0.',
];

/**
 * Checks if a string is a private IPv4 in the 172.16.0.0 - 172.31.255.255 range.
 */
function isPrivate172(ip: string): boolean {
  if (!ip.startsWith('172.')) return false;
  const parts = ip.split('.');
  if (parts.length < 2) return false;
  const second = parseInt(parts[1], 10);
  return second >= 16 && second <= 31;
}

/**
 * Strict Zod schema for domain audit inputs with SSRF defense.
 */
export const DomainAuditSchema = z
  .string()
  .trim()
  .min(3, 'El dominio debe contener al menos 3 caracteres.')
  .max(253, 'El dominio no puede exceder los 253 caracteres.')
  .refine((val) => !/^[a-z]+:\/\//i.test(val), {
    message: 'No incluyas protocolos (http://, https://, ftp://). Ingresa solo el dominio.',
  })
  .refine((val) => !val.includes('/') && !val.includes(':') && !val.includes('?'), {
    message: 'El dominio no debe contener rutas, puertos o parámetros de consulta.',
  })
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return !FORBIDDEN_HOSTNAMES.has(lower);
    },
    {
      message: 'Acceso denegado: Host local o de metadatos no permitido.',
    }
  )
  .refine(
    (val) => {
      const lower = val.toLowerCase();
      return !FORBIDDEN_SUFFIXES.some((suffix) => lower.endsWith(suffix));
    },
    {
      message: 'Acceso denegado: Sufijo o red privada no permitida (.local, .internal, etc.).',
    }
  )
  .refine(
    (val) => {
      return (
        !PRIVATE_IP_PREFIXES.some((prefix) => val.startsWith(prefix)) &&
        !isPrivate172(val)
      );
    },
    {
      message: 'Acceso denegado: No se permiten direcciones IP privadas o de loopback.',
    }
  )
  .refine((val) => STRICT_FQDN_REGEX.test(val), {
    message: 'Formato de dominio inválido. Ingresa un FQDN legítimo (ej. tuempresa.com).',
  });

export type DomainAuditInput = z.infer<typeof DomainAuditSchema>;

export const AuditRequestSchema = z.object({
  domain: DomainAuditSchema,
  forceRefresh: z.boolean().optional(),
});

export type AuditRequestInput = z.infer<typeof AuditRequestSchema>;

/**
 * Validates a domain and returns a clean, normalized string or error response.
 */
export function validateDomain(input: unknown):
  | { success: true; domain: string }
  | { success: false; error: string; details?: unknown } {
  const result = DomainAuditSchema.safeParse(input);
  if (!result.success) {
    const firstIssue = result.error.issues?.[0]?.message;
    return {
      success: false,
      error: firstIssue || 'Dominio inválido',
      details: result.error.flatten(),
    };
  }
  return {
    success: true,
    domain: result.data.toLowerCase(),
  };
}
