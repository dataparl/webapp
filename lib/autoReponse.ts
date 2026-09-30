// Faut-il envoyer un accusé de réception automatique à un email reçu ?
// Non pour : les réponses et transferts, les messages automatiques (évite les
// boucles), les listes de diffusion, les robots, et nos propres adresses.
// Sans dépendance (testé).

export type Entrant = { from: string; subject: string; headers: Record<string, string> };

const ROBOTS = /^(no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounces?|notifications?)([+.-][^@]*)?@/i;
const PREFIXES = /^\s*(re|ré|aw|sv|tr|fwd?|wg)\s*(\[\d+\])?\s*:/i;

export function entetes(brut: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(brut)) {
    for (const h of brut) if (h && typeof h === "object" && "name" in h) out[String(h.name).toLowerCase()] = String((h as { value?: unknown }).value ?? "");
  } else if (brut && typeof brut === "object") {
    for (const [k, v] of Object.entries(brut)) out[k.toLowerCase()] = Array.isArray(v) ? v.join(", ") : String(v);
  }
  return out;
}

export function adresseNue(s: string): string {
  const m = s.match(/<([^>]+)>/);
  return (m ? m[1] : s).trim().toLowerCase();
}

export function doitRepondre(e: Entrant): boolean {
  const h = e.headers;
  const de = adresseNue(e.from);
  if (!de.includes("@")) return false;
  if (/@((mail\.)?cavaparlement\.eu|dataparl\.(fr|com))$/.test(de)) return false;
  if (ROBOTS.test(de)) return false;
  if (h["in-reply-to"] || h["references"]) return false;
  if (PREFIXES.test(e.subject ?? "")) return false;
  if (h["auto-submitted"] && h["auto-submitted"].toLowerCase() !== "no") return false;
  if (/^(bulk|list|junk|auto_reply)$/i.test((h["precedence"] ?? "").trim())) return false;
  if (h["list-id"] || h["list-unsubscribe"] || h["x-autoreply"] || h["x-autorespond"] || h["x-auto-response-suppress"]) return false;
  return true;
}
