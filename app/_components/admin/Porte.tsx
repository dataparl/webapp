"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { authBrowser, sessionActuelle } from "@/lib/supabaseBrowser";

// Porte d'entrée de l'admin et de la webmail. Connexion (compte d'équipe par
// email + mot de passe, ou GitHub pour les admins), changement du mot de passe
// provisoire, puis code TOTP (ou enrôlement).
// Fournit à la page un `api()` qui ajoute le jeton de session et renvoie à
// la porte si l'accès renforcé expire.

type Api = <T = unknown>(chemin: string, init?: { method?: string; body?: unknown; query?: Record<string, string | number | undefined> }) => Promise<T>;
export type Role = "admin" | "editeur" | "utilisateur";
export type Moi = { nom: string; email: string; role: Role; modules: string[] };
type Ctx = Moi & { github: string; api: Api; verrouiller: () => void };

const AdminCtx = createContext<Ctx | null>(null);
export const useAdmin = () => useContext(AdminCtx)!;

export class ErreurApi extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Etat =
  | { e: "chargement" } | { e: "anonyme" } | { e: "refuse" } | { e: "erreur" }
  | ({ e: "mdp" } & Moi) | ({ e: "enrolement" } & Moi) | ({ e: "code"; passkey: boolean; totp: boolean } & Moi) | ({ e: "ok" } & Moi);

async function jeton(): Promise<string | null> {
  return (await sessionActuelle())?.access_token ?? null;
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
    const j = (await r.json()) as { nom: string; email: string; role: Role; modules?: string[]; mdp: boolean; otp: "ok" | "requis" | "a_enroler"; passkey?: boolean; totp?: boolean };
    const moi: Moi = { nom: j.nom, email: j.email, role: j.role, modules: j.modules ?? [] };
    setEtat(j.mdp ? { e: "mdp", ...moi } : j.otp === "ok" ? { e: "ok", ...moi } : j.otp === "a_enroler" ? { e: "enrolement", ...moi } : { e: "code", passkey: !!j.passkey, totp: j.totp !== false, ...moi });
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
    const message = (j as { error?: string }).error;
    if (r.status === 401 || (r.status === 403 && message !== "réservé à un autre rôle")) { verifier(); throw new ErreurApi(r.status, "accès expiré"); }
    if (!r.ok) throw new ErreurApi(r.status, (j as { error?: string }).error ?? `erreur ${r.status}`);
    return j;
  }, [verifier]);

  const verrouiller = useCallback(async () => {
    const t = await jeton();
    await fetch("/api/admin/otp", { method: "DELETE", headers: { Authorization: `Bearer ${t ?? ""}` } });
    verifier();
  }, [verifier]);

  if (etat.e === "ok") {
    const moi = { nom: etat.nom, email: etat.email, role: etat.role, modules: etat.modules };
    return <AdminCtx.Provider value={{ ...moi, github: etat.nom, api, verrouiller }}>{children}</AdminCtx.Provider>;
  }

  return (
    <div className="porte">
      <p className="marque-admin">Data<span className="surligne">Parl&apos;</span> <span>{titre}</span></p>
      <div className="card">
        {etat.e === "chargement" && <p className="meta">Vérification de l&apos;accès…</p>}
        {etat.e === "anonyme" && <ConnexionEquipe onOk={verifier} />}
        {etat.e === "mdp" && <NouveauMotDePasse moi={etat} onOk={verifier} />}
        {etat.e === "refuse" && <>
          <h1>Accès refusé</h1>
          <p>Ce compte ne fait pas partie de l&apos;équipe DataParl&apos;, ou il est suspendu.</p>
          <button className="secondaire" onClick={async () => { await authBrowser().auth.signOut(); setEtat({ e: "anonyme" }); }}>Changer de compte</button>
        </>}
        {etat.e === "erreur" && <p className="erreur">Service indisponible. Réessaie dans un instant.</p>}
        {etat.e === "enrolement" && <Enrolement github={etat.nom} onOk={verifier} onDeco={async () => { await authBrowser().auth.signOut(); setEtat({ e: "anonyme" }); }} />}
        {etat.e === "code" && <SaisieCode github={etat.nom} passkey={etat.passkey} totp={etat.totp} onOk={verifier} onDeco={async () => { await authBrowser().auth.signOut(); setEtat({ e: "anonyme" }); }} />}
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

// Clé d'accès (Touch ID, Face ID, empreinte) : demande les options au serveur,
// laisse le navigateur afficher la demande biométrique, renvoie la réponse.
async function parCleDAcces(chemin: string, avecSession: boolean): Promise<{ ok: true; jeton?: string } | { ok: false; error: string }> {
  try {
    const t = avecSession ? await jeton() : null;
    const entetes = { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
    const o = await fetch(chemin, { method: "POST", headers: entetes, body: JSON.stringify({ action: "options" }) });
    if (!o.ok) return { ok: false, error: ((await o.json().catch(() => ({}))) as { error?: string }).error ?? "indisponible" };
    const reponse = await startAuthentication({ optionsJSON: (await o.json()).options });
    const r = await fetch(chemin, { method: "POST", headers: entetes, body: JSON.stringify({ action: "verifier", reponse }) });
    const j = (await r.json().catch(() => ({}))) as { error?: string; jeton?: string };
    return r.ok ? { ok: true, jeton: j.jeton } : { ok: false, error: j.error ?? "clé d'accès refusée" };
  } catch {
    return { ok: false, error: "Demande annulée ou clé d'accès indisponible sur cet appareil." };
  }
}

function SaisieCode({ github, passkey, totp, onOk, onDeco }: { github: string; passkey: boolean; totp: boolean; onOk: () => void; onDeco: () => void }) {
  const f = useEnvoiCode(onOk);
  const [errCle, setErrCle] = useState<string | null>(null);
  async function cle() {
    setErrCle(null);
    const r = await parCleDAcces("/api/admin/passkeys/verification", true);
    if (r.ok) onOk(); else setErrCle(r.error);
  }
  return (
    <form onSubmit={f.valider}>
      <h1>Second facteur</h1>
      <p>Connecté(e) en tant que <strong>{github}</strong>. L&apos;accès reste ouvert 15 minutes.</p>
      {passkey && <>
        <button type="button" onClick={cle}>Déverrouiller avec Touch ID / Face ID</button>
        {errCle && <p className="erreur">{errCle}</p>}
      </>}
      {totp && <>
        <p>{passkey ? "Ou saisis" : "Saisis"} le code à 6 chiffres de ton application d&apos;authentification.</p>
        {f.champ}
        {f.err && <p className="erreur">{f.err}</p>}
        <button className={passkey ? "secondaire" : undefined} disabled={f.envoi || f.code.length !== 6}>Valider</button>
      </>}
      <p className="meta" style={{ marginTop: 14 }}>
        <button className="lien" onClick={onDeco}>Se déconnecter (changer de compte)</button>
      </p>
    </form>
  );
}

function Enrolement({ github, onOk, onDeco }: { github: string; onOk: () => void; onDeco: () => void }) {
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
      <p className="meta" style={{ marginTop: 14 }}>
        <button className="lien" onClick={onDeco}>Se déconnecter (changer de compte)</button>
      </p>
    </form>
  );
}

// Connexion d'un membre de l'équipe : adresse @dataparl.fr et mot de passe, ou GitHub.
function ConnexionEquipe({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true); setErr(null);
    const { error } = await authBrowser().auth.signInWithPassword({ email: email.trim().toLowerCase(), password: mdp });
    setEnvoi(false);
    if (error) return setErr("Adresse ou mot de passe incorrect.");
    onOk();
  }
  // Sans mot de passe : la clé d'accès désigne le compte, le serveur renvoie un jeton à usage unique.
  async function cle() {
    setEnvoi(true); setErr(null);
    const r = await parCleDAcces("/api/admin/passkeys/connexion", false);
    if (!r.ok || !r.jeton) { setEnvoi(false); return setErr(r.ok ? "Connexion impossible." : r.error); }
    const { error } = await authBrowser().auth.verifyOtp({ token_hash: r.jeton, type: "magiclink" });
    setEnvoi(false);
    if (error) return setErr("Connexion impossible, utilise ton mot de passe.");
    onOk();
  }
  return (
    <form onSubmit={valider}>
      <h1>Espace équipe</h1>
      <p>Connecte-toi avec ton adresse DataParl&apos; et ton mot de passe.</p>
      <label htmlFor="eq-email">Adresse</label>
      <input id="eq-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@dataparl.fr" />
      <label htmlFor="eq-mdp">Mot de passe</label>
      <input id="eq-mdp" type="password" autoComplete="current-password" required value={mdp} onChange={(e) => setMdp(e.target.value)} />
      {err && <p className="erreur">{err}</p>}
      <button disabled={envoi}>{envoi ? "Connexion…" : "Se connecter"}</button>{" "}
      <button type="button" className="secondaire" disabled={envoi} onClick={cle}>Touch ID / Face ID</button>
      <p className="meta" style={{ marginTop: 18 }}>
        Administrateur avec GitHub ? <a href={`/connexion?suite=${encodeURIComponent(window.location.pathname)}`}>Se connecter avec GitHub</a>
      </p>
    </form>
  );
}

