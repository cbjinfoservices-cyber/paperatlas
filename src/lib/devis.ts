import { deviseCode } from '@/lib/pays';
import {
  PRIX_PREMIUM_DZD,
  formaterMontant,
  grouper,
  montantArrondiDzd,
} from '@/lib/tarif';
import { plans, type PlanId } from '@/pages/offres/components/plans';

/**
 * The subscription quote, computed once and read everywhere: the « Devis »
 * page, the card of a structure and « Mon compte » all call this engine, so the
 * three doors can never name two different totals for the same need.
 *
 * The quote now follows the four lengths of the one subscription: the length
 * itself is the choice, and the figure printed is the figure of that length —
 * the quarter, the half year or the year — with the month it comes to beside
 * it. The rhythm is no longer asked a second time: a structure that picks a
 * semester does not also choose « monthly » or « yearly ».
 *
 * Everything is summed in the reference money (Algerian dinars) and only then
 * read in the money of the market, through the same conversion — and the same
 * purchasing-power coefficient — that the cards already use.
 */

/** A structure may attach a lot of sites: the field stops, the quote does not. */
export const SITES_MAX = 200;

/** The four states a quote file can be in, and nothing else. */
export const STATUTS_DEVIS = ['recu', 'en_etude', 'confirme', 'expire'] as const;

export type StatutDevis = (typeof STATUTS_DEVIS)[number];

/** Whatever the base holds, read back as one of the four states. */
export function statutDevis(value: string | null | undefined): StatutDevis {
  const raw = (value ?? '') as StatutDevis;
  return STATUTS_DEVIS.includes(raw) ? raw : 'recu';
}

/** The share of the monthly price one additional establishment pays. */
const PART_SITE_SUP = 0.7;

/** The length picked, read back in its own plan, so nothing is written twice. */
function planDe(formule: PlanId) {
  return plans.find((plan) => plan.id === formule) ?? plans[0];
}

/** The length of one plan, in months. */
export function moisDe(formule: PlanId): number {
  return planDe(formule).mois;
}

type Bareme = {
  /** What the length costs for its first establishment, in dinars. */
  montantDzd: number;
  /** How many months the length covers. */
  mois: number;
  /** How many establishments that figure already covers. */
  inclus: number;
  /** What each additional establishment adds, per month, in dinars. */
  siteSupDzd: number;
};

/** The tariff of one length: its own figure, and the seat added beside it. */
export function baremeDe(formule: PlanId): Bareme {
  const plan = planDe(formule);
  return {
    montantDzd: plan.montantDzd,
    mois: plan.mois,
    inclus: 1,
    siteSupDzd: Math.round(PRIX_PREMIUM_DZD * PART_SITE_SUP),
  };
}

/** A number of establishments brought back inside what the field allows. */
export function bornerSites(sites: number): number {
  if (!Number.isFinite(sites)) return 1;
  return Math.min(SITES_MAX, Math.max(1, Math.round(sites)));
}

/** How many establishments are actually charged on top of the base. */
export function sitesSupplementaires(formule: PlanId, sites: number): number {
  const bareme = baremeDe(formule);
  return Math.max(0, bornerSites(sites) - bareme.inclus);
}

/** What the additional seats cost over the whole length, in dinars. */
export function sitesDzd(formule: PlanId, sites: number): number {
  const bareme = baremeDe(formule);
  return sitesSupplementaires(formule, sites) * bareme.siteSupDzd * bareme.mois;
}

/** The whole length for a need, in dinars, before any conversion. */
export function totalDzd(formule: PlanId, sites: number): number {
  return baremeDe(formule).montantDzd + sitesDzd(formule, sites);
}

