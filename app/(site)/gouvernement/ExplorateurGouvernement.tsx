"use client";

import { useMemo, useState } from "react";
import { prenomNom } from "@/lib/format";
import { LIBELLE_FONCTION, categorieFonction, normaliseNom, periode, type MandatMinistre, type MembreCabinet } from "@/lib/gouvernementTypes";

const hrefM = (id: string) => "/gouvernement/m/" + encodeURIComponent(id);
const hrefC = (cle: string) => "/gouvernement/c/" + encodeURIComponent(cle);

// Explorateur des gouvernements : recherche transversale par nom (ministre ou
// membre de cabinet), filtres par fonction, gouvernement et statut. Sans
// filtre, la chronologie repliable par gouvernement reste affichée.
export default function ExplorateurGouvernement({ mandats, cabinets }: { mandats: MandatMinistre[]; cabinets: MembreCabinet[] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [statut, setStatut] = useState("");
  const [gouv, setGouv] = useState("");

  const mandatParId = useMemo(() => new Map(mandats.map((m) => [m.id, m])), [mandats]);
  const cabinetsParMinistre = useMemo(() => {
    const m = new Map<string, MembreCabinet[]>();
    for (const c of cabinets) {
      const l = m.get(c.ministre_id) ?? [];
      l.push(c);
      m.set(c.ministre_id, l);
    }
    return m;
  }, [cabinets]);

  const gouvernements = useMemo(() => {
    const debut = new Map<string, string>();
    for (const m of mandats) {
      const g = m.gouvernement || "Autres mandats";
      if (!debut.has(g) || m.debut > debut.get(g)!) debut.set(g, m.debut);
    }
    return [...debut.keys()].sort((a, b) => debut.get(b)!.localeCompare(debut.get(a)!));
  }, [mandats]);

  const jetons = normaliseNom(q).split(" ").filter(Boolean).slice(0, 6);
  const cherche = jetons.length > 0;
  const filtre = cherche || cat !== "" || statut !== "" || gouv !== "";

  const ministresTrouves = filtre
    ? mandats.filter((m) => {
        if (gouv && (m.gouvernement || "Autres mandats") !== gouv) return false;
        if (statut === "en-poste" && m.fin) return false;
        if (statut === "anciens" && !m.fin) return false;
        if (!cherche) return true;
        const sable = normaliseNom([m.prenom, m.nom, m.portefeuille, m.fonction, m.gouvernement].join(" "));
        return jetons.every((j) => sable.includes(j));
      }).sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    : [];

  const cabinetsTrouves = filtre
    ? cabinets.filter((c) => {
        if (cat && categorieFonction(c.fonction) !== cat) return false;
        const m = mandatParId.get(c.ministre_id);
        if (gouv && (!m || (m.gouvernement || "Autres mandats") !== gouv)) return false;
        if (statut === "en-poste" && c.fin) return false;
        if (statut === "anciens" && !c.fin) return false;
        if (!cherche) return true;
        const sable = normaliseNom([c.collab_prenom, c.collab_nom, c.fonction, m?.prenom, m?.nom, m?.portefeuille, m?.gouvernement].join(" "));
        return jetons.every((j) => sable.includes(j));
      }).sort((a, b) => a.collab_nom.localeCompare(b.collab_nom, "fr"))
    : [];

  const aucun = filtre && ministresTrouves.length === 0 && cabinetsTrouves.length === 0;

  return (
    <>
      <div>
        <label htmlFor="gouv-q">
          <strong>Rechercher un ministre ou un membre de cabinet</strong>{" "}
          <span className="meta">(nom, fonction, portefeuille, gouvernement — insensible aux accents)</span>
        </label>
        <input
          id="gouv-q" type="search" value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex. : Darmanin, directeur de cabinet, Intérieur, Bayrou…"
          style={{ width: "min(100%, 480px)", fontSize: "1em", padding: "8px 10px", display: "block", marginTop: 6 }}
        />
        <p style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Fonction{" "}
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="">Toutes</option>
              {Object.entries(LIBELLE_FONCTION).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label>
            Gouvernement{" "}
            <select value={gouv} onChange={(e) => setGouv(e.target.value)}>
              <option value="">Tous</option>
              {gouvernements.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            Statut{" "}
            <select value={statut} onChange={(e) => setStatut(e.target.value)}>
              <option value="">Tous</option>
              <option value="en-poste">En poste</option>
              <option value="anciens">Anciens</option>
            </select>
          </label>
          {filtre && (
            <button type="button" onClick={() => { setQ(""); setCat(""); setStatut(""); setGouv(""); }}>
              Réinitialiser
            </button>
          )}
        </p>
      </div>

      {filtre ? (
        <>
          <h2>Résultats</h2>
          {aucun && (
            <p className="meta">
              Aucun résultat. Essayez un nom de famille seul, ou vérifiez l’orthographe : les nominations sont publiées au JORF
              sous le nom exact de la personne.
            </p>
          )}
          {ministresTrouves.length > 0 && (
            <>
              <h3>Ministres ({ministresTrouves.length})</h3>
              <ul className="gouvernement">
                {ministresTrouves.slice(0, 200).map((m) => (
                  <li key={m.id}>
                    <a href={hrefM(m.id)}>{prenomNom(m.prenom, m.nom)}</a>{" "}
                    <span className="meta">— {m.portefeuille || m.fonction} · {m.gouvernement} · {periode(m.debut, m.fin)}</span>
                  </li>
                ))}
              </ul>
              {ministresTrouves.length > 200 && <p className="meta">{ministresTrouves.length} ministres trouvés — 200 affichés, affinez la recherche.</p>}
            </>
          )}
          {cabinetsTrouves.length > 0 && (
            <>
              <h3>Membres de cabinets ({cabinetsTrouves.length})</h3>
              <ul className="gouvernement">
                {cabinetsTrouves.slice(0, 300).map((c) => {
                  const m = mandatParId.get(c.ministre_id);
                  return (
                    <li key={c.id}>
                      <a href={hrefC(c.collab_cle)}>{prenomNom(c.collab_prenom, c.collab_nom)}</a>{" "}
                      <span className="meta">
                        — {c.fonction} · cabinet de {m ? prenomNom(m.prenom, m.nom) : "—"}
                        {m?.portefeuille ? " (" + m.portefeuille + ")" : ""} · {periode(c.debut, c.fin)}
                        {c.collab_id ? " · aussi collaborateur parlementaire" : ""}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {cabinetsTrouves.length > 300 && <p className="meta">{cabinetsTrouves.length} membres trouvés — 300 affichés, affinez la recherche.</p>}
            </>
          )}
        </>
      ) : (
        <>
          <p className="meta">Ouvrez un gouvernement pour voir ses ministres, puis le cabinet de chacun. Chaque nom ouvre une fiche.</p>
          {gouvernements.map((g, i) => {
            const duGouvernement = mandats
              .filter((m) => (m.gouvernement || "Autres mandats") === g)
              .sort((a, b) => a.debut.localeCompare(b.debut));
            return (
              <details key={g} open={i === 0}>
                <summary><h2 style={{ display: "inline" }}>{g} <span className="meta">— {duGouvernement.length} ministre{duGouvernement.length > 1 ? "s" : ""}</span></h2></summary>
                <ul className="gouvernement">
                  {duGouvernement.map((m) => {
                    const equipe = cabinetsParMinistre.get(m.id) ?? [];
                    return (
                      <li key={m.id}>
                        <h3>
                          <a href={hrefM(m.id)}>{prenomNom(m.prenom, m.nom)}</a>
                          <span className="meta"> — {m.portefeuille || m.fonction} · {periode(m.debut, m.fin)}</span>
                        </h3>
                        {equipe.length === 0 ? (
                          <p className="meta">Aucune nomination identifiée au JORF pour ce mandat — cabinet non documenté, pas nécessairement inexistant (recensement en cours pour les mandats récents).</p>
                        ) : (
                          <ul>
                            {equipe.map((c) => (
                              <li key={c.id}>
                                <a href={hrefC(c.collab_cle)}>{prenomNom(c.collab_prenom, c.collab_nom)}</a>{" "}
                                <span className="meta">— {c.fonction} · {periode(c.debut, c.fin)}{c.collab_id ? " · aussi collaborateur parlementaire" : ""}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            );
          })}
        </>
      )}
    </>
  );
}
