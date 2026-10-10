import type { Metadata } from "next";
import Playground from "./Playground";

export const metadata: Metadata = { title: "Playground", alternates: { canonical: "/docs/playground" } };

export default function PagePlayground() {
  return (
    <>
      <h1><span className="surligne">Playground</span></h1>
      <p className="lead">
        Essaie l&apos;API directement ici : choisis tes filtres, colle ta clé, exécute.
        La clé reste dans ton navigateur, elle n&apos;est envoyée qu&apos;à l&apos;API DataParl&apos;.
        Pas encore de clé ? <a href="/request-access">Demande-la</a>, elle est gratuite.
      </p>
      <Playground />
    </>
  );
}
