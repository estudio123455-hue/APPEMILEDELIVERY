'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Sparkles,
  Smartphone,
  Eye,
  Check,
  Share2,
  Plus,
  Trash2,
  ExternalLink,
  MessageCircle,
  Mail,
  Calendar,
  Globe,
  Palette,
  ArrowUp,
  ArrowDown,
  Layers,
  ArrowLeft,
  Copy,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Cloud,
  CloudCheck,
  User,
  Link as LinkIcon,
} from 'lucide-react';
import { BioLink, BioProfile, BioTheme, DEFAULT_BIO_PROFILE } from '@/types/bio-sites';
import { saveBioProfile, getBioProfileSync, normalizeSlug } from '@/lib/sites/bio-storage';
import BioProfileCard, { renderBioIcon, THEME_CONFIGS } from '@/components/sites/BioProfileCard';
import Navbar from '@/components/navigation/Navbar';

const AVATAR_PRESETS = [
  {
    name: 'Consultor',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Ejecutivo',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Arquitecta',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Lead',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
];

const THEME_OPTIONS: { id: BioTheme; name: string; desc: string; colors: string[] }[] = [
  {
    id: 'emerald',
    name: 'Emerald Shield',
    desc: 'Verde esmeralda y obsidiana con alta confianza corporativa y seguridad.',
    colors: ['#031510', '#07241B', '#10B981'],
  },
  {
    id: 'slate',
    name: 'Slate Luxury',
    desc: 'Lujo oscuro sobrio, grafito pulido y acentos sutiles en índigo platino.',
    colors: ['#0B0F17', '#1E293B', '#818CF8'],
  },
  {
    id: 'cyber',
    name: 'Cyberpunk Neon',
    desc: 'Gradientes violeta, resplandor cian eléctrico y estética synthwave.',
    colors: ['#090616', '#1E1038', '#06B6D4'],
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    desc: 'Blanco puro editorial suizo con tipografía nítida en carbón mate.',
    colors: ['#F9FAFB', '#FFFFFF', '#18181B'],
  },
  {
    id: 'sunset',
    name: 'Sunset Velvet',
    desc: 'Atardecer cálido en tonos vino tinto, ámbar dorado y rosa crepuscular.',
    colors: ['#1C0E1B', '#2E142B', '#F59E0B'],
  },
];

const ICON_OPTIONS = [
  { id: 'globe', label: 'Web / General' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'calendar', label: 'Calendario / Cita' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'mail', label: 'Correo' },
];

export default function SiteBuilderPage() {
  const [profile, setProfile] = useState<BioProfile>(DEFAULT_BIO_PROFILE);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'theme'>('profile');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [hasUnsavedLocalChanges, setHasUnsavedLocalChanges] = useState<boolean>(false);

  // Cargar estado inicial desde localStorage si existe
  useEffect(() => {
    const loaded = getBioProfileSync('demo');
    if (loaded) {
      setProfile(loaded);
    }
  }, []);

  // Guardado reactivo inmediato local (auto-sync en localStorage)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`miportal_bio_profile_${profile.slug}`, JSON.stringify(profile));
      } catch {
        // ignorar
      }
    }
  }, [profile]);

  // Modificar campo de perfil
  const updateProfileField = <K extends keyof BioProfile>(key: K, value: BioProfile[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasUnsavedLocalChanges(true);
  };

  // Manejo de slug limpio
  const handleSlugChange = (raw: string) => {
    const clean = normalizeSlug(raw);
    updateProfileField('slug', clean);
  };

  // Agregar nuevo enlace
  const handleAddLink = (presetType?: string) => {
    let newLink: BioLink;
    const newId = `link-${Date.now()}`;

    if (presetType === 'whatsapp') {
      newLink = {
        id: newId,
        title: 'Escríbeme por WhatsApp Directo',
        url: 'https://wa.me/573000000000?text=Hola,%20me%20gustaría%20más%20información',
        icon: 'whatsapp',
        highlight: false,
      };
    } else if (presetType === 'calendar') {
      newLink = {
        id: newId,
        title: 'Agendar Sesión de Asesoría 1-a-1',
        url: 'https://cal.com/mi-perfil',
        icon: 'calendar',
        highlight: true,
        price: '$90 USD',
      };
    } else if (presetType === 'featured') {
      newLink = {
        id: newId,
        title: 'Auditoría Técnica de Entregabilidad',
        url: '/#business-suite',
        icon: 'globe',
        highlight: true,
        price: '$150 USD',
      };
    } else {
      newLink = {
        id: newId,
        title: 'Nuevo Enlace Comercial',
        url: 'https://miportal.me',
        icon: 'globe',
        highlight: false,
      };
    }

    updateProfileField('links', [...profile.links, newLink]);
  };

  // Actualizar un enlace
  const handleUpdateLink = (id: string, updates: Partial<BioLink>) => {
    const updated = profile.links.map((link) => (link.id === id ? { ...link, ...updates } : link));
    updateProfileField('links', updated);
  };

  // Eliminar un enlace
  const handleRemoveLink = (id: string) => {
    const filtered = profile.links.filter((link) => link.id !== id);
    updateProfileField('links', filtered);
  };

  // Reordenar enlaces
  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.links.length) return;

    const reordered = [...profile.links];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    updateProfileField('links', reordered);
  };

  // Guardar y persistir en Supabase / LocalStorage
  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishFeedback(null);

    try {
      const res = await saveBioProfile(profile);

      if (res.syncedWithCloud) {
        setPublishFeedback('¡Publicado y sincronizado con tu cuenta en la nube!');
      } else {
        setPublishFeedback('¡Guardado localmente listo para compartir!');
      }
      setHasUnsavedLocalChanges(false);
    } catch {
      setPublishFeedback('Guardado en navegador de prueba.');
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishFeedback(null), 4000);
    }
  };

  // Copiar link público
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const publicUrl = `${window.location.origin}/p/${profile.slug}`;
      navigator.clipboard.writeText(publicUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar />

      {/* Builder Sub-header / Command Bar */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Slug */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Volver al inicio"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Constructor Bio Sites
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  miportal.me/p/<span className="text-white font-semibold">{profile.slug}</span>
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>{profile.displayName || 'Mi Perfil Comercial'}</span>
                {profile.isVerifiedSecurity && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" title="Verificado DeliverabilityGuard" />
                )}
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Mobile View Switcher (Editor vs Preview) */}
            <div className="flex lg:hidden bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setMobileView('editor')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  mobileView === 'editor' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  mobileView === 'preview' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Vista Previa</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
              title="Copiar URL de tu perfil público"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Copiar Enlace</span>
                </>
              )}
            </button>

            <Link
              href={`/p/${profile.slug}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Abrir página pública en una nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Ver Perfil</span>
            </Link>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            >
              {isPublishing ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publicar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Temporary Feedback Notification */}
        {publishFeedback && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{publishFeedback}</span>
            </div>
            <Link href={`/p/${profile.slug}`} target="_blank" className="font-bold underline hover:text-white">
              Abrir mi página &rarr;
            </Link>
          </div>
        )}
      </div>

      {/* Main Studio Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Controls & Tabs */}
        <div className={`w-full lg:w-7/12 flex flex-col gap-6 ${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4 text-emerald-400" />
              <span>Perfil & Seguridad</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'links'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4 text-indigo-400" />
              <span>Enlaces ({profile.links.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'theme'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>Temas & Estilo</span>
            </button>
          </div>

          {/* TAB 1: PERFIL */}
          {activeTab === 'profile' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Identidad de la Marca Personal</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Personaliza tu nombre, avatar fotográfico y la URL corta de tu perfil comercial.
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre Público o Comercial</label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => updateProfileField('displayName', e.target.value)}
                  placeholder="ej. Alejandro Morales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">Biografía / Propuesta de Valor</label>
                  <span className="text-[11px] text-slate-500">{profile.bio.length} / 180</span>
                </div>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => updateProfileField('bio', e.target.value)}
                  placeholder="Describe en 1 o 2 frases qué haces y cómo ayudas a tus clientes..."
                  maxLength={180}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-emerald-500 focus:outline-none transition resize-none"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Slug / Enlace Personalizado</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-emerald-500">
                  <span className="px-3 py-2.5 bg-slate-900 text-xs font-mono text-slate-400 border-r border-slate-800 flex items-center">
                    miportal.me/p/
                  </span>
                  <input
                    type="text"
                    value={profile.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="tu-nombre"
                    className="flex-1 px-3 py-2.5 bg-transparent text-white text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Avatar URL & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Foto de Perfil (Avatar)</label>
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => updateProfileField('avatarUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none transition"
                />

                {/* Preset Avatars */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                    O elige un avatar sugerido para probar:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateProfileField('avatarUrl', preset.url)}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition ${
                          profile.avatarUrl === preset.url
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-full object-cover" />
                        <span>{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DeliverabilityGuard Security Badge Toggle */}
              <div className="pt-3 border-t border-slate-800">
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">Insignia de Seguridad DeliverabilityGuard</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 uppercase">
                        Oficial
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Muestra a tus visitantes que tu dominio, identidad y directivas RFC de correo están auditadas y
                      verificadas contra spoofing y phishing.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input
                      type="checkbox"
                      checked={profile.isVerifiedSecurity}
                      onChange={(e) => updateProfileField('isVerifiedSecurity', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENLACES */}
          {activeTab === 'links' && (
            <div className="space-y-4">
              {/* Header with Quick Add Presets */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-indigo-400" />
                    <span>Enlaces y Servicios Directos</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Añade botones para tus servicios, calendarios de cita o redes sociales al estilo Bio Sites.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddLink('whatsapp')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>+ WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink('calendar')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-indigo-500/20 transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>+ Cita Cal.com</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddLink()}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Enlace</span>
                  </button>
                </div>
              </div>

              {/* Links List */}
              <div className="space-y-3">
                {profile.links.map((link, index) => (
                  <div
                    key={link.id}
                    className={`p-4 rounded-xl border transition-all ${
                      link.highlight
                        ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Drag / Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleMoveLink(index, 'up')}
                            disabled={index === 0}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition"
                            title="Subir posición"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink(index, 'down')}
                            disabled={index === profile.links.length - 1}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition"
                            title="Bajar posición"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Icon display */}
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                          {renderBioIcon(link.icon, 'w-4 h-4')}
                        </div>

                        <span className="text-xs font-bold text-white">Enlace #{index + 1}</span>
                        {link.highlight && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 text-indigo-400" />
                            <span>Destacado</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Highlight Toggle */}
                        <button
                          type="button"
                          onClick={() => handleUpdateLink(link.id, { highlight: !link.highlight })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                            link.highlight
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                          title="Resaltar con brillo y jerarquía en el perfil"
                        >
                          {link.highlight ? '★ Resaltado' : '☆ Resaltar'}
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700/60 transition"
                          title="Eliminar este enlace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Título del Botón</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => handleUpdateLink(link.id, { title: e.target.value })}
                          placeholder="ej. Auditoría DNS Completa"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">URL de Destino</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-indigo-500 focus:outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Icono</label>
                        <select
                          value={link.icon || 'globe'}
                          onChange={(e) => handleUpdateLink(link.id, { icon: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none transition"
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                          Precio / Badge Opcional (para monetizar)
                        </label>
                        <input
                          type="text"
                          value={link.price || ''}
                          onChange={(e) => handleUpdateLink(link.id, { price: e.target.value })}
                          placeholder="ej. $150 USD o Gratis"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-indigo-500 focus:outline-none transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {profile.links.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                    <p className="text-xs text-slate-400 mb-3">No has añadido ningún enlace todavía.</p>
                    <button
                      type="button"
                      onClick={() => handleAddLink()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                    >
                      Añadir Primer Enlace
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEMAS */}
          {activeTab === 'theme' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Estilo & Paleta Visual</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Inspirado en Squarespace Bio Sites con 5 temas diseñados profesionalmente.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {THEME_OPTIONS.map((theme) => {
                  const isSelected = profile.theme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateProfileField('theme', theme.id)}
                      className={`text-left p-4 rounded-xl border transition-all relative ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{theme.name}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Color swatches */}
                      <div className="flex items-center gap-1.5 mb-2.5">
                        {theme.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-slate-700/60 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      <p className="text-[11px] text-slate-400 leading-snug">{theme.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Realistic Smartphone Mockup Live Preview */}
        <div
          className={`w-full lg:w-5/12 sticky top-36 flex flex-col items-center justify-center ${
            mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Mockup Frame Container */}
          <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
            {/* Ambient Back Glow matching theme */}
            <div
              className={`absolute -inset-4 rounded-[50px] opacity-25 blur-2xl transition-all duration-500 ${
                profile.theme === 'emerald'
                  ? 'bg-emerald-500'
                  : profile.theme === 'cyber'
                  ? 'bg-cyan-500'
                  : profile.theme === 'sunset'
                  ? 'bg-rose-500'
                  : profile.theme === 'minimal-light'
                  ? 'bg-zinc-400'
                  : 'bg-indigo-500'
              }`}
            />

            {/* Smartphone Outer Shell */}
            <div className="relative rounded-[44px] p-3 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl border-4 border-slate-800">
              {/* Phone Speaker Notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-20 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-800" />
                <div className="w-8 h-1 rounded-full bg-slate-800" />
              </div>

              {/* Screen Mockup Inner Canvas */}
              <div className="relative w-full h-[620px] rounded-[36px] overflow-hidden overflow-y-auto no-scrollbar shadow-inner bg-slate-950 border border-slate-900">
                <BioProfileCard profile={profile} isEmbed={true} />
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-28 h-1 bg-slate-600/70 rounded-full mx-auto mt-2" />
            </div>

            {/* Device Footer Note */}
            <div className="mt-3 text-center">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Vista previa interactiva en tiempo real</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
