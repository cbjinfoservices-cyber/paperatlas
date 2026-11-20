import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLang } from '@/i18n/LangProvider';
import { jour } from './adminTypes';
import type { MailEtat } from './AdminMailGuide';
import { MODELES_AUTH, SMTP_AUTH, SMTP_URL, apercuArabe, type ModeleAuth } from './adminMailModeles';
import {
  clearAuthPreuve,
  clearB2bTest,
  clearSmtp,
  markAuthPreuve,
  markB2bTest,
  markReleveCopie,
  markSmtp,
  readAuthPreuve,
  readB2bTest,
  readReleveCopie,
  readSmtp,
} from './adminMailMemory';
import './admin-mail.css';

/** Les cinq gestes qui mettent les e-mails de compte au nom de PaperAtlas :
 *  les deux messages d'authentification, puis le rappel B2B à l'atelier. */
const GESTES_TOTAL = 5;

/** Les trois largeurs de téléphone que l'aperçu fait défiler d'un appui :
 *  petit, courant, et le plus large des trois. */
const LARGEURS = [320, 360, 390] as const;

/** Les trois hauteurs de la même fenêtre : la largeur juge la coupe des lignes,
 *  la hauteur juge le défilement — ce qu'on voit d'un message sans faire
glisser le doigt. */
const HAUTEURS = [320, 480, 640] as const;

async function copier(texte: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    /* Un navigateur qui refuse le presse-papiers laisse au moins la valeur
       visible à l'écran, à recopier à la main. */
    return false;
  }
}

/**
 * Les e-mails d'inscription, de mot de passe et de rappel B2B.
 *
 * Les deux premiers ne passent pas par les fonctions du site : c'est Supabase
 * Auth qui les écrit, depuis le SMTP personnalisé du projet. Le troisième est
 * écrit par la fonction du rappel à l'atelier, avec la même clé Resend. La
 * console ne peut donc pas lire leur état — elle montre les valeurs exactes à
 * recopier, retient la déclaration du branchement, et propose deux tests
 * réels : le message reçu, puis le rappel parti, sont les seules preuves qui
 * vaillent.
 */
