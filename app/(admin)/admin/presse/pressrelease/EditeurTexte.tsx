"use client";
import { useRef, type KeyboardEvent } from "react";

// Barre d’outils de rédaction pour le corps des communiqués (et mailings).
// Format : Markdown léger — **gras**, *italique*, [lien](https://…),
// lignes « - » pour les listes, « > » pour les citations, ligne vide = paragraphe.
export default function EditeurTexte({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function remplacer(debut: number, fin: number, texte: string, selDebut: number, selFin: number) {
    onChange(value.slice(0, debut) + texte + value.slice(fin));
    const ta = ref.current;
    if (ta) requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(selDebut, selFin); });
  }

  function entourer(avant: string, apres: string) {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const sel = value.slice(d, f) || "texte";
    remplacer(d, f, avant + sel + apres, d + avant.length, d + avant.length + sel.length);
  }

  function prefixer(prefixe: string) {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const debut = value.lastIndexOf("\n", d - 1) + 1;
    let fin = value.indexOf("\n", f); if (fin === -1) fin = value.length;
    const lignes = value.slice(debut, fin).split("\n");
    const enleve = lignes.every((l) => l.startsWith(prefixe));
    const nouveau = lignes.map((l) => (enleve ? l.slice(prefixe.length) : prefixe + l)).join("\n");
    remplacer(debut, fin, nouveau, debut, debut + nouveau.length);
  }

  function lien() {
    const ta = ref.current; if (!ta) return;
    const d = ta.selectionStart, f = ta.selectionEnd;
    const sel = value.slice(d, f);
    if (/^https?:\/\//.test(sel)) remplacer(d, f, "[texte](" + sel + ")", d + 1, d + 6);
    else {
      const libelle = sel || "texte";
      remplacer(d, f, "[" + libelle + "](https://)", d + 1, d + 1 + libelle.length);
    }
  }

  function clavier(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); entourer("**", "**"); }
    else if (k === "i") { e.preventDefault(); entourer("*", "*"); }
    else if (k === "k") { e.preventDefault(); lien(); }
  }

  const mots = value.trim() ? value.trim().split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.round(mots / 200));

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button type="button" className="secondaire" onClick={() => entourer("**", "**")} title="Gras (Ctrl+B)"><strong>G</strong></button>
        <button type="button" className="secondaire" onClick={() => entourer("*", "*")} title="Italique (Ctrl+I)"><em>I</em></button>
        <button type="button" className="secondaire" onClick={() => lien()} title="Lien (Ctrl+K)">&#128279;</button>
        <button type="button" className="secondaire" onClick={() => prefixer("- ")} title="Liste">&#8226;</button>
        <button type="button" className="secondaire" onClick={() => prefixer("> ")} title="Citation">&#10077;</button>
        <span className="meta" style={{ marginLeft: "auto" }}>{value.length}/20000 &middot; {mots} mot(s) &middot; ~{minutes} min de lecture</span>
      </div>
      <textarea id={id} ref={ref} rows={16} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={clavier} />
      <p className="meta">Formats : <span className="mono">**gras**</span>, <span className="mono">*italique*</span>, <span className="mono">[texte](https://exemple.fr)</span>, lignes <span className="mono">-</span> = liste, <span className="mono">&gt;</span> = citation. L’aperçu montre le rendu exact.</p>
    </div>
  );
}
