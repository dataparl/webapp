"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookieStorage } from "./cookieStorage";
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";

// Client navigateur de dataparl-auth (clé publique). La session est stockée
// dans des cookies du domaine .cavaparlement.eu : partagée entre www, api et
// admin (voir cookieStorage).
let client: SupabaseClient | null = null;

export function authBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY, {
      auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true, storage: cookieStorage, storageKey: "dp-auth" },
    });
  }
  return client;
}
