import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import type { DepositStatus } from '@/pages/deposer/components/useDepositForm';

type Props = {
  status: DepositStatus;
  error: string;
  signedIn: boolean;
};

/**
 * Ce que le dépôt répond après l'envoi : la confirmation en relecture, le
 * motif de l'échec, et l'invitation à ouvrir un compte pour garder la main
 * sur un dépôt anonyme.
 */
export default function DepositFeedback({ status, error, signedIn }: Props) {
  const { t } = useLang();

  return (
    <>
      {status === 'ok' && (
        <div className="dep-done">
          <p className="form-msg ok">
            {signedIn ? t('dep.okAccount') : t('dep.ok')}
          </p>
          {signedIn && (
            <Link to="/compte" className="dep-done-link">
              {t('dep.manage')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          )}
        </div>
      )}
      {status === 'err' && <p className="form-msg err">{error}</p>}

      {!signedIn && (
        <p className="ct-signup dep-signup">
          <i className="ri-user-add-line" aria-hidden="true"></i>
          <span>{t('dep.loginHint')}</span>
          <Link to="/compte/inscription" className="ct-signup-link">
            {t('ct.signupCta')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
          <small className="ct-signup-hint">{t('ct.signupHint')}</small>
        </p>
      )}
    </>
  );
}