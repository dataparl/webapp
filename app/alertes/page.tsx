import type { Metadata } from "next";
import FormulaireAlertes from "./Formulaire";

export const metadata: Metadata = { title: "Alertes par email" };

export default function Alertes() {
  return (
    <>
      <h1><span className="surligne">Alertes</span> par email</h1>
      <p className="lead">
        Recevez les arrivées, départs et transferts de collaborateurs parlementaires dès qu&apos;ils apparaissent dans les
        publications officielles. Un email de confirmation vous sera envoyé.
      </p>
      <div className="card"><FormulaireAlertes /></div>
      <p className="meta" style={{ maxWidth: "60ch" }}>
        Votre adresse ne sert qu&apos;à l&apos;envoi de ces alertes. Elle n&apos;est ni vendue ni partagée. Le Parlement européen
        est suivi dès que sa source redevient accessible.
      </p>
    </>
  );
}
