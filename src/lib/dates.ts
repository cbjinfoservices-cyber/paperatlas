/** Short day + month + year, e.g. « 24 oct. 2026 », for the freshest arrivals. */
export const dayStamp = (iso: string, locale: string): string => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(time));
};

/** Short month + year, e.g. « oct. 2026 », shown on a directory card. */
export const monthYear = (iso: string, locale: string): string => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(new Date(time));
};

/** Long month + year, e.g. « octobre 2026 », for the momentum counters. */
export const monthLong = (key: string, locale: string): string => {
  const time = new Date(`${key}-01T00:00:00Z`).getTime();
  if (Number.isNaN(time)) return '';
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(time));
};

/** Short month only, e.g. « oct. », for the sparkline axis. */
export const monthTick = (key: string, locale: string): string => {
  const time = new Date(`${key}-01T00:00:00Z`).getTime();
  if (Number.isNaN(time)) return '';
  return new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(new Date(time));
};

/** Moves a YYYY-MM key by a number of months, forwards or backwards. */
export const shiftMonthKey = (key: string, delta: number): string => {
  const [year, month] = key.split('-').map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return key;
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

/** YYYY-MM bucket of an ISO date. */
export const monthKey = (iso: string): string => iso.slice(0, 7);