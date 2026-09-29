import type { Metadata } from "next";
import ReglageAlertes from "./ReglageAlertes";

export const metadata: Metadata = { title: "Alertes par email" };

export default function Alertes() {
  return (
    <>
      <h1><span className="surligne">Alertes</span> par email</h1>
      <p className="lead">
        Choisissez les élus, groupes, chambres et types de mouvements à suivre : DataParl&apos; vous écrit dès
        qu&apos;un changement apparaît dans les publications officielles.
      </p>
      <ReglageAlertes />
    </>
  );
}
