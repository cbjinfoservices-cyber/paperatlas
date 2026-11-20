import { nomPays } from '@/lib/pays';
import { fichesDesPays, type RegionMonde } from '@/lib/worldRegions';

/** Le traducteur de la page, tel que le fournisseur de langue le donne. */
type Traduire = (key: string) => string;

/**
 * Les pays d’une aire, le plus fourni d’abord et les ex æquo tranchés par le
 * nom, chacun avec ses fiches : le survol du geste court les nomme un à un,
 * si bien que le message se mesure avant d’être collé. La même phrase sert sur
 * la fiche d’un atelier, sur celle d’une plume et dans les cartes de
 * l’annuaire — une seule écriture pour un seul geste.
 */
export function paysDeAireTexte(
  region: RegionMonde,
  lang: string,
  t: Traduire,
  unit: string,
): string {
  const list = [...region.pays]
    .map((code) => ({ code, files: fichesDesPays([code]), nom: nomPays(code, lang) }))
    .sort((a, b) => b.files - a.files || a.nom.localeCompare(b.nom, lang))
    .map(({ files, nom }) => t('cmaps.aireCopyCountryRow')
      .replace('{pays}', nom)
      .replace('{files}', String(files))
      .replace('{unit}', unit))
    .join(' · ');
  if (!list) return '';
  return t('cmaps.aireCopyCountries').replace('{list}', list);
}