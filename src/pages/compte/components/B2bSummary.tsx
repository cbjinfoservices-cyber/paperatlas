import { useMemo } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useB2bStats } from '@/hooks/useB2b';
import { B2B_MOTIF_KEYS, type B2bMotifKey } from '@/lib/b2b';
import { countMotifs, detectMotif } from './b2bMotifs';
import B2bShareLink, { b2bMonthHref } from './B2bShareLink';

/** Under three measurable closures, a monthly average is a rumour, not a figure. */
const THIN_SAMPLE = 3;

/**
 * The account summary strip: how many B2B requests are waiting, how many have
 * been waiting for over 48 h, how fast this workshop answers — and what it
 * closed with this month, compared with the month before. Same pulse as the
 * header badge, so nothing disagrees.
 */
export default function B2bSummary({
  enabled,
  onOpenGap,
  onOpenCleared,
  onOpenRework,
  onOpenStale,
  onOpenUndoc,
  onOpenSlow,
  onOpenBelow,
  onOpenLate,
  onOpenLateOldest,
  onOpenWeek,
  onOpenNever,
  onOpenWait,
  onOpenMonth,
  onOpenGoal,
  onFocusNever,
  onFocusRequest,
}: {
  enabled: boolean;
  /** Asked from the twelve-month counter: the box opens on that very cut. */
  onOpenGap?: () => void;
  /** Asked from the correction chip: the box opens on that month's corrections. */
  onOpenCleared?: (monthKey: string) => void;
  /** Asked from the ploughed counter: the box opens on the 3+ times fiches. */
  onOpenRework?: () => void;
  /** Asked from the forgotten counter: the box opens on the stale fiches. */
  onOpenStale?: () => void;
  /** Asked from the undocumented counter: the box opens on the fiches owing a reason. */
  onOpenUndoc?: () => void;
  /** Asked from a delay chip: the trend opens framed on that very month. */
  onOpenSlow?: (month: string) => void;
  /** Asked from the year chip: the trend opens filtered on the months in fault. */
  onOpenBelow?: () => void;
  /**
   * Asked from the « en retard » counter: the box opens already cut, on the
   * oldest request, ringed exactly as the header reminder rings it.
   */
  onOpenLate?: () => void;
  /**
   * Asked from the cumulated-weeks cell: the same late cut, but read from the
   * oldest end — the depth of the backlog opens on what has slept longest.
   */
  onOpenLateOldest?: () => void;
  /**
   * Asked from the week counter: the width of the urgency, opened alone — the
   * requests past seven days, longest wait first. The weeks cell beside it says
   * the depth of the very same backlog.
   */
  onOpenWeek?: () => void;
  /**
   * Asked from the « jamais ouvertes » counter: the reminder’s misses open
   * alone, from the longest silence to the shortest.
   */
  onOpenNever?: () => void;
  /**
   * Asked from the wait counter: the twelve-month table opens, already sorted
   * on its « days waited » column — the count and the months it counts are one
   * click apart.
   */
  onOpenWait?: () => void;
  /**
   * Asked from the longest month of the year: not the twelve-month table, the
   * closures of that very month — the fiches that produced the depth, with
   * their reasons and their dates. The cell names a month; the click has to
   * hand over the fiches behind it.
   */
  onOpenMonth?: (monthKey: string) => void;
  /**
   * Asked from the threshold recall under the strip's title: the workshop panel
   * opens on the setting the counter measures against, so the number and the
   * place it is chosen are one click apart.
   */
  onOpenGoal?: () => void;
  /**
   * Asked from the reference line under the never-opened counter: not the whole
   * cut, just that one request — the misses come back ordered from the longest
   * silence, with the oldest one ringed.
   */
  onFocusNever?: (ref: string) => void;
  /**
   * Asked from the reference line under the weeks: not the whole cut, just that
   * one request — the box opens the late list with it ringed.
   */
  onFocusRequest?: (ref: string) => void;
}) {
  const { t, lang } = useLang();

  const {
    todo,
    late,
    veryLate,
    lateWeeks,
    lateOldestRef,
    never: neverMisses,
    neverOldestRef,
    avgHours,
    treated,
    monthMotifs,
    prevMotifs,
    monthAvgHours,
    prevAvgHours,
    monthDelayCount,
    prevCount,
    gap12,
    yearBelow,
    monthLot,
    monthDocumented,
    monthCleared,
    rework3,
    stale30,
    undoc,
    slowMonth,
    waitOver,
    waitGoalDays,
    waitMonth,
  } = useB2bStats(enabled);

  /* The month breakdown, recognised in every language the reason may be worded in. */
  const month = useMemo(() => {
    const rows = monthMotifs.map((motif) => ({ statut: 'traitee', motif }));
    const counts = countMotifs(rows);
    const noMotif = monthMotifs.filter((motif) => detectMotif(motif) === null).length;
    const used = B2B_MOTIF_KEYS.filter((key) => counts[key] > 0);
    return { counts, used, noMotif, total: monthMotifs.length };
  }, [monthMotifs]);

  /*
   * Trace quality: the share of this month's closures that carry a reason — and
   * the same for last month, so the workshop sees whether the trace holds up.
   */
  const trace = useMemo(() => {
    const rate = (list: string[]) => {
      if (list.length === 0) return null;
      const documented = list.filter((motif) => detectMotif(motif) !== null).length;
      return Math.round((documented / list.length) * 100);
    };
    const now = rate(monthMotifs);
    const before = rate(prevMotifs);
    if (now === null) return null;
    const diff = before === null ? null : now - before;
    const dir = diff === null || Math.abs(diff) < 1 ? 'flat' : diff > 0 ? 'up' : 'down';
    return { now, before, diff, dir };
  }, [monthMotifs, prevMotifs]);

  if (!enabled) return null;

  /* Of this month's documented closures, the slice whose reason was caught up
     in bulk: a month can look documented and still owe part of its trace to a
     later catch-up. Read on the server, so it is not a slice of 200 rows. */
  const lotShare =
    monthLot > 0 && monthDocumented > 0
      ? Math.round((monthLot / monthDocumented) * 100)
      : null;

  const nf = new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat(localeFor(lang), { maximumFractionDigits: 0 });

  /* Hours while it stays readable, then days: nobody wants « 61,5 h ». */
  const durationLabel = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 48) return `${nf0.format(Math.round(hours))} h`;
    return `${nf.format(hours / 24)} j`;
  };

  const avgLabel = durationLabel(avgHours);

  /* Progress against last month: a shorter delay is a better month. */
  const avgDelta = (() => {
    if (monthAvgHours === null || prevAvgHours === null) return null;
    const diff = monthAvgHours - prevAvgHours;
    const dir = Math.abs(diff) < 0.5 ? 'flat' : diff < 0 ? 'down' : 'up';
    return { dir, label: durationLabel(Math.abs(diff)) };
  })();

  /* Volume moved: did the workshop close more or fewer requests than last month? */
  const countDiff = month.total - prevCount;
  const countDir = countDiff === 0 ? 'flat' : countDiff > 0 ? 'up' : 'down';

  const jump = () => {
    document.getElementById('demandes-b2b')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* The counter is a door, like the reminder on the bar: the two entries open
     the same cut and ring the same oldest request. */
  const openLate = () => {
    onOpenLate?.();
    jump();
  };

  /* The weeks cell is the second door of the same family: same cut, same ring,
     but walked from the oldest end — a backlog six weeks deep opens on the
     request that has been sleeping since the first day. */
  const openLateOldest = () => {
    onOpenLateOldest?.();
    jump();
  };

  /* The width of the urgency is a door of its own: the requests past a whole
     week and nothing else, so the counter and the list it counts are one click
     apart — right next to the weeks, which say how deep that same backlog is. */
  const openWeek = () => {
    onOpenWeek?.();
    jump();
  };

  /* The misses of the shortcut are counted on the whole inbox: the strip says
     how many before the cut is opened, and the click opens exactly those. */
  const openNever = () => {
    onOpenNever?.();
    jump();
  };

  /* Under the count, its oldest reference is a shorter door still: it does not
     reopen the cut, it points at that one request inside it. */
  const focusNeverOldest = () => {
    if (!neverOldestRef) return;
    onFocusNever?.(neverOldestRef);
    jump();
  };

  /* The reference under the weeks is a shortcut of its own: it does not open
     the whole late cut, it points at that one request — the list comes back
     with it ringed and the page walked down to it. */
  const focusOldest = () => {
    if (!lateOldestRef) return;
    onFocusRequest?.(lateOldestRef);
    jump();
  };

  /* The counter is not just a shortcut: it opens the box on every undocumented
     closure of the window, so the number leads straight to the work. */
  const openGaps = () => {
    onOpenGap?.();
    jump();
  };

  /* The corrections are counted on this very month: the chip opens the box on
     exactly those closures, so the number can be read case by case. */
  const currentMonthKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}`;
  })();

  const openCleared = () => {
    onOpenCleared?.(currentMonthKey);
    jump();
  };

  /* The ploughed fiches are counted on every correction the server stamped,
     not on this month: the door opens the whole inbox on that cut. */
  const openRework = () => {
    onOpenRework?.();
    jump();
  };

  /* The forgotten traces are the other end of the same family: corrected, then
     simply left alone. The strip says how many before the box is opened. */
  const openStale = () => {
    onOpenStale?.();
    jump();
  };

  /* The family before any correction: closures that never got a reason at all.
     Counted on the whole inbox by the server, so the chip is the real size of
     the missing trace — not a slice of the two hundred loaded requests. */
  const openUndoc = () => {
    onOpenUndoc?.();
    jump();
  };

  /* This month answers slower than the last one: the chip is a door onto the
     twelve-month chart, already framed on that month. A figure alone would say
     « it is slower » without saying where to look. */
  const slow = avgDelta !== null && avgDelta.dir === 'up';

  const openSlow = () => {
    onOpenSlow?.(currentMonthKey);
    jump();
  };

  /* The year's worst slowdown, named in the strip: the month whose average reply
     time grew the most against the one before. Clicking it opens the trend
     framed on that month, with the duel already pre-filled with it and the
     month before — the same door as the arrow, from a figure nobody has to
     hunt for in the CSV. */
  const slowest = slowMonth;
  /* A `2026-10` key, written the way the strip already names its months. */
  const monthName = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    const raw = new Intl.DateTimeFormat(localeFor(lang), {
      month: 'short',
      year: '2-digit',
    }).format(new Date(year, (month || 1) - 1, 1));
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };
  const slowestLabel = slowest
    ? (() => {
        const [year, month] = slowest.key.split('-').map(Number);
        const raw = new Intl.DateTimeFormat(localeFor(lang), {
          month: 'short',
          year: '2-digit',
        }).format(new Date(year, (month || 1) - 1, 1));
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      })()
    : '';
  /* The month before it, worded the same way: the tooltip says what it is
     compared against, not just « it slowed ». */
  const slowestBeforeLabel = slowest
    ? (() => {
        const [year, month] = slowest.key.split('-').map(Number);
        const raw = new Intl.DateTimeFormat(localeFor(lang), {
          month: 'short',
          year: '2-digit',
        }).format(new Date(year, (month || 1) - 2, 1));
        return raw.charAt(0).toUpperCase() + raw.slice(1);
      })()
    : '';

  const openSlowest = () => {
    if (!slowest) return;
    onOpenSlow?.(slowest.key);
    jump();
  };

  /*
   * The other record of the same year: not the month that slowed down the most,
   * the month that made people wait longest. A rise and a level are two different
   * readings — a workshop can speed up every month and still have one very slow
   * month — so the strip names both, side by side, read on the very column of
   * days waited the twelve-month table shows.
   */
  const longestWait = waitMonth;
  const longestLabel = longestWait ? monthName(longestWait.key) : '';
  const longestDays = longestWait
    ? nf.format(Math.round(longestWait.days * 10) / 10)
    : '';
  const longestOver = longestWait !== null && longestWait.days > waitGoalDays;

  /* The share of the year is not only a figure: the chip is a door onto the
     trend, opened already filtered on the months that fell under their own
     threshold — the count and the months it counts are one click apart. */
  const openBelow = () => {
    onOpenBelow?.();
    jump();
  };

  /* The wait counter, read like the share of the year: a count, the months it
     can be judged on, and the share that count represents — three figures, one
     reading. It is a door of its own: it opens the twelve-month table already
     sorted on the days waited, so the count and the months behind it sit one
     click apart. */
  const waitShare =
    waitOver.judged > 0 ? Math.round((waitOver.over / waitOver.judged) * 100) : null;

  /* The table lives in the trend panel of the inbox: the door opens it if it
     was shut, then walks the page down to it. */
  const openWaitTable = () => {
    if (!onOpenWait) return;
    onOpenWait();
  };

  /* The longest month is a door onto its own closures: the cell names a month,
     the click hands over the fiches that produced its depth. Without that door,
     it falls back on the twelve-month table, so the cell is never inert. */
  const openLongest = () => {
    if (onOpenMonth && longestWait) {
      onOpenMonth(longestWait.key);
      jump();
      return;
    }
    openWaitTable();
  };

  const openGoal = () => {
    if (onOpenGoal) {
      onOpenGoal();
      return;
    }
    jump();
  };

  const motifLabel = (key: B2bMotifKey) => t(`acct.b2b.motif.${key}`);

  const arrow = (dir: string) =>
    dir === 'down' ? 'ri-arrow-down-line' : dir === 'up' ? 'ri-arrow-up-line' : 'ri-subtract-line';

  return (
    <section className="acct-sum" id="acct-summary" aria-label={t('acct.b2b.summaryTitle')}>
      <div className="acct-sum-lead">
        <span className="acct-sum-ico" aria-hidden="true">
          <i className="ri-inbox-archive-line"></i>
        </span>
        <div>
          <strong>{t('acct.b2b.summaryTitle')}</strong>
          <p>{late > 0 ? t('acct.b2b.summaryLateHint') : t('acct.b2b.summaryOk')}</p>
          {/* The threshold the wait counter measures against: recalled here, so
              the figure below is never read without the number behind it — and
              clickable, so the reminder is a way to the setting itself. */}
          <button
            type="button"
            className="acct-sum-threshold"
            title={`${t('acct.b2b.waitGoalText')} · ${t('acct.b2b.summaryWaitThresholdOpen')}`}
            disabled={!onOpenGoal}
            onClick={openGoal}
          >
            <i className="ri-hourglass-line" aria-hidden="true"></i>
            {t('acct.b2b.summaryWaitThreshold').replace(
              '{n}',
              nf0.format(waitGoalDays),
            )}
            <i className="ri-arrow-right-line acct-sum-threshold-go" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div className="acct-sum-nums">
        <div className="acct-sum-cell" data-on={todo > 0 ? 'yes' : 'no'}>
          <b>{todo}</b>
          <span>{t('acct.b2b.summaryTodo')}</span>
        </div>
        <button
          type="button"
          className="acct-sum-cell acct-sum-cell--late"
          data-on={late > 0 ? 'yes' : 'no'}
          title={late > 0 ? `${t('acct.b2b.summaryLateHint')} · ${t('acct.b2b.summaryLateOpen')}` : t('acct.b2b.summaryLateHint')}
          disabled={!onOpenLate || late === 0}
          onClick={openLate}
        >
          <b>{late}</b>
          <span>{t('acct.b2b.summaryLate')}</span>
        </button>
        {/* The width of the urgency, right before its depth: how many requests
            have passed a whole week. Two figures side by side, so the size and
            the weight of the backlog read in one glance. */}
        {veryLate > 0 && (
          <button
            type="button"
            className="acct-sum-cell acct-sum-cell--week"
            data-on="yes"
            title={`${t('acct.b2b.summaryWeekHint').replace('{n}', nf0.format(veryLate))} · ${t('acct.b2b.summaryWeekOpen')}`}
            disabled={!onOpenWeek}
            onClick={openWeek}
          >
            <b>{nf0.format(veryLate)}</b>
            <span>{t('acct.b2b.summaryWeek')}</span>
          </button>
        )}
        {/* Right beside the 48 h counter, the depth of that same backlog: every
            open wait added up in weeks. Ten requests a day old and three
            sleeping a month do not weigh the same, and the two figures say it
            without opening the box. */}
        {lateWeeks > 0 && (
          <div className="acct-sum-cell acct-sum-cell--weeks" data-on="yes">
            <button
              type="button"
              className="acct-sum-weeknum"
              disabled={!onOpenLateOldest}
              title={`${t('acct.b2b.summaryLateWeeksHint')
                .replace('{weeks}', nf0.format(lateWeeks))
                .replace('{n}', nf0.format(late))} · ${t('acct.b2b.summaryLateWeeksOpen')}`}
              onClick={openLateOldest}
            >
              <b>{nf0.format(lateWeeks)}</b>
              <span>{t('acct.b2b.summaryLateWeeks')}</span>
            </button>
            {/* The depth of the backlog needs a face: under the number of weeks,
                the reference of the request that has been sleeping longest —
                and it is a door of its own, shorter than the counter: one click
                and the list comes back on that request alone. */}
            {lateOldestRef && (
              <button
                type="button"
                className="acct-sum-oldest"
                disabled={!onFocusRequest}
                title={t('acct.b2b.summaryLateOldestOpen')}
                onClick={focusOldest}
              >
                {t('acct.b2b.summaryLateWeeksOldest').replace('{ref}', lateOldestRef)}
              </button>
            )}
          </div>
        )}
        {/* The misses of the shortcut, next to the counters of the backlog: how
            many requests the reminder went past without them ever being opened.
            A figure of absence, so the strip says it instead of waiting for the
            chip to be found in the box. The cell holds two doors, like the
            weeks: the count opens the cut, the reference under it names the
            oldest miss and points at that one request. */}
        {neverMisses > 0 && (
          <div className="acct-sum-cell acct-sum-cell--never" data-on="yes">
            <button
              type="button"
              className="acct-sum-weeknum"
              title={`${t('acct.b2b.summaryNeverHint').replace('{n}', nf0.format(neverMisses))} · ${t('acct.b2b.summaryNeverOpen')}`}
              disabled={!onOpenNever}
              onClick={openNever}
            >
              <b>{nf0.format(neverMisses)}</b>
              <span>{t('acct.b2b.summaryNever')}</span>
            </button>
            {neverOldestRef && (
              <button
                type="button"
                className="acct-sum-oldest"
                disabled={!onFocusNever}
                title={t('acct.b2b.summaryNeverOldestOpen')}
                onClick={focusNeverOldest}
              >
                {t('acct.b2b.summaryNeverOldest').replace('{ref}', neverOldestRef)}
              </button>
            )}
          </div>
        )}
        <div
          className="acct-sum-cell acct-sum-cell--avg"
          data-on={avgHours !== null ? 'yes' : 'no'}
          title={
            treated > 0
              ? t('acct.b2b.summaryAvgHint').replace('{n}', String(treated))
              : t('acct.b2b.summaryAvgNone')
          }
        >
          <b>{avgLabel}</b>
          <span>{t('acct.b2b.summaryAvg')}</span>
          {avgDelta && (
            <span
              className="acct-sum-delta"
              data-dir={avgDelta.dir}
              title={t('acct.b2b.deltaAvgHint')
                .replace('{now}', durationLabel(monthAvgHours))
                .replace('{before}', durationLabel(prevAvgHours))}
            >
              <i className={arrow(avgDelta.dir)} aria-hidden="true"></i>
              {avgDelta.label}
            </span>
          )}
        </div>
        <div
          className="acct-sum-cell acct-sum-cell--trace"
          data-on={trace ? 'yes' : 'no'}
          title={t('acct.b2b.summaryTraceHint')}
        >
          <b>{trace ? `${nf0.format(trace.now)} %` : '—'}</b>
          <span>{t('acct.b2b.summaryTrace')}</span>
          {trace && trace.diff !== null && (
            <span
              className="acct-sum-delta b2b-trace-delta"
              data-dir={trace.dir}
              title={t('acct.b2b.deltaTraceHint')
                .replace('{now}', `${trace.now} %`)
                .replace('{before}', `${trace.before} %`)}
            >
              <i className={arrow(trace.dir)} aria-hidden="true"></i>
              {trace.diff > 0 ? `+${nf0.format(trace.diff)}` : nf0.format(trace.diff)}{' '}
              {t('acct.b2b.tracePts')}
            </span>
          )}
          {lotShare !== null && (
            <span
              className="acct-sum-lot"
              title={t('acct.b2b.summaryLotHint').replace('{n}', String(monthLot))}
            >
              <i className="ri-stack-line" aria-hidden="true"></i>
              {t('acct.b2b.summaryLot').replace('{share}', String(lotShare))}
            </span>
          )}
          {/* The other face of the same trace: catch-ups taken back this month.
              Next to the bulk share, so a month that had to be corrected does
              not look like one that was simply filled in. */}
          {monthCleared > 0 && onOpenCleared && (
            <button
              type="button"
              className="acct-sum-cleared"
              title={t('acct.b2b.summaryClearedHint').replace(
                '{n}',
                String(monthCleared),
              )}
              onClick={openCleared}
            >
              <i className="ri-eraser-line" aria-hidden="true"></i>
              {t('acct.b2b.summaryCleared').replace('{n}', nf0.format(monthCleared))}
            </button>
          )}
          {/* Next to the corrections: how many fiches were taken back over
              twice. A different question — not « how many were corrected »,
              but « how many were ploughed ». */}
          {rework3 > 0 && onOpenRework && (
            <button
              type="button"
              className="acct-sum-cleared acct-sum-rework"
              title={t('acct.b2b.summaryReworkHint').replace('{n}', nf0.format(rework3))}
              onClick={openRework}
            >
              <i className="ri-fire-line" aria-hidden="true"></i>
              {t('acct.b2b.summaryRework').replace('{n}', nf0.format(rework3))}
            </button>
          )}
          {/* The other end of the same family, next to it: the fiches corrected
              then left in peace. Opposite hue — this one is absence. */}
          {stale30 > 0 && onOpenStale && (
            <button
              type="button"
              className="acct-sum-cleared acct-sum-stale"
              title={t('acct.b2b.summaryStaleHint').replace('{n}', nf0.format(stale30))}
              onClick={openStale}
            >
              <i className="ri-time-line" aria-hidden="true"></i>
              {t('acct.b2b.summaryStale').replace('{n}', nf0.format(stale30))}
            </button>
          )}
          {/* The third counter of the same row: before being corrected, a fiche
              has simply no reason. In a neutral tone, because it is a gap, not
              a repair. */}
          {undoc > 0 && onOpenUndoc && (
            <button
              type="button"
              className="acct-sum-cleared acct-sum-undoc"
              title={t('acct.b2b.summaryUndocHint').replace('{n}', nf0.format(undoc))}
              onClick={openUndoc}
            >
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
              {t('acct.b2b.summaryUndoc').replace('{n}', nf0.format(undoc))}
            </button>
          )}
        </div>
        {/* The month answers slower than the one before: the door is the chart
            itself, framed on that month — a number alone says « slower »
            without saying where to look. */}
        {slow && onOpenSlow && (
          <button
            type="button"
            className="acct-sum-cell acct-sum-cell--slow"
            data-on="yes"
            title={t('acct.b2b.summarySlowHint')
              .replace('{now}', durationLabel(monthAvgHours))
              .replace('{before}', durationLabel(prevAvgHours))}
            onClick={openSlow}
          >
            <b>
              <i className="ri-arrow-up-line" aria-hidden="true"></i>
              {avgDelta ? avgDelta.label : ''}
              {/* A rise resting on two fiches is not the same reading as a rise
                  on twenty: the sample sits right on the chip. */}
              {monthDelayCount > 0 && monthDelayCount < THIN_SAMPLE && (
                <i
                  className="ri-error-warning-line acct-sum-thin-mark"
                  title={t('acct.b2b.summarySlowThin')}
                  aria-label={t('acct.b2b.summarySlowThin')}
                ></i>
              )}
            </b>
            <span>{t('acct.b2b.summarySlow')}</span>
            {/* How many measurable closures the rise rests on: the gap alone
                does not say whether one fiche moved or the whole month did. */}
            {monthDelayCount > 0 && (
              <span className="acct-sum-thin" title={t('acct.b2b.trendCompareAvgCountHint')}>
                {t('acct.b2b.summarySlowCount').replace('{n}', nf0.format(monthDelayCount))}
              </span>
            )}
          </button>
        )}
        {/* The year's worst slowdown, named: the month is displayed, its rise in
            days (or hours under 48) sits under it, and the click opens the trend
            framed on it with the duel pre-filled. Hidden when that month is the
            one already shown above — the same figure does not need two doors. */}
        {slowest && slowest.key !== currentMonthKey && onOpenSlow && (
          <button
            type="button"
            className="acct-sum-cell acct-sum-cell--slow acct-sum-cell--slowest"
            data-on="yes"
            title={t('acct.b2b.summarySlowestHint')
              .replace('{month}', slowestLabel)
              .replace('{delta}', durationLabel(slowest.deltaHours))
              .replace('{before}', slowestBeforeLabel)
              .replace('{avg}', durationLabel(slowest.avgHours))}
            onClick={openSlowest}
          >
            <b>{slowestLabel}</b>
            <span>{t('acct.b2b.summarySlowest')}</span>
            <span className="acct-sum-delta" data-dir="up">
              <i className="ri-arrow-up-line" aria-hidden="true"></i>
              {durationLabel(slowest.deltaHours)}
              {/* The gap of the year rests on one or two fiches: same mark as
                  the monthly chip, so a thin rise is never read as a trend. */}
              {slowest.count > 0 && slowest.count < THIN_SAMPLE && (
                <i
                  className="ri-error-warning-line acct-sum-thin-mark"
                  title={t('acct.b2b.summarySlowestThin').replace(
                    '{n}',
                    nf0.format(slowest.count),
                  )}
                  aria-label={t('acct.b2b.summarySlowestThin').replace(
                    '{n}',
                    nf0.format(slowest.count),
                  )}
                ></i>
              )}
            </span>
            {/* The gap alone says « slower », not « slow »: the absolute level
                of that month sits under it, so a 3-day month and a 3-day rise
                are read together instead of guessed. */}
            {slowest.avgHours !== null && (
              <span className="acct-sum-avg" title={t('acct.b2b.trendCompareAvgHint')}>
                {t('acct.b2b.summarySlowestAvg').replace(
                  '{avg}',
                  durationLabel(slowest.avgHours),
                )}
              </span>
            )}
          </button>
        )}
        {/* The other record of the year, right beside the slowest month: the
            month that made people wait longest, its depth in days under the
            name, and the number of closures that depth rests on in the title.
            A level, not a rise — the two are read together, never confused. */}
        {longestWait && (
          <div
            className="acct-sum-cell acct-sum-cell--waitmonth"
            data-on={longestOver ? 'yes' : 'no'}
          >
            <button
              type="button"
              className="acct-sum-waitmonth-main"
              disabled={!onOpenMonth && !onOpenWait}
              title={`${t('acct.b2b.summaryWaitMonthHint')
                .replace('{month}', longestLabel)
                .replace('{days}', longestDays)
                .replace('{unit}', t('acct.b2b.waitGoalUnit'))
                .replace('{n}', nf0.format(longestWait.count))
                .replace('{goal}', nf0.format(waitGoalDays))} ${t(
                'acct.b2b.summaryWaitMonthOpen',
              )}`}
              onClick={openLongest}
            >
              <b>{longestLabel}</b>
              <span>{t('acct.b2b.summaryWaitMonth')}</span>
              <span className="acct-sum-avg">
                {t('acct.b2b.summaryWaitMonthAvg')
                  .replace('{days}', longestDays)
                  .replace('{unit}', t('acct.b2b.waitGoalUnit'))}
              </span>
              {/* The threshold in plain words, under the depth: the month is no
                  longer read without the number it is judged against — the very
                  number set on the workshop panel, so the two cannot disagree. */}
              <span className="acct-sum-goal" title={t('acct.b2b.waitGoalText')}>
                <i className="ri-ruler-line" aria-hidden="true"></i>
                {t('acct.b2b.summaryWaitMonthGoal')
                  .replace('{goal}', nf0.format(waitGoalDays))
                  .replace('{unit}', t('acct.b2b.waitGoalUnit'))}
              </span>
            </button>
            {/* The other reading of the same year, kept one short click away:
                the twelve-month table, opened on the column of days waited. The
                cell hands over the fiches behind the depth; this line hands
                over the twelve months that depth sits in. */}
            {onOpenWait && (
              <button
                type="button"
                className="acct-sum-waitmonth-table"
                title={t('acct.b2b.summaryWaitOpen')}
                onClick={openWaitTable}
              >
                <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
                {t('acct.b2b.summaryWaitMonthTable')}
              </button>
            )}
            {/* The same month, handed over instead of read: the link reopens
                these closures on a colleague’s screen, table and all. */}
            <B2bShareLink
              href={b2bMonthHref(longestWait.key, lang)}
              label={t('acct.b2b.summaryWaitMonthShare')}
              hint={t('acct.b2b.summaryWaitMonthShareHint')}
              className="acct-sum-waitmonth-table acct-sum-waitmonth-share"
            />
          </div>
        )}
        {/* The twelve-month backlog, read without opening the box: the same
            sliding window as the inbox, counted on every closure. */}
        <button
          type="button"
          className="acct-sum-cell acct-sum-cell--gap"
          data-on={gap12 > 0 ? 'yes' : 'no'}
          title={t('acct.b2b.summaryGap12Hint')}
          onClick={openGaps}
        >
          <b>{nf0.format(gap12)}</b>
          <span>{t('acct.b2b.summaryGap12')}</span>
        </button>
        {/* The share of the year, at the top of the page: the count of months
            under their target, and — right beside it — how many months it was
            judged on. Three out of twelve is not three out of three. */}
        {yearBelow.judged > 0 && (
          <button
            type="button"
            className="acct-sum-cell acct-sum-cell--year"
            data-on={yearBelow.below > 0 ? 'yes' : 'no'}
            title={`${t('acct.b2b.summaryYearHint')
              .replace('{below}', nf0.format(yearBelow.below))
              .replace('{judged}', nf0.format(yearBelow.judged))
              .replace(
                '{share}',
                nf0.format(Math.round((yearBelow.below / yearBelow.judged) * 100)),
              )} ${t('acct.b2b.summaryYearOpen')}`}
            disabled={!onOpenBelow}
            onClick={openBelow}
          >
            <b>{nf0.format(yearBelow.below)}</b>
            <span>{t('acct.b2b.summaryYearBelow')}</span>
            <span className="acct-sum-year-judged">
              {t('acct.b2b.summaryYearJudged')
                .replace('{n}', nf0.format(yearBelow.judged))
                .replace(
                  '{share}',
                  nf0.format(Math.round((yearBelow.below / yearBelow.judged) * 100)),
                )}
            </span>
          </button>
        )}
        {/* The other side of the same year, right beside it: how many months made
            people wait over a week on average. The objective mechanics, applied
            to the depth of the wait — a count, the months measured, the share —
            and each month read on the very clock of the table below. */}
        {waitOver.judged > 0 && (
          <button
            type="button"
            className="acct-sum-cell acct-sum-cell--wait"
            data-on={waitOver.over > 0 ? 'yes' : 'no'}
            disabled={!onOpenWait}
            title={`${t('acct.b2b.summaryWaitOverHint')
              .replace('{over}', nf0.format(waitOver.over))
              .replace('{judged}', nf0.format(waitOver.judged))
              .replace('{goal}', nf0.format(waitGoalDays))
              .replace('{share}', nf0.format(waitShare ?? 0))} ${t(
              'acct.b2b.summaryWaitOpen',
            )}`}
            onClick={openWaitTable}
          >
            <b>{nf0.format(waitOver.over)}</b>
            <span>{t('acct.b2b.summaryWaitOver')}</span>
            <span className="acct-sum-year-judged">
              {t('acct.b2b.summaryWaitOverJudged')
                .replace('{n}', nf0.format(waitOver.judged))
                .replace('{share}', nf0.format(waitShare ?? 0))}
            </span>
          </button>
        )}
      </div>

      <button type="button" className="ghost-btn acct-sum-open" onClick={jump}>
        {t('acct.b2b.summaryOpen')}
        <i className="ri-arrow-down-line" aria-hidden="true"></i>
      </button>

      <div
        className="acct-sum-motifs"
        title={
          month.total > 0
            ? t('acct.b2b.summaryMotifsHint').replace('{n}', String(month.total))
            : t('acct.b2b.summaryMotifsNone')
        }
      >
        <span className="acct-sum-motifs-lead">
          <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
          {t('acct.b2b.summaryMotifs')}
        </span>

        {month.total === 0 ? (
          <span className="acct-sum-motifs-empty">{t('acct.b2b.summaryMotifsNone')}</span>
        ) : (
          <>
            <div className="acct-sum-bar" aria-hidden="true">
              {month.used.map((key) => (
                <span
                  key={key}
                  data-motif={key}
                  style={{ flexGrow: month.counts[key] }}
                  title={`${motifLabel(key)} · ${month.counts[key]}`}
                />
              ))}
              {month.noMotif > 0 && (
                <span
                  data-motif="none"
                  style={{ flexGrow: month.noMotif }}
                  title={`${t('acct.b2b.motifNone')} · ${month.noMotif}`}
                />
              )}
            </div>

            <ul className="acct-sum-legend">
              {month.used.map((key) => (
                <li key={key} data-motif={key}>
                  <i aria-hidden="true"></i>
                  {motifLabel(key)}
                  <b>{month.counts[key]}</b>
                </li>
              ))}
              {month.noMotif > 0 && (
                <li data-motif="none">
                  <i aria-hidden="true"></i>
                  {t('acct.b2b.motifNone')}
                  <b>{month.noMotif}</b>
                </li>
              )}
            </ul>

            {prevCount > 0 && (
              <span
                className="acct-sum-trend"
                data-dir={countDir}
                title={t('acct.b2b.deltaCountHint')
                  .replace('{now}', String(month.total))
                  .replace('{before}', String(prevCount))}
              >
                <i className={arrow(countDir)} aria-hidden="true"></i>
                {countDiff > 0 ? `+${nf0.format(countDiff)}` : nf0.format(countDiff)}
                <em>{t('acct.b2b.deltaVsPrev')}</em>
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
}