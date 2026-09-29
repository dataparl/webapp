// Jetons à usage unique : 24 octets aléatoires, seul le hash SHA-256 est stocké.

export function randomToken(bytes = 24): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Buffer.from(buf).toString("base64url");
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(digest).toString("hex");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
