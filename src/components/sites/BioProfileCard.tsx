'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Shield,
  BarChart3,
  BookOpen,
  ExternalLink,
  Globe,
  Mail,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Share2,
  Check,
} from 'lucide-react';
import { BioLink, BioProfile, BioTheme } from '@/types/bio-sites';

interface BioProfileCardProps {
  profile: BioProfile;
  isEmbed?: boolean;
}

// Icon helper mapping
export function renderBioIcon(iconName?: string, className = 'w-5 h-5') {
  const norm = (iconName || '').toLowerCase().trim();

  switch (norm) {
    case 'instagram':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );
    case 'x':
    case 'twitter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9 10 15" />
        </svg>
      );
    case 'mail':
      return <Mail className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'chart':
      return <BarChart3 className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'globe':
    default:
      return <Globe className={className} />;
  }
}

interface ThemeConfig {
  bg: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  cardHighlight: string;
  cardHighlightText: string;
  textPrimary: string;
  textSecondary: string;
  avatarRing: string;
  priceBadge: string;
  priceBadgeHighlight: string;
  verifiedBadge: string;
  footerText: string;
}

export const THEME_CONFIGS: Record<BioTheme, ThemeConfig> = {
  emerald: {
    bg: 'bg-[#031510] text-emerald-50',
    cardBg: 'bg-[#07241B]/90',
    cardBorder: 'border-emerald-800/40',
    cardHover: 'hover:border-emerald-400/80 hover:bg-[#0A3326] hover:shadow-emerald-950/50',
    cardHighlight:
      'bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-teal-900/90 border-emerald-400/80 shadow-lg shadow-emerald-500/20 text-emerald-50',
    cardHighlightText: 'text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-emerald-300/80',
    avatarRing: 'ring-4 ring-emerald-500/40 shadow-xl shadow-emerald-500/25',
    priceBadge: 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40',
    priceBadgeHighlight: 'bg-emerald-400 text-slate-950 font-bold',
    verifiedBadge: 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/50 shadow-md shadow-emerald-950/60',
    footerText: 'text-emerald-400/60 hover:text-emerald-300',
  },
  slate: {
    bg: 'bg-[#0B0F17] text-slate-100',
    cardBg: 'bg-[#151D2A]/85',
    cardBorder: 'border-slate-800/80',
    cardHover: 'hover:border-slate-500 hover:bg-[#1E293B] hover:shadow-slate-950/50',
    cardHighlight:
      'bg-gradient-to-r from-slate-900 via-indigo-950/90 to-slate-900 border-indigo-400/80 shadow-lg shadow-indigo-500/20 text-white',
    cardHighlightText: 'text-white',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    avatarRing: 'ring-4 ring-indigo-500/30 shadow-xl shadow-indigo-500/20',
    priceBadge: 'bg-slate-900 text-indigo-300 border border-indigo-500/30',
    priceBadgeHighlight: 'bg-indigo-400 text-slate-950 font-bold',
    verifiedBadge: 'bg-slate-900/90 text-indigo-300 border border-indigo-500/40 shadow-md shadow-slate-950/50',
    footerText: 'text-slate-500 hover:text-slate-300',
  },
  cyber: {
    bg: 'bg-[#090616] text-purple-100',
    cardBg: 'bg-[#130E26]/90',
    cardBorder: 'border-purple-800/50',
    cardHover: 'hover:border-cyan-400 hover:bg-[#1B1437] hover:shadow-cyan-950/60',
    cardHighlight:
      'bg-gradient-to-r from-fuchsia-950/90 via-purple-900/80 to-cyan-950/90 border-cyan-400 shadow-xl shadow-cyan-500/25 text-white',
    cardHighlightText: 'text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-purple-300/80',
    avatarRing: 'ring-4 ring-cyan-400/60 shadow-xl shadow-cyan-500/40',
    priceBadge: 'bg-cyan-950/80 text-cyan-300 border border-cyan-400/50 font-mono',
    priceBadgeHighlight: 'bg-cyan-400 text-slate-950 font-extrabold font-mono',
    verifiedBadge: 'bg-[#170E33] text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-950/50',
    footerText: 'text-purple-400/60 hover:text-cyan-300',
  },
  'minimal-light': {
    bg: 'bg-[#F9FAFB] text-zinc-900',
    cardBg: 'bg-white',
    cardBorder: 'border-zinc-200/90',
    cardHover: 'hover:border-zinc-400 hover:bg-zinc-50 hover:shadow-md',
    cardHighlight: 'bg-zinc-900 border-zinc-900 shadow-lg shadow-zinc-400/30 text-white',
    cardHighlightText: 'text-white',
    textPrimary: 'text-zinc-900',
    textSecondary: 'text-zinc-600',
    avatarRing: 'ring-4 ring-zinc-300 shadow-lg shadow-zinc-300/40',
    priceBadge: 'bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium',
    priceBadgeHighlight: 'bg-zinc-100 text-zinc-950 font-bold',
    verifiedBadge: 'bg-zinc-100 text-zinc-800 border border-zinc-300 shadow-sm',
    footerText: 'text-zinc-400 hover:text-zinc-700',
  },
  sunset: {
    bg: 'bg-gradient-to-b from-[#1C0E1B] via-[#241223] to-[#120815] text-rose-50',
    cardBg: 'bg-[#2B1629]/80',
    cardBorder: 'border-rose-900/40',
    cardHover: 'hover:border-rose-400/80 hover:bg-[#381C35] hover:shadow-rose-950/60',
    cardHighlight:
      'bg-gradient-to-r from-amber-900/90 via-rose-900/80 to-orange-950/90 border-amber-400/80 shadow-xl shadow-rose-500/20 text-white',
    cardHighlightText: 'text-white',
    textPrimary: 'text-white',
    textSecondary: 'text-rose-200/80',
    avatarRing: 'ring-4 ring-amber-400/50 shadow-xl shadow-amber-500/30',
    priceBadge: 'bg-amber-950/80 text-amber-300 border border-amber-400/40 font-mono',
    priceBadgeHighlight: 'bg-amber-400 text-slate-950 font-bold font-mono',
    verifiedBadge: 'bg-[#2E142B] text-amber-300 border border-amber-400/40 shadow-md',
    footerText: 'text-rose-400/60 hover:text-amber-300',
  },
};

