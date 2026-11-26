import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';

export type Consentement = { cgv: boolean; rgpd: boolean };

/** Lit les deux cases du formulaire. Les envoyer telles quelles : le serveur refuse tant qu'elles ne sont pas vraies. */
export function consentementDepuis(data: FormData): Consentement {
  return { cgv: data.get('cgv') !== null, rgpd: data.get('rgpd') !== null };
}

export function consentementComplet(consentement: Consentement): boolean {
  return consentement.cgv && consentement.rgpd;
}

/** Deux cases obligatoires : conditions générales de vente et politique de confidentialité (RGPD). */
export default function ConsentLegal({ idPrefix }: { idPrefix: string }) {
  const { t } = useLang();
  return (
    <div className="consent-legal">
      <label className="auth-check" htmlFor={`${idPrefix}-cgv`}>
        <input id={`${idPrefix}-cgv`} type="checkbox" name="cgv" required />
        <span>
          {t('consent.cgv')} <Link to="/cgv" target="_blank" rel="noreferrer">{t('consent.read')}</Link>
        </span>
      </label>
      <label className="auth-check" htmlFor={`${idPrefix}-rgpd`}>
        <input id={`${idPrefix}-rgpd`} type="checkbox" name="rgpd" required />
        <span>
          {t('consent.rgpd')} <Link to="/confidentialite" target="_blank" rel="noreferrer">{t('consent.read')}</Link>
        </span>
      </label>
    </div>
  );
}
