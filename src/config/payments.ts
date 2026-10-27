/**
 * Configuración Canónica de Pagos y Servicios Oficiales de Bold
 * MiPortal Suite (https://www.miportal.me)
 */

export interface BoldServiceItem {
  readonly name: string;
  readonly amountCOP: number;
  readonly checkoutUrl: string;
  readonly description: string;
}

export const BOLD_SERVICES = {
  dnsBlindaje: {
    name: 'Auditoría DNS & Blindaje de Correo (DeliverabilityGuard)',
    amountCOP: 150000,
    checkoutUrl: 'https://checkout.bold.co/payment/LNK_33UADDKUTL',
    description: 'Blindaje y corrección autoritativa de registros SPF, DKIM, DMARC y BIMI en menos de 24 horas.',
  },
  marketIntelligencePro: {
    name: 'Pase Pro — Inteligencia de Mercado & Escucha Social',
    amountCOP: 49000,
    checkoutUrl: 'https://checkout.bold.co/payment/LNK_RNG6HJYEO8',
    description: 'Pase completo para generación de Informes Académicos con IA, matrices de 10 keywords y benchmarking.',
  },
} as const;

export type BoldServiceKey = keyof typeof BOLD_SERVICES;

/**
 * Formateador de moneda en pesos colombianos (COP)
 */
export function formatCOP(amount: number): string {
  return `$${amount.toLocaleString('es-CO')} COP`;
}
