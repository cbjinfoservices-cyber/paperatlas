import { useMemo, useState } from 'react';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { useLang } from '@/i18n/LangProvider';
import { jour } from './adminTypes';

/** Ce que la feuille de réponse a besoin de savoir de la demande : de qui elle
 *  vient, sur quoi, et ce que le message disait. */
export type ReponseDemande = {
  nom: string | null;
  email: string | null;
  organisation: string | null;
  sujet: string;
  sujetLabel: string;
  message: string;
  created_at: string;
};

type Props = ReponseDemande & { onClose: () => void };

/** Le prénom seul suffit à saluer : « Bonjour Karim, » — pas le nom complet. */
function prenom(nom?: string | null): string {
  const mot = (nom || '').trim().split(/\s+/)[0];
  return mot || '';
}

/** Le message rappelé, chaque ligne citée : le destinataire relit ce qu'il a
 *  écrit sans avoir à retrouver son envoi. */
function citer(message?: string | null): string[] {
  return (message || '')
    .split(/\r?\n/)
    .map((ligne) => ligne.trim())
    .filter(Boolean)
    .map((ligne) => `> ${ligne}`);
}

/**
 * Une réponse posée au-dessus de la console : l'adresse est déjà celle de
 * l'expéditeur, l'objet reprend le sujet de sa demande, et le corps s'ouvre sur
 * le rappel de son message. Rien n'est envoyé d'ici — on copie le texte ou on
 * l'ouvre dans le courrier, et le message reste modifiable.
 */
export default function AdminDemandeReponse({
  nom,
  email,
  organisation,
  sujetLabel,
  message,
  created_at,
  onClose,
}: Props) {
  const { t, lang } = useLang();

  const objet = t('adm.reply.subjectLine').replace('{sujet}', sujetLabel || t('adm.noSubject'));

  const base = useMemo(() => {
    const qui = prenom(nom);
    const date = jour(created_at, lang);
    return [
      t(qui ? 'adm.reply.greet' : 'adm.reply.greetAll').replace('{nom}', qui),
      '',
      t('adm.reply.intro'),
      '',
      t('adm.reply.recallHead')
        .replace('{date}', date)
        .replace('{sujet}', sujetLabel || t('adm.noSubject')),
      ...citer(message),
      '',
      t('adm.reply.outro'),
      t('adm.reply.sign'),
    ].join('\n');
  }, [created_at, lang, message, nom, sujetLabel, t]);

  const [text, setText] = useState(base);

  const to = (email || '').trim();
  const mailto = useMemo(
    () => `mailto:${to}?subject=${encodeURIComponent(objet)}&body=${encodeURIComponent(text)}`,
    [objet, text, to],
  );

  const de = [nom, organisation].filter(Boolean).join(' · ');

  return (
    <div
      className="admin-relance-layer"
      role="dialog"
      aria-modal="true"
      aria-label={t('adm.reply.title')}
    >
      <button
        type="button"
        className="admin-sheet-backdrop"
        aria-label={t('adm.reply.close')}
        onClick={onClose}
      ></button>

      <div className="admin-relance">
        <header className="admin-relance-head">
          <div>
            <p className="admin-stamp">{t('adm.reply.stamp')}</p>
            <h2 className="admin-relance-title">{t('adm.reply.title')}</h2>
            {de && <p className="admin-relance-to">{de}</p>}
            <p className="admin-relance-to">
              <i className="ri-at-line" aria-hidden="true"></i>
              {to || t('adm.reply.noEmail')}
            </p>
          </div>
          <button type="button" className="admin-ghost" onClick={onClose}>
            <i className="ri-close-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('adm.reply.close')}</span>
          </button>
        </header>

        <p className="admin-sub">{t('adm.reply.lead')}</p>

        <label className="admin-relance-field">
          <span>{t('adm.reply.field')}</span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={14}
            spellCheck={false}
          />
        </label>

        <div className="admin-relance-actions">
          <span className="admin-relance-count">
            {t('adm.reply.subjectLabel')} · {objet}
          </span>
          <CopyTextButton
            build={() => text}
            label={t('adm.reply.copy')}
            hint={t('adm.reply.copyHint')}
            className="admin-btn"
          />
          {to ? (
            <a className="admin-btn" data-tone="accent" href={mailto}>
              <i className="ri-mail-send-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('adm.reply.mail')}</span>
            </a>
          ) : (
            <button type="button" className="admin-btn" data-tone="accent" disabled>
              <i className="ri-mail-forbid-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('adm.reply.mail')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}