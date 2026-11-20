import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';

type Props = { variant: 'up' | 'in' };

const ITEMS = [
  { icon: 'ri-folder-line', t: 'acct.s1t', p: 'acct.s1p' },
  { icon: 'ri-file-list-3-line', t: 'acct.s2t', p: 'acct.s2p' },
  { icon: 'ri-megaphone-line', t: 'acct.s3t', p: 'acct.s3p' },
];

export default function AuthSide({ variant }: Props) {
  const { t } = useLang();

  return (
    <aside className="auth-side">
      <section className="pro-card" data-reveal>
        <h2 className="pro-h">{t('acct.sideTitle')}</h2>
        <ul className="auth-list">
          {ITEMS.map((item) => (
            <li key={item.t}>
              <i className={item.icon} aria-hidden="true"></i>
              <div>
                <strong>{t(item.t)}</strong>
                <p>{t(item.p)}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="pro-note">
          <i className="ri-shield-check-line" aria-hidden="true"></i>
          {t('acct.private')}
        </p>
      </section>

      <section className="pro-card" data-reveal>
        {variant === 'up' ? (
          <>
            <h2 className="pro-h">{t('acct.haveAccount')}</h2>
            <p className="auth-note">{t('acct.in.lede')}</p>
            <Link to="/compte/connexion" className="ghost-link">
              {t('acct.toSignin')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </>
        ) : (
          <>
            <h2 className="pro-h">{t('acct.noAccount')}</h2>
            <p className="auth-note">{t('acct.up.lede')}</p>
            <Link to="/compte/inscription" className="ghost-link">
              {t('acct.toSignup')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </>
        )}
      </section>
    </aside>
  );
}