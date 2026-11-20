import { readRelanceAt } from './adminRelanceMemory';
import type { AdminAnnonce } from './adminTypes';

/**
 * Les dépôts arrivés après la relance préparée, comptés par compte.
 *
 * Une seule lecture pour le compteur du haut, le jeton qui réduit les listes,
 * le tri de la seconde table, la colonne de la fiche et le classeur : la date
 * de relance vient de la mémoire de cet appareil, les dépôts des mêmes lignes
 * que l'onglet « Annonces ». Aucun chiffre n'est tenu à part.
 */
export function apresRelanceParEmail(
  annonces: AdminAnnonce[],
  adresses: Iterable<string | null | undefined>,
): Map<string, number> {
  const stamps = new Map<string, number>();
  for (const adresse of adresses) {
    const cle = (adresse || '').trim().toLowerCase();
    if (!cle || stamps.has(cle)) continue;
    const stamp = new Date(readRelanceAt(cle) || '').getTime();
    if (Number.isFinite(stamp)) stamps.set(cle, stamp);
  }

  const counts = new Map<string, number>();
  if (stamps.size === 0) return counts;

  annonces.forEach((depot) => {
    const cle = (depot.email || '').trim().toLowerCase();
    const stamp = stamps.get(cle);
    if (stamp === undefined) return;
    const depotStamp = new Date(depot.created_at || '').getTime();
    if (!Number.isFinite(depotStamp) || depotStamp <= stamp) return;
    counts.set(cle, (counts.get(cle) ?? 0) + 1);
  });

  return counts;
}

/**
 * Le rang d'un compte parmi ceux dont un dépôt est arrivé après la relance :
 * le premier est celui que le message a le moins couvert. `null` quand le
 * compte n'a rien déposé depuis son message — il n'y a alors pas de rang à
 * annoncer.
 */
export function rangApresRelance(
  n: number,
  counts: Map<string, number>,
): { rang: number; total: number } | null {
  if (n <= 0) return null;
  let rang = 1;
  counts.forEach((value) => {
    if (value > n) rang += 1;
  });
  return { rang, total: counts.size };
}