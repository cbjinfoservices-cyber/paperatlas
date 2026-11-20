import { useLang } from '@/i18n/LangProvider';
import type { Entreprise } from '@/mocks/entreprises';
import DistanceCard from './DistanceCard';

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function ProfileAside({ item }: { item: Entreprise }) {
  const { t } = useLang();
  const today = DAYS[new Date().getDay()];

  return (
    <aside className="pro-side">
      <DistanceCard item={item} />
      <div className="pro-card pro-sticky" data-reveal>
        <h2 className="pro-h">{t('pro.hours')}</h2>
        <ul className="hours">
          {item.hours.map((h) => (
            <li key={h.d} className={h.d === today ? 'is-today' : ''}>
              <span>{t(`day.${h.d}`)}</span>
              <span className="hours-v">{h.h === 'CLOSED' ? t('pro.closed') : h.h}</span>
            </li>
          ))}
        </ul>
        <p className="pro-note"><i className="ri-information-line" aria-hidden="true"></i>{t('pro.hoursNote')}</p>

        <h2 className="pro-h pro-h--spaced">{t('pro.certs')}</h2>
        <ul className="certs">
          {item.certs.map((c) => (
            <li key={c}><i className="ri-verified-badge-line" aria-hidden="true"></i>{c}</li>
          ))}
        </ul>

        <h2 className="pro-h pro-h--spaced">{t('pro.contact')}</h2>
        <ul className="pro-contact">
          <li><i className="ri-phone-line" aria-hidden="true"></i><a href={`tel:${item.phone.replace(/\s/g, '')}`}>{item.phone}</a></li>
          <li><i className="ri-mail-line" aria-hidden="true"></i><a href={`mailto:${item.email}`}>{item.email}</a></li>
          <li><i className="ri-map-pin-line" aria-hidden="true"></i><span>{item.address}</span></li>
        </ul>
        <a className="cta cta--block" href={`mailto:${item.email}?subject=${encodeURIComponent(`Devis — ${item.name}`)}`}>
          {t('pro.quote')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </a>
      </div>
    </aside>
  );
}