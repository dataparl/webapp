"use client";

import { useMemo, useState } from "react";

type Champs = { chambre: string; type: string; source: string; depuis: string; jusqua: string; elu: string; collab: string; groupe: string; limit: string };

export default function Playground() {
  const [cle, setCle] = useState("");
  const [f, setF] = useState<Champs>({ chambre: "", type: "", source: "", depuis: "", jusqua: "", elu: "", collab: "", groupe: "", limit: "20" });
  const [resultat, setResultat] = useState<string>("");
  const [enCours, setEnCours] = useState(false);

  const url = useMemo(() => {
    const p = new URLSearchParams();
    if (f.chambre) p.set("chambre", f.chambre);
    if (f.type) p.set("type", f.type);
    if (f.source) p.set("source", f.source);
    if (f.depuis) p.set("depuis", f.depuis);
    if (f.jusqua) p.set("jusqua", f.jusqua);
    if (f.elu) p.set("elu", f.elu.trim());
    if (f.collab) p.set("collab", f.collab.trim());
    if (f.groupe) p.set("groupe", f.groupe.trim());
    if (f.limit) p.set("limit", f.limit);
    const qs = p.toString();
    return `https://api.dataparl.fr/v1/mouvements${qs ? "?" + qs : ""}`;
  }, [f]);

  const curl = `curl -H "Authorization: Bearer dp_ta_cle" "${url}"`;

  async function essayer() {
    if (!cle.startsWith("dp_")) {
      setResultat("Entre une clé commençant par dp_ — gratuite sur /request-access.");
      return;
    }
    setEnCours(true);
    setResultat("");
    try {
      const r = await fetch(url, { headers: { Authorization: `Bearer ${cle}` } });
      const corps = await r.text();
      let affiche = corps;
      try { affiche = JSON.stringify(JSON.parse(corps), null, 2); } catch { /* texte brut */ }
      setResultat(`HTTP ${r.status}\n\n${affiche}`);
    } catch (e) {
      setResultat(`Requête impossible : ${String(e)}`);
    } finally {
      setEnCours(false);
    }
  }

  const champ = (label: string, clef: keyof Champs, aide?: string) => (
    <label style={{ display: "block", marginBottom: "0.75rem" }}>
      <span style={{ display: "block", fontSize: "0.9em" }}>{label}</span>
      <input value={f[clef]} onChange={(e) => setF({ ...f, [clef]: e.target.value })} placeholder={aide ?? ""} style={{ width: "100%" }} />
    </label>
  );

  return (
    <div>
      <h2>Filtres</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0 1.5rem" }}>
        {champ("Chambre", "chambre", "assemblee | senat | europarl")}
        {champ("Type", "type", "arrivee | depart | transfert")}
        {champ("Source", "source", "suivi | archives")}
        {champ("Depuis (AAAA-MM-JJ)", "depuis")}
        {champ("Jusqu'à (AAAA-MM-JJ)", "jusqua")}
        {champ("Élu", "elu", "PA…, matricule Sénat, identifiant PE")}
        {champ("Collaborateur", "collab", "nom ou prénom, partiel")}
        {champ("Groupe", "groupe", "ex. GEST, LR")}
        {champ("Limite", "limit", "1 à 500")}
      </div>
      <h2>Ta clé</h2>
      <label style={{ display: "block", marginBottom: "0.75rem" }}>
        <span style={{ display: "block", fontSize: "0.9em" }}>Clé API (dp_…)</span>
        <input type="password" value={cle} onChange={(e) => setCle(e.target.value)} placeholder="dp_…" style={{ width: "100%" }} />
      </label>
      <button className="btn" onClick={essayer} disabled={enCours}>{enCours ? "Requête en cours…" : "Exécuter la requête"}</button>{" "}
      <span className="meta" style={{ marginLeft: "0.5rem" }}>La clé reste dans ton navigateur.</span>

      <h2>Requête équivalente</h2>
      <pre>{curl}</pre>

      <h2>Réponse</h2>
      <pre aria-live="polite" style={{ maxHeight: "24rem", overflow: "auto" }}>{resultat || "Le résultat apparaîtra ici."}</pre>
    </div>
  );
}
