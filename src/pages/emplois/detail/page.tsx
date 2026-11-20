import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localize, localeFor } from '@/i18n/localize';
import { useSeo } from '@/hooks/useSeo';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useReveal } from '@/hooks/useReveal';
import { emplois, type Contract, type Emploi } from '@/mocks/emplois';
import { emploiDetails, type EmploiDetail } from '@/mocks/emploisDetail';
import { useListingById } from '@/hooks/useListings';
import { referenceFor, toEmploi, validThroughFrom } from '@/lib/listings';
import { deviseCode, nomPays, paysDe, paysTrouve } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { prixDevise } from '@/lib/price';
import { CONTRACT_KEY } from '@/pages/emplois/components/JobCard';
import CopyLinkButton from '@/components/feature/CopyLinkButton';
import CopyTextButton from '@/components/feature/CopyTextButton';
import BoardFromCount from '@/components/feature/BoardFromCount';
import PoseRestante from '@/components/feature/PoseRestante';
import ApplyDialog from '@/pages/emplois/components/ApplyDialog';
import JobRefShare from '@/pages/emplois/components/JobRefShare';
import FicheTrail from '@/components/feature/FicheTrail';
import PlaceMap from '@/components/feature/PlaceMap';
import { RADIUS_STEPS } from '@/lib/boardRadiusMemory';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import { buildSheetText } from '@/lib/sheetText';
import { breadcrumbLd, type Crumb } from '@/lib/structuredData';

