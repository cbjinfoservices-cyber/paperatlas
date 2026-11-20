/**
 * Le filtre de la feuille des pays, retenu sur l'appareil comme son ordre :
 * un lecteur qui a réduit la feuille aux seuls rappels urgents la retrouve dans
 * cette lecture à sa prochaine visite, au lieu de revenir au catalogue entier
 * sans l'avoir demandé.
 *
 * Deux lectures sont retenues, et rien d'autre : la feuille entière, ou les
 * seuls rappels qui dépassent le seuil d'urgence. Les autres filtres — plancher,
 * hors fourchette, oublis, retards — ne sont que des visites : ils ne survivent
 * pas à la fermeture de la page, pour ne jamais rouvrir la feuille sur une
 * lecture que personne n'a demandée.
 *
 * Une valeur écrite par une version plus ancienne, ou abîmée, revient à la
 * feuille entière plutôt que de la laisser dans un filtre qu'elle ne sait pas
 * lire.
 */

export type FiltrePaysRetenu = 'tous' | 'urgents';

const CLE = 'paperatlas.pays.filtre';

/** L'ordre retenu, ou la feuille entière quand rien n'a encore été choisi. */
export function lireFiltrePays(): FiltrePaysRetenu {
  if (typeof window === 'undefined') return 'tous';
  try {
    const brut = window.localStorage.getItem(CLE);
    return brut === 'urgents' ? 'urgents' : 'tous';
  } catch {
    return 'tous';
  }
}

/** Écrit le filtre choisi, sans jamais faire échouer la page si le stockage refuse. */
export function memoriserFiltrePays(filtre: FiltrePaysRetenu): void {
  if (typeof window === 'undefined') return;
  try {
    if (filtre === 'tous') {
      window.localStorage.removeItem(CLE);
      return;
    }
    window.localStorage.setItem(CLE, filtre);
  } catch {
    /* stockage indisponible — le choix n'est simplement pas retenu */
  }
}