-- ============================================================================
-- DataParl — Premiers passages au gouvernement (table ministres)
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms),
-- APRÈS la migration sql/2026-10-03_gouvernement_cabinets_suppleances.sql
-- (qui crée la table ministres).
--
-- Le site affiche désormais les fonctions gouvernementales sur la fiche de
-- chaque parlementaire (section « Au gouvernement ») dès qu'une ligne existe
-- dans ministres avec son personne_id.
--
-- Compléter au fil des nominations (source : Légifrance, JO « nominations »).
-- fin = null tant que la personne est en fonction.
-- ============================================================================

-- Marc Ferracci (PA795884) — entré au gouvernement le 21 septembre 2024
-- (gouvernement Barnier, ministre de l'Industrie), maintenu le 23 décembre
-- 2024 (gouvernement Bayrou, ministre de l'Industrie et de l'Énergie).
insert into ministres (id, personne_id, civilite, prenom, nom, fonction, portefeuille, gouvernement, rang, debut, fin, source, confiance)
values
  ('MIN-FERRACCI-20240921', 'PA795884', 'M.', 'Marc', 'FERRACCI',
   'Ministre de l''Industrie', 'Industrie', 'Barnier', 'ministre',
   '2024-09-21', '2024-12-23', 'Légifrance (JO, nomination du 21/09/2024)', 'officiel'),
  ('MIN-FERRACCI-20241223', 'PA795884', 'M.', 'Marc', 'FERRACCI',
   'Ministre de l''Industrie et de l''Énergie', 'Industrie, Énergie', 'Bayrou', 'ministre',
   '2024-12-23', null, 'Légifrance (JO, nomination du 23/12/2024)', 'officiel')
on conflict (id) do update
  set fonction = excluded.fonction, portefeuille = excluded.portefeuille,
      gouvernement = excluded.gouvernement, rang = excluded.rang,
      debut = excluded.debut, fin = excluded.fin,
      source = excluded.source, confiance = excluded.confiance,
      synced_at = now();

-- Modèle pour ajouter les autres membres du gouvernement :
-- insert into ministres (id, personne_id, civilite, prenom, nom, fonction, portefeuille, gouvernement, rang, debut, fin, source, confiance)
-- values ('MIN-<NOM>-<AAAAMMJJ>', '<PA…>', 'M.', 'Prénom', 'NOM',
--   'Ministre de …', '…', 'Bayrou', 'ministre d''État',
--   '2024-12-23', null, 'Légifrance (JO)', 'officiel')
-- on conflict (id) do update set fin = excluded.fin, fonction = excluded.fonction, synced_at = now();
--
-- Ne pas oublier la personne_id : c'est elle qui relie le ministre à sa fiche
-- parlementaire. Pour les ministres non parlementaires, laisser personne_id
-- null (aucune fiche, mais la ligne sert aux cabinets ministériels).
