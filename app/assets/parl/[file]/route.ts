import { EXPORTS_PARL, reponseOptions, servirCSV } from "@/lib/exportsDatagouv";

// Export CSV du jeu « Parlementaires français », servi sur
// media.dataparl.fr/assets/parl/<slug>.csv (règle proxy). Compte requis.

export async function OPTIONS() { return reponseOptions(); }

export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  return servirCSV(req, (await ctx.params).file, EXPORTS_PARL, "parl");
}
