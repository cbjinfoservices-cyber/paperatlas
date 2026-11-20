import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useDossiers, type Dossier } from '@/hooks/useDossiers';

/**
 * Recent dossiers (references created by a comparison or a quote request),
 * each one able to reopen its exact selection on the directory.
 */
export default function MyDossiers() {
  const { t, lang } = useLang();
  const { list, remove, clear } = useDossiers();
  const [, setParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<{ ref: string; ok: boolean } | null>(null);
  const wrap = useRef<HTMLDivElement | null>(null);
  const copyTimer = useRef<number | null>(null);
  /* Le dossier que les flèches du clavier mettent en avant : -1 tant qu'aucun
     ne l'est, et la liste elle-même prend le focus pour ce geste. */
  const [keyed, setKeyed] = useState(-1);
  const listRef = useRef<HTMLUListElement | null>(null);
  const refsKey = list.map((dossier) => dossier.ref).join(',');

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  /* Un dossier retiré ne garde pas sa mise en avant, et la liste refermée
     rend le geste au repos. */
  useEffect(() => {
    setKeyed(-1);
  }, [refsKey, open]);

  /* Le dossier mis en avant reste sous les yeux : la liste défile juste assez
     pour le garder dans le cadre. */
  useEffect(() => {
    if (keyed < 0) return;
    listRef.current?.querySelector('.doss-item.is-keyed')?.scrollIntoView({ block: 'nearest' });
  }, [keyed]);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(event.target as Node)) close();
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  /**
   * Reopenable URL of a whole selection — filters, tab and shortlist included,
   * plus the language, so a colleague lands in the same edition of the site.
   */
  const linkFor = (dossier: Dossier) => {
    const base = __BASE_PATH__.replace(/\/$/, '');
    const query = new URLSearchParams();
    query.set('list', dossier.ids.join(','));
    if (dossier.kind === 'auteurs') query.set('kind', 'auteurs');
    query.set('ref', dossier.ref);
    query.set('compare', '1');
    query.set('lang', lang);
    return `${window.location.origin}${base}/annuaire?${query.toString()}`;
  };

  const copyLink = async (dossier: Dossier) => {
    const url = linkFor(dossier);
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
    setCopied({ ref: dossier.ref, ok });
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied(null), 2600);
  };

  const reopen = (dossier: Dossier) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('list', dossier.ids.join(','));
      if (dossier.kind === 'auteurs') next.set('kind', 'auteurs');
      else next.delete('kind');
      return next;
    }, { replace: true });
    setOpen(false);
  };

  /**
   * Le même geste que les autres listes du site : les flèches parcourent les
   * dossiers (le geste boucle d'un bout à l'autre), Entrée rouvre celui qui
   * est mis en avant, Échap rend la liste au repos. Les boutons de la ligne
   * gardent leurs touches à eux : Entrée sur l'un d'eux ne fait que son geste.
   */
  const onListKey = (event: KeyboardEvent<HTMLUListElement>) => {
    if (list.length === 0) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setKeyed((current) => {
        if (event.key === 'ArrowDown') return current < list.length - 1 ? current + 1 : 0;
        return current > 0 ? current - 1 : list.length - 1;
      });
      return;
    }
    if (event.key === 'Escape') {
      setKeyed(-1);
      return;
    }
    if (event.key !== 'Enter') return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('button')) return;
    const chosen = list[keyed];
    if (!chosen) return;
    event.preventDefault();
    reopen(chosen);
  };

  if (list.length === 0) return null;

  const formatDate = (at: number) => new Intl.DateTimeFormat(localeFor(lang), {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(at));

  return (
    <div className="doss-wrap" ref={wrap}>
      <button
        type="button"
        className={`share-btn doss-btn${open ? ' is-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <i className="ri-folder-3-line" aria-hidden="true"></i>
        <span className="whitespace-nowrap">{t('doss.open')}</span>
        <span className="doss-count">{list.length}</span>
      </button>

      {open && (
        <div className="doss-panel" role="dialog" aria-label={t('doss.title')}>
          <div className="doss-head">
            <div>
              <p className="doss-title">{t('doss.title')}</p>
              <p className="doss-sub">{t('doss.sub')}</p>
            </div>
            <button type="button" className="doss-x" onClick={close} aria-label={t('cmp.close')}>
              <i className="ri-close-line" aria-hidden="true"></i>
            </button>
          </div>

          <ul
            className="doss-list"
            ref={listRef}
            tabIndex={0}
            aria-label={t('doss.title')}
            onKeyDown={onListKey}
          >
            {list.map((dossier, i) => (
              <li
                key={dossier.ref}
                className={`doss-item${i === keyed ? ' is-keyed' : ''}`}
                aria-current={i === keyed ? 'true' : undefined}
              >
                <div className="doss-item-top">
                  <span className="doss-ref" title={dossier.ref}>{dossier.ref}</span>
                  <span className="doss-date">{formatDate(dossier.at)}</span>
                </div>
                <p className="doss-names">
                  {dossier.names.slice(0, 3).join(' · ')}
                  {dossier.names.length > 3 ? ` +${dossier.names.length - 3}` : ''}
                </p>
                <div className="doss-item-actions">
                  <span className="doss-meta">
                    {dossier.ids.length} {t('doss.items')} · {t(dossier.kind === 'auteurs' ? 'dir.kindAuthors' : 'dir.kindBiz')}
                  </span>
                  <button
                    type="button"
                    className={`doss-copy${copied && copied.ref === dossier.ref ? (copied.ok ? ' is-ok' : ' is-err') : ''}`}
                    onClick={() => copyLink(dossier)}
                    title={t('doss.copy')}
                    aria-live="polite"
                  >
                    <i
                      className={copied && copied.ref === dossier.ref
                        ? (copied.ok ? 'ri-check-line' : 'ri-error-warning-line')
                        : 'ri-link'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {copied && copied.ref === dossier.ref
                        ? (copied.ok ? t('doss.copied') : t('doss.copyFail'))
                        : t('doss.copy')}
                    </span>
                  </button>
                  <button type="button" className="doss-reopen" onClick={() => reopen(dossier)}>
                    {t('doss.reopen')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </button>
                  <button
                    type="button"
                    className="doss-remove"
                    onClick={() => remove(dossier.ref)}
                    aria-label={t('doss.remove')}
                    title={t('doss.remove')}
                  >
                    <i className="ri-delete-bin-line" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {list.length > 1 && (
            <p className="doss-keyhint">
              <i className="ri-arrow-up-down-line" aria-hidden="true"></i>
              {t('doss.keyhint')}
            </p>
          )}

          <button type="button" className="doss-clear" onClick={clear}>
            <i className="ri-eraser-line" aria-hidden="true"></i>
            {t('doss.clear')}
          </button>
        </div>
      )}
    </div>
  );
}