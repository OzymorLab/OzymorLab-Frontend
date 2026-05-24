import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // the project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // @ts-ignore
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // the project has TypeScript type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
