import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '@/i18n/LangProvider';

type State = 'idle' | 'ok' | 'err';

type Props = {
  /** Built at click time, so the text always follows the current board. */
  build: () => string;
  /** Label shown while idle; the copied / failed labels come from the dictionary. */
  label: string;
  /** Longer explanation, shown on hover. */
  hint?: string;
  className?: string;
  /** Called once the text really reached the clipboard — never on a failure,
   *  so a trace of what circulated can never be written by a broken copy. */
  onCopied?: () => void;
  /** Un complément de la pastille qui ne se copie pas : un compte, une date,
   *  une unité — il vit dans le bouton sans entrer dans le message. */
  trailing?: ReactNode;
};

/**
 * Copies a block of plain text — a digest of the board, ready to paste in a
 * message or an e-mail. Falls back to a hidden textarea when the clipboard API
 * is unavailable, like the other copy controls of the site.
 */
export default function CopyTextButton({
  build, label, hint = '', className = 'share-btn', onCopied, trailing = null,
}: Props) {
  const { t } = useLang();
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
    const text = build();
    if (!text.trim()) {
      flag('err');
      return;
    }

    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const field = document.createElement('textarea');
        field.value = text;
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
    if (ok) onCopied?.();
  }, [build, flag, onCopied]);

  const icon = state === 'ok' ? 'ri-check-line' : state === 'err' ? 'ri-error-warning-line' : 'ri-file-copy-2-line';

  return (
    <button
      type="button"
      className={`${className}${state === 'ok' ? ' is-ok' : ''}`}
      onClick={() => void copy()}
      title={hint || label}
      aria-live="polite"
    >
      <i className={icon} aria-hidden="true"></i>
      <span className="whitespace-nowrap">
        {state === 'ok' ? t('share.copied') : state === 'err' ? t('share.failed') : label}
      </span>
      {trailing}
    </button>
  );
}