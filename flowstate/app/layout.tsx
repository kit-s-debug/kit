import type { Metadata, Viewport } from 'next';
import { Archivo, Inter } from 'next/font/google';
import { AppBootstrap } from '@/components/system/app-bootstrap';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-archivo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FLOWSTATE — Never lose your flow',
    template: '%s · FLOWSTATE',
  },
  description:
    'An AI freestyle partner that listens to your bars and helps you find your next rhyme, idea and line in real time.',
  applicationName: 'FLOWSTATE',
  appleWebApp: { capable: true, title: 'FLOWSTATE', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
  openGraph: {
    title: 'FLOWSTATE — Never lose your flow',
    description:
      'Pick a beat, start rapping, and get rhymes and ideas the moment you need them.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#060609',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // The freestyle screen has large tap targets; zoom stays available.
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body className="grain min-h-dvh bg-void text-text antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <AppBootstrap />
        {children}
      </body>
    </html>
  );
}
