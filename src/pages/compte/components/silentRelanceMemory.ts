/**
 * Le jour de la dernière relance tentée, dossier par dossier. Une relance,
 * ici, c'est le geste d'ouvrir la conversation d'un candidat muet pour lui
 * écrire : la date se garde sur l'appareil, pour que la ligne du tri
 * « silence le plus long » puisse dire, au retour, quand on a essayé la
 * dernière fois — sans avoir à compter les jours de mémoire.
 */
const RELANCE_KEY = 'paperatlas:appl:relance';
/* Le repli des relances récentes se garde comme le tri et les filtres de la
   page : une visite qui laisse la ligne courte la retrouve courte au retour. */
const FOLD_KEY = 'paperatlas:appl:relance-fold';

type Relances = Record<string, string>;

function readAll(): Relances {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(RELANCE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>)
      .filter(([, value]) => typeof value === 'string' && (value as string).length > 0);
    return Object.fromEntries(entries) as Relances;
  } catch {
    return {};
  }
}

function writeAll(map: Relances): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(RELANCE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable — la ligne restera simplement muette */
  }
}

/** Toutes les relances tentées, la date de chacune — vide si rien n'a été essayé. */
export function readRelances(): Relances {
  return readAll();
}

/** Le jour de la dernière relance tentée sur ce dossier, "" s'il n'y en a pas. */
export function readRelanceAt(id: string): string {
  return readAll()[id] ?? '';
}

/** Une relance vient d'être tentée : le jour du geste est retenu pour ce dossier. */
export function noteRelance(id: string): Relances {
  if (!id) return readAll();
  const next = { ...readAll(), [id]: new Date().toISOString() };
  writeAll(next);
  return next;
}

/** Les relances repliées à la main, dossier par dossier — celles qu'on garde
 *  courtes d'une visite à l'autre. */
export function readRelanceFolds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(FOLD_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string' && value.length > 0);
  } catch {
    return [];
  }
}

function writeRelanceFolds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (!ids.length) window.localStorage.removeItem(FOLD_KEY);
    else window.localStorage.setItem(FOLD_KEY, JSON.stringify(ids));
  } catch {
    /* storage unavailable — le repli vaudra pour la visite seulement */
  }
}

/** Un clic sur le jeton de relance : le dossier se replie, ou se rouvre, et le
 *  choix est retenu sur l'appareil. */
export function toggleRelanceFold(id: string, current: string[]): string[] {
  if (!id) return current;
  const next = current.includes(id)
    ? current.filter((value) => value !== id)
    : [...current, id];
  writeRelanceFolds(next);
  return next;
}