/** Les deux tableaux qui gardent leur type sur l'appareil : la rubrique des
    annonces, le contrat des offres. L'annuaire a sa propre mémoire, déjà
    posée pour le tri et le rayon. */
export type BoardKind = 'annonces' | 'emplois';

const KEY = 'paperatlas:board-type';

type Store = Partial<Record<BoardKind, string>>;

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

/** Le type retenu la dernière fois sur ce tableau, "" quand rien n'a été choisi. */
export function readBoardType(kind: BoardKind): string {
  const value = readStore()[kind];
  return typeof value === 'string' ? value : '';
}

/** Garde le type choisi, ou l'oublie quand on rend la liste entière. */
export function saveBoardType(kind: BoardKind, value: string): void {
  if (typeof window === 'undefined') return;
  const next: Store = { ...readStore() };
  if (value) next[kind] = value;
  else delete next[kind];
  try {
    if (Object.keys(next).length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible — le type n'est simplement pas mémorisé */
  }
}