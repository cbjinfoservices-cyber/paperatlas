import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { usePrixPays } from '@/hooks/usePrixPays';
import { paysAuPlancher } from '@/lib/tarif';
import {
  plans,
  planAnchor,
  lienInscription,
  prixPlan,
  prixPlanLocal,
  prixParMoisLocal,
  economieLocale,
  type Plan,
} from './plans';
import '@/styles/offres-durees.css';

type Reader = (k: string) => string;

type HeadProps = {
  plan: Plan;
  pays: string;
  t: Reader;
};

/**
 * The name, the figure and what the figure covers. The whole period is read in
 * the money of the country on screen, the month it comes to sits under it, and
 * the dinar amount stays beside them so a reader abroad never loses the price
 * the board started from.
 */
function PlanHead({ plan, pays, t }: HeadProps) {
  const local = prixPlanLocal(plan, pays);
  const parMois = prixParMoisLocal(plan, pays);
  const economie = economieLocale(plan, pays);
  /* A market held on the very bottom of the corridor says it here too, in the
     same word the tariff table uses, so the card never reads as a mistake. */
  const plancher = paysAuPlancher(pays);

  return (
    <div className="of-plan-head">
      <span className="of-plan-icon" aria-hidden="true">
        <i className={plan.icon}></i>
      </span>
      <div className="of-plan-ident">
        <h3 className="of-plan-name">{t(plan.name)}</h3>
        <p className="of-plan-price">
          <strong>{prixPlan(plan, pays, t)}</strong>
          <span className="of-plan-per">{t(plan.per)}</span>
        </p>

        {/* The month the length comes to: the only figure that compares.
            On the year card it is read large, so a reader holds the four
            lengths against each other without reaching for a calculator. */}
        <p className={`of-plan-eq${plan.featured ? ' is-lead' : ''}`}>
          <i className="ri-divide-line" aria-hidden="true"></i>
          <span className="of-plan-eq-lab">{t('off.eq')}</span>
          <b>{parMois.montant}</b>
        </p>

        {economie && (
          <p className="of-plan-save">
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            <span>
              {t('off.saving')} <b>{economie}</b>
            </span>
          </p>
        )}

        {local.origine && (
          <p className="of-plan-dzd">
            <i className="ri-refresh-line" aria-hidden="true"></i>
            <span>
              {t('ofp.dzdSoit')} <b>{local.origine}</b>
            </span>
            {local.ajuste && (
              <span className="of-plan-dzd-tag" title={t('ofp.coefNote')}>
                <i className="ri-scales-3-line" aria-hidden="true"></i>
                {t('ofp.coefBadge')}
              </span>
            )}
            {plancher && (
              <span className="of-plan-dzd-tag is-floor" title={t('ofs.floorTip')}>
                <i className="ri-anchor-line" aria-hidden="true"></i>
                {t('ofp.plancherTag')}
              </span>
            )}
          </p>
        )}
        {!local.origine && plancher && (
          <p className="of-plan-dzd">
            <span className="of-plan-dzd-tag is-floor" title={t('ofs.floorTip')}>
              <i className="ri-anchor-line" aria-hidden="true"></i>
              {t('ofp.plancherTag')}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

type Props = {
  /** The home section shows the same cards, tightened to stay one screen tall. */
  compact?: boolean;
  /** The reveal animation is only wired on the page that runs it. */
  reveal?: boolean;
};

/**
 * The subscription in four lengths of time: the month, the quarter, the half
 * year and the year — each with its own figure, what it brings, the saving it
 * holds, and the door that opens it. One offer, read four ways.
 */
export default function PlanCards({ compact = false, reveal = false }: Props) {
  const { t } = useLang();
  /* The price follows the country on screen, so a reader in Cairo never sees a
     dinar figure and a reader in Oran never sees a pound figure. */
  const { pays } = usePrixPays();

  return (
    <>
      <div className={`of-plans is-durees${compact ? ' is-compact' : ''}`}>
        {plans.map((plan) => (
          <article
            key={plan.id}
            id={planAnchor(plan.id)}
            className={`of-plan${plan.featured ? ' is-featured' : ''}`}
            {...(reveal ? { 'data-reveal': '' } : {})}
          >
            {plan.featured && (
              <span className="of-plan-badge">
                <i className="ri-sparkling-2-line" aria-hidden="true"></i>
                {t('off.best')}
              </span>
            )}

            <PlanHead plan={plan} pays={pays} t={t} />

            <ul className="of-includes">
              {plan.includes.map((key) => (
                <li key={key}>
                  <i className="ri-check-line" aria-hidden="true"></i>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <p className="of-plan-diff">
              <i className="ri-focus-3-line" aria-hidden="true"></i>
              <span>{t(plan.diff)}</span>
            </p>

            <Link
              to={lienInscription(plan.id, pays)}
              className={`of-plan-cta${plan.featured ? ' is-solid' : ''}`}
            >
              <span className="whitespace-nowrap">{t(plan.cta)}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </article>
        ))}
      </div>

      {/* What every length buys, said once under the four cards: the grid above
          compares the time and the price, this line says the rest is the same. */}
      <div className="of-all-includes">
        <p className="of-all-includes-title">
          <i className="ri-shield-check-line" aria-hidden="true"></i>
          <span>{t('off.allTitle')}</span>
        </p>
        <ul className="of-all-list">
          {['off.all1', 'off.all2', 'off.all3', 'off.all4'].map((key) => (
            <li key={key}>
              <i className="ri-check-line" aria-hidden="true"></i>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}