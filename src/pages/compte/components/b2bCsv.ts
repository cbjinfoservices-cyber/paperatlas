import type { B2bMotifKey, B2bObjectifEntry, B2bStatut, DemandeB2b } from '@/lib/b2b';
import {
  B2B_MOTIF_KEYS,
  clearedTimes,
  daysSinceCorrection,
  isStaleCorrection,
} from '@/lib/b2b';
import { localeFor } from '@/i18n/localize';
import { b2bRequestHref } from '@/lib/b2bLinks';
import { countMotifs, detectMotif } from './b2bMotifs';
import { goalForMonth } from './b2bObjectif';

/** Same threshold as the reminder sweep and the inbox badge. */
const LATE_MS = 48 * 3600 * 1000;
/** The second threshold: past a whole week, a wait has changed nature. */
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

/**
 * The same late rows, one threshold further: what has been waiting over a week.
 * Computed on the very stamp as the late column, so a row can never be « late »
 * without being at least as old as the week it is read against.
 */
function isWeekLateRow(row: DemandeB2b) {
  if (!isLateRow(row)) return false;
  const created = new Date(row.created_at).getTime();
  if (!Number.isFinite(created)) return false;
  return Date.now() - created >= WEEK_MS;
}

/**
 * The reminder's misses: still « nouvelle » although the reminder has already
 * been through their wait — a reminder was sent, or the wait is past 48 h.
 * Shared by the yearly sheet and the short never-opened one, so the two can
 * never list two different sets of requests.
 */
export function isNeverOpened(row: DemandeB2b) {
  if (row.statut !== 'nouvelle') return false;
  return Boolean(row.rappel_at) || isLateRow(row);
}

