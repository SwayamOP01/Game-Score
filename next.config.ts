import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingExcludes: {
    "**/*": [
      "public/uploads/**",
    ],
  },
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        /^[^/].*$/ // Externalize all non-absolute paths (i.e., node_modules)
      );
    }
    return config;
  },
};

export default nextConfig;
