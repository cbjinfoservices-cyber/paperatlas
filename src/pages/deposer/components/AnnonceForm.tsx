import { useLang } from '@/i18n/LangProvider';
import { annonceCats } from '@/mocks/annonces';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
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
 * Le dépôt d'une annonce : du matériel, du papier, une prestation ou une
 * recherche. Les rubriques proposées sont celles des annonces, jamais un
 * contrat d'offre d'emploi.
 */
export default function AnnonceForm({ hidden, familyTotal = 0 }: Props) {
  const { t } = useLang();
  const f = useDepositForm('annonce');

  return (
    <div
      className="dep-panel"
      id="dep-panel-annonce"
      role="tabpanel"
      aria-labelledby="dep-tab-annonce"
      hidden={hidden}
    >
      <form id="depot-annonce" className="form-card deposit-form" onSubmit={f.onSubmit}>
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
            <i className="ri-megaphone-line" aria-hidden="true"></i>
            {t('dep.ann.head')}
          </h2>
          <p className="dep-form-lede">{t('dep.ann.lede')}</p>
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
            <label htmlFor="ann-rubrique">{t('dep.ann.rubrique')}</label>
            <select
              id="ann-rubrique"
              name="rubrique"
              value={f.rubrique}
              onChange={(e) => f.setRubrique(e.target.value)}
            >
              <option value="">{t('dep.rubriqueAny')}</option>
              {annonceCats.map((cat) => (
                <option key={cat} value={cat}>{t(CAT_KEY[cat])}</option>
              ))}
            </select>
            <span className="dep-rubrique-hint">{t('dep.rubriqueHintAnnonce')}</span>
          </div>
          <div className="fld">
            <label htmlFor="ann-titre">{t('dep.ann.titleField')} *</label>
            <input
              id="ann-titre"
              name="titre"
              required
              placeholder={t('dep.titlePh')}
              value={f.titre}
              onChange={(e) => f.setTitre(e.target.value)}
            />
          </div>
        </div>

        <DepositContactFields
          f={f}
          idPrefix="ann"
          orgLabel={t('dep.org')}
          budgetLabel={t('dep.ann.budget')}
          budgetPlaceholder={t('dep.ann.budgetPh')}
        />

        <div className="fld">
          <label htmlFor="ann-desc">
            {t('dep.ann.desc')} *{' '}
            <span className="dep-count" dir="ltr">
              {f.count}/500
            </span>
          </label>
          <textarea
            id="ann-desc"
            name="description"
            maxLength={500}
            required
            value={f.description}
            onChange={(e) => {
              f.setDescription(e.target.value);
              f.setCount(e.target.value.length);
            }}
            placeholder={t('dep.ann.descPh')}
          />
        </div>

        <DepositPreview
          kind="annonce"
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
          kind="annonce"
          rubrique={f.rubrique}
          total={familyTotal}
          onUse={f.setTitre}
        />

        <button type="submit" className="cta" disabled={f.status === 'sending'}>
          {f.status === 'sending' ? t('dep.sending') : t('dep.ann.send')}
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