import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { nomPays } from '@/lib/pays';
import { famillesDuPays } from '@/lib/tradeCountries';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import CopyTextButton from '@/components/feature/CopyTextButton';
import {
  AIRE_CARTE_PARAM,
  AIRES_MONDE_PARAM,
  REGIONS_MONDE,
  fichesDesPays,
  regionMondeLabelKey,
  regionMondeDe,
  regionsSansTrade,
  voisinsDeRegion,
  voisinsSansTrade,
} from '@/lib/worldRegions';
import './trade-missing.css';

type Props = {
  /** Le métier lu sur la page, "" quand aucun métier n'est choisi. */
  trade: string;
  /** Le pays dont la page est ouverte, "" hors d'une page de pays. */
  pays: string;
};

/**
 * Sur la page d'un pays, le rappel des voisins qui manquent du même métier.
 *
 * La page dit ce que le métier tient dans ce pays ; cette ligne dit ce qu'il
 * ne tient pas chez les voisins de la même région du monde. Le manque cesse
 * ainsi d'être une affaire nationale : on lit d'un coup d'œil si le métier est
 * tenu autour, ou s'il manque à toute l'aire. Chaque nom ouvre sa page de
 * pays, le métier déjà lu, sans repasser par les filtres — et son survol dit
 * combien de familles ce pays tient tout de même, pour situer le manque avant
 * d'ouvrir la page.
 *
 * Sous la ligne, un compteur dit combien d'aires du monde manquent du métier :
 * l'absence se mesure alors à l'échelle du monde arabe entier, et non plus
 * seulement du voisinage. Ce compteur se presse : la carte du monde s'ouvre
 * resserrée sur les pays de ces aires, pour lire le manque sur le terrain. Il
 * se copie aussi, avec ses pays, pour en faire un point d'étape.
 *
 * Rien ne s'écrit hors d'une page de pays : ailleurs, la question ne se pose
 * pas, et la ligne se tait plutôt que de nommer une aire sans pays lu.
 */
