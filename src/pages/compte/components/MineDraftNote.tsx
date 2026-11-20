import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { markRepris, type DepotBrouillon } from '@/lib/depotBrouillon';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

type Props = {
  kind: DepositKind;
  draft: DepotBrouillon;
  /** L'âge du brouillon, en mots : « 3 jours », « moins d'une heure ». */
  age: string;
  /** L'âge de la reprise, quand ce brouillon a déjà été rouvert pendant la visite. */
  reprisAge?: string | null;
  onClear: () => void;
};

/**
 * Le brouillon qu'un visiteur a commencé sans l'envoyer reste sur l'appareil :
 * la console le signale ici, avec la porte qui rouvre le formulaire et le
 * geste qui l'efface. Rien n'est envoyé, rien n'est publié — c'est une note,
 * pas un dépôt.
 *
 * Quand la porte a déjà servi pendant cette visite, la note le dit : le dépôt
 * est rouvert, il ne faut pas en commencer un second en double.
 */
export default function MineDraftNote({
  kind, draft, age, reprisAge = null, onClear,
}: Props) {
  const { t } = useLang();
  const said = draft.titre.trim() || draft.description.trim().slice(0, 70);

  return (
    <div className={`mine-draft${reprisAge ? ' is-repris' : ''}`} role="note">
      <span className="mine-draft-ico" aria-hidden="true">
        <i className={reprisAge ? 'ri-repeat-line' : 'ri-draft-line'}></i>
      </span>
      <div className="mine-draft-txt">
        <p className="mine-draft-head">{t('acct.mine.draftTitle')}</p>
        {said && <p className="mine-draft-name">{said}</p>}
        <p className="mine-draft-meta">
          {t('acct.mine.draftAge')} {age} · {t('acct.mine.draftNote')}
        </p>
        {reprisAge && (
          <p className="mine-draft-repris">
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            {t('acct.mine.draftRepris')} · {t('acct.mine.draftReprisAge')} {reprisAge} —{' '}
            {t('acct.mine.draftReprisNote')}
          </p>
        )}
      </div>
      <div className="mine-draft-acts">
        <Link
          to={`/deposer?type=${kind}&reprendre=1`}
          className="cta mine-draft-open"
          title={t('acct.mine.draftOpenHint')}
          onClick={() => markRepris(kind)}
        >
          {reprisAge ? t('acct.mine.draftReopen') : t('acct.mine.draftOpen')}
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </Link>
        <button
          type="button"
          className="link-btn mine-draft-clear"
          onClick={onClear}
          title={t('acct.mine.draftClearHint')}
        >
          <i className="ri-delete-bin-line" aria-hidden="true"></i>
          {t('acct.mine.draftClear')}
        </button>
      </div>
    </div>
  );
}