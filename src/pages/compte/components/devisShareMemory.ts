/**
 * The dossiers already handed over to a colleague, kept per account: the day a
 * single-file link was copied is written down here, so the workbook can mark
 * the address of that dossier and the reader sees, at a glance, which files are
 * already circulating. Two members on one browser never share it.
 */
const PREFIX = 'paperatlas.devis.shared';
/**
 * Where the marks this account erased are written down: the sheet keeps a
 * column for them, so a dossier whose badge was removed still leaves a trace.
 */
const FORGOTTEN = '.forgotten';
/**
 * Where the marks this account put back are written down: the workbook says
 * how many of its lines circulate again thanks to a restoration, beside the
 * ones whose mark was simply taken off.
 */
const RESTORED = '.restored';

/** One memory per account: the trace follows the account, not the browser. */
export function shareKey(userId: string) {
  return userId ? `${PREFIX}.${userId}` : '';
}

/** Reference → the day its link was copied, in ISO form. */
export type ShareMarks = Record<string, string>;

/** One erased mark: the day it had been shared, and the day it was erased. */
export type ForgottenMark = { sharedAt: string; forgottenAt: string };

/** Reference → the mark this account erased. Read by the workbook only. */
export type ForgottenMarks = Record<string, ForgottenMark>;

/** One restored mark: the day the dossier had been shared, and the day it came
 *  back. Read by the workbook only. */
export type RestoredMark = { sharedAt: string; restoredAt: string };

/** Reference → the mark this account put back. Read by the workbook only. */
export type RestoredMarks = Record<string, RestoredMark>;

/** The trace store sits beside the marks: same account, same browser. */
function forgottenStore(key: string) {
  return key ? `${key}${FORGOTTEN}` : '';
}

/** The restoration store sits beside the erasure one: same account, same day
 *  rule, same silence when nothing is known. */
function restoredStore(key: string) {
  return key ? `${key}${RESTORED}` : '';
}

/** A real day, or nothing: a broken date never reaches the sheet. */
function isDay(value: unknown): value is string {
  return typeof value === 'string' && Number.isFinite(new Date(value).getTime());
}

/**
 * The marks this account erased, kept for the workbook. Nothing is ever put on
 * screen from here: the list shows what still circulates, the sheet says what
 * stopped circulating and when.
 */
export function readForgotten(key: string): ForgottenMarks {
  const store = forgottenStore(key);
  if (!store) return {};
  try {
    const raw = window.localStorage.getItem(store);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return {};
    const kept: ForgottenMarks = {};
    Object.entries(parsed).forEach(([reference, entry]) => {
      if (typeof reference !== 'string' || !reference) return;
      if (!entry || typeof entry !== 'object') return;
      const { sharedAt, forgottenAt } = entry as { sharedAt?: unknown; forgottenAt?: unknown };
      if (!isDay(sharedAt) || !isDay(forgottenAt)) return;
      kept[reference] = { sharedAt, forgottenAt };
    });
    return kept;
  } catch {
    return {};
  }
}

function writeForgotten(key: string, marks: ForgottenMarks) {
  const store = forgottenStore(key);
  if (!store) return;
  try {
    if (Object.keys(marks).length === 0) window.localStorage.removeItem(store);
    else window.localStorage.setItem(store, JSON.stringify(marks));
  } catch {
    /* the sheet simply forgets that a mark was removed */
  }
}

/**
 * The marks this account put back, kept for the workbook. Nothing is ever put
 * on screen from here: the list shows the marks of today, the sheet says which
 * of them only circulate again because they were restored.
 */
export function readRestored(key: string): RestoredMarks {
  const store = restoredStore(key);
  if (!store) return {};
  try {
    const raw = window.localStorage.getItem(store);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return {};
    const kept: RestoredMarks = {};
    Object.entries(parsed).forEach(([reference, entry]) => {
      if (typeof reference !== 'string' || !reference) return;
      if (!entry || typeof entry !== 'object') return;
      const { sharedAt, restoredAt } = entry as { sharedAt?: unknown; restoredAt?: unknown };
      if (!isDay(sharedAt) || !isDay(restoredAt)) return;
      kept[reference] = { sharedAt, restoredAt };
    });
    return kept;
  } catch {
    return {};
  }
}

function writeRestored(key: string, marks: RestoredMarks) {
  const store = restoredStore(key);
  if (!store) return;
  try {
    if (Object.keys(marks).length === 0) window.localStorage.removeItem(store);
    else window.localStorage.setItem(store, JSON.stringify(marks));
  } catch {
    /* the sheet simply forgets that a mark came back */
  }
}

/**
 * Writes down one restored mark. The first restoration is the one kept: a
 * sheet read later must not see the day move because a dossier was taken off
 * and put back twice.
 */
function noteRestored(key: string, reference: string, sharedAt: string) {
  if (!key || !reference || !isDay(sharedAt)) return;
  const marks = readRestored(key);
  if (marks[reference]) return;
  writeRestored(key, {
    ...marks,
    [reference]: { sharedAt, restoredAt: new Date().toISOString() },
  });
}

/** A mark that goes away again is no longer a restored mark: its trace goes
 *  back to the erasure store, where the sheet reads it. */
function clearRestoredEntry(key: string, reference: string) {
  const marks = readRestored(key);
  if (!marks[reference]) return;
  const next = { ...marks };
  delete next[reference];
  writeRestored(key, next);
}

