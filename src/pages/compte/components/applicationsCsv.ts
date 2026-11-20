import { localeFor } from '@/i18n/localize';
import { nomPays, paysDe } from '@/lib/pays';
import { csvText, saveCsv } from '@/lib/csv';
import type { Candidature, CandidatureStatut } from '@/lib/messaging';

const STATUS_KEY: Record<CandidatureStatut, string> = {
  envoyee: 'acct.appl.statusEnvoyee',
  vue: 'acct.appl.statusVue',
  retenue: 'acct.appl.statusRetenue',
  refusee: 'acct.appl.statusRefusee',
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whole days between the sending and today, so a dossier that has been sitting
 * in the pile stands out when the sheet is read in a spreadsheet.
 */
function daysSince(iso: string): string {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return '';
  return String(Math.max(0, Math.floor((Date.now() - at) / DAY_MS)));
}

type Args = {
  /** Exactly the pile on screen: country, search and « to handle » already applied. */
  rows: Candidature[];
  lang: string;
  t: (key: string) => string;
  /** What was narrowing the pile, written at the foot of the sheet. */
  filters: { query: string; pays: string };
};

/**
 * The applications an employer received, one line per candidate, with the
 * country of each applicant on its own column. The sheet says which country and
 * which search produced it, so a closed period can be read back later.
 * Semicolon separated with a UTF-8 BOM, like every other export.
 */
export function buildApplicationsCsv({ rows, lang, t, filters }: Args): string {
  const lines: string[][] = [];
  lines.push([
    'csv.num', 'csv.name', 'csv.email', 'csv.phone', 'csv.pays',
    'csv.ref', 'csv.title', 'csv.statut', 'csv.posted', 'csv.sinceSent',
    'csv.ackAt', 'csv.decisionAt', 'csv.note',
  ].map(t));

  rows.forEach((row, index) => {
    lines.push([
      String(index + 1),
      (row.candidat_nom || '').trim(),
      (row.candidat_email || '').trim(),
      (row.telephone || '').trim(),
      nomPays(paysDe({ pays: row.candidat_pays }), lang),
      row.offre_id,
      row.offre_titre,
      t(STATUS_KEY[row.statut]),
      row.created_at.slice(0, 10),
      daysSince(row.created_at),
      /* Les deux jours où quelque chose est réellement parti au candidat.
         Une case vide dit qu'aucun envoi n'a eu lieu — jamais une date
         inventée à partir de la décision. */
      row.accuse_at ? row.accuse_at.slice(0, 10) : '',
      row.decision_envoyee_at ? row.decision_envoyee_at.slice(0, 10) : '',
      row.note_employeur ?? '',
    ]);
  });

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  const needle = filters.query.trim();

  lines.push([]);
  lines.push([t('dirCsv.noteTitle')]);
  lines.push([t('dirCsv.results'), String(rows.length)]);
  if (filters.pays) lines.push([t('csv.pays'), nomPays(filters.pays, lang)]);
  if (needle) lines.push([t('csv.search'), needle]);
  lines.push([t('dirCsv.exportedOn'), dateLabel]);

  return csvText(lines);
}

/** `PaperAtlas-candidatures-recues-2026-11-05.csv` — the sheet names its own date. */
export function applicationsCsvFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `PaperAtlas-candidatures-recues-${stamp}.csv`;
}

export function downloadApplicationsCsv(csv: string) {
  saveCsv(applicationsCsvFilename(), csv);
}