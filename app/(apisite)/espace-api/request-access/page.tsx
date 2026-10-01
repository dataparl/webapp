import type { Metadata } from "next";
import DemandeCle from "./DemandeCle";

export const metadata: Metadata = { title: "Demander une clé", alternates: { canonical: "/request-access" } };

export default function RequestAccess() {
  return (
    <div className="etroit">
      <h1>Demander ta <span className="surligne">clé</span></h1>
      <p className="lead">Gratuite, immédiate, une par compte. Il suffit d&apos;un compte DataParl&apos; et d&apos;accepter les conditions d&apos;utilisation de l&apos;API.</p>
      <DemandeCle />
    </div>
  );
}
