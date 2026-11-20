import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import WorldRecall from '@/components/feature/WorldRecall';
import PoseRestante from '@/components/feature/PoseRestante';
import GuichetCard from './components/GuichetCard';
import '@/styles/guichets.css';

/* Le contact vit en bas de l'accueil : l'ancre a besoin du préfixe du site
   pour être rejointe depuis n'importe quelle page. */
const BASE = __BASE_PATH__.replace(/\/$/, '');

/**
 * « Demandes » : les guichets du réseau, sur une page à eux — le grand tirage
 * et la sous-traitance, puis les marchés publics.
 *
 * La barre menait jusqu'ici à un temps du film : la porte ne s'ouvrait que sur
 * l'accueil et ne faisait que remonter un plan déjà lu. Elle ouvre désormais
 * une vraie page, qui dit d'emblée par où passer et ce qui suit l'envoi.
 */
export default function Demandes() {
  const { t } = useLang();
  useSeo({ page: 'guichets', path: '/demandes' });
  useReveal();
  const [params] = useSearchParams();
  /* La porte « Les trois guichets » d'Arabe World laisse sa trace dans
     l'adresse : la page dit une fois d'où l'on arrive, avec le retour. */
  const viaWorld = params.get('via') === 'world';

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero gui-hero">
          <p className="stamp">{t('gui.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('gui.title') }} />
          <p className="lede">{t('gui.lede')}</p>
          {/* Le repère de pose : chaque guichet dit son reste sur
              ses propres clés, avant qu’on ouvre une demande. Un clic ouvre
              le relevé de parité déjà resserré sur ce fichier et cette
              famille ; la pastille se tait une fois tout posé. */}
          <PoseRestante
            fichier="dict.guichets.ts"
            prefixes={['gui.']}
            vers="/admin?section=suivi&parite=dict.guichets.ts&fam=gui."
          />
          <p className="gui-note" data-reveal>
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            <span>{t('gui.note')}</span>
          </p>
        </section>

        <section className="dir-body">
          {viaWorld && <WorldRecall subject={t('world.viaGuichets')} />}

          <div className="gui-grid">
            <GuichetCard
              index="01"
              icon="ri-stack-line"
              tag={t('gui.runTag')}
              title={t('gui.runH')}
              body={t('gui.runP')}
              bullets={[t('gui.runB1'), t('gui.runB2'), t('gui.runB3')]}
              cta={t('gui.runCta')}
              to="/demande-b2b"
            />
            <GuichetCard
              index="02"
              icon="ri-file-list-3-line"
              tag={t('gui.tenderTag')}
              title={t('gui.tenderH')}
              body={t('gui.tenderP')}
              bullets={[t('gui.tenderB1'), t('gui.tenderB2'), t('gui.tenderB3')]}
              cta={t('gui.tenderCta')}
              to="/demande-marche"
            />
          </div>

          {/* Le renvoi discret, sous les deux guichets : ceux qui venaient
              chercher un devis d’abonnement trouvent leur porte ici, sans
              qu’elle prenne le poids d’une carte. Il suit la grille, aligné
              au bout du rang, et ne paraît qu’une fois les deux cartes lues. */}
          <p className="gui-aside" data-reveal>
            <Link
              className="gui-aside-link"
              to="/offres"
              title={t('gui.quoteHintFull')}
            >
              {/* Le même couple de signes que le renvoi posé sous les
                  formules, pour que les deux lignes se répondent exactement :
                  deux petits cercles chevauchés, et non un jeton unique. Ici
                  les signes disent ce qu'on trouve là-bas — le tarif des
                  formules et leur comparaison —, de la même façon que ceux
                  des formules disent les deux guichets. */}
              <span className="gui-aside-marks" aria-hidden="true">
                <span className="gui-aside-mark">
                  <i className="ri-price-tag-3-line"></i>
                </span>
                <span className="gui-aside-mark">
                  <i className="ri-scales-3-line"></i>
                </span>
              </span>
              <span className="gui-aside-txt">{t('gui.quoteHint')}</span>
              <i className="ri-arrow-right-line gui-aside-go" aria-hidden="true"></i>
              <span className="gui-aside-cta">{t('gui.quoteHintCta')}</span>
            </Link>
          </p>

          <section className="gui-after" data-reveal>
            <div className="gui-after-h">
              <p className="gui-kicker">{t('gui.afterKicker')}</p>
              <h2 className="gui-h2">{t('gui.afterTitle')}</h2>
            </div>
            <ol className="gui-steps">
              <li className="gui-step">
                <span className="gui-step-n">01</span>
                <p>{t('gui.after1')}</p>
              </li>
              <li className="gui-step">
                <span className="gui-step-n">02</span>
                <p>{t('gui.after2')}</p>
              </li>
              <li className="gui-step">
                <span className="gui-step-n">03</span>
                <p>{t('gui.after3')}</p>
              </li>
            </ol>
            <div className="gui-links">
              <Link className="gui-link" to="/suivi">
                <i className="ri-truck-line" aria-hidden="true"></i>
                {t('gui.trackCta')}
              </Link>
              <Link className="gui-link" to="/annuaire">
                <i className="ri-building-4-line" aria-hidden="true"></i>
                {t('gui.dirCta')}
              </Link>
              <a className="gui-link" href={`${BASE}/#contact`}>
                <i className="ri-survey-line" aria-hidden="true"></i>
                {t('gui.contactCta')}
              </a>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}