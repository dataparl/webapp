import "server-only";
import { MAIL_FROM, SITE_URL, secret } from "./env";

// Envoi via l'API Resend en fetch brut (comme sur PasDeVelib).

type Envoi = {
  to: string;
  subject: string;
  html: string;
  text: string;
  // Présents pour la communication opt-in : désinscription en un clic (RFC 8058).
  unsubscribeUrl?: string;
};

export async function sendEmail(e: Envoi): Promise<string | null> {
  const headers: Record<string, string> = {};
  if (e.unsubscribeUrl) {
    headers["List-Unsubscribe"] = `<${e.unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: MAIL_FROM, to: [e.to], subject: e.subject, html: e.html, text: e.text, headers }),
  });
  if (!r.ok) {
    console.error("Resend", r.status, await r.text());
    return null;
  }
  return ((await r.json()) as { id?: string }).id ?? null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function layoutEmail(titre: string, corpsHtml: string, pied: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f6f5f2;font-family:Arial,Helvetica,sans-serif;color:#1c2430">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px">
<tr><td>
<p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#B06A1F">CavaParlement</p>
<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#1E3A5F">${esc(titre)}</h1>
${corpsHtml}
</td></tr></table>
<p style="max-width:560px;font-size:12px;line-height:1.5;color:#6b7280;margin:16px auto 0">${pied}</p>
</td></tr></table></body></html>`;
}

export function bouton(url: string, libelle: string): string {
  return `<p style="margin:24px 0"><a href="${esc(url)}" style="display:inline-block;background:#1E3A5F;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">${esc(libelle)}</a></p>`;
}

export function piedObligatoire(): string {
  return `Message envoyé par CavaParlement (${SITE_URL.replace("https://", "")}) suite à une action de votre part. Si vous n'êtes pas à l'origine de cette demande, ignorez-le : rien ne sera enregistré.`;
}

export function piedOptIn(prefsUrl: string, unsubUrl: string): string {
  return `Vous recevez ce message car vous êtes abonné(e) aux alertes CavaParlement. <a href="${esc(prefsUrl)}" style="color:#6b7280">Gérer mes préférences</a> · <a href="${esc(unsubUrl)}" style="color:#6b7280">Me désinscrire</a>`;
}

export function emailConfirmation(confirmUrl: string) {
  const subject = "Confirmez votre inscription aux alertes CavaParlement";
  const html = layoutEmail(
    "Confirmez votre inscription",
    `<p style="line-height:1.6">Vous avez demandé à recevoir les alertes sur les mouvements de collaborateurs parlementaires. Cliquez ci-dessous pour confirmer (lien valable 48 heures).</p>${bouton(confirmUrl, "Confirmer mon inscription")}`,
    piedObligatoire(),
  );
  const text = `Confirmez votre inscription aux alertes CavaParlement (lien valable 48 heures) :\n${confirmUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`;
  return { subject, html, text };
}
