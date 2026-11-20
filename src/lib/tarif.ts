import { deviseCode } from '@/lib/pays';

/**
 * The price of the paid plan where the board began, in Algerian dinars. Every
 * other country reads it converted, so the tariff keeps a single source of
 * truth instead of a grid of figures nobody would remember to update.
 */
export const PRIX_PREMIUM_DZD = 3500;

type Change = {
  /** What one Algerian dinar is worth in this money. */
  parDinar: number;
  /** The step the converted price settles on, so it reads like a price. */
  pas: number;
  /**
   * The share of the reference price a market actually pays, so a country whose
   * money is far from the dinar is not asked the same effort as the home market.
   * 1 means « the plain rate ».
   */
  coef: number;
};

/**
 * Indicative rates of one Algerian dinar, in the money of each country the
 * board serves. They are read once, when the price is shown, and rounded to a
 * readable step — a monthly subscription must not read like a conversion table.
 * The coefficient follows the local purchasing power, never the rate alone:
 * Egypt, Syria or Sudan pay a fraction of the Algerian figure, the Gulf pays it
 * in full.
 */
const CHANGES: Record<string, Change> = {
  DZD: { parDinar: 1, pas: 100, coef: 1 },
  SAR: { parDinar: 0.028, pas: 5, coef: 1 },
  BHD: { parDinar: 0.00281, pas: 1, coef: 1 },
  KMF: { parDinar: 3.4, pas: 100, coef: 0.5 },
  DJF: { parDinar: 1.33, pas: 50, coef: 0.7 },
  EGP: { parDinar: 0.358, pas: 25, coef: 0.45 },
  AED: { parDinar: 0.0274, pas: 5, coef: 1 },
  IQD: { parDinar: 9.78, pas: 500, coef: 0.7 },
  JOD: { parDinar: 0.00529, pas: 1, coef: 1 },
  KWD: { parDinar: 0.00229, pas: 1, coef: 1 },
  LBP: { parDinar: 668, pas: 25000, coef: 0.6 },
  LYD: { parDinar: 0.0362, pas: 1, coef: 1 },
  MAD: { parDinar: 0.0739, pas: 10, coef: 1 },
  MRU: { parDinar: 0.297, pas: 10, coef: 0.5 },
  OMR: { parDinar: 0.00287, pas: 1, coef: 1 },
  QAR: { parDinar: 0.0272, pas: 5, coef: 1 },
  SOS: { parDinar: 4.26, pas: 100, coef: 0.4 },
  SDG: { parDinar: 4.48, pas: 100, coef: 0.4 },
  SYP: { parDinar: 97, pas: 500, coef: 0.35 },
  TND: { parDinar: 0.0235, pas: 5, coef: 0.8 },
  YER: { parDinar: 1.87, pas: 100, coef: 0.35 },
};

/**
 * The corridor a coefficient is kept in. A market may pay a share of the
 * reference price, never a token of it nor more than the home market: a
 * coefficient typed outside this range is brought back to the nearest bound,
 * and the page says so instead of quietly charging an absurd figure.
 */
export const COEF_MIN = 0.35;
export const COEF_MAX = 1;

/** « 3 500 », « 2 350 000 » — grouped the same way in every reading language. */
export function grouper(valeur: number): string {
  return String(valeur).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
}

/**
 * A figure already read in the market's money, written with its currency:
 * « 517 EGP ». It does not convert again — a figure that comes out of a
 * division or a subtraction must not be given the coefficient twice.
 */
export function formaterMontant(valeur: number, pays?: string | null): string {
  return `${grouper(Math.round(valeur))} ${deviseCode(pays)}`;
}

/**
 * A dinar amount settled on the step of the market's money: the very figure
 * `prixLocal` prints, kept as a number so two prices can be compared or
 * subtracted without ever reading the text back. This is what makes a saving
 * equal the difference of the two figures printed on the card.
 */
