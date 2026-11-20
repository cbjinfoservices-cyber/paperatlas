import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { newestBiz } from '@/lib/newcomers';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';

/** Compact band of the three latest registrations, laid over the board pages. */
export default function NewcomerStrip() {
  const { t, lang } = useLang();
  const items = newestBiz(3);

  return (
    <section className="newcomers" aria-labelledby="newcomers-title">
      <div className="newcomers-head">
        <p className="stamp">{t('strip.stamp')}</p>
        <h2 className="newcomers-title" id="newcomers-title">{t('strip.title')}</h2>
      </div>
      <ul className="newcomers-list">
        {items.map((biz) => (
          <li key={biz.id}>
            <Link className="newcomers-item" to={`/entreprise/${biz.id}`}>
              <span className="newcomers-mark" aria-hidden="true">{biz.mark}</span>
              <span className="newcomers-txt">
                <strong>{nomDemo(biz.name, lang)}</strong>
                <em>{nomCommune(biz.commune, lang)} · {biz.wilaya}</em>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link className="newcomers-all" to="/annuaire?fresh=1">
        {t('strip.all')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </section>
  );
}