import type { Metadata } from 'next';
import { DEFAULT_DEMO_SITE } from '@/lib/sites/types';
import PublicBioClientPage from './PublicBioClientPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

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
