import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, checkAdmin, identifierAdmin, refus } from "@/lib/adminAuth";
import { corps, erreur } from "@/lib/adminRoute";
import { motDePasseValide } from "@/lib/motDePasse";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const Changement = z.object({ mot_de_passe: z.string().max(128) });

// Changement de son propre mot de passe. À la première connexion (mot de passe
// provisoire), la session suffit ; ensuite, le second facteur est exigé.
export async function POST(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  if (!id.doitChangerMdp) {
    const c = await checkAdmin(req);
    if (!c.ok) return refus(c);
  }
  const p = Changement.safeParse(await corps(req));
  if (!p.success) return erreur(400, "requête invalide");
  const invalide = motDePasseValide(p.data.mot_de_passe);
  if (invalide) return erreur(400, `mot de passe : ${invalide}`);
  const db = authAdmin();
  const { error } = await db.auth.admin.updateUserById(id.userId, { password: p.data.mot_de_passe });
  if (error) return erreur(400, "mot de passe refusé (trop courant ou trop simple ?)");
  await db.from("staff").update({ doit_changer_mdp: false }).eq("user_id", id.userId);
  await audit(id, "moi.mot_de_passe");
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