export default function BioProfileCard({ profile, isEmbed = false }: BioProfileCardProps) {
  const theme = THEME_CONFIGS[profile.theme] || THEME_CONFIGS.emerald;

  return (
    <div
      className={`w-full min-h-full flex flex-col items-center justify-between transition-colors duration-300 ${
        theme.bg
      } ${isEmbed ? 'p-4 py-8' : 'p-6 py-12 md:py-16'}`}
    >
      {/* Profile Header */}
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="relative mb-4 group">
          <div
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-105 ${theme.avatarRing}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
              alt={profile.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback on image load error
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          {profile.isVerifiedSecurity && (
            <div
              className={`absolute -bottom-1.5 right-1/2 translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 backdrop-blur-md ${theme.verifiedBadge}`}
              title="DeliverabilityGuard Certified • DNS y Entregabilidad Verificadas"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Verificado</span>
            </div>
          )}
        </div>

        {/* Display Name */}
        <h1 className={`text-xl sm:text-2xl font-black tracking-tight mt-1 mb-2 ${theme.textPrimary}`}>
          {profile.displayName || 'Tu Nombre'}
        </h1>

        {/* Bio */}
        {profile.bio && (
          <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-sm mb-6 ${theme.textSecondary}`}>
            {profile.bio}
          </p>
        )}

        {/* Links Stack (Squarespace Bio Sites Style) */}
        <div className="w-full space-y-3">
          {profile.links && profile.links.length > 0 ? (
            profile.links.map((link) => {
              const isHighlight = Boolean(link.highlight);
              return (
                <a
                  key={link.id}
                  href={link.url || '#'}
                  target={link.url?.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className={`group relative w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.99] ${
                    isHighlight
                      ? `${theme.cardHighlight}`
                      : `${theme.cardBg} ${theme.cardBorder} ${theme.cardHover}`
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {/* Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                        isHighlight
                          ? 'bg-white/20 text-white'
                          : 'bg-black/10 dark:bg-white/10 text-current'
                      }`}
                    >
                      {renderBioIcon(link.icon, 'w-4 h-4')}
                    </div>

                    {/* Title */}
                    <div className="flex flex-col text-left min-w-0">
                      <span
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isHighlight ? theme.cardHighlightText : theme.textPrimary
                        }`}
                      >
                        {link.title || 'Enlace'}
                      </span>
                    </div>
                  </div>

                  {/* Price or Action Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    {link.price && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight shadow-sm ${
                          isHighlight ? theme.priceBadgeHighlight : theme.priceBadge
                        }`}
                      >
                        {link.price}
                      </span>
                    )}
                    <ArrowUpRight
                      className={`w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform ${
                        isHighlight ? 'text-white' : ''
                      }`}
                    />
                  </div>
                </a>
              );
            })
          ) : (
            <div className="p-6 rounded-2xl border border-dashed border-slate-700/60 text-center">
              <p className={`text-xs ${theme.textSecondary}`}>No hay enlaces añadidos aún.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-md pt-8 pb-2 flex flex-col items-center justify-center gap-2 text-center">
        {profile.isVerifiedSecurity && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400/80">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditoría DNS & Identidad DeliverabilityGuard</span>
          </div>
        )}
        <Link
          href="/sites/builder"
          className={`text-[11px] font-semibold tracking-wide flex items-center gap-1 transition ${theme.footerText}`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Crea tu Bio Site gratis en MiPortal</span>
        </Link>
      </footer>
    </div>
  );
}
