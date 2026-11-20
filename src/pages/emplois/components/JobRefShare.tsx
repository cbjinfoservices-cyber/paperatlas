import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { copyEmploiAddress, emploiRefHref } from '@/lib/emploiLinks';
import './job-ref.css';

type State = 'idle' | 'ok' | 'err';

/**
 * The reference of an offer, as a small door: one click copies the address of the
 * sheet with the reference inside, the same gesture as the B2B request references.
 */
export default function JobRefShare({
  offreId,
  reference,
  className = '',
}: {
  offreId: string;
  /** The reference printed on the sheet — written into the address. */
  reference: string;
  className?: string;
}) {
  const { t, lang } = useLang();
  const [state, setState] = useState<State>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const onCopy = useCallback(async () => {
    const ok = await copyEmploiAddress(emploiRefHref(offreId, reference, lang));
    setState(ok ? 'ok' : 'err');
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState('idle'), 2600);
  }, [offreId, reference, lang]);

  const icon = state === 'ok' ? 'ri-check-line' : state === 'err' ? 'ri-error-warning-line' : 'ri-link';
  const text = state === 'ok' ? t('share.copied') : state === 'err' ? t('share.failed') : t('jobd.shareRef');

  return (
    <button
      type="button"
      className={`jobd-refshare${state === 'ok' ? ' is-ok' : ''}${className ? ` ${className}` : ''}`}
      title={`${text} — ${reference}`}
      aria-live="polite"
      onClick={() => void onCopy()}
    >
      <i className={icon} aria-hidden="true"></i>
      <span className="whitespace-nowrap">{text}</span>
    </button>
  );
}