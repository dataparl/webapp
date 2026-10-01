import "server-only";
import { adresseValide } from "./motDePasse";
import { authAdmin } from "./supabaseAdmin";

// Nouvelle adresse @dataparl.fr (ou sous-domaine) : compte de connexion et équipe.
export async function changerAdresse(userId: string, saisie: string): Promise<{ ok: true; email: string } | { ok: false; statut: number; erreur: string }> {
  const email = adresseValide(saisie);
  if (!email) return { ok: false, statut: 400, erreur: "adresse invalide : x@dataparl.fr ou x@sous-domaine.dataparl.fr" };
  const db = authAdmin();
  const { data: prise } = await db.from("staff").select("user_id").eq("email", email).maybeSingle();
  if (prise && prise.user_id !== userId) return { ok: false, statut: 409, erreur: "cette adresse est déjà attribuée" };
  const { error } = await db.auth.admin.updateUserById(userId, { email, email_confirm: true });
  if (error) return { ok: false, statut: 409, erreur: error.message.includes("already") ? "un compte existe déjà avec cette adresse" : "changement refusé" };
  await db.from("staff").update({ email }).eq("user_id", userId);
  return { ok: true, email };
}
