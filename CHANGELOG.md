# Changelog

Tous les changements notables de ce projet sont documentés ici. Le format
suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et la
versionnement [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Ajouté

- Page « lexique des collaborateurs parlementaires » (`/lexique`) :
  définitions en une phrase — collaborateur de député, régime du Sénat,
  assistants accrédités et locaux du Parlement européen, groupements, tiers
  payants, prestataires, mouvements, turnover (VigiParl'), mixité
  (MixiParl'), mandat et mandature — plus une section « devenir
  collaborateur parlementaire » ; référencée dans le plan du site, le
  sitemap XML et les hubs collaborateurs.
- Fichier `llms.txt` à la racine du site (format llmstxt.org) :
  guide des pages réponses de DataParl' pour les assistants IA et les
  agents (listes de collaborateurs, tiers payants, prestataires, VigiParl',
  MixiParl', méthode et sources).

### Modifié

- SEO « liste des collaborateurs » : titres, H1 et réponses directes
  chiffrées (effectif en poste, mois et date de génération calculés) sur
  `/collab`, `/collab/an`, `/collab/senat`, `/collab/pe`,
  les listes par chambre et `/collab/liste` ; FAQ citable sur chaque hub
  et données structurées JSON-LD (`Dataset`, `FAQPage`,
  `BreadcrumbList`) pour les moteurs de recherche et les assistants IA.
- `/collab/liste` : correction du texte d'introduction, de la pagination
  et de la clé des lignes du tableau qui affichaient littéralement
  `${…}` (expressions jamais évaluées) depuis la création de la page.

### Suite des entrées précédentes

lly downloaded text file (SHA: 8f8db32dd3531d49fd519c94b30290fdb7fd6f45)