# DataParl' : webapp

Site public, alertes par email, connexion, compte, administration et API de DataParl' ([dataparl.fr](https://www.dataparl.fr)). Les anciens domaines (cavaparlement.eu, dataparl.com) redirigent en 308 vers la même adresse sur dataparl.fr ; seules `/api/*` et l'API `/v1` d'api.cavaparlement.eu y répondent encore directement, le temps de la transition. Un seul déploiement Next.js 16 (polices auto-hébergées via next/font, repli métrique — zéro CLS) sert tous les sous-domaines ; le routage est dans `proxy.ts` (nouveau nom de `middleware.ts` depuis Next 16).

| Hôte | Rôle |
|---|---|
| `www.dataparl.fr` | site : accueil, mouvements, collaborateurs, parlementaires, alertes, compte, contact, presse, FAQ, pages légales ; `www.dataparl.fr/sheets` et `/search` redirigent (308) vers `media` ; `/api` redirige vers l'API |
| `dataparl.fr` | redirection 308 vers `www` |
| `cavaparlement.eu`, `dataparl.com` et leurs sous-domaines | redirection 308 vers l'équivalent sur dataparl.fr |
| `api.dataparl.fr` | site de l'API (`/`, `/docs/*`, `/request-access`, `/mon-espace-api`, réécrits vers `/espace-api/*`) et API elle-même (`/v1/*`, réécrit vers `/api/v1/*`) |
| `admin.dataparl.fr` | administration, réécrite vers `/admin/*` |
| `webmail.dataparl.fr` | webmail de l'équipe, réécrite vers `/webmail/*` |
| `mail.dataparl.fr` | versions en ligne des emails (`/lire/<jeton>`) ; le reste redirige vers `www` (enregistrement A vers Vercel) |
| `raw.dataparl.fr` | fichiers bruts publics : `/schemas/*.json` (schémas de données référencés sur data.gouv.fr) ; le reste redirige vers `www` |
| `media.dataparl.fr` | photos des élus et des groupes (`/an/*`, `/senat/*`, `/pe/*`, `/groupes/*`) et le tableur DataParl' Sheets (`/sheets/*`, `/search`, `/connexion`) ; tout autre chemin affiche un interstitiel de 15 secondes puis bascule vers la même adresse sur `www` |
| `drive.dataparl.fr` | ancien domaine du tableur : redirection 308 vers `media` (même chemin, `/sheets/*` inclus) |
| `survey.dataparl.fr` | questionnaire d'avis (une page, jeton `?j=…`, jamais indexée) ; le reste redirige vers `www` |

`/connexion` est servie telle quelle sur chaque hôte : le flux OAuth (PKCE) doit rester sur l'origine qui l'a lancé. La session, elle, est stockée dans des cookies du domaine `.dataparl.fr` (`lib/domaine.ts`) (`lib/cookieStorage.ts`, découpés en morceaux de 3 Ko) : une seule connexion vaut pour `www`, `api` et `admin`.

