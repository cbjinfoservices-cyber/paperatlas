import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useAuth } from '@/auth/AuthProvider';
import type { B2bTarget } from '@/lib/b2b';
import { entreprises } from '@/mocks/entreprises';
import ShopPicker from '@/pages/demande-b2b/components/ShopPicker';
import PoseRestante from '@/components/feature/PoseRestante';
import MarcheForm from './components/MarcheForm';
import '@/pages/demande-b2b/b2b.css';

const MAX = 5;

/**
 * Le guichet des marchés publics, sur sa propre page.
 *
 * La carte « Marchés publics » de la page Demandes menait au formulaire du
 * grand tirage : le même lien, un vocabulaire qui n'était pas le sien. Ici le
 * dépôt parle comme un dossier — acheteur public, lot, date limite de remise —
 * et chaque ligne part avec sa nature, pour que l'atelier la lise pour ce
 * qu'elle est.
 */
export default function DemandeMarche() {
  const { t } = useLang();
  useSeo({ page: 'marche', path: '/demande-marche' });
  useReveal();
  const { session } = useAuth();
  const [params] = useSearchParams();
  const [selected, setSelected] = useState<B2bTarget[]>([]);
  const [reference, setReference] = useState('');
  /** Atelier ouvert depuis sa fiche, gardé dans la liste tant qu'on ne le retire pas. */
  const [preset, setPreset] = useState<B2bTarget | null>(null);
  const applied = useRef('');

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
          <p className="stamp">{t('mar.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('mar.title') }} />
          <p className="lede">{t('mar.lede')}</p>

          {/* Le repère de pose : les textes du guichet des marchés publics, et
              ce qu'il en reste à poser en arabe et en anglais. Il se tait
              quand tout est fait. */}
          <PoseRestante fichier="dict.marche.ts" prefixes={['mar.']} />

          {/* Les pièces du dossier, puis la porte de retour aux deux guichets. */}
          <div className="b2b-uses-row">
            <ul className="b2b-uses" aria-label={t('mar.piecesLabel')}>
              <li>
                <i className="ri-file-text-line" aria-hidden="true"></i>
                <span>{t('mar.piece1')}</span>
              </li>
              <li>
                <i className="ri-table-line" aria-hidden="true"></i>
                <span>{t('mar.piece2')}</span>
              </li>
              <li>
                <i className="ri-folder-shield-2-line" aria-hidden="true"></i>
                <span>{t('mar.piece3')}</span>
              </li>
              <li>
                <i className="ri-hashtag" aria-hidden="true"></i>
                <span>{t('mar.piece4')}</span>
              </li>
            </ul>
            <Link className="b2b-learn" to="/demandes" title={t('mar.backHint')}>
              <i className="ri-arrow-left-line" aria-hidden="true"></i>
              {t('mar.back')}
            </Link>
          </div>
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
              <MarcheForm
                selected={selected}
                reference={reference}
                onSent={setReference}
                onReset={resetAll}
              />

              <aside className="pro-card b2b-how" data-reveal>
                <h2 className="pro-h">{t('mar.asideTitle')}</h2>
                <ol className="b2b-steps">
                  <li>
                    <span aria-hidden="true">01</span>
                    <p>{t('mar.aside1')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">02</span>
                    <p>{t('mar.aside2')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">03</span>
                    <p>{t('mar.aside3')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">04</span>
                    <p>{t('mar.aside4')}</p>
                  </li>
                </ol>

                <h3 className="pro-h b2b-how-next">{t('mar.howTitle')}</h3>
                <ol className="b2b-steps">
                  <li>
                    <span aria-hidden="true">01</span>
                    <p>{t('mar.how1')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">02</span>
                    <p>{t('mar.how2')}</p>
                  </li>
                  <li>
                    <span aria-hidden="true">03</span>
                    <p>{t('mar.how3')}</p>
                  </li>
                </ol>

                <p className="pro-note">
                  <i className="ri-shield-check-line" aria-hidden="true"></i>
                  {t('mar.trust')}
                </p>

                <div className="b2b-how-links">
                  <Link to="/demande-b2b" className="ghost-link" title={t('mar.linkRunHint')}>
                    {t('mar.linkRun')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                  <Link to="/suivi" className="ghost-link">
                    {t('mar.linkTrack')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                  {session ? (
                    <Link to="/compte#demandes-b2b" className="ghost-link">
                      {t('b2b.toAccount')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                  ) : (
                    <Link to="/annuaire" className="ghost-link">
                      {t('mar.seeDirectory')}
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