import { BioProfile, DEFAULT_BIO_PROFILE } from '@/types/bio-sites';
import { createClient } from '@/utils/supabase/client';

const STORAGE_KEY_PREFIX = 'miportal_bio_profile_';
const SITES_INDEX_KEY = 'miportal_bio_sites_index';

export function normalizeSlug(rawSlug: string): string {
  return rawSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Guarda el perfil en LocalStorage y, si hay sesión activa en Supabase, sincroniza en la base de datos.
 */
export async function saveBioProfile(profile: BioProfile): Promise<{ success: boolean; syncedWithCloud: boolean; error?: string }> {
  const cleanSlug = normalizeSlug(profile.slug) || 'demo';
  const profileToSave: BioProfile = {
    ...profile,
    slug: cleanSlug,
  };

  let localSaved = false;
  let cloudSaved = false;

  // 1. Guardado inmediato en LocalStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${cleanSlug}`, JSON.stringify(profileToSave));

      const rawIndex = localStorage.getItem(SITES_INDEX_KEY);
      const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
      if (!index.includes(cleanSlug)) {
        index.push(cleanSlug);
        localStorage.setItem(SITES_INDEX_KEY, JSON.stringify(index));
      }
      localSaved = true;
    } catch (err) {
      console.warn('Advertencia al guardar perfil en localStorage:', err);
    }
  }

  // 2. Persistencia en Supabase si hay sesión activa
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Intentamos upsert en tabla bio_profiles si existe en Supabase
      const { error: upsertError } = await (supabase as any)
        .from('bio_profiles')
        .upsert(
          {
            user_id: user.id,
            slug: cleanSlug,
            display_name: profileToSave.displayName,
            bio: profileToSave.bio,
            avatar_url: profileToSave.avatarUrl,
            theme: profileToSave.theme,
            links: profileToSave.links,
            is_verified_security: profileToSave.isVerifiedSecurity,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'slug' }
        );

      if (!upsertError) {
        cloudSaved = true;
      } else {
        // La tabla puede no estar migrada aún en Supabase; localSaved garantiza continuidad
        console.info('Supabase bio_profiles sync skipped or not configured yet:', upsertError.message);
      }
    }
  } catch (err) {
    console.info('Supabase bio_profiles persistence attempt note:', err);
  }

  return {
    success: localSaved || cloudSaved,
    syncedWithCloud: cloudSaved,
  };
}

/**
 * Obtiene el perfil buscando primero en Supabase (si aplica) y luego en LocalStorage,
 * con fallback al perfil por defecto.
 */
export async function fetchBioProfile(slug: string): Promise<BioProfile> {
  const cleanSlug = normalizeSlug(slug);

  if (cleanSlug === 'demo') {
    // Si hay una versión demo modificada en localStorage, usarla
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}demo`);
        if (raw) return JSON.parse(raw) as BioProfile;
      } catch {
        // fallback
      }
    }
    return DEFAULT_BIO_PROFILE;
  }

  // 1. Intentar cargar desde Supabase si estamos en navegador
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from('bio_profiles')
      .select('*')
      .eq('slug', cleanSlug)
      .maybeSingle();

    if (!error && data) {
      return {
        slug: data.slug,
        displayName: data.display_name || cleanSlug,
        bio: data.bio || '',
        avatarUrl: data.avatar_url || DEFAULT_BIO_PROFILE.avatarUrl,
        theme: data.theme || 'emerald',
        links: Array.isArray(data.links) ? data.links : [],
        isVerifiedSecurity: Boolean(data.is_verified_security),
      };
    }
  } catch {
    // continuar con LocalStorage
  }

  // 2. LocalStorage fallback
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cleanSlug}`);
      if (raw) {
        return JSON.parse(raw) as BioProfile;
      }
    } catch (err) {
      console.warn('Error leyendo perfil de localStorage:', err);
    }
  }

  // 3. Fallback con slug estilizado
  return {
    ...DEFAULT_BIO_PROFILE,
    slug: cleanSlug,
    displayName: cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  };
}

/**
 * Versión síncrona para hidratación instantánea de componentes UI desde localStorage
 */
export function getBioProfileSync(slug: string): BioProfile {
  const cleanSlug = normalizeSlug(slug);

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cleanSlug}`);
      if (raw) {
        return JSON.parse(raw) as BioProfile;
      }
    } catch {
      // fallback
    }
  }

  if (cleanSlug === 'demo') {
    return DEFAULT_BIO_PROFILE;
  }

  return {
    ...DEFAULT_BIO_PROFILE,
    slug: cleanSlug,
    displayName: cleanSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  };
}
