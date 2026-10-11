-- Abonnés WhatsApp du DataParl' Daily — opt-in explicite depuis /daily/wa
-- (voir app/api/chaine-wa/route.ts). Seul le numéro est demandé ; le hash
-- SHA-256 du jeton de désinscription à un clic est stocké, jamais le jeton.
create table if not exists wa_abonnes (
  tel        text primary key,          -- format international sans « + » : 33612345678
  jeton_hash text not null,            -- SHA-256 du jeton de désinscription
  actif      boolean not null default true,
  cree_le    timestamptz not null default now()
);

-- Aucune politique publique : la table n'est accessible que via la clé
-- service_role (API serveur), comme les autres tables d'application.
alter table wa_abonnes enable row level security;
