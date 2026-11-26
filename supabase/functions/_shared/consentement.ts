import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Version des CGV et de la politique de confidentialité acceptées : à relever à chaque changement de texte. */
export const VERSION_CONSENTEMENT = '2026-11';

/** Le formulaire envoie `consentement: { cgv: true, rgpd: true }`. Toute autre valeur est refusée. */
export function consentementAccepte(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false;
  const { cgv, rgpd } = raw as Record<string, unknown>;
  return cgv === true && rgpd === true;
}

/** Trace l'acceptation (adresse, formulaire, version, date). Un échec d'écriture ne bloque pas la demande. */
export async function journaliserConsentement(
  admin: SupabaseClient,
  params: { email: string; formulaire: string; userId?: string | null },
): Promise<void> {
  const { error } = await admin.from('paperatlas_consentements').insert({
    email: params.email,
    formulaire: params.formulaire,
    user_id: params.userId ?? null,
    version: VERSION_CONSENTEMENT,
    cgv: true,
    rgpd: true,
  });
  if (error) console.error('consentement non journalisé', error.message);
}
