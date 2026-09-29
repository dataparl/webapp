import "server-only";
import { createClient, type User } from "@supabase/supabase-js";
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";

// Identifie l'utilisateur d'un appel d'API à partir de son jeton Supabase
// (en-tête Authorization: Bearer <access_token>).
export async function utilisateur(req: Request): Promise<User | null> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || token.startsWith("dp_")) return null; // une clé API n'est pas une session
  const anon = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return data.user;
}

export function fournisseurs(user: User): string[] {
  const ids = (user.identities ?? []).map((i) => i.provider);
  const meta = (user.app_metadata?.providers as string[] | undefined) ?? [];
  return Array.from(new Set([...ids, ...meta]));
}
