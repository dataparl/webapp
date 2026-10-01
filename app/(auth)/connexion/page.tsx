"use client";
import { useEffect, useState } from "react";
import { authBrowser } from "@/lib/supabaseBrowser";

// DataParl' Auth : connexion ou création de compte par GitHub, Google ou code
// email. Servie sur www. et admin. pour que le flux OAuth (PKCE) reste sur
// l'origine qui l'a lancé.

const CGU_OK = "dp_cgu_acceptees";
let redirige = false;

function IconeGitHub() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function IconeGoogle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.57-5.15 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l3.99-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.3 6.6l3.99 3.1C6.23 6.86 8.88 4.75 12 4.75Z" />
    </svg>
  );
}

export default function Connexion() {
  const [onglet, setOnglet] = useState<"connexion" | "creation">("connexion");
  const [cgu, setCgu] = useState(false);
  const [etape, setEtape] = useState<"choix" | "email" | "code">("choix");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);

  const creation = onglet === "creation";
  const bloque = creation && !cgu;

  function destination(): string {
    const suite = new URLSearchParams(window.location.search).get("suite");
    if (suite && suite.startsWith("/") && !suite.startsWith("//") && !suite.includes("\\")) return suite;
    return window.location.hostname.startsWith("admin.") ? "/" : "/mon-compte";
  }

  async function apresConnexion(token: string) {
    if (redirige) return;
    redirige = true;
    try {
      if (sessionStorage.getItem(CGU_OK)) {
        await fetch("/api/compte/consentement", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
        sessionStorage.removeItem(CGU_OK);
      }
    } catch {}
    window.location.replace(destination());
  }

  useEffect(() => {
    const sb = authBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) apresConnexion(data.session.access_token);
    });
    const { data: sub } = sb.auth.onAuthStateChange((evt, session) => {
      if (evt === "SIGNED_IN" && session) apresConnexion(session.access_token);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function memoriserCgu() {
    try { if (creation && cgu) sessionStorage.setItem(CGU_OK, "1"); } catch {}
  }

  async function oauth(provider: "github" | "google") {
    if (bloque) return setMessage("Coche d'abord la case d'acceptation.");
    memoriserCgu();
    const suite = encodeURIComponent(destination());
    await authBrowser().auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/connexion?suite=${suite}` },
    });
  }

  async function envoyerCode(e: React.FormEvent) {
    e.preventDefault();
    if (bloque) return setMessage("Coche d'abord la case d'acceptation.");
    setEnCours(true);
    setMessage("");
    const { error } = await authBrowser().auth.signInWithOtp({ email, options: { shouldCreateUser: creation } });
    setEnCours(false);
    if (error) {
      return setMessage(
        creation
          ? "Impossible d'envoyer le code. Réessaie dans quelques minutes."
          : "Aucun compte avec cette adresse, ou envoi impossible. Tu peux créer un compte avec l'onglet d'à côté.",
      );
    }
    memoriserCgu();
    setEtape("code");
  }

  async function verifier(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    const { error } = await authBrowser().auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setEnCours(false);
    if (error) setMessage("Code incorrect ou expiré.");
  }

  return (
    <div className="auth">
      <div className="marque">Data<span className="surligne">Parl&apos;</span> <span className="auth-mot">Auth</span></div>
      <p className="lead" style={{ margin: "8px auto 0" }}>Accède à ton espace personnel</p>

      <div className="card">
        <div className="onglets" role="tablist">
          <button role="tab" aria-selected={!creation} onClick={() => { setOnglet("connexion"); setMessage(""); }}>Se connecter</button>
          <button role="tab" aria-selected={creation} onClick={() => { setOnglet("creation"); setMessage(""); }}>Créer un compte</button>
        </div>

        {creation && (
          <label className="check" style={{ marginTop: 0 }}>
            <input type="checkbox" checked={cgu} onChange={(e) => setCgu(e.target.checked)} />
            <span>
              J&apos;accepte les <a href="/informations-legales/cgu" target="_blank">conditions d&apos;utilisation</a> et la{" "}
              <a href="/informations-legales/confidentialite" target="_blank">politique de données personnelles</a>.
            </span>
          </label>
        )}

        {etape !== "code" && (
          <>
            <button className="fournisseur github" onClick={() => oauth("github")} disabled={bloque}>
              <IconeGitHub /> Continuer avec GitHub
            </button>
            <button className="fournisseur" onClick={() => oauth("google")} disabled={bloque}>
              <IconeGoogle /> Continuer avec Google
            </button>
            <div className="separateur">ou</div>
          </>
        )}

        {etape === "choix" && (
          <button className="fournisseur" onClick={() => setEtape("email")} disabled={bloque}>
            Continuer avec un email
          </button>
        )}

        {etape === "email" && (
          <form onSubmit={envoyerCode}>
            <label htmlFor="email">Adresse email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" autoFocus />
            <button type="submit" disabled={enCours || bloque} style={{ width: "100%" }}>Recevoir un code</button>
          </form>
        )}

        {etape === "code" && (
          <form onSubmit={verifier}>
            <p>Un code à 6 chiffres vient d&apos;être envoyé à <strong>{email}</strong>.</p>
            <label htmlFor="code">Code</label>
            <input id="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code}
              onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" autoFocus />
            <button type="submit" disabled={enCours} style={{ width: "100%" }}>Valider</button>
            <p className="meta" style={{ marginTop: 12 }}>
              <button type="button" className="lien" onClick={() => { setEtape("email"); setCode(""); }}>Changer d&apos;adresse</button>
            </p>
          </form>
        )}

        {message && <p className="erreur">{message}</p>}
      </div>

      <p className="meta" style={{ marginTop: 20 }}><a href="/">← Retour au site</a></p>
    </div>
  );
}
