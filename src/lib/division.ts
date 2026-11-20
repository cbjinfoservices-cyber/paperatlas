import type { Lang } from '@/i18n/dict';
import { PAYS_DEFAUT } from '@/lib/pays';

/**
 * The level below the state is not called the same way across the Arab world.
 * Algeria names it a wilaya, Egypt and Iraq a governorate, the Emirates an
 * emirate, Qatar a municipality, the Comoros an island, Morocco and Saudi
 * Arabia a region. The board speaks to all of them, so the label follows the
 * country on screen instead of imposing the Algerian word everywhere.
 */
export type FormeDivision = 'sing' | 'plur' | 'tous';

type Mots = { sing: string; plur: string; tous: string };
type Table = { fr: Mots; ar: Mots; en: Mots };

export type DivisionKind = 'wilaya' | 'gouvernorat' | 'region' | 'emirat' | 'municipalite' | 'ile';

const TABLES: Record<DivisionKind, Table> = {
  wilaya: {
    fr: { sing: 'Wilaya', plur: 'wilayas', tous: 'Toutes les wilayas' },
    ar: { sing: 'ولاية', plur: 'ولايات', tous: 'كل الولايات' },
    en: { sing: 'Wilaya', plur: 'wilayas', tous: 'All wilayas' },
  },
  gouvernorat: {
    fr: { sing: 'Gouvernorat', plur: 'gouvernorats', tous: 'Tous les gouvernorats' },
    ar: { sing: 'محافظة', plur: 'محافظات', tous: 'كل المحافظات' },
    en: { sing: 'Governorate', plur: 'governorates', tous: 'All governorates' },
  },
  region: {
    fr: { sing: 'Région', plur: 'régions', tous: 'Toutes les régions' },
    ar: { sing: 'منطقة', plur: 'مناطق', tous: 'كل المناطق' },
    en: { sing: 'Region', plur: 'regions', tous: 'All regions' },
  },
  emirat: {
    fr: { sing: 'Émirat', plur: 'émirats', tous: 'Tous les émirats' },
    ar: { sing: 'إمارة', plur: 'إمارات', tous: 'كل الإمارات' },
    en: { sing: 'Emirate', plur: 'emirates', tous: 'All emirates' },
  },
  municipalite: {
    fr: { sing: 'Municipalité', plur: 'municipalités', tous: 'Toutes les municipalités' },
    ar: { sing: 'بلدية', plur: 'بلديات', tous: 'كل البلديات' },
    en: { sing: 'Municipality', plur: 'municipalities', tous: 'All municipalities' },
  },
  ile: {
    fr: { sing: 'Île', plur: 'îles', tous: 'Toutes les îles' },
    ar: { sing: 'جزيرة', plur: 'جزر', tous: 'كل الجزر' },
    en: { sing: 'Island', plur: 'islands', tous: 'All islands' },
  },
};

/**
 * The word each country actually uses, taken from its own administrative
 * geography: a governorate in Cairo or Baghdad, an emirate in Abu Dhabi, a
 * municipality in Doha, a region in Riyadh and Rabat, a wilaya in Algiers,
 * Khartoum, Nouakchott — and in Tunis, whose governorates are wilāyāt.
 */
const PAR_PAYS: Record<string, DivisionKind> = {
  DZ: 'wilaya',
  SA: 'region',
  BH: 'gouvernorat',
  KM: 'ile',
  DJ: 'region',
  EG: 'gouvernorat',
  AE: 'emirat',
  IQ: 'gouvernorat',
  JO: 'gouvernorat',
  KW: 'gouvernorat',
  LB: 'gouvernorat',
  LY: 'gouvernorat',
  MA: 'region',
  MR: 'wilaya',
  OM: 'gouvernorat',
  PS: 'gouvernorat',
  QA: 'municipalite',
  SO: 'region',
  SD: 'wilaya',
  SY: 'gouvernorat',
  TN: 'gouvernorat',
  YE: 'gouvernorat',
};

/** Arabic names that differ from the common form of the same kind of division. */
const AR_SPECIAL: Record<string, Mots> = {
  /* Tunisian governorates are wilāyāt, not muḥāfaẓāt. */
  TN: { sing: 'ولاية', plur: 'ولايات', tous: 'كل الولايات' },
  /* Moroccan regions are jihāt. */
  MA: { sing: 'جهة', plur: 'جهات', tous: 'كل الجهات' },
};

const normalise = (pays: string | null | undefined) => (pays || PAYS_DEFAUT).trim().toUpperCase();

/** Which kind of division a country is cut into. */
export function divisionDe(pays?: string | null): DivisionKind {
  return PAR_PAYS[normalise(pays)] ?? 'region';
}

/**
 * The division, written in the language being read and in the requested form.
 * A country left empty falls back to Algeria, the board's home.
 */
export function motDivision(
  pays: string | null | undefined,
  lang: Lang | string,
  forme: FormeDivision = 'sing',
): string {
  const code = normalise(pays);
  if (lang === 'ar') {
    const special = AR_SPECIAL[code];
    if (special) return special[forme];
    return TABLES[divisionDe(code)].ar[forme];
  }
  if (lang === 'en') return TABLES[divisionDe(code)].en[forme];
  return TABLES[divisionDe(code)].fr[forme];
}