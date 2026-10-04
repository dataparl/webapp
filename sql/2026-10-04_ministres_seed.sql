-- ============================================================================
-- DataParl — Seed de la table ministres (gouvernements Barnier et Bayrou)
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms),
-- APRÈS sql/2026-10-03_gouvernement_cabinets_suppleances.sql (qui crée la
-- table) et sql/2026-10-04_jorf_releves.sql.
--
-- Rôle de ce fichier : amorcer la section « Au gouvernement » des fiches
-- parlementaires avec le dernier gouvernement connu (Bayrou, 23/12/2024),
-- AVANT que le balayage du JORF (admin.dataparl.fr/jorf) ne rattrape tout
-- l'historique 2017 → aujourd'hui.
--
-- ⚠️ Conventions importantes :
--  • Les `id` suivent EXACTEMENT le format du pipeline JORF
--    (MIN-<NOM-MAJUSCULES>-<AAAAMMJJ>) : le balayage mettra donc à jour ces
--    lignes (upsert) au lieu de créer des doublons.
--  • `fin` reste null tant que la personne est en fonction : quand le
--    balayage JORF trouvera les décrets de cessation, il remplira `fin` et
--    `synced_at` tout seul (rapprochement par nom, sur les lignes fin null).
--  • `personne_id` fait le lien avec la fiche parlementaire (rapproché dans
--    le référentiel le 04/10/2026) ; null pour les ministres non
--    parlementaires. Les ministres qui ont quitté le Parlement en entrant au
--    gouvernement gardent leur personne_id : la fiche affiche « Au
--    gouvernement » même si la fiche parlementaire est inactive.
--  • Les secrétaires d'État et les remaniements postérieurs à décembre 2024
--    ne sont PAS ici : le balayage du JORF les ajoutera automatiquement.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Gouvernement Barnier (21 septembre 2024)
-- ----------------------------------------------------------------------------
insert into ministres (id, personne_id, civilite, prenom, nom, fonction, portefeuille, gouvernement, rang, debut, fin, source, confiance)
values
  ('MIN-FERRACCI-20240921', 'PA795884', 'M.', 'Marc', 'FERRACCI',
   'Ministre de l''Industrie', 'Industrie', 'Barnier', 'ministre',
   '2024-09-21', '2024-12-23', 'Légifrance (JO, nomination du 21/09/2024)', 'officiel')
on conflict (id) do update
  set fonction = excluded.fonction, portefeuille = excluded.portefeuille,
      gouvernement = excluded.gouvernement, rang = excluded.rang,
      debut = excluded.debut, fin = excluded.fin,
      source = excluded.source, confiance = excluded.confiance, synced_at = now();

-- ----------------------------------------------------------------------------
-- Gouvernement Bayrou (23 décembre 2024)
-- ----------------------------------------------------------------------------
insert into ministres (id, personne_id, civilite, prenom, nom, fonction, portefeuille, gouvernement, rang, debut, fin, source, confiance)
values
  ('MIN-BAYROU-20241223', 'PA410', 'M.', 'François', 'BAYROU',
   'Premier ministre', '—', 'Bayrou', 'PM',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-DARMANIN-20241223', 'PA607846', 'M.', 'Gérald', 'DARMANIN',
   'Ministre d''État, garde des sceaux, ministre de la Justice', 'Justice', 'Bayrou', 'ministre d''État',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-RETAILLEAU-20241223', 'S04033B', 'M.', 'Bruno', 'RETAILLEAU',
   'Ministre de l''Intérieur', 'Intérieur', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-LECORNU-20241223', 'S19265T', 'M.', 'Sébastien', 'LECORNU',
   'Ministre des Armées', 'Armées', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-LOMBARD-20241223', null, 'M.', 'Éric', 'LOMBARD',
   'Ministre de l''Économie, des Finances et de l''Industrie', 'Économie, Finances, Industrie', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-PANNIERRUNACHER-20241223', 'PA759832', 'Mme', 'Agnès', 'PANNIER-RUNACHER',
   'Ministre de la Transition écologique, de l''Énergie, du Climat et de la Prévention des risques',
   'Transition écologique, Énergie', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-BORNE-20241223', 'PA717161', 'Mme', 'Élisabeth', 'BORNE',
   'Ministre de l''Éducation nationale, de l''Enseignement supérieur et de la Recherche',
   'Éducation, Enseignement supérieur, Recherche', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-DATI-20241223', 'E72775', 'Mme', 'Rachida', 'DATI',
   'Ministre de la Culture', 'Culture', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-PANOSYANBOUVET-20241223', 'PA795050', 'Mme', 'Astrid', 'PANOSYAN-BOUVET',
   'Ministre du Travail et de l''Emploi', 'Travail, Emploi', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-NEUDER-20241223', 'PA794038', 'M.', 'Yannick', 'NEUDER',
   'Ministre de la Santé', 'Santé', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-VALLS-20241223', 'PA267622', 'M.', 'Manuel', 'VALLS',
   'Ministre des Outre-mer', 'Outre-mer', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-MARCANGELI-20241223', 'PA605782', 'M.', 'Laurent', 'MARCANGELI',
   'Ministre chargé des Relations avec le Parlement', 'Relations avec le Parlement', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-GENEVARD-20241223', 'PA605991', 'Mme', 'Annie', 'GENEVARD',
   'Ministre de l''Agriculture et de la Souveraineté alimentaire', 'Agriculture', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel'),

  ('MIN-FERRACCI-20241223', 'PA795884', 'M.', 'Marc', 'FERRACCI',
   'Ministre de l''Industrie et de l''Énergie', 'Industrie, Énergie', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel')
on conflict (id) do update
  set personne_id = excluded.personne_id, civilite = excluded.civilite,
      fonction = excluded.fonction, portefeuille = excluded.portefeuille,
      gouvernement = excluded.gouvernement, rang = excluded.rang,
      debut = excluded.debut, fin = excluded.fin,
      source = excluded.source, confiance = excluded.confiance, synced_at = now();

-- ----------------------------------------------------------------------------
-- Contrôle rapide (optionnel) : ce que contient la table après le seed.
-- ----------------------------------------------------------------------------
-- select gouvernement, count(*) as ministres from ministres group by 1 order by 2 desc;
-- select m.nom, m.prenom, m.fonction, m.debut, m.fin, p.slug
--   from ministres m left join parlementaires p on p.personne_id = m.personne_id
--  order by m.debut desc;
