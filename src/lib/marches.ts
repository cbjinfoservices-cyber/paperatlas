import { auteurs } from '@/mocks/auteurs';
import { entreprises } from '@/mocks/entreprises';
import { paysDe } from '@/lib/pays';

/**
 * The four markets read side by side on the home page, on the tariff sheet and
 * anywhere else a country has to be chosen with one click. The key carries the
 * city as it is written in each reading language.
 */
export type Marche = { code: string; cle: string };

export const marches: Marche[] = [
  { code: 'DZ', cle: 'mk.alger' },
  { code: 'TN', cle: 'mk.tunis' },
  { code: 'EG', cle: 'mk.caire' },
  { code: 'SA', cle: 'mk.riyad' },
];

/** One row of a board, read only for the country it declares. */
export type DepotPays = { pays?: string | null };

/**
 * The sheets the directory itself carries: the workshops and the pens, counted
 * on the country they declare. It is known before any request, so a chip always
 * has a figure to show, even while the boards are still being read.
 */
export function fichesAnnuaire(): Record<string, number> {
  const counts: Record<string, number> = {};
  [...entreprises, ...auteurs].forEach((fiche) => {
    const code = paysDe(fiche);
    counts[code] = (counts[code] ?? 0) + 1;
  });
  return counts;
}

/**
 * The deposits published on the Annonces and Emplois boards, counted on their
 * country as well. A board deposit is a sheet like any other: the chip must say
 * how much a market really holds, not only what the directory lists.
 */
export function compterDepots(rows: readonly DepotPays[]): Record<string, number> {
  const counts: Record<string, number> = {};
  rows.forEach((row) => {
    const code = paysDe(row);
    counts[code] = (counts[code] ?? 0) + 1;
  });
  return counts;
}

/** Two tallies added together, without mutating either of them. */
export function additionner(
  base: Record<string, number>,
  extra: Record<string, number>,
): Record<string, number> {
  const total: Record<string, number> = { ...base };
  Object.entries(extra).forEach(([code, n]) => {
    total[code] = (total[code] ?? 0) + n;
  });
  return total;
}