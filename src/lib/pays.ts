import { localize } from '@/i18n/localize';
import type { Lang } from '@/i18n/dict';

export type PaysNom = { fr: string; ar: string; en: string };
export type PaysDevise = { code: string; nom: PaysNom };
export type Pays = {
  code: string;
  nom: PaysNom;
  /** The money a price or a salary is written in, in that country. */
  devise: PaysDevise;
  /** International dialling prefix, so a phone field can show the right start. */
  indicatif: string;
};

/**
 * The Arab countries a member can say he works from. Algeria comes first — it is
 * the home of the board — then the others in French alphabetical order, so the
 * list opens the same way in every reading language. Country, money and dialling
 * prefix travel together: a member who picks Cairo writes in Egyptian pounds and
 * is called with +20.
 */
export const paysArabes: Pays[] = [
  {
    code: 'DZ',
    nom: { fr: 'Algérie', ar: 'الجزائر', en: 'Algeria' },
    devise: { code: 'DZD', nom: { fr: 'Dinar algérien', ar: 'دينار جزائري', en: 'Algerian dinar' } },
    indicatif: '+213',
  },
  {
    code: 'SA',
    nom: { fr: 'Arabie saoudite', ar: 'السعودية', en: 'Saudi Arabia' },
    devise: { code: 'SAR', nom: { fr: 'Riyal saoudien', ar: 'ريال سعودي', en: 'Saudi riyal' } },
    indicatif: '+966',
  },
  {
    code: 'BH',
    nom: { fr: 'Bahreïn', ar: 'البحرين', en: 'Bahrain' },
    devise: { code: 'BHD', nom: { fr: 'Dinar bahreïni', ar: 'دينار بحريني', en: 'Bahraini dinar' } },
    indicatif: '+973',
  },
  {
    code: 'KM',
    nom: { fr: 'Comores', ar: 'جزر القمر', en: 'Comoros' },
    devise: { code: 'KMF', nom: { fr: 'Franc comorien', ar: 'فرنك قمري', en: 'Comorian franc' } },
    indicatif: '+269',
  },
  {
    code: 'DJ',
    nom: { fr: 'Djibouti', ar: 'جيبوتي', en: 'Djibouti' },
    devise: { code: 'DJF', nom: { fr: 'Franc djiboutien', ar: 'فرنك جيبوتي', en: 'Djiboutian franc' } },
    indicatif: '+253',
  },
  {
    code: 'EG',
    nom: { fr: 'Égypte', ar: 'مصر', en: 'Egypt' },
    devise: { code: 'EGP', nom: { fr: 'Livre égyptienne', ar: 'جنيه مصري', en: 'Egyptian pound' } },
    indicatif: '+20',
  },
  {
    code: 'AE',
    nom: { fr: 'Émirats arabes unis', ar: 'الإمارات العربية المتحدة', en: 'United Arab Emirates' },
    devise: { code: 'AED', nom: { fr: 'Dirham des Émirats', ar: 'درهم إماراتي', en: 'UAE dirham' } },
    indicatif: '+971',
  },
  {
    code: 'IQ',
    nom: { fr: 'Irak', ar: 'العراق', en: 'Iraq' },
    devise: { code: 'IQD', nom: { fr: 'Dinar irakien', ar: 'دينار عراقي', en: 'Iraqi dinar' } },
    indicatif: '+964',
  },
  {
    code: 'JO',
    nom: { fr: 'Jordanie', ar: 'الأردن', en: 'Jordan' },
    devise: { code: 'JOD', nom: { fr: 'Dinar jordanien', ar: 'دينار أردني', en: 'Jordanian dinar' } },
    indicatif: '+962',
  },
  {
    code: 'KW',
    nom: { fr: 'Koweït', ar: 'الكويت', en: 'Kuwait' },
    devise: { code: 'KWD', nom: { fr: 'Dinar koweïtien', ar: 'دينار كويتي', en: 'Kuwaiti dinar' } },
    indicatif: '+965',
  },
  {
    code: 'LB',
    nom: { fr: 'Liban', ar: 'لبنان', en: 'Lebanon' },
    devise: { code: 'LBP', nom: { fr: 'Livre libanaise', ar: 'ليرة لبنانية', en: 'Lebanese pound' } },
    indicatif: '+961',
  },
  {
    code: 'LY',
    nom: { fr: 'Libye', ar: 'ليبيا', en: 'Libya' },
    devise: { code: 'LYD', nom: { fr: 'Dinar libyen', ar: 'دينار ليبي', en: 'Libyan dinar' } },
    indicatif: '+218',
  },
  {
    code: 'MA',
    nom: { fr: 'Maroc', ar: 'المغرب', en: 'Morocco' },
    devise: { code: 'MAD', nom: { fr: 'Dirham marocain', ar: 'درهم مغربي', en: 'Moroccan dirham' } },
    indicatif: '+212',
  },
  {
    code: 'MR',
    nom: { fr: 'Mauritanie', ar: 'موريتانيا', en: 'Mauritania' },
    devise: { code: 'MRU', nom: { fr: 'Ouguiya mauritanien', ar: 'أوقية موريتانية', en: 'Mauritanian ouguiya' } },
    indicatif: '+222',
  },
  {
    code: 'OM',
    nom: { fr: 'Oman', ar: 'عُمان', en: 'Oman' },
    devise: { code: 'OMR', nom: { fr: 'Rial omanais', ar: 'ريال عماني', en: 'Omani rial' } },
    indicatif: '+968',
  },
  {
    code: 'PS',
    nom: { fr: 'Palestine', ar: 'فلسطين', en: 'Palestine' },
    devise: { code: 'JOD', nom: { fr: 'Dinar jordanien', ar: 'دينار أردني', en: 'Jordanian dinar' } },
    indicatif: '+970',
  },
  {
    code: 'QA',
    nom: { fr: 'Qatar', ar: 'قطر', en: 'Qatar' },
    devise: { code: 'QAR', nom: { fr: 'Riyal qatari', ar: 'ريال قطري', en: 'Qatari riyal' } },
    indicatif: '+974',
  },
  {
    code: 'SO',
    nom: { fr: 'Somalie', ar: 'الصومال', en: 'Somalia' },
    devise: { code: 'SOS', nom: { fr: 'Shilling somalien', ar: 'شلن صومالي', en: 'Somali shilling' } },
    indicatif: '+252',
  },
  {
    code: 'SD',
    nom: { fr: 'Soudan', ar: 'السودان', en: 'Sudan' },
    devise: { code: 'SDG', nom: { fr: 'Livre soudanaise', ar: 'جنيه سوداني', en: 'Sudanese pound' } },
    indicatif: '+249',
  },
  {
    code: 'SY',
    nom: { fr: 'Syrie', ar: 'سوريا', en: 'Syria' },
    devise: { code: 'SYP', nom: { fr: 'Livre syrienne', ar: 'ليرة سورية', en: 'Syrian pound' } },
    indicatif: '+963',
  },
  {
    code: 'TN',
    nom: { fr: 'Tunisie', ar: 'تونس', en: 'Tunisia' },
    devise: { code: 'TND', nom: { fr: 'Dinar tunisien', ar: 'دينار تونسي', en: 'Tunisian dinar' } },
    indicatif: '+216',
  },
  {
    code: 'YE',
    nom: { fr: 'Yémen', ar: 'اليمن', en: 'Yemen' },
    devise: { code: 'YER', nom: { fr: 'Rial yéménite', ar: 'ريال يمني', en: 'Yemeni rial' } },
    indicatif: '+967',
  },
];

