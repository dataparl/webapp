# DataParl' : webapp

Site public, alertes par email, connexion, compte, administration et API de DataParl' (adresse actuelle : [cavaparlement.eu](https://www.cavaparlement.eu)). Un seul déploiement Next.js 16 sert tous les sous-domaines ; le routage est dans `proxy.ts` (nouveau nom de `middleware.ts` depuis Next 16).

| Hôte | Rôle |
|---|---|
| `www.cavaparlement.eu` | site : accueil, mouvements, collaborateurs, parlementaires, alertes, compte, contact, presse, FAQ, pages légales ; `/api` redirige vers l'API |
| `cavaparlement.eu` | redirection 308 vers `www` |
| `api.cavaparlement.eu` | site de l'API (`/`, `/docs/*`, `/request-access`, `/mon-espace-api`, réécrits vers `/espace-api/*`) et API elle-même (`/v1/*`, réécrit vers `/api/v1/*`) |
| `admin.cavaparlement.eu` | administration, réécrite vers `/admin/*` |
| `webmail.cavaparlement.eu` | webmail de l'équipe, réécrite vers `/webmail/*` |

`/connexion` est servie telle quelle sur chaque hôte : le flux OAuth (PKCE) doit rester sur l'origine qui l'a lancé. La session, elle, est stockée dans des cookies du domaine `.cavaparlement.eu` (`lib/cookieStorage.ts`, découpés en morceaux de 3 Ko) : une seule connexion vaut pour `www`, `api` et `admin`.

Les pages sont réparties en quatre groupes de routes : `app/(site)`, `app/(auth)` (connexion), `app/(apisite)` (site de l'API) et `app/(admin)` (admin et webmail), chacun avec son en-tête.

## Données et services

- **Supabase `dataparl`** : données publiques (mouvements, affectations), alimentées par [dataparl/collaborateurs](https://github.com/dataparl/collaborateurs). Lecture seule avec la clé publique.
- **Supabase `dataparl-auth`** : comptes (Supabase Auth), abonnés, alertes, préférences, historique des consentements, jetons, emails, campagnes, admins. Toutes les tables sont fermées par RLS ; seul le serveur y accède avec la clé `service_role`.
- **Resend** : envoi depuis `noreply@mail.cavaparlement.eu` (API en `fetch` brut). `hello@cavaparlement.eu` reste chez Infomaniak.

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

Toutes les actions sensibles sont inscrites dans `admin_audit` (page Journal).

Sections de l'admin : tableau de bord (chiffres, passages du robot), messages de contact (statut, note, réponse), abonnés (recherche, désinscription), oppositions (masquage des emails déduits), clés API (usage, quota, révocation), admins (ajout par login GitHub, réinitialisation du TOTP), journal.

Webmail : dossiers Reçus, Envoyés, Archives, Corbeille ; lecture dans une iframe isolée (sans script, images distantes bloquées par défaut) ; réponse, réponse à tous, transfert ; pièces jointes par lien signé Resend. Réception : webhook Resend `POST /api/webhooks/resend` (signature Svix vérifiée), événement `email.received` puis récupération du message complet ; les autres événements (`email.delivered`, `email.bounced`…) sont journalisés dans `email_events`. `hello@cavaparlement.eu` reste chez Infomaniak : une redirection avec copie vers `hello@mail.cavaparlement.eu` fait arriver ses emails dans la webmail, et le domaine d'envoi `cavaparlement.eu` de Resend permet d'y répondre depuis `hello@cavaparlement.eu`.

## Variables d'environnement

Voir `.env.example`. Secrets à définir dans Vercel : `AUTH_SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONSENT_SALT` (chaîne aléatoire longue, ne plus la changer ensuite), `ADMIN_VAULT_KEY` (32 octets en base64 : `openssl rand -base64 32` ; la changer rend les TOTP existants illisibles), `ADMIN_OTP_SECRET` (`openssl rand -base64 48`), `RESEND_WEBHOOK_SECRET` (le `whsec_…` du webhook Resend) et `ADMIN_GITHUB_LOGINS` (ex. `dataparl`).

## Développement

```bash
npm install
npm run dev
npm test
npm run build
```
