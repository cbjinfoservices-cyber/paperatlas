import { localeFor } from '@/i18n/localize';
import { dayStamp } from '@/lib/dates';
import { csvText } from '@/lib/csv';
import { planById } from '@/pages/offres/components/plans';

/** One line of the journal, as the export reads it. */
export type JournalRow = {
  id: string;
  compte_id: string;
  nom: string | null;
  organisme: string | null;
  formule_avant: string | null;
  formule_apres: string;
  /** The billing rhythm retained at the move: « mois » or « annee ». */
  rythme: string | null;
  change_at: string;
};

type Args = {
  rows: JournalRow[];
  lang: string;
  t: (key: string) => string;
};

/**
 * The journal, handed over as a sheet: the workshop, the plan it left, the plan
 * it took, the billing rhythm it took it on, and the day of the move. Nothing
 * about the accounts themselves travels — only what the journal shows.
 */
export function buildPlanJournalCsv({ rows, lang, t }: Args): string {
  const lines: string[][] = [];
  lines.push([t('ofj.csvAtelier'), t('ofj.csvFrom'), t('ofj.csvTo'), t('ofj.csvRythme'), t('ofj.csvDate')]);

  rows.forEach((row) => {
    const from = planById(row.formule_avant);
    const to = planById(row.formule_apres);
    lines.push([
      row.organisme || row.nom || '—',
      from ? t(from.name) : t('ofj.first'),
      to ? t(to.name) : row.formule_apres,
      row.rythme === 'annee'
        ? t('ofj.rythmeAnnee')
        : row.rythme === 'mois'
          ? t('ofj.rythmeMois')
          : '',
      dayStamp(row.change_at, localeFor(lang)),
    ]);
  });

  return csvText(lines);
}

/** `PaperAtlas-journal-formules-2026-11-06.csv` — the sheet names its own day. */
export function planJournalCsvFilename(): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-journal-formules-${stamp}.csv`;
}