import { B2B_MOTIF_KEYS, type B2bMotifKey } from '@/lib/b2b';

/**
 * What the inbox remembers between two visits: the month and the reason last
 * read, plus the period and the order of the list. A `gap:2026-10` pick carries both at once, and so do `lot:2026-10` for
 * the catch-ups of a single month, `cleared:2026-10` for its corrections and
 * `origin:2026-10` for the traces it gave at the close.
 * `rework` is the hardest cut of all: the fiches taken back over twice.
 * `stale` is the opposite one: corrected fiches left in peace for over a month.
 */
export type B2bMotifPick =
  | 'all'
  | 'none'
  | 'lot'
  | 'cleared'
  | 'rework'
  | 'stale'
  | 'gapAll'
  | B2bMotifKey
  | `gap:${string}`
  | `lot:${string}`
  | `cleared:${string}`
  | `origin:${string}`
  | `month:${string}`;

const PREFIX = 'paperatlas.b2b.motifPick';
const VIEW_PREFIX = 'paperatlas.b2b.view';

/** The two other cuts of the toolbar: the window read, the order kept, and
 * which of the two tabs the member was reading. The unread cuts come back too
 * — « à traiter », « en retard », « plus d'une semaine » et « jamais ouverte »
 * sont des lectures, pas des accidents, et un membre qui a quitté sur la puce
 * « plus d'une semaine » y revient. */
export type B2bViewMemory = {
  period: 'all' | 'd7' | 'month';
  /** Newest first, oldest first — or, on the week cut, the longest wait first. */
  sort: 'recent' | 'oldest' | 'wait';
  /** Received or sent: a member who left on « envoyées » comes back to it. */
  tab: 'received' | 'sent';
  /** The unread cut the member was reading, next to the reason cut — plus the
   *  public tenders cut, which is a reading of the same kind. */
  filter: 'all' | 'todo' | 'late' | 'week' | 'never' | 'marche';
};

const EMPTY_VIEW: B2bViewMemory = {
  period: 'all',
  sort: 'recent',
  tab: 'received',
  filter: 'all',
};

/** One view per account, next to the reason and the duel: a member's habits. */
export function viewKey(userId: string) {
  return `${VIEW_PREFIX}.${userId}`;
}

/** The stored window and order, or the defaults when nothing readable is there. */
export function readView(key: string): B2bViewMemory {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return EMPTY_VIEW;
    const parsed = JSON.parse(raw) as Partial<B2bViewMemory> | null;
    const period =
      parsed?.period === 'd7' || parsed?.period === 'month' ? parsed.period : 'all';
    const sort =
      parsed?.sort === 'oldest' || parsed?.sort === 'wait' ? parsed.sort : 'recent';
    /* A stored tab that was never written reads as the received one, so an old
       memory keeps working after this field appeared. */
    const tab = parsed?.tab === 'sent' ? 'sent' : 'received';
    /* Same for the unread cut: an old memory that never carried it reads as
       « tout », and an unknown value does not invent a filter. */
    const filter =
      parsed?.filter === 'todo' ||
      parsed?.filter === 'late' ||
      parsed?.filter === 'week' ||
      parsed?.filter === 'never' ||
      parsed?.filter === 'marche'
        ? parsed.filter
        : 'all';
    return { period, sort, tab, filter };
  } catch {
    return EMPTY_VIEW;
  }
}

/** Best-effort, like the rest: a private window must not break the box. */
export function saveView(key: string, view: B2bViewMemory) {
  try {
    window.localStorage.setItem(key, JSON.stringify(view));
  } catch {
    /* the inbox still works, it just forgets the window and the order */
  }
}

/** One memory per account: two members on the same browser never share it. */
export function pickKey(userId: string) {
  return `${PREFIX}.${userId}`;
}

/** The stored cut, or « all » when nothing readable is there. */
export function readPick(key: string): B2bMotifPick {
  try {
    const raw = window.localStorage.getItem(key);
    return isPick(raw) ? raw : 'all';
  } catch {
    return 'all';
  }
}

/** Keeping a small string: private mode or a full quota must not break the box. */
export function savePick(key: string, pick: B2bMotifPick) {
  try {
    window.localStorage.setItem(key, pick);
  } catch {
    /* the inbox still works, it just forgets */
  }
}

function isPick(value: unknown): value is B2bMotifPick {
  if (typeof value !== 'string') return false;
  if (value === 'all' || value === 'none' || value === 'lot' || value === 'cleared') return true;
  if (value === 'rework') return true;
  if (value === 'stale') return true;
  if (value === 'gapAll') return true;
  if ((B2B_MOTIF_KEYS as readonly string[]).includes(value)) return true;
  return /^(gap|lot|cleared|origin):\d{4}-\d{2}$/.test(value);
}