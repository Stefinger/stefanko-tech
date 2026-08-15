import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { buildMetadata } from '@/lib/i18n/metadata';

/* English homepage — the default locale, served from the root URL. */
export const metadata: Metadata = buildMetadata('en');

export default function EnHomePage() {
  return <HomePage locale="en" />;
}
