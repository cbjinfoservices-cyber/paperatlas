/**
 * L'ordre de la feuille des pays, retenu sur l'appareil comme le pays lui-même :
 * un lecteur qui a classé les marchés par économie annuelle — ou remonté en tête
 * ceux dont l'adresse est déjà partie — retrouve ce même ordre à sa prochaine
 * visite, au lieu de revenir au catalogue sans l'avoir demandé.
 *
 * Trois ordres existent, et rien d'autre : le catalogue tel qu'il est tenu, les
 * marchés classés par ce que l'année leur économise, ou les marchés déjà servis
 * d'abord. Une valeur écrite par une version plus ancienne, ou abîmée, revient au
 * catalogue plutôt que de laisser la feuille dans un ordre qu'elle ne sait pas
 * lire.
 */

export type TriPays = 'catalogue' | 'economie' | 'servis' | 'retard';

const CLE = 'paperatlas.pays.tri';

/** Vrai seulement pour les ordres que la feuille sait dérouler. */
export function estTriPays(valeur: string | null | undefined): valeur is TriPays {
  return (
    valeur === 'catalogue' ||
    valeur === 'economie' ||
    valeur === 'servis' ||
    valeur === 'retard'
  );
}

/** L'ordre retenu, ou le catalogue quand rien n'a encore été choisi. */
export function lireTriPays(): TriPays {
  if (typeof window === 'undefined') return 'catalogue';
  try {
    const brut = window.localStorage.getItem(CLE);
    return estTriPays(brut) ? brut : 'catalogue';
  } catch {
    return 'catalogue';
  }
}

/** Écrit l'ordre choisi, sans jamais faire échouer la page si le stockage refuse. */
export function memoriserTriPays(tri: TriPays): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CLE, tri);
  } catch {
    /* stockage indisponible — le choix n'est simplement pas retenu */
  }
}