import type { B2bObjectifEntry } from '@/lib/b2b';

/** `2026-11` — the key every monthly figure in the box is grouped on. */
export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
}

/** The same key, read back into the first instant of that month. */
export function monthStartOf(key: string): Date {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, (month || 1) - 1, 1);
}

/** The last instant of the month that key names — the target's cut-off. */
function monthEndOf(key: string): number {
  const [year, month] = key.split('-').map(Number);
  /* Day 0 of the following month is the last day of this one. */
  return new Date(year, month || 1, 0, 23, 59, 59, 999).getTime();
}

/**
 * The target that was in force during a given month.
 *
 * A workshop changes its threshold, but its past months do not change with it:
 * a month is judged against the target of its own time. We take the last change
 * recorded before that month ended; months older than the first recorded change
 * fall back to that oldest known threshold, since we cannot know what came
 * before it. With no history at all, the current target applies everywhere.
 */
export function goalForMonth(
  history: B2bObjectifEntry[],
  monthKey: string,
  fallback: number | null,
): number | null {
  if (history.length === 0) return fallback;

  const sorted = history
    .map((entry) => ({ ...entry, at: new Date(entry.changedAt).getTime() }))
    .filter((entry) => Number.isFinite(entry.at))
    .sort((a, b) => a.at - b.at);

  if (sorted.length === 0) return fallback;

  const end = monthEndOf(monthKey);
  let value = sorted[0].objectif;
  for (const entry of sorted) {
    if (entry.at > end) break;
    value = entry.objectif;
  }
  return value;
}

/** Every distinct threshold the history can put in force — for the wording. */
export function distinctGoals(
  history: B2bObjectifEntry[],
  monthKeys: string[],
  fallback: number | null,
): Array<number | null> {
  const seen = new Set<string>();
  monthKeys.forEach((key) => {
    const goal = goalForMonth(history, key, fallback);
    seen.add(goal === null ? 'none' : String(goal));
  });
  return [...seen].map((value) => (value === 'none' ? null : Number(value)));
}