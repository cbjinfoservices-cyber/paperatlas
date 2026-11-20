import { localeFor } from '@/i18n/localize';
import type { B2bStatut, DemandeB2b } from '@/lib/b2b';
import {
  B2B_MOTIF_KEYS,
  clearedTimes,
  daysSinceCorrection,
  isStaleCorrection,
} from '@/lib/b2b';
import { b2bRequestHref, devisGroupHref, devisNeverHref } from '@/lib/b2bLinks';
import { saveWorkbook, type XlsxSheet } from '@/lib/xlsx';
import { countMotifs, detectMotif } from './b2bMotifs';

/** The same thresholds as the inbox: 48 h for « late », a week for the urgency. */
const LATE_MS = 48 * 3600 * 1000;
const WEEK_MS = 7 * 24 * 3600 * 1000;

const STATUS_KEY: Record<B2bStatut, string> = {
  nouvelle: 'acct.b2b.statusNouvelle',
  vue: 'acct.b2b.statusVue',
  traitee: 'acct.b2b.statusTraitee',
};

function isLateRow(row: DemandeB2b) {
  if (row.statut === 'traitee') return false;
  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return false;
  if (Date.now() - created < LATE_MS) return false;
  if (!row.snooze_at) return true;
  return new Date(row.snooze_at).getTime() <= Date.now();
}

function isWeekLateRow(row: DemandeB2b) {
  if (!isLateRow(row)) return false;
  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created >= WEEK_MS;
}

/** The very same rule as the inbox badge: a closed file counts up to its close. */
function isNeverOpened(row: DemandeB2b) {
  if (row.statut !== 'nouvelle') return false;
  return Boolean(row.rappel_at) || isLateRow(row);
}

function waitDaysValue(row: DemandeB2b): number | null {
  const from = new Date(row.created_at).getTime();
  if (!Number.isFinite(from)) return null;
  const closedAt = row.statut === 'traitee' && row.traitee_at
    ? new Date(row.traitee_at).getTime()
    : NaN;
  const until = Number.isFinite(closedAt) && closedAt >= from ? closedAt : Date.now();
  return Math.max(0, Math.floor((until - from) / 86400000));
}

type Args = {
  /** The requests exactly as the box shows them, filter included. */
  rows: DemandeB2b[];
  lang: string;
  t: (key: string) => string;
  /** The workshop wait threshold, so the sheet reads the same clock as the strip. */
  waitGoalDays?: number;
  /**
   * Which states the summary counts. The picker narrows the second tab only —
   * tab 1 always carries every exported line.
   */
  statuts?: B2bStatut[];
  /**
   * The day the last grouped recap of the account's quotes left, as « Mon
   * compte » shows it. Written at the foot of the summary, so the workbook and
   * the list never name two different days.
   */
  lastBulkAt?: string | null;
  /**
   * How many quotes that very send carried, read from the same per-account
   * memory. Written beside the date, so the sheet never states a day without
   * saying how much it gathered.
   */
  lastBulkCount?: number;
  /**
   * How many quotes of the account no grouped recap has ever carried, read from
   * the same list memory. Written beside the day and its count, so the sheet
   * says at once what already left and what is still waiting to be gathered.
   * Null when the list has never been read here: nothing is invented.
   */
  bulkNever?: number | null;
  /**
   * The very files the last group send carried, each with the day it left —
   * written under the line of that send, so the summary can be re-read dossier
   * by dossier instead of only counted.
   */
  lastBulkRefs?: { reference: string; at: string }[];
};

/**
 * The inbox as a real workbook, with two tabs: « Demandes » holds one line per
 * request exactly as the list shows it, « Synthèse » counts those very lines by
 * state, by urgency and by closing reason. A sheet opened months later still
 * says which slice of the inbox it holds, and when it left.
 */
