"use client";
import { useEffect, useState } from "react";
import { lien, type Espace } from "./liens";
import { useAdmin, type Role } from "./Porte";

export const LIBELLE_ROLE: Record<Role, string> = { admin: "Administrateur", editeur: "Éditeur", utilisateur: "Utilisateur" };

// Sections de l'admin : ouvertes à des rôles, ou selon un module de la matrice de permissions.
const SECTIONS: [string, string, Role[] | string][] = [
  ["/", "Tableau de bord", ["admin", "editeur"]],
  ["/contact", "Contact", "formulaires"],
  ["/elus", "Élus", "elus"],
  ["/jorf", "JORF", "jorf"],
  ["/abonnes", "Abonnés", "comptes"],
  ["/users", "Comptes", "comptes"],
  ["/oppositions", "Oppositions", "formulaires"],
  ["/content/sitemap", "Plan du site", "contenu_sitemap"],
  ["/content/links", "Liens", "contenu_liens"],
  ["/communication", "Communication", "communication"],
  ["/cles", "Clés API", "cles_api"],
  ["/equipe", "Équipe", ["admin"]],
  ["/journal", "Journal", "journal"],
  ["/moi", "Mon espace", ["admin", "editeur", "utilisateur"]],
];

export default function EnTete({ espace }: { espace: Espace }) {
  const { nom, email, role, modules, verrouiller } = useAdmin();
  const [actif, setActif] = useState("");
  useEffect(() => { setActif(window.location.pathname.replace(/^\/admin/, "") || "/"); }, []);
  const sections = SECTIONS.filter(([, , acces]) => (typeof acces === "string" ? modules.includes(acces) : acces.includes(role)));
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
          ? sections.map(([c, l]) => <a key={c} href={lien("admin", c)} aria-current={actif === c || (c !== "/" && actif.startsWith(`${c}/`)) ? "page" : undefined}>{l}</a>)
          : <a href={lien("admin", role === "utilisateur" ? "/moi" : "/")}>← Espace équipe</a>}
        {espace === "admin" && <a href={lien("webmail")}>Messagerie</a>}
      </nav>
    </header>
  );
}
