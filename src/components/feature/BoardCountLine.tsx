import type { ReactNode } from 'react';
import WeekPulse from '@/pages/annuaire/components/WeekPulse';
import ScopeLine from '@/pages/annuaire/components/ScopeLine';
import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Les dates de dépôt déjà filtrées : le pouls suit le périmètre lu. */
  dates: string[];
  weekCount: number;
  monthCount: number;
  /**
   * Le premier segment de la ligne, quand le tableau en a un plus riche que
   * la simple phrase des dépôts : le vivier de candidats y pose ses deux
   * compteurs cliquables, à la même place et dans le même rythme.
   */
  left?: ReactNode;
  /** Combien de pays le tableau tient dans son état actuel. */
  paysTotal: number;
  /** Combien de régions (wilayas, gouvernorats…) la sélection couvre. */
  regionTotal: number;
  /** Le mot de la division au pluriel : wilayas, gouvernorats, émirats… */
  division: string;
  pays: string;
  wilaya: string;
  /** L'adresse du tableau, pour que la ligne de périmètre y renvoie. */
  basePath: string;
  weekLabel: string;
  monthLabel: string;
  calm: string;
  paysWord: string;
  /** Le tableau est-il déjà lu bloc par bloc de pays ? */
  paysSort: boolean;
  /** Un clic sur le nombre de pays resserre le tableau sur eux. */
  onPaysSort: () => void;
};

/**
 * Les trois compteurs de la descente, sur une seule ligne, juste au-dessus des
 * fiches — la même ligne que l'annuaire, pour les annonces et les emplois :
 * les dépôts de la semaine à gauche, l'étendue (pays et régions) au centre, le
 * périmètre à droite. Rien n'est retiré : le pouls, les chiffres et la porte
 * de partage tiennent sur une bande.
 */
export default function BoardCountLine({
  dates,
  weekCount,
  monthCount,
  left,
  paysTotal,
  regionTotal,
  division,
  pays,
  wilaya,
  basePath,
  weekLabel,
  monthLabel,
  calm,
  paysWord,
  paysSort,
  onPaysSort,
}: Props) {
  const { t } = useLang();

  return (
    <div className="dir-countline board-countline">
      {left ?? (
        <div className="arrival-brief" aria-live="polite">
          <i className="ri-pulse-line" aria-hidden="true"></i>
          <span>
            {weekCount === 0 && monthCount === 0 ? (
              calm
            ) : (
              <>
                <strong>+{weekCount}</strong> {weekLabel}
                <em>·</em>
                <strong>+{monthCount}</strong> {monthLabel}
              </>
            )}
          </span>
          <WeekPulse dates={dates} />
        </div>
      )}

      <div className="board-spread">
        {/* Le chiffre n'est pas qu'une lecture : un clic resserre le tableau
            sur ses pays, les fiches d'un même pays se suivant. Une seconde
            fois rend l'ordre de dépôt, comme la pastille « Par pays ». */}
        <button
          type="button"
          className={`board-spread-btn${paysSort ? ' is-on' : ''}`}
          aria-pressed={paysSort}
          title={paysSort ? t('board.paysUngroup') : t('board.paysGroup')}
          onClick={onPaysSort}
        >
          <i className={paysSort ? 'ri-earth-fill' : 'ri-earth-line'} aria-hidden="true"></i>
          <strong>{paysTotal}</strong> {paysWord}
          <i className="ri-arrow-up-down-line board-spread-arrow" aria-hidden="true"></i>
        </button>
        <span>
          <i className="ri-map-pin-2-line" aria-hidden="true"></i>
          <strong>{regionTotal}</strong> {division}
        </span>
      </div>

      <ScopeLine wilaya={wilaya} pays={pays} basePath={basePath} />
    </div>
  );
}