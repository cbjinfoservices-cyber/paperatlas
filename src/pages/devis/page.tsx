import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import DevisAbonnement from '@/components/feature/DevisAbonnement';
import { isPlanId } from '@/pages/offres/components/plans';

/**
 * « Devis d'abonnement » : the composer on a page of its own, so the
 * Institutions card and any message can point at one address. The formula named
 * in the link is the one the page opens on.
 */
export default function Devis() {
  const { t } = useLang();
  useSeo({ page: 'offres', path: '/offres/devis' });
  useReveal();
  useScrollRestore('/offres/devis');
  const [params] = useSearchParams();
  const asked = params.get('formule');
  const formule = isPlanId(asked) ? asked : 'mensuel';

  return (
    <>
      <Nav variant="page" />
      <main className="page-main">
        <section className="dir-hero">
          <p className="stamp">{t('dv.stamp')}</p>
          <h1 className="page-h1">{t('dv.pageTitle')}</h1>
          <p className="lede">{t('dv.pageLede')}</p>
        </section>

        <section className="dir-body">
          <div className="of-sec">
            <DevisAbonnement source="page-devis" formuleInitiale={formule} />

            <Link to="/offres" className="ghost-link">
              <i className="ri-arrow-left-line" aria-hidden="true"></i>
              {t('ofb.compare')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}