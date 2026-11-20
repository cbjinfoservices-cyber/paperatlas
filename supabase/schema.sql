-- PaperAtlas — Schéma complet Supabase (tables, vue, fonctions RPC, buckets Storage, RLS)
-- À exécuter dans : Supabase Dashboard -> SQL Editor -> New query -> Run

create extension if not exists pgcrypto;

-- ============================================================================
-- 1. TABLES PRINCIPALES
-- ============================================================================

create table if not exists public.paperatlas_comptes (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nom text,
  organisme text,
  metier text,
  wilaya text,
  pays text default 'DZ',
  telephone text,
  langue text default 'fr',
  role text not null default 'pro',
  role_changed_at timestamptz,
  cv_url text,
  cv_path text,
  bio text,
  titre text,
  formule text default 'mensuel',
  etablissements integer,
  auteur_id text,
  entreprise_id text,
  b2b_alertes_email boolean default true,
  b2b_motif_defaut text,
  b2b_objectif_motif integer,
  b2b_wait_goal_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists paperatlas_comptes_auteur_uidx
  on public.paperatlas_comptes (auteur_id)
  where auteur_id is not null;

create table if not exists public.paperatlas_membres (
  id uuid primary key references auth.users(id) on delete cascade,
  nom text not null,
  organisme text,
  metier text,
  wilaya text,
  pays text default 'DZ',
  role text not null default 'pro',
  titre text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paperatlas_annonces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  kind text not null default 'annonce',
  rubrique text,
  titre text not null,
  organisation text,
  budget text,
  pays text default 'DZ',
  wilaya text,
  commune text,
  email text,
  telephone text,
  description text,
  statut text not null default 'en_attente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paperatlas_annonces_statut_idx
  on public.paperatlas_annonces (statut, created_at desc);

create table if not exists public.paperatlas_candidatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offre_id text not null,
  offre_titre text not null,
  entreprise text,
  entreprise_user_id uuid references auth.users(id) on delete set null,
  candidat_nom text,
  candidat_email text,
  telephone text,
  cv_url text,
  cv_path text,
  message text,
  statut text not null default 'recue',
  note_employeur text,
  accuse_at timestamptz,
  decision_envoyee_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists paperatlas_candidatures_unique_idx
  on public.paperatlas_candidatures (user_id, offre_id);

create table if not exists public.paperatlas_candidature_vues (
  candidature_id uuid not null references public.paperatlas_candidatures(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (candidature_id, user_id)
);

create table if not exists public.paperatlas_accuse_renvois (
  id uuid primary key default gen_random_uuid(),
  candidature_id uuid references public.paperatlas_candidatures(id) on delete cascade,
  destinataire text,
  auteur text,
  declencheur text,
  candidat_nom text,
  offre_titre text,
  entreprise text,
  statut text not null,
  motif text,
  sent_at timestamptz not null default now()
);

create table if not exists public.paperatlas_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct',
  sujet text,
  offre_id text,
  candidature_id uuid references public.paperatlas_candidatures(id) on delete set null,
  user_a uuid not null references auth.users(id) on delete cascade,
  user_b uuid not null references auth.users(id) on delete cascade,
  nom_a text,
  nom_b text,
  lu_a timestamptz,
  lu_b timestamptz,
  last_message text,
  last_at timestamptz default now(),
  origine text default '',
  created_at timestamptz not null default now()
);

create index if not exists paperatlas_conversations_users_idx
  on public.paperatlas_conversations (user_a, user_b, last_at desc);

create table if not exists public.paperatlas_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.paperatlas_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  corps text not null,
  created_at timestamptz not null default now()
);

create index if not exists paperatlas_messages_conv_idx
  on public.paperatlas_messages (conversation_id, created_at asc);

create table if not exists public.paperatlas_demandes_b2b (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  dest_id text not null,
  dest_name text,
  user_id uuid references auth.users(id) on delete set null,
  nom text not null,
  email text not null,
  telephone text,
  organisme text,
  quantite text,
  delai text,
  budget text,
  message text not null,
  nature text not null default 'b2b',
  piece_cdc_path text,
  piece_bordereau_path text,
  statut text not null default 'nouvelle',
  motif text,
  motif_lot_at timestamptz,
  motif_lot_cleared text,
  motif_lot_clear_at timestamptz,
  motif_lot_clear_count integer default 0,
  snooze_at timestamptz,
  rappel_at timestamptz,
  traitee_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paperatlas_demandes_b2b_ref_idx
  on public.paperatlas_demandes_b2b (reference);
create index if not exists paperatlas_demandes_b2b_dest_idx
  on public.paperatlas_demandes_b2b (dest_id, created_at desc);

create table if not exists public.paperatlas_b2b_objectif_historique (
  id uuid primary key default gen_random_uuid(),
  compte_id uuid not null references auth.users(id) on delete cascade,
  objectif integer,
  changed_at timestamptz not null default now()
);

create table if not exists public.paperatlas_devis_abonnement (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  nom text not null,
  email text not null,
  telephone text,
  organisation text,
  formule text not null,
  formule_id text,
  etablissements integer default 1,
  marche text,
  marche_code text,
  devise text,
  rythme text,
  montant_mensuel numeric,
  montant_total numeric,
  mise_en_route numeric,
  resume text,
  message text,
  source text,
  lang text default 'fr',
  statut_notifie text default 'recu',
  recap_sent_at timestamptz,
  relance_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paperatlas_formules_journal (
  id uuid primary key default gen_random_uuid(),
  compte_id uuid not null references auth.users(id) on delete cascade,
  nom text,
  organisme text,
  formule_avant text,
  formule_apres text,
  rythme text,
  created_at timestamptz not null default now()
);

create table if not exists public.abonnements (
  id uuid primary key default gen_random_uuid(),
  artisan_id text,
  entreprise text,
  email text,
  metier text,
  ville text,
  offre text,
  statut text default 'actif',
  montant_mensuel numeric,
  canal_paiement text,
  date_debut timestamptz,
  date_echeance timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.parametres_app (
  id uuid primary key default gen_random_uuid(),
  essai_jours integer not null default 14,
  suivi_appel_heures integer not null default 48,
  updated_by text,
  updated_at timestamptz not null default now()
);

insert into public.parametres_app (essai_jours, suivi_appel_heures)
select 14, 48
where not exists (select 1 from public.parametres_app);

create table if not exists public.demandes_formulaires (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'contact',
  nom text not null,
  email text not null,
  telephone text default '',
  champs jsonb default '{}'::jsonb,
  traitee boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- 2. VUE D'AGRÉGATION (lecture publique anonyme des formules)
-- ============================================================================

create or replace view public.paperatlas_formules_tally as
select
  formule,
  count(*)::integer as total
from public.paperatlas_comptes
where formule is not null
group by formule;

grant select on public.paperatlas_formules_tally to anon, authenticated;

-- ============================================================================
-- 3. FONCTIONS RPC (rattachement d'une fiche d'auteur)
-- ============================================================================

create or replace function public.rattacher_auteur(p_auteur text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_fiche text := trim(coalesce(p_auteur, ''));
  v_owner uuid;
begin
  if v_uid is null then
    return 'auth';
  end if;
  if v_fiche = '' then
    return 'none';
  end if;

  select id into v_owner
  from public.paperatlas_comptes
  where auteur_id = v_fiche
  limit 1;

  if v_owner is not null and v_owner <> v_uid then
    return 'taken';
  end if;

  update public.paperatlas_comptes
  set auteur_id = v_fiche,
      updated_at = now()
  where id = v_uid;

  return 'ok';
end;
$$;

create or replace function public.detacher_auteur()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return 'auth';
  end if;

  update public.paperatlas_comptes
  set auteur_id = null,
      updated_at = now()
  where id = v_uid;

  return 'ok';
end;
$$;

grant execute on function public.rattacher_auteur(text) to authenticated;
grant execute on function public.detacher_auteur() to authenticated;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.paperatlas_comptes enable row level security;
alter table public.paperatlas_membres enable row level security;
alter table public.paperatlas_annonces enable row level security;
alter table public.paperatlas_candidatures enable row level security;
alter table public.paperatlas_candidature_vues enable row level security;
alter table public.paperatlas_accuse_renvois enable row level security;
alter table public.paperatlas_conversations enable row level security;
alter table public.paperatlas_messages enable row level security;
alter table public.paperatlas_demandes_b2b enable row level security;
alter table public.paperatlas_b2b_objectif_historique enable row level security;
alter table public.paperatlas_devis_abonnement enable row level security;
alter table public.paperatlas_formules_journal enable row level security;
alter table public.abonnements enable row level security;
alter table public.parametres_app enable row level security;
alter table public.demandes_formulaires enable row level security;

-- paperatlas_comptes : chaque utilisateur gère uniquement sa propre ligne
drop policy if exists "comptes_own_all" on public.paperatlas_comptes;
create policy "comptes_own_all" on public.paperatlas_comptes
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- paperatlas_membres : lecture publique, écriture par le titulaire
drop policy if exists "membres_public_read" on public.paperatlas_membres;
create policy "membres_public_read" on public.paperatlas_membres
  for select to anon, authenticated
  using (true);

drop policy if exists "membres_own_write" on public.paperatlas_membres;
create policy "membres_own_write" on public.paperatlas_membres
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- paperatlas_annonces : annonces publiées visibles par tous ; l'auteur voit/gère les siennes
drop policy if exists "annonces_public_read" on public.paperatlas_annonces;
create policy "annonces_public_read" on public.paperatlas_annonces
  for select to anon, authenticated
  using (statut = 'publie' or auth.uid() = user_id);

drop policy if exists "annonces_insert_any" on public.paperatlas_annonces;
create policy "annonces_insert_any" on public.paperatlas_annonces
  for insert to anon, authenticated
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "annonces_own_update_delete" on public.paperatlas_annonces;
create policy "annonces_own_update_delete" on public.paperatlas_annonces
  for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "annonces_own_delete" on public.paperatlas_annonces;
create policy "annonces_own_delete" on public.paperatlas_annonces
  for delete to authenticated
  using (auth.uid() = user_id);

-- paperatlas_candidatures : candidat + employeur concerné
drop policy if exists "candidatures_read" on public.paperatlas_candidatures;
create policy "candidatures_read" on public.paperatlas_candidatures
  for select to authenticated
  using (auth.uid() = user_id or auth.uid() = entreprise_user_id);

drop policy if exists "candidatures_insert" on public.paperatlas_candidatures;
create policy "candidatures_insert" on public.paperatlas_candidatures
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "candidatures_employer_update" on public.paperatlas_candidatures;
create policy "candidatures_employer_update" on public.paperatlas_candidatures
  for update to authenticated
  using (auth.uid() = entreprise_user_id)
  with check (auth.uid() = entreprise_user_id);

-- paperatlas_candidature_vues : vues propres au candidat
drop policy if exists "candidature_vues_own" on public.paperatlas_candidature_vues;
create policy "candidature_vues_own" on public.paperatlas_candidature_vues
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- paperatlas_conversations : participants A ou B
drop policy if exists "conversations_participants" on public.paperatlas_conversations;
create policy "conversations_participants" on public.paperatlas_conversations
  for all to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b)
  with check (auth.uid() = user_a or auth.uid() = user_b);

-- paperatlas_messages : participants de la conversation
drop policy if exists "messages_participants" on public.paperatlas_messages;
create policy "messages_participants" on public.paperatlas_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.paperatlas_conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

drop policy if exists "messages_send" on public.paperatlas_messages;
create policy "messages_send" on public.paperatlas_messages
  for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.paperatlas_conversations c
      where c.id = conversation_id
        and (c.user_a = auth.uid() or c.user_b = auth.uid())
    )
  );

-- paperatlas_formules_journal : lecture/écriture par son titulaire
drop policy if exists "formules_journal_own" on public.paperatlas_formules_journal;
create policy "formules_journal_own" on public.paperatlas_formules_journal
  for all to authenticated
  using (auth.uid() = compte_id)
  with check (auth.uid() = compte_id);

-- ============================================================================
-- 5. STORAGE BUCKETS (privés)
-- ============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cvs-candidats', 'cvs-candidats', false, 5242880, array['application/pdf']),
  ('marches-pieces', 'marches-pieces', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

drop policy if exists "cvs_own_upload" on storage.objects;
create policy "cvs_own_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'cvs-candidats' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cvs_own_read" on storage.objects;
create policy "cvs_own_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs-candidats' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "cvs_own_delete" on storage.objects;
create policy "cvs_own_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cvs-candidats' and (storage.foldername(name))[1] = auth.uid()::text);
