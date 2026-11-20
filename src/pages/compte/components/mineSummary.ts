import { localeFor } from '@/i18n/localize';
import { deviseCode, nomPays } from '@/lib/pays';
import type { PaysCount } from '@/components/feature/PaysTally';

type Args = {
  lang: string;
  t: (key: string) => string;
  /** Deposits of both tabs, and how they split. */
  annonces: number;
  offres: number;
  total: number;
  /** What still waits on the owner, and how much of it is already live. */
  todo: number;
  published: number;
  stale: number;
  /** This month against the one before, on the open tab. */
  compare: { now: number; before: number; delta: number };
  /** Country counter of the open window, already narrowed by the period. */
  pays: PaysCount[];
  /** The window kept on the board, and what it leaves of the open tab. */
  periodLabel: string;
  kept: number;
  scoped: number;
};

/** « +2 de plus qu’au mois précédent », or the flat / down wording. */
function deltaText(compare: Args['compare'], t: (key: string) => string) {
  if (compare.delta > 0) return `+${compare.delta} ${t('acct.mine.cmpUp')}`;
  if (compare.delta < 0) return `\u2212${Math.abs(compare.delta)} ${t('acct.mine.cmpDown')}`;
  return `\u00b10 ${t('acct.mine.cmpFlat')}`;
}

/**
 * The deposits board as a few lines of plain text: totals, the monthly move and
 * the country breakdown, so the owner can paste a status in a message without
 * re-typing any of it. Reads the same numbers as the board, never a new count.
 */
export function buildMineSummary({
  lang, t, annonces, offres, total, todo, published, stale, compare, pays,
  periodLabel, kept, scoped,
}: Args): string {
  const lines: string[] = [];
  lines.push(`${t('acct.mine.sumTitle')} — PaperAtlas`);
  lines.push(
    `${t('acct.mine.tabAnnonces')} ${annonces} · ${t('acct.mine.tabOffres')} ${offres} · ${total} ${t('acct.mine.totalDeposits')}`,
  );

  const state = [`${todo} ${t('acct.mine.totalTodo')}`, `${published} ${t('acct.mine.totalPublished')}`];
  if (stale > 0) state.push(`${stale} ${t('acct.mine.totalOld')}`);
  lines.push(state.join(' · '));

  lines.push(
    `${t('acct.mine.cmpPrev')} ${compare.before} · ${t('acct.mine.cmpNow')} ${compare.now} (${deltaText(compare, t)})`,
  );

  const shownPays = pays.filter((row) => row.count > 0);
  if (shownPays.length) {
    /* Each country carries its own money: « Égypte 5 (EGP) » reads on its own,
       even sent to someone who works in another currency. */
    const body = shownPays
      .map((row) => `${nomPays(row.code, lang)} ${row.count} (${deviseCode(row.code)})`)
      .join(' · ');
    lines.push(`${t('acct.mine.sumPays')} : ${body}`);
  }

  if (scoped > 0) {
    lines.push(`${t('acct.mine.sumWindow')} : ${periodLabel} (${kept} / ${scoped})`);
  }

  const dateLabel = new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date());
  lines.push(dateLabel);

  return lines.join('\n');
}