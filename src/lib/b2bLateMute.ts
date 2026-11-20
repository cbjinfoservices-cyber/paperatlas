/**
 * « Rappel en sourdine pour la journée » — the memory of the silence itself.
 *
 * The reminder on the bar nags until the work is done. A workshop that has seen
 * it and decided to answer tomorrow should be able to hush it for the day —
 * and the trace of that deferral is kept with it, so silence is never mistaken
 * for « nothing was waiting ».
 *
 * Kept on the device only: this is a reading comfort, not a business fact, and
 * it must never be mixed with the requests themselves.
 */
const KEY = 'paperatlas:b2b-late-mute';
/** The last silence that ran out on its own — the trace of the morning after. */
const END_KEY = 'paperatlas:b2b-late-mute-end';
const EVENT = 'b2b:mute';

export type LateMute = {
  /** When the silence was asked for. */
  at: string;
  /** Until when it holds — the very end of the day it was asked on. */
  until: string;
};

/** A silence that ran out: the reminder speaks again, and the day is kept. */
export type LateMuteEnd = {
  /** When the silence was asked for. */
  at: string;
  /** The instant it stopped holding — the day the reminder came back. */
  until: string;
};

/** The last instant of today, so the reminder comes back tomorrow morning. */
function endOfToday(): string {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

/**
 * The stored silence, or null when there is none — or when it has expired, in
 * which case the reminder simply speaks again on its own.
 */
export function readLateMute(): LateMute | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: unknown; until?: unknown };
    const at = typeof parsed?.at === 'string' ? parsed.at : '';
    const until = typeof parsed?.until === 'string' ? parsed.until : '';
    if (!at || !until) return null;
    const atTime = new Date(at).getTime();
    const untilTime = new Date(until).getTime();
    if (!Number.isFinite(atTime) || !Number.isFinite(untilTime)) return null;
    /* Past its hour: the silence is over, and the reminder speaks again. The
       morning after deserves a trace of its own, so the reminder's line can
       say the silence was lifted — and on which day. */
    if (untilTime <= Date.now()) {
      rememberEnd({ at, until });
      try {
        window.localStorage.removeItem(KEY);
      } catch {
        /* Storage refused: there was nothing to erase anyway. */
      }
      return null;
    }
    return { at, until };
  } catch {
    return null;
  }
}

/** Writes the trace of a silence that just ran out, so it is not lost. */
function rememberEnd(end: LateMuteEnd): void {
  try {
    window.localStorage.setItem(END_KEY, JSON.stringify(end));
  } catch {
    /* Storage refused: the morning after simply leaves no mark. */
  }
}

/**
 * The last silence that ran out on its own, with the day it ended: the reminder
 * is back, and its line can say when the hush was lifted. Null when no silence
 * has ever run out — a mute set this morning is not a lift yet.
 */
export function readLateMuteEnd(): LateMuteEnd | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(END_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at?: unknown; until?: unknown };
    const at = typeof parsed?.at === 'string' ? parsed.at : '';
    const until = typeof parsed?.until === 'string' ? parsed.until : '';
    if (!at || !until) return null;
    if (!Number.isFinite(new Date(at).getTime())) return null;
    if (!Number.isFinite(new Date(until).getTime())) return null;
    return { at, until };
  } catch {
    return null;
  }
}

/** Asks for silence until the end of the day, and keeps when it was asked. */
export function muteLateToday(): LateMute | null {
  if (typeof window === 'undefined') return null;
  const next: LateMute = { at: new Date().toISOString(), until: endOfToday() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Storage refused (private mode): the silence simply is not kept. */
    return null;
  }
  window.dispatchEvent(new Event(EVENT));
  return next;
}

/** Lifts the silence before its hour, so the reminder speaks at once. */
export function clearLateMute(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Storage refused: there was nothing to erase anyway. */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Both surfaces and the bar listen: one silence, one state, everywhere. */
export function onLateMute(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}