import { useLang } from '@/i18n/LangProvider';

export default function Chapter() {
  const { t } = useLang();

  return (
    <section
      className="chapter"
      data-label="Une commande, de la presse à la palette"
      style={{ ['--beat-count' as string]: 5 }}
    >
      <div className="stage">
        {/* Deux photos pour une même scène : le grand cadre reçoit la vue
            large, le téléphone reçoit une vue verticale composée pour lui. Sur
            un écran étroit, la photo large n'était plus qu'un mince bandeau
            prélevé au centre de l'atelier ; ici, l'imprimeur, ses reliures et
            la verrière sont cadrés dès la prise de vue, dans une image haute,
            et la place laissée en bas reçoit le titre sans le couvrir. */}
        <picture>
          <source
            media="(max-width: 780px)"
            srcSet="/media/hero-portrait.jpg"
          />
          <img
            className="plate"
            src="/media/hero-landscape.jpg"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            alt="Imprimeur examinant des livres reliés dans un atelier baigné de soleil, presses offset et palettes autour de lui."
          />
        </picture>
        <div className="veil" aria-hidden="true"></div>
        <div className="veil veil-light" aria-hidden="true"></div>
        <div className="beat" data-from="0" data-to=".1429" data-pos="left" data-depth="soft" data-tone="dark" data-motion="track" id="overview">
          <p className="stamp">{t('b1.stamp')}</p>
          <h1 className="sr-only">{t('b1.h1')}</h1>
          <h2 className="hero-h" data-split="lines" dangerouslySetInnerHTML={{ __html: t('b1.title') }} />
          <p className="sub">{t('b1.sub')}</p>
          <a className="cta" href="#annuaire">{t('b1.cta')} <i className="ri-arrow-right-line"></i></a>
        </div>
        <div className="beat" data-from=".1429" data-to=".3571" data-pos="left" data-depth="soft" data-tone="dark" data-motion="drift" id="besoin">
          <p className="stamp">{t('b2.stamp')}</p>
          <h2 data-split="lines" dangerouslySetInnerHTML={{ __html: t('b2.title') }} />
          <p className="sub">{t('b2.sub')}</p>
          <ul className="points">
            <li>{t('b2.p1')}</li>
            <li>{t('b2.p2')}</li>
            <li>{t('b2.p3')}</li>
          </ul>
        </div>
        <div className="beat" data-from=".3571" data-to=".4286" data-pos="center" data-depth="soft" data-tone="light" data-motion="rise" id="promesse">
          <p className="stamp">{t('b3.stamp')}</p>
          <h2 data-split="lines" dangerouslySetInnerHTML={{ __html: t('b3.title') }} />
        </div>
        <div className="beat" data-from=".4286" data-to=".7143" data-pos="left" data-depth="soft" data-tone="dark" data-motion="zoom" id="devis">
          <p className="stamp">{t('b4.stamp')}</p>
          <h2 data-split="lines" dangerouslySetInnerHTML={{ __html: t('b4.title') }} />
          <p className="sub">{t('b4.sub')}</p>
          <ul className="chips" data-side="right">
            <li>{t('b4.c1')}</li>
            <li>{t('b4.c2')}</li>
            <li>{t('b4.c3')}</li>
          </ul>
        </div>
        <div className="beat" data-from=".7143" data-to="1" data-pos="left" data-depth="soft" data-tone="dark" data-motion="drift" id="livraison">
          <p className="stamp">{t('b5.stamp')}</p>
          <h2 data-split="lines" dangerouslySetInnerHTML={{ __html: t('b5.title') }} />
          <p className="sub">{t('b5.sub')}</p>
          <a className="cta" href="#contact">{t('b5.cta')} <i className="ri-arrow-right-line"></i></a>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span className="mouse"></span>{t('b1.cue')}</div>
      </div>
    </section>
  );
}