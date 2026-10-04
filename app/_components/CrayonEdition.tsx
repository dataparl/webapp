"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionActuelle } from "@/lib/supabaseBrowser";
import { bioVersHtml } from "@/lib/htmlBio";

// Crayon d'édition directe sur le site public (www.dataparl.fr) : visible
// seulement pour l'équipe connectée. Ouvre l'édition de la biographie de
// l'élu courant, à la manière d'un CMS : saisie enrichie (gras, italique,
// titres, listes, liens, sources), enregistrement, puis rafraîchissement.
// Les mêmes règles que l'admin s'appliquent : session d'équipe + code TOTP
// pour les administrateurs (cookie partagé sur *.dataparl.fr).

type Etat = "cache" | "otp" | "pret" | "erreur";

async function jeton(): Promise<string | null> {
  return (await sessionActuelle())?.access_token ?? null;
}

async function appel<T>(chemin: string, init?: RequestInit): Promise<{ status: number; json: T }> {
  const t = await jeton();
  const r = await fetch(chemin, { cache: "no-store", ...init, headers: { Authorization: `Bearer ${t ?? ""}`, ...(init?.body ? { "Content-Type": "application/json" } : {}), ...(init?.headers ?? {}) } });
  const json = (await r.json().catch(() => ({}))) as T;
  return { status: r.status, json };
}

