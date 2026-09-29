# DataParl' : webapp

Site public, alertes par email, connexion, compte, administration et API de DataParl' (adresse actuelle : [cavaparlement.eu](https://www.cavaparlement.eu)). Un seul déploiement Next.js 16 sert tous les sous-domaines ; le routage est dans `proxy.ts` (nouveau nom de `middleware.ts` depuis Next 16).

| Hôte | Rôle |
|---|---|
| `www.cavaparlement.eu` | site : accueil, mouvements, collaborateurs, parlementaires, alertes, compte, contact, presse, FAQ, pages légales ; `/api` redirige vers l'API |
| `cavaparlement.eu` | redirection 308 vers `www` |
| `api.cavaparlement.eu` | site de l'API (`/`, `/docs/*`, `/request-access`, `/mon-espace-api`, réécrits vers `/espace-api/*`) et API elle-même (`/v1/*`, réécrit vers `/api/v1/*`) |
| `admin.cavaparlement.eu` | administration, réécrite vers `/admin/*` |

`/connexion` est servie telle quelle sur chaque hôte : le flux OAuth (PKCE) doit rester sur l'origine qui l'a lancé. La session, elle, est stockée dans des cookies du domaine `.cavaparlement.eu` (`lib/cookieStorage.ts`, découpés en morceaux de 3 Ko) : une seule connexion vaut pour `www`, `api` et `admin`.

Les pages sont réparties en trois groupes de routes : `app/(site)`, `app/(auth)` (connexion) et `app/(apisite)` (site de l'API), chacun avec son en-tête.

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

## Administration

Les visiteurs se connectent par code email ou avec Google. L'administration exige une connexion GitHub + la présence dans la table `admin_users`. Phase 1 : tableau de bord (inscrits, confirmations, envois). Phase 2 : webmail, campagnes et sondages, derrière un second facteur TOTP.

## Variables d'environnement

Voir `.env.example`. Secrets à définir dans Vercel : `AUTH_SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONSENT_SALT` (chaîne aléatoire longue, ne plus la changer ensuite).

## Développement

```bash
npm install
npm run dev
npm test
npm run build
```
