/** The columns of the twelve-month table, each one a way of reading the year. */
export type B2bYearSortKey =
  | 'month'
  | 'closed'
  | 'documented'
  | 'measurable'
  | 'avg'
  | 'wait'
  | 'delta'
  | 'below'
  | 'over';

export type B2bYearSortDir = 'asc' | 'desc';

export type B2bYearSort = { key: B2bYearSortKey; dir: B2bYearSortDir };

const KEYS: B2bYearSortKey[] = [
  'month',
  'closed',
  'documented',
  'measurable',
  'avg',
  'wait',
  'delta',
  'below',
  'over',
];

/** The order the table opens on: the year as it happened, oldest first. */
const DEFAULT_SORT: B2bYearSort = { key: 'month', dir: 'asc' };

/**
 * The sort of the twelve-month table is remembered per account, next to the
 * duel and the period: a member who reads its year by reply time finds the same
 * column waiting for them, instead of the chronological order every morning.
 * The key hangs off the same account memory the duel uses, so nothing new has
 * to be passed down.
 */
export function yearSortKey(memoryKey: string) {
  return `${memoryKey}.yearSort`;
}

/** The stored sort, or the chronological order when nothing readable is there. */
export function readYearSort(memoryKey: string): B2bYearSort {
  try {
    const raw = window.localStorage.getItem(yearSortKey(memoryKey));
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw) as Partial<B2bYearSort> | null;
    const key = parsed?.key;
    if (typeof key !== 'string' || !KEYS.includes(key as B2bYearSortKey)) {
      return DEFAULT_SORT;
    }
    const dir = parsed?.dir === 'desc' ? 'desc' : 'asc';
    return { key: key as B2bYearSortKey, dir };
  } catch {
    return DEFAULT_SORT;
  }
}

/*
 * The tint of the rows under their target.
 *
 * Reading the table on a shared screen is not reading it alone: the tint is a
 * help for one reader and a hindrance for another. It is therefore switchable,
 * and remembered per account like the sort it sits next to.
 */
export function yearTintKey(memoryKey: string) {
  return `${memoryKey}.yearTint`;
}

/** The tint is on unless it was explicitly switched off. */
export function readYearTint(memoryKey: string): boolean {
  try {
    return window.localStorage.getItem(yearTintKey(memoryKey)) !== 'off';
  } catch {
    return true;
  }
}

export function saveYearTint(memoryKey: string, tint: boolean) {
  try {
    window.localStorage.setItem(yearTintKey(memoryKey), tint ? 'on' : 'off');
  } catch {
    /* the table still reads, it just forgets the tint */
  }
}

/*
 * The filtered reading of the year.
 *
 * The foot's count keeps only the months past the workshop threshold. That is
 * a reading, not an accident: a member who reads the year that way finds it
 * again on return, exactly like the order of the columns it sits under.
 */
export function yearOverKey(memoryKey: string) {
  return `${memoryKey}.yearOver`;
}

/** The filter is off unless it was explicitly left on. */
export function readYearOverOnly(memoryKey: string): boolean {
  try {
    return window.localStorage.getItem(yearOverKey(memoryKey)) === 'on';
  } catch {
    return false;
  }
}

export function saveYearOverOnly(memoryKey: string, on: boolean) {
  try {
    window.localStorage.setItem(yearOverKey(memoryKey), on ? 'on' : 'off');
  } catch {
    /* the table still filters, it just forgets which cut was open */
  }
}

/** A tiny string, kept on a best-effort basis: private mode must not break it. */
export function saveYearSort(memoryKey: string, sort: B2bYearSort) {
  try {
    window.localStorage.setItem(
      yearSortKey(memoryKey),
      JSON.stringify({ key: sort.key, dir: sort.dir }),
    );
  } catch {
    /* the table still sorts, it just forgets which column */
  }
}