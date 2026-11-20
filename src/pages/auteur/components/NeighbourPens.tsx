import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { haversineKm, formatDistance } from '@/hooks/useGeo';
import { auteurs } from '@/mocks/auteurs';
import './neighbour-pens.css';

type Props = {
  /** Le code du pays de la plume lue : c'est là que se lit le voisinage. */
  pays: string;
  /** La plume de la fiche : elle ne se compte pas comme sa propre voisine. */
  selfId: string;
  /** La région déjà dépliée plus haut : ses voisines y sont nommées une fois. */
  region?: string;
  /** Le nom de la plume : la phrase la nomme, jamais « cette fiche ». */
  name: string;
};

/**
 * Les trois plumes voisines de l'auteur dans son pays — le pendant du bloc des
 * familles voisines d'un atelier. Les plumes des autres régions passent
 * devant : celles de la région de l'auteur sont déjà nommées dans son
 * voisinage immédiat, et la carte ne répète pas deux fois les mêmes noms.
 */
export default function NeighbourPens({ pays, selfId, region = '', name }: Props) {
  const { t, lang } = useLang();

  const self = auteurs.find((a) => a.id === selfId);
  const memePays = auteurs.filter((a) => a.id !== selfId && paysDe(a) === pays);
  /* Le genre de la fiche : c'est par lui que s'ouvre la liste entière des
     plumes du pays, sans repasser par les filtres. */
  const genrePorte = self?.genres[0] ?? '';
  const memesGenreListe = genrePorte
    ? auteurs.filter((a) => paysDe(a) === pays && a.genres.includes(genrePorte))
    : [];
  const memesGenre = memesGenreListe.length;
  /* Les régions où ce genre est vraiment tenu : la carte du pays les nomme,
     et le renvoi juste dessous s'y ouvre déjà resserré. */
  const regionsGenre = new Set(
    memesGenreListe.map((a) => (a.wilaya || '').trim()).filter(Boolean),
  ).size;
  if (memePays.length === 0 && !genrePorte) return null;

  const kmDe = (a: (typeof auteurs)[number]) => (self
    ? haversineKm({ lat: self.lat, lng: self.lng }, { lat: a.lat, lng: a.lng })
    : 0);

  const ailleurs = memePays.filter((a) => a.wilaya !== region);
  const memesRegion = memePays.filter((a) => a.wilaya === region);
  const voisines = [...ailleurs, ...memesRegion]
    .sort((a, b) => kmDe(a) - kmDe(b))
    .slice(0, 3);

  return (
    <section className="pro-pens" aria-labelledby="pro-pens-title">
      <div className="pro-pens-head">
        <h2 className="pro-h" id="pro-pens-title">
          {t('auth.pensTitle')} · {nomPays(pays, lang)}
        </h2>
        <span className="pro-pens-name">{name}</span>
      </div>
      <p className="pro-pens-hint">
        <i className="ri-quill-pen-line" aria-hidden="true"></i>
        {t('auth.pensHint')}
      </p>
      {voisines.length === 0 ? (
        <p className="pro-pens-empty">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('auth.pensEmpty')}
        </p>
      ) : (
        <ul className="pro-pens-list">
          {voisines.map((a) => (
            <li key={a.id}>
              <Link
                className="pro-pens-card"
                to={`/auteur/${a.id}`}
                title={`${a.name} · ${a.genres.map((g) => t(`genre.${g}`)).join(' · ')} · ${nomRegion(a.wilaya, lang)}`}
              >
                <img
                  className="pro-pens-portrait"
                  src={a.portrait}
                  alt={a.name}
                  title={`${a.name} — ${nomRegion(a.wilaya, lang)}`}
                  width={96}
                  height={96}
                />
                <span className="pro-pens-body">
                  <span className="pro-pens-pen">{a.name}</span>
                  <span className="pro-pens-genres">
                    {a.genres.map((g) => t(`genre.${g}`)).join(' · ')}
                  </span>
                  <span className="pro-pens-meta">
                    <b>{a.books.length}</b> {t('auth.pensWorks')}
                    <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                    {nomRegion(a.wilaya, lang)}
                    {self && <em>· {formatDistance(kmDe(a), lang)}</em>}
                  </span>
                </span>
                <i className="ri-arrow-right-line pro-pens-go" aria-hidden="true"></i>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* Toutes les plumes de son genre dans son pays, la liste déjà filtrée :
          le voisinage nomme trois plumes, ce renvoi ouvre tout le genre. */}
      {(genrePorte || regionsGenre > 0) && (
        <div className="pro-pens-doors">
          {genrePorte && (
            <Link
              className="pro-pens-all"
              to={`/annuaire?kind=auteurs&pays=${pays}&genre=${genrePorte}`}
              title={`${t('auth.pensAll')} · ${t(`genre.${genrePorte}`)} · ${memesGenre} — ${t('auth.pensAllHint')}`}
            >
              <i className="ri-list-check" aria-hidden="true"></i>
              <span>{t('auth.pensAll')}</span>
              <b>{t(`genre.${genrePorte}`)}</b>
              {memesGenre > 0 && <em>{memesGenre}</em>}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          )}
          {/* Le genre en tient-il dans plusieurs régions ? La carte du pays le
              dit, et s'ouvre déjà resserrée dessus d'un clic. */}
          {genrePorte && regionsGenre > 0 && (
            <Link
              className="pro-pens-areas"
              to={`/annuaire?view=map&pays=${pays}#cmaps`}
              title={`${t('auth.pensRegionsHint')} · ${nomPays(pays, lang)}`}
            >
              <i className="ri-map-2-line" aria-hidden="true"></i>
              <span>{t('auth.pensRegions')}</span>
              <b>{regionsGenre}</b>
              <em>{t('auth.pensRegionsWord')}</em>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}