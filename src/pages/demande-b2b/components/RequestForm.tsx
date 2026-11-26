import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { useAuth } from '@/auth/AuthProvider';
import { sendB2bRequest, type B2bIssue, type B2bTarget } from '@/lib/b2b';
import ConsentLegal, { consentementComplet, consentementDepuis } from '@/components/feature/ConsentLegal';

type Props = {
  selected: B2bTarget[];
  reference: string;
  onSent: (reference: string) => void;
  onReset: () => void;
};

const MESSAGES: Record<B2bIssue, string> = {
  net: 'b2b.errNet',
  invalid: 'b2b.errName',
  'no-target': 'b2b.errTarget',
  'too-many': 'b2b.errTarget',
  insert: 'b2b.errSend',
  unauthorized: 'b2b.errSend',
  'no-card': 'b2b.errSend',
};

export default function RequestForm({ selected, reference, onSent, onReset }: Props) {
  const { t, lang } = useLang();
  const { session, compte } = useAuth();
  const [status, setStatus] = useState<'idle' | 'sending' | 'err'>('idle');
  const [formError, setFormError] = useState('');
  const [count, setCount] = useState(0);
  /* True when the receipt mail actually left: the copy must not promise a mail
     that the server could not send. */
  const [mailOk, setMailOk] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const seeded = useRef(false);

  /* A signed-in member should not retype what the account already knows. */
  useEffect(() => {
    if (seeded.current || !compte || !formRef.current) return;
    seeded.current = true;
    const form = formRef.current;
    const set = (name: string, value: string) => {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
    };
    set('nom', compte.nom ?? '');
    set('email', compte.email ?? '');
    set('organisme', compte.organisme ?? '');
    set('telephone', compte.telephone ?? '');
  }, [compte]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    /* Honeypot: a filled field means a bot — stop silently. */
    if (String(data.get('website_alt') || '').trim()) return;

    const nom = String(data.get('nom') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    if (selected.length === 0) {
      setStatus('err');
      setFormError(t('b2b.errTarget'));
      return;
    }
    if (!nom || !email) {
      setStatus('err');
      setFormError(t('b2b.errName'));
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setStatus('err');
      setFormError(t('b2b.errEmail'));
      return;
    }
    if (!message) {
      setStatus('err');
      setFormError(t('b2b.errMsg'));
      return;
    }
    if (message.length > 500) {
      setStatus('err');
      setFormError(t('b2b.errLong'));
      return;
    }
    const consentement = consentementDepuis(data);
    if (!consentementComplet(consentement)) {
      setStatus('err');
      setFormError(t('consent.err'));
      return;
    }

    setStatus('sending');
    setFormError('');

    const result = await sendB2bRequest({
      targets: selected,
      lang,
      nom,
      email,
      telephone: String(data.get('telephone') || '').trim(),
      organisme: String(data.get('organisme') || '').trim(),
      quantite: String(data.get('quantite') || '').trim(),
      delai: String(data.get('delai') || '').trim(),
      budget: String(data.get('budget') || '').trim(),
      message,
      consentement,
    });

    if (result.ok) {
      setStatus('idle');
      setCount(0);
      setMailOk(result.confirmed);
      form.reset();
      seeded.current = false;
      onSent(result.reference);
      return;
    }

    setStatus('err');
    setFormError(t(MESSAGES[result.issue] ?? 'b2b.errSend'));
  };

  if (reference) {
    return (
      <section className="b2b-form b2b-done" aria-live="polite">
        <i className="ri-check-double-line" aria-hidden="true"></i>
        <h2>{t('b2b.ok')}</h2>
        <p className="b2b-done-ref">
          {t('b2b.okRef')} <strong>{reference}</strong>
        </p>
        <p className="b2b-done-hint">{t('b2b.okHint')}</p>
        {mailOk && (
          <p className="b2b-done-mail">
            <i className="ri-mail-check-line" aria-hidden="true"></i>
            {t('b2b.okMail')}
          </p>
        )}
        <div className="b2b-done-actions">
          {session && (
            <Link to="/compte#demandes-b2b" className="cta">
              {t('b2b.toAccount')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          )}
          <button
            type="button"
            className="ghost-btn"
            onClick={() => {
              setMailOk(false);
              onReset();
            }}
          >
            <i className="ri-add-line" aria-hidden="true"></i>
            {t('b2b.again')}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="b2b-form" aria-labelledby="b2b-form-title">
      <div className="b2b-form-head">
        <h2 id="b2b-form-title">{t('b2b.formTitle')}</h2>
        <p>{t('b2b.formNote')}</p>
      </div>

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <input
          type="text"
          name="website_alt"
          className="fld-aux"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          readOnly
          onFocus={(event) => event.currentTarget.removeAttribute('readonly')}
        />

        <div className="form-grid">
          <div className="fld">
            <label htmlFor="b2b-nom">{t('b2b.name')} *</label>
            <input id="b2b-nom" name="nom" required autoComplete="name" placeholder={t('cf.namePh')} />
          </div>
          <div className="fld">
            <label htmlFor="b2b-email">{t('b2b.email')} *</label>
            <input id="b2b-email" name="email" type="email" required autoComplete="email" placeholder={t('cf.emailPh')} />
          </div>
          <div className="fld">
            <label htmlFor="b2b-org">{t('b2b.org')}</label>
            <input id="b2b-org" name="organisme" autoComplete="organization" placeholder={t('cf.orgPh')} />
          </div>
          <div className="fld">
            <label htmlFor="b2b-tel">{t('b2b.phone')}</label>
            <input id="b2b-tel" name="telephone" type="tel" autoComplete="tel" placeholder="+…" />
          </div>
          <div className="fld">
            <label htmlFor="b2b-qty">{t('b2b.qty')}</label>
            <input id="b2b-qty" name="quantite" placeholder={t('b2b.qtyPh')} />
          </div>
          <div className="fld">
            <label htmlFor="b2b-delai">{t('b2b.deadline')}</label>
            <input id="b2b-delai" name="delai" placeholder={t('b2b.deadlinePh')} />
          </div>
          <div className="fld">
            <label htmlFor="b2b-budget">{t('b2b.budget')}</label>
            <input id="b2b-budget" name="budget" placeholder={t('b2b.budgetPh')} />
          </div>
        </div>

        <div className="fld">
          <label htmlFor="b2b-msg">
            {t('b2b.msg')} *
            {/* The counter is a figure, not a sentence: kept left-to-right and
                isolated, so an Arabic page never reads it « 500/0 ». */}
            <span className="b2b-count" dir="ltr">
              {count}/500
            </span>
          </label>
          <textarea
            id="b2b-msg"
            name="message"
            maxLength={500}
            required
            rows={6}
            onChange={(event) => setCount(event.target.value.length)}
            placeholder={t('b2b.msgPh')}
          ></textarea>
        </div>

        <p className="b2b-note">
          <i className="ri-information-line" aria-hidden="true"></i>
          {session ? t('b2b.accountNote') : t('b2b.guestNote')}
        </p>

        <ConsentLegal idPrefix="rq" />
        <button type="submit" className="cta b2b-submit" disabled={status === 'sending'}>
          <i className="ri-send-plane-line" aria-hidden="true"></i>
        </button>

        {status === 'err' && <p className="form-msg err">{formError}</p>}
      </form>
    </section>
  );
}