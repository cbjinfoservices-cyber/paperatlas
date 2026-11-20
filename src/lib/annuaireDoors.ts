import { entreprises, type Trade } from '@/mocks/entreprises';
import { paysDe } from '@/lib/pays';

/**
 * Les portes de l'annuaire, comptées depuis les fiches elles-mêmes.
 *
 * Le relevé de parcours dit ce que chaque porte tient encore, et les listes
 * disent combien de leurs lignes n'ont plus de porte : les deux lectures
 * doivent s'appuyer sur le même compte, sans quoi une pastille annoncerait des
 * fiches qu'une ligne déclarerait absentes. Le compte vit donc ici, une seule
 * fois, et le relevé comme le vivier le lisent à la même source.
 */

/** Combien de fiches une région — ou un pays — tient encore. */
export const regionFiches = (stop: { wilaya: string; pays?: string | null }): number =>
  entreprises.filter(
    (e) => e.wilaya === stop.wilaya && (!stop.pays || paysDe(e) === stop.pays),
  ).length;

/** Combien de fiches un pays entier tient encore. */
export const paysFiches = (code: string): number =>
  entreprises.filter((e) => paysDe(e) === code).length;

/** Combien de fiches un métier tient encore, partout où il se pratique. */
export const tradeFiches = (trade: string): number =>
  entreprises.filter((e) => e.trade === trade).length;

/**
 * Le métier d'un compte et celui d'une fiche ne portent pas le même mot :
 * l'inscription parle d'« imprimerie », l'annuaire d'« impression ». Sans ce
 * passage, une porte paraîtrait vide alors qu'elle est pleine — et le compte
 * des profils sans porte serait faux.
 */
const COMPTE_TO_TRADE: Record<string, Trade> = {
  imprimerie: 'impression',
  impression: 'impression',
  edition: 'edition',
  librairie: 'librairie',
  faconnage: 'faconnage',
  agence: 'communication',
  communication: 'communication',
  auteur: 'ecrivain',
  ecrivain: 'ecrivain',
  fournisseur: 'fournisseurs',
  fournisseurs: 'fournisseurs',
  bibliotheque: 'bibliotheque',
};

/** Le métier de l'annuaire que porte un métier de compte, s'il en a un. */
export const tradeOfMetier = (metier?: string | null): Trade | '' => {
  const key = (metier ?? '').trim().toLowerCase();
  return COMPTE_TO_TRADE[key] ?? '';
};

/**
 * Un profil a une porte vide quand sa région, ou son métier, n'ouvre plus
 * aucune fiche dans l'annuaire : il se nomme, mais la liste derrière la porte
 * n'existe pas. Un profil sans région ni métier déclaré n'a pas de porte à
 * proprement parler — il n'est donc pas compté.
 */
export const emptyDoorKinds = (profil: {
  metier?: string | null;
  wilaya?: string | null;
  pays?: string | null;
}): { region: boolean; trade: boolean } => {
  const trade = tradeOfMetier(profil.metier);
  const wilaya = (profil.wilaya ?? '').trim();
  return {
    trade: Boolean(trade) && tradeFiches(trade) === 0,
    region: Boolean(wilaya) && regionFiches({ wilaya, pays: profil.pays ?? '' }) === 0,
  };
};

export const doorStaysEmpty = (profil: {
  metier?: string | null;
  wilaya?: string | null;
  pays?: string | null;
}): boolean => {
  const kinds = emptyDoorKinds(profil);
  return kinds.trade || kinds.region;
};