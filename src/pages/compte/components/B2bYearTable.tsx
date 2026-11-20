import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import type { B2bObjectifEntry, DemandeB2b } from '@/lib/b2b';
import { detectMotif } from './b2bMotifs';
import { goalForMonth } from './b2bObjectif';
import {
  readYearOverOnly,
  readYearSort,
  readYearTint,
  saveYearOverOnly,
  saveYearSort,
  saveYearTint,
  type B2bYearSort,
  type B2bYearSortDir,
  type B2bYearSortKey,
} from './b2bYearSortMemory';
import B2bShareLink, { b2bMonthHref } from './B2bShareLink';

const MONTHS = 12;

/** Under three measurable closures, a monthly average is a rumour, not a figure. */
const THIN_SAMPLE = 3;

type YearRow = {
  /** `2026-10` — the month key, also used to open its closures. */
  key: string;
  label: string;
  closed: number;
  /** Documented share, in whole points — null when the month closed nothing. */
  documented: number | null;
  /** How many closures the average reply time rests on. */
  measurable: number;
  avgHours: number | null;
  /**
   * Whole days the closures of that month really waited, on average — the very
   * figure the export carries, read on the same clock as the « days waited »
   * pill: reception → close. Null when nothing measurable that month.
   */
  waitDays: number | null;
  /** The month against the one before it, in hours — null when not comparable. */
  deltaHours: number | null;
  /**
   * Whether the closures of that month waited past the workshop wait threshold
   * — the other face of the same table: not the trace, the queue. Null when the
   * month has nothing measurable: an empty month is not a fast one.
   */
  over: boolean | null;
  /** The target in force that month — null when the workshop had set none. */
  goal: number | null;
  /**
   * Whether the month stayed under its own target — null when it cannot be
   * judged at all (no closure, or no target that month).
   */
  below: boolean | null;
};

type SortKey = B2bYearSortKey;
type Dir = B2bYearSortDir;

type Bucket = {
  total: number;
  documented: number;
  sum: number;
  count: number;
  /** Whole days waited, added up over the closures of the month. */
  waitSum: number;
};

