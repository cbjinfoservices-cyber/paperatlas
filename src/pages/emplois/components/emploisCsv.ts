import { localize, localeFor } from '@/i18n/localize';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { prixDevise } from '@/lib/price';
import { csvText, saveCsv } from '@/lib/csv';
import type { Emploi } from '@/mocks/emplois';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';

type Args = {
  jobs: Emploi[];
  /** ISO country code the filter holds, "" for every country. */
  pays?: string;
  wilaya?: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * The offers board, exactly as filtered, with the country of each offer on its
 * own column — a colleague abroad reads the sheet without guessing the country.
 */
export function buildEmploisCsv({ jobs, pays = '', wilaya = '', lang, t }: Args): string {
  const rows: string[][] = [];
  rows.push([
    'csv.num', 'csv.title', 'csv.org', 'csv.kind', 'dir.wilaya', 'csv.pays',
    'csv.commune', 'csv.budget', 'csv.posted', 'cf.email',
  ].map(t));

  jobs.forEach((job, index) => {
    rows.push([
      String(index + 1),
      localize(job.title, lang),
      job.company,
      t(CONTRACT_KEY[job.contract]),
      nomRegion(job.wilaya, lang),
      nomPays(paysDe(job), lang),
      nomCommune(job.commune, lang),
      prixDevise(job.salary, job.pays),
      job.posted,
      job.contact,
    ]);
  });

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  rows.push([]);
  rows.push([t('dirCsv.noteTitle')]);
  rows.push([t('pays.label'), pays ? nomPays(pays, lang) : t('pays.all')]);
  rows.push([t('dir.wilaya'), wilaya || t('dir.allW')]);
  rows.push([t('dirCsv.results'), String(jobs.length)]);
  rows.push([t('dirCsv.exportedOn'), dateLabel]);

  return csvText(rows);
}

/** `PaperAtlas-offres-2026-11-05.csv` — the sheet names its own date. */
export function emploisCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-offres-${stamp}.csv`;
}

export function downloadEmploisCsv(csv: string) {
  saveCsv(emploisCsvFilename(), csv);
}