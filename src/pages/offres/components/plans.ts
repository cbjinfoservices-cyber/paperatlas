/** The one subscription of PaperAtlas, sold in four lengths of time. Every
 *  label is a dictionary key, so the whole grid follows the language switch
 *  without a second copy to maintain.
 *
 *  The price stays written once, in dinars, per month: each length multiplies
 *  it, and the reader sees the result in the money of the country on screen.
 *  Long lengths pay a little less per month — the year offers its last month. */

import {
  PRIX_PREMIUM_DZD,
  formaterMontant,
  montantArrondiDzd,
  prixEnDevise,
  prixLocal,
  type PrixLocal,
} from '@/lib/tarif';

export type PlanId = 'mensuel' | 'trimestriel' | 'semestre' | 'annee';

export type Plan = {
  id: PlanId;
  name: string;
  /** How many months the payment covers. */
  mois: number;
  /** What the whole period costs, in the reference money. */
  montantDzd: number;
  /** What the figure is « per »: « / mois », « / 3 mois », « / an ». */
  per: string;
  /** The three lines that say what this length brings. */
  includes: string[];
  /** One line that says who this length is for. */
  diff: string;
  cta: string;
  to: string;
  icon: string;
  featured?: boolean;
  /** What the sign-up form pre-fills once this card is clicked: the trade it
   *  starts on, and the example its establishment field shows. */
  signup: { metier: string; orgHint: string };
};

export const plans: Plan[] = [
  {
    id: 'mensuel',
    name: 'off.m1t',
    mois: 1,
    montantDzd: PRIX_PREMIUM_DZD,
    per: 'off.m1per',
    includes: ['off.m1i1', 'off.m1i2', 'off.m1i3'],
    diff: 'off.m1d',
    cta: 'off.m1cta',
    to: '/compte/inscription',
    icon: 'ri-calendar-line',
    signup: { metier: 'imprimerie', orgHint: 'cf.orgPh' },
  },
  {
    id: 'trimestriel',
    name: 'off.m2t',
    mois: 3,
    montantDzd: PRIX_PREMIUM_DZD * 3,
    per: 'off.m2per',
    includes: ['off.m2i1', 'off.m2i2', 'off.m2i3'],
    diff: 'off.m2d',
    cta: 'off.m2cta',
    to: '/compte/inscription',
    icon: 'ri-calendar-2-line',
    signup: { metier: 'imprimerie', orgHint: 'cf.orgPh' },
  },
  {
    id: 'semestre',
    name: 'off.m3t',
    mois: 6,
    montantDzd: 19250,
    per: 'off.m3per',
    includes: ['off.m3i1', 'off.m3i2', 'off.m3i3'],
    diff: 'off.m3d',
    cta: 'off.m3cta',
    to: '/compte/inscription',
    icon: 'ri-calendar-todo-line',
    signup: { metier: 'imprimerie', orgHint: 'cf.orgPh' },
  },
  {
    id: 'annee',
    name: 'off.m4t',
    mois: 12,
    montantDzd: PRIX_PREMIUM_DZD * 11,
    per: 'off.m4per',
    includes: ['off.m4i1', 'off.m4i2', 'off.m4i3'],
    diff: 'off.m4d',
    cta: 'off.m4cta',
    to: '/compte/inscription',
    icon: 'ri-calendar-check-line',
    featured: true,
    signup: { metier: 'imprimerie', orgHint: 'cf.orgPh' },
  },
];

export type FaqItem = { q: string; a: string };

export const faqItems: FaqItem[] = [
  { q: 'ofp.q1', a: 'ofp.a1' },
  { q: 'ofp.q2', a: 'ofp.a2' },
  { q: 'ofp.q3', a: 'ofp.a3' },
  { q: 'ofp.q4', a: 'ofp.a4' },
  { q: 'ofp.q5', a: 'ofp.a5' },
  { q: 'ofp.q6', a: 'ofp.a6' },
];

/** Every card on « Offres » carries an anchor, so a link can land on the very
 *  length it names instead of the top of the page. */
export const planAnchor = (id: PlanId) => `offre-${id}`;

