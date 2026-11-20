import { useLang } from '@/i18n/LangProvider';
import type { GeoStatus } from '@/hooks/useGeo';
import './directory-sort.css';

export type SortKey = 'pertinence' | 'newest' | 'first' | 'generation' | 'rating' | 'capacity' | 'etabs' | 'distance' | 'name';

export const RADII = [50, 100, 200];

/** The dictionary key of each order, so the sort can be named outside the menu
    too — on the home page recall chip, for instance. */
export const SORT_LABEL: Record<SortKey, string> = {
  pertinence: 'sort.default',
  newest: 'sort.newest',
  first: 'sort.first',
  generation: 'sort.generation',
  rating: 'sort.rating',
  capacity: 'sort.capacity',
  etabs: 'sort.etabs',
  distance: 'sort.distance',
  name: 'sort.name',
};

type Props = {
  sort: SortKey;
  onSort: (s: SortKey) => void;
  geoStatus: GeoStatus;
  distanceReady: boolean;
  radius: number | null;
  radiusFromUrl: number | null;
  onRadius: (km: number | null) => void;
};

/**
 * Le tri de l'annuaire, et le rayon quand la position est connue.
 *
 * « Autour de moi » n'est plus ici : il se tient dans la barre haute, à côté du
 * type d'établissement, pour être atteint sans ouvrir quoi que ce soit. La
 * barre ne garde donc que ce que le pouce vient de demander — le rayon, une
 * fois la position acceptée — et le choix de l'ordre de lecture.
 */
export default function DirectoryTools({
  sort, onSort, geoStatus, distanceReady, radius, radiusFromUrl, onRadius,
}: Props) {
  const { t } = useLang();

  return (
    <div className="dir-sortbar">
      <div className="fld dir-sort">
        <label htmlFor="dir-sort">{t('sort.label')}</label>
        <div className="fld-inline">
          <i className="ri-sort-desc" aria-hidden="true"></i>
          <select id="dir-sort" value={sort} onChange={(e) => onSort(e.target.value as SortKey)}>
            <option value="pertinence">{t('sort.default')}</option>
            <option value="newest">{t('sort.newest')}</option>
            <option value="first">{t('sort.first')}</option>
            <option value="generation">{t('sort.generation')}</option>
            <option value="rating">{t('sort.rating')}</option>
            <option value="capacity">{t('sort.capacity')}</option>
            <option value="etabs">{t('sort.etabs')}</option>
            {distanceReady && <option value="distance">{t('sort.distance')}</option>}
            <option value="name">{t('sort.name')}</option>
          </select>
        </div>
      </div>

      {/* Les deux ordres les plus lus sortent du menu : une pastille les pose
          d'un clic, une seconde les rend à la pertinence. L'état se lit sur la
          pastille elle-même, donc le tri se change sans ouvrir la liste. */}
      <div className="dir-quick-sorts" role="group" aria-label={t('sort.quick')}>
        <button
          type="button"
          className="dir-quick-sort"
          data-on={sort === 'rating' ? 'yes' : 'no'}
          aria-pressed={sort === 'rating'}
          title={t('sort.quickRatingHint')}
          onClick={() => onSort(sort === 'rating' ? 'pertinence' : 'rating')}
        >
          <i className="ri-star-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('sort.rating')}</span>
        </button>
        <button
          type="button"
          className="dir-quick-sort"
          data-on={sort === 'newest' ? 'yes' : 'no'}
          aria-pressed={sort === 'newest'}
          title={t('sort.quickNewHint')}
          onClick={() => onSort(sort === 'newest' ? 'pertinence' : 'newest')}
        >
          <i className="ri-flashlight-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('sort.newest')}</span>
        </button>
      </div>

      {(distanceReady || radiusFromUrl !== null) && (
        <div className="dir-radius">
          <span className="dir-radius-label">
            <i className="ri-radar-line" aria-hidden="true"></i>
            {t('radius.label')}
          </span>
          <div className="segmented segmented--sm" role="group" aria-label={t('radius.label')}>
            <button
              type="button"
              className={radius === null ? 'is-on' : ''}
              aria-pressed={radius === null}
              disabled={!distanceReady}
              onClick={() => onRadius(null)}
            >
              {t('radius.all')}
            </button>
            {RADII.map((km) => (
              <button
                key={km}
                type="button"
                className={radius === km ? 'is-on' : ''}
                aria-pressed={radius === km}
                disabled={!distanceReady}
                onClick={() => onRadius(km)}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
      )}

      {radiusFromUrl !== null && !distanceReady && (
        <p className="geo-msg">
          <i className="ri-information-line" aria-hidden="true"></i>
          {t('radius.needGeo')}
        </p>
      )}

      {distanceReady && sort === 'distance' && (
        <span className="dir-sorted">
          <i className="ri-navigation-line" aria-hidden="true"></i>
          {t('near.sorted')}
        </span>
      )}
      {geoStatus === 'unsupported' && distanceReady === false && (
        <p className="geo-msg">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          {t('near.unsupported')}
        </p>
      )}
    </div>
  );
}