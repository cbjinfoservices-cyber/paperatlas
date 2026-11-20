const KEY = 'paperatlas.arrival-watch';

export type WatchPrefs = { wilaya: string; trades: string[]; email: string };

/** Remembers the last subscription so a returning visitor sees their search. */
export function readWatchPrefs(): Partial<WatchPrefs> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { wilaya?: unknown; trades?: unknown; trade?: unknown; email?: unknown };

    const trades = Array.isArray(parsed.trades)
      ? parsed.trades.filter((item): item is string => typeof item === 'string')
      /* an older entry stored a single trade code */
      : typeof parsed.trade === 'string' && parsed.trade
        ? [parsed.trade]
        : [];

    return {
      wilaya: typeof parsed.wilaya === 'string' ? parsed.wilaya : '',
      trades,
      email: typeof parsed.email === 'string' ? parsed.email : '',
    };
  } catch {
    return {};
  }
}

export function saveWatchPrefs(prefs: WatchPrefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* a private window may refuse storage; the subscription itself already went through */
  }
}