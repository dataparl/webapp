-- Liens courts du Daily (dataparl.fr/l/daily et déclinaisons par réseau).
-- À exécuter dans le projet Supabase dataparl-auth (SQL Editor), comme les
-- autres scripts : les clics sont enregistrés par la route /l/[code] et lus
-- dans l'admin (Contenu → Liens courts).
insert into public.liens (code, destination, titre, actif) values
  ('daily',     'https://www.dataparl.fr/daily/', 'Le Daily — mouvements jour par jour', true),
  ('daily-x',   'https://www.dataparl.fr/daily/', 'Le Daily — partage sur X', true),
  ('daily-bsky', 'https://www.dataparl.fr/daily/', 'Le Daily — partage sur Bluesky', true),
  ('daily-wa',  'https://www.dataparl.fr/daily/', 'Le Daily — partage WhatsApp', true)
on conflict (code) do nothing;
