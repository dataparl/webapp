import { NextResponse, type NextRequest } from "next/server";
import { structures } from "@/lib/structures";

// Export SVG du réseau structures-eurodéputés, servi sur
// media.dataparl.fr/assets/collab-reseau (chemin autorisé dans proxy.ts ;
// l'extension .svg redirige vers la même ressource). Généré côté serveur
// à partir des affectations du Parlement européen, avec les mêmes
// positions initiales (cercles) que le composant GrapheReseau, le logo
// DataParl' en tête et la légende des groupes politiques en pied.
// ?telecharger force le téléchargement (Content-Disposition).

export const revalidate = 3600;

const COULEUR_STRUCTURE = "#b45309";
const COULEURS: Record<string, string> = {
  "PfE": "#1e3a8a",
  "PPE": "#2563eb",
  "S&D": "#dc2626",
  "Renew": "#f59e0b",
  "ECR": "#0ea5e9",
  "GUE/NGL": "#7c3aed",
  "Verts/ALE": "#16a34a",
  "ESN": "#334155",
  "NI": "#94a3b8",
};

const echappe = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const court = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
const nb = (x: number) => String(x).replace(".", ",");

export async function GET(req: NextRequest) {
  const [tp, pr] = await Promise.all([
    structures("Tiers payant"),
    structures("Prestataire de services spécialisé"),
  ]);

  // Fusion par structure (une même société peut être à la fois tiers payant
  // chez un élu et prestataire chez un autre) — même logique que la page.
  type S = { cle: string; nom: string; types: string[]; clients: { elu_id: string; elu_nom: string; elu_groupe: string }[] };
  const parCle = new Map<string, S>();
  const ajouter = (liste: Awaited<ReturnType<typeof structures>>, type: string) => {
    for (const s of liste) {
      const e = parCle.get(s.cle);
      if (e) {
        if (!e.types.includes(type)) e.types.push(type);
        e.clients.push(...s.clients);
        continue;
      }
      parCle.set(s.cle, { cle: s.cle, nom: s.nom, types: [type], clients: [...s.clients] });
    }
  };
  ajouter(tp, "Tiers payant");
  ajouter(pr, "Prestataire");
  const toutes = [...parCle.values()].sort((a, b) => b.clients.length - a.clients.length);

  // Eurodéputés (dédupliqués) et arêtes structure-élu.
  const elus = new Map<string, { elu_nom: string; elu_groupe: string; contrats: number }>();
  const aretes: { source: string; target: string }[] = [];
  for (const s of toutes) {
    for (const c of s.clients) {
      const e = elus.get(c.elu_id);
      if (e) e.contrats += 1;
      else elus.set(c.elu_id, { elu_nom: c.elu_nom, elu_groupe: c.elu_groupe, contrats: 1 });
      aretes.push({ source: s.cle, target: c.elu_id });
    }
  }

  // Positions initiales : structures sur un cercle intérieur, élus sur un
  // cercle extérieur (déterministe, identique au rendu initial de la page).
  const W = 1100, H = 760;
  const cx = W / 2, cy = H / 2 + 30;
  const pos = new Map<string, { x: number; y: number }>();
  const nbS = Math.max(1, toutes.length), nbE = Math.max(1, elus.size);
  let iS = 0, iE = 0;
  for (const s of toutes) {
    const a = (2 * Math.PI * iS++) / nbS;
    pos.set(s.cle, { x: cx + 160 * Math.cos(a), y: cy + 120 * Math.sin(a) });
  }
  for (const [id] of elus) {
    const a = (2 * Math.PI * iE++) / nbE;
    pos.set(id, { x: cx + 320 * Math.cos(a), y: cy + (H / 2 - 90) * Math.sin(a) });
  }

  const p: string[] = [];
  // En-tête : logo DataParl' et sous-titre.
  p.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" font-family="system-ui, -apple-system, sans-serif">');
  p.push('<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>');
  p.push('<text x="36" y="52" font-size="32" font-weight="700" fill="#14224e">Data</text>');
  p.push('<rect x="106" y="26" width="76" height="38" rx="5" fill="#FFD23F"/>');
  p.push('<text x="115" y="55" font-size="32" font-weight="700" fill="#071A41">Parl&apos;</text>');
  p.push('<text x="36" y="82" font-size="15" fill="#475569">Le réseau des tiers payants et prestataires des eurodéputés français — ' + nb(toutes.length) + ' structures · ' + nb(elus.size) + ' eurodéputés · ' + nb(aretes.length) + ' contrats · dataparl.fr</text>');
  // Arêtes puis nœuds.
  for (const a of aretes) {
    const s = pos.get(a.source), e = pos.get(a.target);
    if (!s || !e) continue;
    p.push('<line x1="' + nb(s.x) + '" y1="' + nb(s.y) + '" x2="' + nb(e.x) + '" y2="' + nb(e.y) + '" stroke="#cbd5e1" stroke-width="1"/>');
  }
  for (const [id, e] of elus) {
    const q = pos.get(id);
    if (!q) continue;
    const c = COULEURS[e.elu_groupe] || "#1E90FF";
    p.push('<circle cx="' + nb(q.x) + '" cy="' + nb(q.y) + '" r="9" fill="' + c + '" stroke="#fff" stroke-width="1.5"/>');
    p.push('<text x="' + nb(q.x) + '" y="' + nb(q.y - 14) + '" text-anchor="middle" font-size="8.5" fill="#334155">' + echappe(court(e.elu_nom, 22)) + '</text>');
  }
  for (const s of toutes) {
    const q = pos.get(s.cle);
    if (!q) continue;
    const r = Math.min(24, 9 + s.clients.length * 1.6);
    p.push('<circle cx="' + nb(q.x) + '" cy="' + nb(q.y) + '" r="' + nb(r) + '" fill="' + COULEUR_STRUCTURE + '" stroke="#fff" stroke-width="2"/>');
    p.push('<text x="' + nb(q.x) + '" y="' + nb(q.y + r + 13) + '" text-anchor="middle" font-size="10.5" font-weight="600" fill="#1f2937">' + echappe(court(s.nom, 26)) + '</text>');
  }
  // Légende : structures + groupes politiques présents.
  const groupes = [...new Set([...elus.values()].map((e) => e.elu_groupe).filter(Boolean))];
  let lx = 36;
  p.push('<circle cx="' + nb(lx + 5) + '" cy="' + nb(H - 28) + '" r="6" fill="' + COULEUR_STRUCTURE + '"/>');
  p.push('<text x="' + nb(lx + 16) + '" y="' + nb(H - 24) + '" font-size="12" fill="#1f2937">Structures</text>');
  lx += 16 + 9 * 10;
  for (const g of groupes) {
    p.push('<circle cx="' + nb(lx + 5) + '" cy="' + nb(H - 28) + '" r="6" fill="' + (COULEURS[g] || "#1E90FF") + '"/>');
    const w = g.length * 7 + 12;
    p.push('<text x="' + nb(lx + 16) + '" y="' + nb(H - 24) + '" font-size="12" fill="#1f2937">' + echappe(g) + '</text>');
    lx += 16 + w;
  }
  p.push('<text x="' + nb(W - 36) + '" y="' + nb(H - 24) + '" text-anchor="end" font-size="11" fill="#64748b">Taille des nœuds = nombre de liens · source : DataParl&apos; (dataparl.fr), données ouvertes</text>');
  p.push("</svg>");
  const svg = p.join("\n");

  const entetes: Record<string, string> = {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600, s-maxage=3600",
  };
  if (req.nextUrl.searchParams.has("telecharger")) {
    entetes["Content-Disposition"] = 'attachment; filename="collab-reseau-dataparl.svg"';
  }
  return new NextResponse(svg, { headers: entetes });
}
