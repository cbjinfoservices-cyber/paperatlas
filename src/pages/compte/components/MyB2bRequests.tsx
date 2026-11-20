import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useAuth } from '@/auth/AuthProvider';
import { useB2bBox, useB2bStats } from '@/hooks/useB2b';
import type { B2bMotifEntry, B2bMotifKey, B2bStatut, DemandeB2b } from '@/lib/b2b';
import {
  B2B_MOTIF_KEYS,
  clearedTimes,
  daysSinceCorrection,
  isStaleCorrection,
  waitingDays,
} from '@/lib/b2b';
import { markLateRecall, type LateRecallSource } from '@/lib/b2bLateRecall';
import CardLinker from './CardLinker';
import B2bAlertsPref from './B2bAlertsPref';
import B2bSnooze from './B2bSnooze';
import B2bSolve from './B2bSolve';
import B2bMotifFix from './B2bMotifFix';
import B2bMotifBulk from './B2bMotifBulk';
import B2bMotifTrend from './B2bMotifTrend';
import B2bMotifGoal from './B2bMotifGoal';
import B2bMonthRecap from './B2bMonthRecap';
import B2bCsvExport from './B2bCsvExport';
import { countMotifs, detectMotif } from './b2bMotifs';
import { monthKeyOf } from './b2bObjectif';
import B2bShareLink, { b2bRequestHref } from './B2bShareLink';
import { pickKey, readPick, readView, savePick, saveView, viewKey } from './b2bPickMemory';
import { compareKey } from './b2bCompareMemory';
import type { B2bYearSortDir, B2bYearSortKey } from './b2bYearSortMemory';
import './b2b-inbox.css';

const STATUS_KEY: Record<B2bStatut, string> = {
  nouvelle: 'acct.b2b.statusNouvelle',
  vue: 'acct.b2b.statusVue',
  traitee: 'acct.b2b.statusTraitee',
};

type Tab = 'received' | 'sent';
type Filter = 'all' | 'todo' | 'late' | 'week' | 'never' | 'marche';
/** Newest first is the default; oldest first puts the overtime at the top —
 * and, on the week cut only, the longest wait first reads the depth of it. */
type Sort = 'recent' | 'oldest' | 'wait';
/** A second, independent cut: only what arrived inside the chosen window. */
type Period = 'all' | 'd7' | 'month';
/**
 * Reading back what was lost, one closing reason at a time — plus the gaps, and
 * the gaps of any month the workshop wants to reopen.
 */
type GapPick = `gap:${string}`;
/** `lot:2026-10` — the catch-ups of one month, read on its own. */
type LotMonthPick = `lot:${string}`;
/** `cleared:2026-10` — the catch-ups of one month that were erased afterwards. */
type ClearedMonthPick = `cleared:${string}`;
/** `origin:2026-10` — the closures of one month whose reason came at the close. */
type OriginMonthPick = `origin:${string}`;
/** `month:2026-10` — every closure of one month, opened from the slow arrow. */
type MonthPick = `month:${string}`;
/** `gapAll` is the whole twelve-month backlog, `lot` the reasons caught up in bulk. */
type MotifPick =
  | 'all'
  | 'none'
  | 'lot'
  | 'cleared'
  | 'rework'
  | 'stale'
  | 'gapAll'
  | GapPick
  | LotMonthPick
  | ClearedMonthPick
  | OriginMonthPick
  | MonthPick
  | B2bMotifKey;

/** Same threshold as the reminder sweep: the two must never disagree. */
const LATE_MS = 48 * 3600 * 1000;
const WEEK_MS = 7 * 24 * 3600 * 1000;

/** Still waiting, and past 48 h — and not pushed back to a later date. */
function isLate(row: DemandeB2b) {
  if (row.statut === 'traitee') return false;
  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return false;
  if (Date.now() - created < LATE_MS) return false;
  if (!row.snooze_at) return true;
  return new Date(row.snooze_at).getTime() <= Date.now();
}

/**
 * The B2B inbox: what clients addressed to this workshop, and what this account
 * sent out. A workshop only sees its own card, an author only its own requests.
 */
