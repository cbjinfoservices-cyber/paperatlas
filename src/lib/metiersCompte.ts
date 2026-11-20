import { entreprises } from '@/mocks/entreprises';
import { paysDe } from '@/lib/pays';

export type MetiersCompte = {
  /** La région retenue dans l'adresse, "" quand toutes se lisent. */
  region: string;
  /** Le pays retenu dans l'adresse, "" quand tous se lisent. */
  pays: string;
  /** Un périmètre réduit-il vraiment la liste ? */
  narrowed: boolean;
  /** Une entrée par métier, comptée dans le périmètre retenu. */
  counts: Record<string, number>;
};

/**
 * Combien d'ateliers de chaque métier le périmètre retenu contient.
 *
 * Le pied de page annonce un compte sous chaque porte de métier ; quand une
 * région est choisie, ce compte doit être celui que le lecteur verra vraiment
 * en ouvrant le lien — jamais le total national posé à la place d'un périmètre
 * qui ne le contient plus. La région et le pays se lisent ensemble, puisqu'une
 * région n'existe pas hors de son pays.
 */
export function compteMetiers(region: string, pays: string): MetiersCompte {
  const counts: Record<string, number> = {};
  entreprises.forEach((row) => {
    if (region && row.wilaya !== region) return;
    if (pays && paysDe(row) !== pays) return;
    counts[row.trade] = (counts[row.trade] ?? 0) + 1;
  });
  return {
    region,
    pays,
    narrowed: Boolean(region || pays),
    counts,
  };
}