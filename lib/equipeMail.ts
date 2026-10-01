import "server-only";
import { esc, expedier } from "./mail";

// Email de configuration d'un compte d'équipe, envoyé à une adresse choisie
// par l'administrateur (souvent l'adresse personnelle de la personne), depuis
// support@ ou it@dataparl.fr. Le mot de passe est provisoire : il doit être
// changé à la première connexion, puis le second facteur est configuré.
export const EXPEDITEURS_CONFIG = ["support@dataparl.fr", "it@dataparl.fr"] as const;

const ROLE: Record<string, string> = { admin: "Administrateur", editeur: "Éditeur", utilisateur: "Utilisateur" };

export async function envoyerConfiguration(p: {
  to: string; from: (typeof EXPEDITEURS_CONFIG)[number]; nom: string; email: string; motDePasse: string; role: string; nouveau?: boolean;
}) {
  const admin = "https://admin.dataparl.fr";
  const webmail = "https://webmail.dataparl.fr";
  const ligne = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#4A5670;white-space:nowrap">${k}</td><td style="padding:6px 0;font-family:Menlo,Consolas,monospace;font-size:15px"><strong>${esc(v)}</strong></td></tr>`;
  const corpsHtml = [
    `<p style="margin:0 0 16px">Bonjour ${esc(p.nom)},</p>`,
    `<p style="margin:0 0 16px">${p.nouveau ? "Un nouveau mot de passe provisoire a été créé pour ton compte" : "Ton compte de l'équipe DataParl' est prêt"}. Rôle : <strong>${esc(ROLE[p.role] ?? p.role)}</strong>.</p>`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;padding:12px 16px;background:#FBFAF5;border:1px solid #E6E3D8;border-radius:10px">${ligne("Adresse", p.email)}${ligne("Mot de passe provisoire", p.motDePasse)}</table>`,
    `<p style="margin:0 0 8px"><strong>Pour démarrer :</strong></p>`,
    `<ol style="margin:0 0 16px;padding-left:20px">`,
    `<li style="margin-bottom:6px">Connecte-toi sur <a href="${admin}" style="color:#164DFF">admin.dataparl.fr</a> avec ton adresse et ce mot de passe.</li>`,
    `<li style="margin-bottom:6px">Choisis ton propre mot de passe (8 caractères minimum) : le provisoire ne sert qu'une fois.</li>`,
    ...(p.role === "admin" ? [`<li style="margin-bottom:6px">Active la double authentification avec une application (Google Authenticator, 1Password, Authy…).</li>`] : []),
    `<li>Ta boîte se lit sur <a href="${webmail}" style="color:#164DFF">webmail.dataparl.fr</a>. Dans « Mon espace », tu trouveras ta signature et le raccourci pour ton téléphone.</li>`,
    `</ol>`,
    `<p style="margin:0;color:#4A5670;font-size:14px">Pour ta sécurité, supprime ce message une fois connecté(e). Une question : réponds simplement à cet email.</p>`,
  ].join("\n");
  const text = [
    `Bonjour ${p.nom},`, "",
    p.nouveau ? "Un nouveau mot de passe provisoire a été créé pour ton compte." : "Ton compte de l'équipe DataParl' est prêt.",
    `Rôle : ${ROLE[p.role] ?? p.role}`, "",
    `Adresse : ${p.email}`, `Mot de passe provisoire : ${p.motDePasse}`, "",
    `1. Connecte-toi sur ${admin}`, "2. Choisis ton propre mot de passe (8 caractères minimum).",
    ...(p.role === "admin" ? ["3. Active la double authentification."] : []), `Ta boîte : ${webmail}`, "",
    "Pour ta sécurité, supprime ce message une fois connecté(e).",
  ].join("\n");
  return expedier({
    from: p.from, to: [p.to], replyTo: p.from, subject: p.nouveau ? "Ton nouveau mot de passe DataParl'" : "Ton compte DataParl' est prêt",
    titre: p.nouveau ? "Nouveau mot de passe" : "Bienvenue dans l'équipe", corpsHtml, text, type: "transactionnel",
  });
}
