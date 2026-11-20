import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import { usePrixPays } from '@/hooks/usePrixPays';
import { planById, planCardHref } from './plans';

/** The three steps of the institution path, said in order. */
const steps = [
  { n: '01', icon: 'ri-user-add-line', title: 'ofip.s1t', text: 'ofip.s1d' },
  { n: '02', icon: 'ri-building-2-line', title: 'ofip.s2t', text: 'ofip.s2d' },
  { n: '03', icon: 'ri-contacts-line', title: 'ofip.s3t', text: 'ofip.s3d' },
];

/** The public, aggregate-only view of the institution accounts: two numbers,
 *  never a name. */
const ETABS_VIEW = 'paperatlas_institutions_etabs';

type Count = { structures: number; etablissements: number };

type Props = {
  /** The home section folds the band to one row, to stay on a single screen. */
  compact?: boolean;
};

/**
 * « Vous êtes une institution ? » — the band that explains, in three steps,
 * what opening an institution account actually involves: the account itself,
 * the establishments attached to it, and the contact who takes it over. It
 * sits right under the three cards, so the Institutions door is not a mystery.
 */
export default function InstitutionPath({ compact = false }: Props) {
  const { t } = useLang();
  const plan = planById('institutions');
  /* The card door keeps the market read on the page, so an institution coming
     from another country finds the tariff it was reading, not another one. */
  const { pays } = usePrixPays();
  const titleId = compact ? 'of-insti-band-home' : 'of-insti-band-title';
  /* What the institution path already gathered: the establishments attached to
     the accounts already open. Read through an aggregate, so a visitor sees how
     many workshops joined the path, never which ones. */
  const [count, setCount] = useState<Count | null>(null);

  useEffect(() => {
    let alive = true;
    const read = async () => {
      try {
        const { data, error } = await supabase
          .from(ETABS_VIEW)
          .select('structures, etablissements')
          .maybeSingle();
        if (error) throw error;
        if (!alive) return;
        setCount({
          structures: Number(data?.structures ?? 0),
          etablissements: Number(data?.etablissements ?? 0),
        });
      } catch {
        /* A missing counter never takes the band away: the path stands alone. */
        if (alive) setCount(null);
      }
    };
    void read();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <aside className={`of-insti-band${compact ? ' is-compact' : ''}`} aria-labelledby={titleId}>
      <div className="of-insti-band-head">
        <p className="stamp">{t('ofip.stamp')}</p>
        <h3 id={titleId} className="of-insti-band-title">{t('ofip.title')}</h3>
        {!compact && <p className="of-insti-band-sub">{t('ofip.sub')}</p>}
        {count && (
          <p className="of-insti-count" title={t('ofip.countTip')}>
            <i className="ri-building-4-line" aria-hidden="true"></i>
            {count.etablissements > 0 ? (
              <>
                <span className="of-insti-count-num">
                  <b>{count.etablissements}</b>{' '}
                  {count.etablissements > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}
                </span>
                <span className="of-insti-count-sep" aria-hidden="true">·</span>
                <span className="of-insti-count-num">
                  <b>{count.structures}</b>{' '}
                  {count.structures > 1 ? t('ofip.structuresMany') : t('ofip.structuresOne')}
                </span>
              </>
            ) : (
              <span className="of-insti-count-quiet">{t('ofip.countZero')}</span>
            )}
          </p>
        )}
      </div>

      <ol className="of-insti-steps">
        {steps.map((step) => (
          <li key={step.n} className="of-insti-step">
            <span className="of-insti-step-head">
              <span className="of-insti-step-num">{step.n}</span>
              <span className="of-insti-step-ico" aria-hidden="true">
                <i className={step.icon}></i>
              </span>
            </span>
            <b>{t(step.title)}</b>
            {!compact && <span>{t(step.text)}</span>}
          </li>
        ))}
      </ol>

      <div className="of-insti-band-foot">
        <div className="of-cta-actions">
          <Link to={plan?.to ?? '/compte/inscription?plan=institutions'} className="cta">
            <span className="whitespace-nowrap">{t('ofip.cta')}</span>
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
          {plan && !compact && (
            <Link to={planCardHref('institutions', pays)} className="ghost-btn">
              <i className="ri-government-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofip.card')}</span>
            </Link>
          )}
          {/* The quote is a door of the band itself: a structure that already
              knows how many sites it brings composes its amount here, without
              going through the card. */}
          <Link to="/offres/devis?formule=institutions" className="ghost-btn">
            <i className="ri-file-list-3-line" aria-hidden="true"></i>
            <span className="whitespace-nowrap">{t('dv.ctaCard')}</span>
          </Link>
          {/* The figure sits right by the card door: what the path already
              gathers is read before the plan itself is opened. */}
          {plan && !compact && count && count.etablissements > 0 && (
            <span className="of-insti-door-count" title={t('ofip.countTip')}>
              <i className="ri-building-4-line" aria-hidden="true"></i>
              <b>{count.etablissements}</b>
              <span>{count.etablissements > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}</span>
            </span>
          )}
        </div>
        <p className="of-insti-band-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>{t('ofip.note')}</span>
        </p>
      </div>
    </aside>
  );
}