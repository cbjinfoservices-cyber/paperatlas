import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import type { Auteur } from '@/mocks/auteurs';

export default function AuthorAside({ item }: { item: Auteur }) {
  const { t, lang } = useLang();
  const statusKey = item.status === 'open' ? 'Open' : item.status === 'project' ? 'Project' : 'Full';

  return (
    <aside className="pro-side">
      <div className="pro-card pro-sticky" data-reveal>
        <h2 className="pro-h">{t('auth.avail')}</h2>
        <span className="auth-avail auth-avail--lg" data-state={item.status}>
          <i className="ri-calendar-check-line" aria-hidden="true"></i>{t(`auth.status${statusKey}`)}
        </span>
        <p className="auth-avail-note">{localize(item.availableFrom, lang)}</p>

        <h2 className="pro-h pro-h--spaced">{t('auth.languages')}</h2>
        <ul className="certs">
          {item.languages.map((l) => (
            <li key={l}><i className="ri-translate-2" aria-hidden="true"></i>{l}</li>
          ))}
        </ul>

        <h2 className="pro-h pro-h--spaced">{t('auth.contact')}</h2>
        <ul className="pro-contact">
          <li><i className="ri-mail-line" aria-hidden="true"></i><a href={`mailto:${item.email}`}>{item.email}</a></li>
          <li><i className="ri-phone-line" aria-hidden="true"></i><a href={`tel:${item.phone.replace(/\s/g, '')}`}>{item.phone}</a></li>
          <li><i className="ri-global-line" aria-hidden="true"></i><a href={`https://${item.website}`} target="_blank" rel="noopener noreferrer">{item.website}</a></li>
          <li><i className="ri-map-pin-line" aria-hidden="true"></i><span>{nomCommune(item.commune, lang)} · {nomRegion(item.wilaya, lang)}</span></li>
        </ul>
        <a className="cta cta--block" href={`mailto:${item.email}?subject=${encodeURIComponent(`Collaboration — ${item.name}`)}`}>
          {t('auth.propose')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </a>
        <Link className="ghost-link" to="/annuaire?kind=auteurs">
          <i className="ri-book-open-line" aria-hidden="true"></i>{t('dir.kindAuthors')}
        </Link>
      </div>
    </aside>
  );
}