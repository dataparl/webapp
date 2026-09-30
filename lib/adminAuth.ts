import "server-only";
import { NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import { domaineCookie as domaineDeHote } from "./domaine";
import { chiffrer, dechiffrer, signerJeton, verifierJeton } from "./crypto";
import { ADMIN_GITHUB_LOGINS, secret } from "./env";
import { authAdmin } from "./supabaseAdmin";
import { fournisseurs, utilisateur } from "./userAuth";

// Accès à l'administration et à la webmail : trois verrous.
//   1. session DataParl' Auth ouverte avec GitHub ;
//   2. compte présent dans admin_users (ou login GitHub listé dans
//      ADMIN_GITHUB_LOGINS, ajouté alors à admin_users à la première visite) ;
//   3. second facteur TOTP : un code valide ouvre 15 minutes d'accès, portées
//      par un cookie HttpOnly signé (HMAC), lié au compte.
// Le cookie seul ne suffit pas : chaque appel doit aussi porter le jeton de
// session en en-tête Authorization, ce qui écarte les requêtes intersites.

export const COOKIE_OTP = "dp-admin-otp";
const DUREE_OTP_S = 15 * 60;
const MAX_ECHECS = 5;

export type Admin = { userId: string; github: string };
export type Refus = { ok: false; status: 401 | 403; otp?: "a_enroler" | "requis" };
export type AdminCheck = ({ ok: true } & Admin) | Refus;

function loginGithub(user: { identities?: { provider: string; identity_data?: Record<string, unknown> }[] }): string | null {
  const id = (user.identities ?? []).find((i) => i.provider === "github");
  const login = id?.identity_data?.user_name ?? id?.identity_data?.preferred_username;
  return typeof login === "string" ? login : null;
}

// Verrous 1 et 2.
export async function identifierAdmin(req: Request): Promise<({ ok: true } & Admin) | Refus> {
  const user = await utilisateur(req);
  if (!user) return { ok: false, status: 401 };
  if (!fournisseurs(user).includes("github")) return { ok: false, status: 403 };
  const db = authAdmin();
  const { data: row } = await db.from("admin_users").select("github_login").eq("user_id", user.id).maybeSingle();
  if (row) return { ok: true, userId: user.id, github: row.github_login as string };
  const login = loginGithub(user);
  if (login && ADMIN_GITHUB_LOGINS.includes(login.toLowerCase())) {
    await db.from("admin_users").upsert({ user_id: user.id, github_login: login });
    await audit({ userId: user.id, github: login }, "admin.ajout_auto", login);
    return { ok: true, userId: user.id, github: login };
  }
  return { ok: false, status: 403 };
}

function lireCookie(req: Request, nom: string): string | null {
  const c = req.headers.get("cookie") ?? "";
  for (const part of c.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === nom) return decodeURIComponent(v.join("="));
  }
  return null;
}

// Les trois verrous. À appeler en tête de chaque route d'admin ou de webmail.
export async function checkAdmin(req: Request): Promise<AdminCheck> {
  const a = await identifierAdmin(req);
  if (!a.ok) return a;
  if (!verifierJeton(lireCookie(req, COOKIE_OTP), a.userId, secret("ADMIN_OTP_SECRET"))) {
    const { data } = await authAdmin().from("admin_totp_secrets").select("active").eq("user_id", a.userId).maybeSingle();
    return { ok: false, status: 401, otp: data?.active ? "requis" : "a_enroler" };
  }
  return a;
}

export function refus(r: Refus): NextResponse {
  return NextResponse.json({ error: r.status === 401 ? "non connecté" : "accès refusé", otp: r.otp ?? null }, { status: r.status, headers: { "Cache-Control": "no-store" } });
}

// --- TOTP -------------------------------------------------------------------

function totp(base32: string, label: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({ issuer: "DataParl' Admin", label, algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(base32) });
}

// Crée (ou remplace, tant qu'il n'est pas activé) le secret TOTP d'un admin.
export async function enroler(a: Admin): Promise<{ uri: string; secret: string } | null> {
  const db = authAdmin();
  const { data } = await db.from("admin_totp_secrets").select("active").eq("user_id", a.userId).maybeSingle();
  if (data?.active) return null;
  const s = new OTPAuth.Secret({ size: 20 }).base32;
  await db.from("admin_totp_secrets").upsert({
    user_id: a.userId, secret_enc: chiffrer(s, secret("ADMIN_VAULT_KEY")), active: false, dernier_pas: null, created_at: new Date().toISOString(),
  });
  await audit(a, "totp.enrolement");
  return { uri: totp(s, a.github).toString(), secret: s };
}

export async function tropDEchecs(userId: string): Promise<boolean> {
  const depuis = new Date(Date.now() - 15 * 60_000).toISOString();
  const { count } = await authAdmin().from("admin_otp_attempts").select("id", { count: "exact", head: true })
    .eq("user_id", userId).eq("succes", false).gte("created_at", depuis);
  return (count ?? 0) >= MAX_ECHECS;
}

// Vérifie un code ; active le secret à la première réussite. Un même code
// (même pas de 30 s) ne peut pas servir deux fois.
export async function verifierCode(a: Admin, code: string): Promise<boolean> {
  const db = authAdmin();
  const { data } = await db.from("admin_totp_secrets").select("secret_enc, active, dernier_pas").eq("user_id", a.userId).maybeSingle();
  let ok = false;
  if (data && /^\d{6}$/.test(code)) {
    const t = totp(dechiffrer(data.secret_enc as string, secret("ADMIN_VAULT_KEY")), a.github);
    const delta = t.validate({ token: code, window: 1 });
    if (delta !== null) {
      const pas = t.counter() + delta;
      if (data.dernier_pas === null || pas > Number(data.dernier_pas)) {
        ok = true;
        await db.from("admin_totp_secrets").update({ active: true, dernier_pas: pas, last_used_at: new Date().toISOString() }).eq("user_id", a.userId);
        if (!data.active) await audit(a, "totp.active");
      }
    }
  }
  await db.from("admin_otp_attempts").insert({ user_id: a.userId, succes: ok });
  await audit(a, ok ? "otp.succes" : "otp.echec");
  return ok;
}

function domaineCookie(req: Request): string {
  return domaineDeHote(req.headers.get("host") ?? "");
}

export function poserCookieOtp(res: NextResponse, req: Request, userId: string): void {
  const secure = new URL(req.url).protocol === "https:" || domaineCookie(req) ? "; Secure" : "";
  res.headers.append("Set-Cookie",
    `${COOKIE_OTP}=${encodeURIComponent(signerJeton(userId, secret("ADMIN_OTP_SECRET"), DUREE_OTP_S))}; Path=/api; Max-Age=${DUREE_OTP_S}; HttpOnly; SameSite=Strict${secure}${domaineCookie(req)}`);
}

export function effacerCookieOtp(res: NextResponse, req: Request): void {
  res.headers.append("Set-Cookie", `${COOKIE_OTP}=; Path=/api; Max-Age=0; HttpOnly; SameSite=Strict${domaineCookie(req)}`);
}

// --- Journal ----------------------------------------------------------------

export async function audit(a: Admin, action: string, cible?: string, details: Record<string, unknown> = {}): Promise<void> {
  await authAdmin().from("admin_audit").insert({ user_id: a.userId, github_login: a.github, action, cible: cible ?? null, details });
}
