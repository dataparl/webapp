"use client";
import { useEffect, useState } from "react";
import { lien } from "@/app/_components/admin/liens";

const ONGLETS = [["/presse/pressrelease", "Communiqués"], ["/presse/presslist", "Carnet presse"], ["/presse/mailing", "Mailing"]];

export default function Onglets() {
  const [actif, setActif] = useState("");
  useEffect(() => { setActif(window.location.pathname.replace(/^\/admin/, "")); }, []);
  return (
    <div className="onglets-pages">
      {ONGLETS.map(([c, l]) => <a key={c} href={lien("admin", c)} aria-current={actif.startsWith(c) ? "page" : undefined}>{l}</a>)}
    </div>
  );
}
