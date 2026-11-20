import { paysSansTrade } from '@/lib/tradeCountries';
import { paysArabes, paysDe } from '@/lib/pays';
import { entreprises } from '@/mocks/entreprises';

/**
 * Les aires du monde arabe, telles qu'un lecteur les nomme : le Maghreb, la
 * vallée du Nil, le Machrek, le golfe et la corne de l'Afrique. Elles servent
 * à lire un manque à l'échelle d'une région du monde, et non pays par pays :
 * un métier absent d'Algérie se comprend mieux quand on sait qu'il manque
 * aussi à ses voisins immédiats.
 *
 * Les vingt-deux pays du répertoire y figurent une fois chacun : une aire
 * ajoutée doit donc partager ses pays avec une autre, jamais les perdre.
 */
export type RegionMondeKey = 'maghreb' | 'nil' | 'machrek' | 'golfe' | 'corne';

export type RegionMonde = { key: RegionMondeKey; pays: string[] };

export const REGIONS_MONDE: RegionMonde[] = [
  { key: 'maghreb', pays: ['DZ', 'MA', 'TN', 'LY', 'MR'] },
  { key: 'nil', pays: ['EG', 'SD'] },
  { key: 'machrek', pays: ['PS', 'JO', 'LB', 'SY', 'IQ'] },
  { key: 'golfe', pays: ['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE'] },
  { key: 'corne', pays: ['SO', 'DJ', 'KM'] },
];

/** L'aire du monde à laquelle un pays appartient, null s'il n'en a pas. */
export function regionMondeDe(pays: string): RegionMonde | null {
  const code = (pays || '').toUpperCase();
  if (!code) return null;
  return REGIONS_MONDE.find((region) => region.pays.includes(code)) ?? null;
}

/** Les pays de la même aire, le pays lu excepté, dans l'ordre de la liste. */
export function voisinsDeRegion(pays: string): string[] {
  const code = (pays || '').toUpperCase();
  const region = regionMondeDe(code);
  if (!region) return [];
  return region.pays.filter((voisin) => voisin !== code);
}

/**
 * Les voisins de la même aire où le métier n'a aucun atelier : le manque se
 * lit alors à l'échelle d'une région du monde. Lu sur tout le répertoire,
 * jamais sur la sélection filtrée — c'est le monde qui manque, non la vue
 * en cours.
 */
export function voisinsSansTrade(trade: string, pays: string): string[] {
  if (!trade) return [];
  const manquants = new Set(paysSansTrade(trade));
  return voisinsDeRegion(pays).filter((code) => manquants.has(code));
}

/** La clef de dictionnaire qui nomme une aire du monde. */
export function regionMondeLabelKey(region: RegionMonde): string {
  return `worldRegion.${region.key}`;
}

/**
 * Le nom de l'aire lu dans l'adresse : le compteur des régions d'une page de
 * pays y écrit celles où le métier manque, et la carte du monde s'ouvre
 * resserrée sur leurs pays. Une clef qu'aucune aire ne porte est ignorée.
 */
export const AIRES_MONDE_PARAM = 'cmapsAires';

/**
 * L'ordre des pastilles d'aires, tenu dans l'adresse : « poids » range la plus
 * lourde d'abord, l'absence garde l'ordre des aires du monde. La même clef
 * range la note de la carte du monde et la rangée d'une page de pays, si bien
 * qu'un seul geste range les deux listes.
 */
export const AIRES_TRI_PARAM = 'cmapsAiresTri';

/** L'ordre de poids lu dans une adresse d'aires. */
export function airesParPoidsDeLien(raw: string | null): boolean {
  return raw === 'poids';
}

/** Les clefs d'aires écrites dans une adresse, dans l'ordre des aires. */
export function airesDeLien(raw: string | null): RegionMondeKey[] {
  const voulues = (raw ?? '').split(',').map((key) => key.trim()).filter(Boolean);
  return REGIONS_MONDE
    .filter((region) => voulues.includes(region.key))
    .map((region) => region.key);
}

