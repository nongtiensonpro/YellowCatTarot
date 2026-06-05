import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1536, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024, 1501],
    qualities: [75, 95],
    formats: ['image/webp'],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
