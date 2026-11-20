import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { boardShareUrl, type ShareScope } from '@/lib/shareScope';
import './pays-tally.css';

export type PaysCount = { code: string; count: number };

type Props = {
  counts: PaysCount[];
  /** Everything counted, country filter left aside. */
  total: number;
  /** The country currently filtered, empty when all of them are shown. */
  active: string;
  onPick: (code: string) => void;
  /** Extra class for the places the counter is laid over the map. */
  className?: string;
  /** The copy action only makes sense where the country lives in the address. */
  share?: boolean;
  /**
   * The last chip of the row: it does not narrow the board, it groups it by
   * country — the same ordering as the sort select, without leaving the counter.
   * Only the boards that carry a country sort pass it.
   */
  paysSort?: { active: boolean; onToggle: () => void };
  /** The region to filter by, empty when all regions are shown. */
  region?: string;
};

type CopyState = 'idle' | 'ok' | 'err';

/**
 * The country counter above a board: how many rows come from each country, with
 * the whole stock first. It is a summary first and a filter second — picking a
 * chip narrows the list exactly like the country select of the filter row.
 */
export default function PaysTally({
  counts, total, active, onPick, className = '', share = true, paysSort, region,
}: Props) {
  const { t, lang } = useLang();
  const [copied, setCopied] = useState<CopyState>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const flag = useCallback((next: CopyState) => {
    setCopied(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied('idle'), 2600);
  }, []);

  /**
   * Copies the board with the country already kept in the address, so whoever
   * receives the link lands on the same selection instead of the whole stock.
   * La région suit le pays qu'elle habite : rendre le pays la rend avec lui.
   */
  const copy = useCallback(async () => {
    const scope: ShareScope = { pays: active };
    if (region !== undefined) scope.wilaya = active ? region : '';
    const url = boardShareUrl(window.location.href, lang, scope);

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const field = document.createElement('textarea');
        field.value = url;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.top = '-1000px';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        ok = document.execCommand('copy');
        document.body.removeChild(field);
      } catch {
        ok = false;
      }
    }
    flag(ok ? 'ok' : 'err');
  }, [active, flag, lang, region]);

  if (total === 0) return null;

  const shown = counts.filter((row) => row.count > 0);
  /* A country filtered on, with nothing left in it, keeps its chip: otherwise
     the visitor would not see which filter empties the list. */
  const orphan = active && !shown.some((row) => row.code === active) ? active : '';

  const icon = copied === 'ok'
    ? 'ri-check-line'
    : copied === 'err' ? 'ri-error-warning-line' : 'ri-link';

  return (
    <div className={`pays-tally${className ? ` ${className}` : ''}`} role="group" aria-label={t('pays.tally')}>
      <span className="pays-tally-label">
        <i className="ri-global-line" aria-hidden="true"></i>
        {t('pays.tally')}
      </span>
      <button
        type="button"
        className={`pays-tally-chip${active ? '' : ' is-on'}`}
        aria-pressed={!active}
        onClick={() => onPick('')}
      >
        <span className="pays-tally-name">{t('pays.all')}</span>
        <b>{total}</b>
      </button>
      {shown.map((row) => (
        <button
          key={row.code}
          type="button"
          className={`pays-tally-chip${active === row.code ? ' is-on' : ''}`}
          aria-pressed={active === row.code}
          onClick={() => onPick(row.code)}
        >
          <span className="pays-tally-name">{nomPays(row.code, lang)}</span>
          <b>{row.count}</b>
        </button>
      ))}
      {orphan && (
        <button
          type="button"
          className="pays-tally-chip is-on"
          aria-pressed
          onClick={() => onPick(orphan)}
        >
          <span className="pays-tally-name">{nomPays(orphan, lang)}</span>
          <b>0</b>
        </button>
      )}
      {paysSort && (
        <button
          type="button"
          className={`pays-tally-chip pays-tally-chip--sort${paysSort.active ? ' is-on' : ''}`}
          aria-pressed={paysSort.active}
          onClick={paysSort.onToggle}
          title={t('pays.sortHint')}
        >
          <i className="ri-sort-desc" aria-hidden="true"></i>
          {t('pays.sort')}
        </button>
      )}
      {share && (
        <span className="pays-tally-share">
          <button
            type="button"
            className={`pays-tally-copy${copied === 'ok' ? ' is-ok' : ''}`}
            onClick={copy}
            title={t('pays.share')}
            aria-live="polite"
          >
            <i className={icon} aria-hidden="true"></i>
            <span className="whitespace-nowrap">
              {copied === 'ok' ? t('share.copied') : copied === 'err' ? t('share.failed') : t('pays.share')}
            </span>
          </button>
        </span>
      )}
    </div>
  );
}