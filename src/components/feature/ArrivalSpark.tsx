import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { monthLong, monthTick } from '@/lib/dates';
import { arrivalHistory } from '@/lib/newcomers';
import { entreprises } from '@/mocks/entreprises';

type Props = {
  variant?: 'panel' | 'strip';
  /** When set, a toggle appears so the curve can be scoped to this trade alone. */
  trade?: string;
  /** Profile the visitor clicked a bar from, carried back to the directory. */
  originId?: string;
};

/**
 * The six-month arrival curve. Each bar is a door into the directory filtered on
 * that month's arrivals, and the best month of the six carries a small « peak »
 * marker so the shape reads even without the exact counts underneath. On a
 * company sheet it can also be scoped to the trade of that one profile.
 */
export default function ArrivalSpark({ variant = 'panel', trade = '', originId = '' }: Props) {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const [scope, setScope] = useState<'all' | 'trade'>('all');
  const canToggle = Boolean(trade);
  const mode = canToggle ? scope : 'all';

  const history = useMemo(() => {
    const pool = mode === 'trade' && trade
      ? entreprises.filter((e) => e.trade === trade)
      : entreprises;
    return arrivalHistory(6, pool);
  }, [mode, trade]);

  const counts = history.map((point) => point.count);
  const maxCount = Math.max(...counts, 1);
  const best = Math.max(...counts);
  const total = counts.reduce((sum, count) => sum + count, 0);

  /** The most recent best month wins when two months tie. */
  let peakIndex = -1;
  if (best > 0) {
    history.forEach((point, index) => {
      if (point.count === best) peakIndex = index;
    });
  }

  const openLabel = t('pulse.openMonth');
  const firstKey = history[0]?.key ?? '';
  const lastKey = history[history.length - 1]?.key ?? '';

  /** A bar keeps the chosen scope, and remembers the profile it was opened from. */
  const linkFor = (key: string): string => {
    const params = new URLSearchParams();
    params.set('month', key);
    if (mode === 'trade' && trade) params.set('trade', trade);
    if (originId) params.set('from', originId);
    return `/annuaire?${params.toString()}`;
  };

  return (
    <div className={`spark${variant === 'strip' ? ' spark--strip' : ''}`}>
      {canToggle && (
        <div className="spark-scope" role="group" aria-label={t('pro.sparkScope')}>
          <button
            type="button"
            className={mode === 'all' ? 'is-on' : ''}
            aria-pressed={mode === 'all'}
            onClick={() => setScope('all')}
          >
            {t('pro.sparkAll')}
          </button>
          <button
            type="button"
            className={mode === 'trade' ? 'is-on' : ''}
            aria-pressed={mode === 'trade'}
            onClick={() => setScope('trade')}
          >
            {t('pro.sparkTrade')}
          </button>
        </div>
      )}

      <p className="pulse-spark-head">
        <i className="ri-bar-chart-line" aria-hidden="true" />
        {t('pulse.spark')}
        <em>{total}</em>
      </p>

      <div className="spark-plot">
        {history.map((point, index) => {
          const isNow = index === history.length - 1;
          const isPeak = index === peakIndex;
          const month = monthLong(point.key, locale);
          return (
            <Link
              key={point.key}
              className={`spark-col${isNow ? ' is-now' : ''}${isPeak ? ' is-peak' : ''}`}
              to={linkFor(point.key)}
              title={`${month} · ${point.count} — ${openLabel}`}
              aria-label={`${month} · ${point.count} ${t('dir.results')} — ${openLabel}`}
            >
              {isPeak && <span className="spark-peak">{t('pulse.peak')}</span>}
              <i style={{ height: `${Math.max(4, Math.round((point.count / maxCount) * 100))}%` }} aria-hidden="true" />
            </Link>
          );
        })}
      </div>

      <div className="spark-ticks" aria-hidden="true">
        {history.map((point, index) => (
          <span
            key={point.key}
            className={`${index === history.length - 1 ? 'is-now' : ''}${index === peakIndex ? ' is-peak' : ''}`.trim()}
          >
            <b>{point.count}</b>
            <em>{monthTick(point.key, locale)}</em>
          </span>
        ))}
      </div>

      <span className="fresh-sr">{`${monthLong(firstKey, locale)} — ${monthLong(lastKey, locale)}`}</span>
    </div>
  );
}