import type { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { DEFAULT_BIO_PROFILE, TUNNELVISION_BIO_PROFILE, type BioProfile } from '@/types/bio-sites';
import PublicBioClientPage from './PublicBioClientPage';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Consulta del perfil desde Supabase en el servidor para renderizar
 * metadata precisa y datos actualizados desde cualquier dispositivo.
 */
async function getBioProfileServer(slug: string): Promise<BioProfile | null> {
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  if (cleanSlug === 'demo') {
    return DEFAULT_BIO_PROFILE;
  }
  if (cleanSlug === 'tunnelvision') {
    return TUNNELVISION_BIO_PROFILE;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from('bio_profiles')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (!error && data) {
      return {
        slug: data.slug,
        displayName: data.title || data.display_name || cleanSlug,
        bio: data.bio || '',
        avatarUrl: data.avatar_url || DEFAULT_BIO_PROFILE.avatarUrl,
        theme: data.theme || 'emerald',
        links: Array.isArray(data.links) ? data.links : [],
        isVerifiedSecurity: Boolean(data.is_verified_security ?? true),
      };
    }
  } catch (err) {
    console.warn('[SERVER BIO] Advertencia consultando bio_profiles en Supabase:', err);
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).toLowerCase().trim();

  const profile = await getBioProfileServer(decodedSlug);

  if (profile) {
    return {
      title: `${profile.displayName} | MiPortal Bio`,
      description: profile.bio || `Página comercial oficial y enlaces de negocio verificados por DeliverabilityGuard.`,
      metadataBase: new URL('https://deliverabilityguard.miportal.me'),
      openGraph: {
        title: `${profile.displayName} — Perfil Comercial Verificado`,
        description: profile.bio,
        images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : undefined,
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
  const serverProfile = await getBioProfileServer(decodedSlug);

  return <PublicBioClientPage slug={decodedSlug} initialProfile={serverProfile || undefined} />;
}
