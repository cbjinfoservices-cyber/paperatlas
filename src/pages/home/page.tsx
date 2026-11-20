import { useEffect } from 'react';
import { initChapter, initAfterChapter } from '@/hooks/scrollEngine';
import { useSeo } from '@/hooks/useSeo';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useLang } from '@/i18n/LangProvider';
import { organizationLd, websiteLd } from '@/lib/structuredData';
import Chapter from './components/Chapter';
import CandidatBand from './components/CandidatBand';
import Panels from './components/Panels';
import ContactPanel from './components/ContactPanel';
import { Nav, Footer } from './components/SiteChrome';

let initedEl: Element | null = null;

export default function Home() {
  const { lang } = useLang();
  useSeo({ page: 'home', path: '/' });
  /* La maison et le site, en un seul bloc : c'est ce que Google lit pour
     rattacher les pages de l'annuaire à un même éditeur, dans les trois
     langues. Rien n'y est inventé — les deux noms, les trois langues et la
     recherche de l'annuaire se lisent tous à l'écran. */
  useJsonLd('home-jsonld', {
    '@context': 'https://schema.org',
    '@graph': [organizationLd(lang), websiteLd(lang)],
  });

  useEffect(() => {
    const el = document.querySelector('.chapter');
    if (!el || el === initedEl) return;
    initedEl = el;
    initChapter();
    initAfterChapter();
  }, []);

  return (
    <>
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <Chapter />
        <CandidatBand />
        <Panels />
        <ContactPanel />
      </main>
      <Footer />
    </>
  );
}