'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Mail,
  Calendar,
  Share2,
  Sparkles,
  ArrowUpRight,
  Globe,
  Tag,
} from 'lucide-react';
import type { BioSiteData, SiteTheme } from '@/lib/sites/types';

interface PublicProfileViewProps {
  site: BioSiteData;
  isEmbed?: boolean; // True when rendered inside the builder smartphone mockup
}

export default function PublicProfileView({ site, isEmbed = false }: PublicProfileViewProps) {
  const {
    name,
    title,
    bio,
    avatarUrl,
    domain,
    badges,
    whatsappNumber,
    whatsappMessage,
    email,
    calendarUrl,
    services,
    theme = 'emerald',
    isVerified = true,
  } = site;

  // Theme styling configurations
  const themeStyles: Record<
    SiteTheme,
    {
      bg: string;
      cardBg: string;
      cardBorder: string;
      cardHover: string;
      textPrimary: string;
      textSecondary: string;
      accentBadge: string;
      primaryButton: string;
      actionButton: string;
      avatarRing: string;
      trustBadge: string;
    }
  > = {
    emerald: {
      bg: 'bg-slate-950 text-slate-100',
      cardBg: 'bg-slate-900/70',
      cardBorder: 'border-slate-800/90',
      cardHover: 'hover:border-emerald-500/50 hover:bg-slate-900',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-400',
      accentBadge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      primaryButton:
        'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20',
      actionButton:
        'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-sm',
      avatarRing: 'ring-4 ring-emerald-500/30 shadow-lg shadow-emerald-500/20',
      trustBadge:
        'bg-slate-900/90 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950/40',
    },
    cyberpunk: {
      bg: 'bg-[#08051a] text-slate-100',
      cardBg: 'bg-[#120b2f]/70',
      cardBorder: 'border-purple-800/40',
      cardHover: 'hover:border-cyan-400/50 hover:bg-[#180e3d]',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-purple-300/80',
      accentBadge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      primaryButton:
        'bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-slate-950 font-black shadow-lg shadow-cyan-500/25',
      actionButton:
        'bg-[#190f42]/90 hover:bg-[#25175e] text-slate-200 border border-purple-700/60 shadow-sm',
      avatarRing: 'ring-4 ring-cyan-400/50 shadow-xl shadow-cyan-500/30',
      trustBadge:
        'bg-[#140b33]/90 border-cyan-500/40 text-cyan-300 shadow-lg shadow-purple-950/50',
    },
    minimal: {
      bg: 'bg-zinc-950 text-zinc-100',
      cardBg: 'bg-zinc-900/60',
      cardBorder: 'border-zinc-800',
      cardHover: 'hover:border-zinc-600 hover:bg-zinc-900',
      textPrimary: 'text-zinc-100',
      textSecondary: 'text-zinc-400',
      accentBadge: 'bg-zinc-800/80 text-zinc-300 border-zinc-700',
      primaryButton: 'bg-zinc-100 hover:bg-white text-zinc-950 font-bold shadow-md',
      actionButton:
        'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 shadow-sm',
      avatarRing: 'ring-4 ring-zinc-700/50 shadow-md',
      trustBadge: 'bg-zinc-900/90 border-zinc-700 text-zinc-300 shadow-sm',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.emerald;

  const cleanWhatsApp = whatsappNumber ? whatsappNumber.replace(/[^0-9+]/g, '') : '';
  const waUrl = cleanWhatsApp
    ? `https://wa.me/${cleanWhatsApp.replace('+', '')}?text=${encodeURIComponent(
        whatsappMessage || 'Hola, me interesa conocer más sobre tus servicios.'
      )}`
    : null;

  return (
    <div
      className={`w-full min-h-full flex flex-col items-center transition-colors duration-300 ${
        currentTheme.bg
      } ${isEmbed ? 'p-4 sm:p-5 text-xs' : 'py-10 px-4 sm:px-6 min-h-screen text-sm'}`}
    >
      <div className={`w-full flex flex-col gap-6 ${isEmbed ? 'max-w-md' : 'max-w-lg'}`}>
        {/* ========================================================= */}
        {/* 1. HEADER & AVATAR COMERCIAL                              */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={name}
                className={`w-24 h-24 rounded-full object-cover ${currentTheme.avatarRing}`}
              />
            ) : (
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center font-black text-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 ${currentTheme.avatarRing}`}
              >
                {name ? name.slice(0, 2).toUpperCase() : 'MP'}
              </div>
            )}

            {isVerified && (
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md border-2 border-slate-950"
                title="Identidad verificada por DeliverabilityGuard"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.8]" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${currentTheme.textPrimary}`}>
              {name || 'Nombre Comercial'}
            </h1>
            <p className={`text-xs sm:text-sm font-medium ${currentTheme.textSecondary}`}>
              {title || 'Título Profesional o Especialidad'}
            </p>
          </div>

          {/* Specialty Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${currentTheme.accentBadge}`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {bio && (
            <p className={`text-xs sm:text-sm leading-relaxed max-w-md mt-1 ${currentTheme.textSecondary}`}>
              {bio}
            </p>
          )}
        </div>

        {/* ========================================================= */}
        {/* 2. BLOQUE DE ACCIONES RÁPIDAS (WHATSAPP, CALENDARIO, CORREO) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-3 gap-2 w-full">
          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition font-bold text-center active:scale-95 ${currentTheme.primaryButton}`}
            >
              <MessageCircle className="w-5 h-5 shrink-0" />
              <span className="text-[11px] truncate w-full">WhatsApp</span>
            </a>
          ) : (
            <div className="opacity-40 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-800 text-center text-slate-500">
              <MessageCircle className="w-5 h-5" />
              <span className="text-[11px]">WhatsApp</span>
            </div>
          )}

          {calendarUrl ? (
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition font-medium text-center active:scale-95 ${currentTheme.actionButton}`}
            >
              <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
              <span className="text-[11px] truncate w-full">Agendar Cita</span>
            </a>
          ) : (
            <div className="opacity-40 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-800 text-center text-slate-500">
              <Calendar className="w-5 h-5" />
              <span className="text-[11px]">Agendar</span>
            </div>
          )}

          {email ? (
            <a
              href={`mailto:${email}`}
              className={`py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition font-medium text-center active:scale-95 ${currentTheme.actionButton}`}
            >
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-[11px] truncate w-full">Enviar Correo</span>
            </a>
          ) : (
            <div className="opacity-40 py-2.5 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 border border-slate-800 text-center text-slate-500">
              <Mail className="w-5 h-5" />
              <span className="text-[11px]">Correo</span>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. INSIGNIA OFICIAL DE CONFIANZA & DOMINIO VERIFICADO      */}
        {/* ========================================================= */}
        {domain && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${currentTheme.trustBadge}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">
                  Identidad & Correo Verificados
                </span>
                <span className="font-mono font-semibold text-xs text-slate-100 truncate max-w-[200px]">
                  @{domain}
                </span>
              </div>
            </div>

            <Link
              href={`/?domain=${encodeURIComponent(domain)}`}
              target={isEmbed ? '_blank' : '_self'}
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition flex items-center gap-1 shrink-0"
              title="Auditar este dominio en DeliverabilityGuard"
            >
              <span>Ver Auditoría</span>
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
            </Link>
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. CATÁLOGO DE SERVICIOS / ENLACES COMERCIALES            */}
        {/* ========================================================= */}
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Servicios & Enlaces Destacados
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({services.length})</span>
          </div>

          {services.map((service) => (
            <div
              key={service.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 group ${currentTheme.cardBg} ${currentTheme.cardBorder} ${currentTheme.cardHover}`}
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`text-sm font-bold leading-snug ${currentTheme.textPrimary}`}>
                    {service.title}
                  </h3>
                  {service.price && (
                    <span className="font-mono font-black text-xs text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {service.price}
                    </span>
                  )}
                </div>

                {service.badge && (
                  <span className="text-[9px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full w-fit">
                    {service.badge}
                  </span>
                )}

                {service.description && (
                  <p className={`text-xs leading-relaxed ${currentTheme.textSecondary}`}>
                    {service.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <a
                  href={
                    service.url.startsWith('http') || service.url.startsWith('/')
                      ? service.url
                      : `https://${service.url}`
                  }
                  target={service.url.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Solicitar o Contratar</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                <span className="text-[10px] font-mono text-slate-500">Respuesta rápida</span>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 5. PIE DE PÁGINA COMERCIAL & SELLO MIPORTAL               */}
        {/* ========================================================= */}
        <footer className="pt-6 pb-2 text-center flex flex-col items-center gap-1.5 border-t border-slate-800/80 mt-2">
          <Link
            href="/sites/builder"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-emerald-400 transition"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Creado con MiPortal Bio & Sites</span>
          </Link>
          <span className="text-[10px] text-slate-500 font-mono">
            Infraestructura y entregabilidad protegida por DeliverabilityGuard
          </span>
        </footer>
      </div>
    </div>
  );
}
