import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localize, type Localized } from '@/i18n/localize';
import { nomDemo } from '@/lib/nomsDemo';
import { nomCommune } from '@/lib/communeLabels';
import { useReveal } from '@/hooks/useReveal';
import { useWriteToWorkshop } from '@/hooks/useWriteToWorkshop';
import { useSeo } from '@/hooks/useSeo';
import { nomPays, paysDe, paysTrouve } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { haversineKm, formatDistance } from '@/hooks/useGeo';
import { genreDeLivre } from '@/lib/genres';
import { decadeLabel, decadeOf, decadesWithMemory, premierePublication } from '@/lib/generation';
import { slugPays } from '@/lib/tradePages';
import { readAuteurMemory, auteurBackLink } from '@/hooks/useAuteurMemory';
import { auteurs } from '@/mocks/auteurs';
import PhotoGallery from '@/components/feature/PhotoGallery';
import AireCopyShort from '@/components/feature/AireCopyShort';
import { regionMondeDe, regionMondeLabelKey } from '@/lib/worldRegions';
import AuthorAside from './components/AuthorAside';
import AuthorGenerationExport from './components/AuthorGenerationExport';
import FicheTrail from '@/components/feature/FicheTrail';
import { breadcrumbLd, type Crumb } from '@/lib/structuredData';
import { useJsonLd } from '@/hooks/useJsonLd';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import NeighbourPens from './components/NeighbourPens';
import '@/pages/annuaire/components/trade-authors-bridge.css';
import '@/pages/entreprise/components/contact-atelier.css';

