-- ============================================================================
-- DataParl' — Rapprochement ministres <-> parlementaires (2017 -> aujourd'hui)
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms),
-- APRÈS sql/2026-10-04_ministres_gouvernements_2017_2026.sql.
--
-- Le seed des gouvernements 2017-2026 insère les ministres avec personne_id = null.
-- Ce script remplit personne_id pour les 125 ministres qui figurent dans le
-- référentiel des parlementaires (deputes/senateurs, tous mandats confondus),
-- pour que la section "Parcours parlementaire et gouvernemental" des fiches
-- affiche aussi les fonctions gouvernementales.
--
-- Les ~56 autres (Castex, Parly, Barbut, Colonna, Hulot...) n'ont jamais ete
-- parlementaires : personne_id reste null pour eux, c'est attendu.
-- Matching : prenom (insensible a la casse) + nom (insensible a la casse),
-- sans accents ni traits d'union pour eviter les differences de graphie.
-- Ne modifie que les lignes ou personne_id est null (idempotent).
-- ============================================================================

with rapprochements (prenom, nom, personne_id) as (
  values
('Marc', 'FERRACCI', 'PA795884'),
('François', 'BAYROU', 'PA410'),
('Gérald', 'DARMANIN', 'PA607846'),
('Bruno', 'RETAILLEAU', 'S04033B'),
('Sébastien', 'LECORNU', 'S19265T'),
('Agnès', 'PANNIER-RUNACHER', 'PA759832'),
('Élisabeth', 'BORNE', 'PA717161'),
('Rachida', 'DATI', 'E72775'),
('Astrid', 'PANOSYAN-BOUVET', 'PA795050'),
('Yannick', 'NEUDER', 'PA794038'),
('Manuel', 'VALLS', 'PA267622'),
('Laurent', 'MARCANGELI', 'PA605782'),
('Annie', 'GENEVARD', 'PA605991'),
('Édouard', 'Philippe', 'PA345619'),
('Gérard', 'Collomb', 'S99002P'),
('Jean-Yves', 'Le Drian', 'PA1872'),
('Sylvie', 'Goulard', 'E97137'),
('Bruno', 'Le Maire', 'PA331481'),
('Jacques', 'Mézard', 'S08051V'),
('Richard', 'Ferrand', 'PA606171'),
('Stéphane', 'Travert', 'PA607395'),
('Annick', 'Girardin', 'PA337633'),
('Marielle', 'de Sarnez', 'PA717151'),
('Christophe', 'Castaner', 'PA605131'),
('Mounir', 'Mahjoubi', 'PA717167'),
('François', 'de Rugy', 'PA332747'),
('Olivier', 'Véran', 'PA642788'),
('Jacqueline', 'Gourault', 'S01007L'),
('Didier', 'Guillaume', 'S08016S'),
('Franck', 'Riester', 'PA335758'),
('Nathalie', 'Loiseau', 'E197494'),
('Jean-Baptiste', 'Djebbari', 'PA722236'),
('Benjamin', 'Griveaux', 'PA721560'),
('Brune', 'Poirson', 'PA721872'),
('Jean-Baptiste', 'Lemoyne', 'S14037X'),
('Geneviève', 'Darrieussecq', 'PA719914'),
('Olivier', 'Dussopt', 'PA330357'),
('Amélie', 'de Montchalin', 'PA721670'),
('Gabriel', 'Attal', 'PA722190'),
('Christelle', 'Dubos', 'PA719660'),
('Adrien', 'Taquet', 'PA722086'),
('Laurent', 'Pietraszewski', 'PA720512'),
('Barbara', 'Pompili', 'PA609520'),
('Joël', 'Giraud', 'PA267336'),
('Roselyne', 'Bachelot', 'PA332'),
('Marc', 'Fesneau', 'PA719938'),
('Brigitte', 'Klinkert', 'PA643184'),
('Nadia', 'Hai', 'PA722054'),
('Brigitte', 'Bourguignon', 'PA608083'),
('Clément', 'Beaune', 'PA774109'),
('Bérangère', 'Abba', 'PA720242'),
('Nathalie', 'Élimas', 'PA720924'),
('Sarah', 'El Haïry', 'PA720002'),
('Olivia', 'Grégoire', 'PA721764'),
('Christophe', 'Béchu', 'S11030C'),
('Aurélien', 'Rousseau', 'PA826635'),
('Agnès', 'Firmin-Le Bodo', 'PA267780'),
('Damien', 'Abad', 'PA605036'),
('Aurore', 'Bergé', 'PA722046'),
('Stanislas', 'Guerini', 'PA721498'),
('Yaël', 'Braun-Pivet', 'PA721908'),
('Thomas', 'Cazenave', 'PA793940'),
('Caroline', 'Cayeux', 'S11044J'),
('Dominique', 'Faure', 'PA793788'),
('Olivier', 'Becht', 'PA642935'),
('Roland', 'Lescure', 'PA721134'),
('Jean-Noël', 'Barrot', 'PA721836'),
('Marie', 'Guévenoux', 'PA721880'),
('Guillaume', 'Kasbarian', 'PA719372'),
('Carole', 'Grandjean', 'PA720170'),
('Frédéric', 'Valletoux', 'PA795350'),
('Fadila', 'Khattabi', 'PA719186'),
('Hervé', 'Berville', 'PA719218'),
('Justine', 'Benin', 'PA720968'),
('Chrysoula', 'Zacharopoulou', 'E197499'),
('Patricia', 'Mirallès', 'PA719668'),
('Bérangère', 'Couillard', 'PA719624'),
('Catherine', 'Vautrin', 'PA267797'),
('Stéphane', 'Séjourné', 'PA842137'),
('Prisca', 'Thevenot', 'PA795920'),
('Marie', 'Lebec', 'PA721852'),
('Marina', 'Ferrari', 'PA795120'),
('Michel', 'Barnier', 'PA368'),
('Didier', 'Migaud', 'PA2189'),
('Anne', 'Genetet', 'PA721024'),
('Antoine', 'Armand', 'PA795144'),
('Paul', 'Christophe', 'PA642868'),
('Valérie', 'Létard', 'PA227089'),
('Patrick', 'Hetzel', 'PA608416'),
('François-Noël', 'Buffet', 'S04047H'),
('Laurent', 'Saint-Martin', 'PA720878'),
('Benjamin', 'Haddad', 'PA795958'),
('Nathalie', 'Delattre', 'S19719D'),
('Maud', 'Bregeon', 'PA795990'),
('Marie-Claire', 'Carrère-Gée', 'S21090J'),
('Françoise', 'Gatel', 'S14231L'),
('Alexandre', 'Portier', 'PA794994'),
('Sophie', 'Primas', 'PA345916'),
('Marie-Agnès', 'Poussier-Winsback', 'PA795270'),
('Olga', 'Givernet', 'PA718674'),
('Agnès', 'Canayer', 'S14053L'),
('Charlotte', 'Parmentier-Lecocq', 'PA720480'),
('Jean-Louis', 'Thiériot', 'PA643089'),
('Thani', 'Mohamed Soilihi', 'S11072N'),
('Laurence', 'Garnier', 'S20172F'),
('François', 'Rebsamen', 'S08070Y'),
('Philippe', 'Tabarot', 'S20136B'),
('Patrick', 'Mignola', 'PA721418'),
('Véronique', 'Louwagie', 'PA608016'),
('Éric', 'Woerth', 'PA2960'),
('Naïma', 'Moutchou', 'PA720908'),
('Mathieu', 'Lefèvre', 'PA795386'),
('Stéphanie', 'Rist', 'PA720066'),
('David', 'Amiel', 'PA795950'),
('Vincent', 'Jeanbrun', 'PA842117'),
('Laurent', 'Panifous', 'PA793210'),
('Marie-Pierre', 'Vedrenne', 'E197502'),
('Jean-Didier', 'Berger', 'PA408578'),
('Catherine', 'Chabaud', 'E197505'),
('Sébastien', 'Martin', 'PA870010'),
('Anne', 'Le Hénanff', 'PA794426'),
('Nicolas', 'Forissier', 'PA1327'),
('Éléonore', 'Caroit', 'PA795330'),
('Camille', 'Galliard-Minier', 'PA719736'),
('Sabrina', 'Roubache', 'PA793278')
)
update ministres m
set    personne_id = r.personne_id,
       synced_at   = now()
from   rapprochements r
where  m.personne_id is null
  and  upper(translate(m.nom,     'ÉÈÊËÀÂÄÎÏÔÖÛÜÇ', 'EEEEAAAIIIOOUUC'))
     = upper(translate(r.nom,     'ÉÈÊËÀÂÄÎÏÔÖÛÜÇ', 'EEEEAAAIIIOOUUC'))
  and  upper(translate(m.prenom,   'ÉÈÊËÀÂÄÎÏÔÖÛÜÇ', 'EEEEAAAIIIOOUUC'))
     = upper(translate(r.prenom,   'ÉÈÊËÀÂÄÎÏÔÖÛÜÇ', 'EEEEAAAIIIOOUUC'));

-- Verification : nombre de lignes ministres toujours sans personne_id
-- (attendu : les non-parlementaires uniquement, ~56 personnes, plusieurs lignes)
-- select gouvernement, prenom, nom from ministres where personne_id is null;
