"use client";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { authBrowser } from "@/lib/supabaseBrowser";

type Cle = { id: string; nom: string; prefixe: string; quota_jour: number; created_at: string; last_used_at: string | null; requetes_aujourdhui: number };

export default function GestionCles() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [cles, setCles] = useState<Cle[]>([]);
  const [max, setMax] = useState(3);
  const [nouvelle, setNouvelle] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState("");

  const appel = useCallback(
    (url: string, init: RequestInit = {}) =>
      fetch(url, { ...init, headers: { ...(init.headers ?? {}), Authorization: `Bearer ${session?.access_token}` } }),
    [session],
  );

  const charger = useCallback(async () => {
    const r = await appel("/api/cles");
    if (!r.ok) return setErreur("Impossible de charger tes clés.");
    const data = await r.json();
    setCles(data.cles);
    setMax(data.max);
  }, [appel]);

  useEffect(() => { authBrowser().auth.getSession().then(({ data }) => setSession(data.session)); }, []);
  useEffect(() => { if (session) charger(); }, [session, charger]);

  if (session === undefined) return <p className="meta">Chargement…</p>;
  if (!session) {
    return <p><a className="btn" href="/connexion?suite=/api">Se connecter pour obtenir une clé</a></p>;
  }

  async function creer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    const r = await appel("/api/cles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nom }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return setErreur(data.error ?? "Création impossible.");
    setNouvelle(data.cle);
    setNom("");
    charger();
  }

  async function revoquer(id: string) {
    if (!window.confirm("Révoquer cette clé ? Les applications qui l'utilisent cesseront de fonctionner.")) return;
    await appel(`/api/cles?id=${id}`, { method: "DELETE" });
    charger();
  }

  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      {nouvelle && (
        <div className="card" style={{ maxWidth: "none", marginBottom: 16 }}>
          <p><strong>Ta nouvelle clé</strong> (copie-la maintenant, elle ne sera plus affichée) :</p>
          <pre>{nouvelle}</pre>
          <button className="secondaire" onClick={() => navigator.clipboard?.writeText(nouvelle)}>Copier</button>{" "}
          <button className="lien" onClick={() => setNouvelle(null)}>C&apos;est noté</button>
        </div>
      )}
      {cles.length > 0 ? (
        <table className="stats">
          <thead><tr><th>Nom</th><th>Clé</th><th>Aujourd&apos;hui</th><th>Créée le</th><th></th></tr></thead>
          <tbody>
            {cles.map((c) => (
              <tr key={c.id}>
                <td>{c.nom}</td>
                <td><code>{c.prefixe}…</code></td>
                <td>{c.requetes_aujourdhui} / {c.quota_jour}</td>
                <td>{fmt.format(new Date(c.created_at))}</td>
                <td><button className="lien" onClick={() => revoquer(c.id)}>Révoquer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="meta">Aucune clé pour l&apos;instant.</p>
      )}
      {cles.length < max && (
        <form onSubmit={creer} style={{ maxWidth: 420 }}>
          <label htmlFor="nom-cle">Nom de la nouvelle clé</label>
          <input id="nom-cle" type="text" required maxLength={60} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex. carnet de recherche" />
          <button type="submit">Créer une clé</button>
        </form>
      )}
      {erreur && <p className="erreur">{erreur}</p>}
    </div>
  );
}