/** A member with no country on file is an Algerian member: the board's home. */
export const PAYS_DEFAUT = 'DZ';

/** The country of a profile, read as a country even when the row has none yet. */
export function paysDe(entite: { pays?: string | null }): string {
  return entite.pays || PAYS_DEFAUT;
}

/** One country as it is written in the list. */
export function paysTrouve(code: string | null | undefined): Pays | undefined {
  return paysArabes.find((pays) => pays.code === (code || PAYS_DEFAUT));
}

/** One country, named in the language being read. */
export function nomPays(code: string | null | undefined, lang: Lang | string): string {
  const found = paysTrouve(code);
  return found ? localize(found.nom, lang) : (code ?? '');
}

/** The currency ISO code of a country, e.g. « DZD », « EGP », « SAR ». */
export function deviseCode(code: string | null | undefined): string {
  return paysTrouve(code)?.devise.code ?? 'DZD';
}

/** The currency of a country, named in the language being read. */
export function nomDevise(code: string | null | undefined, lang: Lang | string): string {
  const found = paysTrouve(code);
  return found ? localize(found.devise.nom, lang) : '';
}

/** « Dinar algérien (DZD) » — the currency and its code, ready for a form hint. */
export function libelleDevise(code: string | null | undefined, lang: Lang | string): string {
  const found = paysTrouve(code);
  if (!found) return '';
  return `${localize(found.devise.nom, lang)} (${found.devise.code})`;
}

