import { supabase } from '@/lib/supabase';

export type B2bStatut = 'nouvelle' | 'vue' | 'traitee';

/**
 * What the request is about. The counter is the same, but a workshop reading
 * its inbox must know at once whether it is a print run or a public tender.
 */
export type B2bNature = 'tirage' | 'marche';

/** One row per workshop: the same request sent to three ateliers makes three rows. */
export type DemandeB2b = {
  id: string;
  reference: string;
  dest_id: string;
  dest_name: string;
  user_id: string | null;
  nom: string;
  email: string;
  telephone: string | null;
  organisme: string | null;
  quantite: string | null;
  delai: string | null;
  budget: string | null;
  message: string;
  /** « tirage » for a large run, « marche » for a public tender. */
  nature?: B2bNature | null;
  /**
   * Where the two PDFs of the dossier sit in the private storage bucket. The
   * paths, never the files: the workshop opens them through a signed link the
   * server builds on every read, so nothing is ever public.
   */
  piece_cdc_path?: string | null;
  piece_bordereau_path?: string | null;
  /** The same two documents, resolved by the server for this reading only. */
  piece_cdc_url?: string | null;
  piece_bordereau_url?: string | null;
  statut: B2bStatut;
  created_at: string;
  /** Set once the 48 h reminder e-mail has gone out for this request. */
  rappel_at?: string | null;
  /** Pushed back by the workshop: stays quiet until this date, then comes back. */
  snooze_at?: string | null;
  /** When the workshop first passed it to « traitée » — the reply-delay basis. */
  traitee_at?: string | null;
  /** Why it was closed: the workshop keeps its own trace. */
  motif?: string | null;
  /**
   * Set when the reason was filled in bulk after the fact, not given at the
   * close itself: a caught-up trace must not look like a real one.
   */
  motif_lot_at?: string | null;
  /**
   * Set when a bulk catch-up was erased afterwards: the trace was removed, so
   * the closure owes a reason again. The mark keeps the correction visible in
   * the month review instead of letting it vanish silently.
   */
  motif_lot_clear_at?: string | null;
  /**
   * The reason that was erased with the catch-up: keeping it is what lets the
   * CSV say which reason gets corrected the most. Null when nothing was erased.
   */
  motif_lot_cleared?: string | null;
  /**
   * How many times this request was corrected: a fiche taken back three times
   * is not the same work as one taken back once, and the inbox can rank them.
   */
  motif_lot_clear_count?: number | null;
};

/**
 * How many times a request was taken back. The server counts it on every
 * erasure; an older correction, made before the counter, still counts as one.
 */
export function clearedTimes(row: DemandeB2b): number {
  const count = Number(row.motif_lot_clear_count ?? 0);
  if (Number.isFinite(count) && count > 0) return count;
  return row.motif_lot_clear_at ? 1 : 0;
}

const DAY_MS = 24 * 3600 * 1000;

/**
 * How many days since the last correction. Null when the fiche was never taken
 * back: a fiche left in peace has to read as « nothing », not as « day zero ».
 */
