"use client";
import { useEffect, useRef, useState } from "react";
import { useAdmin } from "@/app/_components/admin/Porte";
import { bioVersHtml } from "@/lib/htmlBio";

// Éditeur « traitement de texte » des biographies d'élus : gras, italique, souligné,
// titres, listes, liens et bloc Sources. Le texte est enregistré en HTML assaini
// côté serveur ; les anciennes bios au format léger sont converties à l'ouverture.

type Resultat = { personne_id: string; slug: string; chambre: string; civilite: string; prenom: string; nom: string; actif: boolean; circonscription: string; groupe: string };
type Fiche = { personne_id: string; slug: string; chambre: string; civilite: string; prenom: string; nom: string; circonscription: string; groupe: string; photo_url: string; actif: boolean };
type Bio = { texte: string; source: string; actif: boolean; maj_le: string } | null;
type Detail = { fiche: Fiche; bio: Bio };

const nomComplet = (p: { prenom: string; nom: string }) => `${p.prenom} ${p.nom}`.trim();

export default function EditeurBios() {
  const { api } = useAdmin();
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [enCours, setEnCours] = useState(false);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setResultats([]); return; }
    const t = setTimeout(async () => {
      setEnCours(true);
      try { setResultats((await api<{ elus: Resultat[] }>("/api/admin/elus", { query: { q } })).elus); }
      catch (e) { setErr((e as Error).message); }
      finally { setEnCours(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, api]);

  async function ouvrir(personne_id: string) {
    setDetail(null); setErr(null);
    try { setDetail(await api<Detail>("/api/admin/elus", { query: { personne_id } })); }
    catch (e) { setErr((e as Error).message); }
  }

  if (!detail) return (
    <>
      <h1>Éditeur de biographies</h1>
      <p className="meta">Modifie la biographie d&apos;un élu comme dans un traitement de texte : gras, italique, souligné, titres, listes, liens et sources. Le rendu est celui de la fiche publique.</p>
      <label htmlFor="b-rech">Rechercher un élu</label>
      <input id="b-rech" type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, prénom ou circonscription…" autoFocus />
      {err && <p className="erreur">{err}</p>}
      {enCours && <p className="meta">Recherche…</p>}
      {resultats.length > 0 && (
        <div className="defile" style={{ marginTop: 16 }}><table className="stats">
          <thead><tr><th>Élu</th><th>Chambre</th><th>Circonscription</th><th></th></tr></thead>
          <tbody>{resultats.map((r) => (
            <tr key={r.personne_id}>
              <td><strong>{nomComplet(r)}</strong>{!r.actif && <span className="meta"> · ancien ne</span>}</td>
              <td className="meta">{r.chambre || "–"}</td>
              <td className="meta">{r.circonscription || "–"}</td>
              <td><button className="lien" onClick={() => ouvrir(r.personne_id)}>Éditer la bio</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </>
  );

  return (
    <>
      <p><button className="lien" onClick={() => { setDetail(null); setResultats([]); }}>← Nouvelle recherche</button></p>
      <Editeur detail={detail} api={api} onErr={setErr} />
    </>
  );
}

function Editeur({ detail, api, onErr }: {
  detail: Detail;
  api: ReturnType<typeof useAdmin>["api"];
  onErr: (e: string | null) => void;
}) {
  const f = detail.fiche;
  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(detail.bio?.source ?? "Rédaction DataParl'");
  const [actif, setActif] = useState(detail.bio?.actif ?? false);
  const [occupe, setOccupe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = bioVersHtml(detail.bio?.texte);
    setMessage(null);
  }, [detail]);

  // Applique une commande d'édition sur la sélection courante.
  function cmd(nom: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(nom, false, arg);
    setMessage(null);
  }

  function lien() {
    const u = prompt("Adresse du lien (https://…)", "https://");
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) { onErr("L'adresse doit commencer par https://"); return; }
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) cmd("createLink", u);
    else {
      const texte = prompt("Texte affiché pour le lien") || u;
      cmd("insertHTML", `<a href="${u.replace(/"/g, "&quot;")}">${texte.replace(/</g, "&lt;")}</a>`);
    }
  }

  function sources() {
    const bloc = "<h3>Sources</h3><ul><li><a href=\"https://\">Nouveau lien source</a></li></ul>";
    ref.current?.focus();
    document.execCommand("insertHTML", false, bloc);
    setMessage(null);
  }

  async function enregistrer() {
    if (!ref.current) return;
    const texte = ref.current.innerHTML.trim();
    if (!texte || ref.current.textContent?.trim() === "") { setMessage("La bio est vide."); return; }
    setOccupe(true); setMessage(null); onErr(null);
    try {
      await api("/api/admin/elus/bio", {
        method: "PUT",
        body: { personne_id: f.personne_id, texte, source, actif },
      });
      setActif(actif);
      setMessage(actif ? "Enregistré — la bio est en ligne." : "Enregistré — la bio n'est pas encore activée (brouillon).");
    } catch (e) { setMessage((e as Error).message); }
    finally { setOccupe(false); }
  }

  return (
    <>
      <h1>{nomComplet(f)}</h1>
      <p className="meta">
        {f.chambre} · {f.circonscription || "sans circonscription"}{f.groupe ? ` · groupe ${f.groupe}` : ""} ·{" "}
        <a href={`https://www.dataparl.fr/parlementaires/${encodeURIComponent(f.slug)}/bio`} target="_blank" rel="noreferrer">voir la bio publique ↗</a>
      </p>

      <div className="barre-outils-bio" role="toolbar" aria-label="Mise en forme">
        <button type="button" title="Gras (Ctrl+B)" onMouseDown={(e) => { e.preventDefault(); cmd("bold"); }}><strong>G</strong></button>
        <button type="button" title="Italique (Ctrl+I)" onMouseDown={(e) => { e.preventDefault(); cmd("italic"); }}><em>I</em></button>
        <button type="button" title="Souligné (Ctrl+U)" onMouseDown={(e) => { e.preventDefault(); cmd("underline"); }}><u>S</u></button>
        <span className="sep-outil" />
        <button type="button" title="Intertitre de section" onMouseDown={(e) => { e.preventDefault(); cmd("formatBlock", "<h3>"); }}>Titre</button>
        <button type="button" title="Paragraphe normal" onMouseDown={(e) => { e.preventDefault(); cmd("formatBlock", "<p>"); }}>Texte</button>
        <span className="sep-outil" />
        <button type="button" title="Liste à puces" onMouseDown={(e) => { e.preventDefault(); cmd("insertUnorderedList"); }}>• Liste</button>
        <button type="button" title="Insérer un lien" onMouseDown={(e) => { e.preventDefault(); lien(); }}>🔗 Lien</button>
        <button type="button" title="Retirer le lien de la sélection" onMouseDown={(e) => { e.preventDefault(); cmd("unlink"); }}>Délier</button>
        <span className="sep-outil" />
        <button type="button" title="Insérer un bloc Sources" onMouseDown={(e) => { e.preventDefault(); sources(); }}>📚 Sources</button>
        <button type="button" title="Effacer la mise en forme de la sélection" onMouseDown={(e) => { e.preventDefault(); cmd("removeFormat"); }}>Effacer</button>
        <span className="sep-outil" />
        <button type="button" title="Annuler (Ctrl+Z)" onMouseDown={(e) => { e.preventDefault(); cmd("undo"); }}>↶</button>
        <button type="button" title="Rétablir (Ctrl+Y)" onMouseDown={(e) => { e.preventDefault(); cmd("redo"); }}>↷</button>
      </div>

      <div
        ref={ref}
        className="zone-edition-bio"
        contentEditable
        suppressContentEditableWarning
        aria-label="Texte de la biographie"
        onInput={() => setMessage(null)}
      />

      <div className="grille-2" style={{ marginTop: 16 }}>
        <div>
          <label htmlFor="b-source">Source affichée sous la bio</label>
          <input id="b-source" type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="ex. Rédaction DataParl'" />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 28 }}>
          <input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} />
          Bio activée (visible sur le site)
        </label>
      </div>

      <div className="actions" style={{ marginTop: 16 }}>
        <button onClick={enregistrer} disabled={occupe}>{occupe ? "Enregistrement…" : "Enregistrer"}</button>
      </div>
      {message && <p className="meta">{message}</p>}
    </>
  );
}
