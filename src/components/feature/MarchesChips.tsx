import { Link, useSearchParams } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { usePrixPays } from '@/hooks/usePrixPays';
import { useFichesPubliees } from '@/hooks/useFichesPubliees';
import { marches } from '@/lib/marches';

/** The two boards a market chip can filter without leaving the page. */
type Board = 'annonces' | 'emplois';

type Props = {
  /**
   * « annuaire » opens the directory already filtered on the market,
   * « prix » changes the country every price is read in,
   * « board » filters the Annonces or Emplois board in place.
   */
  variant?: 'annuaire' | 'prix' | 'board';
  /** Which board the chips filter when they sit on one. */
  board?: Board;
  /** The country the board currently reads, so its own chip reads as picked. */
  active?: string;
  className?: string;
};

/**
 * The open markets, read as four doors. Each chip carries the number of sheets
 * actually published in its country, so the row says how busy a market is before
 * anyone clicks it. On the tariff sheet the same chips change the money instead
 * of leaving the page, and on a board they filter the very board they sit on.
 */
export default function MarchesChips({
  variant = 'annuaire',
  board = 'annonces',
  active = '',
  className = '',
}: Props) {
  const { t } = useLang();
  const { pays, choisir } = usePrixPays();
  const [params] = useSearchParams();
  /* Directory sheets plus the deposits published on the boards: the chip says
     how much a market really holds, whichever counter the sheet came from. */
  const { counts } = useFichesPubliees();

  /**
   * A board chip keeps the board it is standing on and every other filter in
   * place: only the country changes, and a second click on the picked market
   * hands the whole board back.
   */
  const boardLink = (code: string) => {
    const next = new URLSearchParams(params);
    if (active === code) next.delete('pays');
    else next.set('pays', code);
    /* A region only makes sense inside its own country, and the board rewinds
       to its first batch, exactly like the country select above. */
    next.delete('wilaya');
    next.delete('shown');
    const query = next.toString();
    return { pathname: `/${board}`, search: query ? `?${query}` : '' };
  };

  return (
    <div
      className={`market-row${variant === 'prix' ? ' is-sheet' : ''}${
        variant === 'board' ? ' is-board' : ''
      }${className ? ` ${className}` : ''}`}
      data-reveal
    >
      <p className="market-row-label">
        <i className="ri-road-map-line" aria-hidden="true"></i>
        <span>{t('mk.label')}</span>
      </p>
      <ul className="market-row-list">
        {marches.map((marche) => {
          const total = counts[marche.code] ?? 0;
          const on = variant === 'prix' ? pays === marche.code : variant === 'board' && active === marche.code;
          const figure = total === 0 ? t('mk.none') : `${total} ${t('mk.figures')}`;
          const tip =
            total === 0 ? `${t(marche.cle)} · ${figure}` : `${t(marche.cle)} · ${figure} · ${t('mk.tip')}`;
          const inside = (
            <>
              <i className="ri-map-pin-2-line market-chip-pin" aria-hidden="true"></i>
              <span className="market-chip-city">{t(marche.cle)}</span>
              <span className={`market-chip-count${total === 0 ? ' is-empty' : ''}`} title={figure}>
                <i className="ri-file-list-3-line" aria-hidden="true"></i>
                <b>{total}</b>
                <span className="market-chip-sr">{figure}</span>
              </span>
              <span className="market-chip-code">{marche.code}</span>
              <i
                className={`market-chip-arrow ${on ? 'ri-check-line' : 'ri-arrow-right-line'}`}
                aria-hidden="true"
              ></i>
            </>
          );
          return (
            <li key={marche.code}>
              {variant === 'prix' ? (
                <button
                  type="button"
                  className={`market-chip${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  title={tip}
                  onClick={() => choisir(marche.code)}
                >
                  {inside}
                </button>
              ) : variant === 'board' ? (
                <Link
                  className={`market-chip${on ? ' is-on' : ''}`}
                  to={boardLink(marche.code)}
                  aria-current={on ? 'true' : undefined}
                  title={tip}
                  replace
                >
                  {inside}
                </Link>
              ) : (
                <Link
                  className="market-chip"
                  to={`/annuaire?pays=${marche.code}`}
                  title={tip}
                >
                  {inside}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="market-row-hint">
        {variant === 'prix' ? t('mk.hintPrix') : variant === 'board' ? t('mk.hintBoard') : t('mk.hint')}
      </p>
    </div>
  );
}