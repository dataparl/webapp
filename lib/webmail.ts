import "server-only";
import { audit, type Admin } from "./adminAuth";
import { adresseNue, doitRepondre, entetes } from "./autoReponse";
import { EXPEDITEURS, secret } from "./env";
import { esc, expedier, texteVersHtml } from "./mail";
import { authAdmin } from "./supabaseAdmin";

// Webmail : envoi via Resend depuis les adresses autorisées, réception par le
// webhook Resend (email.received), tout est rangé dans la table emails.

const RESEND = "https://api.resend.com";
const REPLI = "hello@dataparl.fr"; // adresse du domaine vérifié chez Resend

export type Brouillon = {
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text: string;
  inReplyTo?: string | null;
  references?: string | null;
};

export async function envoyerDepuisWebmail(a: Admin, b: Brouillon, permis: string[] = EXPEDITEURS): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from = b.from.toLowerCase();
  if (!permis.includes(from)) return { ok: false, error: "adresse d'expédition non autorisée" };
  const r = await expedier({
    from, to: b.to, cc: b.cc, subject: b.subject, corpsHtml: texteVersHtml(b.text), text: b.text,
    inReplyTo: b.inReplyTo, references: b.references, type: "webmail",
  });
  if (!r.ok) return r;
  await audit(a, "webmail.envoi", r.resendId, { from, to: b.to, subject: b.subject });
  return { ok: true, id: r.resendId };
}

type Recu = {
  id: string; from: string; to: string[]; cc?: string[] | null; reply_to?: string[] | null; subject: string;
  html?: string | null; text?: string | null; message_id?: string | null; created_at: string;
  headers?: unknown;
  attachments?: { id: string; filename: string; content_type: string; size?: number }[];
};

// Récupère un email reçu complet (corps compris), le range dans « Reçus » et
// envoie l'accusé de réception s'il y a lieu. Idempotent (resend_id unique).
// Nécessite une clé Resend « Full access » (la lecture des emails reçus est
// refusée aux clés « Sending access »).
export async function importerRecu(emailId: string): Promise<void> {
  const r = await fetch(`${RESEND}/emails/receiving/${encodeURIComponent(emailId)}`, {
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}` },
  });
  if (!r.ok) throw new Error(`Resend receiving ${r.status} ${await r.text()}`);
  const m = (await r.json()) as Recu;
  const h = entetes(m.headers);
  const { data, error } = await authAdmin().from("emails").upsert({
    direction: "in", communication_type: "webmail", from_addr: m.from, to_addr: (m.to ?? []).join(", "),
    cc_addr: m.cc?.length ? m.cc.join(", ") : null, reply_to: m.reply_to?.length ? m.reply_to.join(", ") : null,
    subject: m.subject ?? "", body_html: m.html ?? null, body_text: m.text ?? null,
    message_id: m.message_id ?? h["message-id"] ?? null, in_reply_to: h["in-reply-to"] ?? null,
    resend_id: m.id, attachments: (m.attachments ?? []).map((p) => ({ id: p.id, filename: p.filename, content_type: p.content_type, size: p.size ?? null })),
    folder: "inbox", read: false, date: m.created_at, source: "resend",
  }, { onConflict: "resend_id", ignoreDuplicates: true }).select("id");
  if (error) throw error;
  if (!data?.length) return; // déjà importé : pas de second accusé
  if (!doitRepondre({ from: m.from, subject: m.subject ?? "", headers: h })) return;

  const expediteur = adresseNue(m.reply_to?.[0] ?? m.from);
  const recuSur = [...(m.to ?? []), h["to"] ?? "", h["delivered-to"] ?? ""]
    .flatMap((x) => x.split(",")).map(adresseNue).find((x) => EXPEDITEURS.includes(x));
  await accuserReception({
    to: expediteur,
    from: recuSur ?? REPLI,
    objet: m.subject ?? "",
    messageId: m.message_id ?? h["message-id"] ?? null,
    extrait: (m.text ?? "").trim(),
  });
}

// Une seule réponse automatique par expéditeur et par 24 h.
async function dejaRepondu(to: string): Promise<boolean> {
  const depuis = new Date(Date.now() - 86400_000).toISOString();
  const { count } = await authAdmin().from("emails").select("id", { count: "exact", head: true })
    .eq("communication_type", "auto").eq("to_addr", to).gte("date", depuis);
  return (count ?? 0) > 0;
}

export async function accuserReception(p: {
  to: string; from: string; objet: string; messageId?: string | null; extrait: string; prenom?: string; contact?: boolean;
}): Promise<void> {
  if (await dejaRepondu(p.to)) return;
  const bonjour = p.prenom ? `Bonjour ${p.prenom},` : "Bonjour,";
  const extrait = p.extrait.length > 1500 ? p.extrait.slice(0, 1500) + "…" : p.extrait;
  const text = `${bonjour}

Merci pour ton message : il est bien arrivé chez DataParl'. On le lit et on te répond dès que possible, en général sous quelques jours ouvrés.

Si tu as quelque chose à ajouter, réponds simplement à cet email.

L'équipe DataParl'

Ton message :
${extrait.split("\n").map((l) => `> ${l}`).join("\n")}`;
  const corpsHtml = `<p style="margin:0 0 16px">${esc(bonjour)}</p>
<p style="margin:0 0 16px">Merci pour ton message : il est bien arrivé chez DataParl'. On le lit et on te répond dès que possible, en général sous quelques jours ouvrés.</p>
<p style="margin:0 0 16px">Si tu as quelque chose à ajouter, réponds simplement à cet email.</p>
<p style="margin:0 0 24px">L'équipe DataParl'</p>
<p style="margin:0 0 8px;font-size:14px;color:#4A5670">Ton message${p.objet && !p.contact ? ` « ${esc(p.objet)} »` : ""} :</p>
<blockquote style="margin:0;padding:0 0 0 12px;border-left:3px solid #E6E3D8;color:#4A5670;font-size:14px;white-space:pre-wrap">${esc(extrait)}</blockquote>`;
  const message = {
    to: [p.to],
    subject: p.contact ? "Ton message à DataParl' est bien arrivé" : `Bien reçu : ${p.objet || "ton message"}`,
    titre: "Ton message est bien arrivé",
    corpsHtml, text, type: "auto" as const,
    inReplyTo: p.messageId ?? null,
    headers: { "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All" },
  };
  let r = await expedier({ ...message, from: p.from });
  if (!r.ok && p.from !== REPLI) r = await expedier({ ...message, from: REPLI }); // domaine racine pas encore vérifié
  if (!r.ok) console.error("accusé de réception", r.error);
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

export async function enregistrerEvenement(type: string, emailId: string, payload: unknown): Promise<void> {
  const db = authAdmin();
  await db.from("email_events").insert({ message_id: emailId, type, payload: payload ?? {} });
  const champ = CHAMP_EVENEMENT[type];
  if (champ) await db.from("emails").update({ [champ]: new Date().toISOString() }).eq("resend_id", emailId).is(champ, null);
}
