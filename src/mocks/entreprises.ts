import { printing } from './data/printing';
import { editing } from './data/editing';
import { studios } from './data/studios';
import { marchesEntreprises } from './data/marches';
import { reading } from './data/reading';

export type Trade = 'impression' | 'edition' | 'librairie' | 'faconnage' | 'communication' | 'fournisseurs' | 'bibliotheque' | 'ecrivain';

export type Bilingual = { fr: string; ar: string; en?: string };

export type Hour = { d: string; h: string };

export type Entreprise = {
  id: string;
  name: string;
  logoMark: string;
  trade: Trade;
  wilaya: string;
  /** ISO code of the Arab country the workshop works from — « DZ » when absent. */
  pays?: string;
  commune: string;
  address: string;
  lat: number;
  lng: number;
  since: number;
  /** Date the profile was registered on the directory (ISO, YYYY-MM-DD). */
  joined: string;
  staff: number;
  rating: number;
  reviews: number;
  capacity: Bilingual;
  blurb: Bilingual;
  services: Bilingual[];
  certs: string[];
  hours: Hour[];
  catalogue: { ref: string; title: Bilingual; spec: string; price: string }[];
  phone: string;
  email: string;
  photos: string[];
  featured?: boolean;
  /** The formula this workshop holds, as it is read on its public sheet.
   *  Left out when the workshop sits on the free Directory plan. */
  formule?: 'annuaire' | 'premium' | 'institutions';
  /** How many establishments the organisation attaches to its account. Read on
   *  the public sheet only when it sits on the Institutions plan. */
  etablissements?: number;
  /** The establishments themselves, when the organisation named them. Read on
   *  the public sheet under the figure, in the order it declared them. */
  etabsListe?: Etablissement[];
};

/** One site of an Institutions structure: a name, and where it stands. */
export type Etablissement = {
  nom: string;
  commune: string;
  wilaya: string;
  /** Year the site joined the structure's park. Left out when the structure
   *  did not say: the order of the list then speaks for it. */
  depuis?: number;
};

export const trades: Trade[] = ['impression', 'edition', 'librairie', 'faconnage', 'communication', 'fournisseurs', 'bibliotheque', 'ecrivain'];

export const entreprises: Entreprise[] = [...printing, ...editing, ...studios, ...marchesEntreprises, ...reading];

export const wilayas: string[] = Array.from(new Set(entreprises.map((e) => e.wilaya))).sort((a, b) => a.localeCompare(b, 'fr'));

/**
 * The newest site of an Institutions park: the one that joined the structure
 * last, read on the declared year — or on the order of the list when the years
 * are not filled in.
 */
export function dernierEtablissement(e: Entreprise): Etablissement | null {
  const sites = e.etabsListe ?? [];
  if (sites.length === 0) return null;
  return sites.reduce((latest, site) => ((site.depuis ?? 0) >= (latest.depuis ?? 0) ? site : latest));
}

export const featured = entreprises.find((e) => e.featured) ?? entreprises[0];

/** The formula read under the workshop's name. A paying sheet carries the flag
 *  itself; the others fall back on the directory card's own « featured » mark. */
export function formuleDe(e: Entreprise): 'annuaire' | 'premium' | 'institutions' {
  if (e.formule) return e.formule;
  return e.featured ? 'premium' : 'annuaire';
}

/**
 * Rough production scale extracted from the capacity sentence, so the directory
 * can be sorted from the smallest workshop to the biggest one. The unit varies
 * per trade (sheets / day, tonnes / year, m² / month), so this is indicative.
 */
export function capacityScore(e: Entreprise): number {
  const matches = e.capacity.fr.match(/\d[\d\s\u00a0]*/g) ?? [];
  const numbers = matches
    .map((chunk) => Number(chunk.replace(/[\s\u00a0]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);
  return numbers.length ? Math.max(...numbers) : 0;
}