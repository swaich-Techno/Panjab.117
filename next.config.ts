import type { NextConfig } from "next";

import { publicSecurityHeaders } from "./src/lib/security/public-headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    const headers =
      process.env.NODE_ENV === "production"
        ? [...publicSecurityHeaders]
        : publicSecurityHeaders.filter(
            ({ key }) =>
              key !== "Content-Security-Policy" &&
              key !== "Strict-Transport-Security",
          );
    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default nextConfig;
