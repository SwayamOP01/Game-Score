import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        "ffmpeg-static",
        "ffprobe-static",
        "@xenova/transformers",
        "@tensorflow/tfjs-node",
        "@tensorflow-models/coco-ssd"
      );
    }
    return config;
  },
};

export default nextConfig;
