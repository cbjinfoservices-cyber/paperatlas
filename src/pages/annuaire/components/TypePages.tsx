import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { trades } from '@/mocks/entreprises';
import { slugDeTrade, slugPays } from '@/lib/tradePages';

type Props = {
  /** Le type ouvert, "" quand l'annuaire entier se lit. */
  active: string;
  /** Combien d'ateliers de chaque type le pays et la région retenus tiennent. */
  counts: Record<string, number>;
  /** Le pays déjà lu : il passe dans l'adresse de la page voisine. */
  pays?: string;
  /** La région retenue, gardée en paramètre quand elle ne fait pas l'adresse. */
  wilaya?: string;
};

/**
 * Une porte par type d'établissement, juste sous les filtres. Chaque porte
 * mène à sa propre adresse — /annuaire/imprimeries, /annuaire/editeurs… — que
 * Google peut indexer et qu'un visiteur peut partager telle quelle. Le chiffre
 * affiché est celui du périmètre lu, jamais un total national.
 */
export default function TypePages({ active, counts, pays = '', wilaya = '' }: Props) {
  const { t } = useLang();
  const suffix = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';
  /* Le pays reste dans l'adresse, comme sur la page qu'on quitte. */
  const paysSlug = pays ? slugPays(pays) : '';
  const countryPath = paysSlug ? `/${paysSlug}` : '';

  return (
    <nav className="dir-typepages" aria-label={t('tradePage.label')}>
      <span className="dir-tp-lab">
        <i className="ri-links-line" aria-hidden="true"></i>
        {t('tradePage.label')}
      </span>
      {trades.map((trade) => (
        <Link
          key={trade}
          to={`/annuaire/${slugDeTrade(trade)}${countryPath}${suffix}`}
          className={`dir-tp${active === trade ? ' is-on' : ''}`}
          title={t('tradePage.othersHint')}
          aria-current={active === trade ? 'page' : undefined}
        >
          <span className="dir-tp-name">{t(`tradePlural.${trade}`)}</span>
          <span className="dir-tp-count">{counts[trade] ?? 0}</span>
        </Link>
      ))}
    </nav>
  );
}