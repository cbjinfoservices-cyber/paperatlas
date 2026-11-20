import { nomsDemoAr } from '@/mocks/nomsAr';

/**
 * Le nom d'une fiche de démonstration, dans la langue de lecture.
 *
 * L'arabe est cherché dans le dictionnaire des noms ; tout le reste — le
 * français, l'anglais, et une fiche qui n'a pas encore son nom arabe — garde le
 * nom écrit dans la donnée. Une seule règle, donc, pour toutes les cartes, tous
 * les tableaux et toutes les fiches : le nom ne peut pas changer d'un écran à
 * l'autre.
 */
export function nomDemo(nom: string, lang: string): string {
  if (lang !== 'ar') return nom;
  return nomsDemoAr[nom] ?? nom;
}

/** Le nom latin et sa lecture arabe, réunis : la recherche d'un atelier ou
 *  d'une plume trouve la fiche dans les deux écritures. */
export function nomDemoCherchable(nom: string): string {
  const ar = nomsDemoAr[nom];
  return ar ? `${nom} ${ar}` : nom;
}