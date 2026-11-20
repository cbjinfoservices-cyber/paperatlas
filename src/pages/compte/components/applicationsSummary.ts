import { localeFor } from '@/i18n/localize';
import { nomPays } from '@/lib/pays';
import type { PaysCount } from '@/components/feature/PaysTally';

type Compare = { now: number; before: number; delta: number };

type Args = {
  lang: string;
  t: (key: string) => string;
  /** The whole received pile, whatever the filter in place. */
  received: number;
  /** Applications no decision has been taken on yet. */
  todo: number;
  /** Dossiers still waiting after a full week. */
  late: number;
  /** This month against the month before, on the received pile. */
  compare: Compare;
  /** Applicants per country, as the counter above the list reads them. */
  pays: PaysCount[];
  /** What is narrowing the pile right now. */
  filters: { query: string; pays: string };
  /** How many rows the current selection actually shows. */
  shown: number;
};

/** « +2 postulants de plus qu’au mois précédent », or the flat / down wording. */
function deltaText(compare: Compare, t: (key: string) => string) {
  if (compare.delta > 0) return `+${compare.delta} ${t('acct.appl.cmpUp')}`;
  if (compare.delta < 0) return `\u2212${Math.abs(compare.delta)} ${t('acct.appl.cmpDown')}`;
  return `\u00b10 ${t('acct.appl.cmpFlat')}`;
}

/**
 * The received applications as a few lines of plain text: how many arrived,
 * what still waits, the move against last month and the applicants per country,
 * so an employer can paste a status without re-typing a single number. It reads
 * the same counts as the board, never a new one.
 */
export function buildApplicationsSummary({
  lang, t, received, todo, late, compare, pays, filters, shown,
}: Args): string {
  const lines: string[] = [];
  lines.push(`${t('acct.appl.sumTitle')} — PaperAtlas`);

  const state = [
    `${received} ${t('acct.appl.sumReceived')}`,
    `${todo} ${t('acct.appl.filterTodo')}`,
  ];
  if (late > 0) state.push(`${late} ${t('acct.appl.sumLate')}`);
  lines.push(state.join(' · '));

  lines.push(
    `${t('acct.appl.cmpPrev')} ${compare.before} · ${t('acct.appl.cmpNow')} ${compare.now} (${deltaText(compare, t)})`,
  );

  const shownPays = pays.filter((row) => row.count > 0);
  if (shownPays.length) {
    const body = shownPays
      .map((row) => `${nomPays(row.code, lang)} ${row.count}`)
      .join(' · ');
    lines.push(`${t('acct.appl.sumPays')} : ${body}`);
  }

  const needle = filters.query.trim();
  const scope: string[] = [];
  if (needle) scope.push(`« ${needle} »`);
  if (filters.pays) scope.push(`${t('csv.pays')} · ${nomPays(filters.pays, lang)}`);
  scope.push(`${shown} ${t('acct.appl.sumShown')}`);
  lines.push(`${t('acct.appl.sumFilters')} : ${scope.join(' · ')}`);

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  lines.push(dateLabel);

  return lines.join('\n');
}