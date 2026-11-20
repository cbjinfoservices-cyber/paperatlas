import { localeFor } from '@/i18n/localize';
import { b2bMonthHref } from '@/lib/b2bLinks';

/**
 * One month of the duel, reduced to the four figures the comparison panel shows.
 * Kept as plain numbers so the exported sheet can never drift from the screen.
 */
export type CompareSide = {
  /** `2026-10` — the month key, also used to name the file. */
  key: string;
  label: string;
  /** Closures of that month. */
  closed: number;
  /** Documented share, in whole points — null when nothing closed. */
  documented: number | null;
  /** Catch-ups erased afterwards that month. */
  cleared: number;
  /** Share of documented closures whose reason came at the close itself. */
  origin: number | null;
  /** Average reply delay of that month, in hours — null when nothing closed. */
  avgHours: number | null;
  /** How many closures that average rests on: its weight, never assumed. */
  measurable: number;
};

function escapeCell(value: string) {
  const clean = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  return /[";\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
}

function signed(value: number) {
  if (value > 0) return `+${value}`;
  if (value < 0) return `−${Math.abs(value)}`;
  return '0';
}

/**
 * The two months picked on the correction bars, as a small standalone sheet:
 * four figures, one gap column, and the day it was taken out of the box. Small
 * enough to be stapled to a workshop report without a single pivot table.
 */
export function buildCompareCsv({
  sides,
  t,
  lang,
}: {
  sides: CompareSide[];
  t: (key: string) => string;
  lang: string;
}): string {
  const locale = localeFor(lang);
  const dayOnly = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });
  const [a, b] = sides;
  if (!a || !b) return '';

  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  /* The sheet travels: it must say in which language its labels were written.
     Intl names the language in the reader's own words; the bare code is the
     fallback when the browser does not know DisplayNames. */
  const langName = (() => {
    const Ctor = (Intl as unknown as {
      DisplayNames?: new (locales: string[], options: { type: string }) => {
        of: (code: string) => string | undefined;
      };
    }).DisplayNames;
    if (!Ctor) return lang.toUpperCase();
    try {
      return new Ctor([locale], { type: 'language' }).of(lang) || lang.toUpperCase();
    } catch {
      return lang.toUpperCase();
    }
  })();
  const pct = (value: number | null) => (value === null ? '—' : `${value} %`);
  /* Delays always leave the sheet in hours: a comparison is read on one unit. */
  const delay = (value: number | null) =>
    value === null ? '—' : `${nf.format(Math.round(value * 10) / 10)} h`;
  const delayGap = (from: number | null, to: number | null) => {
    if (from === null || to === null) return '';
    const diff = Math.round((to - from) * 10) / 10;
    if (diff === 0) return '0 h';
    return `${diff > 0 ? '+' : '−'}${nf.format(Math.abs(diff))} h`;
  };
  /* Points of share: only meaningful when both months have a share at all. */
  const points = (from: number | null, to: number | null) =>
    from === null || to === null ? '' : `${signed(to - from)} ${t('acct.b2b.tracePts')}`;

  const lines: string[][] = [
    [t('acct.b2b.csvCompareTitle')],
    [
      t('acct.b2b.csvCompareMetric'),
      a.label,
      b.label,
      t('acct.b2b.csvCompareGap'),
    ],
    [
      t('acct.b2b.trendCompareClosed'),
      String(a.closed),
      String(b.closed),
      signed(b.closed - a.closed),
    ],
    [
      t('acct.b2b.trendCompareDocumented'),
      pct(a.documented),
      pct(b.documented),
      points(a.documented, b.documented),
    ],
    [
      t('acct.b2b.trendCompareCleared'),
      String(a.cleared),
      String(b.cleared),
      signed(b.cleared - a.cleared),
    ],
    [
      t('acct.b2b.trendCompareOrigin'),
      pct(a.origin),
      pct(b.origin),
      points(a.origin, b.origin),
    ],
    /* The weight of the two averages, right before the averages themselves: a
       « 3 j » over two fiches is not a « 3 j » over forty. */
    [
      t('acct.b2b.trendCompareAvgCount'),
      String(a.measurable),
      String(b.measurable),
      signed(b.measurable - a.measurable),
    ],
    [
      t('acct.b2b.trendCompareAvg'),
      delay(a.avgHours),
      delay(b.avgHours),
      delayGap(a.avgHours, b.avgHours),
    ],
    [],
    [t('acct.b2b.csvCompareNote').replace('{date}', dayOnly.format(new Date()))],
    [],
    /* The two months as plain addresses, at the foot of the sheet: a tool that
       never evaluates spreadsheet formulas can still reopen each month exactly
       as the small dotted link of the comparison does. */
    [t('acct.b2b.csvCompareUrls')],
    [a.label, b2bMonthHref(a.key, lang)],
    [b.label, b2bMonthHref(b.key, lang)],
    [t('acct.b2b.csvCompareUrlsNote')],
    [],
    /* Last line of the sheet: the language its labels speak, so a colleague who
       opens the file in another language knows what he is reading. */
    [t('acct.b2b.csvCompareLang').replace('{lang}', langName)],
  ];

  return `\uFEFF${lines.map((line) => line.map(escapeCell).join(';')).join('\r\n')}`;
}

/** `PaperAtlas-comparaison-2026-09-2026-10.csv` — the duel names itself. */
export function compareCsvFilename(sides: CompareSide[]) {
  const keys = sides.map((side) => side.key).filter(Boolean);
  const suffix = keys.length > 0 ? `-${keys.join('-')}` : '';
  return `PaperAtlas-comparaison${suffix}.csv`;
}