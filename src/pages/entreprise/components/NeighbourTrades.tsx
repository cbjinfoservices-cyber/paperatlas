import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays, paysDe } from '@/lib/pays';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { entreprises, trades, type Trade } from '@/mocks/entreprises';
import './neighbour-trades.css';

/** L'icône de chaque famille, la même que dans le reste du site. */
const ICONS: Record<Trade, string> = {
  impression: 'ri-printer-line',
  edition: 'ri-book-open-line',
  librairie: 'ri-store-3-line',
  faconnage: 'ri-scissors-cut-line',
  communication: 'ri-megaphone-line',
  fournisseurs: 'ri-stack-line',
  bibliotheque: 'ri-bookmark-3-line',
  ecrivain: 'ri-quill-pen-line',
};

type Props = {
  /** Le code du pays de l'atelier lu : c'est là que se lit le voisinage. */
  pays: string;
  /** Le métier de la fiche : il ne se compte pas comme son propre voisin. */
  trade: Trade;
  /** Le nom de l'atelier : la phrase le nomme, jamais « cette fiche ». */
  name: string;
};

/**
 * Les trois familles voisines de l'atelier dans son pays : les métiers les plus
 * fournis du même pays, chacun avec son compte et un lien vers sa page de pays
 * — /annuaire/editeurs/algerie, /annuaire/librairies/algerie. Une famille
 * absente du pays ne s'affiche pas plutôt que de promettre une page vide.
 */
export default function NeighbourTrades({ pays, trade, name }: Props) {
  const { t, lang } = useLang();

  const counts = new Map<Trade, number>();
  entreprises.forEach((e) => {
    if (paysDe(e) !== pays) return;
    counts.set(e.trade, (counts.get(e.trade) ?? 0) + 1);
  });

  const voisines = trades
    .filter((key) => key !== trade && (counts.get(key) ?? 0) > 0)
    .map((key) => ({ key, count: counts.get(key) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, 'fr'))
    .slice(0, 3);

  if (voisines.length === 0) return null;

  const paysSlug = slugPays(pays);

  return (
    <section className="pro-family" aria-labelledby="pro-family-title">
      <div className="pro-family-head">
        <h2 className="pro-h" id="pro-family-title">
          {t('pro.familiesTitle')} · {nomPays(pays, lang)}
        </h2>
        <span className="pro-family-name">{name}</span>
      </div>
      <p className="pro-family-hint">
        <i className="ri-links-line" aria-hidden="true"></i>
        {t('pro.familiesHint')}
      </p>
      <ul className="pro-family-list">
        {voisines.map(({ key, count }) => {
          const typeSlug = slugDeTrade(key);
          const to = typeSlug && paysSlug
            ? `/annuaire/${typeSlug}${paysSlug ? `/${paysSlug}` : ''}`
            : typeSlug ? `/annuaire/${typeSlug}` : '/annuaire';
          return (
            <li key={key}>
              <Link
                className="pro-family-card"
                to={to}
                title={`${t(`tradePlural.${key}`)} · ${nomPays(pays, lang)}`}
              >
                <span className="pro-family-ico">
                  <i className={ICONS[key]} aria-hidden="true"></i>
                </span>
                <span className="pro-family-body">
                  <span className="pro-family-trade">{t(`tradePlural.${key}`)}</span>
                  <span className="pro-family-count">
                    <b>{count}</b> {t('pro.familiesFiles')}
                  </span>
                  <span className="pro-family-where">
                    <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                    {nomPays(pays, lang)}
                  </span>
                </span>
                <i className="ri-arrow-right-line pro-family-go" aria-hidden="true"></i>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}