export function buildB2bWorkbook({ rows, lang, t, waitGoalDays = 7, statuts = [], lastBulkAt = null, lastBulkCount = 0, bulkNever = null, lastBulkRefs = [] }: Args): XlsxSheet[] {
  const locale = localeFor(lang);
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });
  const dayOnly = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });
  const today = new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());

  const when = (iso: string | null | undefined, withTime = false) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return (withTime ? stamp : dayOnly).format(date);
  };

  /** La nature du dossier, dite avec le mot de la langue du classeur. */
  const natureCell = (row: DemandeB2b) =>
    row.nature === 'marche' ? t('acct.b2b.natureMarche') : t('acct.b2b.natureTirage');

  const ficheStatut = (row: DemandeB2b) => {
    if (clearedTimes(row) > 2) return t('acct.b2b.csvFicheLabour');
    if (isStaleCorrection(row)) return t('acct.b2b.csvFichePeace');
    if (row.statut === 'traitee' && detectMotif(row.motif) !== null) {
      return t('acct.b2b.csvFicheDoc');
    }
    return '';
  };

  /* ---- tab 1: the lines themselves ---- */
  const demandes: (string | number)[][] = [];
  demandes.push([
    '#',
    'acct.b2b.csvRef',
    'acct.b2b.csvRefUrl',
    'acct.b2b.csvStatut',
    /* Un tirage ou un marché public : la colonne se lit avec l'état, et le
       classeur trié sépare les deux familles de dossiers. */
    'acct.b2b.csvNature',
    'acct.b2b.csvReceived',
    'acct.b2b.csvName',
    'acct.b2b.csvOrg',
    'acct.b2b.csvEmail',
    'acct.b2b.csvPhone',
    'acct.b2b.csvQty',
    'acct.b2b.csvDeadline',
    'acct.b2b.csvBudget',
    'acct.b2b.csvLate',
    'acct.b2b.csvWaitDays',
    'acct.b2b.csvWeek',
    'acct.b2b.csvReminder',
    'acct.b2b.csvTreated',
    'acct.b2b.csvMotif',
    'acct.b2b.csvCorrections',
    'acct.b2b.csvFicheStatut',
    'acct.b2b.csvMessage',
  ].map((key) => (key === '#' ? key : t(key))));

  rows.forEach((row, index) => {
    const days = waitDaysValue(row);
    demandes.push([
      index + 1,
      row.reference,
      b2bRequestHref(row.reference, lang),
      t(STATUS_KEY[row.statut]),
      natureCell(row),
      when(row.created_at, true),
      row.nom,
      row.organisme ?? '',
      row.email,
      row.telephone ?? '',
      row.quantite ?? '',
      row.delai ?? '',
      row.budget ?? '',
      isLateRow(row) ? t('acct.b2b.csvYes') : t('acct.b2b.csvNo'),
      /* Written as a real figure, so Excel can average it without cleaning. */
      days === null ? '' : days,
      isWeekLateRow(row) ? t('acct.b2b.csvYes') : t('acct.b2b.csvNo'),
      when(row.rappel_at),
      when(row.traitee_at),
      row.motif ?? '',
      clearedTimes(row) > 0 ? clearedTimes(row) : '',
      ficheStatut(row),
      row.message,
    ]);
  });

  /* An empty pick falls back on the three states, so a summary never claims a
     scope nobody chose; at least one state is always kept by the picker. */
  const etatsComptes: B2bStatut[] =
    statuts.length > 0 ? statuts : ['nouvelle', 'vue', 'traitee'];
  const syntheseRows = rows.filter((row) => etatsComptes.includes(row.statut));

  /* ---- tab 2: how those very lines split ---- */
  const byStatut: Record<B2bStatut, number> = { nouvelle: 0, vue: 0, traitee: 0 };
  let late = 0;
  let week = 0;
  let never = 0;
  syntheseRows.forEach((row) => {
    byStatut[row.statut] += 1;
    if (isLateRow(row)) late += 1;
    if (isWeekLateRow(row)) week += 1;
    if (isNeverOpened(row)) never += 1;
  });

  const share = (n: number) =>
    syntheseRows.length > 0
      ? `${Math.round((n / syntheseRows.length) * 100)} %`
      : '0 %';

  const synthese: (string | number)[][] = [];
  synthese.push([t('acct.b2b.xlsxSynthTitle')]);
  synthese.push([]);
  /* The scope is written at the top of the tab: a summary opened months later
     says which states it counted, instead of leaving the reader to guess. */
  synthese.push([
    t('acct.b2b.xlsxScopeStates'),
    etatsComptes.map((key) => t(STATUS_KEY[key])).join(' · '),
  ]);
  synthese.push([]);
  synthese.push([
    t('acct.b2b.xlsxSynthStatut'),
    t('acct.b2b.xlsxSynthCount'),
    t('acct.b2b.xlsxSynthShare'),
  ]);
  /* Only the states actually counted get a line: a zero on a state left out
     would read as « none of them », which is not what the picker said. */
  etatsComptes.forEach((key) => {
    synthese.push([t(STATUS_KEY[key]), byStatut[key], share(byStatut[key])]);
  });
  synthese.push([t('acct.b2b.xlsxSynthScopedTotal'), syntheseRows.length, share(syntheseRows.length)]);

  /* The urgency of the same slice: how many passed 48 h, a week, and how many
     the reminder has already been through without them being opened. */
  synthese.push([]);
  synthese.push([t('acct.b2b.xlsxSynthScope')]);
  synthese.push([t('acct.b2b.xlsxSynthLate'), late, share(late)]);
  synthese.push([
    `${t('acct.b2b.xlsxSynthWeek')} (${waitGoalDays} ${t('acct.b2b.csvDelayDayUnit')})`,
    week,
    share(week),
  ]);
  synthese.push([t('acct.b2b.xlsxSynthNever'), never, share(never)]);
  /* La nature des dossiers comptés, à côté de leur urgence : combien d'appels
     d'offres dans le périmètre choisi, et quelle part il représente. */
  const tenders = syntheseRows.filter((row) => row.nature === 'marche').length;
  if (tenders > 0) {
    synthese.push([t('acct.b2b.xlsxSynthMarch'), tenders, share(tenders)]);
  }

  /* Which way of closing the requests split: the same keys the inbox filters on. */
  const closed = syntheseRows.filter((row) => row.statut === 'traitee');
  if (closed.length > 0) {
    const counts = countMotifs(closed);
    const noMotif = closed.filter((row) => detectMotif(row.motif) === null).length;
    const lotCounts: Record<string, number> = {};
    closed.forEach((row) => {
      const key = detectMotif(row.motif);
      if (key && row.motif_lot_at) lotCounts[key] = (lotCounts[key] ?? 0) + 1;
    });
    const closedShare = (n: number) => `${Math.round((n / closed.length) * 100)} %`;

    synthese.push([]);
    synthese.push([t('acct.b2b.xlsxMotifTitle')]);
    synthese.push([
      t('acct.b2b.csvMotifLabel'),
      t('acct.b2b.csvMotifCount'),
      t('acct.b2b.csvMotifShare'),
      t('acct.b2b.csvMotifLotCol'),
    ]);
    B2B_MOTIF_KEYS.forEach((key) => {
      if (counts[key] === 0 && !lotCounts[key]) return;
      synthese.push([
        t(`acct.b2b.motif.${key}`),
        counts[key],
        closedShare(counts[key]),
        lotCounts[key] ?? '',
      ]);
    });
    if (noMotif > 0) {
      synthese.push([t('acct.b2b.motifNone'), noMotif, closedShare(noMotif), '']);
    }
    synthese.push([t('acct.b2b.xlsxMotifTotal'), closed.length, closedShare(closed.length), '']);

    /* How fast the workshop answered those closures: reception → close, on the
       very same clock as the « Days waited » column of the first tab. */
    const measurable = closed.filter((row) => {
      if (!row.traitee_at) return false;
      const from = new Date(row.created_at).getTime();
      const to = new Date(row.traitee_at).getTime();
      return Number.isFinite(from) && Number.isFinite(to) && to >= from;
    });
    const totalMs = measurable.reduce(
      (sum, row) => sum + (new Date(row.traitee_at as string).getTime() - new Date(row.created_at).getTime()),
      0,
    );
    const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

    synthese.push([]);
    synthese.push([t('acct.b2b.xlsxDelayTitle')]);
    synthese.push([
      t('acct.b2b.csvAvgCount'),
      t('acct.b2b.xlsxDelayMeasured'),
      t('acct.b2b.xlsxDelayHours'),
      t('acct.b2b.xlsxDelayDays'),
    ]);
    if (measurable.length === 0) {
      synthese.push([t('acct.b2b.xlsxDelayNone')]);
    } else {
      const hours = totalMs / 3600000 / measurable.length;
      synthese.push([
        t('acct.b2b.xlsxDelayAll'),
        measurable.length,
        nf.format(hours),
        nf.format(hours / 24),
      ]);
    }

    /* The heaviest files of the slice, named: the workshop hands those round
       first, and a count in a column never says which ones. */
    const rework = syntheseRows.filter((row) => clearedTimes(row) > 2);
    if (rework.length > 0) {
      synthese.push([]);
      synthese.push([t('acct.b2b.xlsxReworkTitle').replace('{n}', String(rework.length))]);
      synthese.push([
        t('acct.b2b.csvRef'),
        t('acct.b2b.csvCorrections'),
        t('acct.b2b.csvCorrectionsAge'),
        t('acct.b2b.csvMotif'),
      ]);
      rework
        .slice()
        .sort((a, b) => clearedTimes(b) - clearedTimes(a) || a.reference.localeCompare(b.reference))
        .forEach((row) => {
          const age = daysSinceCorrection(row);
          synthese.push([
            row.reference,
            clearedTimes(row),
            age === null ? '' : age,
            row.motif ?? '',
          ]);
        });
    }
  }

  synthese.push([]);
  synthese.push([t('dirCsv.noteTitle')]);
  synthese.push([t('dirCsv.exportedOn'), today]);
  /* The last grouped recap of the quotes, at the foot of the summary: the same
     day the account list badges carry, so a sheet read months later still says
     when the last group send went out. Nothing is written when none ever did. */
  const neverCell =
    bulkNever === null
      ? ''
      : t('acct.b2b.xlsxLastBulkNever').replace('{n}', String(bulkNever));
  /* The other face of that count, right on its line: the files the send did
     carry, with the address that reopens them already filtered. */
  const groupHref = lastBulkCount > 0 ? devisGroupHref(lang) : '';
  if (lastBulkAt) {
    synthese.push([
      t('acct.b2b.xlsxLastBulk'),
      when(lastBulkAt, true),
      lastBulkCount > 0
        ? t('acct.b2b.xlsxLastBulkN').replace('{n}', String(lastBulkCount))
        : '',
      /* The mirror of the line above: what that send left out. The two figures
         come from the same list, so they always describe the same account. */
      neverCell,
      groupHref,
    ]);
    /* The files of that very send, named one by one with the day each left: the
       summary closes on a list one can read back dossier by dossier, instead of
       a figure nobody can open. */
    const refsLues = lastBulkRefs.filter(
      (entry) =>
        typeof entry.reference === 'string' &&
        entry.reference.length > 0 &&
        Number.isFinite(new Date(entry.at).getTime()),
    );
    if (refsLues.length > 0) {
      synthese.push([]);
      synthese.push([
        t('acct.b2b.xlsxLastBulkRefsTitle').replace('{n}', String(refsLues.length)),
      ]);
      synthese.push([t('acct.b2b.csvRef'), t('acct.b2b.xlsxLastBulkRefDate')]);
      refsLues.forEach((entry) => {
        synthese.push([entry.reference, when(entry.at, true)]);
      });
    }
  } else if (neverCell) {
    /* No grouped recap has ever left: the date is honestly absent, but what has
       never been gathered is still worth saying. */
    synthese.push([t('acct.b2b.xlsxNoBulkYet'), '', '', neverCell]);
  }
  /* The same summary closes on the address of the files it has just counted:
     the quote list, already narrowed to the ones no group send has carried. A
     sheet read months later still leads there, without hunting the filters. */
  const neverHref = neverCell ? devisNeverHref(lang) : '';
  if (neverHref) {
    synthese.push([t('acct.b2b.xlsxLastBulkLink'), '', '', '', neverHref]);
  }
  synthese.push([t('acct.b2b.xlsxSynthTotal'), rows.length]);
  synthese.push([t('acct.b2b.xlsxNote')]);

  return [
    {
      name: t('acct.b2b.xlsxTabRows'),
      rows: demandes,
      widths: [5, 18, 34, 12, 16, 18, 20, 22, 28, 16, 18, 16, 16, 11, 12, 13, 16, 16, 18, 12, 14, 50],
    },
    {
      name: t('acct.b2b.xlsxTabSynth'),
      rows: synthese,
      widths: [42, 18, 22, 26, 58],
    },
  ];
}

/** `PaperAtlas-demandes-b2b-2026-11-06.xlsx` — named by the day it was drawn. */
export function b2bWorkbookFilename() {
  const stamp = [
    new Date().getFullYear(),
    `${new Date().getMonth() + 1}`.padStart(2, '0'),
    `${new Date().getDate()}`.padStart(2, '0'),
  ].join('-');
  return `PaperAtlas-demandes-b2b-${stamp}.xlsx`;
}

export function downloadB2bWorkbook(sheets: XlsxSheet[]) {
  saveWorkbook(b2bWorkbookFilename(), sheets);
}