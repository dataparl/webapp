import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { MAIL_FROM, MAIL_WEB_URL, secret } from "./env";
import { gabarit } from "./gabarit";
import { authAdmin } from "./supabaseAdmin";

export { esc, texteVersHtml } from "./gabarit";

// Point d'envoi unique (API Resend en fetch brut). Chaque email :
//   - est habillé du gabarit DataParl' ;
//   - a une version en ligne (mail.dataparl.fr/lire/<jeton>, seul le
//     hash du jeton est stocké) ;
//   - est rangé dans la table emails (visible dans la webmail).

export type TypeEnvoi = "transactionnel" | "webmail" | "auto" | "alerte";

export type Message = {
  from?: string; // adresse nue ; défaut : MAIL_FROM
  nomExpediteur?: string; // nom affiché ; défaut : DataParl'
  to: string[];
  cc?: string[];
  subject: string;
  titre?: string; // titre dans la carte ; défaut : l'objet
  corpsHtml: string;
  text: string;
  pied?: string;
  replyTo?: string;
  unsubscribeUrl?: string; // communication opt-in : désinscription en un clic (RFC 8058)
  inReplyTo?: string | null;
  references?: string | null;
  headers?: Record<string, string>;
  type: TypeEnvoi;
};

export type Resultat = { ok: true; resendId: string } | { ok: false; error: string };

export const hashJeton = (t: string) => createHash("sha256").update(t).digest("hex");

export async function expedier(m: Message): Promise<Resultat> {
  const jeton = randomBytes(20).toString("hex");
  const lireUrl = `${MAIL_WEB_URL}/lire/${jeton}`;
  const html = gabarit({ titre: m.titre ?? m.subject, corpsHtml: m.corpsHtml, lireUrl, pied: m.pied });
  const text = `${m.text}\n\n--\nDataParl' · version en ligne : ${lireUrl}`;
  const nom = (m.nomExpediteur ?? "DataParl'").replace(/["<>\r\n]/g, "").trim() || "DataParl'";
  const from = m.from ? `"${nom}" <${m.from}>` : MAIL_FROM;

  const headers: Record<string, string> = { ...(m.headers ?? {}) };
  if (m.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${m.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  if (m.inReplyTo) {
    headers["In-Reply-To"] = m.inReplyTo;
    headers["References"] = [m.references, m.inReplyTo].filter(Boolean).join(" ");
  }

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: m.to, cc: m.cc?.length ? m.cc : undefined, subject: m.subject, html, text, headers,
      ...(m.replyTo ? { reply_to: m.replyTo } : {}),
    }),
  });
  if (!r.ok) {
    const detail = await r.text();
    console.error("Resend", r.status, detail);
    let msg = "";
    try { msg = (JSON.parse(detail) as { message?: string }).message ?? ""; } catch { /* corps non JSON */ }
    return { ok: false, error: `envoi refusé par Resend${msg ? ` : ${msg}` : ""}` };
  }
  const resendId = ((await r.json()) as { id: string }).id;
  const { error } = await authAdmin().from("emails").insert({
    direction: "out", communication_type: m.type, from_addr: m.from ?? MAIL_FROM, to_addr: m.to.join(", "),
    cc_addr: m.cc?.length ? m.cc.join(", ") : null, reply_to: m.replyTo ?? null,
    subject: m.subject, body_text: m.text, body_html: html, in_reply_to: m.inReplyTo ?? null,
    resend_id: resendId, web_token_hash: hashJeton(jeton), folder: "sent", read: true, source: "resend",
  });
  if (error) console.error("emails insert", error);
  return { ok: true, resendId };
}

export function bouton(url: string, libelle: string): string {
  const e = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  return `<p style="margin:24px 0"><a href="${e(url)}" style="display:inline-block;background:#F0444F;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">${e(libelle)}</a></p>`;
}

export function piedObligatoire(): string {
  return "Message envoyé par DataParl' suite à une action faite avec ton adresse. Si ce n'est pas toi, ignore-le : rien ne sera enregistré.";
}

export function piedOptIn(prefsUrl: string, unsubUrl: string): string {
  return `Tu reçois ce message parce que tu es abonné(e) aux alertes DataParl'. <a href="${prefsUrl}" style="color:#4A5670">Régler mes préférences</a> · <a href="${unsubUrl}" style="color:#4A5670">Me désinscrire</a>`;
}
