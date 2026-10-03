-- ============================================================================
-- DataParl — Migration : gouvernement, cabinets ministériels et suppléances
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms).
-- 100 % additif : CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS,
-- aucune modification ni suppression des tables existantes.
-- ============================================================================

-- 1. MINISTRES — liste datée et à jour des membres du gouvernement
create table if not exists public.ministres (
  id                text primary key,
  personne_id       text,
  civilite          text,
  prenom            text,
  nom               text,
  fonction          text,
  portefeuille      text,
  gouvernement      text,
  rang              text,
  debut             text not null,
  fin               text,
  source            text,
  confiance         text,
  synced_at         timestamptz not null default now()
);

-- 2. CABINETS MINISTÉRIELS — collaborateurs des ministres
create table if not exists public.cabinets_ministeriels (
  id                text primary key,
  ministre_id       text not null references public.ministres(id) on delete cascade,
  personne_id       text,
  collab_id         text,
  collab_cle        text,
  collab_nom        text,
  collab_prenom     text,
  fonction          text,
  source            text,
  confiance         text,
  date_source       text,
  run_id            text,
  synced_at         timestamptz not null default now()
);

-- 3. SUPPLÉANCES — qui remplace le député nommé au gouvernement, et quand
create table if not exists public.suppleances (
  id                text primary key,
  elu_id            text not null,
  elu_personne_id   text,
  suppleant_nom     text not null,
  suppleant_prenom  text,
  suppleant_personne_id text,
  suppleant_etait_collab boolean not null default false,
  chambre           text not null default 'assemblee',
  debut             text not null,
  fin               text,
  cause_debut       text,
  cause_fin         text,
  source            text,
  confiance         text,
  synced_at         timestamptz not null default now()
);

-- 4. RLS : lecture publique, écriture via service_role
alter table public.ministres             enable row level security;
alter table public.cabinets_ministeriels enable row level security;
alter table public.suppleances           enable row level security;

drop policy if exists "lecture publique" on public.ministres;
create policy "lecture publique" on public.ministres for select using (true);
drop policy if exists "lecture publique" on public.cabinets_ministeriels;
create policy "lecture publique" on public.cabinets_ministeriels for select using (true);
drop policy if exists "lecture publique" on public.suppleances;
create policy "lecture publique" on public.suppleances for select using (true);

-- 5. Index
create index if not exists idx_ministres_personne    on public.ministres (personne_id);
create index if not exists idx_ministres_periode    on public.ministres (debut desc, fin);
create index if not exists idx_cabinets_ministre    on public.cabinets_ministeriels (ministre_id);
create index if not exists idx_cabinets_collab      on public.cabinets_ministeriels (collab_id);
create index if not exists idx_suppleances_elu      on public.suppleances (elu_id);
create index if not exists idx_suppleances_personne on public.suppleances (suppleant_personne_id);

-- 6. Exemples (à adapter puis alimenter par le pipeline) : PA795884
-- insert into public.ministres (id, personne_id, fonction, debut)
-- values ('MIN-EXEMPLE-2024', (select personne_id from public.parlementaires where elu_id = 'PA795884'), 'Ministre de …', '2024-…')
-- on conflict (id) do update set fin = excluded.fin, synced_at = now();

-- 7. Sénateurs 2026 : date d'arrivée = 1er octobre 2026
-- select chambre, elu_id, nom, premier_mandat from public.parlementaires
--  where chambre = 'senat' and actif = true and (premier_mandat is null or premier_mandat = '');
-- update public.parlementaires set premier_mandat = '2026-10-01'
--  where chambre = 'senat' and actif = true and (premier_mandat is null or premier_mandat = '');

-- 8. Amouroux (amouroux_geraldine21714t) : groupe + commissions à compléter
-- après vérification sur la fiche officielle AN.
-- insert into public.appartenances (id, personne_id, chambre, elu_id, type, code, libelle, sigle, fonction, debut)
-- values ('APP-AMOUROUX-GROUPE',
--   (select personne_id from public.parlementaires where slug = 'amouroux_geraldine21714t'),
--   'assemblee',
--   (select elu_id from public.parlementaires where slug = 'amouroux_geraldine21714t'),
--   'groupe', '…', '…', '…', 'membre', '2026-…');

-- Les mouvements liés au gouvernement seront taggés via mouvements.contexte :
-- 'nomination_gouvernement', 'suit_au_cabinet_ministeriel', 'remplacement_suppleant'.