export default function MyB2bRequests({
  openGapAll = 0,
  openCleared = null,
  openRework = 0,
  openStale = 0,
  openUndoc = 0,
  openSlow = null,
  openBelow = 0,
  openLateAsk = 0,
  openLateOldestAsk = 0,
  openWeekAsk = 0,
  openNeverAsk = 0,
  openWaitAsk = 0,
  openMonthAsk = null,
  openGoalAsk = 0,
  focusAsk = null,
  neverFocusAsk = null,
}: {
  openGapAll?: number;
  /** Asked from the account strip: the box opens on that month's corrections. */
  openCleared?: { month: string } | null;
  /** Bumped by the « 3 fois et + » counter: the box opens on the ploughed fiches. */
  openRework?: number;
  /** Bumped by the « sans correction depuis 30 j » counter: forgotten traces. */
  openStale?: number;
  /** Bumped by the « fiches non documentées » counter: closures owing a reason. */
  openUndoc?: number;
  /** Asked by a delay chip of the strip: the trend opens framed on that month. */
  openSlow?: { month: string; nonce: number } | null;
  /** Bumped by the year chip of the strip: the trend opens filtered on the months in fault. */
  openBelow?: number;
  /**
   * Bumped by the « en retard » counter of the account strip: the box opens on
   * the very same cut as the header reminder, oldest request highlighted.
   */
  openLateAsk?: number;
  /**
   * Bumped by the cumulated-weeks cell: the same late cut and the same ring, but
   * the list is walked from the oldest end — the depth of the backlog opens on
   * the request that has slept longest, not on the one that arrived last.
   */
  openLateOldestAsk?: number;
  /**
   * Bumped by the week counter of the account strip: the « plus d’une semaine »
   * cut opened alone, longest wait first — the width of the urgency, right where
   * the weeks beside it say its depth.
   */
  openWeekAsk?: number;
  /**
   * Bumped by the « jamais ouvertes » counter of the account strip: the misses of
   * the reminder, alone, and sorted from the longest silence to the shortest.
   */
  openNeverAsk?: number;
  /**
   * Bumped by the « mois au-delà du seuil d’attente » counter of the strip: the
   * twelve-month table opens, sorted on its days waited column.
   */
  openWaitAsk?: number;
  /**
   * Asked by the longest-month cell of the account strip: the box opens on the
   * closures of that very month — the fiches behind the depth, not the table
   * that named it. A nonce marks a fresh request, so the same month can be
   * asked twice in a row without being ignored.
   */
  openMonthAsk?: { month: string; nonce: number } | null;
  /**
   * Bumped by the threshold recall under the strip’s title: the workshop panel
   * opens on the very setting the wait counter measures against — the reminder
   * becomes the way to the place where the number is chosen.
   */
  openGoalAsk?: number;
  /**
   * Asked from the reference line under the cumulated weeks: not the whole late
   * cut, just that one request — the list comes back with it ringed.
   */
  focusAsk?: { ref: string; nonce: number } | null;
  /**
   * Asked from the reference line under the « jamais ouvertes » counter of the
   * strip: not the whole cut again, but that one request — the misses come back
   * ordered from the longest silence, with the oldest one ringed.
   */
  neverFocusAsk?: { ref: string; nonce: number } | null;
}) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const {
    box,
    loading,
    error,
    busyId,
    bulkBusy,
    bulkMotifBusy,
    snoozeBusyId,
    linkIssue,
    syncedAt,
    alertsSaving,
    motifSaving,
    objectifSaving,
    waitGoalSaving,
    reload,
    move,
    markSeen,
    snooze,
    markAll,
    fixMotif,
    clearLot,
    fillMotifBulk,
    restoreMotifs,
    rememberMotif,
    saveObjectif,
    saveWaitGoal,
    linkCard,
    setAlerts,
    clearLinkIssue,
  } = useB2bBox(Boolean(user));
  /* The account-wide counts, as the strip shows them: the month review reads the
     same numbers, so its doors never contradict the bandeau above. */
  const stats = useB2bStats(Boolean(user));
  const [tab, setTab] = useState<Tab>('received');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [period, setPeriod] = useState<Period>('all');
  const [motif, setMotif] = useState<MotifPick>('all');
  const [notice, setNoticeRaw] = useState('');
  /** The twelve-month chart is asked for: it stays shut until then. */
  const [showTrend, setShowTrend] = useState(false);
  /**
   * The duel asked for from the month review: the month just ended and the one
   * before it, pre-filled on the chart without clicking two thin bars. The
   * counter tells the chart a fresh request came in, even if the same pair is
   * asked twice.
   */
  const [duelRequest, setDuelRequest] = useState<{ months: string[]; nonce: number } | null>(null);
  /**
   * The month the account strip pointed at, because its reply time grew. The
   * chart opens on it, framed, and scrolls to that very row.
   */
  const [trendFocus, setTrendFocus] = useState<{ month: string; nonce: number } | null>(null);
  /** The below-target cut asked for by the year chip: the chart opens on it. */
  const [belowAsk, setBelowAsk] = useState(0);
  /**
   * The threshold recall asked for by the strip: the workshop panel opens
   * unfolded on the wait setting, the number in force marked, cursor on it.
   */
  const [waitFocusAsk, setWaitFocusAsk] = useState(0);
  /**
   * The order asked for by the strip's wait counter: the year table opens on
   * its days waited column, longest first. The nonce marks a fresh request.
   */
  const [yearSortRequest, setYearSortRequest] = useState<{
    key: B2bYearSortKey;
    dir: B2bYearSortDir;
    nonce: number;
  } | null>(null);
  /** What each closure carried before a bulk fill — the undo of that fill. */
  const [undo, setUndo] = useState<B2bMotifEntry[] | null>(null);
  /** The request a one-click close just handled, and where it was before. */
  const [quickUndo, setQuickUndo] = useState<{ id: string; reference: string; statut: B2bStatut } | null>(null);
  const [failure, setFailure] = useState('');
  /**
   * The reference the header reminder pointed at: the box opens on the late
   * requests, but it also says which one is the oldest, highlights it, and
   * walks the page down to it — the member never has to search by eye.
   */
  const [focusRef, setFocusRef] = useState<string | null>(null);
  /**
   * The month a colleague shared by link: the inbox opened on its closures, and
   * the twelve-month table came with it — so the figure, the month and the
   * fiches are on one screen instead of being described.
   */
  const [sharedMonth, setSharedMonth] = useState<string | null>(null);
  /**
   * The request a colleague shared by link: the inbox comes back whole, with
   * that very fiche ringed, and the list says which reference was handed over.
   */
  const [sharedRequest, setSharedRequest] = useState<string | null>(null);
  /**
   * The two months a colleague compared and handed over: the duel came up from
   * the address, already filled, and the panel says where it came from.
   */
  const [sharedDuel, setSharedDuel] = useState<string[] | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * The month and reason last read are remembered per account: coming back to
   * the inbox should not mean picking them again.
   */
  const storeKey = user ? pickKey(user.id) : '';
  /** The period and the order have their own memory, next to the reason. */
  const viewStoreKey = user ? viewKey(user.id) : '';
  const restored = useRef(false);

  useEffect(() => {
    if (!storeKey || restored.current) return;
    restored.current = true;
    const pick = readPick(storeKey);
    setMotif(pick);
    /* The window and the order come back too: a member reading « 7 derniers
       jours, plus ancienne d'abord » should not reset the toolbar every visit. */
    if (!viewStoreKey) return;
    const view = readView(viewStoreKey);
    setPeriod(view.period);
    /* The wait order only exists on the cuts that read a silence — the week one
       and the reminder’s misses: a memory carrying it elsewhere falls back on
       the dates instead of an invisible order. */
    setSort(
      view.filter === 'week' || view.filter === 'never' || view.sort !== 'wait'
        ? view.sort
        : 'recent',
    );
    /* The tab comes back too: switching to « envoyées » for a look, then
       returning, must not land on a list the member never asked for — and the
       order picked survives the round trip with it. */
    setTab(view.tab);
    /* The unread cut comes back like the window and the order: « plus d’une
       semaine » is a reading, not an accident, and a reload must not undo it.
       A stored reason already cuts the list, so it keeps it on « tout »: two
       contradictory cuts would show an empty list nobody asked for. */
    if (pick === 'all') setFilter(view.filter);
  }, [storeKey, viewStoreKey]);

  useEffect(() => {
    if (!viewStoreKey || !restored.current) return;
    saveView(viewStoreKey, { period, sort, tab, filter });
  }, [viewStoreKey, period, sort, tab, filter]);

  useEffect(() => {
    if (!storeKey || !restored.current) return;
    /* Only the received tab carries a reason cut: switching tab must not erase
       what the member last read. */
    if (tab !== 'received') return;
    savePick(storeKey, motif);
  }, [storeKey, motif, tab]);

  /** A new message drops the undo links: they only live right after the action. */
  const setNotice = (value: string) => {
    setNoticeRaw(value);
    setUndo(null);
    setQuickUndo(null);
  };

  /* The header shortcut links straight to /compte#demandes-b2b. */
  useEffect(() => {
    if (window.location.hash !== '#demandes-b2b') return;
    document.getElementById('demandes-b2b')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const received = box.received;
  const sent = box.sent;
  const todo = useMemo(() => received.filter((row) => row.statut === 'nouvelle'), [received]);
  const late = useMemo(() => received.filter(isLate), [received]);
  /*
   * The second threshold, as a cut of its own: the requests that passed a whole
   * week. Read on exactly the same age as the row badge and the reminder, so the
   * chip, the list and the counters above can never disagree.
   */
  const veryLate = useMemo(
    () =>
      received.filter((row) => {
        if (!isLate(row)) return false;
        const days = waitingDays(row.created_at);
        return days !== null && days >= 7;
      }),
    [received],
  );

  /**
   * The requests the shortcut has never served: still « nouvelle », although the
   * reminder has already been through their wait — a reminder was sent, or the
   * wait is past 48 h. Deliberately narrower than « À traiter », which also
   * holds the fresh arrivals nobody has had time to open yet: this cut is the
   * reminder's misses, not the day's work.
   */
  const neverRows = useMemo(
    () => received.filter((row) => row.statut === 'nouvelle' && (Boolean(row.rappel_at) || isLate(row))),
    [received],
  );
  const neverCount = neverRows.length;

  /**
   * Les dossiers de marché public, seuls : la même boîte reçoit un tirage et un
   * appel d'offres, et l'atelier qui répond aux marchés ne veut pas les trier à
   * la main. La coupe se lit sur la nature de la demande, à côté des attentes.
   */
  const marcheRows = useMemo(
    () => received.filter((row) => row.nature === 'marche'),
    [received],
  );
  const marcheCount = marcheRows.length;

  /* Only the reasons this workshop actually used: no dead chip on screen. */
  const motifCounts = useMemo(() => countMotifs(received), [received]);
  const usedMotifs = useMemo(
    () => B2B_MOTIF_KEYS.filter((key) => motifCounts[key] > 0),
    [motifCounts],
  );
  const closedCount = useMemo(
    () => usedMotifs.reduce((sum, key) => sum + motifCounts[key], 0),
    [usedMotifs, motifCounts],
  );
  /* Closures with no reason at all: the trace the workshop is missing. */
  const noMotifRows = useMemo(
    () => received.filter((row) => row.statut === 'traitee' && detectMotif(row.motif) === null),
    [received],
  );
  const noMotifCount = noMotifRows.length;

  /**
   * Closures whose reason was caught up in bulk after the fact: a rattrapage is
   * not the same trace as a reason given at the close, so it gets its own cut.
   */
  const lotRows = useMemo(
    () =>
      received.filter(
        (row) =>
          row.statut === 'traitee' && Boolean(row.motif_lot_at) && detectMotif(row.motif) !== null,
      ),
    [received],
  );
  const lotCount = lotRows.length;

  /**
   * Catch-ups erased afterwards: the trace was taken back, so the closure owes
   * a reason again. The mark is what lets the correction be read one by one.
   */
  const clearedRows = useMemo(
    () => received.filter((row) => Boolean(row.motif_lot_clear_at)),
    [received],
  );
  const clearedCount = clearedRows.length;

  /**
   * The fiches truly ploughed: corrected more than twice. Past two rounds it is
   * no longer a slip but a habit, and those are the ones worth isolating
   * instead of scrolling the whole correction list.
   */
  const reworkRows = useMemo(
    () => received.filter((row) => clearedTimes(row) > 2),
    [received],
  );
  const reworkCount = reworkRows.length;

  /**
   * The opposite cut: fiches already corrected, then left in peace for over a
   * month. The correction was made, but nobody came back — those are the traces
   * that quietly fell out of sight.
   */
  const staleRows = useMemo(
    () => received.filter((row) => isStaleCorrection(row)),
    [received],
  );
  const staleCount = staleRows.length;

  /**
   * The months that still carry a catch-up, so a remembered month cut never
   * lands on an empty list nobody asked for. Grouped on the handling date, like
   * the twelve-month chart the cut comes from.
   */
  const lotMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    lotRows.forEach((row) => {
      if (!row.traitee_at) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return;
      keys.add(monthKeyOf(date));
    });
    return keys;
  }, [lotRows]);

  /**
   * The months that gave a reason at the close itself: the other half of the
   * same trace, opened from the solid line of the twelve-month chart.
   */
  const originMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    received.forEach((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at || row.motif_lot_at) return;
      if (detectMotif(row.motif) === null) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return;
      keys.add(monthKeyOf(date));
    });
    return keys;
  }, [received]);

  /** The months that carry a correction, so a month cut never lands on empty. */
  const clearedMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    clearedRows.forEach((row) => {
      if (!row.motif_lot_clear_at) return;
      const date = new Date(row.motif_lot_clear_at);
      if (Number.isNaN(date.getTime())) return;
      keys.add(monthKeyOf(date));
    });
    return keys;
  }, [clearedRows]);

  /**
   * Every month that closed at least one request: the slow arrow of the chart
   * opens on those, so its cut can be checked against the loaded rows.
   */
  const closedMonthKeys = useMemo(() => {
    const keys = new Set<string>();
    received.forEach((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return;
      keys.add(monthKeyOf(date));
    });
    return keys;
  }, [received]);

  /**
   * Every month that left undocumented closures, newest first: the review names
   * last month, but a gap noticed two months late deserves the same cut, not a
   * single catch-all list where months melt together.
   */
  const gapMonths = useMemo(() => {
    const now = new Date();
    const floor = new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime();
    const buckets = new Map<string, Set<string>>();
    received.forEach((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return;
      if (detectMotif(row.motif) !== null) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime()) || date.getTime() < floor) return;
      const key = monthKeyOf(date);
      const ids = buckets.get(key) ?? new Set<string>();
      ids.add(row.id);
      buckets.set(key, ids);
    });
    const stamp = new Intl.DateTimeFormat(localeFor(lang), { month: 'short', year: 'numeric' });
    return [...buckets.entries()]
      .map(([key, ids]) => {
        const [year, month] = key.split('-').map(Number);
        const raw = stamp.format(new Date(year, (month || 1) - 1, 1));
        return {
          key,
          ids,
          count: ids.size,
          label: raw.charAt(0).toUpperCase() + raw.slice(1),
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [received, lang]);

  /** The ids of each gap month, so the cut is a lookup, not a rescan. */
  const gapIndex = useMemo(
    () => new Map(gapMonths.map((entry) => [entry.key, entry.ids])),
    [gapMonths],
  );

  /** Everything the twelve-month window still owes a reason for. */
  const gapTotal = useMemo(
    () => gapMonths.reduce((sum, entry) => sum + entry.count, 0),
    [gapMonths],
  );

  /** Every undocumented closure of the twelve-month window, in one cut. */
  const gapAllIds = useMemo(() => {
    const ids = new Set<string>();
    gapMonths.forEach((entry) => entry.ids.forEach((id) => ids.add(id)));
    return ids;
  }, [gapMonths]);

  /**
   * A remembered cut can go stale: the gaps were filled, or the reason no longer
   * appears. A clean list beats an empty one nobody asked for.
   */
  useEffect(() => {
    if (!restored.current || loading) return;
    setMotif((prev) => {
      if (prev.startsWith('gap:')) {
        return gapMonths.some((entry) => entry.key === prev.slice(4)) ? prev : 'all';
      }
      if (prev === 'all') return prev;
      if (prev === 'none') return noMotifCount > 0 ? prev : 'all';
      if (prev === 'lot') return lotCount > 0 ? prev : 'all';
      if (prev.startsWith('lot:')) {
        return lotMonthKeys.has(prev.slice(4)) ? prev : 'all';
      }
      if (prev === 'cleared') return clearedCount > 0 ? prev : 'all';
      if (prev === 'rework') return reworkCount > 0 ? prev : 'all';
      if (prev === 'stale') return staleCount > 0 ? prev : 'all';
      if (prev.startsWith('cleared:')) {
        return clearedMonthKeys.has(prev.slice(8)) ? prev : 'all';
      }
      if (prev.startsWith('origin:')) {
        return originMonthKeys.has(prev.slice(7)) ? prev : 'all';
      }
      /* The slow arrow's month: a month that no longer closed anything in the
         loaded rows would leave an empty list nobody asked for. */
      if (prev.startsWith('month:')) {
        return closedMonthKeys.has(prev.slice(6)) ? prev : 'all';
      }
      if (prev === 'gapAll') return gapTotal > 0 ? prev : 'all';
      return usedMotifs.includes(prev as B2bMotifKey) ? prev : 'all';
    });
  }, [loading, gapMonths, gapTotal, lotCount, lotMonthKeys, usedMotifs, noMotifCount, motif,
    clearedCount, clearedMonthKeys, reworkCount, staleCount, originMonthKeys, closedMonthKeys]);

  /** Month the review above reads: its link lands on that month's own gaps. */
  const lastMonthKey = useMemo(() => {
    const now = new Date();
    return monthKeyOf(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  }, []);

  /** The month right before a `2026-10` key: the duel always compares the two. */
  const prevMonthKeyOf = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    if (!Number.isFinite(year) || !Number.isFinite(month)) return '';
    return monthKeyOf(new Date(year, month - 2, 1));
  };

  /**
   * This month's closures, and how many of them carry a reason: the objective is
   * read on the handling date, like every other monthly figure in this box.
   */
  const monthClosures = useMemo(() => {
    const now = new Date();
    const rows = received.filter((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return false;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return false;
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    });
    const missing = rows.filter((row) => detectMotif(row.motif) === null).length;
    return { total: rows.length, missing };
  }, [received]);

  /** The first instant of the chosen window, or null for « everything ». */
  const periodStart = useMemo(() => {
    if (period === 'd7') return Date.now() - WEEK_MS;
    if (period === 'month') {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }
    return null;
  }, [period]);

  /** The rows on screen, then the chosen chronological order. */
  const list = useMemo(() => {
    const base = tab === 'received'
      ? filter === 'todo'
        ? todo
        : filter === 'late'
          ? late
          : filter === 'week'
            ? veryLate
            : filter === 'never'
              ? neverRows
              /* La coupe des marchés publics : la même boîte, lue sur la nature
                 du dossier — un tirage et un appel d'offres ne se répondent
                 pas avec le même vocabulaire. */
              : filter === 'marche'
                ? marcheRows
                : received
      : sent;
    const time = (iso: string) => {
      const stamp = new Date(iso).getTime();
      return Number.isFinite(stamp) ? stamp : 0;
    };
    /** The month a closure was handled in, or null when it carries none. */
    const handledMonth = (row: DemandeB2b) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return null;
      const date = new Date(row.traitee_at);
      return Number.isNaN(date.getTime()) ? null : monthKeyOf(date);
    };

    /* A reason is a closure, so it only ever cuts handled requests. One test
       per cut, written flat, so a new cut never tangles the ones above. */
    const matches = (row: DemandeB2b) => {
      if (motif === 'all') return true;
      if (motif === 'none') return row.statut === 'traitee' && detectMotif(row.motif) === null;
      if (motif === 'lot') {
        return Boolean(row.motif_lot_at) && detectMotif(row.motif) !== null;
      }
      if (motif === 'cleared') return Boolean(row.motif_lot_clear_at);
      if (motif === 'rework') return clearedTimes(row) > 2;
      if (motif === 'stale') return isStaleCorrection(row);
      if (motif === 'gapAll') return gapAllIds.has(row.id);
      if (motif.startsWith('lot:')) {
        if (!row.motif_lot_at || detectMotif(row.motif) === null) return false;
        return handledMonth(row) === motif.slice(4);
      }
      if (motif.startsWith('cleared:')) {
        if (!row.motif_lot_clear_at) return false;
        const date = new Date(row.motif_lot_clear_at);
        if (Number.isNaN(date.getTime())) return false;
        return monthKeyOf(date) === motif.slice(8);
      }
      /* The other half of the trace: the reason was given at the close itself. */
      if (motif.startsWith('origin:')) {
        if (row.motif_lot_at || detectMotif(row.motif) === null) return false;
        return handledMonth(row) === motif.slice(7);
      }
      /* Every closure of one month, whatever reason it carries: the slow arrow
         of the chart opens on it, so a slowdown is read down to the fiches. */
      if (motif.startsWith('month:')) return handledMonth(row) === motif.slice(6);
      if (motif.startsWith('gap:')) {
        return gapIndex.get(motif.slice(4))?.has(row.id) ?? false;
      }
      return detectMotif(row.motif) === motif;
    };

    const byMotif = base.filter(matches);
    /* The period cuts on the arrival date, and it cuts whatever the other
       filters already kept — never the other way round. */
    const scoped = periodStart === null
      ? byMotif
      : byMotif.filter((row) => time(row.created_at) >= periodStart);
    /* Reading the corrections means reading the most reworked fiches first:
       a closure corrected three times is not the same work as one corrected
       once, and that is the whole point of opening this cut. */
    const clearedMode = motif === 'cleared' || motif.startsWith('cleared:') || motif === 'rework';
    /* Reading the forgotten traces means reading the longest abandonment first:
       a fiche left alone for a year is the one that needs a look. */
    const staleMode = motif === 'stale';
    const alone = (row: DemandeB2b) => daysSinceCorrection(row) ?? -1;
    return [...scoped].sort((a, b) => {
      if (clearedMode) {
        const reworked = clearedTimes(b) - clearedTimes(a);
        if (reworked !== 0) return reworked;
      }
      if (staleMode) {
        const leftAlone = alone(b) - alone(a);
        if (leftAlone !== 0) return leftAlone;
      }
      /* On the week cut, the depth of the urgency is a reading of its own:
         ten days then thirty, whatever the dates say — the longest silence is
         the one that needs an answer. */
      if (sort === 'wait') {
        const waited = (waitingDays(b.created_at) ?? -1) - (waitingDays(a.created_at) ?? -1);
        if (waited !== 0) return waited;
      }
      const diff = time(a.created_at) - time(b.created_at);
      return sort === 'oldest' ? diff : -diff;
    });
  }, [tab, filter, sort, periodStart, motif, todo, late, veryLate, neverRows, marcheRows, received, sent, gapIndex, gapAllIds]);

  /*
   * La liste des demandes se pilote comme les autres listes du site : les
   * flèches haut et bas mettent une demande en avant (le geste boucle d'un
   * bout à l'autre), Entrée l'amène au centre et la désigne d'un liseré,
   * Échap rend la liste au repos. Les boutons de la ligne — répondre, classer,
   * mettre en pause — gardent leurs touches à eux : le raccourci ne vole
   * jamais un geste déjà commencé.
   */
  const [keyedRef, setKeyedRef] = useState<string | null>(null);
  /*
   * Les fiches parcourues au clavier pendant la visite : chaque demande mise en
   * avant y entre une fois, pour dire combien de fiches ont défilé sous les
   * flèches — la visite se compte au lieu de se deviner. La liste change de
   * contenu sans effacer ce qui a déjà été parcouru.
   */
  const [walked, setWalked] = useState<string[]>([]);
  const markWalked = (ref: string) => {
    setWalked((prev) => (prev.includes(ref) ? prev : [...prev, ref]));
  };
  const listRef = useRef<HTMLUListElement | null>(null);
  /* Une liste qui change de contenu ne garde pas une demande qui n'y est plus. */
  const listKey = list.map((row) => row.id).join(',');

  useEffect(() => {
    setKeyedRef(null);
  }, [listKey]);

  /* La demande mise en avant reste sous les yeux : la liste défile juste assez
     pour la garder dans le cadre. */
  useEffect(() => {
    if (!keyedRef) return;
    listRef.current?.querySelector('.b2br-row.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [keyedRef]);

  /**
   * Le compteur des fiches parcourues n'est pas qu'un chiffre : il rouvre la
   * dernière fiche mise en avant. La boîte revient à la liste entière, sans
   * coupe qui pourrait la cacher, puis la désigne et la ramène au centre.
   */
  const reopenLastWalked = () => {
    const ref = walked[walked.length - 1];
    if (!ref) return;
    setTab('received');
    setFilter('all');
    setMotif('all');
    setPeriod('all');
    setNotice('');
    setFailure('');
    setFocusRef(ref);
  };

  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (list.length === 0) return;
    const target = event.target as HTMLElement | null;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      /* Un menu déroulant ou un champ garde ses flèches. */
      if (target?.closest('select, input, textarea, [contenteditable="true"]')) return;
      event.preventDefault();
      const current = list.findIndex((row) => row.reference === keyedRef);
      const next = event.key === 'ArrowDown'
        ? (current < list.length - 1 ? current + 1 : 0)
        : (current > 0 ? current - 1 : list.length - 1);
      const nextRef = list[next]?.reference ?? null;
      setKeyedRef(nextRef);
      if (nextRef) markWalked(nextRef);
      return;
    }
    if (event.key === 'Escape') {
      setKeyedRef(null);
      return;
    }
    if (event.key !== 'Enter') return;
    /* Un lien ou un bouton déjà pris au clavier s'ouvre de lui-même. */
    if (target?.closest('a, button')) return;
    const chosen = list.find((row) => row.reference === keyedRef);
    if (!chosen) return;
    event.preventDefault();
    setFocusRef(chosen.reference);
  };

  /** The month picked in the gap list, or null when no month is being read. */
  const gapPick = motif.startsWith('gap:') ? motif.slice(4) : null;
  /** The month whose catch-ups are being read, from the twelve-month chart. */
  const lotPick = motif.startsWith('lot:') ? motif.slice(4) : null;
  /** The month whose erased catch-ups are being read, from the month review. */
  const clearedPick = motif.startsWith('cleared:') ? motif.slice(8) : null;
  /** The month whose original traces are being read, from the solid chart line. */
  const originPick = motif.startsWith('origin:') ? motif.slice(7) : null;
  /** The month whose closures are being read, opened from the slow arrow. */
  const monthPick = motif.startsWith('month:') ? motif.slice(6) : null;

  /** A `2026-10` key, written the way the inbox already names its months. */
  const monthNameOf = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    const raw = new Intl.DateTimeFormat(localeFor(lang), {
      month: 'short',
      year: 'numeric',
    }).format(new Date(year, (month || 1) - 1, 1));
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const day = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'medium' }).format(date);
  };

  /* The last silent refresh, so the member can trust the list he is reading. */
  const syncTime = syncedAt
    ? new Intl.DateTimeFormat(localeFor(lang), { hour: '2-digit', minute: '2-digit' }).format(syncedAt)
    : '';

  const switchTab = (next: Tab) => {
    setTab(next);
    setFilter('all');
    setMotif('all');
    /* The order is not a cut of one tab: a member reading « plus ancienne
       d’abord » keeps reading it after a detour through the sent box. */
    setNotice('');
    setFailure('');
  };

  /* Picking a reason means reading back closures: the unread filters would
     contradict it, so they step aside. */
  const pickMotif = (next: MotifPick) => {
    setMotif(next);
    if (next !== 'all') setFilter('all');
    setNotice('');
    setFailure('');
  };

  /* A reason only applies to closures: switching back to an unread filter
     clears it, so two cuts never contradict each other. */
  const pickFilter = (next: Filter) => {
    setFilter(next);
    setMotif('all');
    /* The wait order belongs to the cuts that read a silence: the week one, and
       the reminder’s misses, which are silence by definition — opening them
       lands on the longest wait, not on the most recent arrival. Leaving those
       cuts puts the dates back, instead of keeping an order no visible button
       carries. */
    if (next === 'never') setSort('wait');
    else if (next !== 'week' && sort === 'wait') setSort('recent');
    setNotice('');
    setFailure('');
  };

  /**
   * The twelve-month counter of the summary strip asks for that exact cut: the
   * box comes back on the received tab, every gap of the window in one list, and
   * the period reset so the counter and the list speak of the same window.
   */
  useEffect(() => {
    if (!openGapAll) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('gapAll');
    setNotice('');
    setFailure('');
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openGapAll]);

  /**
   * The account strip asks for a month of corrections: the box comes back on the
   * received tab and lists exactly what was erased that month. A month the
   * loaded rows no longer carry falls back on every correction rather than on
   * an empty list nobody asked for.
   */
  useEffect(() => {
    if (!openCleared) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif(
      clearedMonthKeys.has(openCleared.month)
        ? (`cleared:${openCleared.month}` as MotifPick)
        : 'cleared',
    );
    setNotice('');
    setFailure('');
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openCleared]);

  /**
   * The « 3 fois et + » counter of the account strip asks for that exact cut:
   * the box comes back on the received tab, the ploughed fiches first.
   */
  useEffect(() => {
    if (!openRework) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('rework');
    setNotice('');
    setFailure('');
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openRework]);

  /**
   * The « sans correction depuis 30 j » counter of the account strip asks for
   * the opposite cut of the same family: the correction was made, then nobody
   * came back. The box opens on those fiches alone, longest abandonment first.
   */
  useEffect(() => {
    if (!openStale) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('stale');
    setNotice('');
    setFailure('');
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openStale]);

  /**
   * The « fiches non documentées » counter of the account strip asks for the
   * family before any correction: the closures that never got a reason. The box
   * comes back on the received tab, the oldest of them first — the order of the
   * catch-up, not a pile.
   */
  useEffect(() => {
    if (!openUndoc) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setSort('oldest');
    setMotif('none');
    setNotice('');
    setFailure('');
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openUndoc]);

  /**
   * The year chip of the account strip asks for its own reading: the twelve-month
   * chart, opened if it was shut, and filtered on the months that fell under
   * their own target — the count and the months it counts, one click apart.
   */
  useEffect(() => {
    if (!openBelow) return;
    setShowTrend(true);
    setBelowAsk(openBelow);
    window.setTimeout(() => {
      document
        .getElementById('b2br-trend')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 90);
  }, [openBelow]);

  /**
   * The « délai en hausse ce mois » chip of the account strip asks for a door of
   * its own: the twelve-month chart, opened if it was shut, and framed on the
   * month that slowed down — the figure and the bar can no longer disagree.
   */
  useEffect(() => {
    if (!openSlow) return;
    const key = openSlow.month;
    setShowTrend(true);
    setTrendFocus((prev) => ({ month: key, nonce: (prev?.nonce ?? 0) + 1 }));
    /* The strip names the year's worst slowdown: the duel comes up already
       filled with that month and the one before it, so the figure reads as a
       comparison instead of asking for two thin bars to be clicked. */
    const before = prevMonthKeyOf(key);
    if (before) {
      setDuelRequest((prev) => ({ months: [before, key], nonce: (prev?.nonce ?? 0) + 1 }));
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openSlow]);

  /**
   * Opening « En retard » is reading them: the requests still marked « nouvelle »
   * flip to « vue » at once, so the badge tells the truth about what was read.
   */
  /**
   * Opening a cut is reading it: the requests still marked « nouvelle » flip to
   * « vue » at once. The shortcut's own trace keeps how many this very opening
   * moved, so the trace says what the door served, not only that it was used.
   * It is stamped first with zero, then corrected with the real count when the
   * server answers — a failed call still leaves the mark of the opening.
   */
  const readCut = (rows: DemandeB2b[], ref: string | null, source: LateRecallSource) => {
    markLateRecall(ref, 0, source);
    const unseen = rows.filter((row) => row.statut === 'nouvelle').map((row) => row.id);
    if (unseen.length === 0) return;
    void markSeen(unseen).then((count) => {
      if (count === null) {
        setFailure(t('acct.b2b.autoSeenFail'));
        return;
      }
      if (count > 0) setNotice(t('acct.b2b.autoSeen').replace('{n}', String(count)));
      markLateRecall(ref, count, source);
    });
  };

  const openLate = (
    ref: string | null = stats.lateOldestRef ?? null,
    source: LateRecallSource = 'chip',
  ) => {
    setFilter('late');
    setMotif('all');
    setNotice('');
    setFailure('');
    readCut(late, ref, source);
  };

  /**
   * The « Plus d’une semaine » chip is the same cut one threshold further:
   * it keeps the late requests and drops the ones still inside their first week.
   * Opening it is reading it, and the trace keeps how many that was.
   */
  const openWeek = (
    ref: string | null = null,
    source: LateRecallSource = 'chip',
  ) => {
    setFilter('week');
    setMotif('all');
    setNotice('');
    setFailure('');
    readCut(veryLate, ref, source);
  };

  /**
   * The header reminder is a door of its own: it asks for the late requests
   * exactly. The box comes back on the received tab, every window reset — a
   * remembered « 7 derniers jours » would hide the very requests the reminder
   * just named — and the « En retard » cut is applied, marking them « vue » the
   * way the chip itself does.
   */
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('b2b') !== 'retard') return;
    /* The reference the reminder named travels in the address: it is kept long
       enough to point at the very request, then dropped with the rest. */
    const ref = (params.get('b2bRef') || '').trim();
    setFocusRef(ref || null);
    setTab('received');
    setPeriod('all');
    /* The door has really served: the reading keeps its own trace, with the
       request it opened on, how many it flipped to « vue », and which door it
       was — the bar reminder, not the inbox chip. */
    openLate(ref || stats.lateOldestRef || null, 'reminder');
    /* The cut is applied: the address drops the order, so a reload never
       reopens it behind the member's back. */
    navigate(`${location.pathname}#demandes-b2b`, { replace: true });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.search, location.pathname, loading]);

  /**
   * The « en retard » counter of the account strip is the same door as the
   * header reminder: same cut, same window reset, same oldest request ringed —
   * and the same trace of the shortcut. Two entries, one behaviour.
   */
  useEffect(() => {
    if (!openLateAsk) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('all');
    setFocusRef(stats.lateOldestRef ?? null);
    openLate(stats.lateOldestRef ?? null, 'strip');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openLateAsk]);

  /**
   * A shared link carries a month: `?b2b=mois&b2bMonth=2026-09` opens the inbox
   * on the very closures that produced the depth, the twelve-month table behind
   * them, and the addresses are cleaned at once so a reload never re-imposes the
   * cut behind the reader’s back. A month the loaded rows no longer carry falls
   * back on the whole inbox rather than on an empty list nobody asked for.
   */
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('b2b') !== 'mois') return;
    const key = (params.get('b2bMonth') || '').trim();
    /* The cut is announced in the address, not trusted blindly. */
    const valid = /^\d{4}-\d{2}$/.test(key);
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setSort('oldest');
    setNotice('');
    setFailure('');
    if (valid) {
      setSharedMonth(key);
      /* A month, a fiche and a duel are three different hand-overs: opening one
         never leaves the note of another behind. */
      setSharedRequest(null);
      setSharedDuel(null);
      setMotif(
        closedMonthKeys.has(key) ? (`month:${key}` as MotifPick) : 'all',
      );
      /* The year table comes with the month: the depth was read there, so the
         reader lands on the same table, the fiches right under it. */
      setShowTrend(true);
    }
    /* The month leaves the address; the language stays, since the link was sent
       in one and a reload must not switch the reader back to French. */
    navigate(`${location.pathname}?lang=${lang}#demandes-b2b`, { replace: true });
    window.setTimeout(() => {
      document
        .getElementById('demandes-b2b')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.search, location.pathname, loading]);

  /**
   * A shared link can also carry one request: `?b2b=demande&b2bRef=D-…` opens
   * the inbox whole, rings that very fiche and walks the page down to it. The
   * address is cleaned at once, so a reload never re-imposes the mark, and a
   * reference the loaded rows no longer carry simply leaves the whole inbox.
   */
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('b2b') !== 'demande') return;
    const ref = (params.get('b2bRef') || '').trim();
    setTab('received');
    setFilter('all');
    setMotif('all');
    setPeriod('all');
    setNotice('');
    setFailure('');
    setSharedMonth(null);
    setSharedDuel(null);
    if (ref) {
      setSharedRequest(ref);
      setFocusRef(ref);
    }
    /* The reference leaves the address; the language stays, since the link was
       sent in one and a reload must not switch the reader back to French. */
    navigate(`${location.pathname}?lang=${lang}#demandes-b2b`, { replace: true });
    window.setTimeout(() => {
      document
        .getElementById('demandes-b2b')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.search, location.pathname, loading]);

  /**
   * A shared link can carry a duel too: `?b2b=duel&b2bMonths=2026-09,2026-10`
   * opens the twelve-month chart on those two months, already compared figure
   * by figure — the comparison itself is the hand-over, not a month of fiches.
   * The address is cleaned at once, so a reload never re-imposes the pair, and
   * a pair the loaded rows no longer carry simply leaves the chart as it was.
   */
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get('b2b') !== 'duel') return;
    const keys = (params.get('b2bMonths') || '')
      .split(',')
      .map((key) => key.trim())
      .filter((key) => /^\d{4}-\d{2}$/.test(key))
      .slice(-2);
    setTab('received');
    setFilter('all');
    setMotif('all');
    setPeriod('all');
    setNotice('');
    setFailure('');
    setSharedMonth(null);
    setSharedRequest(null);
    if (keys.length === 2) {
      setSharedDuel(keys);
      setShowTrend(true);
      setDuelRequest((prev) => ({ months: keys, nonce: (prev?.nonce ?? 0) + 1 }));
    } else {
      /* A pair that arrived broken is not a comparison: the chart stays whole
         rather than claiming two months it cannot name. */
      setSharedDuel(null);
    }
    /* The pair leaves the address; the language stays, since the link was sent
       in one and a reload must not switch the reader back to French. */
    navigate(`${location.pathname}?lang=${lang}#demandes-b2b`, { replace: true });
    window.setTimeout(() => {
      const target =
        document.getElementById('b2br-trend') ?? document.getElementById('demandes-b2b');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [location.search, location.pathname, loading]);

  /**
   * The cumulated-weeks cell of the account strip is the same door read the
   * other way round: the late cut, the oldest request ringed, but the list
   * ordered from the oldest date — a backlog six weeks deep should open on the
   * request that started it.
   */
  useEffect(() => {
    if (!openLateOldestAsk) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('all');
    setSort('oldest');
    setFocusRef(stats.lateOldestRef ?? null);
    openLate(stats.lateOldestRef ?? null, 'strip');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openLateOldestAsk]);

  /**
   * The week counter of the account strip asks for its own cut: the requests
   * past seven days alone, longest wait first — the width of the urgency opened
   * where the counter shows it, right beside the weeks that say its depth.
   */
  useEffect(() => {
    if (!openWeekAsk) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif('all');
    setSort('wait');
    openWeek(null, 'strip');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openWeekAsk]);

  /**
   * The « jamais ouvertes » counter of the account strip asks for its own cut:
   * the reminder’s misses alone, from the longest silence to the shortest. The
   * cut is not marked as read — these requests are « nouvelle » by definition,
   * and flipping them would empty the very list that was just asked for.
   */
  useEffect(() => {
    if (!openNeverAsk) return;
    setTab('received');
    setFilter('never');
    setPeriod('all');
    setMotif('all');
    setSort('wait');
    setNotice('');
    setFailure('');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openNeverAsk]);

  /**
   * The « mois au-delà du seuil d’attente » counter of the account strip is a
   * door of its own: the twelve-month table opens, sorted on its days waited
   * column, longest first — the count and the months it counts, one click
   * apart. The table reads the loaded requests, so the note under it says so.
   */
  useEffect(() => {
    if (!openWaitAsk) return;
    setShowTrend(true);
    setYearSortRequest((prev) => ({
      key: 'wait',
      dir: 'desc',
      nonce: (prev?.nonce ?? 0) + 1,
    }));
    window.setTimeout(() => {
      const table = document.getElementById('b2br-year');
      (table ?? document.getElementById('b2br-trend'))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 170);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openWaitAsk]);

  /**
   * The longest month of the account strip is a door of its own: not the table
   * that named it, the closures themselves — the fiches that produced the
   * depth, with their reasons and their dates. A month the loaded rows no
   * longer carry falls back on the whole inbox rather than on an empty list
   * nobody asked for.
   */
  useEffect(() => {
    if (!openMonthAsk) return;
    setTab('received');
    setFilter('all');
    setPeriod('all');
    setMotif(
      closedMonthKeys.has(openMonthAsk.month)
        ? (`month:${openMonthAsk.month}` as MotifPick)
        : 'all',
    );
    setNotice('');
    setFailure('');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openMonthAsk]);

  /**
   * The threshold recall of the account strip is a door of its own: it does not
   * open a list, it brings the workshop panel up — the setting the counter
   * measures against, where it can actually be changed.
   */
  useEffect(() => {
    if (!openGoalAsk) return;
    setTab('received');
    /* The panel is asked for, not merely pointed at: it opens unfolded on the
       wait threshold, with the cursor on the number in force — the panel itself
       walks the page down to that setting. */
    setWaitFocusAsk((prev) => prev + 1);
    /* No workshop card, no panel: the door then brings the inbox up rather than
       landing on nothing. */
    window.setTimeout(() => {
      if (document.getElementById('b2br-goal-wait')) return;
      document
        .getElementById('demandes-b2b')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 420);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [openGoalAsk]);

  /**
   * The reference line under the never-opened counter is a shorter door than
   * the counter itself: it points at that one request instead of reopening the
   * cut. The misses come back ordered from the longest silence and that very
   * reference is ringed — and, unlike the other cuts, nothing is flipped to
   * « vue »: these requests are « nouvelle » by definition, and marking them
   * read here would empty the list the member just asked to look at.
   */
  useEffect(() => {
    if (!neverFocusAsk) return;
    setTab('received');
    setFilter('never');
    setPeriod('all');
    setMotif('all');
    setSort('wait');
    setNotice('');
    setFailure('');
    setFocusRef(neverFocusAsk.ref);
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [neverFocusAsk]);

  /**
   * A remembered unread cut can go stale: the backlog may have been cleared
   * since. An empty list nobody asked for is worse than « tout », so the cut
   * steps aside as soon as it has nothing left to show.
   */
  useEffect(() => {
    if (!restored.current || loading) return;
    setFilter((prev) => {
      if (prev === 'week') return veryLate.length > 0 ? prev : 'all';
      if (prev === 'late') return late.length > 0 ? prev : 'all';
      /* The reminder's misses can vanish too, once they are opened: the cut then
         steps aside instead of showing a page nobody asked for. */
      if (prev === 'never') return neverRows.length > 0 ? prev : 'all';
      /* Un marché traité sort de la liste chargée : la coupe ne doit pas rester
         ouverte sur une page vide que personne n'a demandée. */
      if (prev === 'marche') return marcheRows.length > 0 ? prev : 'all';
      return prev;
    });
  }, [loading, veryLate, late, neverRows, marcheRows]);

  /**
   * The reference line under the cumulated weeks is a shortcut of its own: it
   * does not open the whole late cut, it points at that one request — the late
   * cut comes back, ordered from the oldest, and that very reference is ringed
   * and walked to. One figure, one face, one click.
   */
  useEffect(() => {
    if (!focusAsk) return;
    setTab('received');
    setMotif('all');
    setPeriod('all');
    setSort('oldest');
    setFocusRef(focusAsk.ref);
    /* Opening a cut is reading it, exactly as the chip does: the unseen of that
       cut flip to « vue », so the badge keeps telling the truth — and the trace
       keeps how many moved. */
    openLate(focusAsk.ref, 'strip');
    document
      .getElementById('demandes-b2b')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [focusAsk]);

  /**
   * The highlighted request is walked to and rings for a few seconds, then goes
   * back to being an ordinary row: the mark says « this one, just now », it does
   * not turn the oldest request into a permanent landmark.
   */
  useEffect(() => {
    if (!focusRef || loading) return undefined;
    const node = Array.from(
      document.querySelectorAll<HTMLElement>('[data-b2br-ref]'),
    ).find((el) => el.dataset.b2brRef === focusRef);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
      node.focus({ preventScroll: true });
    }
    const timer = window.setTimeout(() => setFocusRef(null), 7000);
    return () => window.clearTimeout(timer);
  }, [focusRef, loading]);

  const setStatut = async (row: DemandeB2b, statut: B2bStatut) => {
    setNotice('');
    setFailure('');
    const ok = await move(row.id, statut);
    if (ok) setNotice(t('acct.b2b.updated'));
    else setFailure(t('acct.b2b.updateFail'));
  };

  /** Closing a request: the reason travels with the status, on the same call. */
  const solve = async (row: DemandeB2b, motif: string) => {
    setNotice('');
    setFailure('');
    const ok = await move(row.id, 'traitee', motif);
    if (!ok) setFailure(t('acct.b2b.updateFail'));
    return ok;
  };

  /** Correcting a reason after the fact: only the trace changes, never the date. */
  const fixReason = async (id: string, motifValue: string) => {
    setNotice('');
    setFailure('');
    const ok = await fixMotif(id, motifValue);
    if (!ok) setFailure(t('acct.b2b.motifFixFail'));
    return ok;
  };

  /**
   * A catch-up chosen too fast? One click erases it: the closure owes its reason
   * again, and the strip counts it back into the backlog.
   */
  const clearLotOnRow = async (row: DemandeB2b) => {
    setNotice('');
    setFailure('');
    const ok = await clearLot(row.id);
    if (!ok) setFailure(t('acct.b2b.lotClearFail'));
    else setNotice(t('acct.b2b.lotCleared'));
  };

  /** Filling the gaps in one go: only the trace changes, never the dates. */
  const fillMissing = async (motifValue: string) => {
    setNotice('');
    setFailure('');
    const targets = list.filter((row) => row.statut === 'traitee' && detectMotif(row.motif) === null);
    const moved = await fillMotifBulk(
      targets.map((row) => row.id),
      motifValue,
    );
    if (moved === null) return null;
    /* Keep what each closure carried before, so the fill can be undone at once. */
    setNoticeRaw(t('acct.b2b.bulkMotifDone').replace('{n}', String(moved)));
    setUndo(targets.map((row) => ({ id: row.id, motif: row.motif ?? null })));
    /* The gaps are filled: go back to the whole inbox so the work is visible. */
    setMotif('all');
    return moved;
  };

  /**
   * Chosen too fast? One click and every closure of that bulk finds its previous
   * reason again — the gaps come back, the closing dates stay frozen.
   */
  const undoBulk = async () => {
    if (!undo) return;
    setNoticeRaw('');
    setFailure('');
    const ok = await restoreMotifs(undo);
    if (!ok) {
      setFailure(t('acct.b2b.bulkUndoFail'));
      return;
    }
    setUndo(null);
    setNoticeRaw(t('acct.b2b.bulkUndoDone'));
    /* The closures are undocumented again: show them, so nothing stays hidden. */
    setMotif('none');
  };

  /** Emptying the list in one go: the badge goes with it, at the same moment. */
  const markEverything = async () => {
    setNotice('');
    setFailure('');
    const count = await markAll();
    if (count === null) setFailure(t('acct.b2b.markAllFail'));
    else {
      setFilter('all');
      setNotice(t('acct.b2b.markAllDone').replace('{n}', String(count)));
    }
  };

  /* The alert switch speaks for itself: one line under it says it is saved. */
  const onAlerts = async (next: boolean) => {
    setNotice('');
    setFailure('');
    const ok = await setAlerts(next);
    if (ok) setNotice(t('acct.b2b.alertsSaved'));
    else setFailure(t('acct.b2b.alertsFail'));
  };

  /* A push-back that the server refused must say so, never pretend. */
  const onSnooze = async (row: DemandeB2b, until: string | null) => {
    setNotice('');
    setFailure('');
    const ok = await snooze(row.id, until);
    if (!ok) setFailure(t('acct.b2b.snoozeFail'));
    return ok;
  };

  /** The monthly target for documented closures, saved for this workshop. */
  const onObjectif = async (value: number | null) => {
    setNotice('');
    setFailure('');
    const ok = await saveObjectif(value);
    if (ok) {
      setNotice(
        value === null
          ? t('acct.b2b.goalCleared')
          : t('acct.b2b.goalSaved').replace('{n}', String(value)),
      );
    } else setFailure(t('acct.b2b.goalFail'));
    return ok;
  };

  /**
   * The wait threshold, saved on the same panel as the objective. The box holds
   * it, so the table below and the export read the number just chosen — and the
   * strip is refreshed on the same signal, from the same column.
   */
  const onWaitGoal = async (value: number | null) => {
    setNotice('');
    setFailure('');
    const ok = await saveWaitGoal(value);
    if (ok) {
      setNotice(
        value === null
          ? t('acct.b2b.waitGoalCleared')
          : t('acct.b2b.waitGoalSaved').replace('{n}', String(value)),
      );
    } else setFailure(t('acct.b2b.waitGoalFail'));
    return ok;
  };

  /**
   * The one-click close: the reason the workshop saved as its default travels
   * with the status, so nothing is closed without a trace.
   */
  const quickClose = async (row: DemandeB2b) => {
    const key = box.motifDefaut;
    if (!key) return;
    const label = t(`acct.b2b.motif.${key}`);
    /* Where it stood before the click: reopening must bring it back there. */
    const before = row.statut;
    setNotice('');
    setFailure('');
    const ok = await move(row.id, 'traitee', label);
    if (!ok) setFailure(t('acct.b2b.quickCloseFail'));
    else {
      setNoticeRaw(t('acct.b2b.quickCloseDone').replace('{motif}', label));
      setUndo(null);
      setQuickUndo({ id: row.id, reference: row.reference, statut: before });
    }
  };

  /**
   * Chosen too fast? The request goes back to the status it carried before the
   * one-click close — « nouvelle » or « vue » — and its reason is cleared, since
   * a request that is not handled has no closing reason.
   */
  const undoQuickClose = async () => {
    if (!quickUndo) return;
    const target = quickUndo;
    setNoticeRaw('');
    setFailure('');
    const ok = await move(target.id, target.statut);
    if (!ok) {
      setFailure(t('acct.b2b.quickUndoFail'));
      return;
    }
    setQuickUndo(null);
    setNoticeRaw(
      t('acct.b2b.quickUndoDone')
        .replace('{ref}', target.reference)
        .replace('{statut}', t(STATUS_KEY[target.statut])),
    );
  };

  /** Saving the reason this workshop closes with, so it comes back preselected. */
  const rememberDefault = async (next: B2bMotifKey | null) => {
    setNotice('');
    setFailure('');
    const ok = await rememberMotif(next);
    if (ok) setNotice(t(next ? 'acct.b2b.motifDefaultSaved' : 'acct.b2b.motifDefaultCleared'));
    else setFailure(t('acct.b2b.motifDefaultFail'));
    return ok;
  };

  /** The reply leaves through the workshop own mail box, reference in the subject. */
  const replyHref = (row: DemandeB2b) => {
    const subject = `${t('acct.b2b.title')} — ${row.reference}`;
    return `mailto:${row.email}?subject=${encodeURIComponent(subject)}`;
  };

  const renderRow = (row: DemandeB2b) => {
    const busy = busyId === row.id;
    const isReceived = tab === 'received';
    /* Past a week, the delay changes nature: the row says it on its own, so the
       urgency is read in the list without going through the reminder. Read on
       the same age as the counter, so the badge and the bar never disagree. */
    const waitDays = waitingDays(row.created_at);
    const lateForAWeek = isReceived && isLate(row) && waitDays !== null && waitDays >= 7;
    return (
      <li
        key={row.id}
        className={`b2br-row${focusRef === row.reference ? ' is-focus' : ''}${keyedRef === row.reference ? ' is-keyed' : ''}`}
        data-state={row.statut}
        data-late={isLate(row) ? 'yes' : 'no'}
        data-week={lateForAWeek ? 'yes' : 'no'}
        data-b2br-ref={row.reference}
        tabIndex={-1}
      >
        <div className="b2br-top">
          <span className="b2br-ref">
            <i className="ri-hashtag" aria-hidden="true"></i>
            {row.reference}
          </span>
          {/* Un marché public ne se lit pas comme un tirage : la pastille dit
              d'où le dossier vient, à côté de sa référence. */}
          {row.nature === 'marche' && (
            <span className="b2br-badge b2br-badge--marche" title={t('acct.b2b.marcheBadgeHint')}>
              <i className="ri-government-line" aria-hidden="true"></i>
              {t('acct.b2b.marcheBadge')}
            </span>
          )}
          {isReceived && (
            <span className="b2br-badge" data-state={row.statut}>{t(STATUS_KEY[row.statut])}</span>
          )}
          {isReceived && isLate(row) && (
            <span className="b2br-badge b2br-badge--late">
              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
              {t('acct.b2b.lateBadge')}
            </span>
          )}
          {/* The second threshold, on the row itself: « plus d’une semaine »
              turns a long wait into an urgency at a glance, without opening
              the reminder first. */}
          {lateForAWeek && (
            <span
              className="b2br-badge b2br-badge--week"
              title={t('acct.b2b.veryLateBadgeHint').replace(
                '{n}',
                String(waitDays),
              )}
            >
              <i className="ri-calendar-close-line" aria-hidden="true"></i>
              {t('acct.b2b.veryLateBadge')}
            </span>
          )}
          {/* How long it has really waited, in whole days: the figure behind the
              two pills, right beside them and on the same clock as the export. */}
          {isReceived && isLate(row) && waitDays !== null && (
            <span className="b2br-badge b2br-badge--wait" title={t('acct.b2b.waitDaysHint')}>
              <i className="ri-hourglass-line" aria-hidden="true"></i>
              {t('acct.b2b.waitDays').replace('{n}', String(waitDays))}
            </span>
          )}
          <span className="b2br-date">
            {isReceived ? t('acct.b2b.receivedOn') : t('acct.b2b.sentOn')} {day(row.created_at)}
          </span>
        </div>

        {isReceived && row.rappel_at && (
          <p className="b2br-late">
            <i className="ri-alarm-warning-line" aria-hidden="true"></i>
            {t('acct.b2b.reminderSent')} {day(row.rappel_at)}
          </p>
        )}

        {isReceived && row.statut === 'traitee' && (
          <p className="b2br-solved" data-missing={detectMotif(row.motif) ? 'no' : 'yes'}>
            <i
              className={detectMotif(row.motif) ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}
              aria-hidden="true"
            ></i>
            {row.traitee_at
              ? `${t('acct.b2b.treatedOn')} ${day(row.traitee_at)}`
              : t('acct.b2b.statusTraitee')}
            <span className="b2br-motif">
              <i className="ri-bookmark-line" aria-hidden="true"></i>
              {row.motif || t('acct.b2b.motifMissing')}
            </span>
            {/* Corrected more than once: the fiche says how many times, so the
                most reworked ones are recognisable at a glance. */}
            {row.motif_lot_clear_at && clearedTimes(row) > 1 && (
              <span
                className="b2br-cleared-times"
                title={t('acct.b2b.clearedTimesHint').replace('{n}', String(clearedTimes(row)))}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>×{clearedTimes(row)}
              </span>
            )}
            {/* A caught-up reason must not look like one given at the close. */}
            {row.motif_lot_at && detectMotif(row.motif) && (
              <>
                <span
                  className="b2br-lot"
                  title={t('acct.b2b.bulkBadgeHint').replace('{date}', day(row.motif_lot_at))}
                >
                  <i className="ri-stack-line" aria-hidden="true"></i>
                  {t('acct.b2b.bulkBadge')}
                </span>
                {/* Not what was meant? The catch-up goes away, the closure owes
                    its reason again — the handling date never moves. */}
                <button
                  type="button"
                  className="b2br-lot-clear"
                  title={t('acct.b2b.lotClearHint')}
                  disabled={busy}
                  onClick={() => void clearLotOnRow(row)}
                >
                  <i
                    className={busy ? 'ri-loader-4-line is-spin' : 'ri-eraser-line'}
                    aria-hidden="true"
                  ></i>
                  {t('acct.b2b.lotClear')}
                </button>
              </>
            )}
          </p>
        )}

        <h3 className="b2br-who">
          <i className={isReceived ? 'ri-user-line' : 'ri-store-2-line'} aria-hidden="true"></i>
          {isReceived ? row.nom : row.dest_name}
          {row.organisme && <em>{row.organisme}</em>}
        </h3>

        <p className="b2br-meta">
          <span>
            <i className="ri-mail-line" aria-hidden="true"></i>
            <a href={`mailto:${row.email}`}>{row.email}</a>
          </span>
          {row.telephone && (
            <span>
              <i className="ri-phone-line" aria-hidden="true"></i>
              <a href={`tel:${row.telephone}`}>{row.telephone}</a>
            </span>
          )}
          {!isReceived && (
            <span>
              <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
              {row.dest_name}
            </span>
          )}
        </p>

        {(row.quantite || row.delai || row.budget) && (
          <ul className="b2br-facts">
            {row.quantite && (
              <li>
                <span>{t('acct.b2b.qty')}</span>
                <strong>{row.quantite}</strong>
              </li>
            )}
            {row.delai && (
              <li>
                <span>{t('acct.b2b.deadline')}</span>
                <strong>{row.delai}</strong>
              </li>
            )}
            {row.budget && (
              <li>
                <span>{t('acct.b2b.budget')}</span>
                <strong>{row.budget}</strong>
              </li>
            )}
          </ul>
        )}

        {/* Les deux pièces du dossier : le cahier des charges et le bordereau,
            ouverts par un lien signé que le serveur refait à chaque lecture.
            Rien n'est public, et la fiche dit lequel des deux elle tient. */}
        {(row.piece_cdc_url || row.piece_bordereau_url) && (
          <ul className="b2br-pieces" aria-label={t('acct.b2b.piecesLabel')}>
            {row.piece_cdc_url && (
              <li>
                <a
                  href={row.piece_cdc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('acct.b2b.pieceOpenHint')}
                >
                  <i className="ri-file-pdf-2-line" aria-hidden="true"></i>
                  {t('acct.b2b.pieceCdc')}
                </a>
              </li>
            )}
            {row.piece_bordereau_url && (
              <li>
                <a
                  href={row.piece_bordereau_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('acct.b2b.pieceOpenHint')}
                >
                  <i className="ri-file-pdf-2-line" aria-hidden="true"></i>
                  {t('acct.b2b.pieceBordereau')}
                </a>
              </li>
            )}
          </ul>
        )}

        {/* Les deux pièces du dossier : le cahier des charges et le bordereau,
            ouverts par un lien signé que le serveur refait à chaque lecture.
            Rien n'est public, et la fiche dit lequel des deux elle tient. */}
        {(row.piece_cdc_url || row.piece_bordereau_url) && (
          <ul className="b2br-pieces" aria-label={t('acct.b2b.piecesLabel')}>
            {row.piece_cdc_url && (
              <li>
                <a
                  href={row.piece_cdc_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('acct.b2b.pieceOpenHint')}
                >
                  <i className="ri-file-pdf-2-line" aria-hidden="true"></i>
                  {t('acct.b2b.pieceCdc')}
                </a>
              </li>
            )}
            {row.piece_bordereau_url && (
              <li>
                <a
                  href={row.piece_bordereau_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t('acct.b2b.pieceOpenHint')}
                >
                  <i className="ri-file-pdf-2-line" aria-hidden="true"></i>
                  {t('acct.b2b.pieceBordereau')}
                </a>
              </li>
            )}
          </ul>
        )}

        <p className="b2br-body">
          <i className="ri-chat-quote-line" aria-hidden="true"></i>
          {row.message}
        </p>

        <div className="b2br-actions">
          <a href={replyHref(row)} className="ad-btn ad-btn--solid">
            <i className="ri-mail-send-line" aria-hidden="true"></i>
            {t('acct.b2b.reply')}
          </a>
          {row.telephone && (
            <a href={`tel:${row.telephone}`} className="ad-btn">
              <i className="ri-phone-line" aria-hidden="true"></i>
              {t('acct.b2b.call')}
            </a>
          )}
          {isReceived && row.statut === 'nouvelle' && (
            <button type="button" className="ad-btn" onClick={() => void setStatut(row, 'vue')} disabled={busy}>
              <i className="ri-eye-line" aria-hidden="true"></i>
              {t('acct.b2b.markVue')}
            </button>
          )}
          {isReceived && row.statut !== 'traitee' && (
            <B2bSnooze
              row={row}
              busy={snoozeBusyId === row.id}
              onSnooze={(until) => onSnooze(row, until)}
              onNotice={setNotice}
            />
          )}
          {isReceived && row.statut !== 'traitee' && box.motifDefaut && (
            <button
              type="button"
              className="ad-btn b2br-quick"
              disabled={busy}
              title={t('acct.b2b.quickCloseHint').replace(
                '{motif}',
                t(`acct.b2b.motif.${box.motifDefaut}`),
              )}
              onClick={() => void quickClose(row)}
            >
              <i className={busy ? 'ri-loader-4-line is-spin' : 'ri-flashlight-line'} aria-hidden="true"></i>
              {t('acct.b2b.quickClose')}
              <em>{t(`acct.b2b.motif.${box.motifDefaut}`)}</em>
            </button>
          )}
          {isReceived && row.statut !== 'traitee' && (
            <B2bSolve
              row={row}
              busy={busy}
              defaultMotif={box.motifDefaut}
              savingDefault={motifSaving}
              onSolve={(motifValue) => solve(row, motifValue)}
              onDefault={rememberDefault}
              onNotice={setNotice}
            />
          )}
          {isReceived && row.statut === 'traitee' && (
            <B2bMotifFix
              row={row}
              busy={busy}
              onFix={(motifValue) => fixReason(row.id, motifValue)}
              onNotice={setNotice}
            />
          )}
          {isReceived && row.statut === 'traitee' && (
            <button type="button" className="ad-btn" onClick={() => void setStatut(row, 'nouvelle')} disabled={busy}>
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              {t('acct.b2b.markNouvelle')}
            </button>
          )}
          {/* The fiche itself, handed over: the link carries its reference, so a
              colleague opens the inbox on that very request — no retelling. */}
          <B2bShareLink
            href={b2bRequestHref(row.reference, lang)}
            label={t('acct.b2b.requestShare')}
            hint={t('acct.b2b.requestShareHint').replace('{ref}', row.reference)}
            className="ad-btn b2br-share"
          />
        </div>
      </li>
    );
  };

  if (!user) return null;

  const emptyText = tab === 'sent'
    ? t('acct.b2b.emptySent')
    : !box.entrepriseId
      ? t('acct.b2b.emptyNoCard')
      : motif === 'none'
        ? t('acct.b2b.emptyNoMotif')
        : motif === 'lot'
          ? t('acct.b2b.emptyLot')
          : motif === 'cleared'
            ? t('acct.b2b.emptyCleared')
            : motif === 'rework'
              ? t('acct.b2b.emptyRework')
              : motif === 'stale'
                ? t('acct.b2b.emptyStale')
                : lotPick !== null
            ? t('acct.b2b.emptyLotMonth').replace('{month}', monthNameOf(lotPick))
            : clearedPick !== null
              ? t('acct.b2b.emptyClearedMonth').replace('{month}', monthNameOf(clearedPick))
              : originPick !== null
                ? t('acct.b2b.emptyOriginMonth').replace('{month}', monthNameOf(originPick))
                : monthPick !== null
                  ? t('acct.b2b.emptyMonth').replace('{month}', monthNameOf(monthPick))
              : motif === 'gapAll'
            ? t('acct.b2b.emptyGapAll')
            : gapPick !== null
          ? t('acct.b2b.emptyGapMonth').replace(
              '{month}',
              gapMonths.find((entry) => entry.key === gapPick)?.label ?? gapPick,
            )
          : motif !== 'all'
          ? t('acct.b2b.emptyMotif')
          : period !== 'all'
            ? t('acct.b2b.emptyPeriod')
            : filter === 'todo'
              ? t('acct.b2b.emptyTodo')
              : filter === 'late'
                ? t('acct.b2b.emptyLate')
                : filter === 'week'
                  ? t('acct.b2b.emptyWeek')
                  : filter === 'never'
                    ? t('acct.b2b.emptyNever')
                    : filter === 'marche'
                      ? t('acct.b2b.emptyMarche')
                      : t('acct.b2b.empty');

  return (
    <section className="pro-card capp b2br" id="demandes-b2b">
      <div className="capp-head">
        <div>
          <h2 className="page-h2">{t('acct.b2b.title')}</h2>
          <p className="auth-note capp-sub">{t('acct.b2b.sub')}</p>
          <p className="b2b-live">
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span>{t('acct.b2b.live')}</span>
            {syncTime && <time dateTime={syncedAt?.toISOString()}>{syncTime}</time>}
          </p>
        </div>
        <div className="segmented capp-tabs" role="group" aria-label={t('acct.b2b.title')}>
          <button
            type="button"
            className={tab === 'received' ? 'is-on' : ''}
            aria-pressed={tab === 'received'}
            onClick={() => switchTab('received')}
          >
            {/* Le tableau B2B ne reprend plus les signes de la candidature :
                la boîte ouverte reste à ce qu'on reçoit ici (comme la porte
                « Demandes B2B » de la barre), et l'envoi part en courrier. */}
            <i className="ri-inbox-line" aria-hidden="true"></i>
            {t('acct.b2b.tabReceived')}
            <span className="capp-n">{received.length}</span>
          </button>
          <button
            type="button"
            className={tab === 'sent' ? 'is-on' : ''}
            aria-pressed={tab === 'sent'}
            onClick={() => switchTab('sent')}
          >
            <i className="ri-mail-send-line" aria-hidden="true"></i>
            {t('acct.b2b.tabSent')}
            <span className="capp-n">{sent.length}</span>
          </button>
        </div>
      </div>

      {notice && (
        <p className="form-msg ok b2br-notice">
          <span>{notice}</span>
          {undo && (
            <button
              type="button"
              className="b2br-undo"
              onClick={() => void undoBulk()}
              disabled={bulkMotifBusy}
            >
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              {t('acct.b2b.bulkUndo')}
            </button>
          )}
          {quickUndo && (
            <button
              type="button"
              className="b2br-undo"
              title={t('acct.b2b.quickUndoHint').replace('{ref}', quickUndo.reference)}
              onClick={() => void undoQuickClose()}
              disabled={busyId === quickUndo.id}
            >
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              {t('acct.b2b.quickUndo')}
            </button>
          )}
        </p>
      )}
      {failure && <p className="form-msg err">{failure}</p>}

      <CardLinker
        current={box.entrepriseId}
        issue={linkIssue}
        onLink={linkCard}
        onClearIssue={clearLinkIssue}
      />

      <B2bAlertsPref
        enabled={box.alertesEmail}
        hasCard={Boolean(box.entrepriseId)}
        saving={alertsSaving}
        onChange={(next) => void onAlerts(next)}
      />

      {tab === 'received' && box.entrepriseId && (
        <B2bMotifGoal
          objectif={box.objectif}
          waitGoalDays={box.waitGoalDays}
          monthTotal={monthClosures.total}
          monthMissing={monthClosures.missing}
          history={box.objectifHistory}
          saving={objectifSaving}
          onSave={onObjectif}
          savingWait={waitGoalSaving}
          onSaveWait={onWaitGoal}
          /* The strip’s threshold recall: the wait setting comes forward, the
             cursor on the number in force. */
          focusWaitAsk={waitFocusAsk}
          onCatchUp={() => pickMotif('none')}
        />
      )}

      {/* The month that just ended, once it is over: target held or not, and
          the traces it left behind. Judged against its own threshold. */}
      {tab === 'received' && box.entrepriseId && !loading && (
        <B2bMonthRecap
          rows={received}
          objectif={box.objectif}
          objectifHistory={box.objectifHistory}
          onCatchUp={() =>
            pickMotif(
              gapMonths.some((entry) => entry.key === lastMonthKey)
                ? (`gap:${lastMonthKey}` as MotifPick)
                : 'none',
            )
          }
          /* The rebuilt part of last month's trace: one click lists exactly
             those closures, so the catch-up can be reviewed — or erased. */
          onOpenLot={() => {
            pickMotif('lot');
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The corrections of last month: one click lists the closures whose
             catch-up was erased, so the fix can be read case by case. */
          onOpenCleared={() => {
            pickMotif(
              clearedMonthKeys.has(lastMonthKey)
                ? (`cleared:${lastMonthKey}` as MotifPick)
                : 'all',
            );
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The fiches taken back over twice, all months together: next to the
             corrections, so the worst of them is one click away from the month
             that spotted them. */
          onOpenRework={() => {
            pickMotif('rework');
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The same corrections read backwards: the fiches corrected then left
             in peace for over a month, the longest abandonment first. */
          onOpenStale={() => {
            pickMotif('stale');
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The month just ended and the one before it, pre-filled on the chart:
             the duel of the month review, without picking two bars by hand. */
          onCompare={(months) => {
            setShowTrend(true);
            setDuelRequest((prev) => ({ months, nonce: (prev?.nonce ?? 0) + 1 }));
            window.setTimeout(() => {
              document
                .getElementById('b2br-trend')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
          }}
          /* The same figure as the strip: a fiche left in peace may sit far
             below the two hundred loaded rows, and the door must still show. */
          staleTotal={stats.stale30}
          /* Same corrections, all months together: the chip of the reason bar,
             brought next to the month line instead of hidden down there. */
          onOpenAllCleared={() => {
            pickMotif('cleared');
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      )}

      {tab === 'received' && box.entrepriseId && received.length > 0 && (
        <div className="capp-toolbar b2br-toolbar">
          <div className="capp-filter" role="group" aria-label={t('acct.b2b.title')}>
            <button
              type="button"
              className={`capp-chip${filter === 'all' ? ' is-on' : ''}`}
              aria-pressed={filter === 'all'}
              onClick={() => pickFilter('all')}
            >
              <i className="ri-inbox-line" aria-hidden="true"></i>
              {t('acct.b2b.filterAll')}
              <span className="capp-n">{received.length}</span>
            </button>
            <button
              type="button"
              className={`capp-chip${filter === 'todo' ? ' is-on' : ''}`}
              aria-pressed={filter === 'todo'}
              onClick={() => pickFilter('todo')}
            >
              <i className="ri-inbox-unarchive-line" aria-hidden="true"></i>
              {t('acct.b2b.filterNew')}
              <span className="capp-n">{todo.length}</span>
            </button>
            <button
              type="button"
              className={`capp-chip capp-chip--late${filter === 'late' ? ' is-on' : ''}`}
              aria-pressed={filter === 'late'}
              onClick={() => openLate()}
            >
              <i className="ri-alarm-warning-line" aria-hidden="true"></i>
              {t('acct.b2b.filterLate')}
              <span className="capp-n">{late.length}</span>
            </button>
            {/* The second threshold, in the bar itself: past a week the wait has
                changed nature, so it gets its own entry instead of a badge to
                look for in the list. */}
            {veryLate.length > 0 && (
              <button
                type="button"
                className={`capp-chip capp-chip--week${filter === 'week' ? ' is-on' : ''}`}
                aria-pressed={filter === 'week'}
                title={t('acct.b2b.filterWeekHint')}
                onClick={() => openWeek()}
              >
                <i className="ri-calendar-close-line" aria-hidden="true"></i>
                {t('acct.b2b.filterWeek')}
                <span className="capp-n">{veryLate.length}</span>
              </button>
            )}
            {/* The third unread cut, and the narrowest: what the reminder has
                already been through without the request ever being opened. */}
            {neverCount > 0 && (
              <button
                type="button"
                className={`capp-chip capp-chip--never${filter === 'never' ? ' is-on' : ''}`}
                aria-pressed={filter === 'never'}
                title={t('acct.b2b.filterNeverHint')}
                onClick={() => pickFilter('never')}
              >
                <i className="ri-eye-off-line" aria-hidden="true"></i>
                {t('acct.b2b.filterNever')}
                <span className="capp-n">{neverCount}</span>
              </button>
            )}
            {/* Les dossiers de marché public, à côté des attentes : la même
                boîte reçoit les deux, mais l'atelier qui répond aux appels
                d'offres ne veut pas les trier à la main. */}
            {marcheCount > 0 && (
              <button
                type="button"
                className={`capp-chip capp-chip--marche${filter === 'marche' ? ' is-on' : ''}`}
                aria-pressed={filter === 'marche'}
                title={t('acct.b2b.filterMarcheHint')}
                onClick={() => pickFilter('marche')}
              >
                <i className="ri-government-line" aria-hidden="true"></i>
                {t('acct.b2b.filterMarche')}
                <span className="capp-n">{marcheCount}</span>
              </button>
            )}
          </div>
          {(usedMotifs.length > 0 || noMotifCount > 0 || gapMonths.length > 0 || lotCount > 0 || clearedCount > 0 || reworkCount > 0 || staleCount > 0 || monthPick !== null) && (
            <div className="b2br-sort b2br-motifs" role="group" aria-label={t('acct.b2b.motifFilter')}>
              <span className="b2br-sort-lead">{t('acct.b2b.motifFilter')}</span>
              <button
                type="button"
                className={`b2br-sort-btn${motif === 'all' ? ' is-on' : ''}`}
                aria-pressed={motif === 'all'}
                onClick={() => pickMotif('all')}
              >
                <i className="ri-bookmark-line" aria-hidden="true"></i>
                {t('acct.b2b.motifAll')}
                <span className="capp-n">{closedCount}</span>
              </button>
              {usedMotifs.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`b2br-sort-btn${motif === key ? ' is-on' : ''}`}
                  aria-pressed={motif === key}
                  onClick={() => pickMotif(key)}
                >
                  {t(`acct.b2b.motif.${key}`)}
                  <span className="capp-n">{motifCounts[key]}</span>
                </button>
              ))}
              {/* A catch-up of one month, opened from the twelve-month chart: the
                  chip says which month is being read, and closes it again. */}
              {lotPick !== null && (
                <button
                  type="button"
                  className="b2br-sort-btn b2br-sort-btn--lot is-on"
                  aria-pressed
                  title={t('acct.b2b.motifLotClear')}
                  onClick={() => pickMotif('all')}
                >
                  <i className="ri-stack-line" aria-hidden="true"></i>
                  {monthNameOf(lotPick)}
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              )}
              {/* The corrections of a month, opened from the month review: the
                  chip says which month, and drops it again in one click. */}
              {clearedPick !== null && (
                <button
                  type="button"
                  className="b2br-sort-btn b2br-sort-btn--cleared is-on"
                  aria-pressed
                  title={t('acct.b2b.motifClearedClear')}
                  onClick={() => pickMotif('all')}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  {monthNameOf(clearedPick)}
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              )}
              {/* The other half of the same month, opened from the solid line of
                  the chart: the closures that got their reason on the day. */}
              {originPick !== null && (
                <button
                  type="button"
                  className="b2br-sort-btn b2br-sort-btn--origin is-on"
                  aria-pressed
                  title={t('acct.b2b.motifOriginClear')}
                  onClick={() => pickMotif('all')}
                >
                  <i className="ri-contrast-2-line" aria-hidden="true"></i>
                  {monthNameOf(originPick)}
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              )}
              {/* The closures of one month, opened from the slow arrow of the
                  chart: the chip names the month and drops it in one click. */}
              {monthPick !== null && (
                <button
                  type="button"
                  className="b2br-sort-btn b2br-sort-btn--month is-on"
                  aria-pressed
                  title={t('acct.b2b.motifMonthClear')}
                  onClick={() => pickMotif('all')}
                >
                  <i className="ri-arrow-up-line" aria-hidden="true"></i>
                  {monthNameOf(monthPick)}
                  <i className="ri-close-line" aria-hidden="true"></i>
                </button>
              )}
              {noMotifCount > 0 && (
                <button
                  type="button"
                  className={`b2br-sort-btn b2br-sort-btn--missing${motif === 'none' ? ' is-on' : ''}`}
                  aria-pressed={motif === 'none'}
                  onClick={() => pickMotif('none')}
                >
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {t('acct.b2b.motifNone')}
                  <span className="capp-n">{noMotifCount}</span>
                </button>
              )}
              {/* A reason filled in bulk is a trace of a different kind: it gets
                  its own cut, so a rattrapage never hides among the real ones. */}
              {lotCount > 0 && (
                <button
                  type="button"
                  className={`b2br-sort-btn b2br-sort-btn--lot${motif === 'lot' ? ' is-on' : ''}`}
                  aria-pressed={motif === 'lot'}
                  title={t('acct.b2b.motifLotHint')}
                  onClick={() => pickMotif('lot')}
                >
                  <i className="ri-stack-line" aria-hidden="true"></i>
                  {t('acct.b2b.motifLot')}
                  <span className="capp-n">{lotCount}</span>
                </button>
              )}
              {/* The corrections read the other way round: not the traces that
                  were rebuilt, but the ones taken back afterwards. Any month
                  can be read from here, without going through the review. */}
              {clearedCount > 0 && (
                <button
                  type="button"
                  className={`b2br-sort-btn b2br-sort-btn--cleared${motif === 'cleared' ? ' is-on' : ''}`}
                  aria-pressed={motif === 'cleared'}
                  title={t('acct.b2b.motifClearedHint')}
                  onClick={() => pickMotif('cleared')}
                >
                  <i className="ri-eraser-line" aria-hidden="true"></i>
                  {t('acct.b2b.motifCleared')}
                  <span className="capp-n">{clearedCount}</span>
                </button>
              )}
              {/* The hardest cut of the same family: past two corrections the
                  fiche was ploughed, not adjusted. Shown only when it exists. */}
              {reworkCount > 0 && (
                <button
                  type="button"
                  className={`b2br-sort-btn b2br-sort-btn--rework${motif === 'rework' ? ' is-on' : ''}`}
                  aria-pressed={motif === 'rework'}
                  title={t('acct.b2b.motifReworkHint')}
                  onClick={() => pickMotif('rework')}
                >
                  <i className="ri-fire-line" aria-hidden="true"></i>
                  {t('acct.b2b.motifRework')}
                  <span className="capp-n">{reworkCount}</span>
                </button>
              )}
              {/* The same family read backwards: the correction was made, then the
                  fiche was left alone — the traces nobody came back to. */}
              {staleCount > 0 && (
                <button
                  type="button"
                  className={`b2br-sort-btn b2br-sort-btn--stale${motif === 'stale' ? ' is-on' : ''}`}
                  aria-pressed={motif === 'stale'}
                  title={t('acct.b2b.motifStaleHint')}
                  onClick={() => pickMotif('stale')}
                >
                  <i className="ri-time-line" aria-hidden="true"></i>
                  {t('acct.b2b.motifStale')}
                  <span className="capp-n">{staleCount}</span>
                </button>
              )}
            </div>
          )}
          {/* A gap is not only last month's: any month can be reopened, and the
              list carries how many closures each one left undocumented. */}
          {gapMonths.length > 0 && (
            <div className="b2br-sort b2br-gapmonth" data-on={gapPick ? 'yes' : 'no'}>
              <span className="b2br-sort-lead">{t('acct.b2b.motifGapMonth')}</span>
              <label className="b2br-gapmonth-field">
                <i className="ri-calendar-todo-line" aria-hidden="true"></i>
                <select
                  value={gapPick ?? ''}
                  aria-label={t('acct.b2b.motifGapMonth')}
                  title={t('acct.b2b.motifGapMonth')}
                  onChange={(event) => {
                    const key = event.target.value;
                    pickMotif(key ? (`gap:${key}` as MotifPick) : 'all');
                  }}
                >
                  <option value="">{t('acct.b2b.gapMonthAll')}</option>
                  {gapMonths.map((entry) => (
                    <option key={entry.key} value={entry.key}>
                      {entry.label} · {entry.count}
                    </option>
                  ))}
                </select>
              </label>
              {/* The whole backlog at a glance: one month is a cut, the total is
                  the size of the problem — and one click opens every gap of it. */}
              <button
                type="button"
                className="b2br-gapmonth-sum"
                aria-pressed={motif === 'gapAll'}
                title={t('acct.b2b.gapMonthsTotalHint')}
                onClick={() => pickMotif(motif === 'gapAll' ? 'all' : 'gapAll')}
              >
                <i className="ri-history-line" aria-hidden="true"></i>
                {t('acct.b2b.gapMonthsTotal').replace('{n}', String(gapTotal))}
              </button>
            </div>
          )}
          <div className="b2br-sort" role="group" aria-label={t('acct.b2b.sortLabel')}>
            <span className="b2br-sort-lead">{t('acct.b2b.sortLabel')}</span>
            <button
              type="button"
              className={`b2br-sort-btn${sort === 'recent' ? ' is-on' : ''}`}
              aria-pressed={sort === 'recent'}
              onClick={() => setSort('recent')}
            >
              <i className="ri-sort-desc" aria-hidden="true"></i>
              {t('acct.b2b.sortRecent')}
            </button>
            <button
              type="button"
              className={`b2br-sort-btn${sort === 'oldest' ? ' is-on' : ''}`}
              aria-pressed={sort === 'oldest'}
              onClick={() => setSort('oldest')}
            >
              <i className="ri-sort-asc" aria-hidden="true"></i>
              {t('acct.b2b.sortOldest')}
            </button>
            {/* Only on the cuts that read a silence: the depth of the urgency
                ranked by days waited, so the request that has been sleeping
                thirty days comes before the one that just crossed seven — and
                the reminder’s misses, which have never been opened at all. */}
            {(filter === 'week' || filter === 'never') && (
              <button
                type="button"
                className={`b2br-sort-btn${sort === 'wait' ? ' is-on' : ''}`}
                aria-pressed={sort === 'wait'}
                title={t('acct.b2b.sortWaitHint')}
                onClick={() => setSort('wait')}
              >
                <i className="ri-hourglass-line" aria-hidden="true"></i>
                {t('acct.b2b.sortWait')}
              </button>
            )}
          </div>
          <div className="b2br-sort b2br-period" role="group" aria-label={t('acct.b2b.periodLabel')}>
            <span className="b2br-sort-lead">{t('acct.b2b.periodLabel')}</span>
            <button
              type="button"
              className={`b2br-sort-btn${period === 'all' ? ' is-on' : ''}`}
              aria-pressed={period === 'all'}
              onClick={() => setPeriod('all')}
            >
              <i className="ri-calendar-2-line" aria-hidden="true"></i>
              {t('acct.b2b.periodAll')}
            </button>
            <button
              type="button"
              className={`b2br-sort-btn${period === 'd7' ? ' is-on' : ''}`}
              aria-pressed={period === 'd7'}
              onClick={() => setPeriod('d7')}
            >
              <i className="ri-calendar-line" aria-hidden="true"></i>
              {t('acct.b2b.period7d')}
            </button>
            <button
              type="button"
              className={`b2br-sort-btn${period === 'month' ? ' is-on' : ''}`}
              aria-pressed={period === 'month'}
              onClick={() => setPeriod('month')}
            >
              <i className="ri-calendar-event-line" aria-hidden="true"></i>
              {t('acct.b2b.periodMonth')}
            </button>
          </div>
          <div className="b2br-tools">
            <button
              type="button"
              className={`ghost-btn b2br-trend-toggle${showTrend ? ' is-on' : ''}`}
              aria-expanded={showTrend}
              onClick={() => setShowTrend((prev) => !prev)}
            >
              <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
              {t('acct.b2b.trendToggle')}
            </button>
            <B2bCsvExport
              rows={list}
              neverRows={neverRows}
              objectif={box.objectif}
              objectifHistory={box.objectifHistory}
              /* Le périmètre de la synthèse est mémorisé par compte : le
                 fichier suivant rouvre sur les mêmes états cochés. */
              accountKey={user?.id ?? ''}
              waitGoalDays={box.waitGoalDays}
            />
            {todo.length > 0 && (
              <button
                type="button"
                className="ghost-btn b2br-all"
                onClick={() => void markEverything()}
                disabled={bulkBusy}
              >
                <i
                  className={bulkBusy ? 'ri-loader-4-line is-spin' : 'ri-check-double-line'}
                  aria-hidden="true"
                ></i>
                {bulkBusy ? t('acct.b2b.markAllBusy') : t('acct.b2b.markAll')}
                {!bulkBusy && <span className="capp-n">{todo.length}</span>}
              </button>
            )}
            <Link to="/demande-b2b" className="ghost-btn b2br-new">
              <i className="ri-add-line" aria-hidden="true"></i>
              {t('acct.b2b.newCta')}
            </Link>
          </div>
        </div>
      )}

      {tab === 'received' && showTrend && !loading && (
        <B2bMotifTrend
          rows={received}
          objectif={box.objectif}
          objectifHistory={box.objectifHistory}
          /* A month's bulk mark is a door: it opens the catch-ups of that very
             month, so a rattrapage is reviewed where it was spotted. */
          onOpenLotMonth={(key) => {
            pickMotif(`lot:${key}` as MotifPick);
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The second hatch is a door too: it lists that month's corrections
             one by one, so a trace taken back can be read where it was seen. */
          onOpenClearedMonth={(key) => {
            pickMotif(`cleared:${key}` as MotifPick);
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The solid line is a door too: it lists the closures of that month
             whose reason came at the close, not patched up afterwards. */
          onOpenOriginMonth={(key) => {
            setPeriod('all');
            pickMotif(`origin:${key}` as MotifPick);
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The slow arrow is a door too: it lists the closures of that very
             month, so a slowdown is read down to the fiches behind it. */
          onOpenMonth={(key) => {
            setPeriod('all');
            pickMotif(`month:${key}` as MotifPick);
            /* The arrow names a slowdown: the duel is pre-filled with that very
               month and the one before it, so the comparison already stands
               when the list opens. */
            const before = prevMonthKeyOf(key);
            if (before) {
              setDuelRequest((prev) => ({
                months: [before, key],
                nonce: (prev?.nonce ?? 0) + 1,
              }));
            }
            document
              .getElementById('demandes-b2b')
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          /* The pair asked for by the month review lands here already picked. */
          duelRequest={duelRequest}
          /* The month the account strip pointed at lands here already framed. */
          focusMonth={trendFocus}
          /* The year chip asks for the months in fault only, already filtered. */
          belowRequest={belowAsk}
          /* The strip's wait counter asks for the year table, sorted on the very
             column of the days waited; the threshold of the week comes with it,
             so the tint of the months past it is the strip's own threshold. */
          yearSortRequest={yearSortRequest}
          /* The workshop threshold, read on the very setting saved next to the
             objective: the table tints the months past the number the workshop
             chose, not a week written twice in the code. */
          waitGoalDays={box.waitGoalDays}
          /* The duel is remembered per account: the two months picked here are
             still standing when the member comes back. */
          memoryKey={compareKey(user.id)}
          /* The pair a colleague handed over, still standing: the panel says
             the comparison came from a link, not from two clicks here. */
          sharedDuel={sharedDuel}
          /* The visit came from a shared month link: the table carries the quiet
             way back up to the strip, instead of asking for a scroll. */
          backToStrip={
            sharedMonth
              ? () => document
                  .getElementById('acct-summary')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              : undefined
          }
        />
      )}

      {tab === 'received' && noMotifCount > 0 && motif !== 'none' && motif !== 'gapAll' && gapPick === null && lotPick === null && clearedPick === null && originPick === null && monthPick === null && !loading && (
        <p className="b2br-nomotif">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.noMotifWarn').replace('{n}', String(noMotifCount))}</span>
          <button type="button" className="b2br-nomotif-cta" onClick={() => pickMotif('none')}>
            {t('acct.b2b.noMotifWarnCta')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </button>
        </p>
      )}

      {tab === 'received' && (motif === 'cleared' || motif === 'rework' || clearedPick !== null) && !loading && list.length > 1 && (
        <p className="b2br-sortnote">
          <i className="ri-sort-desc" aria-hidden="true"></i>
          <span>{t('acct.b2b.clearedSortNote')}</span>
        </p>
      )}

      {tab === 'received' && motif === 'stale' && !loading && list.length > 1 && (
        <p className="b2br-sortnote">
          <i className="ri-time-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.staleSortNote')}</span>
        </p>
      )}

      {/* The wait order is a reading of its own, and it says so: the list is not
          in date order, and a member opening it must not wonder why the tenth of
          the month sits above the third. */}
      {tab === 'received' && filter === 'week' && sort === 'wait' && !loading && list.length > 1 && (
        <p className="b2br-sortnote">
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.waitSortNote')}</span>
        </p>
      )}

      {/* The cut explains itself: these rows are unread although the reminder
          already named their wait — a miss, not a fresh arrival. */}
      {tab === 'received' && filter === 'never' && !loading && list.length > 0 && (
        <p className="b2br-sortnote">
          <i className="ri-eye-off-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.neverNote')}</span>
        </p>
      )}

      {/* The cut did not come from a click inside the box: a colleague shared it.
          The list says so, and names the month it was handed over for. */}
      {tab === 'received' && sharedMonth && monthPick === sharedMonth && !loading && (
        <p className="b2br-sortnote">
          <i className="ri-link" aria-hidden="true"></i>
          <span>
            {t('acct.b2b.monthLinkNote').replace('{month}', monthNameOf(sharedMonth))}
          </span>
        </p>
      )}

      {/* Same family, one fiche instead of one month: the list names the
          reference a colleague handed over, so the ring is never a mystery. */}
      {tab === 'received' && sharedRequest && !loading && (
        <p className="b2br-sortnote b2br-sharelinknote">
          <i className="ri-link" aria-hidden="true"></i>
          <span>{t('acct.b2b.requestLinkNote').replace('{ref}', sharedRequest)}</span>
        </p>
      )}

      {/* And it says in which order it is read: none of these has ever been
          opened, so the longest silence comes first. */}
      {tab === 'received' && filter === 'never' && sort === 'wait' && !loading && list.length > 1 && (
        <p className="b2br-sortnote">
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          <span>{t('acct.b2b.neverSortNote')}</span>
        </p>
      )}

      {tab === 'received' && focusRef && !loading && (
        <p className="b2br-sortnote b2br-focusnote" role="status">
          <i className="ri-focus-3-line" aria-hidden="true"></i>
          <span>
            {t('acct.b2b.lateFocus')} — <b>{focusRef}</b>
          </span>
        </p>
      )}

      {tab === 'received' && (motif === 'none' || motif === 'gapAll' || gapPick !== null) && !loading && list.length > 0 && (
        <B2bMotifBulk
          count={list.length}
          busy={bulkMotifBusy}
          defaultMotif={box.motifDefaut}
          onApply={fillMissing}
        />
      )}

      {loading ? (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('acct.b2b.loading')}
        </p>
      ) : error ? (
        <div className="capp-error">
          <p className="auth-note">{t('acct.b2b.error')}</p>
          <button type="button" className="ghost-btn" onClick={() => void reload()}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('acct.b2b.retry')}
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="capp-empty">
          <i
            className={
              tab === 'sent'
                ? 'ri-send-plane-line'
                : !box.entrepriseId
                  ? 'ri-store-2-line'
                  : motif !== 'all'
                    ? 'ri-bookmark-line'
                    : filter === 'late'
                      ? 'ri-alarm-warning-line'
                      : filter === 'week'
                        ? 'ri-calendar-close-line'
                        : 'ri-inbox-line'
            }
            aria-hidden="true"
          ></i>
          <p>{emptyText}</p>
          {tab === 'sent' ? (
            <button type="button" className="ghost-btn" onClick={() => navigate('/demande-b2b')}>
              <i className="ri-add-line" aria-hidden="true"></i>
              {t('acct.b2b.newCta')}
            </button>
          ) : filter !== 'all' ? (
            <button
              type="button"
              className="ghost-btn"
              onClick={() => pickFilter('all')}
            >
              {t('acct.b2b.filterAll')}
            </button>
          ) : motif !== 'all' ? (
            <button type="button" className="ghost-btn" onClick={() => pickMotif('all')}>
              {t('acct.b2b.motifAll')}
            </button>
          ) : period !== 'all' ? (
            <button type="button" className="ghost-btn" onClick={() => setPeriod('all')}>
              {t('acct.b2b.periodAll')}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <ul
            className="capp-list b2br-list"
            ref={listRef}
            tabIndex={0}
            aria-label={t('acct.b2b.title')}
            onKeyDown={onListKey}
          >
            {list.map(renderRow)}
          </ul>
          {list.length > 1 && (
            <p className="doss-keyhint b2br-keyhint">
              <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
              {t('acct.b2b.listKey')}
            </p>
          )}
          {/* Combien de fiches sont vraiment passées sous les flèches : le
              geste laisse une trace chiffrée au lieu d'un simple rappel — et
              le chiffre est une porte, qui rouvre la dernière fiche parcourue. */}
          {walked.length > 0 && (
            <button
              type="button"
              className="doss-keyhint b2br-keyhint b2br-walked"
              aria-live="polite"
              title={t('acct.b2b.keyWalkOpen').replace(
                '{ref}',
                walked[walked.length - 1],
              )}
              onClick={reopenLastWalked}
            >
              <i className="ri-footprint-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.keyWalk').replace('{n}', String(walked.length))}</span>
              <i className="ri-arrow-right-line b2br-walked-go" aria-hidden="true"></i>
            </button>
          )}
        </>
      )}
    </section>
  );
}