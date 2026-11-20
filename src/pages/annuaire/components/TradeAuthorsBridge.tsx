import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { slugPays } from '@/lib/tradePages';
import './trade-authors-bridge.css';

type Props = {
  /** L'onglet ouvert : la liste des ateliers, ou celle des plumes. */
  mode: 'entreprises' | 'auteurs';
  /** Le pays déjà retenu, gardé d'un bord à l'autre du lien. */
  pays?: string;
  /** La région retenue, gardée en paramètre. */
  wilaya?: string;
};

/**
 * Le pont entre les deux visages des écrivains : la page du métier, où les
 * ateliers de plume annoncent leurs prestations, et l'onglet Auteurs, où les
 * plumes publient leurs livres. Chacun mène à l'autre en gardant le pays et la
 * région déjà choisis, pour qu'un lecteur ne perde pas son périmètre en
 * traversant.
 */
export default function TradeAuthorsBridge({ mode, pays = '', wilaya = '' }: Props) {
  const { t, lang } = useLang();
  const place = pays ? nomPays(pays, lang) : '';

  /* Vers l'onglet Auteurs : le pays et la région restent des filtres. */
  const toAuthors = (() => {
    const params = new URLSearchParams();
    params.set('kind', 'auteurs');
    if (pays) params.set('pays', pays);
    if (wilaya) params.set('wilaya', wilaya);
    return `/annuaire?${params.toString()}`;
  })();

  /* Vers la page du métier : le pays y vit dans l'adresse, la région à côté. */
  const toTrade = (() => {
    const slug = pays ? slugPays(pays) : '';
    const path = slug ? `/annuaire/ecrivains/${slug}` : '/annuaire/ecrivains';
    return wilaya ? `${path}?wilaya=${encodeURIComponent(wilaya)}` : path;
  })();

  const versAuteurs = mode === 'entreprises';

  return (
    <aside className="dir-bridge" aria-label={t('tradeAuthors.label')}>
      <span className="dir-bridge-ico" aria-hidden="true">
        <i className={versAuteurs ? 'ri-quill-pen-line' : 'ri-building-4-line'}></i>
      </span>
      <div className="dir-bridge-txt">
        <p className="dir-bridge-title">
          {t(versAuteurs ? 'tradeAuthors.toAuthorsTitle' : 'tradeAuthors.toTradeTitle')}
          {place && <span className="dir-bridge-place"> · {place}</span>}
        </p>
        <p className="dir-bridge-sub">
          {t(versAuteurs ? 'tradeAuthors.toAuthorsText' : 'tradeAuthors.toTradeText')}
        </p>
      </div>
      <Link className="dir-bridge-cta" to={versAuteurs ? toAuthors : toTrade}>
        <span>{t(versAuteurs ? 'tradeAuthors.toAuthorsCta' : 'tradeAuthors.toTradeCta')}</span>
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </Link>
    </aside>
  );
}