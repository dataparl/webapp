import { z } from "zod";
import { NextResponse } from "next/server";
import { audit } from "@/lib/adminAuth";
import { avecAdmin, corps, erreur, EDITION } from "@/lib/adminRoute";
import { authAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Édition « crayon » des pages du site (contenu principal uniquement, jamais
// l'en-tête, le pied de page ou les menus) : table contenu_pages.

const Chemin = z.string().startsWith("/").max(200);
const Maj = z.object({ chemin: Chemin, html: z.string().max(300_000) });

export async function POST(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = Maj.safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    await authAdmin().from("contenu_pages").upsert({
      chemin: p.data.chemin, html: p.data.html, maj_le: new Date().toISOString(), maj_par: a.userId,
    });
    await audit(a, "contenu.page", p.data.chemin, { octets: p.data.html.length });
    return { ok: true };
  }, EDITION);
}

export async function DELETE(req: Request) {
  return avecAdmin(req, async (a) => {
    const p = z.object({ chemin: Chemin }).safeParse(await corps(req));
    if (!p.success) return erreur(400, "requête invalide");
    await authAdmin().from("contenu_pages").delete().eq("chemin", p.data.chemin);
    await audit(a, "contenu.page.suppression", p.data.chemin, {});
    return { ok: true };
  }, EDITION);
}
