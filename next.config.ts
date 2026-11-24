import type { NextConfig } from "next";

// Files the Vercel tracer cannot detect on its own
const browserFiles = [
  "./node_modules/playwright-core/**/*",
  "./node_modules/@sparticuz/chromium/**/*",
  "./node_modules/@sparticuz/chromium/bin/**/*",
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  staticPageGenerationTimeout: 120,

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  // Never bundle these: they load files from disk at runtime
  serverExternalPackages: ["playwright-core", "@sparticuz/chromium"],

  // Force-include their files in each serverless function
  outputFileTracingIncludes: {
    "/api/tools/html-to-pdf/convert": browserFiles,
    "/api/tools/html-to-pdf/health": browserFiles,
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