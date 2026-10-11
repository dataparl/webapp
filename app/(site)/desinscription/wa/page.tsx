import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desinscrireWa } from "@/lib/wa";

// Désinscription un clic du Daily WhatsApp, ouverte depuis le lien fourni
// à l’inscription (et rappelé dans les messages). Même principe que la
// désinscription des alertes email : confirmation explicite demandée,
// car un clic accidentel ne doit pas tout arrêter.
export const metadata: Metadata = { title: "Désinscription WhatsApp", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

async function valider(formData: FormData) {
  "use server";
  const ok = await desinscrireWa(String(formData.get("jeton") ?? ""));
  redirect(ok ? "/desinscription/wa?etat=ok" : "/desinscription/wa?etat=invalide");
}

export default async function DesinscriptionWa({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { jeton, etat } = await searchParams;
  if (etat === "ok") {
    return (
      <div className="card">
        <h1>Désinscription confirmée</h1>
        <p>C’est noté : tu ne recevras plus le DataParl’ Daily par WhatsApp.</p>
      </div>
    );
  }
  if (etat === "invalide" || !jeton) {
    return (
      <div className="card">
        <h1>Lien expiré</h1>
        <p>Utilise le lien de désinscription fourni à ton inscription ou réponds « STOP » à un message du Daily.</p>
      </div>
    );
  }
  return (
    <div className="card">
      <h1>Se désinscrire du Daily WhatsApp</h1>
      <p>Tu ne recevras plus aucun message du DataParl’ Daily sur WhatsApp.</p>
      <form action={valider}>
        <input type="hidden" name="jeton" value={jeton} />
        <button type="submit">Confirmer la désinscription</button>
      </form>
    </div>
  );
}
