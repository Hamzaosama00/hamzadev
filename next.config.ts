import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically — no "standalone" needed.
  typescript: {
    // Don't fail the production build on type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail the production build on lint warnings.
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
