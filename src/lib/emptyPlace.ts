import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import type { Lang } from '@/i18n/dict';

/**
 * Le lieu d'un état vide, nommé.
 *
 * Un tableau qui ne tient plus rien ne dit pas seulement « aucun résultat » :
 * il nomme le lieu qu'on vient d'écarter — « aucune fiche à Oran », « aucune
 * annonce à Oran », « aucune offre en Algérie ». La région s'écrit dans la
 * langue lue, le pays aussi, et les deux se suivent quand la recherche est
 * resserrée sur une région.
 *
 * La phrase elle-même vient de la table : chaque tableau nomme ce qu'il
 * compte, sans réécrire la règle des lieux. Sans lieu retenu, la fonction
 * rend une chaîne vide : l'appelant garde alors sa phrase générale, qui dit
 * vrai.
 */
export function emptyPlaceLine(
  lang: Lang,
  t: (key: string) => string,
  region: string,
  pays: string,
  key: string,
): string {
  const lieuRegion = region ? nomRegion(region, lang) : '';
  const lieuPays = pays ? nomPays(pays, lang) : '';
  const lieu = lieuRegion && lieuPays
    ? `${lieuRegion}${lang === 'ar' ? '، ' : ', '}${lieuPays}`
    : lieuRegion || lieuPays;

  if (!lieu) return '';
  return t(key).replace('{place}', lieu);
}

/** La phrase de l'annuaire : une fiche, ou un profil d'auteur. */
export function emptyPlaceTitle(
  lang: Lang,
  t: (key: string) => string,
  region: string,
  pays: string,
  author = false,
): string {
  return emptyPlaceLine(lang, t, region, pays, author ? 'dir.emptyPlaceAuthor' : 'dir.emptyPlaceFiche');
}