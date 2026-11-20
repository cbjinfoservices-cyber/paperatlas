import { useId } from 'react';
import { useLang } from '@/i18n/LangProvider';
import WalkLostTag from './WalkLostTag';

type Props = {
  /** Combien de carnets portent une porte vide : c'est le chiffre du jeton. */
  deadBooks: number;
  /** Le jeton est-il posé ? Posé, il nomme le geste qui rend les carnets. */
  on: boolean;
  /** La première liste du survol, une fois posé : les carnets qu'il garde. */
  kept?: string;
  /** La seconde liste : ceux qu'il retire, accordée à leur nombre. */
  removed?: string;
  /** Posé : combien de portes restent vides dans le relevé resserré. */
  emptyLeft?: number;
  /** Sur le vivier : combien de ses profils ont une porte vide — une région ou
      un métier dont l'annuaire ne tient plus aucune fiche. */
  lost?: number;
  /** Les portes sur lesquelles ce compte s'appuie : région et métier. */
  lostBy?: { region: number; trade: number };
  /** Ce que le jeton fait avant le clic : le survol le dit au repos. */
  hint: string;
  onToggle: () => void;
};

/**
 * Le jeton des carnets à porte vide.
 *
 * Il vit à part du relevé parce qu'il paraît partout où le relevé paraît : en
 * tête du suivi, et sous la ligne des portes vides de chaque fiche — atelier,
 * plume, candidat, annonce, offre. Un seul morceau, donc un seul geste : d'un
 * clic il ne garde que les carnets dont une porte ne mène plus à rien ; d'un
 * second il les rend tous, sans rien effacer.
 *
 * Le chiffre se lit dans les deux états : avant le clic il dit combien de
 * carnets portent une porte vide ; une fois posé, il dit combien restent
 * lisibles sous le relevé resserré — le compte ne disparaît donc pas au moment
 * où il devient le plus utile.
 *
 * Le survol, lui, porte deux listes : les carnets retenus, puis ceux que le
 * relevé resserré a retirés. Elles se lisent chacune sur sa ligne, dans un
 * panneau qui se pose sous la pastille sans prendre place dans la rangée — une
 * liste longue ne pousse donc jamais le relevé, ni en arabe ni sur téléphone.
 */
export default function WalkDeadTag({
  deadBooks,
  on,
  kept = '',
  removed = '',
  emptyLeft = 0,
  lost = 0,
  lostBy,
  hint,
  onToggle,
}: Props) {
  const { t } = useLang();
  /* Le panneau se nomme par un identifiant stable : le jeton s'y attache pour
     que le survol soit aussi une description, et non un simple ornement. */
  const emptyLine = emptyLeft > 0
    ? t(emptyLeft === 1 ? 'pro.walkEmptyLeftOne' : 'pro.walkEmptyLeftMany').replace('{n}', String(emptyLeft))
    : '';
  const hintId = `walk-tag-hint-${useId().replace(/:/g, '')}`;

  return (
    <div className="dist-walk-tags">
      <button
        type="button"
        className={`dist-walk-tag${on ? ' is-on' : ''}`}
        onClick={onToggle}
        aria-pressed={on}
        aria-describedby={hintId}
      >
        <i className={on ? 'ri-close-line' : 'ri-filter-3-line'} aria-hidden="true"></i>
        <span className="whitespace-nowrap">
          {on ? t('pro.walkDeadAll') : t('pro.walkDeadOnly')}
        </span>
        {/* Posé, le jeton dit combien de carnets restent lisibles : le compte
            se lit alors à côté du mot qui l'explique, et les deux ne se
            séparent jamais — le chiffre seul ne dirait pas ce qu'il compte,
            et le mot seul ne dirait pas combien. */}
        <span className="dist-walk-tag-count">
          <b>{deadBooks}</b>
          {on && (
            <span className="dist-walk-tag-kept">{t('pro.walkKeptWord')}</span>
          )}
        </span>
      </button>

      {/* Le survol, dans un panneau posé sous la pastille : deux listes, une
          ligne chacune. Posé, le jeton nomme d'abord ce qu'il garde, puis ce
          qu'il retire — l'ordre du geste. Au repos, il dit seulement ce qu'il
          fera. */}
      <span id={hintId} className="dist-walk-tag-hint">
        {on ? (
          <>
            {emptyLine && <span className="dist-walk-tag-hint-row">{emptyLine}</span>}
            {kept && <span className="dist-walk-tag-hint-row">{kept}</span>}
            {removed && <span className="dist-walk-tag-hint-row">{removed}</span>}
          </>
        ) : (
          <span className="dist-walk-tag-hint-row">{hint}</span>
        )}
      </span>

      {/* Le compte du vivier, posé à côté du jeton : il ne dit pas les carnets,
          mais les profils qui n'ont plus de porte où aller — une région ou un
          métier dont l'annuaire ne tient aucune fiche. */}
      <WalkLostTag lost={lost} by={lostBy} />
    </div>
  );
}