export function daysSinceCorrection(row: DemandeB2b): number | null {
  if (clearedTimes(row) <= 0 || !row.motif_lot_clear_at) return null;
  const at = new Date(row.motif_lot_clear_at).getTime();
  if (!Number.isFinite(at)) return null;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

/** A fiche corrected once, then left untouched for over a month. */
export const STALE_DAYS = 30;

/**
 * A ploughed fiche nobody has looked at for over thirty days: the correction
 * was made, then the trace was simply forgotten. That is the cut the inbox
 * opens on its own.
 */
export function isStaleCorrection(row: DemandeB2b): boolean {
  const days = daysSinceCorrection(row);
  return days !== null && days > STALE_DAYS;
}

/**
 * How many whole days a waiting request has been sitting there. Read on the
 * same stamp the date comes from, so « depuis 6 jours » and « 28 oct. » can
 * never contradict each other. Null when there is no usable date.
 */
export function waitingDays(iso: string | null): number | null {
  if (!iso) return null;
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return null;
  return Math.max(0, Math.floor((Date.now() - at) / DAY_MS));
}

export type B2bTarget = { id: string; name: string };

/** The closing reasons a workshop picks from, stored as keys, never as labels. */
export const B2B_MOTIF_KEYS = ['devis', 'client', 'hors', 'delai', 'sansSuite'] as const;
export type B2bMotifKey = (typeof B2B_MOTIF_KEYS)[number];

export type B2bPayload = {
  targets: B2bTarget[];
  nom: string;
  email: string;
  telephone: string;
  organisme: string;
  quantite: string;
  delai: string;
  budget: string;
  message: string;
  /** Sent with every request: the inbox reads it, the mails word it. */
  nature?: B2bNature;
  /** La langue du visiteur : la confirmation part dans cette langue. */
  lang?: 'fr' | 'ar' | 'en';
  /** The two PDFs already deposited, named by their storage path. */
  pieceCdcPath?: string;
  pieceBordereauPath?: string;
};

/** A request filed through the tender page, not through the print-run one. */
export function isTender(row: DemandeB2b): boolean {
  return row.nature === 'marche';
}

export type B2bIssue =
  | 'net'
  | 'invalid'
  | 'no-target'
  | 'too-many'
  | 'insert'
  | 'unauthorized'
  | 'no-card';

export type B2bBox = {
  entrepriseId: string | null;
  /** False when the workshop switched the e-mail alert off. */
  alertesEmail: boolean;
  /** The reason it closes most requests with — preselected on every closure. */
  motifDefaut: B2bMotifKey | null;
  /** Target share of documented closures for the month — null when unset. */
  objectif: number | null;
  /** Every change of that target, oldest first: past months keep their own. */
  objectifHistory: B2bObjectifEntry[];
  /**
   * Whole days a month may make people wait on average before it is flagged.
   * Saved next to the target, so the strip, the twelve-month table and the
   * export all read the same number instead of three copies of a week.
   */
  waitGoalDays: number;
  received: DemandeB2b[];
  sent: DemandeB2b[];
};

/** One recorded change of the monthly target, with the day it took effect. */
export type B2bObjectifEntry = {
  /** The threshold from that day on — null when the workshop cleared it. */
  objectif: number | null;
  /** ISO date the change was saved. */
  changedAt: string;
};

const EMPTY_BOX: B2bBox = {
  entrepriseId: null,
  alertesEmail: true,
  motifDefaut: null,
  objectif: null,
  objectifHistory: [],
  waitGoalDays: 7,
  received: [],
  sent: [],
};

function readIssue(value: unknown, fallback: B2bIssue): B2bIssue {
  const code = typeof value === 'string' ? value : '';
  if (!code) return fallback;
  return code as B2bIssue;
}

/** Public: the request is written server-side, then lands in the workshop inbox. */
export async function sendB2bRequest(payload: B2bPayload) {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'submit', ...payload },
    });
    if (error) return { ok: false as const, issue: 'net' as B2bIssue };
    const body = (data ?? {}) as { ok?: boolean; reference?: string; confirmed?: boolean; error?: string };
    if (body.ok && body.reference) {
      return { ok: true as const, reference: body.reference, confirmed: Boolean(body.confirmed) };
    }
    return { ok: false as const, issue: readIssue(body.error, 'insert') };
  } catch {
    return { ok: false as const, issue: 'net' as B2bIssue };
  }
}

export async function fetchB2bBox(): Promise<B2bBox> {
  const { data, error } = await supabase.functions.invoke('demandes-b2b', {
    body: { action: 'list' },
  });
  if (error) throw new Error('list');
  const body = (data ?? {}) as Partial<B2bBox> & { ok?: boolean; error?: string };
  if (!body.ok) throw new Error(body.error || 'list');
  return {
    entrepriseId: (body.entrepriseId as string | null) ?? null,
    alertesEmail: body.alertesEmail !== false,
    motifDefaut: readMotif(body.motifDefaut),
    objectif: readObjectif(body.objectif),
    objectifHistory: readHistory(body.objectifHistory),
    waitGoalDays: readWaitGoal(body.waitGoalDays),
    received: body.received ?? [],
    sent: body.sent ?? [],
  };
}

/**
 * The header only needs a number, not the whole inbox: a dedicated, tiny action
 * keeps the badge cheap to poll on every page.
 */
