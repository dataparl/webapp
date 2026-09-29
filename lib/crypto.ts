import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

// Chiffrement AES-256-GCM (clé de 32 octets en base64). Format : iv.tag.donnees (base64url).
export function chiffrer(clair: string, cleB64: string): string {
  const cle = Buffer.from(cleB64, "base64");
  if (cle.length !== 32) throw new Error("clé de chiffrement invalide (32 octets attendus)");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", cle, iv);
  const donnees = Buffer.concat([c.update(clair, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), donnees].map((b) => b.toString("base64url")).join(".");
}

export function dechiffrer(chiffre: string, cleB64: string): string {
  const [iv, tag, donnees] = chiffre.split(".").map((p) => Buffer.from(p, "base64url"));
  const d = createDecipheriv("aes-256-gcm", Buffer.from(cleB64, "base64"), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(donnees), d.final()]).toString("utf8");
}

// Jeton de second facteur : « expiration.signature », lié à l'utilisateur.
export function signerJeton(userId: string, secretHmac: string, dureeS = 15 * 60, maintenant = Date.now()): string {
  const exp = Math.floor(maintenant / 1000) + dureeS;
  const sig = createHmac("sha256", secretHmac).update(`${userId}.${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}

export function verifierJeton(jeton: string | null, userId: string, secretHmac: string, maintenant = Date.now()): boolean {
  if (!jeton) return false;
  const [expTxt, sig] = jeton.split(".");
  const exp = Number(expTxt);
  if (!exp || !sig || exp * 1000 < maintenant) return false;
  const attendu = createHmac("sha256", secretHmac).update(`${userId}.${exp}`).digest();
  const recu = Buffer.from(sig, "base64url");
  return recu.length === attendu.length && timingSafeEqual(recu, attendu);
}

// Signature des webhooks Resend (format Svix) : HMAC-SHA256 de « id.timestamp.corps »
// avec le secret « whsec_<base64> ». Tolérance de 5 minutes sur l'horodatage.
export function verifierSvix(corps: string, headers: Headers, secretWebhook: string, maintenant = Date.now()): boolean {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const signatures = headers.get("svix-signature");
  if (!id || !ts || !signatures) return false;
  if (Math.abs(maintenant / 1000 - Number(ts)) > 300) return false;
  const cle = Buffer.from(secretWebhook.replace(/^whsec_/, ""), "base64");
  const attendu = createHmac("sha256", cle).update(`${id}.${ts}.${corps}`).digest();
  return signatures.split(" ").some((s) => {
    const [version, sig] = s.split(",");
    if (version !== "v1" || !sig) return false;
    const recu = Buffer.from(sig, "base64");
    return recu.length === attendu.length && timingSafeEqual(recu, attendu);
  });
}
