-- ============================================================================
-- DataParl' — Carnet presse : journalistes issus des réutilisations de Datan
-- À exécuter dans le SQL Editor du projet AUTH (kuywydrsfuixppchugpe).
--
-- 21 contacts avec byline, e-mail au format standard de la rédaction
-- (inféré, non vérifié individuellement — sauf mentions en notes).
-- Idempotent : les adresses déjà présentes ne sont ni dupliquées ni modifiées
-- (on conflict email do nothing).
-- ============================================================================

insert into public.presse_contacts (prenom, nom, media, email, notes)
values
  ('Clément',      'Guillou',       'Le Monde',                 'clement.guillou@lemonde.fr',        'Décodeurs — article RN juin 2023'),
  ('Laure',        'Cometti',       'franceinfo',               'laure.cometti@francetv.fr',          '3 graphiques données Datan, juin 2025'),
  ('Mathieu',      'Lehot-Couette', 'franceinfo',               'mathieu.lehot-couette@francetv.fr',  'co-signataire Cometti'),
  ('Ariel',        'Guez',          'BFM TV',                   'ariel.guez@rmcbfm.com',             'infographie groupes AN, juillet 2022 ; format fusion RMC-BFM'),
  ('Théophile',    'Magoria',       'BFM TV',                   'theophile.magoria@rmcbfm.com',      'infographie groupes AN, juillet 2022 ; byline à confirmer'),
  ('Alexandre',    'Sulzer',        'Le Parisien',              'alexandre.sulzer@leparisien.fr',    'radiographie groupe LR, octobre 2022'),
  ('Quentin',      'Laurent',       'Le Parisien',              'quentin.laurent@leparisien.fr',     'co-signataire Sulzer'),
  ('Sébastien',    'Tronche',       'Libération',               'sebastien.tronche@liberation.fr',   'Chez Pol — Pradié, décembre 2022'),
  ('Renée-Laure',  'Euzen',         'Ouest-France',             'renee-laure.euzen@ouest-france.fr', 'bilan Bothorel, juin 2022'),
  ('Benoît',       'Roux',          'France 3',                 'benoit.roux@francetv.fr',            'France 3 Occitanie — top 5 activité AN, juin 2022'),
  ('Barthélémy',   'Philippe',      'Capital',                  'barthelemy.philippe@capital.fr',     'classement députés actifs, juin 2022'),
  ('Thibaut',      'Le Gal',        '20 Minutes',               'thibaut.legal@20minutes.fr',        'RN juin 2023 ; sinon thibaut.le-gal@ à tester'),
  ('Maïwenn',      'Bordron',       'Ici Mayenne (Radio France)','maiwenn.bordron@radiofrance.com',  'Favennec participation votes, février 2025'),
  ('Gwendal',      'Hameury',       'Le Télégramme',            'gwendal.hameury@letelegramme.fr',   'bilan Le Feur, juin 2022'),
  ('Lou',          'Fritel',        'Marianne',                 'lou.fritel@marianne.net',           'Macronie saison 1, 2022'),
  ('Vincent',      'Geny',          'Marianne',                 'vincent.geny@marianne.net',         'co-signataire Fritel'),
  ('Sébastien',    'Dubois',        'Le Populaire du Centre',   'sebastien.dubois@lepopulaire.fr',   'bilan députés LREM Haute-Vienne, mai 2022'),
  ('Sébastien',    'Bouchereau',    'Le Petit Bleu',            'sebastien.bouchereau@petitbleu.fr', 'bilan Lauzzana, juin 2022'),
  ('Arthur',       'Cesbron',       'La Montagne',              'arthur.cesbron@lamontagne.fr',      'bilan députés Puy-de-Dôme, juin 2022'),
  ('Annalivia',    'Lacoste',       'Terra Nova',               'annalivia.lacoste@terra-nova.fr',   'think tank — LR, Ciotti, Grande Conversation'),
  ('Jérémy',       'Pastouret',     'Les Énovateurs',           'jeremy.pastouret@les-enovateurs.com','association — e-mail à vérifier avant campagne')
on conflict (email) do nothing;

-- Vérification : le carnet après import.
-- select media, nom, prenom, email, actif from public.presse_contacts order by media, nom;
