"use client";
import { useState } from "react";
import { LIBELLE_ROLE } from "@/app/_components/admin/EnTete";
import { useAdmin, type Role } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";
import Marque from "@/app/_components/Marque";
import { genererMotDePasse } from "@/lib/motDePasse";

type Compte = { user_id: string; nom: string; email: string; role: Role; actif: boolean; doit_changer_mdp: boolean; cree_le: string; totp_actif: boolean; derniere_connexion: string | null };
const ROLES: Role[] = ["admin", "editeur", "utilisateur"];
const DESCRIPTION: Record<Role, string> = {
  admin: "Contrôle total : équipe, clés API, sécurité, journal, toutes les boîtes mail.",
  editeur: "Gère le contenu et les demandes : contact, abonnés, oppositions, boîtes communes.",
  utilisateur: "Utilise l'appli : sa propre boîte mail et son espace.",
};

export default function Equipe() {
  const [onglet, setOnglet] = useState<"liste" | "creer">("liste");
  return (
    <>
      <h1>Équipe</h1>
      <div className="onglets-pages">
        <a href="#" aria-current={onglet === "liste" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setOnglet("liste"); }}>Utilisateurs</a>
        <a href="#" aria-current={onglet === "creer" ? "page" : undefined} onClick={(e) => { e.preventDefault(); setOnglet("creer"); }}>Créer un compte</a>
      </div>
      {onglet === "liste" ? <Liste /> : <Creer />}
    </>
  );
}

