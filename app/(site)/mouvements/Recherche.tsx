"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import ListeMouvements from "@/app/_components/ListeMouvements";
import { CHAMBRE_LONG, type MouvementAffiche } from "@/lib/format";
import { authBrowser } from "@/lib/supabaseBrowser";

type Elu = { chambre: string; cle: string; id: string; nom: string; groupe: string };
type Ref = { elus: Elu[]; groupes: Record<string, string[]> };

const PAGE = 50;

export default function Recherche({ chambre }: { chambre?: "assemblee" | "senat" | "europarl" }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [ref, setRef] = useState<Ref>({ elus: [], groupes: {} });
  const [filtres, setFiltres] = useState<Record<string, string>>({ chambre: chambre ?? "" });
  const [eluSaisi, setEluSaisi] = useState("");
  const [resultats, setResultats] = useState<MouvementAffiche[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [etat, setEtat] = useState<"idle" | "chargement" | "erreur">("idle");

  useEffect(() => { authBrowser().auth.getSession().then(({ data }) => setSession(data.session)); }, []);
  useEffect(() => { fetch("/api/referentiel").then((r) => (r.ok ? r.json() : null)).then((d) => d && setRef(d)); }, []);

  const chambreActive = chambre ?? filtres.chambre ?? "";
  const elusFiltres = useMemo(() => ref.elus.filter((e) => !chambreActive || e.chambre === chambreActive), [ref, chambreActive]);
  const groupes = useMemo(
    () => (chambreActive ? ref.groupes[chambreActive] ?? [] : [...new Set(Object.values(ref.groupes).flat())].sort()),
    [ref, chambreActive],
  );
  const libelleElu = (e: Elu) => `${e.nom} (${CHAMBRE_LONG[e.chambre]}${e.groupe ? `, ${e.groupe}` : ""})`;

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
    return (
      <div className="card" style={{ maxWidth: "none" }}>
        <p style={{ marginTop: 0 }}>
          <strong>La recherche complète est réservée aux comptes DataParl&apos;.</strong> C&apos;est gratuit : tout
          l&apos;historique depuis 2015, les filtres par élu, groupe et date, et les alertes.
        </p>
        <a className="btn" href="/connexion?suite=/mouvements">Créer un compte gratuit</a>{" "}
        <a className="btn secondaire" href="/connexion?suite=/mouvements">Se connecter</a>
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
              <select id="chambre" value={filtres.chambre ?? ""} onChange={(e) => { maj("chambre", e.target.value); maj("groupe", ""); maj("elu", ""); setEluSaisi(""); }}>
                <option value="">Les trois</option>
                <option value="assemblee">Assemblée nationale</option>
                <option value="senat">Sénat</option>
                <option value="europarl">Parlement européen</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="groupe">Groupe</label>
            <select id="groupe" value={filtres.groupe ?? ""} onChange={(e) => maj("groupe", e.target.value)}>
              <option value="">Tous</option>
              {groupes.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
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
        <input
          id="elu"
          list="liste-elus"
          placeholder="Commence à taper un nom"
          value={eluSaisi}
          onChange={(e) => {
            setEluSaisi(e.target.value);
            const trouve = elusFiltres.find((x) => libelleElu(x) === e.target.value);
            maj("elu", trouve ? trouve.cle : "");
          }}
        />
        <datalist id="liste-elus">
          {elusFiltres.map((e) => <option key={`${e.chambre}-${e.cle}`} value={libelleElu(e)} />)}
        </datalist>

        <button type="submit" disabled={etat === "chargement"}>Rechercher</button>{" "}
        <button
          type="button"
          className="secondaire"
          onClick={() => { setFiltres({ chambre: chambre ?? "" }); setEluSaisi(""); }}
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
