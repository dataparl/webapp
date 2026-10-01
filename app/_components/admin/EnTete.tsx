"use client";
import { useEffect, useState } from "react";
import { lien, type Espace } from "./liens";
import { useAdmin, type Role } from "./Porte";

export const LIBELLE_ROLE: Record<Role, string> = { admin: "Administrateur", editeur: "Éditeur", utilisateur: "Utilisateur" };

// Sections de l'admin et rôles qui y ont accès.
const SECTIONS: [string, string, Role[]][] = [
  ["/", "Tableau de bord", ["admin", "editeur"]],
  ["/contact", "Contact", ["admin", "editeur"]],
  ["/abonnes", "Abonnés", ["admin", "editeur"]],
  ["/oppositions", "Oppositions", ["admin", "editeur"]],
  ["/cles", "Clés API", ["admin"]],
  ["/equipe", "Équipe", ["admin"]],
  ["/journal", "Journal", ["admin"]],
  ["/moi", "Mon espace", ["admin", "editeur", "utilisateur"]],
];

export default function EnTete({ espace }: { espace: Espace }) {
  const { nom, email, role, verrouiller } = useAdmin();
  const [actif, setActif] = useState("");
  useEffect(() => { setActif(window.location.pathname.replace(/^\/admin/, "") || "/"); }, []);
  const sections = SECTIONS.filter(([, , roles]) => roles.includes(role));
  return (
    <header className="site admin">
      <div className="wrap large">
        <a className="logo" href={lien(espace, role === "utilisateur" ? "/moi" : "/")}>Data<span className="surligne">Parl&apos;</span> <span className="espace">{espace === "admin" ? "Espace équipe" : "Webmail"}</span></a>
        <div className="qui">
          <span className={`badge-role ${role}`}>{LIBELLE_ROLE[role]}</span>
          <span className="qui-nom"><strong>{nom}</strong><span className="meta">{email}</span></span>
          <button className="lien" onClick={verrouiller}>Verrouiller</button>
        </div>
      </div>
      <nav className="wrap large onglets-admin">
        {espace === "admin"
          ? sections.map(([c, l]) => <a key={c} href={lien("admin", c)} aria-current={actif === c ? "page" : undefined}>{l}</a>)
          : <a href={lien("admin", role === "utilisateur" ? "/moi" : "/")}>← Espace équipe</a>}
        {espace === "admin" && <a href={lien("webmail")}>Messagerie</a>}
      </nav>
    </header>
  );
}
