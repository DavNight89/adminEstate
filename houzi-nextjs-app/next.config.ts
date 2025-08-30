import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in development to avoid the error
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },
};

export default nextConfig;
