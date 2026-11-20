import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { dayStamp } from '@/lib/dates';
import { deviseCode } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { prixDevise } from '@/lib/price';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import { formatDistance } from '@/hooks/useGeo';
import { formatDuration } from '@/lib/trip';
import PaysBadge from '@/components/feature/PaysBadge';
import AireFicheCount from '@/components/feature/AireFicheCount';
import { AIRE_CARTE_PARAM, AIRES_MONDE_PARAM, regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import type { Annonce, AnnonceCat } from '@/mocks/annonces';

export const CAT_KEY: Record<AnnonceCat, string> = {
  materiel: 'ann.catMateriel',
  papier: 'ann.catPapier',
  service: 'ann.catService',
  recherche: 'ann.catRecherche',
};

type Props = {
  item: Annonce;
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
 * One classified ad, sealed and ready to reply to by e-mail or phone.
 * A deposit can arrive with a missing phone, commune, price or date: every
 * one of them is optional here so the grid keeps its rhythm and never shows
 * an orphan separator or an empty button.
 */
export default function AnnonceCard({ item, index, active = false, trip = null, boardRows = 0 }: Props) {
  const { t, lang } = useLang();
  const { search } = useLocation();
  /* La fiche ouverte depuis un tableau resserré garde le rayon, l'ordre de
     lecture, la région et le pays : elle peut donc rendre la liste telle
     qu'on l'a quittée, et proposer le pays entier sans la région. */
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
  const to = `/annonces/${item.id}${kept ? `?${kept}` : ''}`;
  const date = dayStamp(item.posted, localeFor(lang));
  const contact = item.contact.trim();
  const seller = nomDemo(item.seller.trim(), lang);
  /* The money of the country the ad comes from, never a borrowed one. */
  const price = prixDevise(item.price, item.pays);
  const body = localize(item.body, lang).trim();
  const place = [nomCommune(item.commune.trim(), lang), nomRegion(item.wilaya.trim(), lang)].filter(Boolean).join(' · ');
  const subject = encodeURIComponent(`${t('ann.contact')} — ${localize(item.title, lang)}`);
  /* La première vue de la marchandise : elle se montre dès la liste, pour
     qu'on reconnaisse la machine ou le papier sans ouvrir la fiche. */
  const photo = item.photos?.[0] ?? '';
  const photoTotal = item.photos?.length ?? 0;
  /* L'aire où se tient l'annonce : son compte, posé dans le pied de la carte,
     rouvre la note des aires resserrée sur elle — sans passer par la fiche. */
  const aire = regionMondeDe(item.pays);
  const aireNom = aire ? t(regionMondeLabelKey(aire)) : '';
  const aireNote = aire
    ? `/annuaire?view=map&${AIRES_MONDE_PARAM}=${aire.key}&${AIRE_CARTE_PARAM}=${aire.key}#cmaps`
    : '';

  return (
    <article className={`ad-card${active ? ' is-keyed' : ''}`} style={{ animationDelay: `${index * 55}ms` }}>
      <div className="ad-top">
        <span className="ad-cat">{t(CAT_KEY[item.cat])}</span>
        {item.hot && (
          <span className="ad-hot">
            <i className="ri-flashlight-line" aria-hidden="true"></i>
            {t('ann.hot')}
          </span>
        )}
      </div>

      {photo && (
        <figure className="ad-thumb">
          <img
            src={photo}
            alt={`${localize(item.title, lang)} · ${seller || item.commune}`}
            title={`${localize(item.title, lang)} — ${t('ann.photos')}`}
            width={1200}
            height={900}
          />
          {photoTotal > 1 && (
            <figcaption className="ad-thumb-num">
              <i className="ri-image-line" aria-hidden="true"></i>
              {photoTotal}
            </figcaption>
          )}
        </figure>
      )}

      <h2 className="ad-title">
        <Link to={to}>{localize(item.title, lang)}</Link>
      </h2>
      {body && <p className="ad-body">{body}</p>}

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

      {(price || date) && (
        <div className="ad-foot">
          {price && <span className="ad-price" title={`${t('ann.price')} · ${deviseCode(item.pays)}`}>{price}</span>}
          {date && <span className="ad-meta">{t('ann.posted')} {date}</span>}
        </div>
      )}

      <div className="ad-actions">
        {contact && (
          <a className="ad-btn ad-btn--solid" href={`mailto:${contact}?subject=${subject}`}>
            <i className="ri-mail-send-line" aria-hidden="true"></i>
            {t('ann.contact')}
          </a>
        )}
        {item.phone && (
          <a className="ad-btn" href={`tel:${item.phone.replace(/\s+/g, '')}`}>
            <i className="ri-phone-line" aria-hidden="true"></i>
            {t('ann.call')}
          </a>
        )}
        <Link className="ad-btn" to={to}>
          <i className="ri-article-line" aria-hidden="true"></i>
          {t('ann.view')}
        </Link>
        {/* Le compte de l'aire de l'annonce : le même chiffre que sur les
            fiches, et sa porte vers la note des aires — l'aire se rouvre
            aussi depuis le tableau. */}
        {aire && (
          <AireFicheCount aire={aire.key} regionNom={aireNom} noteTo={aireNote} />
        )}
        {seller && <span className="ad-seller" title={seller}>{seller}</span>}
      </div>
    </article>
  );
}