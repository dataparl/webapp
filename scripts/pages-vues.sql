-- Parcours des comptes connectés : pages vues (route seule, sans
-- paramètres), conservées 90 jours (purge dans /api/pages-vues). À exécuter
-- dans le projet Supabase dataparl-auth (SQL Editor).
create table if not exists public.pages_vues (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  chemin text not null check (char_length(chemin) between 1 and 300),
  le timestamptz not null default now()
);

create index if not exists pages_vues_user_le_idx on public.pages_vues (user_id, le desc);
create index if not exists pages_vues_le_idx on public.pages_vues (le);

-- Aucun accès via la clé publique : insertions et lectures uniquement par
-- la clé service_role (API webapp et admin).
alter table public.pages_vues enable row level security;