Les pages sont réparties en quatre groupes de routes : `app/(site)`, `app/(auth)` (connexion), `app/(apisite)` (site de l'API) et `app/(admin)` (admin et webmail), chacun avec son en-tête.

## Fiches et parcours

- `/parlementaires/<id>` : photo officielle, circonscription, groupe et famille politique, commissions, mandats dans les trois chambres (avec groupes et commissions de chaque mandat), équipe et statistiques. `<id>` : PA… (AN), slug senat.fr (Sénat), identifiant européen (PE).
- `/parlementaires/<id>/historique` : tous les collaborateurs de l'élu, toutes chambres (compte requis).
- `/collab` : recherche des équipes ; `/collab/<nom>_<prenom><id>` : fiche d'un collaborateur, parcours complet réservé aux comptes, jamais indexée.
- Autocomplétion partout (`app/_components/Autocompletion.tsx`) : élus (`/api/elus`), groupes et familles politiques (`lib/familles.ts`, ex. ECO = GEST au Sénat, EcoS à l'AN, Verts/ALE au PE ; à compléter à chaque changement de groupe), recherche globale élus + collaborateurs (`/api/recherche`).
- Noms affichés au format « Prénom NOM » (`prenomNom`, `nomAffiche` dans `lib/format.ts`).

Tables alimentées par dataparl/collaborateurs : `parlementaires`, `mandats`, `appartenances`, `collaborateurs`, `periodes`, et les vues `stats_annuelles` et `stats_durees` (VigiParl', MixiParl').

## Données et services

- **Supabase `dataparl`** : données publiques (mouvements, affectations), alimentées par [dataparl/collaborateurs](https://github.com/dataparl/collaborateurs). Lecture seule avec la clé publique.
- **Supabase `dataparl-auth`** : comptes (Supabase Auth), abonnés, alertes, préférences, historique des consentements, jetons, emails, campagnes, admins. Toutes les tables sont fermées par RLS ; seul le serveur y accède avec la clé `service_role`.
- **Resend** : envoi depuis `noreply@dataparl.fr` (API en `fetch` brut). Le domaine `dataparl.fr` est déclaré chez Resend en envoi et en réception (MX racine) : toutes les adresses @dataparl.fr arrivent dans la webmail.

## Alertes : parcours

1. `/alertes` : email, fréquence, chambres, consentement explicite. Champ piège anti-robot, 5 inscriptions par heure et par IP (hachée, jamais stockée en clair).
2. Email de confirmation (lien valable 48 h). La page de confirmation demande un **clic sur un bouton** : les antivirus de messagerie ouvrent les liens et ne doivent pas pouvoir confirmer à la place de la personne.
3. Confirmation : abonnement actif, consentement journalisé (`communication_consents_history`, version de la politique de confidentialité), jeton de préférences créé.
4. Chaque email d'alerte portera `/preferences?id=` et `/desinscription?id=`, ainsi que les en-têtes `List-Unsubscribe` / `List-Unsubscribe-Post` (désinscription en un clic, RFC 8058, via `POST /api/desinscription`).

Jetons : 24 octets aléatoires, seul le hash SHA-256 est stocké, un seul jeton actif par adresse.

## Administration et webmail

Les visiteurs se connectent par code email, Google ou GitHub ; un même compte peut associer Google et GitHub depuis `/mon-compte` (option « Allow manual linking » de Supabase Auth). L'admin et la webmail exigent trois verrous :

1. une session ouverte avec GitHub ;
2. la présence dans `admin_users` (un login listé dans `ADMIN_GITHUB_LOGINS` y est ajouté à sa première visite) ;
3. un second facteur TOTP : à la première visite, QR code à scanner ; ensuite un code à 6 chiffres ouvre 15 minutes d'accès. Le secret est chiffré (AES-256-GCM, `ADMIN_VAULT_KEY`), un code ne sert qu'une fois, 5 échecs en 15 minutes bloquent. L'accès est porté par un cookie HttpOnly signé (`ADMIN_OTP_SECRET`), limité à `/api`, partagé entre `admin` et `webmail` ; chaque appel doit en plus porter le jeton de session en en-tête.

Tous les emails partent par `expedier()` (`lib/mail.ts`) : gabarit DataParl' commun (`lib/gabarit.ts`), lien « consulte-le en ligne » vers `mail.dataparl.fr/lire/<jeton>` (seul le hash du jeton est stocké), copie rangée dans la table `emails`. Un message du formulaire de contact arrive dans la webmail et déclenche un accusé de réception ; un email reçu sur une adresse @dataparl.fr aussi, sauf s'il s'agit d'une réponse, d'un transfert, d'un message automatique ou d'une liste (`lib/autoReponse.ts`), et au plus un accusé par expéditeur et par 24 h. La clé `RESEND_API_KEY` doit être « Full access » : la lecture des emails reçus est refusée aux clés « Sending access ».

Toutes les actions sensibles sont inscrites dans `admin_audit` (page Journal).

Sections de l'admin : tableau de bord (chiffres, passages du robot), messages de contact (statut, note, réponse), abonnés (recherche, désinscription), oppositions (masquage des emails déduits), clés API (usage, quota, révocation), admins (ajout par login GitHub, réinitialisation du TOTP), journal.

Webmail : dossiers Reçus, Envoyés, Archives, Corbeille ; lecture dans une iframe isolée (sans script, images distantes bloquées par défaut) ; réponse, réponse à tous, transfert ; pièces jointes par lien signé Resend. Réception : webhook Resend `POST /api/webhooks/resend` (signature Svix vérifiée), événement `email.received` puis récupération du message complet ; les autres événements (`email.delivered`, `email.bounced`…) sont journalisés dans `email_events`. Adresses d'envoi : `lib/env.ts` (`EXPEDITEURS`).

## Variables d'environnement

Voir `.env.example`. Secrets à définir dans Vercel : `AUTH_SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONSENT_SALT` (chaîne aléatoire longue, ne plus la changer ensuite), `ADMIN_VAULT_KEY` (32 octets en base64 : `openssl rand -base64 32` ; la changer rend les TOTP existants illisibles), `ADMIN_OTP_SECRET` (`openssl rand -base64 48`), `RESEND_WEBHOOK_SECRET` (le `whsec_…` du webhook Resend) et `ADMIN_GITHUB_LOGINS` (ex. `dataparl`).

## Développement

```bash
npm install
npm run dev
npm test
npm run build
```
