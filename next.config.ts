import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable detailed error messages in production (TEMPORARY - for debugging only)
  productionBrowserSourceMaps: true,

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
