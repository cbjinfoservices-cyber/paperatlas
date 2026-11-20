import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';

type Props = {
  wilaya: string;
  pays: string;
  /** Le tableau qui porte la ligne : l'annuaire par défaut, ou un autre board. */
  basePath?: string;
  /** La région est-elle dite ici ? Quand le rappel de région, posé au-dessus
      des résultats, la nomme déjà avec sa part, cette ligne ne la répète pas
      et garde le pays seul. */
  regionInScope?: boolean;
};

type Part = { key: string; label: string; to: string };
type CopyState = 'idle' | 'ok' | 'err';

/**
 * The perimeter being read, on one line, right above the results.
 *
 * The filter row spreads the same choices across five fields; the chips below
 * it carry them in different places. This line puts the two that name a place
 * — the region and the country — side by side, so a reader knows at a glance
 * where the list comes from before scrolling it. The establishment type has
 * its own reminder right above the results, so it is not said twice here.
 *
 * Each part is a real link whose address carries the perimeter without it:
 * the link can be copied, opened in a new tab, or reloaded, and it always
 * reopens the same view with that one choice handed back. The small door at
 * the end of the line takes the whole address as it stands, so the exact
 * view can leave in one gesture.
 */
export default function ScopeLine({ wilaya, pays, basePath = '/annuaire', regionInScope = true }: Props) {
  const { t, lang } = useLang();
  const [params] = useSearchParams();
  const [copied, setCopied] = useState<CopyState>('idle');
  const copyTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
  }, []);

  /* The address of one part handed back: every other choice stays exactly
     where it is, and the batch count rewinds with the narrower list. */
  const without = (...keys: string[]): string => {
    const next = new URLSearchParams(params);
    keys.forEach((key) => next.delete(key));
    next.delete('shown');
    const query = next.toString();
    return `${basePath}${query ? `?${query}` : ''}`;
  };

  /* The whole perimeter, exactly as it is in the bar: the copied address
     reopens this very view, language and batch count included. */
  const copyScope = useCallback(async () => {
    const url = window.location.href;
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
    setCopied(ok ? 'ok' : 'err');
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied('idle'), 2600);
  }, []);

  const parts: Part[] = [];
  /* La région n'est tue que si le pays est là pour la porter : une région
     seule reste nommée ici, sinon la ligne ne dirait plus rien du périmètre. */
  if (wilaya && (regionInScope || !pays)) {
    parts.push({ key: 'wilaya', label: nomRegion(wilaya, lang), to: without('wilaya') });
  }
  if (pays) {
    /* A region only makes sense inside its own country: handing the country
       back hands the region back with it, in the link as in the field. */
    parts.push({ key: 'pays', label: nomPays(pays, lang), to: without('pays', 'wilaya') });
  }

  return (
    <div className={`dir-scope${parts.length === 0 ? ' is-all' : ''}`} aria-live="polite">
      <span className="dir-scope-lab">
        <i className="ri-focus-3-line" aria-hidden="true"></i>
        {t('dir.scope')}
      </span>
      {parts.length === 0 ? (
        <span className="dir-scope-all">{t('dir.scopeAll')}</span>
      ) : (
        <span className="dir-scope-parts">
          {parts.map((part, i) => (
            <span className="dir-scope-part" key={part.key}>
              {i > 0 && <em className="dir-scope-sep" aria-hidden="true">·</em>}
              <Link
                className="dir-scope-chip"
                to={part.to}
                title={t('dir.scopeClear')}
                aria-label={`${part.label} — ${t('dir.scopeClear')}`}
              >
                <span>{part.label}</span>
                <i className="ri-close-line" aria-hidden="true"></i>
              </Link>
            </span>
          ))}
        </span>
      )}
      {/* One gesture, the exact address: the perimeter leaves as a link,
          ready to be pasted in a message. */}
      <button
        type="button"
        className={`dir-scope-copy${copied === 'ok' ? ' is-ok' : ''}`}
        onClick={copyScope}
        aria-live="polite"
        aria-label={copied === 'ok' ? t('share.copied') : t('dir.scopeCopy')}
        title={t('dir.scopeCopy')}
      >
        <i
          className={copied === 'ok' ? 'ri-check-line' : copied === 'err' ? 'ri-error-warning-line' : 'ri-link'}
          aria-hidden="true"
        ></i>
        <span className="whitespace-nowrap">
          {copied === 'ok' ? t('share.copied') : copied === 'err' ? t('share.failed') : t('dir.scopeCopy')}
        </span>
      </button>
    </div>
  );
}