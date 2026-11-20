import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useReveal } from '@/hooks/useReveal';
import { useSeo } from '@/hooks/useSeo';
import { nomPays, paysDe } from '@/lib/pays';
import { nomRegion } from '@/lib/regionLabels';
import { slugDeTrade, slugPays } from '@/lib/tradePages';
import { famillesAvecPays } from '@/lib/tradeCountries';
import { WORLD_FAMILIES } from '@/lib/worldFamilies';
import { entreprises } from '@/mocks/entreprises';
import { auteurs } from '@/mocks/auteurs';
import WorldRecall from '@/components/feature/WorldRecall';
import PoseRestante from '@/components/feature/PoseRestante';
import PlanSearch from './components/PlanSearch';
import './plan.css';

/** Les fiches de chaque famille, rangées par pays puis par nom : le plan les
 *  ouvre une à une, à côté des pages de type et de pays. */
const FICHES_PAR_TRADE = entreprises.reduce<Record<string, typeof entreprises>>((acc, e) => {
  const list = acc[e.trade] ?? [];
  list.push(e);
  acc[e.trade] = list;
  return acc;
}, {});

Object.values(FICHES_PAR_TRADE).forEach((rows) => {
  rows.sort((a, b) => nomPays(paysDe(a), 'fr').localeCompare(nomPays(paysDe(b), 'fr'), 'fr')
    || a.name.localeCompare(b.name, 'fr'));
});

/** Combien d'ateliers chaque famille porte aujourd'hui : le chiffre posé à
 *  côté de sa porte, lu sur les fiches publiées, jamais écrit à la main. */
const COMPTE_PAR_TRADE = entreprises.reduce<Record<string, number>>((acc, e) => {
  acc[e.trade] = (acc[e.trade] ?? 0) + 1;
  return acc;
}, {});

/** Les plumes, lues par ordre alphabétique : une fiche, un nom, une région. */
const AUTEURS_TRIES = [...auteurs].sort((a, b) => a.name.localeCompare(b.name, 'fr'));

/** Les portes principales, hors annuaire : de quoi atteindre chaque page en un clic. */
const MAIN_LINKS: Array<{ to: string; key: string; icon: string }> = [
  { to: '/', key: 'siteMap.home', icon: 'ri-home-5-line' },
  { to: '/annuaire', key: 'siteMap.directory', icon: 'ri-building-4-line' },
  { to: '/annuaire?kind=auteurs', key: 'siteMap.authors', icon: 'ri-quill-pen-line' },
  { to: '/annonces', key: 'siteMap.listings', icon: 'ri-megaphone-line' },
  { to: '/emplois', key: 'siteMap.jobs', icon: 'ri-briefcase-line' },
  { to: '/offres', key: 'siteMap.offers', icon: 'ri-price-tag-3-line' },
  { to: '/arabe-world', key: 'siteMap.world', icon: 'ri-global-line' },
  { to: '/demande-b2b', key: 'siteMap.b2b', icon: 'ri-inbox-archive-line' },
  { to: '/deposer', key: 'siteMap.deposit', icon: 'ri-upload-cloud-2-line' },
  { to: '/suivi', key: 'siteMap.track', icon: 'ri-truck-line' },
  { to: '/mentions-legales', key: 'siteMap.legal', icon: 'ri-file-text-line' },
  { to: '/confidentialite', key: 'siteMap.privacy', icon: 'ri-shield-keyhole-line' },
];

/**
 * Les portes que la page Arabe World ouvre, et non leurs copies : chacune garde
 * la trace du passage dans l'adresse, donc la page d'arrivée sait d'où l'on
 * vient. Le plan les nomme sous la ligne d'Arabe World, là où un lecteur les
 * cherche, plutôt que de laisser les deux plus récentes (annonces, emplois)
 * invisibles.
 */
const WORLD_DOORS: Array<{ to: string; key: string; icon: string }> = [
  { to: '/annuaire?via=world', key: 'world.seeDirectory', icon: 'ri-building-4-line' },
  { to: '/annonces?via=world', key: 'world.seeAnnonces', icon: 'ri-megaphone-line' },
  { to: '/emplois?via=world', key: 'world.seeEmplois', icon: 'ri-briefcase-line' },
  { to: '/demandes?via=world', key: 'world.seeRequests', icon: 'ri-survey-line' },
  { to: '/offres?via=world', key: 'world.seeOffers', icon: 'ri-price-tag-3-line' },
];

