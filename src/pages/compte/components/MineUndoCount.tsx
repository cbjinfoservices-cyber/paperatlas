import { useLang } from '@/i18n/LangProvider';

/** Le geste qui tire la série, déjà mis en mots par la page : sa durée, le
 *  côté vers lequel il tire, et la porte de la valeur qu'il retirait. */
export type MineUndoPull = {
  ago: string;
  up: boolean;
  door: { label: string; onOpen: () => void; aside?: number } | null;
};

type Props = {
  /** Combien de fois l'oubli a été défait. */
  count: number;
  /** Le jour du dernier geste, déjà mis en forme. */
  lastAt: string;
  /** Le temps que le dernier oubli a tenu, en mots ; vide s'il n'est pas connu. */
  forgotAgo: string;
  /** Combien de gestes gardés sur l'appareil. */
  heldCount: number;
  /** Les trois lectures du temps oublié, en mots ; vides quand elles se taisent. */
  avgAgo: string;
  medAgo: string;
  maxAgo: string;
  /** L'écart entre la médiane et la moyenne, signe compris ; vide à zéro. */
  gapAgo: string;
  gapUp: boolean;
  pull: MineUndoPull | null;
  onReset: () => void;
};

/**
 * Le petit compte de l'oubli défait : combien de fois le geste a été annulé,
 * le jour du dernier, puis les trois lectures du temps oublié — la moyenne,
 * la médiane, l'écart entre les deux et le geste qui tire la série. Sa porte
 * ouvre la valeur que ce geste retirait, prête à être corrigée.
 */
export default function MineUndoCount({
  count, lastAt, forgotAgo, heldCount, avgAgo, medAgo, maxAgo, gapAgo, gapUp, pull, onReset,
}: Props) {
  const { t } = useLang();
  const several = heldCount > 1;

  return (
    <p className="mine-rubrique-undo-count" title={t('acct.mine.rubriqueRestoreUndoCountHint')}>
      <i className="ri-repeat-line" aria-hidden="true"></i>
      <span>
        {count === 1
          ? t('acct.mine.rubriqueRestoreUndoCountOne').replace('{date}', lastAt)
          : t('acct.mine.rubriqueRestoreUndoCount')
            .replace('{n}', String(count))
            .replace('{date}', lastAt)}
      </span>
      {forgotAgo && (
        <span className="mine-rubrique-undo-forgot" title={t('acct.mine.rubriqueRestoreUndoForgotHint')}>
          {t('acct.mine.rubriqueRestoreUndoForgot').replace('{ago}', forgotAgo)}
        </span>
      )}
      {avgAgo && several && (
        <span
          className="mine-rubrique-undo-avg"
          title={t('acct.mine.rubriqueRestoreUndoHeldAvgHint').replace('{n}', String(heldCount))}
        >
          <i className="ri-bar-chart-horizontal-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueRestoreUndoHeldAvg')
            .replace('{ago}', avgAgo)
            .replace('{n}', String(heldCount))}
        </span>
      )}
      {medAgo && (
        <span
          className="mine-rubrique-undo-med"
          title={t('acct.mine.rubriqueRestoreUndoHeldMedHint').replace('{n}', String(heldCount))}
        >
          <i className="ri-bar-chart-box-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueRestoreUndoHeldMed')
            .replace('{ago}', medAgo)
            .replace('{n}', String(heldCount))}
        </span>
      )}
      {gapAgo && (
        <span
          className={`mine-rubrique-undo-gap${gapUp ? ' is-up' : ' is-down'}`}
          title={t('acct.mine.rubriqueRestoreUndoHeldGapHint').replace('{n}', String(heldCount))}
        >
          <i className={gapUp ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} aria-hidden="true"></i>
          {t('acct.mine.rubriqueRestoreUndoHeldGap').replace('{gap}', gapAgo)}
        </span>
      )}
      {pull && (
        <span
          className={`mine-rubrique-undo-pull${pull.up ? ' is-up' : ' is-down'}`}
          title={t('acct.mine.rubriqueRestoreUndoPullHint')
            .replace('{ago}', pull.ago)
            .replace('{dir}', t(pull.up
              ? 'acct.mine.rubriqueRestoreUndoPullUp'
              : 'acct.mine.rubriqueRestoreUndoPullDown'))
            .replace('{n}', String(heldCount))}
        >
          <i
            className={pull.up ? 'ri-arrow-up-double-line' : 'ri-arrow-down-double-line'}
            aria-hidden="true"
          ></i>
          {t('acct.mine.rubriqueRestoreUndoPull').replace('{ago}', pull.ago)}
          <span className="mine-rubrique-undo-pull-dir">
            {t(pull.up
              ? 'acct.mine.rubriqueRestoreUndoPullUp'
              : 'acct.mine.rubriqueRestoreUndoPullDown')}
          </span>
          {pull.door && (
            <button
              type="button"
              className="mine-rubrique-undo-pull-door"
              onClick={pull.door.onOpen}
              title={t('acct.mine.rubriqueRestoreUndoPullDoorHint')
                .replace('{rub}', pull.door.label)}
            >
              <i className="ri-route-line" aria-hidden="true"></i>
              {t('acct.mine.rubriqueRestoreUndoPullDoor').replace('{rub}', pull.door.label)}
              {/* Ce que la porte ramènera à l'écran : les dépôts de cette
                  valeur restés hors liste, comptés avant le clic. */}
              {(pull.door.aside ?? 0) > 0 && (
                <span
                  className="mine-rubrique-undo-pull-door-n"
                  dir="ltr"
                  title={t('acct.mine.rubriqueRestoreUndoPullDoorAsideHint')
                    .replace('{n}', String(pull.door.aside))}
                >
                  <i className="ri-eye-off-line" aria-hidden="true"></i>
                  {pull.door.aside}
                </span>
              )}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </button>
          )}
        </span>
      )}
      {maxAgo && several && (
        <span
          className="mine-rubrique-undo-max"
          title={t('acct.mine.rubriqueRestoreUndoHeldMaxHint').replace('{n}', String(heldCount))}
        >
          <i className="ri-hourglass-line" aria-hidden="true"></i>
          {t('acct.mine.rubriqueRestoreUndoHeldMax').replace('{ago}', maxAgo)}
        </span>
      )}
      <button
        type="button"
        className="mine-rubrique-undo-reset"
        onClick={onReset}
        title={t('acct.mine.rubriqueUndoResetHint')}
        aria-label={t('acct.mine.rubriqueUndoReset')}
      >
        <i className="ri-eraser-line" aria-hidden="true"></i>
      </button>
    </p>
  );
}