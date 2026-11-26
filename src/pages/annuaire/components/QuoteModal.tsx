import { useEffect, useState, type FormEvent } from 'react';
import { useLang } from '@/i18n/LangProvider';
import { useQuoteRef } from '@/hooks/useQuoteRef';
import { readRequester, saveRequester, clearRequester, type Requester } from '@/hooks/useRequester';
import { saveDossier } from '@/hooks/useDossiers';
import { nomRegion } from '@/lib/regionLabels';
import { nomCommune } from '@/lib/communeLabels';
import { supabase } from '@/lib/supabase';
import ConsentLegal, { consentementComplet, consentementDepuis } from '@/components/feature/ConsentLegal';
import type { Entreprise } from '@/mocks/entreprises';

type Props = {
  items: Entreprise[];
  reference?: string;
  onClose: () => void;
};

export default function QuoteModal({ items, reference: referenceProp, onClose }: Props) {
  const { t, lang } = useLang();
  const fallbackRef = useQuoteRef('entreprises', items.map((item) => item.id));
  /** A dossier opened from a shared link keeps the reference it was sent with. */
  const reference = referenceProp || fallbackRef;
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [formError, setFormError] = useState('');
  const [count, setCount] = useState(0);
  const [requester, setRequester] = useState<Requester>(() => readRequester());
  const [prefilled, setPrefilled] = useState<boolean>(() => {
    const stored = readRequester();
    return Boolean(stored.name || stored.email || stored.org);
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const partners = items.map((e) => e.name).join(' · ');

  const forgetRequester = () => {
    clearRequester();
    setRequester({ name: '', email: '', org: '' });
    setPrefilled(false);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const trap = String(data.get('website_alt') || '').trim();
    if (trap) {
      setStatus('ok');
      return;
    }
    data.delete('website_alt');

    const message = String(data.get('message') || '');
    const nameValue = String(data.get('name') || '').trim();
    const emailValue = String(data.get('email') || '').trim();
    const orgValue = String(data.get('organisation') || '').trim();
    if (message.length > 500) {
      setStatus('err');
      setFormError(t('cf.errLong'));
      return;
    }
    if (!nameValue || !emailValue) {
      setStatus('err');
      setFormError(t('cf.errName'));
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

    try {
      const { data: result, error } = await supabase.functions.invoke('enregistrer-demande', {
        body: {
          type: 'devis',
          nom: nameValue,
          email: emailValue,
          consentement,
          telephone: String(data.get('telephone') || ''),
          champs: {
            reference,
            partenaires: partners,
            organisation: orgValue,
            quantite: String(data.get('quantite') || ''),
            delai: String(data.get('delai') || ''),
            budget: String(data.get('budget') || ''),
            message,
            langue: lang,
          },
        },
      });

      if (!error && result?.ok) {
        saveRequester({ name: nameValue, email: emailValue, org: orgValue });
        setRequester({ name: nameValue, email: emailValue, org: orgValue });
        setPrefilled(true);
        saveDossier({
          ref: reference,
          kind: 'entreprises',
          ids: items.map((item) => item.id),
          names: items.map((item) => item.name),
        });
        setStatus('ok');
      } else {
        setStatus('err');
        setFormError(t('cf.errSend'));
      }
    } catch {
      setStatus('err');
      setFormError(t('cf.errNet'));
    }
  };

  return (
    <div
      className="cmp-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t('quote.title')}
      onClick={onClose}
    >
      <div className="cmp-panel quote-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmp-panel-head">
          <h2>{t('quote.title')}</h2>
          <button type="button" className="cmp-close" onClick={onClose} aria-label={t('cmp.close')}>
            <i className="ri-close-line" aria-hidden="true"></i>
          </button>
        </div>

        <p className="quote-lede">{t('quote.lede')}</p>

        {reference && (
          <p className="quote-ref">
            <i className="ri-hashtag" aria-hidden="true"></i>
            <span>{t('quote.ref')}</span>
            <strong>{reference}</strong>
          </p>
        )}

        <div className="quote-block">
          <p className="quote-label">
            {t('quote.partners')} <span>{items.length}</span>
          </p>
          <ul className="quote-partners">
            {items.map((e) => (
              <li key={e.id}>
                <span className="logo-mark">{e.logoMark}</span>
                <span className="quote-partner-txt">
                  <strong>{e.name}</strong>
                  <em>{t(`trade.${e.trade}`)} · {nomCommune(e.commune, lang)} · {nomRegion(e.wilaya, lang)}</em>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {status === 'ok' ? (
          <div className="quote-done">
            <i className="ri-check-double-line" aria-hidden="true"></i>
            <p className="form-msg ok">{t('quote.ok')}</p>
            {reference && <p className="quote-done-ref">{t('quote.ref')} <strong>{reference}</strong></p>}
            <p className="quote-hint">{t('quote.hint')}</p>
          </div>
        ) : (
          <form id="paperatlas-quote" className="quote-form" onSubmit={onSubmit}>
            <input
              type="text"
              name="website_alt"
              className="fld-aux"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              readOnly
            />
            <input type="hidden" name="partenaires" value={partners} />
            <input type="hidden" name="reference" value={reference} />
            {prefilled && (
              <p className="quote-prefill">
                <i className="ri-user-received-line" aria-hidden="true"></i>
                <span>{t('req.remembered')}</span>
                <button type="button" className="quote-prefill-x" onClick={forgetRequester}>
                  {t('req.forget')}
                </button>
              </p>
            )}
            <div className="form-grid">
              <div className="fld">
                <label htmlFor="ql-name">{t('quote.name')}</label>
                <input
                  id="ql-name"
                  name="name"
                  required
                  placeholder={t('cf.namePh')}
                  value={requester.name}
                  onChange={(e) => setRequester((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="fld">
                <label htmlFor="ql-email">{t('quote.email')}</label>
                <input
                  id="ql-email"
                  type="email"
                  name="email"
                  required
                  placeholder={t('cf.emailPh')}
                  value={requester.email}
                  onChange={(e) => setRequester((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="fld">
                <label htmlFor="ql-org">{t('quote.org')}</label>
                <input
                  id="ql-org"
                  name="organisation"
                  placeholder={t('cf.orgPh')}
                  value={requester.org}
                  onChange={(e) => setRequester((prev) => ({ ...prev, org: e.target.value }))}
                />
              </div>
              <div className="fld">
                <label htmlFor="ql-phone">{t('quote.phone')}</label>
                <input id="ql-phone" name="telephone" inputMode="tel" placeholder="+…" />
              </div>
              <div className="fld">
                <label htmlFor="ql-qty">{t('quote.qty')}</label>
                <input id="ql-qty" name="quantite" placeholder={t('quote.qtyPh')} />
              </div>
              <div className="fld">
                <label htmlFor="ql-delay">{t('quote.deadline')}</label>
                <input id="ql-delay" name="delai" placeholder={t('quote.deadlinePh')} />
              </div>
              <div className="fld">
                <label htmlFor="ql-budget">{t('quote.budget')}</label>
                <input id="ql-budget" name="budget" placeholder={t('quote.budgetPh')} />
              </div>
            </div>
            <div className="fld">
              <label htmlFor="ql-msg">
                {t('quote.msg')} <span className="fld-count">({count}/500)</span>
              </label>
              <textarea
                id="ql-msg"
                name="message"
                maxLength={500}
                onChange={(e) => setCount(e.target.value.length)}
                placeholder={t('quote.msgPh')}
              ></textarea>
            </div>
            <ConsentLegal idPrefix="ql" />
            <button type="submit" className="cta" disabled={status === 'sending'}>
              {status === 'sending' ? t('quote.sending') : t('quote.send')}
              <i className="ri-send-plane-line" aria-hidden="true"></i>
            </button>
            {status === 'err' && <p className="form-msg err">{formError}</p>}
          </form>
        )}
      </div>
    </div>
  );
}