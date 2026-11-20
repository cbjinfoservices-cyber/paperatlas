import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { openConversation } from '@/lib/messaging';
import { exempleTelephone, indicatifDe } from '@/lib/pays';
import './apply-dialog.css';

type Props = {
  offreId: string;
  offreTitre: string;
  entreprise: string;
  entrepriseUserId: string | null;
  onClose: () => void;
};

export default function ApplyDialog({
  offreId,
  offreTitre,
  entreprise,
  entrepriseUserId,
  onClose,
}: Props) {
  const { t, lang } = useLang();
  const { session, compte, user } = useAuth();
  const location = useLocation();

  const [message, setMessage] = useState('');
  const [telephone, setTelephone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  /* The CV travels from the profile: a private file, referenced by its path. */
  const cvPath = compte?.cv_path ?? null;
  /* The phone example follows the country of the candidate's profile. */
  const pays = compte?.pays ?? '';

  useEffect(() => {
    setTelephone(compte?.telephone ?? '');
  }, [compte]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const nextPath = `${location.pathname}${location.search}`;
  const signupHref = `/compte/inscription/candidat?next=${encodeURIComponent(location.pathname)}`;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    const body = message.trim();
    if (!body) {
      setError(t('appl.errRequired'));
      return;
    }
    if (body.length > 500) {
      setError(t('appl.errLong'));
      return;
    }

    setSending(true);
    setError('');

    try {
      const { data: created, error: insertError } = await supabase
        .from('paperatlas_candidatures')
        .insert({
          user_id: user.id,
          offre_id: offreId,
          offre_titre: offreTitre,
          entreprise,
          entreprise_user_id: entrepriseUserId,
          candidat_nom: compte?.nom ?? null,
          candidat_email: compte?.email ?? user.email ?? null,
          telephone: telephone.trim() || null,
          cv_url: null,
          cv_path: cvPath,
          message: body,
        })
        .select('id')
        .maybeSingle();

      if (insertError) {
        setError(insertError.code === '23505' ? t('appl.errDuplicate') : t('appl.errSend'));
        return;
      }

      const candidatureId = (created?.id as string | undefined) ?? null;

      /* Best effort: the application is already saved, the e-mail never blocks it. */
      if (candidatureId) {
        /* L'accusé de réception part au candidat dans la seconde, et c'est lui
           qui date le dossier. */
        void supabase.functions
          .invoke('accuser-candidature', { body: { candidatureId, lang } })
          .catch(() => undefined);
        void supabase.functions
          .invoke('notifier-candidature', { body: { candidatureId, lang } })
          .catch(() => undefined);
      }

      if (entrepriseUserId) {
        const conversationId = await openConversation({
          meId: user.id,
          meNom: (compte?.nom || user.email || '').trim(),
          otherId: entrepriseUserId,
          otherNom: entreprise,
          sujet: offreTitre,
          kind: 'candidature',
          offreId,
          candidatureId,
          firstMessage: body,
        });
        setThreadId(conversationId);
      }

      setDone(true);
    } catch {
      setError(t('appl.errSend'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="apply-overlay" role="dialog" aria-modal="true" aria-labelledby="apply-title">
      <button type="button" className="apply-scrim" aria-label={t('appl.cancel')} onClick={onClose} />
      <div className="apply-card">
        <header className="apply-head">
          <div>
            <p className="stamp">{entreprise}</p>
            <h2 id="apply-title">{t('appl.title')}</h2>
            <p className="apply-sub">{offreTitre}</p>
          </div>
          <button type="button" className="apply-x" onClick={onClose} aria-label={t('appl.cancel')}>
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </header>

        {!session ? (
          <div className="apply-body">
            <p className="apply-note">
              <i className="ri-lock-line" aria-hidden="true"></i>
              {t('appl.loginText')}
            </p>
            <h3 className="apply-h3">{t('appl.loginTitle')}</h3>
            <div className="acct-actions">
              <Link to={signupHref} className="cta">
                {t('appl.loginCta')}
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
              <Link to={`/compte/connexion?next=${encodeURIComponent(nextPath)}`} className="ghost-btn">
                {t('appl.signin')}
              </Link>
            </div>
          </div>
        ) : done ? (
          <div className="apply-body">
            <div className="auth-done">
              <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
              <h3 className="apply-h3">{t('appl.ok')}</h3>
              <p className="auth-note">{threadId ? t('appl.okThread') : t('appl.okNote')}</p>
              <div className="acct-actions">
                {threadId ? (
                  <Link to={`/messages?c=${threadId}`} className="cta">
                    {t('appl.openThread')}
                    <i className="ri-chat-3-line" aria-hidden="true"></i>
                  </Link>
                ) : null}
                <Link to="/compte#mes-candidatures" className="ghost-btn">
                  {t('appl.goAccount')}
                </Link>
              </div>
            </div>
          </div>
        ) : compte && compte.role === 'pro' ? (
          <div className="apply-body">
            <p className="apply-note">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('appl.asPro')}
            </p>
            <p className="auth-note">{t('appl.switchHint')}</p>
            <div className="acct-actions">
              <Link to={signupHref} className="cta">
                {t('appl.loginCta')}
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
        ) : (
          <form className="apply-body" onSubmit={onSubmit}>
            <p className="apply-note">
              <i className="ri-user-smile-line" aria-hidden="true"></i>
              {t('appl.lede')}
            </p>

            <div className="fld">
              <label htmlFor="ap-msg">{t('appl.message')} *</label>
              <textarea
                id="ap-msg"
                name="message"
                required
                rows={5}
                maxLength={500}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('appl.messagePh')}
              />
              <small className="apply-count">{message.length}/500</small>
            </div>

            <div className="form-grid">
              <div className="fld">
                <label htmlFor="ap-tel" title={indicatifDe(pays)}>
                  {t('appl.phone')} · {indicatifDe(pays)}
                </label>
                <input
                  id="ap-tel"
                  name="telephone"
                  type="tel"
                  autoComplete="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder={exempleTelephone(pays)}
                />
              </div>
              <div className="fld">
                <label>{t('appl.cvProfile')}</label>
                <div className="apply-cv" data-ready={cvPath ? 'yes' : 'no'}>
                  <i className={cvPath ? 'ri-file-pdf-2-line' : 'ri-file-warning-line'} aria-hidden="true"></i>
                  <span>{cvPath ? t('appl.cvAttached') : t('appl.cvMissing')}</span>
                  <Link to="/compte/profil-candidat" className="apply-cv-link">
                    {t('appl.cvManage')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                </div>
              </div>
            </div>

            <div className="acct-actions">
              <button type="submit" className="cta" disabled={sending}>
                {sending ? t('appl.sending') : t('appl.submit')}
                <i className="ri-send-plane-line" aria-hidden="true"></i>
              </button>
              <button type="button" className="ghost-btn" onClick={onClose}>
                {t('appl.cancel')}
              </button>
            </div>

            {error && <p className="form-msg err">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}