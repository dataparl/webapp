import type { Metadata } from "next";
import { CONTACT_RGPD, MISE_A_JOUR } from "../maj";

export const metadata: Metadata = { title: "Données personnelles" };

export default function Confidentialite() {
  return (
    <>
      <h1>Données <span className="surligne">personnelles</span></h1>
      <p className="meta">Dernière mise à jour : {MISE_A_JOUR}</p>
      <p>
        DataParl&apos; traite deux sortes de données personnelles : celles des personnes qui utilisent le site
        (compte, alertes, API, contact), et celles des personnes citées dans les données publiées (élus et
        collaborateurs parlementaires). Aucune donnée n&apos;est vendue, louée ni utilisée à des fins publicitaires.
      </p>

      <h2>1. Responsable du traitement</h2>
      <p>
        L&apos;éditeur de DataParl&apos; (voir les <a href="/informations-legales/mentions-legales">mentions légales</a>).
        Pour toute question ou demande relative à tes données : <a href={CONTACT_RGPD}>formulaire de contact</a>, sujet
        « Demande RGPD ».
      </p>

      <h2>2. Utilisateurs du site</h2>
      <table>
        <thead>
          <tr><th>Données</th><th>Finalité</th><th>Base légale</th><th>Conservation</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Adresse email ; identifiant, nom et photo transmis par Google ou GitHub si tu les utilises</td>
            <td>Créer et sécuriser ton compte</td>
            <td>Exécution des conditions d&apos;utilisation</td>
            <td>Jusqu&apos;à la suppression du compte, ou 3 ans sans connexion</td>
          </tr>
          <tr>
            <td>Réglages d&apos;alertes : chambres, types de mouvement, groupes, élus suivis, fréquence</td>
            <td>Envoyer les alertes</td>
            <td>Consentement</td>
            <td>Jusqu&apos;à la désactivation des alertes ou la suppression du compte</td>
          </tr>
          <tr>
            <td>Date, nature de l&apos;action, version de cette politique, adresse IP hachée (jamais en clair), navigateur</td>
            <td>Prouver le consentement ; limiter les abus</td>
            <td>Obligation de pouvoir démontrer le consentement (art. 7 RGPD) ; intérêt légitime</td>
            <td>3 ans après la fin de l&apos;abonnement ou du compte</td>
          </tr>
          <tr>
            <td>Prénom, nom, email, sujet et contenu des messages envoyés via le formulaire de contact</td>
            <td>Répondre à ta demande</td>
            <td>Intérêt légitime ; obligation légale pour les demandes RGPD</td>
            <td>2 ans après le dernier échange</td>
          </tr>
          <tr>
            <td>Destinataire, objet, identifiant et statut des emails envoyés</td>
            <td>Suivre la délivrabilité, traiter les erreurs d&apos;envoi</td>
            <td>Intérêt légitime</td>
            <td>12 mois</td>
          </tr>
          <tr>
            <td>Usage déclaré et empreinte de la clé API, nombre de requêtes par jour</td>
            <td>Fournir l&apos;API, appliquer les quotas</td>
            <td>Exécution des conditions de l&apos;API</td>
            <td>Jusqu&apos;à la révocation de la clé ; compteurs 12 mois</td>
          </tr>
          <tr>
            <td>Journaux techniques de l&apos;hébergeur (adresse IP, pages demandées)</td>
            <td>Sécurité et bon fonctionnement</td>
            <td>Intérêt légitime</td>
            <td>Durée courte fixée par l&apos;hébergeur</td>
          </tr>
        </tbody>
      </table>
      <p>
        Aucune mesure d&apos;audience sur le site et aucun cookie publicitaire. Voir la page{" "}
        <a href="/informations-legales/cookies">Cookies</a>.
      </p>
      <p>
        Les emails envoyés par DataParl&apos; (depuis les adresses en @dataparl.fr) mesurent leur
        ouverture et les clics sur leurs liens, via notre prestataire d&apos;envoi Resend, pour vérifier qu&apos;ils sont
        bien délivrés. Chaque email dispose aussi d&apos;une version en ligne, accessible uniquement par le lien
        unique qu&apos;il contient.
      </p>

      <h2>3. Personnes citées dans les données</h2>
      <p>
        DataParl&apos; publie les noms des collaborateurs des parlementaires, l&apos;élu qui les emploie, son groupe
        politique, et les dates auxquelles une arrivée, un départ ou un transfert a été constaté.
      </p>
      <ul>
        <li>
          <strong>Sources.</strong> Listes publiées par l&apos;Assemblée nationale, le Sénat et le Parlement européen
          (depuis les lois du 11 octobre 2013 relatives à la transparence de la vie publique, les parlementaires
          déclarent leurs collaborateurs dans leur déclaration d&apos;intérêts, rendue publique, et les assemblées
          publient ces listes), et archives de ces publications. Ces données ne sont pas collectées auprès des
          personnes elles-mêmes.
        </li>
        <li>
          <strong>Finalité et base légale.</strong> Information du public sur le fonctionnement des assemblées,
          transparence de la vie publique, recherche : intérêt légitime (art. 6, 1, f du RGPD), fondé sur le
          caractère public de ces informations.
        </li>
        <li>
          <strong>Fiches de parcours.</strong> Pour chaque collaborateur, DataParl&apos; rassemble sur une fiche les
          élus pour lesquels la personne a figuré sur les listes officielles, avec les dates et la chambre. Ces fiches ne
          sont pas indexées par les moteurs de recherche, et le parcours complet n&apos;est visible que par les comptes
          connectés. Une personne est reconnue à son nom : deux homonymes peuvent être confondus, ce qui se corrige sur
          simple demande.
        </li>
        <li>
          <strong>Limites.</strong> Aucune donnée sensible, aucune adresse ni téléphone personnels, aucune évaluation
          des personnes : seules les informations des listes officielles sont reprises.
        </li>
        <li>
          <strong>Conservation.</strong> Ces informations constituent une archive de la vie parlementaire et sont
          conservées sans limite de durée, à l&apos;image des publications officielles dont elles sont issues.
        </li>
      </ul>

      <h3>Adresses email professionnelles déduites</h3>
      <p>
        Pour les comptes connectés, la rubrique Collaborateurs affiche une adresse email professionnelle déduite des
        règles de nommage des assemblées (par exemple <code>prenom.nom@clb-an.fr</code> ou{" "}
        <code>initiales.nom@clb.senat.fr</code>). Ces adresses :
      </p>
      <ul>
        <li>ne sont publiées par aucune institution et ne sont pas vérifiées : elles peuvent être inexactes ;</li>
        <li>sont calculées à partir du nom publié, jamais collectées ailleurs ;</li>
        <li>
          servent à permettre un contact professionnel avec les équipes parlementaires, dans le cadre de leurs
          fonctions (intérêt légitime) ; les CGU interdisent le harcèlement, la prospection commerciale sans rapport
          avec l&apos;activité parlementaire et la revente des listes ;
        </li>
        <li>
          cessent d&apos;être affichées dès que la personne concernée le demande : <a href={CONTACT_RGPD}>formulaire
          de contact</a>, sujet « Demande RGPD ».
        </li>
      </ul>

      <h3>Tes droits si tu es concerné(e)</h3>
      <p>
        Tu peux demander l&apos;accès à tes données, la rectification d&apos;une erreur, le masquage de ton adresse
        déduite, ou t&apos;opposer au traitement pour des raisons tenant à ta situation particulière. Chaque demande
        d&apos;opposition est examinée au cas par cas, en la mettant en balance avec l&apos;intérêt public de
        l&apos;information. Cette page tient lieu d&apos;information des personnes concernées : les contacter
        individuellement exigerait des efforts disproportionnés (art. 14, 5, b du RGPD).
      </p>

      <h2>4. Prestataires et transferts</h2>
      <table>
        <thead><tr><th>Prestataire</th><th>Rôle</th><th>Localisation</th></tr></thead>
        <tbody>
          <tr><td>Supabase</td><td>Base de données, comptes</td><td>Union européenne (Irlande)</td></tr>
          <tr><td>Vercel</td><td>Hébergement du site</td><td>États-Unis, réseau mondial</td></tr>
          <tr><td>Resend</td><td>Envoi des emails</td><td>Envoi depuis l&apos;Union européenne (Irlande) ; société américaine</td></tr>
          <tr><td>Google, GitHub</td><td>Connexion, uniquement si tu choisis ces services</td><td>Union européenne et États-Unis</td></tr>
          <tr><td>Infomaniak</td><td>Réception des messages du formulaire de contact</td><td>Suisse</td></tr>
        </tbody>
      </table>
      <p>
        Les transferts hors de l&apos;Union européenne sont encadrés, selon le prestataire, par le cadre de protection
        des données UE-États-Unis ou par les clauses contractuelles types de la Commission européenne. La Suisse
        bénéficie d&apos;une décision d&apos;adéquation.
      </p>

      <h2>5. Tes droits</h2>
      <p>
        Tu disposes des droits d&apos;accès, de rectification, d&apos;effacement, de limitation, de portabilité et
        d&apos;opposition, ainsi que du droit de retirer ton consentement à tout moment et de définir des directives
        sur le sort de tes données après ton décès.
      </p>
      <ul>
        <li>Export et suppression de ton compte : directement depuis <a href="/mon-compte">Mon compte</a>.</li>
        <li>Alertes : désactivation depuis la page <a href="/alertes">Alertes</a> ou lien de désinscription dans chaque email.</li>
        <li>Toute autre demande : <a href={CONTACT_RGPD}>formulaire de contact</a>, sujet « Demande RGPD ». Réponse sous un mois.</li>
      </ul>
      <p>
        Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
      </p>
    </>
  );
}