export default function AuteurProfile() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { t, lang } = useLang();
  /* Le geste d'écriture est le même que sur fiche d'atelier et sur les cartes
     de l'annuaire : un seul code, donc les trois ne peuvent pas diverger. */
  const { writeState, writeToAuthor } = useWriteToWorkshop();
  useReveal();

  const item = auteurs.find((a) => a.id === id);
  const tr = (b: Localized) => localize(b, lang);

  useSeo({
    page: 'auteur',
    path: item ? `/auteur/${item.id}` : '/annuaire?kind=auteurs',
    title: item ? `${nomDemo(item.name, lang)} — ${item.genres.map((g) => t(`genre.${g}`)).join(', ')} | PaperAtlas` : undefined,
    description: item
      ? `${nomDemo(item.name, lang)}, ${item.genres.map((g) => t(`genre.${g}`)).join(' / ')} — ${item.commune} (${item.wilaya}) : ${localize(item.bio, lang)}`.slice(0, 158)
      : undefined,
    keywords: item ? `${nomDemo(item.name, lang)}, ${item.wilaya}, ${item.books[0] ? localize(item.books[0].title, lang) : ''}, auteur` : undefined,
  });

  /* Le chemin de la fiche, écrit une seule fois : l'espace Auteurs, la page du
     métier, la page Écrivains du pays, puis la plume elle-même. Le fil affiché
     et le balisage lu par les moteurs puisent dans cette même liste, si bien
     qu'ils ne peuvent pas se contredire. */
  const filCrumbs: Crumb[] = [
    { name: t('siteMap.home'), path: '/' },
    { name: t('siteMap.authors'), path: '/annuaire?kind=auteurs' },
    { name: t('tradePlural.ecrivain'), path: '/annuaire/ecrivains' },
    ...(item && slugPays(paysDe(item))
      ? [{
          name: nomPays(paysDe(item), lang),
          path: `/annuaire/ecrivains/${slugPays(paysDe(item))}`,
        }]
      : []),
    ...(item
      ? [{ name: nomDemo(item.name, lang), path: `/auteur/${item.id}` }]
      : []),
  ];
  useJsonLd('auteur-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbLd(filCrumbs)],
  });

  if (!item) {
    return (
      <>
        <Nav variant="page" />
        <main className="page-main" id="main-content" tabIndex={-1}>
          <div className="pro-wrap pro-missing">
            <h1>{t('auth.notfound')}</h1>
            <Link to="/annuaire?kind=auteurs" className="cta">{t('auth.all')} <i className="ri-arrow-right-line" aria-hidden="true"></i></Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusKey = item.status === 'open' ? 'Open' : item.status === 'project' ? 'Project' : 'Full';
  /* Le portrait ouvre la série, puis viennent les vues du bureau et de la
     ville : un clic les agrandit toutes, avec le même compteur. */
  const galerie = [item.portrait, ...(item.photos ?? [])];

  /* Where this author sits: how busy their country and their region are, who
     writes right next to them, and who shares their literary genres. Read on
     the whole board, never on a filter. */
  const codePays = paysDe(item);
  const nomDuPays = nomPays(codePays, lang);
  /* L'aire du monde où écrit cette plume : la fiche l'annonce en deux lignes
     — son nom et ses fiches —, sans rang ni adresse de vue Carte, comme la
     fiche d'un atelier annonce la sienne. */
  const airePlume = regionMondeDe(codePays);
  const airePlumeNom = airePlume ? t(regionMondeLabelKey(airePlume)) : '';
  /* La région d'où l'on vient : la liste des plumes l'avait resserrée au moment
     d'ouvrir la fiche. Elle ne se rappelle que si elle tient bien des plumes —
     un rappel ne dit jamais un chemin qui n'a pas été pris. */
  const askedPays = (params.get('pays') ?? '').trim();
  const askedWilaya = (params.get('wilaya') ?? '').trim();
  const fromWilaya = askedWilaya && auteurs.some(
    (a) => a.wilaya === askedWilaya && (!askedPays || paysDe(a) === askedPays),
  )
    ? askedWilaya
    : '';
  /* La liste telle qu'on l'a quittée — et, sans la région, tout son pays : les
     autres filtres (genre, ordre, générations) restent en place. */
  const auteurBoardHref = (withRegion: boolean) => {
    const next = new URLSearchParams();
    next.set('kind', 'auteurs');
    if (paysTrouve(askedPays)) next.set('pays', askedPays);
    if (withRegion && fromWilaya) next.set('wilaya', fromWilaya);
    ['genre', 'sort', 'open'].forEach((key) => {
      const value = (params.get(key) ?? '').trim();
      if (value) next.set(key, value);
    });
    return `/annuaire?${next.toString()}`;
  };
  /* Le chemin inverse : la page du métier pour ce pays, où les ateliers de
     plume annoncent leurs prestations. */
  const ecrivainsPath = (() => {
    const slug = slugPays(codePays);
    return slug ? `/annuaire/ecrivains/${slug}` : '/annuaire/ecrivains';
  })();
  const memesPays = auteurs.filter((a) => paysDe(a) === codePays);
  const memesRegion = memesPays.filter((a) => a.wilaya === item.wilaya);
  const voisinsRegion = memesRegion.filter((a) => a.id !== item.id);
  const kmDe = (a: (typeof auteurs)[number]) => haversineKm(
    { lat: item.lat, lng: item.lng },
    { lat: a.lat, lng: a.lng },
  );
  const proches = (voisinsRegion.length ? voisinsRegion : memesPays.filter((a) => a.id !== item.id))
    .map((a) => ({ a, km: kmDe(a) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, 3);
  /* A neighbour of the same genre: any author sharing at least one of the
     genres carried on this sheet, the closest pen first. */
  const memesGenre = auteurs.filter((a) => a.genres.some((g) => item.genres.includes(g)));
  const voisinsGenre = memesGenre
    .filter((a) => a.id !== item.id)
    .map((a) => ({ a, km: kmDe(a), genres: a.genres.filter((g) => item.genres.includes(g)) }))
    .sort((x, y) => x.km - y.km)
    .slice(0, 3);
  /* The generation this pen belongs to: the decade of the first publication —
     the earliest book on the shelf — and the pens that started publishing in
     the very same ten years, wherever they stand. */
  const generation = decadeOf(premierePublication(item));
  const generationLabel = decadeLabel(generation);
  /* The decade of this pen joins the ones already remembered, so the two
     generations being read stay open when the visitor returns to the list. */
  const openWithMemory = decadesWithMemory(generation, readAuteurMemory().open);
  const backLink = auteurBackLink();
  const memesGeneration = auteurs.filter((a) => decadeOf(premierePublication(a)) === generation);
  /* The genre door of the directory: the first genre written on this sheet. */
  const genrePorte = item.genres[0] ?? '';

  /* The shelf read genre by genre: how many books each label carries, the
     fullest first, the ones the directory can filter on before the others. */
  const livresParGenre = (() => {
    const map = new Map<string, { cle: string; label: Localized; count: number }>();
    item.books.forEach((book) => {
      const cle = genreDeLivre(localize(book.genre, lang), t);
      const id = cle || `libre:${book.genre.fr}`;
      const row = map.get(id);
      if (row) row.count += 1;
      else map.set(id, { cle, label: book.genre, count: 1 });
    });
    return Array.from(map.entries())
      .map(([id, row]) => ({ id, ...row }))
      .sort((a, b) => Number(Boolean(b.cle)) - Number(Boolean(a.cle))
        || b.count - a.count
        || tr(a.label).localeCompare(tr(b.label), 'fr'));
  })();

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <div className="pro-wrap">
          {/* Le fil d'Ariane relie la plume à l'espace Auteurs et à la page
              Écrivains de son pays : chaque maillon remonte d'un cran, et la
              liste est la même que celle déclarée aux moteurs. */}
          <FicheTrail crumbs={filCrumbs} />

          <Link to={backLink} className="back-link">
            <i className="ri-arrow-left-line" aria-hidden="true"></i>{t('auth.back')}
          </Link>

          {/* La région d'où l'on vient, rappelée comme sur la fiche d'un atelier
              et celle d'un candidat : sa porte rend la liste resserrée, celle
              d'à côté rend le pays entier — la région seule tombe. */}
          {fromWilaya && (
            <p className="pro-from pro-from-region">
              <i className="ri-map-pin-2-line" aria-hidden="true"></i>
              <span>{t('auth.fromRegion').replace('{region}', nomRegion(fromWilaya, lang))}</span>
              <Link to={auteurBoardHref(true)} className="board-trip-go">
                <i className="ri-arrow-left-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('auth.backRegion')}</span>
              </Link>
              <Link
                to={auteurBoardHref(false)}
                className="board-trip-go board-trip-go--all"
                title={t('auth.allCountryHint')}
              >
                <i className="ri-global-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('tradePage.allCountry')}</span>
              </Link>
            </p>
          )}

          {/* Le même relevé que sur la fiche d'un atelier, d'un candidat ou
              d'une annonce : la plume dit elle aussi d'où l'on vient, et
              chaque porte donne son compte avant le clic. */}
          <RegionWalk doorCounts />

          {/* Le plan du site, où cette plume est nommée dans sa liste : le
              plan s'ouvre sur sa ligne, déjà surlignée. */}
          <Link
            className="pro-plan-link"
            to={`/plan-du-site#fiche-${item.id}`}
            title={t('pro.sitemapHint')}
          >
            <i className="ri-list-check-2" aria-hidden="true"></i>
            <span>{t('pro.sitemapLink')}</span>
          </Link>

          <header className="pro-head auth-head" data-reveal>
            <img
              className="auth-portrait"
              src={item.portrait}
              alt={nomDemo(item.name, lang)}
              title={`${nomDemo(item.name, lang)} — ${t('dir.kindAuthors')} ${item.wilaya}`}
              width={800}
              height={800}
            />
            <div className="pro-ident">
              <p className="stamp">{item.genres.map((g) => t(`genre.${g}`)).join(' · ')} · {nomRegion(item.wilaya, lang)} · {nomPays(paysDe(item), lang)}</p>
              <h1>{nomDemo(item.name, lang)}</h1>
              <p className="pro-meta">
                <span className="auth-avail" data-state={item.status}>
                  <i className="ri-calendar-check-line" aria-hidden="true"></i>{t(`auth.status${statusKey}`)}
                </span>
                <Link
                  className="pro-gen"
                  to={`/annuaire?kind=auteurs&open=${openWithMemory}`}
                  title={t('auth.genOpen')}
                >
                  {t('auth.since')} {item.since}
                </Link>
                <span>{item.books.length} {t('auth.worksCount')}</span>
                <span>{t('pro.based')} {nomCommune(item.commune, lang)}</span>
                <span className="pro-country">
                  <i className="ri-global-line" aria-hidden="true"></i>
                  {nomPays(paysDe(item), lang)}
                </span>
              </p>
              <div className="chip-row">
                {item.languages.map((l) => <span key={l}>{l}</span>)}
              </div>
              {/* Le retour vers la page du métier : la fiche d'une plume et la
                  page Écrivains se lisent comme les deux faces d'un même
                  métier, pour le lecteur comme pour le moteur de recherche. */}
              <Link className="dir-bridge-link" to={ecrivainsPath}>
                <i className="ri-quill-pen-line" aria-hidden="true"></i>
                {t('tradeAuthors.profileLink')} · {nomDuPays}
              </Link>
              {/* Le geste court de l'aire, le même que sur la fiche d'un
                  atelier : deux lignes qui annoncent l'aire où écrit la plume,
                  ses pays nommés un à un au survol, et le compte des copies
                  de cette aire sous le geste. */}
              {airePlume && (
                <AireCopyShort
                  region={airePlume}
                  label={t('cmaps.plumeAireCopy')}
                  hintLead={t('cmaps.plumeAireCopyHint')
                    .replace('{plume}', nomDemo(item.name, lang))
                    .replace('{region}', airePlumeNom)}
                  line={t('cmaps.plumeAireCopyLine')
                    .replace('{plume}', nomDemo(item.name, lang))}
                />
              )}
            </div>
            <div className="pro-head-side">
              <div className="pro-head-actions">
                <button
                  type="button"
                  className="pro-write"
                  onClick={() => void writeToAuthor(item.id, item.name)}
                  disabled={writeState === 'busy'}
                  title={t('auth.writeHint')}
                >
                  <i
                    className={writeState === 'busy' ? 'ri-loader-4-line is-spin' : 'ri-chat-3-line'}
                    aria-hidden="true"
                  ></i>
                  <span className="whitespace-nowrap">
                    {writeState === 'busy' ? t('pro.writing') : t('auth.write')}
                  </span>
                </button>
                <a className="cta pro-head-cta" href={`mailto:${item.email}?subject=${encodeURIComponent(`Collaboration — ${nomDemo(item.name, lang)}`)}`}>
                  {t('auth.propose')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </a>
              </div>
              {writeState === 'none' && (
                <p className="pro-write-note">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('auth.writeNone')}
                </p>
              )}
              {writeState === 'self' && (
                <p className="pro-write-note">
                  <i className="ri-user-line" aria-hidden="true"></i>
                  {t('auth.writeSelf')}
                </p>
              )}
              {writeState === 'error' && (
                <p className="pro-write-note is-err" role="alert">
                  <i className="ri-error-warning-line" aria-hidden="true"></i>
                  {t('auth.writeError')}
                </p>
              )}
            </div>
          </header>

          <figure className="auth-quote" data-reveal>
            <i className="ri-double-quotes-l" aria-hidden="true"></i>
            <blockquote>{tr(item.reading)}</blockquote>
            <figcaption>{t('auth.reading')} · {nomDemo(item.name, lang)}</figcaption>
          </figure>

          {/* The same neighbourhood block as a workshop sheet, read on literary
              genres: how many authors share this country and this region, who
              writes nearby, and who writes in the same genres. */}
          <section className="pro-card pro-hood" data-reveal>
            <h2 className="pro-h">{t('auth.hoodTitle')}</h2>
            <div className="pro-hood-stats">
              <Link className="pro-hood-stat" to={`/annuaire?kind=auteurs&pays=${codePays}`}>
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
                to={`/annuaire?kind=auteurs&pays=${codePays}&wilaya=${encodeURIComponent(item.wilaya)}`}
              >
                <span className="pro-hood-ico"><i className="ri-map-pin-2-line" aria-hidden="true"></i></span>
                <span className="pro-hood-body">
                  <span className="pro-hood-num">{memesRegion.length}</span>
                  <span className="pro-hood-lab">{t('pro.hoodRegion')}</span>
                  <span className="pro-hood-where">{nomRegion(item.wilaya, lang)}</span>
                </span>
                <i className="ri-arrow-right-line pro-hood-go" aria-hidden="true"></i>
              </Link>
              {/* The decade of the first publication: the pens that started
                  publishing in the very same ten years. */}
              <Link
                className="pro-hood-stat"
                to={`/annuaire?kind=auteurs&open=${openWithMemory}`}
                title={t('auth.genOpen')}
              >
                <span className="pro-hood-ico"><i className="ri-calendar-event-line" aria-hidden="true"></i></span>
                <span className="pro-hood-body">
                  <span className="pro-hood-num">{memesGeneration.length}</span>
                  <span className="pro-hood-lab">{t('auth.hoodGeneration')}</span>
                  <span className="pro-hood-where">{generationLabel}</span>
                </span>
                <i className="ri-arrow-right-line pro-hood-go" aria-hidden="true"></i>
              </Link>
            </div>

            {/* The generation, handed over as a file: the pens of these ten
                years, country by country. */}
            <div className="pro-hood-export">
              <span className="pro-hood-export-lab">
                <i className="ri-calendar-2-line" aria-hidden="true"></i>
                {t('auth.genExportTitle')} · <b>{generationLabel}</b>
                <span>· {memesGeneration.length} {t('gtally.profiles')}</span>
              </span>
              <AuthorGenerationExport decade={generation} label={generationLabel} />
            </div>

            {proches.length > 0 ? (
              <div className="pro-hood-near">
                <p className="pro-hood-near-lab">
                  <i className={voisinsRegion.length ? 'ri-team-line' : 'ri-road-map-line'} aria-hidden="true"></i>
                  {voisinsRegion.length ? t('pro.hoodNeighbours') : t('pro.hoodClose')}
                </p>
                <ul className="pro-hood-list">
                  {proches.map(({ a, km }) => (
                    <li key={a.id}>
                      <Link to={`/auteur/${a.id}`} className="pro-hood-link">
                        <span className="pro-hood-link-txt">
                          <span className="pro-hood-name">{a.name}</span>
                          <span className="pro-hood-meta">
                            {nomCommune(a.commune, lang)} · {nomRegion(a.wilaya, lang)} · {formatDistance(km, lang)}
                          </span>
                        </span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="pro-hood-alone">
                <i className="ri-information-line" aria-hidden="true"></i>
                {t('pro.hoodAlone')}
              </p>
            )}

            <div className="pro-hood-near">
              <p className="pro-hood-near-lab">
                <i className="ri-quill-pen-line" aria-hidden="true"></i>
                {t('auth.hoodGenre')} · {item.genres.map((g) => t(`genre.${g}`)).join(' · ')}
                {memesGenre.length > 1 && <span className="pro-hood-near-num">{memesGenre.length}</span>}
              </p>
              {voisinsGenre.length > 0 ? (
                <ul className="pro-hood-list">
                  {voisinsGenre.map(({ a, km, genres }) => (
                    <li key={a.id}>
                      <Link to={`/auteur/${a.id}`} className="pro-hood-link">
                        <span className="pro-hood-link-txt">
                          <span className="pro-hood-name">{a.name}</span>
                          <span className="pro-hood-meta">
                            {genres.map((g) => t(`genre.${g}`)).join(' · ')} · {nomCommune(a.commune, lang)} · {formatDistance(km, lang)}
                          </span>
                        </span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pro-hood-alone">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('auth.hoodGenreAlone')}
                </p>
              )}
              {genrePorte && (
                <Link className="pro-hood-more" to={`/annuaire?kind=auteurs&genre=${genrePorte}`}>
                  {t('auth.hoodGenreAll')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              )}
            </div>
          </section>

          <div className="pro-grid">
            <div className="pro-main">
              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('auth.photos')}</h2>
                <PhotoGallery
                  photos={galerie}
                  nom={nomDemo(item.name, lang)}
                  wilaya={`${nomCommune(item.commune, lang)} · ${nomRegion(item.wilaya, lang)}`}
                  label={t('auth.photos')}
                />
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('auth.bio')}</h2>
                <p className="pro-text">{tr(item.bio)}</p>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('auth.works')}</h2>

                {/* The shelf told genre by genre: each counter is a door into
                    the author list already filtered on that genre. */}
                {livresParGenre.length > 0 && (
                  <div className="auth-gtally">
                    <p className="auth-gtally-lab">
                      <i className="ri-bar-chart-2-line" aria-hidden="true"></i>
                      {t('auth.genreTally')}
                      <em className="auth-gtally-num">{item.books.length}</em>
                    </p>
                    <ul className="auth-gtally-list">
                      {livresParGenre.map(({ id, cle, label, count }) => (
                        <li key={id}>
                          {cle ? (
                            <Link
                              className="auth-gtally-chip is-link"
                              to={`/annuaire?kind=auteurs&genre=${cle}`}
                              title={`${t('auth.genreTallyHint')} — ${t('auth.genreTallyShare')}`}
                            >
                              <span>{tr(label)}</span>
                              <b>{count}</b>
                              <i className="ri-arrow-right-line" aria-hidden="true"></i>
                            </Link>
                          ) : (
                            <span className="auth-gtally-chip" title={t('auth.genreTallyFree')}>
                              <span>{tr(label)}</span>
                              <b>{count}</b>
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="book-grid">
                  {item.books.map((b) => (
                    <article className="book" key={`${b.title.fr}-${b.year}`}>
                      <div className="book-cover">
                        <span>{b.year}</span>
                        <strong>{tr(b.title)}</strong>
                        <span>{tr(b.genre)}</span>
                      </div>
                      <p className="book-meta">
                        <strong>{tr(b.title)}</strong>
                        <span>{nomDemo(b.publisher, lang)} · {b.pages} {t('auth.pages')}</span>
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('auth.services')}</h2>
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
                <h2 className="pro-h">{t('auth.awards')}</h2>
                <ul className="certs certs--lg">
                  {item.awards.map((a) => (
                    <li key={a.fr}><i className="ri-award-line" aria-hidden="true"></i>{tr(a)}</li>
                  ))}
                </ul>
              </section>
            </div>

            <AuthorAside item={item} />
          </div>

          {/* Sous la fiche, les trois plumes voisines du même pays, comme les
              familles voisines d'un atelier : le réseau se lit plume après
              plume, sans revenir aux filtres. */}
          <NeighbourPens pays={codePays} selfId={item.id} region={item.wilaya} name={nomDemo(item.name, lang)} />

          <div className="dir-quote" data-reveal>
            <div>
              <h2>{t('auth.ctaTitle')}</h2>
              <p>{t('auth.ctaText')}</p>
            </div>
            <a href={`mailto:${item.email}`} className="cta">{t('auth.propose')} <i className="ri-arrow-right-line" aria-hidden="true"></i></a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}