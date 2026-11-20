import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';

/* Les sujets possibles, dans l'ordre où ils sont proposés. L'identifiant sert
   dans l'adresse — /?sujet=devis#contact — et la clé donne le libellé traduit
   qui part avec la demande. */
const SUBJECTS = [
  { id: 'devis', key: 'cf.subject.devis' },
  { id: 'inscription', key: 'cf.subject.inscription' },
  { id: 'soustraitance', key: 'cf.subject.soustraitance' },
];

export default function ContactPanel() {
  const { t, lang } = useLang();
  const { search } = useLocation();
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'err'>('idle');
  const [formError, setFormError] = useState('');
  const [count, setCount] = useState(0);
  /* Le prénom saisi est retenu le temps de la confirmation : « Merci Karim »
     répond à quelqu'un, là où « Demande envoyée » répondait à un formulaire. */
  const [firstName, setFirstName] = useState('');
  /* Le sujet part au même moment : la confirmation rappelle ce qui a été
     demandé, pas seulement le nom de la personne. */
  const [sentSubject, setSentSubject] = useState('');

  const profiles = ['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'auteur', 'fournisseur', 'admin'];

  /* Le sujet range la demande dès la réception : le tri se fait dans la boîte
     des formulaires, sans relire le message pour deviner de quoi il s'agit.
     Un lien peut l'apporter déjà choisi — la page Formules & tarifs arrive ici
     avec « Devis » retenu. */
  const subjects = SUBJECTS;
  const asked = new URLSearchParams(search).get('sujet') || '';
  const initialSubject = subjects.some((s) => s.id === asked) ? asked : 'devis';
  const initialSubjectValue = t(`cf.subject.${initialSubject}`);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    /* Le contenu est lu sur le formulaire lui-même : les champs remplis par le
       navigateur ne passent pas toujours par l'état du composant. */
    const data = new FormData(form);
    const trap = String(data.get('company_alt') || '').trim();
    if (trap) { setStatus('ok'); return; }
    data.delete('company_alt');
    const message = String(data.get('message') || '');
    if (message.length > 500) { setStatus('err'); setFormError(t('cf.errLong')); return; }
    const name = String(data.get('name') || '').trim();
    if (!name || !String(data.get('email') || '').trim()) {
      setStatus('err'); setFormError(t('cf.errName')); return;
    }
    setStatus('sending'); setFormError('');
    const chosen = String(data.get('sujet') || '').trim();
    /* Le compteur de la console range par identifiant, jamais par libellé :
       « Devis », « عرض سعر » et « Quote » sont le même sujet, et le total
       ne doit pas se couper en trois selon la langue du visiteur. */
    const chosenId = subjects.find((s) => t(s.key) === chosen)?.id || '';
    try {
      const { data: result, error } = await supabase.functions.invoke('enregistrer-demande', {
        body: {
          type: 'contact',
          nom: name,
          email: String(data.get('email') || ''),
          sujet: chosenId,
          profil: String(data.get('profil') || ''),
          organisation: String(data.get('organisation') || ''),
          message,
        },
      });
      if (!error && result?.ok) {
        setFirstName(name.split(/\s+/)[0] || '');
        setSentSubject(chosen);
        setStatus('ok');
        form.reset();
        setCount(0);
      } else {
        setStatus('err'); setFormError(t('cf.errSend'));
      }
    } catch {
      setStatus('err'); setFormError(t('cf.errNet'));
    }
  };

  const writeAgain = () => {
    setStatus('idle');
    setFormError('');
    setCount(0);
    setFirstName('');
    setSentSubject('');
  };

  return (
    <section className="panel panel--contact" data-side="left" id="contact">
      <img className="panel-bg" data-parallax="0.32" alt="Palettes de cartons et de livres emballés dans un entrepôt d'imprimerie" title="Contact PaperAtlas, demande de devis impression" src="/media/panel-contact.jpg" />
      <div className="panel-veil"></div>
      <div className="panel-copy panel-copy--contact" data-parallax="-0.08">
        <p className="stamp" data-reveal>{t('ct.stamp')}</p>
        <h2 data-reveal dangerouslySetInnerHTML={{ __html: t('ct.title') }} />
        <p className="ct-coord" data-reveal>
          <i className="ri-mail-line" aria-hidden="true"></i>
          <a href="mailto:contact@paperatlas.net">contact@paperatlas.net</a>
          <span className="ct-coord-sep" aria-hidden="true">·</span>
          <i className="ri-time-line" aria-hidden="true"></i>
          <span>{t('cf.headNote')}</span>
        </p>

        {status === 'ok' ? (
          <div className="ct-sent" role="status" data-reveal>
            <i className="ri-checkbox-circle-line" aria-hidden="true"></i>
            <div className="ct-sent-head">
              <h3>
                {firstName
                  ? t('cf.sentHi').replace('{name}', firstName)
                  : t('cf.sentTitle')}
              </h3>
              {sentSubject && (
                <span className="ct-sent-subject" aria-label={t('cf.sentSubjectAria')}>
                  <i className="ri-price-tag-3-line" aria-hidden="true"></i>
                  <span className="ct-sent-subject-label">{t('cf.subject')}</span>
                  <strong>{sentSubject}</strong>
                </span>
              )}
            </div>
            <p>{t('cf.sentBody')}</p>
            <button type="button" className="ct-again" onClick={writeAgain}>
              <i className="ri-quill-pen-line" aria-hidden="true"></i>
              {t('cf.again')}
            </button>
          </div>
        ) : (
          <form id="paperatlas-contact" className="form-card contact-card" onSubmit={onSubmit} data-reveal>
            <div className="ct-form-head">
              <h3>{t('cf.head')}</h3>
              <p className="ct-form-note">
                <i className="ri-shield-check-line" aria-hidden="true"></i>
                {t('cf.headNote')}
              </p>
            </div>
            <input type="text" name="company_alt" className="fld-aux" tabIndex={-1} autoComplete="off" aria-hidden="true" readOnly onFocus={(e) => e.currentTarget.removeAttribute('readonly')} />
            <div className="form-grid">
              <div className="fld"><label htmlFor="cf-name">{t('cf.name')}</label><input id="cf-name" name="name" required autoComplete="name" placeholder={t('cf.namePh')} /></div>
              <div className="fld"><label htmlFor="cf-email">{t('cf.email')}</label><input id="cf-email" type="email" name="email" required autoComplete="email" placeholder={t('cf.emailPh')} /></div>
              <div className="fld"><label htmlFor="cf-org">{t('cf.org')}</label><input id="cf-org" name="organisation" autoComplete="organization" placeholder={t('cf.orgPh')} /></div>
              <div className="fld">
                <label htmlFor="cf-type">{t('cf.type')}</label>
                <select id="cf-type" name="profil" defaultValue={t('opt.imprimerie')}>
                  {profiles.map((p) => <option key={p} value={t(`opt.${p}`)}>{t(`opt.${p}`)}</option>)}
                </select>
              </div>
              {/* Le sujet occupe la ligne entière : c'est la première chose que
                  l'équipe lit, elle ne se glisse pas dans une demi-colonne. La
                  valeur de départ vient de l'adresse : la page Formules & tarifs
                  y arrive avec « Devis » déjà retenu. */}
              <div className="fld fld--full">
                <label htmlFor="cf-subject">{t('cf.subject')}</label>
                <select
                  key={`${initialSubject}-${lang}`}
                  id="cf-subject"
                  name="sujet"
                  defaultValue={initialSubjectValue}
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={t(s.key)}>{t(s.key)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="fld">
              <label htmlFor="cf-msg">{t('cf.msg')} ({count}/500)</label>
              <textarea id="cf-msg" name="message" maxLength={500} onChange={(e) => setCount(e.target.value.length)} placeholder={t('cf.msgPh')} />
            </div>
            <button type="submit" className="cta ct-submit" disabled={status === 'sending'}>
              {status === 'sending' ? t('cf.sending') : t('cf.send')} <i className="ri-arrow-right-line"></i>
            </button>
            {status === 'err' && (
              <p className="form-msg err ct-err" role="alert">
                <i className="ri-error-warning-line" aria-hidden="true"></i>
                <span>{formError}</span>
              </p>
            )}
          </form>
        )}

        <p className="ct-signup" data-reveal>
          <i className="ri-user-add-line" aria-hidden="true"></i>
          <span>{t('ct.signupNote')}</span>
          <Link to="/compte/inscription" className="ct-signup-link">
            {t('ct.signupCta')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
          <small className="ct-signup-hint">{t('ct.signupHint')}</small>
        </p>
      </div>
    </section>
  );
}