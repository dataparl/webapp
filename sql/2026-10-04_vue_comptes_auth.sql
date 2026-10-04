-- ============================================================================
-- DataParl — Contournement de l'endpoint GoTrue /admin/users (500 « Database
-- error finding users ») : vue en lecture seule sur les comptes utilisateurs.
-- À exécuter dans le SQL Editor du projet AUTH (kuywydrsfuixppchugpe).
--
-- La route /api/admin/users lit cette vue via PostgREST avec la clé
-- service_role. Si la vue est absente, la route retombe sur l'API GoTrue
-- (auth.admin.listUsers) — le jour où Supabase répare l'endpoint, la vue
-- devient inutile (on peut la supprimer).
--
-- Sécurité : la vue n'est lisible NI par anon NI par authenticated ; seule la
-- clé service_role (serveur de DataParl', jamais exposée) peut l'interroger.
-- ============================================================================

create or replace view public.comptes_utilisateurs as
select
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.raw_user_meta_data as user_metadata,
  u.app_metadata,
  u.banned_until,
  u.deleted_at
from auth.users u;

comment on view public.comptes_utilisateurs is
  'Lecture des comptes utilisateurs pour l''admin DataParl'' (clé service_role uniquement).';

revoke all on public.comptes_utilisateurs from anon, authenticated;

-- Diagnostic au passage : un trigger cassé sur auth.users est la cause la plus
-- fréquente du 500 GoTrue. Cette requête liste les triggers personnels :
--   select event_object_table as table, trigger_name, action_statement
--   from information_schema.triggers
--   where trigger_schema = 'auth';
