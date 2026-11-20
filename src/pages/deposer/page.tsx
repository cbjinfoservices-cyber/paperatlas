import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useDepotCounts } from '@/hooks/useDepotCounts';
import { useDraftFlags } from '@/hooks/useDraftFlags';
import PoseRestante from '@/components/feature/PoseRestante';
import DepositTabs from '@/pages/deposer/components/DepositTabs';
import AnnonceForm from '@/pages/deposer/components/AnnonceForm';
import OffreForm from '@/pages/deposer/components/OffreForm';
import DepositAside from '@/pages/deposer/components/DepositAside';
import type { DepositKind } from '@/pages/deposer/components/useDepositForm';

/**
 * Le dépôt, en deux formulaires distincts : une annonce d'un côté, une offre
 * d'emploi de l'autre. Le type n'est plus un menu déroulant au milieu du
 * formulaire — c'est l'onglet ouvert, ce qui interdit de ranger une annonce
 * dans un contrat ou une offre dans une catégorie d'annonce.
 */
export default function Deposer() {
  useSeo({ page: 'deposer', path: '/deposer' });
  const { t } = useLang();
  useReveal();

  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState<DepositKind>(
    params.get('type') === 'offre' ? 'offre' : 'annonce',
  );
  /* Combien de lignes chaque famille tient déjà : les onglets le disent avant
     qu'on écrive, sans ouvrir les tableaux. */
  const { counts, loading: countsLoading } = useDepotCounts();
  /* Les familles qui gardent un brouillon sur cet appareil : les onglets le
     disent d'un point, sans ouvrir le formulaire. */
  const drafts = useDraftFlags();

  /* Arriver depuis « Reprendre le dépôt » ne doit pas ressembler à un
     formulaire vierge : `reprendre=1` fait descendre la page jusqu'au
     formulaire déjà rempli et pose le curseur dans le titre. Le geste ne
     joue qu'une fois, pour ne pas reprendre la main quand on change d'onglet. */
  const reprendre = params.get('reprendre') === '1';
  const reprised = useRef(false);
  useEffect(() => {
    if (!reprendre || reprised.current) return;
    reprised.current = true;
    const field = tab === 'offre' ? 'off-titre' : 'ann-titre';
    const timer = window.setTimeout(() => {
      const input = document.getElementById(field) as HTMLInputElement | null;
      if (!input) return;
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [reprendre, tab]);

  /* L'onglet ouvert s'écrit dans l'adresse : un lien partagé retombe sur le
     même formulaire, et les deux portes existantes (?type=annonce, ?type=offre)
     continuent d'ouvrir la bonne. */
  const choisir = (next: DepositKind) => {
    setTab(next);
    const suivant = new URLSearchParams(params);
    suivant.set('type', next);
    setParams(suivant, { replace: true });
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('dep.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('dep.title') }} />
          <p className="lede">{t('dep.lede')}</p>
          {/* Le repère de pose : le dépôt dit son reste sur ses seules clés
              `dep.`, avant qu’on remplisse un formulaire. */}
          <PoseRestante fichier="dict.ts" prefixes={['dep.']} />
        </section>

        <section className="dir-body">
          <DepositTabs
            active={tab}
            onChange={choisir}
            counts={counts}
            drafts={drafts}
            loading={countsLoading}
          />

          <div className="deposit-grid">
            <div className="dep-forms">
              <AnnonceForm hidden={tab !== 'annonce'} familyTotal={counts.annonce} />
              <OffreForm hidden={tab !== 'offre'} familyTotal={counts.offre} />
            </div>
            <DepositAside kind={tab} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}