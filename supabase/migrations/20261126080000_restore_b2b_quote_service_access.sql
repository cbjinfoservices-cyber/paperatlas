begin;

-- Restore only the server-side access required by the B2B and quote functions.
-- Public grants and RLS policies remain unchanged.
grant select, update on public.paperatlas_comptes to service_role;
grant select, insert on public.paperatlas_b2b_objectif_historique to service_role;
grant select, insert, update on public.paperatlas_demandes_b2b,
  public.paperatlas_devis_abonnement to service_role;

commit;
