/**
 * Le nombre de jetons posés sur la liste des abonnés, retenu par l'appareil.
 *
 * La console le calcule à chaque geste ; les fiches de compte et l'onglet
 * « Annonces » le relisent quand ils ouvrent leur propre classeur, pour que
 * tous les fichiers exportés le même jour portent le même chiffre — celui de
 * la liste au moment du clic — sans avoir à le recalculer chacun de son côté.
 *
 * Gardé sur l'appareil seulement : c'est un repère de lecture, pas un fait du
 * dossier. Un stockage refusé ramène simplement un compte de zéro.
 */
const CLE = 'paperatlas:admin-jetons-liste';

/** Le compte des jetons tel que la liste l'a laissé, zéro s'il n'a jamais été posé. */
export function readChips(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const brut = window.localStorage.getItem(CLE);
    if (!brut) return 0;
    const value = Number.parseInt(brut, 10);
    if (!Number.isFinite(value) || value < 0) return 0;
    return Math.min(value, 99);
  } catch {
    return 0;
  }
}

/** Retient le compte des jetons posés, pour les classeurs ouverts ailleurs. */
export function saveChips(value: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, String(Math.max(0, Math.round(value))));
  } catch {
    /* Stockage refusé : le compte ne se retient pas, la liste reste juste. */
  }
}