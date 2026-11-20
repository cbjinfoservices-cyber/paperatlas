import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { b2bDuelHref, b2bMonthHref, b2bRequestHref } from '@/lib/b2bLinks';

type State = 'idle' | 'ok' | 'err';

/* The three addresses live in a plain module: the CSV export builds the very
   same links, so a reference written in a spreadsheet opens the same screen. */
export { b2bDuelHref, b2bMonthHref, b2bRequestHref };

/** Copies an address, with the hidden-field fallback of the other share buttons. */
export async function copyB2bAddress(href: string): Promise<boolean> {
  if (!href) return false;
  let ok = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(href);
      ok = true;
    }
  } catch {
    ok = false;
  }
  if (!ok) {
    try {
      const field = document.createElement('textarea');
      field.value = href;
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
  return ok;
}

/**
 * One share door, four uses: the longest month of the strip, every row of the
 * twelve-month table, any single request of the inbox, and the duel of two
 * months. Same copy, same confirmation, same fallback — one gesture learned once.
 */
export default function B2bShareLink({
  href,
  label,
  hint,
  className = '',
  iconOnly = false,
}: {
  href: string;
  /** What the door says when idle. */
  label: string;
  /** The sentence read on hover, and the accessible name of an icon door. */
  hint?: string;
  className?: string;
  /** Icon only, for the tight rows of the twelve-month table. */
  iconOnly?: boolean;
}) {
  const { t } = useLang();
  const [state, setState] = useState<State>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyB2bAddress(href);
    setState(ok ? 'ok' : 'err');
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2600);
  }, [href]);

  const icon =
    state === 'ok' ? 'ri-check-line' : state === 'err' ? 'ri-error-warning-line' : 'ri-link';
  const text =
    state === 'ok' ? t('share.copied') : state === 'err' ? t('share.failed') : label;

  return (
    <button
      type="button"
      className={`${className}${state === 'ok' ? ' is-ok' : ''}`}
      title={hint ? `${text} — ${hint}` : text}
      aria-label={iconOnly ? (hint ?? label) : undefined}
      aria-live={iconOnly ? undefined : 'polite'}
      onClick={() => void onCopy()}
    >
      <i className={icon} aria-hidden="true"></i>
      {!iconOnly && <span>{text}</span>}
    </button>
  );
}