/** The dialling prefix of a country, e.g. « +213 ». */
export function indicatifDe(code: string | null | undefined): string {
  return paysTrouve(code)?.indicatif ?? '+213';
}

/** « +213 41 55 12 08 » — a phone example that belongs to the chosen country. */
export function exempleTelephone(code: string | null | undefined): string {
  const prefix = indicatifDe(code);
  return `${prefix} 00 00 00 00`;
}

const PREF_KEY = 'paperatlas:pays';

/** The time zones of the Arab world, so a visitor is guessed by where he reads from. */
const zoneVersPays: Record<string, string> = {
  'Africa/Algiers': 'DZ',
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/El_Aaiun': 'MA',
  'Africa/Tunis': 'TN',
  'Africa/Tripoli': 'LY',
  'Africa/Khartoum': 'SD',
  'Africa/Nouakchott': 'MR',
  'Africa/Mogadishu': 'SO',
  'Africa/Djibouti': 'DJ',
  'Indian/Comoro': 'KM',
  'Asia/Riyadh': 'SA',
  'Asia/Dubai': 'AE',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'Asia/Amman': 'JO',
  'Asia/Beirut': 'LB',
  'Asia/Damascus': 'SY',
  'Asia/Baghdad': 'IQ',
  'Asia/Aden': 'YE',
  'Asia/Gaza': 'PS',
  'Asia/Hebron': 'PS',
  'Asia/Ramallah': 'PS',
};

/** The country last chosen on a form, if the visitor already said it once. */
export function paysMemorise(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (!raw) return null;
    return paysTrouve(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Remembers the country, so every other form opens on the same one. */
export function memoriserPays(code: string): void {
  if (typeof window === 'undefined') return;
  if (!paysTrouve(code)) return;
  try {
    window.localStorage.setItem(PREF_KEY, code);
  } catch {
    /* storage unavailable — the choice simply is not remembered */
  }
}

/** The country the browser says it is in, from its time zone. */
function paysParFuseau(): string | null {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone ? zoneVersPays[zone] ?? null : null;
  } catch {
    return null;
  }
}

/** The country written in the browser languages, e.g. « ar-EG » → EG. */
function paysParLangue(): string | null {
  if (typeof navigator === 'undefined') return null;
  const tags = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const tag of tags) {
    const region = tag.split('-')[1]?.toUpperCase();
    if (region && paysTrouve(region)) return region;
  }
  return null;
}

/**
 * The country a form opens on, without asking anything: the one the member
 * already chose, then the one his time zone points at, then the one his
 * browser language names, and Algeria last — never an empty field.
 */
export function paysDevine(): string {
  return paysMemorise() || paysParFuseau() || paysParLangue() || PAYS_DEFAUT;
}

export type PaysCount = { code: string; count: number };

/**
 * How many rows come from each country, the fullest first — the counter that
 * sits above the boards. Countries of the same weight keep the order of the
 * list itself, so the row never reshuffles between two loads.
 */
export function tallyPays(items: readonly { pays?: string | null }[]): PaysCount[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const code = paysDe(item);
    counts.set(code, (counts.get(code) ?? 0) + 1);
  });
  const order = paysArabes.map((p) => p.code);
  return Array.from(counts, ([code, count]) => ({ code, count })).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return order.indexOf(a.code) - order.indexOf(b.code);
  });
}