export interface BioLink {
  id: string;
  title: string;
  url: string;
  icon?: string; // 'instagram' | 'x' | 'linkedin' | 'globe' | 'youtube' | 'mail' | 'whatsapp' | 'github' | 'calendar' | 'shield' | 'chart' | 'sparkles' | 'book'
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

export const DEMO_BIO_PROFILE: BioProfile = {
  slug: 'demo',
  displayName: 'Agencia Nexus Digital',
  bio: 'Consultoría en estrategia digital, arquitectura web y optimización de infraestructura de correo corporativo.',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  theme: 'emerald',
  isVerifiedSecurity: true,
  links: [
    {
      id: 'demo-bold',
      title: 'Auditoría DNS & Blindaje de Correo (DeliverabilityGuard)',
      url: 'https://checkout.bold.co/payment/LNK_33UADDKUTL',
      price: '$150.000 COP',
      icon: 'shield',
      highlight: true,
    },
    {
      id: 'demo-1',
      title: 'Auditoría Rápida de Entregabilidad DNS en Vivo',
      url: '/#quick-audit',
      price: 'Free',
      icon: 'sparkles',
      highlight: false,
    },
    {
      id: 'demo-2',
      title: 'Consultoría de Inteligencia de Mercado',
      url: '/tools/ask-the-public',
      price: '$280.000 COP',
      icon: 'chart',
      highlight: false,
    },
    {
      id: 'demo-3',
      title: 'Diseño y Setup de Bio Site Comercial',
      url: '/sites/builder',
      price: '$320.000 COP',
      icon: 'globe',
      highlight: false,
    },
  ],
};

export const TUNNELVISION_BIO_PROFILE: BioProfile = {
  slug: 'tunnelvision',
  displayName: 'TUNNELVISION • Studio',
  bio: 'De caos a orden. Plataforma y metodología visual para mentes creativas sin tiempo.',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  theme: 'minimal-light',
  isVerifiedSecurity: true,
  links: [
    {
      id: 'tv-bold',
      title: 'Auditoría DNS & Blindaje de Correo (DeliverabilityGuard)',
      url: 'https://checkout.bold.co/payment/LNK_33UADDKUTL',
      price: '$150.000 COP',
      icon: 'shield',
      highlight: true,
    },
    {
      id: 'tv-1',
      title: 'Abrir Lienzo Creativo en Vivo (Mind Canvas)',
      url: '/tools/mind-canvas',
      icon: 'sparkles',
      highlight: false,
    },
    {
      id: 'tv-2',
      title: 'Consultoría de Branding & Benchmarking',
      url: '/business',
      price: '$240.000 COP',
      icon: 'chart',
      highlight: false,
    },
    {
      id: 'tv-3',
      title: "Metodología 'Mind Diary' (Guía PDF)",
      url: '#',
      price: 'Free',
      icon: 'book',
      highlight: false,
    },
  ],
};

export const DEFAULT_BIO_PROFILE: BioProfile = DEMO_BIO_PROFILE;
