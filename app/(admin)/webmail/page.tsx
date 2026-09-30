"use client";
import { useCallback, useEffect, useState } from "react";
import { adresse, citer, documentLecture, listeAdresses, nomAffiche, prefixer } from "@/app/_components/admin/courriel";
import { useAdmin } from "@/app/_components/admin/Porte";
import { dateHeure } from "@/app/_components/admin/utils";
import { EXPEDITEURS } from "@/lib/env";

type Dossier = "inbox" | "sent" | "auto" | "archive" | "trash";
const DOSSIERS: [Dossier, string][] = [["inbox", "Reçus"], ["sent", "Envoyés"], ["auto", "Automatiques"], ["archive", "Archives"], ["trash", "Corbeille"]];

type Resume = { id: string; direction: "in" | "out"; from_addr: string; to_addr: string; subject: string; date: string; read: boolean; flagged: boolean; pieces: number; bounced_at: string | null };
type Complet = Resume & {
  cc_addr: string | null; reply_to: string | null; body_html: string | null; body_text: string | null; folder: Dossier;
  message_id: string | null; attachments: { id: string; filename: string; content_type: string; size: number | null }[];
};
type Liste = { total: number; page: number; par_page: number; non_lus: Record<Dossier, number>; messages: Resume[] };
type Brouillon = { from: string; to: string; cc: string; subject: string; text: string; reponse_a?: string };

const vide = (): Brouillon => ({ from: EXPEDITEURS[0], to: "", cc: "", subject: "", text: "" });

