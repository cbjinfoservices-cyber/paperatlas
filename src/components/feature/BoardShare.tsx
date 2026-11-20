import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { boardShareUrl, type ShareScope } from '@/lib/shareScope';

type State = 'idle' | 'ok' | 'err';

type Props = {
  /** Le pays lu par le tableau, quand il en tient un. */
  pays?: string;
  /** La région lue sous ce pays : elle part avec lui, jamais seule. */
  wilaya?: string;
  /** L'ordre de lecture du tableau : il part avec le périmètre. */
  sort?: string;
  /** Le rayon lu, en kilomètres : il part avec le périmètre, jamais seul. */
  rayon?: string;
  /** La lettre de l'index d'où l'on se tient : le destinataire s'ouvre au
      même point de la liste rangée par nom. */
  lettre?: string;
};

/**
 * Copies the current address, filters included, so a board filtered down to
 * one wilaya and one contract reopens the same way for whoever receives it.
 *
 * Le pays et la région sont écrits dans l'adresse au moment du clic, pas
 * seulement ceux que l'adresse portait déjà : le lien rouvert montre donc
 * exactement le périmètre qu'on avait sous les yeux.
 */
export default function BoardShare({ pays, wilaya, sort, rayon, lettre }: Props = {}) {
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
    const scope: ShareScope = {};
    if (pays !== undefined) {
      scope.pays = pays;
      scope.wilaya = wilaya ?? '';
    }
    if (sort !== undefined) scope.sort = sort;
    if (rayon !== undefined) scope.rayon = rayon;
    if (lettre !== undefined) scope.lettre = lettre;
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
  }, [flag, lang, pays, wilaya, sort, rayon, lettre]);

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