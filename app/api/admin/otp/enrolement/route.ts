import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { enroler, identifierAdmin, refus } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Génère le secret TOTP (tant qu'aucun n'est actif) et son QR code.
export async function POST(req: Request) {
  const id = await identifierAdmin(req);
  if (!id.ok) return refus(id);
  const e = await enroler(id);
  if (!e) return NextResponse.json({ error: "un second facteur est déjà actif" }, { status: 409 });
  const qr = await QRCode.toDataURL(e.uri, { margin: 1, width: 240 });
  return NextResponse.json({ qr, secret: e.secret }, { headers: { "Cache-Control": "no-store" } });
}
