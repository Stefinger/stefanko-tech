import { RootShell } from '@/components/layout/RootShell';
import { siteViewport } from '@/lib/i18n/metadata';
import '../globals.css';

/* English root layout — see RootShell for why each locale has its own. */
export const viewport = siteViewport;

export default function EnRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="en">{children}</RootShell>;
}
