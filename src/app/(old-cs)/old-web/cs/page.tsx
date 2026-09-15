import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { buildMetadata } from '@/lib/i18n/metadata';

/* Original Czech homepage — archived at /old-web/cs (noindex). */
export const metadata: Metadata = buildMetadata('cs');

export default function CsHomePage() {
  return <HomePage locale="cs" />;
}
