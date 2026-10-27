'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Mail,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Info,
  CheckCircle2,
  FileText,
  CornerDownRight,
} from 'lucide-react';
import Navbar from '@/components/navigation/Navbar';
import { analyzeEmailSpam, replaceSpamWord, type SpamTriggerMatch } from '@/lib/spam-tester/engine';

type ClientView = 'gmail-desktop' | 'gmail-mobile' | 'outlook-desktop' | 'outlook-mobile';

const DEMO_SPAMMY = {
  sender: 'Marketing Exclusivo',
  subject: '¡¡URGENTE!! 100% GRATIS Gana dinero ahora con tu cuenta',
  body: `Hola,

Esta es tu última oportunidad para obtener un ingreso extra garantizado. 
Haz clic aquí ahora mismo para reclamar tu premio 100% gratis. 

¡No lo borres! Oferta por tiempo limitado.

Atentamente,
El equipo`,
};

const DEMO_CLEAN = {
  sender: 'Carlos Restrepo | MiPortal',
  subject: 'Resumen ejecutivo y propuesta de blindaje de entregabilidad DNS',
  body: `Hola Juan,

Espero te encuentres bien. 

Adjunto el informe técnico sobre la infraestructura de correo de tu dominio, junto con las recomendaciones de directivas DMARC y SPF para asegurar que tus comunicaciones sigan llegando directamente a la bandeja de entrada.

Quedo atento si deseas que coordinemos una breve llamada de 10 minutos esta semana.

Un cordial saludo,
Carlos Restrepo`,
};

