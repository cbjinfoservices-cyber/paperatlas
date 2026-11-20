import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { isWithinDays } from '@/lib/freshness';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import { newestBiz } from '@/lib/newcomers';
import ArrivalPace from '@/components/feature/ArrivalPace';
import ArrivalSpark from '@/components/feature/ArrivalSpark';
import { annonces } from '@/mocks/annonces';
import { emplois, type Contract } from '@/mocks/emplois';

const CONTRACT_KEY: Record<Contract, string> = {
  cdi: 'job.typeCdi',
  cdd: 'job.typeCdd',
  stage: 'job.typeStage',
  freelance: 'job.typeFreelance',
};

/** The five freshest registrations of the whole directory. */
const latestBiz = newestBiz(5);

/** The five most recent deposits of each board, oldest dropped. */
const newestAnnonces = [...annonces]
  .sort((a, b) => b.posted.localeCompare(a.posted))
  .slice(0, 5);

const newestEmplois = [...emplois]
  .sort((a, b) => b.posted.localeCompare(a.posted))
  .slice(0, 5);

export default function LatestBoard() {
  const { t, lang } = useLang();
  const locale = localeFor(lang);
  const { hash } = useLocation();

  /* The footer links here from any page: land directly on the board. */
  useEffect(() => {
    if (hash !== '#derniers') return undefined;
    const el = document.getElementById('derniers');
    if (!el) return undefined;
    const id = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 140);
    return () => window.clearTimeout(id);
  }, [hash]);

  const stamp = (iso: string) => new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));

  const side = (iso: string) => (
    <span className="latest-side">
      {isWithinDays(iso) && <span className="latest-new">{t('last.new')}</span>}
      <span className="latest-date">{stamp(iso)}</span>
    </span>
  );

  return (
    <section className="latest" id="derniers" aria-labelledby="latest-title">
      <div className="latest-head">
        <p className="stamp" data-reveal>{t('last.stamp')}</p>
        <h2 className="latest-title" id="latest-title" data-reveal dangerouslySetInnerHTML={{ __html: t('last.title') }} />
        <p className="sub" data-reveal>{t('last.sub')}</p>
      </div>

      <div data-reveal>
        <ArrivalPace />
      </div>

      <div className="latest-spark" data-reveal>
        <ArrivalSpark variant="strip" />
      </div>

      <div className="latest-cols">
        <article className="latest-col" data-reveal>
          <div className="latest-col-head">
            <i className="ri-store-2-line" aria-hidden="true"></i>
            <h3>{t('last.biz')}</h3>
            <Link className="latest-more" to="/annuaire">
              {t('last.allBiz')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
          <ul className="latest-list">
            {latestBiz.map((biz) => (
              <li key={biz.id}>
                <Link className="latest-item" to={`/entreprise/${biz.id}`}>
                  <span className="latest-mark" aria-hidden="true">{biz.mark}</span>
                  <span className="latest-txt">
                    <strong>{nomDemo(biz.name, lang)}</strong>
                    <em>{nomCommune(biz.commune, lang)} · {biz.wilaya}</em>
                  </span>
                  {side(biz.joined)}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="latest-col" data-reveal>
          <div className="latest-col-head">
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            <h3>{t('last.annonces')}</h3>
            <Link className="latest-more" to="/annonces">
              {t('last.allAnnonces')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
          <ul className="latest-list">
            {newestAnnonces.map((ad) => (
              <li key={ad.id}>
                <Link className="latest-item" to={`/annonces/${ad.id}`}>
                  <span className="latest-mark" aria-hidden="true">
                    <i className="ri-price-tag-3-line"></i>
                  </span>
                  <span className="latest-txt">
                    <strong>{localize(ad.title, lang)}</strong>
                    <em>{ad.seller} · {ad.wilaya}</em>
                  </span>
                  {side(ad.posted)}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="latest-col" data-reveal>
          <div className="latest-col-head">
            <i className="ri-briefcase-line" aria-hidden="true"></i>
            <h3>{t('last.emplois')}</h3>
            <Link className="latest-more" to="/emplois">
              {t('last.allEmplois')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
          <ul className="latest-list">
            {newestEmplois.map((job) => (
              <li key={job.id}>
                <Link className="latest-item" to={`/emplois/${job.id}`}>
                  <span className="latest-mark" aria-hidden="true">{job.mark}</span>
                  <span className="latest-txt">
                    <strong>{localize(job.title, lang)}</strong>
                    <em>{job.company} · {t(CONTRACT_KEY[job.contract])}</em>
                  </span>
                  {side(job.posted)}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}