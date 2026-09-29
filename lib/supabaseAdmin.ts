import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AUTH_SUPABASE_URL, secret } from "./env";

// Client service_role de dataparl-auth : uniquement côté serveur.
let admin: SupabaseClient | null = null;

export function authAdmin(): SupabaseClient {
  if (!admin) {
    admin = createClient(AUTH_SUPABASE_URL, secret("AUTH_SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return admin;
}
