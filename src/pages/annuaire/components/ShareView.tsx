import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';

type State = 'idle' | 'ok' | 'err';

/**
 * Copies the current URL — filters, radius, sort and shortlist are all in the
 * query string, so the copied link reopens the exact same view.
 */
export default function ShareView() {
  const { t, lang } = useLang();
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
    /** The link keeps the language it was copied in, so the receiver reads the same page. */
    let url = window.location.href;
    try {
      const next = new URL(window.location.href);
      next.searchParams.set('lang', lang);
      url = next.toString();
    } catch {
      /* fall back to the raw address */
    }
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
  }, [flag, lang]);

  return (
    <button
      type="button"
      className={`share-btn${state === 'ok' ? ' is-ok' : ''}`}
      onClick={copy}
      title={t('share.copy')}
      aria-live="polite"
    >
      <i
        className={state === 'ok' ? 'ri-check-line' : state === 'err' ? 'ri-error-warning-line' : 'ri-link'}
        aria-hidden="true"
      ></i>
      <span className="whitespace-nowrap">
        {state === 'ok' ? t('share.copied') : state === 'err' ? t('share.failed') : t('share.copy')}
      </span>
    </button>
  );
}