import type { ListKind } from '@/hooks/useShortlist';
import type { Entreprise } from '@/mocks/entreprises';
import type { Auteur } from '@/mocks/auteurs';
import { localize, localeFor } from '@/i18n/localize';
import { nomDemo } from '@/lib/nomsDemo';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';

type Args = {
  kind: ListKind;
  biz: Entreprise[];
  people: Auteur[];
  lang: string;
  reference: string;
  t: (key: string) => string;
};

/**
 * Accounting-friendly export of the comparison: one row per workshop (or per
 * author), semicolon separated with a UTF-8 BOM so Excel opens it correctly.
 */
export function buildComparisonCsv({ kind, biz, people, lang, reference, t }: Args): string {
  const rows: string[][] = [];
  const count = kind === 'entreprises' ? biz.length : people.length;
  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date());

  if (kind === 'entreprises') {
    rows.push([
      'csv.num', 'csv.ref', 'csv.name', 'dir.trade', 'csv.commune', 'csv.division', 'csv.pays',
      'pro.since', 'pro.staff', 'pro.rating', 'pro.capacity', 'pro.services',
      'pro.certs', 'pro.address', 'cf.email', 'pro.phone',
    ].map(t));
    biz.forEach((e, i) => {
      rows.push([
        String(i + 1),
        reference,
        nomDemo(e.name, lang),
        t(`trade.${e.trade}`),
        nomCommune(e.commune, lang),
        nomRegion(e.wilaya, lang),
        nomPays(paysDe(e), lang),
        String(e.since),
        String(e.staff),
        `${e.rating.toFixed(1)} (${e.reviews})`,
        localize(e.capacity, lang),
        e.services.map((s) => localize(s, lang)).join(' · '),
        e.certs.join(' · '),
        e.address,
        e.email,
        e.phone,
      ]);
    });
  } else {
    rows.push([
      'csv.num', 'csv.ref', 'csv.name', 'auth.genre', 'csv.commune', 'csv.division', 'csv.pays',
      'auth.since', 'auth.languages', 'auth.works', 'auth.avail', 'auth.services',
      'cf.email', 'pro.phone',
    ].map(t));
    people.forEach((a, i) => {
      const status = a.status === 'open' ? 'auth.statusOpen' : a.status === 'project' ? 'auth.statusProject' : 'auth.statusFull';
      rows.push([
        String(i + 1),
        reference,
        nomDemo(a.name, lang),
        a.genres.map((g) => t(`genre.${g}`)).join(' · '),
        nomCommune(a.commune, lang),
        nomRegion(a.wilaya, lang),
        nomPays(paysDe(a), lang),
        String(a.since),
        a.languages.join(' · '),
        a.books.map((b) => localize(b.title, lang)).join(' · '),
        `${t(status)} · ${localize(a.availableFrom, lang)}`,
        a.services.map((s) => localize(s, lang)).join(' · '),
        a.email,
        a.phone,
      ]);
    });
  }

  /** Dossier stamp first, so accounting can match the sheet to the PDF. */
  rows.unshift(
    [t('csv.dossier'), reference || '—'],
    [t('csv.date'), dateLabel],
    [t('csv.count'), String(count)],
    [],
  );

  const escape = (value: string) => {
    const clean = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    return /[";\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
  };

  return `\uFEFF${rows.map((row) => row.map(escape).join(';')).join('\r\n')}`;
}

/** Push the built CSV to the browser as a download. */
export function downloadCsv(filename: string, csv: string) {
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