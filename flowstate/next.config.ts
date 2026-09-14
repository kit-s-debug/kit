import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // The app requests the microphone on this origin only; nothing is embedded.
          { key: 'Permissions-Policy', value: 'microphone=(self), camera=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
