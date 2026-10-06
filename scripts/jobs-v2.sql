-- DataParl' Jobs v2 — chambre, élu et département.
-- À exécuter dans le projet Supabase AUTH (SQL editor).
alter table public.job_offers
  add column if not exists chambre text check (chambre in ('an', 'senat', 'pe')),
  add column if not exists elu_prenom text,
  add column if not exists elu_nom text,
  add column if not exists departement text;

create index if not exists job_offers_chambre on public.job_offers (chambre);