export function montantArrondiDzd(montantDzd: number, pays?: string | null): number {
  const change = CHANGES[deviseCode(pays)];
  if (!montantDzd) return 0;
  if (!change) return montantDzd;
  const coef = borner(change.coef);
  const brut = montantDzd * change.parDinar * coef;
  return Math.max(change.pas, Math.round(brut / change.pas) * change.pas);
}

/** A coefficient brought back inside the corridor the board allows. */
function borner(coef: number): number {
  return Math.min(COEF_MAX, Math.max(COEF_MIN, coef));
}

/** The coefficient written for a market, before the corridor is applied. */
export function coefficientDeclare(pays?: string | null): number {
  return CHANGES[deviseCode(pays)]?.coef ?? 1;
}

/** The share of the reference price a country pays: 1 when nothing is adjusted. */
export function coefficientDePays(pays?: string | null): number {
  return borner(coefficientDeclare(pays));
}

/** True when the market's own coefficient falls outside 35 % – 100 %. */
export function coefHorsFourchette(pays?: string | null): boolean {
  const declare = coefficientDeclare(pays);
  return declare < COEF_MIN || declare > COEF_MAX;
}

/** True when this market reads a price lowered from the plain rate. */
export function paysAjuste(pays?: string | null): boolean {
  return coefficientDePays(pays) < COEF_MAX;
}

/**
 * True when this market sits exactly on the floor of the corridor (35 %). The
 * table says it in a word, and a card reads the same word, so a reader never
 * meets two different stories about the same market.
 */
export function paysAuPlancher(pays?: string | null): boolean {
  return Math.abs(coefficientDePays(pays) - COEF_MIN) < 1e-9;
}

export type PrixLocal = {
  /** The figure as it is read in the country, e.g. « 1 250 EGP ». */
  montant: string;
  /**
   * The reference price in dinars, kept beside the converted one so the origin
   * stays readable. Null in Algeria, where the two are the same figure.
   */
  origine: string | null;
  /** True when the price was lowered from the plain rate. */
  ajuste: boolean;
  /** The coefficient applied, held inside the 35 % – 100 % corridor. */
  coef: number;
  /** The coefficient written for the market, which may sit outside it. */
  declare: number;
  /** True when that written coefficient had to be brought back inside. */
  hors: boolean;
};

/**
 * A dinar amount read in the money of one country, with its origin kept:
 * « 1 250 EGP » and « 3 500 DZD » side by side. The figure is rounded to the
 * step of that money, so a subscription never reads « 1 253,48 EGP ». A country
 * whose money has no rate keeps the dinar rather than showing an invented one.
 */
export function prixLocal(montantDzd: number, pays?: string | null): PrixLocal {
  const code = deviseCode(pays);
  const change = CHANGES[code];
  const declare = change?.coef ?? 1;
  const coef = borner(declare);
  const hors = declare < COEF_MIN || declare > COEF_MAX;
  const origine = code === 'DZD' ? null : `${grouper(montantDzd)} DZD`;

  if (!montantDzd) {
    return { montant: `0 ${code}`, origine, ajuste: coef < COEF_MAX, coef, declare, hors };
  }
  if (!change) {
    return { montant: `${grouper(montantDzd)} ${code}`, origine, ajuste: false, coef: 1, declare, hors };
  }
  const arrondi = montantArrondiDzd(montantDzd, pays);
  return { montant: `${grouper(arrondi)} ${code}`, origine, ajuste: coef < COEF_MAX, coef, declare, hors };
}

/**
 * A dinar amount read in the money of one country: « 3 500 DZD », « 1 250 EGP »,
 * « 8 KWD ». The same engine as `prixLocal`, for the places that only need the
 * figure and no origin line.
 */
export function prixEnDevise(montantDzd: number, pays?: string | null): string {
  return prixLocal(montantDzd, pays).montant;
}

/**
 * Annual billing keeps twelve months on the calendar and charges eleven: the
 * last month of the year is offered to whoever pays for the whole year. Read
 * once here, so the card, the table, the detail panel and the exported file
 * can never tell three different stories about the same offer.
 */
export const MOIS_FACTURES_ANNUEL = 11;

