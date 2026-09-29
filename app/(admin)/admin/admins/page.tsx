"use client";
import { useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure, useRessource } from "@/app/_components/admin/utils";

type AdminRow = { user_id: string; github_login: string; created_at: string; totp_actif: boolean; derniere_utilisation: string | null };

export default function Admins() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ moi: string; admins: AdminRow[] }>("/api/admin/admins");
  const [login, setLogin] = useState("");
  const [etat, setEtat] = useState<string | null>(null);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    try { await api("/api/admin/admins", { method: "POST", body: { github_login: login } }); setLogin(""); setEtat("Admin ajouté. Il/elle activera son second facteur à sa prochaine visite."); recharger(); }
    catch (e) { setEtat((e as Error).message); }
  }
  async function action(a: AdminRow, act: "retirer" | "reinitialiser_totp") {
    const q = act === "retirer" ? `Retirer les droits d'admin de ${a.github_login} ?` : `Réinitialiser le second facteur de ${a.github_login} ? Il/elle devra le réactiver.`;
    if (!confirm(q)) return;
    await api("/api/admin/admins", { method: "DELETE", body: { user_id: a.user_id, action: act } });
    recharger();
  }

  return (
    <>
      <h1>Admins</h1>
      <p className="lead">Chaque admin se connecte avec GitHub puis valide un code TOTP. Un compte listé dans la variable ADMIN_GITHUB_LOGINS est rajouté automatiquement à sa connexion : pour retirer quelqu&apos;un durablement, retire-le aussi de cette variable.</p>
      {err && <p className="erreur">{err}</p>}
      {data && <table className="stats">
        <thead><tr><th>GitHub</th><th>Admin depuis</th><th>Second facteur</th><th>Dernier code</th><th></th></tr></thead>
        <tbody>{data.admins.map((a) => (
          <tr key={a.user_id}>
            <td>{a.github_login}{a.user_id === data.moi && <span className="meta"> (toi)</span>}</td>
            <td className="meta">{dateHeure(a.created_at)}</td>
            <td>{a.totp_actif ? <span className="ok">actif</span> : <span className="meta">à activer</span>}</td>
            <td className="meta">{dateHeure(a.derniere_utilisation)}</td>
            <td>{a.user_id !== data.moi && <>
              <button className="lien" onClick={() => action(a, "reinitialiser_totp")}>Réinitialiser le TOTP</button>{" · "}
              <button className="lien" onClick={() => action(a, "retirer")}>Retirer</button>
            </>}</td>
          </tr>))}
        </tbody>
      </table>}
      <form onSubmit={ajouter} className="card" style={{ marginTop: 24 }}>
        <label>Ajouter un admin (login GitHub)</label>
        <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} required pattern="[A-Za-z0-9-]{1,39}" />
        <p className="meta">La personne doit s&apos;être connectée une fois avec GitHub sur DataParl&apos; Auth.</p>
        <button>Ajouter</button>
        {etat && <p className="meta">{etat}</p>}
      </form>
    </>
  );
}
