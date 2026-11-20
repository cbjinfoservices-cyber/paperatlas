import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useReveal } from '@/hooks/useReveal';
import { useSeo } from '@/hooks/useSeo';
import BrandSeal from '@/components/feature/BrandSeal';
import PartnerMark from '@/components/feature/PartnerMark';
import { entreprises } from '@/mocks/entreprises';
import { slugDeTrade, slugPays, phrasePays } from '@/lib/tradePages';
import { paysParTrade } from '@/lib/tradeCountries';
import { WORLD_FAMILIES, ancreFamille } from '@/lib/worldFamilies';
import '@/components/feature/partner-mark.css';
import './world.css';

/** Les six portes qui suffisent à faire le tour du réseau. */
const DOORS: Array<{ to: string; key: string; icon: string }> = [
  { to: '/annuaire?via=world', key: 'world.seeDirectory', icon: 'ri-building-4-line' },
  { to: '/annonces?via=world', key: 'world.seeAnnonces', icon: 'ri-megaphone-line' },
  { to: '/emplois?via=world', key: 'world.seeEmplois', icon: 'ri-briefcase-line' },
  { to: '/demandes?via=world', key: 'world.seeRequests', icon: 'ri-survey-line' },
  { to: '/offres?via=world', key: 'world.seeOffers', icon: 'ri-price-tag-3-line' },
  { to: '/plan-du-site?via=world', key: 'world.seePlan', icon: 'ri-links-line' },
];

const LANGS: Array<{ code: string; key: string; dir: 'ltr' | 'rtl' }> = [
  { code: 'العربية', key: 'l1', dir: 'rtl' },
  { code: 'Français', key: 'l2', dir: 'ltr' },
  { code: 'English', key: 'l3', dir: 'ltr' },
];

/**
 * Les six familles annoncées par le chiffre « 6 métiers », chacune avec son
 * compte réel et l'adresse de sa page de type — /annuaire/imprimeries,
 * /annuaire/editeurs… Le compte est lu sur les fiches publiées, jamais écrit à
 * la main : la page ne peut pas promettre un atelier que la page de type ne
 * montrerait pas.
 */
const FAMILY_ROWS = WORLD_FAMILIES.map((row) => {
  const pays = paysParTrade(row.trade);
  return {
    ...row,
    count: entreprises.filter((e) => e.trade === row.trade).length,
    /* Les deux pays où ce métier tient le plus d'ateliers : la page la plus
       fournie de la famille, puis celle qui la suit — déjà triées par tallyPays,
       le plus gros compte d'abord. Deux, pas plus : la carte doit rester une
       carte, pas un index de pays. */
    places: pays.slice(0, 2),
    /* Combien de pays ce métier tient en tout : le compteur sous la carte
       compare ce qu'elle montre à ce que la famille pèse vraiment. */
    paysTotal: pays.length,
    /* Le pays qui suit les deux posés : la part manquante du métier ne reste
       pas sans porte — la barre du compteur y mène. */
    nextPlace: pays[2] ?? null,
  };
});

const FACTS = [
  { n: 'world.n1n', t: 'world.n1t', p: 'world.n1p' },
  { n: 'world.n2n', t: 'world.n2t', p: 'world.n2p' },
  { n: 'world.n3n', t: 'world.n3t', p: 'world.n3p' },
];

/**
 * « Arabe World » : la seconde marque du réseau, expliquée en une page.
 *
 * Elle dit deux choses que la barre ne peut pas dire en un mot : d'où viennent
 * les deux noms de la maison, et pourquoi le site se lit en trois langues. Ce
 * n'est pas une page commerciale — elle ne promet rien, elle énonce.
 */
