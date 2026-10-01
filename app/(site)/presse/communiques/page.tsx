import type { Metadata } from "next";
import { dateTitre } from "@/lib/daily";
import { authAdmin } from "@/lib/supabaseAdmin";

export const metadata: Metadata = { title: "Communiqués de presse", alternates: { canonical: "/presse/communiques" } };
export const revalidate = 300;

export default async function Communiques() {
  let liste: { slug: string; titre: string; chapo: string; publie_le: string }[] = [];
  try {
    const { data } = await authAdmin().from("communiques").select("slug, titre, chapo, publie_le").eq("statut", "publie").order("publie_le", { ascending: false }).limit(100);
    liste = (data ?? []) as typeof liste;
  } catch { /* liste vide */ }
  return (
    <>
      <p className="meta"><a href="/presse">Presse</a></p>
      <h1><span className="surligne">Communiqués</span></h1>
      {liste.length === 0 ? <p className="lead">Aucun communiqué publié pour l&apos;instant.</p> : (
        <ul className="jours">
          {liste.map((c) => (
            <li key={c.slug}><a href={`/presse/communiques/${c.slug}`}><strong>{c.titre}</strong><span>{dateTitre(c.publie_le.slice(0, 10))}</span></a></li>
          ))}
        </ul>
      )}
      <p>Pour toute demande : <a href="/presse#contact">contact presse</a>.</p>
    </>
  );
}
