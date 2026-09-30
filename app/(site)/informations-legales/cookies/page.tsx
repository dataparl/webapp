import type { Metadata } from "next";
import { MISE_A_JOUR } from "../maj";

export const metadata: Metadata = { title: "Cookies" };

export default function Cookies() {
  return (
    <>
      <h1><span className="surligne">Cookies</span></h1>
      <p className="meta">Dernière mise à jour : {MISE_A_JOUR}</p>
      <p>
        DataParl&apos; n&apos;utilise aucun cookie publicitaire, aucun outil de mesure d&apos;audience et aucun pistage.
        Les seuls cookies déposés sont strictement nécessaires au service : ils sont dispensés
        de consentement (article 82 de la loi Informatique et libertés), c&apos;est pourquoi le bandeau d&apos;accueil
        se contente de t&apos;en informer.
      </p>

      <h2>Ce qui est stocké</h2>
      <p>
        Ces cookies sont posés sur le domaine <code>dataparl.fr</code>, pour qu&apos;une seule connexion vaille sur
        le site et sur l&apos;espace API.
      </p>
      <table>
        <thead><tr><th>Nom</th><th>Rôle</th><th>Durée</th></tr></thead>
        <tbody>
          <tr>
            <td><code>dp-auth.0</code>, <code>dp-auth.1</code>… (cookies)</td>
            <td>Garder ta session ouverte une fois connecté(e) ; la session est découpée en plusieurs cookies</td>
            <td>Jusqu&apos;à la déconnexion, 30 jours au plus</td>
          </tr>
          <tr>
            <td><code>dp-auth-code-verifier.0</code> (cookie)</td>
            <td>Sécuriser la connexion via Google ou GitHub, le temps de l&apos;aller-retour</td>
            <td>Quelques minutes</td>
          </tr>
          <tr>
            <td><code>dp_info_cookies_v1.0</code> (cookie)</td>
            <td>Ne pas réafficher le bandeau d&apos;information</td>
            <td>30 jours</td>
          </tr>
        </tbody>
      </table>
      <p>
        Si tu choisis de te connecter avec Google ou GitHub, ces services déposent leurs propres cookies sur leurs
        domaines, selon leurs politiques respectives. DataParl&apos; n&apos;y a pas accès.
      </p>

      <h2>Gérer ou supprimer</h2>
      <p>
        Tu peux effacer ces éléments à tout moment depuis les réglages de ton navigateur (données de site). Tu seras
        simplement déconnecté(e).
      </p>
      <p>
        Si DataParl&apos; ajoutait un jour une mesure d&apos;audience nécessitant ton accord, le bandeau te demanderait
        ton choix avant tout dépôt, et cette page serait mise à jour.
      </p>
    </>
  );
}
