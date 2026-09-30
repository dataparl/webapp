import type { Metadata } from "next";
import GestionCles from "../GestionCles";

export const metadata: Metadata = { title: "Mon espace API", robots: { index: false, follow: false } };

export default function MonEspaceApi() {
  return (
    <div className="etroit">
      <h1>Mon espace <span className="surligne">API</span></h1>
      <GestionCles />
      <p className="meta" style={{ marginTop: 24 }}>
        Ton profil, tes alertes et tes données personnelles se gèrent sur <a href="https://www.dataparl.fr/mon-compte">ton compte DataParl&apos;</a>.
      </p>
    </div>
  );
}
