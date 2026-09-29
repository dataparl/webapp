import "server-only";
import { audit, type Admin } from "./adminAuth";
import { EXPEDITEURS, secret } from "./env";
import { authAdmin } from "./supabaseAdmin";

// Webmail : envoi via Resend depuis les adresses @mail.cavaparlement.eu,
// réception par le webhook Resend (email.received), tout est rangé dans la
// table emails de dataparl-auth.

const RESEND = "https://api.resend.com";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function texteVersHtml(t: string): string {
  const lignes = esc(t).split("\n").map((l) => (l.startsWith("&gt;") ? `<span style="color:#4A5670">${l}</span>` : l));
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#071A41">${lignes.join("<br>")}</div>`;
}

export type Brouillon = {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  inReplyTo?: string | null;
  references?: string | null;
};

export async function envoyerDepuisWebmail(a: Admin, b: Brouillon): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from = b.from.toLowerCase();
  if (!EXPEDITEURS.includes(from)) return { ok: false, error: "adresse d'expédition non autorisée" };
  const headers: Record<string, string> = {};
  if (b.inReplyTo) {
    headers["In-Reply-To"] = b.inReplyTo;
    headers["References"] = [b.references, b.inReplyTo].filter(Boolean).join(" ");
  }
  const html = texteVersHtml(b.text);
  const r = await fetch(`${RESEND}/emails`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `DataParl' <${from}>`, to: b.to, cc: b.cc?.length ? b.cc : undefined, subject: b.subject, text: b.text, html, headers }),
  });
  if (!r.ok) {
    const detail = await r.text();
    console.error("Resend webmail", r.status, detail);
    let msg = "";
    try { msg = (JSON.parse(detail) as { message?: string }).message ?? ""; } catch { /* corps non JSON */ }
    return { ok: false, error: `envoi refusé par Resend${msg ? ` : ${msg}` : ""}` };
  }
  const id = ((await r.json()) as { id: string }).id;
  const { error } = await authAdmin().from("emails").insert({
    direction: "out", communication_type: "webmail", from_addr: from, to_addr: b.to.join(", "), cc_addr: b.cc?.join(", ") || null,
    subject: b.subject, body_text: b.text, body_html: html, in_reply_to: b.inReplyTo ?? null, resend_id: id,
    folder: "sent", read: true, source: "resend",
  });
  if (error) console.error("emails insert", error);
  await audit(a, "webmail.envoi", id, { to: b.to, subject: b.subject });
  return { ok: true, id };
}

type Recu = {
  id: string; from: string; to: string[]; cc?: string[] | null; reply_to?: string[] | null; subject: string;
  html?: string | null; text?: string | null; message_id?: string | null; created_at: string;
  headers?: Record<string, string> | null;
  attachments?: { id: string; filename: string; content_type: string; size?: number }[];
};

// Récupère un email reçu complet (corps compris) et le range dans « Reçus ».
// Idempotent : resend_id est unique.
export async function importerRecu(emailId: string): Promise<void> {
  const r = await fetch(`${RESEND}/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}` },
  });
  if (!r.ok) throw new Error(`Resend receiving ${r.status}`);
  const m = (await r.json()) as Recu;
  const entetes = Object.fromEntries(Object.entries(m.headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  const { error } = await authAdmin().from("emails").upsert({
    direction: "in", communication_type: "webmail", from_addr: m.from, to_addr: (m.to ?? []).join(", "),
    cc_addr: m.cc?.length ? m.cc.join(", ") : null, reply_to: m.reply_to?.length ? m.reply_to.join(", ") : null,
    subject: m.subject ?? "", body_html: m.html ?? null, body_text: m.text ?? null,
    message_id: m.message_id ?? entetes["message-id"] ?? null, in_reply_to: entetes["in-reply-to"] ?? null,
    resend_id: m.id, attachments: (m.attachments ?? []).map((p) => ({ id: p.id, filename: p.filename, content_type: p.content_type, size: p.size ?? null })),
    folder: "inbox", read: false, date: m.created_at, source: "resend",
  }, { onConflict: "resend_id", ignoreDuplicates: true });
  if (error) throw error;
}

// Lien de téléchargement signé (temporaire) d'une pièce jointe reçue.
export async function lienPieceJointe(emailId: string, pieceId: string): Promise<string | null> {
  const r = await fetch(`${RESEND}/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(pieceId)}`, {
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}` },
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { download_url?: string };
  return j.download_url ?? null;
}

const CHAMP_EVENEMENT: Record<string, string> = {
  "email.opened": "opened_at", "email.clicked": "clicked_at", "email.bounced": "bounced_at", "email.complained": "bounced_at",
};

// Événements d'envoi (délivré, rebond, plainte…) : journalisés, et reportés
// sur l'email envoyé correspondant.
export async function enregistrerEvenement(type: string, emailId: string, payload: unknown): Promise<void> {
  const db = authAdmin();
  await db.from("email_events").insert({ message_id: emailId, type, payload: payload ?? {} });
  const champ = CHAMP_EVENEMENT[type];
  if (champ) await db.from("emails").update({ [champ]: new Date().toISOString() }).eq("resend_id", emailId).is(champ, null);
}
