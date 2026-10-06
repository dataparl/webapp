-- DataParl' — vue de contournement du bug GoTrue « Database error finding users ».
-- À exécuter dans le projet Supabase AUTH (kuywydrsfuixppchugpe) via le SQL editor.
-- La route /api/admin/users lit cette vue en priorité (PostgREST, clé service) :
-- dès qu'elle existe, les pages Admin → Utilisateurs et Comptes ne dépendent
-- plus de l'API auth.admin.listUsers.

create or replace view public.comptes_utilisateurs as
select
  id,
  email,
  created_at,
  last_sign_in_at,
  user_metadata,
  app_metadata
from auth.users;

comment on view public.comptes_utilisateurs is
  'Contournement du 500 GoTrue listUsers : exposée à la clé service uniquement (aucune politique, aucun accès anon/authenticated).';

-- Exposition minimale : seul le rôle service (utilisé par les routes admin) peut lire.
revoke all on public.comptes_utilisateurs from anon, authenticated;
grant select on public.comptes_utilisateurs to service_role;
