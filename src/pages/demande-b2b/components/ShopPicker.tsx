import { useMemo, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { entreprises, trades, wilayas, type Trade } from '@/mocks/entreprises';
import type { B2bTarget } from '@/lib/b2b';

type Props = {
  selected: B2bTarget[];
  max: number;
  onToggle: (target: B2bTarget) => void;
  onClear: () => void;
};

/**
 * Left column: which workshops the request is addressed to. Search by name,
 * city or trade, narrow by wilaya, then pick up to five.
 */
export default function ShopPicker({ selected, max, onToggle, onClear }: Props) {
  const { t } = useLang();
  const [needle, setNeedle] = useState('');
  const [wilaya, setWilaya] = useState('');
  const [trade, setTrade] = useState<'' | Trade>('');

  const pickedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected]);
  const full = selected.length >= max;
  const q = needle.trim().toLowerCase();

  const list = useMemo(() => entreprises
    .filter((e) => {
      if (wilaya && e.wilaya !== wilaya) return false;
      if (trade && e.trade !== trade) return false;
      if (!q) return true;
      const hay = [e.name, e.wilaya, e.commune, e.blurb.fr, e.blurb.ar, e.blurb.en ?? ''].join(' ').toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'fr')), [q, wilaya, trade]);

  const reset = () => {
    setNeedle('');
    setWilaya('');
    setTrade('');
  };

  return (
    <section className="b2b-pick" aria-labelledby="b2b-pick-title">
      <div className="b2b-pick-head">
        <div>
          <h2 id="b2b-pick-title" className="b2b-pick-title">
            {t('b2b.pick')}
            <span className="b2b-pick-count" data-full={full ? 'yes' : 'no'}>
              {selected.length} / {max}
            </span>
          </h2>
          <p className="b2b-pick-hint">{full ? t('b2b.pickFull') : t('b2b.pickHint')}</p>
        </div>
        {selected.length > 0 && (
          <button type="button" className="b2b-pick-clear" onClick={onClear}>
            <i className="ri-close-line" aria-hidden="true"></i>
            {t('b2b.pickClear')}
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <ul className="b2b-chips">
          {selected.map((item) => (
            <li key={item.id}>
              <button type="button" className="b2b-chip" onClick={() => onToggle(item)} title={t('b2b.pickClear')}>
                <i className="ri-close-line" aria-hidden="true"></i>
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="b2b-filters">
        <div className="b2b-search">
          <i className="ri-search-line" aria-hidden="true"></i>
          <input
            type="search"
            value={needle}
            onChange={(event) => setNeedle(event.target.value)}
            placeholder={t('b2b.pickSearch')}
            aria-label={t('b2b.pickSearch')}
            autoComplete="off"
          />
          {needle && (
            <button type="button" className="b2b-search-x" onClick={() => setNeedle('')} aria-label={t('cmp.close')}>
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          )}
        </div>
        <div className="b2b-selects">
          <select value={wilaya} onChange={(event) => setWilaya(event.target.value)} aria-label={t('dir.wilaya')}>
            <option value="">{t('b2b.pickWilaya')}</option>
            {wilayas.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
          <select value={trade} onChange={(event) => setTrade(event.target.value as '' | Trade)} aria-label={t('dir.trade')}>
            <option value="">{t('dir.allT')}</option>
            {trades.map((key) => <option key={key} value={key}>{t(`trade.${key}`)}</option>)}
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="b2b-pick-empty">
          <i className="ri-search-eye-line" aria-hidden="true"></i>
          <p>{t('b2b.pickEmpty')}</p>
          <button type="button" className="ghost-btn" onClick={reset}>{t('dir.reset')}</button>
        </div>
      ) : (
        <ul className="b2b-shops">
          {list.map((shop) => {
            const picked = pickedIds.has(shop.id);
            const blocked = !picked && full;
            return (
              <li key={shop.id}>
                <button
                  type="button"
                  className="b2b-shop"
                  data-on={picked ? 'yes' : 'no'}
                  aria-pressed={picked}
                  disabled={blocked}
                  onClick={() => onToggle({ id: shop.id, name: shop.name })}
                >
                  <span className="b2b-shop-mark" aria-hidden="true">{shop.logoMark}</span>
                  <span className="b2b-shop-txt">
                    <strong>{shop.name}</strong>
                    <em>{t(`trade.${shop.trade}`)} · {shop.commune} · {shop.wilaya}</em>
                  </span>
                  <span className="b2b-shop-state" aria-hidden="true">
                    <i className={picked ? 'ri-checkbox-circle-fill' : 'ri-add-circle-line'}></i>
                  </span>
                  <span className="b2b-shop-note">{picked ? t('b2b.picked') : t('b2b.pickOne')}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}