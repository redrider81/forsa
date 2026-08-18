import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Varumärkesbytet Forsa → CVB Coaching: bevara gamla länkar.
      { source: "/om-forsa", destination: "/om-oss", permanent: true },
      { source: "/en/om-forsa", destination: "/en/om-oss", permanent: true },
    ];
  },
};

export default nextConfig;
