/**
 * L'adresse d'un tableau telle qu'elle doit partir quand on la partage.
 *
 * Un lien partagé ne montre pas ce dont on se souvient mais ce qu'il annonce :
 * il porte donc le pays, la région que ce pays tient et la langue de lecture,
 * explicitement. Une région ne voyage jamais seule — sans son pays, elle ne
 * désigne plus rien —, et l'adresse la rend alors avec lui.
 */
export type ShareScope = {
  /** Le pays lu ; une chaîne vide veut dire « tous les pays ». */
  pays?: string;
  /** La région lue sous ce pays ; une chaîne vide la rend. */
  wilaya?: string;
  /** L'ordre de lecture du tableau ; une chaîne vide rend l'ordre du dépôt. */
  sort?: string;
  /** Le rayon lu, en kilomètres ; une chaîne vide rend le tableau entier. */
  rayon?: string;
  /** La lettre de l'index d'où l'on se tient ; une chaîne vide rend la liste
      à son premier écran. Elle ne suit qu'un ordre alphabétique. */
  lettre?: string;
};

/** L'adresse absolue d'un tableau, pays et région compris. */
export function boardShareUrl(href: string, lang: string, scope: ShareScope = {}): string {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return href;
  }

  if (scope.pays !== undefined) {
    if (scope.pays) url.searchParams.set('pays', scope.pays);
    else url.searchParams.delete('pays');
  }
  if (scope.wilaya !== undefined) {
    if (scope.wilaya) url.searchParams.set('wilaya', scope.wilaya);
    else url.searchParams.delete('wilaya');
  }

  /* L'ordre de lecture voyage avec le périmètre : le lien s'ouvre dans
     l'ordre annoncé, pas dans celui dont l'appareil se souvient. */
  if (scope.sort !== undefined) {
    if (scope.sort) url.searchParams.set('sort', scope.sort);
    else url.searchParams.delete('sort');
  }
  if (scope.rayon !== undefined) {
    if (scope.rayon) url.searchParams.set('rayon', scope.rayon);
    else url.searchParams.delete('rayon');
  }
  /* La lettre ne désigne un point que dans l'ordre alphabétique : elle ne
     part pas avec un autre rangement, où elle ne mènerait nulle part. */
  if (scope.lettre !== undefined) {
    const alphabetical = !url.searchParams.get('sort') || url.searchParams.get('sort') === 'name';
    if (scope.lettre && alphabetical) url.searchParams.set('lettre', scope.lettre);
    else url.searchParams.delete('lettre');
  }

  /* Une région sans son pays ne se relit nulle part : elle ne part pas. */
  if (!url.searchParams.get('pays')) url.searchParams.delete('wilaya');

  url.searchParams.set('lang', lang);
  return url.toString();
}