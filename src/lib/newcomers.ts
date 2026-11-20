import { entreprises, type Entreprise } from '@/mocks/entreprises';
import { isWithinDays } from '@/lib/freshness';
import { monthKey, shiftMonthKey } from '@/lib/dates';

/** A profile, condensed for the "latest arrivals" boards. */
export type LatestBiz = {
  id: string;
  name: string;
  mark: string;
  trade: string;
  wilaya: string;
  commune: string;
  joined: string;
};

/** Every profile carries its own registration date, so nothing is guessed. */
export const joinedOn = (id: string): string => entreprises.find((e) => e.id === id)?.joined ?? '';

/** A profile counts as new while it is younger than thirty days. */
export const isNewcomer = (id: string): boolean => {
  const iso = joinedOn(id);
  if (!iso) return false;
  return isWithinDays(iso);
};

/** How many profiles currently sit inside the thirty-day window. */
export const newcomerCount = (pool: Entreprise[] = entreprises): number => pool.filter((e) => isWithinDays(e.joined)).length;

/** Registrations per calendar month, keyed YYYY-MM, across the whole catalogue. */
export const arrivalsByMonth = (pool: Entreprise[] = entreprises): Record<string, number> => {
  const counts: Record<string, number> = {};
  pool.forEach((e) => {
    const key = monthKey(e.joined);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return counts;
};

/** The YYYY-MM bucket of the most recent registration, empty when there is none. */
export const newestMonthKey = (pool: Entreprise[] = entreprises): string => pool
  .reduce((latest, e) => (e.joined > latest ? e.joined : latest), '')
  .slice(0, 7);

export type Momentum = { refKey: string; thisCount: number; prevCount: number };

/**
 * Registrations this month against the previous one. When the calendar month is
 * still empty the newest registration month is used instead, so the counters
 * never show a dead pair of zeros.
 */
export const arrivalMomentum = (pool: Entreprise[] = entreprises): Momentum => {
  const counts = arrivalsByMonth(pool);
  const nowKey = new Date().toISOString().slice(0, 7);
  const fallback = newestMonthKey(pool);
  const refKey = counts[nowKey] || !fallback ? nowKey : fallback;
  const prevKey = shiftMonthKey(refKey, -1);
  return { refKey, thisCount: counts[refKey] ?? 0, prevCount: counts[prevKey] ?? 0 };
};

export type MonthPoint = { key: string; count: number };

/**
 * The last `count` monthly buckets ending on the momentum reference month, so a
 * sparkline and the two counters above it always describe the same timeline.
 * The reference month always comes from the whole catalogue, so a trade-scoped
 * view shares the exact same six months as the directory-wide one.
 */
export const arrivalHistory = (count = 6, pool: Entreprise[] = entreprises): MonthPoint[] => {
  const { refKey } = arrivalMomentum();
  const map = arrivalsByMonth(pool);
  return Array.from({ length: count }, (_, i) => {
    const key = shiftMonthKey(refKey, i - (count - 1));
    return { key, count: map[key] ?? 0 };
  });
};

const DAY_MS = 24 * 60 * 60 * 1000;

export type WeekPoint = { start: string; end: string; count: number };

/**
 * Registrations per seven-day bucket, oldest first and ending today. The monthly
 * curve answers « how many »; this one answers « at what pace », which is the
 * only way to see a week that just started from a week that is already full.
 */
export const weeklyArrivals = (count = 7, pool: Entreprise[] = entreprises): WeekPoint[] => {
  const today = Date.now();
  const stamps = pool
    .map((e) => new Date(e.joined).getTime())
    .filter((time) => !Number.isNaN(time));
  return Array.from({ length: count }, (_, i) => {
    const back = count - 1 - i;
    const end = today - back * 7 * DAY_MS;
    const start = end - 7 * DAY_MS;
    const hits = stamps.filter((time) => time > start && time <= end).length;
    return {
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      count: hits,
    };
  });
};

const toLatest = (e: Entreprise): LatestBiz => ({
  id: e.id,
  name: e.name,
  mark: e.logoMark,
  trade: e.trade,
  wilaya: e.wilaya,
  commune: e.commune,
  joined: e.joined,
});

/** The most recent registrations across the whole catalogue, newest first. */
export const newestBiz = (count = 3): LatestBiz[] => [...entreprises]
  .sort((a, b) => b.joined.localeCompare(a.joined) || a.name.localeCompare(b.name, 'fr'))
  .slice(0, count)
  .map(toLatest);

/** The newest profiles of one wilaya (or of the whole catalogue when none is picked). */
export const latestInWilaya = (wilaya: string, count = 3): LatestBiz[] => [...entreprises]
  .filter((e) => !wilaya || e.wilaya === wilaya)
  .sort((a, b) => b.joined.localeCompare(a.joined) || a.name.localeCompare(b.name, 'fr'))
  .slice(0, count)
  .map(toLatest);

/**
 * How many profiles each trade would bring to a watch list: the whole matching
 * pool for the selected wilaya, so a visitor sees the size before subscribing.
 */
export const arrivalsByTrade = (wilaya: string): Record<string, number> => {
  const counts: Record<string, number> = {};
  entreprises.forEach((e) => {
    if (wilaya && e.wilaya !== wilaya) return;
    counts[e.trade] = (counts[e.trade] ?? 0) + 1;
  });
  return counts;
};

/** Profiles a subscription would cover, for the « all trades » counter. */
export const watchPoolSize = (wilaya: string): number => entreprises
  .filter((e) => !wilaya || e.wilaya === wilaya).length;