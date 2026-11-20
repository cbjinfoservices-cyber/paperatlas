import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import type { Trade } from '@/mocks/entreprises';
import './pro-breadcrumb.css';

type Props = {
  /** Le type de l'atelier : sa page de type est le troisième maillon. */
  trade: Trade;
  /** Le code du pays : sa page de pays est le quatrième maillon. */
  pays: string;
  /** Le nom de l'atelier, le dernier maillon, celui de la page lue. */
  name: string;
};

/**
 * Le fil d'Ariane d'une fiche d'atelier : accueil, annuaire, page du type, page
 * du pays, puis la fiche elle-même. Chaque maillon remonte d'un cran, et les
 * deux pages écrites pour les moteurs de recherche — le type et le pays — sont
 * ainsi reliées à chaque fiche qu'elles listent.
 */
export default function ProBreadcrumb({ trade, pays, name }: Props) {
  const { t, lang } = useLang();
  const typePath = slugDeTrade(trade);
  const paysPath = slugPays(pays);

  return (
    <nav className="pro-crumb" aria-label={t('pro.crumbLabel')}>
      <ol className="pro-crumb-list">
        <li className="pro-crumb-item">
          <Link className="pro-crumb-link" to="/">{t('siteMap.home')}</Link>
        </li>
        <li className="pro-crumb-item">
          <Link className="pro-crumb-link" to="/annuaire">{t('pro.back')}</Link>
        </li>
        {typePath && (
          <li className="pro-crumb-item">
            <Link
              className="pro-crumb-link"
              to={`/annuaire/${typePath}`}
              title={`${t(`tradePlural.${trade}`)} — ${t('siteMap.seeType')}`}
            >
              {t(`tradePlural.${trade}`)}
            </Link>
          </li>
        )}
        {typePath && paysPath && (
          <li className="pro-crumb-item">
            <Link
              className="pro-crumb-link"
              to={`/annuaire/${typePath}/${paysPath}`}
              title={`${t(`tradePlural.${trade}`)} · ${nomPays(pays, lang)}`}
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