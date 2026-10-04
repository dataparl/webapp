"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Autocompletion from "@/app/_components/Autocompletion";
import ListeMouvements from "@/app/_components/ListeMouvements";
import type { MouvementAffiche } from "@/lib/format";
import { sessionActuelle } from "@/lib/supabaseBrowser";

const PAGE = 50;

export default function Recherche({ chambre }: { chambre?: "assemblee" | "senat" | "europarl" }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [filtres, setFiltres] = useState<Record<string, string>>({ chambre: chambre ?? "" });
  const [raz, setRaz] = useState(0); // remet à zéro les champs d'autocomplétion
  const [resultats, setResultats] = useState<MouvementAffiche[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [etat, setEtat] = useState<"idle" | "chargement" | "erreur">("idle");

  useEffect(() => { sessionActuelle().then(setSession); }, []);
  // Lien direct depuis la recherche de l'accueil : /mouvements/parlement?groupe=ECO
  useEffect(() => {
    const g = new URLSearchParams(window.location.search).get("groupe");
    if (g) setFiltres((f) => ({ ...f, groupe: g }));
  }, []);

  const chambreActive = chambre ?? filtres.chambre ?? "";

  const chercher = useCallback(async (offset = 0) => {
    if (!session) return;
    setEtat("chargement");
    const p = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
    for (const [k, v] of Object.entries({ ...filtres, chambre: chambreActive })) if (v) p.set(k, v);
    const r = await fetch(`/api/mouvements?${p}`, { headers: { Authorization: `Bearer ${session.access_token}` } }).catch(() => null);
    if (!r?.ok) return setEtat("erreur");
    const data = await r.json();
    setResultats((prev) => (offset ? [...prev, ...data.mouvements] : data.mouvements));
    setTotal(data.total);
    setEtat("idle");
  }, [session, filtres, chambreActive]);

  useEffect(() => { if (session) chercher(0); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (session === undefined) return <p className="meta">Chargement…</p>;
  if (!session) {
    const suite = `/connexion?suite=${encodeURIComponent(typeof window === "undefined" ? "/mouvements" : window.location.pathname + window.location.search)}`;
    return (
      <div className="card" style={{ maxWidth: "none" }}>
        <p style={{ marginTop: 0 }}>
          <strong>La recherche complète est réservée aux comptes DataParl&apos;.</strong> C&apos;est gratuit : tout
          l&apos;historique depuis 2015, les filtres par élu, groupe et date, et les alertes.
        </p>
        <a className="btn" href={suite}>Créer un compte gratuit</a>{" "}
        <a className="btn secondaire" href={suite}>Se connecter</a>
      </div>
    );
  }

  const maj = (k: string, v: string) => setFiltres((f) => ({ ...f, [k]: v }));

  return (
    <>
      <form
        className="card filtres"
        style={{ maxWidth: "none" }}
        onSubmit={(e) => { e.preventDefault(); chercher(0); }}
      >
        <label htmlFor="q">Collaborateur ou élu</label>
        <input id="q" type="text" placeholder="ex. Dupont, Jadot…" value={filtres.q ?? ""} onChange={(e) => maj("q", e.target.value)} />

        <div className="grille-filtres">
          {!chambre && (
            <div>
              <label htmlFor="chambre">Chambre</label>
              <select id="chambre" value={filtres.chambre ?? ""} onChange={(e) => { maj("chambre", e.target.value); maj("elu", ""); setRaz((n) => n + 1); }}>
                <option value="">Les trois</option>
                <option value="assemblee">Assemblée nationale</option>
                <option value="senat">Sénat</option>
                <option value="europarl">Parlement européen</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="groupe">Groupe ou famille</label>
            <Autocompletion key={`g${raz}`} id="groupe" source="groupes" placeholder="ex. GEST, EcoS, écolo…" valeurInitiale={filtres.groupe ?? ""}
              onChoix={(o) => maj("groupe", o?.valeur ?? "")} />
          </div>
          <div>
            <label htmlFor="type">Mouvement</label>
            <select id="type" value={filtres.type ?? ""} onChange={(e) => maj("type", e.target.value)}>
              <option value="">Tous</option>
              <option value="arrivee">Arrivées</option>
              <option value="depart">Départs</option>
              <option value="transfert">Transferts</option>
            </select>
          </div>
          <div>
            <label htmlFor="depuis">Du</label>
            <input id="depuis" type="date" value={filtres.depuis ?? ""} onChange={(e) => maj("depuis", e.target.value)} />
          </div>
          <div>
            <label htmlFor="jusqua">Au</label>
            <input id="jusqua" type="date" value={filtres.jusqua ?? ""} onChange={(e) => maj("jusqua", e.target.value)} />
          </div>
          <div>
            <label htmlFor="parti">Parti</label>
            <select id="parti" disabled><option>Bientôt disponible</option></select>
          </div>
          <div>
            <label htmlFor="commission">Commission</label>
            <select id="commission" disabled><option>Bientôt disponible</option></select>
          </div>
        </div>

        <label htmlFor="elu">Élu</label>
        <Autocompletion key={`e${raz}`} id="elu" source="elus" chambre={chambreActive || undefined} placeholder="Commence à taper un nom"
          onChoix={(o) => maj("elu", o?.valeur ?? "")} />

        <button type="submit" disabled={etat === "chargement"}>Rechercher</button>{" "}
        <button
          type="button"
          className="secondaire"
          onClick={() => { setFiltres({ chambre: chambre ?? "" }); setRaz((n) => n + 1); }}
        >
          Effacer
        </button>
      </form>

      {etat === "erreur" && <p className="erreur">La recherche n&apos;a pas abouti. Réessaie.</p>}
      {total !== null && <p className="meta">{total.toLocaleString("fr-FR")} mouvement{total > 1 ? "s" : ""}</p>}
      <ListeMouvements mouvements={resultats} />
      {total !== null && resultats.length < total && (
        <button className="secondaire" onClick={() => chercher(resultats.length)} disabled={etat === "chargement"}>
          Afficher plus
        </button>
      )}
    </>
  );
}
