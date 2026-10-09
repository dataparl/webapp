"use client";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type MouseEvent } from "react";

// Barre d’outils de rédaction pour le corps des communiqués (et mailings).
// Format stocké : Markdown léger — **gras**, *italique*, [lien](https://…),
// lignes « - » pour les listes, « > » pour les citations, ligne vide = paragraphe.
// Ergonomie : les boutons gardent le focus et la sélection dans le champ,
// Enter continue les listes, le champ grandit avec le texte, taille réglable.
export default function EditeurTexte({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [taille, setTaille] = useState(16);

  // Le champ grandit avec le contenu : on écrit sans avoir à faire défiler.
  useEffect(() => {
    const ta = ref.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = (ta.scrollHeight + 6) + "px"; }
  }, [value, taille]);

  function appliquer(debut: number, fin: number, texte: string, selDebut: number, selFin: number) {
    onChange(value.slice(0, debut) + texte + value.slice(fin));
    const ta = ref.current;
    if (ta) requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(selDebut, selFin); });
  }

  // Cliquer sur un bouton ne doit pas faire perdre le focus au champ.
  function garder(e: MouseEvent) { e.preventDefault(); }

  // **toggle** : entoure la sélection, ou retire la mise en forme si elle y est déjà.
  function entourer(avant: string, apres: string) {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const sel = value.slice(d, f);
    if (sel && value.slice(d - avant.length, d) === avant && value.slice(f, f + apres.length) === apres) {
      appliquer(d - avant.length, f + apres.length, sel, d - avant.length, f - avant.length);
      return;
    }
    const texte = sel || "texte";
    appliquer(d, f, avant + texte + apres, d + avant.length, d + avant.length + texte.length);
  }

  // Préfixe ligne par ligne (liste, citation) ; recliquer l’enlève.
  function prefixer(prefixe: string) {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const debut = value.lastIndexOf("\n", d - 1) + 1;
    let fin = value.indexOf("\n", f); if (fin === -1) fin = value.length;
    const lignes = value.slice(debut, fin).split("\n");
    const enleve = lignes.every((l) => l.startsWith(prefixe));
    const nouveau = lignes.map((l) => (enleve ? l.slice(prefixe.length) : prefixe + l)).join("\n");
    appliquer(debut, fin, nouveau, debut, debut + nouveau.length);
  }

  function lien() {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const sel = value.slice(d, f);
    if (/^https?:\/\//.test(sel)) appliquer(d, f, "[texte](" + sel + ")", d + 1, d + 6);
    else {
      const libelle = sel || "texte";
      appliquer(d, f, "[" + libelle + "](https://)", d + 1, d + 1 + libelle.length);
    }
  }

  // Coller une URL sur du texte sélectionné → fait un lien Markdown.
  function coller(e: ClipboardEvent<HTMLTextAreaElement>) {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const texte = e.clipboardData.getData("text/plain").trim();
    if (!/^https?:\/\/\S+$/.test(texte)) return;
    if (d !== f) {
      e.preventDefault();
      appliquer(d, f, "[" + value.slice(d, f) + "](" + texte + ")", d, d);
    }
  }

  function clavier(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter : continue une liste ouverte ; sur une ligne « - » vide, la ferme.
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      const ta = ref.current; if (!ta || ta.selectionStart !== ta.selectionEnd) return;
      const d = ta.selectionStart;
      const debutLigne = value.lastIndexOf("\n", d - 1) + 1;
      const ligne = value.slice(debutLigne, d);
      if (ligne === "- " || ligne === "* ") {
        e.preventDefault();
        appliquer(debutLigne, d, "", debutLigne, debutLigne);
        return;
      }
      const m = /^([-*] )/.exec(ligne);
      if (m) {
        e.preventDefault();
        appliquer(d, d, "\n" + m[1], d + 1 + m[1].length, d + 1 + m[1].length);
      }
      return;
    }
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); entourer("**", "**"); }
    else if (k === "i") { e.preventDefault(); entourer("*", "*"); }
    else if (k === "k") { e.preventDefault(); lien(); }
  }

  const mots = value.trim() ? value.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(mots / 200));

  const bouton = (titre: string, contenu: string, action: () => void) => (
    <button type="button" className="secondaire" title={titre} onMouseDown={garder} onClick={action}>{contenu}</button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        {bouton("Gras (Ctrl+B)", <strong>G</strong>, () => entourer("**", "**"))}
        {bouton("Italique (Ctrl+I)", <em>I</em>, () => entourer("*", "*"))}
        {bouton("Lien (Ctrl+K)", "\u{1F517}", () => lien())}
        {bouton("Liste", "\u2022", () => prefixer("- "))}
        {bouton("Citation", "\u275D", () => prefixer("> "))}
        <span style={{ width: 12 }} />
        {bouton("Réduire le texte", "A−", () => setTaille((t) => Math.max(13, t - 1)))}
        {bouton("Agrandir le texte", "A+", () => setTaille((t) => Math.min(22, t + 1)))}
        <span className="meta" style={{ marginLeft: "auto" }}>{value.length}/20000 · {mots} mot(s) · ~{minutes} min de lecture</span>
      </div>
      <textarea
        id={id} ref={ref} value={value} rows={14}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={clavier} onPaste={coller}
        spellCheck
        style={{ fontSize: taille, lineHeight: 1.7, minHeight: 320, resize: "vertical", fontFamily: "Georgia, serif" }}
      />
      <p className="meta">Formats : <span className="mono">**gras**</span>, <span className="mono">*italique*</span>, <span className="mono">[texte](https://exemple.fr)</span>, lignes <span className="mono">-</span> = liste, <span className="mono">&gt;</span> = citation · Enter continue une liste · coller une URL sur une sélection crée un lien · l’aperçu montre le rendu exact.</p>
    </div>
  );
}