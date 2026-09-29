// Variables d'environnement. Les valeurs publiques ont un défaut (ce sont
// des identifiants publics) ; les secrets n'en ont jamais.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.cavaparlement.eu").replace(/\/$/, "");

export const DATA_SUPABASE_URL = process.env.NEXT_PUBLIC_DATA_SUPABASE_URL ?? "https://yuhqajaznizwmenmyzms.supabase.co";
export const DATA_SUPABASE_KEY = process.env.NEXT_PUBLIC_DATA_SUPABASE_KEY ?? "sb_publishable_fxIEX7DcA41ygzG27omGkQ_efe3s7pR";

export const AUTH_SUPABASE_URL = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL ?? "https://kuywydrsfuixppchugpe.supabase.co";
export const AUTH_SUPABASE_KEY = process.env.NEXT_PUBLIC_AUTH_SUPABASE_KEY ?? "sb_publishable_oYCbgl4J2fz9RnwOmsEz9w_DMVp-rZ6";

export const MAIL_FROM = process.env.MAIL_FROM ?? "CavaParlement <noreply@mail.cavaparlement.eu>";
export const PRIVACY_VERSION = process.env.PRIVACY_VERSION ?? "2026-09";

export function secret(name: "AUTH_SUPABASE_SERVICE_ROLE_KEY" | "RESEND_API_KEY" | "CONSENT_SALT"): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}
