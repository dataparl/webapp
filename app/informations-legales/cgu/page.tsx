import type { Metadata } from "next";
import { CONTACT, MISE_A_JOUR } from "../maj";

export const metadata: Metadata = { title: "Conditions d'utilisation" };

export default function CGU() {
  return (
    <>
      <h1>Conditions <span className="surligne">d&apos;utilisation</span></h1>
      <p className="meta">Dernière mise à jour : {MISE_A_JOUR}</p>

      <h2>1. Objet</h2>
      <p>
        DataParl&apos; recense les collaborateurs des députés, sénateurs et eurodéputés à partir des publications
        officielles, et signale leurs arrivées, départs et transferts. Les présentes conditions encadrent
        l&apos;utilisation du site, des alertes par email et du compte utilisateur. L&apos;usage de l&apos;API relève en
        plus des <a href="/informations-legales/cgu-api">conditions d&apos;utilisation de l&apos;API</a>.
      </p>
      <p>Utiliser le site, créer un compte ou s&apos;abonner aux alertes vaut acceptation de ces conditions.</p>

      <h2>2. Accès</h2>
      <p>
        Le service est gratuit, sans publicité et sans pistage. Il est fourni en l&apos;état, sans garantie de
        disponibilité : il peut être interrompu pour maintenance, en cas d&apos;indisponibilité d&apos;une source ou de
        l&apos;hébergeur.
      </p>

      <h2>3. Compte</h2>
      <p>
        Un compte se crée avec une adresse email (code de connexion à usage unique) ou via Google ou GitHub. Tu es
        responsable de l&apos;accès à ta messagerie et aux comptes utilisés pour te connecter. Tu peux exporter tes
        données ou supprimer ton compte à tout moment depuis <a href="/mon-compte">Mon compte</a>.
      </p>

      <h2>4. Alertes par email</h2>
      <p>
        L&apos;abonnement aux alertes repose sur ton consentement, confirmé par email (double validation). Chaque alerte
        contient un lien pour régler tes préférences et un lien de désinscription en un clic.
      </p>

      <h2>5. Nature et limites des informations</h2>
      <ul>
        <li>Les données reprennent les listes publiées par les assemblées ; DataParl&apos; ne les modifie pas sur le fond.</li>
        <li>
          Les mouvements sont détectés automatiquement en comparant deux publications successives. La date indiquée est
          celle à laquelle le changement a été constaté, pas la date du contrat de travail, que les sources ne publient
          pas.
        </li>
        <li>
          Des erreurs sont possibles (homonymes, coquille dans la source, publication tardive ou incomplète). Un
          mouvement signalé n&apos;emporte aucun jugement sur les personnes concernées.
        </li>
        <li>
          La méthode, les sources et leurs limites sont documentées publiquement dans le dépôt{" "}
          <a href="https://github.com/dataparl/collaborateurs">dataparl/collaborateurs</a>.
        </li>
      </ul>
      <p>
        Pour signaler une erreur : <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Les corrections justifiées sont
        appliquées dans les meilleurs délais.
      </p>

      <h2>6. Usages interdits</h2>
      <ul>
        <li>utiliser les informations pour harceler, menacer, démarcher ou discriminer les personnes citées ;</li>
        <li>extraire le site de manière automatisée en dehors de l&apos;API, ou chercher à contourner ses limites ;</li>
        <li>porter atteinte à la sécurité ou au fonctionnement du service ;</li>
        <li>présenter les informations de façon trompeuse, notamment en les sortant de leur contexte ou de leur date.</li>
      </ul>
      <p>Un usage contraire à ces règles peut entraîner la suspension du compte ou des clés API concernés.</p>

      <h2>7. Responsabilité</h2>
      <p>
        L&apos;éditeur met en œuvre des moyens raisonnables pour assurer l&apos;exactitude des informations, sans pouvoir
        la garantir. Il ne saurait être tenu responsable de l&apos;usage fait des informations par les utilisateurs ou
        les réutilisateurs, ni des contenus des sites vers lesquels DataParl&apos; renvoie.
      </p>

      <h2>8. Modification des conditions</h2>
      <p>
        Ces conditions peuvent évoluer. La date de mise à jour figure en haut de page ; en cas de changement important,
        les titulaires d&apos;un compte en sont informés par email.
      </p>

      <h2>9. Droit applicable</h2>
      <p>
        Les présentes conditions sont régies par le droit français. En cas de litige, une solution amiable est
        recherchée en priorité ; à défaut, les tribunaux français sont compétents.
      </p>
    </>
  );
}
