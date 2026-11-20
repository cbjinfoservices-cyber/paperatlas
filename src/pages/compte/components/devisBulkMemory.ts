/**
 * The day the last grouped recap left, kept per account so the B2B workbook can
 * write the very same date at the bottom of its « Synthèse » tab — the list of
 * quotes stays the source, this only remembers what it already reads.
 */
const PREFIX = 'paperatlas.devis.lastBulk';

/** The number of quotes that send carried, kept beside the day. */
const COUNT_PREFIX = 'paperatlas.devis.lastBulkCount';

/**
 * How many quotes of the account no grouped recap has ever carried yet. Read
 * from the list itself, kept here so the B2B workbook can write it beside the
 * day of the last send — one list, one count, two surfaces.
 */
const NEVER_PREFIX = 'paperatlas.devis.bulkNever';

/** One memory per account: two members on the same browser never share it. */
export function bulkKey(userId: string) {
  return `${PREFIX}.${userId}`;
}

/** The count memory of the same account, written with the day. */
export function bulkCountKey(userId: string) {
  return `${COUNT_PREFIX}.${userId}`;
}

/** The « jamais repris » memory of the same account. */
export function bulkNeverKey(userId: string) {
  return `${NEVER_PREFIX}.${userId}`;
}

/** One file carried by a group send, with the very day it left. */
export type BulkRef = { reference: string; at: string };

/**
 * The files the last group send carried, one by one, kept beside its day: the
 * B2B summary can then name them instead of only counting them.
 */
const REFS_PREFIX = 'paperatlas.devis.lastBulkRefs';

/** The references memory of the same account. */
export function bulkRefsKey(userId: string) {
  return `${REFS_PREFIX}.${userId}`;
}

/**
 * The references of the last group send, or an empty list when nothing is
 * known. Each entry keeps the day it left, so a row never borrows another
 * send's date.
 */
export function readLastBulkRefs(key: string): BulkRef[] {
  if (!key) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { at?: string; refs?: BulkRef[] } | null;
    if (!parsed || !Array.isArray(parsed.refs)) return [];
    return parsed.refs.filter(
      (entry): entry is BulkRef =>
        Boolean(entry) &&
        typeof entry.reference === 'string' &&
        typeof entry.at === 'string' &&
        Number.isFinite(new Date(entry.at).getTime()),
    );
  } catch {
    return [];
  }
}

/** The day that list belongs to, or null when no send is known. */
export function readLastBulkRefsAt(key: string): string | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: string } | null;
    if (!parsed?.at) return null;
    return Number.isFinite(new Date(parsed.at).getTime()) ? parsed.at : null;
  } catch {
    return null;
  }
}

/**
 * Writes the references of that very send down, with its day. Only a list that
 * really left is written: an empty send keeps the previous one instead of
 * erasing the trace of what did go out.
 */
export function saveLastBulkRefs(key: string, iso: string | null, refs: BulkRef[]) {
  if (!key || !iso || refs.length === 0) return;
  const stamp = new Date(iso).getTime();
  if (!Number.isFinite(stamp)) return;
  try {
    const kept = readLastBulkRefsAt(key);
    const keptStamp = kept ? new Date(kept).getTime() : NaN;
    /* Only ever moves forward, like the day beside it. */
    if (Number.isFinite(keptStamp) && keptStamp > stamp) return;
    window.localStorage.setItem(key, JSON.stringify({ at: iso, refs }));
  } catch {
    /* the workbook still works, it just cannot name the files */
  }
}

/** The stored day, or null when no grouped recap is known for this account. */
export function readLastBulk(key: string): string | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const stamp = new Date(raw).getTime();
    if (!Number.isFinite(stamp)) return null;
    return raw;
  } catch {
    return null;
  }
}

/** How many quotes that very send carried, or 0 when nothing is known. */
export function readLastBulkCount(key: string): number {
  if (!key) return 0;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * How many quotes no grouped recap has ever carried, or null when the list has
 * never been read on this browser — a missing reading stays missing rather than
 * turning into a confident zero.
 */
export function readLastBulkNever(key: string): number | null {
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  } catch {
    return null;
  }
}

/**
 * Writes that reading down, so the B2B workbook can close its summary with it.
 * Zero is a real answer — it says every quote already went out once.
 */
export function saveLastBulkNever(key: string, count: number) {
  if (!key || !Number.isFinite(count) || count < 0) return;
  try {
    window.localStorage.setItem(key, String(Math.round(count)));
  } catch {
    /* the list still works, it just forgets the count */
  }
}

/** Best-effort: a private window must not break the export or the list. */
export function saveLastBulk(key: string, iso: string | null, count?: number) {
  if (!key || !iso) return;
  const stamp = new Date(iso).getTime();
  if (!Number.isFinite(stamp)) return;
  try {
    const kept = readLastBulk(key);
    const keptStamp = kept ? new Date(kept).getTime() : NaN;
    /* Only ever moves forward: an older send can never overwrite a newer one. */
    if (Number.isFinite(keptStamp) && keptStamp > stamp) return;
    window.localStorage.setItem(key, iso);
    /* The count travels with the day it belongs to: the workbook writes them
       side by side, so the two can never come from two different sends. */
    const countKey = key.replace(PREFIX, COUNT_PREFIX);
    if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
      window.localStorage.setItem(countKey, String(Math.round(count)));
    }
  } catch {
    /* the export still works, it just forgets the day */
  }
}