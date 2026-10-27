export interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  avatarUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  githubUrl?: string;
  whatsappUrl?: string;
  includeSecurityBadge: boolean;
  accentColor: string;
  templateId: 'minimalist' | 'executive' | 'modern-circular' | 'sidebar-accent';
}

export function generateSignatureHtml(data: SignatureData): string {
  const {
    fullName,
    jobTitle,
    company,
    phone,
    email,
    website,
    avatarUrl,
    linkedinUrl,
    twitterUrl,
    instagramUrl,
    githubUrl,
    whatsappUrl,
    includeSecurityBadge,
    accentColor,
    templateId,
  } = data;

  const cleanWeb = website.replace(/^https?:\/\//, '');
  const webHref = website.startsWith('http') ? website : `https://${website}`;

  // Social Links Row
  const socialIcons: string[] = [];
  if (linkedinUrl) {
    socialIcons.push(
      `<a href="${linkedinUrl}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 6px;"><img src="https://cdn-icons-png.flaticon.com/32/174/174857.png" width="16" height="16" alt="LinkedIn" style="display: block; border: 0;" /></a>`
    );
  }
  if (twitterUrl) {
    socialIcons.push(
      `<a href="${twitterUrl}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 6px;"><img src="https://cdn-icons-png.flaticon.com/32/5969/5969020.png" width="16" height="16" alt="X" style="display: block; border: 0;" /></a>`
    );
  }
  if (instagramUrl) {
    socialIcons.push(
      `<a href="${instagramUrl}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 6px;"><img src="https://cdn-icons-png.flaticon.com/32/174/174855.png" width="16" height="16" alt="Instagram" style="display: block; border: 0;" /></a>`
    );
  }
  if (githubUrl) {
    socialIcons.push(
      `<a href="${githubUrl}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 6px;"><img src="https://cdn-icons-png.flaticon.com/32/25/25231.png" width="16" height="16" alt="GitHub" style="display: block; border: 0;" /></a>`
    );
  }
  if (whatsappUrl) {
    const waClean = whatsappUrl.replace(/[^0-9]/g, '');
    const waHref = `https://wa.me/${waClean}`;
    socialIcons.push(
      `<a href="${waHref}" target="_blank" style="text-decoration: none; display: inline-block; margin-right: 6px;"><img src="https://cdn-icons-png.flaticon.com/32/733/733585.png" width="16" height="16" alt="WhatsApp" style="display: block; border: 0;" /></a>`
    );
  }

  const socialHtml =
    socialIcons.length > 0
      ? `<div style="padding-top: 8px;">${socialIcons.join('')}</div>`
      : '';

  // Security Badge
  const securityBadgeHtml = includeSecurityBadge
    ? `<div style="margin-top: 10px; padding: 4px 8px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; display: inline-block;">
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 11px; line-height: 14px; color: #166534;">
          <tr>
            <td style="vertical-align: middle; padding-right: 5px;">
              <span style="font-size: 12px;">🛡️</span>
            </td>
            <td style="vertical-align: middle;">
              <strong>Verificado RFC</strong> por <a href="https://www.miportal.me" target="_blank" style="color: #15803d; text-decoration: underline; font-weight: bold;">DeliverabilityGuard</a>
            </td>
          </tr>
        </table>
      </div>`
    : '';

  // 1. TEMPLATE: MINIMALIST
  if (templateId === 'minimalist') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; line-height: 18px; color: #1e293b;">
  <tr>
    <td style="padding-bottom: 6px;">
      <span style="font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.2px;">${fullName}</span>
      <span style="color: ${accentColor}; font-weight: 600;"> • </span>
      <span style="font-size: 13px; font-weight: 500; color: #475569;">${jobTitle}</span>
      ${company ? `<span style="color: #64748b;"> en <strong style="color: #1e293b;">${company}</strong></span>` : ''}
    </td>
  </tr>
  <tr>
    <td style="border-top: 2px solid ${accentColor}; padding-top: 8px; font-size: 12px; color: #475569;">
      ${phone ? `<span>📞 <a href="tel:${phone}" style="color: #475569; text-decoration: none;">${phone}</a></span><span style="color: #cbd5e1;"> | </span>` : ''}
      ${email ? `<span>✉️ <a href="mailto:${email}" style="color: #475569; text-decoration: none;">${email}</a></span><span style="color: #cbd5e1;"> | </span>` : ''}
      ${website ? `<span>🌐 <a href="${webHref}" target="_blank" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">${cleanWeb}</a></span>` : ''}
      ${socialHtml}
      ${securityBadgeHtml}
    </td>
  </tr>
</table>`;
  }

  // 2. TEMPLATE: EXECUTIVE CORPORATE (2 columnas con divisor vertical)
  if (templateId === 'executive') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 18px; color: #334155;">
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align: top; padding-right: 16px;">
      <img src="${avatarUrl}" width="80" height="80" alt="${fullName}" style="border-radius: 8px; display: block; border: 0; object-fit: cover;" />
    </td>`
        : ''
    }
    <td style="border-left: 2px solid ${accentColor}; padding-left: 16px; vertical-align: top;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${fullName}</div>
      <div style="font-size: 12px; font-weight: 600; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
        ${jobTitle}${company ? ` | ${company}` : ''}
      </div>
      <table cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; color: #64748b; line-height: 16px;">
        ${phone ? `<tr><td style="padding: 1px 0;"><strong>T:</strong> <a href="tel:${phone}" style="color: #475569; text-decoration: none;">${phone}</a></td></tr>` : ''}
        ${email ? `<tr><td style="padding: 1px 0;"><strong>E:</strong> <a href="mailto:${email}" style="color: #475569; text-decoration: none;">${email}</a></td></tr>` : ''}
        ${website ? `<tr><td style="padding: 1px 0;"><strong>W:</strong> <a href="${webHref}" target="_blank" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">${cleanWeb}</a></td></tr>` : ''}
      </table>
      ${socialHtml}
      ${securityBadgeHtml}
    </td>
  </tr>
</table>`;
  }

  // 3. TEMPLATE: MODERN CIRCULAR
  if (templateId === 'modern-circular') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #1e293b;">
  <tr>
    ${
      avatarUrl
        ? `<td style="vertical-align: middle; padding-right: 16px;">
      <img src="${avatarUrl}" width="75" height="75" alt="${fullName}" style="border-radius: 50%; display: block; border: 2px solid ${accentColor}; object-fit: cover;" />
    </td>`
        : ''
    }
    <td style="vertical-align: middle;">
      <div style="font-size: 17px; font-weight: 800; color: #0f172a;">${fullName}</div>
      <div style="font-size: 12px; color: #64748b; margin-top: 1px; margin-bottom: 6px;">
        <span style="color: ${accentColor}; font-weight: 700;">${jobTitle}</span>${company ? ` • ${company}` : ''}
      </div>
      <div style="font-size: 12px; color: #475569;">
        ${phone ? `<a href="tel:${phone}" style="color: #475569; text-decoration: none; margin-right: 10px;">📱 ${phone}</a>` : ''}
        ${email ? `<a href="mailto:${email}" style="color: #475569; text-decoration: none; margin-right: 10px;">✉️ ${email}</a>` : ''}
        ${website ? `<a href="${webHref}" target="_blank" style="color: ${accentColor}; font-weight: bold; text-decoration: none;">🔗 ${cleanWeb}</a>` : ''}
      </div>
      ${socialHtml}
      ${securityBadgeHtml}
    </td>
  </tr>
</table>`;
  }

  // 4. TEMPLATE: SIDEBAR BRAND ACCENT
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 18px; color: #1e293b;">
  <tr>
    <td style="width: 4px; background-color: ${accentColor}; border-radius: 2px;"></td>
    <td style="padding-left: 14px; vertical-align: top;">
      <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${fullName}</div>
      <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 8px;">
        ${jobTitle}${company ? ` en <strong style="color: #334155;">${company}</strong>` : ''}
      </div>
      <div style="font-size: 12px; color: #475569; line-height: 17px;">
        ${phone ? `<div><strong>Tel:</strong> <a href="tel:${phone}" style="color: #475569; text-decoration: none;">${phone}</a></div>` : ''}
        ${email ? `<div><strong>Email:</strong> <a href="mailto:${email}" style="color: #475569; text-decoration: none;">${email}</a></div>` : ''}
        ${website ? `<div><strong>Web:</strong> <a href="${webHref}" target="_blank" style="color: ${accentColor}; font-weight: 600; text-decoration: none;">${cleanWeb}</a></div>` : ''}
      </div>
      ${socialHtml}
      ${securityBadgeHtml}
    </td>
  </tr>
</table>`;
}
