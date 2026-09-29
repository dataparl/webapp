import { NextResponse } from "next/server";
import { groupesDe, referentiel } from "@/lib/data";

export const revalidate = 3600;

// Liste publique des élus suivis et des groupes (alimente les filtres).
export async function GET() {
  try {
    const elus = await referentiel();
    return NextResponse.json({ elus, groupes: groupesDe(elus) }, { headers: { "Cache-Control": "public, s-maxage=3600" } });
  } catch {
    return NextResponse.json({ error: "données indisponibles" }, { status: 503 });
  }
}
