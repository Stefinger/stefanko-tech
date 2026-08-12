import type { Metadata, Viewport } from 'next';
import { Anton, Geist } from 'next/font/google';
import { ClientLayout } from '@/components/ClientLayout';
import './globals.css';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const geist = Geist({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  // Browser-tab title only — deliberately just the brand, no positioning line.
  title: 'Stefanko.tech',
  description:
    'From idea to product. Jan Štefko connects product thinking, AI, design and technology to turn raw ideas into real products.',
};

/**
 * iOS Safari safe-area handling.
 *
 * viewportFit: 'cover' lets the page paint into the top inset so the navbar's
 * dark green can cover it — without this the inset is dead space Safari fills
 * from whatever is behind, which is how a cream section produced a light strip
 * above the navbar.
 *
 * themeColor is the other half: Safari 15+ tints its own top UI from this, and
 * with no value it samples the page instead — turning the browser chrome cream
 * whenever a cream section was near the top.
 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#082e26',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${anton.variable} ${geist.variable}`}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
