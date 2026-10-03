import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AUTH_SUPABASE_URL, DATA_SUPABASE_URL, secret } from "./env";

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

// Client service_role de la base de données `dataparl` (élus, mandats…) :
// écriture des tables éditées à la main depuis l'admin (bios, mandats_manuels,
// fonctions_manuelles). Uniquement côté serveur.
let data: SupabaseClient | null = null;

export function dataAdmin(): SupabaseClient {
  if (!data) {
    data = createClient(DATA_SUPABASE_URL, secret("DATA_SUPABASE_SERVICE_ROLE_KEY"), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return data;
}
