import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n/config';

/**
 * /sitemap.xml
 *
 * Two URLs — the Czech homepage at `/` and the English one at `/en` — each
 * declaring the full language alternate set. That pairing is what tells a
 * crawler the two pages are the same content in two languages rather than
 * duplicates, and it mirrors the `hreflang` links in each page's <head>
 * (public/index.html and the generated public/en.html).
 *
 * The archived site under `/old-web` is deliberately absent: it is `noindex`
 * (metadata + X-Robots-Tag header) and must not be offered to crawlers here.
 */
const absolute = (path: string) => new URL(path, SITE_URL).toString();

const NEW_SITE_PAGES = [
  { locale: 'cs', path: '/', priority: 1 },
  { locale: 'en', path: '/en', priority: 0.9 },
] as const;

const languages = {
  ...Object.fromEntries(NEW_SITE_PAGES.map(page => [page.locale, absolute(page.path)])),
  'x-default': absolute('/'),
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return NEW_SITE_PAGES.map(page => ({
    url: absolute(page.path),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: page.priority,
    alternates: { languages },
  }));
}
