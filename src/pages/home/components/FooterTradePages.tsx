import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays, paysArabes, type PaysCount } from '@/lib/pays';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { famillesAvecPays, famillesDuPays } from '@/lib/tradeCountries';

/** Le signe de chaque famille, le même que dans le pied de page et la barre. */
const ICONS: Record<string, string> = {
  impression: 'ri-printer-line',
  edition: 'ri-book-open-line',
  librairie: 'ri-book-2-line',
  faconnage: 'ri-scissors-cut-line',
  communication: 'ri-megaphone-line',
  fournisseurs: 'ri-store-2-line',
  bibliotheque: 'ri-book-read-line',
  ecrivain: 'ri-quill-pen-line',
};

/**
 * Combien de familles chaque pays tient, toutes familles confondues, lu une
 * fois sur tout le répertoire : le survol d'un pays du pied de page situe son
 * compte de métier contre l'activité réelle du pays, au lieu de le laisser
 * flotter seul.
 */
const FAMILLES_TENUES: Record<string, number> = paysArabes.reduce(
  (acc, pays) => ({ ...acc, [pays.code]: famillesDuPays(pays.code).length }),
  {} as Record<string, number>,
);

/**
 * Les pages par pays, posées en bas de chaque page du site. Chaque famille
 * ouvre sa ligne, suivie de ses pays : « Imprimeries · Algérie 14 · Tunisie 2 ».
 * Le maillage interne y gagne un chemin stable — un moteur de recherche comme
 * un lecteur peut atteindre /annuaire/imprimeries/algerie sans passer par la
 * barre de filtres ni par la carte.
 *
 * Le pays lu sur la carte suit jusqu'ici : quand la carte dit « Algérie », la
 * bande passe l'Algérie en tête de chaque famille et marque son compte comme
 * celui qu'on lit — le chiffre du pied de page se compare donc, famille par
 * famille, à celui de la carte du pays. Sans pays retenu, la bande garde son
 * ordre habituel.
 */
export default function FooterTradePages({ pays = '' }: { pays?: string }) {
  const { t, lang } = useLang();
  const familles = famillesAvecPays();
  if (familles.length === 0) return null;

  /* Le compte du métier dans le monde entier : chaque pays s'y rapporte, et
     le survol dit donc la part qu'il tient — « Algérie · 41 % des
     imprimeurs ». Le total se lit sur les pages de pays déjà comptées, il ne
     peut pas diverger du nombre affiché à côté du nom. */
  const totaux: Record<string, number> = {};
  familles.forEach(({ trade, pays: rows }) => {
    totaux[trade] = rows.reduce((sum, row) => sum + row.count, 0);
  });

  /* Le pays lu passe devant, sans déranger l'ordre des autres pays : le tri
     est stable, si bien qu'aucune famille ne se réordonne autrement. */
  const mener = (rows: PaysCount[]): PaysCount[] => (
    pays && rows.some((row) => row.code === pays)
      ? [...rows].sort((a, b) => (a.code === pays ? -1 : b.code === pays ? 1 : 0))
      : rows
  );

  return (
    <nav className="footer-trade-pages" aria-label={t('foot.tradePages')}>
      <div className="footer-tp-head">
        <p className="footer-tp-title">
          <i className="ri-links-line" aria-hidden="true"></i>
          {t('foot.tradePages')}
        </p>
        {/* Le pays lu, nommé une fois en tête : la bande dit sur quel pays
            ses comptes sont mis en avant. */}
        {pays && (
          <span className="footer-tp-read" title={t('foot.tradePagesReadHint')}>
            <i className="ri-map-pin-2-line" aria-hidden="true"></i>
            {t('foot.tradePagesRead').replace('{place}', nomPays(pays, lang))}
          </span>
        )}
        <p className="footer-tp-hint">{t('foot.tradePagesHint')}</p>
      </div>
      <ul className="footer-tp-list">
        {familles.map(({ trade, pays: paysRows }) => (
          <li key={trade} className="footer-tp-row">
            {/* Le nom de la famille porte son total mondial : le compte de
                chaque pays se lit alors contre lui, d'un seul regard, au lieu
                de flotter sans repère. */}
            <Link
              className="footer-tp-type"
              to={`/annuaire/${slugDeTrade(trade)}`}
              title={`${t(`tradePlural.${trade}`)} · ${totaux[trade] ?? 0} ${t('foot.tradePagesWorld')} — ${t('foot.tradePagesWorldHint')}`}
            >
              <i className={ICONS[trade] ?? 'ri-building-4-line'} aria-hidden="true"></i>
              {t(`tradePlural.${trade}`)}
              <em className="footer-tp-world">{totaux[trade] ?? 0}</em>
            </Link>
            <span className="footer-tp-countries">
              {mener(paysRows).map((row, i) => {
                const read = Boolean(pays) && row.code === pays;
                /* La part du métier que ce pays représente dans le monde,
                   arrondie au point : le chiffre se lit d'un coup d'œil. */
                const total = totaux[trade] ?? 0;
                const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
                const label = t(`tradePlural.${trade}`).toLocaleLowerCase(
                  lang === 'ar' ? 'ar' : lang === 'en' ? 'en' : 'fr',
                );
                const part = t('foot.tradePagesShare')
                  .replace('{pct}', String(pct))
                  .replace('{label}', label);
                /* Ce que le pays tient tout de même, toutes familles
                   confondues : le compte du métier se situe contre l'activité
                   réelle du pays, comme sur la page d'un pays. */
                const fams = t('foot.tradePagesFams')
                  .replace('{n}', String(FAMILLES_TENUES[row.code] ?? 0));
                return (
                  <Fragment key={row.code}>
                    {i > 0 && <span className="footer-tp-sep" aria-hidden="true">·</span>}
                    <Link
                      className={read ? 'is-on' : undefined}
                      aria-current={read ? 'true' : undefined}
                      to={`/annuaire/${slugDeTrade(trade)}/${slugPays(row.code)}`}
                      title={read
                        ? `${t(`tradePlural.${trade}`)} · ${nomPays(row.code, lang)} · ${row.count} — ${part} · ${fams} · ${t('foot.tradePagesReadHint')}`
                        : `${t(`tradePlural.${trade}`)} · ${nomPays(row.code, lang)} · ${row.count} — ${part} · ${fams}`}
                    >
                      {nomPays(row.code, lang)}
                      <span className="footer-tp-count">{row.count}</span>
                    </Link>
                  </Fragment>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}