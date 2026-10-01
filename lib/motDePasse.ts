// Mots de passe des comptes d'équipe (sans dépendance, testé).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-=?";

// 14 caractères tirés avec une source cryptographique (navigateur ou Node).
export function genererMotDePasse(longueur = 14): string {
  const octets = new Uint32Array(longueur);
  globalThis.crypto.getRandomValues(octets);
  return Array.from(octets, (n) => ALPHABET[n % ALPHABET.length]).join("");
}

export const LONGUEUR_MIN = 8;

export function motDePasseValide(m: string): string | null {
  if (m.length < LONGUEUR_MIN) return `au moins ${LONGUEUR_MIN} caractères`;
  if (m.length > 128) return "128 caractères au plus";
  return null;
}

// Identifiant (avant le @) et sous-domaine : minuscules, chiffres, point, tiret.
export function adresseEquipe(identifiant: string, sousDomaine?: string): string | null {
  const id = identifiant.trim().toLowerCase();
  const sd = (sousDomaine ?? "").trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9.-]{0,40}[a-z0-9])?$/.test(id) || id.includes("..")) return null;
  if (sd && !/^[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(sd)) return null;
  return `${id}@${sd ? `${sd}.` : ""}dataparl.fr`;
}
