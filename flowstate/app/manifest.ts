import type { MetadataRoute } from 'next';

/**
 * Installable on a phone, which is where this app belongs — standalone display
 * removes the browser chrome so the freestyle screen gets the whole viewport.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FLOWSTATE — AI freestyle partner',
    short_name: 'FLOWSTATE',
    description:
      'An AI freestyle partner that listens to your bars and helps you find your next rhyme, idea and line in real time.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#060609',
    theme_color: '#060609',
    categories: ['music', 'entertainment', 'education'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
