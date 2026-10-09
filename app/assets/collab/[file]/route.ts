import { dataQueryTout } from "@/lib/data";

// Export CSV brut des collaborateurs d'une chambre, servi sur
// media.dataparl.fr/assets/collab/{an,senat,pe}.csv (règle ajoutée dans
// proxy.ts). Une ligne par collaborateur-élu en poste : nom, élu employeur,
// fonction, chambre, dates. Mis en cache une heure — même fraîcheur que les
// pages publiques. Publié aussi sur data.gouv.fr (jeu de données DataParl').
type Periode = { collab_id: string; elu_nom: string; fonction: string; en_cours: boolean; debut: string | null; fin: string | null };
type Collab = { collab_id: string; nom: string; prenom: string };

const CHAMBRES: Record<string, string> = { an: "assemblee", senat: "senat", pe: "europarl" };

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const seg = decodeURIComponent((await ctx.params).file).replace(/\.csv$/i, "");
  const chambre = CHAMBRES[seg];
  if (!chambre) {
    return new Response("Chambre inconnue. Exports disponibles : /assets/collab/an.csv, /assets/collab/senat.csv, /assets/collab/pe.csv.", { status: 404 });
  }
  // Colonnes complètes d'abord ; repli sans les dates si la vue ne les expose pas.
  let rows: Periode[] = [];
  try {
    rows = await dataQueryTout<Periode>("periodes",
      new URLSearchParams({ select: "collab_id,elu_nom,fonction,en_cours,debut,fin", chambre: "eq." + chambre, order: "elu_nom" }), 3600);
  } catch {
    try {
      const mini = await dataQueryTout<{ collab_id: string; elu_nom: string; fonction: string; en_cours: boolean }>("periodes",
        new URLSearchParams({ select: "collab_id,elu_nom,fonction,en_cours", chambre: "eq." + chambre, order: "elu_nom" }), 3600);
      rows = mini.map((r) => ({ ...r, debut: null, fin: null }));
    } catch {
      rows = [];
    }
  }
  const collabs = await dataQueryTout<Collab>("collaborateurs",
    new URLSearchParams({ select: "collab_id,nom,prenom" }), 3600).catch((): Collab[] => []);
  const noms = new Map(collabs.map((c) => [c.collab_id, [c.prenom, c.nom].filter(Boolean).join(" ")]));

  const esc = (v: string | boolean | number | null): string => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const entetes = ["collaborateur", "elu", "fonction", "chambre", "en_poste", "debut", "fin"];
  const lignes = rows.map((r) => [noms.get(r.collab_id) ?? "", r.elu_nom, r.fonction, chambre, r.en_cours ? "oui" : "non", r.debut, r.fin].map(esc).join(","));
  // BOM UTF-8 : ouverture propre dans Excel.
  const csv = "\uFEFF" + entetes.join(",") + "\n" + (lignes.length ? lignes.join("\n") + "\n" : "");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Disposition": 'inline; filename="collaborateurs_' + seg + '.csv"',
    },
  });
}
