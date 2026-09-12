import type { Metadata, Viewport } from "next";
import { Motion } from "@/components/motion";
import { instrument, newsreader } from "./fonts";
import { BOOT_SCRIPT } from "@/lib/boot-script";
import { SITE_URL } from "@/lib/site-url";
import { meta, practice } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: meta.title,
    template: `%s — ${practice.name}`,
  },
  description: meta.description,
  applicationName: practice.name,
  authors: [{ name: practice.therapist }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: practice.name,
    title: meta.title,
    description: meta.description,
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: meta.ogAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: [{ url: "/og.jpg", alt: meta.ogAlt }],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f1e8" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1815" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${newsreader.variable} ${instrument.variable}`}>
      <head>
        {/* Settles calm mode and the evening palette before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to the main content
        </a>
        {children}
        <Motion />
        {/* No analytics, by design. The privacy page promises this site tracks
            nobody; shipping a measurement script — even a cookieless one —
            would make that sentence untrue. Nothing third-party loads here. */}
      </body>
    </html>
  );
}
