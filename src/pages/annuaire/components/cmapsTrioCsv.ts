import { csvText, saveCsv } from '@/lib/csv';
import { nomRegion } from '@/lib/regionLabels';

/** Une région du podium, telle que la carte la lit. */
export type TrioRow = {
  wilaya: string;
  volume: number;
  refs: number;
  titles: number;
  total: number;
};

/** Un pays et ses trois régions les plus lourdes. */
export type TrioCountry = { code: string; nom: string; rows: TrioRow[] };

/**
 * Le détail par maison, mis à plat dans une feuille : une ligne par région, un
 * pays par ligne aussi — le pays reste dans sa colonne, si bien que plusieurs
 * fiches enregistrées se collent dans le même tableur et se comparent.
 */
export function buildTrioDetailCsv(
  countries: TrioCountry[],
  lang: string,
  t: (key: string) => string,
): string {
  const rows: string[][] = [[
    t('cmaps.csvCountry'),
    t('cmaps.csvRank'),
    t('cmaps.csvRegion'),
    t('cmaps.partBib'),
    t('cmaps.partLib'),
    t('cmaps.partEd'),
    t('cmaps.csvTotal'),
  ]];
  countries.forEach((country) => {
    country.rows.forEach((row, index) => {
      rows.push([
        country.nom,
        String(index + 1),
        nomRegion(row.wilaya, lang),
        row.volume > 0 ? String(row.volume) : '',
        row.refs > 0 ? String(row.refs) : '',
        row.titles > 0 ? String(row.titles) : '',
        String(row.total),
      ]);
    });
  });
  return csvText(rows);
}

/**
 * `PaperAtlas-trois-regions-DZ-2026-11-09.csv` quand la feuille ne tient qu'un
 * pays, `PaperAtlas-trois-regions-2026-11-09.csv` quand elle les prend tous :
 * deux fichiers ne portent jamais le même nom.
 */
export function saveTrioDetailCsv(csv: string, code = ''): void {
  const stamp = new Date().toISOString().slice(0, 10);
  const scope = code ? `-${code}` : '';
  saveCsv(`PaperAtlas-trois-regions${scope}-${stamp}.csv`, csv);
}