/**
 * Le plan du site : toutes les pages de type et de pays, réunies sur une seule
 * adresse. Un lecteur y trouve son chemin sans passer par les filtres, et un
 * moteur de recherche y découvre d'un coup les pages écrites pour lui — chaque
 * type, puis chacun de ses pays.
 */
export default function PlanDuSite() {
  const { t, lang } = useLang();
  useReveal();
  const [params] = useSearchParams();
  /* La porte « Plan du site » d'Arabe World laisse sa trace : la ligne dit
     d'où l'on arrive, et le retour ramène à la page. */
  const viaWorld = params.get('via') === 'world';

  /* Arriver par « Voir dans le plan du site » : le plan s'ouvre sur la ligne de
     cette fiche, une fois la page écrite. */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);
    return () => window.clearTimeout(timer);
  }, []);

  const familles = famillesAvecPays();
  const pagesPays = familles.reduce((sum, row) => sum + row.pays.length, 0);
  /* Le compte annoncé inclut les fiches : chaque atelier et chaque plume a
     désormais son adresse dans ce plan, pas seulement les pages de type. */
  const total = familles.length + pagesPays + entreprises.length + auteurs.length;

  useSeo({
    page: 'sitemap',
    path: '/plan-du-site',
    title: t('siteMap.seoTitle'),
    description: t('siteMap.seoDesc'),
  });

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('siteMap.label')}</p>
          <h1 className="page-h1">
            {t('siteMap.title')} <em className="accent">{t('siteMap.count').replace('{n}', String(total))}</em>
          </h1>
          <p className="lede">{t('siteMap.sub')}</p>
          {/* Le repère de pose du plan : les seules clés `siteMap.` de
              dict.trade.ts, qui portent cet écran. Il se tait quand tout est
              posé. */}
          <PoseRestante
            fichier="dict.trade.ts"
            prefixes={['siteMap.']}
            className="plan-pose"
          />
        </section>

        <div className="dir-body plan-body">
          {viaWorld && <WorldRecall subject={t('world.viaPlan')} />}

          <section className="plan-block" aria-labelledby="plan-main">
            <h2 className="plan-block-h" id="plan-main">
              <i className="ri-compass-3-line" aria-hidden="true"></i>
              {t('siteMap.main')}
            </h2>
            <nav className="plan-links" aria-label={t('siteMap.main')}>
              {MAIN_LINKS.map((link) => (
                <Link key={link.to} className="plan-link" to={link.to}>
                  <i className={link.icon} aria-hidden="true"></i>
                  {t(link.key)}
                </Link>
              ))}
            </nav>

            {/* Sous la ligne d'Arabe World, ce qu'elle ouvre : les portes
                gardent leur trace de passage, donc un lecteur qui arrive ici
                par elles retrouve le fil. */}
            <div className="plan-world">
              <p className="plan-world-head">
                <i className="ri-global-line" aria-hidden="true"></i>
                <span className="plan-world-lab">{t('siteMap.worldDoors')}</span>
                <span className="plan-world-hint">{t('siteMap.worldDoorsHint')}</span>
              </p>
              <nav className="plan-world-links" aria-label={t('siteMap.worldDoors')}>
                {WORLD_DOORS.map((door) => (
                  <Link key={door.to} className="plan-door" to={door.to}>
                    <i className={door.icon} aria-hidden="true"></i>
                    {t(door.key)}
                    <i className="ri-arrow-right-line plan-door-arrow" aria-hidden="true"></i>
                  </Link>
                ))}
              </nav>

              {/* Les six familles, sous les portes du réseau : la page Arabe
                  World les déplie en cartes, le plan les nomme ici — chacune
                  ouvrant sa page de type, la trace du passage comprise. Un
                  lecteur qui cherche « Imprimeries » dans le plan le trouve
                  donc aussi par la marque qui l'annonce. */}
              <div className="plan-world-fams">
                <p className="plan-world-head">
                  <i className="ri-stack-line" aria-hidden="true"></i>
                  <span className="plan-world-lab">{t('siteMap.worldFamilies')}</span>
                  <span className="plan-world-hint">{t('siteMap.worldFamiliesHint')}</span>
                </p>
                <nav className="plan-world-links" aria-label={t('siteMap.worldFamilies')}>
                  {WORLD_FAMILIES.map((row) => {
                    const count = COMPTE_PAR_TRADE[row.trade] ?? 0;
                    return (
                      <Link
                        key={row.trade}
                        className="plan-door plan-door--fam"
                        to={`/annuaire/${slugDeTrade(row.trade)}?via=world`}
                        title={`${t(`tradePlural.${row.trade}`)} — ${count}`}
                      >
                        <i className={row.icon} aria-hidden="true"></i>
                        {t(`tradePlural.${row.trade}`)}
                        <b className="plan-door-n">{count}</b>
                        <i className="ri-arrow-right-line plan-door-arrow" aria-hidden="true"></i>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </section>

          <section className="plan-block" aria-labelledby="plan-types">
            <h2 className="plan-block-h" id="plan-types">
              <i className="ri-links-line" aria-hidden="true"></i>
              {t('siteMap.types')}
            </h2>
            <p className="plan-hint">
              {t('siteMap.typesHint')
                .replace('{n}', String(familles.length))
                .replace('{p}', String(pagesPays))
                .replace('{f}', String(entreprises.length))}
            </p>

            <PlanSearch />

            <div className="plan-fams">
              {familles.map(({ trade, pays }) => (
                <article key={trade} className="plan-fam">
                  <div className="plan-fam-head">
                    <Link className="plan-fam-name" to={`/annuaire/${slugDeTrade(trade)}`}>
                      {t(`tradePlural.${trade}`)}
                    </Link>
                    <span className="plan-fam-num">
                      {pays.length} {t('siteMap.countryPages')}
                    </span>
                  </div>
                  <ul className="plan-fam-list">
                    {pays.map((row) => (
                      <li key={row.code}>
                        <Link
                          className="plan-country"
                          to={`/annuaire/${slugDeTrade(trade)}/${slugPays(row.code)}`}
                          title={`${t(`tradePlural.${trade}`)} · ${nomPays(row.code, lang)}`}
                        >
                          {nomPays(row.code, lang)}
                          <b>{row.count}</b>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {(FICHES_PAR_TRADE[trade]?.length ?? 0) > 0 && (
                    <div className="plan-fiche-block">
                      <span className="plan-fiche-lab">
                        <i className="ri-file-list-3-line" aria-hidden="true"></i>
                        {t('siteMap.files')}
                        <b>{FICHES_PAR_TRADE[trade].length}</b>
                      </span>
                      <ul className="plan-fiches">
                        {FICHES_PAR_TRADE[trade].map((fiche) => (
                          /* L'ancre de la fiche : « Voir dans le plan du site »,
                             depuis la fiche, ouvre le plan sur cette ligne. */
                          <li key={fiche.id} id={`fiche-${fiche.id}`}>
                            <Link
                              className="plan-fiche"
                              to={`/entreprise/${fiche.id}`}
                              title={`${fiche.name} · ${nomPays(paysDe(fiche), lang)}`}
                            >
                              <span>{fiche.name}</span>
                              <em>{nomPays(paysDe(fiche), lang)}</em>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Link className="plan-fam-more" to={`/annuaire/${slugDeTrade(trade)}`}>
                    {t('siteMap.seeType')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="plan-block" aria-labelledby="plan-authors">
            <h2 className="plan-block-h" id="plan-authors">
              <i className="ri-quill-pen-line" aria-hidden="true"></i>
              {t('siteMap.authorFiles')}
            </h2>
            <p className="plan-hint">
              {t('siteMap.authorHint').replace('{n}', String(auteurs.length))}
            </p>
            <ul className="plan-fiches plan-fiches--authors">
              {AUTEURS_TRIES.map((auteur) => (
                <li key={auteur.id} id={`fiche-${auteur.id}`}>
                  <Link
                    className="plan-fiche"
                    to={`/auteur/${auteur.id}`}
                    title={`${auteur.name} · ${nomRegion(auteur.wilaya, lang)}`}
                  >
                    <span>{auteur.name}</span>
                    <em>{nomRegion(auteur.wilaya, lang)}</em>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <div className="dir-quote">
            <div>
              <h2>{t('siteMap.ctaTitle')}</h2>
              <p>{t('siteMap.ctaText')}</p>
            </div>
            <Link to="/annuaire" className="cta">
              {t('siteMap.directory')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}