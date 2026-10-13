import * as Sentry from "@sentry/nextjs";
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
      { source: "/sheets/vigiparl/annual-chart", destination: "/sheets/vigiparl-annual-chart", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Sentry : build instrumenté (source maps uploadables plus tard, silencieux sans DSN)
export default Sentry.withSentryConfig(config, {
  silent: true,
  // Le DSN est lu dans l'environnement ; sans lui, Sentry reste inactif.
  disable: !process.env.NEXT_PUBLIC_SENTRY_DSN,
});
