// Publie le Daily du jour sur Bluesky (X : API payante — publier le même
// texte via Typefully/Buffer, ou débrancher ici quand l'accès API existe).
// Sans doublon : si le compte a déjà posté le lien du jour, on s'arrête.
// Signé DataParl' — jamais de nom personnel (règle absolue du projet).

const AUJOURDHUI = new Date().toISOString().slice(0, 10); // UTC — ajuster si besoin

const dateTitre = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

async function api(host, chemin, corps, token) {
  const r = await fetch(`https://${host}/xrpc/${chemin}`, {
    method: corps ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
    body: corps ? JSON.stringify(corps) : undefined,
  });
  if (!r.ok) throw new Error(`${chemin}: HTTP ${r.status} ${await r.text()}`);
  return r.json();
}

const ident = process.env.BSKY_IDENTIFIER;
const mdp = process.env.BSKY_APP_PASSWORD;
if (!ident || !mdp) { console.log("Secrets Bluesky absents — rien à faire."); process.exit(0); }

// 1. Session
const { accessJwt } = await api("bsky.social", "com.atproto.server.createSession", { identifier: ident, password: mdp });

// 2. Anti-doublon : le lien du jour est-il déjà dans les derniers posts ?
const flux = await api("public.api.bsky.app", "app.bsky.feed.getAuthorFeed", undefined, accessJwt)
  .catch(() => null) ?? await api("bsky.social", "app.bsky.feed.getAuthorFeed", undefined, accessJwt);
const dejaPoste = (flux.feed ?? []).some((p) => (p.post?.record?.text ?? "").includes(AUJOURDHUI));
if (dejaPoste) { console.log("Le Daily d'aujourd'hui est déjà publié."); process.exit(0); }

// 3. Les mouvements du jour (page publique — parsée du titre, sans API privée)
const LIEN = `${process.env.LIENS_BASE}/daily-bsky/${AUJOURDHUI}`;
const page = await fetch(`${process.env.DAILY_BASE}/${AUJOURDHUI}`).then((r) => r.text());
const m = page.match(/(\d+)\s+mouvements?/);
const total = m ? parseInt(m[1], 10) : 0;
if (!total) { console.log("Aucun mouvement publié aujourd'hui — on ne publie rien."); process.exit(0); }
const an = (page.match(/(\d+) à l'Assemblée/) || [])[1] ?? "?";
const senat = (page.match(/(\d+) au Sénat/) || [])[1] ?? "?";

const texte = [
  `Daily #Parlement du ${dateTitre(AUJOURDHUI)} 📋`,
  ``,
  `${total} mouvements dans les équipes parlementaires : ${an} à l'Assemblée, ${senat} au Sénat.`,
  ``,
  `Qui a rejoint qui ? Qui part ? Les réponses, tirées des listes officielles 👇`,
  LIEN,
].join("\n");

// 4. Publication
await api("bsky.social", "com.atproto.repo.createRecord", {
  repo: ident, collection: "app.bsky.feed.post",
  record: { text: texte, createdAt: new Date().toISOString() },
}, accessJwt);
console.log("Publié sur Bluesky.\n" + texte);
