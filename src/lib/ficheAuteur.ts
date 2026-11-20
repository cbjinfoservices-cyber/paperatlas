import { supabase } from '@/lib/supabase';

/**
 * Ce que le serveur répond quand un compte désigne sa fiche d'auteur :
 * « ok » la fiche est à lui, « taken » elle appartient déjà à un autre
 * compte, « none » il n'a rien à rattacher, « auth » il n'est pas connecté,
 * « net » la requête n'a pas abouti.
 */
export type AuteurLinkIssue = 'taken' | 'net';

/**
 * Le rattachement se fait sur le compte lui-même, et sur lui seul : la
 * fonction serveur vérifie qu'aucun autre compte ne tient déjà cette fiche,
 * puis écrit l'identifiant de la fiche sur la ligne du compte. Elle ne rend
 * jamais une adresse, seulement le résultat du geste.
 */
export async function rattacherAuteur(auteurId: string): Promise<AuteurLinkIssue | null> {
  const fiche = (auteurId ?? '').trim();
  if (!fiche) return null;
  try {
    const { data, error } = await supabase.rpc('rattacher_auteur', { p_auteur: fiche });
    if (error) return 'net';
    const status = typeof data === 'string' ? data : '';
    if (status === 'ok') return null;
    if (status === 'taken') return 'taken';
    return 'net';
  } catch {
    return 'net';
  }
}

/** Détacher sa fiche : le compte redevient libre d'en désigner une autre. */
export async function detacherAuteur(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('detacher_auteur');
    if (error) return false;
    return (typeof data === 'string' ? data : '') === 'ok';
  } catch {
    return false;
  }
}