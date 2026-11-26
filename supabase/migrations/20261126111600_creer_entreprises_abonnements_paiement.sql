-- Crée les tables fiche entreprise et abonnements de paiement absentes de la production.
-- Reprend les définitions de supabase/schema.sql ; additif uniquement (IF NOT EXISTS / OR REPLACE).

begin;

create extension if not exists pgcrypto;

create table if not exists public.paperatlas_entreprises (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  nom text not null,
  metier text not null,
  pays text not null default 'DZ',
  wilaya text not null,
  commune text,
  description text,
  telephone_public text,
  email_public text,
  site_web text,
  publie boolean not null default false,
  mise_en_avant_jusqu_a timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paperatlas_entreprises_public_idx
  on public.paperatlas_entreprises (publie, mise_en_avant_jusqu_a desc, created_at desc);

create table if not exists public.paperatlas_abonnements_paiement (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prestataire text not null check (prestataire in ('stripe', 'paypal')),
  formule text not null check (formule in ('mensuel', 'trimestriel', 'semestre', 'annee')),
  statut text not null default 'pending'
    check (statut in ('pending', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  devise text not null,
  montant numeric(14, 3) not null check (montant > 0),
  prestataire_client_id text,
  prestataire_abonnement_id text unique,
  session_paiement_id text,
  checkout_url text,
  checkout_expire_a timestamptz,
  essai_jours_choisis integer not null default 0 check (essai_jours_choisis between 0 and 90),
  essai_debut timestamptz,
  essai_fin timestamptz,
  periode_debut timestamptz,
  periode_fin timestamptz,
  annulation_fin_periode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paperatlas_abonnements_paiement_user_idx
  on public.paperatlas_abonnements_paiement (user_id, created_at desc);
create unique index if not exists paperatlas_abonnements_essai_unique_idx
  on public.paperatlas_abonnements_paiement (user_id)
  where essai_debut is not null;
create unique index if not exists paperatlas_abonnements_pending_unique_idx
  on public.paperatlas_abonnements_paiement (user_id)
  where statut = 'pending';

create or replace function public.proteger_mise_en_avant_entreprise()
returns trigger
language plpgsql
as $$
begin
  if auth.role() is distinct from 'service_role' then
    if tg_op = 'INSERT' and new.mise_en_avant_jusqu_a is not null then
      raise exception 'La mise en avant est gérée par le service d’abonnement.';
    end if;
    if tg_op = 'UPDATE'
      and new.mise_en_avant_jusqu_a is distinct from old.mise_en_avant_jusqu_a then
      raise exception 'La mise en avant est gérée par le service d’abonnement.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists paperatlas_entreprises_proteger_mise_en_avant
  on public.paperatlas_entreprises;
create trigger paperatlas_entreprises_proteger_mise_en_avant
  before insert or update on public.paperatlas_entreprises
  for each row execute function public.proteger_mise_en_avant_entreprise();

alter table public.paperatlas_entreprises enable row level security;
alter table public.paperatlas_abonnements_paiement enable row level security;

drop policy if exists "entreprises_directory_read" on public.paperatlas_entreprises;
create policy "entreprises_directory_read" on public.paperatlas_entreprises
  for select to anon, authenticated
  using (publie or auth.uid() = user_id);

drop policy if exists "entreprises_own_write" on public.paperatlas_entreprises;
create policy "entreprises_own_write" on public.paperatlas_entreprises
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select on public.paperatlas_entreprises to anon, authenticated;
grant insert, update, delete on public.paperatlas_entreprises to authenticated;

drop policy if exists "abonnements_paiement_own_read" on public.paperatlas_abonnements_paiement;
create policy "abonnements_paiement_own_read" on public.paperatlas_abonnements_paiement
  for select to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.paperatlas_abonnements_paiement from anon, authenticated;
grant select on public.paperatlas_abonnements_paiement to authenticated;

grant select, insert, update, delete on public.paperatlas_entreprises to service_role;
grant select, insert, update, delete on public.paperatlas_abonnements_paiement to service_role;

commit;
