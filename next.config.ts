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

  // Critical for Playwright + Chromium on Vercel
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],

  // Make sure the Chromium binary files are included in the serverless function
  outputFileTracingIncludes: {
    "/api/tools/html-to-pdf/convert": [
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/@sparticuz/chromium/bin/**/*",
    ],
  },

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