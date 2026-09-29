// Variables d'environnement. Les valeurs publiques ont un défaut (ce sont
// des identifiants publics) ; les secrets n'en ont jamais.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.cavaparlement.eu").replace(/\/$/, "");

export const DATA_SUPABASE_URL = process.env.NEXT_PUBLIC_DATA_SUPABASE_URL ?? "https://yuhqajaznizwmenmyzms.supabase.co";
export const DATA_SUPABASE_KEY = process.env.NEXT_PUBLIC_DATA_SUPABASE_KEY ?? "sb_publishable_fxIEX7DcA41ygzG27omGkQ_efe3s7pR";

export const AUTH_SUPABASE_URL = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL ?? "https://kuywydrsfuixppchugpe.supabase.co";
export const AUTH_SUPABASE_KEY = process.env.NEXT_PUBLIC_AUTH_SUPABASE_KEY ?? "sb_publishable_oYCbgl4J2fz9RnwOmsEz9w_DMVp-rZ6";

export const MAIL_FROM = process.env.MAIL_FROM ?? "\"DataParl'\" <noreply@mail.cavaparlement.eu>";
// Boîte qui reçoit les messages du formulaire de contact (jamais affichée sur le site).
export const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "hello@cavaparlement.eu";
export const PRIVACY_VERSION = process.env.PRIVACY_VERSION ?? "2026-09";

// Comptes GitHub autorisés à administrer (séparés par des virgules). Ils sont
// ajoutés à admin_users à leur première connexion.
export const ADMIN_GITHUB_LOGINS = (process.env.ADMIN_GITHUB_LOGINS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

// Adresses d'expédition autorisées depuis la webmail. hello@cavaparlement.eu
// (boîte Infomaniak) passe par le domaine d'envoi cavaparlement.eu de Resend ;
// sa copie des emails reçus est transférée vers hello@mail.cavaparlement.eu.
export const EXPEDITEURS = ["hello@cavaparlement.eu", "hello@mail.cavaparlement.eu", "presse@mail.cavaparlement.eu", "rgpd@mail.cavaparlement.eu", "noreply@mail.cavaparlement.eu"];

type Secret =
  | "AUTH_SUPABASE_SERVICE_ROLE_KEY" | "RESEND_API_KEY" | "CONSENT_SALT"
  | "ADMIN_VAULT_KEY" | "ADMIN_OTP_SECRET" | "RESEND_WEBHOOK_SECRET";

export function secret(name: Secret): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}
