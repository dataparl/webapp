import { NextResponse } from "next/server";
import { desinscrire, emailDepuisJeton } from "@/lib/consent";

// Désinscription en un clic (RFC 8058) : la messagerie envoie
// POST <List-Unsubscribe> avec le corps « List-Unsubscribe=One-Click ».
export async function POST(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const email = await emailDepuisJeton(id);
  if (email) await desinscrire(email);
  return new NextResponse(null, { status: 200 });
}
