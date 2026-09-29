"use client";
import { useEffect, useState } from "react";
import { authBrowser } from "@/lib/supabaseBrowser";

// Connexion sans mot de passe (code à 6 chiffres par email) ou via GitHub
// (réservé à l'administration). Servie sur www. et sur admin. pour que le flux
// OAuth reste sur l'origine qui l'a lancé.

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [etape, setEtape] = useState<"email" | "code" | "connecte">("email");
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    const sb = authBrowser();
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        setEtape("connecte");
        setEmail(data.session.user.email ?? "");
        const suite = new URLSearchParams(window.location.search).get("suite");
        if (suite && suite.startsWith("/")) window.location.replace(suite);
      }
    });
  }, []);

  async function envoyerCode(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    const { error } = await authBrowser().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    setEnCours(false);
    if (error) return setMessage("Impossible d'envoyer le code. Réessayez dans quelques minutes.");
    setMessage("");
    setEtape("code");
  }

  async function verifier(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    const { error } = await authBrowser().auth.verifyOtp({ email, token: code.trim(), type: "email" });
    setEnCours(false);
    if (error) return setMessage("Code incorrect ou expiré.");
    setEtape("connecte");
  }

  async function github() {
    const suite = window.location.hostname.startsWith("admin.") ? "/" : "/admin";
    await authBrowser().auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/connexion?suite=${encodeURIComponent(suite)}` },
    });
  }

  async function deconnexion() {
    await authBrowser().auth.signOut();
    setEtape("email");
    setCode("");
  }

  return (
    <div className="card">
      <h1>Connexion</h1>
      {etape === "connecte" && (
        <>
          <p>Connecté(e) en tant que <strong>{email}</strong>.</p>
          <button className="secondaire" onClick={deconnexion}>Se déconnecter</button>
        </>
      )}
      {etape === "email" && (
        <form onSubmit={envoyerCode}>
          <label htmlFor="email">Adresse email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <button type="submit" disabled={enCours}>Recevoir un code</button>
        </form>
      )}
      {etape === "code" && (
        <form onSubmit={verifier}>
          <p>Un code à 6 chiffres a été envoyé à <strong>{email}</strong>.</p>
          <label htmlFor="code">Code</label>
          <input id="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code}
            onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" />
          <button type="submit" disabled={enCours}>Valider</button>
        </form>
      )}
      {message && <p className="erreur">{message}</p>}
      {etape !== "connecte" && (
        <p className="meta" style={{ marginTop: 24 }}>
          Administration : <button className="secondaire" style={{ marginTop: 0 }} onClick={github}>Se connecter avec GitHub</button>
        </p>
      )}
    </div>
  );
}
