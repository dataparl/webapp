"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Tableur from "@/app/_components/Tableur";
import VideoDeblocage from "@/app/_components/VideoDeblocage";
import { authBrowser } from "@/lib/supabaseBrowser";

// Accès à une feuille du tableur DataParl' Sheets : connexion DataParl'
// requise, puis déblocage par une courte vidéo publicitaire (l'équipe passe
// directement). Les données ne quittent le serveur qu'après le déblocage ;
// seules les personnes de l'équipe reçoivent la grille modifiable.

type Contenu = {
  titre: string;
  description: string;
  provenance: string;
  entetes: string[];
  donnees: (string | number | null)[][];
  modifiable: boolean;
};

export default function FeuilleGate({ id, titre }: { id: string; titre: string }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [contenu, setContenu] = useState<Contenu | null>(null);
  const [etat, setEtat] = useState<"chargement" | "verrouillee" | "erreur">("chargement");

  useEffect(() => {
    authBrowser().auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  const charger = useCallback(async () => {
    if (!session) return;
    setContenu(null);
    setEtat("chargement");
    const r = await fetch(`/api/sheets/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    }).catch(() => null);
    if (r?.ok) { setContenu((await r.json()) as Contenu); setEtat("chargement"); return; }
    if (r?.status === 403) { setEtat("verrouillee"); return; }
    setEtat("erreur");
  }, [session, id]);

  useEffect(() => { charger(); }, [charger]);

  if (session === undefined) return <p className="meta">Chargement…</p>;

  if (!session) {
    return (
      <div className="card">
        <h2>Connexion requise</h2>
        <p style={{ marginTop: 0 }}>
          La feuille <strong>{titre}</strong> est en libre accès pour les comptes DataParl&apos;.
          L&apos;utilisateur doit être connecté pour la consulter.
        </p>
        <a className="btn" href={`/connexion?suite=/sheets/${encodeURIComponent(id)}`}>Se connecter</a>
      </div>
    );
  }

  if (contenu) {
    return (
      <Tableur
        id={id}
        titre={contenu.titre}
        description={contenu.description}
        provenance={contenu.provenance}
        entetes={contenu.entetes}
        donnees={contenu.donnees}
        lectureSeule={!contenu.modifiable}
      />
    );
  }

  if (etat === "verrouillee") {
    return (
      <>
        <VideoDeblocage
          session={session}
          cible={`feuille:${id}`}
          objet={`La feuille « ${titre} »`}
          onDebloque={charger}
        />
      </>
    );
  }

  if (etat === "erreur") {
    return <p className="erreur">Les données sont momentanément indisponibles. Réessaie dans quelques minutes.</p>;
  }

  return <p className="meta">Chargement…</p>;
}