export default function Webmail() {
  const { api } = useAdmin();
  const [dossier, setDossier] = useState<Dossier>("inbox");
  const [q, setQ] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(0);
  const [liste, setListe] = useState<Liste | null>(null);
  const [ouvert, setOuvert] = useState<{ message: Complet; evenements: { type: string; created_at: string }[] } | null>(null);
  const [brouillon, setBrouillon] = useState<Brouillon | null>(null);
  const [images, setImages] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const charger = useCallback(async () => {
    try { setListe(await api<Liste>("/api/webmail/messages", { query: { dossier, q: recherche, page } })); }
    catch (e) { setInfo((e as Error).message); }
  }, [api, dossier, recherche, page]);
  useEffect(() => { charger(); }, [charger]);

  async function ouvrir(id: string) {
    setBrouillon(null); setImages(false); setInfo(null);
    setOuvert(await api("/api/webmail/messages/" + id));
    charger();
  }
  async function deplacer(id: string, folder: Dossier) {
    await api("/api/webmail/messages/" + id, { method: "PATCH", body: { folder } });
    setOuvert(null); charger();
  }
  async function basculer(id: string, champ: "read" | "flagged", valeur: boolean) {
    await api("/api/webmail/messages/" + id, { method: "PATCH", body: { [champ]: valeur } });
    if (champ === "read" && !valeur) setOuvert(null);
    charger();
  }
  async function supprimer(id: string) {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    await api("/api/webmail/messages/" + id, { method: "DELETE" });
    setOuvert(null); charger();
  }
  async function piece(id: string, pid: string) {
    const r = await api<{ url: string }>(`/api/webmail/messages/${id}/pieces/${encodeURIComponent(pid)}`);
    window.open(r.url, "_blank", "noopener,noreferrer");
  }

  function repondre(m: Complet, tous: boolean) {
    const moi = new Set(EXPEDITEURS);
    const dest = m.direction === "in" ? adresse(m.reply_to || m.from_addr) : listeAdresses(m.to_addr)[0] ?? "";
    const autres = tous ? [...listeAdresses(m.to_addr), ...listeAdresses(m.cc_addr ?? "")].filter((a) => a !== dest && !moi.has(a)) : [];
    const recuSur = listeAdresses(m.to_addr).find((a) => moi.has(a) && a.endsWith("@dataparl.fr"));
    setBrouillon({
      from: m.direction === "out" ? adresse(m.from_addr) : recuSur ?? EXPEDITEURS[0],
      to: dest, cc: autres.join(", "), subject: prefixer(m.subject, "Re"),
      text: `\n\n${dateHeure(m.date)}, ${nomAffiche(m.from_addr)} a écrit :\n${citer(m.body_text ?? "")}`,
      reponse_a: m.id,
    });
  }
  function transferer(m: Complet) {
    setBrouillon({
      ...vide(), subject: prefixer(m.subject, "Tr"),
      text: `\n\n---------- Message transféré ----------\nDe : ${m.from_addr}\nDate : ${dateHeure(m.date)}\nObjet : ${m.subject}\nÀ : ${m.to_addr}\n\n${m.body_text ?? ""}`,
    });
  }

  const nonLus = liste?.non_lus ?? { inbox: 0, sent: 0, auto: 0, archive: 0, trash: 0 };

  return (
    <div className={`webmail ${ouvert || brouillon ? "avec-lecture" : ""}`}>
      <aside className="wm-dossiers">
        <button onClick={() => { setOuvert(null); setBrouillon(vide()); }}>Nouveau message</button>
        <nav>
          {DOSSIERS.map(([d, l]) => (
            <a key={d} href="#" aria-current={dossier === d ? "page" : undefined}
              onClick={(e) => { e.preventDefault(); setDossier(d); setPage(0); setOuvert(null); }}>
              {l}{nonLus[d] > 0 && <span className="compteur">{nonLus[d]}</span>}
            </a>
          ))}
        </nav>
      </aside>

      <section className="wm-liste">
        <form onSubmit={(e) => { e.preventDefault(); setPage(0); setRecherche(q); }}>
          <input type="text" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Rechercher dans les emails" />
        </form>
        {liste?.messages.length === 0 && <p className="meta">Aucun message.</p>}
        <ul>
          {liste?.messages.map((m) => (
            <li key={m.id} className={`${m.read ? "" : "non-lu"} ${ouvert?.message.id === m.id ? "actif" : ""}`}>
              <button onClick={() => ouvrir(m.id)}>
                <span className="wm-ligne1">
                  <span className="wm-qui">{nomAffiche(m.direction === "in" ? m.from_addr : `À : ${m.to_addr}`)}</span>
                  <span className="meta">{dateHeure(m.date)}</span>
                </span>
                <span className="wm-objet">
                  {m.flagged && <span aria-label="suivi" title="Suivi">★ </span>}
                  {m.subject || "(sans objet)"}
                  {m.pieces > 0 && <span className="meta"> · {m.pieces} PJ</span>}
                  {m.bounced_at && <span className="erreur"> · non distribué</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {liste && liste.total > liste.par_page && (
          <p className="pagination">
            <button className="lien" disabled={page === 0} onClick={() => setPage(page - 1)}>Précédents</button>
            <span className="meta">{page * liste.par_page + 1} à {Math.min((page + 1) * liste.par_page, liste.total)} sur {liste.total}</span>
            <button className="lien" disabled={(page + 1) * liste.par_page >= liste.total} onClick={() => setPage(page + 1)}>Suivants</button>
          </p>
        )}
      </section>

      <section className="wm-lecture">
        {info && <p className="erreur">{info}</p>}
        {brouillon && <Redaction b={brouillon} onChange={setBrouillon} onFin={(m) => { setBrouillon(null); setInfo(m); charger(); }} />}
        {!brouillon && ouvert && (() => {
          const m = ouvert.message;
          return (
            <article>
              <button className="lien retour" onClick={() => setOuvert(null)}>← Retour</button>
              <h1 className="wm-titre">{m.subject || "(sans objet)"}</h1>
              <p className="meta">
                De : {m.from_addr}<br />À : {m.to_addr}{m.cc_addr && <><br />Cc : {m.cc_addr}</>}
                {m.reply_to && <><br />Répondre à : {m.reply_to}</>}<br />{dateHeure(m.date)}
              </p>
              {ouvert.evenements.length > 0 && <p className="meta">Suivi : {ouvert.evenements.map((e) => `${e.type.replace("email.", "")} (${dateHeure(e.created_at)})`).join(", ")}</p>}
              <div className="actions">
                <button onClick={() => repondre(m, false)}>Répondre</button>
                <button className="secondaire" onClick={() => repondre(m, true)}>Répondre à tous</button>
                <button className="secondaire" onClick={() => transferer(m)}>Transférer</button>
                {m.folder !== "archive" && <button className="secondaire" onClick={() => deplacer(m.id, "archive")}>Archiver</button>}
                {m.folder !== "inbox" && m.direction === "in" && <button className="secondaire" onClick={() => deplacer(m.id, "inbox")}>Remettre dans Reçus</button>}
                <button className="secondaire" onClick={() => basculer(m.id, "flagged", !m.flagged)}>{m.flagged ? "Ne plus suivre" : "Suivre"}</button>
                <button className="secondaire" onClick={() => basculer(m.id, "read", false)}>Marquer non lu</button>
                {m.folder === "trash"
                  ? <button className="danger" onClick={() => supprimer(m.id)}>Supprimer définitivement</button>
                  : <button className="danger" onClick={() => deplacer(m.id, "trash")}>Corbeille</button>}
              </div>
              {m.attachments?.length > 0 && (
                <p className="puces">{m.attachments.map((p) => (
                  <button key={p.id} className="puce" onClick={() => piece(m.id, p.id)}>{p.filename}{p.size ? ` (${Math.ceil(p.size / 1024)} Ko)` : ""}</button>
                ))}</p>
              )}
              {m.body_html ? <>
                {!images && <p className="meta">Images distantes bloquées. <button className="lien" onClick={() => setImages(true)}>Les afficher</button></p>}
                <iframe className="wm-corps" title="Contenu de l'email" sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer"
                  srcDoc={documentLecture(m.body_html, images)} />
              </> : <pre className="wm-texte">{m.body_text ?? ""}</pre>}
            </article>
          );
        })()}
        {!brouillon && !ouvert && <p className="meta wm-vide">Sélectionne un message.</p>}
      </section>
    </div>
  );
}

function Redaction({ b, onChange, onFin }: { b: Brouillon; onChange: (b: Brouillon) => void; onFin: (message: string | null) => void }) {
  const { api } = useAdmin();
  const [err, setErr] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const maj = (k: keyof Brouillon) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange({ ...b, [k]: e.target.value });

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const to = listeAdresses(b.to);
    if (!to.length) return setErr("Ajoute au moins un destinataire valide.");
    setEnvoi(true); setErr(null);
    try {
      await api("/api/webmail/envoyer", { method: "POST", body: { from: b.from, to, cc: listeAdresses(b.cc), subject: b.subject, text: b.text, reponse_a: b.reponse_a } });
      onFin("Message envoyé.");
    } catch (e) { setErr((e as Error).message); setEnvoi(false); }
  }

  return (
    <form onSubmit={envoyer} className="wm-redaction">
      <h1 className="wm-titre">{b.reponse_a ? "Réponse" : "Nouveau message"}</h1>
      <label>De</label>
      <select value={b.from} onChange={maj("from")}>{EXPEDITEURS.map((x) => <option key={x} value={x}>DataParl&apos; &lt;{x}&gt;</option>)}</select>
      <label>À</label><input type="text" value={b.to} onChange={maj("to")} required placeholder="adresse@exemple.fr, autre@exemple.fr" />
      <label>Cc</label><input type="text" value={b.cc} onChange={maj("cc")} />
      <label>Objet</label><input type="text" value={b.subject} onChange={maj("subject")} required />
      <label>Message</label><textarea value={b.text} onChange={maj("text")} rows={14} required autoFocus />
      {err && <p className="erreur">{err}</p>}
      <div className="actions">
        <button disabled={envoi}>{envoi ? "Envoi…" : "Envoyer"}</button>
        <button type="button" className="secondaire" onClick={() => onFin(null)}>Annuler</button>
      </div>
    </form>
  );
}
