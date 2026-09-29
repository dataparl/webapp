"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authBrowser } from "@/lib/supabaseBrowser";

// Porte d'entrée de l'admin et de la webmail. Vérifie la session (GitHub),
// l'appartenance aux admins, puis demande le code TOTP (ou l'enrôlement).
// Fournit à la page un `api()` qui ajoute le jeton de session et renvoie à
// la porte si l'accès renforcé expire.

type Api = <T = unknown>(chemin: string, init?: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> }) => Promise<T>;
type Ctx = { github: string; api: Api; verrouiller: () => void };

const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

export class ErreurApi extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Etat =
  | { e: "chargement" } | { e: "anonyme" } | { e: "refuse" } | { e: "erreur" }
  | { e: "enrolement"; github: string } | { e: "code"; github: string } | { e: "ok"; github: string };

async function jeton(): Promise<string | null> {
  const { data } = await authBrowser().auth.getSession();
  return data.session?.access_token ?? null;
}

export default function Porte({ titre, children }: { titre: string; children: React.ReactNode }) {
  const [etat, setEtat] = useState<Etat>({ e: "chargement" });

  const verifier = useCallback(async () => {
    const t = await jeton();
    if (!t) return setEtat({ e: "anonyme" });
    const r = await fetch("/api/admin/otp", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
    if (r.status === 401) return setEtat({ e: "anonyme" });
    if (r.status === 403) return setEtat({ e: "refuse" });
    if (!r.ok) return setEtat({ e: "erreur" });
    const j = (await r.json()) as { github: string; otp: "ok" | "requis" | "a_enroler" };
    setEtat(j.otp === "ok" ? { e: "ok", github: j.github } : j.otp === "a_enroler" ? { e: "enrolement", github: j.github } : { e: "code", github: j.github });
  }, []);

  useEffect(() => { verifier(); }, [verifier]);

  const api: Api = useCallback(async (chemin, init = {}) => {
    const t = await jeton();
    const q = init.query ? "?" + new URLSearchParams(Object.entries(init.query).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])) : "";
    const r = await fetch(chemin + q, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${t ?? ""}`, ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 || r.status === 403) { verifier(); throw new ErreurApi(r.status, "accès expiré"); }
    if (!r.ok) throw new ErreurApi(r.status, (j as { error?: string }).error ?? `erreur ${r.status}`);
    return j;
  }, [verifier]);

  const verrouiller = useCallback(async () => {
    const t = await jeton();
    await fetch("/api/admin/otp", { method: "DELETE", headers: { Authorization: `Bearer ${t ?? ""}` } });
    verifier();
  }, [verifier]);

  if (etat.e === "ok") return <AdminCtx.Provider value={{ github: etat.github, api, verrouiller }}>{children}</AdminCtx.Provider>;

  return (
    <div className="porte">
      <p className="marque-admin">Data<span className="surligne">Parl&apos;</span> <span>{titre}</span></p>
      <div className="card">
        {etat.e === "chargement" && <p className="meta">Vérification de l&apos;accès…</p>}
        {etat.e === "anonyme" && <>
          <h1>Connexion requise</h1>
          <p>Cet espace est réservé à l&apos;équipe. Connecte-toi avec ton compte GitHub.</p>
          <a className="btn" href={`/connexion?suite=${encodeURIComponent(window.location.pathname)}`}>Se connecter avec GitHub</a>
        </>}
        {etat.e === "refuse" && <>
          <h1>Accès refusé</h1>
          <p>Ce compte n&apos;est pas administrateur. La connexion doit se faire avec GitHub, avec un compte ajouté par un admin.</p>
          <button className="secondaire" onClick={async () => { await authBrowser().auth.signOut(); setEtat({ e: "anonyme" }); }}>Changer de compte</button>
        </>}
        {etat.e === "erreur" && <p className="erreur">Service indisponible. Réessaie dans un instant.</p>}
        {etat.e === "enrolement" && <Enrolement github={etat.github} onOk={verifier} />}
        {etat.e === "code" && <SaisieCode github={etat.github} onOk={verifier} />}
      </div>
    </div>
  );
}

function useEnvoiCode(onOk: () => void) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true); setErr(null);
    const t = await jeton();
    const r = await fetch("/api/admin/otp/verification", {
      method: "POST", headers: { Authorization: `Bearer ${t ?? ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ code }),
    });
    setEnvoi(false);
    if (r.ok) return onOk();
    setCode("");
    setErr(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "code invalide");
  }
  const champ = (
    <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6} required autoFocus
      className="code-otp" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} aria-label="Code à 6 chiffres" />
  );
  return { champ, valider, err, envoi, code };
}

function SaisieCode({ github, onOk }: { github: string; onOk: () => void }) {
  const f = useEnvoiCode(onOk);
  return (
    <form onSubmit={f.valider}>
      <h1>Second facteur</h1>
      <p>Connecté(e) en tant que <strong>{github}</strong>. Saisis le code à 6 chiffres de ton application d&apos;authentification. L&apos;accès reste ouvert 15 minutes.</p>
      {f.champ}
      {f.err && <p className="erreur">{f.err}</p>}
      <button disabled={f.envoi || f.code.length !== 6}>Valider</button>
    </form>
  );
}

function Enrolement({ github, onOk }: { github: string; onOk: () => void }) {
  const [qr, setQr] = useState<{ qr: string; secret: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const f = useEnvoiCode(onOk);
  async function generer() {
    const t = await jeton();
    const r = await fetch("/api/admin/otp/enrolement", { method: "POST", headers: { Authorization: `Bearer ${t ?? ""}` } });
    if (!r.ok) return setErr("Impossible de générer le secret.");
    setQr(await r.json());
  }
  return (
    <form onSubmit={f.valider}>
      <h1>Activer le second facteur</h1>
      <p>Bienvenue <strong>{github}</strong>. Avant d&apos;accéder à l&apos;admin et à la webmail, associe une application d&apos;authentification (1Password, Bitwarden, Google Authenticator, Aegis…).</p>
      {!qr ? <button type="button" onClick={generer}>Générer le QR code</button> : <>
        <p><img src={qr.qr} alt="QR code à scanner" width={200} height={200} /></p>
        <p className="meta">Ou saisis la clé à la main : <code className="secret">{qr.secret}</code></p>
        <label>Code affiché par l&apos;application</label>
        {f.champ}
        {f.err && <p className="erreur">{f.err}</p>}
        <button disabled={f.envoi || f.code.length !== 6}>Activer</button>
      </>}
      {err && <p className="erreur">{err}</p>}
    </form>
  );
}
