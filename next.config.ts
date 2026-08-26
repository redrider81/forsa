import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Varumärkesbytet Forsa → CVB Coaching: bevara gamla länkar.
      { source: "/om-forsa", destination: "/om-oss", permanent: true },
      { source: "/en/om-forsa", destination: "/en/om-oss", permanent: true },
      // Produktnamnet CVB Base: /portal är inte längre en renderad route,
      // men gamla bokmärken ska fortsätta fungera.
      { source: "/portal", destination: "/cvb-base", permanent: true },
      { source: "/portal/:path*", destination: "/cvb-base/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
