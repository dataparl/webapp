-- Alertes : fréquences cumulables (quotidienne ET hebdomadaire).
-- À exécuter dans le projet Supabase dataparl-auth (SQL Editor).
-- L'ancienne colonne frequence est conservée : les réglages existants sont
-- repris automatiquement dans frequences à la prochaine sauvegarde.
alter table public.alert_subscriptions
  add column if not exists frequences text[] not null default '{}';

-- Reprise des réglages existants (une seule fois).
update public.alert_subscriptions
  set frequences = array[frequence]
  where frequences = '{}' and frequence in ('quotidienne', 'hebdomadaire');
