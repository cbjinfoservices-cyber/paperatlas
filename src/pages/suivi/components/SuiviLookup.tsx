import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CopyTextButton from '@/components/feature/CopyTextButton';
import { useLang } from '@/i18n/LangProvider';
import { dayStamp } from '@/lib/dates';
import {
  chercherSuivi,
  etapes,
  planRelances,
  type SuiviDossier,
  type SuiviIssue,
} from '@/lib/suivi';

/** Each miss says what to do, never just that nothing was found. */
const ISSUE_KEY: Record<SuiviIssue, string> = {
  empty: 'sv.errEmpty',
  format: 'sv.errFormat',
  notfound: 'sv.errNotFound',
  net: 'sv.errNet',
  server: 'sv.errServer',
};

/**
 * One field, two families of file. The subscription quote and the print
 * request are followed on the same page, because a visitor holding a reference
 * should not have to know which door it belongs to before asking.
 */
export default function SuiviLookup() {
  const { t, lang } = useLang();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  /* A line of « Mon compte » already knows the reference: it travels in the
     address, so the file opens on arrival instead of being retyped. */
  const fromLink = (params.get('ref') ?? '').trim();
  const [reference, setReference] = useState(fromLink);
  const [busy, setBusy] = useState(false);
  const [dossier, setDossier] = useState<SuiviDossier | null>(null);
  const [issue, setIssue] = useState<SuiviIssue | null>(null);
  const opened = useRef('');

  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-GB' : 'fr-FR';
  const day = (iso: string | null) => (iso ? dayStamp(iso, locale) : '');
  /* A calendar day from the file (« 2026-03-12 ») is read as a local day, so
     the printed sheet never shows the day before in a western timezone. */
  const dayOnly = (iso: string | null) =>
    iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? day(`${iso}T00:00:00`) : '';

  const run = useCallback(async (asked: string) => {
    const value = asked.trim();
    if (!value) {
      setDossier(null);
      setIssue('empty');
      return;
    }
    setBusy(true);
    setIssue(null);
    const answer = await chercherSuivi(value);
    if ('dossier' in answer) {
      setDossier(answer.dossier);
      setIssue(null);
    } else {
      setDossier(null);
      setIssue(answer.issue);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (!fromLink || opened.current === fromLink) return;
    opened.current = fromLink;
    setReference(fromLink);
    void run(fromLink);
  }, [fromLink, run]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const value = reference.trim();
    /* The reference is written in the address, so a reload — or a link sent to
       a colleague — reopens the same file instead of an empty field. */
    if (value && value !== fromLink) {
      opened.current = value;
      navigate(`/suivi?ref=${encodeURIComponent(value)}`, { replace: true });
    }
    void run(value);
  };

  const reset = () => {
    setDossier(null);
    setIssue(null);
    setReference('');
    opened.current = '';
    navigate('/suivi', { replace: true });
  };

  const steps = dossier ? etapes(dossier) : [];
  /* Le calendrier des rappels, lu sur les dates du dossier : il ne glisse pas
     avec la visite et ne promet jamais un envoi qu'aucune trace ne porte. */
  const relances = dossier ? planRelances(dossier) : null;

  /* The printable sheet reads the same values as the card, so a saved PDF can
     never tell a different story from the page it was taken from. */
  const issued = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());
  const printFacts: Array<[string, string]> = dossier
    ? dossier.kind === 'devis'
      ? [
          [t('sv.plan'), dossier.formule],
          [t('sv.sites'), String(dossier.etablissements)],
          [t('sv.market'), dossier.marche],
          [t('sv.rhythm'), dossier.rythme],
          [t('sv.amountMonth'), dossier.montantMensuel],
          [t('sv.sentOn'), day(dossier.created)],
        ].filter(([, value]) => Boolean(value)) as Array<[string, string]>
      : [
          [t('sv.partner'), dossier.atelier],
          [t('sv.qty'), dossier.quantite],
          [t('sv.deadline'), dossier.delai],
          [t('sv.sentOn'), day(dossier.created)],
        ].filter(([, value]) => Boolean(value)) as Array<[string, string]>
    : [];

  return (
    <div className="sv">
      <form className="sv-form" onSubmit={onSubmit} noValidate>
        <p className="sv-stamp">{t('sv.formTitle')}</p>
        <p className="sv-sub">{t('sv.formSub')}</p>

        <label className="sv-field">
          <span>{t('sv.label')}</span>
          <span className="sv-input-wrap">
            <i className="ri-search-line" aria-hidden="true"></i>
            <input
              type="text"
              name="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('sv.ph')}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
              maxLength={40}
              aria-invalid={issue === 'format' || issue === 'empty' ? true : undefined}
            />
          </span>
        </label>

        <button type="submit" className="sv-cta" disabled={busy}>
          <i className={busy ? 'ri-loader-4-line' : 'ri-arrow-right-line'} aria-hidden="true"></i>
          {busy ? t('sv.searching') : t('sv.cta')}
        </button>

        {issue && (
          <p className="sv-error" role="alert">
            <i className="ri-error-warning-line" aria-hidden="true"></i>
            <span>{t(ISSUE_KEY[issue])}</span>
          </p>
        )}
      </form>

      {dossier && (
        <article className="sv-card" data-kind={dossier.kind} data-state={dossier.statut}>
          <div className="sv-card-head">
            <span className="sv-kind">
              <i
                className={dossier.kind === 'devis' ? 'ri-file-list-3-line' : 'ri-inbox-archive-line'}
                aria-hidden="true"
              ></i>
              {t(dossier.kind === 'devis' ? 'sv.kindDevis' : 'sv.kindDemande')}
            </span>
            <span className="sv-badge" data-state={dossier.statut}>
              {t(`sv.st.${dossier.statut}`)}
            </span>
          </div>

          <p className="sv-ref">{dossier.reference}</p>

          {dossier.kind === 'devis' ? (
            <>
              <p className="sv-figure">
                <strong>{dossier.montantTotal || dossier.montantMensuel || '—'}</strong>
              </p>
              <dl className="sv-facts">
                {dossier.formule && (
                  <div>
                    <dt>{t('sv.plan')}</dt>
                    <dd>{dossier.formule}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('sv.sites')}</dt>
                  <dd>{dossier.etablissements}</dd>
                </div>
                {dossier.marche && (
                  <div>
                    <dt>{t('sv.market')}</dt>
                    <dd>{dossier.marche}</dd>
                  </div>
                )}
                {dossier.rythme && (
                  <div>
                    <dt>{t('sv.rhythm')}</dt>
                    <dd>{dossier.rythme}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('sv.sentOn')}</dt>
                  <dd>{day(dossier.created) || '—'}</dd>
                </div>
                {dossier.montantMensuel && dossier.montantTotal !== dossier.montantMensuel && (
                  <div>
                    <dt>{t('sv.amountMonth')}</dt>
                    <dd>{dossier.montantMensuel}</dd>
                  </div>
                )}
              </dl>
            </>
          ) : (
            <dl className="sv-facts">
              {dossier.atelier && (
                <div>
                  <dt>{t('sv.partner')}</dt>
                  <dd>{dossier.atelier}</dd>
                </div>
              )}
              {dossier.quantite && (
                <div>
                  <dt>{t('sv.qty')}</dt>
                  <dd>{dossier.quantite}</dd>
                </div>
              )}
              {dossier.delai && (
                <div>
                  <dt>{t('sv.deadline')}</dt>
                  <dd>{dossier.delai}</dd>
                </div>
              )}
              <div>
                <dt>{t('sv.sentOn')}</dt>
                <dd>{day(dossier.created) || '—'}</dd>
              </div>
            </dl>
          )}

          {/* The same frame the printed sheet carries: who the file is for, and
              the day the subscription should start. On screen too, so a reader
              never has to print to find out. */}
          {dossier.kind === 'devis' && (
            <div className="sv-attn">
              <p className="sv-attn-stamp">{t('sv.attnTitle')}</p>
              <dl className="sv-attn-facts">
                <div>
                  <dt>{t('sv.structure')}</dt>
                  <dd>{dossier.structure || t('sv.notGiven')}</dd>
                </div>
                <div>
                  <dt>{t('sv.startOn')}</dt>
                  <dd>{dayOnly(dossier.miseEnRoute) || t('sv.startToAgree')}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="sv-track">
            <p className="sv-track-stamp">{t('sv.timeline')}</p>
            <ol className="sv-steps">
              {steps.map((step) => (
                <li
                  key={step.key}
                  className={step.done ? 'is-done' : ''}
                  data-current={step.current ? 'yes' : undefined}
                >
                  <span className="sv-dot" aria-hidden="true">
                    <i className={step.done ? 'ri-check-line' : 'ri-subtract-line'}></i>
                  </span>
                  <span className="sv-step-txt">
                    <b>{t(step.key)}</b>
                    {step.at && <small>{day(step.at)}</small>}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {/* Les relances du dossier : quand elles tombent, à qui elles vont, et
              ce que le fichier montre vraiment comme parti. */}
          {relances && relances.steps.length > 0 && (
            <div className="sv-rel">
              <p className="sv-track-stamp">{t('sv.relTitle')}</p>
              <p className="sv-rel-wait">
                {t('sv.relWait').replace('{n}', String(relances.days))}
              </p>
              <ol className="sv-rel-steps">
                {relances.steps.map((step) => (
                  <li key={step.day} data-state={step.state}>
                    <span className="sv-rel-day">
                      {t('sv.relDay').replace('{n}', String(step.day))}
                    </span>
                    <span className="sv-rel-state">
                      {step.state === 'sent'
                        ? t('sv.relSent').replace('{date}', day(step.sentAt ?? step.at))
                        : step.state === 'reached'
                          ? t('sv.relReached')
                          : t('sv.relDue')}
                    </span>
                    <span className="sv-rel-date">{day(step.at)}</span>
                    <span className="sv-rel-to">
                      {t(step.to === 'us' ? 'sv.relToUs' : 'sv.relToPartner')}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="sv-rel-next">
                {relances.closed
                  ? t('sv.relClosed')
                  : relances.next
                    ? t('sv.relNext').replace('{date}', day(relances.next))
                    : t('sv.relPassed')}
              </p>
            </div>
          )}

          <p className="sv-note">
            <i className="ri-information-line" aria-hidden="true"></i>
            <span>
              {dossier.kind === 'devis' ? t('sv.noteDevis') : t('sv.noteDemande')}
              {dossier.kind === 'devis' && dossier.relance && (
                <>
                  {' '}
                  {t('sv.noteRelance').replace('{date}', day(dossier.relance))}
                </>
              )}
            </span>
          </p>

          <p className="sv-privacy">
            <i className="ri-lock-line" aria-hidden="true"></i>
            {t('sv.privacy')}
          </p>

          <div className="sv-actions">
            <CopyTextButton
              build={() => dossier.reference}
              label={t('sv.copyRef')}
              hint={t('sv.copyRefHint')}
              className="sv-ghost"
            />
            <button
              type="button"
              className="sv-ghost sv-print-btn"
              title={t('sv.printHint')}
              onClick={() => window.print()}
            >
              <i className="ri-printer-line" aria-hidden="true"></i>
              {t('sv.print')}
            </button>
            <button type="button" className="sv-ghost" onClick={reset}>
              <i className="ri-search-line" aria-hidden="true"></i>
              {t('sv.clear')}
            </button>
            <Link to="/compte#mes-devis" className="sv-ghost">
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
              {t('sv.toAccount')}
            </Link>
          </div>
        </article>
      )}

      {/* The sheet that leaves the printer: the file only, nothing around it. */}
      {dossier && (
        <div className="sv-print" aria-hidden="true">
          <div className="sv-print-head">
            <span className="sv-print-brand">{t('sv.printBrand')}</span>
            <span className="sv-print-stamp">{t('sv.printStamp')}</span>
          </div>

          <p className="sv-print-kind">
            {t(dossier.kind === 'devis' ? 'sv.kindDevis' : 'sv.kindDemande')}
          </p>
          <p className="sv-print-ref">{dossier.reference}</p>
          <p className="sv-print-state">{t(`sv.st.${dossier.statut}`)}</p>

          {dossier.kind === 'devis' && (
            <p className="sv-print-amount">
              {dossier.montantTotal || dossier.montantMensuel || '—'}
            </p>
          )}

          <dl className="sv-print-facts">
            {printFacts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {dossier.kind === 'devis' && (
            <div className="sv-print-attn">
              <p className="sv-print-attn-stamp">{t('sv.printTo')}</p>
              <dl className="sv-print-attn-facts">
                <div>
                  <dt>{t('sv.structure')}</dt>
                  <dd>{dossier.structure || t('sv.notGiven')}</dd>
                </div>
                <div>
                  <dt>{t('sv.startOn')}</dt>
                  <dd>{dayOnly(dossier.miseEnRoute) || t('sv.startToAgree')}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="sv-print-track">
            <p className="sv-print-track-stamp">{t('sv.timeline')}</p>
            <ol>
              {steps.map((step) => (
                <li key={step.key}>
                  <b>{t(step.key)}</b>
                  {step.at && <small>{day(step.at)}</small>}
                </li>
              ))}
            </ol>
          </div>

          {/* Les relances, sur la feuille comme sur l'écran : les deux jours,
              ce que le fichier montre vraiment comme parti, et à qui. */}
          {relances && relances.steps.length > 0 && (
            <div className="sv-print-rel">
              <p className="sv-print-track-stamp">{t('sv.relTitle')}</p>
              <p className="sv-print-rel-wait">
                {t('sv.relWait').replace('{n}', String(relances.days))}
              </p>
              <ol>
                {relances.steps.map((step) => (
                  <li key={step.day} data-state={step.state}>
                    <b>{t('sv.relDay').replace('{n}', String(step.day))}</b>
                    <span className="sv-print-rel-date">{day(step.at)}</span>
                    <small>
                      {step.state === 'sent'
                        ? t('sv.relSent').replace('{date}', day(step.sentAt ?? step.at))
                        : step.state === 'reached'
                          ? t('sv.relReached')
                          : t('sv.relDue')}
                    </small>
                    <em>{t(step.to === 'us' ? 'sv.relToUs' : 'sv.relToPartner')}</em>
                  </li>
                ))}
              </ol>
              <p className="sv-print-rel-next">
                {relances.closed
                  ? t('sv.relClosed')
                  : relances.next
                    ? t('sv.relNext').replace('{date}', day(relances.next))
                    : t('sv.relPassed')}
              </p>
            </div>
          )}

          <p className="sv-print-note">
            {dossier.kind === 'devis' ? t('sv.noteDevis') : t('sv.noteDemande')}
            {dossier.kind === 'devis' && dossier.relance && (
              <> {t('sv.noteRelance').replace('{date}', day(dossier.relance))}</>
            )}
          </p>
          <p className="sv-print-foot">
            {t('sv.printIssued')} {issued} · {t('sv.printNote')}
          </p>
        </div>
      )}

      {!dossier && (
        <aside className="sv-help">
          <p className="sv-help-title">{t('sv.helpTitle')}</p>

          <div className="sv-help-card">
            <span className="sv-help-ico">
              <i className="ri-stack-line" aria-hidden="true"></i>
            </span>
            <div>
              <b>{t('sv.helpRunT')}</b>
              <p>{t('sv.helpRunP')}</p>
            </div>
          </div>

          <div className="sv-help-card">
            <span className="sv-help-ico">
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
            </span>
            <div>
              <b>{t('sv.helpTenderT')}</b>
              <p>{t('sv.helpTenderP')}</p>
            </div>
          </div>

          {/* Le devis d'abonnement n'est pas une troisième entrée du réseau :
              il se suit ici comme les autres références, et se dit d'une ligne
              sous les deux guichets, sans prendre leur poids. */}
          <p className="sv-help-note">
            <i className="ri-price-tag-3-line" aria-hidden="true"></i>
            <span>
              {t('sv.helpDevisNote')}{' '}
              <Link to="/offres/devis">{t('sv.toDevis')}</Link>
            </span>
          </p>

          <div className="sv-help-links">
            <Link to="/demande-b2b" className="sv-ghost">
              <i className="ri-send-plane-line" aria-hidden="true"></i>
              {t('sv.toDemande')}
            </Link>
            <Link to="/demande-marche" className="sv-ghost">
              <i className="ri-file-list-3-line" aria-hidden="true"></i>
              {t('sv.toTender')}
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}