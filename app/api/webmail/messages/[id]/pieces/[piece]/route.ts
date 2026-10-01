import { NextResponse } from "next/server";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, EQUIPE, erreur } from "@/lib/adminRoute";
import { boitesDe, peutVoir } from "@/lib/boites";
import { authAdmin } from "@/lib/supabaseAdmin";
import { lienPieceJointe } from "@/lib/webmail";

export const dynamic = "force-dynamic";

// Renvoie un lien de téléchargement signé et temporaire pour une pièce jointe.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; piece: string }> }) {
  const { id, piece } = await params;
  return avecAdmin(req, async (a) => {
    const { data } = await authAdmin().from("emails").select("resend_id, attachments, to_addr, cc_addr, from_addr").eq("id", id).maybeSingle();
    if (data && !peutVoir(boitesDe(a), data)) return erreur(404, "pièce jointe introuvable");
    const pieces = (data?.attachments ?? []) as { id: string; filename: string }[];
    const p = pieces.find((x) => x.id === piece);
    if (!data?.resend_id || !p) return erreur(404, "pièce jointe introuvable");
    const url = await lienPieceJointe(data.resend_id, piece);
    if (!url) return erreur(502, "lien indisponible");
    await audit(a, "webmail.piece_jointe", id, { fichier: p.filename });
    return NextResponse.json({ url, filename: p.filename });
  }, EQUIPE);
}
