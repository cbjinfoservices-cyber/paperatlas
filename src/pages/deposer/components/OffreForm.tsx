import { useLang } from '@/i18n/LangProvider';
import { contracts } from '@/mocks/emplois';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import { useDepositForm } from '@/pages/deposer/components/useDepositForm';
import DepositContactFields from '@/pages/deposer/components/DepositContactFields';
import DepositDraftNote from '@/pages/deposer/components/DepositDraftNote';
import DepositPreview from '@/pages/deposer/components/DepositPreview';
import DepositRubriqueLine from '@/pages/deposer/components/DepositRubriqueLine';
import DepositFeedback from '@/pages/deposer/components/DepositFeedback';

type Props = {
  /** L'onglet ouvert : le panneau reste monté pour ne rien perdre d'un onglet à l'autre. */
  hidden: boolean;
  /** Les lignes publiées dans toute la famille : le tout dont la rubrique est une part. */
  familyTotal?: number;
};

/**
 * Le dépôt d'une offre d'emploi : le poste, le contrat, le salaire et le
 * profil attendu. Les rubriques proposées sont les quatre contrats, jamais
 * une catégorie d'annonce.
 */
export default function OffreForm({ hidden, familyTotal = 0 }: Props) {
  const { t } = useLang();
  const f = useDepositForm('offre');

  return (
    <div
      className="dep-panel"
      id="dep-panel-offre"
      role="tabpanel"
      aria-labelledby="dep-tab-offre"
      hidden={hidden}
    >
      <form id="depot-offre" className="form-card deposit-form" onSubmit={f.onSubmit}>
        <input
          type="text"
          name="website_alt"
          className="fld-aux"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          readOnly
          onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
        />

        <header className="dep-form-head">
          <h2 className="dep-form-h">
            <i className="ri-briefcase-line" aria-hidden="true"></i>
            {t('dep.off.head')}
          </h2>
          <p className="dep-form-lede">{t('dep.off.lede')}</p>
        </header>

        {f.compte && (
          <p className="dep-pre">
            <i className="ri-user-received-2-line" aria-hidden="true"></i>
            {t('dep.prefilledNote')}
          </p>
        )}

        <DepositDraftNote back={f.draftBack} onClear={f.effacerBrouillon} />

        <div className="form-grid">
          <div className="fld">
            <label htmlFor="off-rubrique">{t('dep.off.rubrique')}</label>
            <select
              id="off-rubrique"
              name="rubrique"
              value={f.rubrique}
              onChange={(e) => f.setRubrique(e.target.value)}
            >
              <option value="">{t('dep.rubriqueAny')}</option>
              {contracts.map((contrat) => (
                <option key={contrat} value={contrat}>{t(CONTRACT_KEY[contrat])}</option>
              ))}
            </select>
            <span className="dep-rubrique-hint">{t('dep.rubriqueHintOffre')}</span>
          </div>
          <div className="fld">
            <label htmlFor="off-titre">{t('dep.off.titleField')} *</label>
            <input
              id="off-titre"
              name="titre"
              required
              placeholder={t('dep.off.titlePh')}
              value={f.titre}
              onChange={(e) => f.setTitre(e.target.value)}
            />
          </div>
        </div>

        <DepositContactFields
          f={f}
          idPrefix="off"
          orgLabel={t('dep.off.org')}
          budgetLabel={t('dep.off.budget')}
          budgetPlaceholder={t('dep.off.budgetPh')}
        />

        <div className="fld">
          <label htmlFor="off-desc">
            {t('dep.off.desc')} *{' '}
            <span className="dep-count" dir="ltr">
              {f.count}/500
            </span>
          </label>
          <textarea
            id="off-desc"
            name="description"
            maxLength={500}
            required
            value={f.description}
            onChange={(e) => {
              f.setDescription(e.target.value);
              f.setCount(e.target.value.length);
            }}
            placeholder={t('dep.off.descPh')}
          />
        </div>

        <DepositPreview
          kind="offre"
          titre={f.titre}
          description={f.description}
          rubrique={f.rubrique}
          org={f.org}
          email={f.email}
          budget={f.budget}
          phone={f.phone}
          pays={f.pays}
          wilaya={f.wilaya}
          commune={f.commune}
        />

        <DepositRubriqueLine
          kind="offre"
          rubrique={f.rubrique}
          total={familyTotal}
          onUse={f.setTitre}
        />

        <button type="submit" className="cta" disabled={f.status === 'sending'}>
          {f.status === 'sending' ? t('dep.sending') : t('dep.off.send')}
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </button>

        <DepositFeedback
          status={f.status}
          error={f.formError}
          signedIn={Boolean(f.session)}
        />
      </form>
    </div>
  );
}