function escapeCell(value: string) {
  const clean = value.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  return /[";\n]/.test(clean) ? `"${clean.replace(/"/g, '""')}"` : clean;
}

/**
 * The reference of a fiche, made clickable.
 *
 * A spreadsheet reads a HYPERLINK formula out of a CSV cell, so the sheet opens
 * the very screen the dotted link of the list opens: the inbox whole, with that
 * request ringed. The reference stays the visible text — the sheet is still read
 * by eye, sorted and copied, it simply stops being a dead number.
 */
function referenceCell(reference: string, lang: string) {
  const href = b2bRequestHref(reference, lang);
  if (!href) return reference;
  return `=HYPERLINK("${href}";"${reference.replace(/"/g, '""')}")`;
}

/**
 * Whole days waited, on the very same clock as the row badge and the inbox wait
 * order. A request still open is counted up to today; a handled one is counted
 * up to its closure, so the column stays a fact instead of shrinking overnight.
 * Empty when the arrival stamp is unreadable — a guessed zero would read as
 * « answered at once ».
 */
function waitDaysValue(row: DemandeB2b): number | null {
  const from = new Date(row.created_at).getTime();
  if (!Number.isFinite(from)) return null;
  const closedAt = row.statut === 'traitee' && row.traitee_at
    ? new Date(row.traitee_at).getTime()
    : NaN;
  const until = Number.isFinite(closedAt) && closedAt >= from ? closedAt : Date.now();
  return Math.max(0, Math.floor((until - from) / 86400000));
}

function waitDaysCell(row: DemandeB2b) {
  const value = waitDaysValue(row);
  return value === null ? '' : String(value);
}

type Args = {
  rows: DemandeB2b[];
  lang: string;
  t: (key: string) => string;
  /** The workshop target for documented closures — null when it set none. */
  objectif: number | null;
  /** Every change of that target: each month is read against its own. */
  objectifHistory: B2bObjectifEntry[];
  /**
   * The workshop wait threshold, in whole days. The same number the strip and
   * the twelve-month table read, so the sheet cannot flag a month the site
   * shows as calm — or the other way round.
   */
  waitGoalDays?: number;
};

/**
 * Commercial follow-up export of the inbox, exactly as it is filtered on screen.
 * Semicolon separated with a UTF-8 BOM so a French Excel opens clean columns.
 */
export function buildB2bCsv({
  rows,
  lang,
  t,
  objectif,
  objectifHistory,
  waitGoalDays = 7,
}: Args): string {
  const locale = localeFor(lang);
  const stamp = new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' });
  const dayOnly = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });

  const when = (iso: string | null | undefined, withTime: boolean) => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return (withTime ? stamp : dayOnly).format(date);
  };

  /* The life of a closing reason, in the order it actually happened: given at
     the close, caught up in bulk, then maybe erased. One cell per request, so a
     trace rebuilt after the fact is never read as a genuine one. */
  const motifLife = (row: DemandeB2b) => {
    if (row.statut !== 'traitee') return '';
    const parts: string[] = [];
    if (detectMotif(row.motif) !== null) {
      parts.push(
        row.motif_lot_at
          ? t('acct.b2b.csvLifeLot').replace('{date}', when(row.motif_lot_at, false))
          : t('acct.b2b.csvLifeGiven'),
      );
    } else if (row.motif_lot_clear_at) {
      /* The catch-up existed before being taken back: the order is kept. */
      parts.push(t('acct.b2b.csvLifeLotGone'));
    }
    if (row.motif_lot_clear_at) {
      parts.push(
        t('acct.b2b.csvLifeCleared').replace('{date}', when(row.motif_lot_clear_at, false)),
      );
    }
    return parts.length > 0 ? parts.join(' \u2192 ') : t('acct.b2b.csvLifeNone');
  };

  const header = [
    'acct.b2b.csvRef',
    /* The very same address as the clickable reference, written out: a tool
       that opens the file without evaluating formulas (an importer, a script,
       a plain text reader) must still be able to follow the link. */
    'acct.b2b.csvRefUrl',
    'acct.b2b.csvStatut',
    /* Ce que le dossier est : un tirage ou un marché public. La colonne est
       placée juste après l'état, lue avec lui — un appel d'offres ne se
       répond pas avec le vocabulaire d'une commande. */
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
    /* How long the request really waited, in whole days: the figure behind the
       late column, the week column and the inbox wait order. Readable and
       sortable outside the site, on the very clock the list uses. */
    'acct.b2b.csvWaitDays',
    'acct.b2b.csvWeek',
    'acct.b2b.csvReminder',
    'acct.b2b.csvSnooze',
    'acct.b2b.csvTreated',
    'acct.b2b.csvMotif',
    'acct.b2b.csvMotifLot',
    'acct.b2b.csvMotifLife',
    'acct.b2b.csvCorrections',
    'acct.b2b.csvCorrectionsAge',
    'acct.b2b.csvFicheStatut',
    'acct.b2b.csvMessage',
  ].map(t);

  const lines: string[][] = [header];

  /** La nature du dossier, dite avec le mot de la langue du fichier. */
  const natureCell = (row: DemandeB2b) =>
    row.nature === 'marche' ? t('acct.b2b.natureMarche') : t('acct.b2b.natureTirage');

  const ficheStatut = (row: DemandeB2b) => {
    /* The hardest signal wins: a ploughed fiche stays ploughed even when nobody
       has touched it for a while — that is exactly what makes it ploughed. */
    if (clearedTimes(row) > 2) return t('acct.b2b.csvFicheLabour');
    if (isStaleCorrection(row)) return t('acct.b2b.csvFichePeace');
    if (row.statut === 'traitee' && detectMotif(row.motif) !== null) {
      return t('acct.b2b.csvFicheDoc');
    }
    return '';
  };

  rows.forEach((row) => {
    lines.push([
      referenceCell(row.reference, lang),
      /* Right after the door, the address it opens, in plain text. */
      b2bRequestHref(row.reference, lang),
      t(STATUS_KEY[row.statut]),
      /* Rien n'est deviné : une ligne d'avant la colonne se lit « tirage »,
         parce que c'est ce que le guichet d'alors déposait. */
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
      /* The depth behind the two thresholds, in days: the same figure the inbox
         ranks by, so the order of the list survives in the spreadsheet. */
      waitDaysCell(row),
      /* The urgency, kept in the sheet too: outside the site, the repérage of a
         week-old wait must survive without anyone rebuilding the formula. */
      isWeekLateRow(row) ? t('acct.b2b.csvYes') : t('acct.b2b.csvNo'),
      when(row.rappel_at, false),
      when(row.snooze_at, false),
      when(row.traitee_at, false),
      row.motif ?? '',
      /* A reason caught up in bulk was not given at the close: the sheet says
         when, so a rattrapage is never read as a genuine trace. */
      when(row.motif_lot_at, false),
      /* The whole story of that reason, for the rows that carry one. */
      motifLife(row),
      /* How many times the fiche was taken back: a zero stays empty, so a filled
         cell always means a real correction — and the column sorts. */
      clearedTimes(row) > 0 ? String(clearedTimes(row)) : '',
      /* How long the fiche has been left in peace since its last correction:
         a ploughed fiche nobody touched for months is the one to revisit. */
      daysSinceCorrection(row) === null ? '' : String(daysSinceCorrection(row)),
      /* The three families of a fiche, in one cell, so a single sort puts them
         apart: ploughed (3+ corrections), left in peace (over 30 days), or
         documented. A row that is none of them stays empty rather than guessed. */
      ficheStatut(row),
      row.message,
    ]);
  });

  /* Commercial follow-up: how fast the workshop answers, month after month.
     Grouped on the handling date — that is when the reply actually happened. */
  type MonthBucket = { key: string; label: string; totalMs: number; count: number };
  const buckets = new Map<string, MonthBucket>();
  const monthName = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });

  rows.forEach((row) => {
    if (row.statut !== 'traitee' || !row.traitee_at) return;
    const from = new Date(row.created_at).getTime();
    const to = new Date(row.traitee_at).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return;
    const date = new Date(to);
    const key = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
    const raw = monthName.format(date);
    const bucket = buckets.get(key) ?? {
      key,
      label: raw.charAt(0).toUpperCase() + raw.slice(1),
      totalMs: 0,
      count: 0,
    };
    bucket.totalMs += to - from;
    bucket.count += 1;
    buckets.set(key, bucket);
  });

  if (buckets.size > 0) {
    const ordered = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
    const round = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const avgRow = (label: string, bucket: { totalMs: number; count: number }) => {
      const hours = bucket.totalMs / 3600000 / bucket.count;
      return [label, String(bucket.count), round.format(hours), round.format(hours / 24)];
    };

    lines.push([]);
    lines.push([t('acct.b2b.csvAvgTitle')]);
    lines.push([
      t('acct.b2b.csvAvgMonth'),
      t('acct.b2b.csvAvgCount'),
      t('acct.b2b.csvAvgHours'),
      t('acct.b2b.csvAvgDays'),
    ]);
    ordered.forEach((bucket) => lines.push(avgRow(bucket.label, bucket)));
    const all = ordered.reduce(
      (acc, bucket) => ({ totalMs: acc.totalMs + bucket.totalMs, count: acc.count + bucket.count }),
      { totalMs: 0, count: 0 },
    );
    lines.push(avgRow(t('acct.b2b.csvAvgTotal'), all));
  }

  /* What the workshop closed with this month, laid out under the delays: the
     commercial reads the reasons of its month next to how fast it answered.
     Same rules as the summary strip — grouped on the handling date. */
  const today = new Date();
  const monthKeyOf = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
  const currentKey = monthKeyOf(today);
  const monthRows = rows.filter((row) => {
    if (row.statut !== 'traitee' || !row.traitee_at) return false;
    const date = new Date(row.traitee_at);
    if (Number.isNaN(date.getTime())) return false;
    return monthKeyOf(date) === currentKey;
  });

  if (monthRows.length > 0) {
    const counts = countMotifs(monthRows);
    const noMotif = monthRows.filter((row) => detectMotif(row.motif) === null).length;
    const total = monthRows.length;
    const share = (value: number) => `${Math.round((value / total) * 100)} %`;
    const rawMonth = monthName.format(today);
    const monthLabel = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

    /* How many of each reason were caught up in bulk: the reason most often
       rebuilt after the fact is the one the workshop should look at first. */
    const lotCounts: Record<B2bMotifKey, number> = {
      devis: 0,
      client: 0,
      hors: 0,
      delai: 0,
      sansSuite: 0,
    };
    monthRows.forEach((row) => {
      const key = detectMotif(row.motif);
      if (key && row.motif_lot_at) lotCounts[key] += 1;
    });
    /* A zero stays empty: a filled cell always means a real catch-up. */
    const lotCell = (value: number) => (value > 0 ? String(value) : '');
    const lotTotal = B2B_MOTIF_KEYS.reduce((sum, key) => sum + lotCounts[key], 0);

    /* Corrections of the same month: catch-ups erased after the fact. The erased
       reason is kept on the row, so the sheet can say which one the workshop
       has to correct the most — that is a different signal from the volume.
       A closure that got a reason back since is not counted: it is documented
       again, and the erasure no longer describes it. */
    const clearedCounts: Record<B2bMotifKey, number> = {
      devis: 0,
      client: 0,
      hors: 0,
      delai: 0,
      sansSuite: 0,
    };
    let clearedUnknown = 0;
    monthRows.forEach((row) => {
      if (!row.motif_lot_clear_at) return;
      if (detectMotif(row.motif) !== null) return;
      const key = detectMotif(row.motif_lot_cleared);
      /* An erasure made before the reason was kept has no label: it goes on the
         « no reason » line rather than being credited to an invented motif. */
      if (key) clearedCounts[key] += 1;
      else clearedUnknown += 1;
    });
    const clearedTotalMonth =
      B2B_MOTIF_KEYS.reduce((sum, key) => sum + clearedCounts[key], 0) + clearedUnknown;

    lines.push([]);
    lines.push([t('acct.b2b.csvMotifTitle'), monthLabel]);
    lines.push([
      t('acct.b2b.csvMotifLabel'),
      t('acct.b2b.csvMotifCount'),
      t('acct.b2b.csvMotifShare'),
      t('acct.b2b.csvMotifLotCol'),
      t('acct.b2b.csvMotifClearedCol'),
    ]);
    /* A reason may have no closure left but still carry corrections: it stays
       on its own line, or its erased count would vanish from the sheet. */
    B2B_MOTIF_KEYS.filter(
      (key) => counts[key] > 0 || clearedCounts[key] > 0,
    ).forEach((key) => {
      lines.push([
        t(`acct.b2b.motif.${key}`),
        String(counts[key]),
        share(counts[key]),
        lotCell(lotCounts[key]),
        lotCell(clearedCounts[key]),
      ]);
    });
    if (noMotif > 0 || clearedUnknown > 0) {
      lines.push([
        t('acct.b2b.motifNone'),
        String(noMotif),
        share(noMotif),
        '',
        lotCell(clearedUnknown),
      ]);
    }
    lines.push([
      t('acct.b2b.csvMotifTotal'),
      String(total),
      share(total),
      lotCell(lotTotal),
      lotCell(clearedTotalMonth),
    ]);
  }

  /* The year at a glance: one row per month, one column per reason, so the
     commercial reads the trend of the year instead of a single month. Same
     basis as everything above — the handling date, and the exported rows only. */
  const MONTHS = 12;
  const monthKeys: string[] = [];
  const monthLabels = new Map<string, string>();
  /* One month before the window is kept too: the oldest shown month needs a
     month before it, or its variation against the previous month is a guess. */
  for (let back = MONTHS; back >= 0; back -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - back, 1);
    const key = monthKeyOf(date);
    monthKeys.push(key);
    const raw = monthName.format(date);
    monthLabels.set(key, raw.charAt(0).toUpperCase() + raw.slice(1));
  }
  /* The twelve months actually written: the lookback stays for the deltas. */
  const shownKeys = monthKeys.slice(1);

  type YearBucket = {
    counts: Record<B2bMotifKey, number>;
    none: number;
    total: number;
    /** Documented closures whose reason was caught up in bulk afterwards. */
    lot: number;
    /** Documented closures whose reason was given at the close itself. */
    origin: number;
    /** Reply delays of that month, summed in milliseconds, and how many count. */
    delaySum: number;
    delayCount: number;
    /** The same closures, read in whole days waited: the clock of the other column. */
    waitSum: number;
  };
  const emptyBucket = (): YearBucket => ({
    counts: { devis: 0, client: 0, hors: 0, delai: 0, sansSuite: 0 },
    none: 0,
    total: 0,
    lot: 0,
    origin: 0,
    delaySum: 0,
    delayCount: 0,
    waitSum: 0,
  });
  const year = new Map<string, YearBucket>();
  monthKeys.forEach((key) => year.set(key, emptyBucket()));

  rows.forEach((row) => {
    if (row.statut !== 'traitee' || !row.traitee_at) return;
    const date = new Date(row.traitee_at);
    if (Number.isNaN(date.getTime())) return;
    const bucket = year.get(monthKeyOf(date));
    if (!bucket) return;
    const key = detectMotif(row.motif);
    if (key) {
      bucket.counts[key] += 1;
      /* A reason caught up in bulk is part of the documented share, but the
         spreadsheet must say which part of that trace was rebuilt. */
      if (row.motif_lot_at) bucket.lot += 1;
      /* The rest of the documented share was given at the close: that is what
         the month-by-month life of the reason reads. */
      else bucket.origin += 1;
    } else bucket.none += 1;
    bucket.total += 1;

    /* The reply delay of that month, on the same rows: reception → closure.
       A stamp older than the arrival is not measurable and stays out. */
    const from = new Date(row.created_at).getTime();
    if (Number.isFinite(from) && date.getTime() >= from) {
      bucket.delaySum += date.getTime() - from;
      bucket.delayCount += 1;
      /* The same wait in whole days: the synthesis of months past the wait
         threshold is read on the very clock as the « average days waited »
         column, never on a second approximation. */
      bucket.waitSum += Math.floor((date.getTime() - from) / 86400000);
    }
  });

  /* Corrections made inside the window: catch-ups that were erased after the
     fact, grouped on the month of the erasure like the month review does. A
     request reopened since then still counted that month, so the total does
     not shrink when a correction is fixed afterwards. */
  const clearedKeys = new Set(shownKeys);
  const clearedTotal = rows.filter((row) => {
    if (!row.motif_lot_clear_at) return false;
    const date = new Date(row.motif_lot_clear_at);
    if (Number.isNaN(date.getTime())) return false;
    return clearedKeys.has(monthKeyOf(date));
  }).length;

  const yearTotal = shownKeys.reduce<YearBucket>((acc, key) => {
    const bucket = year.get(key) as YearBucket;
    B2B_MOTIF_KEYS.forEach((motifKey) => {
      acc.counts[motifKey] += bucket.counts[motifKey];
    });
    acc.none += bucket.none;
    acc.total += bucket.total;
    acc.lot += bucket.lot;
    acc.origin += bucket.origin;
    acc.delaySum += bucket.delaySum;
    acc.delayCount += bucket.delayCount;
    acc.waitSum += bucket.waitSum;
    return acc;
  }, emptyBucket());

  /* The slowest month of the window, kept for the closing line of the sheet:
     the column lets a sort find it, this line says it outright. */
  let slowest: { label: string; deltaDays: number; avgHours: number } | null = null;
  /* A month that slowed down on one or two measurable closures is flagged: the
     column keeps its figure, the sheet says how little it weighs. */
  let thinSlow = false;
  /*
   * The month that made people wait longest, kept for its own closing block:
   * the deepest average wait of the window, read on the very clock of the
   * « average days waited » column — whole days, reception → close. Only a
   * month with measurable closures competes; a tie goes to the older one, as
   * the hourglass of the table on screen resolves it.
   */
  let longestWait: {
    key: string;
    label: string;
    days: number;
    measured: number;
  } | null = null;

  if (yearTotal.total > 0) {
    /* The documented share, read month by month against the target of its own
       time: a workshop that raised its threshold mid-year does not retroactively
       fail the months it had already closed. */
    const shareOf = (bucket: YearBucket) =>
      bucket.total > 0
        ? Math.round(((bucket.total - bucket.none) / bucket.total) * 100)
        : null;

    /* The share of documented closures whose reason was given at the close —
       month after month, the trace that did not need patching up. */
    const lifeCell = (bucket: YearBucket) => {
      const documented = bucket.total - bucket.none;
      if (documented <= 0) return '';
      return `${Math.round((bucket.origin / documented) * 100)} %`;
    };

    /* Month against the month before it, in points of documented share: a
       share on its own says nothing about whether the trace got better. Two
       months with no closure, or one, leave the cell empty rather than fake. */
    const deltaCell = (share: number | null, before: YearBucket | null) => {
      if (share === null || before === null) return '';
      const prev = shareOf(before);
      if (prev === null) return '';
      const diff = share - prev;
      const sign = diff > 0 ? '+' : diff < 0 ? '−' : '';
      return `${sign}${Math.abs(diff)} ${t('acct.b2b.csvDeltaUnit')}`;
    };

    /* The same month-to-month reading, but on the average reply delay: this is
       the column the workshop sorts to find the months that slowed down. Days
       past 48 h, so a whole week of drift reads as a week, not as 168 h.
       Empty when either month is not measurable — a difference between two
       absent averages would be a lie. */
    const delayOf = (bucket: YearBucket) =>
      bucket.delayCount > 0 ? bucket.delaySum / bucket.delayCount / 3600000 : null;
    const delayFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

    /* The month's own average, in hours: an absolute level, so the column also
       sorts by how slow a month is — not only by how much it moved. Blank when
       the month has nothing measurable, rather than a zero that would read fast. */
    const delayAvgCell = (bucket: YearBucket) => {
      const hours = delayOf(bucket);
      return hours === null ? '' : delayFmt.format(Math.round(hours * 10) / 10);
    };

    /* The worst drift of the window, on the same figures as the columns: only a
       month that actually slowed down, and only when both months are measurable. */
    shownKeys.forEach((key, index) => {
      const bucket = year.get(key);
      const before = year.get(monthKeys[index]);
      if (!bucket || !before) return;
      const nowDelay = delayOf(bucket);
      const prevDelay = delayOf(before);
      if (nowDelay === null || prevDelay === null) return;
      const diff = nowDelay - prevDelay;
      if (diff <= 0) return;
      if (bucket.delayCount < 3) thinSlow = true;
      if (slowest === null || diff > slowest.deltaDays * 24) {
        slowest = {
          label: monthLabels.get(key) ?? key,
          deltaDays: diff / 24,
          avgHours: nowDelay,
        };
      }
    });

    const delayDeltaCell = (bucket: YearBucket, before: YearBucket | null) => {
      const nowDelay = delayOf(bucket);
      const prevDelay = before === null ? null : delayOf(before);
      if (nowDelay === null || prevDelay === null) return '';
      const diff = Math.round((nowDelay - prevDelay) * 10) / 10;
      if (Math.abs(diff) < 0.1) return `0 ${t('acct.b2b.csvDelayHourUnit')}`;
      const sign = diff > 0 ? '+' : '−';
      /* Only a rise is ever thin: a fall said by two fiches is not a claim. */
      const thin = diff > 0 && bucket.delayCount < 3 ? ' *' : '';
      const abs = Math.abs(diff);
      if (abs > 48) {
        const days = Math.round((abs / 24) * 10) / 10;
        return `${sign}${delayFmt.format(days)} ${t('acct.b2b.csvDelayDayUnit')}${thin}`;
      }
      return `${sign}${delayFmt.format(Math.round(abs))} ${t('acct.b2b.csvDelayHourUnit')}${thin}`;
    };

    const rowOf = (
      label: string,
      bucket: YearBucket,
      key: string | null,
      before: YearBucket | null,
      /** The closing line counts the months in fault instead of judging one. */
      belowCell?: string,
    ) => {
      const share = shareOf(bucket);
      const goal = key === null ? objectif : goalForMonth(objectifHistory, key, objectif);
      const goalCell = goal === null ? '' : `${goal} %`;
      return [
        label,
        ...B2B_MOTIF_KEYS.map((motifKey) => String(bucket.counts[motifKey])),
        String(bucket.none),
        String(bucket.total),
        share === null ? '' : `${share} %`,
        /* Of that documented share, the part rebuilt in bulk: the trace is
           there, but it was not given at the close. */
        bucket.lot > 0 ? String(bucket.lot) : '',
        /* The other side of the same share: a whole month of closures given at
           the close reads 100 %, a month patched up reads less. Blank when the
           month documented nothing — a percentage of nothing is a lie. */
        lifeCell(bucket),
        deltaCell(share, before),
        /* How many fiches the average rests on: a mean over two closures is
           not the same reading as a mean over forty. Blank when the month has
           nothing measurable, rather than a zero that would look empty. */
        bucket.delayCount > 0 ? String(bucket.delayCount) : '',
        /* The level first, the variation next: a month can be slow without
           moving, and a month can move without being slow. */
        delayAvgCell(bucket),
        /* Next to it: how fast the month answered, against the month before.
           Negative is speed, positive is drift. */
        delayDeltaCell(bucket, before),
        goalCell,
        /* A month with no closure is neither above nor below: it stays blank. */
        belowCell !== undefined
          ? belowCell
          : share === null || goal === null
            ? ''
            : share < goal
              ? t('acct.b2b.csvYes')
              : t('acct.b2b.csvNo'),
      ];
    };

    lines.push([]);
    lines.push([t('acct.b2b.csvYearTitle')]);
    lines.push([
      t('acct.b2b.csvYearMonth'),
      ...B2B_MOTIF_KEYS.map((key) => t(`acct.b2b.motif.${key}`)),
      t('acct.b2b.motifNone'),
      t('acct.b2b.csvYearTotal'),
      t('acct.b2b.csvYearMotivated'),
      t('acct.b2b.csvYearLot'),
      t('acct.b2b.csvYearLife'),
      t('acct.b2b.csvYearDelta'),
      t('acct.b2b.csvYearDelayCount'),
      t('acct.b2b.csvYearDelayAvg'),
      t('acct.b2b.csvYearDelayDelta'),
      t('acct.b2b.csvYearGoal'),
      t('acct.b2b.csvYearBelow'),
    ]);
    shownKeys.forEach((key, index) => {
      /* index 0..11 of the shown months maps to the month right before it. */
      const before = year.get(monthKeys[index]) ?? null;
      lines.push(rowOf(monthLabels.get(key) ?? key, year.get(key) as YearBucket, key, before));
    });
    /* How many months of the window could be judged at all, and how many fell
       short of their own threshold. A month with no closure, or with no target
       in force that month, is not judged — it is not a failure either. */
    let judgedCount = 0;
    let belowTotal = 0;
    shownKeys.forEach((key) => {
      const bucket = year.get(key);
      if (!bucket) return;
      const share = shareOf(bucket);
      const goal = goalForMonth(objectifHistory, key, objectif);
      if (share === null || goal === null) return;
      judgedCount += 1;
      if (share < goal) belowTotal += 1;
    });
    const belowSharePct =
      judgedCount > 0 ? Math.round((belowTotal / judgedCount) * 100) : null;
    /* The twelve-month line has no single month before it: no variation — and
       twelve months have twelve thresholds, so its last cell counts the months
       in fault instead of pretending to one verdict. */
    lines.push(
      rowOf(t('acct.b2b.csvYearAll'), yearTotal, null, null, String(belowTotal)),
    );
    /* The asterisk of the delta column means something: say it right under the
       table, so nobody reads a rise on two fiches as a whole month. */
    if (thinSlow) lines.push([t('acct.b2b.csvThinMarkNote')]);

    /* The months under their own threshold, said as a line of synthesis rather
       than left to a sort of the column: how many, on how many judged months,
       and the share of the year that represents. A year read by hand forgets
       the weight; three months out of twelve is not three out of three. */
    /* The two ends of the window, named: “12 derniers mois” hides that the
       oldest month is already a year old, and the share of the year is only
       honest with the exact period it was computed on. */
    const oldestLabel = monthLabels.get(shownKeys[0]) ?? shownKeys[0];
    const newestLabel =
      monthLabels.get(shownKeys[shownKeys.length - 1]) ?? shownKeys[shownKeys.length - 1];

    lines.push([]);
    lines.push([t('acct.b2b.csvBelowTitle')]);
    lines.push([
      t('acct.b2b.csvGapTotalPeriod'),
      t('acct.b2b.csvBelowJudged'),
      t('acct.b2b.csvBelowCount'),
      t('acct.b2b.csvBelowShare'),
    ]);
    lines.push([
      /* The exact period rather than « the last twelve months »: the share
         below has to say what it weighed. */
      `${oldestLabel} → ${newestLabel}`,
      String(judgedCount),
      String(belowTotal),
      belowSharePct === null ? '' : `${belowSharePct} %`,
    ]);
    /* The oldest month of the window, said in words: a reader who only keeps
       this block still knows where the year starts. */
    lines.push([
      t('acct.b2b.csvBelowWindowNote')
        .replace('{n}', String(shownKeys.length))
        .replace('{from}', oldestLabel)
        .replace('{to}', newestLabel),
    ]);

    /* The other face of the same year, right under it: the months whose
       closures made people wait past the workshop threshold, on average. Same
       mechanics as the target block above — a count, the months it was
       measured on, the period — read on whole days waited instead of the
       trace. Only a month with measurable closures is ever judged. */
    let waitMeasured = 0;
    let waitOverMonths = 0;
    shownKeys.forEach((key) => {
      const bucket = year.get(key);
      if (!bucket || bucket.delayCount <= 0) return;
      waitMeasured += 1;
      if (bucket.waitSum / bucket.delayCount > waitGoalDays) waitOverMonths += 1;
    });
    const waitOverShare =
      waitMeasured > 0 ? Math.round((waitOverMonths / waitMeasured) * 100) : null;

    /* The deepest wait of the window, month by month: the same figure the strip
       counts and the table marks, named here so the sheet answers without a
       sort. A month with nothing measurable never wins. */
    for (const key of shownKeys) {
      const bucket = year.get(key);
      if (!bucket || bucket.delayCount <= 0) continue;
      const days = bucket.waitSum / bucket.delayCount;
      const entry = {
        key,
        label: monthLabels.get(key) ?? key,
        days,
        measured: bucket.delayCount,
      };
      if (!longestWait) {
        longestWait = entry;
      } else if (
        days > longestWait.days ||
        (days === longestWait.days && key < longestWait.key)
      ) {
        longestWait = entry;
      }
    }

    lines.push([]);
    lines.push([t('acct.b2b.csvWaitOverTitle')]);
    lines.push([
      t('acct.b2b.csvGapTotalPeriod'),
      t('acct.b2b.csvWaitOverJudged'),
      t('acct.b2b.csvWaitOverCount'),
      t('acct.b2b.csvWaitOverShare'),
    ]);
    lines.push([
      `${oldestLabel} → ${newestLabel}`,
      String(waitMeasured),
      String(waitOverMonths),
      waitOverShare === null ? '' : `${waitOverShare} %`,
    ]);
    /* What the block counts, said under it: the threshold travels with the
       figures, so a sheet kept on a desk still knows what « over » meant. */
    lines.push([
      t('acct.b2b.csvWaitOverNote')
        .replace('{goal}', String(waitGoalDays))
        .replace('{n}', String(waitMeasured)),
    ]);

    /* The size of the backlog, right under the annual table: how many closures
       of the window still owe a reason, and what share that is. One line to
       read, no formula to build in the spreadsheet. */
    lines.push([]);
    lines.push([t('acct.b2b.csvGapTotalTitle')]);
    lines.push([
      t('acct.b2b.csvGapTotalPeriod'),
      t('acct.b2b.csvGapTotalCount'),
      /* Of the documented closures of the window, the part that was rebuilt in
         bulk: next to the gaps, so the two faces of the same backlog read
         together instead of one hiding the other. */
      t('acct.b2b.csvGapTotalLot'),
      /* The corrections of the same window, next to the catch-ups they took
         back: the two faces of the same trace, read side by side. */
      t('acct.b2b.csvGapTotalCleared'),
      t('acct.b2b.csvGapTotalShare'),
    ]);
    lines.push([
      t('acct.b2b.csvYearAll'),
      String(yearTotal.none),
      yearTotal.lot > 0 ? String(yearTotal.lot) : '',
      clearedTotal > 0 ? String(clearedTotal) : '',
      yearTotal.total > 0
        ? `${Math.round((yearTotal.none / yearTotal.total) * 100)} %`
        : '',
    ]);
  }

  /* The most ploughed fiches, named one by one: in the request table they are
     only a number in a sortable column, and a short list of references is what
     actually gets handed to the workshop. Most reworked first, so the top of
     the list is the worst of it. */
  const reworkRows = rows
    .filter((row) => clearedTimes(row) > 2)
    .sort(
      (a, b) =>
        clearedTimes(b) - clearedTimes(a) || a.reference.localeCompare(b.reference),
    );

  if (reworkRows.length > 0) {
    lines.push([]);
    lines.push([t('acct.b2b.csvReworkTitle').replace('{n}', String(reworkRows.length))]);
    lines.push([
      t('acct.b2b.csvRef'),
      t('acct.b2b.csvRefUrl'),
      t('acct.b2b.csvCorrections'),
      t('acct.b2b.csvCorrectionsAge'),
      t('acct.b2b.csvReworkLast'),
      t('acct.b2b.csvMotif'),
      t('acct.b2b.csvMotifLife'),
      t('acct.b2b.csvTreated'),
    ]);
    reworkRows.forEach((row) => {
      lines.push([
        referenceCell(row.reference, lang),
        b2bRequestHref(row.reference, lang),
        String(clearedTimes(row)),
        daysSinceCorrection(row) === null ? '' : String(daysSinceCorrection(row)),
        when(row.motif_lot_clear_at, false),
        row.motif ?? '',
        motifLife(row),
        when(row.traitee_at, false),
      ]);
    });
  }

  /* The other end of the same list: the fiches that were corrected, then left
     alone for over a month. A short list of references, days and reasons is
     what gets handed to the workshop as it stands — no column to sort first,
     and the longest abandonment at the top. */
  const peaceRows = rows
    .filter((row) => isStaleCorrection(row))
    .sort(
      (a, b) =>
        (daysSinceCorrection(b) ?? 0) - (daysSinceCorrection(a) ?? 0) ||
        a.reference.localeCompare(b.reference),
    );

  if (peaceRows.length > 0) {
    lines.push([]);
    lines.push([t('acct.b2b.csvPeaceTitle').replace('{n}', String(peaceRows.length))]);
    lines.push([
      t('acct.b2b.csvRef'),
      t('acct.b2b.csvRefUrl'),
      t('acct.b2b.csvPeaceDays'),
      t('acct.b2b.csvMotif'),
    ]);
    peaceRows.forEach((row) => {
      const days = daysSinceCorrection(row);
      lines.push([
        referenceCell(row.reference, lang),
        b2bRequestHref(row.reference, lang),
        days === null ? '' : String(days),
        row.motif ?? '',
      ]);
    });
  }

  /* The misses of the reminder, named one by one: still « nouvelle » although
     the reminder has already been through their wait. A short list of
     references and their real wait is what gets handed to the workshop — the
     longest silence first, so the top of the list is the oldest miss. */
  const neverOpened = rows
    .filter(isNeverOpened)
    .sort(
      (a, b) =>
        (waitDaysValue(b) ?? -1) - (waitDaysValue(a) ?? -1) ||
        a.reference.localeCompare(b.reference),
    );

  if (neverOpened.length > 0) {
    lines.push([]);
    lines.push([
      t('acct.b2b.csvNeverTitle').replace('{n}', String(neverOpened.length)),
    ]);
    lines.push([
      t('acct.b2b.csvRef'),
      t('acct.b2b.csvRefUrl'),
      /* Same two columns, same order as the short sheet: the requester and the
         address to write to. The two sheets must read alike — whoever holds one
         should not have to open the other to find who to write to. */
      t('acct.b2b.csvName'),
      t('acct.b2b.csvEmail'),
      t('acct.b2b.csvWaitDays'),
      t('acct.b2b.csvReceived'),
      t('acct.b2b.csvReminder'),
    ]);
    neverOpened.forEach((row) => {
      /* The name carries its organisation when there is one, exactly as the
         short sheet words it: two requesters of the same firm stay apart. */
      const who = row.organisme ? `${row.nom} · ${row.organisme}` : row.nom;
      lines.push([
        referenceCell(row.reference, lang),
        b2bRequestHref(row.reference, lang),
        who,
        row.email,
        waitDaysCell(row),
        when(row.created_at, false),
        when(row.rappel_at, false),
      ]);
    });
    /* What the list is, said under it: a reference alone never tells why it is
       there, and the sheet is read away from the site. */
    lines.push([t('acct.b2b.csvNeverNote')]);
  }

  /* Which way of closing actually eats the days: the average reply delay of
     each reason, longest first. Same basis as everything above — reception →
     first handling, on the exported rows only. A reason that looks harmless in
     the breakdown can be the one that costs a week. */
  type MotifDelay = {
    /** Closures whose delay can really be measured: the average rests on those. */
    count: number;
    totalMs: number;
    /** Every closure of that reason, measurable or not: the true volume. */
    total: number;
  };
  const delayByMotif = new Map<string, MotifDelay>();
  rows.forEach((row) => {
    if (row.statut !== 'traitee') return;
    const key = detectMotif(row.motif) ?? 'none';
    const bucket = delayByMotif.get(key) ?? { count: 0, totalMs: 0, total: 0 };
    /* The closure counts even when its delay cannot be measured, so the sheet
       never shows a volume smaller than the number of fiches behind it. */
    bucket.total += 1;
    const from = new Date(row.created_at).getTime();
    const to = row.traitee_at ? new Date(row.traitee_at).getTime() : NaN;
    if (Number.isFinite(from) && Number.isFinite(to) && to >= from) {
      bucket.count += 1;
      bucket.totalMs += to - from;
    }
    delayByMotif.set(key, bucket);
  });

  if (delayByMotif.size > 0) {
    const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const perMotif = [...delayByMotif.entries()]
      .map(([key, bucket]) => ({
        key,
        count: bucket.count,
        total: bucket.total,
        /* No measurable closure: no average at all, rather than a zero that
           would read as an instant reply. */
        hours: bucket.count > 0 ? bucket.totalMs / 3600000 / bucket.count : null,
      }))
      /* Reasons with nothing measurable fall to the bottom of the sheet. */
      .sort((a, b) => (b.hours ?? -1) - (a.hours ?? -1));

    lines.push([]);
    lines.push([t('acct.b2b.csvMotifDelayTitle')]);
    lines.push([
      t('acct.b2b.csvMotifDelayLabel'),
      t('acct.b2b.csvMotifDelayCount'),
      /* How many of those closures the average really rests on: "3 d" over two
         fiches is not "3 d" over forty. */
      t('acct.b2b.csvMotifDelayMeasurable'),
      t('acct.b2b.csvMotifDelayHours'),
      t('acct.b2b.csvMotifDelayDays'),
    ]);
    perMotif.forEach((entry) => {
      const label = entry.key === 'none'
        ? t('acct.b2b.motifNone')
        : t(`acct.b2b.motif.${entry.key}`);
      lines.push([
        label,
        String(entry.total),
        entry.count > 0 ? String(entry.count) : '',
        entry.hours === null ? '' : fmt.format(entry.hours),
        entry.hours === null ? '' : fmt.format(entry.hours / 24),
      ]);
    });

    /* The closing line, weighted on the very rows the averages rest on: a mean
       of means would let a reason with two fiches weigh as much as forty. */
    const sum = perMotif.reduce(
      (acc, entry) => ({
        count: acc.count + entry.count,
        total: acc.total + entry.total,
        hours: acc.hours + (entry.hours ?? 0) * entry.count,
      }),
      { count: 0, total: 0, hours: 0 },
    );
    const mean = sum.count > 0 ? sum.hours / sum.count : null;
    lines.push([
      t('acct.b2b.csvMotifDelayAll'),
      String(sum.total),
      sum.count > 0 ? String(sum.count) : '',
      mean === null ? '' : fmt.format(mean),
      mean === null ? '' : fmt.format(mean / 24),
    ]);
  }

  /* The fiches the workshop still owes a reason for, named one by one: a
     reference and the day it was closed, nothing else. Closing date oldest
     first, so the list reads as the order to catch up rather than a pile. */
  const undocRows = rows
    .filter((row) => row.statut === 'traitee' && detectMotif(row.motif) === null)
    .sort((a, b) => {
      const stamp = (row: DemandeB2b) => {
        const date = new Date(row.traitee_at ?? row.created_at);
        return Number.isNaN(date.getTime()) ? Number.MAX_SAFE_INTEGER : date.getTime();
      };
      return stamp(a) - stamp(b) || a.reference.localeCompare(b.reference);
    });

  if (undocRows.length > 0) {
    lines.push([]);
    lines.push([t('acct.b2b.csvUndocTitle').replace('{n}', String(undocRows.length))]);
    lines.push([t('acct.b2b.csvRef'), t('acct.b2b.csvTreated')]);
    undocRows.forEach((row) => {
      lines.push([referenceCell(row.reference, lang), when(row.traitee_at, false)]);
    });
  }

  /* The last line of the sheet: the month that slowed down the most over the
     window, named with its gap in days. The column above invites a sort; this
     answers without one, at the bottom of the file where a summary belongs. */
  if (yearTotal.total > 0) {
    const slowFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const asDays = (value: number) =>
      `${slowFmt.format(Math.round((value / 24) * 10) / 10)} ${t('acct.b2b.csvDelayDayUnit')}`;
    lines.push([]);
    lines.push([t('acct.b2b.csvSlowestTitle')]);
    if (slowest === null) {
      lines.push([t('acct.b2b.csvSlowestNone')]);
    } else {
      const worst = slowest;
      lines.push([
        t('acct.b2b.csvSlowestMonth'),
        t('acct.b2b.csvSlowestDelta'),
        t('acct.b2b.csvSlowestAvg'),
      ]);
      lines.push([
        worst.label,
        `+${slowFmt.format(Math.round(worst.deltaDays * 10) / 10)} ${t('acct.b2b.csvDelayDayUnit')}`,
        asDays(worst.avgHours),
      ]);
      lines.push([t('acct.b2b.csvSlowestNote')]);
    }
  }

  /* The same closing block, read on the wait instead of the drift: the month
     whose closures waited longest on average, named with its depth and the
     weight behind it. The twelve-month table marks it with an hourglass; this
     line says it in words, at the bottom of the file, where a summary belongs. */
  if (yearTotal.total > 0) {
    const waitFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    lines.push([]);
    lines.push([t('acct.b2b.csvLongestWaitTitle')]);
    if (longestWait === null) {
      lines.push([t('acct.b2b.csvLongestWaitNone')]);
    } else {
      const longest = longestWait;
      lines.push([
        t('acct.b2b.csvSlowestMonth'),
        t('acct.b2b.csvLongestWaitAvg'),
        t('acct.b2b.csvLongestWaitCount'),
      ]);
      lines.push([
        longest.label,
        `${waitFmt.format(Math.round(longest.days * 10) / 10)} ${t(
          'acct.b2b.csvDelayDayUnit',
        )}`,
        String(longest.measured),
      ]);
      lines.push([t('acct.b2b.csvLongestWaitNote')]);
      /* « Longest » is not a verdict until it stands next to the limit: the
         threshold travels with the block, so a sheet kept on a desk still knows
         what the month was measured against. */
      lines.push([
        t('acct.b2b.csvLongestWaitGoalNote').replace('{goal}', String(waitGoalDays)),
      ]);
    }
  }

  /* The urgency, added up at the very bottom of the sheet: how many of the
     exported requests have passed a whole week, and what share of the file that
     is. The column says it row by row; this block says the weight without
     anyone rebuilding the count in the spreadsheet. Read on the same seven-day
     threshold as the row badge, the filter chip and the bar reminder. */
  const weekLateTotal = rows.filter(isWeekLateRow).length;
  lines.push([]);
  lines.push([t('acct.b2b.csvWeekTotalTitle')]);
  lines.push([
    t('acct.b2b.csvWeekTotalPeriod'),
    t('acct.b2b.csvWeekTotalCount'),
    t('acct.b2b.csvWeekTotalShare'),
  ]);
  lines.push([
    t('acct.b2b.csvWeekTotalAll'),
    String(weekLateTotal),
    /* A share of nothing would read as a zero; the file always carries rows. */
    rows.length > 0 ? `${Math.round((weekLateTotal / rows.length) * 100)} %` : '',
  ]);
  lines.push([t('acct.b2b.csvWeekTotalNote').replace('{n}', String(rows.length))]);

  /* The depth of those waits, month after month, closing the sheet: the very
     whole days of the column above, but read twice — the month the request
     arrived in (how heavy that month was) and the month it was closed in (how
     fast it was worked off). Nobody has to rebuild a pivot in the spreadsheet. */
  type WaitMonth = { days: number; count: number };
  const bucketIn = (map: Map<string, WaitMonth>, key: string) => {
    const bucket = map.get(key) ?? { days: 0, count: 0 };
    map.set(key, bucket);
    return bucket;
  };
  const monthKeyOfStamp = (iso: string | null | undefined) => {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
  };

  const waitByReceived = new Map<string, WaitMonth>();
  const waitByClosed = new Map<string, WaitMonth>();
  rows.forEach((row) => {
    const days = waitDaysValue(row);
    if (days === null) return;
    const receivedKey = monthKeyOfStamp(row.created_at);
    if (receivedKey) {
      const bucket = bucketIn(waitByReceived, receivedKey);
      bucket.days += days;
      bucket.count += 1;
    }
    /* Only a handled request has a closing month: an open one has no place in
       that reading, and forcing it in would invent a closure date. */
    if (row.statut === 'traitee') {
      const closedKey = monthKeyOfStamp(row.traitee_at);
      if (closedKey) {
        const bucket = bucketIn(waitByClosed, closedKey);
        bucket.days += days;
        bucket.count += 1;
      }
    }
  });

  const waitNf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const avgDaysOf = (bucket: WaitMonth) =>
    waitNf.format(Math.round((bucket.days / bucket.count) * 10) / 10);
  const monthLabelOf = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    const raw = monthName.format(new Date(year, (month || 1) - 1, 1));
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const pushWaitReading = (title: string, map: Map<string, WaitMonth>) => {
    const buckets = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    lines.push([]);
    lines.push([title]);
    lines.push([
      t('acct.b2b.csvAvgMonth'),
      t('acct.b2b.csvWaitAvgCount'),
      t('acct.b2b.csvWaitAvgDays'),
    ]);
    if (buckets.length === 0) {
      lines.push([t('acct.b2b.csvWaitAvgNone')]);
      return;
    }
    buckets.forEach(([key, bucket]) => {
      lines.push([monthLabelOf(key), String(bucket.count), avgDaysOf(bucket)]);
    });
    /* The closing line is weighted on the requests themselves, not on the
       monthly means: a month of one fiche must not weigh as much as a month of
       forty. */
    const all = buckets.reduce(
      (acc, [, bucket]) => ({
        days: acc.days + bucket.days,
        count: acc.count + bucket.count,
      }),
      { days: 0, count: 0 },
    );
    lines.push([t('acct.b2b.csvWaitAvgTotal'), String(all.count), avgDaysOf(all)]);
  };

  lines.push([]);
  lines.push([t('acct.b2b.csvWaitAvgTitle')]);
  pushWaitReading(t('acct.b2b.csvWaitAvgByReceived'), waitByReceived);
  pushWaitReading(t('acct.b2b.csvWaitAvgByClosed'), waitByClosed);
  lines.push([t('acct.b2b.csvWaitAvgNote')]);

  /* The first column is a door, and the sheet says it once: every reference
     opens the very fiche it names, the way the dotted link of the list does.
     Read at the bottom, like the other notes — the file is handed round, and a
     clickable figure nobody was told about is a clickable figure nobody uses. */
  lines.push([]);
  lines.push([t('acct.b2b.csvRefLinkNote')]);

  return `\uFEFF${lines.map((line) => line.map(escapeCell).join(';')).join('\r\n')}`;
}
/**
 * The short sheet: the requests the reminder never served, and nothing else.
 * The order is the one the workshop hands the list out in — longest silence
 * first — and the columns are only what is needed to go and open them. No
 * synthesis blocks: this is a work list, not a report.
 */
