import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { jour } from './adminTypes';
import { preuveAgeJours } from './adminMailMemory';
import './admin-mail.css';

/** L'état de l'expéditeur, tel que la fonction serveur le rend : la clé et le
 *  domaine vivent dans les secrets de Supabase, jamais dans la page. */
export type MailEtat = {
  configured: boolean;
  key: boolean;
  domain: string;
  admin: string;
};

/** Les quatre étapes du guide, dans l'ordre où elles se font. */
export const MAIL_ETAPES_TOTAL = 4;

/**
 * Combien d'étapes sont réellement en place.
 *
 * Le compte se fait sur les faits, pas sur les cases : la clé posée couvre
 * l'étape qui la crée et celle qui la range dans Supabase, le domaine nommé
 * couvre la troisième, et seule une preuve reçue couvre la quatrième. La
 * carte de l'expéditeur lit ce chiffre sans dérouler le guide.
 */
export function etapesEnPlace(etat: MailEtat | null, testOk: boolean): number {
  const cle = Boolean(etat?.key);
  const domaine = Boolean(etat?.domain);
  return [cle, cle, domaine, testOk].filter(Boolean).length;
}

/**
 * La première étape qui n'est pas encore tenue.
 *
 * Le compteur de la carte ouvre le guide sur elle : on ne relit pas les
 * quatre étapes pour retrouver celle qui manque. Zéro veut dire que les
 * quatre sont en place.
 */
export function premiereEtapeManquante(etat: MailEtat | null, testOk: boolean): number {
  if (!etat?.key) return 1;
  if (!etat?.domain) return 3;
  if (!testOk) return 4;
  return 0;
}

type Etape = {
  n: number;
  fait: boolean;
  titre: string;
  texte: string;
  /** Le nom exact du secret, quand l'étape consiste à le poser. */
  secret?: string;
  lien?: { href: string; label: string };
  /** Le jour de la preuve, quand cette étape en porte une. */
  date?: string | null;
};

/**
 * Le guide de l'expéditeur : quatre étapes, dans l'ordre où elles se font.
 *
 * La carte ne devine rien. Chaque étape se juge sur un fait lisible côté
 * serveur — la clé est-elle posée, le domaine est-il nommé —, et la dernière
 * ne se juge que sur un message réellement reçu : c'est le seul geste qui
 * prouve que le domaine est vérifié chez Resend. Ce message porte son jour :
 * une preuve datée se relit, une preuve nue ne dit pas si elle tient encore.
 */
