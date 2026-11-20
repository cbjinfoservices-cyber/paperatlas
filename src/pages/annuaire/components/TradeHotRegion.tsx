import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomRegion } from '@/lib/regionLabels';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { regionActive } from '@/lib/tradeCountries';

type Props = {
  /** Le type ouvert dans l'adresse. */
  trade: string;
  /** Le pays ouvert dans l'adresse. */
  pays: string;
};

/**
 * La région la plus active d'un type dans son pays, juste sous les portes de
 * pays. Elle nomme l'endroit où le métier bat vraiment — « Alger · 9 ateliers »
 * — et ouvre la carte du pays déjà resserrée sur cette région, plutôt que de
 * laisser le lecteur la chercher dans les compteurs.
 */
export default function TradeHotRegion({ trade, pays }: Props) {
  const { t, lang } = useLang();
  const hot = regionActive(trade, pays);
  if (!hot) return null;

  const country = slugPays(pays);
  const base = `/annuaire/${slugDeTrade(trade)}${country ? `/${country}` : ''}`;
  const to = `${base}?view=map&wilaya=${encodeURIComponent(hot.wilaya)}`;

  return (
    <p className="dir-hotregion">
      <span className="dir-hotregion-lab">
        <i className="ri-pulse-line" aria-hidden="true"></i>
        {t('tradePage.hotLabel')}
      </span>
      <strong className="dir-hotregion-name">{nomRegion(hot.wilaya, lang)}</strong>
      <span className="dir-hotregion-count">
        {t('tradePage.hotFiles').replace('{n}', String(hot.count))}
      </span>
      <Link className="dir-hotregion-cta" to={to}>
        <i className="ri-map-2-line" aria-hidden="true"></i>
        {t('tradePage.hotMap')}
      </Link>
    </p>
  );
}