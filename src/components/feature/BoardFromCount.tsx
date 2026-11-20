import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';

type Props = {
  /** Combien de lignes le tableau d'où l'on vient tient encore. */
  rows: number;
  /** Le tableau tel qu'on l'a quitté : même pays, même région, même ordre. */
  href: string;
  /** Le pays sur lequel le tableau était resserré, s'il y en avait un. */
  pays?: string;
  /** La région sur laquelle le tableau était resserré, s'il y en avait une. */
  wilaya?: string;
  /** Les classes du panneau qui l'accueille : la fiche d'un candidat porte les
      siennes, celles d'une annonce et d'une offre les leurs. */
  className?: string;
  /** Le repère du tableau d'où l'on vient : le groupe pour un vivier, la liste
      pour un tableau de marchandises ou d'offres. */
  icon?: string;
};

/**
 * Le compte du tableau d'où l'on vient, rappelé sur une fiche.
 *
 * Il se lit dans la rangée des rappels de lecture — rayon, lettre, région —,
 * plus discret qu'eux : il situe la fiche dans l'ensemble sans décrire la
 * lecture.
 *
 * Deux gestes tiennent dans cette plaque. Au survol, un petit panneau dit de
 * quoi le compte est fait : les lignes, puis le pays et la région sur lesquels
 * le tableau était resserré — sans eux, « 24 lignes » ne dit pas de quel
 * tableau il parle. Au clic, le tableau se rouvre au même périmètre, d'un seul
 * geste : c'est une porte, pas un simple chiffre.
 */
export default function BoardFromCount({
  rows,
  href,
  pays = '',
  wilaya = '',
  className = '',
  icon = 'ri-list-check-2',
}: Props) {
  const { t, lang } = useLang();
  /* Le panneau se nomme par un identifiant stable : la plaque s'y attache pour
     que le survol soit aussi une description, et non un simple ornement. */
  const hintId = `board-fromcount-${useId().replace(/:/g, '')}`;
  if (rows <= 0) return null;

  const rowsLine = t(rows === 1 ? 'boardfrom.hintRowsOne' : 'boardfrom.hintRows').replace(
    '{n}',
    String(rows),
  );
  const paysLine = pays ? t('boardfrom.hintPays').replace('{pays}', nomPays(pays, lang)) : '';
  const regionLine = wilaya
    ? t('boardfrom.hintRegion').replace('{region}', nomRegion(wilaya, lang))
    : '';

  return (
    <Link
      to={href}
      className={`board-fromcount${className ? ` ${className}` : ''}`}
      title={t('boardfrom.reopen')}
      aria-describedby={hintId}
    >
      <i className={icon} aria-hidden="true"></i>
      <span>
        {t(rows === 1 ? 'boardfrom.countOne' : 'boardfrom.countMany').replace('{n}', String(rows))}
      </span>
      {/* La plaque est une porte : la flèche le dit avant le clic. */}
      <span className="board-fromcount-go" aria-hidden="true">
        <i className="ri-arrow-go-back-line"></i>
      </span>
      {/* De quoi le compte est fait, dans un panneau posé sous la plaque : il
          ne prend jamais place dans la rangée, même en arabe. */}
      <span id={hintId} className="board-fromcount-hint">
        <span className="board-fromcount-row">{rowsLine}</span>
        {paysLine && <span className="board-fromcount-row">{paysLine}</span>}
        {regionLine && <span className="board-fromcount-row">{regionLine}</span>}
        <span className="board-fromcount-row board-fromcount-open">
          {t('boardfrom.reopen')}
        </span>
      </span>
    </Link>
  );
}