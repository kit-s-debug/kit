import type { NextConfig } from "next";

// Static export: the site builds to plain files in /out and can be hosted anywhere
// (Vercel, Netlify, any web server) with no server required.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
