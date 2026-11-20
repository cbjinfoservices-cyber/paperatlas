/**
 * What a deposit is, and what it is about, as the board already writes it on
 * its public pages. The console stored the raw values (« offre », « materiel »,
 * « cdi ») and printed them as they were: an Arabic screen then carried Latin
 * words in the middle of its own sentence. The same vocabulary is read here, so
 * one deposit says the same thing on the board and in the back office.
 */

/** Nature of the deposit: an offer or a listing. */
const KIND: Record<string, string> = {
  offre: 'ad.ann.kindOffre',
  annonce: 'ad.ann.kindAnnonce',
};

/** The section a deposit sits in: the four listing families, then the four
 *  contract kinds of a job offer — they share the same field in the table. */
const RUBRIQUE: Record<string, string> = {
  materiel: 'ann.catMateriel',
  papier: 'ann.catPapier',
  service: 'ann.catService',
  recherche: 'ann.catRecherche',
  cdi: 'job.typeCdi',
  cdd: 'job.typeCdd',
  stage: 'job.typeStage',
  freelance: 'job.typeFreelance',
};

/** A stored value, stripped down to what the tables actually hold. */
function cle(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

/** The label key of a nature, or null when the deposit did not say. */
export function cleNature(value: string | null | undefined): string | null {
  return KIND[cle(value)] ?? null;
}

/** The label key of a section, or null when the value is unknown. */
export function cleRubrique(value: string | null | undefined): string | null {
  return RUBRIQUE[cle(value)] ?? null;
}

/** Les rubriques que le formulaire de dépôt propose, famille par famille : une
 *  annonce se range dans les quatre catégories d'annonce, une offre d'emploi
 *  dans les quatre contrats. Le formulaire de correction et la console lisent
 *  cette même liste, pour ne jamais écrire une valeur que l'autre refuse. */
const FAMILLE: Record<string, 'annonce' | 'offre'> = {
  materiel: 'annonce',
  papier: 'annonce',
  service: 'annonce',
  recherche: 'annonce',
  cdi: 'offre',
  cdd: 'offre',
  stage: 'offre',
  freelance: 'offre',
};

/** Les rubriques d'une famille, dans l'ordre du formulaire. */
export const RUBRIQUES_PAR_FAMILLE: Record<'annonce' | 'offre', string[]> = {
  annonce: ['materiel', 'papier', 'service', 'recherche'],
  offre: ['cdi', 'cdd', 'stage', 'freelance'],
};

/** La famille d'une rubrique enregistrée, ou null quand la valeur est inconnue. */
export function familleRubrique(
  value: string | null | undefined,
): 'annonce' | 'offre' | null {
  return FAMILLE[cle(value)] ?? null;
}

/** La rubrique enregistrée vient de l'autre famille : le dépôt porte encore une
 *  valeur que le formulaire d'aujourd'hui ne propose plus. La console et
 *  l'espace compte la signalent au lieu de la laisser passer. */
export function rubriqueHorsType(
  kind: string | null | undefined,
  rubrique: string | null | undefined,
): boolean {
  const famille = familleRubrique(rubrique);
  if (famille === null) return false;
  const type = cle(kind);
  if (type !== 'annonce' && type !== 'offre') return false;
  return famille !== type;
}