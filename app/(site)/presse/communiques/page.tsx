import type { Metadata } from "next";

export const metadata: Metadata = { title: "Communiqués de presse" };

export default function Communiques() {
  return (
    <>
      <p className="meta"><a href="/presse">Presse</a></p>
      <h1><span className="surligne">Communiqués</span></h1>
      <p className="lead">Aucun communiqué publié pour l&apos;instant.</p>
      <p>Pour toute demande : <a href="/contact?sujet=presse">contact presse</a>.</p>
    </>
  );
}
