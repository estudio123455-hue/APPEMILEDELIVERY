export interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string; // 'instagram' | 'x' | 'linkedin' | 'globe' | 'youtube' | 'mail' | 'whatsapp' | 'github' | 'calendar'
  highlight?: boolean;
  price?: string; // Opcional, para servicios o productos directos
}

export type BioTheme = 'slate' | 'cyber' | 'emerald' | 'minimal-light' | 'sunset';

export interface BioProfile {
  slug: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  theme: BioTheme;
  links: BioLink[];
  isVerifiedSecurity: boolean; // Muestra la insignia DeliverabilityGuard
}

export const DEFAULT_BIO_PROFILE: BioProfile = {
  slug: 'demo',
  displayName: 'Alejandro Morales',
  bio: 'Especialista en Entregabilidad y Arquitectura Cloud. Ayudo a marcas a blindar su reputación de correo y certificar directivas DMARC/BIMI.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  theme: 'emerald',
  isVerifiedSecurity: true,
  links: [
    {
      id: 'link-1',
      title: 'Auditoría DNS & Entregabilidad Express',
      url: '/#business-suite',
      icon: 'globe',
      highlight: true,
      price: '$150 USD',
    },
    {
      id: 'link-2',
      title: 'Blindaje Antifraude DMARC & BIMI',
      url: '/tools/generator',
      icon: 'globe',
      highlight: false,
      price: '$350 USD',
    },
    {
      id: 'link-3',
      title: 'Consultoría 1-a-1 de Google Workspace',
      url: 'https://cal.com/demo',
      icon: 'calendar',
      highlight: false,
      price: '$90 USD',
    },
    {
      id: 'link-4',
      title: 'Hablemos directamente por WhatsApp',
      url: 'https://wa.me/573001234567?text=Hola%20Alejandro,%20me%20interesa%20una%20auditoría',
      icon: 'whatsapp',
      highlight: false,
    },
    {
      id: 'link-5',
      title: 'Conectar en LinkedIn',
      url: 'https://linkedin.com',
      icon: 'linkedin',
      highlight: false,
    },
  ],
};
