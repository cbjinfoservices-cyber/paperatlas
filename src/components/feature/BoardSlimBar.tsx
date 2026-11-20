import { useState, type ReactNode } from 'react';
import { useLang } from '@/i18n/LangProvider';
import type { GeoStatus } from '@/hooks/useGeo';
import StickyStack from '@/components/feature/StickyStack';

type Props = {
  /** La rubrique du tableau (ses pastilles), tenue dans la même pile. */
  lead: ReactNode;
  /** Le champ de recherche : l'icône et son entrée, sans l'encadré. */
  search: ReactNode;
  /** Ce que la liste tient : le chiffre se lit porte fermée. */
  count: number;
  /** Le mot qui suit le chiffre, accordé à la rubrique lue. */
  countWord: string;
  geoStatus: GeoStatus;
  distanceReady: boolean;
  /** « Autour de moi » : demander la position, ou la rendre. */
  onNear: () => void;
  /** Combien de choix sont déjà posés derrière la porte. */
  folded: number;
  dirty: boolean;
  resetLabel: string;
  onReset: () => void;
  /** Rend les seuls filtres rangés derrière la porte, sans toucher à la
      rubrique lue : le pays, la région, l'ordre et le rayon. */
  onClearFolded?: () => void;
  /** Le dépliant : le pays, la région, l'ordre de lecture, le rayon. */
  panel: ReactNode;
};

/**
 * La rangée haute des tableaux d'annonces et d'emplois, ramenée à l'essentiel.
 *
 * Le tableau arrivait sur deux bandes — les pastilles de rubrique, puis une
 * grille de quatre champs et une remise à zéro. Il montre maintenant une seule
 * rangée, la même que l'annuaire : la recherche, le chiffre des résultats,
 * « Autour de moi », une porte qui ouvre le reste, et la remise à zéro. Le
 * pays, la région, l'ordre de lecture et le rayon se rangent dans le dépliant :
 * rien n'est retiré, tout attend derrière le même geste.
 *
 * Le chiffre des résultats reste dans la rangée : aucune liste ne s'ouvre sur
 * un silence au sujet de ce qu'elle tient, et le clic mène droit aux fiches.
 *
 * Le dépliant ne s'ouvre de lui-même qu'une fois, à l'arrivée, et seulement si
 * un filtre est déjà posé — une adresse partagée, une recherche reprise. Une
 * fois qu'on le referme, c'est la personne qui décide.
 */
export default function BoardSlimBar({
  lead,
  search,
  count,
  countWord,
  geoStatus,
  distanceReady,
  onNear,
  folded,
  dirty,
  resetLabel,
  onReset,
  onClearFolded,
  panel,
}: Props) {
  const { t } = useLang();
  /* L'état de départ : ouvert si un filtre accompagne l'arrivée, fermé sinon.
     La recherche vit dans la rangée : la frappe ne rouvre donc jamais la porte
     sous les doigts de celui qui écrit. */
  const [more, setMore] = useState(() => folded > 0);

  /* La porte ne se referme pas d'elle-même : une fois qu'on l'a refermée, un
     filtre posé depuis le dépliant ne la rouvre pas sous les doigts. */
  const toggleMore = () => {
    setMore((prev) => !prev);
  };

  const asking = geoStatus === 'asking';
  const geoMessage = geoStatus === 'denied'
    ? t('near.denied')
    : geoStatus === 'error'
      ? t('near.error')
      : geoStatus === 'unsupported'
        ? t('near.unsupported')
        : '';

  return (
    <StickyStack className={more ? 'is-panel-open' : ''}>
      {lead}

      <div className={`filters is-slim${more ? ' is-open' : ''}`}>
        <div className="fld fld-inline filters-search filters-kind">{search}</div>

        <button
          type="button"
          className="filters-count"
          title={t('dir.countHint')}
          onClick={() => document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          <strong>{count}</strong>
          <span className="filters-count-word">{countWord}</span>
        </button>

        <button
          type="button"
          className={`near-btn filters-near${distanceReady ? ' is-on' : ''}`}
          onClick={onNear}
          aria-pressed={distanceReady}
          title={geoMessage || t('near.label')}
          disabled={asking || geoStatus === 'unsupported'}
        >
          <i
            className={asking ? 'ri-loader-4-line is-spin' : distanceReady ? 'ri-navigation-fill' : 'ri-focus-3-line'}
            aria-hidden="true"
          ></i>
          <span className="whitespace-nowrap">
            {asking ? t('near.asking') : distanceReady ? t('near.active') : t('near.label')}
          </span>
        </button>

        <button
          type="button"
          className={`filters-toggle${more ? ' is-open' : ''}`}
          aria-expanded={more}
          aria-controls="board-filters-panel"
          title={t('board.moreHint')}
          onClick={toggleMore}
        >
          <i className="ri-equalizer-2-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('dir.moreFilters')}</span>
          {folded > 0 && <span className="filters-toggle-n" aria-hidden="true">{folded}</span>}
          {folded > 0 && <span className="filters-toggle-sr">: {folded}</span>}
          <i className="ri-arrow-down-s-line filters-toggle-caret" aria-hidden="true"></i>
        </button>

        <button type="button" className="filters-reset" onClick={onReset} disabled={!dirty}>
          <i className="ri-refresh-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{resetLabel}</span>
        </button>
      </div>

      {geoMessage && (
        <p className="filters-geo">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          {geoMessage}
        </p>
      )}

      {more && (
        <div className="filters-panel" id="board-filters-panel">
          {panel}
          {/* La petite ligne du bas : elle rend ce que la porte tient, et rien
              de plus. La rubrique lue reste où elle est. */}
          {onClearFolded && (
            <p className="filters-panel-foot">
              <button
                type="button"
                className="filters-panel-clear"
                onClick={onClearFolded}
                disabled={folded === 0}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('board.clearFolded')}</span>
              </button>
              <span className="filters-panel-foot-hint">{t('board.clearFoldedHint')}</span>
            </p>
          )}
        </div>
      )}
    </StickyStack>
  );
}