import type { NextConfig } from "next";

/**
 * The site loads nothing from anyone else. That is a design decision on a
 * therapy site, and the headers below are what make it enforceable rather than
 * a promise in the privacy page: a script injected into a page could otherwise
 * read the enquiry form as it is typed.
 *
 * The Cal.com origins are only allowed when a booking link is actually
 * configured, so the default build permits no external origin at all.
 */
const calLink = process.env.NEXT_PUBLIC_CAL_LINK ?? "";
const calOrigins = calLink ? " https://app.cal.com https://cal.com" : "";

const csp = [
  "default-src 'self'",
  // Next hydration and the pre-paint boot script are inline, so inline script
  // has to be allowed. No external script origin is, which is the point.
  `script-src 'self' 'unsafe-inline'${calOrigins}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${calOrigins}`,
  `frame-src 'self'${calOrigins}`,
  "form-action 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Serve the photographs as AVIF first, WebP as the fallback.
  images: {
    formats: ["image/avif", "image/webp"],
    // The largest source photograph is 1200px wide. Asking the optimiser for
    // 1920 or 2048 returned an upscale — more bytes for a softer picture.
    deviceSizes: [320, 420, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 200, 256, 384],
    minimumCacheTTL: 2678400,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
