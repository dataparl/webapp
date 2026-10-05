-- DataParl' Jobs — table des offres d'emploi (phase interne).
-- À exécuter dans le projet Supabase de la base équipe (SQL editor).
-- Aucune politique RLS : la table n'est accessible que via la clé service
-- (routes d'admin) ; rien n'est public tant que la bascule sur le dépôt dédié
-- n'a pas eu lieu.

create table if not exists public.job_offers (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique,
  titre text not null,
  description text not null default '',
  type_poste text,
  localisation text,
  groupe_politique text,
  parlementaire_slug text,
  source_url text not null,
  source_connector text not null default 'manuel',
  source_raw text,
  publie_le date,
  expire_le date,
  statut text not null default 'active' check (statut in ('active', 'expiree', 'pourvue', 'rejetee')),
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected')),
  review_note text,
  match_confidence real,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_offers enable row level security;

create index if not exists job_offers_revue on public.job_offers (review_status, created_at);
create index if not exists job_offers_statut on public.job_offers (statut, publie_le desc);
