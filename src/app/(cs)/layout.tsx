import { RootShell } from '@/components/layout/RootShell';
import { siteViewport } from '@/lib/i18n/metadata';
import '../globals.css';

/* Czech root layout — see RootShell for why each locale has its own. */
export const viewport = siteViewport;

export default function CsRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <RootShell locale="cs">{children}</RootShell>;
}
