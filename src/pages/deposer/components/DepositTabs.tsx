import { useLang } from '@/i18n/LangProvider';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';
import type { DepotCounts } from '@/hooks/useDepotCounts';
import type { DraftFlags } from '@/hooks/useDraftFlags';

type Props = {
  active: DepositKind;
  onChange: (kind: DepositKind) => void;
  /** Les lignes que chaque tableau tient déjà : de quoi situer son dépôt. */
  counts: DepotCounts;
  /** Les familles qui gardent un brouillon sur cet appareil. */
  drafts: DraftFlags;
  loading?: boolean;
};

/** Le point du brouillon : discret, il ne dit que « quelque chose attend ici ». */
function DraftDot() {
  const { t } = useLang();
  return (
    <span
      className="dep-tab-draft"
      role="img"
      aria-label={t('dep.tabDraftDot')}
      title={t('dep.tabDraftDot')}
    >
      <i className="ri-draft-line" aria-hidden="true"></i>
    </span>
  );
}

/**
 * Les deux dépôts, côte à côte : une annonce d'un côté, une offre d'emploi de
 * l'autre. Chaque onglet nomme ce qu'il tient — les rubriques de sa famille —
 * et dit combien de lignes cette famille compte déjà sur le tableau, pour
 * savoir dans quoi l'on dépose avant d'écrire. Un point signale la famille où
 * un brouillon attend, sans qu'on ait à ouvrir l'onglet.
 */
export default function DepositTabs({
  active, onChange, counts, drafts, loading = false,
}: Props) {
  const { t } = useLang();

  return (
    <div className="dep-tabs" role="tablist" aria-label={t('dep.tabs')}>
      <button
        type="button"
        role="tab"
        id="dep-tab-annonce"
        aria-controls="dep-panel-annonce"
        aria-selected={active === 'annonce'}
        className={`dep-tab${active === 'annonce' ? ' is-on' : ''}`}
        onClick={() => onChange('annonce')}
      >
        <span className="dep-tab-ico" aria-hidden="true">
          <i className="ri-megaphone-line"></i>
        </span>
        <span className="dep-tab-txt">
          <strong>{t('dep.tabAnnonce')}</strong>
          <small>{t('dep.tabAnnonceHint')}</small>
        </span>
        {drafts.annonce && <DraftDot />}
        <span
          className={`dep-tab-count${loading ? ' is-waiting' : ''}`}
          title={t('dep.tabCountTitle')}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          <b>{loading ? '…' : counts.annonce}</b>
          <span>{t('dep.tabCountLabel')}</span>
        </span>
      </button>

      <button
        type="button"
        role="tab"
        id="dep-tab-offre"
        aria-controls="dep-panel-offre"
        aria-selected={active === 'offre'}
        className={`dep-tab${active === 'offre' ? ' is-on' : ''}`}
        onClick={() => onChange('offre')}
      >
        <span className="dep-tab-ico" aria-hidden="true">
          <i className="ri-briefcase-line"></i>
        </span>
        <span className="dep-tab-txt">
          <strong>{t('dep.tabOffre')}</strong>
          <small>{t('dep.tabOffreHint')}</small>
        </span>
        {drafts.offre && <DraftDot />}
        <span
          className={`dep-tab-count${loading ? ' is-waiting' : ''}`}
          title={t('dep.tabCountTitle')}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          <b>{loading ? '…' : counts.offre}</b>
          <span>{t('dep.tabCountLabel')}</span>
        </span>
        {/* Les candidatures reçues sur les offres du compte : posées à côté
            des lignes publiées, elles disent ce que la famille fait déjà
            travailler. Rien ne s'affiche quand le compte n'en reçoit pas —
            un zéro promis serait plus bavard qu'utile. */}
        {typeof counts.candidatures === 'number' && counts.candidatures > 0 && (
          <span
            className={`dep-tab-count dep-tab-count--cand${loading ? ' is-waiting' : ''}`}
            title={t('dep.tabCandidatureTitle')}
          >
            <i className="ri-inbox-line" aria-hidden="true"></i>
            <b>{loading ? '…' : counts.candidatures}</b>
            <span>{t('dep.tabCandidatureLabel')}</span>
          </span>
        )}
      </button>
    </div>
  );
}