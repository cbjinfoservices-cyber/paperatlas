/**
 * « Dernière demande ouverte depuis le rappel » — the memory of the shortcut
 * itself, not of the requests.
 *
 * The reminder on the bar is a door: this keeps the trace of the last time it
 * was actually used, with the reference it opened on, so a workshop can tell
 * whether the shortcut serves at all — or whether it is only decoration.
 *
 * Kept on the device only: this is a usage mark, not a shared business fact,
 * and it must never be mixed with the requests themselves.
 */
const KEY = 'paperatlas:b2b-late-open';
const EVENT = 'b2b:recall';
const DAY_MS = 24 * 3600 * 1000;

export type LateRecall = {
  /** ISO stamp of the last time the reminder was taken. */
  at: string;
  /** The request it opened on, when the reminder knew its reference. */
  ref: string | null;
  /**
   * How many requests this very opening flipped to « vue ». Zero when every
   * request of the cut had already been read; null when the trace predates the
   * count. What the shortcut served is a figure, not an impression.
   */
  seen: number | null;
  /**
   * Which door was taken: the inbox chip itself, the account strip, or the bar
   * reminder. Same opening, three ways in — and the trace says which one, so a
   * shortcut nobody clicks can be told apart from a chip that does the work.
   * Null on a trace written before the source was kept.
   */
  source: LateRecallSource | null;
};

/** The three doors that lead to the same cut. */
export type LateRecallSource = 'chip' | 'strip' | 'reminder';

function readSource(value: unknown): LateRecallSource | null {
  return value === 'chip' || value === 'strip' || value === 'reminder' ? value : null;
}

/** The stored trace, or null when there is none — or nothing readable. */
export function readLateRecall(): LateRecall | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      at?: unknown;
      ref?: unknown;
      seen?: unknown;
      source?: unknown;
    };
    const at = typeof parsed?.at === 'string' ? parsed.at : '';
    if (!at || !Number.isFinite(new Date(at).getTime())) return null;
    const ref = typeof parsed?.ref === 'string' && parsed.ref ? parsed.ref : null;
    /* An older trace never carried the count: it reads as « unknown », never as
       « nothing was marked », which would be a false statement. */
    const rawSeen = Number(parsed?.seen);
    const seen = parsed?.seen !== null && parsed?.seen !== undefined && Number.isFinite(rawSeen) && rawSeen >= 0
      ? Math.round(rawSeen)
      : null;
    return { at, ref, seen, source: readSource(parsed?.source) };
  } catch {
    return null;
  }
}

/**
 * How many whole days have passed since that opening. Null when there is no
 * trace: a reminder never used must read as « nothing », not as « today ».
 */
export function daysSinceRecall(recall: LateRecall | null): number | null {
  if (!recall) return null;
  const at = new Date(recall.at).getTime();
  if (!Number.isFinite(at)) return null;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

/**
 * Stamps the opening. Called from the one place the late cut is really applied,
 * so both entries — the bar's reminder and the account's counter — leave the
 * very same trace.
 */
export function markLateRecall(
  ref: string | null,
  seen: number | null = null,
  source: LateRecallSource | null = null,
): LateRecall | null {
  if (typeof window === 'undefined') return null;
  const rawSeen = Number(seen);
  const next: LateRecall = {
    at: new Date().toISOString(),
    ref: ref || null,
    seen: seen !== null && Number.isFinite(rawSeen) && rawSeen >= 0 ? Math.round(rawSeen) : null,
    source,
  };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Storage refused (private mode): the mark simply is not kept. */
    return null;
  }
  window.dispatchEvent(new Event(EVENT));
  return next;
}

/** The bar listens: a trace written from the account page must show up at once. */
export function onLateRecall(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}