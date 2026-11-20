import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { B2B_MOTIF_KEYS, type B2bMotifKey, type B2bObjectifEntry, type DemandeB2b } from '@/lib/b2b';
import { detectMotif } from './b2bMotifs';
import { goalForMonth } from './b2bObjectif';
import { downloadB2bCsv } from './b2bCsv';
import { buildCompareCsv, compareCsvFilename, type CompareSide } from './b2bCompareCsv';
import B2bShareLink, { b2bDuelHref, b2bMonthHref } from './B2bShareLink';
import B2bYearTable from './B2bYearTable';
import type { B2bYearSortDir, B2bYearSortKey } from './b2bYearSortMemory';
import { readCompare, saveCompare } from './b2bCompareMemory';

const MONTHS = 12;

/** Under three measurable closures, a monthly average is a rumour, not a figure. */
const THIN_SAMPLE = 3;

type Bucket = {
  counts: Record<B2bMotifKey, number>;
  none: number;
  total: number;
  documented: number;
  /** Of those documented closures, the ones caught up in bulk after the fact. */
  lot: number;
  /** Catch-ups erased that month: the correction left a trace of its own. */
  cleared: number;
  /** Reply delays of that month, summed in milliseconds, and how many count. */
  delaySum: number;
  delayCount: number;
};

const emptyBucket = (): Bucket => ({
  counts: { devis: 0, client: 0, hors: 0, delai: 0, sansSuite: 0 },
  none: 0,
  total: 0,
  documented: 0,
  lot: 0,
  cleared: 0,
  delaySum: 0,
  delayCount: 0,
});

/** The average reply delay of a month, in hours — null when nothing measured. */
function avgDelayHours(bucket: Bucket): number | null {
  if (bucket.delayCount === 0) return null;
  return bucket.delaySum / bucket.delayCount / 3600000;
}

/**
 * The trend of the closing reasons, twelve months wide, read without opening a
 * spreadsheet. Same basis as everything else in the box: grouped on the handling
 * date — the month the workshop actually answered — and on the rows loaded here.
 * Bars are scaled against the busiest month, so the volume is readable too.
 *
 * Under each bar, a thin line carries the documented share, with the workshop
 * target drawn across it as a threshold: the months that fell short are marked
 * instead of left to a mental calculation.
 */
