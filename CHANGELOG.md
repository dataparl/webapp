# Changelog

Tous les changements notables de ce projet sont documentés ici. Le format
suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et la
versionnement [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Schémas Table Schema des jeux de données data.gouv.fr (membres des
  gouvernements, turnover annuel, mixité annuelle, parlementaires) : dossier
  `public/schemas/`, servis sur `raw.dataparl.fr/schemas/…`.
- Feuille « Parlementaires (2017 → aujourd'hui) » dans DataParl' Sheets.
- Fichiers de gouvernance du dépôt : `LICENSE` (MIT), `SECURITY.md`,
  `CHANGELOG.md`.

### Modifié

- Le tableur DataParl' Sheets vit désormais sur `www.dataparl.fr/sheets`
  (et `/search`) : plus de domaine `drive.` — `drive.dataparl.fr` redirige
  en 308 vers `www`.
- En-tête www : logo à gauche, recherche au centre, menu déroulant à droite
  sur toutes les tailles d'écran.
- Session : rafraîchissement explicite du jeton avant chaque action —
  fin des « non connecté » après une inactivité (onglet en arrière-plan).
- Cron Vercel `/api/cron/jorf` retiré (DILA injoignable depuis les IP Vercel).

## 2026 — précédents

Le projet a démarré sans journal de versions : l'historique git fait foi
(site, alertes, compte, administration, webmail, API v1, DataParl' Sheets).
