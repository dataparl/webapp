import { LOGOS_PNG } from "@/lib/logos";

// Logos des réseaux (X, Bluesky, Telegram) pour le pied des mails
// DataParl' Daily : /media/logos/<nom>.png. Hébergés par DataParl' et en
// PNG plutôt qu'en SVG : Gmail et Outlook ignorent le SVG dans les emails.

export async function GET(_req: Request, { params }: { params: Promise<{ fichier: string }> }) {
  const { fichier } = await params;
  const png = LOGOS_PNG[fichier];
  if (!png) return new Response("Logo introuvable", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(png, "base64")), {
    headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
