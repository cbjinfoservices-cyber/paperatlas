/**
 * L'ordre de lecture du vivier des candidats, retenu sur l'appareil.
 *
 * Comme le tri des annonces et des emplois, ce n'est pas un filtre : les mêmes
 * profils sont lus dans un autre ordre. Le choix est donc gardé d'une visite à
 * l'autre, « temps de trajet » compris, pour que le vivier se rouvre dans
 * l'ordre où il a été laissé.
 *
 * Une adresse explicite (`?sort=trip`) l'emporte toujours sur la mémoire : un
 * lien partagé montre ce qu'il annonce, jamais ce dont on se souvient.
 */

/** Les ordres que le vivier sait retenir, du plus courant au plus rare. */
export type VivierSort = 'recent' | 'oldest' | 'name' | 'pays' | 'trip';

const MODES: VivierSort[] = ['recent', 'oldest', 'name', 'pays', 'trip'];

const KEY = 'pa.boardSort.candidats';

/** L'ordre retenu la dernière fois ; vide quand rien n'a encore été choisi. */
export function readVivierSort(): VivierSort | '' {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(KEY);
    return MODES.find((mode) => mode === raw) ?? '';
  } catch {
    return '';
  }
}

/** Le même choix, écrit à chaque geste dans le menu ou à la remise à zéro. */
export function saveVivierSort(mode: VivierSort | ''): void {
  if (typeof window === 'undefined') return;
  try {
    if (MODES.includes(mode as VivierSort)) window.localStorage.setItem(KEY, mode as string);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* Le stockage peut être refusé : le menu fonctionne quand même. */
  }
}