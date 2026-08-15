import type { Metadata } from 'next';
import { HomePage } from '@/components/HomePage';
import { buildMetadata } from '@/lib/i18n/metadata';

/* Czech homepage — /cs */
export const metadata: Metadata = buildMetadata('cs');

export default function CsHomePage() {
  return <HomePage locale="cs" />;
}
