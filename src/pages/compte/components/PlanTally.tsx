import { useCallback, useEffect, useState } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import { plans, type PlanId } from '@/pages/offres/components/plans';

type Tally = Partial<Record<PlanId, number>>;

type Props = {
  /** The formula the signed-in member holds, ringed in the tally. */
  mine: PlanId | null;
};

/**
 * A short recap of how the accounts are spread over the three formulas. The
 * totals come from an aggregate view, never from the accounts themselves, so
 * no member can read another member's row. Refreshed each time the box mounts.
 */
export default function PlanTally({ mine }: Props) {
  const { t } = useLang();
  const [tally, setTally] = useState<Tally>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [nonce, setNonce] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const { data, error } = await supabase
        .from('paperatlas_formules_tally')
        .select('formule, total');
      if (error) throw error;
      const next: Tally = {};
      (data ?? []).forEach((row) => {
        const key = (row as { formule: string }).formule as PlanId;
        const total = Number((row as { total: number }).total ?? 0);
        if (plans.some((plan) => plan.id === key)) next[key] = Number.isFinite(total) ? total : 0;
      });
      setTally(next);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    /* The member's own formula is a dependency: moving to another plan moves
       one account from a column to the next, so the counts are read again. */
  }, [load, nonce, mine]);

  const total = plans.reduce((sum, plan) => sum + (tally[plan.id] ?? 0), 0);

  return (
    <section className="pro-card of-tally">
      <h2 className="pro-h">{t('ofp.tallyTitle')}</h2>
      <p className="auth-note">{t('ofp.tallySub')}</p>

      {loading && (
        <p className="acct-loading">
          <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
          {t('ofp.tallyLoading')}
        </p>
      )}

      {!loading && failed && (
        <>
          <p className="form-msg err">{t('ofp.tallyError')}</p>
          <button type="button" className="ghost-btn" onClick={() => setNonce((n) => n + 1)}>
            <i className="ri-refresh-line" aria-hidden="true"></i>
            {t('ofp.tallyRetry')}
          </button>
        </>
      )}

      {!loading && !failed && (
        <>
          <ul className="of-tally-list">
            {plans.map((plan) => (
              <li key={plan.id} className={`of-tally-row${plan.id === mine ? ' is-mine' : ''}`}>
                <span className="of-tally-icon" aria-hidden="true">
                  <i className={plan.icon}></i>
                </span>
                <span className="of-tally-name">
                  {t(plan.name)}
                  {plan.id === mine && <em>{t('ofp.tallyYou')}</em>}
                </span>
                <span className="of-tally-num">
                  {tally[plan.id] ?? 0}
                  {total > 0 && (
                    <span className="of-tally-bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(((tally[plan.id] ?? 0) / total) * 100)}%` }}></span>
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}