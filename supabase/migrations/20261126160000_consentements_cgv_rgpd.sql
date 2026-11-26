-- Trace des acceptations des CGV et de la politique de confidentialité (RGPD).
-- Écrite uniquement par les Edge Functions avec la clé de service : aucun accès
-- direct pour anon ni authenticated.

create table if not exists public.paperatlas_consentements (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  formulaire text not null,
  version text not null,
  cgv boolean not null,
  rgpd boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists paperatlas_consentements_email_idx
  on public.paperatlas_consentements (email, created_at desc);

alter table public.paperatlas_consentements enable row level security;
revoke all on public.paperatlas_consentements from anon, authenticated;
