-- Coordonnées optionnelles de la fiche entreprise, saisies dans le formulaire.
-- Sans coordonnées, la carte place la fiche au centre de sa wilaya.
alter table public.paperatlas_entreprises
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.paperatlas_entreprises
  drop constraint if exists paperatlas_entreprises_latitude_check,
  add constraint paperatlas_entreprises_latitude_check check (latitude is null or latitude between -90 and 90),
  drop constraint if exists paperatlas_entreprises_longitude_check,
  add constraint paperatlas_entreprises_longitude_check check (longitude is null or longitude between -180 and 180);
