import { RADII, type SortKey } from '@/pages/annuaire/components/DirectoryTools';

export type DirView = 'list' | 'map';

/** La rubrique lue en haut du tableau : les entreprises, ou les plumes. */
export type DirKind = 'entreprises' | 'auteurs';

export type DirMemory = {
  wilaya: string;
  radius: number | null;
  sort: SortKey;
  view: DirView;
  /** Opening decades the list was narrowed to, written as first years (« 1990 » or « 1990,2000 »), "" for none. */
  open: string;
  /** Le métier retenu sur la liste, "" quand tous les métiers sont lus. */
  trade: string;
  /** La rubrique du haut, retenue comme le tri : les entreprises ou les plumes. */
  kind: DirKind;
  /** Les pastilles de rubrique de la barre : les nouveaux arrivés, les institutions. */
  fresh: boolean;
  insti: boolean;
};

const KEY = 'paperatlas:dir-memory';

const SORTS: SortKey[] = ['pertinence', 'newest', 'first', 'generation', 'rating', 'capacity', 'etabs', 'distance', 'name'];

const EMPTY: DirMemory = {
  wilaya: '',
  radius: null,
  sort: 'pertinence',
  view: 'list',
  open: '',
  trade: '',
  kind: 'entreprises',
  fresh: false,
  insti: false,
};

function isRadius(value: unknown): value is number {
  return typeof value === 'number' && RADII.includes(value);
}

function isSort(value: unknown): value is SortKey {
  return typeof value === 'string' && SORTS.includes(value as SortKey);
}

function isView(value: unknown): value is DirView {
  return value === 'list' || value === 'map';
}

/** A generation is stored as the year it starts on (« 1990 »), or as the two
    decades read together (« 1990,2000 »), so the address and the memory agree. */
function isDecade(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}(,\d{4})?$/.test(value);
}

/** Last search the visitor ran, so the directory can reopen where they left it. */
export function readDirMemory(): DirMemory {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    const record = parsed as Record<string, unknown>;
    return {
      wilaya: typeof record.wilaya === 'string' ? record.wilaya : '',
      radius: isRadius(record.radius) ? record.radius : null,
      sort: isSort(record.sort) ? record.sort : 'pertinence',
      view: isView(record.view) ? record.view : 'list',
      open: isDecade(record.open) ? record.open : '',
      trade: typeof record.trade === 'string' ? record.trade : '',
      kind: record.kind === 'auteurs' ? 'auteurs' : 'entreprises',
      fresh: record.fresh === true,
      insti: record.insti === true,
    };
  } catch {
    return { ...EMPTY };
  }
}

function isDefault(memory: DirMemory): boolean {
  return !memory.wilaya && memory.radius === null && memory.sort === 'pertinence'
    && memory.view === 'list' && !memory.open && !memory.trade
    && memory.kind === 'entreprises' && !memory.fresh && !memory.insti;
}

/** Merge a partial update into the stored search, keeping the other half intact. */
export function saveDirMemory(patch: Partial<DirMemory>) {
  if (typeof window === 'undefined') return;
  const next: DirMemory = { ...readDirMemory(), ...patch };
  try {
    if (isDefault(next)) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the search simply is not remembered */
  }
}

export function clearDirMemory() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * Query string that reopens the remembered search. The radius and a distance
 * sort only make sense when a position is available, so they are dropped
 * otherwise instead of landing on an empty list.
 */
export function dirMemoryQuery(memory: DirMemory, hasPosition: boolean): string {
  const params = new URLSearchParams();
  if (memory.wilaya) params.set('wilaya', memory.wilaya);
  if (hasPosition && memory.radius) params.set('radius', String(memory.radius));
  if (memory.open) params.set('open', memory.open);
  if (memory.trade) params.set('trade', memory.trade);
  if (memory.kind === 'auteurs') params.set('kind', 'auteurs');
  if (memory.fresh) params.set('fresh', '1');
  if (memory.insti) params.set('insti', '1');
  if (memory.sort !== 'pertinence' && (memory.sort !== 'distance' || hasPosition)) {
    params.set('sort', memory.sort);
  }
  if (memory.view === 'map') params.set('view', 'map');
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * The address a workshop sheet hands back to the directory: the remembered
 * search, decades included, so the two generations being read are still there
 * when the visitor returns to the board.
 */
export function dirBackLink(hasPosition: boolean): string {
  return `/annuaire${dirMemoryQuery(readDirMemory(), hasPosition)}`;
}