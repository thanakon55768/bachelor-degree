import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const backend = process.env.BACKEND_API_URL ?? "http://localhost:8000/api/v1";
    return [
      {
        source: "/backend-api/:path*",
        destination: `${backend}/:path*/`,
      },
    ];
  },
};

export default nextConfig;
