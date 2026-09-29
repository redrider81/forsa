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
      // Det publika erbjudandet är två ingångar: individuell coaching och
      // business coaching. De tidigare specialistsidorna är sammanslagna
      // under business coaching, men gamla länkar ska fortsätta fungera.
      { source: "/executive-coaching", destination: "/business-coaching", permanent: true },
      { source: "/ledningsgruppscoaching", destination: "/business-coaching", permanent: true },
      { source: "/team-coaching", destination: "/business-coaching", permanent: true },
      { source: "/coachande-ledarskap", destination: "/business-coaching", permanent: true },
      { source: "/en/executive-coaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/ledningsgruppscoaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/team-coaching", destination: "/en/business-coaching", permanent: true },
      { source: "/en/coachande-ledarskap", destination: "/en/business-coaching", permanent: true },
    ];
  },
};

export default nextConfig;
