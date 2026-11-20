import { dernierEtablissement, formuleDe, type Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import { localize, localeFor } from '@/i18n/localize';
import { nomDemo } from '@/lib/nomsDemo';
import { nomPays, paysArabes, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { decadeLabel, decadeOf, premierePublication } from '@/lib/generation';

type Args = {
  mode: 'entreprises' | 'auteurs';
  biz: Entreprise[];
  people: Auteur[];
  /** ISO country code the filter holds, "" for every country. */
  pays?: string;
  wilaya?: string;
  radius?: number | null;
  /** Opening decade the establishment list is narrowed to (« 1990–1999 »), "" for every decade. */
  openYear?: string;
  /** The order the listed profiles are read in, when the export knows it. */
  sortLabel?: string;
  lang: string;
  t: (key: string) => string;
};

function escapeCell(value: string) {
  const clean = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  return /[";\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
}

/**
 * Prospecting export of everything currently listed (not just the shortlist).
 * Semicolon separated with a UTF-8 BOM so a French Excel opens clean columns.
 */
export function buildDirectoryCsv({ mode, biz, people, pays = '', wilaya = '', radius = null, openYear = '', sortLabel = '', lang, t }: Args): string {
  const rows: string[][] = [];
  /* The genres the exported pens write, read once here so the footer block can
     repeat them without a second pass over the list. */
  let genreLine = '';

  if (mode === 'entreprises') {
    rows.push([
      'csv.num', 'csv.name', 'dir.trade', 'csv.formule', 'csv.division', 'csv.pays', 'csv.commune', 'pro.address',
      'csv.lat', 'csv.lng', 'pro.since', 'pro.staff', 'csv.etabs', 'csv.lastEtabs', 'pro.rating', 'pro.capacity',
      'pro.services', 'pro.certs', 'cf.email', 'pro.phone',
    ].map(t));
    biz.forEach((e, i) => {
      /* Only an Institutions structure gathers establishments: a single workshop
         leaves the cell empty rather than claiming a figure it does not have. */
      const etabs = formuleDe(e) === 'institutions' ? String(e.etablissements ?? 0) : '';
      /* The newest site of the park, read by its region: the column says where
         the structure last settled, not how many sites it holds. */
      const dernier = formuleDe(e) === 'institutions' ? dernierEtablissement(e) : null;
      rows.push([
        String(i + 1),
        nomDemo(e.name, lang),
        t(`trade.${e.trade}`),
        t(`formule.${formuleDe(e)}`),
        nomRegion(e.wilaya, lang),
        nomPays(paysDe(e), lang),
        nomCommune(e.commune, lang),
        e.address,
        e.lat.toFixed(5),
        e.lng.toFixed(5),
        String(e.since),
        String(e.staff),
        etabs,
        dernier ? nomRegion(dernier.wilaya, lang) : '',
        `${e.rating.toFixed(1)} (${e.reviews})`,
        localize(e.capacity, lang),
        e.services.map((s) => localize(s, lang)).join(' · '),
        e.certs.join(' · '),
        e.email,
        e.phone,
      ]);
    });
  } else {
    rows.push([
      'csv.num', 'csv.name', 'auth.genre', 'auth.genreCommon', 'csv.division', 'csv.pays', 'csv.commune', 'auth.since',
      'gen.pubLabel', 'auth.languages', 'auth.worksCount', 'auth.works', 'auth.avail',
      'auth.services', 'cf.email', 'pro.phone',
    ].map(t));
    /* How many pens of this very export carry each genre: the shared ground a
       colleague can read at a glance, row by row. */
    const genreCounts = new Map<string, number>();
    people.forEach((a) => {
      a.genres.forEach((g) => genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1));
    });
    /* The same deck against the selection, fullest first: the footer line says
       which ground these pens hold before a single row is read. */
    genreLine = Array.from(genreCounts.entries())
      .map(([g, n]) => ({ g, n }))
      .sort((x, y) => y.n - x.n || x.g.localeCompare(y.g, 'fr'))
      .map((row) => `${t(`genre.${row.g}`)} (${row.n})`)
      .join(' · ');
    people.forEach((a, i) => {
      const status = a.status === 'open' ? 'auth.statusOpen' : a.status === 'project' ? 'auth.statusProject' : 'auth.statusFull';
      const communs = a.genres
        .map((g) => ({ g, autres: (genreCounts.get(g) ?? 1) - 1 }))
        .filter((row) => row.autres > 0)
        .sort((x, y) => y.autres - x.autres);
      rows.push([
        String(i + 1),
        nomDemo(a.name, lang),
        a.genres.map((g) => t(`genre.${g}`)).join(' · '),
        communs.length
          ? communs.map((row) => `${t(`genre.${row.g}`)} (${row.autres})`).join(' · ')
          : t('auth.genreCommonNone'),
        nomRegion(a.wilaya, lang),
        nomPays(paysDe(a), lang),
        nomCommune(a.commune, lang),
        String(a.since),
        String(premierePublication(a)),
        a.languages.join(' · '),
        String(a.books.length),
        a.books.map((b) => localize(b.title, lang)).join(' · '),
        `${t(status)} · ${localize(a.availableFrom, lang)}`,
        a.services.map((s) => localize(s, lang)).join(' · '),
        a.email,
        a.phone,
      ]);
    });
  }

  /** Footer block: the filters that produced these rows, so a report can be read later. */
  const total = mode === 'entreprises' ? biz.length : people.length;
  /* The same « files · regions · countries » line the board carries above its
     cards: put first, it tells a colleague how wide the selection is before a
     single row is read. */
  const couverts = mode === 'entreprises' ? biz : people;
  const regionsCount = new Set(couverts.map((row) => row.wilaya).filter(Boolean)).size;
  const tallyRow = [
    `${total} ${t(mode === 'entreprises' ? 'gtally.files' : 'gtally.profiles')}`,
    `${regionsCount} ${t('gtally.regions')}`,
    `${t('gtally.ofCountries')} ${paysArabes.length} ${t('gtally.countries')}`,
  ].join(' · ');
  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  rows.push([]);
  rows.push([t('dirCsv.noteTitle')]);
  rows.push([t('pays.label'), pays ? nomPays(pays, lang) : t('pays.all')]);
  rows.push([t('csv.division'), wilaya ? nomRegion(wilaya, lang) : t('csv.allDivisions')]);
  rows.push([t('radius.label'), radius ? `${radius} km` : t('radius.all')]);
  if (openYear) {
    rows.push([t(mode === 'auteurs' ? 'gen.pubLabel' : 'dir.openLabel'), openYear]);
  } else {
    rows.push([t(mode === 'auteurs' ? 'gen.pubLabel' : 'dir.openLabel'), t('dir.allYears')]);
  }
  /* The order the rows are read in: a spreadsheet opened a week later still
     says how the list was sorted. */
  if (sortLabel) rows.push([t('dirCsv.sort'), sortLabel]);
  /* Authors only: how the selection splits across the literary genres. */
  if (genreLine) rows.push([t('dirCsv.genres'), genreLine]);
  rows.push([t('dirCsv.results'), String(total)]);
  rows.push([t('dirCsv.exportedOn'), dateLabel]);

  return `\uFEFF${[[tallyRow], [], ...rows].map((row) => row.map(escapeCell).join(';')).join('\r\n')}`;
}

type GenreMatrixArgs = {
  people: Auteur[];
  /** Which table this file carries: the regions, or the countries. */
  dimension: 'region' | 'pays';
  pays?: string;
  wilaya?: string;
  /** The order the author list is read in, repeated in the footer block. */
  sortLabel?: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * The companion exports of the author list: one genre per row, and one column
 * per region in the first file, per country in the second. Two separate files,
 * so a colleague opens the split he needs without deleting a table first.
 */
export function buildGenreMatrixCsv({ people, dimension, pays = '', wilaya = '', sortLabel = '', lang, t }: GenreMatrixArgs): string {
  const regions = Array.from(new Set(people.map((a) => a.wilaya).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b, 'fr'));
  const countries = Array.from(new Set(people.map((a) => paysDe(a))))
    .sort((a, b) => nomPays(a, lang).localeCompare(nomPays(b, lang), 'fr'));
  const byCountry = dimension === 'pays';
  const cols = byCountry ? countries : regions;
  const colOf = byCountry
    ? (a: Auteur) => paysDe(a)
    : (a: Auteur) => a.wilaya;

  /** One cross table: genres in rows, the chosen dimension split across the top. */
  const byGenre = new Map<string, Map<string, number>>();
  people.forEach((a) => {
    const col = colOf(a);
    a.genres.forEach((g) => {
      const line = byGenre.get(g) ?? new Map<string, number>();
      line.set(col, (line.get(col) ?? 0) + 1);
      byGenre.set(g, line);
    });
  });

  const rows: string[][] = [];
  rows.push([t(byCountry ? 'genresCsv.byCountry' : 'genresCsv.byRegion')]);
  rows.push([
    t('csv.genre'),
    t('gtally.profiles'),
    ...cols.map((col) => (byCountry ? nomPays(col, lang) : nomRegion(col, lang))),
  ]);
  Array.from(byGenre.entries())
    .map(([g, line]) => ({
      g,
      line,
      total: Array.from(line.values()).reduce((sum, n) => sum + n, 0),
    }))
    .sort((x, y) => y.total - x.total || x.g.localeCompare(y.g, 'fr'))
    .forEach(({ g, line, total }) => {
      rows.push([t(`genre.${g}`), String(total), ...cols.map((col) => String(line.get(col) ?? 0))]);
    });

  const genreCount = new Set(people.flatMap((a) => a.genres)).size;
  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  rows.push([]);
  rows.push([t('dirCsv.noteTitle')]);
  rows.push([t('pays.label'), pays ? nomPays(pays, lang) : t('pays.all')]);
  rows.push([t('csv.division'), wilaya ? nomRegion(wilaya, lang) : t('csv.allDivisions')]);
  if (sortLabel) rows.push([t('dirCsv.sort'), sortLabel]);
  rows.push([t('dirCsv.genres'), String(genreCount)]);
  rows.push([t('genresCsv.columns'), String(cols.length)]);
  rows.push([t('dirCsv.results'), String(people.length)]);
  rows.push([t('dirCsv.exportedOn'), dateLabel]);

  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(';')).join('\r\n')}`;
}

type GenerationMatrixArgs = {
  mode: 'entreprises' | 'auteurs';
  biz: Entreprise[];
  people: Auteur[];
  pays?: string;
  wilaya?: string;
  /** The generation currently filtered (« 1990–1999 »), repeated in the footer. */
  openYear?: string;
  sortLabel?: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * The generations of the selection, one decade per row and one column per
 * country: the same crossing as the genre table, but read on the decade a
 * workshop opened (or a pen first went to print), so an era can be compared
 * country by country in a single sheet.
 */
export function buildGenerationMatrixCsv({ mode, biz, people, pays = '', wilaya = '', openYear = '', sortLabel = '', lang, t }: GenerationMatrixArgs): string {
  const listed: (Entreprise | Auteur)[] = mode === 'entreprises' ? biz : people;
  const decadeOfRow = (row: Entreprise | Auteur) => decadeOf(
    mode === 'entreprises' ? (row as Entreprise).since : premierePublication(row as Auteur),
  );

  const countries = Array.from(new Set(listed.map((row) => paysDe(row))))
    .sort((a, b) => nomPays(a, lang).localeCompare(nomPays(b, lang), 'fr'));

  const byDecade = new Map<number, Map<string, number>>();
  listed.forEach((row) => {
    const decade = decadeOfRow(row);
    const line = byDecade.get(decade) ?? new Map<string, number>();
    const code = paysDe(row);
    line.set(code, (line.get(code) ?? 0) + 1);
    byDecade.set(decade, line);
  });

  const rows: string[][] = [];
  rows.push([t('genCsv.title')]);
  rows.push([
    t('genCsv.decade'),
    t(mode === 'entreprises' ? 'gtally.files' : 'gtally.profiles'),
    ...countries.map((code) => nomPays(code, lang)),
  ]);
  Array.from(byDecade.entries())
    .sort((a, b) => a[0] - b[0])
    .forEach(([decade, line]) => {
      const total = Array.from(line.values()).reduce((sum, n) => sum + n, 0);
      rows.push([
        decadeLabel(decade),
        String(total),
        ...countries.map((code) => String(line.get(code) ?? 0)),
      ]);
    });

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  rows.push([]);
  rows.push([t('dirCsv.noteTitle')]);
  rows.push([t('pays.label'), pays ? nomPays(pays, lang) : t('pays.all')]);
  rows.push([t('csv.division'), wilaya ? nomRegion(wilaya, lang) : t('csv.allDivisions')]);
  rows.push([t('genCsv.decade'), openYear || t('dir.allYears')]);
  if (sortLabel) rows.push([t('dirCsv.sort'), sortLabel]);
  rows.push([t('genresCsv.columns'), String(countries.length)]);
  rows.push([t('dirCsv.results'), String(listed.length)]);
  rows.push([t('dirCsv.exportedOn'), dateLabel]);

  return `\uFEFF${rows.map((row) => row.map(escapeCell).join(';')).join('\r\n')}`;
}

/** Push the built CSV to the browser as a download. */
export function downloadCsvFile(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}