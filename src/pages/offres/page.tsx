import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import PlanCards from './components/PlanCards';
import PriceCountry from './components/PriceCountry';
import CompareTable from './components/CompareTable';
import FaqTarifs from './components/FaqTarifs';
import WorldRecall from '@/components/feature/WorldRecall';
import PoseRestante from '@/components/feature/PoseRestante';
import DernierDevis from './components/DernierDevis';
import Testimonials from './components/Testimonials';
import { DEMO_DATA } from '@/mocks/demo';
import { faqItems } from './components/plans';

/* Le formulaire de contact vit sur l'accueil, à l'ancre « contact ». On y
   arrive avec le sujet déjà choisi : depuis les formules, la question est un
   abonnement — la personne n'a pas à le redire. */
const BASE = __BASE_PATH__.replace(/\/$/, '');
const CONTACT_ABO = `${BASE}/?sujet=devis#contact`;

/**
 * « Offres » : the one subscription in four lengths of time — the figure of
 * each length, the month it comes to, what it keeps, and the door that opens
 * it. The page ends on the questions that come back most often.
 */
export default function Offres() {
  useSeo({ page: 'offres', path: '/offres' });
  const { t, lang } = useLang();
  useReveal();
  useScrollRestore('/offres');
  const { hash, search } = useLocation();
  /* La porte « Formules » d'Arabe World laisse sa trace dans l'adresse : la
     page dit une fois d'où l'on vient, et propose le retour. */
  const viaWorld = new URLSearchParams(search).get('via') === 'world';

  /* A link can name one card — « voir cette formule » on « Mon compte », for
     instance. The router does not scroll to an anchor on its own, so the card
     is walked to once it is on screen. */
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const jump = window.setTimeout(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 90);
    return () => window.clearTimeout(jump);
  }, [hash]);

  /* The FAQ is visible on the page, so the search engine gets the very same
     questions and answers, written in the language on screen. */
  useEffect(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: t(item.q),
        acceptedAnswer: { '@type': 'Answer', text: t(item.a) },
      })),
    };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'offres-faq-schema';
    el.textContent = JSON.stringify(data);
    document.getElementById('offres-faq-schema')?.remove();
    document.head.appendChild(el);
    return () => el.remove();
  }, [t, lang]);

  return (
    <>
      <a className="skip-link" href="#offres-plans">{t('dir.skipTo')}</a>
      <Nav variant="page" skip={false} />
      <main className="page-main">
        <section className="dir-hero">
          <p className="stamp">{t('ofp.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('ofp.title') }} />
          <p className="lede">{t('ofp.lede')}</p>
          {/* One offer, four lengths: the door opens the grid itself, where the
              four figures are read side by side. */}
          <div className="of-hero-cta">
            <Link to="/compte/inscription?plan=annee" className="cta">
              <i className="ri-user-add-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ofp.heroOpen')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
            <p className="of-hero-cta-note">
              <i className="ri-check-double-line" aria-hidden="true"></i>
              <span>{t('ofp.heroOpenNote')}</span>
            </p>
            <a href="#offres-plans" className="of-hero-cta-later">
              <span>{t('ofp.heroPlans')}</span>
              <i className="ri-arrow-down-line" aria-hidden="true"></i>
            </a>
          </div>
        </section>

        <section className="dir-body">
          {viaWorld && <WorldRecall subject={t('world.viaOffres')} />}

          {/* A member who has already sent a quote recognises it at once: which
              one, for how much, and where it stands — right at the top. */}
          <DernierDevis />

          <div className="of-sec" id="offres-plans">
            <div className="of-sec-head">
              <h2 className="page-h2">{t('ofp.plansTitle')}</h2>
              <p className="of-sec-sub">{t('ofp.plansSub')}</p>
            </div>
            {/* The money the prices are read in: the country the visitor's
                browser points at, changeable here, never a fixed dinar figure
                for a reader in Cairo or Riyadh. */}
            <PriceCountry />
            <PlanCards reveal />
            {/* Le repère de pose : il se lit sous les cartes de formules, à
                l'endroit où les prix se comparent, et non plus en tête de
                page. Il se tait quand tout est posé. */}
            <PoseRestante fichier="dict.offres.ts" className="of-plans-pose" />
            {/* Le renvoi en miroir de celui posé sous les cartes des guichets :
                ceux qui arrivent ici pour déposer une demande — et non pour
                souscrire — trouvent la porte au même endroit du propos. */}
            <p className="of-aside" data-reveal>
              <Link
                className="of-aside-link"
                to="/demandes"
                title={t('ofp.guiHintFull')}
              >
                <span className="of-aside-marks" aria-hidden="true">
                  <span className="of-aside-mark">
                    <i className="ri-stack-line"></i>
                  </span>
                  <span className="of-aside-mark">
                    <i className="ri-file-list-3-line"></i>
                  </span>
                </span>
                <span className="of-aside-txt">{t('ofp.guiHint')}</span>
                <i className="ri-arrow-right-line of-aside-go" aria-hidden="true"></i>
                <span className="of-aside-cta">{t('ofp.guiHintCta')}</span>
              </Link>
            </p>
          </div>

          <div className="of-sec">
            <div className="of-sec-head">
              <h2 className="page-h2">{t('ofp.tableTitle')}</h2>
              <p className="of-sec-sub">{t('ofp.tableSub')}</p>
            </div>
            <CompareTable />

            {DEMO_DATA && (
              <div className="of-voices-block">
                <div className="of-voices-head">
                  <p className="stamp">{t('oft.stamp')}</p>
                  <h3 className="of-voices-title">{t('oft.title')}</h3>
                  <p className="of-sec-sub">{t('oft.sub')}</p>
                </div>
                <Testimonials />
                <p className="of-voices-note">
                  <i className="ri-information-line" aria-hidden="true"></i>
                  <span>{t('oft.note')}</span>
                </p>
              </div>
            )}
          </div>

          <div className="of-sec">
            <div className="of-sec-head">
              <h2 className="page-h2">{t('ofp.faqTitle')}</h2>
              <p className="of-sec-sub">{t('ofp.faqSub')}</p>
            </div>
            <FaqTarifs />
          </div>

          <div className="dir-quote">
            <div>
              <h2>{t('ofp.ctaTitle')}</h2>
              <p>{t('ofp.ctaText')}</p>
            </div>
            <div className="of-cta-actions">
              <Link to="/compte/inscription?plan=annee" className="cta">
                <span className="whitespace-nowrap">{t('ofp.ctaBtn')}</span>
                <i className="ri-arrow-right-line" aria-hidden="true"></i>
              </Link>
              <a href={CONTACT_ABO} className="ghost-btn">
                <i className="ri-mail-line" aria-hidden="true"></i>
                <span className="whitespace-nowrap">{t('ofp.contactLink')}</span>
              </a>
              <p className="of-cta-contact-hint">
                <i className="ri-check-double-line" aria-hidden="true"></i>
                <span>{t('ofp.contactLinkHint')}</span>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}