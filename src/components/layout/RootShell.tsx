import { Anton, Geist } from 'next/font/google';
import { ClientLayout } from '@/components/ClientLayout';
import type { Locale } from '@/lib/i18n/config';

const anton = Anton({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-anton',
  display: 'swap',
});

const geist = Geist({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist',
  display: 'swap',
});

/**
 * The document shell, shared by both locale root layouts.
 *
 * There is one root layout per locale (see `app/(en)` and `app/(cs)`), because
 * `<html lang>` has to be correct in the SERVER-rendered markup — a client-side
 * correction would ship `/cs` to crawlers as English. Everything below the
 * `<html>` element is identical, so it lives here rather than being duplicated.
 *
 * `latin-ext` is added to both font subsets: Czech needs ě š č ř ž ů and the
 * caron/ring accents are not in the base `latin` subset.
 */
export function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={locale} className={`${anton.variable} ${geist.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