/**
 * The address of that card, ready for a router link. It carries the market read
 * on screen when one is given, so the reader coming back from « Mon compte »
 * lands on the card with the same money.
 */
export const planCardHref = (id: PlanId | 'premium' | 'institutions', pays?: string | null) =>
  `/offres${pays ? `?pays=${encodeURIComponent(pays)}` : ''}#${planAnchor(id as PlanId)}`;

/**
 * The price of one length, read in the money of the country on screen. The
 * third argument is kept so existing call sites can pass their reader without
 * changing: the figure itself no longer needs a word.
 */
export function prixPlan(
  plan: Plan,
  pays: string | null | undefined,
  _t?: (k: string) => string,
): string {
  return prixEnDevise(plan.montantDzd, pays);
}

/** The same price, in full: the figure read in the country and the dinar amount
 *  it comes from, so a card can show both without recomputing anything. */
export function prixPlanLocal(plan: Plan, pays: string | null | undefined): PrixLocal {
  return prixLocal(plan.montantDzd, pays);
}

/** What one month comes to inside that length: the figure to compare. It is
 *  read from the figure the card prints for the whole length, divided by its
 *  months — never from the reference amount — so the month and the length can
 *  never tell two different stories in a market whose money rounds by step. */
export function prixParMoisLocal(plan: Plan, pays: string | null | undefined): PrixLocal {
  const total = montantArrondiDzd(plan.montantDzd, pays);
  const parMois = Math.round(total / plan.mois);
  return { ...prixLocal(plan.montantDzd, pays), montant: formaterMontant(parMois, pays) };
}

/** What the length saves against paying month after month, in dinars. */
export function economieDzd(plan: Plan): number {
  return Math.max(0, plan.mois * PRIX_PREMIUM_DZD - plan.montantDzd);
}

/**
 * The same saving, ready to print in the country's money. Null when none.
 *
 * It is the difference between the two figures the card itself prints: the
 * month read on the shortest length, multiplied by the months, minus the
 * figure of that length. Converting the saving on its own would round it a
 * second time and promise a number the reader cannot find by subtracting what
 * is on the card — in Egypt or Syria, where the money rounds by 25 or 500,
 * the gap was visible. A length that carries no real discount (the quarter)
 * has none, whatever the rounding of its two figures. */
export function economieLocale(
  plan: Plan,
  pays: string | null | undefined,
): string | null {
  if (economieDzd(plan) <= 0) return null;
  const plein = montantArrondiDzd(PRIX_PREMIUM_DZD, pays) * plan.mois;
  const paye = montantArrondiDzd(plan.montantDzd, pays);
  const economie = plein - paye;
  return economie > 0 ? formaterMontant(economie, pays) : null;
}

/**
 * How a subscription is paid: month by month, or once for the year. The value
 * is still written in the address by the pages that show two figures side by
 * side, so a link made on the tariff sheet opens the same reading.
 */
export type Facturation = 'mois' | 'annee';

/** True only for the two rhythms the pages know, so a stray value is ignored. */
export function isFacturation(valeur: string | null | undefined): valeur is Facturation {
  return valeur === 'mois' || valeur === 'annee';
}

/** The length a rhythm points at, so a two-figure sheet can open the sign-up
 *  form on the very plan it was reading. */
export function planDeFacturation(facturation: Facturation): PlanId {
  return facturation === 'annee' ? 'annee' : 'mensuel';
}

/**
 * The sign-up address of one length, opened on one market:
 * « /compte/inscription?plan=semestre&pays=SY ».
 */
export function lienInscription(id: PlanId, pays: string): string {
  return `/compte/inscription?plan=${id}&pays=${encodeURIComponent(pays)}`;
}

/** Reads back the length picked on a card, so the sign-up form can name it. */
export function planById(id: string | null): Plan | null {
  if (!id) return null;
  return plans.find((plan) => plan.id === id) ?? null;
}

/** True only for the four lengths, so a stored value stays valid. */
export function isPlanId(id: string | null | undefined): id is PlanId {
  return id === 'mensuel' || id === 'trimestriel' || id === 'semestre' || id === 'annee';
}