/** `avgHours` is null until at least one request has actually been handled. */
export type B2bStats = {
  todo: number;
  late: number;
  /**
   * Of those late requests, how many have been waiting for over a whole week.
   * A second threshold on the same rows: waiting is not urgency, and the
   * reminder says both instead of melting them into one number.
   */
  veryLate: number;
  /**
   * Every open wait added up, in whole weeks: three requests sleeping ten days
   * each are four weeks of accumulated lateness. Counted on the very same rows
   * as `late`, so the depth and the width of the backlog never disagree.
   */
  lateWeeks: number;
  /**
   * The day the oldest request still waiting dates from — the same rows as
   * `late`. Null when nothing is late: a date only ever describes a real delay.
   */
  lateOldest: string | null;
  /**
   * That very request's reference and id: the reminder is a door, and it opens
   * the box on the request it just named instead of on the whole batch.
   */
  lateOldestRef: string | null;
  lateOldestId: string | null;
  /**
   * The misses of the shortcut, over the whole inbox: requests still « nouvelle »
   * although the reminder has already been through their wait. Counted on the
   * server, so the strip states the real size of the cut its chip opens — not a
   * slice of the loaded rows.
   */
  never: number;
  /**
   * The oldest of those misses, by reference: under the count, the figure gets
   * a face — and a door, since that one request can be opened on its own.
   */
  neverOldestRef: string | null;
  avgHours: number | null;
  treated: number;
  /** Raw reason wording of everything closed this month — '' when there is none. */
  monthMotifs: string[];
  /**
   * Of this month's closures that carry a reason, how many got it in bulk after
   * the fact, and how many are documented in total: the strip shows the slice
   * of the trace that was rebuilt rather than given at the close.
   */
  monthLot: number;
  monthDocumented: number;
  /** Catch-ups erased after the fact this month: the corrections, counted whole. */
  monthCleared: number;
  /**
   * Fiches taken back more than twice, over the whole inbox — the truly ploughed
   * ones. Counted on every correction the server stamped, not on the 200 loaded
   * rows, so the strip can show them without opening the box.
   */
  rework3: number;
  /**
   * Fiches corrected, then left in peace for over thirty days, over the whole
   * inbox — counted on every row, so the strip shows the size of the forgotten
   * traces without opening the box.
   */
  stale30: number;
  /**
   * Closures of the whole inbox that still owe a reason — the size of the
   * missing trace, counted on the server so the strip shows it without opening
   * the box. A fiche corrected then left in peace is counted here too.
   */
  undoc: number;
  /** Same, for the month before: the trace quality is read month against month. */
  prevMotifs: string[];
  /** This month's reply delay, and the month before — null when nothing closed. */
  monthAvgHours: number | null;
  prevAvgHours: number | null;
  /**
   * How many closures the two averages actually rest on — only the fiches whose
   * reception precedes the close can be measured. A mean over two closures is
   * not the same reading as a mean over forty, and the strip must say it.
   */
  monthDelayCount: number;
  prevDelayCount: number;
  monthCount: number;
  prevCount: number;
  /** The workshop own target for documented closures — null when unset. */
  objectif: number | null;
  /**
   * Closures of the last twelve months still owing a reason — the same sliding
   * window as the inbox, counted on every row, so the account strip can show
   * the size of the backlog without opening the box.
   */
  gap12: number;
  /**
   * The months of the twelve-month window that could be judged against their
   * own threshold, and how many fell short — counted on the whole inbox, so the
   * strip can state the share of the year without opening the box.
   */
  yearBelow: { judged: number; below: number };
  /**
   * The other side of the same year: how many months made people wait over a
   * whole week on average across their closures, and how many months could be
   * measured at all. Same mechanics as the documented-share counter — one
   * count, the months it is judged on, the share — read on the depth of the
   * wait instead of the trace. Counted on the whole inbox by the server.
   */
  waitOver: { judged: number; over: number };
  /** The threshold that counter is read against, in whole days. */
  waitGoalDays: number;
  /**
   * The month of that same window that made people wait longest on average,
   * with its depth in whole days and the closures that depth rests on. Null
   * when no month of the year made anybody wait. Read on the very column of
   * days waited the twelve-month table shows, so the strip cannot name a month
   * the table would place elsewhere.
   */
  waitMonth: { key: string; days: number; count: number } | null;
  /**
   * The month that slowed down the most over the twelve-month window, with its
   * rise in hours against the month before — null when no month slowed down,
   * or when nothing was measurable. Counted on the server, whole inbox. The
   * average level of that month sits beside the gap: a gap alone does not say
   * whether the month is slow or merely slower than a very fast one.
   */
  /**
   * `count` is how many closures the rise was measured on: under three, the
   * gap is a rumour and the strip says so next to the month.
   */
  slowMonth: {
    key: string;
    deltaHours: number;
    avgHours: number | null;
    count: number;
  } | null;
};

