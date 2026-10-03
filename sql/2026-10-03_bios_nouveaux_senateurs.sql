-- ============================================================================
-- DataParl — Bios des nouveaux sénateurs 2026 (première version)
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms).
--
-- 65 nouveaux sénateurs (jamais sénateurs auparavant), scrutin du 27
-- septembre 2026. Bios au format de la charte éditoriale, remplies
-- UNIQUEMENT avec les données du référentiel : mandats, groupes et
-- commissions. Les éléments non disponibles (formation, parcours local,
-- sujets) sont marqués « à compléter » pour la rédaction, qui peut les
-- enrichir depuis l'admin (admin.dataparl.fr/elus). La bio rédigée
-- d'Edwidge Diaz n'est pas écrasée (clause on conflict en update texte :
-- si tu préfères ne JAMAIS toucher à une bio existante, retire les
-- lignes de ce fichier pour les personne_id déjà présents dans bios).
-- ============================================================================
-- ⚠️ NOTE : la clause on conflict ... do update set texte = excluded.texte
-- ÉCRASE le texte existant. Pour ne pas écraser, remplace par :
--   on conflict (personne_id) do nothing;

-- Renaud Muselier (Bouches-du-Rhône) — /parlementaires/muselier_renaud02042t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA2256', $bio$
**MUSELIER RENAUD**
Sénateur des Bouches-du-Rhône
Groupe Rassemblement des démocrates, progressistes et indépendants au Sénat

I. Éléments biographiques

Naissance : 06/05/1959.

Fonctions