/**
 * L'aire sur laquelle la carte se resserre seule, quand une pastille de la
 * note a été pressée : elle vit dans l'adresse à côté des aires retenues, si
 * bien qu'un lien copié rouvre la même carte — et qu'un second appui rend
 * toutes les aires retenues sans en perdre une seule.
 */
export const AIRE_SEULE_PARAM = 'cmapsAire';

/** L'aire seule lue dans une adresse, "" quand aucune n'est pressée. */
export function aireDeLien(raw: string | null): RegionMondeKey | '' {
  const key = (raw ?? '').trim();
  const trouvee = REGIONS_MONDE.find((region) => region.key === key);
  return trouvee ? trouvee.key : '';
}

/**
 * Le cadre d'une aire du monde sur la carte d'un pays : le pays lu se relit à
 * l'échelle de son aire, ses régions apparaissant dans le voisinage de leurs
 * pays. La clef vit dans l'adresse, si bien qu'un lien copié rouvre le même
 * cadrage.
 */
export const AIRE_CARTE_PARAM = 'cmapAire';

/**
 * Les pays d'une aire lue dans l'adresse, pour cadrer une carte : vide quand
 * aucune aire n'est retenue, la carte se cadre alors sur le pays lui-même.
 */
export function paysDeCarteAire(raw: string | null): string[] {
  const key = aireDeLien(raw);
  if (!key) return [];
  return REGIONS_MONDE.find((region) => region.key === key)?.pays ?? [];
}

/**
 * Les aires offertes à la carte d'un pays : toutes les aires du monde, la
 * sienne en tête — son voisinage immédiat se lit avant les aires lointaines.
 * L'ordre des autres ne bouge pas, pour que la rangée ne se réordonne jamais
 * d'un pays à l'autre.
 */
export function airesPourPays(pays: string): RegionMonde[] {
  const sienne = regionMondeDe(pays)?.key ?? '';
  return REGIONS_MONDE
    .map((region, rang) => ({ region, rang }))
    .sort((a, b) => (a.region.key === sienne ? -1 : b.region.key === sienne ? 1 : a.rang - b.rang))
    .map((row) => row.region);
}

/**
 * Le nombre de fiches que des pays tiennent, toutes familles confondues : lu
 * sur tout le répertoire, jamais sur une sélection filtrée. Il donne l'échelle
 * d'une aire avant qu'on n'ouvre sa carte, et permet de comparer le Maghreb au
 * golfe d'un seul regard.
 */
export function fichesDesPays(codes: string[]): number {
  if (codes.length === 0) return 0;
  const set = new Set(codes);
  return entreprises.filter((fiche) => set.has(paysDe(fiche))).length;
}

/**
 * Les pays d'un ensemble d'aires, dans l'ordre de la liste des pays : la
 * carte du monde s'y resserre, et chaque carte se lit à l'échelle de son
 * aire — les pays où le métier est tenu y restent, puisqu'ils font partie du
 * voisinage qui donne son sens au manque.
 */
export function paysDesAires(keys: RegionMondeKey[]): string[] {
  if (keys.length === 0) return [];
  const codes = new Set<string>();
  REGIONS_MONDE
    .filter((region) => keys.includes(region.key))
    .forEach((region) => region.pays.forEach((code) => codes.add(code)));
  return paysArabes.filter((pays) => codes.has(pays.code)).map((pays) => pays.code);
}

/** Une aire du monde où le métier manque, avec les pays qui en sont privés. */
export type RegionManque = { key: RegionMondeKey; region: RegionMonde; pays: string[] };

/**
 * Les aires du monde où le métier manque : une aire compte dès qu'un de ses
 * pays n'a aucun atelier du métier lu. Le manque se lit alors à l'échelle du
 * monde arabe entier — trois aires sur cinq, par exemple — au lieu de rester
 * une affaire de voisins immédiats. Lu sur tout le répertoire, jamais sur la
 * sélection filtrée.
 */
export function regionsSansTrade(trade: string): RegionManque[] {
  if (!trade) return [];
  const manquants = new Set(paysSansTrade(trade));
  return REGIONS_MONDE
    .map((region) => ({ key: region.key, region, pays: region.pays.filter((code) => manquants.has(code)) }))
    .filter((row) => row.pays.length > 0);
}