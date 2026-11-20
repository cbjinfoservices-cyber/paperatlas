/**
 * Le choix « lire par » d'un tableau — rubriques, ou pays.
 *
 * Ce n'est pas un filtre : les mêmes lignes sont lues dans un autre ordre.
 * Le choix est donc retenu sur l'appareil, d'une visite à l'autre, pour que
 * le menu des annonces et celui des emplois se rouvrent dans l'ordre où ils
 * ont été laissés — comme la rubrique lue, elle, revient d'elle-même.
 *
 * Une adresse explicite (`?sort=pays`) l'emporte toujours sur la mémoire :
 * un lien partagé montre ce qu'il annonce, jamais ce dont on se souvient.
 */
export type BoardSort = 'rubrique' | 'pays' | 'date' | 'trip' | 'name';

/** Les ordres qu'un tableau sait retenir, du plus courant au plus rare. */
const MODES: BoardSort[] = ['rubrique', 'pays', 'date', 'trip', 'name'];

const keyOf = (board: string) => `pa.boardSort.${board}`;

/** L'ordre de lecture retenu pour un tableau ; rubriques par défaut. */
export function readBoardSort(board: string): BoardSort {
  if (typeof window === 'undefined') return 'rubrique';
  try {
    const raw = window.localStorage.getItem(keyOf(board));
    return MODES.find((mode) => mode === raw) ?? 'rubrique';
  } catch {
    return 'rubrique';
  }
}

/** Le même choix, écrit à chaque geste dans le menu ou dans le tableau. */
export function saveBoardSort(board: string, mode: BoardSort): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(keyOf(board), mode);
  } catch {
    /* Le stockage peut être refusé : le menu fonctionne quand même. */
  }
}