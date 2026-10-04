-- ============================================================================
-- DataParl — Suivi du balayage du JORF (gouvernement et cabinets ministériels)
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms),
-- après sql/2026-10-03_gouvernement_cabinets_suppleances.sql.
--
-- La table ministres existe déjà (migration du 03/10) ; on ajoute :
--  1. les dates de début et de fin des membres des cabinets ministériels ;
--  2. la table jorf_releves : un relevé par numéro du JORF balayé (le pipeline
--     relit le Journal officiel chaque matin et rattrape l'historique 2017→…,
--     en reprenant là où il s'était arrêté).
-- ============================================================================

-- 1. Dates des passages en cabinet ministériel (nomination, cessation).
alter table public.cabinets_ministeriels
  add column if not exists debut text,
  add column if not exists fin   text;
create index if not exists idx_cabinets_periode on public.cabinets_ministeriels (debut desc, fin);
create index if not exists idx_cabinets_cle     on public.cabinets_ministeriels (collab_cle);

-- 2. Relevés du JORF : un jour = une ligne, ajoutée par le pipeline
--    (cron quotidien / balayage historique depuis l'admin).
create table if not exists public.jorf_releves (
  date_jorf    text primary key,          -- numéro du jour balayé ('YYYY-MM-DD')
  nb_mesures   integer not null default 0,-- mesures nominatives repérées (gouv + cabinets)
  nb_ministres integer not null default 0,
  nb_cabinets  integer not null default 0,
  erreurs      text,                      -- au plus 5 erreurs, pour l'audit
  synced_at    timestamptz not null default now()
);

-- 3. RLS : écriture et lecture réservées au service_role (table interne).
alter table public.jorf_releves enable row level security;
