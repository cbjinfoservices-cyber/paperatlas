/** Records younger than thirty days are flagged as new across the site. */
export const NEW_DAYS = 30;

export const isWithinDays = (iso: string, days = NEW_DAYS) => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time < days * 24 * 60 * 60 * 1000;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * « il y a 3 semaines » — a coarse, readable span so two cards can be compared
 * at a glance. Days for the first week, weeks up to a month, then months, then
 * years; never a raw date, which forces the eye to do the arithmetic.
 */
export const relativeSince = (iso: string, locale: string): string => {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return '';
  const days = Math.floor((Date.now() - time) / DAY_MS);
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (days <= 0) return format.format(0, 'day');
  if (days < 7) return format.format(-days, 'day');
  if (days < 30) return format.format(-Math.floor(days / 7), 'week');
  if (days < 365) return format.format(-Math.floor(days / 30), 'month');
  return format.format(-Math.floor(days / 365), 'year');
};