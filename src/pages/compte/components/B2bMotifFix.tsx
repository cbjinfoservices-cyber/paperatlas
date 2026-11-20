import { useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { B2B_MOTIF_KEYS, type B2bMotifKey, type DemandeB2b } from '@/lib/b2b';
import { detectMotif } from './b2bMotifs';

const MAX_NOTE = 120;

/** The workshop own note lives after a dash: « Devis envoyé — devis n° 114 ». */
function noteOf(motif?: string | null): string {
  const value = (motif ?? '').trim();
  if (!value) return '';
  const index = value.search(/ — | - /);
  if (index < 0) return '';
  return value.slice(index + 3).trim().slice(0, MAX_NOTE);
}

type Props = {
  row: DemandeB2b;
  busy: boolean;
  onFix: (motif: string) => Promise<boolean>;
  onNotice: (message: string) => void;
};

/**
 * Corrects the reason of a request that is already closed — without reopening it.
 * The status and the handling date do not move: the record gets straighter, the
 * measured reply time stays exactly what it was.
 */
export default function B2bMotifFix({ row, busy, onFix, onNotice }: Props) {
  const { t } = useLang();
  const existing = detectMotif(row.motif);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<B2bMotifKey>(existing ?? 'devis');
  const [note, setNote] = useState(noteOf(row.motif));

  const close = () => setOpen(false);

  const openPanel = () => {
    const current = detectMotif(row.motif);
    setPicked(current ?? 'devis');
    setNote(noteOf(row.motif));
    setOpen(true);
  };

  const confirm = async () => {
    const label = t(`acct.b2b.motif.${picked}`);
    const extra = note.trim();
    const value = (extra ? `${label} — ${extra}` : label).slice(0, 200);
    const ok = await onFix(value);
    if (ok) {
      close();
      onNotice(t('acct.b2b.motifFixed'));
    }
  };

  const hint = `${t('acct.b2b.treatedOn')} ${new Date(row.traitee_at ?? row.created_at).toLocaleDateString()}`;

  if (!open) {
    return (
      <button
        type="button"
        className={`ad-btn b2br-fix${existing ? '' : ' b2br-fix--missing'}`}
        onClick={openPanel}
        disabled={busy}
        title={hint}
      >
        <i className={existing ? 'ri-edit-line' : 'ri-error-warning-line'} aria-hidden="true"></i>
        {t('acct.b2b.motifFix')}
      </button>
    );
  }

  return (
    <div className="b2br-solve b2br-fix-panel">
      <p className="b2br-solve-lead">
        <i className="ri-edit-line" aria-hidden="true"></i>
        {t('acct.b2b.motifFixLead')}
      </p>

      <div className="b2br-solve-chips" role="group" aria-label={t('acct.b2b.motifFixLead')}>
        {B2B_MOTIF_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className={`b2br-solve-chip${picked === key ? ' is-on' : ''}`}
            aria-pressed={picked === key}
            onClick={() => setPicked(key)}
          >
            {t(`acct.b2b.motif.${key}`)}
          </button>
        ))}
      </div>

      <label className="b2br-solve-note" htmlFor={`fix-${row.id}`}>
        <span>{t('acct.b2b.motifNote')}</span>
        <input
          id={`fix-${row.id}`}
          type="text"
          maxLength={MAX_NOTE}
          value={note}
          placeholder={t('acct.b2b.motifNotePh')}
          onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE))}
        />
      </label>

      <div className="b2br-solve-actions">
        <button type="button" className="ad-btn ad-btn--solid" disabled={busy} onClick={() => void confirm()}>
          <i className={busy ? 'ri-loader-4-line is-spin' : 'ri-check-line'} aria-hidden="true"></i>
          {busy ? t('acct.b2b.motifSaving') : t('acct.b2b.motifFixSave')}
        </button>
        <button type="button" className="ad-btn" onClick={close} disabled={busy}>
          {t('acct.b2b.motifCancel')}
        </button>
      </div>
    </div>
  );
}