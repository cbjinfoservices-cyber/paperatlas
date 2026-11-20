import type { AuthorSort } from '@/pages/annuaire/components/AuthorTools';

export type AuteurMemory = {
  /** ISO country code the author list was read through, "" for every country. */
  pays: string;
  wilaya: string;
  genre: string;
  sort: AuthorSort;
  /** Decades of first publication the list was narrowed to (« 1990 » or « 1990,2000 »), "" for none. */
  open: string;
};

const KEY = 'paperatlas:auteurs-memory';

const SORTS: AuthorSort[] = ['pertinence', 'books', 'recent', 'first', 'generation', 'name'];

const EMPTY: AuteurMemory = { pays: '', wilaya: '', genre: '', sort: 'pertinence', open: '' };

function isSort(value: unknown): value is AuthorSort {
  return typeof value === 'string' && SORTS.includes(value as AuthorSort);
}

/** A generation is stored as the decade's first year, like the address carries
    it — one decade, or the two read side by side. */
function isDecade(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}(,\d{4})?$/.test(value);
}

/** Last author list the visitor read, so it can reopen exactly there. */
export function readAuteurMemory(): AuteurMemory {
  if (typeof window === 'undefined') return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...EMPTY };
    const record = parsed as Record<string, unknown>;
    return {
      pays: typeof record.pays === 'string' ? record.pays : '',
      wilaya: typeof record.wilaya === 'string' ? record.wilaya : '',
      genre: typeof record.genre === 'string' ? record.genre : '',
      sort: isSort(record.sort) ? record.sort : 'pertinence',
      open: isDecade(record.open) ? record.open : '',
    };
  } catch {
    return { ...EMPTY };
  }
}

function isDefault(memory: AuteurMemory): boolean {
  return !memory.pays && !memory.wilaya && !memory.genre && memory.sort === 'pertinence' && !memory.open;
}

/** Merge a partial update into the stored author search, keeping the rest intact. */
export function saveAuteurMemory(patch: Partial<AuteurMemory>) {
  if (typeof window === 'undefined') return;
  const next: AuteurMemory = { ...readAuteurMemory(), ...patch };
  try {
    if (isDefault(next)) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — the search simply is not remembered */
  }
}

export function clearAuteurMemory() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

/**
 * The address an author sheet hands back to the list: the remembered search,
 * both decades included, so the two generations stay open on return.
 */
export function auteurBackLink(): string {
  if (typeof window === 'undefined') return '/annuaire?kind=auteurs';
  const memory = readAuteurMemory();
  const params = new URLSearchParams();
  params.set('kind', 'auteurs');
  if (memory.pays) params.set('pays', memory.pays);
  if (memory.wilaya) params.set('wilaya', memory.wilaya);
  if (memory.genre) params.set('genre', memory.genre);
  if (memory.open) params.set('open', memory.open);
  if (memory.sort !== 'pertinence') params.set('sort', memory.sort);
  return `/annuaire?${params.toString()}`;
}