export const EMPTY_B2B_STATS: B2bStats = {
  todo: 0,
  late: 0,
  veryLate: 0,
  lateWeeks: 0,
  lateOldest: null,
  lateOldestRef: null,
  lateOldestId: null,
  never: 0,
  neverOldestRef: null,
  avgHours: null,
  treated: 0,
  monthMotifs: [],
  monthLot: 0,
  monthDocumented: 0,
  monthCleared: 0,
  rework3: 0,
  stale30: 0,
  undoc: 0,
  prevMotifs: [],
  monthAvgHours: null,
  prevAvgHours: null,
  monthDelayCount: 0,
  prevDelayCount: 0,
  monthCount: 0,
  prevCount: 0,
  objectif: null,
  gap12: 0,
  yearBelow: { judged: 0, below: 0 },
  waitOver: { judged: 0, over: 0 },
  waitGoalDays: 7,
  waitMonth: null,
  slowMonth: null,
};

/**
 * The bar and the account summary both watch the same pulse: when the two ask in
 * the same breath, one request answers both. A local change (a request handled, a
 * fiche closed, a snooze) clears it, so the next read is never stale.
 */
let statsCache: { at: number; promise: Promise<B2bStats> } | null = null;
const STATS_TTL = 8000;

if (typeof window !== 'undefined') {
  window.addEventListener('b2b:changed', () => { statsCache = null; });
}

export function fetchB2bStats(): Promise<B2bStats> {
  const now = Date.now();
  if (statsCache && now - statsCache.at < STATS_TTL) return statsCache.promise;
  const promise = requestB2bStats();
  statsCache = { at: now, promise };
  return promise;
}

