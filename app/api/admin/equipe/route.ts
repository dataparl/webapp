import { z } from "zod";
import { audit, ROLES } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur } from "@/lib/adminRoute";
import { adresseEquipe, genererMotDePasse, motDePasseValide } from "@/lib/motDePasse";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Comptes de l'équipe : liste, création, rôle, suspension, réinitialisations.
// Réservé aux administrateurs.

export async function GET(req: Request) {
  return avecAdmin(req, async (a) => {
    const db = authAdmin();
    const [{ data: staff }, { data: totp }] = await Promise.all([
      db.from("staff").select("user_id, nom, email, role, actif, doit_changer_mdp, cree_le").order("cree_le"),
      db.from("admin_totp_secrets").select("user_id, active, last_used_at"),
    ]);
    const t = new Map((totp ?? []).map((x) => [x.user_id, x]));
    return {
      moi: a.userId,
      comptes: (staff ?? []).map((s) => ({ ...s, totp_actif: !!t.get(s.user_id)?.active, derniere_connexion: t.get(s.user_id)?.last_used_at ?? null })),
    };
  });
}

const Creation = z.object({
  nom: z.string().trim().min(2).max(80),
  identifiant: z.string().trim().min(1).max(42),
  sous_domaine: z.string().trim().max(32).optional(),
  role: z.enum(ROLES as [string, ...string[]]),
  mot_de_passe: z.string().max(128).optional(),
});

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Creation.safeParse(await corps(req));
    if (!p.success) return erreur(400, "vérifie le nom, l'identifiant et le rôle");
    const email = adresseEquipe(p.data.identifiant, p.data.sous_domaine);
    if (!email) return erreur(400, "identifiant ou sous-domaine invalide (lettres, chiffres, point, tiret)");
    const motDePasse = p.data.mot_de_passe || genererMotDePasse();
    const invalide = motDePasseValide(motDePasse);
    if (invalide) return erreur(400, `mot de passe : ${invalide}`);
    const db = authAdmin();
    const { data: existe } = await db.from("staff").select("user_id").eq("email", email).maybeSingle();
    if (existe) return erreur(409, "cette adresse est déjà attribuée");
    const { data, error } = await db.auth.admin.createUser({ email, password: motDePasse, email_confirm: true, user_metadata: { nom: p.data.nom } });
    if (error || !data.user) return erreur(409, error?.message?.includes("already") ? "un compte DataParl' Auth existe déjà avec cette adresse" : "création impossible");
    const { error: e2 } = await db.from("staff").insert({
      user_id: data.user.id, nom: p.data.nom, email, role: p.data.role, doit_changer_mdp: true, cree_par: a.userId,
    });
    if (e2) { await db.auth.admin.deleteUser(data.user.id); throw e2; }
    await audit(a, "equipe.creation", email, { role: p.data.role });
    // Le mot de passe n'est renvoyé qu'ici, une seule fois ; il n'est jamais stocké en clair.
    return { ok: true, compte: { user_id: data.user.id, nom: p.data.nom, email, role: p.data.role }, mot_de_passe: motDePasse };
  });
}

const Action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("role"), user_id: z.string().uuid(), role: z.enum(ROLES as [string, ...string[]]) }),
  z.object({ action: z.literal("suspendre"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("reactiver"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("nouveau_mdp"), user_id: z.string().uuid() }),
  z.object({ action: z.literal("reinit_totp"), user_id: z.string().uuid() }),
]);

export async function PATCH(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Action.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    const d = p.data;
    if (d.user_id === a.userId) return erreur(400, "impossible sur ton propre compte");
    const db = authAdmin();
    const { data: cible } = await db.from("staff").select("email").eq("user_id", d.user_id).maybeSingle();
    if (!cible) return erreur(404, "compte introuvable");
    let retour: Record<string, unknown> = { ok: true };
    if (d.action === "role") {
      await db.from("staff").update({ role: d.role }).eq("user_id", d.user_id);
    } else if (d.action === "suspendre" || d.action === "reactiver") {
      const actif = d.action === "reactiver";
      await db.from("staff").update({ actif }).eq("user_id", d.user_id);
      // Bannir côté Supabase coupe aussi la session en cours au prochain rafraîchissement.
      await db.auth.admin.updateUserById(d.user_id, { ban_duration: actif ? "none" : "876000h" });
    } else if (d.action === "nouveau_mdp") {
      const motDePasse = genererMotDePasse();
      await db.auth.admin.updateUserById(d.user_id, { password: motDePasse });
      await db.from("staff").update({ doit_changer_mdp: true }).eq("user_id", d.user_id);
      retour = { ok: true, mot_de_passe: motDePasse };
    } else {
      await db.from("admin_totp_secrets").delete().eq("user_id", d.user_id);
    }
    await audit(a, `equipe.${d.action}`, cible.email as string, d.action === "role" ? { role: d.role } : {});
    return retour;
  });
}
