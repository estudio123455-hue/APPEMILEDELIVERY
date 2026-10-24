import { z } from 'zod';

/**
 * Regex for standard FQDN / domain names (RFC 1035 / RFC 1123).
 * Requires at least one dot, valid labels (1-63 alphanumeric/hyphen chars, no leading/trailing hyphens),
 * and a valid TLD of at least 2 alpha characters.
 */
export const DOMAIN_REGEX =
  /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

export const AuditRequestSchema = z.object({
  domain: z
    .string()
    .trim()
    .min(3, 'El dominio debe tener al menos 3 caracteres.')
    .max(253, 'El dominio no puede exceder los 253 caracteres.')
    .regex(DOMAIN_REGEX, {
      message: 'Formato de dominio inválido. Ingrese un FQDN válido (ej. dominio.com).',
    }),
});

export type AuditRequestInput = z.infer<typeof AuditRequestSchema>;