async function requestB2bStats(): Promise<B2bStats> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'count' },
    });
    if (error) return EMPTY_B2B_STATS;
    const body = (data ?? {}) as {
      ok?: boolean;
      todo?: number;
      late?: number;
      veryLate?: number;
      lateWeeks?: number;
      lateOldest?: string | null;
      lateOldestRef?: string | null;
      lateOldestId?: string | null;
      never?: number;
      neverOldestRef?: string | null;
      treated?: number;
      avgHours?: number | null;
      monthMotifs?: unknown;
      monthLot?: number;
      monthDocumented?: number;
      monthCleared?: number;
      rework3?: number;
      stale30?: number;
      undoc?: number;
      prevMotifs?: unknown;
      monthAvgHours?: number | null;
      prevAvgHours?: number | null;
      monthDelayCount?: number;
      prevDelayCount?: number;
      monthCount?: number;
      prevCount?: number;
      objectif?: number | null;
      gap12?: number;
      yearBelow?: unknown;
      waitOver?: unknown;
      waitGoalDays?: unknown;
      waitMonth?: unknown;
      slowMonth?: unknown;
    };
    if (!body.ok) return EMPTY_B2B_STATS;
    const todo = Number(body.todo ?? 0);
    const late = Number(body.late ?? 0);
    const veryLate = Number(body.veryLate ?? 0);
    const lateWeeks = Number(body.lateWeeks ?? 0);
    /* A date only travels if it really parses: anything else is « no date »,
       and the bar simply keeps the sentence without it. */
    const oldestRaw = typeof body.lateOldest === 'string' ? body.lateOldest : '';
    const oldestTime = oldestRaw ? new Date(oldestRaw).getTime() : NaN;
    const lateOldest = Number.isFinite(oldestTime) ? new Date(oldestTime).toISOString() : null;
    /* The name of that request only travels with a real date: a reference
       without a delay would point at nothing. */
    const lateOldestRef = lateOldest && typeof body.lateOldestRef === 'string'
      ? body.lateOldestRef
      : null;
    const lateOldestId = lateOldest && typeof body.lateOldestId === 'string'
      ? body.lateOldestId
      : null;
    const never = Number(body.never ?? 0);
    /* A reference only travels with a real cut: a lone string would name a
       request the strip cannot open, so it is dropped instead of shown. */
    const neverOldestRef =
      Number.isFinite(never) &&
      never > 0 &&
      typeof body.neverOldestRef === 'string' &&
      body.neverOldestRef.trim()
        ? body.neverOldestRef.trim()
        : null;
    const treated = Number(body.treated ?? 0);
    const avg = Number(body.avgHours);
    /** Hours only make sense as a number: anything else is « no data ». */
    const hours = (value: unknown) => {
      const num = Number(value);
      return value !== null && value !== undefined && Number.isFinite(num) && num >= 0
        ? Math.round(num * 10) / 10
        : null;
    };
    const monthCount = Number(body.monthCount ?? 0);
    const prevCount = Number(body.prevCount ?? 0);
    const monthDelayCount = Number(body.monthDelayCount ?? 0);
    const prevDelayCount = Number(body.prevDelayCount ?? 0);
    const monthLot = Number(body.monthLot ?? 0);
    const monthDocumented = Number(body.monthDocumented ?? 0);
    const monthCleared = Number(body.monthCleared ?? 0);
    const rework3 = Number(body.rework3 ?? 0);
    const stale30 = Number(body.stale30 ?? 0);
    const undoc = Number(body.undoc ?? 0);
    const gap12 = Number(body.gap12 ?? 0);
    /* The share of the year: only counts make a share, anything else is zero. */
    const rawYear = (body.yearBelow ?? null) as { judged?: unknown; below?: unknown } | null;
    const yearJudgedCount = Number(rawYear?.judged ?? 0);
    const yearBelowCount = Number(rawYear?.below ?? 0);
    const yearBelow = {
      judged: Number.isFinite(yearJudgedCount) && yearJudgedCount > 0 ? Math.round(yearJudgedCount) : 0,
      below: Number.isFinite(yearBelowCount) && yearBelowCount > 0 ? Math.round(yearBelowCount) : 0,
    };
    /* The wait counter, same mechanics: a count and the months it rests on. A
       month over the threshold can never outnumber the months that could be
       measured — a server that disagrees is clamped rather than shown as a
       contradiction. */
    const rawWait = (body.waitOver ?? null) as { judged?: unknown; over?: unknown } | null;
    const waitJudgedCount = Number(rawWait?.judged ?? 0);
    const waitOverCount = Number(rawWait?.over ?? 0);
    const waitJudged =
      Number.isFinite(waitJudgedCount) && waitJudgedCount > 0
        ? Math.round(waitJudgedCount)
        : 0;
    const waitOverRaw =
      Number.isFinite(waitOverCount) && waitOverCount > 0 ? Math.round(waitOverCount) : 0;
    const waitOver = {
      judged: waitJudged,
      over: waitJudged > 0 ? Math.min(waitOverRaw, waitJudged) : waitOverRaw,
    };
    /* The threshold travels with the figure: the strip names the week it counts
       against, and a server that sends nothing falls back on that week. */
    const waitGoalRaw = Number(body.waitGoalDays);
    const waitGoalDays =
      Number.isFinite(waitGoalRaw) && waitGoalRaw > 0 ? Math.round(waitGoalRaw) : 7;
    /* The longest month of the year: a key that looks like a month, a depth
       that is a real number of days, and the closures behind it. Anything else
       is dropped rather than shown as « NaN ». */
    const rawLongest = (body.waitMonth ?? null) as {
      key?: unknown;
      days?: unknown;
      count?: unknown;
    } | null;
    const longestKey = typeof rawLongest?.key === 'string' ? rawLongest.key : '';
    const longestDays = Number(rawLongest?.days);
    const longestCount = Number(rawLongest?.count);
    const waitMonth =
      /^\d{4}-\d{2}$/.test(longestKey) &&
      Number.isFinite(longestDays) &&
      longestDays > 0
        ? {
            key: longestKey,
            days: Math.round(longestDays * 10) / 10,
            count:
              Number.isFinite(longestCount) && longestCount > 0
                ? Math.round(longestCount)
                : 0,
          }
        : null;
    /* The strip names a month, so the key must look like one: a half value is
       dropped rather than displayed as « NaN ». */
    const rawSlow = (body.slowMonth ?? null) as {
      key?: unknown;
      deltaHours?: unknown;
      avgHours?: unknown;
      count?: unknown;
    } | null;
    const slowKey = typeof rawSlow?.key === 'string' ? rawSlow.key : '';
    const slowDelta = Number(rawSlow?.deltaHours);
    const slowAvg = hours(rawSlow?.avgHours);
    /* The weight of the rise: a month can slow down on two fiches only. */
    const slowCount = Number(rawSlow?.count);
    const slowMonth =
      /^\d{4}-\d{2}$/.test(slowKey) && Number.isFinite(slowDelta) && slowDelta > 0
        ? {
            key: slowKey,
            deltaHours: Math.round(slowDelta * 10) / 10,
            avgHours: slowAvg,
            count: Number.isFinite(slowCount) && slowCount > 0 ? Math.round(slowCount) : 0,
          }
        : null;
    return {
      todo: Number.isFinite(todo) && todo > 0 ? todo : 0,
      late: Number.isFinite(late) && late > 0 ? late : 0,
      /* A week-late count can never exceed the late count it is cut from: a
         server that disagrees is clamped rather than shown as a contradiction. */
      veryLate:
        Number.isFinite(veryLate) && veryLate > 0
          ? Math.min(
              Math.round(veryLate),
              Number.isFinite(late) && late > 0 ? Math.round(late) : 0,
            )
          : 0,
      /* Weeks can only be a whole count, and never a negative one: anything
         else reads as « nothing piled up » rather than a broken figure. */
      lateWeeks:
        Number.isFinite(lateWeeks) && lateWeeks > 0 ? Math.floor(lateWeeks) : 0,
      lateOldest,
      lateOldestRef,
      lateOldestId,
      /* A count of misses can never be negative: anything else is « none ». */
      never: Number.isFinite(never) && never > 0 ? Math.round(never) : 0,
      neverOldestRef,
      treated: Number.isFinite(treated) && treated > 0 ? treated : 0,
      avgHours: body.avgHours !== null && Number.isFinite(avg) && avg >= 0 ? avg : null,
      monthMotifs: Array.isArray(body.monthMotifs)
        ? body.monthMotifs.map((value) => (typeof value === 'string' ? value : '')).slice(0, 500)
        : [],
      prevMotifs: Array.isArray(body.prevMotifs)
        ? body.prevMotifs.map((value) => (typeof value === 'string' ? value : '')).slice(0, 500)
        : [],
      monthAvgHours: hours(body.monthAvgHours),
      prevAvgHours: hours(body.prevAvgHours),
      monthCount: Number.isFinite(monthCount) && monthCount > 0 ? monthCount : 0,
      prevCount: Number.isFinite(prevCount) && prevCount > 0 ? prevCount : 0,
      monthDelayCount:
        Number.isFinite(monthDelayCount) && monthDelayCount > 0 ? monthDelayCount : 0,
      prevDelayCount:
        Number.isFinite(prevDelayCount) && prevDelayCount > 0 ? prevDelayCount : 0,
      monthLot: Number.isFinite(monthLot) && monthLot > 0 ? monthLot : 0,
      monthDocumented:
        Number.isFinite(monthDocumented) && monthDocumented > 0 ? monthDocumented : 0,
      monthCleared: Number.isFinite(monthCleared) && monthCleared > 0 ? monthCleared : 0,
      rework3: Number.isFinite(rework3) && rework3 > 0 ? rework3 : 0,
      stale30: Number.isFinite(stale30) && stale30 > 0 ? stale30 : 0,
      undoc: Number.isFinite(undoc) && undoc > 0 ? undoc : 0,
      objectif: readObjectif(body.objectif),
      gap12: Number.isFinite(gap12) && gap12 > 0 ? gap12 : 0,
      yearBelow,
      waitOver,
      waitGoalDays,
      waitMonth,
      slowMonth,
    };
  } catch {
    return EMPTY_B2B_STATS;
  }
}

