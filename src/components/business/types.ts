export type CurrencyCode = 'USD' | 'COP' | 'EUR' | 'MXN';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BusinessIssuer {
  name: string;
  email: string;
  taxId: string; // RUT, NIT, NIF, Tax ID
  phone: string;
  address?: string;
  logoUrl?: string;
}

export interface BusinessClient {
  name: string;
  company: string;
  email: string;
  taxId?: string;
  address?: string;
}

export interface InvoiceConfiguration {
  currency: CurrencyCode;
  taxRate: number; // Porcentaje de impuesto (ej. 19 para IVA 19%, 0 para exento)
  paymentLink?: string; // Stripe, Wompi, PayPal, Mercado Pago
  paymentGatewayName?: string; // ej. Stripe, Wompi, Mercado Pago
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  issuer: BusinessIssuer;
  client: BusinessClient;
  items: InvoiceItem[];
  config: InvoiceConfiguration;
  notes: string;
  terms: string;
  isVerifiedSecurity: boolean; // Insignia DeliverabilityGuard
}

export const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: 'COT-2026-001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  issuer: {
    name: 'Agencia Nexus Digital SAS',
    email: 'contacto@nexusdigital.co',
    taxId: 'NIT: 901.849.201-4',
    phone: '+57 300 123 4567',
    address: 'Calle 93B # 13-45, Chicó, Bogotá',
    logoUrl: '',
  },
  client: {
    name: 'Carlos Mendoza',
    company: 'Fintech Solutions LatAm',
    email: 'carlos.mendoza@fintechlatam.com',
    taxId: 'NIT: 900.562.119-8',
    address: 'Av. El Poblado # 5A-120, Medellín',
  },
  items: [
    {
      id: 'srv-1',
      description: 'Auditoría Integral de Entregabilidad DNS (SPF, DKIM, DMARC, BIMI)',
      quantity: 1,
      unitPrice: 150,
      total: 150,
    },
    {
      id: 'srv-2',
      description: 'Consultoría Estratégica de Mercado y Benchmarking Competitivo',
      quantity: 1,
      unitPrice: 280,
      total: 280,
    },
    {
      id: 'srv-3',
      description: 'Setup y Despliegue de Bio Site Comercial con 5 Temas',
      quantity: 1,
      unitPrice: 320,
      total: 320,
    },
  ],
  config: {
    currency: 'USD',
    taxRate: 0,
    paymentLink: 'https://buy.stripe.com/demo-miportal',
    paymentGatewayName: 'Stripe Checkout',
  },
  notes: 'Presupuesto oficial emitido por MiPortal Suite. Todos los servicios incluyen garantía técnica de entregabilidad y validación RFC.',
  terms: 'Vigencia de esta propuesta comercial: 15 días calendario. Forma de pago: 50% anticipo y 50% contra entrega.',
  isVerifiedSecurity: true,
};

export function formatInvoiceCurrency(amount: number, currency: CurrencyCode): string {
  switch (currency) {
    case 'COP':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(amount);
    case 'MXN':
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        maximumFractionDigits: 2,
      }).format(amount);
    case 'EUR':
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }).format(amount);
    case 'USD':
    default:
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(amount);
  }
}