const monthKeyOf = (date: Date) =>
  `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;

/**
 * The twelve months of the window, as a table on screen.
 *
 * The same figures the yearly block of the CSV export carries — closures,
 * documented share, measurable closures, average reply time and its change
 * against the month before, plus the target of each month and whether it was
 * missed — but here a header does the sorting, so nobody has to rebuild a pivot
 * table to find the month that slowed down. One basis, as everywhere in the
 * inbox: the handling date, on the loaded rows.
 *
 * A month whose rise rests on fewer than three measurable closures carries a
 * small mark: the figure stays, its weight is said beside it.
 */
export default function B2bYearTable({
  rows,
  objectif = null,
  objectifHistory = [],
  onOpenMonth,
  memoryKey = '',
  waitGoalDays = 7,
  sortRequest = null,
  onBackToStrip,
}: {
  rows: DemandeB2b[];
  /** The workshop target for documented closures — null when it set none. */
  objectif?: number | null;
  /** Every change of that target: each month is read against its own. */
  objectifHistory?: B2bObjectifEntry[];
  /** Opens the inbox on that month's closures — the month cell is a door. */
  onOpenMonth?: (monthKey: string) => void;
  /** Where the chosen sort is remembered: one order per account. */
  memoryKey?: string;
  /**
   * The wait threshold of the week, as the account strip reads it: a month over
   * it is tinted exactly like a month under its own target — one table, two
   * faults, both said in words somewhere in the row.
   */
  waitGoalDays?: number;
  /**
   * An order asked for from outside — the strip's wait counter opens this very
   * table already sorted on that column. The nonce marks a fresh request, so
   * the same order can be asked twice in a row without being ignored.
   */
  sortRequest?: { key: B2bYearSortKey; dir: B2bYearSortDir; nonce: number } | null;
  /**
   * The way back up to the counter strip, shown only when this table was opened
   * from a shared month link: the reader arrived on a month, the table came with
   * it, and one line takes them back to the counters that named that month.
   */
  onBackToStrip?: () => void;
}) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  /* The sort is remembered per account, next to the duel and the period: a
     member who reads the year by reply time finds that column still sorting. */
  const [sort, setSort] = useState<B2bYearSort>(() =>
    memoryKey ? readYearSort(memoryKey) : { key: 'month', dir: 'asc' },
  );
  /* The tint of the months in fault is a help, not a verdict: it can be
     switched off in one click when the table is read on a shared screen —
     the « Sous l’objectif » column keeps saying yes or no in words. */
  const [tint, setTint] = useState<boolean>(() =>
    memoryKey ? readYearTint(memoryKey) : true,
  );
  /** Who set the current order: a header click, or the strip's counter. */
  const [sortOrigin, setSortOrigin] = useState<'user' | 'counter'>('user');
  /**
   * The foot's wait count is a door of its own: it keeps only the months past
   * the workshop threshold, so the figure and the rows it counts sit together.
   * The total line keeps covering the twelve months — it is said under the
   * table, so the filtered body is never mistaken for the whole year.
   */
  const [overOnly, setOverOnly] = useState<boolean>(() =>
    memoryKey ? readYearOverOnly(memoryKey) : false,
  );
  /** Last external order already applied: a re-render must not re-impose it. */
  const appliedSort = useRef(0);

  /* The strip's wait counter is a door onto this very table: it opens it
     already sorted on the days waited column, so the figure and the months it
     counts are one glance apart. */
  useEffect(() => {
    if (!sortRequest || sortRequest.nonce === appliedSort.current) return;
    appliedSort.current = sortRequest.nonce;
    setSort({ key: sortRequest.key, dir: sortRequest.dir });
    setSortOrigin('counter');
    /* The strip asked for the whole year in one order: a filter left on from
       the foot would hide the months it wants to line up. */
    setOverOnly(false);
  }, [sortRequest]);

  useEffect(() => {
    if (!memoryKey) return;
    saveYearSort(memoryKey, sort);
  }, [memoryKey, sort]);

  useEffect(() => {
    if (!memoryKey) return;
    saveYearTint(memoryKey, tint);
  }, [memoryKey, tint]);

  /* The filtered reading of the year is remembered like the order it sits
     under: a member who reads the months past the threshold finds that cut
     still open on return, instead of the whole year every morning. */
  useEffect(() => {
    if (!memoryKey) return;
    saveYearOverOnly(memoryKey, overOnly);
  }, [memoryKey, overOnly]);

  const months = useMemo(() => {
    const today = new Date();
    const labeler = new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' });

    /* One month before the window is kept: the oldest shown month needs a
       month before it, or its change against the previous one is a guess. */
    const keys: string[] = [];
    const labels = new Map<string, string>();
    for (let back = MONTHS; back >= 0; back -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - back, 1);
      const key = monthKeyOf(date);
      keys.push(key);
      const raw = labeler.format(date);
      labels.set(key, raw.charAt(0).toUpperCase() + raw.slice(1));
    }

    const buckets = new Map<string, Bucket>();
    keys.forEach((key) =>
      buckets.set(key, { total: 0, documented: 0, sum: 0, count: 0, waitSum: 0 }),
    );

    rows.forEach((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return;
      const bucket = buckets.get(monthKeyOf(date));
      if (!bucket) return;
      bucket.total += 1;
      if (detectMotif(row.motif) !== null) bucket.documented += 1;
      /* The reply delay of that month, on the same rows: reception → closure.
         A stamp older than the arrival is not measurable and stays out. */
      const from = new Date(row.created_at).getTime();
      const to = date.getTime();
      if (Number.isFinite(from) && to >= from) {
        bucket.sum += to - from;
        bucket.count += 1;
        /* The same wait, in whole days: the depth the reply time hides. A
           closure counts here on the very rows its reply time rests on, so the
           two columns can never describe two different sets of fiches. */
        bucket.waitSum += Math.floor((to - from) / 86400000);
      }
    });

    const avgOf = (bucket: Bucket) =>
      bucket.count > 0 ? bucket.sum / bucket.count / 3600000 : null;

    const list: YearRow[] = keys.slice(1).map((key, index) => {
      const bucket = buckets.get(key) as Bucket;
      const before = buckets.get(keys[index]) as Bucket;
      const avgHours = avgOf(bucket);
      const prevHours = avgOf(before);
      const documented =
        bucket.total > 0 ? Math.round((bucket.documented / bucket.total) * 100) : null;
      /* The threshold of that month, not today's: a workshop that raised its
         target mid-year does not retroactively fail the months already closed. */
      const goal = goalForMonth(objectifHistory, key, objectif);
      /* The same whole days the column shows, read once: the tint of the wait
         and the figure beside it can never disagree. */
      const waitDays = bucket.count > 0 ? bucket.waitSum / bucket.count : null;
      return {
        key,
        label: labels.get(key) ?? key,
        closed: bucket.total,
        documented,
        measurable: bucket.count,
        avgHours,
        waitDays,
        deltaHours: avgHours !== null && prevHours !== null ? avgHours - prevHours : null,
        goal,
        /* A month with no closure is neither above nor below, and neither is a
           month nobody had set a target for: both stay blank, not « no ». */
        below: documented === null || goal === null ? null : documented < goal,
        /* Over the week, on the same clock as the counter of the strip: only a
           month with measurable closures can be over anything. */
        over: waitDays === null ? null : waitDays > waitGoalDays,
      };
    });

    /* The twelve months together: one line to close the table, weighted on the
       same rows rather than an average of averages. */
    const sum = keys.slice(1).reduce(
      (acc, key) => {
        const bucket = buckets.get(key) as Bucket;
        return {
          total: acc.total + bucket.total,
          documented: acc.documented + bucket.documented,
          sum: acc.sum + bucket.sum,
          count: acc.count + bucket.count,
          waitSum: acc.waitSum + bucket.waitSum,
        };
      },
      { total: 0, documented: 0, sum: 0, count: 0, waitSum: 0 },
    );
    const total: Bucket = sum;
    /* How many months of the window fell under their own target: the line of
       the table answers the question the column invites. */
    const belowCount = list.filter((row) => row.below === true).length;
    /* How many months could be judged at all: a month with no closure, or no
       target in force that month, is neither under nor above — it does not
       weigh in the share of the year, it just is not judged. */
    const judged = list.filter((row) => row.below !== null).length;
    /* Months that closed something but had no target in force: there is nothing
       to judge them against, so they sit outside the share — the foot says how
       many, so « 3 sur 9 » is never read as « 3 sur 12 » by mistake. */
    const noGoal = list.filter(
      (row) => row.documented !== null && row.goal === null,
    ).length;
    /* How many months made people wait past the threshold of the week: the
       count the note under the table turns into a sentence. */
    const overCount = list.filter((row) => row.over === true).length;
    /* How many months could be measured at all: a month without a single
       measurable closure is not a fast month, it is an empty one — it never
       weighs in the share of the year. */
    const measured = list.filter((row) => row.waitDays !== null).length;

    /* The month that made people wait longest: the deepest average wait of the
       window, read on the very column beside it. Only a measurable month can
       win, and a tie goes to the older one — the mark then points at the file
       that has been sitting there longest. */
    const worstWait = list.reduce<YearRow | null>((worst, row) => {
      if (row.waitDays === null || row.waitDays <= 0) return worst;
      if (!worst || worst.waitDays === null) return row;
      if (row.waitDays > worst.waitDays) return row;
      if (row.waitDays < worst.waitDays) return worst;
      return row.key < worst.key ? row : worst;
    }, null);

    return {
      list,
      total,
      belowCount,
      judged,
      noGoal,
      overCount,
      measured,
      /* Named once, here, so a single month — and only one — carries the mark. */
      worstWait:
        worstWait && worstWait.waitDays !== null
          ? { key: worstWait.key, label: worstWait.label, days: worstWait.waitDays }
          : null,
    };
  }, [rows, locale, objectif, objectifHistory, waitGoalDays]);

  const sorted = useMemo(() => {
    const dir = sort.dir === 'asc' ? 1 : -1;
    const value = (row: YearRow): string | number | null => {
      if (sort.key === 'month') return row.key;
      if (sort.key === 'closed') return row.closed;
      if (sort.key === 'documented') return row.documented;
      if (sort.key === 'measurable') return row.measurable;
      if (sort.key === 'avg') return row.avgHours;
      if (sort.key === 'wait') return row.waitDays;
      if (sort.key === 'below') return row.below === null ? null : row.below ? 1 : 0;
      if (sort.key === 'over') return row.over === null ? null : row.over ? 1 : 0;
      return row.deltaHours;
    };
    return [...months.list]
      /* The foot's count asks for its own months alone: the order still holds,
         but the year on screen shrinks to the months in fault. */
      .filter((row) => (overOnly ? row.over === true : true))
      .sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      /* A month with nothing to measure always falls to the bottom, whichever
         way the column is sorted: an absent figure is not a small one. */
      if (va === null && vb === null) return a.key.localeCompare(b.key);
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === 'string' || typeof vb === 'string') {
        return String(va).localeCompare(String(vb)) * dir;
      }
      return (va - vb) * dir;
    });
  }, [months, sort, overOnly]);

  /**
   * The deepest wait of what is actually on screen. When the foot's count has
   * narrowed the year, the window's own record may sit in a hidden month: the
   * selection therefore reads its own, so the note under the table always names
   * a month the reader can see.
   */
  const selectionWorst = useMemo(() => {
    if (!overOnly) return null;
    type Worst = { key: string; label: string; days: number; measurable: number };
    return sorted.reduce<Worst | null>((worst, row) => {
      if (row.waitDays === null || row.waitDays <= 0) return worst;
      const candidate: Worst = {
        key: row.key,
        label: row.label,
        days: row.waitDays,
        measurable: row.measurable,
      };
      if (!worst) return candidate;
      if (row.waitDays > worst.days) return candidate;
      if (row.waitDays < worst.days) return worst;
      /* A tie goes to the older month, as the window's own mark does. */
      return row.key < worst.key ? candidate : worst;
    }, null);
  }, [overOnly, sorted]);

  /* Whichever reading is on screen carries its own record: the twelve months,
     or the months the foot kept. */
  const worstShown = overOnly ? selectionWorst : months.worstWait;

  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  /* Hours while it stays readable, then days: nobody reads « 61,5 h ». */
  const durationLabel = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 48) return `${nf.format(Math.round(hours))} h`;
    return `${nf.format(Math.round((hours / 24) * 10) / 10)} j`;
  };
  const deltaLabel = (hours: number | null) => {
    if (hours === null) return '—';
    const abs = Math.abs(hours);
    if (abs < 0.5) return '0 h';
    const sign = hours > 0 ? '+' : '−';
    return `${sign}${durationLabel(abs)}`;
  };

  const pick = (key: SortKey) => {
    /* A header click takes the table back from the strip: the note that says
       « opened from the counter » must not outlive the order it describes. */
    setSortOrigin('user');
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'month' ? 'asc' : 'desc' },
    );
  };

  const head = (key: SortKey, label: string, hint: string) => {
    const on = sort.key === key;
    return (
      <th
        scope="col"
        aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <button
          type="button"
          className={`b2br-year-sort${on ? ' is-on' : ''}`}
          title={hint}
          onClick={() => pick(key)}
        >
          {label}
          <i
            className={
              on
                ? sort.dir === 'asc'
                  ? 'ri-sort-asc'
                  : 'ri-sort-desc'
                : 'ri-arrow-up-down-line'
            }
            aria-hidden="true"
          ></i>
        </button>
      </th>
    );
  };

  if (months.total.total === 0) return null;

  const documentedTotal =
    months.total.total > 0
      ? Math.round((months.total.documented / months.total.total) * 100)
      : null;
  const avgTotal =
    months.total.count > 0 ? months.total.sum / months.total.count / 3600000 : null;
  /* The same twelve months, read as days waited: weighted on the closures
     themselves rather than on an average of averages. */
  const waitTotal =
    months.total.count > 0 ? months.total.waitSum / months.total.count : null;
  const waitLabel = (days: number | null) =>
    days === null ? '—' : `${nf.format(Math.round(days * 10) / 10)} j`;
  /* Years are long, workshops are not: the share says how much of it went
     under, the count says on how many judged months it rests. */
  const belowShare =
    months.judged > 0 ? Math.round((months.belowCount / months.judged) * 100) : null;
  /* The same reading on the other fault: the months past the wait threshold,
     over the months that carry a measurable average at all. */
  const overShare =
    months.measured > 0
      ? Math.round((months.overCount / months.measured) * 100)
      : null;

  return (
    <div className="b2br-year" id="b2br-year" data-tint={tint ? 'on' : 'off'}>
      <p className="b2br-year-lead">
        <i className="ri-table-line" aria-hidden="true"></i>
        {t('acct.b2b.yearTableTitle')}
        <em>{t('acct.b2b.yearTableLead')}</em>
        {/* The visit came from a shared month link: the way back to the strip
            sits here, one quiet line, instead of asking for a scroll. */}
        {onBackToStrip && (
          <button
            type="button"
            className="b2br-year-back"
            title={t('acct.b2b.yearTableBackToStripHint')}
            onClick={onBackToStrip}
          >
            <i className="ri-arrow-up-line" aria-hidden="true"></i>
            {t('acct.b2b.yearTableBackToStrip')}
          </button>
        )}
        {/* The tint is switchable, and the switch is remembered: a shared
            screen is not the same reader as a private one. */}
        <button
          type="button"
          className={`b2br-year-tint${tint ? ' is-on' : ''}`}
          aria-pressed={tint}
          title={t('acct.b2b.yearTableTintHint')}
          onClick={() => setTint((prev) => !prev)}
        >
          <i
            className={tint ? 'ri-contrast-drop-line' : 'ri-contrast-line'}
            aria-hidden="true"
          ></i>
          {t('acct.b2b.yearTableTint')}
        </button>
      </p>

      <div className="b2br-year-scroll">
        <table className="b2br-year-table" aria-label={t('acct.b2b.yearTableTitle')}>
          <thead>
            <tr>
              {head('month', t('acct.b2b.csvYearMonth'), t('acct.b2b.yearTableLead'))}
              {head('closed', t('acct.b2b.trendCompareClosed'), t('acct.b2b.yearTableLead'))}
              {head(
                'documented',
                t('acct.b2b.csvYearMotivated'),
                t('acct.b2b.yearTableLead'),
              )}
              {head(
                'measurable',
                t('acct.b2b.trendCompareAvgCount'),
                t('acct.b2b.trendCompareAvgCountHint'),
              )}
              {head('avg', t('acct.b2b.yearTableDelay'), t('acct.b2b.trendCompareAvgHint'))}
              {/* The depth the reply time hides: how many whole days the fiches
                  of that month really waited, on the clock of the export. */}
              {head(
                'wait',
                t('acct.b2b.yearTableWaitAvg'),
                t('acct.b2b.yearTableWaitAvgHint'),
              )}
              {head(
                'delta',
                t('acct.b2b.csvYearDelayDelta'),
                t('acct.b2b.trendSlowNote'),
              )}
              {/* The target column of the exported sheet, on screen: one glance
                  and the months that fell under their own threshold stand out. */}
              {head('below', t('acct.b2b.csvYearBelow'), t('acct.b2b.goalText'))}
              {/* Facing it, the other fault of the same year: the month that made
                  people wait past the workshop threshold. Two verdicts side by
                  side, so the foot can count both. */}
              {head(
                'over',
                t('acct.b2b.yearTableOverCol'),
                `${t('acct.b2b.waitGoalTitle')} · ${t('acct.b2b.waitGoalCurrent').replace(
                  '{n}',
                  String(waitGoalDays),
                )}`,
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => {
              /* Only a rise is ever thin: a fall said by two fiches is not a
                 claim, so it gets no mark. */
              const thin =
                row.deltaHours !== null &&
                row.deltaHours > 0 &&
                row.measurable < THIN_SAMPLE;
              /* The deepest wait of the window: one month, marked beside the
                 very figure it explains — right next to the thin-sample mark
                 of the neighbouring column, in the attention hue. */
              const longest = worstShown?.key === row.key;
              const worstDays = worstShown
                ? nf.format(Math.round(worstShown.days * 10) / 10)
                : '';
              return (
                <tr
                  key={row.key}
                  data-empty={row.closed === 0 ? 'yes' : 'no'}
                  /* Tinted on screen so the eye finds the months in fault
                     without sorting the column first. */
                  data-below={row.below === true ? 'yes' : 'no'}
                  /* The other fault of the same table: the month made people
                     wait past the week. Two faults, two marks — the row is read
                     in words in the two columns beside it either way. */
                  data-over={row.over === true ? 'yes' : 'no'}
                >
                  <th scope="row" className="b2br-year-month">
                    <span className="b2br-year-monthcell">
                      {onOpenMonth ? (
                        <button
                          type="button"
                          className="b2br-year-month-btn"
                          title={t('acct.b2b.yearTableOpenMonth').replace('{month}', row.label)}
                          onClick={() => onOpenMonth(row.key)}
                        >
                          {row.label}
                        </button>
                      ) : (
                        <span>{row.label}</span>
                      )}
                      {/* Every row is handed over the way the longest month is:
                          the address carries the month, so a colleague opens
                          exactly these closures — row by row, the same gesture. */}
                      <B2bShareLink
                        href={b2bMonthHref(row.key, lang)}
                        label={t('acct.b2b.yearTableShare').replace('{month}', row.label)}
                        hint={t('acct.b2b.yearTableShareHint').replace('{month}', row.label)}
                        className="b2br-year-share"
                        iconOnly
                      />
                    </span>
                  </th>
                  <td className="b2br-year-num">{row.closed > 0 ? row.closed : '·'}</td>
                  <td className="b2br-year-num">
                    {row.documented === null ? '—' : `${row.documented} %`}
                  </td>
                  <td className="b2br-year-num">
                    {row.measurable > 0 ? row.measurable : '—'}
                  </td>
                  <td className="b2br-year-num">{durationLabel(row.avgHours)}</td>
                  <td className="b2br-year-num b2br-year-wait" data-over={row.over === true ? 'yes' : 'no'} title={row.over === true ? `${t('acct.b2b.yearTableOverHint').replace('{goal}', String(waitGoalDays))} · ${t('acct.b2b.yearTableWaitAvgHint')}` : t('acct.b2b.yearTableWaitAvgHint')}>
                    {waitLabel(row.waitDays)}
                    {/* The mark is a door, exactly like the header of the month
                        column: the figure explains the wait, the click opens the
                        closures that produced it — one figure, one list. */}
                    {longest &&
                      (onOpenMonth ? (
                        <button
                          type="button"
                          className="b2br-year-worstbtn"
                          title={`${t('acct.b2b.yearTableWorstWait').replace(
                            '{days}',
                            worstDays,
                          )} · ${t('acct.b2b.yearTableOpenMonth').replace(
                            '{month}',
                            row.label,
                          )}`}
                          aria-label={`${t('acct.b2b.yearTableWorstWait').replace(
                            '{days}',
                            worstDays,
                          )} · ${t('acct.b2b.yearTableOpenMonth').replace(
                            '{month}',
                            row.label,
                          )}`}
                          onClick={() => onOpenMonth(row.key)}
                        >
                          <i
                            className="ri-hourglass-line b2br-year-worst"
                            aria-hidden="true"
                          ></i>
                        </button>
                      ) : (
                        <i
                          className="ri-hourglass-line b2br-year-worst"
                          title={t('acct.b2b.yearTableWorstWait').replace(
                            '{days}',
                            worstDays,
                          )}
                          aria-label={t('acct.b2b.yearTableWorstWait').replace(
                            '{days}',
                            worstDays,
                          )}
                        ></i>
                      ))}
                  </td>
                  <td
                    className="b2br-year-num b2br-year-delta"
                    data-dir={
                      row.deltaHours === null || Math.abs(row.deltaHours) < 0.5
                        ? 'flat'
                        : row.deltaHours > 0
                          ? 'up'
                          : 'down'
                    }
                  >
                    {deltaLabel(row.deltaHours)}
                    {thin && (
                      <i
                        className="ri-error-warning-line b2br-year-thin"
                        title={t('acct.b2b.yearTableThin').replace(
                          '{n}',
                          String(row.measurable),
                        )}
                        aria-label={t('acct.b2b.yearTableThin').replace(
                          '{n}',
                          String(row.measurable),
                        )}
                      ></i>
                    )}
                  </td>
                  {/* Under its own target, or not: the threshold of that month
                      sits right under the answer, so the verdict never has to
                      be checked against a second table. */}
                  <td
                    className="b2br-year-num b2br-year-below"
                    data-state={row.below === null ? 'none' : row.below ? 'below' : 'ok'}
                    title={
                      row.below === null
                        ? undefined
                        : row.goal === null
                          ? t('acct.b2b.yearTableBelowNoGoal')
                          : t('acct.b2b.yearTableBelowHint')
                              .replace('{share}', `${row.documented} %`)
                              .replace('{goal}', String(row.goal))
                    }
                  >
                    {row.below === null
                      ? '—'
                      : row.below
                        ? t('acct.b2b.csvYes')
                        : t('acct.b2b.csvNo')}
                    {row.goal !== null && (
                      <em className="b2br-year-goal">{row.goal} %</em>
                    )}
                  </td>
                  {/* Above the workshop wait threshold, or not: the same verdict
                      as the target column beside it, read on the queue instead
                      of the trace. Blank for a month with nothing measurable. */}
                  <td
                    className="b2br-year-num b2br-year-over"
                    data-state={row.over === null ? 'none' : row.over ? 'over' : 'ok'}
                    title={
                      row.over === null
                        ? t('acct.b2b.yearTableOverNone')
                        : t('acct.b2b.yearTableOverHint').replace(
                            '{goal}',
                            String(waitGoalDays),
                          )
                    }
                  >
                    {row.over === null
                      ? '—'
                      : row.over
                        ? t('acct.b2b.csvYes')
                        : t('acct.b2b.csvNo')}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" className="b2br-year-month">
                {t('acct.b2b.csvYearAll')}
              </th>
              <td className="b2br-year-num">{months.total.total}</td>
              <td className="b2br-year-num">
                {documentedTotal === null ? '—' : `${documentedTotal} %`}
              </td>
              <td className="b2br-year-num">
                {months.total.count > 0 ? months.total.count : '—'}
              </td>
              <td className="b2br-year-num">{durationLabel(avgTotal)}</td>
              <td className="b2br-year-num b2br-year-wait" title={t('acct.b2b.yearTableWaitAvgHint')}>
                {waitLabel(waitTotal)}
              </td>
              {/* No single month before the whole window: the gap stays blank. */}
              <td className="b2br-year-num b2br-year-delta" data-dir="flat">
                —
              </td>
              {/* Twelve months have twelve thresholds: the line counts those
                  that fell short instead of pretending to one verdict. */}
              <td
                className="b2br-year-num b2br-year-below"
                data-state={months.belowCount > 0 ? 'below' : 'ok'}
                title={`${t('acct.b2b.yearTableBelowFootShare')
                  .replace('{n}', String(months.belowCount))
                  .replace('{judged}', String(months.judged))
                  .replace('{share}', belowShare === null ? '—' : String(belowShare))}${
                  months.noGoal > 0
                    ? ` · ${t('acct.b2b.yearTableNoGoal').replace('{n}', String(months.noGoal))}`
                    : ''
                }`}
              >
                {months.belowCount}
                {/* The share of the year, under the count: three months out of
                    twelve is not three months out of three. */}
                {belowShare !== null && (
                  <em className="b2br-year-goal">{belowShare} %</em>
                )}
              </td>
              {/* The other face of the foot: the months past the wait
                  threshold, counted over the months that could be measured at
                  all. The line of totals now says both faults. */}
              <td
                className="b2br-year-num b2br-year-over b2br-year-overfoot"
                data-state={months.overCount > 0 ? 'over' : 'ok'}
                data-on={overOnly ? 'yes' : 'no'}
              >
                {/* The count is a door: it leaves only the months it counted.
                    The figure and the rows behind it are then one glance apart. */}
                <button
                  type="button"
                  className="b2br-year-overbtn"
                  aria-pressed={overOnly}
                  disabled={months.overCount === 0}
                  title={`${t('acct.b2b.yearTableOverFootShare')
                    .replace('{n}', String(months.overCount))
                    .replace('{judged}', String(months.measured))
                    .replace('{goal}', String(waitGoalDays))
                    .replace(
                      '{share}',
                      overShare === null ? '—' : String(overShare),
                    )}${
                    months.overCount > 0
                      ? ` · ${t('acct.b2b.yearTableOverOpen')}`
                      : ''
                  }${
                    worstShown
                      ? ` · ${t('acct.b2b.yearTableWorstNote')
                          .replace('{month}', worstShown.label)
                          .replace(
                            '{days}',
                            nf.format(Math.round(worstShown.days * 10) / 10),
                          )}`
                      : ''
                  }`}
                  onClick={() => setOverOnly((prev) => !prev)}
                >
                  {months.overCount}
                  {overShare !== null && (
                    <em className="b2br-year-goal">{overShare} %</em>
                  )}
                  {/* The share says how much of the year is in fault; the name
                      under it says which month carried the deepest wait — so
                      the foot answers both « how many » and « which one » in
                      the same cell, read on the very column beside it. */}
                  {worstShown && (
                    <em className="b2br-year-goal b2br-year-overworst">
                      {t('acct.b2b.yearTableOverFootWorst')
                        .replace('{month}', worstShown.label)
                        .replace(
                          '{days}',
                          nf.format(Math.round(worstShown.days * 10) / 10),
                        )
                        .replace('{unit}', t('acct.b2b.waitGoalUnit'))}
                    </em>
                  )}
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {/* The mark above needs a face in words too: the sheet is read away from
          the site, and a lone pictogram would not survive the trip. */}
      {worstShown && !overOnly && (
        <p className="b2br-year-note b2br-year-worstnote">
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          {t('acct.b2b.yearTableWorstNote')
            .replace('{month}', worstShown.label)
            .replace('{days}', nf.format(Math.round(worstShown.days * 10) / 10))}
        </p>
      )}
      {/* On the narrowed table, the record of the selection itself: the deepest
          wait among the months the foot kept, with the number of closures it
          rests on — the same reading as the window's note, read on what is
          actually in front of the reader. */}
      {overOnly && selectionWorst && (
        <p className="b2br-year-note b2br-year-selnote">
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          {t('acct.b2b.yearTableSelWorst')
            .replace('{month}', selectionWorst.label)
            .replace('{days}', nf.format(Math.round(selectionWorst.days * 10) / 10))
            .replace('{n}', String(selectionWorst.measurable))}
        </p>
      )}
      {/* The strip's counter set this order: the table says it, and says what
          it is read on — the loaded requests, not the whole account. */}
      {sortOrigin === 'counter' && sort.key === 'wait' && (
        <p className="b2br-year-note b2br-year-sortnote">
          <i className="ri-sort-desc" aria-hidden="true"></i>
          {t('acct.b2b.yearTableWaitSortNote')}
        </p>
      )}
      {/* The months past the wait threshold, counted and named: a tint alone
          would not survive a printed screen, and the sheet is read away from
          the site. */}
      {months.overCount > 0 && (
        <p className="b2br-year-note b2br-year-overnote">
          <i className="ri-calendar-close-line" aria-hidden="true"></i>
          {t('acct.b2b.yearTableOverNote')
            .replace('{n}', String(months.overCount))
            .replace('{goal}', String(waitGoalDays))}
        </p>
      )}
      {/* The foot's count kept only its own months: the table says so, says
          what the total line still covers, and gives the way back. */}
      {overOnly && (
        <p className="b2br-year-note b2br-year-overfilter">
          <i className="ri-filter-3-line" aria-hidden="true"></i>
          {t('acct.b2b.yearTableOverFilter')
            .replace('{n}', String(months.overCount))
            .replace('{goal}', String(waitGoalDays))}
          <em>{t('acct.b2b.yearTableOverFilterNote')}</em>
          <button type="button" onClick={() => setOverOnly(false)}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('acct.b2b.yearTableOverFilterClear')}
          </button>
        </p>
      )}
      {/* The other side of the count: months that had closures and no threshold
          to be read against. Said in the foot, so the share of the year is
          never mistaken for the whole window. */}
      {months.noGoal > 0 && (
        <p className="b2br-year-note">
          <i className="ri-flag-line" aria-hidden="true"></i>
          {t('acct.b2b.yearTableNoGoal').replace('{n}', String(months.noGoal))}
        </p>
      )}
    </div>
  );
}