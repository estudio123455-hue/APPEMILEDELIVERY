import type { ProviderFingerprint } from './types';

export interface FingerprintInput {
  domain: string;
  mxHosts: string[];
  spfRaw: string | null;
  nsRecords: string[];
}

/**
 * Smart Provider Fingerprinting:
 * Analyzes MX hosts, SPF mechanisms, and Nameservers to detect email providers,
 * transactional gateways, and DNS managers, returning contextual tips.
 */
export function detectProviderFingerprint({
  domain,
  mxHosts,
  spfRaw,
  nsRecords,
}: FingerprintInput): ProviderFingerprint {
  const mxJoined = mxHosts.map((h) => h.toLowerCase()).join(' ');
  const spfLower = (spfRaw || '').toLowerCase();
  const nsJoined = nsRecords.map((n) => n.toLowerCase()).join(' ');

  // 1. Detect Primary Email Provider
  let emailProvider = 'Servidor de Correo Propio / Dedicado';

  if (mxJoined.includes('google.com') || mxJoined.includes('googlemail.com') || spfLower.includes('_spf.google.com')) {
    emailProvider = 'Google Workspace (Gmail)';
  } else if (mxJoined.includes('protection.outlook.com') || spfLower.includes('spf.protection.outlook.com')) {
    emailProvider = 'Microsoft 365 (Exchange Online)';
  } else if (mxJoined.includes('zoho.com') || spfLower.includes('zoho.com')) {
    emailProvider = 'Zoho Mail';
  } else if (mxJoined.includes('registrar-servers.com') || mxJoined.includes('privateemail.com') || spfLower.includes('privateemail.com')) {
    emailProvider = 'Namecheap Private Email / Forwarding';
  } else if (mxJoined.includes('protonmail.ch') || mxJoined.includes('proton.me')) {
    emailProvider = 'Proton Mail';
  } else if (mxJoined.includes('secureserver.net')) {
    emailProvider = 'GoDaddy Workspace Email';
  } else if (mxJoined.includes('amazonses.com')) {
    emailProvider = 'Amazon SES (Inbound)';
  }

  // 2. Detect Transactional Services from SPF
  const transactionalServices: string[] = [];

  if (spfLower.includes('resend.com')) transactionalServices.push('Resend');
  if (spfLower.includes('sendgrid.net')) transactionalServices.push('SendGrid');
  if (spfLower.includes('brevo.com') || spfLower.includes('sendinblue.com')) transactionalServices.push('Brevo');
  if (spfLower.includes('mailgun.org')) transactionalServices.push('Mailgun');
  if (spfLower.includes('amazonses.com')) transactionalServices.push('Amazon SES');
  if (spfLower.includes('postmarkapp.com')) transactionalServices.push('Postmark');
  if (spfLower.includes('mcsv.net') || spfLower.includes('mandrillapp.com')) transactionalServices.push('Mailchimp');
  if (spfLower.includes('hubspotemail.net') || spfLower.includes('hubspot')) transactionalServices.push('HubSpot');
  if (spfLower.includes('klaviyo.com')) transactionalServices.push('Klaviyo');

  // 3. Detect DNS Registrar / Hosting Manager
  let dnsHost = 'Proveedor DNS Autoritativo';

  if (nsJoined.includes('squarespacedns.com') || nsJoined.includes('squarespace.com')) {
    dnsHost = 'Squarespace Domains (ex Google Domains)';
  } else if (nsJoined.includes('cloudflare.com')) {
    dnsHost = 'Cloudflare DNS';
  } else if (nsJoined.includes('registrar-servers.com')) {
    dnsHost = 'Namecheap (BasicDNS / PremiumDNS)';
  } else if (nsJoined.includes('domaincontrol.com')) {
    dnsHost = 'GoDaddy DNS';
  } else if (nsJoined.includes('awsdns')) {
    dnsHost = 'Amazon Route 53';
  } else if (nsJoined.includes('googledomains.com')) {
    dnsHost = 'Google Cloud DNS';
  } else if (nsJoined.includes('hostinger.com')) {
    dnsHost = 'Hostinger DNS';
  }

  // 4. Generate Contextual Technical Recommendations
  const contextualTips: string[] = [];

  // Squarespace Domains Tip
  if (dnsHost.includes('Squarespace')) {
    contextualTips.push(
      "Alerta de Host en Squarespace: En el campo 'Host' escribe estrictamente @ (para SPF) y _dmarc (para DMARC). No coloques tu dominio completo (" +
        domain +
        '), de lo contrario Squarespace creará un subdominio duplicado inexistente (_dmarc.' +
        domain +
        '.' +
        domain +
        ').'
    );
  }

  // Cloudflare Tip
  if (dnsHost.includes('Cloudflare')) {
    contextualTips.push(
      "Modo Solo DNS en Cloudflare: Asegúrate de mantener todos los registros TXT, MX y CNAME de correo en modo 'DNS Only' (nube gris desactivada) para que los servidores SMTP mundiales puedan resolver tus políticas."
    );
  }

  // Google Workspace Tip
  if (emailProvider.includes('Google')) {
    contextualTips.push(
      `Selector DKIM sugerido en Google Workspace: El selector estándar generado por la consola de Google Admin suele ser 'google'. Comprueba que exista el registro TXT en google._domainkey.${domain} con longitud RSA de 2048 bits.`
    );
  }

  // Microsoft 365 Tip
  if (emailProvider.includes('Microsoft')) {
    contextualTips.push(
      `Configuración DKIM en Microsoft 365: Office 365 requiere dos registros CNAME (selector1 y selector2) apuntando a selector1-${domain.replace(/\./g, '-')}.domainkey.${domain.split('.')[0]}.onmicrosoft.com.`
    );
  }

  // Transactional alignment tip
  if (transactionalServices.length > 0) {
    contextualTips.push(
      `Alineación DMARC para envíos de ${transactionalServices.join(', ')}: Recuerda configurar tu dominio personalizado de envío (Custom Return-Path / CNAME) en la plataforma del remitente para que SPF y DKIM coincidan con la cabecera 'From:' de tus correos.`
    );
  }

  return {
    emailProvider,
    dnsHost,
    transactionalServices,
    contextualTips,
  };
}