export function buildB2bNeverCsv({
  rows,
  lang,
  t,
}: {
  rows: DemandeB2b[];
  lang: string;
  t: (key: string) => string;
}): string {
  const locale = localeFor(lang);
  const dayOnly = new Intl.DateTimeFormat(locale, { dateStyle: 'short' });
  const when = (iso: string | null | undefined) => {
    if (!iso) return '';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : dayOnly.format(date);
  };

  const list = rows
    .filter(isNeverOpened)
    .sort(
      (a, b) =>
        (waitDaysValue(b) ?? -1) - (waitDaysValue(a) ?? -1) ||
        a.reference.localeCompare(b.reference),
    );

  const lines: string[][] = [
    [t('acct.b2b.csvNeverSheetTitle').replace('{n}', String(list.length))],
    [],
    [
      t('acct.b2b.csvRef'),
      t('acct.b2b.csvRefUrl'),
      /* Who is behind the reference: the workshop hands this sheet round, and a
         bare reference never says who to write to. The name and its address sit
         side by side in two columns, so the list can be used straight off the
         file — no going back to the site to look the requester up. */
      t('acct.b2b.csvName'),
      t('acct.b2b.csvEmail'),
      /* The same clock as the column of the full sheet and the row badge: a
         request still open counts up to today. */
      t('acct.b2b.csvWaitDays'),
      t('acct.b2b.csvReceived'),
      t('acct.b2b.csvReminder'),
    ],
  ];

  list.forEach((row) => {
    /* The name carries its organisation when there is one, exactly as the
       workshop alert words it: two requesters of the same firm stay apart. */
    const who = row.organisme ? `${row.nom} · ${row.organisme}` : row.nom;
    lines.push([
      referenceCell(row.reference, lang),
      b2bRequestHref(row.reference, lang),
      who,
      row.email,
      waitDaysCell(row),
      when(row.created_at),
      when(row.rappel_at),
    ]);
  });

  /* What the list is, under it: a bare reference never says why it is there,
     and this sheet is read away from the site. */
  lines.push([]);
  lines.push([t('acct.b2b.csvNeverNote')]);
  /* And that its first column is a door: a work list handed round is read for
     its references, so the sheet says they open the fiches. */
  lines.push([t('acct.b2b.csvRefLinkNote')]);

  return `\uFEFF${lines.map((line) => line.map(escapeCell).join(';')).join('\r\n')}`;
}

