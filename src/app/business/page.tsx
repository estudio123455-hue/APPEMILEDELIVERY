'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  Building,
  User,
  CreditCard,
  Check,
  CheckCircle2,
  Copy,
  DollarSign,
  Briefcase,
  Layers,
  Smartphone,
  Eye,
  Edit3,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import InvoicePreview from '@/components/business/InvoicePreview';
import {
  InvoiceData,
  InvoiceItem,
  CurrencyCode,
  DEFAULT_INVOICE,
  formatInvoiceCurrency,
} from '@/components/business/types';
import { BioProfile, DEFAULT_BIO_PROFILE } from '@/types/bio-sites';

const DRAFT_STORAGE_KEY = 'miportal_draft_invoice';

export default function BusinessPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(DEFAULT_INVOICE);
  const [activeTab, setActiveTab] = useState<'details' | 'items' | 'config'>('details');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor');
  const [isCopied, setIsCopied] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Cargar borrador persistido desde localStorage si existe
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as InvoiceData;
          setInvoice(parsed);
        }
      } catch {
        // mantener DEFAULT_INVOICE
      }
    }
  }, []);

  // Guardado reactivo inmediato en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(invoice));
      } catch {
        // ignorar errores de almacenamiento
      }
    }
  }, [invoice]);

  // Modificadores de Emisor y Cliente
  const updateIssuer = (field: keyof InvoiceData['issuer'], value: string) => {
    setInvoice((prev) => ({
      ...prev,
      issuer: { ...prev.issuer, [field]: value },
    }));
  };

  const updateClient = (field: keyof InvoiceData['client'], value: string) => {
    setInvoice((prev) => ({
      ...prev,
      client: { ...prev.client, [field]: value },
    }));
  };

  const updateConfig = (field: keyof InvoiceData['config'], value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      config: { ...prev.config, [field]: value },
    }));
  };

  // Modificador de Items
  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'Nuevo Servicio Comercial',
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updates };
        const quantity = Math.max(1, merged.quantity || 1);
        const unitPrice = Math.max(0, merged.unitPrice || 0);
        return {
          ...merged,
          quantity,
          unitPrice,
          total: quantity * unitPrice,
        };
      });
      return { ...prev, items: updatedItems };
    });
  };

  const handleRemoveItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  // Importar servicios guardados desde Bio Sites
  const handleImportFromBioSites = () => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Buscar perfiles guardados en localStorage
      const demoRaw = localStorage.getItem('miportal_bio_profile_demo');
      const profileToRead: BioProfile = demoRaw ? JSON.parse(demoRaw) : DEFAULT_BIO_PROFILE;

      const pricedLinks = profileToRead.links.filter((l) => l.price && l.price.trim().length > 0);

      if (pricedLinks.length === 0) {
        setImportFeedback('No se encontraron servicios con precio en tu Bio Site.');
        setTimeout(() => setImportFeedback(null), 3500);
        return;
      }

      // Convertir enlaces en items de factura
      const importedItems: InvoiceItem[] = pricedLinks.map((link, idx) => {
        // Extraer número de "$150 USD" o "350"
        const numericMatch = link.price?.replace(/[^0-9.]/g, '') || '100';
        const priceNum = parseFloat(numericMatch) || 100;

        return {
          id: `imp-${Date.now()}-${idx}`,
          description: link.title,
          quantity: 1,
          unitPrice: priceNum,
          total: priceNum,
        };
      });

      setInvoice((prev) => ({
        ...prev,
        items: [...prev.items, ...importedItems],
      }));

      setImportFeedback(`✓ Se importaron ${importedItems.length} servicios desde tu Bio Site.`);
      setTimeout(() => setImportFeedback(null), 3500);
    } catch {
      setImportFeedback('Error al importar desde Bio Sites.');
      setTimeout(() => setImportFeedback(null), 3500);
    }
  };

  // Imprimir / Exportar a PDF
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Copiar Enlace de Pago
  const handleCopyPaymentLink = () => {
    if (typeof window !== 'undefined' && invoice.config.paymentLink) {
      navigator.clipboard.writeText(invoice.config.paymentLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Restablecer a plantilla inicial
  const handleReset = () => {
    if (confirm('¿Restablecer el presupuesto al borrador inicial por defecto?')) {
      setInvoice(DEFAULT_INVOICE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Navbar principal */}
      <Navbar />

      {/* Subheader de Control & Acciones */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-16 z-30 px-4 sm:px-6 py-3 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              title="Volver a la portada principal"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  MiPortal Business
                </span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Generador de Presupuestos & Cotizaciones
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>{invoice.invoiceNumber || 'Borrador'}</span>
                <span className="text-slate-500 font-light">—</span>
                <span className="text-slate-300 font-normal">{invoice.client.company || invoice.client.name}</span>
              </h1>
            </div>
          </div>

          {/* Acciones principales */}
          <div className="flex items-center gap-2">
            {/* Mobile View Switcher */}
            <div className="flex lg:hidden bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setMobileView('editor')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  mobileView === 'editor' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setMobileView('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition flex items-center gap-1 ${
                  mobileView === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Vista Previa</span>
              </button>
            </div>

            {invoice.config.paymentLink && (
              <button
                type="button"
                onClick={handleCopyPaymentLink}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 active:scale-95"
                title="Copiar enlace de pago directo"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">¡Enlace Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Copiar Link de Pago</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
              title="Restablecer plantilla inicial"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF / Imprimir</span>
            </button>
          </div>
        </div>

        {importFeedback && (
          <div className="max-w-7xl mx-auto mt-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importFeedback}</span>
          </div>
        )}
      </div>

      {/* Main Studio Container: Split-screen */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-8 items-start">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: FORMULARIO INTERACTIVO                 */}
        {/* ========================================================= */}
        <div className={`w-full lg:w-6/12 flex flex-col gap-6 print:hidden ${mobileView === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Navegación de pestañas */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'details'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Emisor & Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('items')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'items'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              <span>Servicios ({invoice.items.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'config'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
              <span>Moneda & Pago</span>
            </button>
          </div>

          {/* TAB 1: EMISOR Y CLIENTE */}
          {activeTab === 'details' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              {/* Datos de la Factura */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-5 border-b border-slate-800">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nº Cotización</label>
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Fecha Emisión</label>
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, issueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Vencimiento</label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Datos del Emisor */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Tus Datos de Negocio (Emisor)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nombre o Empresa</label>
                    <input
                      type="text"
                      value={invoice.issuer.name}
                      onChange={(e) => updateIssuer('name', e.target.value)}
                      placeholder="ej. Agencia Nexus Digital"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">NIT / RUT / Tax ID</label>
                    <input
                      type="text"
                      value={invoice.issuer.taxId}
                      onChange={(e) => updateIssuer('taxId', e.target.value)}
                      placeholder="NIT: 901.849.201-4"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={invoice.issuer.email}
                      onChange={(e) => updateIssuer('email', e.target.value)}
                      placeholder="facturacion@miempresa.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="text"
                      value={invoice.issuer.phone}
                      onChange={(e) => updateIssuer('phone', e.target.value)}
                      placeholder="+57 300 123 4567"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Dirección Física (Opcional)</label>
                  <input
                    type="text"
                    value={invoice.issuer.address || ''}
                    onChange={(e) => updateIssuer('address', e.target.value)}
                    placeholder="Calle 93B # 13-45, Bogotá"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Datos del Cliente Receptor</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nombre del Contacto</label>
                    <input
                      type="text"
                      value={invoice.client.name}
                      onChange={(e) => updateClient('name', e.target.value)}
                      placeholder="Carlos Mendoza"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Empresa del Cliente</label>
                    <input
                      type="text"
                      value={invoice.client.company}
                      onChange={(e) => updateClient('company', e.target.value)}
                      placeholder="Fintech Solutions LatAm"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={invoice.client.email}
                      onChange={(e) => updateClient('email', e.target.value)}
                      placeholder="carlos@empresa.com"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">NIT / Tax ID (Opcional)</label>
                    <input
                      type="text"
                      value={invoice.client.taxId || ''}
                      onChange={(e) => updateClient('taxId', e.target.value)}
                      placeholder="NIT: 900.562.119-8"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Insignia de Verificación DeliverabilityGuard */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Sello de Emisor Verificado</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Agrega la insignia de seguridad DeliverabilityGuard en el PDF certificando tu identidad corporativa.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={invoice.isVerifiedSecurity}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, isVerifiedSecurity: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: SERVICIOS / ITEMS */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Acciones de Cabecera */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                    <span>Líneas de Servicios & Productos</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Define la descripción, cantidad y precio unitario de cada entregable.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleImportFromBioSites}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Cargar automáticamente los servicios que tienes en Bio Sites"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Importar desde Bio Sites</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Servicio</span>
                  </button>
                </div>
              </div>

              {/* Lista de Items */}
              <div className="space-y-3">
                {invoice.items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        Ítem #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                        title="Eliminar este servicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Descripción del Entregable
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        placeholder="ej. Auditoría DNS y Certificación DMARC"
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cantidad</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: parseInt(e.target.value, 10) || 1 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Precio Unit.</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-400 block mb-1">Total</label>
                        <div className="px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-emerald-400 text-xs font-mono font-bold flex items-center justify-end">
                          {formatInvoiceCurrency(item.total, invoice.config.currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {invoice.items.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                    <p className="text-xs text-slate-400 mb-3">No hay servicios añadidos a este presupuesto.</p>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition"
                    >
                      Añadir Primer Servicio
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURACIÓN, MONEDA Y PAGO */}
          {activeTab === 'config' && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>Moneda, Impuestos y Cobro Directo</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Configura la moneda de cotización, impuestos aplicables y el enlace a tu pasarela de cobro.
                </p>
              </div>

              {/* Selector de Moneda & Impuesto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Moneda del Documento</label>
                  <select
                    value={invoice.config.currency}
                    onChange={(e) => updateConfig('currency', e.target.value as CurrencyCode)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="USD">USD ($ Dólar Americano)</option>
                    <option value="COP">COP ($ Peso Colombiano)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="MXN">MXN ($ Peso Mexicano)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Impuesto / IVA opcional (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={invoice.config.taxRate}
                    onChange={(e) => updateConfig('taxRate', parseFloat(e.target.value) || 0)}
                    placeholder="ej. 19 para IVA 19% o 0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Enlace de Pago Directo */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Enlace de Pago Directo (Bold, Wompi, Stripe, PSE)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateConfig('paymentLink', 'https://checkout.bold.co/payment/LNK_33UADDKUTL');
                      updateConfig('paymentGatewayName', 'Bold Checkout (Oficial)');
                    }}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
                  >
                    Usar Link Oficial de Bold
                  </button>
                </div>
                <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950 focus-within:border-cyan-500">
                  <span className="px-3 py-2.5 bg-slate-900 text-xs font-mono text-slate-400 border-r border-slate-800 flex items-center">
                    https://
                  </span>
                  <input
                    type="text"
                    value={invoice.config.paymentLink?.replace(/^https?:\/\//i, '') || ''}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      const fullUrl = val ? (val.startsWith('http') ? val : `https://${val}`) : '';
                      updateConfig('paymentLink', fullUrl);
                    }}
                    placeholder="checkout.bold.co/payment/LNK_33UADDKUTL"
                    className="flex-1 px-3 py-2.5 bg-transparent text-white text-xs font-mono focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Tu cliente verá un botón interactivo para pagar directamente con tarjeta débito, crédito o PSE desde esta cotización. Configurado por defecto con Bold Oficial ($150.000 COP).
                </p>
              </div>

              {/* Notas y Términos */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Notas Adicionales</label>
                  <textarea
                    rows={2}
                    value={invoice.notes}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Mensaje de agradecimiento o instrucciones..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Términos y Condiciones de Pago</label>
                  <textarea
                    rows={2}
                    value={invoice.terms}
                    onChange={(e) => setInvoice((prev) => ({ ...prev, terms: e.target.value }))}
                    placeholder="Vigencia, políticas de reembolso y tiempos de entrega..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-cyan-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: VISTA PREVIA EDITORIAL EN VIVO           */}
        {/* ========================================================= */}
        <div
          className={`w-full lg:w-6/12 sticky top-36 flex flex-col items-center justify-start ${
            mobileView === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div className="w-full max-w-xl">
            <InvoicePreview invoice={invoice} />

            <div className="mt-3 text-center print:hidden">
              <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Vista previa editorial sincronizada en tiempo real</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
