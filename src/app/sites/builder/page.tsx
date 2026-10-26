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
  Briefcase,
  Layers,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import { BioSiteData, DEFAULT_DEMO_SITE, SiteService, SiteTheme } from '@/lib/sites/types';
import { getBioSite, saveBioSite } from '@/lib/sites/storage';
import PublicProfileView from '@/components/sites/PublicProfileView';
import Navbar from '@/components/navigation/Navbar';

export default function SiteBuilderPage() {
  const [site, setSite] = useState<BioSiteData>(DEFAULT_DEMO_SITE);
  const [activeTab, setActiveTab] = useState<'profile' | 'contact' | 'services' | 'theme'>('profile');
  const [badgesInput, setBadgesInput] = useState<string>(DEFAULT_DEMO_SITE.badges.join(', '));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load initial site from localStorage if exists
  useEffect(() => {
    const existing = getBioSite('demo');
    if (existing) {
      setSite(existing);
      setBadgesInput(existing.badges.join(', '));
    }
  }, []);

  // Update site field helper
  const updateField = <K extends keyof BioSiteData>(key: K, value: BioSiteData[K]) => {
    setSite((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle Slug change with strict URL sanitation
  const handleSlugChange = (rawSlug: string) => {
    const cleaned = rawSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    updateField('slug', cleaned);
  };

  // Handle Badges comma separated
  const handleBadgesChange = (input: string) => {
    setBadgesInput(input);
    const parsed = input
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);
    updateField('badges', parsed);
  };

  // Add new service
  const handleAddService = () => {
    const newService: SiteService = {
      id: `srv-${Date.now()}`,
      title: 'Nuevo Servicio Comercial',
      description: 'Describe brevemente qué incluye y cómo beneficia a tu cliente.',
      price: '$100 USD',
      url: site.whatsappNumber ? `https://wa.me/${site.whatsappNumber.replace(/[^0-9]/g, '')}` : '/',
      badge: 'Nuevo',
    };
    updateField('services', [...site.services, newService]);
  };

  // Update specific service
  const handleUpdateService = (id: string, updates: Partial<SiteService>) => {
    const updated = site.services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    updateField('services', updated);
  };

  // Remove specific service
  const handleRemoveService = (id: string) => {
    const filtered = site.services.filter((s) => s.id !== id);
    updateField('services', filtered);
  };

  // Publish / Save site
  const handlePublish = () => {
    setIsPublishing(true);
    saveBioSite(site);

    const publicUrl = `${window.location.origin}/p/${site.slug}`;
    navigator.clipboard.writeText(publicUrl);

    setTimeout(() => {
      setIsPublishing(false);
      setPublishFeedback(`¡Página publicada exitosamente! El enlace https://deliverabilityguard.miportal.me/p/${site.slug} fue copiado al portapapeles.`);
      setIsCopied(true);
      setTimeout(() => setPublishFeedback(null), 5000);
      setTimeout(() => setIsCopied(false), 3000);
    }, 600);
  };

  const publicPageHref = `/p/${site.slug}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar />

      {/* Subheader / Action Bar */}
      <div className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-16 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver al Inicio</span>
          </Link>
          <span className="text-slate-700 hidden sm:inline">/</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200">Editor en Vivo:</span>
            <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              /p/{site.slug || 'slug'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={publicPageHref}
            target="_blank"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Abrir página pública en una nueva pestaña"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Ver en Vivo</span>
          </Link>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isCopied ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span>{isCopied ? '¡Enlace Copiado!' : 'Publicar Sitio'}</span>
          </button>
        </div>
      </div>

      {/* Alert Feedback Toast */}
      {publishFeedback && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 px-4 py-2.5 text-xs text-center font-medium animate-fade-in flex items-center justify-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{publishFeedback}</span>
          <Link href={publicPageHref} target="_blank" className="underline font-bold hover:text-white">
            Abrir página pública →
          </Link>
        </div>
      )}

      {/* Main Split Screen */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* PANEL IZQUIERDO: FORMULARIO DE CONTROL Y EDICIÓN (7 COLS) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>1. Perfil & Marca</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'contact'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>2. Contacto Directo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'services'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3. Catálogo de Servicios ({site.services.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'theme'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>4. Tema Visual</span>
            </button>
          </div>

          {/* Form Content Cards */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-5">
            {/* TAB 1: IDENTIDAD Y MARCA */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    Identidad Comercial y Enlace Único
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define la presencia que verán tus clientes al acceder a tu enlace.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre Comercial */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Nombre Profesional / Comercial:
                    </label>
                    <input
                      type="text"
                      value={site.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Ej. Alejandro Morales"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  {/* Slug / Handle */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Enlace Personalizado (Slug):
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 focus-within:border-emerald-500 transition">
                      <span className="text-xs text-slate-500 font-mono">/p/</span>
                      <input
                        type="text"
                        value={site.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="tu-nombre"
                        className="w-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none pl-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Título Profesional */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Título Profesional / Especialidad:
                  </label>
                  <input
                    type="text"
                    value={site.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="Ej. Consultor de Ciberseguridad & Arquitectura Cloud"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                {/* Biografía */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Propuesta de Valor / Biografía Corta:
                  </label>
                  <textarea
                    rows={3}
                    value={site.bio}
                    onChange={(e) => updateField('bio', e.target.value)}
                    placeholder="Describe en pocas líneas cómo resuelves los problemas de tus clientes..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition leading-relaxed"
                  />
                </div>

                {/* Avatar URL & Dominio Verificado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      URL del Avatar / Foto:
                    </label>
                    <input
                      type="url"
                      value={site.avatarUrl || ''}
                      onChange={(e) => updateField('avatarUrl', e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                      <span>Dominio Propio (Insignia Verificada):</span>
                    </label>
                    <div className="relative flex items-center">
                      <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={site.domain || ''}
                        onChange={(e) => updateField('domain', e.target.value)}
                        placeholder="tuempresa.com"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Specialty Badges */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-300">
                    Insignias de Especialidad (Separadas por comas):
                  </label>
                  <input
                    type="text"
                    value={badgesInput}
                    onChange={(e) => handleBadgesChange(e.target.value)}
                    placeholder="Cloud Architect, DMARC Specialist, Fintech Advisor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: CANALES DE CONTACTO */}
            {activeTab === 'contact' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    Canales de Conversión y Contacto Directo
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Permite que tus prospectos inicien una conversación en 1 clic.
                  </p>
                </div>

                {/* WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Número de WhatsApp (con código de país):
                    </label>
                    <input
                      type="text"
                      value={site.whatsappNumber || ''}
                      onChange={(e) => updateField('whatsappNumber', e.target.value)}
                      placeholder="+573001234567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Mensaje Predeterminado en WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={site.whatsappMessage || ''}
                      onChange={(e) => updateField('whatsappMessage', e.target.value)}
                      placeholder="Hola, me gustaría cotizar un proyecto."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                {/* Correo y Calendly */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Correo Electrónico de Negocios:
                    </label>
                    <input
                      type="email"
                      value={site.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="contacto@tuempresa.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Enlace de Citas (Cal.com / Calendly):
                    </label>
                    <input
                      type="url"
                      value={site.calendarUrl || ''}
                      onChange={(e) => updateField('calendarUrl', e.target.value)}
                      placeholder="https://cal.com/tu-usuario"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CATÁLOGO DE SERVICIOS */}
            {activeTab === 'services' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Catálogo de Servicios y Enlaces Comerciales
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Presenta tus paquetes de servicio con precios de referencia transparentes.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Servicio</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {site.services.map((service, index) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          Servicio #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-slate-500 hover:text-rose-400 transition p-1"
                          title="Eliminar este servicio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-medium text-slate-400">
                            Título del Servicio:
                          </label>
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) =>
                              handleUpdateService(service.id, { title: e.target.value })
                            }
                            placeholder="Ej. Auditoría DNS y Blindaje DMARC"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-400">
                            Precio Referencial:
                          </label>
                          <input
                            type="text"
                            value={service.price || ''}
                            onChange={(e) =>
                              handleUpdateService(service.id, { price: e.target.value })
                            }
                            placeholder="$150 USD"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-400">
                          Descripción Corta:
                        </label>
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) =>
                            handleUpdateService(service.id, { description: e.target.value })
                          }
                          placeholder="Qué incluye el entregable..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-400">
                            Enlace / URL de Destino:
                          </label>
                          <input
                            type="text"
                            value={service.url}
                            onChange={(e) =>
                              handleUpdateService(service.id, { url: e.target.value })
                            }
                            placeholder="https://wa.me/... o /#business-suite"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-400">
                            Badge Destacado (Opcional):
                          </label>
                          <input
                            type="text"
                            value={service.badge || ''}
                            onChange={(e) =>
                              handleUpdateService(service.id, { badge: e.target.value })
                            }
                            placeholder="Más Solicitado / Promo"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: TEMA VISUAL */}
            {activeTab === 'theme' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-400" />
                    Selección de Tema y Estilo Visual
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Personaliza la paleta de colores para que combine con la identidad de tu marca.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* Tema 1: Emerald Guard */}
                  <button
                    type="button"
                    onClick={() => updateField('theme', 'emerald')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 relative ${
                      site.theme === 'emerald'
                        ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">🌿 Emerald Guard</span>
                      {site.theme === 'emerald' && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Verde esmeralda y teal sobre slate profundo. Ideal para consultores y ciberseguridad.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500" />
                      <span className="w-4 h-4 rounded-full bg-teal-400" />
                      <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700" />
                    </div>
                  </button>

                  {/* Tema 2: Dark Cyberpunk */}
                  <button
                    type="button"
                    onClick={() => updateField('theme', 'cyberpunk')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 relative ${
                      site.theme === 'cyberpunk'
                        ? 'bg-[#120b2f] border-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-400">🔮 Dark Cyberpunk</span>
                      {site.theme === 'cyberpunk' && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Neón cian y violeta eléctrico sobre oscuridad total. Ideal para agencias tech y creadores.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-400" />
                      <span className="w-4 h-4 rounded-full bg-fuchsia-500" />
                      <span className="w-4 h-4 rounded-full bg-[#120b2f] border border-purple-800" />
                    </div>
                  </button>

                  {/* Tema 3: Minimal Slate */}
                  <button
                    type="button"
                    onClick={() => updateField('theme', 'minimal')}
                    className={`p-4 rounded-2xl border text-left transition flex flex-col gap-2 relative ${
                      site.theme === 'minimal'
                        ? 'bg-zinc-900 border-zinc-500 shadow-lg'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-200">⚪ Minimal Slate</span>
                      {site.theme === 'minimal' && (
                        <div className="w-2 h-2 rounded-full bg-zinc-200" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Monocromo ultra limpio y sobrio estilo Linear o Apple. Para perfiles corporativos sobrios.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-4 h-4 rounded-full bg-zinc-100" />
                      <span className="w-4 h-4 rounded-full bg-zinc-500" />
                      <span className="w-4 h-4 rounded-full bg-zinc-950 border border-zinc-800" />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* PANEL DERECHO: MOCKUP MÓVIL EN VIVO (5 COLS)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center sticky top-36">
          <div className="flex items-center gap-2 mb-3 text-xs text-slate-400 font-mono">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Previsualización Móvil en Tiempo Real</span>
          </div>

          {/* Marco de Smartphone Estilizado */}
          <div className="w-[340px] sm:w-[370px] h-[680px] bg-slate-900 rounded-[48px] p-3.5 shadow-2xl border-4 border-slate-800 relative ring-1 ring-slate-700/50 flex flex-col">
            {/* Altavoz y Cámara Frontal / Dynamic Island */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-20 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-auto mr-3" />
            </div>

            {/* Pantalla Interna con Scroll Independiente */}
            <div className="w-full h-full rounded-[38px] overflow-y-auto overflow-x-hidden bg-slate-950 relative scrollbar-none">
              {/* Barra de Estado Ficticia */}
              <div className="w-full px-6 pt-3 pb-1 flex items-center justify-between text-[10px] font-mono text-slate-400 z-10 sticky top-0 bg-slate-950/80 backdrop-blur-md">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2 border border-slate-400 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-slate-400 rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Contenido Real del Perfil */}
              <div className="pt-2 pb-8">
                <PublicProfileView site={site} isEmbed={true} />
              </div>
            </div>

            {/* Barra Inferior del Dispositivo (Home Indicator) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
