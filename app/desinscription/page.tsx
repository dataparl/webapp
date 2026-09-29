import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desinscrire, emailDepuisJeton } from "@/lib/consent";

export const metadata: Metadata = { title: "Désinscription", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function valider(formData: FormData) {
  "use server";
  const email = await emailDepuisJeton(String(formData.get("id") ?? ""));
  if (!email) redirect("/desinscription?etat=invalide");
  await desinscrire(email);
  redirect("/desinscription?etat=ok");
}

export default async function Desinscription({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { id, etat } = await searchParams;
  if (etat === "ok") {
    return <div className="card"><h1>Désinscription confirmée</h1><p>C&apos;est noté : tu ne recevras plus d&apos;alertes DataParl&apos;.</p></div>;
  }
  if (etat === "invalide" || !(await emailDepuisJeton(id))) {
    return <div className="card"><h1>Lien expiré</h1><p>Utilisez le lien de désinscription du dernier email reçu.</p></div>;
  }
  return (
    <div className="card">
      <h1>Se désinscrire</h1>
      <p>Tu ne recevras plus aucune alerte DataParl&apos;.</p>
      <form action={valider}>
        <input type="hidden" name="id" value={id} />
        <button type="submit">Confirmer la désinscription</button>
      </form>
    </div>
  );
}
