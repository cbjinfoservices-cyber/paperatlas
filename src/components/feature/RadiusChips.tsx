import { useLang } from '@/i18n/LangProvider';
import { RADIUS_STEPS } from '@/lib/boardRadiusMemory';

/** Les trois étapes du rayon, en kilomètres, communes aux quatre tableaux. */
export { RADIUS_STEPS };

type Props = {
  /** Le rayon retenu, en kilomètres ; 0 veut dire « tout le tableau ». */
  value: number;
  /** Ce que chaque rayon retiendrait du périmètre déjà filtré. */
  counts: Record<number, number>;
  /** Les lignes lues sans rayon : la pastille « Tout le tableau » le porte. */
  total: number;
  /** La position du visiteur : sans elle, le rayon ne mesure rien. */
  located: boolean;
  /** La localisation est en cours de demande. */
  asking?: boolean;
  onPick: (km: number) => void;
  onLocate: () => void;
  /** Le geste qui efface la position et rend le tableau entier. */
  onForget: () => void;
  /** D'où la distance est mesurée, quand le tableau a sa propre règle. */
  note?: string;
};

/**
 * Le rayon autour de la position du visiteur, posé sous les filtres des
 * tableaux. Chaque pastille dit d'avance combien de lignes elle laisserait :
 * on choisit un périmètre en sachant ce qu'il tient, jamais à l'aveugle.
 * Sans position connue, le geste qui la demande accompagne la rangée — le
 * tableau, lui, reste entier.
 *
 * Sous la rangée, une ligne discrète rappelle d'où la distance part, et donne
 * le geste pour effacer la position : un périmètre mesuré depuis chez soi doit
 * pouvoir se défaire aussi simplement qu'il s'est posé.
 */
export default function RadiusChips({
  value,
  counts,
  total,
  located,
  asking = false,
  onPick,
  onLocate,
  onForget,
  note,
}: Props) {
  const { t } = useLang();

  return (
    <div className="board-radius-wrap">
      <div className="board-radius">
        <span className="board-radius-lab">
          <i className="ri-focus-3-line" aria-hidden="true"></i>
          {t('radius.label')}
        </span>

        <div className="board-radius-opts" role="group" aria-label={t('radius.label')}>
          <button
            type="button"
            className={value === 0 ? 'is-on' : ''}
            aria-pressed={value === 0}
            onClick={() => onPick(0)}
          >
            <span>{t('radius.all')}</span>
            <b>{total}</b>
          </button>
          {RADIUS_STEPS.map((km) => (
            <button
              key={km}
              type="button"
              className={value === km ? 'is-on' : ''}
              aria-pressed={value === km}
              onClick={() => onPick(km)}
              title={located ? undefined : t('radius.hint')}
            >
              <span>{t('radius.less').replace('{km}', String(km))}</span>
              {/* Sans position, le rayon ne mesure rien : la pastille ne
                  prétend pas qu'il ne reste aucune ligne. */}
              <b>{located ? counts[km] ?? 0 : '—'}</b>
            </button>
          ))}
        </div>

        {!located && (
          <button
            type="button"
            className="board-trip-go"
            onClick={onLocate}
            disabled={asking}
          >
            <i className={asking ? 'ri-loader-4-line is-spin' : 'ri-focus-3-line'} aria-hidden="true"></i>
            <span className="whitespace-nowrap">{asking ? t('near.asking') : t('pro.locate')}</span>
          </button>
        )}
      </div>

      {/* La ligne qui dit d'où part la distance, et le geste qui l'efface. */}
      {located && (
        <p className="board-radius-src">
          <i className="ri-map-pin-user-line" aria-hidden="true"></i>
          <span>{note ?? t('radius.origin')}</span>
          <button type="button" className="board-radius-forget" onClick={onForget}>
            <i className="ri-close-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('radius.forget')}</span>
          </button>
        </p>
      )}
    </div>
  );
}