export default function ArabeWorld() {
  const { t, lang } = useLang();
  useReveal();

  useSeo({
    page: 'world',
    path: '/arabe-world',
    title: t('world.seoTitle'),
    description: t('world.seoDesc'),
  });

  /* Une page de type ou de pays ramène ici sur sa famille : l'adresse porte
     l'ancre de la carte (`#fam-impression`), et la page s'ouvre dessus une
     fois écrite, plutôt que de laisser le lecteur chercher sa famille dans
     les six. */
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('world.stamp')}</p>
          <h1
            className="page-h1"
            dangerouslySetInnerHTML={{ __html: t('world.title') }}
          />
          <p className="lede">{t('world.lede')}</p>
        </section>

        <div className="dir-body world-body">
          {/* Les deux marques, montrées à la taille où on les lit dans la barre
              et dans le pied de page : le propos de la page, c'est le couple. */}
          <section className="world-block" aria-labelledby="world-names">
            <h2 className="world-h2" id="world-names">{t('world.nameTitle')}</h2>
            <p className="world-text">{t('world.nameText')}</p>

            <div className="world-marks">
              <article className="world-mark">
                <span className="world-mark-visual">
                  <BrandSeal className="world-seal" label="PaperAtlas" />
                </span>
                <div className="world-mark-txt">
                  <p className="world-mark-lab">{t('world.b1t')}</p>
                  <b>PaperAtlas</b>
                  <p>{t('world.b1p')}</p>
                </div>
              </article>
              <article className="world-mark">
                <span className="world-mark-visual">
                  <PartnerMark className="partner-mark--hero" />
                </span>
                <div className="world-mark-txt">
                  <p className="world-mark-lab">{t('world.b2t')}</p>
                  <p>{t('world.b2p')}</p>
                </div>
              </article>
            </div>
          </section>

          {/* Les trois langues, chacune avec son propre sens de lecture :
              l'arabe s'écrit de droite à gauche ici aussi, pas seulement dans
              le reste du site. */}
          <section className="world-block" aria-labelledby="world-langs">
            <h2 className="world-h2" id="world-langs">{t('world.langTitle')}</h2>
            <p className="world-text">{t('world.langText')}</p>

            <div className="world-langs">
              {LANGS.map((row) => (
                <article className="world-lang" key={row.key}>
                  <h3 className="world-lang-name" lang={row.code === 'العربية' ? 'ar' : undefined} dir={row.dir}>
                    {row.code}
                  </h3>
                  <p className="world-lang-txt">{t(`world.${row.key}p`)}</p>
                </article>
              ))}
            </div>

            <p className="world-note">
              <i className="ri-global-line" aria-hidden="true"></i>
              {t('world.langNote')}
            </p>
          </section>

          <section className="world-block" aria-labelledby="world-net">
            <h2 className="world-h2" id="world-net">{t('world.netTitle')}</h2>
            <p className="world-text">{t('world.netText')}</p>

            <div className="world-facts">
              {FACTS.map((fact) => (
                <article className="world-fact" key={fact.n}>
                  <p className="world-fact-n">{t(fact.n)}</p>
                  <p className="world-fact-t">{t(fact.t)}</p>
                  <p className="world-fact-p">{t(fact.p)}</p>
                </article>
              ))}
            </div>

            {/* Le chiffre « 6 métiers » se déplie ici : les six familles, leur
                compte réel, et la porte de leur page de type. */}
            <h3 className="world-h3">{t('world.famTitle')}</h3>
            <p className="world-text">{t('world.famText')}</p>
            <div className="world-fams">
              {FAMILY_ROWS.map((row) => {
                const unit = t(row.count > 1 ? 'world.famMany' : 'world.famOne');
                const family = t(`tradePlural.${row.trade}`);
                /* Ce que la carte montre, chiffré : les ateliers des deux pays
                   posés sous elle, sur le total du métier. Le pourcentage est
                   lu sur les fiches, comme les comptes — la carte ne peut pas
                   annoncer une part qu'elle ne montrerait pas. */
                const shownCount = row.places.reduce((sum, place) => sum + place.count, 0);
                const share = row.count > 0 ? Math.round((shownCount / row.count) * 100) : 0;
                const shareText = t('world.famShare').replace('{p}', String(share));
                const shareTitle = t('world.famShareTitle')
                  .replace('{c}', String(shownCount))
                  .replace('{n}', String(row.count))
                  .replace('{p}', String(share))
                  .replace('{k}', String(row.paysTotal));
                /* La barre mène au pays qui suit : la part que la carte ne
                   montre pas encore a donc une page, elle aussi. Sans
                   troisième pays, elle ouvre la page du métier entier. */
                const nextLabel = row.nextPlace ? phrasePays(row.nextPlace.code, lang) : '';
                const shareTo = row.nextPlace
                  ? `/annuaire/${slugDeTrade(row.trade)}/${slugPays(row.nextPlace.code)}?via=world`
                  : `/annuaire/${slugDeTrade(row.trade)}?via=world`;
                const shareGo = row.nextPlace
                  ? t('world.famShareNextTitle')
                    .replace('{label}', `${family} ${nextLabel}`)
                    .replace('{n}', String(row.nextPlace.count))
                    .replace('{u}', unit)
                  : t('world.famShareAllTitle')
                    .replace('{label}', family)
                    .replace('{k}', String(row.paysTotal))
                    .replace('{u}', unit);
                /* La carte se lit en deux temps : le métier ouvre sa page de
                   type — /annuaire/imprimeries — et les pays sous lui ouvrent
                   les pages les plus fournies de cette famille — /annuaire/
                   imprimeries/algerie, puis le suivant. Des adresses nommées,
                   pas un filtre reposé à la main.
                   Tous les liens sont frères, jamais imbriqués : une porte dans
                   une porte ne se lit pas au clavier. */
                return (
                  <div className="world-fam" key={row.trade} id={ancreFamille(row.trade)}>
                    <Link
                      className="world-fam-open"
                      to={`/annuaire/${slugDeTrade(row.trade)}?via=world`}
                      title={`${family} — ${row.count} ${unit}`}
                      aria-label={`${t('world.famOpen')} : ${family} — ${row.count} ${unit}`}
                    >
                      <span className="world-fam-ico">
                        <i className={row.icon} aria-hidden="true"></i>
                      </span>
                      <span className="world-fam-txt">
                        <span className="world-fam-name">{family}</span>
                        <span className="world-fam-count">{row.count} {unit}</span>
                      </span>
                      <i className="ri-arrow-right-line world-fam-arrow" aria-hidden="true"></i>
                    </Link>
                    {row.places.length > 0 && (
                      <div className="world-fam-places">
                        {row.places.map((place, i) => {
                          const label = phrasePays(place.code, lang);
                          return (
                            <Link
                              className={`world-fam-place${i > 0 ? ' world-fam-place--next' : ''}`}
                              key={place.code}
                              to={`/annuaire/${slugDeTrade(row.trade)}/${slugPays(place.code)}?via=world`}
                              title={`${family} ${label} — ${place.count} ${unit}`}
                              aria-label={`${t('world.famPlaceTitle')} : ${family} ${label} — ${place.count} ${unit}`}
                            >
                              <i className="ri-map-pin-2-line" aria-hidden="true"></i>
                              <span className="world-fam-place-txt">{label}</span>
                              <span className="world-fam-place-n">{place.count}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    {/* Le compteur des deux pays : une barre et sa part, pour
                        dire d'un coup d'œil ce que la carte montre du métier
                        — et une porte, parce que la part qu'elle laisse de
                        côté est le pays suivant : la barre l'ouvre. */}
                    {row.places.length > 0 && (
                      <Link
                        className="world-fam-share"
                        to={shareTo}
                        title={shareGo}
                        aria-label={shareGo}
                      >
                        <span className="world-fam-share-bar" aria-hidden="true">
                          <span
                            className="world-fam-share-fill"
                            style={{ width: `${Math.min(share, 100)}%` }}
                          />
                        </span>
                        <span className="world-fam-share-row">
                          <span className="world-fam-share-lab">{shareText}</span>
                          <i className="ri-arrow-right-line world-fam-share-arrow" aria-hidden="true"></i>
                        </span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <h3 className="world-where-title">{t('world.whereTitle')}</h3>
            <p className="world-text">{t('world.whereText')}</p>
            <nav className="world-doors" aria-label={t('world.whereTitle')}>
              {DOORS.map((door) => (
                <Link className="world-door" key={door.to} to={door.to}>
                  <i className={door.icon} aria-hidden="true"></i>
                  {t(door.key)}
                  <i className="ri-arrow-right-line world-door-arrow" aria-hidden="true"></i>
                </Link>
              ))}
            </nav>
          </section>

          <div className="dir-quote">
            <div>
              <h2>{t('world.ctaTitle')}</h2>
              <p>{t('world.ctaText')}</p>
            </div>
            <Link to="/annuaire?via=world" className="cta">
              {t('world.ctaBtn')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>

          <p className="world-lang-foot" lang={lang === 'ar' ? 'ar' : undefined} dir={lang === 'ar' ? 'rtl' : undefined}>
            <span lang="ar" dir="rtl">العالم العربي</span>
            <span className="world-lang-sep" aria-hidden="true">·</span>
            <span>PaperAtlas</span>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}