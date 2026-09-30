import { NextResponse } from "next/server";
import { tousLesParlementaires } from "@/lib/referentiel";

export const revalidate = 3600;

// Tous les parlementaires (anciens compris), en version compacte : alimente
// l'autocomplétion des élus partout sur le site.
export async function GET() {
  try {
    return NextResponse.json(await tousLesParlementaires(), { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json([], { status: 503 });
  }
}
