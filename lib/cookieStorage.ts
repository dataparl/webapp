import { domaineCookie } from "./domaine.ts";
// Stockage de la session Supabase dans des cookies du domaine parent
// (.dataparl.fr) : une seule connexion vaut pour www, api, admin et webmail.
// Les cookies sont limités à ~4 Ko : la valeur est découpée en morceaux
// « <clé>.0 », « <clé>.1 »… Hors de dataparl.fr (localhost, aperçus),
// les cookies restent attachés à l'hôte courant.

const TAILLE = 3000;
const DUREE = 60 * 60 * 24 * 30; // 30 jours ; la session est de toute façon rafraîchie

function domaine(): string {
  return domaineCookie(typeof window === "undefined" ? "" : window.location.hostname);
}

function lire(): Map<string, string> {
  const m = new Map<string, string>();
  for (const part of document.cookie.split("; ")) {
    if (!part) continue;
    const i = part.indexOf("=");
    m.set(decodeURIComponent(part.slice(0, i)), part.slice(i + 1));
  }
  return m;
}

function ecrire(nom: string, valeur: string, maxAge: number) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(nom)}=${valeur}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${domaine()}`;
}

function supprimerMorceaux(cle: string, depuis: number, cookies: Map<string, string>) {
  for (let i = depuis; cookies.has(`${cle}.${i}`); i++) ecrire(`${cle}.${i}`, "", 0);
}

export const cookieStorage = {
  getItem(cle: string): string | null {
    if (typeof document === "undefined") return null;
    const cookies = lire();
    if (!cookies.has(`${cle}.0`)) return null;
    let brut = "";
    for (let i = 0; cookies.has(`${cle}.${i}`); i++) brut += cookies.get(`${cle}.${i}`);
    try {
      return decodeURIComponent(brut);
    } catch {
      return null;
    }
  },
  setItem(cle: string, valeur: string): void {
    if (typeof document === "undefined") return;
    const enc = encodeURIComponent(valeur);
    const n = Math.ceil(enc.length / TAILLE) || 1;
    // Ne jamais couper une séquence %XX en deux.
    let debut = 0;
    let i = 0;
    while (debut < enc.length || i === 0) {
      let fin = Math.min(debut + TAILLE, enc.length);
      const p = enc.lastIndexOf("%", fin - 1);
      if (p > fin - 3 && p >= debut && fin < enc.length) fin = p;
      ecrire(`${cle}.${i}`, enc.slice(debut, fin), DUREE);
      debut = fin;
      i++;
      if (i > n + 5) break;
    }
    supprimerMorceaux(cle, i, lire());
  },
  removeItem(cle: string): void {
    if (typeof document === "undefined") return;
    supprimerMorceaux(cle, 0, lire());
  },
};
