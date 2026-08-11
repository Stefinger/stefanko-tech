import type { Metadata } from 'next';
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