export async function fetchB2bTodo(): Promise<number> {
  return (await fetchB2bStats()).todo;
}

function readMotif(value: unknown): B2bMotifKey | null {
  const key = typeof value === 'string' ? value : '';
  return (B2B_MOTIF_KEYS as readonly string[]).includes(key) ? (key as B2bMotifKey) : null;
}

/**
 * The workshop wait threshold: whole days between 1 and 90. Anything else —
 * including a service that sent nothing — falls back on the default week, so
 * the three surfaces that read it always have a number.
 */
function readWaitGoal(value: unknown): number {
  const num = Number(value);
  if (value === null || value === undefined || !Number.isFinite(num)) return 7;
  if (num < 1 || num > 90) return 7;
  return Math.round(num);
}

/** The objective is a whole percentage between 1 and 100, or nothing at all. */
function readObjectif(value: unknown): number | null {
  const num = Number(value);
  if (value === null || value === undefined || !Number.isFinite(num)) return null;
  if (num < 1 || num > 100) return null;
  return Math.round(num);
}

/**
 * The target history, oldest first. Anything unreadable is dropped rather than
 * guessed: a month is only ever compared to a threshold we really have.
 */
function readHistory(value: unknown): B2bObjectifEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      const item = (entry ?? {}) as { objectif?: unknown; changed_at?: unknown };
      const changedAt = typeof item.changed_at === 'string' ? item.changed_at : '';
      if (!changedAt) return null;
      return { objectif: readObjectif(item.objectif), changedAt };
    })
    .filter((entry): entry is B2bObjectifEntry => entry !== null)
    .slice(0, 120);
}

