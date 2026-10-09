// Gabarit commun à tous les emails envoyés depuis @dataparl.fr
// (transactionnels, réponses de la webmail, accusés de réception).
// HTML de messagerie : tableaux et styles en ligne. Sans dépendance (testé).

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const SITE = "https://www.dataparl.fr";
const BLEU = "#164DFF";
const ENCRE = "#071A41";
const GRIS = "#4A5670";
const LIGNE = "#E6E3D8";

export type Gabarit = {
  titre: string;
  corpsHtml: string;
  lireUrl?: string | null; // version en ligne (mail.dataparl.fr/lire/<jeton>)
  pied?: string; // mention sous la carte (désinscription, raison de l'envoi)
  edition?: "Daily" | "Weekly"; // alertes : logo « DataParl' Daily / Weekly » sur bloc bleu nuit
  adressage?: { date: string; pour?: string }; // AAAA-MM-JJ et « Prénom NOM »
};

const MOIS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

// « 01 Octobre 2026 »
export function dateAdressage(jour: string): string {
  const [a, m, j] = jour.split("-");
  return `${j} ${MOIS[Number(m) - 1] ?? ""} ${a}`;
}

// « À l'attention de Jean DUPONT », « À l'attention d'Émilie DURAND » (voyelle ou h).
export function attention(pour: string): string {
  const p = pour.trim();
  const initiale = p.normalize("NFD").replace(/\p{M}/gu, "").charAt(0).toLowerCase();
  return `À l'attention ${"aeiouyh".includes(initiale) && initiale ? "d'" : "de "}${p}`;
}

// « prénom nom » -> « Prénom NOM » (le dernier mot, particules comprises, en capitales).
export function prenomNomAdresse(prenom: string, nom: string): string {
  const cap = (x: string) => x.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
  return [cap(prenom.trim()), nom.trim().toUpperCase()].filter(Boolean).join(" ");
}

export function gabarit({ titre, corpsHtml, lireUrl, pied, edition, adressage }: Gabarit): string {
  const lien = (href: string, txt: string) => `<a href="${href}" style="color:${BLEU};text-decoration:none">${txt}</a>`;
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(titre)}</title></head>
<body style="margin:0;padding:0;background:#F6F4EC;font-family:Arial,Helvetica,sans-serif;color:${ENCRE}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EC"><tr><td align="center" style="padding:20px 16px 40px">
${lireUrl ? `<p style="margin:0 0 24px;font-size:13px;line-height:1.5;color:${GRIS}">Si cet email ne s'affiche pas correctement, <a href="${esc(lireUrl)}" style="color:${BLEU}">consulte-le en ligne</a>.</p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LIGNE};border-radius:16px;border-collapse:separate">
${edition ? `<tr><td style="padding:26px 32px 20px;border-bottom:3px solid #FFD23F">
<span style="font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:24px;color:${ENCRE}">Data<span style="background:#FFD23F;padding:0 3px 0 1px">Parl'</span></span>
<span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:normal;font-size:20px;color:${GRIS}">&nbsp;${edition}</span>
</td></tr>` : `<tr><td style="padding:26px 32px;border-bottom:1px solid ${LIGNE}">
<span style="font-family:Georgia,'Times New Roman',serif;font-weight:bold;font-size:24px;color:${ENCRE}">Data<span style="background:#FFD23F;padding:0 3px 0 1px">Parl'</span></span>
</td></tr>`}
${adressage ? `<tr><td style="padding:18px 32px 0;font-size:14px;line-height:1.5;color:${GRIS}">${esc(dateAdressage(adressage.date))}${adressage.pour ? `<br><span style="color:${ENCRE}">${esc(attention(adressage.pour))}</span>` : ""}</td></tr>` : ""}
<tr><td style="padding:30px 32px 34px;font-size:16px;line-height:1.6;color:${ENCRE}">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:1.25;color:${ENCRE}">${esc(titre)}</h1>
${corpsHtml}
</td></tr>
<tr><td style="padding:18px 32px;border-top:1px solid ${LIGNE};background:#FBFAF5;border-radius:0 0 16px 16px;font-size:13px;text-align:center">
<span style="color:${GRIS}">DataParl&apos; ·</span> ${lien(`${SITE}/`, "www.dataparl.fr")}
</td></tr>
</table>
${pied ? `<p style="max-width:600px;margin:16px auto 0;font-size:12px;line-height:1.5;color:${GRIS}">${pied}</p>` : ""}
</td></tr></table>
</body></html>`;
}

// Liens Markdown : [texte](https://…) ou [texte](mailto:…), après échappement.
const LIEN_MD = /\[([^\]\[]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;
export function liensHtml(l: string): string {
  return l.replace(LIEN_MD, (_, texte: string, href: string) =>
    `<a href="${href}" style="color:${BLEU};text-decoration:underline">${texte}</a>`);
}

// Texte brut vers HTML : échappé, paragraphes, lignes citées (« > ») en gris,
// liens Markdown cliquables.
export function texteVersHtml(t: string): string {
  const blocs = t.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocs.map((b) => {
    const lignes = b.split("\n");
    if (lignes.every((l) => l.startsWith(">"))) {
      const cite = lignes.map((l) => liensHtml(esc(l.replace(/^>\s?/, "")))).join("<br>");
      return `<blockquote style="margin:0 0 16px;padding:0 0 0 12px;border-left:3px solid ${LIGNE};color:${GRIS}">${cite}</blockquote>`;
    }
    return `<p style="margin:0 0 16px">${lignes.map((l) => liensHtml(esc(l))).join("<br>")}</p>`;
  }).join("\n");
}
