'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Layout,
  Palette,
  Image,
  Globe,
  Mail,
  Phone,
  User,
  Briefcase,
  Building,
  Code2,
  ExternalLink,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import {
  generateSignatureHtml,
  type SignatureData,
} from '@/lib/signature/templates';

const COLOR_PRESETS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Cian Neón', hex: '#06b6d4' },
  { name: 'Azul Real', hex: '#2563eb' },
  { name: 'Púrpura', hex: '#8b5cf6' },
  { name: 'Ámbar', hex: '#f59e0b' },
  { name: 'Carmesí', hex: '#e11d48' },
  { name: 'Grafito', hex: '#475569' },
];

export default function SignatureStudioClient() {
  const [formData, setFormData] = useState<SignatureData>({
    fullName: 'Carlos Alberto Restrepo',
    jobTitle: 'Director de Seguridad de la Información (CISO)',
    company: 'MiPortal Suite & DeliverabilityGuard',
    phone: '+57 312 456 7890',
    email: 'carlos.restrepo@miportal.me',
    website: 'https://www.miportal.me',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
    linkedinUrl: 'https://linkedin.com',
    twitterUrl: 'https://x.com',
    whatsappUrl: '+573124567890',
    includeSecurityBadge: true,
    accentColor: '#10b981',
    templateId: 'modern-circular',
  });

  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [copiedType, setCopiedType] = useState<'rich' | 'code' | null>(null);

  const signatureHtml = useMemo(() => {
    return generateSignatureHtml(formData);
  }, [formData]);

  const handleCopyRichHtml = async () => {
    try {
      if (typeof window !== 'undefined' && 'ClipboardItem' in window) {
        const textBlob = new Blob([signatureHtml], { type: 'text/plain' });
        const htmlBlob = new Blob([signatureHtml], { type: 'text/html' });
        const item = new ClipboardItem({
          'text/plain': textBlob,
          'text/html': htmlBlob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(signatureHtml);
      }
      setCopiedType('rich');
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
      await navigator.clipboard.writeText(signatureHtml);
      setCopiedType('rich');
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(signatureHtml);
    setCopiedType('code');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([signatureHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `firma-${formData.fullName.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Deliverability Lab • Signature Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Generador y Estudio de Firmas Corporativas
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Diseña firmas de correo ejecutivas optimizadas para Gmail, Microsoft Outlook y Apple Mail.
              Totalmente responsive, con tablas HTML estándares y sello de verificación RFC.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyRichHtml}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20"
            >
              {copiedType === 'rich' ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>¡Firma copiada para pegar!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Firma HTML</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Layout en 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: CONFIGURADOR & DATOS (6 cols)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Selector de Plantilla */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layout className="w-4 h-4 text-emerald-400" />
                <span>1. Elige una Plantilla Profesional</span>
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'modern-circular', name: 'Moderno Circular', desc: 'Foto circular + iconos de redes' },
                  { id: 'executive', name: 'Ejecutivo Corporativo', desc: '2 columnas con divisor vertical' },
                  { id: 'minimalist', name: 'Minimalista Clean', desc: 'Línea de corte + tipografía compacta' },
                  { id: 'sidebar-accent', name: 'Barra Lateral de Marca', desc: 'Acento vertical sólido a la izquierda' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, templateId: tpl.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.templateId === tpl.id
                        ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <p className="text-xs font-bold text-white mb-0.5">{tpl.name}</p>
                    <p className="text-[11px] text-slate-400 leading-tight">{tpl.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Color de Acento */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>2. Color de Acento Corporativo</span>
              </h2>

              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: color.hex })}
                    className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center ${
                      formData.accentColor.toLowerCase() === color.hex.toLowerCase()
                        ? 'border-white ring-2 ring-emerald-500/50 scale-105'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {formData.accentColor.toLowerCase() === color.hex.toLowerCase() && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                ))}

                <div className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-800">
                  <span className="text-xs text-slate-400">HEX:</span>
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 3. Datos Personales y Profesionales */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                <span>3. Información del Emisor</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cargo / Puesto:</label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Empresa:</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono / Celular:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Sitio Web:</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* URL Avatar o Logo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  URL de Foto de Perfil o Logo (HTTPS):
                </label>
                <input
                  type="text"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              {/* Redes Sociales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">LinkedIn URL:</label>
                  <input
                    type="text"
                    value={formData.linkedinUrl || ''}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">WhatsApp URL/Número:</label>
                  <input
                    type="text"
                    value={formData.whatsappUrl || ''}
                    onChange={(e) => setFormData({ ...formData, whatsappUrl: e.target.value })}
                    placeholder="+573124567890"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Interruptor: Sello de Seguridad DeliverabilityGuard */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-xs font-bold text-white">Sello de Seguridad DeliverabilityGuard</p>
                    <p className="text-[11px] text-slate-400">
                      Agrega una insignia que certifica cumplimiento de normativas RFC en tu dominio.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.includeSecurityBadge}
                    onChange={(e) =>
                      setFormData({ ...formData, includeSecurityBadge: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: PREVIEW EN TIEMPO REAL & EXPORT (6 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 space-y-6 sticky top-8">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Vista Previa en Vivo
                  </span>
                </div>

                {/* Alternador Fondo Claro / Oscuro */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('light')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      previewTheme === 'light'
                        ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Claro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme('dark')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${
                      previewTheme === 'dark'
                        ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Oscuro</span>
                  </button>
                </div>
              </div>

              {/* Contenedor Visual de la Firma */}
              <div
                className={`p-6 rounded-xl border transition-all overflow-x-auto min-h-[220px] flex items-center justify-start ${
                  previewTheme === 'light'
                    ? 'bg-white text-slate-900 border-slate-300 shadow-inner'
                    : 'bg-[#181a1b] text-slate-100 border-slate-800 shadow-inner'
                }`}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: signatureHtml }}
                  className="max-w-full"
                />
              </div>

              {/* Botones de Acción de Exportación */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyRichHtml}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {copiedType === 'rich' ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>¡Copiada! Pégala directamente en Gmail u Outlook</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Firma para Pegar (Formato Enriquecido)</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    {copiedType === 'code' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedType === 'code' ? '¡Código copiado!' : 'Copiar Código HTML'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHtml}
                    className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .html</span>
                  </button>
                </div>
              </div>

              {/* Guía Rápida de Instalación */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-slate-300">
                  <Info className="w-4 h-4 text-emerald-400" />
                  <span>¿Cómo instalar tu nueva firma?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
                  <li>Haz clic en el botón principal <strong>"Copiar Firma para Pegar"</strong>.</li>
                  <li>Abre la configuración de firmas en <strong>Gmail</strong> (Configuración → General → Firma) o en <strong>Outlook</strong> (Archivo → Opciones → Correo → Firmas).</li>
                  <li>Crea una nueva firma y presiona <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200">Ctrl + V</kbd> (o <kbd className="px-1 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-200">Cmd + V</kbd>).</li>
                  <li>Guarda los cambios y disfruta de una firma corporativa impecable.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
