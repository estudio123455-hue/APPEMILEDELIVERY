import { BioSiteData, DEFAULT_DEMO_SITE } from './types';

const STORAGE_PREFIX = 'miportal_site_';
const SITES_INDEX_KEY = 'miportal_all_sites';

export function saveBioSite(site: BioSiteData): void {
  if (typeof window === 'undefined') return;

  const normalizedSlug = site.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const siteToSave: BioSiteData = {
    ...site,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${normalizedSlug}`, JSON.stringify(siteToSave));

    // Update sites index
    const existingIndexRaw = localStorage.getItem(SITES_INDEX_KEY);
    let index: string[] = existingIndexRaw ? JSON.parse(existingIndexRaw) : [];
    if (!index.includes(normalizedSlug)) {
      index.push(normalizedSlug);
      localStorage.setItem(SITES_INDEX_KEY, JSON.stringify(index));
    }
  } catch (err) {
    console.error('Error saving BioSite to localStorage:', err);
  }
}

export function getBioSite(slug: string): BioSiteData | null {
  const normalizedSlug = slug.trim().toLowerCase();

  if (normalizedSlug === 'demo') {
    return DEFAULT_DEMO_SITE;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${normalizedSlug}`);
    if (raw) {
      return JSON.parse(raw) as BioSiteData;
    }
  } catch (err) {
    console.error('Error loading BioSite from localStorage:', err);
  }

  // Generar perfil inicial a partir del slug si no existe aún
  return {
    ...DEFAULT_DEMO_SITE,
    slug: normalizedSlug,
    name: normalizedSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
  };
}

export function listUserBioSites(): string[] {
  if (typeof window === 'undefined') return ['demo'];

  try {
    const raw = localStorage.getItem(SITES_INDEX_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes('demo')) {
      list.unshift('demo');
    }
    return list;
  } catch {
    return ['demo'];
  }
}
