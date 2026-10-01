// Liens tracés (link.dataparl.fr/<code> ou www.dataparl.fr/l/<code>) :
// validation, provenance d'un clic, masquage de l'adresse IP. Sans dépendance (testé).
export const CODE = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function genererCode(longueur = 6): string {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const o = new Uint32Array(longueur);
  globalThis.crypto.getRandomValues(o);
  return Array.from(o, (n) => alphabet[n % alphabet.length]).join("");
}

// Destination : adresse https complète, sans identifiants.
export function destinationValide(u: string): string | null {
  try {
    const url = new URL(u.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

const RESEAUX: [RegExp, string][] = [
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "X (Twitter)"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
  [/(^|\.)(bsky\.app|bsky\.social|go\.bsky\.app)$/, "Bluesky"],
  [/(^|\.)(instagram\.com)$/, "Instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "Facebook"],
  [/(^|\.)(mastodon\.[a-z]+|piaille\.fr|mamot\.fr)$/, "Mastodon"],
  [/(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|qwant\.com|ecosia\.org)$/, "Moteur de recherche"],
  [/(^|\.)(mail\.google\.com|outlook\.[a-z.]+|mail\.yahoo\.com|proton\.me)$/, "Email"],
  [/(^|\.)dataparl\.fr$/, "DataParl'"],
];
const UTM: Record<string, string> = {
  twitter: "X (Twitter)", x: "X (Twitter)", linkedin: "LinkedIn", bluesky: "Bluesky", bsky: "Bluesky", instagram: "Instagram",
  facebook: "Facebook", mastodon: "Mastodon", email: "Email", mail: "Email", newsletter: "Email", cp: "Communiqué", communique: "Communiqué",
};

// Provenance : le paramètre utm_source s'il est fourni, sinon le site d'origine (Referer).
export function sourceDe(referent: string | null, utmSource: string | null): string {
  const u = (utmSource ?? "").trim().toLowerCase();
  if (u) return UTM[u] ?? u.slice(0, 40);
  if (!referent) return "Direct";
  try {
    const h = new URL(referent).hostname.toLowerCase().replace(/^www\./, "");
    for (const [re, nom] of RESEAUX) if (re.test(h)) return nom;
    return h.slice(0, 60);
  } catch { return "Direct"; }
}

// Adresse IP tronquée (dernier octet en IPv4, 80 derniers bits en IPv6) :
// assez pour distinguer des réseaux, pas pour identifier une personne.
export function masquerIp(ip: string | null): string | null {
  if (!ip) return null;
  const v = ip.split(",")[0].trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return v.replace(/\.\d+$/, ".0");
  if (v.includes(":")) return `${v.split("::")[0].split(":").filter(Boolean).slice(0, 3).join(":")}::`;
  return null;
}

const ROBOTS = /bot|crawl|spider|preview|facebookexternalhit|slack|whatsapp|telegram|discord|curl|wget|python|headless|monitor/i;
export function appareilDe(ua: string | null): "robot" | "mobile" | "ordinateur" {
  if (!ua || ROBOTS.test(ua)) return "robot";
  return /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "ordinateur";
}
