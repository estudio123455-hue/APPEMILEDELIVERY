import type { Metadata } from 'next';
import PublicBioClientPage from './PublicBioClientPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

  if (decodedSlug === 'demo') {
    return {
      title: 'Agencia Nexus Digital | MiPortal Bio',
      description:
        'Consultoría en estrategia digital, arquitectura web y optimización de infraestructura de correo corporativo.',
      metadataBase: new URL('https://deliverabilityguard.miportal.me'),
      openGraph: {
        title: 'Agencia Nexus Digital — Perfil Comercial Verificado',
        description:
          'Consultoría en estrategia digital, arquitectura web y optimización de infraestructura de correo corporativo.',
      },
    };
  }

  return {
    title: `${decodedSlug.toUpperCase()} | MiPortal Bio & Sites`,
    description: `Página comercial oficial y enlaces de negocio verificados por DeliverabilityGuard.`,
    metadataBase: new URL('https://deliverabilityguard.miportal.me'),
    openGraph: {
      title: `${decodedSlug} — Perfil Comercial Verificado`,
      description: 'Conoce los servicios profesionales, agenda citas y contacta directamente.',
    },
  };
}

export default async function PublicBioPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return <PublicBioClientPage slug={decodedSlug} />;
}
