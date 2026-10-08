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
- Enquête utilisateurs : questionnaire survey.dataparl.fr (3 notes —
  expérience, contenu de fond, globale — et un commentaire), proposé sur le
  site après 4 minutes à un visiteur connecté (une fois, lien par jeton
  rattaché au compte) ; réponses et notes dans l'admin (Contenu → Enquête
  utilisateurs). Table : scripts/survey.sql.

### Modifié

- Plan du site (`/sitemap`) et `sitemap.xml` : ajout des pages du Parlement
  européen — tiers payants, prestataires, réseau des collaborateurs, et une
  URL par fiche structure dans le plan XML.
- Accueil : le compteur détaille les trois chambres (Assemblée, Sénat,
  Parlement européen) et « Explorer » pointe vers les mouvements du
  Parlement européen (`/mouvements/europarl`).
- Carte SIREN des structures du Parlement européen : la section « Qui
  encaisse l'argent ? » devient « Qui dirige la structure ? »
  (formulation neutre, mêmes informations : dirigeants et bénéficiaires
  effectifs).
- Pages « structures du Parlement européen » : tiers payants, prestataires
  et réseau vivent désormais sous `/collab/pe/` (segment chambre `pe`,
  comme les photos des élus) ; les anciens chemins `/collab/tiers-payants`,
  `/collab/prestataires` et `/collab/reseau` redirigent en 308, fiches
  comprises.
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
  polices Google (CLS 0,27 → ~0 sur l'accueil, mesuré PageSpeed). DM Sans pour
  le corps de texte, Spectral pour les titres — visuel inchangé.
- Emails d'alertes : nouvel en-tête épuré (fini le bandeau bleu nuit du
  DataParl' Daily/Weekly), pied de page réduit à une ligne, et expéditeurs
  dédiés `dataparl-daily@dataparl.fr` / `dataparl-weekly@dataparl.fr`
  (à valider dans Resend).
- Alertes : fréquences cumulables (Daily ET Weekly, cases à cocher ;
  scripts/alertes-frequences.sql), champs Prénom/Nom retirés du réglage (la
  ligne « À l'attention de » prend les infos du compte), filtres Parti et
  Commission en attente retirés de la page, lien « Mon compte » dans le pied
  des emails.
- En-tête www : logo à gauche, recherche au centre, menu déroulant à droite
  sur toutes les tailles d'écran.
- Session : rafraîchissement explicite du jeton avant chaque action —
  fin des « non connecté » après une inactivité (onglet en arrière-plan).
- Cron Vercel `/api/cron/jorf` retiré (DILA injoignable depuis les IP Vercel).

## 2026 — précédents

Le projet a démarré sans journal de versions : l'historique git fait foi
(site, alertes, compte, administration, webmail, API v1, DataParl' Sheets).
