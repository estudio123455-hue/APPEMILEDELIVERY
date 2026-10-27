'use client';

import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  Building,
  User,
  FileText,
} from 'lucide-react';
import { InvoiceData, formatInvoiceCurrency } from './types';

interface InvoicePreviewProps {
  invoice: InvoiceData;
  isPrintOnly?: boolean;
}

export default function InvoicePreview({ invoice, isPrintOnly = false }: InvoicePreviewProps) {
  const { issuer, client, items, config } = invoice;

  // Cálculos en tiempo real
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const taxRate = Math.max(0, config.taxRate || 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount;

  return (
    <div
      id="printable-invoice"
      className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 md:p-10 text-slate-100 shadow-2xl transition-all print:bg-white print:text-black print:p-8 print:m-0 print:border-0 print:shadow-none print:rounded-none ${
        isPrintOnly ? 'hidden print:block' : ''
      }`}
    >
      {/* ========================================================= */}
      {/* HEADER DE LA COTIZACIÓN                                    */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-800 print:border-slate-300">
        <div className="space-y-2">
          {issuer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={issuer.logoUrl}
              alt={issuer.name}
              className="h-10 w-auto object-contain max-w-[180px] print:h-8"
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold print:border-emerald-600 print:text-emerald-700">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight print:text-black">
                {issuer.name || 'Agencia Emisora'}
              </span>
            </div>
          )}

          {invoice.isVerifiedSecurity && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-emerald-700" />
              <span>Emisor Verificado por DeliverabilityGuard</span>
            </div>
          )}
        </div>

        {/* Número y Fechas */}
        <div className="text-left sm:text-right space-y-1">
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase print:text-emerald-700">
            Presupuesto Ejecutivo
          </span>
          <h2 className="text-2xl font-black text-white font-mono print:text-black">
            {invoice.invoiceNumber || 'COT-001'}
          </h2>
          <div className="text-xs text-slate-400 print:text-slate-600 space-y-0.5 pt-1">
            <p>
              <span className="font-semibold text-slate-300 print:text-slate-700">Emisión: </span>
              {invoice.issueDate || 'Hoy'}
            </p>
            <p>
              <span className="font-semibold text-slate-300 print:text-slate-700">Vencimiento: </span>
              {invoice.dueDate || '15 días'}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DATOS DE EMISOR Y CLIENTE                                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-slate-800 print:border-slate-300 text-xs">
        {/* Emisor */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 print:text-slate-500">
            De (Emisor):
          </span>
          <p className="text-sm font-bold text-white print:text-black">{issuer.name}</p>
          {issuer.taxId && <p className="text-slate-300 font-mono print:text-slate-700">{issuer.taxId}</p>}
          {issuer.email && (
            <p className="text-slate-400 print:text-slate-600 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500 print:text-slate-600" />
              <span>{issuer.email}</span>
            </p>
          )}
          {issuer.phone && (
            <p className="text-slate-400 print:text-slate-600 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500 print:text-slate-600" />
              <span>{issuer.phone}</span>
            </p>
          )}
          {issuer.address && <p className="text-slate-400 print:text-slate-600">{issuer.address}</p>}
        </div>

        {/* Cliente */}
        <div className="space-y-1.5 sm:text-right">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 print:text-slate-500">
            Para (Cliente):
          </span>
          <p className="text-sm font-bold text-white print:text-black">{client.name || 'Cliente'}</p>
          {client.company && (
            <p className="text-emerald-400 font-semibold print:text-emerald-700">{client.company}</p>
          )}
          {client.taxId && <p className="text-slate-300 font-mono print:text-slate-700">{client.taxId}</p>}
          {client.email && (
            <p className="text-slate-400 print:text-slate-600 sm:justify-end flex items-center gap-1.5">
              <span>{client.email}</span>
              <Mail className="w-3.5 h-3.5 text-slate-500 print:text-slate-600" />
            </p>
          )}
          {client.address && <p className="text-slate-400 print:text-slate-600">{client.address}</p>}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TABLA DE SERVICIOS / ITEMS                                 */}
      {/* ========================================================= */}
      <div className="py-6 border-b border-slate-800 print:border-slate-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 print:border-slate-300 text-slate-400 print:text-slate-600 font-mono uppercase text-[10px]">
                <th className="py-2.5 pr-4">Descripción del Servicio</th>
                <th className="py-2.5 px-3 text-center">Cant.</th>
                <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                <th className="py-2.5 pl-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
              {items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-800/20 print:hover:bg-transparent">
                  <td className="py-3.5 pr-4 text-slate-200 print:text-black font-medium leading-relaxed">
                    {item.description || 'Servicio'}
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-300 font-mono print:text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-3 text-right text-slate-300 font-mono print:text-slate-800">
                    {formatInvoiceCurrency(item.unitPrice, config.currency)}
                  </td>
                  <td className="py-3.5 pl-4 text-right font-bold text-white font-mono print:text-black">
                    {formatInvoiceCurrency(item.total, config.currency)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No hay servicios añadidos a este presupuesto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RESUMEN DE TOTALES Y BOTÓN DE PAGO                        */}
      {/* ========================================================= */}
      <div className="py-6 flex flex-col sm:flex-row items-start justify-between gap-6 border-b border-slate-800 print:border-slate-300">
        {/* Enlace de Pago Directo */}
        <div className="w-full sm:w-1/2 space-y-2.5">
          {config.paymentLink && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 print:border-slate-300 print:bg-slate-50 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400 print:text-emerald-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Pasarela de Pago Directo</span>
              </span>
              <p className="text-xs text-slate-300 print:text-slate-700">
                Paga esta cotización de forma instantánea y segura con tarjeta o transferencia:
              </p>
              <a
                href={config.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition active:scale-95 shadow-md shadow-emerald-500/20 print:hidden"
              >
                <span>Pagar Ahora ({config.paymentGatewayName || 'Pasarela Segura'})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="hidden print:block text-[11px] font-mono text-slate-600 break-all">
                Enlace de pago: {config.paymentLink}
              </div>
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="w-full sm:w-5/12 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-slate-400 print:text-slate-600">
            <span>Subtotal:</span>
            <span className="text-slate-200 font-bold print:text-black">
              {formatInvoiceCurrency(subtotal, config.currency)}
            </span>
          </div>

          {taxRate > 0 && (
            <div className="flex justify-between text-slate-400 print:text-slate-600">
              <span>Impuesto ({taxRate}%):</span>
              <span className="text-slate-200 font-bold print:text-black">
                {formatInvoiceCurrency(taxAmount, config.currency)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 print:border-slate-300 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white print:text-black uppercase font-sans">Total:</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 print:text-emerald-700">
              {formatInvoiceCurrency(grandTotal, config.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NOTAS Y TÉRMINOS                                          */}
      {/* ========================================================= */}
      <div className="pt-6 space-y-4 text-xs text-slate-400 print:text-slate-600 leading-relaxed">
        {invoice.notes && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 print:text-black uppercase tracking-wider mb-1">
              Notas del Presupuesto
            </h4>
            <p>{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 print:text-black uppercase tracking-wider mb-1">
              Términos Comerciales & Forma de Pago
            </h4>
            <p>{invoice.terms}</p>
          </div>
        )}
      </div>

      {/* Footer del Documento */}
      <div className="pt-8 mt-6 border-t border-slate-800/80 print:border-slate-300 text-center text-[10px] text-slate-500 font-mono">
        <p>Documento generado oficialmente con MiPortal Business Suite • Seguridad DeliverabilityGuard</p>
      </div>
    </div>
  );
}
