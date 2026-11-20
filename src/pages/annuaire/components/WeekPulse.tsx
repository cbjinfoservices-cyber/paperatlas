import { useMemo } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { weeklyBuckets } from '@/lib/pulse';

type Props = {
  /**
   * Les dates des dépôts déjà filtrés : inscriptions de l'annuaire, annonces
   * publiées, offres déposées. La courbe suit donc le périmètre lu.
   */
  dates: string[];
};

/**
 * Seven seven-day bars, oldest on the left, the current week on the right in
 * accent. No axis, no labels on each bar: the shape is the message, and the
 * tooltip carries the exact dates when someone needs them.
 */
export default function WeekPulse({ dates }: Props) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);

  const points = useMemo(() => weeklyBuckets(dates, 7), [dates]);
  const counts = points.map((point) => point.count);
  const peak = Math.max(...counts, 1);
  const total = counts.reduce((sum, count) => sum + count, 0);

  const stamp = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }),
    [locale],
  );
  const day = (iso: string) => stamp.format(new Date(iso));

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="week-pulse">
      <div className="week-pulse-bars" aria-hidden="true">
        {points.map((point, index) => {
          const isNow = index === points.length - 1;
          return (
            <span
              key={point.start}
              className={`week-pulse-bar${isNow ? ' is-now' : ''}`}
              title={`${day(point.start)} — ${day(point.end)} · ${point.count}`}
            >
              <i style={{ height: `${Math.max(8, Math.round((point.count / peak) * 100))}%` }} />
            </span>
          );
        })}
      </div>
      <p className="week-pulse-cap">
        <span>{t('pulse.weeks')}</span>
        <b>{total}</b>
      </p>
      <span className="fresh-sr">
        {`${day(first.start)} — ${day(last.end)} · ${total}`}
      </span>
    </div>
  );
}