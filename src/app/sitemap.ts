import type { MetadataRoute } from 'next';
import { locales, localePath, SITE_URL } from '@/lib/i18n/config';

/**
 * /sitemap.xml
 *
 * Two URLs — the English root and the Czech route — each declaring the full
 * language alternate set. That pairing is what tells a crawler the two pages
 * are the same content in two languages rather than duplicates, and it mirrors
 * the `hreflang` links already emitted in each page's <head>.
 *
 * Generated from the locale list, so adding a locale updates the sitemap, the
 * hreflang set and the routes from one place. `/en` is never emitted: English
 * lives at the root.
 */
const absolute = (path: string) => new URL(path, SITE_URL).toString();

const languages = Object.fromEntries(
  locales.map(locale => [locale, absolute(localePath(locale))]),
);

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.map(locale => ({
    url: absolute(localePath(locale)),
    lastModified,
    changeFrequency: 'monthly' as const,
    // The default locale is the entry point; the alternate is equally valid
    // content, just secondary as a landing page.
    priority: locale === 'en' ? 1 : 0.9,
    alternates: { languages },
  }));
}
