import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { slugDeTrade, slugPays } from '@/lib/tradePages';

type Row = { code: string; count: number };

type Props = {
  /** Le type ouvert, "" quand aucun type n'est choisi. */
  trade: string;
  /** Combien d'ateliers de ce type chaque pays tient, le plus fourni d'abord. */
  counts: Row[];
  /** Le pays déjà ouvert dans l'adresse. */
  active: string;
  /** La région retenue, gardée dans l'adresse de la page voisine. */
  wilaya?: string;
};

/**
 * Une porte par pays, sous la rangée des types. Chaque porte mène à son
 * adresse propre — /annuaire/imprimeries/algerie, /annuaire/editeurs/maroc —
 * que Google peut indexer et qu'un visiteur peut partager telle quelle.
 */
export default function TypeCountries({ trade, counts, active, wilaya = '' }: Props) {
  const { t, lang } = useLang();
  if (!trade || counts.length === 0) return null;
  const base = `/annuaire/${slugDeTrade(trade)}`;
  const suffix = wilaya ? `?wilaya=${encodeURIComponent(wilaya)}` : '';

  return (
    <nav className="dir-typepages dir-countrypages" aria-label={t('tradePage.byCountry')}>
      <span className="dir-tp-lab">
        <i className="ri-earth-line" aria-hidden="true"></i>
        {t('tradePage.byCountry')}
      </span>
      {counts.map((row) => (
        <Link
          key={row.code}
          to={`${base}/${slugPays(row.code)}${suffix}`}
          className={`dir-tp${active === row.code ? ' is-on' : ''}`}
          title={`${t(`tradePlural.${trade}`)} · ${nomPays(row.code, lang)}`}
          aria-current={active === row.code ? 'page' : undefined}
        >
          <span className="dir-tp-name">{nomPays(row.code, lang)}</span>
          <span className="dir-tp-count">{row.count}</span>
        </Link>
      ))}
    </nav>
  );
}