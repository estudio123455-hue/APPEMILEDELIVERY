import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/setup-2fa'],
    },
    sitemap: 'https://deliverabilityguard.miportal.me/sitemap.xml',
  };
}
