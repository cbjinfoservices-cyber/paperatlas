/**
 * La mémoire des menus de la barre.
 *
 * Un menu refermé ne doit pas oublier ce qu'il montrait : revenir sur la barre
 * après une fiche, une annonce ou une autre page retrouve le type déplié — et
 * la rubrique ouverte sous lui — au lieu de tout replier à chaque passage.
 *
 * Trois crans se retiennent : la porte, la suite qu'elle a ouverte — un pays,
 * une rubrique — et le cran d'en dessous, les régions d'un pays ou les
 * rubriques d'un pays. Déplier « Imprimeries › Algérie › Oran » et revenir
 * retrouve donc le même chemin, pas seulement la porte.
 *
 * Le souvenir tient dans l'onglet (`sessionStorage`) : il suit la visite d'un
 * bout à l'autre, sans survivre à sa fermeture. Une nouvelle visite repart
 * donc d'un menu au repos, la barre restant calme à l'arrivée.
 */
export type DoorMemory = {
  /** La porte de premier niveau dépliée, par son identifiant. */
  door: string;
  /** Ce qu'elle a ouvert : un pays, une rubrique. */
  sub: string;
  /** Le cran d'en dessous : une région, une rubrique d'un pays. */
  deep: string;
};

const EMPTY: DoorMemory = { door: '', sub: '', deep: '' };

/** Le souvenir d'un menu, lu par la clé qui décrit ses portes. */
export function readDoorMemory(key: string): DoorMemory {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<DoorMemory>;
    return {
      door: typeof parsed.door === 'string' ? parsed.door : '',
      sub: typeof parsed.sub === 'string' ? parsed.sub : '',
      deep: typeof parsed.deep === 'string' ? parsed.deep : '',
    };
  } catch {
    return EMPTY;
  }
}

/** Le même souvenir, écrit à chaque pli ou dépli — jamais au chargement. */
export function saveDoorMemory(key: string, door: string, sub: string, deep = ''): void {
  try {
    if (!door && !sub && !deep) {
      window.sessionStorage.removeItem(key);
      return;
    }
    window.sessionStorage.setItem(key, JSON.stringify({ door, sub, deep }));
  } catch {
    /* Le stockage peut être refusé : le menu fonctionne quand même. */
  }
}