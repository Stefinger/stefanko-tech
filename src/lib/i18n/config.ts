/**
 * Locale configuration — the single source of truth for what languages exist,
 * which one is the default, and how a locale maps to a URL.
 *
 * This is the ORIGINAL site, kept alive under `/old-web` after the static
 * homepage took over `/` and `/en`. English is its default and lives at
 * `/old-web`; Czech is prefixed (`/old-web/cs`). Nothing else in the codebase
 * should hard-code either of those paths — everything derives from OLD_WEB_BASE.
 */

/** URL prefix under which the original site is served. */
export const OLD_WEB_BASE = '/old-web';

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
 * Root path for a locale. `/old-web` for English, `/old-web/cs` for Czech.
 *
 * The site is a single page, but this is written as a path helper so that a
 * sub-route would be a one-line change here rather than a hunt through
 * components. Used by the logo link, the language switcher and the canonical /
 * hreflang metadata, so the prefix lives in exactly one place.
 */
export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  const prefix = locale === defaultLocale ? OLD_WEB_BASE : `${OLD_WEB_BASE}/${locale}`;
  if (!clean) return prefix;
  return `${prefix}/${clean}`;
}

/** `hreflang` value for a locale. */
export const hreflang: Record<Locale, string> = {
  en: 'en',
  cs: 'cs',
};

/**
 * Two-letter label for the switcher. Locale-independent by design — these read
 * the same in either language, which is what lets the desktop control show both
 * at once without a dictionary lookup.
 */
export const localeLabel: Record<Locale, string> = {
  en: 'EN',
  cs: 'CZ',
};

/** Full language name, in its own language — used to announce the active one. */
export const localeName: Record<Locale, string> = {
  en: 'English',
  cs: 'Čeština',
};

/**
 * "Switch to X", written in the language being switched TO, so a speaker of that
 * language hears it correctly (the link also carries a matching `lang`).
 */
export const switchToLabel: Record<Locale, string> = {
  en: 'Switch to English',
  cs: 'Přepnout do češtiny',
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
 * to redirect anyone: `/old-web` always renders English and `/old-web/cs`
 * always renders Czech, so a shared or bookmarked URL never changes language
 * under the visitor.
 */
export const LOCALE_COOKIE = 'stefanko_locale';
