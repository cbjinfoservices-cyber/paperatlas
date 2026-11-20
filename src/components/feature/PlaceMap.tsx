import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { useGeo, haversineKm, formatDistance } from '@/hooks/useGeo';
import { driveMinutes, formatDuration } from '@/lib/trip';
import { pointOfRegion } from '@/lib/regionGeo';

type Props = {
  /** La commune où se tient le lieu, telle qu'elle est écrite sur la fiche.
      Une fiche qui ne déclare qu'une région — un profil de candidat — n'en a
      pas : le plan se cadre alors sur le centre de cette région. */
  commune?: string;
  wilaya: string;
  /** Le pays de la fiche : il oriente le plan et la langue de lecture. */
  pays: string;
  /** Le nom de l'employeur ou du vendeur, repris dans le texte du plan. */
  entreprise: string;
  /** Le point de la commune, quand la fiche le connaît. */
  lat?: number;
  lng?: number;
  /** Le titre de la carte : le poste pour une offre, la marchandise pour une annonce. */
  title?: string;
  /** La note sous le plan quand la commune n'a pas de point connu. */
  note?: string;
};

/**
 * Le plan de commune d'une fiche : il situe le lieu sans la quitter, et
 * l'itinéraire s'ouvre depuis le plan lui-même. La fiche ne porte pas
 * d'adresse postale, aussi le plan est-il cadré sur la commune et son pays —
 * assez précis pour reconnaître le quartier et préparer le trajet.
 * Quand le visiteur accepte de donner sa position, la carte dit aussi la
 * distance et le temps de trajet depuis chez lui.
 */
export default function PlaceMap({
  commune,
  wilaya,
  pays,
  entreprise,
  lat,
  lng,
  title,
  note,
}: Props) {
  const { t, lang } = useLang();
  const geo = useGeo();
  const communeLue = commune ? nomCommune(commune, lang) : '';
  const regionLue = nomRegion(wilaya, lang);
  const paysLu = nomPays(pays, lang);
  const lieu = communeLue ? `${communeLue}, ${regionLue}, ${paysLu}` : `${regionLue}, ${paysLu}`;
  /* Le point de la commune quand la fiche le connaît ; à défaut, le centre de
     la région déclarée. Rien quand ni l'un ni l'autre n'est situé : le plan
     reste alors une recherche par nom, jamais un point inventé. */
  const point = lat !== undefined && lng !== undefined
    ? { lat, lng }
    : pointOfRegion(wilaya, pays);

  const km = geo.point && point ? haversineKm(geo.point, point) : null;
  const minutes = km === null ? null : driveMinutes(km);
  const asking = geo.status === 'asking';

  const carte = point ? `${point.lat},${point.lng}` : lieu;
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(carte)}&z=${point ? 14 : 13}&hl=${lang}&output=embed`;
  const routeUrl = geo.point
    ? `https://www.google.com/maps/dir/?api=1&origin=${geo.point.lat},${geo.point.lng}&destination=${encodeURIComponent(carte)}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(carte)}`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lieu)}`;

  const message = geo.status === 'denied'
    ? t('near.denied')
    : geo.status === 'error'
      ? t('near.error')
      : geo.status === 'unsupported'
        ? t('near.unsupported')
        : '';

  return (
    <section className="pro-card dist-card" data-reveal>
      <h2 className="pro-h">{title ?? t('jobd.mapCard')}</h2>

      <p className="dist-address">
        <i className="ri-map-pin-line" aria-hidden="true"></i>
        <span>{lieu}</span>
      </p>

      {/* Le plan ne capte pas le doigt sur un écran tactile : la fiche continue
          de défiler sous le pouce, et le bouton d'itinéraire répond au clic. */}
      <div className="dist-map">
        <iframe
          className="dist-map-frame"
          src={mapUrl}
          title={`${t('pro.mapTitle')} — ${entreprise}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
        <a
          className="dist-map-go"
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`${t('pro.routeOpen')} — ${entreprise}`}
        >
          <i className="ri-navigation-line" aria-hidden="true"></i>
          <span>{t('pro.routeOpen')}</span>
        </a>
      </div>

      {km !== null && minutes !== null ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p className="dist-pill">
              <i className="ri-navigation-line" aria-hidden="true"></i>
              <strong>{formatDistance(km, lang)}</strong>
              <span>{t('pro.fromYou')}</span>
            </p>
            <p className="dist-pill">
              <i className="ri-time-line" aria-hidden="true"></i>
              <strong>{formatDuration(minutes)}</strong>
              <span>{t('jobd.driveTime')}</span>
            </p>
          </div>
          <p className="dist-hint">
            <i className="ri-information-line" aria-hidden="true"></i>
            {t('jobd.driveHint')}
          </p>
        </>
      ) : (
        <p className="dist-hint">
          <i className="ri-information-line" aria-hidden="true"></i>
          {note ?? t('jobd.mapNote')}
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
          point && (
            <button
              type="button"
              className="cta cta--block dist-route"
              onClick={() => geo.request()}
              disabled={asking || geo.status === 'unsupported'}
            >
              <i className={asking ? 'ri-loader-4-line is-spin' : 'ri-focus-3-line'} aria-hidden="true"></i>
              {asking ? t('near.asking') : t('pro.locate')}
            </button>
          )
        )}
        <a className="ghost-link" href={openUrl} target="_blank" rel="noopener noreferrer">
          <i className="ri-road-map-line" aria-hidden="true"></i>
          {t('pro.openMap')}
        </a>
      </div>
    </section>
  );
}