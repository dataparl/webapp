import "server-only";
import { authAdmin } from "./supabaseAdmin";
import { fournisseurs, utilisateur } from "./userAuth";

// Vérifie qu'un appel d'API admin vient d'un admin : session valide, compte
// relié à GitHub, et présence dans admin_users. (Le second facteur TOTP
// viendra avec le webmail, phase 2.)

export type AdminCheck = { ok: true; userId: string; github: string } | { ok: false; status: 401 | 403 };

export async function checkAdmin(req: Request): Promise<AdminCheck> {
  const user = await utilisateur(req);
  if (!user) return { ok: false, status: 401 };
  if (!fournisseurs(user).includes("github")) return { ok: false, status: 403 };
  const { data: row } = await authAdmin().from("admin_users").select("github_login").eq("user_id", user.id).maybeSingle();
  if (!row) return { ok: false, status: 403 };
  return { ok: true, userId: user.id, github: row.github_login as string };
}
