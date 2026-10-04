"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { sessionActuelle } from "@/lib/supabaseBrowser";

type Cle = { id: string; nom: string; prefixe: string; quota_jour: number; created_at: string; last_used_at: string | null; requetes_aujourdhui: number };

export default function GestionCles() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [cle, setCle] = useState<Cle | null | undefined>(undefined);
  const [erreur, setErreur] = useState("");

  const charger = useCallback(async (s: Session) => {
    const r = await fetch("/api/cles", { headers: { Authorization: `Bearer ${s.access_token}` } });
    if (!r.ok) return setErreur("Impossible de charger ta clé.");
    const d = await r.json();
    setCle(d.cles[0] ?? null);
  }, []);

  useEffect(() => {
    sessionActuelle().then((s) => { setSession(s); if (s) charger(s); });
  }, [charger]);

  if (session === undefined) return <p className="meta">Chargement…</p>;
  if (!session) return <a className="btn" href="/connexion?suite=/mon-espace-api">Se connecter</a>;
  if (erreur) return <p className="erreur">{erreur}</p>;
  if (cle === undefined) return <p className="meta">Chargement…</p>;
  if (cle === null) {
    return (
      <div className="card">
        <p style={{ marginTop: 0 }}>Tu n&apos;as pas encore de clé.</p>
        <a className="btn" href="/request-access">Demander ma clé</a>
      </div>
    );
  }

  async function revoquer() {
    if (!session || !cle) return;
    if (!window.confirm("Révoquer ta clé ? Les programmes qui l'utilisent cesseront de fonctionner. Tu pourras en demander une nouvelle.")) return;
    await fetch(`/api/cles?id=${cle.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.access_token}` } });
    charger(session);
  }

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const pct = Math.min(100, Math.round((cle.requetes_aujourdhui / cle.quota_jour) * 100));

  return (
    <div className="card" style={{ maxWidth: "none" }}>
      <table className="stats">
        <tbody>
          <tr><th>Clé</th><td><code>{cle.prefixe}…</code> (la valeur complète n&apos;est jamais conservée)</td></tr>
          <tr><th>Usage déclaré</th><td>{cle.nom}</td></tr>
          <tr><th>Créée le</th><td>{fmt.format(new Date(cle.created_at))}</td></tr>
          <tr><th>Dernier appel</th><td>{cle.last_used_at ? fmt.format(new Date(cle.last_used_at)) : "jamais"}</td></tr>
          <tr><th>Aujourd&apos;hui</th><td>{cle.requetes_aujourdhui} / {cle.quota_jour} requêtes ({pct} %)</td></tr>
        </tbody>
      </table>
      <p className="meta">Clé perdue ou exposée ? Révoque-la, puis demandes-en une nouvelle.</p>
      <button className="danger" onClick={revoquer}>Révoquer ma clé</button>
    </div>
  );
}
