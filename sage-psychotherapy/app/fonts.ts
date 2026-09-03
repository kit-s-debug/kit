import localFont from "next/font/local";

/**
 * Both faces are committed to the repo as subset variable woff2 and served from
 * this origin. Nothing is fetched from a font CDN at build time or at runtime.
 *
 * Newsreader's optical-size axis is pinned at 20 rather than left variable: it
 * takes the file from 113 KB to 49 KB, and on a phone at 1am that is the better
 * trade. Both are subset to Latin-1 plus the punctuation the site actually uses.
 */
export const newsreader = localFont({
  src: "./fonts/newsreader.woff2",
  weight: "300 650",
  style: "normal",
  display: "swap",
  variable: "--font-newsreader",
  preload: true,
  fallback: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const instrument = localFont({
  src: "./fonts/instrument-sans.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  variable: "--font-instrument",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});
