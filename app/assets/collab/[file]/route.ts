import { EXPORTS_COLLAB, reponseOptions, servirCSV } from "@/lib/exportsDatagouv";

// Export CSV des jeux « Collaborateurs parlementaires », servi sur
// media.dataparl.fr/assets/collab/<slug>.csv (règle proxy). Périodes en cours
// sauf « mouvements » et « parcours-croises » (historiques). Compte requis.

export async function OPTIONS() { return reponseOptions(); }

export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  return servirCSV(req, (await ctx.params).file, EXPORTS_COLLAB, "collab");
}
