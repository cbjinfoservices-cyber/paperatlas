import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import type { Crumb } from '@/lib/structuredData';
import './dir-trail.css';

type Props = {
  /**
   * Le fil, dans l'ordre de lecture : accueil, annuaire, le type, puis le pays
   * quand la page en porte un. C'est exactement la liste que la page déclare
   * aux moteurs de recherche — une seule source, deux lectures.
   */
  crumbs: Crumb[];
};

/**
 * Le fil d'Ariane visible d'une page de type ou de type et pays.
 *
 * La page disait déjà son chemin à Google, mais rien ne le montrait au
 * visiteur : arrivé depuis un résultat de recherche sur « Imprimeries en
 * Algérie », il ne savait pas qu'il se tenait dans l'annuaire, ni qu'il
 * pouvait remonter au métier seul. Les maillons sont les mêmes que ceux du
 * balisage, dans le même ordre, avec les mêmes adresses : ce que le moteur
 * lit, le lecteur le voit.
 */
export default function DirTrail({ crumbs }: Props) {
  const { t } = useLang();
  if (crumbs.length < 2) return null;

  return (
    <nav className="dir-trail" aria-label={t('pro.crumbLabel')}>
      <ol className="dir-trail-list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li className="dir-trail-item" key={`${crumb.path}-${i}`}>
              {last ? (
                <span className="dir-trail-here" aria-current="page">{crumb.name}</span>
              ) : (
                <Link className="dir-trail-link" to={crumb.path} title={crumb.name}>
                  {crumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}