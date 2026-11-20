import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { slugPays } from '@/lib/tradePages';
import '@/pages/entreprise/components/pro-breadcrumb.css';

type Props = {
  /** Le code du pays de la plume : sa page Écrivains de pays est le maillon. */
  pays: string;
  /** Le nom de l'auteur, le dernier maillon, celui de la page lue. */
  name: string;
};

/**
 * Le fil d'Ariane d'une fiche d'auteur : accueil, espace Auteurs, page
 * Écrivains, page Écrivains du pays, puis la fiche elle-même. Chaque maillon
 * remonte d'un cran, et l'espace Auteurs comme la page du métier sont ainsi
 * reliés à chaque plume qu'ils listent.
 */
export default function AuteurBreadcrumb({ pays, name }: Props) {
  const { t, lang } = useLang();
  const paysSlug = slugPays(pays);

  return (
    <nav className="pro-crumb" aria-label={t('pro.crumbLabel')}>
      <ol className="pro-crumb-list">
        <li className="pro-crumb-item">
          <Link className="pro-crumb-link" to="/">{t('siteMap.home')}</Link>
        </li>
        <li className="pro-crumb-item">
          <Link
            className="pro-crumb-link"
            to="/annuaire?kind=auteurs"
            title={t('tradeAuthors.toAuthorsCta')}
          >
            {t('siteMap.authors')}
          </Link>
        </li>
        <li className="pro-crumb-item">
          <Link
            className="pro-crumb-link"
            to="/annuaire/ecrivains"
            title={`${t('tradePlural.ecrivain')} — ${t('siteMap.seeType')}`}
          >
            {t('tradePlural.ecrivain')}
          </Link>
        </li>
        {paysSlug && (
          <li className="pro-crumb-item">
            <Link
              className="pro-crumb-link"
              to={`/annuaire/ecrivains/${paysSlug}`}
              title={`${t('tradePlural.ecrivain')} · ${nomPays(pays, lang)}`}
            >
              {nomPays(pays, lang)}
            </Link>
          </li>
        )}
        <li className="pro-crumb-item">
          <span className="pro-crumb-here" aria-current="page">{name}</span>
        </li>
      </ol>
    </nav>
  );
}