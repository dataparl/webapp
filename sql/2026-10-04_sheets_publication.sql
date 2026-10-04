-- DataParl' Sheets : quelles feuilles du tableur (drive.dataparl.fr) sont
-- publiées en libre accès. À exécuter dans le projet Supabase AUTH
-- (dataparl-auth), aux côtés de pages_etat : lecture publique par la clé
-- publishable, écriture réservée au service_role (l'admin de l'équipe).

create table if not exists public.sheets_publication (
  id text primary key,
  publie boolean not null default false,
  maj_le timestamptz not null default now(),
  maj_par uuid
);

alter table public.sheets_publication enable row level security;

drop policy if exists "lecture publique sheets" on public.sheets_publication;
create policy "lecture publique sheets" on public.sheets_publication
  for select using (true);
-- Pas de policy insert/update/delete : service_role (server-side uniquement).

-- Feuilles publiées à l'ouverture du service (octobre 2026).
insert into public.sheets_publication (id, publie) values
  ('vigiparl-annual-chart', true),
  ('mixiparl-annual-chart', true),
  ('gouvernements-2017-2026', true)
on conflict (id) do nothing;
