import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { monthLong, shiftMonthKey } from '@/lib/dates';
import { arrivalMomentum } from '@/lib/newcomers';

/**
 * One compact line of momentum above the home board: how many profiles landed
 * this month, next to last month, and a shortcut to the fresh arrivals.
 */
export default function ArrivalPace() {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const { refKey, thisCount, prevCount } = arrivalMomentum();
  const prevKey = shiftMonthKey(refKey, -1);

  /** Growth reads at a glance, without any mental arithmetic. */
  const delta = thisCount - prevCount;
  const trend = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const trendIcon = trend === 'up' ? 'ri-arrow-up-line' : trend === 'down' ? 'ri-arrow-down-line' : 'ri-subtract-line';
  const trendLabel = t(`pulse.${trend}`);

  return (
    <div className="pace">
      <p className="pace-stamp">
        <i className="ri-pulse-line" aria-hidden="true" />
        {t('pulse.stamp')}
      </p>

      <p className="pace-line is-now">
        <strong>{thisCount}</strong>
        <span>{t('pulse.now')}</span>
        <em>{monthLong(refKey, locale)}</em>
      </p>

      <span className={`pace-trend is-${trend}`} title={`${trendLabel} · ${delta > 0 ? '+' : ''}${delta}`}>
        <i className={trendIcon} aria-hidden="true" />
        <b>{delta > 0 ? `+${delta}` : delta}</b>
        <span className="fresh-sr">{trendLabel}</span>
      </span>

      <i className="pace-sep" aria-hidden="true" />

      <p className="pace-line">
        <strong>{prevCount}</strong>
        <span>{t('pulse.prev')}</span>
        <em>{monthLong(prevKey, locale)}</em>
      </p>

      <Link className="pace-link" to="/annuaire?fresh=1">
        {t('strip.all')}
        <i className="ri-arrow-right-line" aria-hidden="true" />
      </Link>
    </div>
  );
}