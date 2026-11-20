import { entreprises, type Trade } from '@/mocks/entreprises';

/**
 * Les six familles que la page Arabe World annonce sous « 6 métiers ».
 *
 * Elles sont écrites une seule fois ici : la page Arabe World les déplie en
 * cartes, le plan du site les nomme comme portes, et les pages de type
 * ramènent à la carte dont la visite est partie. Une famille ajoutée ici
 * apparaît donc dans les trois endroits sans qu'on puisse en oublier un — et
 * l'ancre de la carte (`fam-<type>`) est écrite de la même façon partout.
 */
export const WORLD_FAMILIES: Array<{ trade: Trade; icon: string }> = [
  { trade: 'impression', icon: 'ri-printer-line' },
  { trade: 'edition', icon: 'ri-book-2-line' },
  { trade: 'librairie', icon: 'ri-store-2-line' },
  { trade: 'faconnage', icon: 'ri-scissors-cut-line' },
  { trade: 'communication', icon: 'ri-megaphone-line' },
  { trade: 'fournisseurs', icon: 'ri-truck-line' },
];

/**
 * La clef d'adresse qui resserre la bande des portes sur les familles
 * absentes du pays lu. Le compteur de l'en-tête de la carte l'écrit, la bande
 * la lit : les deux surfaces ne peuvent pas se contredire. Un second appui
 * l'efface, et les huit portes reviennent.
 */
export const FAM_ABSENT_PARAM = 'cmapsAbsent';

/**
 * La clef d'adresse qui resserre la grille des cartes de pays sur les seuls
 * pays où le métier lu sur une page de type n'a aucun atelier. Le compteur de
 * l'en-tête de la carte l'écrit, la grille la lit : les deux surfaces ne
 * peuvent pas se contredire, et un lien copié rouvre la même grille resserrée.
 * Un second appui l'efface, et les vingt-deux pays reviennent.
 */
export const SANS_METIER_PARAM = 'cmapsSansMetier';

/** L'ancre d'une famille sur la page Arabe World. */
export function ancreFamille(trade: string): string {
  return trade ? `fam-${trade}` : '';
}

/**
 * Les huit familles de l'annuaire, portes de la bande posée sous la carte du
 * monde — bibliothèques et écrivains compris.
 *
 * La page Arabe World n'en nomme que six ; la bande sous la carte les nomme
 * toutes, parce que la carte d'un pays compte aussi ses fonds et ses plumes.
 * Le compteur des familles jamais ouvertes lit la même liste : une famille
 * ajoutée ici paraîtrait dans la bande et dans le compte, sans qu'on puisse
 * en oublier une.
 */
/**
 * Combien de pays du répertoire tiennent chaque famille : une porte de la
 * bande resserrée ne dit pas seulement son compte resté à zéro, elle dit
 * dans combien de pays du monde sa famille est réellement tenue. Lu sur tout
 * le répertoire, jamais sur le pays sélectionné — c'est justement le pays qui
 * manque.
 */
export const FAMILLE_PAYS: Record<string, number> = (() => {
  const sets: Record<string, Set<string>> = {};
  entreprises.forEach((fiche) => {
    const code = fiche.pays || 'DZ';
    const pays = sets[fiche.trade] ?? new Set<string>();
    pays.add(code);
    sets[fiche.trade] = pays;
  });
  const counts: Record<string, number> = {};
  Object.entries(sets).forEach(([trade, pays]) => {
    counts[trade] = pays.size;
  });
  return counts;
})();

/** Dans combien de pays du monde une famille est tenue. */
export function paysTenusParFamille(trade: string): number {
  return FAMILLE_PAYS[trade] ?? 0;
}

export const ANNUAIRE_FAMILLES: Array<{ trade: Trade; icon: string }> = [
  { trade: 'impression', icon: 'ri-printer-line' },
  { trade: 'edition', icon: 'ri-book-2-line' },
  { trade: 'librairie', icon: 'ri-store-2-line' },
  { trade: 'faconnage', icon: 'ri-scissors-cut-line' },
  { trade: 'communication', icon: 'ri-megaphone-line' },
  { trade: 'fournisseurs', icon: 'ri-truck-line' },
  { trade: 'bibliotheque', icon: 'ri-bookmark-3-line' },
  { trade: 'ecrivain', icon: 'ri-quill-pen-line' },
];