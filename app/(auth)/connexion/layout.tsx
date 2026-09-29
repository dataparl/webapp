import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connexion", robots: { index: false, follow: true } };

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