Depuis octobre 2026 : **Sénateur des Bouches-du-Rhône** (groupe RDPI) ;
2014 – 2019 : **Député européen** (France) ;
2007 – 2012 : **Député de la 13e législature** (Bouches-du-Rhône (5e circonscription)) ;
2002 – 2002 : **Député** ;
1997 – 2002 : **Député** ;
1993 – 1997 : **Député** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Renaud **MUSELIER** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale et le Parlement européen. Élu le 27 septembre 2026 par les grands électeurs des Bouches-du-Rhône, il rejoint le groupe RDPI pour un mandat de six ans.
Il a siégé au sein des groupes UMP, PPE.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/muselier_renaud02042t.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Affaires étrangères** (l'Assemblée nationale — vice-président), **Commission spéciale chargée d'examiner la proposition de loi renforçant la protection des victimes et la prévention et la répression des violences faites aux femmes** (l'Assemblée nationale), **Commission spéciale chargée d'examiner la proposition de loi sur l'enfance délaissée et l'adoption** (l'Assemblée nationale), **DEVE** (le Parlement européen — suppléant), **TRAN** (le Parlement européen). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Édouard Fritch (Polynésie française) — /parlementaires/fritch_edouard15689x/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA1373', $bio$
**FRITCH ÉDOUARD**
Sénateur de la Polynésie française

I. Éléments biographiques

Naissance : 04/01/1952.

Fonctions

Depuis octobre 2026 : **Sénateur de la Polynésie française** ;
2012 – 2014 : **Député de la 14e législature** (Polynésie Française (1re circonscription)) ;
1986 – 1988 : **Député** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Édouard **FRITCH** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs de la Polynésie française, il rejoint les rangs du Sénat pour un mandat de six ans.
Il a siégé au sein du groupe UDI.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/fritch_edouard15689x.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Lois** (l'Assemblée nationale), **Délégation aux outre-mer** (l'Assemblée nationale — membre de droit), **Affaires économiques** (l'Assemblée nationale), **Finances** (l'Assemblée nationale), **Affaires sociales** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Dominique Le Mèner (Sarthe) — /parlementaires/le_mener_dominique17305a/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA267317', $bio$
**LE MÈNER DOMINIQUE**
Sénateur de la Sarthe
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 12/11/1958.

Fonctions

Depuis octobre 2026 : **Sénateur de la Sarthe** (groupe LR) ;
2012 – 2017 : **Député de la 14e législature** (Sarthe (5e circonscription)) ;
2007 – 2012 : **Député de la 13e législature** (Sarthe (5e circonscription)) ;
2002 – 2007 : **Député de la 12e législature** (Sarthe (5e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Dominique **LE MÈNER** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs de la Sarthe, il rejoint le groupe LR pour un mandat de six ans.
Il a siégé au sein des groupes UMP, Rassemblement-UMP, Les Républicains.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/le_mener_dominique17305a.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Affaires économiques** (l'Assemblée nationale), **Affaires culturelles et éducation** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Christophe Guilloteau (Rhône) — /parlementaires/guilloteau_christophe17331c/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA267499', $bio$
**GUILLOTEAU CHRISTOPHE**
Sénateur du Rhône
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 18/06/1958.

Fonctions

Depuis octobre 2026 : **Sénateur du Rhône** (groupe LR) ;
2012 – 2017 : **Député de la 14e législature** (Rhône (10e circonscription)) ;
2007 – 2012 : **Député de la 13e législature** (Rhône (10e circonscription)) ;
2003 – 2007 : **Député** ;
2002 – 2007 : **Député de la 12e législature** (Rhône (10e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Christophe **GUILLOTEAU** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs du Rhône, il rejoint le groupe LR pour un mandat de six ans.
Il a siégé au sein des groupes UMP, Les Républicains.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/guilloteau_christophe17331c.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Affaires culturelles** (l'Assemblée nationale), **Défense** (l'Assemblée nationale — vice-président), **Commission spéciale chargée d'examiner la proposition de loi renforçant la protection des victimes et la prévention et la répression des violences faites aux femmes** (l'Assemblée nationale), **Commission d'enquête sur la surveillance des filières et des individus djihadistes** (l'Assemblée nationale), **Commission d'enquête sur les missions et modalités du maintien de l'ordre républicain dans un contexte de respect des libertés publiques et du droit de manifestation, ainsi que de protection des personnes et des biens** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Daniel Gibbs (Saint-Martin) — /parlementaires/gibbs_daniel18153g/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S18153G', $bio$
**GIBBS DANIEL**
Sénateur du Saint-Martin

I. Éléments biographiques

Naissance : 08/01/1968.

Fonctions

Depuis octobre 2026 : **Sénateur du Saint-Martin** ;
2012 – 2017 : **Député** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Daniel **GIBBS** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs du Saint-Martin, il rejoint les rangs du Sénat pour un mandat de six ans.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/gibbs_daniel18153g.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Nathalie Nieson (Drôme) — /parlementaires/nieson_nathalie18233f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA606030', $bio$
**NIESON NATHALIE**
Sénatrice de la Drôme
Groupe Rassemblement des démocrates, progressistes et indépendants au Sénat

I. Éléments biographiques

Naissance : 26/03/1969.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Drôme** (groupe RDPI) ;
2012 – 2017 : **Députée de la 14e législature** (Drôme (4e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Nathalie **NIESON** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élue le 27 septembre 2026 par les grands électeurs de la Drôme, elle rejoint le groupe RDPI pour un mandat de six ans.
Elle a siégé au sein des groupes SRC, SER.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/nieson_nathalie18233f.html

III. Ses sujets

Avant son élection au Sénat, elle a travaillé au sein de **Lois** (l'Assemblée nationale), **Défense** (l'Assemblée nationale), **Commission d'enquête sur les missions et modalités du maintien de l'ordre républicain dans un contexte de respect des libertés publiques et du droit de manifestation, ainsi que de protection des personnes et des biens** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Valérie Bazin-Malgras (Aube) — /parlementaires/bazin_malgras_valerie18503j/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA718884', $bio$
**BAZIN-MALGRAS VALÉRIE**
Sénatrice de l'Aube
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 31/10/1969.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Aube** (groupe LR) ;
2024 – 2026 : **Députée de la 17e législature** (Aube (2e circonscription)) ;
2022 – 2024 : **Députée de la 16e législature** (Aube (2e circonscription)) ;
2017 – 2022 : **Députée de la 15e législature** (Aube (2e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Valérie **BAZIN-MALGRAS** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élue le 27 septembre 2026 par les grands électeurs de l'Aube, elle rejoint le groupe LR pour un mandat de six ans.
Elle a siégé au sein des groupes LR, DR.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/bazin_malgras_valerie18503j.html

III. Ses sujets

Avant son élection au Sénat, elle a travaillé au sein de **Affaires culturelles et éducation** (l'Assemblée nationale), **Commission d'enquête relative à l'état des lieux, la déontologie, les pratiques et les doctrines de maintien de l'ordre** (l'Assemblée nationale — secrétaire), **CE politique industrielle** (l'Assemblée nationale), **Affaires sociales** (l'Assemblée nationale), **Commission spéciale chargée d’examiner le projet de loi, adopté par le Sénat, en faveur de l'activité professionnelle indépendante** (l'Assemblée nationale), **Défense** (l'Assemblée nationale — vice-présidente), **CE Autorisations diffusion TNT** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Loïc Kervran (Cher) — /parlementaires/kervran_loic18543s/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA719052', $bio$
**KERVRAN LOÏC**
Sénateur du Cher
Groupe Les Indépendants – République et Territoires au Sénat

I. Éléments biographiques

Naissance : 11/02/1984.

Fonctions

Depuis octobre 2026 : **Sénateur du Cher** (groupe IRT) ;
2024 – 2026 : **Député de la 17e législature** (Cher (3e circonscription)) ;
2022 – 2024 : **Député de la 16e législature** (Cher (3e circonscription)) ;
2017 – 2022 : **Député de la 15e législature** (Cher (3e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Loïc **KERVRAN** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs du Cher, il rejoint le groupe IRT pour un mandat de six ans.
Il a siégé au sein des groupes LaREM, Agir ens, HOR.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/kervran_loic18543s.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Défense** (l'Assemblée nationale — vice-président), **Délégation parlementaire au renseignement** (l'Assemblée nationale — deuxième vice-président), **Commission d’enquête chargée d’examiner les décisions de l’État en matière de politique industrielle, au regard des fusions d’entreprises intervenues récemment, notamment dans les cas d’Alstom, d’Alcatel et de STX, ainsi que les moyens susceptibles de protéger nos fleurons industriels nationaux dans un contexte commercial mondialisé** (l'Assemblée nationale), **Commission de vérification des fonds spéciaux** (l'Assemblée nationale — président), **Lois** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Bastien Coriton (Seine-Maritime) — /parlementaires/coriton_bastien19916g/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA722198', $bio$
**CORITON BASTIEN**
Sénateur de la Seine-Maritime
Groupe Parti socialiste au Sénat

I. Éléments biographiques

Naissance : 12/09/1981.

Fonctions

Depuis octobre 2026 : **Sénateur de la Seine-Maritime** (groupe PS) ;
2020 – 2020 : **Député** ;
2017 – 2020 : **Député de la 15e législature** (Seine-Maritime (5e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Bastien **CORITON** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs de la Seine-Maritime, il rejoint le groupe PS pour un mandat de six ans.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/coriton_bastien19916g.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Gabriel Amard (Rhône) — /parlementaires/amard_gabriel20684b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA794906', $bio$
**AMARD GABRIEL**
Sénateur du Rhône
Groupe La France insoumise au Sénat

I. Éléments biographiques

Naissance : 05/05/1967.

Fonctions

Depuis octobre 2026 : **Sénateur du Rhône** (groupe LFI) ;
2024 – 2026 : **Député de la 17e législature** (Rhône (6e circonscription)) ;
2022 – 2024 : **Député de la 16e législature** (Rhône (6e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Gabriel **AMARD** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs du Rhône, il rejoint le groupe LFI pour un mandat de six ans.
Il a siégé au sein des groupes LFI - NUPES, LFI-NFP.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/amard_gabriel20684b.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Développement durable** (l'Assemblée nationale), **Délégation aux collectivités territoriales et à la décentralisation** (l'Assemblée nationale), **Finances** (l'Assemblée nationale), **Lois** (l'Assemblée nationale), **Affaires étrangères** (l'Assemblée nationale), **Affaires économiques** (l'Assemblée nationale), **Affaires sociales** (l'Assemblée nationale), **Défense** (l'Assemblée nationale), **Affaires culturelles et éducation** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Christophe Plassard (Charente-Maritime) — /parlementaires/plassard_christophe20718t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA793572', $bio$
**PLASSARD CHRISTOPHE**
Sénateur de la Charente-Maritime
Groupe Les Indépendants – République et Territoires au Sénat

I. Éléments biographiques

Naissance : 19/11/1967.

Fonctions

Depuis octobre 2026 : **Sénateur de la Charente-Maritime** (groupe IRT) ;
2024 – 2026 : **Député de la 17e législature** (Charente-Maritime (5e circonscription)) ;
2022 – 2024 : **Député de la 16e législature** (Charente-Maritime (5e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Christophe **PLASSARD** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs de la Charente-Maritime, il rejoint le groupe IRT pour un mandat de six ans.
Il a siégé au sein du groupe HOR.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/plassard_christophe20718t.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Finances** (l'Assemblée nationale), **Affaires économiques** (l'Assemblée nationale), **Commission spéciale chargée d’examiner la proposition de loi organique relative à l’extension des prélèvements sur les recettes de l’État au profit des organismes du secteur audiovisuel public** (l'Assemblée nationale), **CE Essais nucléaires** (l'Assemblée nationale), **Affaires étrangères** (l'Assemblée nationale), **Développement durable** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Frank Giletti (Var) — /parlementaires/giletti_frank20874f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA796034', $bio$
**GILETTI FRANK**
Sénateur du Var
Groupe Union nationale pour les territoires (RN-UDR) au Sénat

I. Éléments biographiques

Naissance : 01/03/1973.

Fonctions

Depuis octobre 2026 : **Sénateur du Var** (groupe RN-UDR) ;
2024 – 2026 : **Député de la 17e législature** (Var (6e circonscription)) ;
2022 – 2024 : **Député de la 16e législature** (Var (6e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Frank **GILETTI** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élu le 27 septembre 2026 par les grands électeurs du Var, il rejoint le groupe RN-UDR pour un mandat de six ans.
Il a siégé au sein du groupe RN.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/giletti_frank20874f.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **Défense** (l'Assemblée nationale — vice-président), **Commission d’enquête relative aux ingérences politiques, économiques et financières de puissances étrangères – États, organisations, entreprises, groupes d’intérêts, personnes privées – visant à influencer ou corrompre des relais d’opinion, des dirigeants ou des partis politiques français** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Sylvie Josserand (Gard) — /parlementaires/josserand_sylvie21217f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA841075', $bio$
**JOSSERAND SYLVIE**
Sénatrice du Gard
Groupe Rassemblement national au Sénat

I. Éléments biographiques

Naissance : 23/08/1968.

Fonctions

Depuis octobre 2026 : **Sénatrice du Gard** (groupe RN) ;
2024 – 2024 : **Députée européenne** (France) ;
2024 – 2026 : **Députée de la 17e législature** (Gard (6e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Sylvie **JOSSERAND** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale et le Parlement européen. Élue le 27 septembre 2026 par les grands électeurs du Gard, elle rejoint le groupe RN pour un mandat de six ans.
Elle a siégé au sein des groupes PfE, RN.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/josserand_sylvie21217f.html

III. Ses sujets

Avant son élection au Sénat, elle a travaillé au sein de **EMPL** (le Parlement européen), **DROI** (le Parlement européen — suppléante), **Affaires étrangères** (l'Assemblée nationale), **Lois** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Manon Bouquin (Hérault) — /parlementaires/bouquin_manon21223d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA841131', $bio$
**BOUQUIN MANON**
Sénatrice de l'Hérault
Groupe Rassemblement national au Sénat

I. Éléments biographiques

Naissance : 02/06/1992.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Hérault** (groupe RN) ;
2024 – 2026 : **Députée de la 17e législature** (Hérault (4e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Manon **BOUQUIN** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élue le 27 septembre 2026 par les grands électeurs de l'Hérault, elle rejoint le groupe RN pour un mandat de six ans.
Elle a siégé au sein du groupe RN.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/bouquin_manon21223d.html

III. Ses sujets

Avant son élection au Sénat, elle a travaillé au sein de **Développement durable** (l'Assemblée nationale), **CE Organisation des élections** (l'Assemblée nationale), **CS PJL Cybersécurité** (l'Assemblée nationale), **Lois** (l'Assemblée nationale), **Finances** (l'Assemblée nationale), **Affaires étrangères** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Marie-Ange Rousselot (Français établis hors de France) — /parlementaires/rousselot_marie_ange21436q/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('PA795888', $bio$
**ROUSSELOT MARIE-ANGE**
Sénatrice des Français établis hors de France
Groupe Rassemblement des démocrates, progressistes et indépendants au Sénat

I. Éléments biographiques

Naissance : 09/09/1987.

Fonctions

Depuis octobre 2026 : **Sénatrice des Français établis hors de France** (groupe RDPI) ;
2024 – 2025 : **Députée de la 17e législature** (Français établis hors de France (6e circonscription)) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Marie-Ange **ROUSSELOT** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à l'Assemblée nationale. Élue le 27 septembre 2026 par les grands électeurs des Français établis hors de France, elle rejoint le groupe RDPI pour un mandat de six ans.
Elle a siégé au sein du groupe EPR.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/rousselot_marie_ange21436q.html

III. Ses sujets

Avant son élection au Sénat, elle a travaillé au sein de **Affaires étrangères** (l'Assemblée nationale), **Lois** (l'Assemblée nationale), **CS PJL Cybersécurité** (l'Assemblée nationale). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Marie-Pierre Mouton (Drôme) — /parlementaires/mouton_marie_pierre21534r/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21534R', $bio$
**MOUTON MARIE-PIERRE**
Sénatrice de la Drôme

I. Éléments biographiques

Naissance : 26/03/1965.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Drôme** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Marie-Pierre **MOUTON** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de la Drôme, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/mouton_marie_pierre21534r.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Pierre Boileau (Meurthe-et-Moselle) — /parlementaires/boileau_pierre21584c/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21584C', $bio$
**BOILEAU PIERRE**
Sénateur de la Meurthe-et-Moselle
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 09/08/1948.

Fonctions

Depuis octobre 2026 : **Sénateur de la Meurthe-et-Moselle** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Pierre **BOILEAU** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Meurthe-et-Moselle et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/boileau_pierre21584c.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Lafaele Tukumuli (Iles Wallis et Futuna) — /parlementaires/tukumuli_lafaele21638y/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21638Y', $bio$
**TUKUMULI LAFAELE**
Sénateur des Iles Wallis et Futuna
Groupe Divers centre au Sénat

I. Éléments biographiques

Naissance : 05/11/1972.

Fonctions

Depuis octobre 2026 : **Sénateur des Iles Wallis et Futuna** (groupe Divers centre) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Lafaele **TUKUMULI** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs des Iles Wallis et Futuna et rejoint le groupe Divers centre, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/tukumuli_lafaele21638y.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Julien Bounie (Corrèze) — /parlementaires/bounie_julien21640s/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21640S', $bio$
**BOUNIE JULIEN**
Sénateur de la Corrèze
Groupe Divers droite au Sénat

I. Éléments biographiques

Naissance : 12/04/1978.

Fonctions

Depuis octobre 2026 : **Sénateur de la Corrèze** (groupe DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Julien **BOUNIE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Corrèze et rejoint le groupe DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/bounie_julien21640s.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Pascal Coste (Corrèze) — /parlementaires/coste_pascal21642u/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21642U', $bio$
**COSTE PASCAL**
Sénateur de la Corrèze
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 13/09/1966.

Fonctions

Depuis octobre 2026 : **Sénateur de la Corrèze** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Pascal **COSTE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Corrèze et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/coste_pascal21642u.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Dimitri Doussot (Haute-Saône) — /parlementaires/doussot_dimitri21644w/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21644W', $bio$
**DOUSSOT DIMITRI**
Sénateur de l'Haute-Saône
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 17/05/1985.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Haute-Saône** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Dimitri **DOUSSOT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Haute-Saône et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/doussot_dimitri21644w.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Claudie Faucon Mejean (Aude) — /parlementaires/faucon_mejean_claudie21646y/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21646Y', $bio$
**FAUCON MEJEAN CLAUDIE**
Sénatrice de l'Aude
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 22/09/1974.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Aude** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Claudie **FAUCON MEJEAN** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Aude et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/faucon_mejean_claudie21646y.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Bertrand Labar (Creuse) — /parlementaires/labar_bertrand21648b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21648B', $bio$
**LABAR BERTRAND**
Sénateur de la Creuse
Groupe Divers droite au Sénat

I. Éléments biographiques

Naissance : 13/02/1965.

Fonctions

Depuis octobre 2026 : **Sénateur de la Creuse** (groupe DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Bertrand **LABAR** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Creuse et rejoint le groupe DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/labar_bertrand21648b.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Samir Rhimini (Cher) — /parlementaires/rhimini_samir21650u/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21650U', $bio$
**RHIMINI SAMIR**
Sénateur du Cher
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 13/06/1987.

Fonctions

Depuis octobre 2026 : **Sénateur du Cher** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Samir **RHIMINI** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Cher et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/rhimini_samir21650u.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Régis Blanchet (Indre) — /parlementaires/blanchet_regis21652w/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21652W', $bio$
**BLANCHET RÉGIS**
Sénateur de l'Indre
Groupe Divers droite au Sénat

I. Éléments biographiques

Naissance : 06/11/1952.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Indre** (groupe DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Régis **BLANCHET** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Indre et rejoint le groupe DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/blanchet_regis21652w.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Carole Rolando (Gers) — /parlementaires/rolando_carole21654y/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21654Y', $bio$
**ROLANDO CAROLE**
Sénatrice du Gers
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 23/04/1976.

Fonctions

Depuis octobre 2026 : **Sénatrice du Gers** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Carole **ROLANDO** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Gers et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/rolando_carole21654y.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Marie-Pierre Missioux (Deux-Sèvres) — /parlementaires/missioux_marie_pierre21656b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21656B', $bio$
**MISSIOUX MARIE-PIERRE**
Sénatrice du Deux-Sèvres
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 22/12/1964.

Fonctions

Depuis octobre 2026 : **Sénatrice du Deux-Sèvres** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Marie-Pierre **MISSIOUX** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Deux-Sèvres et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/missioux_marie_pierre21656b.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Virginie Quentin (Eure-et-Loir) — /parlementaires/quentin_virginie21658d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21658D', $bio$
**QUENTIN VIRGINIE**
Sénatrice de l'Eure-et-Loir
Groupe Les Républicains / divers droite au Sénat

I. Éléments biographiques

Naissance : 08/04/1969.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Eure-et-Loir** (groupe LR/DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Virginie **QUENTIN** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Eure-et-Loir et rejoint le groupe LR/DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/quentin_virginie21658d.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Alexis Robin (Eure-et-Loir) — /parlementaires/robin_alexis21660w/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21660W', $bio$
**ROBIN ALEXIS**
Sénateur de l'Eure-et-Loir
Groupe Les Républicains / divers droite au Sénat

I. Éléments biographiques

Naissance : 09/09/1991.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Eure-et-Loir** (groupe LR/DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Alexis **ROBIN** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Eure-et-Loir et rejoint le groupe LR/DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/robin_alexis21660w.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Benjamin Huin (Haut-Rhin) — /parlementaires/huin_benjamin21662y/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21662Y', $bio$
**HUIN BENJAMIN**
Sénateur de l'Haut-Rhin
Groupe Rassemblement des démocrates, progressistes et indépendants au Sénat

I. Éléments biographiques

Naissance : 06/07/1992.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Haut-Rhin** (groupe RDPI) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Benjamin **HUIN** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Haut-Rhin et rejoint le groupe RDPI, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/huin_benjamin21662y.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Nicolas Fricoteaux (Aisne) — /parlementaires/fricoteaux_nicolas21664b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21664B', $bio$
**FRICOTEAUX NICOLAS**
Sénateur de l'Aisne
Groupe Divers centre au Sénat

I. Éléments biographiques

Naissance : 27/05/1962.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Aisne** (groupe DVC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Nicolas **FRICOTEAUX** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Aisne et rejoint le groupe DVC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/fricoteaux_nicolas21664b.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Paul Mougenot (Aisne) — /parlementaires/mougenot_paul21666d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21666D', $bio$
**MOUGENOT PAUL**
Sénateur de l'Aisne
Groupe Divers droite au Sénat

I. Éléments biographiques

Naissance : 13/10/1988.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Aisne** (groupe DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Paul **MOUGENOT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Aisne et rejoint le groupe DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/mougenot_paul21666d.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Marie-Pierre Callet (Bouches-du-Rhône) — /parlementaires/callet_marie_pierre21668f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21668F', $bio$
**CALLET MARIE-PIERRE**
Sénatrice des Bouches-du-Rhône
Groupe Union nationale pour les territoires (RN-UDR) au Sénat

I. Éléments biographiques

Naissance : 21/07/1957.

Fonctions

Depuis octobre 2026 : **Sénatrice des Bouches-du-Rhône** (groupe RN-UDR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Marie-Pierre **CALLET** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs des Bouches-du-Rhône et rejoint le groupe RN-UDR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/callet_marie_pierre21668f.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Fabien Bravi (Bouches-du-Rhône) — /parlementaires/bravi_fabien21670y/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21670Y', $bio$
**BRAVI FABIEN**
Sénateur des Bouches-du-Rhône
Groupe Union nationale pour les territoires (RN-UDR) au Sénat

I. Éléments biographiques

Naissance : 26/10/1984.

Fonctions

Depuis octobre 2026 : **Sénateur des Bouches-du-Rhône** (groupe RN-UDR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Fabien **BRAVI** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs des Bouches-du-Rhône et rejoint le groupe RN-UDR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/bravi_fabien21670y.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Bertrand Dupont (Français établis hors de France) — /parlementaires/dupont_bertrand21672b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21672B', $bio$
**DUPONT BERTRAND**
Sénateur des Français établis hors de France
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 28/09/1970.

Fonctions

Depuis octobre 2026 : **Sénateur des Français établis hors de France** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Bertrand **DUPONT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs des Français établis hors de France et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/dupont_bertrand21672b.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Véronique Baude (Ain) — /parlementaires/baude_veronique21674d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21674D', $bio$
**BAUDE VÉRONIQUE**
Sénatrice de l'Ain
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 10/11/1968.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Ain** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Véronique **BAUDE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Ain et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/baude_veronique21674d.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Maxence de Rugy (Vendée) — /parlementaires/de_rugy_maxence21676f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21676F', $bio$
**DE RUGY MAXENCE**
Sénateur de la Vendée
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 25/10/1982.

Fonctions

Depuis octobre 2026 : **Sénateur de la Vendée** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Maxence **DE RUGY** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Vendée et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/de_rugy_maxence21676f.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Pernelle Richardot (Bas-Rhin) — /parlementaires/richardot_pernelle21678h/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21678H', $bio$
**RICHARDOT PERNELLE**
Sénatrice du Bas-Rhin
Groupe Parti socialiste au Sénat

I. Éléments biographiques

Naissance : 09/06/1971.

Fonctions

Depuis octobre 2026 : **Sénatrice du Bas-Rhin** (groupe PS) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Pernelle **RICHARDOT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Bas-Rhin et rejoint le groupe PS, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/richardot_pernelle21678h.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Isabelle Dollinger (Bas-Rhin) — /parlementaires/dollinger_isabelle21680b/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21680B', $bio$
**DOLLINGER ISABELLE**
Sénatrice du Bas-Rhin
Groupe Union des centristes au Sénat

I. Éléments biographiques

Naissance : 03/04/1968.

Fonctions

Depuis octobre 2026 : **Sénatrice du Bas-Rhin** (groupe UC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Isabelle **DOLLINGER** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Bas-Rhin et rejoint le groupe UC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/dollinger_isabelle21680b.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Frédéric Duché (Eure) — /parlementaires/duche_frederic21682d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21682D', $bio$
**DUCHÉ FRÉDÉRIC**
Sénateur de l'Eure
Groupe Les Indépendants – République et Territoires au Sénat

I. Éléments biographiques

Naissance : 08/05/1968.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Eure** (groupe IRT) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Frédéric **DUCHÉ** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Eure et rejoint le groupe IRT, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/duche_frederic21682d.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Nicolas Belloir (Ille-et-Vilaine) — /parlementaires/belloir_nicolas21684f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21684F', $bio$
**BELLOIR NICOLAS**
Sénateur de l'Ille-et-Vilaine
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 12/10/1970.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Ille-et-Vilaine** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Nicolas **BELLOIR** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Ille-et-Vilaine et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/belloir_nicolas21684f.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Rodolphe Alexandre (Guyane) — /parlementaires/alexandre_rodolphe21686h/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21686H', $bio$
**ALEXANDRE RODOLPHE**
Sénateur de la Guyane
Groupe Divers gauche au Sénat

I. Éléments biographiques

Naissance : 25/09/1953.

Fonctions

Depuis octobre 2026 : **Sénateur de la Guyane** (groupe DVG) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Rodolphe **ALEXANDRE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Guyane et rejoint le groupe DVG, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/alexandre_rodolphe21686h.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Patrick Leclerc (Finistère) — /parlementaires/leclerc_patrick21688k/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21688K', $bio$
**LECLERC PATRICK**
Sénateur du Finistère
Groupe Divers droite au Sénat

I. Éléments biographiques

Naissance : 17/03/1969.

Fonctions

Depuis octobre 2026 : **Sénateur du Finistère** (groupe DVD) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Patrick **LECLERC** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Finistère et rejoint le groupe DVD, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/leclerc_patrick21688k.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Forough Dadkhah (Finistère) — /parlementaires/dadkhah_forough21690d/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21690D', $bio$
**DADKHAH FOROUGH**
Sénatrice du Finistère
Groupe Parti socialiste au Sénat

I. Éléments biographiques

Naissance : 02/03/1966.

Fonctions

Depuis octobre 2026 : **Sénatrice du Finistère** (groupe PS) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Forough **DADKHAH** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Finistère et rejoint le groupe PS, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/dadkhah_forough21690d.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Léon Levasseur (Seine-Maritime) — /parlementaires/levasseur_leon21692f/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21692F', $bio$
**LEVASSEUR LÉON**
Sénateur de la Seine-Maritime
Groupe Rassemblement national au Sénat

I. Éléments biographiques

Naissance : 19/04/1950.

Fonctions

Depuis octobre 2026 : **Sénateur de la Seine-Maritime** (groupe RN) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Léon **LEVASSEUR** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Seine-Maritime et rejoint le groupe RN, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/levasseur_leon21692f.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Florent Brunet (Drôme) — /parlementaires/brunet_florent21694h/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21694H', $bio$
**BRUNET FLORENT**
Sénateur de la Drôme
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 30/03/1963.

Fonctions

Depuis octobre 2026 : **Sénateur de la Drôme** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Florent **BRUNET** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Drôme et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/brunet_florent21694h.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Christian Simon (Var) — /parlementaires/simon_christian21696k/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21696K', $bio$
**SIMON CHRISTIAN**
Sénateur du Var
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 31/12/1959.

Fonctions

Depuis octobre 2026 : **Sénateur du Var** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Christian **SIMON** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Var et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/simon_christian21696k.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Carine Leroy (Var) — /parlementaires/leroy_carine21698m/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21698M', $bio$
**LEROY CARINE**
Sénatrice du Var
Groupe Union nationale pour les territoires (RN-UDR) au Sénat

I. Éléments biographiques

Naissance : 23/11/1969.

Fonctions

Depuis octobre 2026 : **Sénatrice du Var** (groupe RN-UDR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Carine **LEROY** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs du Var et rejoint le groupe RN-UDR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/leroy_carine21698m.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Arnaud Marthey (Doubs) — /parlementaires/marthey_arnaud21700m/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21700M', $bio$
**MARTHEY ARNAUD**
Sénateur du Doubs
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 29/09/1973.

Fonctions

Depuis octobre 2026 : **Sénateur du Doubs** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Arnaud **MARTHEY** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Doubs et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/marthey_arnaud21700m.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Dominique Santoni (Vaucluse) — /parlementaires/santoni_dominique21702p/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21702P', $bio$
**SANTONI DOMINIQUE**
Sénatrice de la Vaucluse
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 16/04/1964.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Vaucluse** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Dominique **SANTONI** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de la Vaucluse et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/santoni_dominique21702p.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Thierry d'Aigremont (Vaucluse) — /parlementaires/daigremont_thierry21704r/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21704R', $bio$
**D'AIGREMONT THIERRY**
Sénateur de la Vaucluse
Groupe Rassemblement national au Sénat

I. Éléments biographiques

Naissance : 12/06/1963.

Fonctions

Depuis octobre 2026 : **Sénateur de la Vaucluse** (groupe RN) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Thierry **D'AIGREMONT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Vaucluse et rejoint le groupe RN, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/daigremont_thierry21704r.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Julie Frêche (Hérault) — /parlementaires/freche_julie21706t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21706T', $bio$
**FRÊCHE JULIE**
Sénatrice de l'Hérault
Groupe Communiste, républicain, citoyen et écologiste au Sénat

I. Éléments biographiques

Naissance : 24/11/1980.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Hérault** (groupe CRC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Julie **FRÊCHE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Hérault et rejoint le groupe CRC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/freche_julie21706t.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Joseph Francis (Hérault) — /parlementaires/francis_joseph21708v/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21708V', $bio$
**FRANCIS JOSEPH**
Sénateur de l'Hérault
Groupe Union des centristes au Sénat

I. Éléments biographiques

Naissance : 01/06/1956.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Hérault** (groupe UC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Joseph **FRANCIS** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Hérault et rejoint le groupe UC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/francis_joseph21708v.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Christine Bost (Gironde) — /parlementaires/bost_christine21710p/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21710P', $bio$
**BOST CHRISTINE**
Sénatrice de la Gironde
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 29/06/1973.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Gironde** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Christine **BOST** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de la Gironde et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/bost_christine21710p.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Jacques Breillat (Gironde) — /parlementaires/breillat_jacques21712r/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21712R', $bio$
**BREILLAT JACQUES**
Sénateur de la Gironde
Groupe Les Indépendants – République et Territoires au Sénat

I. Éléments biographiques

Naissance : 16/07/1966.

Fonctions

Depuis octobre 2026 : **Sénateur de la Gironde** (groupe IRT) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Jacques **BREILLAT** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Gironde et rejoint le groupe IRT, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/breillat_jacques21712r.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Géraldine Amouroux (Gironde) — /parlementaires/amouroux_geraldine21714t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21714T', $bio$
**AMOUROUX GÉRALDINE**
Sénatrice de la Gironde
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 05/03/1974.

Fonctions

Depuis octobre 2026 : **Sénatrice de la Gironde** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Géraldine **AMOUROUX** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de la Gironde et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/amouroux_geraldine21714t.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Laurent Castillo (Alpes-Maritimes) — /parlementaires/castillo_laurent21716v/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21716V', $bio$
**CASTILLO LAURENT**
Sénateur des Alpes-Maritimes
Groupe Union des droites pour la République au Sénat

I. Éléments biographiques

Naissance : 12/03/1962.

Fonctions

Depuis octobre 2026 : **Sénateur des Alpes-Maritimes** (groupe UDR) ;
2024 : **Député européen** (France) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Laurent **CASTILLO** arrive au Sénat lors du renouvellement partiel du 27 septembre 2026, après un parcours à le Parlement européen. Élu le 27 septembre 2026 par les grands électeurs des Alpes-Maritimes, il rejoint le groupe UDR pour un mandat de six ans.
Il a siégé au sein du groupe PPE.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/castillo_laurent21716v.html

III. Ses sujets

Avant son élection au Sénat, il a travaillé au sein de **SANT** (le Parlement européen), **ENVI** (le Parlement européen), **TRAN** (le Parlement européen — suppléant). Ses travaux au Sénat seront détaillés dès la publication des commissions.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Gaëlle Frontoni (Alpes-Maritimes) — /parlementaires/frontoni_gaelle21718x/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21718X', $bio$
**FRONTONI GAËLLE**
Sénatrice des Alpes-Maritimes
Groupe Union des droites pour la République au Sénat

I. Éléments biographiques

Naissance : 18/07/1966.

Fonctions

Depuis octobre 2026 : **Sénatrice des Alpes-Maritimes** (groupe UDR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Gaëlle **FRONTONI** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs des Alpes-Maritimes et rejoint le groupe UDR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/frontoni_gaelle21718x.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Thierry Suaud (Haute-Garonne) — /parlementaires/suaud_thierry21720r/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21720R', $bio$
**SUAUD THIERRY**
Sénateur de l'Haute-Garonne
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 03/01/1968.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Haute-Garonne** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Thierry **SUAUD** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Haute-Garonne et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/suaud_thierry21720r.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Magali Gasto Oustric (Haute-Garonne) — /parlementaires/gasto_oustric_magali21722t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21722T', $bio$
**GASTO OUSTRIC MAGALI**
Sénatrice de l'Haute-Garonne
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 17/12/1978.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Haute-Garonne** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Magali **GASTO OUSTRIC** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Haute-Garonne et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/gasto_oustric_magali21722t.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Marc Péré (Haute-Garonne) — /parlementaires/pere_marc21724v/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21724V', $bio$
**PÉRÉ MARC**
Sénateur de l'Haute-Garonne
Groupe Socialistes et apparentés au Sénat

I. Éléments biographiques

Naissance : 05/11/1962.

Fonctions

Depuis octobre 2026 : **Sénateur de l'Haute-Garonne** (groupe SOC) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Marc **PÉRÉ** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de l'Haute-Garonne et rejoint le groupe SOC, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/pere_marc21724v.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Sébastien Michel (Rhône) — /parlementaires/michel_sebastien21726x/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21726X', $bio$
**MICHEL SÉBASTIEN**
Sénateur du Rhône
Groupe Les Républicains au Sénat

I. Éléments biographiques

Naissance : 20/03/1979.

Fonctions

Depuis octobre 2026 : **Sénateur du Rhône** (groupe LR) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Sébastien **MICHEL** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Rhône et rejoint le groupe LR, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/michel_sebastien21726x.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Serge Berard (Rhône) — /parlementaires/berard_serge21728a/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21728A', $bio$
**BERARD SERGE**
Sénateur du Rhône
Groupe Nouvelle Énergie au Sénat

I. Éléments biographiques

Naissance : 05/06/1955.

Fonctions

Depuis octobre 2026 : **Sénateur du Rhône** (groupe Nouvelle Énergie) ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Serge **BERARD** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs du Rhône et rejoint le groupe Nouvelle Énergie, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/berard_serge21728a.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Ryan Persaud (Guyane) — /parlementaires/persaud_ryan21730t/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21730T', $bio$
**PERSAUD RYAN**
Sénateur de la Guyane

I. Éléments biographiques

Naissance : 28/05/1994.

Fonctions

Depuis octobre 2026 : **Sénateur de la Guyane** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Ryan **PERSAUD** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : il est élu le 27 septembre par les grands électeurs de la Guyane, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/persaud_ryan21730t.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();

-- Annick Merle (Isère) — /parlementaires/merle_annick21732v/bio
insert into bios (personne_id, texte, source, actif, cree_par) values ('S21732V', $bio$
**MERLE ANNICK**
Sénatrice de l'Isère

I. Éléments biographiques

Naissance : 14/06/1964.

Fonctions

Depuis octobre 2026 : **Sénatrice de l'Isère** ;

Formation : à compléter.

II. Éléments de parcours et réseaux

Annick **MERLE** fait son entrée au Palais du Luxembourg lors du renouvellement partiel du 27 septembre 2026 : elle est élue le 27 septembre par les grands électeurs de l'Isère, pour un mandat de six ans.
Ses mandats et responsabilités locales antérieurs seront documentés ici au fil des publications officielles.

Présence en ligne et canaux institutionnels

Page Sénat : https://www.senat.fr/senateur/merle_annick21732v.html

III. Ses sujets

Ses positions et travaux parlementaires au Sénat seront documentés ici dès la publication des commissions et des travaux législatifs.
$bio$, 'Fiche générée depuis le référentiel (à enrichir par la rédaction)', true, 'quentin')
on conflict (personne_id) do update set texte = excluded.texte, maj_le = now();
