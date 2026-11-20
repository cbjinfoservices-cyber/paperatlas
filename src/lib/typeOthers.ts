/** Le type retenu sur un tableau — métier, genre, rubrique, contrat — et la
    ligne qui annonce, juste dessous, ce que le même périmètre tient encore.
    Elle sert aux trois tableaux, avec leurs propres mots. */
export type OthersKind = 'trades' | 'genres' | 'cats' | 'contracts';

const KEYS: Record<OthersKind, { many: string; one: string }> = {
  trades: { many: 'dir.othersTrades', one: 'dir.othersTradesOne' },
  genres: { many: 'dir.othersGenres', one: 'dir.othersGenresOne' },
  cats: { many: 'ann.othersCats', one: 'ann.othersCatsOne' },
  contracts: { many: 'job.othersContracts', one: 'job.othersContractsOne' },
};

/**
 * Où les autres types sont comptés : la région déjà retenue, son pays, ou le
 * tableau entier quand ni l'une ni l'autre ne resserre la recherche.
 */
export function othersWhere(
  wilaya: string,
  pays: string,
  allKey = 'dir.othersWhereAll',
): string {
  if (wilaya) return 'dir.othersWhereRegion';
  if (pays) return 'dir.othersWhereCountry';
  return allKey;
}

/** La phrase complète, déjà accordée : « 3 autres métiers dans cette région ». */
export function othersLine(
  t: (k: string) => string,
  kind: OthersKind,
  count: number,
  whereKey: string,
): string {
  const { many, one } = KEYS[kind];
  return t(count === 1 ? one : many)
    .replace('{n}', String(count))
    .replace('{where}', t(whereKey));
}