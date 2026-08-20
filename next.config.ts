import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "sansad.in",
      },
      {
        protocol: "https",
        hostname: "eci.gov.in",
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      }
    ],
  },
};

export default nextConfig;
