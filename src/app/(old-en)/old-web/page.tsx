import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { buildMetadata } from '@/lib/i18n/metadata';

/* Original English homepage — archived at /old-web (noindex). */
export const metadata: Metadata = buildMetadata('en');

export default function EnHomePage() {
  return <HomePage locale="en" />;
}
