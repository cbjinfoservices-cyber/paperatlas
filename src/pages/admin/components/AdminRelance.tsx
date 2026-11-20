import { useMemo, useState } from 'react';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** L'adresse du compte relancé. */
  to: string;
  subject: string;
  /** Le message déjà écrit, que la console laisse relire et retoucher. */
  body: string;
  onClose: () => void;
};

/**
 * La relance d'un compte, posée au-dessus de sa fiche : le message part
 * pré-rempli — l'adresse, le récapitulatif des abonnements et les dépôts
 * encore en attente, avec leur âge. Rien n'est envoyé d'ici : on copie le
 * texte ou on l'ouvre dans le courrier, et le message reste modifiable.
 */
export default function AdminRelance({ to, subject, body, onClose }: Props) {
  const { t } = useLang();
  const [text, setText] = useState(body);

  const mailto = useMemo(
    () => `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`,
    [to, subject, text],
  );

  return (
    <div className="admin-relance-layer" role="dialog" aria-modal="true" aria-label={t('ad.r.title')}>
      <button
        type="button"
        className="admin-sheet-backdrop"
        aria-label={t('ad.r.close')}
        onClick={onClose}
      ></button>

      <div className="admin-relance">
        <header className="admin-relance-head">
          <div>
            <p className="admin-stamp">{t('ad.r.stamp')}</p>
            <h2 className="admin-relance-title">{t('ad.r.title')}</h2>
            <p className="admin-relance-to">
              <i className="ri-at-line" aria-hidden="true"></i>
              {to}
            </p>
          </div>
          <button type="button" className="admin-ghost" onClick={onClose}>
            <i className="ri-close-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.r.close')}</span>
          </button>
        </header>

        <p className="admin-sub">{t('ad.r.lead')}</p>

        <label className="admin-relance-field">
          <span>{t('ad.r.field')}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            spellCheck={false}
          />
        </label>

        <div className="admin-relance-actions">
          <span className="admin-relance-count">
            {t('ad.r.subjectLabel')} · {subject}
          </span>
          <CopyTextButton
            build={() => text}
            label={t('ad.r.copy')}
            hint={t('ad.r.copyHint')}
            className="admin-btn"
          />
          <a className="admin-btn" data-tone="accent" href={mailto}>
            <i className="ri-mail-send-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('ad.r.mail')}</span>
          </a>
        </div>
      </div>
    </div>
  );
}