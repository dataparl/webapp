"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AUTH_SUPABASE_KEY, AUTH_SUPABASE_URL } from "./env";

// Client navigateur de dataparl-auth (clé publique). Flux PKCE : la session
// reste dans le localStorage de l'origine qui a lancé la connexion.
let client: SupabaseClient | null = null;

export function authBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(AUTH_SUPABASE_URL, AUTH_SUPABASE_KEY, {
      auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true },
    });
  }
  return client;
}
