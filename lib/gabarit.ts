// Gabarit commun à tous les emails envoyés depuis @mail.cavaparlement.eu
// (transactionnels, réponses de la webmail, accusés de réception).
// HTML de messagerie : tableaux et styles en ligne. Sans dépendance (testé).

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SITE = "https://www.cavaparlement.eu";
const BLEU = "#164DFF";
const ENCRE = "#071A41";
const GRIS = "#4A5670";
const LIGNE = "#E6E3D8";

export type Gabarit = {
  titre: string;
  corpsHtml: string;
  lireUrl?: string | null; // version en ligne (mail.cavaparlement.eu/lire/<jeton>)
  pied?: string; // mention sous la carte (désinscription, raison de l'envoi)
};

export function gabarit({ titre, corpsHtml, lireUrl, pied }: Gabarit): string {
  const lien = (href: string, txt: string) => `<a href="${href}" style="color:${BLEU};text-decoration:none">${txt}</a>`;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(titre)}</title></head>
<body style="margin:0;padding:0;background:#F6F4EC;font-family:Arial,Helvetica,sans-serif;color:${ENCRE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EC"><tr><td align="center" style="padding:20px 16px 40px">
${lireUrl ? `<p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:${GRIS}">Si cet email ne s'affiche pas correctement, <a href="${esc(lireUrl)}" style="color:${BLEU}">consulte-le en ligne</a>.</p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LIGNE};border-radius:16px;border-collapse:separate">
<tr><td style="padding:26px 32px;border-bottom:1px solid ${LIGNE}">
<span style="font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:24px;color:${ENCRE}">Data<span style="background:#FFD23F;padding:0 3px 0 1px">Parl'</span></span>
</td></tr>
<tr><td style="padding:30px 32px 34px;font-size:16px;line-height:1.6;color:${ENCRE}">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${ENCRE}">${esc(titre)}</h1>
${corpsHtml}
</td></tr>
<tr><td style="padding:20px 32px;border-top:1px solid ${LIGNE};background:#FBFAF5;border-radius:0 0 16px 16px;font-size:14px">
${lien(`${SITE}/mon-compte`, "Gérer mon compte")} <span style="color:${GRIS}">·</span> ${lien(`${SITE}/informations-legales`, "Informations légales")} <span style="color:${GRIS}">·</span> ${lien(`${SITE}/contact`, "Nous contacter")}
</td></tr>
</table>
${pied ? `<p style="max-width:600px;margin:16px auto 0;font-size:12px;line-height:1.5;color:${GRIS}">${pied}</p>` : ""}
</td></tr></table>
</body></html>`;
}

// Texte brut vers HTML : échappé, paragraphes, lignes citées (« > ») en gris.
export function texteVersHtml(t: string): string {
  const blocs = t.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocs.map((b) => {
    const lignes = b.split("\n");
    if (lignes.every((l) => l.startsWith(">"))) {
      const cite = lignes.map((l) => esc(l.replace(/^>\s?/, ""))).join("<br>");
      return `<blockquote style="margin:0 0 16px;padding:0 0 0 12px;border-left:3px solid ${LIGNE};color:${GRIS}">${cite}</blockquote>`;
    }
    return `<p style="margin:0 0 16px">${lignes.map(esc).join("<br>")}</p>`;
  }).join("\n");
}