/** Twelve months on the calendar, the offer included, read in one country. */
export function prixAnnuelLocal(montantDzd: number, pays?: string | null): PrixLocal {
  return prixLocal(montantDzd * MOIS_FACTURES_ANNUEL, pays);
}

/** The same year at the plain rate, so a reader can see what the offer saves. */
export function prixAnnuelPleinLocal(montantDzd: number, pays?: string | null): PrixLocal {
  return prixLocal(montantDzd * 12, pays);
}

/**
 * What the year really costs in the reference money: eleven months at the
 * market's own coefficient, read in dinars rather than in its local money. Two
 * markets can then be added up — the same reasoning as the annual saving, so a
 * total never mixes currencies.
 */
export function prixAnnuelDzd(montantDzd: number, pays?: string | null): number {
  return Math.round(montantDzd * MOIS_FACTURES_ANNUEL * coefficientDePays(pays));
}

export type TarifMarche = {
  /** The country code, e.g. « EG ». */
  code: string;
  /** What Premium reads there, money included: « 575 EGP ». */
  montant: string;
  /**
   * The same plan over twelve months, the offered month already taken off, read
   * in the same money — for the markets that ask to be billed once a year
   * instead of month by month.
   */
  montantAnnuel: string;
  /** The same year at the plain rate, kept beside it so the saving is readable. */
  montantAnnuelPlein: string;
  /** The coefficient actually applied, kept inside the corridor. */
  coef: number;
  /**
   * What the whole year saves against the reference price, in dinars: twelve
   * months read at the plain reference rate, minus what the market really pays
   * for the same twelve months (eleven months at its own coefficient). Every
   * market answers the same question in the same money, so the sheet can rank
   * them — a figure read in the market's own money never could.
   */
  economieAnnuelleDzd: number;
  /** The same saving, written with its currency: « 28 525 DZD ». */
  economieAnnuelle: string;
  /**
   * The year itself read in dinars, so the markets of a follow-up list can be
   * added up into one total — the only money that compares from one market to
   * the next.
   */
  montantAnnuelDzd: number;
  /** The coefficient written for the market. */
  declare: number;
  /** True when that written value had to be brought back inside. */
  hors: boolean;
  /**
   * True when the market sits exactly on the floor of the corridor (35 %): it
   * pays the smallest share the board allows, which the table says in a word
   * so nobody reads the figure as a mistake.
   */
  plancher: boolean;
};

/**
 * The whole tariff read market by market, for the small foldable table: what
 * Premium costs in each money, and the coefficient behind the figure. Built
 * from the same engine as the cards, so the sheet can never disagree with them.
 */
export function tarifsParMarche(montantDzd: number, codes: readonly string[]): TarifMarche[] {
  return codes.map((code) => {
    const prix = prixLocal(montantDzd, code);
    /* Twelve months at the plain rate, minus the eleven months the market
       really pays, at its own coefficient. The offered month stays in the
       figure, so a market with no discount still shows its one free month. */
    const economieAnnuelleDzd = Math.round(
      montantDzd * 12 - montantDzd * MOIS_FACTURES_ANNUEL * prix.coef,
    );
    const economieAnnuelle = `${grouper(economieAnnuelleDzd)} DZD`;
    return {
      code,
      montant: prix.montant,
      /* Eleven months charged for twelve, through the same engine and the same
         coefficient, so an annual figure can never drift from the monthly one
         above it. The plain year stays beside it for the detail panel. */
      montantAnnuel: prixAnnuelLocal(montantDzd, code).montant,
      montantAnnuelPlein: prixAnnuelPleinLocal(montantDzd, code).montant,
      coef: prix.coef,
      declare: prix.declare,
      hors: prix.hors,
      /* The corridor's own bound, not a rounded reading of it. */
      plancher: Math.abs(prix.coef - COEF_MIN) < 1e-9,
      economieAnnuelleDzd,
      economieAnnuelle,
      montantAnnuelDzd: prixAnnuelDzd(montantDzd, code),
    };
  });
}