export default function SpamTesterClient() {
  const [senderName, setSenderName] = useState('DeliverabilityGuard Team');
  const [subject, setSubject] = useState(
    'Diagnóstico de entregabilidad y seguridad DNS para tu dominio'
  );
  const [bodyText, setBodyText] = useState(
    `Hola,\n\nHemos completado la auditoría RFC de tu infraestructura de correo. Tus registros SPF y DMARC ya se encuentran optimizados para evitar bloqueos en Gmail y Outlook.\n\nPuedes revisar los detalles técnicos en el enlace adjunto.\n\nSaludos cordiales.`
  );

  const [activeView, setActiveView] = useState<ClientView>('gmail-desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live Analysis
  const analysis = useMemo(() => {
    return analyzeEmailSpam({ subject, body: bodyText });
  }, [subject, bodyText]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleLoadDemo = (type: 'spammy' | 'clean') => {
    const demo = type === 'spammy' ? DEMO_SPAMMY : DEMO_CLEAN;
    setSenderName(demo.sender);
    setSubject(demo.subject);
    setBodyText(demo.body);
  };

  const handleApplyReplacement = (trigger: SpamTriggerMatch) => {
    const targetWord = trigger.phrase || trigger.word;
    const suggestionText = trigger.suggestion || trigger.replacement;
    const firstOption = suggestionText.split('/')[0].trim();
    setSubject((prev) => replaceSpamWord(prev, targetWord, firstOption));
    setBodyText((prev) => replaceSpamWord(prev, targetWord, firstOption));
  };

  const handleApplyAllReplacements = () => {
    let newSubject = subject;
    let newBody = bodyText;
    for (const trigger of analysis.triggers) {
      const targetWord = trigger.phrase || trigger.word;
      const suggestionText = trigger.suggestion || trigger.replacement;
      const firstOption = suggestionText.split('/')[0].trim();
      newSubject = replaceSpamWord(newSubject, targetWord, firstOption);
      newBody = replaceSpamWord(newBody, targetWord, firstOption);
    }
    setSubject(newSubject);
    setBodyText(newBody);
  };

  // Preview snippet derivation
  const bodySnippet = useMemo(() => {
    const cleaned = bodyText.replace(/\n+/g, ' ').trim();
    return cleaned.slice(0, 120);
  }, [bodyText]);

  // Truncated subject for mobile preview (~36 chars)
  const mobileSubject = useMemo(() => {
    if (subject.length <= 36) return subject;
    return subject.slice(0, 36) + '...';
  }, [subject]);

  const isHighRisk = analysis.riskLevel === 'HIGH';
  const isMedRisk = analysis.riskLevel === 'MEDIUM';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cabecera Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Deliverability Lab • Probador de Asuntos y Spam</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Mailbox Preview & Spam Tester
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Evalúa tus asuntos y cuerpos de correo en tiempo real. Detecta palabras penalizadas por
              filtros de spam y previsualiza cómo se verá en Gmail y Outlook en escritorio y celular.
            </p>
          </div>

          {/* Botones de plantilla demo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleLoadDemo('spammy')}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 transition flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Probar Spammy</span>
            </button>
            <button
              type="button"
              onClick={() => handleLoadDemo('clean')}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Probar Limpio</span>
            </button>
          </div>
        </div>

        {/* Grid de 2 Columnas: Editor / Análisis y Mockup de Bandeja */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* COLUMNA IZQUIERDA: EDITOR & FORMULARIO (7 cols)           */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Composición del Correo</span>
              </h2>

              {/* Nombre del Remitente */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nombre del Remitente (Sender Name):
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Ej: Daniel Restrepo | MiPortal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
              </div>

              {/* Asunto (Subject) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Línea de Asunto (Subject):
                  </label>
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      analysis.subjectLength > 60
                        ? 'bg-amber-500/20 text-amber-300'
                        : analysis.subjectLength < 15 && analysis.subjectLength > 0
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {analysis.subjectLength} caracteres {analysis.subjectLength > 60 ? '(Largo)' : '(Óptimo: 35-50)'}
                  </span>
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Actualización técnica de seguridad para tu dominio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                />
                {analysis.subjectCharWarning && (
                  <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{analysis.subjectCharWarning}</span>
                  </p>
                )}
              </div>

              {/* Cuerpo del Correo (Body Text) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Cuerpo del Mensaje (Texto / Preview):
                </label>
                <textarea
                  rows={8}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Escribe o pega aquí el contenido de tu correo..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-mono transition leading-relaxed"
                />
              </div>

              {/* Botones de Copiado */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(subject, 'sub')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  {copiedKey === 'sub' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sub' ? '¡Asunto copiado!' : 'Copiar Asunto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(bodyText, 'body')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  {copiedKey === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'body' ? '¡Cuerpo copiado!' : 'Copiar Contenido'}</span>
                </button>
              </div>
            </div>

            {/* Módulo de Palabras Gatillo Detectadas */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      analysis.triggers.length > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  />
                  <span>
                    Palabras Gatillo Identificadas ({analysis.triggers.length})
                  </span>
                </h3>
                <div className="flex items-center gap-2">
                  {analysis.triggers.length > 1 && (
                    <button
                      type="button"
                      onClick={handleApplyAllReplacements}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition"
                    >
                      Reemplazar todos ({analysis.triggers.length})
                    </button>
                  )}
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    Filtros Bayesianos & RFC
                  </span>
                </div>
              </div>

              {analysis.triggers.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    ¡Excelente redacción! No se detectaron palabras de alta penalización ni patrones spammy.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {analysis.triggers.map((trigger, idx) => {
                    const isHigh = trigger.severityKey === 'high' || trigger.severity === 'Alta';
                    const targetWord = trigger.phrase || trigger.word;
                    const suggestionText = trigger.suggestion || trigger.replacement;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition hover:border-slate-700"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                              "{targetWord}"
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                              {trigger.category}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                isHigh
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              Severidad {trigger.severity}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              ({trigger.foundIn === 'both' ? 'en asunto y cuerpo' : `en ${trigger.foundIn === 'subject' ? 'asunto' : 'cuerpo'}`})
                            </span>
                          </div>

                          <p className="text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Sugerencia:</span>
                            <strong className="text-emerald-300 font-semibold">{suggestionText}</strong>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleApplyReplacement(trigger)}
                          className="self-end sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 font-medium text-[11px] transition shrink-0 flex items-center gap-1"
                        >
                          <span>Aplicar cambio</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.recommendations.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Recomendaciones de Entregabilidad:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* COLUMNA DERECHA: SCORE & MOCKUP BANDEJA (5 cols)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6 sticky top-8">
            {/* Tarjeta de Puntaje de Salud / Spam Score */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Spam Risk Score
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isHighRisk
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : isMedRisk
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {isHighRisk ? 'Alto Riesgo' : isMedRisk ? 'Riesgo Moderado' : 'Bajo Riesgo'}
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span
                  className={`text-5xl font-black font-mono tracking-tight ${
                    isHighRisk ? 'text-red-400' : isMedRisk ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {analysis.score}
                </span>
                <span className="text-slate-500 text-lg font-mono">/ 100</span>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ${
                    isHighRisk
                      ? 'bg-gradient-to-r from-red-600 to-rose-500'
                      : isMedRisk
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  }`}
                  style={{ width: `${analysis.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isHighRisk
                  ? '⚠️ Tu correo contiene múltiples términos comerciales agresivos o problemas de formato que aumentan significativamente la probabilidad de caer en la carpeta de Spam.'
                  : isMedRisk
                  ? '⚡ Riesgo moderado. Con un par de ajustes en palabras gatillo puedes superar el 90/100 para garantizar la bandeja principal.'
                  : '✅ Excelente. Tu mensaje presenta una estructura limpia y profesional con alta probabilidad de recepción en Bandeja de Entrada Principal.'}
              </p>
            </div>

            {/* Simulador Visual de Bandeja de Entrada */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Simulador de Inbox
                  </span>
                </div>

                {/* Alternador de Clientes y Dispositivos */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveView('gmail-desktop')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeView === 'gmail-desktop'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gmail PC
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('gmail-mobile')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeView === 'gmail-mobile'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gmail Móvil
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('outlook-desktop')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeView === 'outlook-desktop'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Outlook
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('outlook-mobile')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition ${
                      activeView === 'outlook-mobile'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Outlook Móvil
                  </button>
                </div>
              </div>

              {/* RENDER MOCKUP SEGÚN VISTA */}
              {activeView === 'gmail-desktop' && (
                <div className="bg-[#202124] rounded-xl border border-slate-700/80 p-3.5 space-y-2 text-white font-sans shadow-lg">
                  <div className="flex items-center justify-between text-[11px] text-[#9aa0a6] pb-2 border-b border-slate-700/60">
                    <span className="font-semibold text-slate-300">Bandeja Principal (Gmail Web)</span>
                    <span>10:42 AM</span>
                  </div>

                  <div className="flex items-center gap-3 py-2 px-1 hover:bg-[#2d2e30] rounded-lg transition">
                    <div className="w-4 h-4 border border-slate-500 rounded-sm shrink-0" />
                    <span className="text-amber-400 text-sm shrink-0">★</span>
                    <span className="text-xs font-bold text-white w-28 truncate shrink-0">
                      {senderName || 'Remitente'}
                    </span>
                    <div className="flex-1 min-w-0 text-xs flex items-center gap-1.5 truncate">
                      <span className="font-bold text-slate-100 truncate">{subject || '(Sin Asunto)'}</span>
                      <span className="text-slate-400">-</span>
                      <span className="text-slate-400 truncate">{bodySnippet || '...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeView === 'gmail-mobile' && (
                <div className="max-w-xs mx-auto bg-[#1f1f1f] rounded-2xl border-4 border-slate-800 p-4 space-y-3 text-white font-sans shadow-2xl">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1.5 border-b border-slate-800">
                    <span className="font-bold text-slate-300">Gmail Móvil</span>
                    <span>10:42 AM</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                      {(senderName || 'R')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {senderName || 'Remitente'}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">10:42 AM</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {mobileSubject || '(Sin Asunto)'}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-snug">
                        {bodySnippet}
                      </p>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/80 text-center">
                    📱 En móviles, los asuntos &gt; 35 caracteres quedan truncados.
                  </div>
                </div>
              )}

              {activeView === 'outlook-desktop' && (
                <div className="bg-[#1b1a19] rounded-xl border border-blue-900/40 p-3.5 space-y-2 text-white font-sans shadow-lg">
                  <div className="flex items-center justify-between text-[11px] text-blue-400 pb-2 border-b border-slate-800">
                    <span className="font-semibold">Microsoft Outlook (Escritorio)</span>
                    <span className="text-slate-400">10:42 AM</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#252423] border-l-4 border-blue-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {senderName || 'Remitente'}
                      </span>
                      <span className="text-[10px] text-slate-400">Hoy</span>
                    </div>
                    <p className="text-xs font-semibold text-blue-300 truncate">
                      {subject || '(Sin Asunto)'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{bodySnippet}</p>
                  </div>
                </div>
              )}

              {activeView === 'outlook-mobile' && (
                <div className="max-w-xs mx-auto bg-[#1b1a19] rounded-2xl border-4 border-blue-950 p-4 space-y-3 text-white font-sans shadow-2xl">
                  <div className="flex items-center justify-between text-[10px] text-blue-400 pb-1.5 border-b border-slate-800">
                    <span className="font-bold">Outlook Móvil</span>
                    <span className="text-slate-400">10:42 AM</span>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-xl bg-[#252423] border border-slate-800">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {(senderName || 'O')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-white truncate block">
                        {senderName || 'Remitente'}
                      </span>
                      <p className="text-xs font-semibold text-blue-300 truncate">
                        {mobileSubject}
                      </p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{bodySnippet}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Banner de Blindaje Relacionado */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  ¿Tus correos siguen cayendo a Spam?
                </span>
                <p className="text-xs text-slate-300">
                  El mejor asunto no sirve si tu dominio no tiene SPF, DKIM y DMARC blindados.
                </p>
              </div>
              <Link
                href="/"
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition"
              >
                Auditar Dominio
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
