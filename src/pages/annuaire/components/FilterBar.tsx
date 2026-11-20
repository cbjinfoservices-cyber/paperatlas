import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { paysArabes } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { trades } from '@/mocks/entreprises';
import { specialitesParTrade } from '@/lib/specialites';
import RegionSelect from '@/components/feature/RegionSelect';
import StickyStack from '@/components/feature/StickyStack';
import { genres } from '@/mocks/auteurs';
import type { GeoStatus } from '@/hooks/useGeo';
import DecadeMenu, { type DecadeOption } from './DecadeMenu';

type Props = {
  mode: 'entreprises' | 'auteurs';
  q: string;
  onQ: (v: string) => void;
  /** ISO country code, "" for every country. */
  pays: string;
  onPays: (v: string) => void;
  wilaya: string;
  /** The region and the country it belongs to, handed together. */
  onRegion: (region: string, code: string) => void;
  trade: string;
  onTrade: (v: string) => void;
  /** La précision retenue à l'intérieur du type, « impression.offset », "" pour
      lire le type entier. */
  spec: string;
  /** Combien d'ateliers chaque spécialité tient dans le pays et la région déjà
      retenus : le second niveau du menu s'ouvre sur un chiffre réel. */
  specCounts: Record<string, number>;
  /** Le type et sa précision, choisis d'un seul geste dans le même menu. */
  onType: (trade: string, spec: string) => void;
  genre: string;
  onGenre: (v: string) => void;
  /** How many finishing workshops the country and the region already chosen
      hold: the figure the chip shows is the one the reader will really see. */
  facCount: number;
  /** How many workshops of the trade picked in the select answer in that same
      country and region: zero means the row has to say it before the blank
      page does. Negative when no trade is picked. */
  tradeCount: number;
  /** Combien d'ateliers chaque métier tient dans le pays et la région déjà
      retenus : la liste les annonce à côté de leur nom, pour que le choix se
      fasse sur un chiffre réel et non sur un total national. */
  tradeCounts: Record<string, number>;
  /** Le total du périmètre lu, écrit à côté de « Tous les métiers ». */
  tradeTotal: number;
  /** The decades narrowing the list, written as first years: « 1990 » or « 1990,2000 ». */
  open: string;
  onOpen: (v: string) => void;
  /** The decades the current selection holds, each with its number of sheets. */
  decades: DecadeOption[];
  fresh: boolean;
  freshCount: number;
  onFresh: (v: boolean) => void;
  /** Structures sitting on the Institutions plan — the pill keeps only those. */
  insti: boolean;
  instiCount: number;
  onInsti: (v: boolean) => void;
  /** Widens one step only: the region steps aside, the country and the trade stay. */
  onClearRegion: () => void;
  /** The list is read by the size of the establishment park (the `etabs` order). */
  etabsSort: boolean;
  /** How many listed structures declare a park of at least one site. */
  etabsSortCount: number;
  onEtabsSort: (v: boolean) => void;
  /** The seven-day window lives on the results line, but the reset button has to
      know about it to stay usable. */
  weekActive?: boolean;
  month?: string;
  onReset: () => void;
  /** Rend les seuls filtres rangés derrière la porte, sans toucher au type lu. */
  onClearFolded?: () => void;
  /** « Autour de moi » : la position, sa demande, son état. */
  geoStatus: GeoStatus;
  distanceReady: boolean;
  onNear: () => void;
  /** Ce que la liste tient : le chiffre se lit dans la rangée, porte fermée. */
  count: number;
  /** Le mot qui suit le chiffre, accordé à la rubrique lue. */
  countWord: string;
  /** Les bascules de rubrique, tenues dans la même pile que la barre. */
  lead?: ReactNode;
  /** Ce que le dépliant ouvre en plus des champs : recherche de fiche,
      compteurs, tri. Rien n'est retiré de la page, tout se range ici. */
  panel?: ReactNode;
};

/**
 * La barre haute de l'annuaire, ramenée à l'essentiel.
 *
 * Une page qui arrivait sur neuf bandes — filtres, pastilles, dépliant des
 * types, rappel de type, compteurs, seconde recherche, tri, périmètre — n'en
 * montre plus qu'une : le type d'établissement, « Autour de moi », et une porte
 * qui ouvre tout le reste. Les champs n'ont pas bougé, ils se sont rangés :
 * la recherche, le pays, la région, l'ouverture, les pastilles, la recherche
 * par nom, les compteurs et le tri vivent dans le même dépliant.
 *
 * Le dépliant s'ouvre de lui-même quand un filtre est déjà posé — une adresse
 * partagée, une recherche reprise — pour que rien ne filtre en silence. Un clic
 * sur la porte le referme ensuite quand on veut : le choix de la personne
 * l'emporte toujours sur celui de la page.
 */
