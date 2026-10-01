"use client";
import { useState } from "react";
import { LIBELLE_ROLE } from "@/app/_components/admin/EnTete";
import { useAdmin, type Role } from "@/app/_components/admin/Porte";
import { useRessource } from "@/app/_components/admin/utils";
import { defaut, MODULES, reserve, type Module } from "@/lib/permissions";

type Compte = { user_id: string; nom: string; email: string; role: Role; actif: boolean; reglages: { module: string; autorise: boolean }[] };

// Matrice équipe × modules : le rôle donne le réglage par défaut, chaque case
// peut être forcée sur Autorisé ou Refusé.
export default function Permissions() {
  const { api } = useAdmin();
  const { data, err, recharger } = useRessource<{ comptes: Compte[] }>("/api/admin/equipe");
  const [message, setMessage] = useState<string | null>(null);
  if (err) return <p className="erreur">{err}</p>;
  if (!data) return <p className="meta">Chargement…</p>;

  async function regler(c: Compte, module: Module, autorise: boolean | null) {
    try {
      await api("/api/admin/equipe", { method: "PATCH", body: { action: "permission", user_id: c.user_id, module, autorise } });
      setMessage(null);
      await recharger();
    } catch (e) { setMessage((e as Error).message); }
  }

  return (
    <>
      <p className="meta">Le rôle fixe les accès par défaut ; chaque case peut être forcée. Les administrateurs ont accès à tout. Un changement s&apos;applique à la prochaine action de la personne.</p>
      {message && <p className="erreur">{message}</p>}
      <div className="defile">
        <table className="stats matrice">
          <thead>
            <tr><th>Module</th>{data.comptes.map((c) => <th key={c.user_id}>{c.nom}<br /><span className={`badge-role ${c.role}`}>{LIBELLE_ROLE[c.role]}</span></th>)}</tr>
          </thead>
          <tbody>
            {MODULES.map((m) => (
              <tr key={m.cle}>
                <th scope="row"><strong>{m.libelle}</strong><br /><span className="meta">{m.detail}</span></th>
                {data.comptes.map((c) => {
                  if (c.role === "admin") return <td key={c.user_id}><span className="ok">Autorisé</span></td>;
                  if (reserve(m.cle)) return <td key={c.user_id}><span className="meta">Administrateurs seulement</span></td>;
                  const force = c.reglages.find((r) => r.module === m.cle);
                  const parDefaut = defaut(c.role, m.cle);
                  const valeur = force ? (force.autorise ? "oui" : "non") : "role";
                  return (
                    <td key={c.user_id}>
                      <select aria-label={`${m.libelle} pour ${c.nom}`} value={valeur} className={(force ? force.autorise : parDefaut) ? "autorise" : "refuse"}
                        onChange={(e) => regler(c, m.cle, e.target.value === "role" ? null : e.target.value === "oui")}>
                        <option value="role">Selon le rôle ({parDefaut ? "autorisé" : "refusé"})</option>
                        <option value="oui">Autorisé</option>
                        <option value="non">Refusé</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
