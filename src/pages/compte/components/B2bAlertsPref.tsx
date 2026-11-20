import { useLang } from '@/i18n/LangProvider';

type Props = {
  enabled: boolean;
  /** No linked card means no request can reach the account yet. */
  hasCard: boolean;
  saving: boolean;
  onChange: (next: boolean) => void;
};

/**
 * Per-account switch for the B2B e-mail alert. Turning it off never hides a
 * request: it only stops the e-mail, the inbox keeps working.
 */
export default function B2bAlertsPref({ enabled, hasCard, saving, onChange }: Props) {
  const { t } = useLang();
  const on = enabled && hasCard;

  return (
    <div className="b2b-pref" data-on={on ? 'yes' : 'no'}>
      <span className="b2b-pref-ico" aria-hidden="true">
        <i className={on ? 'ri-notification-3-line' : 'ri-notification-off-line'}></i>
      </span>
      <div className="b2b-pref-txt">
        <strong>{t('acct.b2b.alertsTitle')}</strong>
        <p>{hasCard ? t('acct.b2b.alertsText') : t('acct.b2b.alertsNoCard')}</p>
      </div>
      <button
        type="button"
        className="b2b-switch"
        role="switch"
        aria-checked={on}
        aria-label={t('acct.b2b.alertsTitle')}
        aria-disabled={!hasCard || saving}
        disabled={!hasCard || saving}
        onClick={() => onChange(!enabled)}
      >
        <span className="b2b-switch-track" aria-hidden="true">
          <span className="b2b-switch-knob" />
        </span>
        <span className="b2b-switch-txt">
          {saving ? t('acct.b2b.cardSaving') : on ? t('acct.b2b.alertsOn') : t('acct.b2b.alertsOff')}
        </span>
      </button>
    </div>
  );
}