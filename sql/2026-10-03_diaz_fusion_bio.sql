-- ============================================================================
-- DataParl — Fusion Edwige Diaz (Sénat / Assemblée nationale) et biographie
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms),
-- après la migration sql/2026-10-03_bios_elus.sql (tables bios,
-- mandats_manuels, fonctions_manuelles).
--
-- Situation : Edwige Diaz a deux fiches dans `parlementaires` — une fiche
-- Assemblée nationale (députée de la 11e circonscription de la Gironde,
-- 2022-2026, inactive) et une fiche Sénat (sénatrice de la Gironde depuis
-- le scrutin du 27 septembre 2026, active). Elles partagent déjà le même
-- personne_id (PA793928) : mandats et appartenances sont donc déjà fusionnés.
-- Le site a été corrigé pour que les deux URL
--   /parlementaires/PA793928  et  /parlementaires/diaz_edwige20390p
-- montrent la même fiche (la fiche active : sénatrice), avec l'historique
-- complet de ses mandats AN.
-- Ce script complète : groupe RN-UDR au Sénat, date du mandat sénatorial,
-- bio rédigée, mandats locaux et fonctions partisanes.
-- ============================================================================

-- 1. Groupe parlementaire au Sénat : RN-UDR (elle en est la présidente).
--    (La synchro nocturne écrasera ces valeurs quand senat.fr publiera le
--    groupe officiel — c'est le même sigle qui est attendu.)
update parlementaires
   set groupe = 'RN-UDR',
       groupe_libelle = 'Union nationale pour les territoires (RN-UDR)'
 where personne_id = 'PA793928' and chambre = 'senat';

-- 2. Date d'élection du mandat sénatorial (élection partielle du 27
--    septembre 2026, prise de fonction au 1er octobre).
update mandats
   set debut = '2026-10-01'
 where personne_id = 'PA793928' and chambre = 'senat'
   and (debut is null or debut = '');

