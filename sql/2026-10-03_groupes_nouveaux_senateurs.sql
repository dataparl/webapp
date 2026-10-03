-- ============================================================================
-- DataParl — Groupes parlementaires des nouveaux sénateurs 2026
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms).
--
-- Associe les 62 nouveaux sénateurs du scrutin du 27 septembre 2026 à leur
-- groupe parlementaire, d'après la liste fournie par l'équipe (3 octobre 2026).
-- La synchro nocturne remplacera ces valeurs par les groupes officiels dès que
-- senat.fr les publiera ; en attendant, les fiches groupes
-- (/groupe/senat-rn-udr/…) et partis (/parti/rn/…) sont déjà correctes.
-- Chaque UPDATE vise une fiche par personne_id : sans effet de bord.
-- ============================================================================

-- Véronique Baude (Ain) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21674D';

-- Florent Brunet (Drôme) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21694H';

-- Nathalie Nieson (Drôme) : Aucun → RDPI
update parlementaires set groupe = 'RDPI', groupe_libelle = 'Rassemblement des démocrates, progressistes et indépendants' where chambre = 'senat' and personne_id = 'PA606030';

-- Sébastien Michel (Rhône) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21726X';

-- Christophe Guilloteau (Rhône) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'PA267499';

-- Serge Berard (Rhône) : Aucun → Nouvelle Énergie
update parlementaires set groupe = 'Nouvelle Énergie', groupe_libelle = 'Nouvelle Énergie' where chambre = 'senat' and personne_id = 'S21728A';

-- Gabriel Amard (Rhône) : Aucun → LFI
update parlementaires set groupe = 'LFI', groupe_libelle = 'La France insoumise' where chambre = 'senat' and personne_id = 'PA794906';

-- Nicolas Fricoteaux (Aisne) : Aucun → DVC
update parlementaires set groupe = 'DVC', groupe_libelle = 'Divers centre' where chambre = 'senat' and personne_id = 'S21664B';

-- Paul Mougenot (Aisne) : Aucun → DVD
update parlementaires set groupe = 'DVD', groupe_libelle = 'Divers droite' where chambre = 'senat' and personne_id = 'S21666D';

-- Laurent Castillo (Alpes-Maritimes) : Aucun → UDR
update parlementaires set groupe = 'UDR', groupe_libelle = 'Union des droites pour la République' where chambre = 'senat' and personne_id = 'S21716V';

-- Gaëlle Frontoni (Alpes-Maritimes) : Aucun → UDR
update parlementaires set groupe = 'UDR', groupe_libelle = 'Union des droites pour la République' where chambre = 'senat' and personne_id = 'S21718X';

-- Marie-Pierre Callet (Bouches-du-Rhône) : Aucun → RN-UDR
update parlementaires set groupe = 'RN-UDR', groupe_libelle = 'Union nationale pour les territoires (RN-UDR)' where chambre = 'senat' and personne_id = 'S21668F';

-- Fabien Bravi (Bouches-du-Rhône) : Aucun → RN-UDR
update parlementaires set groupe = 'RN-UDR', groupe_libelle = 'Union nationale pour les territoires (RN-UDR)' where chambre = 'senat' and personne_id = 'S21670Y';

-- Renaud Muselier (Bouches-du-Rhône) : Aucun → RDPI
update parlementaires set groupe = 'RDPI', groupe_libelle = 'Rassemblement des démocrates, progressistes et indépendants' where chambre = 'senat' and personne_id = 'PA2256';

-- Christian Simon (Var) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21696K';

-- Frank Giletti (Var) : Aucun → RN-UDR
update parlementaires set groupe = 'RN-UDR', groupe_libelle = 'Union nationale pour les territoires (RN-UDR)' where chambre = 'senat' and personne_id = 'PA796034';

-- Carine Leroy (Var) : Aucun → RN-UDR
update parlementaires set groupe = 'RN-UDR', groupe_libelle = 'Union nationale pour les territoires (RN-UDR)' where chambre = 'senat' and personne_id = 'S21698M';

-- Dominique Santoni (Vaucluse) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21702P';

-- Thierry d'Aigremont (Vaucluse) : Aucun → RN
update parlementaires set groupe = 'RN', groupe_libelle = 'Rassemblement national' where chambre = 'senat' and personne_id = 'S21704R';

-- Claudie Faucon Mejean (Aude) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21646Y';

-- Sylvie Josserand (Gard) : Aucun → RN
update parlementaires set groupe = 'RN', groupe_libelle = 'Rassemblement national' where chambre = 'senat' and personne_id = 'PA841075';

-- Thierry Suaud (Haute-Garonne) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21720R';

-- Magali Gasto Oustric (Haute-Garonne) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21722T';

-- Marc Péré (Haute-Garonne) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21724V';

-- Carole Rolando (Gers) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21654Y';

-- Julie Frêche (Hérault) : Aucun → CRC
update parlementaires set groupe = 'CRC', groupe_libelle = 'Communiste, républicain, citoyen et écologiste' where chambre = 'senat' and personne_id = 'S21706T';

-- Joseph Francis (Hérault) : Aucun → UC
update parlementaires set groupe = 'UC', groupe_libelle = 'Union des centristes' where chambre = 'senat' and personne_id = 'S21708V';

-- Manon Bouquin (Hérault) : Aucun → RN
update parlementaires set groupe = 'RN', groupe_libelle = 'Rassemblement national' where chambre = 'senat' and personne_id = 'PA841131';

-- Valérie Bazin-Malgras (Aube) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'PA718884';

-- Isabelle Dollinger (Bas-Rhin) : Aucun → UC
update parlementaires set groupe = 'UC', groupe_libelle = 'Union des centristes' where chambre = 'senat' and personne_id = 'S21680B';

