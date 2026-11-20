import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';

type State = 'idle' | 'ok' | 'err';

type Props = {
  /** Label shown while idle; the copied / failed labels come from the dictionary. */
  label: string;
  className?: string;
  /**
   * Les précisions à écrire dans le lien copié, en plus de la langue : le
   * métier d'un profil, le rayon d'où l'on vient. Une chaîne vide retire la
   * clé, pour qu'un lien ne promette pas ce qu'il ne montre pas.
   */
  params?: Record<string, string>;
};

/**
 * Copies the address of the current page so it can be pasted in a message.
 * Falls back to a hidden textarea when the clipboard API is unavailable.
 */
export default function CopyLinkButton({ label, className = 'share-btn', params }: Props) {
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
    let url = window.location.href;
    try {
      const next = new URL(window.location.href);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) next.searchParams.set(key, value);
          else next.searchParams.delete(key);
        });
      }
      next.searchParams.set('lang', lang);
      url = next.toString();
    } catch {
      /* keep the raw address */
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
  }, [flag, lang, params]);

  const icon = state === 'ok' ? 'ri-check-line' : state === 'err' ? 'ri-error-warning-line' : 'ri-share-forward-line';

  return (
    <button
      type="button"
      className={`${className}${state === 'ok' ? ' is-ok' : ''}`}
      onClick={copy}
      title={label}
      aria-live="polite"
    >
      <i className={icon} aria-hidden="true"></i>
      <span className="whitespace-nowrap">
        {state === 'ok' ? t('share.copied') : state === 'err' ? t('share.failed') : label}
      </span>
    </button>
  );
}