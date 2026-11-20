import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { localize } from '@/i18n/localize';
import { nomPays, paysArabes } from '@/lib/pays';
import {
  baremeDe,
  bornerSites,
  calculerDevis,
  resumeDevis,
  SITES_MAX,
} from '@/lib/devis';
import { supabase } from '@/lib/supabase';
import { usePrixPays } from '@/hooks/usePrixPays';
import { plans, prixPlan, type PlanId } from '@/pages/offres/components/plans';
import '@/styles/devis.css';
import '@/styles/devis-duree.css';

type Props = {
  /** The formula the door opened on: Premium on « Offres », Institutions on its card, the account's own formula in « Mon compte ». */
  formuleInitiale?: PlanId;
  /** Details already known: a signed-in member does not retype them. */
  nom?: string;
  email?: string;
  org?: string;
  /** Which door the request came through, written in the form. */
  source: string;
};

/**
 * The online subscription quote: the length, the number of establishments and
 * the market are composed on the left, the figure of that length is built on
 * the right, and the request leaves with it already written in. One choice of
 * length only — a structure that picks a semester never has to say a second
 * time whether it pays monthly or yearly.
 */
export default function DevisAbonnement({ formuleInitiale = 'mensuel', nom = '', email = '', org = '', source }: Props) {
  const { t, lang } = useLang();
  const { pays, choisir } = usePrixPays();

  const [formule, setFormule] = useState<PlanId>(formuleInitiale);
  const [sites, setSites] = useState(1);
  const [nomSaisi, setNomSaisi] = useState(nom);
  const [emailSaisi, setEmailSaisi] = useState(email);
  const [orgSaisie, setOrgSaisie] = useState(org);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [formError, setFormError] = useState('');
  /* Whether the recap really left: the quote is stored either way, so the
     screen never promises a mail that did not go out. */
  const [emailed, setEmailed] = useState(false);

  const baseId = useId();
  const reference = useRef(
    `DEV-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
  );

  const devis = useMemo(
    () => calculerDevis(formule, sites, pays),
    [formule, sites, pays],
  );
  const bareme = baremeDe(formule);
  /* The length on screen, so its name and its « / 6 mois » are read from the
     very plan the card prints: one source, no second label to maintain. */
  const planActuel = plans.find((plan) => plan.id === formule) ?? plans[0];
  const nomFormule = t(planActuel.name);
  const nomMarche = nomPays(pays, lang);
  const resume = useMemo(
    () => resumeDevis(devis, t, nomFormule, nomMarche),
    [devis, t, nomFormule, nomMarche],
  );

  const changerSites = (delta: number) => setSites((prev) => bornerSites(prev + delta));
  /* One line under the four lengths, saying what the subscription buys. */
  const hintKey = 'dv.p2';

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    /* The payload is read from the element itself: whatever the browser filled
       in is sent, even when React state never saw it. */
    const data = new FormData(form);

    const trap = String(data.get('website_alt') || '').trim();
    if (trap) {
      setStatus('ok');
      return;
    }
    data.delete('website_alt');

    const messageSaisi = String(data.get('message') || '');
    const nomValue = String(data.get('name') || '').trim();
    const emailValue = String(data.get('email') || '').trim();

    if (messageSaisi.length > 500) {
      setStatus('err');
      setFormError(t('dv.errLong'));
      return;
    }
    if (!nomValue || !emailValue) {
      setStatus('err');
      setFormError(t('dv.errName'));
      return;
    }

    setStatus('sending');
    setFormError('');

    /* The same quote, stored on the account and sent back by mail with its
       amount and its reference — the two facts a reader must be able to find
       again without reopening the page. */
    const payload = {
      action: 'submit',
      reference: reference.current,
      source,
      lang,
      nom: nomValue,
      email: emailValue,
      telephone: String(data.get('telephone') || ''),
      organisation: String(data.get('organisation') || ''),
      formule: nomFormule,
      formuleId: formule,
      dureeMois: devis.mois,
      etablissements: devis.etablissements,
      marche: nomMarche,
      marcheCode: pays,
      devise: devis.devise,
      /* The length travels with the request: it is the one figure the structure
         picked, and the one its recap has to name. */
      rythme: `${nomFormule} · ${devis.mois} ${t('dv.months')}`,
      montantMensuel: `${devis.parMois} ${t('dv.perMonth')}`,
      montantTotal: `${devis.total} ${t('dv.perDuree')}`,
      miseEnRoute: String(data.get('miseEnRoute') || ''),
      resume,
      message: messageSaisi,
    };

    try {
      const { data: answer, error } = await supabase.functions.invoke('devis-abonnement', {
        body: payload,
      });
      if (error) {
        setStatus('err');
        setFormError(t('dv.errSend'));
        return;
      }
      const result = answer as { ok?: boolean; emailed?: boolean; error?: string } | null;
      if (!result?.ok) {
        setStatus('err');
        setFormError(t('dv.errSend'));
        return;
      }
      setEmailed(Boolean(result.emailed));
      setStatus('ok');
    } catch {
      setStatus('err');
      setFormError(t('dv.errNet'));
    }
  };

  const recommencer = () => {
    setStatus('idle');
    setFormError('');
    setMessage('');
    setEmailed(false);
    /* A new reference for the next quote: two distinct files never share one. */
    reference.current = `DEV-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  return (
    <div className="dv">
      <div className="dv-setup">
        <div className="dv-field">
          <span className="dv-label">{t('dv.duree')}</span>
          <div className="dv-plans" role="group" aria-label={t('dv.duree')}>
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`dv-plan${formule === plan.id ? ' is-on' : ''}`}
                aria-pressed={formule === plan.id}
                onClick={() => setFormule(plan.id)}
              >
                <span className="dv-plan-ico" aria-hidden="true">
                  <i className={plan.icon}></i>
                </span>
                <span className="dv-plan-txt">
                  <b>{t(plan.name)}</b>
                  <em>{prixPlan(plan, pays, t)}</em>
                </span>
                <i
                  className={formule === plan.id ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}
                  aria-hidden="true"
                ></i>
              </button>
            ))}
          </div>
          <p className="dv-hint">
            <i className="ri-information-line" aria-hidden="true"></i>
            <span>{t(hintKey)}</span>
          </p>
        </div>

        <div className="dv-field">
          <label className="dv-label" htmlFor={`${baseId}-sites`}>{t('dv.sites')}</label>
          <div className="dv-stepper">
            <button
              type="button"
              className="dv-step-btn"
              aria-label={t('dv.moins')}
              disabled={devis.etablissements <= 1}
              onClick={() => changerSites(-1)}
            >
              <i className="ri-subtract-line" aria-hidden="true"></i>
            </button>
            <input
              id={`${baseId}-sites`}
              className="dv-step-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={SITES_MAX}
              step={1}
              value={sites}
              aria-label={t('dv.sitesAria')}
              onChange={(event) => setSites(bornerSites(Number(event.target.value)) || 1)}
            />
            <button
              type="button"
              className="dv-step-btn"
              aria-label={t('dv.plus')}
              disabled={devis.etablissements >= SITES_MAX}
              onClick={() => changerSites(1)}
            >
              <i className="ri-add-line" aria-hidden="true"></i>
            </button>
          </div>
          <p className="dv-hint">
            <i className="ri-community-line" aria-hidden="true"></i>
            <span>{t('dv.sitesHint')}</span>
          </p>
        </div>

        <div className="dv-field">
          <label className="dv-label" htmlFor={`${baseId}-pays`}>{t('dv.marche')}</label>
          <select
            id={`${baseId}-pays`}
            className="dv-select"
            value={pays}
            onChange={(event) => choisir(event.target.value)}
          >
            {paysArabes.map((item) => (
              <option key={item.code} value={item.code}>
                {localize(item.nom, lang)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="dv-panel">
        <div className="dv-total" aria-live="polite">
          <span className="dv-total-stamp">{t('dv.quoteStamp')}</span>
          <p className="dv-total-figure">
            <strong>{devis.total}</strong>
            <span className="dv-total-per">{t('dv.perDuree')}</span>
          </p>
          {/* La durée choisie, nommée juste sous le montant : c'est elle que la
              structure voit dans son récapitulatif, avant comme après l'envoi. */}
          <p className="dv-total-length">
            <span className="dv-total-length-stamp">{t('dv.dureeRetenue')}</span>
            <i className={planActuel.icon} aria-hidden="true"></i>
            <b>{nomFormule}</b>
            <em>
              {devis.mois} {t('dv.months')} · {t(planActuel.per)}
            </em>
          </p>
          {devis.origine && (
            <p className="dv-total-origine">
              {t('dv.origine')} <b>{devis.origine}</b>
            </p>
          )}

          <dl className="dv-lines">
            <div>
              <dt>
                {t('dv.forfait')}
                <em>
                  {devis.mois} {t('dv.months')} · {bareme.inclus}{' '}
                  {bareme.inclus > 1 ? t('dv.forfaitInclusMany') : t('dv.forfaitInclus')}
                </em>
              </dt>
              <dd>{devis.forfait}</dd>
            </div>
            {devis.extra > 0 && (
              <div>
                <dt>
                  {t('dv.sitesSup')} <em>{devis.extra}</em>
                </dt>
                <dd>
                  {devis.extra} × {devis.siteSup} × {devis.mois}
                </dd>
              </div>
            )}
            <div className="is-strong">
              <dt>{t('dv.totalDuree')}</dt>
              <dd>{devis.total}</dd>
            </div>
            <div>
              <dt>{t('dv.parMoisDur')}</dt>
              <dd>{devis.parMois}</dd>
            </div>
            {devis.economie && (
              <div>
                <dt>{t('dv.prixPlein')}</dt>
                <dd>{devis.plein}</dd>
              </div>
            )}
          </dl>

          {devis.economie && (
            <p className="dv-saving">
              <i className="ri-price-tag-3-line" aria-hidden="true"></i>
              <span>
                {t('dv.saving')} <b>{devis.economie}</b>
              </span>
            </p>
          )}
          <p className="dv-note">
            <i className="ri-information-line" aria-hidden="true"></i>
            <span>{t('dv.indicative')}</span>
          </p>
        </div>

        {status === 'ok' ? (
          <div className="dv-done">
            <i className={emailed ? 'ri-check-double-line' : 'ri-file-list-3-line'} aria-hidden="true"></i>
            <p className="dv-done-text">{emailed ? t('dv.ok') : t('dv.okNoMail')}</p>
            <p className="dv-done-ref">
              {t('dv.ref')} <strong>{reference.current}</strong>
            </p>
            <p className="dv-note">
              <i className="ri-shield-check-line" aria-hidden="true"></i>
              <span>{t('dv.okHint')}</span>
            </p>
            <button type="button" className="dv-reset" onClick={recommencer}>
              <i className="ri-arrow-go-back-line" aria-hidden="true"></i>
              {t('dv.reset')}
            </button>
          </div>
        ) : (
          <form
            id="paperatlas-devis"
            className="dv-form"
            onSubmit={onSubmit}
          >
            <p className="dv-form-stamp">{t('dv.requestStamp')}</p>
            <h3 className="dv-form-title">{t('dv.requestTitle')}</h3>
            {/* La durée retenue est écrite en tête de la demande, avec son
                montant : la structure n'a pas à la retrouver ailleurs, et le
                récapitulatif qu'elle reçoit porte le même mot. */}
            <p className="dv-recap">
              <i className="ri-calendar-check-line" aria-hidden="true"></i>
              <span>
                {t('dv.dureeRetenue')} <b>{nomFormule}</b> · {devis.mois}{' '}
                {t('dv.months')} — {devis.total} {t('dv.perDuree')}
              </span>
            </p>

            <input
              type="text"
              name="website_alt"
              className="dv-alt"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              readOnly
            />
            <div className="dv-fields">
              <div className="dv-fld">
                <label htmlFor={`${baseId}-nom`}>{t('dv.name')}</label>
                <input
                  id={`${baseId}-nom`}
                  name="name"
                  required
                  autoComplete="name"
                  placeholder={t('dv.namePh')}
                  value={nomSaisi}
                  onChange={(event) => setNomSaisi(event.target.value)}
                />
              </div>
              <div className="dv-fld">
                <label htmlFor={`${baseId}-email`}>{t('dv.email')}</label>
                <input
                  id={`${baseId}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={t('dv.emailPh')}
                  value={emailSaisi}
                  onChange={(event) => setEmailSaisi(event.target.value)}
                />
              </div>
              <div className="dv-fld">
                <label htmlFor={`${baseId}-org`}>{t('dv.org')}</label>
                <input
                  id={`${baseId}-org`}
                  name="organisation"
                  autoComplete="organization"
                  placeholder={t('dv.orgPh')}
                  value={orgSaisie}
                  onChange={(event) => setOrgSaisie(event.target.value)}
                />
              </div>
              <div className="dv-fld">
                <label htmlFor={`${baseId}-tel`}>{t('dv.phone')}</label>
                <input id={`${baseId}-tel`} name="telephone" type="tel" autoComplete="tel" placeholder="+213 00 00 00 00" />
              </div>
              <div className="dv-fld">
                <label htmlFor={`${baseId}-start`}>{t('dv.start')}</label>
                <input id={`${baseId}-start`} name="miseEnRoute" type="date" />
              </div>
            </div>

            <div className="dv-fld">
              <label htmlFor={`${baseId}-msg`}>
                {t('dv.msg')} <em>({message.length}/500 {t('dv.length')})</em>
              </label>
              <textarea
                id={`${baseId}-msg`}
                name="message"
                maxLength={500}
                rows={3}
                placeholder={t('dv.msgPh')}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="dv-send" disabled={status === 'sending'}>
              <span className="whitespace-nowrap">
                {status === 'sending' ? t('dv.sending') : t('dv.send')}
              </span>
              <i className={status === 'sending' ? 'ri-loader-4-line is-spin' : 'ri-send-plane-line'} aria-hidden="true"></i>
            </button>

            {status === 'err' && formError && (
              <p className="dv-error" role="alert">
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                <span>{formError}</span>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}