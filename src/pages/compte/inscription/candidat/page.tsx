import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/auth/AuthProvider';
import { exempleTelephone, indicatifDe, PAYS_DEFAUT, paysDevine } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import PaysSelect from '@/components/feature/PaysSelect';
import PasswordField from '@/components/feature/PasswordField';
import { authErrorKey } from '@/pages/compte/components/authErrors';
import AuthBrand from '@/pages/compte/components/AuthBrand';

const METIERS = ['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'auteur', 'fournisseur'];

type Status = 'idle' | 'sending' | 'confirm' | 'error';

/** Only in-app paths are honoured, so ?next= can never bounce elsewhere. */
function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '';
  return raw;
}

export default function CandidatInscription() {
  useSeo({ page: 'compte', path: '/compte/inscription/candidat' });
  const { t, lang } = useLang();
  const { compte, loading: authLoading } = useAuth();
  /* Arriving here while signed in as a business account is legitimate: the
     candidate profile is a second, separate account. Say it before the form. */
  const signedInAsPro = !authLoading && compte?.role === 'pro';
  useReveal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  /* The country picks the regions offered right below it. Guessed from where the
     visitor reads from, so the form does not open on Algeria for everyone. */
  const [pays, setPays] = useState(() => paysDevine());

  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resent, setResent] = useState(false);

  const base = __BASE_PATH__.replace(/\/$/, '');

  const goAfterSignup = () => {
    if (!next) {
      /* The profile is the next thing to fill in: métier, wilaya, bio and CV. */
      navigate('/compte/profil-candidat', { replace: true });
      return;
    }
    const joiner = next.includes('?') ? '&' : '?';
    navigate(`${next}${joiner}apply=1`, { replace: true });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const nom = String(data.get('nom') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    const accepted = data.get('accept') !== null;

    const fail = (key: string) => {
      setStatus('error');
      setFormError(t(key));
    };

    if (!nom || !email || !password) return fail('acct.errRequired');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('acct.errEmail');
    if (password.length < 8) return fail('acct.errPwdShort');
    if (password !== confirm) return fail('acct.errPwdMatch');
    if (!accepted) return fail('acct.errAccept');

    setStatus('sending');
    setFormError('');

    try {
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${base}/compte/profil-candidat`,
          data: {
            role: 'candidat',
            nom,
            organisme: null,
            metier: String(data.get('metier') || '').trim() || null,
            wilaya: String(data.get('wilaya') || '').trim() || null,
            pays: String(data.get('pays') || '').trim() || PAYS_DEFAUT,
            telephone: String(data.get('telephone') || '').trim() || null,
            bio: String(data.get('bio') || '').trim() || null,
            langue: lang,
          },
        },
      });

      if (error) {
        setStatus('error');
        setFormError(t(authErrorKey(error.message)));
        return;
      }

      if (result.session) {
        goAfterSignup();
        return;
      }

      setPendingEmail(email);
      setStatus('confirm');
      form.reset();
    } catch {
      setStatus('error');
      setFormError(t('acct.errNet'));
    }
  };

  /* The confirmation mail can get lost: resend it without retyping the form. */
  const resend = async () => {
    if (!pendingEmail) return;
    setResent(false);
    setFormError('');
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}${base}/compte/profil-candidat` },
      });
      setResent(true);
    } catch {
      setFormError(t('acct.errNet'));
    }
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <AuthBrand />
          <p className="stamp">{t('cand.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('cand.title') }} />
          <p className="lede">{t('cand.lede')}</p>
        </section>

        <section className="dir-body">
          <div className="auth-grid">
            {status === 'confirm' ? (
              <div className="form-card auth-card">
                <div className="auth-done">
                  <i className="ri-mail-check-line" aria-hidden="true"></i>
                  <h2 className="page-h2">{t('acct.confirmTitle')}</h2>
                  <p className="auth-note">{t('acct.confirmBody')}</p>
                  <p className="auth-note"><strong>{pendingEmail}</strong></p>
                  <p className="auth-note">{t('acct.confirmNote')}</p>
                  <p className="auth-note">
                    <i className="ri-user-star-line" aria-hidden="true"></i> {t('cand.joinNote')}
                  </p>
                  <div className="acct-actions">
                    <button type="button" className="cta" onClick={resend}>
                      <i className="ri-refresh-line" aria-hidden="true"></i>
                      {t('acct.resend')}
                    </button>
                    <Link to="/compte/connexion" className="ghost-btn">
                      {t('acct.toSignin')}
                    </Link>
                  </div>
                  {resent && <p className="form-msg ok">{t('acct.resent')}</p>}
                  {formError && <p className="form-msg err">{formError}</p>}
                </div>
              </div>
            ) : (
              <form className="form-card auth-card" id="candidate-signup" onSubmit={onSubmit} data-reveal>
                {signedInAsPro && (
                  <p className="auth-note cand-pro-note">
                    <i className="ri-information-line" aria-hidden="true"></i>
                    {t('cand.proSignedInNote')}
                  </p>
                )}
                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="cd-nom">{t('cand.name')} *</label>
                    <input id="cd-nom" name="nom" required autoComplete="name" placeholder={t('cand.namePh')} />
                  </div>
                  <div className="fld">
                    <label htmlFor="cd-email">{t('cand.email')} *</label>
                    <input id="cd-email" type="email" name="email" required autoComplete="email" placeholder={t('cf.emailPh')} />
                  </div>
                  <div className="fld">
                    <label htmlFor="cd-phone" title={indicatifDe(pays)}>
                      {t('cand.phone')} · {indicatifDe(pays)}
                    </label>
                    <input
                      id="cd-phone"
                      type="tel"
                      name="telephone"
                      autoComplete="tel"
                      placeholder={exempleTelephone(pays)}
                    />
                  </div>
                  <PaysSelect id="cd-pays" value={pays} onChange={setPays} />
                </div>

                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="cd-wilaya">{motDivision(pays, lang)}</label>
                    <select key={pays} id="cd-wilaya" name="wilaya" defaultValue="">
                      <option value="">{motDivision(pays, lang, 'tous')}</option>
                      {regionsWith(pays).map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                  <div className="fld">
                    <label htmlFor="cd-metier">{t('cand.metier')}</label>
                    <select id="cd-metier" name="metier" defaultValue="">
                      <option value="">{t('cand.metierAny')}</option>
                      {METIERS.map((key) => (
                        <option key={key} value={key}>{t(`opt.${key}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="fld">
                  <label htmlFor="cd-bio">{t('cand.bio')}</label>
                  <textarea id="cd-bio" name="bio" rows={3} maxLength={400} placeholder={t('cand.bioPh')} />
                </div>

                <div className="form-grid">
                  <PasswordField
                    id="cd-pwd"
                    name="password"
                    label={`${t('cand.pwd')} *`}
                    placeholder={t('acct.pwdPh')}
                    required
                    minLength={8}
                  />
                  <PasswordField
                    id="cd-pwd2"
                    name="confirm"
                    label={`${t('cand.pwd2')} *`}
                    placeholder={t('acct.pwdPh')}
                    required
                    minLength={8}
                  />
                </div>

                <p className="auth-note">
                  <i className="ri-file-pdf-2-line" aria-hidden="true"></i> {t('cand.cvLater')}
                </p>

                <label className="auth-check" htmlFor="cd-accept">
                  <input id="cd-accept" type="checkbox" name="accept" required />
                  <span>{t('cand.accept')}</span>
                </label>

                <button type="submit" className="cta" disabled={status === 'sending'}>
                  {status === 'sending' ? t('cand.submitting') : t('cand.submit')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>

                {status === 'error' && <p className="form-msg err">{formError}</p>}

                <p className="auth-alt">
                  <span>{t('cand.haveAccount')}</span>
                  <Link to="/compte/connexion">{t('cand.toSignin')}</Link>
                </p>
                <p className="auth-alt">
                  <span>{t('cand.proOnly')}</span>
                  <Link to="/compte/inscription">{t('cand.proLink')}</Link>
                </p>
              </form>
            )}

            <aside className="auth-side">
              <section className="pro-card">
                <h2 className="pro-h">{t('cand.sideTitle')}</h2>
                <ul className="auth-list">
                  <li>
                    <i className="ri-send-plane-line" aria-hidden="true"></i>
                    <div>
                      <strong>{t('cand.w1t')}</strong>
                      <p>{t('cand.w1p')}</p>
                    </div>
                  </li>
                  <li>
                    <i className="ri-file-list-3-line" aria-hidden="true"></i>
                    <div>
                      <strong>{t('cand.w2t')}</strong>
                      <p>{t('cand.w2p')}</p>
                    </div>
                  </li>
                  <li>
                    <i className="ri-chat-3-line" aria-hidden="true"></i>
                    <div>
                      <strong>{t('cand.w3t')}</strong>
                      <p>{t('cand.w3p')}</p>
                    </div>
                  </li>
                </ul>
              </section>
              <section className="pro-card">
                <h2 className="pro-h">{t('job.stamp')}</h2>
                <p className="auth-note">{t('job.sub')}</p>
                <Link to="/emplois" className="ghost-link">
                  {t('job.title').replace(/<[^>]+>/g, '')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </section>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}