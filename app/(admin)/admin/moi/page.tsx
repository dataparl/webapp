"use client";
import { useState } from "react";
import { LIBELLE_ROLE } from "@/app/_components/admin/EnTete";
import { lien } from "@/app/_components/admin/liens";
import { useAdmin } from "@/app/_components/admin/Porte";
import { signatureHtml, vcard } from "@/lib/signature";

export default function MonEspace() {
  const { nom, email, role, api } = useAdmin();
  const fonction = `${LIBELLE_ROLE[role]} · DataParl'`;
  const [mdp, setMdp] = useState("");
  const [conf, setConf] = useState("");
  const [etat, setEtat] = useState<{ ok: boolean; t: string } | null>(null);
  const [copie, setCopie] = useState(false);
  const html = signatureHtml(nom, fonction, email);

  async function changer(e: React.FormEvent) {
    e.preventDefault();
    if (mdp.length < 8) return setEtat({ ok: false, t: "Au moins 8 caractères." });
    if (mdp !== conf) return setEtat({ ok: false, t: "Les deux saisies ne correspondent pas." });
    try {
      await api("/api/admin/moi", { method: "POST", body: { mot_de_passe: mdp } });
      setMdp(""); setConf("");
      setEtat({ ok: true, t: "Mot de passe mis à jour." });
    } catch (err) { setEtat({ ok: false, t: (err as Error).message }); }
  }

  function telechargerVcf() {
    const url = URL.createObjectURL(new Blob([vcard(nom, fonction, email)], { type: "text/vcard;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${email.split("@")[0]}-dataparl.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copierSignature() {
    // Copie en HTML (collage direct dans Gmail / Outlook) et en texte brut.
    try {
      await navigator.clipboard.write([new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([`${nom}\n${fonction}\n${email} · dataparl.fr`], { type: "text/plain" }),
      })]);
    } catch { await navigator.clipboard?.writeText(html); }
    setCopie(true);
    setTimeout(() => setCopie(false), 2500);
  }

  return (
    <>
      <h1>Mon espace</h1>
      <div className="deux-colonnes">
        <div style={{ display: "grid", gap: 20 }}>
          <div className="profil-carte">
            <span className="avatar">{nom.charAt(0).toUpperCase()}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{nom}</div>
              <div className="meta">{email}</div>
              <span className={`badge-role ${role}`} style={{ marginTop: 6 }}>{LIBELLE_ROLE[role]}</span>
            </div>
          </div>

          <form className="card" onSubmit={changer}>
            <h2 style={{ marginTop: 0 }}>Mot de passe</h2>
            <label htmlFor="m-mdp">Nouveau mot de passe</label>
            <input id="m-mdp" type="password" autoComplete="new-password" value={mdp} onChange={(e) => setMdp(e.target.value)} placeholder="8 caractères minimum" />
            <label htmlFor="m-conf">Confirmation</label>
            <input id="m-conf" type="password" autoComplete="new-password" value={conf} onChange={(e) => setConf(e.target.value)} />
            {etat && <p className={etat.ok ? "ok" : "erreur"}>{etat.t}</p>}
            <button disabled={!mdp}>Changer</button>
          </form>

          <div className="card">
            <h2 style={{ marginTop: 0 }}>Sur mon téléphone</h2>
            <p>Ta boîte {email} se consulte sur <a href={lien("webmail")}>la messagerie</a>, aussi sur mobile : ajoute-la à l&apos;écran d&apos;accueil depuis le navigateur.</p>
            <p className="meta">La fiche contact (.vcf) ajoute ton adresse professionnelle à ton carnet d&apos;adresses ou se partage à un correspondant.</p>
            <button className="secondaire" onClick={telechargerVcf}>Télécharger ma fiche contact</button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Ma signature email</h2>
          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: 16 }} dangerouslySetInnerHTML={{ __html: html }} />
          <button onClick={copierSignature}>{copie ? "Signature copiée" : "Copier la signature"}</button>
          <p className="meta">À coller dans Gmail (Paramètres, Signature) ou Outlook : la mise en forme est conservée.</p>
          <details className="tableau">
            <summary>Voir le code HTML</summary>
            <pre>{html}</pre>
          </details>
        </div>
      </div>
    </>
  );
}
