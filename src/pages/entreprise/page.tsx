import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor, type Localized } from '@/i18n/localize';
import { monthYear } from '@/lib/dates';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { prixDevise } from '@/lib/price';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import { useReveal } from '@/hooks/useReveal';
import { useSeo } from '@/hooks/useSeo';
import { useGeo, haversineKm, formatDistance } from '@/hooks/useGeo';
import { entreprises, formuleDe } from '@/mocks/entreprises';
import { specialitesDe } from '@/lib/specialites';
import { regionUniqueFamille } from '@/lib/tradeCountries';
import { planById, planCardHref } from '@/pages/offres/components/plans';
import { isNewcomer } from '@/lib/newcomers';
import { decadeLabel, decadeOf, decadesWithMemory } from '@/lib/generation';
import { readDirMemory, dirBackLink } from '@/hooks/useDirMemory';
import { useWriteToWorkshop } from '@/hooks/useWriteToWorkshop';
import AireCopyShort from '@/components/feature/AireCopyShort';
import { regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import ArrivalSpark from '@/components/feature/ArrivalSpark';
import PoseRestante from '@/components/feature/PoseRestante';
import ProfileAside from './components/ProfileAside';
import PhotoGallery from '@/components/feature/PhotoGallery';
import GenerationSheetExport from './components/GenerationSheetExport';
import FicheTrail from '@/components/feature/FicheTrail';
import { breadcrumbLd, type Crumb } from '@/lib/structuredData';
import { useJsonLd } from '@/hooks/useJsonLd';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import NeighbourTrades from './components/NeighbourTrades';
import HoodNeighbour from './components/HoodNeighbour';
import './components/contact-atelier.css';

export default function EntrepriseProfile() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t, lang } = useLang();
  const geo = useGeo();
  /* L'écriture à l'atelier : le geste est partagé avec les cartes de
     l'annuaire, l'état reste celui de cette fiche. */
  const { writeState, writeToWorkshop } = useWriteToWorkshop();
  useReveal();

  /* Arriving from a directory card through its establishments pill: the sheet
     opens on that very figure, rather than on its first line. */
  useEffect(() => {
    if (window.location.hash !== '#pro-etabs') return;
    const id = window.setTimeout(() => {
      document.getElementById('pro-etabs')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 180);
    return () => window.clearTimeout(id);
  }, [id]);

  const item = entreprises.find((e) => e.id === id);
  /* The formula the workshop holds, read right under its name: the visitor
     knows what the sheet owes to the directory before reading further. */
  const formule = item ? formuleDe(item) : 'annuaire';
  const plan = planById(formule);
  const tr = (b: Localized) => localize(b, lang);
  /* Le nom de l'atelier se lit dans la langue de la page, sur l'en-tête comme
     dans les listes de voisins : une seule écriture pour toute la fiche. */
  const nom = item ? nomDemo(item.name, lang) : '';
  const distanceKm = geo.point && item ? haversineKm(geo.point, { lat: item.lat, lng: item.lng }) : null;

  /* Le chemin de la fiche, écrit une seule fois : l'accueil, l'annuaire, la
     page du type, celle du pays quand il existe, puis l'atelier lui-même. Le
     fil affiché et le balisage lu par les moteurs puisent dans cette même
     liste, si bien qu'ils ne peuvent pas se contredire — et la fiche se
     remonte comme les plumes, les annonces et les offres. */
  const filCrumbs: Crumb[] = (() => {
    if (!item) return [{ name: t('siteMap.home'), path: '/' }];
    const typePath = slugDeTrade(item.trade);
    const paysPath = slugPays(paysDe(item));
    return [
      { name: t('siteMap.home'), path: '/' },
      { name: t('siteMap.directory'), path: '/annuaire' },
      ...(typePath
        ? [{ name: t(`tradePlural.${item.trade}`), path: `/annuaire/${typePath}` }]
        : []),
      ...(typePath && paysPath
        ? [{ name: nomPays(paysDe(item), lang), path: `/annuaire/${typePath}/${paysPath}` }]
        : []),
      { name: nom, path: `/entreprise/${item.id}` },
    ];
  })();
  useJsonLd('entreprise-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbLd(filCrumbs)],
  });

  useSeo({
    page: 'entreprise',
    path: item ? `/entreprise/${item.id}` : '/annuaire',
    title: item ? `${nom} — ${item.commune}, ${item.wilaya} | PaperAtlas` : undefined,
    description: item
      ? `${nom}, ${t(`trade.${item.trade}`)} à ${item.commune} (${item.wilaya}) : ${localize(item.blurb, lang)}`.slice(0, 158)
      : undefined,
    keywords: item ? `${nom}, ${t(`trade.${item.trade}`)}, ${item.wilaya}, ${item.commune}` : undefined,
  });

  if (!item) {
    return (
      <>
        <Nav variant="page" />
        <main className="page-main" id="main-content" tabIndex={-1}>
          <div className="pro-wrap pro-missing">
            <h1>{t('pro.notfound')}</h1>
            <Link to="/annuaire" className="cta">{t('pro.all')} <i className="ri-arrow-right-line" aria-hidden="true"></i></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const codePays = paysDe(item);
  const nomDuPays = nomPays(codePays, lang);
  /* L'aire du monde où se tient l'atelier : la fiche l'annonce en deux lignes
     — son nom et ses fiches —, sans rang ni adresse de vue Carte. */
  const aireAtelier = regionMondeDe(codePays);
  const aireAtelierNom = aireAtelier ? t(regionMondeLabelKey(aireAtelier)) : '';
  /* Le métier d'où l'on vient : celui sur lequel l'annuaire était filtré au
     moment d'ouvrir la fiche, écrit dans l'adresse par la carte elle-même.
     Sans lui, la ligne se tait plutôt que de nommer un métier qu'on n'a pas
     traversé — un rappel ne dit jamais un chemin qui n'a pas été pris. */
  const askedTrade = (params.get('trade') ?? '').trim();
  const fromTrade = askedTrade && entreprises.some((e) => e.trade === askedTrade)
    ? askedTrade
    : '';
  /* La région d'où l'on vient : celle que l'annuaire avait resserrée au moment
     d'ouvrir la fiche. Elle ne se rappelle que si elle existe bien dans ce
     pays-là — deux pays peuvent nommer une même région. */
  const askedRegion = (params.get('wilaya') ?? '').trim();
  const askedPays = (params.get('pays') ?? '').trim();
  const fromRegion = askedRegion && entreprises.some(
    (e) => e.wilaya === askedRegion && (!askedPays || paysDe(e) === askedPays),
  )
    ? askedRegion
    : '';
  /* La porte de la région : elle rouvre l'annuaire resserré sur ce même lieu,
     en gardant le métier lu — et le pays, qui donne son sens à la région. */
  const fromRegionHref = (() => {
    const next = new URLSearchParams();
    next.set('wilaya', fromRegion);
    next.set('pays', askedPays || codePays);
    if (fromTrade) next.set('trade', fromTrade);
    const query = next.toString();
    return `/annuaire${query ? `?${query}` : ''}`;
  })();
  /* Le pays d'où l'on vient : celui que l'annuaire avait retenu au moment
     d'ouvrir la fiche. Il ne se rappelle que s'il compte bien des ateliers. */
  const fromPays = askedPays && entreprises.some((e) => paysDe(e) === askedPays)
    ? askedPays
    : '';
  /* La porte du pays : elle rouvre l'annuaire resserré sur ce pays, en gardant
     le métier lu — rien d'autre n'est resserré. */
  const fromPaysHref = (() => {
    const next = new URLSearchParams();
    next.set('pays', fromPays);
    if (fromTrade) next.set('trade', fromTrade);
    const query = next.toString();
    return `/annuaire${query ? `?${query}` : ''}`;
  })();
  /* Ce que l'atelier sait préciser dans son métier, lu juste après son type. */
  const specs = specialitesDe(item);
  /* La région unique où la famille de cet atelier est tenue dans son pays, ou
     null quand elle en occupe plusieurs : la fiche marque alors un « métier
     concentré », lu sur tout le répertoire et jamais sur un filtre en cours. */
  const regionSolo = regionUniqueFamille(item.trade, codePays);
  /* Les régions de ce pays où le répertoire tient au moins une fiche : c'est
     le pays tel qu'il est vraiment tenu, et le dénominateur de la part que
     cette région unique représente — « 1 région sur 12 ». Lu sur tout le
     répertoire, jamais sur un filtre en cours. */
  const regionsPays = new Set(
    entreprises
      .filter((e) => paysDe(e) === codePays)
      .map((e) => (e.wilaya || '').trim())
      .filter(Boolean),
  ).size;
  const soloShare = regionsPays > 0 ? Math.round(100 / regionsPays) : 0;
  /* The sites the structure named at sign-up: read as a list under the
     figure, only when they were actually filled in. */
  const etabs = item.etabsListe ?? [];
  /* Le parc déclaré, lu même quand la liste n'est pas encore nommée : le
     chiffre de la carte ne peut pas tomber à zéro si la structure a annoncé
     quatre sites. */
  const nbEtabs = etabs.length > 0 ? etabs.length : item.etablissements ?? 0;
  /* Where this workshop sits: how busy its country is, how busy its region is,
     and who works right next to it. Read on the whole board, not on a filter. */
  const memesPays = entreprises.filter((e) => paysDe(e) === codePays);
  const memesRegion = memesPays.filter((e) => e.wilaya === item.wilaya);
  const voisinsRegion = memesRegion.filter((e) => e.id !== item.id);
  const proches = (voisinsRegion.length ? voisinsRegion : memesPays.filter((e) => e.id !== item.id))
    .map((e) => ({ e, km: haversineKm({ lat: item.lat, lng: item.lng }, { lat: e.lat, lng: e.lng }) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);
  /* The generation this workshop belongs to: its decade of opening, and the
     workshops opened in the very same ten years, wherever they stand. */
  const generation = decadeOf(item.since);
  const generationLabel = decadeLabel(generation);
  /* The decade of this sheet joins the ones already remembered, so going back to
     the directory keeps both generations open instead of dropping the second. */
  const openWithMemory = decadesWithMemory(generation, readDirMemory().open);
  const backLink = dirBackLink(Boolean(geo.point));
  const memesGeneration = entreprises.filter((e) => decadeOf(e.since) === generation);
  /* The same trade, all countries together: the workshops able to take the
     same kind of job, the closest first. */
  const memesMetier = entreprises.filter((e) => e.trade === item.trade);
  const voisinsMetier = memesMetier
    .filter((e) => e.id !== item.id)
    .map((e) => ({ e, km: haversineKm({ lat: item.lat, lng: item.lng }, { lat: e.lat, lng: e.lng }) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 3);

  /* « Signaler cette fiche » : un message déjà adressé à l’équipe, la
     référence de la fiche et son nom déjà cités, avec l’adresse exacte de la
     page. Rien ne part tant que le visiteur ne l’envoie pas lui-même. */
  const signalUrl = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}/entreprise/${item.id}`;
  const signalHref = `mailto:contact@paperatlas-dz.com?subject=${encodeURIComponent(
    `${t('pro.signalSubject')} · ${item.id}`,
  )}&body=${encodeURIComponent(
    t('pro.signalBody')
      .replace('{ref}', item.id)
      .replace('{title}', nom)
      .replace('{url}', signalUrl),
  )}`;

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <div className="pro-wrap">
          {/* Le fil d'Ariane relie la fiche à la page de son type et à celle
              de son pays : un cran au-dessus, et deux portes d'entrée. Le
              dessin est celui de toutes les fiches. */}
          <FicheTrail crumbs={filCrumbs} />

          <Link to={backLink} className="back-link">
            <i className="ri-arrow-left-line" aria-hidden="true"></i>{t('pro.back')}
          </Link>

          {/* La région d'où l'on vient, rappelée comme sur la fiche d'un
              candidat : sa porte rouvre l'annuaire resserré sur ce lieu. */}
          {fromRegion && (
            <p className="pro-from pro-from-region">
              <i className="ri-map-pin-2-line" aria-hidden="true"></i>
              <span>{t('pro.fromRegion').replace('{region}', nomRegion(fromRegion, lang))}</span>
              <Link to={fromRegionHref} className="board-trip-go">
                <i className="ri-arrow-left-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('pro.backRegion')}</span>
              </Link>
            </p>
          )}

          {/* Le pays d'où l'on vient, rappelé à côté de la région : sa porte
              rouvre l'annuaire resserré sur ce pays. Une seule des trois lignes
              porte la sienne — la région d'abord, sinon le pays. */}
          {fromPays && (
            <p className="pro-from pro-from-pays">
              <i className="ri-global-line" aria-hidden="true"></i>
              <span>{t('pro.fromPays').replace('{pays}', nomPays(fromPays, lang))}</span>
              {!fromRegion && (
                <Link to={fromPaysHref} className="board-trip-go">
                  <i className="ri-arrow-left-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('pro.backPays')}</span>
                </Link>
              )}
            </p>
          )}

          {/* Le métier d'où l'on vient, rappelé comme sur la fiche d'un
              candidat : la porte rouvre l'annuaire filtré sur ce même type,
              sans reposer le filtre à la main. */}
          {fromTrade && (
            <p className="pro-from">
              <i className="ri-tools-line" aria-hidden="true"></i>
              <span>{t('pro.fromTrade').replace('{trade}', t(`trade.${fromTrade}`))}</span>
              {/* Une seule porte ramène à la liste : la région porte la sienne
                  quand elle est là, puis le pays ; le métier ne la double pas. */}
              {!fromRegion && !fromPays && (
                <Link
                  to={`/annuaire?trade=${encodeURIComponent(fromTrade)}`}
                  className="board-trip-go"
                >
                  <i className="ri-arrow-left-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('pro.backTrade')}</span>
                </Link>
              )}
            </p>
          )}

          {/* Le plan du site, où cette fiche est nommée dans sa famille :
              l'adresse porte l'ancre de cette fiche, le plan s'y ouvre. */}
          <Link
            className="pro-plan-link"
            to={`/plan-du-site#fiche-${item.id}`}
            title={t('pro.sitemapHint')}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            <span>{t('pro.sitemapLink')}</span>
          </Link>

          <header className="pro-head" data-reveal>
            <span className="pro-logo" aria-hidden="true">{item.logoMark}</span>
            <div className="pro-ident">
              <p className="stamp">{t(`trade.${item.trade}`)} · {nomRegion(item.wilaya, lang)} · {nomPays(paysDe(item), lang)}</p>
              <div className="pro-name">
                <h1>{nom}</h1>
                {plan && (
                  /* The pill leads to the very card of that plan on « Offres »,
                     so a visitor can see what the workshop pays for. */
                  <Link
                    to={planCardHref(plan.id)}
                    className={`pro-plan is-${plan.id}`}
                    title={`${t('ofb.cardPlanTitle')} — ${t('ofb.cardPlanOpen')}`}
                  >
                    <i className={plan.icon} aria-hidden="true"></i>
                    <span>{t(plan.name)}</span>
                    <i className="ri-arrow-right-up-line pro-plan-go" aria-hidden="true"></i>
                  </Link>
                )}
                {isNewcomer(item.id) && <span className="pro-new">{t('last.new')}</span>}
                <span className="pro-joined" title={monthYear(item.joined, localeFor(lang))}>
                  <i className="ri-calendar-2-line" aria-hidden="true"></i>
                  {t('dir.since')} {monthYear(item.joined, localeFor(lang))}
                </span>
              </div>
              {/* Les précisions du métier, à côté du type et avant les
                  chiffres : offset, numérique, sérigraphie… */}
              {specs.length > 0 && (
                <p className="pro-specs">
                  <span className="pro-specs-lab">
                    <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                    {t('tradePage.specLabel')}
                  </span>
                  {specs.map((key) => (
                    <span className="pro-spec" key={key}>{t(`spec.${key}`)}</span>
                  ))}
                </p>
              )}
              <p className="pro-meta">
                <span className="biz-rate"><i className="ri-star-fill" aria-hidden="true"></i>{item.rating.toFixed(1)} <em>({item.reviews} {t('pro.rating')})</em></span>
                <Link className="pro-gen" to={`/annuaire?open=${openWithMemory}`} title={t('pro.genOpen')}>
                  {t('pro.since')} {item.since}
                </Link>
                <span>{item.staff} {t('pro.staff')}</span>
                {/* An institution sheet also says how many establishments the
                    account gathers, right beside the workshop's own figures. */}
                {formule === 'institutions' && item.etablissements ? (
                  <span
                    className="pro-etabs"
                    title={`${t('ofi.block')} · ${t('ofb.cardPlanTitle')}`}
                  >
                    <i className="ri-building-4-line" aria-hidden="true"></i>
                    {item.etablissements}{' '}
                    {item.etablissements > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}
                  </span>
                ) : null}
                <span>{t('pro.based')} {nomCommune(item.commune, lang)}</span>
                <span className="pro-country">
                  <i className="ri-global-line" aria-hidden="true"></i>
                  {nomPays(paysDe(item), lang)}
                </span>
                {/* Le métier tenu dans une seule région du pays : un jeton
                    qui se repère d'un œil. Le survol nomme la région, puis
                    la part du pays qu'elle représente — une région sur
                    douze, et son pourcentage. */}
                {regionSolo && (
                  <span
                    className="pro-solo"
                    title={`${t('pro.soloHint').replace('{region}', nomRegion(regionSolo, lang))}${regionsPays > 0 ? ` ${t('pro.soloShare').replace('{share}', String(soloShare)).replace('{total}', String(regionsPays))}` : ''}`}
                  >
                    <i className="ri-focus-3-line" aria-hidden="true"></i>
                    {t('pro.solo')}
                  </span>
                )}
                {distanceKm !== null && (
                  <span className="pro-dist">
                    <i className="ri-navigation-line" aria-hidden="true"></i>
                    {formatDistance(distanceKm, lang)} {t('pro.fromYou')}
                  </span>
                )}
              </p>
              {/* Le repère de pose de cet écran : la fiche d'un atelier dit
                  elle aussi combien de ses propres textes restent à traduire,
                  pour que chaque écran de la liste de relecture dise son
                  reste. */}
              <PoseRestante fichier="dict.ts" prefixes={['pro.']} />
              <div className="chip-row">
                {item.certs.map((c) => <span key={c}>{c}</span>)}
              </div>
              {/* From the sheet straight to the country map: the visitor sees
                  where this workshop sits among the others of its country. */}
              <Link
                className="pro-map-link"
                to={`/annuaire?view=map&pays=${paysDe(item)}#cmaps`}
                title={t('pro.countryMapNote')}
              >
                <i className="ri-map-2-line" aria-hidden="true"></i>
                <span className="pro-map-link-txt">{t('pro.countryMap')} · {nomPays(paysDe(item), lang)}</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
              {/* Le geste court de l'aire : il n'emporte que le nom de l'aire
                  où se tient l'atelier et ses fiches — deux lignes, sans rang
                  ni adresse de vue Carte. */}
              {aireAtelier && (
                <AireCopyShort
                  region={aireAtelier}
                  label={t('cmaps.atelierAireCopy')}
                  hintLead={t('cmaps.atelierAireCopyHint')
                    .replace('{atelier}', nom)
                    .replace('{region}', aireAtelierNom)}
                  line={t('cmaps.atelierAireCopyLine').replace('{atelier}', nom)}
                />
              )}
            </div>
            {/* Les deux gestes de la fiche, côte à côte : écrire à l'atelier
                d'un côté, lui adresser une demande B2B de l'autre. Le bouton
                d'écriture ne montre jamais qu'il travaille en silence : il
                change de mot pendant l'ouverture du fil. */}
            <div className="pro-head-side">
              <div className="pro-head-actions">
                <button
                  type="button"
                  className="pro-write"
                  onClick={() => void writeToWorkshop(item.id, item.name)}
                  disabled={writeState === 'busy'}
                  title={t('pro.writeHint')}
                >
                  <i
                    className={writeState === 'busy' ? 'ri-loader-4-line is-spin' : 'ri-chat-3-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {writeState === 'busy' ? t('pro.writing') : t('pro.write')}
                  </span>
                </button>
                <Link className="cta pro-head-cta" to={`/demande-b2b?atelier=${item.id}`}>
                  {t('b2b.shopCardCta')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </div>
              {writeState === 'none' && (
                <p className="pro-write-note">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('pro.writeNone')}
                </p>
              )}
              {writeState === 'self' && (
                <p className="pro-write-note">
                  <i className="ri-user-line" aria-hidden="true"></i>
                  {t('pro.writeSelf')}
                </p>
              )}
              {writeState === 'error' && (
                <p className="pro-write-note is-err" role="alert">
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {t('pro.writeError')}
                </p>
              )}
            </div>
          </header>

          {/* An Institutions structure names its sites: the park the account
              gathers, read as a list rather than a single figure. */}
          {formule === 'institutions' && (
            <section id="pro-etabs" className="pro-card pro-etabcard" data-reveal>
              <div className="pro-etabcard-head">
                <h2 className="pro-h">{t('pro.etabsTitle')}</h2>
                <span className="pro-etabcard-count">
                  <i className="ri-building-4-line" aria-hidden="true"></i>
                  {nbEtabs > 0 ? (
                    <>
                      {nbEtabs}{' '}
                      {nbEtabs > 1 ? t('ofb.etabsMany') : t('ofb.etabsOne')}
                    </>
                  ) : (
                    t('pro.etabsNone')
                  )}
                </span>
              </div>
              {etabs.length === 0 ? (
                <div className="pro-etablist-empty">
                  <i className="ri-building-line" aria-hidden="true"></i>
                  <b>
                    {t(nbEtabs > 0 ? 'pro.etabsUnnamedTitle' : 'pro.etabsEmptyTitle')}
                  </b>
                  <p>
                    {t(nbEtabs > 0 ? 'pro.etabsUnnamedBody' : 'pro.etabsEmptyBody').replace(
                      '{n}',
                      String(nbEtabs),
                    )}
                  </p>
                </div>
              ) : (
                <>
              <ul className="pro-etablist">
                {etabs.map((site) => (
                  <li key={`${site.nom}-${site.commune}`}>
                    {/* Each site is a door into the directory, filtered on the
                        region it stands in — nothing else is filtered out. */}
                    <Link
                      className="pro-etablist-link"
                      to={`/annuaire?pays=${codePays}&wilaya=${encodeURIComponent(site.wilaya)}`}
                      title={`${t('pro.etablistOpen')} — ${nomRegion(site.wilaya, lang)}`}
                    >
                      <span className="pro-etablist-ico">
                        <i className="ri-building-2-line" aria-hidden="true"></i>
                      </span>
                      <span className="pro-etablist-body">
                        <span className="pro-etablist-name">{nomDemo(site.nom, lang)}</span>
                        <span className="pro-etablist-where">
                          <i className="ri-map-pin-line" aria-hidden="true"></i>
                          {nomCommune(site.commune, lang)} · {nomRegion(site.wilaya, lang)}
                        </span>
                      </span>
                      <i className="ri-arrow-right-line pro-etablist-go" aria-hidden="true"></i>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="pro-etablist-hint">
                <i className="ri-road-map-line" aria-hidden="true"></i>
                {t('pro.etablistHint')}
              </p>
              <p className="pro-etablist-note">
                <i className="ri-information-line" aria-hidden="true"></i>
                {t('pro.etabsNote')}
              </p>
                </>
              )}
            </section>
          )}

          {/* Where the workshop sits among the others: how many profiles its
              country holds, how many its region holds, and who works nearby. */}
          <section className="pro-card pro-hood" data-reveal>
            <h2 className="pro-h">{t('pro.hoodTitle')}</h2>
            <div className="pro-hood-stats">
              <Link className="pro-hood-stat" to={`/annuaire?view=map&pays=${codePays}#cmaps`}>
                <span className="pro-hood-ico"><i className="ri-earth-line" aria-hidden="true"></i></span>
                <span className="pro-hood-body">
                  <span className="pro-hood-num">{memesPays.length}</span>
                  <span className="pro-hood-lab">{t('pro.hoodCountry')}</span>
                  <span className="pro-hood-where">{nomDuPays}</span>
                </span>
                <i className="ri-arrow-right-line pro-hood-go" aria-hidden="true"></i>
              </Link>
              <Link
                className="pro-hood-stat"
                to={`/annuaire?pays=${codePays}&wilaya=${encodeURIComponent(item.wilaya)}`}
              >
                <span className="pro-hood-ico"><i className="ri-map-pin-2-line" aria-hidden="true"></i></span>
                <span className="pro-hood-body">
                  <span className="pro-hood-num">{memesRegion.length}</span>
                  <span className="pro-hood-lab">{t('pro.hoodRegion')}</span>
                  <span className="pro-hood-where">{nomRegion(item.wilaya, lang)}</span>
                </span>
                <i className="ri-arrow-right-line pro-hood-go" aria-hidden="true"></i>
              </Link>
              {/* The decade it opened in: the workshops of the same generation,
                  opened in the very same ten years. */}
              <Link className="pro-hood-stat" to={`/annuaire?open=${openWithMemory}`} title={t('pro.genOpen')}>
                <span className="pro-hood-ico"><i className="ri-calendar-event-line" aria-hidden="true"></i></span>
                <span className="pro-hood-body">
                  <span className="pro-hood-num">{memesGeneration.length}</span>
                  <span className="pro-hood-lab">{t('pro.hoodGeneration')}</span>
                  <span className="pro-hood-where">{generationLabel}</span>
                </span>
                <i className="ri-arrow-right-line pro-hood-go" aria-hidden="true"></i>
              </Link>
            </div>

            {/* The generation, handed over as a file: the workshops of these
                ten years, country by country. */}
            <div className="pro-hood-export">
              <span className="pro-hood-export-lab">
                <i className="ri-calendar-2-line" aria-hidden="true"></i>
                {t('pro.genExportTitle')} · <b>{generationLabel}</b>
                <span>· {memesGeneration.length} {t('gtally.files')}</span>
              </span>
              <GenerationSheetExport decade={generation} label={generationLabel} />
            </div>

            {proches.length > 0 ? (
              <div className="pro-hood-near">
                <p className="pro-hood-near-lab">
                  <i className={voisinsRegion.length ? 'ri-team-line' : 'ri-road-map-line'} aria-hidden="true"></i>
                  {voisinsRegion.length ? t('pro.hoodNeighbours') : t('pro.hoodClose')}
                </p>
                <ul className="pro-hood-list">
                  {proches.map(({ e, km }) => (
                    <HoodNeighbour key={e.id} e={e} km={km} />
                  ))}
                </ul>
              </div>
            ) : (
              <p className="pro-hood-alone">
                <i className="ri-information-line" aria-hidden="true"></i>
                {t('pro.hoodAlone')}
              </p>
            )}

            {/* The same region says who works beside this workshop; the same
                trade says who can take the same job, wherever it is. */}
            <div className="pro-hood-near">
              <p className="pro-hood-near-lab">
                <i className="ri-tools-line" aria-hidden="true"></i>
                {t('pro.hoodTrade')} · {t(`trade.${item.trade}`)}
                {memesMetier.length > 1 && <span className="pro-hood-near-num">{memesMetier.length}</span>}
              </p>
              {voisinsMetier.length > 0 ? (
                <ul className="pro-hood-list">
                  {voisinsMetier.map(({ e, km }) => (
                    <HoodNeighbour key={e.id} e={e} km={km} />
                  ))}
                </ul>
              ) : (
                <p className="pro-hood-alone">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('pro.hoodTradeAlone')}
                </p>
              )}
              <Link className="pro-hood-more" to={`/annuaire?trade=${item.trade}`}>
                {t('pro.hoodTradeAll')}
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
            </div>
          </section>

          <section className="pro-card pro-activity" data-reveal>
            <ArrivalSpark variant="strip" trade={item.trade} originId={item.id} />
            <p className="pro-note">
              <i className="ri-information-line" aria-hidden="true"></i>
              {t('pro.activityNote')}
            </p>
          </section>

          <div className="pro-hero" data-reveal>
            <img src={item.photos[0]} alt={`${nom} · ${item.wilaya}`} title={`${nom} — ${t(`trade.${item.trade}`)} ${item.wilaya}`} width={1200} height={900} />
            <div className="pro-hero-cap">
              <span className="stamp">{t('pro.capacity')}</span>
              <p>{tr(item.capacity)}</p>
            </div>
          </div>

          <div className="pro-grid">
            <div className="pro-main">
              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('pro.about')}</h2>
                <p className="pro-text">{tr(item.blurb)}</p>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('pro.services')}</h2>
                <ul className="serv-list">
                  {item.services.map((s, i) => (
                    <li key={s.fr}>
                      <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                      <span>{tr(s)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('pro.catalogue')}</h2>
                <div className="cat-table">
                  <div className="cat-row cat-head">
                    <span>{t('pro.ref')}</span><span>{t('pro.catalogue')}</span><span>{t('pro.spec')}</span><span>{t('pro.price')}</span>
                  </div>
                  {item.catalogue.map((c) => (
                    <div className="cat-row" key={c.ref}>
                      <span className="cat-ref">{c.ref}</span>
                      <span className="cat-title">{tr(c.title)}</span>
                      <span className="cat-spec">{c.spec}</span>
                      <span className="cat-price">{prixDevise(c.price, item.pays)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('pro.photos')}</h2>
                <PhotoGallery photos={item.photos} nom={nom} wilaya={item.wilaya} label={t('pro.photos')} />
              </section>
            </div>

            <ProfileAside item={item} />
          </div>

          {/* Sous la fiche, les trois familles les plus fournies du même pays,
              chacune avec sa page de pays : le réseau se lit famille après
              famille, sans revenir aux filtres. */}
          <NeighbourTrades pays={codePays} trade={item.trade} name={nom} />

          <div className="dir-quote" data-reveal>
            <div>
              <h2>{t('pro.ctaTitle')}</h2>
              <p>{t('pro.ctaText')}</p>
            </div>
            <div className="pro-quote-actions">
              <Link to={`/demande-b2b?atelier=${item.id}`} className="cta">
                {t('b2b.shopCardCta')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
              {/* Le signalement se lit sous l’action, plus discret qu’un
                  bouton : c’est un recours, pas une étape du parcours. */}
              <a className="pro-note pro-signal" href={signalHref} title={t('pro.signalHint')}>
                <i className="ri-flag-line" aria-hidden="true"></i>
                <span>{t('pro.signal')}</span>
                <em className="pro-signal-ref">{item.id}</em>
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}