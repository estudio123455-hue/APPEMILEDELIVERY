/**
 * Lista canónica de correos autorizados como Super Admin en MiPortal Suite.
 * Estos usuarios cuentan con bypass completo de pasarelas de pago, acceso ilimitado
 * a búsquedas de mercado, reportes PDF ejecutivos y blindaje de entregabilidad.
 */
export const ADMIN_EMAILS: readonly string[] = [
  'estudio.123455@gmail.com',
  'deliverabilityguard@gmail.com',
  'admin@miportal.me',
] as const;

/**
 * Evalúa si un correo electrónico cuenta con privilegios de Super Administrador.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase().trim();
  return ADMIN_EMAILS.some((admin) => admin.toLowerCase().trim() === normalized);
}

/**
 * Evalúa si un objeto usuario de Supabase cuenta con privilegios de Super Admin,
 * ya sea por su correo electrónico o por sus metadatos (app_metadata / user_metadata).
 */
export function isUserSuperAdmin(user?: {
  email?: string | null;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
} | null): boolean {
  if (!user) return false;
  if (isSuperAdminEmail(user.email)) return true;
  if (user.app_metadata?.role === 'admin' || user.app_metadata?.is_admin === true) return true;
  if (user.user_metadata?.role === 'admin' || user.user_metadata?.is_admin === true) return true;
  return false;
}
