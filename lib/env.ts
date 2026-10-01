// Variables d'environnement. Les valeurs publiques ont un défaut (ce sont
// des identifiants publics) ; les secrets n'en ont jamais.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.dataparl.fr").replace(/\/$/, "");

export const DATA_SUPABASE_URL = process.env.NEXT_PUBLIC_DATA_SUPABASE_URL ?? "https://yuhqajaznizwmenmyzms.supabase.co";
export const DATA_SUPABASE_KEY = process.env.NEXT_PUBLIC_DATA_SUPABASE_KEY ?? "sb_publishable_fxIEX7DcA41ygzG27omGkQ_efe3s7pR";

export const AUTH_SUPABASE_URL = process.env.NEXT_PUBLIC_AUTH_SUPABASE_URL ?? "https://kuywydrsfuixppchugpe.supabase.co";
export const AUTH_SUPABASE_KEY = process.env.NEXT_PUBLIC_AUTH_SUPABASE_KEY ?? "sb_publishable_oYCbgl4J2fz9RnwOmsEz9w_DMVp-rZ6";

export const MAIL_FROM = process.env.MAIL_FROM ?? "\"DataParl'\" <noreply@dataparl.fr>";
// Boîte qui reçoit les messages du formulaire de contact (jamais affichée sur le site).
// Copie facultative des messages de contact vers une boîte externe (vide = aucune ;
// les messages arrivent de toute façon dans la webmail).
export const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "";

// Hôte des versions en ligne des emails (/lire/<jeton>).
export const MAIL_WEB_URL = (process.env.MAIL_WEB_URL ?? "https://mail.dataparl.fr").replace(/\/$/, "");
export const PRIVACY_VERSION = process.env.PRIVACY_VERSION ?? "2026-09";

// Comptes GitHub autorisés à administrer (séparés par des virgules). Ils sont
// ajoutés à admin_users à leur première connexion.
export const ADMIN_GITHUB_LOGINS = (process.env.ADMIN_GITHUB_LOGINS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);

// Adresses d'expédition autorisées depuis la webmail (domaine dataparl.fr,
// envoi et réception chez Resend). La dernière sert seulement à répondre aux
// anciens échanges, le temps de la transition.
export const EXPEDITEURS = ["hello@dataparl.fr", "contact@dataparl.fr", "presse@dataparl.fr", "rgpd@dataparl.fr", "support@dataparl.fr", "it@dataparl.fr", "noreply@dataparl.fr",
  "hello@mail.cavaparlement.eu"];

// Publicité vidéo récompensée (AppLixir) : active seulement si la clé publique
// et le secret de rappel serveur sont configurés.
export const APPLIXIR_API_KEY = process.env.NEXT_PUBLIC_APPLIXIR_API_KEY ?? "";
export const APPLIXIR_SDK = "https://cdn.applixir.com/applixir.app.v6.1.0.js";
export const DUREE_DEBLOCAGE_H = 24;

type Secret =
  | "AUTH_SUPABASE_SERVICE_ROLE_KEY" | "RESEND_API_KEY" | "CONSENT_SALT"
  | "ADMIN_VAULT_KEY" | "ADMIN_OTP_SECRET" | "RESEND_WEBHOOK_SECRET" | "APPLIXIR_SECRET" | "CRON_SECRET";

export function secret(name: Secret): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

// Base des liens tracés. www.dataparl.fr/l fonctionne d'emblée ; passer à
// https://link.dataparl.fr une fois ce sous-domaine ajouté au projet Vercel.
export const LIENS_BASE = (process.env.NEXT_PUBLIC_LIENS_BASE ?? "https://www.dataparl.fr/l").replace(/\/$/, "");