function Liste() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ moi: string; comptes: Compte[] }>("/api/admin/equipe");
  const [filtre, setFiltre] = useState<Role | "">("");
  const [gere, setGere] = useState<Compte | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function action(c: Compte, body: Record<string, unknown>, confirmation?: string) {
    if (confirmation && !confirm(confirmation)) return;
    try {
      const r = await api<{ mot_de_passe?: string }>("/api/admin/equipe", { method: "PATCH", body: { user_id: c.user_id, ...body } });
      setMessage(r.mot_de_passe ? `Nouveau mot de passe provisoire pour ${c.email} : ${r.mot_de_passe} (à transmettre, il ne sera plus affiché)` : "C'est fait.");
      await recharger();
      if (gere) setGere(null);
    } catch (e) { setMessage((e as Error).message); }
  }

  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;
  const visibles = data.comptes.filter((c) => !filtre || c.role === filtre);

  if (gere) {
    const moi = gere.user_id === data.moi;
    return (
      <div className="card" style={{ maxWidth: 720 }}>
        <p><button className="lien" onClick={() => setGere(null)}>← Retour</button></p>
        <h2 style={{ marginTop: 0 }}>{gere.nom}</h2>
        <p className="meta">{gere.email} · créé le {dateHeure(gere.cree_le)} · {gere.actif ? "actif" : "suspendu"} · second facteur {gere.totp_actif ? "activé" : "à activer"}</p>
        <label>Rôle</label>
        <div className="cartes-roles">
          {ROLES.map((r) => (
            <button key={r} type="button" className="carte-role" aria-pressed={gere.role === r} disabled={moi}
              onClick={() => action(gere, { action: "role", role: r })}>
              <strong>{LIBELLE_ROLE[r]}</strong>{DESCRIPTION[r]}
            </button>
          ))}
        </div>
        {moi ? <p className="meta">Ton propre rôle ne peut être changé que par un autre administrateur.</p> : (
          <div className="actions" style={{ marginTop: 16 }}>
            <button className="secondaire" onClick={() => action(gere, { action: "nouveau_mdp" }, `Générer un nouveau mot de passe provisoire pour ${gere.email} ?`)}>Nouveau mot de passe</button>
            <button className="secondaire" onClick={() => action(gere, { action: "reinit_totp" }, `Réinitialiser le second facteur de ${gere.email} ?`)}>Réinitialiser le second facteur</button>
            <button className="danger" onClick={() => action(gere, { action: gere.actif ? "suspendre" : "reactiver" })}>{gere.actif ? "Suspendre" : "Réactiver"}</button>
          </div>
        )}
        {message && <p className="meta">{message}</p>}
      </div>
    );
  }

  return (
    <>
      <div className="onglets-pages">
        {([["", "Tous"], ...ROLES.map((r) => [r, LIBELLE_ROLE[r]])] as [Role | "", string][]).map(([v, l]) => (
          <a key={v || "tous"} href="#" aria-current={filtre === v ? "page" : undefined} onClick={(e) => { e.preventDefault(); setFiltre(v); }}>{l}</a>
        ))}
      </div>
      {message && <p className="meta">{message}</p>}
      <div className="defile">
        <table className="stats">
          <thead><tr><th>Nom</th><th>Adresse</th><th>Rôle</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {visibles.map((c) => (
              <tr key={c.user_id}>
                <td><strong>{c.nom}</strong>{c.user_id === data.moi && <span className="meta"> (toi)</span>}</td>
                <td>{c.email}</td>
                <td><span className={`badge-role ${c.role}`}>{LIBELLE_ROLE[c.role]}</span></td>
                <td>{c.actif ? <span className="ok">Actif</span> : <span className="meta">Suspendu</span>}{c.actif && c.doit_changer_mdp && <span className="meta"> · 1re connexion à faire</span>}</td>
                <td className="actions" style={{ flexWrap: "nowrap" }}>
                  <button className="lien" onClick={() => { setMessage(null); setGere(c); }}>Gérer</button>
                  {c.user_id !== data.moi && <> · <button className="lien" onClick={() => action(c, { action: c.actif ? "suspendre" : "reactiver" })}>{c.actif ? "Suspendre" : "Réactiver"}</button></>}
                </td>
              </tr>
            ))}
            {visibles.length === 0 && <tr><td colSpan={5} className="meta">Aucun compte pour ce rôle.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Creer() {
  const { api } = useAdmin();
  const [f, setF] = useState({ nom: "", identifiant: "", sousDomaine: false, sous_domaine: "", role: "editeur" as Role, mot_de_passe: "" });
  const [cree, setCree] = useState<{ nom: string; email: string; role: Role; mot_de_passe: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copie, setCopie] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const domaine = f.sousDomaine ? `${f.sous_domaine || "sous-domaine"}.dataparl.fr` : "dataparl.fr";

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setEnvoi(true);
    try {
      const r = await api<{ compte: { nom: string; email: string; role: Role }; mot_de_passe: string }>("/api/admin/equipe", {
        method: "POST",
        body: { nom: f.nom, identifiant: f.identifiant, sous_domaine: f.sousDomaine ? f.sous_domaine : undefined, role: f.role, mot_de_passe: f.mot_de_passe || undefined },
      });
      setCree({ ...r.compte, mot_de_passe: r.mot_de_passe });
      setCopie(false);
      setF({ ...f, nom: "", identifiant: "", mot_de_passe: "" });
    } catch (e) { setErr((e as Error).message); }
    setEnvoi(false);
  }

  function copier() {
    if (!cree) return;
    const txt = `DataParl' : tes identifiants\nAdresse : ${cree.email}\nMot de passe provisoire : ${cree.mot_de_passe}\nRôle : ${LIBELLE_ROLE[cree.role]}\nConnexion : https://admin.dataparl.fr\n\nTu choisiras ton propre mot de passe à la première connexion, puis tu activeras le second facteur (application d'authentification).`;
    navigator.clipboard?.writeText(txt).then(() => setCopie(true));
  }

  return (
    <div className="deux-colonnes">
      <form className="card" onSubmit={creer}>
        <h2 style={{ marginTop: 0 }}>Créer un compte</h2>
        <p className="meta">Crée une adresse @dataparl.fr pour un membre de l&apos;équipe : elle sert à la fois d&apos;identifiant et de boîte mail dans la messagerie.</p>
        <label htmlFor="c-nom">Nom affiché</label>
        <input id="c-nom" type="text" required value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} placeholder="Marie de DataParl'" />
        <label htmlFor="c-id">Identifiant (avant le @)</label>
        <input id="c-id" type="text" required value={f.identifiant} onChange={(e) => setF({ ...f, identifiant: e.target.value.replace(/[^a-z0-9.-]/gi, "").toLowerCase() })} placeholder="marie" />
        <label className="check"><input type="checkbox" checked={f.sousDomaine} onChange={(e) => setF({ ...f, sousDomaine: e.target.checked })} /> Adresse sur un sous-domaine (prenom@sous-domaine.dataparl.fr)</label>
        {f.sousDomaine && <>
          <input type="text" aria-label="Sous-domaine" value={f.sous_domaine} onChange={(e) => setF({ ...f, sous_domaine: e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase() })} placeholder="staff" />
          <p className="meta">Pour recevoir et envoyer des emails, ce sous-domaine doit aussi être déclaré chez Resend (enregistrements DNS). La connexion à l&apos;espace équipe fonctionne sans.</p>
        </>}
        <label>Rôle</label>
        <div className="cartes-roles">
          {ROLES.map((r) => (
            <button key={r} type="button" className="carte-role" aria-pressed={f.role === r} onClick={() => setF({ ...f, role: r })}>
              <strong>{LIBELLE_ROLE[r]}</strong>{DESCRIPTION[r]}
            </button>
          ))}
        </div>
        <label htmlFor="c-mdp">Mot de passe provisoire</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input id="c-mdp" type="text" className="mono" value={f.mot_de_passe} onChange={(e) => setF({ ...f, mot_de_passe: e.target.value })} placeholder="vide = généré automatiquement" autoComplete="off" />
          <button type="button" className="secondaire" style={{ marginTop: 0, whiteSpace: "nowrap" }} onClick={() => setF({ ...f, mot_de_passe: genererMotDePasse() })}>Générer</button>
        </div>
        <p className="apercu-adresse">Adresse : <strong>{(f.identifiant || "…")}@{domaine}</strong></p>
        {err && <p className="erreur">{err}</p>}
        <button disabled={envoi}>{envoi ? "Création…" : "Créer le compte"}</button>
      </form>

      <div style={{ display: "grid", gap: 20 }}>
        <div className={`card ${cree ? "recap-cree" : ""}`}>
          <h2 style={{ marginTop: 0 }}>Compte créé</h2>
          {cree ? <>
            <p><strong>{cree.nom}</strong><br />{cree.email}<br /><span className={`badge-role ${cree.role}`}>{LIBELLE_ROLE[cree.role]}</span></p>
            <p>Mot de passe provisoire : <code className="mono">{cree.mot_de_passe}</code></p>
            <button onClick={copier}>{copie ? "Copié" : "Copier les identifiants"}</button>
            <p className="meta">Ce mot de passe ne sera plus affiché. La personne le remplacera à sa première connexion, puis activera son second facteur.</p>
          </> : <p className="meta">Le récapitulatif apparaît ici après la création.</p>}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Chartes de marque</h2>
          <p className="meta">Les marques de la famille DataParl&apos;, à utiliser sur VigiParl&apos; et MixiParl&apos;.</p>
          <div style={{ display: "grid", gap: 18, marginTop: 12 }}>
            <Marque prefixe="Vigi" couleur="vigi" />
            <Marque prefixe="Mixi" couleur="mixi" />
          </div>
        </div>
      </div>
    </div>
  );
}
