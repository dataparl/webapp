import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const config: NextConfig = {
  poweredByHeader: false,
  // /jobs : porte d'entrée publique vers l'espace Emplois de l'admin.
  // Réécriture interne : la page servie est /admin/emplois, donc protégée
  // par la Porte (session d'équipe + TOTP) — seule l'équipe DataParl'
  // y accède. La page est noindex par le layout de l'espace protégé.
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/jobs", destination: "/admin/emplois" },
      ],
    };
  },
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
      { source: "/sheets/vigiparl/annual-chart", destination: "/sheets/vigiparl-annual-chart", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default config;