/** Pushes the built CSV to the browser as a download. */
export function downloadB2bCsv(filename: string, csv: string) {
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

/**
 * `PaperAtlas-demandes-b2b-2026-11-01-12m-2025-12-2026-11.csv` — one file
 * per export day, with the exact window the yearly block covers in the name:
 * the oldest month of the window and the newest one, so a sheet kept on a desk
 * says its own period without being opened.
 */
export function b2bCsvFilename() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, '0'),
    `${now.getDate()}`.padStart(2, '0'),
  ].join('-');
  const keyOf = (date: Date) =>
    `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
  /* The very window the yearly block is computed on — twelve months, this one
     included — so the file name and the summary inside it cannot disagree. */
  const oldest = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return `PaperAtlas-demandes-b2b-${stamp}-12m-${keyOf(oldest)}-${keyOf(now)}.csv`;
}

/**
 * `PaperAtlas-jamais-ouvertes-2026-11-03.csv` — the short list, named by the
 * day it was drawn: a work list handed to the workshop on a Monday says when it
 * was made, without being opened first.
 */
export function b2bNeverCsvFilename() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    `${now.getMonth() + 1}`.padStart(2, '0'),
    `${now.getDate()}`.padStart(2, '0'),
  ].join('-');
  return `PaperAtlas-jamais-ouvertes-${stamp}.csv`;
}