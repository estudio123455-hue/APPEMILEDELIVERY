'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Share2, Check } from 'lucide-react';
import { BioProfile, DEFAULT_BIO_PROFILE } from '@/types/bio-sites';
import { fetchBioProfile, getBioProfileSync } from '@/lib/sites/bio-storage';
import BioProfileCard from '@/components/sites/BioProfileCard';

interface PublicBioClientPageProps {
  slug: string;
}

export default function PublicBioClientPage({ slug }: PublicBioClientPageProps) {
  // Inicialización síncrona inmediata desde localStorage / fallback para 0 latency
  const [profile, setProfile] = useState<BioProfile>(() => getBioProfileSync(slug));
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const data = await fetchBioProfile(slug);
      if (isMounted && data) {
        setProfile(data);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        if (navigator.share) {
          await navigator.share({
            title: `${profile.displayName} | MiPortal Bio`,
            text: profile.bio,
            url: window.location.href,
          });
          return;
        }
      } catch {
        // Fallback a clipboard
      }

      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-105 transition-transform">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline font-mono">DeliverabilityGuard / MiPortal</span>
          </Link>
          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-[11px] font-mono text-emerald-400/90 hidden sm:inline bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
            miportal.me/p/{slug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Copiar enlace o compartir perfil"
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Compartir</span>
              </>
            )}
          </button>

          <Link
            href="/sites/builder"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Editar o</span> Crear Mi Bio Site
          </Link>
        </div>
      </header>

      {/* Main Profile View */}
      <main className="flex-1 flex justify-center w-full">
        <BioProfileCard profile={profile} />
      </main>
    </div>
  );
}