/** Remembers (or clears) the monthly target for documented closures. */
export async function setB2bObjectif(
  value: number | null,
): Promise<{ ok: true; objectif: number | null } | { ok: false }> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'objectif', value },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; objectif?: number | null };
    if (!body.ok) return { ok: false };
    return { ok: true, objectif: readObjectif(body.objectif) };
  } catch {
    return { ok: false };
  }
}

/**
 * Remembers (or clears) the workshop wait threshold, saved next to the target.
 * Clearing it puts the default week back rather than leaving a hole.
 */
export async function setB2bWaitGoal(
  value: number | null,
): Promise<{ ok: true; waitGoalDays: number } | { ok: false }> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'waitGoal', value },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; waitGoalDays?: unknown };
    if (!body.ok) return { ok: false };
    return { ok: true, waitGoalDays: readWaitGoal(body.waitGoalDays) };
  } catch {
    return { ok: false };
  }
}

/** Remembers (or clears) the reason this workshop closes requests with. */
export async function setB2bMotifDefaut(
  motif: B2bMotifKey | null,
): Promise<{ ok: true; motif: B2bMotifKey | null } | { ok: false }> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'motifDefaut', motif },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; motif?: string | null };
    if (!body.ok) return { ok: false };
    return { ok: true, motif: readMotif(body.motif) };
  } catch {
    return { ok: false };
  }
}

/**
 * Fills a missing reason on every closure the workshop picked — same server
 * call, same rules: still handled, and the handling date never moves.
 */
export async function setB2bMotifBulk(
  ids: string[],
  motif: string,
): Promise<{ ok: true; ids: string[]; motif: string } | { ok: false }> {
  if (ids.length === 0) return { ok: true, ids: [], motif };
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'motifLot', ids, motif },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; ids?: string[] };
    if (!body.ok) return { ok: false };
    return {
      ok: true,
      ids: Array.isArray(body.ids) ? body.ids : [],
      motif,
    };
  } catch {
    return { ok: false };
  }
}

/** One closure and the reason it carried before a bulk fill. */
export type B2bMotifEntry = { id: string; motif: string | null };

/**
 * Undo of a bulk fill: each closure goes back to the reason it carried before.
 * Same server rules — the request stays handled, the handling date never moves.
 */
export async function restoreB2bMotifs(
  entries: B2bMotifEntry[],
): Promise<{ ok: true; entries: B2bMotifEntry[] } | { ok: false }> {
  if (entries.length === 0) return { ok: true, entries: [] };
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'motifRetour', entries },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; entries?: B2bMotifEntry[] };
    if (!body.ok) return { ok: false };
    const list = Array.isArray(body.entries) ? body.entries : [];
    return {
      ok: true,
      entries: list
        .filter((entry) => entry && typeof entry.id === 'string')
        .map((entry) => ({ id: entry.id, motif: entry.motif ?? null })),
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Fixes the reason of a request that is already handled, without reopening it:
 * the status and the handling date do not move, so the measured delay stays.
 */
export async function setB2bMotif(
  id: string,
  motif: string | null,
): Promise<{ ok: true; motif: string | null } | { ok: false }> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'motif', id, motif: motif ?? null },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; motif?: string | null };
    if (!body.ok) return { ok: false };
    return { ok: true, motif: body.motif ?? null };
  } catch {
    return { ok: false };
  }
}

