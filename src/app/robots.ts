import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n/config';

/**
 * /robots.txt
 *
 * Indexing is open. The archived site under `/old-web` is intentionally NOT
 * disallowed here: a crawler has to be able to fetch those pages to see their
 * `noindex` (robots meta + X-Robots-Tag header). Blocking them in robots.txt
 * would hide the noindex and could leave stale URLs in the index.
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
