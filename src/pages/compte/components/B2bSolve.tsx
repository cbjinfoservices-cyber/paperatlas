import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { B2B_MOTIF_KEYS, type B2bMotifKey, type DemandeB2b } from '@/lib/b2b';

const MAX_NOTE = 120;

type Props = {
  row: DemandeB2b;
  busy: boolean;
  /** The reason this workshop saved as its own default, if any. */
  defaultMotif: B2bMotifKey | null;
  savingDefault: boolean;
  onSolve: (motif: string) => Promise<boolean>;
  onDefault: (motif: B2bMotifKey | null) => Promise<boolean>;
  onNotice: (message: string) => void;
};

/**
 * « Marquer comme traitée » with a reason: the request leaves the waiting list
 * and the workshop keeps a written trace of what it answered — or why it passed.
 * A workshop that always closes the same way can save that reason once.
 */
export default function B2bSolve({
  row,
  busy,
  defaultMotif,
  savingDefault,
  onSolve,
  onDefault,
  onNotice,
}: Props) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<B2bMotifKey>(defaultMotif ?? 'devis');
  const [note, setNote] = useState('');

  const close = () => {
    setOpen(false);
    setNote('');
  };

  /* Opening the panel always starts on the saved reason: that is the point of
     remembering it — no click when the workshop is predictable. */
  const openPanel = () => {
    setPicked(defaultMotif ?? 'devis');
    setOpen(true);
  };

  const confirm = async () => {
    const label = t(`acct.b2b.motif.${picked}`);
    const extra = note.trim();
    const value = (extra ? `${label} — ${extra}` : label).slice(0, 200);
    const ok = await onSolve(value);
    if (ok) {
      close();
      onNotice(t('acct.b2b.motifDone'));
    }
  };

  if (!open) {
    return (
      <button type="button" className="ad-btn" onClick={openPanel} disabled={busy}>
        <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
        {t('acct.b2b.markTraitee')}
      </button>
    );
  }

  const isDefault = defaultMotif === picked;

  return (
    <div className="b2br-solve">
      <p className="b2br-solve-lead">
        <i className="ri-bookmark-line" aria-hidden="true"></i>
        {t('acct.b2b.motifPick')}
      </p>

      <div className="b2br-solve-chips" role="group" aria-label={t('acct.b2b.motifPick')}>
        {B2B_MOTIF_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`b2br-solve-chip${picked === key ? ' is-on' : ''}`}
            aria-pressed={picked === key}
            onClick={() => setPicked(key)}
          >
            {t(`acct.b2b.motif.${key}`)}
            {defaultMotif === key && <i className="ri-star-fill" aria-hidden="true"></i>}
          </button>
        ))}
      </div>

      {isDefault ? (
        <p className="b2br-solve-saved">
          <i className="ri-star-fill" aria-hidden="true"></i>
          {t('acct.b2b.motifDefaultOn')}
          <button
            type="button"
            className="b2br-solve-clear"
            disabled={savingDefault}
            onClick={() => void onDefault(null)}
          >
            {t('acct.b2b.motifDefaultClear')}
          </button>
        </p>
      ) : (
        <button
          type="button"
          className="b2br-solve-star"
          disabled={savingDefault}
          onClick={() => void onDefault(picked)}
        >
          <i className={savingDefault ? 'ri-loader-4-line is-spin' : 'ri-star-line'} aria-hidden="true"></i>
          {t('acct.b2b.motifSetDefault')}
        </button>
      )}

      <label className="b2br-solve-note" htmlFor={`motif-${row.id}`}>
        <span>{t('acct.b2b.motifNote')}</span>
        <input
          id={`motif-${row.id}`}
          type="text"
          maxLength={MAX_NOTE}
          value={note}
          placeholder={t('acct.b2b.motifNotePh')}
          onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE))}
        />
      </label>

      <div className="b2br-solve-actions">
        <button
          type="button"
          className="ad-btn ad-btn--solid"
          disabled={busy}
          onClick={() => void confirm()}
        >
          <i className={busy ? 'ri-loader-4-line is-spin' : 'ri-check-double-line'} aria-hidden="true"></i>
          {busy ? t('acct.b2b.motifSaving') : t('acct.b2b.motifSave')}
        </button>
        <button type="button" className="ad-btn" onClick={close} disabled={busy}>
          {t('acct.b2b.motifCancel')}
        </button>
      </div>
    </div>
  );
}