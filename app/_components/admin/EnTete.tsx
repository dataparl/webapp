"use client";
import { useEffect, useState } from "react";
import { lien, type Espace } from "./liens";
import { useAdmin } from "./Porte";

const SECTIONS: [string, string][] = [
  ["/", "Tableau de bord"], ["/contact", "Contact"], ["/abonnes", "Abonnés"], ["/oppositions", "Oppositions"],
  ["/cles", "Clés API"], ["/admins", "Admins"], ["/journal", "Journal"],
];

export default function EnTete({ espace }: { espace: Espace }) {
  const { github, verrouiller } = useAdmin();
  const [actif, setActif] = useState("");
  useEffect(() => { setActif(window.location.pathname.replace(/^\/admin/, "") || "/"); }, []);
  return (
    <header className="site admin">
      <div className="wrap large">
        <a className="logo" href={lien(espace)}>Data<span className="surligne">Parl&apos;</span> <span className="espace">{espace === "admin" ? "Admin" : "Webmail"}</span></a>
        <nav>
          {espace === "admin"
            ? SECTIONS.map(([c, l]) => <a key={c} href={lien("admin", c)} aria-current={actif === c ? "page" : undefined}>{l}</a>)
            : <a href={lien("admin")}>Administration</a>}
          {espace === "admin" && <a href={lien("webmail")}>Webmail</a>}
          <span className="meta">{github}</span>
          <button className="lien" onClick={verrouiller}>Verrouiller</button>
        </nav>
      </div>
    </header>
  );
}
