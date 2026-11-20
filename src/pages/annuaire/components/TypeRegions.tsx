import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomRegion } from '@/lib/regionLabels';
import { nomPays } from '@/lib/pays';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { regionsParTrade } from '@/lib/tradeCountries';

type Props = {
  /** Le type ouvert dans l'adresse. */
  trade: string;
  /** Le pays ouvert dans l'adresse : ses régions se lisent seules. */
  pays: string;
  /** La région déjà retenue, si l'adresse en porte une. */
  active: string;
};

/**
 * Les régions d'un type dans son pays, sous les portes de pays de sa page.
 *
 * Chaque porte mène à l'adresse de la région — le même tableau, resserré sur
 * elle — et la première, « Tout ce pays », rend la région sans rendre le pays
 * ni le type : c'est le geste qu'on cherche après avoir ouvert une région et
 * voulu relire le pays entier. La porte reste marquée quand elle est déjà
 * retenue, comme les pays au-dessus d'elle.
 */
export default function TypeRegions({ trade, pays, active }: Props) {
  const { t, lang } = useLang();
  if (!trade || !pays) return null;
  const rows = regionsParTrade(trade, pays);
  if (rows.length === 0) return null;

  const country = slugPays(pays);
  const base = `/annuaire/${slugDeTrade(trade)}${country ? `/${country}` : ''}`;
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <nav className="dir-typepages dir-regionpages" aria-label={t('tradePage.byRegion')}>
      <span className="dir-tp-lab">
        <i className="ri-map-pin-2-line" aria-hidden="true"></i>
        {t('tradePage.byRegion')}
      </span>
      <Link
        className={`dir-tp is-all${active ? '' : ' is-on'}`}
        to={base}
        title={`${t(`tradePlural.${trade}`)} · ${nomPays(pays, lang)}`}
        aria-current={active ? undefined : 'page'}
      >
        <i className="ri-earth-line" aria-hidden="true"></i>
        <span className="dir-tp-name">{t('tradePage.allCountry')}</span>
        <span className="dir-tp-count">{total}</span>
      </Link>
      {rows.map((row) => (
        <Link
          key={row.wilaya}
          to={`${base}?wilaya=${encodeURIComponent(row.wilaya)}`}
          className={`dir-tp${active === row.wilaya ? ' is-on' : ''}`}
          title={`${t(`tradePlural.${trade}`)} · ${nomRegion(row.wilaya, lang)}`}
          aria-current={active === row.wilaya ? 'page' : undefined}
        >
          <span className="dir-tp-name">{nomRegion(row.wilaya, lang)}</span>
          <span className="dir-tp-count">{row.count}</span>
        </Link>
      ))}
    </nav>
  );
}