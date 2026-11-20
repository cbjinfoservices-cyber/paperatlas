import { entreprises, trades, type Trade } from '@/mocks/entreprises';
import { paysArabes, paysDe, tallyPays, type PaysCount } from '@/lib/pays';

/**
 * Les pays du monde arabe où un métier n'a aucun atelier, dans l'ordre de la
 * liste des pays. Lu sur tout le répertoire, jamais sur une sélection filtrée :
 * c'est le manque du métier qui se nomme, non celui d'une vue en cours. La page
 * d'un type en pose la liste sous son titre, et la carte du monde en compte les
 * pays avant qu'on n'en ouvre un.
 */
export function paysSansTrade(trade: Trade | string): string[] {
  if (!trade) return [];
  return paysArabes
    .filter((pays) => !entreprises.some((e) => e.trade === trade && paysDe(e) === pays.code))
    .map((pays) => pays.code);
}

/**
 * Les pages de pays d'un type d'établissement : combien d'ateliers chaque pays
 * tient pour ce type, le plus fourni d'abord. C'est la liste que le pied de
 * page pose sous chaque famille — un lien direct vers /annuaire/imprimeries/
 * algerie, sans repasser par les filtres —, et celle dont la page d'un type
 * ouvre déjà les portes.
 */
export function paysParTrade(trade: Trade | string): PaysCount[] {
  if (!trade) return [];
  return tallyPays(entreprises.filter((e) => e.trade === trade));
}

/** Toutes les familles qui ont au moins une page de pays, dans l'ordre du menu. */
export function famillesAvecPays(): Array<{ trade: Trade; pays: PaysCount[] }> {
  return trades
    .map((trade) => ({ trade, pays: paysParTrade(trade) }))
    .filter((row) => row.pays.length > 0);
}

export type RegionActive = { wilaya: string; count: number };

/**
 * La région unique où une famille est tenue dans un pays, ou null quand elle
 * en occupe plusieurs — c'est la même réponse que la carte d'un pays lit pour
 * son trait pointillé, et celle dont la fiche d'un atelier se sert pour dire
 * un « métier concentré ». Lu sur tout le répertoire, jamais sur une sélection.
 */
export function regionUniqueFamille(trade: Trade | string, pays: string): string | null {
  const rows = regionsParTrade(trade, pays);
  return rows.length === 1 ? rows[0].wilaya : null;
}

/**
 * Combien d'ateliers d'un type chaque région d'un pays tient : la rangée des
 * régions posée sous les portes de pays d'une page de type, le plus fourni
 * d'abord. Le pays est une condition, pas un ornement : la même région existe
 * dans plusieurs pays, et la rangée ne doit compter que la sienne.
 */
export function regionsParTrade(trade: Trade | string, pays: string): RegionActive[] {
  if (!trade || !pays) return [];
  const counts = new Map<string, number>();
  entreprises.forEach((e) => {
    if (e.trade !== trade) return;
    if (paysDe(e) !== pays) return;
    const where = e.wilaya || e.commune;
    if (!where) return;
    counts.set(where, (counts.get(where) ?? 0) + 1);
  });
  return Array.from(counts, ([wilaya, count]) => ({ wilaya, count }))
    .sort((a, b) => b.count - a.count || a.wilaya.localeCompare(b.wilaya, 'fr'));
}

/**
 * Combien de fiches chaque famille tient dans un pays, bibliothèques et
 * écrivains compris : la carte du pays annonce ses familles comme elle annonce
 * ses régions, et chaque compte ouvre la page du type dans ce pays.
 */
export type FamilleCount = { trade: Trade; count: number };

export function famillesDuPays(code: string): FamilleCount[] {
  if (!code) return [];
  const counts = new Map<string, number>();
  entreprises.forEach((e) => {
    if (paysDe(e) !== code) return;
    counts.set(e.trade, (counts.get(e.trade) ?? 0) + 1);
  });
  return trades
    .map((trade) => ({ trade, count: counts.get(trade) ?? 0 }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count
      || trades.indexOf(a.trade) - trades.indexOf(b.trade));
}

/**
 * La région la plus active d'un type dans un pays : celle qui réunit le plus
 * d'ateliers de ce type. Elle nomme le lien vers la carte, pour qu'une page
 * « Imprimeries en Algérie » dise où le métier bat vraiment.
 */
export function regionActive(trade: Trade | string, pays: string): RegionActive | null {
  if (!trade || !pays) return null;
  const counts = new Map<string, number>();
  entreprises.forEach((e) => {
    if (e.trade !== trade) return;
    if (paysDe(e) !== pays) return;
    const where = e.wilaya || e.commune;
    if (!where) return;
    counts.set(where, (counts.get(where) ?? 0) + 1);
  });
  let best: RegionActive | null = null;
  counts.forEach((count, wilaya) => {
    if (!best || count > best.count || (count === best.count && wilaya.localeCompare(best.wilaya, 'fr') < 0)) {
      best = { wilaya, count };
    }
  });
  return best;
}