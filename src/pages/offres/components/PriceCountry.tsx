import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { nomDevise, paysArabes, paysTrouve } from '@/lib/pays';
import { coefficientDeclare, coefficientDePays, coefHorsFourchette, COEF_MAX, COEF_MIN } from '@/lib/tarif';
import { usePrixPays } from '@/hooks/usePrixPays';
import MarchesChips from '@/components/feature/MarchesChips';
import SharePriceLink from './SharePriceLink';

/**
 * The country the prices are read in. It opens on the country a shared link
 * names, or the one the visitor's browser points at, and a reader who wants
 * another money picks it here — every price on the page follows at once, the
 * choice is kept for the next visit, and the address carries it so the link in
 * the message opens on the very same market.
 */
export default function PriceCountry() {
  const { t, lang } = useLang();
  const { pays, choisir } = usePrixPays();
  const found = paysTrouve(pays);
  const coef = coefficientDePays(pays);
  /* The corridor is a safeguard, not a promise: a market whose written
     coefficient leaves 35 % – 100 % is charged the nearest bound, and the page
     says it plainly instead of letting the figure pass for a deliberate one. */
  const declare = coefficientDeclare(pays);
  const hors = coefHorsFourchette(pays);

  return (
    <div className="of-price-pays">
      <div className="of-price-pays-row">
        <label className="of-price-pays-label" htmlFor="of-price-pays">
          <i className="ri-money-dollar-circle-line" aria-hidden="true"></i>
          <span>{t('ofp.paysLabel')}</span>
        </label>
        <select
          id="of-price-pays"
          className="of-price-pays-select"
          value={pays}
          onChange={(event) => choisir(event.target.value)}
        >
          {paysArabes.map((paysItem) => (
            <option key={paysItem.code} value={paysItem.code}>
              {localize(paysItem.nom, lang)}
            </option>
          ))}
        </select>
        {found && <span className="of-price-pays-money">{nomDevise(pays, lang)}</span>}
        <SharePriceLink />
      </div>
      {/* The four open markets, right beside the selector: the same row as the
          home page, here changing the money every formula is read in. */}
      <div className="of-price-pays-markets">
        <MarchesChips variant="prix" className="is-head" />
      </div>
      {hors && (
        <p className="of-price-pays-warn" role="status">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          <span>
            {t('ofp.coefWarn')} <strong>{Math.round(declare * 100)} %</strong>{' '}
            {t('ofp.coefWarnMid')}{' '}
            <strong>
              {Math.round(COEF_MIN * 100)} % – {Math.round(COEF_MAX * 100)} %
            </strong>
            {t('ofp.coefWarnEnd')}
          </span>
        </p>
      )}
      {coef < 1 && (
        <p className="of-price-pays-coef">
          <i className="ri-scales-3-line" aria-hidden="true"></i>
          <span>
            {t('ofp.coefLine')} <strong>{Math.round(coef * 100)} %</strong> {t('ofp.coefBase')}
          </span>
        </p>
      )}
      <p className="of-price-pays-share">
        <i className="ri-send-plane-line" aria-hidden="true"></i>
        <span>{t('ofp.shareHint')}</span>
      </p>
      <p className="of-price-pays-note">
        <i className="ri-information-line" aria-hidden="true"></i>
        <span>{t('ofp.paysNote')}</span>
      </p>
    </div>
  );
}