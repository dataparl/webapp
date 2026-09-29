import "server-only";
import { MAIL_FROM, secret } from "./env";

// Envoi via l'API Resend en fetch brut (comme sur PasDeVelib).

type Envoi = {
  to: string;
  subject: string;
  html: string;
  text: string;
  // Présents pour la communication opt-in : désinscription en un clic (RFC 8058).
  unsubscribeUrl?: string;
  replyTo?: string;
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
    body: JSON.stringify({
      from: MAIL_FROM, to: [e.to], subject: e.subject, html: e.html, text: e.text, headers,
      ...(e.replyTo ? { reply_to: e.replyTo } : {}),
    }),
  });
  if (!r.ok) {
    console.error("Resend", r.status, await r.text());
    return null;
  }
  return ((await r.json()) as { id?: string }).id ?? null;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function layoutEmail(titre: string, corpsHtml: string, pied: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#FFFDF5;font-family:Arial,Helvetica,sans-serif;color:#071A41">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #E6E3D8;border-radius:10px;padding:32px">
<tr><td>
<p style="margin:0 0 16px;font-family:Georgia,serif;font-weight:bold;font-size:20px;color:#071A41">Data<span style="background:#FFD23F;padding:0 2px">Parl'</span></p>
<h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#071A41">${esc(titre)}</h1>
${corpsHtml}
</td></tr></table>
<p style="max-width:560px;font-size:12px;line-height:1.5;color:#4A5670;margin:16px auto 0">${pied}</p>
</td></tr></table></body></html>`;
}

export function bouton(url: string, libelle: string): string {
  return `<p style="margin:24px 0"><a href="${esc(url)}" style="display:inline-block;background:#F0444F;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold">${esc(libelle)}</a></p>`;
}

export function piedObligatoire(): string {
  return "Message envoyé par DataParl' suite à une action faite avec ton adresse. Si ce n'est pas toi, ignore-le : rien ne sera enregistré.";
}

export function piedOptIn(prefsUrl: string, unsubUrl: string): string {
  return `Tu reçois ce message parce que tu es abonné(e) aux alertes DataParl'. <a href="${esc(prefsUrl)}" style="color:#4A5670">Régler mes préférences</a> · <a href="${esc(unsubUrl)}" style="color:#4A5670">Me désinscrire</a>`;
}
