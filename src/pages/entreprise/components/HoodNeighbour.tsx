import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import { nomRegion } from '@/lib/regionLabels';
import { formatDistance } from '@/hooks/useGeo';
import PhotoGallery from '@/components/feature/PhotoGallery';
import type { Entreprise } from '@/mocks/entreprises';

type Props = {
  /** L'établissement voisin, lu dans le même pays ou à proximité. */
  e: Entreprise;
  /** Le trajet depuis l'atelier dont on lit la fiche. */
  km: number;
};

/**
 * Un voisin dans le bloc « Où se situe cet atelier » : ses premières photos
 * ouvrent la carte — les mêmes images que sa fiche, le même compteur et le
 * même aperçu plein écran — puis son nom et son lieu mènent chez lui.
 * La carte entière reste la porte : le nom, la commune, le trait du trajet.
 */
export default function HoodNeighbour({ e, km }: Props) {
  const { t, lang } = useLang();
  const nom = nomDemo(e.name, lang);
  const photos = e.photos.slice(0, 3);

  return (
    <li className="pro-hood-item">
      {photos.length > 0 && (
        <PhotoGallery
          compact
          photos={photos}
          nom={nom}
          wilaya={nomRegion(e.wilaya, lang)}
          label={`${t('pro.photos')} — ${nom}`}
        />
      )}
      <Link to={`/entreprise/${e.id}`} className="pro-hood-link">
        <span className="pro-hood-link-txt">
          <span className="pro-hood-name">{nom}</span>
          <span className="pro-hood-meta">
            {nomCommune(e.commune, lang)} · {nomRegion(e.wilaya, lang)} · {formatDistance(km, lang)}
          </span>
        </span>
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </li>
  );
}