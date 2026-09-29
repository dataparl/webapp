import "server-only";
import { createClient } from "@supabase/supabase-js";
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";
import { authAdmin } from "./supabaseAdmin";

// Vérifie qu'un appel d'API admin vient d'un admin : jeton Supabase valide,
// connexion via GitHub, et présence dans admin_users. (Le second facteur TOTP
// viendra avec le webmail, phase 2.)

export type AdminCheck = { ok: true; userId: string; github: string } | { ok: false; status: 401 | 403 };

export async function checkAdmin(req: Request): Promise<AdminCheck> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, status: 401 };
  const anon = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return { ok: false, status: 401 };
  const providers = (data.user.app_metadata?.providers as string[] | undefined) ?? [data.user.app_metadata?.provider as string];
  if (!providers.includes("github")) return { ok: false, status: 403 };
  const { data: row } = await authAdmin().from("admin_users").select("github_login").eq("user_id", data.user.id).maybeSingle();
  if (!row) return { ok: false, status: 403 };
  return { ok: true, userId: data.user.id, github: row.github_login as string };
}