/**
 * Erases a bulk catch-up: the reason filled in bulk is removed, so the closure
 * is undocumented again — exactly what it was before the batch. Same server
 * rules: the request stays handled and the handling date never moves. The
 * erasure is stamped server-side, so the month review can count the corrections.
 */
export async function clearB2bLotMark(
  id: string,
): Promise<
  | { ok: true; motif: null; clearedAt: string | null; erased: string | null; clearedCount: number }
  | { ok: false }
> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'clearLot', id },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as {
      ok?: boolean;
      motif_lot_clear_at?: string | null;
      motif_lot_cleared?: string | null;
      motif_lot_clear_count?: number | null;
    };
    if (!body.ok) return { ok: false };
    const count = Number(body.motif_lot_clear_count ?? 0);
    return {
      ok: true,
      motif: null,
      clearedAt: body.motif_lot_clear_at ?? null,
      erased: body.motif_lot_cleared ?? null,
      clearedCount: Number.isFinite(count) && count > 0 ? count : 1,
    };
  } catch {
    return { ok: false };
  }
}

/** Turns the workshop e-mail alerts on or off. */
export async function setB2bAlerts(enabled: boolean): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'alerts', enabled },
    });
    if (error) return false;
    return Boolean((data as { ok?: boolean } | null)?.ok);
  } catch {
    return false;
  }
}

export async function setB2bStatut(id: string, statut: B2bStatut, motif?: string | null) {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'statut', id, statut, motif: motif ?? null },
    });
    if (error) return false;
    return Boolean((data as { ok?: boolean } | null)?.ok);
  } catch {
    return false;
  }
}

/**
 * Marks a batch as « vue »: opening the « En retard » filter means the workshop
 * has actually seen those requests. Returns the ids that really moved.
 */
export async function markB2bSeen(ids: string[]): Promise<string[] | null> {
  if (ids.length === 0) return [];
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'vues', ids },
    });
    if (error) return null;
    const body = (data ?? {}) as { ok?: boolean; ids?: string[] };
    if (!body.ok) return null;
    return Array.isArray(body.ids) ? body.ids : [];
  } catch {
    return null;
  }
}

/**
 * One click on « tout marquer comme traité »: the server flips every request
 * still waiting for this workshop, and returns how many moved.
 */
export async function markAllB2bHandled(): Promise<number | null> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'traiterTout' },
    });
    if (error) return null;
    const body = (data ?? {}) as { ok?: boolean; count?: number };
    if (!body.ok) return null;
    const count = Number(body.count ?? 0);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return null;
  }
}

/**
 * « Rappeler plus tard »: the request stops counting as late and stops being
 * chased until that date. Passing null clears the push-back.
 */
export async function snoozeB2bRequest(
  id: string,
  until: string | null,
): Promise<{ ok: true; snoozeAt: string | null } | { ok: false }> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'snooze', id, until },
    });
    if (error) return { ok: false };
    const body = (data ?? {}) as { ok?: boolean; snooze_at?: string | null };
    if (!body.ok) return { ok: false };
    return { ok: true, snoozeAt: body.snooze_at ?? null };
  } catch {
    return { ok: false };
  }
}

/** Attaches the signed-in account to exactly one directory card. */
export async function linkDirectoryCard(entrepriseId: string | null): Promise<B2bIssue | null> {
  try {
    const { data, error } = await supabase.functions.invoke('demandes-b2b', {
      body: { action: 'link', entrepriseId },
    });
    if (error) {
      /* A 409 means the card already belongs to another account. */
      const status = (error as { context?: { status?: number } }).context?.status;
      return status === 409 ? 'no-card' : 'net';
    }
    const body = (data ?? {}) as { ok?: boolean; error?: string };
    if (body.ok) return null;
    return readIssue(body.error, 'net');
  } catch {
    return 'net' as B2bIssue;
  }
}

export const EMPTY_B2B_BOX = EMPTY_BOX;