export default function FilterBar({
  mode, q, onQ, pays, onPays, wilaya, onRegion, trade, onTrade, spec, specCounts, onType, genre, onGenre,
  facCount, tradeCount, tradeCounts, tradeTotal,
  open, onOpen, decades, fresh, freshCount, onFresh, insti, instiCount, onInsti,
  etabsSort, etabsSortCount, onEtabsSort,
  weekActive = false, month = '', onReset, onClearFolded, onClearRegion,
  geoStatus, distanceReady, onNear,
  count, countWord,
  lead, panel,
}: Props) {
  const { t, lang } = useLang();
  const active = mode === 'auteurs'
    ? Boolean(q || pays || wilaya || genre || open)
    : Boolean(q || pays || wilaya || trade || open || fresh || insti || etabsSort || weekActive || month);

  /* Ce qui est rangé derrière la porte : les champs et les pastilles, jamais le
     type — lui, reste sous les yeux. Le chiffre de la porte dit combien de
     choix sont posés là-dedans, pour qu'aucun filtre ne travaille en cachette. */
  const folded = [
    Boolean(q),
    Boolean(pays),
    Boolean(wilaya),
    Boolean(open),
    Boolean(fresh),
    Boolean(insti),
    Boolean(etabsSort),
    Boolean(weekActive),
    Boolean(month),
  ].filter(Boolean).length;

  const [more, setMore] = useState(false);
  /* Une fois la porte touchée, la page ne la rouvre plus d'elle-même : c'est
     la personne qui décide. */
  const chosen = useRef(false);
  useEffect(() => {
    if (chosen.current) return;
    if (folded === 0) return;
    setMore(true);
  }, [folded]);

  const toggleMore = () => {
    chosen.current = true;
    setMore((prev) => !prev);
  };

  const asking = geoStatus === 'asking';
  const nearOn = distanceReady;
  const geoMessage = geoStatus === 'denied'
    ? t('near.denied')
    : geoStatus === 'error'
      ? t('near.error')
      : geoStatus === 'unsupported'
        ? t('near.unsupported')
        : '';

  /* The region field follows the chosen country and names the division the way
     that country does: wilayas in Algiers, governorates in Cairo or Baghdad,
     emirates in Abu Dhabi, municipalities in Doha, regions in Riyadh and Rabat.
     With no country chosen it keeps the Algerian word, the board's home. */
  const regionLabel = motDivision(pays, lang);
  const allRegionsLabel = motDivision(pays, lang, 'tous');
  /* The generation field names what a decade means on this side of the board:
     the opening year of a workshop, the first publication of a pen. */
  const genLabel = t(mode === 'auteurs' ? 'gen.pubLabel' : 'dir.openLabel');
  /* The word follows the figure: a scope holding a single workshop reads
     « Façonnier », never « Façonniers 1 ». */
  const facLabel = t(facCount === 1 ? 'foot.faconnier' : 'foot.faconniers');
  /* Un métier choisi dans la liste qui ne répond nulle part dans le
     périmètre : la rangée le dit avant que la page ne se vide, dans le même
     encadré que les puces. Le façonnage garde le sien, sous sa propre puce,
     pour ne pas dire deux fois la même chose. */
  const tradeNowhere = Boolean(trade) && trade !== 'faconnage' && tradeCount === 0;
  const tradeWord = trade ? t(`trade.${trade}`) : '';
  /* Les métiers les plus représentés d'abord : la liste s'ouvre sur ce que le
     périmètre lu contient vraiment, les ateliers vides fermant la marche. */
  const sortedTrades = [...trades].sort(
    (a, b) => (tradeCounts[b] ?? 0) - (tradeCounts[a] ?? 0)
      || t(`tradePlural.${a}`).localeCompare(t(`tradePlural.${b}`), 'fr'),
  );
  /* Le menu tient les deux niveaux : chaque famille ouvre son groupe, et les
     spécialités suivent dessous, comptées sur le même périmètre. */
  const typeValue = spec ? `s:${spec}` : trade ? `t:${trade}` : '';
  const pickTypeValue = (value: string) => {
    if (!value) {
      onType('', '');
      return;
    }
    if (value.startsWith('s:')) {
      const key = value.slice(2);
      onType(key.split('.')[0], key);
      return;
    }
    onType(value.slice(2), '');
  };

  return (
    <StickyStack className={more ? 'is-panel-open' : ''}>
      {lead}

      <div className={`filters is-slim${more ? ' is-open' : ''}`}>
        {/* Le métier ouvre la barre : c'est le premier choix que fait un
            visiteur qui cherche un type d'établissement précis. Côté auteurs, le
            genre tient la même place, pour que la rangée se lise pareil. */}
        {mode === 'auteurs' ? (
          <div className="fld filters-kind">
            <label htmlFor="dir-genre">{t('dir.genre')}</label>
            <select id="dir-genre" value={genre} onChange={(e) => onGenre(e.target.value)}>
              <option value="">{t('dir.allG')}</option>
              {genres.map((g) => <option key={g} value={g}>{t(`genre.${g}`)}</option>)}
            </select>
          </div>
        ) : (
          <div className="fld filters-kind">
            <label htmlFor="dir-trade">{t('dir.typeLab')}</label>
            <select
              id="dir-trade"
              value={typeValue}
              onChange={(e) => pickTypeValue(e.target.value)}
            >
              <option value="">{t('dir.allTypes')} · {tradeTotal}</option>
              {sortedTrades.map((tr) => (
                <optgroup key={tr} label={`${t(`tradePlural.${tr}`)} · ${tradeCounts[tr] ?? 0}`}>
                  <option value={`t:${tr}`}>
                    {t(`tradePlural.${tr}`)} · {tradeCounts[tr] ?? 0}
                  </option>
                  {specialitesParTrade(tr).map((sp) => {
                    const n = specCounts[sp] ?? 0;
                    return (
                      <option key={sp} value={`s:${sp}`} disabled={n === 0 && spec !== sp}>
                        {'— '}{t(`spec.${sp}`)} · {n}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* Le chiffre des résultats reste dans la rangée : il se lit sans
            ouvrir la porte, et mène d'un clic à la première fiche. Aucune
            liste ne commence par un silence sur ce qu'elle tient. */}
        <button
          type="button"
          className="filters-count"
          title={t('dir.countHint')}
          aria-label={`${count} ${countWord} — ${t('dir.countHint')}`}
          onClick={() => document.getElementById('board-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <i className="ri-list-check-2" aria-hidden="true"></i>
          <strong>{count}</strong>
          <span className="filters-count-word">{countWord}</span>
        </button>

        {/* La position reste dehors, à côté du type : c'est le second geste
            qu'on fait sur ce tableau, et il n'a pas à se cacher. */}
        {mode === 'entreprises' && (
          <button
            type="button"
            className={`near-btn filters-near${nearOn ? ' is-on' : ''}`}
            onClick={onNear}
            aria-pressed={nearOn}
            title={geoMessage || t('near.label')}
            disabled={asking || geoStatus === 'unsupported'}
          >
            <i
              className={asking ? 'ri-loader-4-line is-spin' : nearOn ? 'ri-navigation-fill' : 'ri-focus-3-line'}
              aria-hidden="true"
            ></i>
            <span className="whitespace-nowrap">
              {asking ? t('near.asking') : nearOn ? t('near.active') : t('near.label')}
            </span>
          </button>
        )}

        {/* La porte du reste : elle dit son nom, et le chiffre de ce qui est
            déjà posé derrière elle. */}
        <button
          type="button"
          className={`filters-toggle${more ? ' is-open' : ''}`}
          aria-expanded={more}
          aria-controls="dir-filters-panel"
          aria-label={
            folded > 0
              ? `${t('dir.moreFilters')} — ${t('dir.moreCount').replace('{n}', String(folded))}`
              : t('dir.moreFilters')
          }
          title={t('dir.moreHint')}
          onClick={toggleMore}
        >
          <i className="ri-equalizer-2-line" aria-hidden="true"></i>
          <span className="whitespace-nowrap">{t('dir.moreFilters')}</span>
          {folded > 0 && (
            <span className="filters-toggle-n" aria-hidden="true">
              {folded}
            </span>
          )}
          <i className="ri-arrow-down-s-line filters-toggle-caret" aria-hidden="true"></i>
        </button>

        <button type="button" className="filters-reset" onClick={onReset} disabled={!active}>
          <i className="ri-refresh-line" aria-hidden="true"></i>{t('dir.reset')}
        </button>
      </div>

      {geoMessage && (
        <p className="filters-geo">
          <i className="ri-error-warning-line" aria-hidden="true"></i>
          {geoMessage}
        </p>
      )}

      {more && (
        <div className="filters-panel" id="dir-filters-panel">
          <div className="filters-panel-grid">
            <div className="fld filters-search">
              <label htmlFor="dir-q">{t('dir.search')}</label>
              <div className="fld-inline">
                <i className="ri-search-line" aria-hidden="true"></i>
                <input id="dir-q" type="search" value={q} onChange={(e) => onQ(e.target.value)} placeholder={t('dir.search')} />
              </div>
            </div>
            <div className="fld">
              <label htmlFor="dir-pays">{t('pays.label')}</label>
              <select id="dir-pays" value={pays} onChange={(e) => onPays(e.target.value)}>
                <option value="">{t('pays.all')}</option>
                {paysArabes.map((p) => (
                  <option key={p.code} value={p.code}>{localize(p.nom, lang)}</option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label htmlFor="dir-wilaya">{regionLabel}</label>
              <RegionSelect
                id="dir-wilaya"
                pays={pays}
                value={wilaya}
                onChange={onRegion}
                allLabel={allRegionsLabel}
              />
            </div>
            <div className="fld">
              <label htmlFor="dir-open">{genLabel}</label>
              <DecadeMenu
                id="dir-open"
                value={open}
                onChange={onOpen}
                options={decades}
                allLabel={t('gen.filterAll')}
                hint={t('gen.menuHint')}
                limitHint={t('gen.menuMax')}
              />
            </div>
          </div>

          {mode === 'entreprises' && (
            <div className="fresh-row">
              {/* Le métier retenu n'a aucun atelier ici : le dire tout de suite,
                  avec les deux gestes déjà connus — élargir la région seule, ou
                  rendre le réseau entier. */}
              {tradeNowhere && (
                <p className="fresh-hint fac-none">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  <span>
                    {(wilaya ? t('dir.tradeNone') : t('dir.tradeNoneCountry')).replace('{trade}', tradeWord)}
                  </span>
                  <span className="fac-none-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="fac-none-btn fac-none-btn-ghost"
                        title={t('dir.facEmptyRegionHint')}
                        onClick={onClearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('dir.facEmptyRegion')}
                      </button>
                    )}
                    <button type="button" className="fac-none-btn" onClick={onReset}>
                      {t('dir.facNoneReset')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </button>
                  </span>
                </p>
              )}
              <button
                type="button"
                className={`fresh-toggle fresh-toggle-fresh${fresh ? ' is-on' : ''}${freshCount === 0 ? ' is-zero' : ''}`}
                aria-pressed={fresh}
                title={freshCount === 0 ? t('dir.freshNone') : t('dir.freshHint')}
                onClick={() => onFresh(!fresh)}
              >
                <i className={fresh ? 'ri-sparkling-fill' : 'ri-sparkling-line'} aria-hidden="true"></i>
                {t('dir.fresh')}
                <span className="fresh-count" aria-hidden="true">{freshCount}</span>
                <span className="fresh-sr">: {freshCount}</span>
              </button>
              {fresh && <p className="fresh-hint">{t('dir.freshHint')}</p>}
              {/* Nothing new in the chosen country and region: the pill says it, and
                  hands back either the region alone or the whole network. The notice
                  only opens once the pill is on — otherwise it is read under the
                  cursor, through the pill's own tooltip. */}
              {fresh && freshCount === 0 && (
                <p className="fresh-hint fac-none">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  <span>{wilaya ? t('dir.freshNone') : t('dir.freshNoneCountry')}</span>
                  <span className="fac-none-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="fac-none-btn fac-none-btn-ghost"
                        title={t('dir.facEmptyRegionHint')}
                        onClick={onClearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('dir.facEmptyRegion')}
                      </button>
                    )}
                    <button type="button" className="fac-none-btn" onClick={onReset}>
                      {t('dir.facNoneReset')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </button>
                  </span>
                </p>
              )}
              {/* Le façonnage a sa puce ici, là où l'on filtre vraiment : le compte
                  d'ateliers en activité descend jusqu'au geste qui l'ouvre, et c'est
                  le même chiffre que dans la barre et le pied de page. */}
              <button
                type="button"
                className={`fresh-toggle fresh-toggle-fac${trade === 'faconnage' ? ' is-on' : ''}${facCount === 0 ? ' is-zero' : ''}`}
                aria-pressed={trade === 'faconnage'}
                aria-label={`${t('trade.faconnage')} — ${facCount} ${facLabel} ${t('navm.faconActive')}`}
                title={t('dir.facHint')}
                onClick={() => onTrade(trade === 'faconnage' ? '' : 'faconnage')}
              >
                <i className={trade === 'faconnage' ? 'ri-scissors-cut-fill' : 'ri-scissors-cut-line'} aria-hidden="true"></i>
                {t('trade.faconnage')}
                <span className="fresh-count" aria-hidden="true">{facCount}</span>
                <span className="fresh-sr">: {facCount}</span>
              </button>
              {trade === 'faconnage' && <p className="fresh-hint">{t('dir.facHint')}</p>}
              {/* Nothing left in the chosen country and region: the chip says so, and
                  hands the whole network back in one gesture — or widens the region
                  alone, keeping the country and the trade exactly where they are. */}
              {trade === 'faconnage' && facCount === 0 && (
                <p className="fresh-hint fac-none">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  <span>{wilaya ? t('dir.facNone') : t('dir.facNoneCountry')}</span>
                  <span className="fac-none-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="fac-none-btn fac-none-btn-ghost"
                        title={t('dir.facEmptyRegionHint')}
                        onClick={onClearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('dir.facEmptyRegion')}
                      </button>
                    )}
                    <button type="button" className="fac-none-btn" onClick={onReset}>
                      {t('dir.facNoneReset')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </button>
                  </span>
                </p>
              )}
              {/* The institutions pill keeps the structures the blue badge marks on
                  the cards, so an organisation is found without opening profiles. */}
              <button
                type="button"
                className={`fresh-toggle fresh-toggle-insti${insti ? ' is-on' : ''}${instiCount === 0 ? ' is-zero' : ''}`}
                aria-pressed={insti}
                onClick={() => onInsti(!insti)}
                title={instiCount === 0 ? t('dir.instiNone') : t('dir.instiHint')}
              >
                <i className={insti ? 'ri-building-4-fill' : 'ri-building-4-line'} aria-hidden="true"></i>
                {t('dir.insti')}
                <span className="fresh-count" aria-hidden="true">{instiCount}</span>
                <span className="fresh-sr">: {instiCount}</span>
              </button>
              {insti && <p className="fresh-hint">{t('dir.instiHint')}</p>}
              {/* Same two ways out when the pill finds no institution here. */}
              {insti && instiCount === 0 && (
                <p className="fresh-hint fac-none">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  <span>{wilaya ? t('dir.instiNone') : t('dir.instiNoneCountry')}</span>
                  <span className="fac-none-acts">
                    {wilaya && (
                      <button
                        type="button"
                        className="fac-none-btn fac-none-btn-ghost"
                        title={t('dir.facEmptyRegionHint')}
                        onClick={onClearRegion}
                      >
                        <i className="ri-map-pin-line" aria-hidden="true"></i>
                        {t('dir.facEmptyRegion')}
                      </button>
                    )}
                    <button type="button" className="fac-none-btn" onClick={onReset}>
                      {t('dir.facNoneReset')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </button>
                  </span>
                </p>
              )}
              {/* One click reads the list by the size of the establishment park, the
                  same order the sort menu offers — and a second click hands the usual
                  order back. */}
              <button
                type="button"
                className={`fresh-toggle fresh-toggle-etabs${etabsSort ? ' is-on' : ''}`}
                aria-pressed={etabsSort}
                onClick={() => onEtabsSort(!etabsSort)}
                title={t('dir.etabsQuickHint')}
              >
                <i className={etabsSort ? 'ri-sort-desc' : 'ri-arrow-up-down-line'} aria-hidden="true"></i>
                {t('dir.etabsQuick')}
                <span className="fresh-count" aria-hidden="true">{etabsSortCount}</span>
                <span className="fresh-sr">: {etabsSortCount}</span>
              </button>
              {etabsSort && <p className="fresh-hint">{t('dir.etabsQuickHint')}</p>}
            </div>
          )}

          {panel}

          {/* La petite ligne du bas : elle rend ce que la porte tient, et rien
              de plus. Le type lu reste où il est — c'est lui la rubrique du
              tableau, pas un filtre rangé derrière la porte. */}
          {onClearFolded && (
            <p className="filters-panel-foot">
              <button
                type="button"
                className="filters-panel-clear"
                onClick={onClearFolded}
                disabled={folded === 0}
              >
                <i className="ri-eraser-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('dir.clearFolded')}</span>
              </button>
              <span className="filters-panel-foot-hint">{t('dir.clearFoldedHint')}</span>
            </p>
          )}
        </div>
      )}
    </StickyStack>
  );
}