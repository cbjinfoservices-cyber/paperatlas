import { localeFor } from '@/i18n/localize';
import { deviseCode, nomDevise, nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { csvText, saveCsv } from '@/lib/csv';
import type { ListingRow, ListingStatut } from '@/lib/listings';

const STATUS_KEY: Record<ListingStatut, string> = {
  en_attente: 'acct.mine.pending',
  publie: 'acct.mine.published',
  refuse: 'acct.mine.refused',
};

type Args = {
  rows: ListingRow[];
  lang: string;
  t: (key: string) => string;
};

/**
 * The owner's own deposits, with the country of each one on its own column and
 * the money its budget is read in on the next one — the sheet can leave the
 * account area and still say where each deposit speaks from, and in which
 * currency. Semicolon separated with a UTF-8 BOM, like every other export.
 */
export function buildMineCsv({ rows, lang, t }: Args): string {
  const lines: string[][] = [];
  lines.push([
    'csv.num', 'csv.kind', 'csv.title', 'csv.org', 'csv.rubrique', 'dir.wilaya',
    'csv.pays', 'csv.commune', 'csv.budget', 'csv.devise', 'csv.statut', 'csv.posted', 'csv.desc',
  ].map(t));

  rows.forEach((row, index) => {
    lines.push([
      String(index + 1),
      row.kind === 'offre' ? t('dep.typeOffre') : t('dep.typeAnnonce'),
      row.titre,
      row.organisation,
      row.rubrique ?? '',
      nomRegion(row.wilaya, lang),
      nomPays(paysDe(row), lang),
      nomCommune(row.commune, lang),
      row.budget ?? '',
      `${nomDevise(paysDe(row), lang) || '—'} (${deviseCode(paysDe(row))})`,
      t(STATUS_KEY[row.statut]),
      row.created_at.slice(0, 10),
      row.description,
    ]);
  });

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  lines.push([]);
  lines.push([t('dirCsv.noteTitle')]);
  lines.push([t('dirCsv.results'), String(rows.length)]);
  lines.push([t('dirCsv.exportedOn'), dateLabel]);

  return csvText(lines);
}

/** `PaperAtlas-mes-depots-2026-11-05.csv` — the sheet names its own date. */
export function mineCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-mes-depots-${stamp}.csv`;
}

export function downloadMineCsv(csv: string) {
  saveCsv(mineCsvFilename(), csv);
}