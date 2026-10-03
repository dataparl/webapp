-- ============================================================================
-- DataParl — Migration : gouvernement, cabinets ministériels et suppléances
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms).
-- 100 % additif : CREATE TABLE IF NOT EXISTS, aucun DROP, aucune modification
-- des tables existantes (affectations, mouvements, parlementaires…).
-- ============================================================================

-- 1. MINISTRES — liste datée et à jour des membres du gouvernement
create table if not exists public.ministres (
  id                text primary key,           -- ex. 'MIN-ATTAL-20240109'
  personne_id       text,                       -- lien vers parlementaires si élu
  civilite          text,
  prenom            text,
  nom               text,
  fonction          text,                       -- ex. 'Ministre du Travail'
  portefeuille      text,
  gouvernement      text,                       -- ex. 'Attal', 'Borne II'
  rang              text,                       -- 'PM', 'ministre d''État'…
  debut             text not null,              -- 'YYYY-MM-DD'
  fin               text,                       -- null = en fonction
  source            text,
  confiance         text,
  synced_at         timestamptz not null default now()
);

-- 2. CABINETS MINISTÉRIELS — collaborateurs des ministres
create table if not exists public.cabinets_ministeriels (
  id                text primary key,
  ministre_id       text not null references public.ministres(id) on delete cascade,
  personne_id       text,                       -- rapprochement avec collaborateurs
  collab_id         text,
  collab_cle        text,                       -- même clé normalisée que collaborateurs
  collab_nom        text,
  collab_prenom     text,
  fonction          text,                       -- 'directeur de cabinet'…
  source            text,
  confiance         text,
  date_source       text,
  run_id            text,
  synced_at         timestamptz not null default now()
);

-- 3. SUPPLÉANCES — qui remplace le député nommé au gouvernement, et quand
create table if not exists public.suppleances (
  id                text primary key,           -- ex. 'SUP-PA795884-2024'
  elu_id            text not null,              -- député titulaire (PA…)
  elu_personne_id   text,
  suppleant_elu_id  text,                       -- elu_id du suppléant (pour tagger les mouvements)
  suppleant_nom     text not null,
  suppleant_prenom  text,
  suppleant_personne_id text,                  -- souvent un ex-collaborateur !
  suppleant_etait_collab boolean not null default false,
  chambre           text not null default 'assemblee',
  debut             text not null,              -- remplacement effectif (nomination au gouv)
  fin               text,                       -- retour du titulaire (null = en cours)
  cause_debut       text,                       -- 'nomination_gouvernement'…
  cause_fin         text,                       -- 'retour_parlement'…
  source            text,
  confiance         text,
  synced_at         timestamptz not null default now()
);

-- 4. RLS : lecture publique, écriture réservée au service_role
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

-- 6. Sénateurs élus en 2026 : date d'arrivée = 1er octobre 2026
--    (les 65 nouveaux élus identifiés le 03/10/2026 ; vérifier la liste avant)
select elu_id, nom, prenom, premier_mandat from public.parlementaires
 where chambre = 'senat' and actif = true
   and (premier_mandat is null or premier_mandat = '');
update public.parlementaires set premier_mandat = '2026-10-01'
 where chambre = 'senat' and actif = true
   and (premier_mandat is null or premier_mandat = '');

-- 7. Nouveaux sénateurs (ex. Amouroux PA21714T) : groupe + commissions
--    à compléter dans `appartenances` après vérification (fiche Sénat / AN).
-- insert into public.appartenances (id, personne_id, chambre, elu_id, type, code, libelle, sigle, fonction, debut)
-- values ('APP-AMOUROUX-GROUPE',
--   (select personne_id from public.parlementaires where elu_id = '21714T'),
--   'senat', '21714T', 'groupe', '…', '…', '…', 'membre', '2026-10-01');

-- Les mouvements liés au gouv sont taggés via mouvements.contexte
-- ('suppleance_remplacement') par le pipeline (collabs/gouvernement.py).
