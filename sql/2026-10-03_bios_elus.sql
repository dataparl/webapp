-- ============================================================================
-- DataParl — Migration : bios, mandats et fonctions manuels des élus
-- À exécuter dans le SQL Editor de la base `dataparl` (yuhqajaznizwmenmyzms).
-- 100 % additif : CREATE TABLE IF NOT EXISTS, aucun DROP, aucune modification
-- des tables existantes (parlementaires, mandats, appartenances…).
--
-- Ces trois tables sont éditées à la main depuis l'espace d'administration
-- (admin.dataparl.fr/elus) : elles complètent les données synchronisées chaque
-- nuit depuis les sources officielles par dataparl/collaborateurs, sans jamais
-- les écraser (une ligne manuelle porte son propre identifiant).
-- ============================================================================

-- 1. BIOGRAPHIE — un texte de bio par élu, activable ou non
create table if not exists public.bios (
  id            uuid primary key default gen_random_uuid(),
  personne_id   text not null unique,        -- clé de parlementaires.personne_id
  texte         text not null,               -- biographie libre (Markdown léger accepté)
  source        text,                       -- ex. 'rédaction DataParl''', 'Wikipédia adaptée'
  actif         boolean not null default false,  -- seules les bios actives s'affichent sur le site
  cree_par      text,                       -- membre de l'équipe
  maj_par       text,
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);

-- 2. MANDATS MANUELS — un mandat ajouté à la main (ex. mandat local, dates
--    à compléter que la synchronisation ne couvre pas)
create table if not exists public.mandats_manuels (
  id            text primary key,            -- 'MM-…' généré par l'admin
  personne_id   text not null,
  chambre      text,                        -- assemblee | senat | europarl | local | gouvernement…
  elu_id       text,
  libelle      text not null,               -- 'Sénateur', 'Députée', 'Maire de Bordeaux'…
  circonscription text,
  debut        text,                        -- 'YYYY-MM-DD' (vide = inconnue)
  fin          text,                        -- null/'' = en cours
  cause_fin    text,
  source       text,
  actif        boolean not null default true,
  cree_par     text,
  maj_par      text,
  cree_le      timestamptz not null default now(),
  maj_le       timestamptz not null default now()
);

-- 3. FONCTIONS MANUELLES — une fonction, commission ou appartenance ajoutée
--    à la main (complète la table appartenances)
create table if not exists public.fonctions_manuelles (
  id            text primary key,            -- 'FM-…' généré par l'admin
  personne_id   text not null,
  chambre      text,
  type          text not null default 'fonction',  -- groupe | commission | fonction
  code          text,
  libelle      text not null,               -- 'Commission des Lois', 'Conseil municipal de Lyon'…
  sigle         text,
  fonction      text,                       -- 'Membre du', 'Président', 'Rapporteur'…
  debut        text,
  fin          text,                        -- null/'' = en cours
  source       text,
  actif        boolean not null default true,
  cree_par     text,
  maj_par      text,
  cree_le      timestamptz not null default now(),
  maj_le       timestamptz not null default now()
);

-- 4. RLS : le site public ne lit que les lignes actives ; l'admin écrit avec
--    la clé service_role (contournée par RLS)
alter table public.bios              enable row level security;
alter table public.mandats_manuels  enable row level security;
alter table public.fonctions_manuelles enable row level security;

drop policy if exists "lecture publique (actives)" on public.bios;
create policy "lecture publique (actives)" on public.bios for select using (actif);
drop policy if exists "lecture publique (actives)" on public.mandats_manuels;
create policy "lecture publique (actives)" on public.mandats_manuels for select using (actif);
drop policy if exists "lecture publique (actives)" on public.fonctions_manuelles;
create policy "lecture publique (actives)" on public.fonctions_manuelles for select using (actif);

-- 5. Index
create index if not exists idx_bios_personne             on public.bios (personne_id);
create index if not exists idx_mandats_manuels_personne  on public.mandats_manuels (personne_id);
create index if not exists idx_fonctions_manuelles_personne on public.fonctions_manuelles (personne_id);
