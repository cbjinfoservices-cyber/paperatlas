import { useLang } from '@/i18n/LangProvider';
import { useGeo, haversineKm, formatDistance } from '@/hooks/useGeo';
import type { Entreprise } from '@/mocks/entreprises';
import RegionWalk from './RegionWalk';

type Props = { item: Entreprise };

export default function DistanceCard({ item }: Props) {
  const { t, lang } = useLang();
  const geo = useGeo();

  const km = geo.point ? haversineKm(geo.point, { lat: item.lat, lng: item.lng }) : null;
  const asking = geo.status === 'asking';
  const destination = `${item.lat},${item.lng}`;
  const routeUrl = geo.point
    ? `https://www.google.com/maps/dir/?api=1&origin=${geo.point.lat},${geo.point.lng}&destination=${destination}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  /* Le plan lui-même, cadré sur l'atelier : le repère se voit sans quitter la
     fiche, et un clic n'importe où sur la carte ouvre l'itinéraire. */
  const mapUrl = `https://maps.google.com/maps?q=${item.lat},${item.lng}&z=15&hl=${lang}&output=embed`;

  const message = geo.status === 'denied'
    ? t('near.denied')
    : geo.status === 'error'
      ? t('near.error')
      : geo.status === 'unsupported'
        ? t('near.unsupported')
        : '';

  return (
    <div className="pro-card dist-card" data-reveal>
      <h2 className="pro-h">{t('pro.location')}</h2>

      <p className="dist-address">
        <i className="ri-map-pin-line" aria-hidden="true"></i>
        <span>{item.address}</span>
      </p>

      {/* Le plan de localisation : la position exacte de l'atelier, et
          l'itinéraire à portée de clic, sans demande de position au préalable. */}
      <div className="dist-map">
        <iframe
          className="dist-map-frame"
          src={mapUrl}
          title={`${t('pro.mapTitle')} — ${item.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <a
          className="dist-map-go"
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${t('pro.routeOpen')} — ${item.name}`}
        >
          <i className="ri-navigation-line" aria-hidden="true"></i>
          <span>{t('pro.routeOpen')}</span>
        </a>
      </div>

      {/* Les régions parcourues dans l'annuaire, sous le plan : la fiche dit
          d'où l'on vient d'un geste, et rouvre la dernière d'un clic. Chaque
          porte donne son compte, comme sur la page de suivi et sur les fiches
          d'annonce et d'offre. */}
      <RegionWalk doorCounts />

      {km !== null ? (
        <p className="dist-pill">
          <i className="ri-navigation-line" aria-hidden="true"></i>
          <strong>{formatDistance(km, lang)}</strong>
          <span>{t('pro.fromYou')}</span>
        </p>
      ) : (
        <p className="dist-hint">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('pro.locateHint')}
        </p>
      )}

      {message && <p className="dist-hint dist-hint--warn">{message}</p>}

      <div className="dist-actions">
        {km !== null ? (
          <a className="cta cta--block dist-route" href={routeUrl} target="_blank" rel="noopener noreferrer">
            <i className="ri-route-line" aria-hidden="true"></i>
            {t('pro.routeFromMe')}
          </a>
        ) : (
          <>
            <button
              type="button"
              className="cta cta--block dist-route"
              onClick={() => geo.request()}
              disabled={asking || geo.status === 'unsupported'}
            >
              <i className={asking ? 'ri-loader-4-line is-spin' : 'ri-focus-3-line'} aria-hidden="true"></i>
              {asking ? t('near.asking') : t('pro.locate')}
            </button>
            <a className="ghost-link" href={routeUrl} target="_blank" rel="noopener noreferrer">
              <i className="ri-route-line" aria-hidden="true"></i>
              {t('pro.routeTo')}
            </a>
          </>
        )}
      </div>

      <a
        className="ghost-link"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="ri-road-map-line" aria-hidden="true"></i>
        {t('pro.openMap')}
      </a>
    </div>
  );
}