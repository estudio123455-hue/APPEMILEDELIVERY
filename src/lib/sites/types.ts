export type SiteTheme = 'emerald' | 'cyberpunk' | 'minimal';

export interface SiteService {
  id: string;
  title: string;
  description: string;
  price?: string;
  url: string;
  badge?: string;
}

export interface BioSiteData {
  slug: string;
  name: string;
  title: string;
  bio: string;
  avatarUrl?: string;
  domain?: string;
  badges: string[];
  whatsappNumber?: string;
  whatsappMessage?: string;
  email?: string;
  calendarUrl?: string;
  services: SiteService[];
  theme: SiteTheme;
  isVerified?: boolean;
  updatedAt?: string;
}

export const DEFAULT_DEMO_SITE: BioSiteData = {
  slug: 'demo',
  name: 'Alejandro Morales',
  title: 'Consultor de Ciberseguridad & Infraestructura Cloud',
  bio: 'Ayudo a agencias y startups a blindar la reputación de sus dominios, certificar directivas RFC y optimizar la entregabilidad de correos a bandeja principal.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  domain: 'consultoria-it.com',
  badges: ['Cloud Architect', 'DMARC Specialist', 'Fintech Advisor'],
  whatsappNumber: '+573001234567',
  whatsappMessage: 'Hola Alejandro, me interesa una auditoría para mi empresa.',
  email: 'contacto@consultoria-it.com',
  calendarUrl: 'https://cal.com/demo',
  theme: 'emerald',
  isVerified: true,
  services: [
    {
      id: 'srv-1',
      title: 'Auditoría Completa de Entregabilidad & DNS',
      description: 'Inspección técnica profunda de registros SPF, DMARC, DKIM, listas negras e informe ejecutivo en PDF.',
      price: '$150 USD',
      url: '/#business-suite',
      badge: 'Más Solicitado',
    },
    {
      id: 'srv-2',
      title: 'Blindaje Antifraude & Certificación BIMI',
      description: 'Implementación de política DMARC p=reject y configuración de logotipo corporativo verificado en buzones.',
      price: '$350 USD',
      url: '/tools/generator',
      badge: 'Seguridad Total',
    },
    {
      id: 'srv-3',
      title: 'Asesoría 1-a-1 de Migración Cloud & Google Workspace',
      description: 'Sesión estratégica de 60 minutos para configurar registros MX, cuentas de correo y pasarelas transaccionales.',
      price: '$90 USD',
      url: 'https://cal.com/demo',
    },
  ],
};
