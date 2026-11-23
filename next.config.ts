import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  staticPageGenerationTimeout: 120,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Important for Playwright + Chromium on Vercel
  serverExternalPackages: [
    "playwright-core",
    "@sparticuz/chromium",
  ],

  images: {
    formats: ["image/webp"],
    qualities: [60, 70, 75],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    deviceSizes: [480, 768, 1024, 1280, 1600],
    imageSizes: [32, 64, 128, 256, 400],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;