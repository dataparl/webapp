"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { sessionActuelle } from "@/lib/supabaseBrowser";
import { CHAMBRES, DOMAINES_PARLEMENT, domaineAutorise } from "@/lib/jobs";

// Proposer une offre — connexion DataParl' obligatoire, et l'email du compte
// doit appartenir à un domaine parlementaire (voir lib/jobs.ts). L'offre part
// en file de revue : rien n'est publié sans validation humaine.

export default function Proposer() {
  type SessionDP = NonNullable<Awaited<ReturnType<typeof sessionActuelle>>>;
  const [session, setSession] = useState<SessionDP | null | undefined>(undefined);

  useEffect(() => {
    sessionActuelle().then((s) => setSession(s));
  }, []);

  if (session === undefined) return <p className="meta">Chargement…</p>;

  return (
    <>
      <h1>Proposer une offre</h1>
      <p className="lead">Ton offre sera relue par l'équipe avant publication — elle n'apparaît pas immédiatement.</p>
      {!session ? (
        <div className="card" style={{ marginTop: "24px" }}>
          <p style={{ marginTop: 0 }}>
            <strong>Connexion requise.</strong> Connecte-toi avec ton compte DataParl' pour proposer une offre.
          </p>
          <p>
            <a className="btn" href="/connexion?suite=/jobs/proposer">Se connecter ou créer un compte</a>
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: 0 }}>
            Seules les adresses parlementaires peuvent déposer une offre :
            {" "}{DOMAINES_PARLEMENT.join(", ")}.
          </p>
        </div>
      ) : !domaineAutorise(session.user.email ?? "") ? (
        <div className="card" style={{ marginTop: "24px" }}>
          <p style={{ marginTop: 0 }}>
            <strong>Adresse parlementaire requise.</strong> Le compte connecté ({session.user.email}) n'appartient
            pas à un domaine parlementaire, donc il ne peut pas proposer d'offre.
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: 0 }}>
 
           Domaines acceptés : {DOMAINES_PARLEMENT.join(", ")}. Les sous-domaines de ces domaines sont également acceptés.
          </p>
        </div>
      ) : (
        <Formulaire session={session} />
      )}
    </>
  );
}

function Formulaire({ session }: { session: SessionDP }) {
  const [f, setF] = useState({
    titre: "", description: "", source_url: "", type_poste: "", localisation: "",
    groupe_politique: "", chambre: "", departement: "", elu_prenom: "", elu_nom: "",
    publie_le: "", expire_le: "",
  });
  const [occupe, setOccupe] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const maj = (k: keyof typeof f) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setF({ ...f, [k]: e.target.value }),
  });

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setOccupe(true); setErreur(null); setInfo(null);
    try {
      const r = await fetch("/api/jobs/proposition", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + session.access_token },
        body: JSON.stringify(f),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erreur ?? "erreur inconnue");
      setInfo("Merci ! Ton offre est en file de revue — l'équipe la relit avant publication.");
      setF({ titre: "", description: "", source_url: "", type_poste: "", localisation: "", groupe_politique: "", chambre: "", departement: "", elu_prenom: "", elu_nom: "", publie_le: "", expire_le: "" });
    } catch (e2) { setErreur((e2 as Error).message); }
    setOccupe(false);
  }

  return (
    <form onSubmit={envoyer} style={{ marginTop: "24px", display: "grid", gap: 14, maxWidth: 640 }}>
      <label>Chambre
        <select {...maj("chambre")}>
          <option value="">—</option>
          {CHAMBRES.map((c) => <option key={c.valeu
r} value={c.valeur}>{c.libelle}</option>)}
        </select>
      </label>
      <label>Département (ex : Meurthe-et-Moselle)<input {...maj("departement")} maxLength={100} /></label>
      <label>Prénom de l'élu<input {...maj("elu_prenom")} maxLength={100} /></label>
      <label>Nom de l'élu<input {...maj("elu_nom")} maxLength={100} /></label>
      <label>Groupe / parti<input {...maj("groupe_politique")} maxLength={100} /></label>
      <label>Intitulé du poste *<input {...maj("titre")} required maxLength={300} /></label>
      <label>Description<textarea {...maj("description")} rows={6} /></label>
      <label>URL de la source *<input type="url" {...maj("source_url")} required maxLength={1000} placeholder="Lien public de l'annonce" /></label>
      <label>Type de poste<input {...maj("type_poste")} maxLength={100} placeholder="CDI, stage…" /></label>
      <label>Localisation<input {...maj("localisation")} maxLength={100} /></label>
      <label>Publiée le<input type="date" {...maj("publie_le")} /></label>
      <label>Expire le<input type="date" {...maj("expire_le")} /></label>
      {erreur && <p className="erreur">{erreur}</p>}
      {info && <p className="meta">{info}</p>}
      <p style={{ color: "#6b7280", fontSize: "0.82rem", margin: 0 }}>
        Déposé avec l'adresse {session.user.email} — conservée en note interne de revue, jamais publiée.
      </p>
      <button type="submit" disabled={occupe}>{occupe ? "Envoi…" : "Envoyer en revue"}</button>
    </form>
  );
}
