import { entreprises } from '@/mocks/entreprises';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import type { Lang } from '@/i18n/dict';

/**
 * Combien d'ateliers de façonnage tiennent boutique aujourd'hui.
 *
 * Le chiffre est calculé une seule fois, ici : le rang, le panneau, la feuille
 * du téléphone et le pied de page le lisent tous à la même source, et ne
 * peuvent donc pas se contredire.
 */
export const FACONNAGE_COUNT = entreprises.filter((e) => e.trade === 'faconnage').length;

/**
 * Le libellé suit le chiffre.
 *
 * Un réseau qui n'a qu'un atelier ne dit pas « Façonniers 1 » : le nom se met
 * au singulier dans les trois langues, et c'est cette clé-là que toutes les
 * portes lisent. Une seule tournure à corriger si le réseau change.
 */
export const FACONNAGE_LABEL = FACONNAGE_COUNT === 1 ? 'foot.faconnier' : 'foot.faconniers';

/**
 * L'adresse du façonnage, dans le périmètre lu.
 *
 * La pastille du rang, le raccourci du panneau, la feuille du téléphone et le
 * pied de page mènent tous au même endroit : l'annuaire déjà filtré sur le
 * façonnage, la région et le pays retenus. Un lien copié rouvre donc la même
 * vue, et le chiffre annoncé est exactement celui qu'on retrouve en l'ouvrant.
 */
export function faconnerieHref(region: string, pays: string): string {
  const next = new URLSearchParams();
  next.set('trade', 'faconnage');
  if (pays) next.set('pays', pays);
  if (region) next.set('wilaya', region);
  return `/annuaire?${next.toString()}`;
}

/**
 * Le nom du métier suit le chiffre : un périmètre qui n'en tient qu'un ne dit
 * pas « Façonniers 1 ». La clé est rendue telle quelle, à traduire par l'appelant.
 */
export function faconnageLabelKey(count: number): string {
  return count === 1 ? 'foot.faconnier' : 'foot.faconniers';
}

/**
 * Le périmètre qui n'a rien donné, nommé.
 *
 * Un état vide ne dit pas « aucun façonnier » tout court : il nomme le métier
 * retenu et le lieu où l'on a cherché, pour que le lecteur sache exactement ce
 * qui vient d'être écarté. La région est écrite dans la langue lue, le pays
 * aussi, et le fragment se pose après le libellé du métier — le tout dans les
 * trois langues, sans conjugaison à deviner.
 */
export function facEmptyTitle(
  lang: Lang,
  t: (key: string) => string,
  region: string,
  pays: string,
): string {
  const trade = t('trade.faconnage');
  const lieuRegion = region ? nomRegion(region, lang) : '';
  const lieuPays = pays ? nomPays(pays, lang) : '';
  const lieu = lieuRegion && lieuPays
    ? `${lieuRegion}${lang === 'ar' ? '، ' : ', '}${lieuPays}`
    : lieuRegion || lieuPays;

  if (!lieu) return `${trade} — ${t('dir.facEmpty')}`;
  if (lang === 'ar') return `${trade} — ${t('dir.facEmptyNone')} في ${lieu}`;
  if (lang === 'en') return `${trade} — ${t('dir.facEmptyNone')} in ${lieu}`;
  return `${trade} — ${t('dir.facEmptyNone')} : ${lieu}`;
}