export type Devis = {
  formule: PlanId;
  /** How many months the chosen length covers. */
  mois: number;
  etablissements: number;
  pays: string;
  devise: string;
  /** Establishments already covered by the length. */
  inclus: number;
  /** Establishments charged on top of it. */
  extra: number;
  /** What the length costs for the first establishment, in the market's money. */
  forfait: string;
  /** What one additional establishment costs there, per month. */
  siteSup: string;
  /** What the additional seats cost over the whole length. Null when none. */
  sites: string | null;
  /** The whole need over the chosen length: the figure the reader commits to. */
  total: string;
  /** The same figure brought back to one month inside that length. */
  parMois: string;
  /** The same length at the plain monthly price, so the discount can be seen. */
  plein: string;
  /** What the length saves against paying month after month. Null when none. */
  economie: string | null;
  /** The figure in the reference money, when the market is not Algeria. */
  origine: string | null;
};

/**
 * One need, read in one market: the figure of the length, the month it comes
 * to, and what the length offers. Nothing is rounded twice — the total is
 * converted once, and the month is read from that very total, so a reader can
 * always find the month inside the figure above it.
 */
export function calculerDevis(
  formule: PlanId,
  sites: number,
  pays: string,
): Devis {
  const etablissements = bornerSites(sites);
  const bareme = baremeDe(formule);
  const extra = sitesSupplementaires(formule, etablissements);
  const sitesDzdTotal = sitesDzd(formule, etablissements);
  const totalDzdMontant = bareme.montantDzd + sitesDzdTotal;
  const code = deviseCode(pays);

  const totalArrondi = montantArrondiDzd(totalDzdMontant, pays);
  const parMois = Math.round(totalArrondi / bareme.mois);
  /* The plain reading of the same length: the month the shortest length prints,
     multiplied by the months — the very multiplication the reader makes on the
     cards. */
  const pleinArrondi = montantArrondiDzd(PRIX_PREMIUM_DZD, pays) * bareme.mois;
  const economie = pleinArrondi - totalArrondi;

  return {
    formule,
    mois: bareme.mois,
    etablissements,
    pays,
    devise: code,
    inclus: bareme.inclus,
    extra,
    forfait: formaterMontant(montantArrondiDzd(bareme.montantDzd, pays), pays),
    siteSup: formaterMontant(montantArrondiDzd(bareme.siteSupDzd, pays), pays),
    sites: extra > 0 ? formaterMontant(montantArrondiDzd(sitesDzdTotal, pays), pays) : null,
    total: formaterMontant(totalArrondi, pays),
    parMois: formaterMontant(parMois, pays),
    plein: formaterMontant(pleinArrondi, pays),
    economie: economie > 0 ? formaterMontant(economie, pays) : null,
    origine: code === 'DZD' ? null : `${grouper(totalDzdMontant)} DZD`,
  };
}

/**
 * The request as it is written into the form: one readable summary, built in
 * the language on screen, so whoever reads the request sees the quote the
 * visitor saw — its length first, then the figure of that length.
 */
export function resumeDevis(
  devis: Devis,
  t: (key: string) => string,
  nomFormule: string,
  nomMarche: string,
): string[] {
  const lignes = [
    `${t('dv.fFormula')} : ${nomFormule}`,
    `${t('dv.fDuree')} : ${devis.mois} ${t('dv.months')}`,
    `${t('dv.fSites')} : ${devis.etablissements}`,
    `${t('dv.fMarche')} : ${nomMarche}`,
    `${t('dv.fForfait')} : ${devis.forfait}`,
  ];
  if (devis.extra > 0) {
    lignes.push(
      `${t('dv.fSitesSup')} : ${devis.extra} × ${devis.siteSup} ${t('dv.perMonth')} × ${devis.mois} ${t('dv.months')} = ${devis.sites ?? ''}`,
    );
  }
  lignes.push(
    `${t('dv.fTotal')} : ${devis.total} ${t('dv.perDuree')}`,
    `${t('dv.fParMois')} : ${devis.parMois} ${t('dv.perMonth')}`,
  );
  if (devis.economie) {
    lignes.push(
      `${t('dv.fPlein')} : ${devis.plein} — ${t('dv.saving')} : ${devis.economie}`,
    );
  }
  return lignes;
}