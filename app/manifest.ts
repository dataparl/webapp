import type { MetadataRoute } from "next";

// Manifeste de application web (PWA légère) : nom, couleurs, icônes.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DataParl'",
    short_name: "DataParl'",
    description:
      "Arrivées, départs et transferts des collaborateurs des députés, sénateurs et eurodéputés, d'après les publications officielles.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#164DFF",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
  };
}
