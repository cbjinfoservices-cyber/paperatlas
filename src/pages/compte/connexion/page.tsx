import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';
import AuthSide from '@/pages/compte/components/AuthSide';
import AuthBrand from '@/pages/compte/components/AuthBrand';
import { authErrorKey } from '@/pages/compte/components/authErrors';
import PasswordField from '@/components/feature/PasswordField';

type Mode = 'signin' | 'reset';
type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function Connexion() {
  useSeo({ page: 'compte', path: '/compte/connexion' });
  const { t } = useLang();
  useReveal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  /* La page d'où le visiteur a été envoyé se connecter — « écrire à cet
     atelier », par exemple. Seules les adresses internes sont reprises :
     une adresse externe ne doit pas pouvoir servir de tremplin. */
  const wanted = params.get('next') ?? '';
  const backTo = wanted.startsWith('/') && !wanted.startsWith('//') ? wanted : '';

  const [mode, setMode] = useState<Mode>('signin');
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');

  const base = __BASE_PATH__.replace(/\/$/, '');

  const switchMode = (next: Mode) => {
    setMode(next);
    setStatus('idle');
    setFormError('');
  };

  const onSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');

    if (!email || !password) {
      setStatus('error');
      setFormError(t('acct.errRequired'));
      return;
    }

    setStatus('sending');
    setFormError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus('error');
        setFormError(t(authErrorKey(error.message)));
        return;
      }
      navigate(backTo || '/compte', { replace: true });
    } catch {
      setStatus('error');
      setFormError(t('acct.errNet'));
    }
  };

  const onReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '').trim();

    if (!email) {
      setStatus('error');
      setFormError(t('acct.errEmail'));
      return;
    }

    setStatus('sending');
    setFormError('');

    try {
      const redirectOrigin = import.meta.env.PROD ? 'https://paperatlas.net' : window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectOrigin}${base}/compte/mot-de-passe`,
      });
      if (error) {
        setStatus('error');
        setFormError(t(authErrorKey(error.message)));
        return;
      }
      setStatus('sent');
    } catch {
      setStatus('error');
      setFormError(t('acct.errNet'));
    }
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <AuthBrand />
          <p className="stamp">{mode === 'signin' ? t('acct.in.stamp') : t('acct.reset.stamp')}</p>
          <h1
            className="page-h1"
            dangerouslySetInnerHTML={{ __html: mode === 'signin' ? t('acct.in.title') : t('acct.reset.title') }}
          />
          <p className="lede">{mode === 'signin' ? t('acct.in.lede') : t('acct.reset.lede')}</p>
        </section>

        <section className="dir-body">
          <div className="auth-grid">
            {mode === 'signin' ? (
              <form className="form-card auth-card" id="account-signin" onSubmit={onSignIn} data-reveal>
                <div className="fld">
                  <label htmlFor="in-email">{t('cf.email')} *</label>
                  <input id="in-email" type="email" name="email" required autoComplete="email" placeholder={t('cf.emailPh')} />
                </div>
                <PasswordField
                  id="in-pwd"
                  name="password"
                  label={`${t('acct.pwd')} *`}
                  placeholder={t('acct.pwdPh')}
                  autoComplete="current-password"
                  required
                />

                <button type="submit" className="cta" disabled={status === 'sending'}>
                  {status === 'sending' ? t('acct.in.submitting') : t('acct.in.submit')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>

                {status === 'error' && <p className="form-msg err">{formError}</p>}

                <p className="auth-alt">
                  <button type="button" className="link-btn" onClick={() => switchMode('reset')}>
                    {t('acct.forgot')}
                  </button>
                </p>

                <div className="ct-signup auth-reminder">
                  <i className="ri-user-add-line" aria-hidden="true"></i>
                  <span>{t('acct.noAccount')}</span>
                  <Link to="/compte/inscription" className="ct-signup-link">
                    {t('acct.signupCta')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                </div>
              </form>
            ) : (
              <form className="form-card auth-card" id="account-reset" onSubmit={onReset} data-reveal>
                <div className="fld">
                  <label htmlFor="rs-email">{t('cf.email')} *</label>
                  <input id="rs-email" type="email" name="email" required autoComplete="email" placeholder={t('cf.emailPh')} />
                </div>

                <button type="submit" className="cta" disabled={status === 'sending'}>
                  {status === 'sending' ? t('acct.sending') : t('acct.reset.submit')}
                  <i className="ri-mail-send-line" aria-hidden="true"></i>
                </button>

                {status === 'sent' && <p className="form-msg ok">{t('acct.reset.sent')}</p>}
                {status === 'error' && <p className="form-msg err">{formError}</p>}

                <p className="auth-alt">
                  <button type="button" className="link-btn" onClick={() => switchMode('signin')}>
                    {t('acct.reset.back')}
                  </button>
                </p>
              </form>
            )}

            <AuthSide variant="in" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}