-- Pernelle Richardot (Bas-Rhin) : Aucun → PS
update parlementaires set groupe = 'PS', groupe_libelle = 'Parti socialiste' where chambre = 'senat' and personne_id = 'S21678H';

-- Benjamin Huin (Haut-Rhin) : Aucun → RDPI
update parlementaires set groupe = 'RDPI', groupe_libelle = 'Rassemblement des démocrates, progressistes et indépendants' where chambre = 'senat' and personne_id = 'S21662Y';

-- Christophe Plassard (Charente-Maritime) : Aucun → IRT
update parlementaires set groupe = 'IRT', groupe_libelle = 'Les Indépendants – République et Territoires' where chambre = 'senat' and personne_id = 'PA793572';

-- Pascal Coste (Corrèze) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21642U';

-- Julien Bounie (Corrèze) : Aucun → DVD
update parlementaires set groupe = 'DVD', groupe_libelle = 'Divers droite' where chambre = 'senat' and personne_id = 'S21640S';

-- Bertrand Labar (Creuse) : Aucun → DVD
update parlementaires set groupe = 'DVD', groupe_libelle = 'Divers droite' where chambre = 'senat' and personne_id = 'S21648B';

-- Jacques Breillat (Gironde) : Aucun → IRT
update parlementaires set groupe = 'IRT', groupe_libelle = 'Les Indépendants – République et Territoires' where chambre = 'senat' and personne_id = 'S21712R';

-- Géraldine Amouroux (Gironde) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21714T';

-- Christine Bost (Gironde) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21710P';

-- Edwige Diaz (Gironde) : Aucun → RN-UDR
update parlementaires set groupe = 'RN-UDR', groupe_libelle = 'Union nationale pour les territoires (RN-UDR)' where chambre = 'senat' and personne_id = 'PA793928';

-- Marie-Pierre Missioux (Deux-Sèvres) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21656B';

-- François Rebsamen (Côte-d'Or) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S08070Y';

-- Arnaud Marthey (Doubs) : Aucun → SOC
update parlementaires set groupe = 'SOC', groupe_libelle = 'Socialistes et apparentés' where chambre = 'senat' and personne_id = 'S21700M';

-- Dimitri Doussot (Haute-Saône) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21644W';

-- Patrick Leclerc (Finistère) : Aucun → DVD
update parlementaires set groupe = 'DVD', groupe_libelle = 'Divers droite' where chambre = 'senat' and personne_id = 'S21688K';

-- Forough Dadkhah (Finistère) : Aucun → PS
update parlementaires set groupe = 'PS', groupe_libelle = 'Parti socialiste' where chambre = 'senat' and personne_id = 'S21690D';

-- Nicolas Belloir (Ille-et-Vilaine) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21684F';

-- Samir Rhimini (Cher) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21650U';

-- Loïc Kervran (Cher) : Aucun → IRT
update parlementaires set groupe = 'IRT', groupe_libelle = 'Les Indépendants – République et Territoires' where chambre = 'senat' and personne_id = 'PA719052';

-- Virginie Quentin (Eure-et-Loir) : Aucun → LR/DVD
update parlementaires set groupe = 'LR/DVD', groupe_libelle = 'Les Républicains / divers droite' where chambre = 'senat' and personne_id = 'S21658D';

-- Alexis Robin (Eure-et-Loir) : Aucun → LR/DVD
update parlementaires set groupe = 'LR/DVD', groupe_libelle = 'Les Républicains / divers droite' where chambre = 'senat' and personne_id = 'S21660W';

-- Régis Blanchet (Indre) : Aucun → DVD
update parlementaires set groupe = 'DVD', groupe_libelle = 'Divers droite' where chambre = 'senat' and personne_id = 'S21652W';

-- François Aubey (Calvados) : Aucun → DVC
update parlementaires set groupe = 'DVC', groupe_libelle = 'Divers centre' where chambre = 'senat' and personne_id = 'S14137P';

-- Frédéric Duché (Eure) : Aucun → IRT
update parlementaires set groupe = 'IRT', groupe_libelle = 'Les Indépendants – République et Territoires' where chambre = 'senat' and personne_id = 'S21682D';

-- Bastien Coriton (Seine-Maritime) : Aucun → PS
update parlementaires set groupe = 'PS', groupe_libelle = 'Parti socialiste' where chambre = 'senat' and personne_id = 'PA722198';

-- Léon Levasseur (Seine-Maritime) : Aucun → RN
update parlementaires set groupe = 'RN', groupe_libelle = 'Rassemblement national' where chambre = 'senat' and personne_id = 'S21692F';

-- Dominique Le Mèner (Sarthe) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'PA267317';

-- Maxence de Rugy (Vendée) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21676F';

-- Rodolphe Alexandre (Guyane) : Aucun → DVG
update parlementaires set groupe = 'DVG', groupe_libelle = 'Divers gauche' where chambre = 'senat' and personne_id = 'S21686H';

-- Lafaele Tukumuli (Iles Wallis et Futuna) : Aucun → Divers centre
update parlementaires set groupe = 'Divers centre', groupe_libelle = 'Divers centre' where chambre = 'senat' and personne_id = 'S21638Y';

-- Bertrand Dupont (Français établis hors de France) : Aucun → LR
update parlementaires set groupe = 'LR', groupe_libelle = 'Les Républicains' where chambre = 'senat' and personne_id = 'S21672B';

-- Marie-Ange Rousselot (Français établis hors de France) : Aucun → RDPI
update parlementaires set groupe = 'RDPI', groupe_libelle = 'Rassemblement des démocrates, progressistes et indépendants' where chambre = 'senat' and personne_id = 'PA795888';
