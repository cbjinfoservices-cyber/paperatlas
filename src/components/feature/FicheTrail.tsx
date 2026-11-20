import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import type { Crumb } from '@/lib/structuredData';
import '@/pages/entreprise/components/pro-breadcrumb.css';

type Props = {
  /**
   * Le chemin de la fiche, dans l'ordre de lecture : accueil, la liste d'où
   * l'on vient, le pays quand il tient un cran, puis le nom de la fiche lue.
   * C'est la même liste que la page déclare aux moteurs de recherche : une
   * seule source, deux lectures.
   */
  crumbs: Crumb[];
};

/**
 * Le fil d'Ariane visible d'une fiche — auteur, annonce.
 *
 * La fiche d'atelier montrait déjà son chemin ; les plumes et les annonces le
 * déclaraient sans le montrer, ou pas du tout. Le dessin reprend celui des
 * fiches d'atelier, si bien que le site se remonte de la même façon partout :
 * chaque maillon est un vrai lien qui remonte d'un cran, le dernier nomme la
 * page lue, et le séparateur se retourne tout seul en arabe.
 */
export default function FicheTrail({ crumbs }: Props) {
  const { t } = useLang();
  if (crumbs.length < 2) return null;

  return (
    <nav className="pro-crumb" aria-label={t('pro.crumbLabel')}>
      <ol className="pro-crumb-list">
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li className="pro-crumb-item" key={`${crumb.path}-${i}`}>
              {last ? (
                <span className="pro-crumb-here" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <Link className="pro-crumb-link" to={crumb.path} title={crumb.name}>
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