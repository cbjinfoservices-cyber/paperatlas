import type { Trade } from '@/mocks/entreprises';
import { nomPays, paysArabes } from '@/lib/pays';
import type { Lang } from '@/i18n/dict';

/**
 * Une adresse par type d'établissement, écrite pour être lue et retenue :
 * /annuaire/imprimeries, /annuaire/editeurs, /annuaire/librairies… Chaque page
 * porte son propre titre, sa propre description et son propre lien canonique,
 * pour être trouvée sur Google autrement que l'annuaire entier.
 */
export const TRADE_SLUGS: Record<Trade, string> = {
  impression: 'imprimeries',
  edition: 'editeurs',
  librairie: 'librairies',
  faconnage: 'faconniers',
  communication: 'agences',
  fournisseurs: 'fournisseurs',
  bibliotheque: 'bibliotheques',
  ecrivain: 'ecrivains',
};

/** L'adresse d'un type, "" quand le type n'en a pas. */
export function slugDeTrade(trade: string): string {
  return TRADE_SLUGS[trade as Trade] ?? '';
}

/**
 * Les huit types d'établissement, dans l'ordre où le menu de la barre les
 * annonce. Chacun garde son icône et son adresse : la porte du rang, les
 * pastilles du panneau et celles de la feuille du téléphone lisent toutes
 * cette même liste, si bien qu'un type ne peut pas apparaître d'un côté et
 * manquer de l'autre. « Écrivains » désigne les ateliers de plume ; les
 * plumes elles-mêmes ont leur onglet Auteurs.
 */
export const DIRECTORY_TRADES: Array<{ trade: Trade; icon: string }> = [
  { trade: 'impression', icon: 'ri-printer-line' },
  { trade: 'edition', icon: 'ri-book-2-line' },
  { trade: 'librairie', icon: 'ri-store-2-line' },
  { trade: 'bibliotheque', icon: 'ri-book-read-line' },
  { trade: 'communication', icon: 'ri-megaphone-line' },
  { trade: 'ecrivain', icon: 'ri-quill-pen-line' },
  { trade: 'faconnage', icon: 'ri-scissors-cut-line' },
  { trade: 'fournisseurs', icon: 'ri-truck-line' },
];

/** Le type qu'une adresse désigne, "" quand le segment n'est pas un type. */
export function tradeDeSlug(slug: string): Trade | '' {
  const clean = slug.trim().toLowerCase();
  const found = (Object.keys(TRADE_SLUGS) as Trade[]).find((trade) => TRADE_SLUGS[trade] === clean);
  return found ?? '';
}

/**
 * Le lieu, écrit comme une phrase française l'exige : « en Algérie », « au
 * Maroc », « aux Émirats arabes unis ». L'arabe et l'anglais n'ont qu'une
 * préposition, donc le nom du pays suffit.
 */
const LIEU_FR: Record<string, string> = {
  DZ: 'en Algérie',
  SA: 'en Arabie saoudite',
  BH: 'à Bahreïn',
  KM: 'aux Comores',
  DJ: 'à Djibouti',
  EG: 'en Égypte',
  AE: 'aux Émirats arabes unis',
  IQ: 'en Irak',
  JO: 'en Jordanie',
  KW: 'au Koweït',
  LB: 'au Liban',
  LY: 'en Libye',
  MA: 'au Maroc',
  MR: 'en Mauritanie',
  OM: 'à Oman',
  PS: 'en Palestine',
  QA: 'au Qatar',
  SO: 'en Somalie',
  SD: 'au Soudan',
  SY: 'en Syrie',
  TN: 'en Tunisie',
  YE: 'au Yémen',
};

/** Accent-blind, case-blind form, so « Émirats » and « emirats » meet. */
function plat(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * L'adresse d'un pays, écrite comme une adresse : « algerie »,
 * « emirats-arabes-unis », « arabie-saoudite ». Elle sert aux pages
 * /annuaire/imprimeries/algerie, que Google indexe séparément.
 */
export function slugPays(code: string): string {
  const found = paysArabes.find((pays) => pays.code === code);
  if (!found) return '';
  return plat(found.nom.fr).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Le pays qu'une adresse désigne, "" quand le segment n'est pas un pays. */
export function paysDeSlug(slug: string): string {
  const clean = plat(slug).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!clean) return '';
  const found = paysArabes.find((pays) => slugPays(pays.code) === clean);
  return found?.code ?? '';
}

/** « en Algérie », « في الجزائر », « in Algeria ». */
export function phrasePays(code: string, lang: Lang | string): string {
  const nom = nomPays(code, lang);
  if (lang === 'ar') return `في ${nom}`;
  if (lang === 'en') return `in ${nom}`;
  return LIEU_FR[code] ?? `en ${nom}`;
}