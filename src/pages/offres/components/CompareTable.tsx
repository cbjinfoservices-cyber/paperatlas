import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { usePrixPays } from '@/hooks/usePrixPays';
import {
  plans,
  lienInscription,
  prixPlan,
  prixParMoisLocal,
  economieLocale,
  planAnchor,
} from './plans';
import '@/styles/offres-durees.css';

/**
 * The four lengths on one sheet: what each one is paid, what the month comes
 * to inside it, and what it saves against paying month after month. Same
 * engine as the cards, so the table can never disagree with them.
 */
export default function CompareTable() {
  const { t } = useLang();
  const { pays } = usePrixPays();

  return (
    <div className="of-table-block" data-reveal>
      <div className="of-table-wrap">
        <div className="of-table of-table-dur" role="table" aria-label={t('ofp.tableTitle')}>
          <div className="of-tr of-tr-head" role="row">
            <span className="of-th of-th-label" role="columnheader">{t('off.tDuree')}</span>
            <span className="of-th" role="columnheader">
              <b className="of-th-name">{t('off.tPrix')}</b>
            </span>
            <span className="of-th" role="columnheader">
              <b className="of-th-name">{t('off.tMois')}</b>
            </span>
            <span className="of-th" role="columnheader">
              <b className="of-th-name">{t('off.tEco')}</b>
            </span>
            <span className="of-th" role="columnheader">
              <b className="of-th-name">{t('off.tOpen')}</b>
            </span>
          </div>

          {plans.map((plan) => {
            const parMois = prixParMoisLocal(plan, pays);
            const economie = economieLocale(plan, pays);
            return (
              <div key={plan.id} className={`of-tr${plan.featured ? ' is-dur-best' : ''}`} role="row">
                <span className="of-td of-td-label" role="rowheader">
                  {t(plan.name)} · {t(plan.per)}
                </span>
                <span className="of-td of-td-num of-td-strong" role="cell">
                  {prixPlan(plan, pays, t)}
                </span>
                <span className="of-td of-td-num" role="cell">
                  {parMois.montant}
                </span>
                <span className={`of-td of-td-num${economie ? ' of-td-save' : ''}`} role="cell">
                  {economie ?? '—'}
                </span>
                <span className="of-td" role="cell">
                  <Link to={lienInscription(plan.id, pays)} className="of-td-open">
                    <span className="whitespace-nowrap">{t('off.tChoose')}</span>
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="of-table-note">
        <i className="ri-information-line" aria-hidden="true"></i>
        <span>{t('off.note')}</span>
      </p>
      <p className="of-table-note">
        <i className="ri-anchor-line" aria-hidden="true"></i>
        <span>
          {t('off.tableAnchor')}{' '}
          <a href={`#${planAnchor('annee')}`} className="of-td-open">
            {t('off.m4t')}
          </a>
        </span>
      </p>
    </div>
  );
}