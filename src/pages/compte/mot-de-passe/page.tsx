import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import PasswordField from '@/components/feature/PasswordField';
import AuthBrand from '@/pages/compte/components/AuthBrand';
import AuthSide from '@/pages/compte/components/AuthSide';
import { authErrorKey } from '@/pages/compte/components/authErrors';

export default function MotDePasse() {
  const { t } = useLang();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    if (password.length < 8) return setError(t('acct.errPwdShort'));
    if (password !== confirm) return setError(t('acct.errPwdMatch'));

    setBusy(true);
    setError('');
    try {
      const { error: failure } = await supabase.auth.updateUser({ password });
      if (failure) {
        setError(t(authErrorKey(failure.message)));
        return;
      }
      navigate('/compte', { replace: true });
    } catch {
      setError(t('acct.errNet'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <AuthBrand />
          <p className="stamp">{t('acct.reset.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('acct.reset.title') }} />
          <p className="lede">{t('acct.password.lede')}</p>
        </section>
        <section className="dir-body">
          <div className="auth-grid">
            {loading ? (
              <p>{t('acct.loading')}</p>
            ) : session ? (
              <form className="form-card auth-card" onSubmit={submit}>
                <PasswordField id="new-password" name="password" label={t('acct.pwd')} required minLength={8} />
                <PasswordField id="confirm-password" name="confirm" label={t('acct.pwd2')} required minLength={8} />
                <button type="submit" className="cta" disabled={busy}>
                  {busy ? t('acct.password.saving') : t('acct.password.submit')}
                </button>
                {error && <p className="form-msg err" role="alert">{error}</p>}
              </form>
            ) : (
              <div className="form-card auth-card">
                <p className="form-msg err">{t('acct.password.expired')}</p>
                <Link to="/compte/connexion">{t('acct.reset.back')}</Link>
              </div>
            )}
            <AuthSide variant="in" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