export default function TradeNeighbourMissing({ trade, pays }: Props) {
  const { t, lang } = useLang();
  const location = useLocation();
  if (!trade || !pays) return null;
  const region = regionMondeDe(pays);
  if (!region) return null;
  const voisins = voisinsDeRegion(pays);
  if (voisins.length === 0) return null;

  const codes = voisinsSansTrade(trade, pays);
  const label = t(`tradePlural.${trade}`);
  const regionLabel = t(regionMondeLabelKey(region));
  /* Combien de familles chaque voisin tient, toutes familles confondues : le
     manque du métier se situe contre l'activité réelle du pays, au lieu de
     rester un zéro sans échelle. */
  const familles = new Map(voisins.map((code) => [code, famillesDuPays(code).length]));
  /* Les aires du monde où le métier manque, et le nombre de pays concernés
     dans chacune : l'absence se lit à l'échelle du monde arabe, pas seulement
     du voisinage immédiat. */
  const airesManquantes = regionsSansTrade(trade);

  /* L'adresse de la carte du monde resserrée sur ces aires : le compteur n'est
     pas qu'un chiffre, il ouvre le terrain où le manque se lit. Le chemin est
     celui de la page en cours, si bien que le pays lu reste celui qu'on
     traversait. */
  const carteAires = airesManquantes.length === 0
    ? ''
    : (() => {
      const next = new URLSearchParams(location.search);
      next.set('view', 'map');
      next.set(AIRES_MONDE_PARAM, airesManquantes.map((row) => row.key).join(','));
      return `${location.pathname}?${next.toString()}`;
    })();

  /* La porte d'une seule aire : la vue Carte s'ouvre déjà cadrée sur elle,
     du même geste que la note des aires de la carte du monde — le geste se
     lit au même endroit des deux côtés. */
  const carteDeAire = (key: string): string => {
    const next = new URLSearchParams(location.search);
    next.set('view', 'map');
    next.set(AIRE_CARTE_PARAM, key);
    return `${location.pathname}?${next.toString()}#board-results`;
  };

  return (
    <section className="trade-missing trade-missing--neigh" aria-labelledby="trade-neigh-title">
      <div className="trade-missing-head">
        <h2 className="trade-missing-title trade-neigh-title" id="trade-neigh-title">
          <i
            className={codes.length === 0 ? 'ri-checkbox-circle-line' : 'ri-earth-line'}
            aria-hidden="true"
          ></i>
          <span className="trade-missing-label">{t('tradePage.neighboursLabel')}</span>
          <em className="trade-neigh-region">{regionLabel}</em>
          {codes.length > 0 && (
            <>
              <b>{codes.length}</b>
              <em>/ {voisins.length}</em>
            </>
          )}
        </h2>
      </div>

      {codes.length === 0 ? (
        <p className="trade-missing-none">
          <i className="ri-shield-check-line" aria-hidden="true"></i>
          <span>
            {t('tradePage.neighboursNone')
              .replace('{region}', regionLabel)
              .replace('{label}', label)}
          </span>
        </p>
      ) : (
        <>
          <p className="trade-neigh-lead">
            <i className="ri-route-line" aria-hidden="true"></i>
            <span>
              {t('tradePage.neighbours')
                .replace('{region}', regionLabel)
                .replace('{n}', String(codes.length))
                .replace('{label}', label)}
            </span>
          </p>
          <ul
            className="trade-missing-list"
            title={t('tradePage.neighboursHint').replace('{label}', label)}
          >
            {codes.map((code) => (
              <li key={code} className="trade-missing-item">
                <Link
                  className="trade-missing-door"
                  to={`/annuaire/${slugDeTrade(trade)}/${slugPays(code)}`}
                  title={`${nomPays(code, lang)} · ${t('tradePage.neighbourFams').replace('{n}', String(familles.get(code) ?? 0))} — ${t('tradePage.missingOpen')}`}
                >
                  <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                  <span className="trade-missing-name">{nomPays(code, lang)}</span>
                  {/* Ce que ce pays tient tout de même, toutes familles
                      confondues : le manque du métier se situe avant qu'on
                      n'ouvre sa page. */}
                  <span
                    className="trade-missing-fams"
                    title={t('tradePage.neighbourFams').replace('{n}', String(familles.get(code) ?? 0))}
                  >
                    <i className="ri-apps-2-line" aria-hidden="true"></i>
                    {familles.get(code) ?? 0}
                  </span>
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Le manque à l'échelle des aires du monde : combien de régions du
          monde arabe n'ont aucun atelier du métier chez au moins un de leurs
          pays — et lesquelles. La mesure se lit sur tout le répertoire, et le
          compteur s'appuie : la carte du monde s'ouvre resserrée sur ces aires
          et leurs pays. */}
      <div
        className={`trade-missing-regions${airesManquantes.length === 0 ? ' is-done' : ''}`}
        title={airesManquantes.length === 0
          ? t('tradePage.regionsNoneHint').replace('{label}', label)
          : `${t('tradePage.regionsHint').replace('{label}', label)} ${airesManquantes
            .map((row) => `${t(regionMondeLabelKey(row.region))} (${row.pays.length})`)
            .join(' · ')}`}
      >
        {carteAires ? (
          <div className="trade-missing-regions-go">
            {/* Le compteur entier reste une porte : toutes les aires d'un seul
                geste, comme avant. */}
            <Link
              className="trade-missing-regions-head"
              to={carteAires}
              title={`${t('tradePage.regionsMapHint')
                .replace('{n}', String(airesManquantes.length))
                .replace('{label}', label)}`}
            >
              <i className="ri-global-line" aria-hidden="true"></i>
              <span className="trade-missing-regions-label">{t('tradePage.regionsLabel')}</span>
              <b>{airesManquantes.length}</b>
              <em className="trade-missing-regions-total">/ {REGIONS_MONDE.length}</em>
              <i className="ri-arrow-right-line trade-missing-regions-arrow" aria-hidden="true"></i>
            </Link>
            {/* Chaque aire est une porte à elle seule : la vue Carte s'ouvre
                cadrée sur elle, comme la pastille de la note des aires. */}
            <span className="trade-missing-regions-list">
              {airesManquantes.map((row) => {
                /* Ce que cette aire tient tout de même, toutes familles
                   confondues : le compte se lit à côté du nom, pour comparer le
                   Maghreb au golfe avant d'ouvrir la carte. */
                const files = fichesDesPays(row.region.pays);
                const regionLabel = t(regionMondeLabelKey(row.region));
                return (
                  <Link
                    key={row.key}
                    className="trade-missing-region"
                    to={carteDeAire(row.key)}
                    title={`${regionLabel} · ${files} ${t('tradePage.regionsFiles')} · ${t('tradePage.regionsMissingCount').replace('{n}', String(row.pays.length))} — ${t('tradePage.regionsMapChipHint').replace('{region}', regionLabel)}`}
                  >
                    <i className="ri-map-2-line" aria-hidden="true"></i>
                    <span className="trade-missing-region-name">{regionLabel}</span>
                    <b>{files}</b>
                    <span className="trade-missing-region-unit">{t('tradePage.regionsFiles')}</span>
                    <em>{row.pays.length}</em>
                    <i
                      className="ri-road-map-line trade-missing-region-map"
                      aria-hidden="true"
                    ></i>
                  </Link>
                );
              })}
            </span>
          </div>
        ) : (
          <span className="trade-missing-regions-go is-done">
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            <span className="trade-missing-regions-label">
              {t('tradePage.regionsNone').replace('{label}', label)}
            </span>
          </span>
        )}
        {/* La liste des aires et de leurs pays, prête pour un point d'étape :
            elle part en texte, une aire par ligne, ses pays nommés dessous. */}
        {airesManquantes.length > 0 && (
          <CopyTextButton
            label={t('tradePage.regionsCopy')}
            hint={t('tradePage.regionsCopyHint').replace('{label}', label)}
            className="trade-missing-copy trade-missing-regions-copy"
            build={() => [
              t('tradePage.regionsCopyLine')
                .replace('{label}', label)
                .replace('{n}', String(airesManquantes.length))
                .replace('{total}', String(REGIONS_MONDE.length)),
              ...airesManquantes.map((row) => `${t(regionMondeLabelKey(row.region))} (${row.pays.length}) : ${row.pays.map((code) => nomPays(code, lang)).join(', ')}`),
            ].join('\n')}
          />
        )}
      </div>
    </section>
  );
}