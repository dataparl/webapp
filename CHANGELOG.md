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

- Le tableur DataParl' Sheets vit désormais sur `media.dataparl.fr/sheets`
  (et `/search`) ; `www.dataparl.fr/sheets` et l'ancien domaine
  `drive.dataparl.fr` redirigent en 308 vers `media`.
- Interstitiel sur `media.dataparl.fr` : tout chemin autre que les photos
  et le tableur affiche un message pendant 15 secondes avant la bascule
  automatique vers la même adresse sur `www.dataparl.fr` (page
  `redirection-media`, compte à rebours).
- Site de l'API : pied de page dédié («© 2026 DataParl' API : DataParl' au
  format brut. ») avec Plan du site (api.dataparl.fr/sitemap, nouvelle page)
  et Informations légales (CGU API sur www, avec retour vers l'API).
- Polices DM Sans et Spectral auto-hébergées via next/font (préchargées,
  police de repli aux métriques ajustées) : fin du reflow au chargement des
  polices Google (CLS 0,27 → ~0 sur l'accueil).
- En-tête www : logo à gauche, recherche au centre, menu déroulant à droite
  sur toutes les tailles d'écran.
- Session : rafraîchissement explicite du jeton avant chaque action —
  fin des « non connecté » après une inactivité (onglet en arrière-plan).
- Cron Vercel `/api/cron/jorf` retiré (DILA injoignable depuis les IP Vercel).

## 2026 — précédents

Le projet a démarré sans journal de versions : l'historique git fait foi
(site, alertes, compte, administration, webmail, API v1, DataParl' Sheets).