// Premier accès : le mot de passe provisoire donné par un admin doit être remplacé.
function NouveauMotDePasse({ moi, onOk }: { moi: Moi; onOk: () => void }) {
  const [mdp, setMdp] = useState("");
  const [conf, setConf] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function valider(e: React.FormEvent) {
    e.preventDefault();
    if (mdp.length < 8) return setErr("Au moins 8 caractères.");
    if (mdp !== conf) return setErr("Les deux saisies ne correspondent pas.");
    const t = await jeton();
    const r = await fetch("/api/admin/moi", { method: "POST", headers: { Authorization: `Bearer ${t ?? ""}`, "Content-Type": "application/json" }, body: JSON.stringify({ mot_de_passe: mdp }) });
    if (!r.ok) return setErr(((await r.json().catch(() => ({}))) as { error?: string }).error ?? "Erreur, réessaie.");
    onOk();
  }
  return (
    <form onSubmit={valider}>
      <h1>Choisis ton mot de passe</h1>
      <p>Bienvenue {moi.nom} ({moi.email}). Remplace le mot de passe provisoire avant de continuer.</p>
      <label htmlFor="n-mdp">Nouveau mot de passe</label>
      <input id="n-mdp" type="password" autoComplete="new-password" value={mdp} onChange={(e) => setMdp(e.target.value)} />
      <label htmlFor="n-conf">Confirmation</label>
      <input id="n-conf" type="password" autoComplete="new-password" value={conf} onChange={(e) => setConf(e.target.value)} />
      {err && <p className="erreur">{err}</p>}
      <button>Enregistrer</button>
    </form>
  );
}