-- 3. Biographie rédigée (affichée sur /parlementaires/…/bio si actif).
insert into bios (personne_id, texte, source, actif, cree_par)
values ('PA793928', $bio$
**EDWIGE DIAZ**
Sénatrice de la Gironde
Présidente du groupe RN-UDR (Union nationale pour les territoires) au Sénat
Vice-présidente du Rassemblement national (chargée de l'implantation locale)

I. Éléments biographiques

Naissance : 15 octobre 1987 à **Marseille** (Bouches-du-Rhône). Ses parents s'installent à **Salles** (Gironde) en 1996. Son grand-père paternel, sympathisant communiste espagnol, a travaillé à la centrale nucléaire du **Blayais**.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Gironde**, présidente du groupe **RN-UDR** au Sénat ;
Depuis novembre 2022 : **Vice-présidente du Rassemblement national**, chargée de l'implantation locale ;
Depuis 2016 : **Présidente du groupe Rassemblement national** au conseil régional de **Nouvelle-Aquitaine** ;
Depuis 2015/2016 : **Conseillère régionale de Nouvelle-Aquitaine** (réélue en 2021) ;
2022 – 2026 : **Députée de la 11e circonscription de la Gironde** (élue en 2022 avec 58,7 % au second tour face à Véronique Hammerer ; réélue dès le premier tour en 2024 avec 53,33 %) ;
2020 – 2022 : **Conseillère municipale et communautaire de Saint-Savin** (opposition) ;
2016 – 2021 : **Secrétaire puis déléguée départementale du Rassemblement national en Gironde** ;
Cadre administrative et commerciale d'entreprise ; cheffe d'entreprise (élevage de chats).

Formation

**Master d'espagnol** à l'université de Bordeaux (baccalauréat bilingue franco-espagnol).

II. Éléments de parcours et réseaux

Née à **Marseille** et élevée en Gironde, Edwige **DIAZ** effectue l'ensemble de son parcours scolaire et universitaire à Bordeaux. Elle commence sa carrière professionnelle comme cadre administrative et commerciale et dirige des commerces dans la métropole bordelaise.

Électrice de **Nicolas Sarkozy** en 2007, elle adhère brièvement à l'UMP (2007-2008). Déçue par la politique sécuritaire, elle vote **Marine Le Pen** en 2012 et adhère au **Front national** en 2014 après l'avoir rencontrée lors d'une réunion publique à Brive-la-Gaillarde.

Repérée et formée par **Jacques Colombier**, elle s'implante durablement en Gironde. Après plusieurs candidatures infructueuses (municipales 2008 et 2014, sénatoriales 2014 et 2020, législatives 2017 avec près de 43 % au second tour, municipales 2020 à Saint-Savin avec 43,8 %), elle est élue conseillère régionale en 2015, devient présidente du groupe régional RN et tête de liste aux régionales de 2021 (19,11 % au second tour).

Sa percée nationale intervient en 2022 avec l'élection à l'**Assemblée nationale**, suivie de sa nomination comme vice-présidente du **Rassemblement national**. Réélue en 2024, elle poursuit son ancrage local et permet au RN de conquérir plusieurs mairies en Gironde. En septembre 2026, elle est élue sénatrice (709 voix, 19,63 %) et devient immédiatement présidente du premier groupe **RN-UDR** au Sénat, avec le soutien de **Marine Le Pen**, de **Jordan Bardella** et d'**Éric Ciotti**.

Figure de la « dédiabolisation » et de l'implantation territoriale du parti, elle cultive un profil de terrain, proche des élus locaux sans étiquette et des préoccupations rurales.

Présence en ligne et canaux institutionnels

Compte X : @diaz_edwige
Compte Instagram : @edwige_diaz
Site officiel : www.edwigediaz.fr
Page Assemblée nationale (mandat clos) : assemblee-nationale.fr – Edwige Diaz
Page Sénat : en cours de mise en ligne au 3 octobre 2026
LinkedIn : non identifié de façon publique et active à ce stade

III. Ses sujets

**Immigration et contrôle des frontières**
Elle défend une réduction drastique des flux migratoires, l'exécution systématique des OQTF, la dénonciation des accords franco-algériens de 1968 et le principe de préférence nationale. Elle lie régulièrement immigration et insécurité, citant la surreprésentation d'étrangers dans les statistiques de délinquance et de violences sexuelles.

**Sécurité et protection des femmes**
Elle met en avant le lien entre immigration et agressions sexuelles (chiffres des transports franciliens et de Paris), propose des mesures d'expulsion des délinquants étrangers et plaide pour des peines planchers. Elle a organisé des auditions de victimes et des visites de prisons pour documenter ces questions.

**Agriculture, viticulture et ruralité**
Soutien affirmé aux agriculteurs et viticulteurs de Gironde face aux normes européennes et aux accords de libre-échange (Mercosur). Elle a voté la loi d'urgence agricole autorisant certains néonicotinoïdes et appelle à une « loi Mangeons Français », à l'allègement des normes et à la protection de la transmission des exploitations.

**Pouvoir d'achat et finances publiques**
Membre de la commission des Finances, elle critique les budgets successifs, s'oppose à certaines hausses de taxes et plaide pour une baisse du train de vie de l'État et une maîtrise des dépenses liées à l'immigration.

**Services publics et déserts médicaux en Gironde**
Elle dénonce le désengagement de l'État dans les territoires ruraux et périurbains de sa circonscription (Nord-Gironde), en particulier sur l'accès aux soins et aux services de proximité.

**Justice et forces de l'ordre**
Elle soutient les propositions de présomption de légitime défense pour les forces de l'ordre et un durcissement des sanctions contre la fraude aux prestations sociales.

**Europe et souveraineté**
Critique de la gouvernance politique de l'Union européenne, des subventions aux énergies renouvelables et de la contribution française, tout en se revendiquant « profondément européenne » sur le plan civilisationnel.

**Implantation locale et conquête des territoires**
En tant que vice-présidente chargée de l'implantation, elle a structuré le RN en Gironde et en Nouvelle-Aquitaine, favorisant l'émergence d'élus locaux et la conquête de mairies dans un département historiquement à gauche.

**Retraites et protection sociale**
Elle a voté la suspension de la réforme des retraites et s'oppose aux mesures jugées punitives pour les retraités et les classes moyennes.

**Féminisme et laïcité**
Elle revendique un féminisme de protection face aux violences et aux symboles religieux (burkini), tout en restant attentive aux questions de liberté individuelle (vote favorable à l'aide à mourir en 2025, en rupture partielle avec son groupe).
$bio$, 'Rédaction DataParl''', true, 'quentin')
on conflict (personne_id) do update
  set texte = excluded.texte, source = excluded.source, actif = excluded.actif,
      maj_le = now();

-- 4. Mandats locaux (non couverts par la synchro AN/Sénat).
insert into mandats_manuels (id, personne_id, chambre, elu_id, libelle, circonscription, debut, fin, cause_fin, source, actif, cree_par)
values
  ('MM-DIAZ-REGION-2015', 'PA793928', 'local', '', 'Conseillère régionale de Nouvelle-Aquitaine',
   'Nouvelle-Aquitaine', '2015-12-01', null, '', 'Rédaction DataParl''', true, 'quentin'),
  ('MM-DIAZ-SAINT-SAVIN-2020', 'PA793928', 'local', '', 'Conseillère municipale et communautaire de Saint-Savin',
   'Saint-Savin (Gironde)', '2020-06-28', '2022-07-01', 'Élue députée : fin du mandat local', 'Rédaction DataParl''', true, 'quentin')
on conflict (id) do nothing;

-- 5. Fonctions partisanes et institutionnelles actuelles.
insert into fonctions_manuelles (id, personne_id, chambre, type, code, libelle, sigle, fonction, debut, fin, source, actif, cree_par)
values
  ('FM-DIAZ-PRES-GROUPE-SENAT', 'PA793928', 'senat', 'groupe', '',
   'Groupe RN-UDR (Union nationale pour les territoires) au Sénat', 'RN-UDR',
   'Présidente du groupe', '2026-10-01', null, 'Rédaction DataParl''', true, 'quentin'),
  ('FM-DIAZ-VP-RN', 'PA793928', 'parti', 'fonction', '',
   'Rassemblement national', 'RN', 'Vice-présidente (chargée de l''implantation locale)',
   '2022-11-01', null, 'Rédaction DataParl''', true, 'quentin'),
  ('FM-DIAZ-PRES-GROUPE-REGION', 'PA793928', 'local', 'fonction', '',
   'Groupe Rassemblement national au conseil régional de Nouvelle-Aquitaine', 'RN',
   'Présidente du groupe', '2016-01-01', null, 'Rédaction DataParl''', true, 'quentin'),
  ('FM-DIAZ-SECRETAIRE-DEP', 'PA793928', 'parti', 'fonction', '',
   'Rassemblement national – fédération de Gironde', 'RN',
   'Secrétaire puis déléguée départementale', '2016-01-01', '2021-12-31', 'Rédaction DataParl''', true, 'quentin')
on conflict (id) do nothing;
