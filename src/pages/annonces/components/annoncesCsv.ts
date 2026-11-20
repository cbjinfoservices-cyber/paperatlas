import { localize, localeFor } from '@/i18n/localize';
import { nomDemo } from '@/lib/nomsDemo';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { prixDevise } from '@/lib/price';
import { csvText, saveCsv } from '@/lib/csv';
import type { Annonce } from '@/mocks/annonces';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';

type Args = {
  ads: Annonce[];
  /** ISO country code the filter holds, "" for every country. */
  pays?: string;
  wilaya?: string;
  lang: string;
  t: (key: string) => string;
};

/**
 * The ads board as filtered, with the country of each ad written in its own
 * column, so a sheet sent to a colleague abroad reads on its own.
 */
export function buildAnnoncesCsv({ ads, pays = '', wilaya = '', lang, t }: Args): string {
  const rows: string[][] = [];
  rows.push([
    'csv.num', 'csv.title', 'csv.rubrique', 'csv.org', 'dir.wilaya', 'csv.pays',
    'csv.commune', 'csv.budget', 'csv.posted', 'cf.email', 'pro.phone',
  ].map(t));

  ads.forEach((ad, index) => {
    rows.push([
      String(index + 1),
      localize(ad.title, lang),
      t(CAT_KEY[ad.cat]),
      nomDemo(ad.seller, lang),
      nomRegion(ad.wilaya, lang),
      nomPays(paysDe(ad), lang),
      nomCommune(ad.commune, lang),
      prixDevise(ad.price, ad.pays),
      ad.posted,
      ad.contact,
      ad.phone,
    ]);
  });

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  rows.push([]);
  rows.push([t('dirCsv.noteTitle')]);
  rows.push([t('pays.label'), pays ? nomPays(pays, lang) : t('pays.all')]);
  rows.push([t('dir.wilaya'), wilaya || t('dir.allW')]);
  rows.push([t('dirCsv.results'), String(ads.length)]);
  rows.push([t('dirCsv.exportedOn'), dateLabel]);

  return csvText(rows);
}

/** `PaperAtlas-annonces-2026-11-05.csv` — the sheet names its own date. */
export function annoncesCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-annonces-${stamp}.csv`;
}

export function downloadAnnoncesCsv(csv: string) {
  saveCsv(annoncesCsvFilename(), csv);
}