export default function AdminMailGuide({
  etat,
  testOk,
  testDate = null,
  focusEtape = null,
  focusKey = 0,
}: {
  etat: MailEtat | null;
  testOk: boolean;
  testDate?: string | null;
  /** L'étape que le compteur de la carte a demandé d'ouvrir. */
  focusEtape?: number | null;
  /** Un compteur d'appuis : deux clics sur le même chiffre rallument le
   *  repère au lieu de laisser le premier seul. */
  focusKey?: number;
}) {
  const { t, lang } = useLang();
  const stepsRef = useRef<Array<HTMLLIElement | null>>([]);

  /* Le compteur de la carte nomme l'étape à ouvrir : le guide la rejoint et
     l'allume, sans faire relire les quatre. */
  useEffect(() => {
    if (!focusEtape) return;
    const node = stepsRef.current[focusEtape - 1];
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    node.focus({ preventScroll: true });
  }, [focusEtape, focusKey]);

  const cle = Boolean(etat?.key);
  const domaine = Boolean(etat?.domain);

  /* L'âge de la preuve, dit en jours : une date seule oblige à compter de
     tête, l'âge se lit. Au-delà d'un mois, la preuve perd sa valeur — le
     domaine a pu changer, la clé aussi —, et le guide le dit calmement. */
  const age = testOk ? preuveAgeJours(testDate) : null;
  const ageMots =
    age === null
      ? ''
      : age === 0
        ? t('ad.p.mail.gAgeToday')
        : age === 1
          ? t('ad.p.mail.gAgeOne')
          : t('ad.p.mail.gAge').replace('{n}', String(age));
  const preuveAncienne = age !== null && age > 30;

  const etapes: Etape[] = [
    {
      n: 1,
      fait: cle,
      titre: t('ad.p.mail.g1Title'),
      texte: t('ad.p.mail.g1Text'),
      lien: { href: 'https://resend.com/api-keys', label: t('ad.p.mail.g1Link') },
    },
    {
      n: 2,
      fait: cle,
      titre: t('ad.p.mail.g2Title'),
      texte: t('ad.p.mail.g2Text'),
      secret: 'RESEND_API_KEY',
      lien: {
        href: 'https://supabase.com/dashboard/project/_/settings/functions',
        label: t('ad.p.mail.g2Link'),
      },
    },
    {
      n: 3,
      fait: domaine,
      titre: t('ad.p.mail.g3Title'),
      texte: t('ad.p.mail.g3Text'),
      secret: 'RESEND_FROM_DOMAIN',
      lien: { href: 'https://resend.com/domains', label: t('ad.p.mail.g3Link') },
    },
    {
      n: 4,
      fait: testOk,
      titre: t('ad.p.mail.g4Title'),
      texte: t('ad.p.mail.g4Text'),
      date: testOk ? testDate : null,
    },
  ];

  const faits = etapesEnPlace(etat, testOk);

  return (
    <section className="mail-guide" aria-labelledby="mail-guide-title">
      <div className="mail-guide-head">
        <div className="mail-guide-head-txt">
          <h3 className="mail-guide-title" id="mail-guide-title">
            {t('ad.p.mail.guideTitle')}
          </h3>
          <p className="mail-guide-sub">{t('ad.p.mail.guideSub')}</p>
        </div>
        <span
          className="mail-guide-count"
          data-tone={faits === etapes.length ? 'ok' : 'soft'}
          aria-live="polite"
        >
          <i
            className={faits === etapes.length ? 'ri-check-double-line' : 'ri-route-line'}
            aria-hidden="true"
          ></i>
          {t('ad.p.mail.guideCount').replace('{n}', String(faits)).replace('{total}', String(MAIL_ETAPES_TOTAL))}
        </span>
      </div>

      <ol className="mail-steps">
        {etapes.map((etape) => (
          <li
            className="mail-step"
            key={etape.n}
            data-fait={etape.fait ? 'yes' : 'no'}
            data-focus={focusEtape === etape.n ? 'yes' : 'no'}
            tabIndex={focusEtape === etape.n ? -1 : undefined}
            ref={(node) => {
              stepsRef.current[etape.n - 1] = node;
            }}
          >
            <span className="mail-step-n" aria-hidden="true">
              {etape.fait ? <i className="ri-check-line"></i> : etape.n}
            </span>
            <div className="mail-step-body">
              <p className="mail-step-top">
                <b className="mail-step-title">{etape.titre}</b>
                {focusEtape === etape.n && (
                  <span className="mail-step-next">{t('ad.p.mail.gNext')}</span>
                )}
                <span className="mail-step-state">
                  {etape.fait ? t('ad.p.mail.gFait') : t('ad.p.mail.gAfaire')}
                </span>
              </p>
              <p className="mail-step-txt">{etape.texte}</p>
              <p className="mail-step-foot">
                {etape.secret && <code className="mail-step-secret">{etape.secret}</code>}
                {etape.lien && (
                  <a
                    className="mail-step-link"
                    href={etape.lien.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{etape.lien.label}</span>
                    <i className="ri-external-link-line" aria-hidden="true"></i>
                  </a>
                )}
                {/* Le jour du test, puis son âge : la preuve ne dit plus
                    seulement qu'elle existe, elle dit depuis quand elle tient
                    et depuis combien de temps. */}
                {etape.date && (
                  <>
                    <span className="mail-step-date">
                      <i className="ri-calendar-check-line" aria-hidden="true"></i>
                      {t('ad.p.mail.gDoneOn').replace('{date}', jour(etape.date, lang))}
                    </span>
                    {ageMots && (
                      <span className="mail-step-age">
                        <i className="ri-time-line" aria-hidden="true"></i>
                        {ageMots}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* La preuve qui a plus d'un mois ne se garde pas comme une preuve
          fraîche : le rappel le dit sans alarmer, et le geste reste le même —
          relancer un test. */}
      {preuveAncienne && (
        <p className="mail-guide-old">
          <i className="ri-time-line" aria-hidden="true"></i>
          <span>{t('ad.p.mail.gAncienne')}</span>
        </p>
      )}

      <p className="mail-guide-note">
        <i className="ri-book-open-line" aria-hidden="true"></i>
        <span>{t('ad.p.mail.gNote')}</span>
      </p>

      {/* La porte de l'autre côté du même sujet : le chantier des e-mails tel
          qu'il pèse dans le suivi du projet, ouvert d'un clic sans repasser
          par les onglets de la console. */}
      <div className="mail-guide-door-row">
        <Link className="mail-guide-door" to="/admin?section=suivi&chantier=mail">
          <i className="ri-road-map-line" aria-hidden="true"></i>
          <span>{t('ad.p.mail.gToSuivi')}</span>
          <i className="ri-arrow-right-line" aria-hidden="true"></i>
        </Link>
      </div>
    </section>
  );
}