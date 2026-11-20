import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import DirRecallChip from './DirRecallChip';
import MarchesChips from '@/components/feature/MarchesChips';
import LatestBoard from './LatestBoard';
import PlanCards from '@/pages/offres/components/PlanCards';
import HomeVoices from '@/pages/offres/components/HomeVoices';
import FaqTarifs from '@/pages/offres/components/FaqTarifs';

export default function Panels() {
  const { t } = useLang();

  return (
    <>
      <section className="panel manifesto" id="vision">
        <span className="panel-accent" aria-hidden="true" data-parallax="0.55" style={{ left: '6vw', top: '18%' }}>AR</span>
        <p className="manifesto-text" data-words dangerouslySetInnerHTML={{ __html: t('man.text') }} />
      </section>

      <section className="panel" data-side="left" id="annuaire">
        <img className="panel-bg" data-parallax="0.32" alt="Vue aérienne d’une ville arabe au crépuscule, toits et baie, carte vivante des acteurs de l’impression et de l’édition" title="Cartographie des imprimeries et éditeurs du monde arabe" src="https://readdy.ai/api/search-image?query=Cinematic%20wide%20aerial%20view%20of%20Algiers%20white%20city%20and%20bay%20at%20warm%20amber%20dusk%2C%20main%20city%20lights%20in%20the%20right%20third%20of%20the%20frame%2C%20the%20left%20half%20calm%20dark%20sea%20and%20soft%20hazy%20sky%2C%20dusty%20warm%20brown%20tones%2C%20no%20text&width=2400&height=1350&seq=pa-panel-map&orientation=landscape" />
        <div className="panel-veil"></div>
        <span className="panel-accent" aria-hidden="true" data-parallax="0.55" style={{ right: '8vw', bottom: '12%' }}>22</span>
        <div className="panel-copy" data-parallax="-0.08">
          <p className="stamp" data-reveal>{t('map.stamp')}</p>
          <h2 data-reveal dangerouslySetInnerHTML={{ __html: t('map.title') }} />
          <p className="sub" data-reveal>{t('map.sub')}</p>
          <div className="chip-row" data-reveal>
            <span>{t('map.c1')}</span><span>{t('map.c2')}</span><span>{t('map.c3')}</span>
            <span>{t('map.c4')}</span><span>{t('map.c5')}</span><span>{t('map.c6')}</span>
          </div>
          <div className="pull" data-reveal>
            <p>{t('map.pull')}</p>
          </div>
          <DirRecallChip />
          <MarchesChips />
          <Link className="cta" to="/annuaire?view=map" data-reveal>{t('map.cta')} <i className="ri-arrow-right-line"></i></Link>
        </div>
      </section>

      <LatestBoard />

      <section className="panel" data-side="right" id="soustraitance">
        <img className="panel-bg" data-parallax="0.32" alt="Atelier de reliure artisanal avec presses et piles de cahiers" title="Façonnage et sous-traitance inter-établissements" src="https://readdy.ai/api/search-image?query=Wide%20cinematic%20photo%20of%20an%20old%20bookbinding%20workshop%20with%20cast%20iron%20press%20and%20stacks%20of%20folded%20signatures%20in%20the%20left%20third%20of%20the%20frame%2C%20the%20right%20half%20a%20calm%20dark%20shadowed%20brick%20wall%2C%20warm%20amber%20window%20light%2C%20dust%20in%20air%2C%20brown%20tones%2C%20no%20text&width=2400&height=1350&seq=pa-panel-bindery&orientation=landscape" />
        <div className="panel-veil"></div>
        <div className="panel-copy panel-copy--list" data-parallax="-0.08">
          <p className="stamp" data-reveal>{t('sub.stamp')}</p>
          <h2 data-reveal dangerouslySetInnerHTML={{ __html: t('sub.title') }} />
          <p className="sub" data-reveal>{t('sub.lede')}</p>
          <ul className="rule-list">
            <li data-reveal><span className="idx">01</span><h3>{t('sub.i1t')}</h3><p>{t('sub.i1p')}</p></li>
            <li data-reveal><span className="idx">02</span><h3>{t('sub.i2t')}</h3><p>{t('sub.i2p')}</p></li>
            <li data-reveal><span className="idx">03</span><h3>{t('sub.i3t')}</h3><p>{t('sub.i3p')}</p></li>
            <li data-reveal><span className="idx">04</span><h3>{t('sub.i4t')}</h3><p>{t('sub.i4p')}</p></li>
          </ul>
          {/* La section ne s'arrête plus sur un constat : les deux portes qui
              la prolongent sont posées sous la liste — déposer la demande, ou
              trouver l'atelier qui la prendra. */}
          <div className="sub-doors" data-reveal>
            <Link className="cta" to="/demande-b2b">
              <i className="ri-inbox-archive-line" aria-hidden="true"></i>
              {t('sub.cta')}
            </Link>
            <Link className="ghost-btn sub-door-alt" to="/annuaire?trade=faconnage">
              <i className="ri-scissors-cut-line" aria-hidden="true"></i>
              {t('sub.ctaAlt')}
            </Link>
          </div>
          {/* Le guichet ne sert pas qu'à la sous-traitance : la ligne le dit
              sans crier, sous les deux portes, pour que le visiteur n'aille
              pas chercher ailleurs un formulaire qu'il a déjà sous les yeux. */}
          <p className="sub-note" data-reveal>
            <i className="ri-information-line" aria-hidden="true"></i>
            {t('sub.note')}
          </p>
        </div>
      </section>

      <section className="panel" data-side="bottom" id="offres">
        <img className="panel-bg" data-parallax="0.32" alt="Bibliothèque universitaire aux rayonnages de bois dans une lumière dorée" title="Auteurs, appels d'offres et abonnements PaperAtlas" src="https://readdy.ai/api/search-image?query=Wide%20cinematic%20view%20of%20a%20grand%20old%20library%20with%20tall%20wooden%20bookshelves%20and%20arched%20window%20glowing%20amber%20in%20the%20upper%20half%20of%20the%20frame%2C%20lower%20third%20dark%20empty%20wooden%20floor%20in%20shadow%2C%20dusty%20warm%20brown%20tones%2C%20no%20people%2C%20no%20text&width=2400&height=1350&seq=pa-panel-library&orientation=landscape" />
        <div className="panel-veil"></div>
        <div className="panel-copy panel-copy--wide" data-parallax="-0.08">
          <p className="stamp" data-reveal>{t('off.stamp')}</p>
          <h2 data-reveal dangerouslySetInnerHTML={{ __html: t('off.title') }} />
          <p className="sub" data-reveal>{t('ofp.lede')}</p>
          <PlanCards compact />
          <HomeVoices />
          <div className="of-home-faq" data-reveal>
            <div className="of-home-faq-head">
              <h3>{t('ofp.faqTitle')}</h3>
              <p>{t('ofh.faqLead')}</p>
            </div>
            <FaqTarifs compact defaultOpen={null} />
          </div>
          <div className="of-plans-foot" data-reveal>
            <p className="of-plans-note">{t('off.note')}</p>
            <Link className="of-more" to="/offres">
              {t('off.compare')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}