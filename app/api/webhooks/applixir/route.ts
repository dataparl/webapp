import { NextResponse } from "next/server";
import { demandeDe, enregistrerDeblocage, journaliserRappel, pubActive } from "@/lib/deblocage";
import { APPLIXIR_API_KEY, secret } from "@/lib/env";
import { jetonValide, rappelValide } from "@/lib/pub";

export const dynamic = "force-dynamic";

// Rappel serveur d'AppLixir (GET), émis quand une vidéo récompensée a été vue
// jusqu'au bout. Mode « MD5 et TID » à choisir dans le tableau de bord AppLixir.
export async function GET(req: Request) {
  if (!pubActive()) return new NextResponse("désactivé", { status: 404 });
  const q = new URL(req.url).searchParams;
  const r = {
    gameApiKey: q.get("gameApiKey") ?? "", gameId: q.get("gameId") ?? "", userId: q.get("userId") ?? "",
    tid: q.get("tid") ?? "", signature: q.get("signature") ?? "",
  };
  if (!rappelValide(r, APPLIXIR_API_KEY, secret("APPLIXIR_SECRET"))) {
    await journaliserRappel(false, "signature", r.userId, r.tid);
    return new NextResponse("signature invalide", { status: 400 });
  }
  const u = jetonValide(r.userId) ? await demandeDe(r.userId) : null;
  if (!u) {
    await journaliserRappel(false, "utilisateur", r.userId, r.tid);
    return new NextResponse("utilisateur invalide", { status: 400 });
  }
  const etat = await enregistrerDeblocage(u.userId, u.collabId, r.tid);
  await journaliserRappel(true, etat, r.userId, r.tid);
  return new NextResponse("ok", { status: 200 });
}