export default function AdminMailAuth({ etat }: { etat: MailEtat | null }) {
  const { t, lang } = useLang();

  /* La déclaration du SMTP et les deux preuves vivent sur ce poste : ce sont
     des gestes qui se font hors de la page, la carte en garde la trace. */
  const [smtp, setSmtp] = useState<string | null>(() => readSmtp());
  const [preuve, setPreuve] = useState<string | null>(() => readAuthPreuve());
  const [b2b, setB2b] = useState<string | null>(() => readB2bTest());
  const [busy, setBusy] = useState(false);
  const [b2bBusy, setB2bBusy] = useState(false);
  const [note, setNote] = useState('');
  const [noteOk, setNoteOk] = useState(false);
  const [modeleCle, setModeleCle] = useState<ModeleAuth['cle']>('confirmation');
  const [copie, setCopie] = useState('');
  /* La copie des cinq valeurs d'un coup : une trace à part, parce qu'elle ne
     se lit pas sur une ligne de la liste mais sous elle. */
  const [bloc, setBloc] = useState<'' | 'ok' | 'fail'>('');
  /* La largeur du cadre d'aperçu : 320, 360 ou 390 px. Le bloc arabe ne change
     pas, seul l'écran qui le porte se resserre ou s'élargit. La hauteur se
     choisit à part, parce qu'elle ne dit pas la même chose : elle mesure ce
     qu'on voit avant de faire défiler. */
  const [largeur, setLargeur] = useState<number>(320);
  const [hauteur, setHauteur] = useState<number>(320);
  /* Le cadre d'aperçu, mesuré : ce que le message dépasse de la hauteur
     choisie est exactement ce qu'il reste à faire défiler pour atteindre la
     signature. La mesure se refait à chaque changement de largeur, de hauteur
     ou de modèle — elle se lit sur la page rendue, jamais sur un chiffre
     écrit à la main. */
  const pageRef = useRef<HTMLDivElement>(null);
  /* La hauteur du contenu rendu, mesurée à chaque largeur et à chaque modèle :
     chaque hauteur d'écran en déduit ce qu'il reste à faire défiler. Une seule
     mesure sert donc aux trois hauteurs du relevé. */
  const [contenu, setContenu] = useState(0);
  const reste = Math.max(0, contenu - hauteur);
  /* Le relevé des trois hauteurs se copie d’un geste : la largeur retenue part
     en tête du texte, juste devant les trois mesures, pour que le chiffre se
     relise seul dans un message. */
  const [releveCopie, setReleveCopie] = useState<'' | 'ok' | 'fail'>('');
  /* Le jour de la dernière copie du relevé, retenu par l'appareil : le
     presse-papiers ne se relit pas, la date se lit donc ici. */
  const [releveLe, setReleveLe] = useState<string | null>(() => readReleveCopie());

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return undefined;
    const mesurer = () => setContenu(Math.round(el.scrollHeight));
    mesurer();
    const frame = window.requestAnimationFrame(mesurer);
    const timer = window.setTimeout(mesurer, 160);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [modeleCle, largeur, hauteur]);

  const cle = Boolean(etat?.key);
  const domaine = Boolean(etat?.domain);
  const smtpFait = Boolean(smtp);
  const preuveFaite = Boolean(preuve);
  const b2bFait = Boolean(b2b);
  const faits = [cle, domaine, smtpFait, preuveFaite, b2bFait].filter(Boolean).length;

  const modele = useMemo(
    () => MODELES_AUTH.find((item) => item.cle === modeleCle) ?? MODELES_AUTH[0],
    [modeleCle],
  );

  const expediteur = etat?.domain ? `PaperAtlas <noreply@${etat.domain}>` : 'PaperAtlas <noreply@domaine>';

  const gestes = [
    { n: 1, fait: cle, titre: t('ad.p.auth.s1Title'), texte: t('ad.p.auth.s1Text') },
    { n: 2, fait: domaine, titre: t('ad.p.auth.s2Title'), texte: t('ad.p.auth.s2Text') },
    { n: 3, fait: smtpFait, titre: t('ad.p.auth.s3Title'), texte: t('ad.p.auth.s3Text') },
    { n: 4, fait: preuveFaite, titre: t('ad.p.auth.s4Title'), texte: t('ad.p.auth.s4Text') },
    { n: 5, fait: b2bFait, titre: t('ad.p.auth.s5Title'), texte: t('ad.p.auth.s5Text') },
  ];

  const valeurs = [
    { cle: 'host', label: t('ad.p.auth.host'), value: SMTP_AUTH.host },
    { cle: 'port', label: t('ad.p.auth.port'), value: SMTP_AUTH.port },
    { cle: 'user', label: t('ad.p.auth.user'), value: SMTP_AUTH.user },
    { cle: 'pass', label: t('ad.p.auth.pass'), value: 'RESEND_API_KEY' },
    { cle: 'from', label: t('ad.p.auth.from'), value: expediteur },
  ];

  /* Le bloc entier, dans l'ordre des champs de Supabase : cinq allers-retours
     de moins entre la console et le navigateur. */
  const blocSmtp = [
    `PaperAtlas — ${t('ad.p.auth.smtpTitle')}`,
    `${t('ad.p.auth.host')} (Host) : ${SMTP_AUTH.host}`,
    `${t('ad.p.auth.port')} (Port) : ${SMTP_AUTH.port}`,
    `${t('ad.p.auth.user')} (Username) : ${SMTP_AUTH.user}`,
    `${t('ad.p.auth.pass')} (Password) : ${t('ad.p.auth.passValue')}`,
    `${t('ad.p.auth.from')} (Sender email) : ${expediteur}`,
  ].join('\n');

  const copierValeur = async (valeur: string) => {
    const ok = await copier(valeur);
    /* Un presse-papiers refusé laisse la valeur à l'écran : elle se recopie à
       la main, et aucune phrase d'erreur ne vient parler d'envoi. */
    setCopie(ok ? valeur : '');
    setBloc('');
  };

  const copierBloc = async () => {
    const ok = await copier(blocSmtp);
    setCopie('');
    setBloc(ok ? 'ok' : 'fail');
  };

  /* Le relevé tel qu’il s’écrit : la largeur retenue en tête, puis les trois
     hauteurs l’une sous l’autre avec ce qu’il reste à faire défiler pour
     chacune — les mêmes chiffres que les trois cases, lus sur la page rendue. */
  const copierReleve = async () => {
    const lignes = HAUTEURS.map((valeur) => {
      const restant = Math.max(0, contenu - valeur);
      return t('ad.p.auth.previewTallyCopyLine')
        .replace('{h}', String(valeur))
        .replace(
          '{rest}',
          restant === 0
            ? t('ad.p.auth.previewTallyZero')
            : t('ad.p.auth.previewTallyRest').replace('{n}', String(restant)),
        );
    });
    const texte = [
      t('ad.p.auth.previewTallyCopyHead').replace('{w}', String(largeur)),
      ...lignes,
    ].join('\n');
    const ok = await copier(texte);
    setReleveCopie(ok ? 'ok' : 'fail');
    /* Seule une copie réellement réussie est datée. */
    if (ok) setReleveLe(markReleveCopie());
  };

  /* La demande réelle : Supabase envoie un message de réinitialisation par le
     SMTP configuré. S'il arrive signé PaperAtlas, le branchement est prouvé. */
  const demanderTest = async () => {
    setBusy(true);
    setNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'email-expediteur',
        { body: { action: 'test-auth' } },
      );
      const payload = answer as
        | { ok?: boolean; sent?: boolean; to?: string; message?: string }
        | null;
      if (failure || !payload?.ok) {
        setNote(t('ad.p.auth.testFail'));
        setNoteOk(false);
        return;
      }
      if (!payload.sent) {
        setNote(
          payload.message
            ? `${t('ad.p.auth.testFail')} ${payload.message}`
            : t('ad.p.auth.testFail'),
        );
        setNoteOk(false);
        return;
      }
      setNote(t('ad.p.auth.testSent').replace('{to}', payload.to || etat?.admin || ''));
      setNoteOk(true);
    } catch {
      setNote(t('ad.p.auth.testFail'));
      setNoteOk(false);
    } finally {
      setBusy(false);
    }
  };

  /* Le rappel B2B part par une autre fonction que les confirmations : il a
     donc son propre test, qui envoie un exemple à l'administration sans
     déranger aucun atelier. */
  const testerB2b = async () => {
    setB2bBusy(true);
    setNote('');
    try {
      const { data: answer, error: failure } = await supabase.functions.invoke(
        'email-expediteur',
        { body: { action: 'test-b2b' } },
      );
      const payload = answer as
        | { ok?: boolean; sent?: boolean; to?: string; message?: string }
        | null;
      if (failure || !payload?.ok || !payload.sent) {
        clearB2bTest();
        setB2b(null);
        setNote(
          payload?.message
            ? `${t('ad.p.auth.b2bFail')} ${payload.message}`
            : t('ad.p.auth.b2bFail'),
        );
        setNoteOk(false);
        return;
      }
      setB2b(markB2bTest());
      setNote(t('ad.p.auth.b2bSent').replace('{to}', payload.to || etat?.admin || ''));
      setNoteOk(true);
    } catch {
      setNote(t('ad.p.auth.b2bFail'));
      setNoteOk(false);
    } finally {
      setB2bBusy(false);
    }
  };

  return (
    <section className="mail-guide mail-auth" aria-labelledby="mail-auth-title">
      <div className="mail-guide-head">
        <div className="mail-guide-head-txt">
          <h3 className="mail-guide-title" id="mail-auth-title">
            {t('ad.p.auth.stamp')}
          </h3>
          <p className="mail-guide-sub">{t('ad.p.auth.sub')}</p>
        </div>
        <span
          className="mail-guide-count"
          data-tone={faits === GESTES_TOTAL ? 'ok' : 'soft'}
          aria-live="polite"
        >
          <i
            className={faits === GESTES_TOTAL ? 'ri-check-double-line' : 'ri-shield-keyhole-line'}
            aria-hidden="true"
          ></i>
          {t('ad.p.auth.count').replace('{n}', String(faits)).replace('{total}', String(GESTES_TOTAL))}
        </span>
      </div>

      <ol className="mail-steps">
        {gestes.map((geste) => (
          <li className="mail-step" key={geste.n} data-fait={geste.fait ? 'yes' : 'no'}>
            <span className="mail-step-n" aria-hidden="true">
              {geste.fait ? <i className="ri-check-line"></i> : geste.n}
            </span>
            <div className="mail-step-body">
              <p className="mail-step-top">
                <b className="mail-step-title">{geste.titre}</b>
                <span className="mail-step-state">
                  {geste.fait ? t('ad.p.auth.done') : t('ad.p.auth.todo')}
                </span>
              </p>
              <p className="mail-step-txt">{geste.texte}</p>
              {geste.n === 3 && (
                <p className="mail-step-foot">
                  <span className="mail-step-date" data-soft={smtpFait ? 'no' : 'yes'}>
                    <i className="ri-calendar-line" aria-hidden="true"></i>
                    {smtp
                      ? t('ad.p.auth.declaredOn').replace('{date}', jour(smtp, lang))
                      : t('ad.p.auth.notDeclared')}
                  </span>
                  <button
                    type="button"
                    className="auth-mini"
                    data-tone={smtpFait ? 'off' : 'accent'}
                    title={t('ad.p.auth.declareHint')}
                    onClick={() => {
                      if (smtpFait) {
                        clearSmtp();
                        setSmtp(null);
                        return;
                      }
                      setSmtp(markSmtp());
                    }}
                  >
                    <i
                      className={smtpFait ? 'ri-close-line' : 'ri-check-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {smtpFait ? t('ad.p.auth.undeclare') : t('ad.p.auth.declare')}
                    </span>
                  </button>
                </p>
              )}
              {geste.n === 4 && (
                <p className="mail-step-foot">
                  <span className="mail-step-date" data-soft={preuveFaite ? 'no' : 'yes'}>
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    {preuve
                      ? t('ad.p.auth.proofAt').replace('{date}', jour(preuve, lang))
                      : t('ad.p.auth.proofNone')}
                  </span>
                  <button
                    type="button"
                    className="auth-mini"
                    data-tone="accent"
                    disabled={busy}
                    onClick={() => void demanderTest()}
                  >
                    <i
                      className={busy ? 'ri-loader-4-line is-spin' : 'ri-mail-send-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {busy ? t('ad.p.auth.testing') : t('ad.p.auth.test')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="auth-mini"
                    data-tone={preuveFaite ? 'off' : 'ghost'}
                    disabled={!preuveFaite}
                    title={t('ad.p.auth.proofHint')}
                    onClick={() => {
                      if (preuveFaite) {
                        clearAuthPreuve();
                        setPreuve(null);
                        return;
                      }
                      setPreuve(markAuthPreuve());
                    }}
                  >
                    <i
                      className={preuveFaite ? 'ri-arrow-go-back-line' : 'ri-check-double-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.p.auth.testReceived')}</span>
                  </button>
                </p>
              )}
              {geste.n === 5 && (
                <p className="mail-step-foot">
                  <span className="mail-step-date" data-soft={b2bFait ? 'no' : 'yes'}>
                    <i className="ri-calendar-check-line" aria-hidden="true"></i>
                    {b2b
                      ? t('ad.p.auth.b2bProofAt').replace('{date}', jour(b2b, lang))
                      : t('ad.p.auth.b2bProofNone')}
                  </span>
                  <button
                    type="button"
                    className="auth-mini"
                    data-tone="accent"
                    disabled={b2bBusy || !etat?.configured}
                    title={etat?.configured ? t('ad.p.auth.b2bHint') : t('ad.p.auth.b2bBlocked')}
                    onClick={() => void testerB2b()}
                  >
                    <i
                      className={b2bBusy ? 'ri-loader-4-line is-spin' : 'ri-notification-3-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">
                      {b2bBusy ? t('ad.p.auth.b2bTesting') : t('ad.p.auth.b2bTest')}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="auth-mini"
                    data-tone={b2bFait ? 'off' : 'ghost'}
                    disabled={!b2bFait}
                    onClick={() => {
                      if (b2bFait) {
                        clearB2bTest();
                        setB2b(null);
                        return;
                      }
                      setB2b(markB2bTest());
                    }}
                  >
                    <i
                      className={b2bFait ? 'ri-arrow-go-back-line' : 'ri-check-double-line'}
                      aria-hidden="true"
                    ></i>
                    <span className="whitespace-nowrap">{t('ad.p.auth.b2bUndo')}</span>
                  </button>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Les valeurs du SMTP, une à une, avec leur copie : le geste se fait
          dans Supabase, la console ne fait que retirer la recopie à la main.
          Le bloc entier et la porte vers l'écran de Supabase sont posés en
          tête, parce que c'est par là que le geste commence. */}
      <div className="auth-smtp">
        <div className="auth-smtp-head">
          <p className="auth-smtp-title">
            <i className="ri-server-line" aria-hidden="true"></i>
            {t('ad.p.auth.smtpTitle')}
          </p>
          <div className="auth-smtp-actions">
            <button type="button" className="auth-mini" data-tone="accent" onClick={() => void copierBloc()}>
              <i
                className={bloc === 'ok' ? 'ri-check-line' : 'ri-file-copy-2-line'}
                aria-hidden="true"
              ></i>
              <span className="whitespace-nowrap">{t('ad.p.auth.smtpCopyAll')}</span>
            </button>
            <a
              className="mail-step-link"
              href={SMTP_URL}
              target="_blank"
              rel="noopener noreferrer"
              title={t('ad.p.auth.smtpOpenHint')}
            >
              <span className="whitespace-nowrap">{t('ad.p.auth.smtpOpen')}</span>
              <i className="ri-external-link-line" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        <dl className="auth-smtp-list">
          {valeurs.map((valeur) => (
            <div className="auth-smtp-row" key={valeur.cle}>
              <dt>{valeur.label}</dt>
              <dd>
                <code>{valeur.value}</code>
                <button
                  type="button"
                  className="auth-copy"
                  aria-label={`${t('ad.p.auth.copy')} — ${valeur.label}`}
                  title={t('ad.p.auth.copy')}
                  onClick={() => void copierValeur(valeur.value)}
                >
                  <i
                    className={copie === valeur.value ? 'ri-check-line' : 'ri-file-copy-line'}
                    aria-hidden="true"
                  ></i>
                </button>
              </dd>
            </div>
          ))}
        </dl>

        {bloc === 'ok' && (
          <p className="auth-smtp-flash" data-tone="ok" role="status">
            <i className="ri-check-double-line" aria-hidden="true"></i>
            {t('ad.p.auth.smtpCopied')}
          </p>
        )}
        {bloc === 'fail' && (
          <p className="auth-smtp-flash" data-tone="warn" role="status">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            {t('ad.p.auth.smtpCopyFail')}
          </p>
        )}

        <p className="mail-guide-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          <span>{t('ad.p.auth.smtpPassHint')}</span>
        </p>
      </div>

      {/* Les deux modèles, dans les trois langues, prêts à coller : c'est ici
          que le nom PaperAtlas passe des confirmations du site aux messages
          d'authentification. */}
      <div className="auth-models">
        <div className="auth-models-head">
          <p className="auth-models-title">
            <i className="ri-translate-2" aria-hidden="true"></i>
            {t('ad.p.auth.modelsTitle')}
          </p>
          <div className="auth-model-tabs" role="group" aria-label={t('ad.p.auth.modelKind')}>
            {MODELES_AUTH.map((item) => (
              <button
                type="button"
                key={item.cle}
                className="auth-model-tab"
                data-on={item.cle === modele.cle ? 'yes' : 'no'}
                aria-pressed={item.cle === modele.cle}
                onClick={() => setModeleCle(item.cle)}
              >
                {item.cle === 'confirmation'
                  ? t('ad.p.auth.modelConfirm')
                  : t('ad.p.auth.modelReset')}
              </button>
            ))}
          </div>
        </div>
        <p className="auth-models-sub">{t('ad.p.auth.modelsSub')}</p>

        <div className="auth-model-subject">
          <span className="auth-model-label">{t('ad.p.auth.modelSubject')}</span>
          <code>{modele.sujet}</code>
          <button
            type="button"
            className="auth-copy"
            aria-label={t('ad.p.auth.copySubject')}
            title={t('ad.p.auth.copySubject')}
            onClick={() => void copierValeur(modele.sujet)}
          >
            <i
              className={copie === modele.sujet ? 'ri-check-line' : 'ri-file-copy-line'}
              aria-hidden="true"
            ></i>
          </button>
        </div>

        <div className="auth-model-body">
          <div className="auth-model-body-head">
            <span className="auth-model-label">{t('ad.p.auth.modelBody')}</span>
            <button
              type="button"
              className="auth-mini"
              data-tone="accent"
              onClick={() => void copierValeur(modele.html)}
            >
              <i className="ri-file-copy-line" aria-hidden="true"></i>
              <span className="whitespace-nowrap">{t('ad.p.auth.copyBody')}</span>
            </button>
          </div>
          <pre>{modele.html}</pre>
        </div>

        {/* L'aperçu du bloc arabe, à la largeur d'un téléphone : le sens de
            lecture se juge ici, sans ouvrir une boîte de réception. Il suit
            l'onglet choisi plus haut. */}
        <div className="auth-preview">
          <div className="auth-preview-head">
            <p className="auth-preview-title">
              <i className="ri-smartphone-line" aria-hidden="true"></i>
              {t('ad.p.auth.previewTitle')}
            </p>
            {/* Deux mesures, l'une sous l'autre : la largeur dit la coupe des
                lignes, la hauteur dit le défilement. Chaque rangée porte son
                nom à gauche, pour qu'on ne confonde pas les deux. Le chiffre
                se lit seul, l'unité reste à sa droite. */}
            <div className="auth-preview-measures">
              <div className="auth-preview-measure">
                <span className="auth-preview-label">{t('ad.p.auth.previewWidth')}</span>
                <div
                  className="auth-preview-sizes"
                  role="group"
                  aria-label={t('ad.p.auth.previewWidth')}
                  title={t('ad.p.auth.previewWidthHint')}
                >
                  {LARGEURS.map((valeur) => (
                    <button
                      key={valeur}
                      type="button"
                      className="auth-preview-size"
                      data-on={valeur === largeur ? 'yes' : 'no'}
                      aria-pressed={valeur === largeur}
                      title={t('ad.p.auth.previewWidthHint')}
                      onClick={() => setLargeur(valeur)}
                    >
                      {valeur}
                      <small>px</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="auth-preview-measure">
                <span className="auth-preview-label">{t('ad.p.auth.previewHeight')}</span>
                <div
                  className="auth-preview-sizes"
                  role="group"
                  aria-label={t('ad.p.auth.previewHeight')}
                  title={t('ad.p.auth.previewHeightHint')}
                >
                  {HAUTEURS.map((valeur) => (
                    <button
                      key={valeur}
                      type="button"
                      className="auth-preview-size"
                      data-on={valeur === hauteur ? 'yes' : 'no'}
                      aria-pressed={valeur === hauteur}
                      title={t('ad.p.auth.previewHeightHint')}
                      onClick={() => setHauteur(valeur)}
                    >
                      {valeur}
                      <small>px</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <p className="auth-preview-sub">{t('ad.p.auth.previewSub')}</p>
          <div className="auth-preview-frame">
            <div
              ref={pageRef}
              className="auth-preview-page"
              style={{ width: `${largeur}px`, height: `${hauteur}px` }}
              dir="ltr"
              /* Le bloc vient du modèle lui-même, et n'est fait que de texte et
                 de styles en ligne : rien n'y est saisi par un visiteur. */
              dangerouslySetInnerHTML={{ __html: apercuArabe(modele) }}
            />
          </div>
          {/* Ce qu'il reste à faire défiler pour atteindre la signature, à la
              hauteur choisie : la mesure se lit sur la page rendue, elle suit
              donc le modèle et les deux rangées de boutons. */}
          <p
            className="auth-preview-reste"
            data-zero={reste === 0 ? 'yes' : 'no'}
            role="status"
            aria-live="polite"
          >
            <i
              className={reste === 0 ? 'ri-check-double-line' : 'ri-arrow-down-double-line'}
              aria-hidden="true"
            ></i>
            <span>
              {reste === 0
                ? t('ad.p.auth.previewResteZero').replace('{h}', String(hauteur))
                : t('ad.p.auth.previewReste')
                    .replace('{h}', String(hauteur))
                    .replace('{n}', String(reste))}
            </span>
          </p>
          {/* Le relevé des trois hauteurs, côte à côte : le même message, la
              même largeur, trois fenêtres — et pour chacune les pixels qui
              restent à faire défiler. La largeur retenue se lit dans
              l'intitulé, pour que le chiffre du relevé se relise seul. La
              hauteur se choisit donc d'un seul regard, sans essayer les trois
              l'une après l'autre. */}
          <div
            className="auth-preview-tally"
            role="group"
            aria-label={t('ad.p.auth.previewTally').replace('{w}', String(largeur))}
            title={t('ad.p.auth.previewTallyHint').replace('{w}', String(largeur))}
          >
            <div className="auth-preview-tally-head">
              <span className="auth-preview-tally-label">
                <i className="ri-ruler-2-line" aria-hidden="true"></i>
                {t('ad.p.auth.previewTally').replace('{w}', String(largeur))}
              </span>
              {/* La copie emporte la largeur retenue avec les trois mesures,
                  pour que le relevé se relise seul une fois collé. */}
              <button
                type="button"
                className="auth-mini"
                data-tone={releveCopie === 'ok' ? 'accent' : 'ghost'}
                title={t('ad.p.auth.previewTallyCopyHint')}
                onClick={() => void copierReleve()}
              >
                <i
                  className={
                    releveCopie === 'ok' ? 'ri-check-line' : 'ri-file-copy-2-line'
                  }
                  aria-hidden="true"
                ></i>
                <span className="whitespace-nowrap">{t('ad.p.auth.previewTallyCopy')}</span>
              </button>
            </div>
            <div className="auth-preview-tally-row">
              {HAUTEURS.map((valeur) => {
                const restant = Math.max(0, contenu - valeur);
                return (
                  <button
                    key={valeur}
                    type="button"
                    className="auth-preview-tally-cell"
                    data-on={valeur === hauteur ? 'yes' : 'no'}
                    data-zero={restant === 0 ? 'yes' : 'no'}
                    aria-pressed={valeur === hauteur}
                    title={t('ad.p.auth.previewTallyPick')
                      .replace('{h}', String(valeur))
                      .replace('{w}', String(largeur))}
                    onClick={() => setHauteur(valeur)}
                  >
                    <span className="auth-preview-tally-h">
                      {valeur}
                      <small>px</small>
                    </span>
                    <span className="auth-preview-tally-rest">
                      <i
                        className={
                          restant === 0
                            ? 'ri-check-double-line'
                            : 'ri-arrow-down-double-line'
                        }
                        aria-hidden="true"
                      ></i>
                      {restant === 0
                        ? t('ad.p.auth.previewTallyZero')
                        : t('ad.p.auth.previewTallyRest').replace('{n}', String(restant))}
                    </span>
                  </button>
                );
              })}
            </div>
            {releveCopie && (
              <p
                className="auth-preview-tally-flash"
                data-tone={releveCopie === 'ok' ? 'ok' : 'warn'}
                role="status"
              >
                <i
                  className={
                    releveCopie === 'ok'
                      ? 'ri-check-double-line'
                      : 'ri-error-warning-line'
                  }
                  aria-hidden="true"
                ></i>
                <span>
                  {releveCopie === 'ok'
                    ? t('ad.p.auth.previewTallyCopied')
                    : t('ad.p.auth.previewTallyCopyFail')}
                </span>
              </p>
            )}
            {/* La date de la dernière copie réussie, sous le relevé : elle se
                relit sans rouvrir le presse-papiers. */}
            <p className="auth-preview-tally-last" data-vide={releveLe ? 'no' : 'yes'}>
              <i className="ri-history-line" aria-hidden="true"></i>
              <span>
                {releveLe
                  ? t('ad.p.auth.previewTallyLast').replace(
                      '{date}',
                      jour(releveLe, lang),
                    )
                  : t('ad.p.auth.previewTallyNever')}
              </span>
            </p>
          </div>
          <p className="mail-guide-note">
            <i className="ri-eye-line" aria-hidden="true"></i>
            <span>{t('ad.p.auth.previewNote')}</span>
          </p>
        </div>

        <p className="mail-guide-note">
          <i className="ri-smartphone-line" aria-hidden="true"></i>
          <span>{t('ad.p.auth.modelsRtl')}</span>
        </p>

        <p className="mail-guide-note">
          <i className="ri-book-open-line" aria-hidden="true"></i>
          <span>{t('ad.p.auth.modelsWhere')}</span>
        </p>
      </div>

      {note && (
        <p className="admin-note" data-ok={noteOk ? 'yes' : 'no'} role="status">
          <i
            className={noteOk ? 'ri-check-double-line' : 'ri-error-warning-line'}
            aria-hidden="true"
          ></i>
          {note}
        </p>
      )}

      <p className="mail-guide-note">
        <i className="ri-shield-keyhole-line" aria-hidden="true"></i>
        <span>{t('ad.p.auth.note')}</span>
      </p>
    </section>
  );
}