import { resolveTxt } from 'node:dns/promises';

const COMMON_SELECTORS = [
  'google',     // Google Workspace
  'selector1',  // Microsoft 365 / AWS SES
  's1',         // SendGrid / Mailchimp
  's2',         // SendGrid
  'k1',         // Klaviyo
  'resend',     // Resend
  'default',    // Genérico / cPanel
];

export async function detectDkimSelector(domain: string): Promise<{ valid: boolean; selector?: string; record?: string }> {
  const promises = COMMON_SELECTORS.map(async (selector) => {
    try {
      const records = await resolveTxt(`${selector}._domainkey.${domain}`);
      const txt = records.map(chunk => chunk.join('')).join('');
      if (txt.includes('v=DKIM1') || txt.includes('k=rsa') || txt.includes('p=')) {
        return { valid: true, selector, record: txt };
      }
    } catch {
      // Ignorar errores de resolución de selectores inexistentes
    }
    return null;
  });

  const results = await Promise.all(promises);
  const found = results.find((r) => r !== null);

  return found || { valid: false };
}
