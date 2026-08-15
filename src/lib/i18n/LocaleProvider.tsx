'use client';
import { createContext, useContext, useMemo } from 'react';
import type { Locale } from './config';
import type { Messages } from './types';

/**
 * Locale resolution has exactly one source of truth: the route.
 *
 * The page (a Server Component) reads its locale from which route rendered it,
 * loads that dictionary and publishes both here. Every client component below
 * reads from this context — nothing anywhere inspects `usePathname()` to guess
 * a language, so there is no second, drifting answer to "which locale is this".
 */
interface LocaleContextValue {
  locale: Locale;
  t: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  messages: Messages;
  children: React.ReactNode;
}

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  const value = useMemo(() => ({ locale, t: messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale/useMessages must be used inside <LocaleProvider>');
  }
  return ctx;
}

/** The active locale. */
export function useLocale(): Locale {
  return useLocaleContext().locale;
}

/** Copy for the active locale. */
export function useMessages(): Messages {
  return useLocaleContext().t;
}
