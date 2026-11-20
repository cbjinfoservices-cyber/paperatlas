/**
 * Le rayon autour de la position, retenu sur l'appareil.
 *
 * Ce n'est pas un filtre de plus posé au hasard : c'est un périmètre de
 * lecture, comme la rubrique lue ou l'ordre de tri. Il est donc gardé d'une
 * visite à l'autre, tableau par tableau, pour que les annonces, les emplois et
 * le vivier des candidats se rouvrent au même périmètre.
 *
 * Une adresse explicite (`?rayon=100`) l'emporte toujours sur la mémoire :
 * un lien partagé montre ce qu'il annonce, jamais ce dont on se souvient.
 */

/** Les trois étapes du rayon, en kilomètres, communes aux quatre tableaux. */
export const RADIUS_STEPS = [50, 100, 200] as const;

/** Les tableaux qui se souviennent de leur rayon. */
export type RadiusBoard = 'annonces' | 'emplois' | 'candidats';

const KEY = 'paperatlas:board-radius';

type Store = Partial<Record<RadiusBoard, number>>;

const isStep = (value: number): boolean => (RADIUS_STEPS as readonly number[]).includes(value);

function readStore(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Store;
  } catch {
    return {};
  }
}

/** Le rayon retenu la dernière fois sur ce tableau ; 0 pour le tableau entier. */
export function readBoardRadius(board: RadiusBoard): number {
  const value = readStore()[board];
  return typeof value === 'number' && isStep(value) ? value : 0;
}

/** Garde le rayon choisi, ou l'oublie quand le tableau entier revient. */
export function saveBoardRadius(board: RadiusBoard, km: number): void {
  if (typeof window === 'undefined') return;
  const next: Store = { ...readStore() };
  if (isStep(km)) next[board] = km;
  else delete next[board];
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible — le rayon n'est simplement pas mémorisé */
  }
}