/**
 * Locale configuration — the single source of truth for what languages exist,
 * which one is the default, and how a locale maps to a URL.
 *
 * English is the default and lives at the root (`/`). Czech is prefixed (`/cs`).
 * Nothing else in the codebase should hard-code either of those paths.
 */

export const locales = ['en', 'cs'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Production origin — used for canonical URLs and Open Graph metadata. */
export const SITE_URL = 'https://stefanko.tech';

/**
 * The page title, for every locale.
 *
 * Deliberately just the brand — no positioning line. It is a constant rather
 * than a dictionary entry because it is IDENTICAL in English and Czech, and
 * declaring it once is what keeps the `<title>` and `og:title` from drifting
 * apart: both read it from here.
 */
export const SITE_TITLE = 'Stefanko.tech';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** The locale a visitor can switch TO from the given one. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'cs' : 'en';
}

/**
 * Root path for a locale. `/` for English, `/cs` for Czech.
 *
 * The site is currently a single page, but this is written as a path helper so
 * that adding `/work` (and `/cs/work`) later is a one-line change here rather
 * than a hunt through components.
 */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  if (!clean) return prefix || '/';
  return `${prefix}/${clean}`;
}

/** `hreflang` value for a locale. */
export const hreflang: Record<Locale, string> = {
  en: 'en',
  cs: 'cs',
};

/** Open Graph `og:locale` value. */
export const ogLocale: Record<Locale, string> = {
  en: 'en_US',
  cs: 'cs_CZ',
};

/**
 * Cookie that records an explicit language choice.
 *
 * It is written when the visitor uses the switcher and is deliberately NOT used
 * to redirect anyone: `/` always renders English and `/cs` always renders Czech,
 * so a shared or bookmarked URL never changes language under the visitor.
 */
export const LOCALE_COOKIE = 'stefanko_locale';
