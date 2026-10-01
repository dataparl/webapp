import { NextResponse } from "next/server";
import { z } from "zod";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, EQUIPE, erreur } from "@/lib/adminRoute";
import { contexte, effacerDefi, enregistrer, lireDefi, optionsEnregistrement, poserDefi } from "@/lib/passkeys";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Mes clés d'accès (Touch ID, Face ID, empreinte) : liste, ajout, retrait.
export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const { data } = await authAdmin().from("passkeys").select("id, nom, cree_le, utilisee_le").eq("user_id", a.userId).order("cree_le");
    return { cles: data ?? [], disponible: !!contexte(req) };
  }, EQUIPE);
}

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("options") }),
  z.object({ action: z.literal("enregistrer"), nom: z.string().trim().max(60).default(""), reponse: z.record(z.string(), z.unknown()) }),
]);

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const ctx = contexte(req);
    if (!ctx) return erreur(400, "les clés d'accès s'enregistrent depuis admin.dataparl.fr ou webmail.dataparl.fr");
    const p = Action.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    if (p.data.action === "options") {
      const options = await optionsEnregistrement(ctx.rpID, a);
      const res = NextResponse.json({ options });
      poserDefi(res, options.challenge, a.userId);
      return res;
    }
    const defi = lireDefi(req, a.userId);
    if (!defi) return erreur(400, "demande expirée, recommence");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ok = await enregistrer(ctx, a.userId, defi, p.data.reponse as any, p.data.nom || "Clé d'accès");
    if (!ok) return erreur(400, "cette clé n'a pas pu être enregistrée");
    await audit(a, "passkey.ajout", p.data.nom);
    const res = NextResponse.json({ ok: true });
    effacerDefi(res);
    return res;
  }, EQUIPE);
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const id = new URL(req.url).searchParams.get("id") ?? "";
    if (!z.string().uuid().safeParse(id).success) return erreur(400, "requête invalide");
    await authAdmin().from("passkeys").delete().eq("id", id).eq("user_id", a.userId);
    await audit(a, "passkey.retrait", id);
    return { ok: true };
  }, EQUIPE);
}
