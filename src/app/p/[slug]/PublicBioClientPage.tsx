'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBioSite } from '@/lib/sites/storage';
import { BioSiteData, DEFAULT_DEMO_SITE } from '@/lib/sites/types';
import PublicProfileView from '@/components/sites/PublicProfileView';
import { Shield, Sparkles, ArrowLeft, Share2, Check } from 'lucide-react';

interface PublicBioClientPageProps {
  slug: string;
}

export default function PublicBioClientPage({ slug }: PublicBioClientPageProps) {
  const [site, setSite] = useState<BioSiteData>(DEFAULT_DEMO_SITE);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const loaded = getBioSite(slug);
    if (loaded) {
      setSite(loaded);
    }
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col antialiased">
      {/* Top Floating Control Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">DeliverabilityGuard / MiPortal</span>
          </Link>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline">
            miportal.me/p/{slug}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Copiar enlace de esta página pública"
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
            <span>Editar o Crear Mi Página</span>
          </Link>
        </div>
      </header>

      {/* Main Profile View */}
      <main className="flex-1 flex justify-center">
        <PublicProfileView site={site} />
      </main>
    </div>
  );
}
