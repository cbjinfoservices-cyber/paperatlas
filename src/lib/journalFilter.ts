/**
 * The journal of the formula moves lives on « Mon compte », behind the login.
 * A public page may want to hand it over already narrowed — « show me this
 * month » — so the choice travels in the address, and survives the sign-in
 * detour in a one-shot memory.
 *
 * The memory is read once and erased at once: it says where the reader wanted
 * to land, not how the journal should always open.
 */

export type JournalFilter = 'all' | 'up' | 'down' | 'inst' | 'month';

export const JOURNAL_FILTERS: JournalFilter[] = ['all', 'up', 'down', 'inst', 'month'];

const KEY = 'paperatlas-journal-filter';
const MONTH_KEY = 'paperatlas-journal-month';

export function isJournalFilter(value: string | null | undefined): value is JournalFilter {
  return typeof value === 'string' && (JOURNAL_FILTERS as string[]).includes(value);
}

/** Keep the wanted cut for the next page load — used before leaving a public
 *  page for the member journal. */
export function keepJournalFilter(filter: JournalFilter): void {
  try {
    window.sessionStorage.setItem(KEY, filter);
  } catch {
    /* A browser that refuses storage simply loses the intent. */
  }
}

/** Read the kept cut without erasing it — a render may run twice before the
 *  memory is cleared once, after mount. */
export function peekJournalFilter(): JournalFilter | null {
  try {
    const kept = window.sessionStorage.getItem(KEY);
    return isJournalFilter(kept) ? kept : null;
  } catch {
    return null;
  }
}

/** Forget the kept cut: it served its one arrival, the tabs alone decide now. */
export function clearJournalFilter(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* Storage refused: nothing was kept, nothing to forget. */
  }
}

/** Whether a value reads as a month bucket, `2026-05`. */
export function isMonthKey(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}$/.test(value);
}

/** The very month wanted behind « ce mois-ci » — a column of the six-month
 *  chart hands the journal its own month, not the one running now. */
export function keepJournalMonth(month: string): void {
  try {
    window.sessionStorage.setItem(MONTH_KEY, month);
  } catch {
    /* Storage refused: the address still carries the month. */
  }
}

/** Read the kept month without erasing it — see `peekJournalFilter`. */
export function peekJournalMonth(): string | null {
  try {
    const kept = window.sessionStorage.getItem(MONTH_KEY);
    return isMonthKey(kept) ? kept : null;
  } catch {
    return null;
  }
}

/** Forget the kept month: the journal opens on the month running now. */
export function clearJournalMonth(): void {
  try {
    window.sessionStorage.removeItem(MONTH_KEY);
  } catch {
    /* Nothing was kept. */
  }
}

/** `/compte?journal=month&jm=2026-05#journal-formules` — the journal, already
 *  narrowed, on one exact month when a month is given. */
export function journalHref(filter: JournalFilter, month?: string): string {
  const tail = isMonthKey(month) ? `&jm=${month}` : '';
  return `/compte?journal=${filter}${tail}#journal-formules`;
}