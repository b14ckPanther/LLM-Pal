import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.0.0.20",
    "http://10.0.0.20:3000",
    "http://localhost:3000",
    "http://172.26.64.1:3000",
  ],
};

export default nextConfig;
