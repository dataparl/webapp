import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/collabs", destination: "/collab", permanent: true },
      { source: "/collaborateurs", destination: "/collab", permanent: true },
      { source: "/collaborateur", destination: "/collab", permanent: true },
      { source: "/equipes", destination: "/collab", permanent: true },
      { source: "/espace-presse", destination: "/presse", permanent: true },
      { source: "/espace-presse/:chemin*", destination: "/presse/:chemin*", permanent: true },
      { source: "/vigiparl/methodologie", destination: "/vigiparl/methode", permanent: true },
      { source: "/mixiparl/methodologie", destination: "/mixiparl/methode", permanent: true },
      { source: "/parlementaires/:id/PAhistory", destination: "/parlementaires/:id/historique", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
