import { dataQueryTout } from "@/lib/data";
import { utilisateur } from "@/lib/userAuth";

// Export CSV brut des collaborateurs d'une chambre, servi sur
// media.dataparl.fr/assets/collab/{an,senat,pe}.csv (règle ajoutée dans
// proxy.ts). Une ligne par collaborateur-élu en poste : nom, élu employeur,
// fonction, chambre, date de début. Périodes en cours uniquement :
// l'historique complet (anciennes affectations) reste consultable sur
// dataparl.fr. Téléchargement réservé aux comptes DataParl' (session
// requise, jeton Bearer). Publié aussi sur data.gouv.fr (jeu de données
// DataParl', accès restreint).
type Periode = { collab_id: string; elu_nom: string; fonction: string; en_cours: boolean; debut: string | null };
type Collab = { collab_id: string; nom: string; prenom: string };

const CHAMBRES: Record<string, string> = { an: "assemblee", senat: "senat", pe: "europarl" };

export async function GET(req: Request, ctx: { params: Promise<{ file: string }> }) {
  // Compte DataParl' obligatoire : le téléchargement des CSV de media.dataparl.fr
  // exige une session (jeton Bearer). Sans session, renvoi vers la connexion.
  const user = await utilisateur(req);
  if (!user) {
    const file = decodeURIComponent((await ctx.params).file);
    const suite = "/assets/collab/" + encodeURIComponent(file);
    return Response.redirect("https://www.dataparl.fr/connexion?suite=" + encodeURIComponent(suite), 302);
  }
  const seg = decodeURIComponent((await ctx.params).file).replace(/\.csv$/i, "");
  const chambre = CHAMBRES[seg];
  if (!chambre) {
    return new Response("Chambre inconnue. Exports disponibles : /assets/collab/an.csv, /assets/collab/senat.csv, /assets/collab/pe.csv.", { status: 404 });
  }
  // Périodes en cours uniquement. Colonnes complètes d'abord ; repli sans la
  // date de début si la vue ne l'expose pas.
  let rows: Periode[] = [];
  try {
    rows = await dataQueryTout<Periode>("periodes",
      new URLSearchParams({ select: "collab_id,elu_nom,fonction,en_cours,debut", chambre: "eq." + chambre, en_cours: "eq.true", order: "elu_nom" }), 3600);
  } catch {
    try {
      const mini = await dataQueryTout<{ collab_id: string; elu_nom: string; fonction: string; en_cours: boolean }>("periodes",
        new URLSearchParams({ select: "collab_id,elu_nom,fonction,en_cours", chambre: "eq." + chambre, en_cours: "eq.true", order: "elu_nom" }), 3600);
      rows = mini.map((r) => ({ ...r, debut: null }));
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
  const entetes = ["collaborateur", "elu", "fonction", "chambre", "debut"];
  const lignes = rows.map((r) => [noms.get(r.collab_id) ?? "", r.elu_nom, r.fonction, chambre, r.debut].map(esc).join(","));
  // BOM UTF-8 : ouverture propre dans Excel.
  const csv = "\uFEFF" + entetes.join(",") + "\n" + (lignes.length ? lignes.join("\n") + "\n" : "");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="collaborateurs_' + seg + '.csv"',
    },
  });
}