/**
 * Writes down one erased mark. The first erasure is the one kept: a sheet read
 * months later must not see its date move because a mark was erased twice.
 */
function noteForgotten(key: string, reference: string, sharedAt: string) {
  if (!key || !reference || !isDay(sharedAt)) return;
  const marks = readForgotten(key);
  if (marks[reference]) return;
  writeForgotten(key, {
    ...marks,
    [reference]: { sharedAt, forgottenAt: new Date().toISOString() },
  });
}

/** A dossier shared again is no longer a forgotten line: its trace goes. */
function clearForgottenEntry(key: string, reference: string) {
  const marks = readForgotten(key);
  if (!marks[reference]) return;
  const next = { ...marks };
  delete next[reference];
  writeForgotten(key, next);
}

/** Writes the whole map back at once: an empty one removes the store rather
 *  than leaving a pair of braces that would read as a mark. */
function writeShares(key: string, marks: ShareMarks) {
  if (!key) return;
  try {
    if (Object.keys(marks).length === 0) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(marks));
  } catch {
    /* the list still works, it just forgets what it could not write */
  }
}

/** Everything this account has already shared, or an empty map when nothing is
 *  known. A private window simply reads nothing, it never breaks the page. */
export function readShares(key: string): ShareMarks {
  if (!key) return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return {};
    const kept: ShareMarks = {};
    Object.entries(parsed).forEach(([reference, at]) => {
      if (typeof reference !== 'string' || !reference) return;
      if (typeof at !== 'string') return;
      if (!Number.isFinite(new Date(at).getTime())) return;
      kept[reference] = at;
    });
    return kept;
  } catch {
    return {};
  }
}

/**
 * Writes that one dossier has just been shared, with today's day. The first
 * date is kept: a file handed over twice is still « already shared » since the
 * first time, and the workbook never moves that day around.
 */
export function markShared(key: string, reference: string): ShareMarks {
  const current = readShares(key);
  if (!key || !reference) return current;
  if (current[reference]) return current;
  const next: ShareMarks = { ...current, [reference]: new Date().toISOString() };
  writeShares(key, next);
  /* A dossier handed over again circulates once more: its old erasure trace
     would lie, so it is dropped — and so is its restoration trace, since the
     mark no longer exists thanks to a restoration but thanks to this copy. */
  clearForgottenEntry(key, reference);
  clearRestoredEntry(key, reference);
  return next;
}

/**
 * Forgets the mark of a single dossier, and only that one: the other dossiers
 * keep their day, and the rest of the account's settings stay untouched.
 * Returns the map the caller can set on screen right away.
 */
export function forgetShared(key: string, reference: string): ShareMarks {
  const current = readShares(key);
  if (!key || !reference || !current[reference]) return current;
  const next: ShareMarks = { ...current };
  delete next[reference];
  writeShares(key, next);
  /* The erased badge leaves a line in the workbook: the sheet still says that
     this dossier circulated, and the day the mark was taken off. */
  noteForgotten(key, reference, current[reference]);
  /* A mark taken off again is no longer a restored one: it leaves the restored
     count and joins the erased lines, never both at once. */
  clearRestoredEntry(key, reference);
  return next;
}

/**
 * Puts an erased mark back, with the very day the dossier was first shared —
 * never today's. Only a dossier this account really erased can come back: the
 * erasure trace is the proof, and it goes away with the mark it gives back.
 * Returns the map the caller can set on screen right away.
 */
export function restoreShared(key: string, reference: string): ShareMarks {
  const current = readShares(key);
  if (!key || !reference) return current;
  const trace = readForgotten(key)[reference];
  if (!trace) return current;
  const next: ShareMarks = { ...current, [reference]: trace.sharedAt };
  writeShares(key, next);
  /* La marque revient : la feuille garde la trace de ce retour, à côté de
     celles des marques simplement retirées. */
  noteRestored(key, reference, trace.sharedAt);
  clearForgottenEntry(key, reference);
  return next;
}

/**
 * Puts every erased mark of this account back at once, each with the day it was
 * first shared. A dossier already circulating again keeps the day it has: one
 * mark per dossier, never two.
 */
export function restoreForgottenMarks(key: string): ShareMarks {
  const current = readShares(key);
  if (!key) return current;
  const traces = readForgotten(key);
  const references = Object.keys(traces);
  if (references.length === 0) return current;
  const next: ShareMarks = { ...current };
  references.forEach((reference) => {
    if (!next[reference]) next[reference] = traces[reference].sharedAt;
  });
  writeShares(key, next);
  references.forEach((reference) => {
    /* Chaque marque rendue laisse sa trace de rétablissement, avec le jour où
       son dossier avait été partagé. */
    noteRestored(key, reference, traces[reference].sharedAt);
    clearForgottenEntry(key, reference);
  });
  return next;
}

/**
 * Forgets every share mark of this account — and only those marks: the states,
 * the group reading and the other preferences stay untouched. Returns the empty
 * map the caller can set on screen right away.
 */
export function clearShares(key: string): ShareMarks {
  if (!key) return {};
  /* Read before erasing: every mark that goes leaves its trace in the sheet. */
  const erased = readShares(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to erase is not a failure: the page carries on */
  }
  Object.entries(erased).forEach(([reference, at]) => {
    noteForgotten(key, reference, at);
    /* Une marque effacée n'est plus une marque rétablie. */
    clearRestoredEntry(key, reference);
  });
  return {};
}