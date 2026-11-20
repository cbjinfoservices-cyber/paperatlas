import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { B2B_MOTIF_KEYS, type B2bMotifKey } from '@/lib/b2b';

const MAX_NOTE = 120;

type Props = {
  /** How many closures are on screen without a reason. */
  count: number;
  busy: boolean;
  /** The reason the workshop saved as its default, preselected here too. */
  defaultMotif: B2bMotifKey | null;
  /** Fills the reason on every listed closure; returns how many really moved. */
  onApply: (motif: string) => Promise<number | null>;
};

/**
 * « Sans motif » is a list of gaps. Rather than opening a panel request after
 * request, the workshop picks one reason here and applies it to the whole batch
 * — without reopening anything, and without moving a single handling date.
 */
export default function B2bMotifBulk({ count, busy, defaultMotif, onApply }: Props) {
  const { t } = useLang();
  const [picked, setPicked] = useState<B2bMotifKey>(defaultMotif ?? 'devis');
  const [note, setNote] = useState('');
  const [failure, setFailure] = useState('');

  if (count === 0) return null;

  const apply = async () => {
    setFailure('');
    const label = t(`acct.b2b.motif.${picked}`);
    const extra = note.trim();
    const value = (extra ? `${label} — ${extra}` : label).slice(0, 200);
    const moved = await onApply(value);
    if (moved === null) {
      setFailure(t('acct.b2b.bulkMotifFail'));
      return;
    }
    setNote('');
  };

  return (
    <div className="b2br-bulk">
      <p className="b2br-bulk-lead">
        <i className="ri-stack-line" aria-hidden="true"></i>
        {t('acct.b2b.bulkMotifLead')}
        <span className="capp-n">{count}</span>
      </p>

      <div className="b2br-solve-chips" role="group" aria-label={t('acct.b2b.bulkMotifLead')}>
        {B2B_MOTIF_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`b2br-solve-chip${picked === key ? ' is-on' : ''}`}
            aria-pressed={picked === key}
            onClick={() => setPicked(key)}
            disabled={busy}
          >
            {t(`acct.b2b.motif.${key}`)}
            {defaultMotif === key && <i className="ri-star-fill" aria-hidden="true"></i>}
          </button>
        ))}
      </div>

      <div className="b2br-bulk-row">
        <label className="b2br-solve-note" htmlFor="b2b-bulk-note">
          <span>{t('acct.b2b.motifNote')}</span>
          <input
            id="b2b-bulk-note"
            type="text"
            maxLength={MAX_NOTE}
            value={note}
            placeholder={t('acct.b2b.bulkMotifNotePh')}
            onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE))}
            disabled={busy}
          />
        </label>

        <button
          type="button"
          className="ad-btn ad-btn--solid b2br-bulk-go"
          disabled={busy}
          onClick={() => void apply()}
        >
          <i className={busy ? 'ri-loader-4-line is-spin' : 'ri-check-double-line'} aria-hidden="true"></i>
          {busy
            ? t('acct.b2b.bulkMotifBusy')
            : `${t('acct.b2b.bulkMotifGo')} (${count})`}
        </button>
      </div>

      {failure && <p className="form-msg err b2br-bulk-err">{failure}</p>}
    </div>
  );
}