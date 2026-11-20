import { Link } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useScrollRestore } from '@/hooks/useScrollRestore';
import PoseRestante from '@/components/feature/PoseRestante';
import '@/styles/legal.css';

type Props = { kind: 'mentions' | 'confidentialite' };

/**
 * Les deux pages légales, sur la même trame : un en-tête, les articles
 * numérotés, puis la façon de nous écrire.
 *
 * Le texte vient du dictionnaire, dans la langue de lecture — les mentions
 * légales se lisent dans la langue du visiteur, pas dans celle du document de
 * travail. Les seuls champs laissés ouverts sont ceux qui dépendent de la
 * structure qui édite le site : ils sont signalés en haut de page.
 */
export default function LegalDoc({ kind }: Props) {
  const { t } = useLang();
  const mentions = kind === 'mentions';
  const prefix = mentions ? 'lg.m' : 'lg.c';
  const path = mentions ? '/mentions-legales' : '/confidentialite';
  const other = mentions ? '/confidentialite' : '/mentions-legales';
  const otherLabel = mentions ? t('foot.legalPrivacy') : t('foot.legalMentions');
  const count = mentions ? 7 : 8;

  useSeo({ page: mentions ? 'legal' : 'privacy', path });
  useReveal();
  useScrollRestore(path);

  const sections = Array.from({ length: count }, (_, index) => ({
    numero: index + 1,
    titre: t(`${prefix}.s${index + 1}t`),
    corps: t(`${prefix}.s${index + 1}b`),
  }));

  return (
    <>
      <Nav variant="page" />
      <main className="page-main legal-page">
        <section className="dir-hero">
          <p className="stamp">{t('lg.stamp')}</p>
          <h1 className="page-h1">{t(`${prefix}.title`)}</h1>
          <p className="lede">{t(`${prefix}.lede`)}</p>
          <p className="legal-updated">
            <i className="ri-calendar-check-line" aria-hidden="true"></i>
            {t('lg.updated')}
          </p>
          {/* Le repère de pose des deux pages légales : les seules clés `lg.`
              de dict.legal.ts, que cet écran traverse vraiment. Une fois tout
              posé, il se tait. */}
          <PoseRestante
            fichier="dict.legal.ts"
            prefixes={['lg.']}
            className="legal-pose"
          />
        </section>

        <section className="dir-body">
          <article className="legal-doc">
            <p className="legal-note" role="note">
              <i className="ri-information-line" aria-hidden="true"></i>
              <span>{t(`${prefix}.note`)}</span>
            </p>

            <ol className="legal-secs">
              {sections.map((section) => (
                <li key={section.numero} id={`article-${section.numero}`}>
                  <h2>
                    <span className="legal-sec-n" aria-hidden="true">
                      {String(section.numero).padStart(2, '0')}
                    </span>
                    {section.titre}
                  </h2>
                  <p>{section.corps}</p>
                </li>
              ))}
            </ol>

            <div className="legal-foot">
              <div className="legal-cta">
                <p className="legal-cta-title">{t('lg.contactTitle')}</p>
                <p className="legal-cta-text">{t('lg.contactText')}</p>
                <a className="legal-cta-btn" href="mailto:contact@paperatlas.net">
                  <i className="ri-mail-line" aria-hidden="true"></i>
                  <span className="whitespace-nowrap">{t('lg.contactCta')}</span>
                </a>
                <a className="legal-cta-mail" href="mailto:contact@paperatlas.net">
                  contact@paperatlas.net
                </a>
              </div>
              <div className="legal-side">
                <p className="legal-side-lbl">{t('lg.siblings')}</p>
                <Link to={other} className="legal-side-link">
                  <i className={mentions ? 'ri-shield-keyhole-line' : 'ri-file-text-line'} aria-hidden="true"></i>
                  <span>{otherLabel}</span>
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
                <Link to="/" className="legal-side-back">
                  <i className="ri-arrow-left-line" aria-hidden="true"></i>
                  <span>{t('lg.back')}</span>
                </Link>
              </div>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}