import { useLang } from '@/i18n/LangProvider';
import { usePrixPays } from '@/hooks/usePrixPays';
import { plans, prixPlan, type PlanId } from './plans';
import '@/styles/offres-durees.css';

type Props = {
  /** The length currently held, or null when nothing has been chosen yet. */
  value: PlanId | null;
  onChange: (id: PlanId) => void;
  /** Shared by the four radio inputs, so the group reads as one choice. */
  name: string;
  /** The short group heading, already translated by the caller. */
  label: string;
  /** One quiet line under the pills, explaining what happens without a choice. */
  hint?: string;
  disabled?: boolean;
  /** The country already chosen in the form around, so the two never disagree. */
  pays?: string | null;
};

/**
 * The four lengths as a single choice, four pills wide: the sign-up form offers
 * them to visitors who arrive without a card, and « Mon compte » uses the same
 * row to change the length later. One design, two doors.
 */
export default function PlanPills({ value, onChange, name, label, hint, disabled = false, pays }: Props) {
  const { t } = useLang();
  const { pays: paysLu } = usePrixPays();
  const paysDuPrix = pays || paysLu;

  return (
    <div className="of-pills-block">
      <fieldset className="of-pills-set">
        <legend className="of-pills-legend">{label}</legend>
        <div className="of-pills is-quatre" role="radiogroup" aria-label={label}>
          {plans.map((plan) => {
            const on = plan.id === value;
            return (
              <label
                key={plan.id}
                className={`of-pill${on ? ' is-on' : ''}${plan.featured ? ' is-featured' : ''}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={plan.id}
                  checked={on}
                  disabled={disabled}
                  onChange={() => onChange(plan.id)}
                />
                <span className="of-pill-icon" aria-hidden="true">
                  <i className={plan.icon}></i>
                </span>
                <span className="of-pill-txt">
                  <b>{t(plan.name)}</b>
                  <em>
                    {prixPlan(plan, paysDuPrix)} {t(plan.per)}
                  </em>
                </span>
                <span className="of-pill-check" aria-hidden="true">
                  <i className={on ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}></i>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {hint && (
        <p className="of-pills-hint">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
}