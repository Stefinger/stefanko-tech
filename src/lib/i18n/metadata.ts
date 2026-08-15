import type { Metadata, Viewport } from 'next';
import { getMessages } from './index';
import {
  localePath,
  ogLocale,
  otherLocale,
  SITE_TITLE,
  SITE_URL,
  type Locale,
} from './config';

/**
 * Per-locale metadata.
 *
 * Both locales describe the SAME page in two languages, so each one declares a
 * canonical pointing at itself plus the full `hreflang` set — that pairing is
 * what tells search engines these are alternates rather than duplicates.
 * `x-default` points at English, which is the default locale and lives at `/`.
 */
export function buildMetadata(locale: Locale): Metadata {
  const m = getMessages(locale);
  const self = localePath(locale);
  const other = otherLocale(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_TITLE,
    description: m.meta.description,
    alternates: {
      canonical: self,
      languages: {
        en: localePath('en'),
        cs: localePath('cs'),
        'x-default': localePath('en'),
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Stefanko.tech',
      url: self,
      /* Same string as the <title>; the locale-specific half of the share card
         is carried by the description. */
      title: SITE_TITLE,
      description: m.meta.description,
      locale: ogLocale[locale],
      alternateLocale: [ogLocale[other]],
    },
  };
}

/**
 * iOS Safari safe-area handling. Identical for both locales.
 *
 * viewportFit: 'cover' lets the page paint into the top inset so the navbar's
 * dark green can cover it — without this the inset is dead space Safari fills
 * from whatever is behind, which is how a cream section produced a light strip
 * above the navbar.
 *
 * themeColor is the other half: Safari 15+ tints its own top UI from this, and
 * with no value it samples the page instead — turning the browser chrome cream
 * whenever a cream section was near the top.
 */
export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#082e26',
};
