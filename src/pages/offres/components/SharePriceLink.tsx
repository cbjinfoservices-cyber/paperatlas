import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { lienPrix, usePrixPays } from '@/hooks/usePrixPays';

type State = 'idle' | 'ok' | 'err';

/**
 * Hands the pricing page over with the market already chosen: the colleague who
 * opens the link reads the same money, never the one their own browser guesses.
 * The address is written on every country change, so the button always copies
 * what is on screen.
 */
export default function SharePriceLink() {
  const { t, lang } = useLang();
  const { pays } = usePrixPays();
  const [state, setState] = useState<State>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const flag = useCallback((next: State) => {
    setState(next);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2600);
  }, []);

  const copy = useCallback(async () => {
    const url = lienPrix(pays, lang);
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
  }, [flag, lang, pays]);

  const icon = state === 'ok'
    ? 'ri-check-line'
    : state === 'err'
      ? 'ri-error-warning-line'
      : 'ri-link';

  return (
    <button
      type="button"
      className={`of-price-share${state === 'ok' ? ' is-ok' : ''}`}
      onClick={copy}
      title={t('ofp.shareLink')}
      aria-live="polite"
    >
      <i className={icon} aria-hidden="true"></i>
      <span className="whitespace-nowrap">
        {state === 'ok'
          ? t('share.copied')
          : state === 'err'
            ? t('share.failed')
            : t('ofp.shareLink')}
      </span>
    </button>
  );
}