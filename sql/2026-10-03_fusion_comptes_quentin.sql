-- ============================================================================
-- DataParl — Fusion des comptes de l'équipe : quentin@dataparl.fr et
-- quentinduchamp972@gmail.com
-- À exécuter dans le SQL Editor du projet Supabase D'AUTHENTIFICATION
-- (dataparl-auth — AUTH_SUPABASE_URL), PAS dans la base de données `dataparl`.
--
-- Principe : le compte quentin@dataparl.fr (adresse de l'équipe) devient le
-- compte unique. L'ancien compte Gmail est conservé pour l'historique mais
-- désactivé : il ne peut plus se connecter, et son entrée `staff` est marquée
-- inactive. Les deux adresses reçoivent un mail d'information.
-- ============================================================================

-- 0) État des lieux : les deux comptes, leurs rôles et leur activité.
select u.id, u.email, u.created_at, u.last_sign_in_at,
       s.nom, s.role, s.actif as staff_actif, s.doit_changer_mdp
  from auth.users u
  left join public.staff s on s.user_id = u.id
 where u.email in ('quentin@dataparl.fr', 'quentinduchamp972@gmail.com')
 order by u.created_at;

-- 1) Le compte @dataparl.fr est bien actif dans l'équipe.
update public.staff
   set actif = true
 where email = 'quentin@dataparl.fr';

-- 2) L'ancien compte Gmail ne peut plus se connecter (conservé pour
--    l'historique : audit, passkeys, TOTP…). Si vous préférez le supprimer
--    totalement, faites-le depuis le Dashboard Supabase (Authentication →
--    Users) pour que la cascade nettoie staff, passkeys, admin_totp_secrets…
update auth.users
   set banned_until  = 'infinity',
       raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
         || '{"fusionne_dans":"quentin@dataparl.fr","fusion_le":"2026-10-03"}'::jsonb
 where email = 'quentinduchamp972@gmail.com';

-- 3) Son entrée équipe est marquée inactive (elle reste dans la liste pour
--    mémoire, sans accès).
update public.staff
   set actif = false
 where email = 'quentinduchamp972@gmail.com';

-- 4) Vérification finale : un seul compte actif.
select s.email, s.role, s.actif
  from public.staff s
 where s.email in ('quentin@dataparl.fr', 'quentinduchamp972@gmail.com')
 order by s.actif desc;
