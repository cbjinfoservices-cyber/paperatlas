import { useCallback, useEffect, useRef, useState } from 'react';
import {
  EMPTY_B2B_BOX,
  EMPTY_B2B_STATS,
  clearB2bLotMark,
  fetchB2bBox,
  fetchB2bStats,
  linkDirectoryCard,
  markAllB2bHandled,
  markB2bSeen,
  restoreB2bMotifs,
  setB2bAlerts,
  setB2bMotif,
  setB2bMotifBulk,
  setB2bMotifDefaut,
  setB2bObjectif,
  setB2bStatut,
  setB2bWaitGoal,
  snoozeB2bRequest,
  type B2bBox,
  type B2bIssue,
  type B2bMotifEntry,
  type B2bMotifKey,
  type B2bStats,
  type B2bStatut,
} from '@/lib/b2b';

/** A new request should show up on its own, without the member reloading. */
const AUTO_MS = 60 * 1000;

/** Fired when the inbox changes locally, so the header badge stays truthful. */
const B2B_CHANGED = 'b2b:changed';

/**
 * The workshop inbox. Loaded only for a signed-in member: an anonymous visitor
 * never asks the server for requests that are not theirs.
 *
 * A silent refresh runs every minute, and again as soon as the tab comes back to
 * the foreground: nobody can stare at a list that stayed frozen all morning.
 */
