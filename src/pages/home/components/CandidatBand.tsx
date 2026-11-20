import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';

/**
 * The candidate door, stated plainly on the home page: a visitor looking for a
 * job should not have to find the board to understand the site hires too.
 */
export default function CandidatBand() {
  const { t } = useLang();
  const { session } = useAuth();
  /* A signed-in candidate is sent to their profile instead of the form. */
  const href = session ? '/compte/profil-candidat' : '/compte/inscription/candidat';

  return (
    <section className="cand-band" aria-labelledby="cand-band-title">
      <div className="cand-band-inner">
        <div className="cand-band-copy">
          <p className="stamp">{t('candband.stamp')}</p>
          <h2
            className="cand-band-title"
            id="cand-band-title"
            dangerouslySetInnerHTML={{ __html: t('candband.title') }}
          />
          <p className="cand-band-text">{t('candband.text')}</p>
          <ul className="cand-band-chips">
            <li>
              <i className="ri-send-plane-line" aria-hidden="true"></i>
              {t('candband.c1')}
            </li>
            <li>
              <i className="ri-mail-check-line" aria-hidden="true"></i>
              {t('candband.c2')}
            </li>
            <li>
              <i className="ri-lock-line" aria-hidden="true"></i>
              {t('candband.c3')}
            </li>
          </ul>
        </div>

        <div className="cand-band-side">
          <Link to={href} className="cta cand-band-cta">
            <i className="ri-user-add-line" aria-hidden="true"></i>
            {t('candband.cta')}
          </Link>
          <Link to="/emplois" className="ghost-btn cand-band-alt">
            {t('candband.alt')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
          <p className="cand-band-hint">
            <i className="ri-shield-check-line" aria-hidden="true"></i>
            {t('candband.hint')}
          </p>
        </div>
      </div>
    </section>
  );
}