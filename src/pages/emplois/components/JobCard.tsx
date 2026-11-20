import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { dayStamp } from '@/lib/dates';
import { deviseCode } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { prixDevise } from '@/lib/price';
import { nomCommune } from '@/lib/communeLabels';
import { formatDistance } from '@/hooks/useGeo';
import { formatDuration } from '@/lib/trip';
import PaysBadge from '@/components/feature/PaysBadge';
import AireFicheCount from '@/components/feature/AireFicheCount';
import { AIRE_CARTE_PARAM, AIRES_MONDE_PARAM, regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import type { Contract, Emploi } from '@/mocks/emplois';

export const CONTRACT_KEY: Record<Contract, string> = {
  cdi: 'job.typeCdi',
  cdd: 'job.typeCdd',
  stage: 'job.typeStage',
  freelance: 'job.typeFreelance',
};

type Props = {
  item: Emploi;
  index: number;
  /** La ligne que les flèches du clavier ont mise en avant dans la recherche. */
  active?: boolean;
  /** Le trajet depuis la position du visiteur, quand le tableau est ordonné
      ainsi : la carte dit alors la distance et la durée, pas seulement l'ordre. */
  trip?: { km: number; minutes: number } | null;
  /** Combien de lignes le tableau tient : la fiche l'emporte, pour que le
      texte copié annonce l'étendue de la liste avant qu'on l'ouvre. */
  boardRows?: number;
};

/**
 * One job offer, with the contract type and the salary stated up front.
 * Offers posted from the account area can miss the seal, the tags, the salary
 * or the locality: the card degrades field by field instead of collapsing.
 */
export default function JobCard({ item, index, active = false, trip = null, boardRows = 0 }: Props) {
  const { t, lang } = useLang();
  const { search } = useLocation();
  /* La fiche d'une offre ouverte depuis un tableau resserré garde le rayon,
     l'ordre de lecture, la région et le pays, pour rendre la liste telle
     qu'on l'a quittée — et le pays entier sans la région. */
  const carried = new URLSearchParams(search);
  const keep = new URLSearchParams();
  ['sort', 'rayon', 'lettre', 'wilaya', 'pays'].forEach((key) => {
    const value = carried.get(key);
    if (value) keep.set(key, value);
  });
  /* L'étendue du tableau part avec la fiche : le texte copié pourra dire
     combien de lignes la liste tient. */
  if (boardRows > 0) keep.set('n', String(boardRows));
  const kept = keep.toString();
  const to = `/emplois/${item.id}${kept ? `?${kept}` : ''}`;
  const date = dayStamp(item.posted, localeFor(lang));
  const contact = item.contact.trim();
  const company = item.company.trim();
  /* The salary is read in the money of the country the offer sits in. */
  const salary = prixDevise(item.salary, item.pays);
  const summary = localize(item.summary, lang).trim();
  const place = [nomCommune(item.commune.trim(), lang), nomRegion(item.wilaya.trim(), lang)].filter(Boolean).join(' · ');
  const mark = item.mark.trim() || company.slice(0, 2).toUpperCase() || 'PA';
  const subject = encodeURIComponent(`${t('job.apply')} — ${localize(item.title, lang)}`);
  /* L'aire où se tient l'offre : son compte, posé dans le pied de la carte,
     rouvre la note des aires resserrée sur elle — sans passer par la fiche. */
  const aire = regionMondeDe(item.pays);
  const aireNom = aire ? t(regionMondeLabelKey(aire)) : '';
  const aireNote = aire
    ? `/annuaire?view=map&${AIRES_MONDE_PARAM}=${aire.key}&${AIRE_CARTE_PARAM}=${aire.key}#cmaps`
    : '';

  return (
    <article className={`job-card${active ? ' is-keyed' : ''}`} style={{ animationDelay: `${index * 55}ms` }}>
      <div className="job-top">
        <span className="logo-mark" aria-hidden="true">{mark}</span>
        <div>
          <h2 className="job-title">
            <Link to={to}>{localize(item.title, lang)}</Link>
          </h2>
          {company && <p className="job-co">{company}</p>}
        </div>
        {item.hot && (
          <span className="ad-hot">
            <i className="ri-flashlight-line" aria-hidden="true"></i>
            {t('job.urgent')}
          </span>
        )}
      </div>

      {item.tags.length > 0 && (
        <ul className="job-tags">
          {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
        </ul>
      )}

      {summary && <p className="ad-body">{summary}</p>}

      {place && (
        <p className="ad-place">
          <i className="ri-map-pin-line" aria-hidden="true"></i>
          {place}
          <PaysBadge code={item.pays} />
        </p>
      )}

      {trip && (
        <p className="job-trip" title={t('jobd.driveHint')}>
          <i className="ri-navigation-line" aria-hidden="true"></i>
          <b>{formatDistance(trip.km, lang)}</b>
          <span aria-hidden="true">·</span>
          <b>{formatDuration(trip.minutes)}</b>
          <span>{t('jobd.driveTime')}</span>
        </p>
      )}

      {(salary || date) && (
        <div className="ad-foot">
          {salary && (
            <span className="job-salary" title={`${t('job.salary')} · ${deviseCode(item.pays)}`}>
              <i className="ri-wallet-3-line" aria-hidden="true"></i>
              {salary}
            </span>
          )}
          {date && <span className="ad-meta">{t('job.posted')} {date}</span>}
        </div>
      )}

      <div className="ad-actions">
        <span className="job-contract">{t(CONTRACT_KEY[item.contract])}</span>
        {contact && (
          <a className="ad-btn ad-btn--solid job-apply" href={`mailto:${contact}?subject=${subject}`}>
            <i className="ri-send-plane-line" aria-hidden="true"></i>
            {t('job.apply')}
          </a>
        )}
        {/* Le compte de l'aire de l'offre : le même chiffre que sur les fiches,
            et sa porte vers la note des aires — l'aire se rouvre aussi depuis
            le tableau. */}
        {aire && (
          <AireFicheCount aire={aire.key} regionNom={aireNom} noteTo={aireNote} />
        )}
      </div>
    </article>
  );
}