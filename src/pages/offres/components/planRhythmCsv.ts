import { localeFor } from '@/i18n/localize';
import { csvText } from '@/lib/csv';

/** One column of the six-month chart, as the view hands it over. */
export type RhythmMonth = {
  /** First day of the month, ISO. */
  mois: string;
  /** How many workshops climbed to Premium that month. */
  montee: number;
};

/** `mars 2026` — the month written out, so a sheet read in a year still says
 *  which month each row carries. */
export function rhythmMonthLabel(iso: string, lang: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(localeFor(lang), { month: 'long', year: 'numeric' }).format(date);
}

type Args = {
  months: RhythmMonth[];
  lang: string;
  t: (key: string) => string;
};

/**
 * The chart, handed over as a sheet: one row per month, the count beside it.
 * Only aggregate numbers travel — the export never names a workshop, exactly
 * like the view it reads.
 */
export function buildRhythmCsv({ months, lang, t }: Args): string {
  const rows: string[][] = [[t('ofr.csvMonth'), t('ofr.csvCount')]];
  months.forEach((point) => {
    rows.push([rhythmMonthLabel(point.mois, lang), String(point.montee)]);
  });
  return csvText(rows);
}

/** `PaperAtlas-rythme-premium-2026-11-06.csv` — the sheet names its own day. */
export function rhythmCsvFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-rythme-premium-${stamp}.csv`;
}