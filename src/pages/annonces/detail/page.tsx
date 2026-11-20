import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { useSeo } from '@/hooks/useSeo';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useReveal } from '@/hooks/useReveal';
import { annonces, type Annonce } from '@/mocks/annonces';
import { useListingById } from '@/hooks/useListings';
import { annonceReferenceFor, markOf, toAnnonce } from '@/lib/listings';
import { deviseCode, nomPays, paysDe, paysTrouve } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { prixDevise } from '@/lib/price';
import { nomDemo } from '@/lib/nomsDemo';
import { CAT_KEY } from '@/pages/annonces/components/AnnonceCard';
import CopyLinkButton from '@/components/feature/CopyLinkButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import BoardFromCount from '@/components/feature/BoardFromCount';
import PhotoGallery from '@/components/feature/PhotoGallery';
import PlaceMap from '@/components/feature/PlaceMap';
import FicheTrail from '@/components/feature/FicheTrail';
import PoseRestante from '@/components/feature/PoseRestante';
import { RADIUS_STEPS } from '@/lib/boardRadiusMemory';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import { buildSheetText } from '@/lib/sheetText';
import { breadcrumbLd, type Crumb } from '@/lib/structuredData';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pulls the first number out of “6 800 000 DA” / “45 DA / m²”; null on “Sur devis”. */
function priceValue(price: string): number | null {
  const digits = price.replace(/[^\d]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export default function AnnonceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  useReveal();

  /* Le rayon du tableau d'où l'on vient : il revient avec la liste, pour que
     la porte de retour rouvre le tableau resserré et non le tableau entier. */
  const [params] = useSearchParams();
  const rawRayon = Number(params.get('rayon'));
  const keptRayon = (RADIUS_STEPS as readonly number[]).includes(rawRayon) ? rawRayon : 0;
  const keptSort = params.get('sort') ?? '';
  /* La lettre de l'index d'où l'on vient : elle ne désigne un point que dans
     l'ordre alphabétique, et ne se rappelle que là. */
  const keptLettre = (params.get('lettre') ?? '').trim().charAt(0).toUpperCase();
  const fromLetter = keptSort === 'name' ? keptLettre : '';
  /* L'étendue du tableau d'où l'on vient : le texte copié l'annonce, pour que
     le destinataire sache à quoi il s'ouvre au lieu de le découvrir. */
  const rawRows = Number(params.get('n'));
  const boardRows = Number.isFinite(rawRows) && rawRows > 0 ? Math.floor(rawRows) : 0;

  /* La région et le pays du tableau d'où l'on vient : la fiche les reprend
     pour rendre la liste telle qu'on l'a quittée, et pour offrir la porte du
     pays entier sans reposer la région. */
  const askedPays = (params.get('pays') ?? '').trim();
  const keptPays = paysTrouve(askedPays) ? askedPays : '';
  const keptWilaya = keptPays ? (params.get('wilaya') ?? '').trim() : '';

  /* Le tableau tel qu'on l'a quitté — et, sans la région, tout son pays. */
  const boardHref = (withRegion: boolean) => {
    const next = new URLSearchParams();
    if (keptPays) next.set('pays', keptPays);
    if (withRegion && keptWilaya) next.set('wilaya', keptWilaya);
    if (keptSort) next.set('sort', keptSort);
    if (keptRayon) next.set('rayon', String(keptRayon));
    if (fromLetter) next.set('lettre', fromLetter);
    const query = next.toString();
    return `/annonces${query ? `?${query}` : ''}`;
  };
  const backHref = boardHref(true);
  /* La porte du pays entier : le tableau garde son pays, sa recherche et son
     ordre, et rend seulement la région. */
  const countryHref = boardHref(false);

  const { row, loading: rowLoading } = useListingById(id);

  const item: Annonce | undefined = useMemo(() => {
    const fromStock = annonces.find((a) => a.id === id);
    if (fromStock) return fromStock;
    if (row && row.kind === 'annonce') return toAnnonce(row);
    return undefined;
  }, [id, row]);

  const title = item ? localize(item.title, lang) : '';
  const body = item ? localize(item.body, lang) : '';
  const seller = item ? nomDemo(item.seller, lang) : '';
  const ref = item ? annonceReferenceFor(item.id) : '';
  const paysNom = item ? nomPays(paysDe(item), lang) : '';
  const paysCode = item ? paysDe(item) : 'DZ';
  /* Every figure on the sheet speaks the money of its own country. */
  const prix = item ? prixDevise(item.price, paysCode) : '';

  useSeo({
    page: 'annonces',
    path: `/annonces/${id ?? ''}`,
    title: item ? `${title} — ${seller} | PaperAtlas` : undefined,
    description: item
      ? `${body} ${prix} · ${nomCommune(item.commune, lang)}, ${item.wilaya}.`
      : undefined,
    keywords: item
      ? [title, seller, t(CAT_KEY[item.cat]), item.wilaya, paysNom, 'annonce'].join(', ')
      : undefined,
  });

  const productLd = useMemo(() => {
    if (!item) return null;
    const value = priceValue(item.price);
    const url = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}/annonces/${item.id}`;
    return {
      '@type': 'Product',
      name: localize(item.title, lang),
      description: localize(item.body, lang),
      category: t(CAT_KEY[item.cat]),
      sku: ref,
      brand: { '@type': 'Organization', name: seller },
      areaServed: `${nomCommune(item.commune, lang)}, ${item.wilaya}, ${paysCode}`,
      url,
      ...(value
        ? {
            offers: {
              '@type': 'Offer',
              priceCurrency: deviseCode(paysCode),
              price: value,
              availability: 'https://schema.org/InStock',
              seller: { '@type': 'Organization', name: seller },
              areaServed: `${nomCommune(item.commune, lang)}, ${item.wilaya}, ${paysCode}`,
              url,
            },
          }
        : {}),
    };
  }, [item, lang, ref, t, seller]);

  /* Le chemin de la fiche, écrit une seule fois : l'accueil, le tableau des
     annonces, puis cette annonce. Le fil affiché et le balisage lu par les
     moteurs puisent dans la même liste, si bien qu'ils ne peuvent pas se
     contredire. */
  const filCrumbs: Crumb[] = useMemo(() => [
    { name: t('siteMap.home'), path: '/' },
    { name: t('ann.allAds'), path: '/annonces' },
    ...(item
      ? [{ name: localize(item.title, lang), path: `/annonces/${item.id}` }]
      : []),
  ], [item, lang, t]);

  useJsonLd('annonce-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbLd(filCrumbs),
      ...(productLd ? [productLd] : []),
    ],
  });

  if (!item) {
    return (
      <>
        <Nav variant="page" />
        <main className="page-main" id="main-content" tabIndex={-1}>
          <div className="pro-wrap pro-missing">
            {rowLoading ? (
              <p className="acct-loading">
                <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
                {t('acct.loading')}
              </p>
            ) : (
              <>
                <h1>{t('ann.notfound')}</h1>
                <Link to="/annonces" className="cta">
                  {t('ann.allAds')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const locale = localeFor(lang);
  const datePosted = new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(item.posted));
  const mailSubject = encodeURIComponent(`${t('ann.contact')} — ${title} (${ref})`);
  const mailHref = `mailto:${item.contact}?subject=${mailSubject}`;
  const phoneHref = item.phone ? `tel:${item.phone.replace(/\s+/g, '')}` : '';

  /* « Signaler cette annonce » : un message déjà adressé à l'équipe, la
     référence et le titre de cette annonce déjà cités, avec son adresse. Rien
     ne part tant que le visiteur ne l'envoie pas lui-même. */
  const signalPage = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}/annonces/${item.id}`;
  const signalHref = `mailto:contact@paperatlas-dz.com?subject=${encodeURIComponent(
    `${t('ann.signalSubject')} · ${ref}`,
  )}&body=${encodeURIComponent(
    t('ann.signalBody')
      .replace('{ref}', ref)
      .replace('{title}', title)
      .replace('{url}', signalPage),
  )}`;

  const similar = annonces
    .filter((a) => a.id !== item.id && (a.cat === item.cat || a.wilaya === item.wilaya))
    .slice(0, 3);

  /* L'annonce en texte : de quoi la citer dans un e-mail, avec l'adresse de
     la fiche et celle du tableau — et la lettre où l'on se tenait, pour que
     le destinataire y retrouve le même point de la liste. */
  const sheetText = () => {
    const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    const board = new URL(`${base}${backHref}`);
    board.searchParams.set('lang', lang);
    const place = `${item.commune ? `${nomCommune(item.commune, lang)}, ` : ''}${nomRegion(item.wilaya, lang)}`;
    return buildSheetText({
      lines: [
        title,
        `${t('ann.seller')} : ${seller}`,
        `${t('ann.price')} : ${prix}`,
        `${t('ann.category')} : ${t(CAT_KEY[item.cat])}`,
        `${t('jobd.place')} : ${place}`,
        `${t('jobd.ref')} : ${ref}`,
      ],
      sheetLabel: t('ann.copySheet'),
      sheetUrl: window.location.href,
      boardLabel: t('ann.copyBoard'),
      boardUrl: board.toString(),
      rowsLabel: t('ann.copyRows'),
      rows: boardRows,
      letterLabel: t('ann.copyLetter'),
      letter: fromLetter,
    });
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <div className="pro-wrap">
          {/* Le chemin de la fiche : le lecteur arrivé d'un résultat de
              recherche voit où il se tient, et chaque maillon remonte d'un
              cran — le tableau des annonces, puis l'accueil. */}
          <FicheTrail crumbs={filCrumbs} />

          <Link to={backHref} className="back-link">
            <i className="ri-arrow-left-line" aria-hidden="true"></i>
            {t('ann.back')}
          </Link>

          {/* Le rayon et la lettre d'où l'on vient : deux rappels de lecture,
              chacun rendant le tableau au même point — le périmètre resserré,
              et la place tenue dans l'ordre alphabétique. */}
          {(keptRayon > 0 || fromLetter || !!keptWilaya || boardRows > 0) && (
            <div className="board-fromrow">
              {/* Le compte du tableau d'où l'on vient : un rappel de lecture, plus
                  discret que le périmètre, comme sur la fiche d'un candidat.
                  Son survol dit de quoi il est fait — les lignes, le pays et
                  la région —, et son clic rouvre le tableau au même périmètre. */}
              {boardRows > 0 && (
                <BoardFromCount
                  rows={boardRows}
                  href={backHref}
                  pays={keptPays}
                  wilaya={keptWilaya}
                  className="board-fromradius board-fromcount"
                />
              )}
              {keptRayon > 0 && (
                <p className="board-fromradius">
                  <i className="ri-focus-3-line" aria-hidden="true"></i>
                  <span>{t('ann.fromRadius').replace('{km}', String(keptRayon))}</span>
                  <Link to={backHref} className="board-trip-go">
                    <i className="ri-arrow-left-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ann.backRadius')}</span>
                  </Link>
                </p>
              )}
              {fromLetter && (
                <p className="board-fromradius board-fromletter">
                  <i className="ri-list-ordered" aria-hidden="true"></i>
                  <span>{t('ann.fromLetter').replace('{letter}', fromLetter)}</span>
                  {/* La porte ne double celle du rayon que si elle manque :
                      sans rayon, c'est elle qui ramène au tableau. */}
                  {keptRayon === 0 && (
                    <Link to={backHref} className="board-trip-go">
                      <i className="ri-arrow-left-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('ann.backLetter')}</span>
                    </Link>
                  )}
                </p>
              )}

              {/* La région d'où l'on vient, comme sur la fiche d'un atelier :
                  sa porte rend la région, et celle d'à côté rend le pays
                  entier — le tableau garde son pays, sa recherche et son
                  ordre, et ne rend que la ville. */}
              {keptWilaya && (
                <p className="board-fromradius board-fromregion">
                  <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                  <span>
                    {t('ann.fromRegion').replace('{region}', nomRegion(keptWilaya, lang))}
                  </span>
                  <Link to={backHref} className="board-trip-go">
                    <i className="ri-arrow-left-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('ann.backRegion')}</span>
                  </Link>
                  {keptPays && (
                    <Link
                      to={countryHref}
                      className="board-trip-go board-trip-go--all"
                      title={t('ann.allCountryHint')}
                    >
                      <i className="ri-global-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('tradePage.allCountry')}</span>
                    </Link>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Le parcours de l'annuaire, à côté du rayon rappelé : une annonce
              prise dans le tableau dit elle aussi d'où l'on vient. Chaque
              porte y donne son compte, et celle qui ne mène plus à rien se
              repère avant le clic, comme sur la page de suivi. */}
          <RegionWalk doorCounts />

          <header className="pro-head" data-reveal>
            <span className="pro-logo" aria-hidden="true">{markOf(seller)}</span>
            <div className="pro-ident">
              <p className="stamp">
                {t(CAT_KEY[item.cat])} · {paysNom} · {nomRegion(item.wilaya, lang)} ·{' '}
                {/* The reference is a code, not a word: kept in one run so
                    Arabic reading cannot split it mid-figure. */}
                <span className="jobd-code">{ref}</span>
              </p>
              <h1>{title}</h1>
              <p className="pro-meta">
                <span><i className="ri-store-2-line" aria-hidden="true"></i> {seller}</span>
                <span className="pro-pays"><i className="ri-global-line" aria-hidden="true"></i> {paysNom}</span>
                <span><i className="ri-map-pin-line" aria-hidden="true"></i> {nomCommune(item.commune, lang)}, {nomRegion(item.wilaya, lang)}</span>
                <span><i className="ri-calendar-line" aria-hidden="true"></i> {t('ann.posted')} {datePosted}</span>
              </p>
              {/* Le repère de pose : les seules clés de la fiche d’annonce
                  (`ann.`), et ce qu’il en reste à poser en arabe et en anglais.
                  Une fiche complète n’affiche rien. */}
              <PoseRestante fichier="dict.ts" prefixes={['ann.']} />
            </div>
            <div className="pro-head-cta pro-head-actions">
              <CopyTextButton
                build={sheetText}
                label={t('ann.copyText')}
                hint={t('ann.copyTextHint')}
                className="ad-btn"
              />
              <CopyLinkButton label={t('ann.share')} className="ad-btn" />
              <a className="cta" href={mailHref}>
                {t('ann.contact')} <i className="ri-mail-send-line" aria-hidden="true"></i>
              </a>
            </div>
          </header>

          <div className="pro-grid">
            <div className="pro-main">
              {item.photos && item.photos.length > 0 && (
                <section className="pro-card" data-reveal>
                  <h2 className="pro-h">{t('ann.photos')}</h2>
                  <PhotoGallery
                    photos={item.photos}
                    nom={seller}
                    wilaya={`${nomCommune(item.commune, lang)} · ${nomRegion(item.wilaya, lang)}`}
                    label={t('ann.photos')}
                  />
                </section>
              )}

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('ann.descTitle')}</h2>
                <p className="pro-text">{body}</p>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('ann.seller')}</h2>
                <p className="pro-text">{seller}</p>
                <ul className="pro-contact">
                  <li>
                    <i className="ri-mail-line" aria-hidden="true"></i>
                    <a href={mailHref}>{item.contact}</a>
                  </li>
                  {item.phone && (
                    <li>
                      <i className="ri-phone-line" aria-hidden="true"></i>
                      <a href={phoneHref}>{item.phone}</a>
                    </li>
                  )}
                  <li>
                    <i className="ri-map-pin-line" aria-hidden="true"></i>
                    <span>{item.commune ? `${nomCommune(item.commune, lang)}, ` : ''}{nomRegion(item.wilaya, lang)}</span>
                  </li>
                </ul>
                <p className="pro-note">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('ann.contactNote')}
                </p>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('ann.contactTitle')}</h2>
                <p className="pro-text">{t('ann.contactText')}</p>
                <div className="annd-cta">
                  <a className="cta" href={mailHref}>
                    {t('ann.contact')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </a>
                  {phoneHref && (
                    <a className="ad-btn" href={phoneHref}>
                      <i className="ri-phone-line" aria-hidden="true"></i>
                      {t('ann.call')}
                    </a>
                  )}
                  <CopyLinkButton label={t('ann.share')} className="ad-btn" />
                </div>
                {/* Le signalement se lit sous les actions, plus discret qu'un
                    bouton : c'est un recours, pas une étape du parcours. */}
                <a className="pro-note pro-signal" href={signalHref} title={t('ann.signalHint')}>
                  <i className="ri-flag-line" aria-hidden="true"></i>
                  <span>{t('ann.signal')}</span>
                </a>
              </section>
            </div>

            <aside className="pro-side">
              <section className="pro-card pro-sticky" data-reveal>
                <h2 className="pro-h">{t('ann.brief')}</h2>
                <dl className="jobd-facts">
                  <div>
                    <dt>{t('ann.price')}</dt>
                    <dd className="jobd-strong">{prix}</dd>
                  </div>
                  <div>
                    <dt>{t('ann.category')}</dt>
                    <dd>{t(CAT_KEY[item.cat])}</dd>
                  </div>
                  <div>
                    <dt>{t('ann.seller')}</dt>
                    <dd>{seller}</dd>
                  </div>
                  <div>
                    <dt>{t('pays.label')}</dt>
                    <dd className="pro-pays-cell">{paysNom}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.place')}</dt>
                    <dd>{item.commune ? `${nomCommune(item.commune, lang)}, ` : ''}{nomRegion(item.wilaya, lang)}</dd>
                  </div>
                  <div>
                    <dt>{t('ann.posted')}</dt>
                    <dd>{datePosted}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.ref')}</dt>
                    <dd>{ref}</dd>
                  </div>
                </dl>
                <a className="cta cta--block" href={mailHref}>
                  {t('ann.contact')} <i className="ri-mail-send-line" aria-hidden="true"></i>
                </a>
                <p className="pro-note">
                  <i className="ri-shield-check-line" aria-hidden="true"></i>
                  {t('ann.dealNote')}
                </p>
              </section>

              {/* Le plan de la commune de la marchandise : le même que sur
                  l'offre d'emploi, avec l'itinéraire depuis la position. */}
              <PlaceMap
                commune={item.commune}
                wilaya={item.wilaya}
                pays={paysCode}
                entreprise={seller}
                lat={item.lat}
                lng={item.lng}
                title={t('ann.mapCard')}
                note={t('ann.mapNote')}
              />

              {similar.length > 0 && (
                <section className="pro-card" data-reveal>
                  <h2 className="pro-h">{t('ann.similar')}</h2>
                  <ul className="jobd-similar">
                    {similar.map((ad) => (
                      <li key={ad.id}>
                        <Link to={`/annonces/${ad.id}`}>
                          <strong>{localize(ad.title, lang)}</strong>
                          <span>{prixDevise(ad.price, ad.pays)} · {nomRegion(ad.wilaya, lang)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to="/annonces" className="pro-note jobd-all">
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    {t('ann.allAds')}
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}