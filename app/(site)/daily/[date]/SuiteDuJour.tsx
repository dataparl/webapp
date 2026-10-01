"use client";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import ListeMouvements from "@/app/_components/ListeMouvements";
import type { MouvementAffiche } from "@/lib/format";
import { authBrowser } from "@/lib/supabaseBrowser";

const NOMS: Record<string, string> = { assemblee: "Assemblée nationale", senat: "Sénat", europarl: "Parlement européen" };

// Au-delà des mouvements libres : la liste complète du jour, pour les comptes.
export default function SuiteDuJour({ date, reste }: { date: string; reste: number }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [tous, setTous] = useState<MouvementAffiche[] | null>(null);
  const [erreur, setErreur] = useState(false);

  useEffect(() => { authBrowser().auth.getSession().then(({ data }) => setSession(data.session)); }, []);
  useEffect(() => {
    if (!session) return;
    fetch(`/api/mouvements?depuis=${date}&jusqua=${date}&limit=500`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setTous(d.mouvements))
      .catch(() => setErreur(true));
  }, [session, date]);

  const suite = `/connexion?suite=${encodeURIComponent(`/daily/${date}`)}`;
  if (session === undefined) return null;
  if (!session) {
    return (
      <div className="bandeau-suite">
        <p><strong>+ {reste.toLocaleString("fr-FR")} autre{reste > 1 ? "s" : ""} mouvement{reste > 1 ? "s" : ""} ce jour-là.</strong>{" "}
          Connectez-vous pour les voir tous : c&apos;est gratuit.</p>
        <a className="btn" href={suite}>Créer un compte gratuit</a>{" "}
        <a className="btn secondaire" href={suite}>Se connecter</a>
      </div>
    );
  }
  if (erreur) return <p className="erreur">La liste complète n&apos;a pas pu être chargée. Réessaie dans un instant.</p>;
  if (!tous) return <p className="meta">Chargement de tous les mouvements du jour…</p>;
  return (
    <section>
      <h2>Tous les mouvements du jour ({tous.length.toLocaleString("fr-FR")})</h2>
      {Object.keys(NOMS).map((c) => {
        const ms = tous.filter((m) => m.chambre === c);
        return ms.length ? <div key={c}><h3>{NOMS[c]}</h3><ListeMouvements mouvements={ms} /></div> : null;
      })}
    </section>
  );
}
