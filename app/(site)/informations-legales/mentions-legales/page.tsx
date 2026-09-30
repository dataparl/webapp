import type { Metadata } from "next";
import { CONTACT_URL, MISE_A_JOUR } from "../maj";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegales() {
  return (
    <>
      <h1>Mentions <span className="surligne">légales</span></h1>
      <p className="meta">Dernière mise à jour : {MISE_A_JOUR}</p>

      <h2>Éditeur</h2>
      <p>
        DataParl&apos; est édité par une personne physique, à titre personnel et non professionnel. Conformément à
        l&apos;article 6, III, 2 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique
        (LCEN), l&apos;éditeur a choisi de ne pas rendre publique son identité ; celle-ci a été communiquée à
        l&apos;hébergeur, qui peut la transmettre sur réquisition judiciaire.
      </p>
      <p>Directeur de la publication : l&apos;éditeur.</p>
      <p>Contact : <a href={CONTACT_URL}>formulaire de contact</a>.</p>

      <h2>Hébergement</h2>
      <p>
        Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (vercel.com).
      </p>
      <p>
        Bases de données et comptes : Supabase Inc. (supabase.com), serveurs situés dans l&apos;Union européenne
        (Irlande).
      </p>
      <p>Code source et données publiées : GitHub Inc. (github.com), comptes « dataparl ».</p>

      <h2>Nom de domaine</h2>
      <p>
        Le site est accessible à l&apos;adresse dataparl.fr (ancienne adresse : cavaparlement.eu, redirigée), enregistrée auprès d&apos;IONOS SE,
        Elgendorfer Straße 57, 56410 Montabaur, Allemagne.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, la charte graphique, le logotype et les visualisations de DataParl&apos; sont protégés par le droit
        de la propriété intellectuelle. Leur reproduction est soumise à autorisation préalable, sauf courte citation
        mentionnant la source.
      </p>
      <p>
        Les données, elles, sont ouvertes : leurs conditions de réutilisation sont décrites sur la page{" "}
        <a href="/informations-legales/licences">Licences et réutilisation</a>.
      </p>

      <h2>Sources et indépendance</h2>
      <p>
        Les informations publiées proviennent des publications officielles de l&apos;Assemblée nationale, du Sénat et
        du Parlement européen, et de leurs archives. DataParl&apos; n&apos;est affilié à
        aucune de ces institutions, ni à aucun parti, groupe politique ou représentant d&apos;intérêts.
      </p>

      <h2>Signaler une erreur ou un contenu</h2>
      <p>
        Une information inexacte, un contenu illicite ou une demande relative à des données personnelles : utilise le{" "}
        <a href={CONTACT_URL}>formulaire de contact</a>. Voir aussi la page{" "}
        <a href="/informations-legales/confidentialite">Données personnelles</a>.
      </p>
    </>
  );
}
