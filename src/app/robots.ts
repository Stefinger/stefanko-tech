import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n/config';

/**
 * /robots.txt
 *
 * Nothing on this site is private, so indexing is open. The only real job here
 * is pointing crawlers at the sitemap, which is what carries the en/cs alternate
 * pairing.
 *
 * The origin comes from the same SITE_URL constant the metadata uses, so the
 * production domain is declared in exactly one place.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
