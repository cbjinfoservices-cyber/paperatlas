import { localeFor } from '@/i18n/localize';

/**
 * Le jour d'une copie, dit courtement : l'année ne s'écrit que si le geste
 * n'appartient pas à l'année en cours — la même écriture sous la rangée d'un
 * pays, sous une fiche et sous le compte des cartes de l'annuaire.
 */
export function jourCopie(stamp: number | null, lang: string): string {
  if (!stamp) return '';
  return new Intl.DateTimeFormat(localeFor(lang), {
    day: 'numeric',
    month: 'short',
    ...(new Date(stamp).getFullYear() === new Date().getFullYear()
      ? {}
      : { year: 'numeric' }),
  }).format(new Date(stamp));
}