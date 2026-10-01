import { NextResponse } from "next/server";
import { z } from "zod";
import { audit, checkAdmin, identifierAdmin, refus } from "@/lib/adminAuth";
import { avecAdmin, corps, EQUIPE, erreur } from "@/lib/adminRoute";
import { changerAdresse } from "@/lib/equipe";
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

// Profil affiché dans la signature et comme nom d'expéditeur.
export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const { data } = await authAdmin().from("staff").select("nom, prenom, nom_famille, poste, email, role").eq("user_id", a.userId).maybeSingle();
    if (!data) return erreur(404, "profil introuvable");
    return { profil: data };
  }, EQUIPE);
}

const Champ = z.string().trim().max(80);
const Profil = z.object({
  prenom: Champ.max(60), nom_famille: Champ.max(60), nom: Champ.min(2), poste: Champ,
  email: z.string().trim().max(120).optional(), // administrateurs seulement
});

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Profil.safeParse(await corps(req));
    if (!p.success) return erreur(400, "vérifie les champs (nom affiché : 2 caractères au moins)");
    const { email, ...champs } = p.data;
    const db = authAdmin();
    let adresse = a.email;
    if (email && email.toLowerCase() !== a.email.toLowerCase()) {
      if (a.role !== "admin") return erreur(403, "seuls les administrateurs changent d'adresse");
      const r = await changerAdresse(a.userId, email);
      if (!r.ok) return erreur(r.statut, r.erreur);
      adresse = r.email;
      await audit(a, "moi.adresse", r.email, { avant: a.email });
    }
    await db.from("staff").update(champs).eq("user_id", a.userId);
    await audit(a, "moi.profil");
    return { ok: true, profil: { ...champs, email: adresse, role: a.role } };
  }, EQUIPE);
}
