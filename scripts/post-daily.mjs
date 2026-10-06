// Publication automatique du Daily via l'API Buffer (X + Bluesky).
// Zéro geste quotidien : ce script tourne dans GitHub Actions chaque matin.
// Signé DataParl' — jamais de nom personnel (règle absolue du projet).
// Idempotent : si le lien du jour figure déjà dans un post récent, on s'arrête.

const AUJOURDHUI = new Date().toISOString().slice(0, 10); // UTC

const dateTitre = (iso) =>
  new Date(iso + "T12:00:00Z").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

// ---- 10 gabarits en rotation (jour du mois → gabarit) ----
const gabarits = [
  (t, a, s) => `${t} mouvements dans les équipes parlementaires : ${a} à l'Assemblée, ${s} au Sénat. Qui a rejoint qui ? Tout est là 👇`,
  (t) => `Un(e) collaborateur(-trice) a changé d'équipe aujourd'hui. Lequel ou laquelle — et pour quel élu ? Réponse dans le Daily 👇`,
  () => `Le point du matin sur les équipes parlementaires est en ligne 👇`,
  (t, a, s) => `Aujourd'hui au Parlement : ${a} à l'Assemblée, ${s} au Sénat. Détail chambre par chambre 👇`,
  () => `Qui travaille pour vos élus ? La réponse du jour, tirée des listes officielles 👇`,
  () => `Les listes officielles des collaborateurs parlementaires ont été mises à jour : voici qui arrive, qui part 👇`,
  (t, a, s, d) => `Daily #Parlement du ${d} 📋 Les mouvements du jour, vérifiés à la source 👇`,
  (t, a, s) => `Côté Assemblée : ${a} mouvements aujourd'hui. Côté Sénat : ${s}. Le détail 👇`,
  (t) => `+${t} parcours reconstitués aujourd'hui. L'historique complet depuis 2015 👇`,
  (t, a, s, d) => `Mouvements de collaborateurs parlementaires du ${d} : arrivées, départs, transferts. Source : listes officielles 👇`,
];
const gabarit = gabarits[(Number(AUJOURDHUI.slice(8, 10)) - 1) % gabarits.length];
const hashtags = (reseau) => reseau === "x"
  ? "\n\n#AssembléeNationale #Sénat #Parlement #transparence"
  : "\n\n#AssembléeNationale #Sénat #Parlement #transparence";

(async () => {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) throw new Error("BUFFER_ACCESS_TOKEN manquant (GitHub Secrets)");

  // 1. Les chiffres du jour depuis la page publique du Daily
  const page = await fetch(`${process.env.DAILY_BASE}/${AUJOURDHUI}`).then((r) => r.text());
  const total = parseInt((page.match(/(\d+)\s+mouvements?/) || [])[1] ?? "0", 10);
  if (!total) { console.log("Aucun mouvement publié aujourd'hui — rien à publier."); return; }
  const an = (page.match(/(\d+) à l'Assemblée/) || [])[1] ?? "?";
  const senat = (page.match(/(\d+) au Sénat/) || [])[1] ?? "?";

  // 2. Les profils Buffer (X et Bluesky)
  const profilsRes = await fetch(`https://api.bufferapp.com/1/profiles.json?access_token=${token}`);
  if (!profilsRes.ok) throw new Error(`profiles.json: HTTP ${profilsRes.status}`);
  const profils = await profilsRes.json();
  const profil = (service) => profils.find((p) => p.service === service);
  const px = profil("twitter"); // X
  const pb = profil("bluesky");
  if (!px || !pb) throw new Error("Profils introuvables : connecter X et Bluesky dans Buffer (" + profils.map(p => p.service).join(", ") + ")");

  // 3. Anti-doublon : le lien du jour est-il déjà en file ou publié ?
  const envoyes = await fetch(`https://api.bufferapp.com/1/profiles/${px.id}/updates/sent.json?count=20&access_token=${token}`).then((r) => r.json()).catch(() => ({ updates: [] }));
  const enAttente = await fetch(`https://api.bufferapp.com/1/profiles/${px.id}/updates/pending.json?count=20&access_token=${token}`).then((r) => r.json()).catch(() => ({ updates: [] }));
  const deja = [...(envoyes.updates ?? []), ...(enAttente.updates ?? [])].some((u) => (u.text ?? "").includes(AUJOURDHUI));
  if (deja) { console.log("Le Daily d'aujourd'hui est déjà programmé/publié — on s'arrête."); return; }

  // 4. Publication (12:00 Paris) via l'API Buffer
  const publier = async (profilId, reseau, lien) => {
    const texte = gabarit(total, an, senat, dateTitre(AUJOURDHUI)) + hashtags(reseau) + "\n" + lien;
    const corps = new URLSearchParams({
      profile_ids: JSON.stringify([profilId]), text: texte,
      scheduled_at: String(Math.floor(new Date(`${AUJOURDHUI}T10:00:00Z`).getTime() / 1000)), // 12:00 Paris
    });
    const r = await fetch(`https://api.bufferapp.com/1/updates/create.json?access_token=${token}`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: corps,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === false) throw new Error(`Buffer (${reseau}): HTTP ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
    console.log(`Programmé sur ${reseau} → ${lien}`);
  };

  await publier(px.id, "x", `${process.env.LIENS_BASE}/daily-x/${AUJOURDHUI}`);
  await publier(pb.id, "bluesky", `${process.env.LIENS_BASE}/daily-bsky/${AUJOURDHUI}`);
  console.log("Daily programmé sur X et Bluesky via Buffer.");
})().catch((e) => { console.error(e.message); process.exit(1); });
