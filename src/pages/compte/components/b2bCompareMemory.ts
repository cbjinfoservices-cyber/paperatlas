const PREFIX = 'paperatlas.b2b.compare';

/**
 * The two months picked on the correction bars are remembered per account, so
 * coming back to the box finds the duel still standing — a member does not have
 * to click the same two thin bars every morning.
 */
export function compareKey(userId: string) {
  return `${PREFIX}.${userId}`;
}

/** The stored pair, oldest pick first. Anything unreadable is simply dropped. */
export function readCompare(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((value): value is string => typeof value === 'string')
      .filter((value) => /^\d{4}-\d{2}$/.test(value))
      .filter((value, index, list) => list.indexOf(value) === index)
      .slice(0, 2);
  } catch {
    return [];
  }
}

/** A tiny string, kept on a best-effort basis: private mode must not break it. */
export function saveCompare(key: string, months: string[]) {
  try {
    const clean = months.filter((value) => /^\d{4}-\d{2}$/.test(value)).slice(0, 2);
    if (clean.length === 0) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(clean));
  } catch {
    /* the duel still works, it just forgets */
  }
}