export function useB2bBox(enabled: boolean) {
  const [box, setBox] = useState<B2bBox>(EMPTY_B2B_BOX);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [linkIssue, setLinkIssue] = useState<B2bIssue | null>(null);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  /**
   * `silent` keeps the current list on screen: an auto-refresh must never flash
   * the loading state, nor wipe the list when a single tick fails.
   */
  const run = useCallback(async (silent: boolean) => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    if (!silent) {
      setLoading(true);
      setError('');
    }
    try {
      const next = await fetchB2bBox();
      if (!alive.current) return;
      setBox(next);
      setError('');
      setSyncedAt(new Date());
    } catch (err) {
      if (!alive.current) return;
      if (!silent) setError(err instanceof Error ? err.message : 'error');
    } finally {
      if (alive.current && !silent) setLoading(false);
    }
  }, [enabled]);

  const load = useCallback(() => run(false), [run]);

  useEffect(() => {
    void load();
  }, [load]);

  /* One tick a minute, plus a catch-up when the tab is shown again. */
  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      void run(true);
    };

    const timer = window.setInterval(tick, AUTO_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void run(true);
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, run]);

  const move = useCallback(async (id: string, statut: B2bStatut, motif?: string | null) => {
    setBusyId(id);
    const ok = await setB2bStatut(id, statut, motif);
    if (ok) {
      const now = new Date().toISOString();
      const reason = statut === 'traitee' ? (motif ?? null) : null;
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          row.id === id
            ? {
                ...row,
                statut,
                motif: reason,
                /* A close or a reopen clears the bulk mark: the trace is
                   given now, not caught up after the fact. */
                motif_lot_at: null,
                motif_lot_cleared: null,
                motif_lot_clear_at: null,
                traitee_at: statut === 'traitee' ? (row.traitee_at ?? now) : null,
              }
            : row,
        ),
      }));
      /* The header badge listens: a handled request stops counting at once. */
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setBusyId('');
    return ok;
  }, []);

  /**
   * Opening a batch means it has been read: those requests flip to « vue » on
   * the server, and the « à traiter » count drops in the same breath.
   */
  const markSeen = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return 0;
    const moved = await markB2bSeen(ids);
    if (moved === null) return null;
    if (moved.length === 0) return 0;
    const seen = new Set(moved);
    setBox((prev) => ({
      ...prev,
      received: prev.received.map((row) =>
        seen.has(row.id) ? { ...row, statut: 'vue' as B2bStatut } : row,
      ),
    }));
    window.dispatchEvent(new Event(B2B_CHANGED));
    return moved.length;
  }, []);

  /**
   * « Tout marquer comme traité »: one server call, then the whole list and the
   * header badge drop to zero in the same breath — no minute-long ghost badge.
   */
  const markAll = useCallback(async () => {
    setBulkBusy(true);
    const count = await markAllB2bHandled();
    if (count !== null) {
      const now = new Date().toISOString();
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          row.statut === 'traitee'
            ? row
            : { ...row, statut: 'traitee' as B2bStatut, traitee_at: row.traitee_at ?? now },
        ),
      }));
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setBulkBusy(false);
    return count;
  }, []);

  /**
   * Corrects a reason after the fact: the row is already handled, so only the
   * trace changes — never the status, never the handling date.
   */
  const fixMotif = useCallback(async (id: string, motif: string) => {
    setBusyId(id);
    const result = await setB2bMotif(id, motif);
    if (result.ok) {
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          row.id === id ? { ...row, motif: result.motif, motif_lot_at: null, motif_lot_cleared: null, motif_lot_clear_at: null } : row,
        ),
      }));
      /* The summary recomputes the month breakdown on the same signal. */
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setBusyId('');
    return result.ok;
  }, []);

  /**
   * Erases a bulk catch-up on one closure: the reason filled in bulk goes away,
   * so the request owes one again. Status and handling date stay frozen.
   */
  const clearLot = useCallback(async (id: string) => {
    setBusyId(id);
    const result = await clearB2bLotMark(id);
    if (result.ok) {
      /* The erasure is kept on the row: the month review counts those
         corrections instead of letting them disappear without a trace. */
      const stamp = result.clearedAt;
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          row.id === id
            ? {
                ...row,
                motif: null,
                motif_lot_at: null,
                motif_lot_clear_at: stamp ?? new Date().toISOString(),
                /* Which reason was taken back: the CSV can attribute it. */
                motif_lot_cleared: result.erased,
                /* Ranked, not guessed: the server counted this correction. */
                motif_lot_clear_count: result.clearedCount,
              }
            : row,
        ),
      }));
      /* The backlog counts and the header badge recompute on the same signal. */
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setBusyId('');
    return result.ok;
  }, []);

  /** Fills the missing reasons of a whole batch of closures in one go. */
  const [bulkMotifBusy, setBulkMotifBusy] = useState(false);
  const fillMotifBulk = useCallback(async (ids: string[], motif: string) => {
    if (ids.length === 0) return 0;
    setBulkMotifBusy(true);
    const result = await setB2bMotifBulk(ids, motif);
    if (result.ok) {
      const touched = new Set(result.ids);
      /* Stamped as a caught-up trace: the row says so from now on. */
      const stamp = new Date().toISOString();
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          touched.has(row.id) ? { ...row, motif: result.motif, motif_lot_at: stamp, motif_lot_cleared: null, motif_lot_clear_at: null } : row,
        ),
      }));
      /* The month breakdown and the header badge recompute on the same signal. */
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setBulkMotifBusy(false);
    return result.ok ? result.ids.length : null;
  }, []);

  /**
   * Undo of a bulk fill: every touched closure gets the reason it carried
   * before. The status and the handling dates are untouched.
   */
  const restoreMotifs = useCallback(async (entries: B2bMotifEntry[]) => {
    if (entries.length === 0) return true;
    setBulkMotifBusy(true);
    const result = await restoreB2bMotifs(entries);
    if (result.ok) {
      const before = new Map(result.entries.map((entry) => [entry.id, entry.motif]));
      if (before.size > 0) {
        setBox((prev) => ({
          ...prev,
          received: prev.received.map((row) =>
            before.has(row.id)
              ? { ...row, motif: before.get(row.id) ?? null, motif_lot_at: null, motif_lot_cleared: null, motif_lot_clear_at: null }
              : row,
          ),
        }));
        window.dispatchEvent(new Event(B2B_CHANGED));
      }
    }
    setBulkMotifBusy(false);
    return result.ok;
  }, []);

  /** Links or unlinks the directory card, then reloads so the inbox fills up. */  const linkCard = useCallback(async (entrepriseId: string | null) => {
    setLinkIssue(null);
    const issue = await linkDirectoryCard(entrepriseId);
    if (issue) {
      setLinkIssue(issue);
      return false;
    }
    await load();
    return true;
  }, [load]);

  /** The e-mail alerts toggle: optimistic, and rolled back if the server refuses. */
  const [alertsSaving, setAlertsSaving] = useState(false);
  const setAlerts = useCallback(async (enabled: boolean) => {
    setAlertsSaving(true);
    setBox((prev) => ({ ...prev, alertesEmail: enabled }));
    const ok = await setB2bAlerts(enabled);
    if (!ok) setBox((prev) => ({ ...prev, alertesEmail: !enabled }));
    setAlertsSaving(false);
    return ok;
  }, []);

  /** The saved default closing reason: preselected on the next closure. */
  const [motifSaving, setMotifSaving] = useState(false);
  const rememberMotif = useCallback(async (motif: B2bMotifKey | null) => {
    setMotifSaving(true);
    const result = await setB2bMotifDefaut(motif);
    if (result.ok) setBox((prev) => ({ ...prev, motifDefaut: result.motif }));
    setMotifSaving(false);
    return result.ok;
  }, []);

  /** The monthly target for documented closures: the alert reads it back. */
  const [objectifSaving, setObjectifSaving] = useState(false);
  const saveObjectif = useCallback(async (value: number | null) => {
    setObjectifSaving(true);
    const result = await setB2bObjectif(value);
    if (result.ok) {
      setBox((prev) => ({ ...prev, objectif: result.objectif }));
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setObjectifSaving(false);
    return result.ok;
  }, []);

  /**
   * The wait threshold, saved on the same panel as the target. The box holds it
   * so the table, the export and the trend panel read the very number the
   * workshop just chose — and the strip is refreshed on the same signal.
   */
  const [waitGoalSaving, setWaitGoalSaving] = useState(false);
  const saveWaitGoal = useCallback(async (value: number | null) => {
    setWaitGoalSaving(true);
    const result = await setB2bWaitGoal(value);
    if (result.ok) {
      setBox((prev) => ({ ...prev, waitGoalDays: result.waitGoalDays }));
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setWaitGoalSaving(false);
    return result.ok;
  }, []);

  /** Pushes a request back to a later date, then clears it again. */
  const [snoozeBusyId, setSnoozeBusyId] = useState('');
  const snooze = useCallback(async (id: string, until: string | null) => {
    setSnoozeBusyId(id);
    const result = await snoozeB2bRequest(id, until);
    if (result.ok) {
      setBox((prev) => ({
        ...prev,
        received: prev.received.map((row) =>
          row.id === id ? { ...row, snooze_at: result.snoozeAt } : row,
        ),
      }));
      /* The header badge and the summary count listen too. */
      window.dispatchEvent(new Event(B2B_CHANGED));
    }
    setSnoozeBusyId('');
    return result.ok;
  }, []);

  return {
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
    reload: load,
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
    clearLinkIssue: () => setLinkIssue(null),
  };
}

/**
 * The pulse shared by the header badge and the account summary: how many
 * requests still wait, and how many have been waiting for over 48 h.
 * Same rhythm as the inbox — one tick a minute, plus a catch-up when the tab
 * comes back — but a far lighter call, so it can run on every page.
 */
function useB2bPulse(enabled: boolean): B2bStats {
  const [stats, setStats] = useState<B2bStats>(EMPTY_B2B_STATS);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const pull = useCallback(async () => {
    if (!enabled) {
      setStats(EMPTY_B2B_STATS);
      return;
    }
    const next = await fetchB2bStats();
    if (alive.current) setStats(next);
  }, [enabled]);

  useEffect(() => {
    void pull();
  }, [pull]);

  useEffect(() => {
    if (!enabled) return undefined;

    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      void pull();
    };

    const timer = window.setInterval(tick, AUTO_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void pull();
    };

    document.addEventListener('visibilitychange', onVisible);
    const onLocal = () => void pull();
    window.addEventListener(B2B_CHANGED, onLocal);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener(B2B_CHANGED, onLocal);
    };
  }, [enabled, pull]);

  return stats;
}

/**
 * The number shown in the header badge: requests still marked « nouvelle ».
 */
export function useB2bTodo(enabled: boolean) {
  const { todo } = useB2bPulse(enabled);

  /**
   * The browser tab carries the number too: a workshop with the tab left open on
   * another page still sees that requests are waiting, without switching back.
   */
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const prefix = todo > 0 ? `(${todo}) ` : '';
    const strip = (value: string) => value.replace(/^\(\d+\)\s+/, '');

    const apply = () => {
      const next = `${prefix}${strip(document.title)}`;
      if (document.title !== next) document.title = next;
    };

    apply();
    /* The page writes its own title (SEO, language switch): keep the count on top. */
    const title = document.querySelector('title');
    if (!title) return undefined;
    const observer = new MutationObserver(apply);
    observer.observe(title, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [todo]);

  return todo;
}

/** The account summary reads both numbers, on the same pulse as the badge. */
export function useB2bStats(enabled: boolean): B2bStats {
  return useB2bPulse(enabled);
}