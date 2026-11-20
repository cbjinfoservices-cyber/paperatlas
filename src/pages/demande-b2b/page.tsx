import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useAuth } from '@/auth/AuthProvider';
import type { B2bTarget } from '@/lib/b2b';
import { entreprises } from '@/mocks/entreprises';
import PoseRestante from '@/components/feature/PoseRestante';
import ShopPicker from './components/ShopPicker';
import RequestForm from './components/RequestForm';
import './b2b.css';

const MAX = 5;

/* Les portes de section de la page d'accueil s'écrivent avec le préfixe du
   site : un lien React Router vers « /#soustraitance » ne ferait pas défiler
   la page, alors que l'ancre le fait — et le chapitre 07 s'ouvre sous les yeux. */
const BASE = __BASE_PATH__.replace(/\/$/, '');

/**
 * The public B2B request page: pick the workshops, describe the need once, and
 * the request lands in each workshop's account inbox.
 */
export default function DemandeB2b() {
  const { t } = useLang();
  useSeo({ page: 'b2b', path: '/demande-b2b' });
  useReveal();
  const { session } = useAuth();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<B2bTarget[]>([]);
  const [reference, setReference] = useState('');
  /** Workshop opened from its own profile, kept in the list until removed. */
  const [preset, setPreset] = useState<B2bTarget | null>(null);
  const applied = useRef('');

  /* Arriving from a directory card or a profile: that workshop is already in. */
  useEffect(() => {
    const atelier = (params.get('atelier') ?? '').trim();
    if (!atelier || applied.current === atelier) return;
    const shop = entreprises.find((e) => e.id === atelier);
    if (!shop) return;
    applied.current = atelier;
    const target: B2bTarget = { id: shop.id, name: shop.name };
    setPreset(target);
    setSelected((prev) => (prev.some((item) => item.id === target.id) || prev.length >= MAX ? prev : [...prev, target]));
  }, [params]);

  const toggle = (target: B2bTarget) => {
    setSelected((prev) => {
      const found = prev.some((item) => item.id === target.id);
      if (found) return prev.filter((item) => item.id !== target.id);
      if (prev.length >= MAX) return prev;
      return [...prev, target];
    });
  };

  const resetAll = () => {
    setSelected([]);
    setReference('');
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('b2b.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('b2b.title') }} />
          <p className="lede">{t('b2b.lede')}</p>
          {/* Les trois usages du même guichet, rappelés sous le titre : le
              visiteur sait d'emblée qu'il n'est pas sur une page réservée à
              la sous-traitance. Puis le lien remonte au chapitre 07 de
              l'accueil, où le principe est raconté. */}
          <div className="b2b-uses-row">
            <ul className="b2b-uses" aria-label={t('b2b.usesLabel')}>
              <li>
                <i className="ri-stack-line" aria-hidden="true"></i>
                <span>{t('b2b.useRun')}</span>
              </li>
              <li>
                <i className="ri-links-line" aria-hidden="true"></i>
                <span>{t('b2b.useSub')}</span>
              </li>
              <li>
                <i className="ri-file-list-3-line" aria-hidden="true"></i>
                <span>{t('b2b.useTender')}</span>
              </li>
            </ul>
            <a className="b2b-learn" href={`${BASE}/#soustraitance`}>
              <i className="ri-book-open-line" aria-hidden="true"></i>
              {t('b2b.understand')}
              <i className="ri-arrow-right-up-line" aria-hidden="true"></i>
            </a>
          </div>
          {/* Le repère de pose : combien des textes de ce guichet restent à
              traduire, lu sur les clés que la page traverse vraiment. Il se
              tait une fois tout posé. */}
          <PoseRestante fichier="dict.b2b.ts" prefixes={['b2b.']} />
        </section>

        <section className="dir-body">
          {preset && selected.some((item) => item.id === preset.id) && (
            <p className="b2b-preset" role="status">
              <i className="ri-focus-3-line" aria-hidden="true"></i>
              <span>
                {t('b2b.preselected')} · <strong>{preset.name}</strong>
              </span>
              <button type="button" className="b2b-preset-x" onClick={() => toggle(preset)}>
                <i className="ri-close-line" aria-hidden="true"></i>
                {t('b2b.preselectedDrop')}
              </button>
            </p>
          )}
          <div className="b2b-grid">
            <ShopPicker
              selected={selected}
              max={MAX}
              onToggle={toggle}
              onClear={() => setSelected([])}
            />

            <div className="b2b-side">
              <RequestForm
                selected={selected}
                reference={reference}
                onSent={setReference}
                onReset={resetAll}
              />

              <aside className="pro-card b2b-how" data-reveal>
                <h2 className="pro-h">{t('b2b.asideTitle')}</h2>
                <ol className="b2b-steps">
                  <li>
                    <span aria-hidden="true">01</span>
                    <p>{t('b2b.aside1')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">02</span>
                    <p>{t('b2b.aside2')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">03</span>
                    <p>{t('b2b.aside3')}</p>
                  </li>
                </ol>
                <p className="pro-note">
                  <i className="ri-shield-check-line" aria-hidden="true"></i>
                  {t('b2b.trust')}
                </p>
                <div className="b2b-how-links">
                  <Link to="/annuaire" className="ghost-link">
                    {t('b2b.seeDirectory')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                  {session ? (
                    <Link to="/compte#demandes-b2b" className="ghost-link">
                      {t('b2b.toAccount')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                  ) : (
                    <Link to="/compte/inscription" className="ghost-link">
                      {t('ct.signupCta')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}