/** Google expects a schema.org employment type, not our internal contract code. */
const EMPLOYMENT_TYPE: Record<Contract, string> = {
  cdi: 'FULL_TIME',
  cdd: 'TEMPORARY',
  stage: 'INTERN',
  freelance: 'CONTRACTOR',
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Pulls the first number out of “95 000 DA” / “85 000 DA + primes”; null on “Sur devis”. */
function monthlyValue(salary: string): number | null {
  const digits = salary.replace(/[^\d]/g, '');
  if (!digits) return null;
  const value = Number(digits);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export default function EmploiDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  useReveal();

  const { row, loading: rowLoading } = useListingById(id);
  const [params] = useSearchParams();
  const [applyOpen, setApplyOpen] = useState(() => params.get('apply') === '1');
  /* A reference handed over in a message: the sheet greets it instead of making
     the candidate hunt for it in the facts column. */
  const sharedRef = params.get('ref');

  /* Le rayon du tableau d'où l'on vient : il revient avec la liste, pour que
     la porte de retour rouvre les offres resserrées et non le tableau entier. */
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
    return `/emplois${query ? `?${query}` : ''}`;
  };
  const backHref = boardHref(true);
  /* La porte du pays entier : le tableau garde son pays, sa recherche et son
     ordre, et rend seulement la région. */
  const countryHref = boardHref(false);

  const item: Emploi | undefined = useMemo(() => {
    const fromStock = emplois.find((j) => j.id === id);
    if (fromStock) return fromStock;
    return row ? toEmploi(row) : undefined;
  }, [id, row]);

  /** Deposits carry no editorial sheet, so we build a sober one from their own fields. */
  const detail: EmploiDetail | undefined = useMemo(() => {
    if (!item) return undefined;
    const known = emploiDetails[item.id];
    if (known) return known;
    const tbd = t('jobd.tbd');
    const uniform = (value: string) => ({ fr: value, ar: value, en: value });
    const sentences = (text: string) => text
      .split(/(?<=\.)\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 6);
    return {
      ref: referenceFor(item.id),
      validThrough: validThroughFrom(item.posted),
      experience: uniform(tbd),
      hours: uniform(tbd),
      missions: {
        fr: sentences(item.summary.fr),
        ar: sentences(item.summary.ar),
        en: sentences(item.summary.en),
      },
      profile: uniform(tbd),
    };
  }, [item, t]);

  const title = item ? localize(item.title, lang) : '';
  const summary = item ? localize(item.summary, lang) : '';
  const company = item?.company ?? '';
  const paysNom = item ? nomPays(paysDe(item), lang) : '';
  const paysCode = item ? paysDe(item) : 'DZ';
  /* The salary is read in the money of the country the offer sits in. */
  const salaire = item ? prixDevise(item.salary, paysCode) : '';

  useSeo({
    page: 'emplois',
    path: `/emplois/${id ?? ''}`,
    title: item ? `${title} — ${company} | PaperAtlas` : undefined,
    description: item ? `${summary} ${nomCommune(item.commune, lang)}, ${item.wilaya}.` : undefined,
    keywords: item ? [title, company, item.wilaya, paysNom, t(CONTRACT_KEY[item.contract])].join(', ') : undefined,
  });

  const jobPosting = useMemo(() => {
    if (!item || !detail) return null;
    const missions = detail.missions[lang];
    const description = [
      `<p>${escapeHtml(localize(item.summary, lang))}</p>`,
      `<p><strong>${escapeHtml(t('jobd.missions'))}</strong></p>`,
      `<ul>${missions.map((m) => `<li>${escapeHtml(m)}</li>`).join('')}</ul>`,
      `<p><strong>${escapeHtml(t('jobd.profileTitle'))}</strong></p>`,
      `<p>${escapeHtml(localize(detail.profile, lang))}</p>`,
    ].join('');

    const value = monthlyValue(item.salary);
    return {
      '@type': 'JobPosting',
      title: localize(item.title, lang),
      description,
      identifier: {
        '@type': 'PropertyValue',
        name: item.company,
        value: detail.ref,
      },
      datePosted: item.posted,
      validThrough: `${detail.validThrough}T23:59:59+01:00`,
      employmentType: EMPLOYMENT_TYPE[item.contract],
      hiringOrganization: {
        '@type': 'Organization',
        name: item.company,
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.commune,
          addressRegion: item.wilaya,
          addressCountry: paysCode,
        },
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: item.commune,
          addressRegion: item.wilaya,
          addressCountry: paysCode,
        },
      },
      ...(value
        ? {
            baseSalary: {
              '@type': 'MonetaryAmount',
              currency: deviseCode(paysCode),
              value: {
                '@type': 'QuantitativeValue',
                value,
                unitText: 'MONTH',
              },
            },
          }
        : {}),
      industry: 'Imprimerie, édition et métiers du livre',
      directApply: true,
      url: `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}/emplois/${item.id}`,
    };
  }, [item, detail, lang, t]);

  /* Le chemin de la fiche, écrit une seule fois : l'accueil, le tableau des
     offres, puis cette offre. Le fil affiché et le balisage lu par les moteurs
     puisent dans la même liste, si bien qu'ils ne peuvent pas se contredire. */
  const filCrumbs: Crumb[] = useMemo(() => [
    { name: t('siteMap.home'), path: '/' },
    { name: t('nav.emplois'), path: '/emplois' },
    ...(item
      ? [{ name: localize(item.title, lang), path: `/emplois/${item.id}` }]
      : []),
  ], [item, lang, t]);

  useJsonLd('job-posting-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumbLd(filCrumbs),
      ...(jobPosting ? [jobPosting] : []),
    ],
  });
  if (!item || !detail) {
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
                <h1>{t('jobd.notfound')}</h1>
                <Link to="/emplois" className="cta">
                  {t('jobd.allJobs')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
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
  const dateValid = new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(detail.validThrough));

  /* « Signaler cette offre » : un message déjà adressé à l’équipe, la
     référence de l’offre et son titre déjà cités, avec l’adresse exacte de la
     fiche. Rien ne part tant que le candidat ne l’envoie pas lui-même. */
  const signalUrl = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}/emplois/${item.id}`;
  const signalHref = `mailto:contact@paperatlas.net?subject=${encodeURIComponent(
    `${t('jobd.signalSubject')} · ${detail.ref}`,
  )}&body=${encodeURIComponent(
    t('jobd.signalBody')
      .replace('{ref}', detail.ref)
      .replace('{title}', title)
      .replace('{url}', signalUrl),
  )}`;


  const similar = emplois
    .filter((j) => j.id !== item.id && (j.wilaya === item.wilaya || j.contract === item.contract))
    .slice(0, 3);

  /* L'offre en texte : de quoi la citer dans un e-mail, avec l'adresse de la
     fiche et celle du tableau — et la lettre où l'on se tenait, pour que le
     destinataire y retrouve le même point de la liste. */
  const sheetText = () => {
    const base = `${window.location.origin}${__BASE_PATH__.replace(/\/$/, '')}`;
    const board = new URL(`${base}${backHref}`);
    board.searchParams.set('lang', lang);
    return buildSheetText({
      lines: [
        title,
        `${t('jobd.company')} : ${company}`,
        `${t('jobd.contract')} : ${t(CONTRACT_KEY[item.contract])}`,
        `${t('jobd.salary')} : ${salaire}`,
        `${t('jobd.place')} : ${nomCommune(item.commune, lang)}, ${nomRegion(item.wilaya, lang)}`,
        `${t('jobd.ref')} : ${detail.ref}`,
      ],
      sheetLabel: t('jobd.copySheet'),
      sheetUrl: window.location.href,
      boardLabel: t('jobd.copyBoard'),
      boardUrl: board.toString(),
      rowsLabel: t('jobd.copyRows'),
      rows: boardRows,
      letterLabel: t('jobd.copyLetter'),
      letter: fromLetter,
    });
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <div className="pro-wrap">
          {/* Le chemin de la fiche : le candidat arrivé d'un résultat de
              recherche voit où il se tient, et chaque maillon remonte d'un
              cran — le tableau des offres, puis l'accueil. */}
          <FicheTrail crumbs={filCrumbs} />

          <Link to={backHref} className="back-link">
            <i className="ri-arrow-left-line" aria-hidden="true"></i>
            {t('jobd.back')}
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
                  <span>{t('jobd.fromRadius').replace('{km}', String(keptRayon))}</span>
                  <Link to={backHref} className="board-trip-go">
                    <i className="ri-arrow-left-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('jobd.backRadius')}</span>
                  </Link>
                </p>
              )}
              {fromLetter && (
                <p className="board-fromradius board-fromletter">
                  <i className="ri-list-ordered" aria-hidden="true"></i>
                  <span>{t('jobd.fromLetter').replace('{letter}', fromLetter)}</span>
                  {/* La porte ne double celle du rayon que si elle manque :
                      sans rayon, c'est elle qui ramène au tableau. */}
                  {keptRayon === 0 && (
                    <Link to={backHref} className="board-trip-go">
                      <i className="ri-arrow-left-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('jobd.backLetter')}</span>
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
                    {t('jobd.fromRegion').replace('{region}', nomRegion(keptWilaya, lang))}
                  </span>
                  <Link to={backHref} className="board-trip-go">
                    <i className="ri-arrow-left-line" aria-hidden="true"></i>
                    <span className="whitespace-nowrap">{t('jobd.backRegion')}</span>
                  </Link>
                  {keptPays && (
                    <Link
                      to={countryHref}
                      className="board-trip-go board-trip-go--all"
                      title={t('jobd.allCountryHint')}
                    >
                      <i className="ri-global-line" aria-hidden="true"></i>
                      <span className="whitespace-nowrap">{t('tradePage.allCountry')}</span>
                    </Link>
                  )}
                </p>
              )}
            </div>
          )}

          {/* Le parcours de l'annuaire, à côté du rayon rappelé : une offre
              prise dans le tableau dit elle aussi d'où l'on vient. Chaque
              porte y donne son compte, et celle qui ne mène plus à rien se
              repère avant le clic, comme sur la page de suivi. */}
          <RegionWalk doorCounts />

          <header className="pro-head" data-reveal>
            <span className="pro-logo" aria-hidden="true">{item.mark}</span>
            <div className="pro-ident">
              <p className="stamp">
                {t(CONTRACT_KEY[item.contract])} · {paysNom} · {nomRegion(item.wilaya, lang)} ·{' '}
                {/* The reference is a code, not a word: kept in one run so
                    Arabic reading cannot split it mid-figure. */}
                <span className="jobd-code">{detail.ref}</span>
              </p>
              <h1>{title}</h1>
              <p className="pro-meta">
                <span><i className="ri-building-2-line" aria-hidden="true"></i> {item.company}</span>
                <span className="pro-pays"><i className="ri-global-line" aria-hidden="true"></i> {paysNom}</span>
                <span><i className="ri-map-pin-line" aria-hidden="true"></i> {nomCommune(item.commune, lang)}, {nomRegion(item.wilaya, lang)}</span>
                <span><i className="ri-calendar-line" aria-hidden="true"></i> {t('jobd.posted')} {datePosted}</span>
              </p>
              <div className="jobd-idrow">
                <JobRefShare offreId={item.id} reference={detail.ref} />
                {sharedRef && sharedRef === detail.ref && (
                  <p className="jobd-shared">
                    <i className="ri-links-line" aria-hidden="true"></i>
                    <span>{t('jobd.sharedNote').replace('{ref}', detail.ref)}</span>
                  </p>
                )}
              </div>
              {/* Le repère de pose de cet écran : la fiche d'une offre dit,
                  comme celle d'une annonce, combien de ses propres textes
                  restent à traduire — lu sur ses seules clés. */}
              <PoseRestante fichier="dict.ts" prefixes={['jobd.', 'job.']} />
            </div>
            <div className="pro-head-cta pro-head-actions">
              <CopyTextButton
                build={sheetText}
                label={t('jobd.copyText')}
                hint={t('jobd.copyTextHint')}
                className="ad-btn"
              />
              <CopyLinkButton label={t('jobd.share')} className="ad-btn" />
              <button type="button" className="cta" onClick={() => setApplyOpen(true)}>
                {t('job.apply')} <i className="ri-send-plane-line" aria-hidden="true"></i>
              </button>
            </div>
          </header>

          <div className="pro-grid">
            <div className="pro-main">
              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('jobd.missions')}</h2>
                <p className="pro-text">{summary}</p>
                <ul className="jobd-list">
                  {detail.missions[lang].map((mission) => (
                    <li key={mission}>
                      <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
                      <span>{mission}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('jobd.profileTitle')}</h2>
                <p className="pro-text">{detail.profile[lang]}</p>
                {item.tags.length > 0 && (
                  <ul className="job-tags jobd-tags">
                    {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                )}
              </section>

              <section className="pro-card" data-reveal>
                <h2 className="pro-h">{t('jobd.apply')}</h2>
                <p className="pro-text">{t('jobd.applyNote')}</p>
                <button type="button" className="cta" onClick={() => setApplyOpen(true)}>
                  {t('job.apply')} <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>
                {/* Le signalement se lit sous l’action, plus discret qu’un
                    bouton : c’est un recours, pas une étape du parcours. */}
                <a className="pro-note pro-signal" href={signalHref} title={t('jobd.signalHint')}>
                  <i className="ri-flag-line" aria-hidden="true"></i>
                  <span>{t('jobd.signal')}</span>
                </a>
              </section>
            </div>

            <aside className="pro-side">
              <section className="pro-card pro-sticky" data-reveal>
                <h2 className="pro-h">{t('jobd.brief')}</h2>
                <dl className="jobd-facts">
                  <div>
                    <dt>{t('jobd.company')}</dt>
                    <dd>{item.company}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.contract')}</dt>
                    <dd>{t(CONTRACT_KEY[item.contract])}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.salary')}</dt>
                    <dd className="jobd-strong jobd-code">{salaire}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.place')}</dt>
                    <dd>{nomCommune(item.commune, lang)}, {nomRegion(item.wilaya, lang)}</dd>
                  </div>
                  <div>
                    <dt>{t('pays.label')}</dt>
                    <dd className="pro-pays-cell">{paysNom}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.experience')}</dt>
                    <dd>{localize(detail.experience, lang)}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.hours')}</dt>
                    <dd>{localize(detail.hours, lang)}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.posted')}</dt>
                    <dd>{datePosted}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.validThrough')}</dt>
                    <dd>{dateValid}</dd>
                  </div>
                  <div>
                    <dt>{t('jobd.ref')}</dt>
                    <dd>
                      <span className="jobd-code">{detail.ref}</span>
                      <JobRefShare offreId={item.id} reference={detail.ref} />
                    </dd>
                  </div>
                </dl>
                <button type="button" className="cta cta--block" onClick={() => setApplyOpen(true)}>
                  {t('job.apply')} <i className="ri-send-plane-line" aria-hidden="true"></i>
                </button>
                <div className="jobd-share">
                  <CopyLinkButton label={t('jobd.share')} className="ad-btn" />
                </div>
                <p className="pro-note">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  {t('jobd.applyNote')}
                </p>
              </section>

              {/* La carte de localisation : le poste se situe depuis la fiche,
                  et l’itinéraire s’ouvre sans repasser par une autre page. */}
              <PlaceMap
                commune={item.commune}
                wilaya={item.wilaya}
                pays={paysCode}
                entreprise={item.company}
                lat={item.lat}
                lng={item.lng}
              />

              {similar.length > 0 && (
                <section className="pro-card" data-reveal>
                  <h2 className="pro-h">{t('jobd.similar')}</h2>
                  <ul className="jobd-similar">
                    {similar.map((job) => (
                      <li key={job.id}>
                        <Link to={`/emplois/${job.id}`}>
                          <strong>{localize(job.title, lang)}</strong>
                          <span>{job.company} · {nomRegion(job.wilaya, lang)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link to="/emplois" className="pro-note jobd-all">
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    {t('jobd.allJobs')}
                  </Link>
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>
      {applyOpen && (
        <ApplyDialog
          offreId={item.id}
          offreTitre={title}
          entreprise={item.company}
          entrepriseUserId={row?.user_id ?? null}
          onClose={() => setApplyOpen(false)}
        />
      )}
      <Footer />
    </>
  );
}