export default function CrayonEdition({ personneId, nom }: { personneId: string; nom: string }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [etat, setEtat] = useState<Etat>("cache");
  const [ouvert, setOuvert] = useState(false);
  const [code, setCode] = useState("");
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [bio, setBio] = useState<{ texte: string | null; source: string | null; actif: boolean } | null>(null);
  const [source, setSource] = useState("Rédaction DataParl'");
  const [actif, setActif] = useState(false);

  useEffect(() => {
    let vivant = true;
    (async () => {
      const t = await jeton();
      if (!t) return; // pas de session : rien à afficher
      const { status, json } = await appel<{ otp?: string }>("/api/admin/otp");
      if (!vivant) return;
      if (status === 200) setEtat("pret");
      else if (status === 401 && (json.otp === "requis" || json.otp === "a_enroler")) setEtat(json.otp === "requis" ? "otp" : "cache");
      // 403 : compte non membre de l'équipe : rien à afficher.
    })();
    return () => { vivant = false; };
  }, []);

  async function ouvrirEditeur() {
    setMessage(null);
    setOccupe(true);
    const { status, json } = await appel<{ fiche?: unknown; bio?: { texte: string | null; source: string | null; actif: boolean } | null; error?: string }>(`/api/admin/elus?personne_id=${encodeURIComponent(personneId)}`);
    setOccupe(false);
    if (status !== 200) { setMessage((json.error as string) ?? "accès refusé"); setEtat("otp"); return; }
    setBio(json.bio ?? null);
    setSource(json.bio?.source || "Rédaction DataParl'");
    setActif(!!json.bio?.actif);
    setOuvert(true);
    setTimeout(() => { if (ref.current) ref.current.innerHTML = bioVersHtml(json.bio?.texte ?? null); }, 0);
  }

  async function verifierCode() {
    if (code.length !== 6 || !/^[0-9]+$/.test(code)) { setMessage("code à 6 chiffres"); return; }
    setOccupe(true); setMessage(null);
    const { status, json } = await appel<{ error?: string }>("/api/admin/otp/verification", { method: "POST", body: JSON.stringify({ code }) });
    setOccupe(false);
    if (status !== 200) { setMessage(json.error ?? "code invalide"); return; }
    setEtat("pret");
    setCode("");
    ouvrirEditeur();
  }

  function cmd(nom: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(nom, false, arg);
  }

  function lien() {
    const u = prompt("Adresse du lien (https://…)", "https://");
    if (!u) return;
    if (!u.startsWith("https://") && !u.startsWith("http://")) { setMessage("L'adresse doit commencer par https://"); return; }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) cmd("createLink", u);
    else {
      const texte = prompt("Texte affiché pour le lien") || u;
      cmd("insertHTML", `<a href="${u.replace(/"/g, "&quot;")}">${texte.replace(/</g, "&lt;")}</a>`);
    }
  }

  function blocSources() {
    ref.current?.focus();
    document.execCommand("insertHTML", false, '<h3>Sources</h3><ul><li><a href="https://">Nouveau lien source</a></li></ul>');
  }

  async function enregistrer() {
    if (!ref.current) return;
    const texte = ref.current.innerHTML.trim();
    if (!texte || !ref.current.textContent?.trim()) { setMessage("La bio est vide."); return; }
    setOccupe(true); setMessage(null);
    const { status, json } = await appel<{ error?: string }>("/api/admin/elus/bio", {
      method: "PUT",
      body: JSON.stringify({ personne_id: personneId, texte, source, actif }),
    });
    setOccupe(false);
    if (status !== 200) { setMessage(json.error ?? "erreur à l'enregistrement"); return; }
    setOuvert(false);
    router.refresh();
  }

  if (etat === "cache") return null;

  return (
    <>
      <button type="button" className="crayon" aria-label="Modifier cette page" title="Modifier cette page" onClick={() => (etat === "pret" ? ouvrirEditeur() : setOuvert(true))}>
        ✏️
      </button>

      {ouvert && (
        <div className="crayon-voile" role="dialog" aria-modal="true" aria-label="Édition" onClick={(e) => { if (e.target === e.currentTarget) setOuvert(false); }}>
          <div className="crayon-fenetre">
            {etat === "otp" ? (
              <>
                <h2 style={{ margin: "0 0 8px" }}>Double authentification</h2>
                <p className="meta" style={{ margin: "0 0 12px" }}>Entre le code à 6 chiffres de ton application d&apos;authentification pour ouvrir l&apos;édition.</p>
                <div className="crayon-code">
                  <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))} placeholder="123456" autoFocus />
                  <button className="btn" onClick={verifierCode} disabled={occupe}>{occupe ? "Vérification…" : "Valider"}</button>
                </div>
                <p className="meta">Pas encore de code ? <a href="https://admin.dataparl.fr/connexion">active-le dans l&apos;admin ↗</a> puis reviens.</p>
              </>
            ) : (
              <>
                <div className="crayon-titre">
                  <h2 style={{ margin: 0 }}>Éditer la bio de {nom}</h2>
                  <button className="lien" onClick={() => setOuvert(false)} aria-label="Fermer">✕</button>
                </div>
                <p className="meta">
                  {bio ? "Bio existante chargée." : "Aucune bio pour cet élu : tu la crées ici."}{" "}
                  <a href="https://admin.dataparl.fr/elus/edit" target="_blank" rel="noreferrer">Éditeur complet dans l&apos;admin ↗</a>
                </p>
                <div className="crayon-barre" role="toolbar" aria-label="Mise en forme">
                  <button type="button" onClick={() => cmd("bold")} title="Gras"><strong>G</strong></button>
                  <button type="button" onClick={() => cmd("italic")} title="Italique"><em>I</em></button>
                  <button type="button" onClick={() => cmd("underline")} title="Souligné"><u>S</u></button>
                  <button type="button" onClick={() => cmd("formatBlock", "<h3>")} title="Titre">T</button>
                  <button type="button" onClick={() => cmd("insertUnorderedList")} title="Liste">•</button>
                  <button type="button" onClick={lien} title="Lien">🔗</button>
                  <button type="button" onClick={blocSources} title="Bloc sources">Sources</button>
                </div>
                <div className="crayon-editeur" ref={ref} contentEditable suppressContentEditableWarning aria-label="Texte de la biographie" />
                <div className="crayon-options">
                  <label>
                    <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} /> bio active (visible en ligne)
                  </label>
                  <label className="crayon-source">
                    Source&nbsp;: <input type="text" value={source} onChange={(e) => setSource(e.target.value)} />
                  </label>
                </div>
                {message && <p className="erreur" style={{ margin: "8px 0 0" }}>{message}</p>}
                <div className="crayon-actions">
                  <button className="btn" onClick={enregistrer} disabled={occupe}>{occupe ? "Enregistrement…" : "Enregistrer"}</button>
                  <button className="lien" onClick={() => setOuvert(false)}>Annuler</button>
                </div>
                <p className="meta">La fiche publique se rafraîchit après enregistrement (cache jusqu&apos;à une heure).</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