export default function B2bMotifTrend({
  rows,
  objectif,
  objectifHistory,
  onOpenLotMonth,
  onOpenClearedMonth,
  onOpenOriginMonth,
  onOpenMonth,
  memoryKey = '',
  duelRequest = null,
  focusMonth = null,
  belowRequest = 0,
  waitGoalDays = 7,
  yearSortRequest = null,
  backToStrip,
  sharedDuel = null,
}: {
  rows: DemandeB2b[];
  /** The monthly target for documented closures — null when it set none. */
  objectif: number | null;
  /** Every change of that target: each month keeps the threshold of its time. */
  objectifHistory: B2bObjectifEntry[];
  /** Opens the inbox on the closures of that month whose reason came in bulk. */
  onOpenLotMonth?: (monthKey: string) => void;
  /** Opens the inbox on that month's catch-ups erased afterwards. */
  onOpenClearedMonth?: (monthKey: string) => void;
  /** Opens the inbox on that month's closures whose reason came at the close. */
  onOpenOriginMonth?: (monthKey: string) => void;
  /**
   * Opens the inbox on every closure of that month: the slow arrow is a door,
   * so a sentence like « ce mois a ralenti » can be read down to the fiches.
   */
  onOpenMonth?: (monthKey: string) => void;
  /** Where the picked pair is remembered: one duel per account. */
  memoryKey?: string;
  /**
   * A pair asked for elsewhere — the month review pre-fills the duel with its
   * own two months. The counter marks a fresh request, so the same pair can be
   * asked twice in a row without being ignored.
   */
  duelRequest?: { months: string[]; nonce: number } | null;
  /**
   * A month asked for by the account strip — the one whose reply time grew.
   * The chart opens on it, framed, instead of leaving the bar to be hunted
   * down among twelve. The counter marks a fresh request, same as the duel.
   */
  focusMonth?: { month: string; nonce: number } | null;
  /**
   * The account strip's year chip, bumped on every click: the chart opens
   * filtered on the months of the window that fell under their own threshold.
   */
  belowRequest?: number;
  /** The wait threshold of the strip: the year table tints the months past it. */
  waitGoalDays?: number;
  /**
   * An order asked for by the strip's wait counter: the year table opens sorted
   * on days waited, so the figure and the months behind it are one click apart.
   */
  yearSortRequest?: {
    key: B2bYearSortKey;
    dir: B2bYearSortDir;
    nonce: number;
  } | null;
  /**
   * The visit came from a shared month link: the twelve-month table carries the
   * quiet way back up to the strip that named that month.
   */
  backToStrip?: () => void;
  /**
   * The pair a colleague handed over, two month keys: the duel came up already
   * filled from the address, and the panel says so — a comparison that was
   * shared must not look like one that was picked twice on the same screen.
   */
  sharedDuel?: string[] | null;
}) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  /**
   * The months picked on the correction bars: two at most, so the chart can be
   * read as a comparison instead of a memory exercise. Picking a third drops
   * the oldest, so a second click never does nothing. The pair is remembered
   * per account, so the duel is still standing when the member comes back.
   */
  const [compare, setCompare] = useState<string[]>(() =>
    memoryKey ? readCompare(memoryKey) : [],
  );
  /** The duel just went out as a file: say so, then go quiet again. */
  const [exported, setExported] = useState(false);
  /** Last duel request already applied: a re-render must not overwrite picks. */
  const appliedDuel = useRef(0);
  /** The month the account strip pointed at, drawn framed in the list. */
  const [focusKey, setFocusKey] = useState('');
  const appliedFocus = useRef(0);
  /** The chart reads only the months in fault, as the year chip asked. */
  const [belowOnly, setBelowOnly] = useState(false);
  /** Last filter request already applied: a re-render must not re-close it. */
  const appliedBelow = useRef(0);

  const toggleCompare = (key: string) => {
    setCompare((prev) => {
      if (prev.includes(key)) return prev.filter((item) => item !== key);
      if (prev.length >= 2) return [prev[1], key];
      return [...prev, key];
    });
  };

  const months = useMemo(() => {
    const today = new Date();
    const keyOf = (date: Date) =>
      `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    const labeler = new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' });

    const slots: Array<{ key: string; label: string }> = [];
    for (let back = MONTHS - 1; back >= 0; back -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - back, 1);
      const raw = labeler.format(date);
      slots.push({ key: keyOf(date), label: raw.charAt(0).toUpperCase() + raw.slice(1) });
    }

    const buckets = new Map<string, Bucket>();
    slots.forEach((slot) => buckets.set(slot.key, emptyBucket()));

    rows.forEach((row) => {
      if (row.statut !== 'traitee' || !row.traitee_at) return;
      const date = new Date(row.traitee_at);
      if (Number.isNaN(date.getTime())) return;
      const bucket = buckets.get(keyOf(date));
      if (!bucket) return;
      const key = detectMotif(row.motif);
      if (key) {
        bucket.counts[key] += 1;
        bucket.documented += 1;
        /* A reason caught up in bulk is part of the documented share, but it
           was not given at the close: the chart marks that reconstructed part. */
        if (row.motif_lot_at) bucket.lot += 1;
      } else {
        bucket.none += 1;
      }
      bucket.total += 1;

      /* The reply delay of that month, read on the same rows: reception →
         closure. A stamp older than the arrival is not measurable. */
      const from = new Date(row.created_at).getTime();
      const to = date.getTime();
      if (Number.isFinite(from) && to >= from) {
        bucket.delaySum += to - from;
        bucket.delayCount += 1;
      }
    });

    /* The corrections, on their own pass: an erased catch-up is stamped with
       the day it was erased, whatever became of the closure since then. */
    rows.forEach((row) => {
      if (!row.motif_lot_clear_at) return;
      const date = new Date(row.motif_lot_clear_at);
      if (Number.isNaN(date.getTime())) return;
      const bucket = buckets.get(keyOf(date));
      if (bucket) bucket.cleared += 1;
    });

    return slots.map((slot) => ({
      ...slot,
      bucket: buckets.get(slot.key) as Bucket,
      /* The threshold of that month, not today's: the line must move with it. */
      goal: goalForMonth(objectifHistory, slot.key, objectif),
    }));
  }, [rows, locale, objectif, objectifHistory]);

  /* Every month that closed something and stayed under the threshold of its
     own time: the cut the account strip's year chip asks for. */
  const belowMonths = useMemo(
    () =>
      months.filter((month) => {
        const { bucket, goal } = month;
        if (bucket.total === 0 || goal === null) return false;
        return Math.round((bucket.documented / bucket.total) * 100) < goal;
      }),
    [months],
  );

  /* The year chip is a door: the chart comes up already filtered on those
     months, framed on the first of them. */
  useEffect(() => {
    if (!belowRequest || belowRequest === appliedBelow.current) return;
    appliedBelow.current = belowRequest;
    setBelowOnly(true);
    const first = belowMonths[0];
    if (!first) return;
    window.setTimeout(() => {
      document
        .getElementById(`b2br-trend-m-${first.key}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 180);
  }, [belowRequest, belowMonths]);

  const total = months.reduce((sum, month) => sum + month.bucket.total, 0);
  const peak = months.reduce((max, month) => Math.max(max, month.bucket.total), 0);
  /* The corrections get a scale of their own: their count is far smaller than
     the closures, and a shared scale would flatten them to nothing. */
  const fixPeak = months.reduce((max, month) => Math.max(max, month.bucket.cleared), 0);
  const used = B2B_MOTIF_KEYS.filter((key) =>
    months.some((month) => month.bucket.counts[key] > 0),
  );
  const hasNone = months.some((month) => month.bucket.none > 0);
  /* Months where the trace was rebuilt after the fact: they need saying too. */
  const hasLot = months.some((month) => month.bucket.lot > 0);
  /* Months that also carry a correction: catch-ups taken back afterwards. */
  const hasCleared = months.some((month) => month.bucket.cleared > 0);
  /* Months where at least one closure had a reason at all: only those can be
     read against the original-trace line below. */
  const hasOrigin = months.some((month) => month.bucket.documented > 0);

  const motifLabel = (key: B2bMotifKey) => t(`acct.b2b.motif.${key}`);

  /* A month leaves the window after a year: a pair remembered from before must
     not leave two ghost columns on the chart. */
  useEffect(() => {
    setCompare((prev) => {
      const valid = prev.filter((key) => months.some((month) => month.key === key));
      return valid.length === prev.length ? prev : valid;
    });
  }, [months]);

  /* A pair asked for by the month review lands here already picked: the chart
     opens on those two months, without two bars to hunt down. */
  useEffect(() => {
    if (!duelRequest || duelRequest.nonce === appliedDuel.current) return;
    const valid = duelRequest.months.filter((key) =>
      months.some((month) => month.key === key),
    );
    if (valid.length === 0) return;
    appliedDuel.current = duelRequest.nonce;
    setCompare(valid.slice(-2));
  }, [duelRequest, months]);

  /* A month pointed at by the account strip: framed, and brought into view
     once — the twelve rows fit on a screen, but the eye needs a landmark. */
  useEffect(() => {
    if (!focusMonth || focusMonth.nonce === appliedFocus.current) return;
    appliedFocus.current = focusMonth.nonce;
    setFocusKey(focusMonth.month);
    if (!months.some((month) => month.key === focusMonth.month)) return;
    window.setTimeout(() => {
      document
        .getElementById(`b2br-trend-m-${focusMonth.month}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 160);
  }, [focusMonth, months]);

  /* Hours while it stays readable, then days: nobody reads « 61,5 h ». */
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const delayLabel = (hours: number | null) => {
    if (hours === null) return '—';
    if (hours < 48) return `${nf.format(Math.round(hours))} h`;
    return `${nf.format(Math.round((hours / 24) * 10) / 10)} j`;
  };

  /* The months being compared, in the order they were picked. */
  const compareMonths = useMemo(
    () =>
      compare
        .map((key) => months.find((month) => month.key === key))
        .filter((month): month is (typeof months)[number] => Boolean(month))
        .map((month) => {
          const { bucket } = month;
          const share =
            bucket.total > 0 ? Math.round((bucket.documented / bucket.total) * 100) : null;
          const originShare =
            bucket.documented > 0
              ? Math.round(((bucket.documented - bucket.lot) / bucket.documented) * 100)
              : null;
          /* The month's average reply delay, on the very rows behind the bar. */
          const avgHours =
            bucket.delayCount > 0
              ? Math.round((bucket.delaySum / bucket.delayCount / 3600000) * 10) / 10
              : null;
          return { ...month, share, originShare, avgHours };
        }),
    [compare, months],
  );

  /**
   * The pair really came from the shared address: still the two months it named,
   * and both of them found in the loaded window — so the note disappears the
   * moment the reader picks another bar, instead of describing a past visit.
   */
  const sharedDuelOn = Boolean(
    sharedDuel &&
      sharedDuel.length === 2 &&
      compareMonths.length === 2 &&
      sharedDuel.every((key) => compareMonths.some((month) => month.key === key)),
  );

  /* The pair survives the visit: one duel per account, remembered in the browser
     so the member finds the same two months when coming back. */
  useEffect(() => {
    if (!memoryKey) return;
    saveCompare(memoryKey, compareMonths.map((month) => month.key));
  }, [memoryKey, compareMonths]);

  /* The gap between the two months, read on the same figures. */
  const compareDelta =
    compareMonths.length === 2
      ? (() => {
          const [a, b] = compareMonths;
          const sign = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0');
          const corr = b.bucket.cleared - a.bucket.cleared;
          const docs =
            a.share === null || b.share === null ? null : b.share - a.share;
          const total = b.bucket.total - a.bucket.total;
          /* A delay only compares when both months could be measured. */
          const delay =
            a.avgHours === null || b.avgHours === null ? null : b.avgHours - a.avgHours;
          /* How the weight behind the two averages moved: a month can slow down
             while measuring far fewer fiches, and that is a different story. */
          const measurable = b.bucket.delayCount - a.bucket.delayCount;
          return { corr, docs, total, delay, measurable, sign };
        })()
      : null;

  /* Every threshold the twelve months can show: when the workshop changed its
     target mid-year, the note must not claim a single number. */
  const thresholds = Array.from(new Set(months.map((month) => month.goal)));
  const singleGoal = thresholds.length <= 1 ? (thresholds[0] ?? objectif) : null;
  const hasGoal = thresholds.some((value) => value !== null);

  /* Months whose average delay grew against the month before: the chart says
     it with a small arrow, so a slowing workshop is not read as a flat line. */
  const hasSlow = months.some((month, index) => {
    const current = avgDelayHours(month.bucket);
    const previous = index > 0 ? avgDelayHours(months[index - 1].bucket) : null;
    return current !== null && previous !== null && current > previous;
  });

  /* Months that closed at least one request and stayed under their own target. */
  const belowCount = belowMonths.length;

  if (total === 0) {
    return (
      <div className="b2br-trend" id="b2br-trend">
        <p className="b2br-trend-lead">
          <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
          {t('acct.b2b.trendLead')}
        </p>
        <p className="b2br-trend-empty">{t('acct.b2b.trendEmpty')}</p>
      </div>
    );
  }

  /* The months on screen: the twelve, or only those in fault when the account
     strip's year chip asked for that cut. */
  const shownMonths = belowOnly ? belowMonths : months;
  /* Each shown month with the month before it and its slowdown, read against
     the real neighbour — a filtered list must not invent a comparison. */
  const shownPlan = shownMonths.map((month) => {
    const fullIndex = months.findIndex((entry) => entry.key === month.key);
    const previous = fullIndex > 0 ? months[fullIndex - 1] : null;
    const currentDelay = avgDelayHours(month.bucket);
    const previousDelay = previous ? avgDelayHours(previous.bucket) : null;
    const slow =
      currentDelay !== null && previousDelay !== null && currentDelay > previousDelay
        ? currentDelay - previousDelay
        : null;
    return { month, previous, slow };
  });

  return (
    <div className="b2br-trend" id="b2br-trend">
      <p className="b2br-trend-lead">
        <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
        {t('acct.b2b.trendLead')}
        <em>{t('acct.b2b.trendHint').replace('{n}', String(total))}</em>
      </p>

      {/* The year chip of the account strip lands here: the chart reads only the
          months in fault, says so, and gives the way back to the twelve. */}
      {belowOnly && (
        <p className="b2br-trend-lotnote b2br-trend-belownote">
          <i className="ri-filter-3-line" aria-hidden="true"></i>
          {t('acct.b2b.trendBelowChip').replace('{n}', String(belowCount))}
          <em>{t('acct.b2b.trendBelowNote')}</em>
          <button type="button" onClick={() => setBelowOnly(false)}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('acct.b2b.trendBelowClear')}
          </button>
        </p>
      )}

      <ul className="b2br-trend-legend">
        {used.map((key) => (
          <li key={key} data-motif={key}>
            <i aria-hidden="true"></i>
            {motifLabel(key)}
          </li>
        ))}
        {hasNone && (
          <li data-motif="none">
            <i aria-hidden="true"></i>
            {t('acct.b2b.motifNone')}
          </li>
        )}
      </ul>

      {hasGoal && (
        <p className="b2br-trend-goalnote">
          <i className="ri-subtract-line" aria-hidden="true"></i>
          {singleGoal === null || singleGoal === undefined
            ? t('acct.b2b.trendGoalNoteMulti').replace('{n}', String(belowCount))
            : t('acct.b2b.trendGoalNote')
                .replace('{goal}', String(singleGoal))
                .replace('{n}', String(belowCount))}
        </p>
      )}

      {/* The reconstructed part of the trace gets its own reading: a hatched
          stretch on the line, so a catch-up is never read as a real trace. */}
      {hasLot && (
        <p className="b2br-trend-lotnote">
          <i className="ri-stack-line" aria-hidden="true"></i>
          {t('acct.b2b.trendLotNote')}
        </p>
      )}

      {/* The corrections get a second hatch: a month that had to be put right
          after the fact is not the same month as one that was never touched. */}
      {hasCleared && (
        <p className="b2br-trend-lotnote b2br-trend-clearednote">
          <i className="ri-eraser-line" aria-hidden="true"></i>
          {t('acct.b2b.trendClearedNote')}
        </p>
      )}

      {/* The original trace, read month after month without the spreadsheet:
          a solid line, no hatch — what was given at the close, not patched up. */}
      {hasOrigin && (
        <p className="b2br-trend-lotnote b2br-trend-lifenote">
          <i className="ri-contrast-2-line" aria-hidden="true"></i>
          {t('acct.b2b.trendLifeNote')}
        </p>
      )}

      {/* The slowing months get a line of their own: the arrow is small, and an
          unexplained arrow is worse than none. */}
      {hasSlow && (
        <p className="b2br-trend-lotnote b2br-trend-slownote">
          <i className="ri-arrow-up-line" aria-hidden="true"></i>
          {t('acct.b2b.trendSlowNote')}
        </p>
      )}

      {/* A month opened from the account strip is framed: the note says why, so
          the frame never reads as a selection waiting to be made. */}
      {focusKey !== '' && months.some((month) => month.key === focusKey) && (
        <p className="b2br-trend-lotnote b2br-trend-focusnote">
          <i className="ri-focus-3-line" aria-hidden="true"></i>
          {t('acct.b2b.trendFocusNote')}
        </p>
      )}

      {shownPlan.length === 0 ? (
        <p className="b2br-trend-empty">{t('acct.b2b.trendBelowNone')}</p>
      ) : (
      <ol className="b2br-trend-rows">
        {shownPlan.map(({ month, previous: previousMonth, slow }) => {
          const { bucket, goal } = month;
          /* Hours while it stays readable, then days — same reading as the duel. */
          const slowLabel = (value: number) => {
            if (value < 1) return '< 1 h';
            if (value < 48) return `${nf.format(Math.round(value))} h`;
            return `${nf.format(Math.round((value / 24) * 10) / 10)} j`;
          };
          const scale = peak > 0 ? (bucket.total / peak) * 100 : 0;
          const share =
            bucket.total > 0
              ? Math.round((bucket.documented / bucket.total) * 100)
              : null;
          const below = share !== null && goal !== null && share < goal;
          /* How many points of that documented share were rebuilt afterwards. */
          const lotShare =
            bucket.total > 0 ? Math.round((bucket.lot / bucket.total) * 100) : 0;
          /* Of the documented closures, the part whose reason was given at the
             close itself — the same reading as the CSV life column, on screen. */
          const originShare =
            bucket.documented > 0
              ? Math.round(((bucket.documented - bucket.lot) / bucket.documented) * 100)
              : null;
          const monthHint = `${t('acct.b2b.trendMonthHint')
            .replace('{month}', month.label)
            .replace('{n}', String(bucket.total))
            .replace('{share}', share === null ? '—' : `${share} %`)}${
            bucket.lot > 0
              ? ` · ${t('acct.b2b.trendLotShort').replace('{n}', String(bucket.lot))}`
              : ''
          }${
            bucket.cleared > 0
              ? ` · ${t('acct.b2b.trendClearedShort').replace('{n}', String(bucket.cleared))}`
              : ''
          }`;
          /* How many fiches were taken back that month, on its own scale. */
          const fixScale = fixPeak > 0 ? (bucket.cleared / fixPeak) * 100 : 0;
          return (
            <li
              key={month.key}
              id={`b2br-trend-m-${month.key}`}
              data-empty={bucket.total === 0 ? 'yes' : 'no'}
              data-below={below ? 'yes' : 'no'}
              data-focus={focusKey === month.key ? 'yes' : 'no'}
            >
              <span className="b2br-trend-month" title={monthHint}>
                <span className="b2br-trend-month-txt">{month.label}</span>
                {/* The delay grew against the month before: one small arrow and
                    the gap, so a slowdown is visible without reading the CSV.
                    The arrow is also a door: it lists that month's closures. */}
                {slow !== null && previousMonth && onOpenMonth && (
                  <button
                    type="button"
                    className="b2br-trend-slow b2br-trend-slow--btn"
                    title={t('acct.b2b.trendSlowOpen')
                      .replace('{delta}', slowLabel(slow))
                      .replace('{month}', month.label)}
                    aria-label={t('acct.b2b.trendSlowOpen')
                      .replace('{delta}', slowLabel(slow))
                      .replace('{month}', month.label)}
                    onClick={() => onOpenMonth(month.key)}
                  >
                    <i className="ri-arrow-up-line" aria-hidden="true"></i>
                    {slowLabel(slow)}
                    {/* A rise resting on one or two fiches is marked, not hidden:
                        the arrow stays, its weight is said next to it. */}
                    {bucket.delayCount < THIN_SAMPLE && (
                      <i
                        className="ri-error-warning-line b2br-trend-slow-thin"
                        title={t('acct.b2b.trendSlowThin').replace(
                          '{n}',
                          String(bucket.delayCount),
                        )}
                        aria-label={t('acct.b2b.trendSlowThin').replace(
                          '{n}',
                          String(bucket.delayCount),
                        )}
                      ></i>
                    )}
                  </button>
                )}
                {slow !== null && previousMonth && !onOpenMonth && (
                  <span
                    className="b2br-trend-slow"
                    title={t('acct.b2b.trendSlow')
                      .replace('{delta}', slowLabel(slow))
                      .replace('{month}', previousMonth.label)}
                    aria-label={t('acct.b2b.trendSlow')
                      .replace('{delta}', slowLabel(slow))
                      .replace('{month}', previousMonth.label)}
                  >
                    <i className="ri-arrow-up-line" aria-hidden="true"></i>
                    {slowLabel(slow)}
                    {bucket.delayCount < THIN_SAMPLE && (
                      <i
                        className="ri-error-warning-line b2br-trend-slow-thin"
                        title={t('acct.b2b.trendSlowThin').replace(
                          '{n}',
                          String(bucket.delayCount),
                        )}
                        aria-label={t('acct.b2b.trendSlowThin').replace(
                          '{n}',
                          String(bucket.delayCount),
                        )}
                      ></i>
                    )}
                  </span>
                )}
                {/* The bulk mark is a door: it opens the closures of that very
                    month whose reason was rebuilt after the fact. */}
                {bucket.lot > 0 &&
                  (onOpenLotMonth ? (
                    <button
                      type="button"
                      className="b2br-trend-month-lot b2br-trend-month-lot--btn"
                      title={t('acct.b2b.trendLotOpen')
                        .replace('{month}', month.label)
                        .replace('{n}', String(bucket.lot))}
                      aria-label={t('acct.b2b.trendLotOpen')
                        .replace('{month}', month.label)
                        .replace('{n}', String(bucket.lot))}
                      onClick={() => onOpenLotMonth(month.key)}
                    >
                      <i className="ri-stack-line" aria-hidden="true"></i>
                    </button>
                  ) : (
                    <i className="ri-stack-line b2br-trend-month-lot" aria-hidden="true"></i>
                  ))}
              </span>
              <span className="b2br-trend-stack">
                <span className="b2br-trend-track">
                  {bucket.total > 0 && (
                    <span
                      className="b2br-trend-bar"
                      style={{ width: `${scale}%` }}
                      title={monthHint}
                    >
                      {B2B_MOTIF_KEYS.filter((key) => bucket.counts[key] > 0).map((key) => (
                        <span
                          key={key}
                          data-motif={key}
                          style={{ flexGrow: bucket.counts[key] }}
                          title={`${motifLabel(key)} · ${bucket.counts[key]}`}
                        />
                      ))}
                      {bucket.none > 0 && (
                        <span
                          data-motif="none"
                          style={{ flexGrow: bucket.none }}
                          title={`${t('acct.b2b.motifNone')} · ${bucket.none}`}
                        />
                      )}
                    </span>
                  )}
                  {/* Second hatch: the month knew a correction, whatever the
                      volume. Drawn over the whole track so it never hides.
                      A door too: one click lists exactly those corrections. */}
                  {bucket.cleared > 0 &&
                    (onOpenClearedMonth ? (
                      <button
                        type="button"
                        className="b2br-trend-cleared b2br-trend-cleared--btn"
                        title={t('acct.b2b.trendClearedOpen')
                          .replace('{month}', month.label)
                          .replace('{n}', String(bucket.cleared))}
                        aria-label={t('acct.b2b.trendClearedOpen')
                          .replace('{month}', month.label)
                          .replace('{n}', String(bucket.cleared))}
                        onClick={() => onOpenClearedMonth(month.key)}
                      />
                    ) : (
                      <span
                        className="b2br-trend-cleared"
                        title={t('acct.b2b.trendClearedHint').replace(
                          '{n}',
                          String(bucket.cleared),
                        )}
                        aria-hidden="true"
                      />
                    ))}
                </span>
                {/* The trace line: filled up to the documented share, and cut by
                    the target. Only months with a closure can be judged. */}
                {share !== null && (
                  <span
                    className="b2br-trend-share"
                    data-below={below ? 'yes' : 'no'}
                    title={
                      goal === null
                        ? t('acct.b2b.trendShareHint')
                            .replace('{share}', `${share} %`)
                            .replace('{goal}', '')
                        : t('acct.b2b.trendShareHint')
                            .replace('{share}', `${share} %`)
                            .replace('{goal}', ` · ${t('acct.b2b.trendGoalShort').replace('{goal}', String(goal))}`)
                    }
                  >
                    <span className="b2br-trend-share-fill" style={{ width: `${share}%` }} />
                    {/* The stretch that was rebuilt after the fact: hatched, and
                        laid over the end of the documented share. */}
                    {lotShare > 0 && (
                      <span
                        className="b2br-trend-share-lot"
                        style={{
                          insetInlineStart: `${Math.max(share - lotShare, 0)}%`,
                          width: `${lotShare}%`,
                        }}
                        title={t('acct.b2b.trendLotHint').replace('{n}', String(bucket.lot))}
                      />
                    )}
                    {goal !== null && (
                      <span
                        className="b2br-trend-share-goal"
                        style={{ insetInlineStart: `${goal}%` }}
                        aria-hidden="true"
                      />
                    )}
                  </span>
                )}
                {/* The original-trace share, as a plain solid line: no hatch, no
                    correction — the closures that got their reason on the day. */}
                {originShare !== null &&
                  (onOpenOriginMonth ? (
                    <button
                      type="button"
                      className="b2br-trend-origin b2br-trend-origin--btn"
                      title={t('acct.b2b.trendOriginOpen')
                        .replace('{month}', String(month.label))
                        .replace('{n}', String(bucket.documented - bucket.lot))}
                      aria-label={t('acct.b2b.trendOriginOpen')
                        .replace('{month}', String(month.label))
                        .replace('{n}', String(bucket.documented - bucket.lot))}
                      onClick={() => onOpenOriginMonth(month.key)}
                    >
                      <span
                        className="b2br-trend-origin-fill"
                        style={{ width: `${originShare}%` }}
                      />
                    </button>
                  ) : (
                    <span
                      className="b2br-trend-origin"
                      title={t('acct.b2b.trendLifeHint')
                        .replace('{share}', String(originShare))
                        .replace('{n}', String(bucket.documented))}
                    >
                      <span
                        className="b2br-trend-origin-fill"
                        style={{ width: `${originShare}%` }}
                      />
                    </span>
                  ))}
                {/* The corrections of the month, as a bar of their own: one
                    click picks that month, two months read side by side. */}
                {bucket.cleared > 0 && (
                  <button
                    type="button"
                    className={`b2br-trend-fix b2br-trend-fix--btn${
                      compare.includes(month.key) ? ' is-on' : ''
                    }`}
                    aria-pressed={compare.includes(month.key)}
                    title={t('acct.b2b.trendFixPick')
                      .replace('{n}', String(bucket.cleared))
                      .replace('{month}', month.label)}
                    aria-label={t('acct.b2b.trendFixPick')
                      .replace('{n}', String(bucket.cleared))
                      .replace('{month}', month.label)}
                    onClick={() => toggleCompare(month.key)}
                  >
                    <span
                      className="b2br-trend-fix-fill"
                      style={{ width: `${fixScale}%` }}
                    />
                  </button>
                )}
              </span>
              <span className="b2br-trend-total">
                {bucket.total > 0 ? bucket.total : '·'}
              </span>
            </li>
          );
        })}
      </ol>
      )}

      {/* Two months, side by side: the comparison the correction bars make
          possible without a spreadsheet. Only shown once a month is picked. */}
      {compareMonths.length > 0 && (
        <div className="b2br-compare" role="group" aria-label={t('acct.b2b.trendCompareTitle')}>
          <div className="b2br-compare-head">
            <span className="b2br-compare-lead">
              <i className="ri-contrast-line" aria-hidden="true"></i>
              {t('acct.b2b.trendCompareLead')}
            </span>
            {/* The duel leaves the screen: four figures and one gap, as a small
                sheet that can be stapled to a workshop report. */}
            {compareMonths.length === 2 && (
              <button
                type="button"
                className={`b2br-compare-export${exported ? ' is-ok' : ''}`}
                title={t('acct.b2b.trendCompareExportHint')}
                aria-live="polite"
                onClick={() => {
                  const sides: CompareSide[] = compareMonths.map((month) => ({
                    key: month.key,
                    label: month.label,
                    closed: month.bucket.total,
                    documented: month.share,
                    cleared: month.bucket.cleared,
                    origin: month.originShare,
                    avgHours: month.avgHours,
                    /* The weight of the average travels with it: the sheet
                       must not show a delay without its sample. */
                    measurable: month.bucket.delayCount,
                  }));
                  const csv = buildCompareCsv({ sides, t, lang });
                  if (!csv) return;
                  downloadB2bCsv(compareCsvFilename(sides), csv);
                  setExported(true);
                  window.setTimeout(() => setExported(false), 2600);
                }}
              >
                <i
                  className={exported ? 'ri-check-line' : 'ri-download-2-line'}
                  aria-hidden="true"
                ></i>
                {exported
                  ? t('acct.b2b.csvDone')
                  : t('acct.b2b.trendCompareExport')}
              </button>
            )}
            {/* The duel is handed over the way a month and a fiche already are:
                the address carries both months, so a colleague opens the very
                comparison, already filled, without clicking two thin bars. */}
            {compareMonths.length === 2 && (
              <B2bShareLink
                href={b2bDuelHref(compareMonths.map((month) => month.key), lang)}
                label={t('acct.b2b.duelShare')}
                hint={t('acct.b2b.duelShareHint')
                  .replace('{a}', compareMonths[0].label)
                  .replace('{b}', compareMonths[1].label)}
                className="b2br-compare-export b2br-compare-share"
              />
            )}
            <button
              type="button"
              className="b2br-compare-clear"
              onClick={() => setCompare([])}
            >
              <i className="ri-close-line" aria-hidden="true"></i>
              {t('acct.b2b.trendCompareClear')}
            </button>
          </div>
          {/* A comparison that arrived by link says so: the reader must not
              wonder why these two months were already standing. */}
          {sharedDuelOn && compareMonths.length === 2 && (
            <p className="b2br-compare-shared">
              <i className="ri-link" aria-hidden="true"></i>
              {t('acct.b2b.duelLinkNote')
                .replace('{a}', compareMonths[0].label)
                .replace('{b}', compareMonths[1].label)}
            </p>
          )}
          <div className="b2br-compare-grid" data-count={compareMonths.length}>
            {compareMonths.map((month) => (
              <article key={month.key} className="b2br-compare-card">
                <header className="b2br-compare-top">
                  <strong>{month.label}</strong>
                  {/* Each card of the duel is a door: one click opens that month’s
                      closures in the inbox — the same gesture a shared comparison
                      expects from either of its two months. */}
                  {onOpenMonth && (
                    <button
                      type="button"
                      className="b2br-compare-open b2br-compare-open--month"
                      title={t('acct.b2b.trendCompareOpenMonthHint').replace(
                        '{month}',
                        month.label,
                      )}
                      onClick={() => onOpenMonth(month.key)}
                    >
                      <i className="ri-inbox-line" aria-hidden="true"></i>
                      {t('acct.b2b.trendCompareOpenMonth')}
                    </button>
                  )}
                  {onOpenClearedMonth && month.bucket.cleared > 0 && (
                    <button
                      type="button"
                      className="b2br-compare-open"
                      title={t('acct.b2b.trendFixOpen')
                        .replace('{n}', String(month.bucket.cleared))
                        .replace('{month}', month.label)}
                      onClick={() => onOpenClearedMonth(month.key)}
                    >
                      <i className="ri-eraser-line" aria-hidden="true"></i>
                      {t('acct.b2b.trendCompareOpen')}
                    </button>
                  )}
                  {/* Each card hands its month over the way a fiche or a whole duel
                      already does: one click copies an address that reopens that
                      month in the inbox, already filtered, on a colleague screen. */}
                  <B2bShareLink
                    href={b2bMonthHref(month.key, lang)}
                    label={t('acct.b2b.trendCompareShareMonth')}
                    hint={t('acct.b2b.trendCompareShareMonthHint').replace(
                      '{month}',
                      month.label,
                    )}
                    className="b2br-compare-open b2br-compare-share-card"
                  />
                </header>
                <dl className="b2br-compare-facts">
                  <div>
                    <dt>{t('acct.b2b.trendCompareClosed')}</dt>
                    <dd>{month.bucket.total}</dd>
                  </div>
                  <div>
                    <dt>{t('acct.b2b.trendCompareDocumented')}</dt>
                    <dd>{month.share === null ? '—' : `${month.share} %`}</dd>
                  </div>
                  <div>
                    <dt>{t('acct.b2b.trendCompareCleared')}</dt>
                    <dd>{month.bucket.cleared}</dd>
                  </div>
                  <div>
                    <dt>{t('acct.b2b.trendCompareOrigin')}</dt>
                    <dd>{month.originShare === null ? '—' : `${month.originShare} %`}</dd>
                  </div>
                  {/* How many closures the average rests on: « 3 j » over two
                      fiches is not « 3 j » over forty. The level of the month
                      is only worth reading with its weight. */}
                  <div title={t('acct.b2b.trendCompareAvgCountHint')}>
                    <dt>{t('acct.b2b.trendCompareAvgCount')}</dt>
                    <dd>{month.bucket.delayCount > 0 ? month.bucket.delayCount : '—'}</dd>
                  </div>
                  {/* The delay the two months are read on: a month can trade
                      volume for speed, and that trade must be visible. */}
                  <div title={t('acct.b2b.trendCompareAvgHint')}>
                    <dt>{t('acct.b2b.trendCompareAvg')}</dt>
                    <dd>{delayLabel(month.avgHours)}</dd>
                  </div>
                </dl>
              </article>
            ))}
            {compareMonths.length === 1 && (
              <p className="b2br-compare-hint">{t('acct.b2b.trendComparePick')}</p>
            )}
          </div>
          {compareDelta && (
            <p className="b2br-compare-delta">
              <i className="ri-arrow-left-right-line" aria-hidden="true"></i>
              <span>{t('acct.b2b.trendCompareDelta')}</span>
              <span>
                {t('acct.b2b.trendCompareCleared')}
                <b data-dir={compareDelta.corr === 0 ? 'flat' : compareDelta.corr > 0 ? 'up' : 'down'}>
                  {compareDelta.sign(compareDelta.corr)}
                </b>
              </span>
              <span>
                {t('acct.b2b.trendCompareClosed')}
                <b data-dir={compareDelta.total === 0 ? 'flat' : compareDelta.total > 0 ? 'up' : 'down'}>
                  {compareDelta.sign(compareDelta.total)}
                </b>
              </span>
              {/* The sample behind the two delays, read as a gap of its own: the
                  average only means something with its weight. */}
              <span title={t('acct.b2b.trendCompareAvgCountHint')}>
                {t('acct.b2b.trendCompareAvgCount')}
                <b
                  data-dir={
                    compareDelta.measurable === 0
                      ? 'flat'
                      : compareDelta.measurable > 0
                        ? 'up'
                        : 'down'
                  }
                >
                  {compareDelta.sign(compareDelta.measurable)}
                </b>
              </span>
              {compareDelta.docs !== null && (
                <span>
                  {t('acct.b2b.trendCompareDocumented')}
                  <b data-dir={compareDelta.docs === 0 ? 'flat' : compareDelta.docs > 0 ? 'up' : 'down'}>
                    {compareDelta.sign(compareDelta.docs)} {t('acct.b2b.tracePts')}
                  </b>
                </span>
              )}
              {/* A shorter delay is the good direction, so the arrow follows the
                  sign but the colour reads on the delay itself. */}
              {compareDelta.delay !== null && (
                <span title={t('acct.b2b.trendCompareAvgHint')}>
                  {t('acct.b2b.trendCompareAvg')}
                  <b data-dir={compareDelta.delay === 0 ? 'flat' : compareDelta.delay > 0 ? 'up' : 'down'}>
                    {compareDelta.delay === 0
                      ? '0 h'
                      : `${
                          compareDelta.delay > 0 ? '+' : '−'
                        }${nf.format(Math.round(Math.abs(compareDelta.delay) * 10) / 10)} h`}
                  </b>
                  {/* Past 48 h the gap also reads in days: « +72 h » asks for a
                      mental division nobody does while reading a report. */}
                  {Math.abs(compareDelta.delay) > 48 && (
                    <em className="b2br-compare-days">
                      {t('acct.b2b.trendCompareDelayDays').replace(
                        '{days}',
                        nf.format(
                          Math.round((Math.abs(compareDelta.delay) / 24) * 10) / 10,
                        ),
                      )}
                    </em>
                  )}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* The same twelve months, as a table this time: the exported sheet
          already carried these columns, but sorting them meant rebuilding the
          table in a spreadsheet. Here a header does it, on screen — and the
          order picked is remembered per account, like the duel and the period. */}
      <B2bYearTable
        rows={rows}
        objectif={objectif}
        objectifHistory={objectifHistory}
        onOpenMonth={onOpenMonth}
        memoryKey={memoryKey}
        waitGoalDays={waitGoalDays}
        sortRequest={yearSortRequest}
        onBackToStrip={backToStrip}
      />
    </div>
  );
}