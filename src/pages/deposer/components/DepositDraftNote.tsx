import { useLang } from '@/i18n/LangProvider';

type Props = {
  /** Le brouillon a été retrouvé à l'ouverture : on le dit, au lieu de faire semblant. */
  back: boolean;
  onClear: () => void;
};

/**
 * La ligne qui dit où vit le brouillon : sur cet appareil, pendant la frappe.
 * Quand un brouillon a été retrouvé, elle le signale et laisse l'effacer d'un
 * geste, sans toucher au reste du formulaire.
 */
export default function DepositDraftNote({ back, onClear }: Props) {
  const { t } = useLang();

  return (
    <p className={`dep-draft${back ? ' is-back' : ''}`}>
      <i className={back ? 'ri-arrow-go-back-line' : 'ri-save-3-line'} aria-hidden="true"></i>
      <span>{back ? t('dep.draftBack') : t('dep.draftKept')}</span>
      {back && (
        <button type="button" className="dep-draft-clear" onClick={onClear}>
          <i className="ri-delete-bin-6-line" aria-hidden="true"></i>
          {t('dep.draftClear')}
        </button>
      )}
    </p>
  );
}