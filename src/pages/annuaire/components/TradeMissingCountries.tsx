import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays, paysArabes } from '@/lib/pays';
import { paysSansTrade } from '@/lib/tradeCountries';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import CopyTextButton from '@/components/feature/CopyTextButton';
import './trade-missing.css';

type Props = {
  /** Le type lu sur la page, "" quand aucun type n'est choisi. */
  trade: string;
};

/**
 * Sous le titre d'une page de type, les pays où le métier manque.
 *
 * La page dit ce que le métier tient ; cette ligne dit ce qu'il ne tient pas,
 * pays par pays, et chacun ouvre sa page de pays — le type y est déjà lu, la
 * fiche du pays s'ouvre sans repasser par les filtres. Le compte se prend sur
 * le monde arabe entier, jamais sur la sélection en cours : c'est le manque du
 * métier qui se nomme, non celui d'une vue filtrée.
 *
 * La liste se copie en texte, un pays par ligne, pour être envoyée telle
 * quelle à un collègue — la carte du monde la compte, la page la nomme, et le
 * message l'emporte.
 */
export default function TradeMissingCountries({ trade }: Props) {
  const { t, lang } = useLang();
  if (!trade) return null;
  const label = t(`tradePlural.${trade}`);
  const codes = paysSansTrade(trade);

  return (
    <section className="trade-missing" aria-labelledby="trade-missing-title">
      <div className="trade-missing-head">
        <h2 className="trade-missing-title" id="trade-missing-title">
          <i
            className={codes.length === 0 ? 'ri-checkbox-circle-line' : 'ri-door-lock-line'}
            aria-hidden="true"
          ></i>
          <span className="trade-missing-label">
            {codes.length === 0
              ? t('tradePage.missingNone')
              : t('tradePage.missing').replace('{label}', label)}
          </span>
          {codes.length > 0 && (
            <>
              <b>{codes.length}</b>
              <em>/ {paysArabes.length}</em>
            </>
          )}
        </h2>
        {codes.length > 0 && (
          <div className="trade-missing-copies">
            {/* La liste elle-même : un pays par ligne, en texte. */}
            <CopyTextButton
              className="trade-missing-copy"
              label={t('tradePage.missingCopy')}
              hint={t('tradePage.missingCopyHint').replace('{label}', label)}
              build={() => [
                t('tradePage.missingCopyLine')
                  .replace('{label}', label)
                  .replace('{n}', String(codes.length)),
                ...codes.map((code) => `- ${nomPays(code, lang)}`),
              ].join('\n')}
            />
            {/* Sous la liste, ses adresses : le collègue colle des liens
                entiers dans un document, sans avoir à les reconstruire. */}
            <CopyTextButton
              className="trade-missing-copy trade-missing-copy--links"
              label={t('tradePage.missingCopyLinks')}
              hint={t('tradePage.missingCopyLinksHint').replace('{label}', label)}
              build={() => {
                const base = typeof window === 'undefined'
                  ? ''
                  : `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
                return [
                  t('tradePage.missingCopyLinksLine')
                    .replace('{label}', label)
                    .replace('{n}', String(codes.length)),
                  ...codes
                    .filter((code) => slugPays(code))
                    .map((code) => `${base}/annuaire/${slugDeTrade(trade)}/${slugPays(code)}`),
                ].join('\n');
              }}
            />
          </div>
        )}
      </div>

      {codes.length === 0 ? (
        <p className="trade-missing-none">
          <i className="ri-shield-check-line" aria-hidden="true"></i>
          <span>{t('tradePage.missingNoneHint').replace('{label}', label)}</span>
        </p>
      ) : (
        <ul className="trade-missing-list" title={t('tradePage.missingHint').replace('{label}', label)}>
          {codes.map((code) => (
            <li key={code} className="trade-missing-item">
              <Link
                className="trade-missing-door"
                to={`/annuaire/${slugDeTrade(trade)}/${slugPays(code)}`}
                title={`${nomPays(code, lang)} — ${t('tradePage.missingOpen')}`}
              >
                <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                <span className="trade-missing-name">{nomPays(code, lang)}</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}