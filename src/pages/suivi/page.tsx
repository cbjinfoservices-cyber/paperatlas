import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import PoseRestante from '@/components/feature/PoseRestante';
import SuiviLookup from '@/pages/suivi/components/SuiviLookup';
import RegionWalk from '@/pages/entreprise/components/RegionWalk';
import '@/styles/suivi.css';

/**
 * « Suivi » : one reference opens one file, whichever family it belongs to.
 * A quote and a print request are followed on the same page, so nobody has to
 * guess which door their reference came from.
 */
export default function Suivi() {
  const { t } = useLang();
  useSeo({ page: 'suivi', path: '/suivi' });
  useReveal();
  useScrollRestore('/suivi');

  return (
    <>
      <Nav variant="page" />
      <main className="page-main">
        <section className="dir-hero">
          <p className="stamp">{t('sv.stamp')}</p>
          <h1 className="page-h1">{t('sv.title')}</h1>
          <p className="lede">{t('sv.lede')}</p>
          {/* Le repère de pose : le suivi de dossier dit son reste sur les
              seules clés `sv.` qu'il traverse, avant qu'on saisisse une
              référence. Il se tait quand tout est posé. */}
          <PoseRestante fichier="dict.suivi.ts" prefixes={['sv.']} />
        </section>

        <section className="dir-body">
          {/* Le parcours de l'annuaire, rappelé en tête : avant même de saisir
              une référence, le visiteur retrouve la dernière liste qu'il a
              ouverte, et les lieux qu'il a traversés pour y arriver. Le
              chiffre des carnets ouvre le relevé, à côté de la phrase
              d'arrivée, pour se lire dès l'ouverture du dossier. */}
          <div className="sv-walk">
            {/* En arrivant ici, le visiteur ne sait pas ce que le relevé tient :
                il le dit à voix basse, une fois, combien de lieux il rappelle. */}
            <RegionWalk announceOnMount headCount />
          </div>

          <div className="of-sec">
            <SuiviLookup />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}