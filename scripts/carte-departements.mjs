// Génère lib/carteDepartements.ts : contours SVG des 96 départements
// métropolitains, simplifiés (Douglas-Peucker) et projetés (équirectangulaire
// corrigée par la latitude moyenne). Source : gregoiredavid/france-geojson
// (departements-version-simplifiee.geojson, licence ouverte).
// Usage : node scripts/carte-departements.mjs deps.geojson > lib/carteDepartements.ts
import { readFileSync } from "node:fs";

const geojson = JSON.parse(readFileSync(process.argv[2] ?? "deps.geojson", "utf8"));
const COS = Math.cos((46.6 * Math.PI) / 180);
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const f of geojson.features)
  for (const ring of f.geometry.coordinates)
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon; if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat; if (lat > maxLat) maxLat = lat;
    }
const S = 1000 / ((maxLon - minLon) * COS);
const proj = ([lon, lat]) => [+((lon - minLon) * COS * S).toFixed(1), +((maxLat - lat) * S).toFixed(1)];

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let dmax = 0, idx = 0;
  const [x1, y1] = pts[0], [x2, y2] = pts[pts.length - 1];
  const dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1e-9;
  if (n < 1e-6) return [pts[0], ...pts.slice(1, -1), pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / n;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [pts[0], pts[pts.length - 1]];
  return [...rdp(pts.slice(0, idx + 1), eps).slice(0, -1), ...rdp(pts.slice(idx), eps)];
}

const slug = (nom) => nom.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
  .replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EPS = 0.6;
const deps = [];
for (const f of geojson.features) {
  const contours = f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.coordinates.map((p) => p[0]);
  const rings = contours.map((ring) => {
    const pts = ring.map(proj);
    const ferme = pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
    const ouverts = ferme ? pts.slice(0, -1) : pts;
    const simples = ouverts.length < 3 ? ouverts : rdp(ouverts, EPS);
    const res = ferme && simples.length ? [...simples, simples[0]] : simples;
    return res.filter((p, i, a) => i === 0 || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
  });
  const d = rings.map((r) => `M${r.map((p) => p.join(",")).join("L")}Z`).join("");
  deps.push({ code: f.properties.code, nom: f.properties.nom, slug: slug(f.properties.nom), d });
}
deps.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
const head = `// GÉNÉRÉ par scripts/carte-departements.mjs — ne pas modifier à la main.
// Contours SVG des 96 départements métropolitains (viewBox "0 0 1000 ${Math.round((maxLat - minLat) * S)}"),
// simplification Douglas-Peucker (eps ${EPS}), projection équirectangulaire corrigée.
// Source : gregoiredavid/france-geojson (départements simplifiés, licence ouverte).
export const VIEWBOX = "0 0 1000 ${Math.round((maxLat - minLat) * S)}";
export type DepartementCarte = { code: string; nom: string; slug: string; d: string };
export const DEPARTEMENTS: DepartementCarte[] = ${JSON.stringify(deps)};
`;
process.stdout.write(head);
