import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { supabase } from '@/lib/supabase';
import { exempleTelephone, indicatifDe, PAYS_DEFAUT, paysDevine, paysTrouve } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import PaysSelect from '@/components/feature/PaysSelect';
import PasswordField from '@/components/feature/PasswordField';
import AuthSide from '@/pages/compte/components/AuthSide';
import AuthBrand from '@/pages/compte/components/AuthBrand';
import { authErrorKey } from '@/pages/compte/components/authErrors';
import {
  planById,
  isPlanId,
  prixPlan,
  type PlanId,
} from '@/pages/offres/components/plans';
import PlanPills from '@/pages/offres/components/PlanPills';

const METIERS = ['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'auteur', 'fournisseur', 'admin'];

type Status = 'idle' | 'sending' | 'confirm' | 'error';

export default function Inscription() {
  useSeo({ page: 'compte', path: '/compte/inscription' });
  const { t, lang } = useLang();
  useReveal();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  /* A card names its plan in the address; a visitor who lands here from the
     menu can still pick one of the three pills at the top of the form. */
  const fromCard = isPlanId(params.get('plan'));
  const [planPick, setPlanPick] = useState<PlanId | null>(() => {
    const asked = params.get('plan');
    return isPlanId(asked) ? asked : null;
  });
  const chosenPlan = planById(planPick);
  const [bannerOpen, setBannerOpen] = useState(true);
  /* The country picks the regions offered right below it. A card on « Offres »
     names its market in the address, so the form opens on the very money the
     price was read in, not the one this device happened to remember. */
  const [pays, setPays] = useState(() => {
    const asked = params.get('pays')?.toUpperCase() ?? '';
    return paysTrouve(asked) ? asked : paysDevine();
  });
  /* The length picked on the card is written on the account, so « Mon compte »
     names the same one once the address is confirmed — and the journal says
     which length was chosen, never only that a subscription was. */
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resent, setResent] = useState(false);

  const base = __BASE_PATH__.replace(/\/$/, '');

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const nom = String(data.get('nom') || '').trim();
    const email = String(data.get('email') || '').trim();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    const accepted = data.get('accept') !== null;

    const fail = (key: string) => {
      setStatus('error');
      setFormError(t(key));
    };

    if (!nom || !email || !password) return fail('acct.errRequired');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail('acct.errEmail');
    if (password.length < 8) return fail('acct.errPwdShort');
    if (password !== confirm) return fail('acct.errPwdMatch');
    if (!accepted) return fail('acct.errAccept');

    setStatus('sending');
    setFormError('');

    try {
      const { data: result, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${base}/compte`,
          data: {
            nom,
            organisme: String(data.get('organisme') || '').trim() || null,
            metier: String(data.get('metier') || '').trim() || null,
            wilaya: String(data.get('wilaya') || '').trim() || null,
            pays: String(data.get('pays') || '').trim() || PAYS_DEFAUT,
            telephone: String(data.get('telephone') || '').trim() || null,
            langue: lang,
            /* The plan picked on a card travels with the account, so « Mon
               compte » can name it once the address is confirmed. */
            ...(chosenPlan ? { formule: chosenPlan.id } : {}),
          },
        },
      });

      if (error) {
        setStatus('error');
        setFormError(t(authErrorKey(error.message)));
        return;
      }

      if (result.session) {
        navigate('/compte', { replace: true });
        return;
      }

      setPendingEmail(email);
      setStatus('confirm');
      form.reset();
    } catch {
      setStatus('error');
      setFormError(t('acct.errNet'));
    }
  };

  const resend = async () => {
    if (!pendingEmail) return;
    setResent(false);
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: { emailRedirectTo: `${window.location.origin}${base}/compte` },
      });
      setResent(true);
    } catch {
      setFormError(t('acct.errNet'));
    }
  };

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <AuthBrand />
          <p className="stamp">{t('acct.up.stamp')}</p>
          <h1 className="page-h1" dangerouslySetInnerHTML={{ __html: t('acct.up.title') }} />
          <p className="lede">{t('acct.up.lede')}</p>
        </section>

        <section className="dir-body">
          <div className="auth-grid">
            {status === 'confirm' ? (
              <div className="form-card auth-card">
                <div className="auth-done">
                  <i className="ri-mail-check-line" aria-hidden="true"></i>
                  <h2 className="page-h2">{t('acct.confirmTitle')}</h2>
                  <p className="auth-note">{t('acct.confirmBody')}</p>
                  <p className="auth-note">
                    <strong>{pendingEmail}</strong>
                  </p>
                  <p className="auth-note">{t('acct.confirmNote')}</p>
                  <div className="acct-actions">
                    <button type="button" className="cta" onClick={resend}>
                      <i className="ri-refresh-line" aria-hidden="true"></i>
                      {t('acct.resend')}
                    </button>
                    <Link to="/compte/connexion" className="ghost-btn">
                      {t('acct.toSignin')}
                    </Link>
                  </div>
                  {resent && <p className="form-msg ok">{t('acct.resent')}</p>}
                  {formError && <p className="form-msg err">{formError}</p>}
                </div>
              </div>
            ) : (
              <form className="form-card auth-card" id="account-signup" onSubmit={onSubmit} data-reveal>
                {!fromCard && (
                  <PlanPills
                    name="plan-pick"
                    value={planPick}
                    pays={pays}
                    label={t('ofp.pick')}
                    hint={t('ofp.pickHint')}
                    onChange={(id) => {
                      setPlanPick(id);
                      setBannerOpen(true);
                    }}
                  />
                )}

                {chosenPlan && bannerOpen && (
                  <div className="of-plan-banner" role="status">
                    <span className="of-plan-banner-icon" aria-hidden="true">
                      <i className={chosenPlan.icon}></i>
                    </span>
                    <div className="of-plan-banner-main">
                      <span className="of-plan-banner-badge">{t('ofb.badge')}</span>
                      <p className="of-plan-banner-title">
                        {t('ofb.chosen')} <strong>{t(chosenPlan.name)}</strong>
                        <span className="of-plan-banner-price">
                          {` — ${prixPlan(chosenPlan, pays, t)} ${t(chosenPlan.per)}`}
                        </span>
                      </p>

                      <p className="of-plan-banner-hint">
                        {t('ofb.hint')}
                      </p>
                    </div>
                    <div className="of-plan-banner-actions">
                      <Link to="/offres" className="of-plan-banner-link">
                        <span className="whitespace-nowrap">{t('ofb.compare')}</span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                      <button
                        type="button"
                        className="of-plan-banner-close"
                        onClick={() => setBannerOpen(false)}
                        aria-label={t('ofb.dismiss')}
                        title={t('ofb.dismiss')}
                      >
                        <i className="ri-close-line" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                )}

                <div className="fld">
                  <label htmlFor="up-nom">{t('acct.name')} *</label>
                  <input id="up-nom" name="nom" required autoComplete="name" placeholder={t('acct.namePh')} />
                </div>

                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="up-email">{t('cf.email')} *</label>
                    <input id="up-email" type="email" name="email" required autoComplete="email" placeholder={t('cf.emailPh')} />
                  </div>
                  <div className="fld">
                    <label htmlFor="up-phone">{t('dep.phone')}</label>
                    <input
                      id="up-phone"
                      type="tel"
                      name="telephone"
                      autoComplete="tel"
                      placeholder={exempleTelephone(pays)}
                      title={indicatifDe(pays)}
                    />
                  </div>
                  <PasswordField
                    id="up-pwd"
                    name="password"
                    label={`${t('acct.pwd')} *`}
                    placeholder={t('acct.pwdPh')}
                    required
                    minLength={8}
                  />
                  <PasswordField
                    id="up-pwd2"
                    name="confirm"
                    label={`${t('acct.pwd2')} *`}
                    placeholder={t('acct.pwdPh')}
                    required
                    minLength={8}
                  />
                </div>

                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="up-org">{t('cf.org')}</label>
                    <input
                      id="up-org"
                      name="organisme"
                      autoComplete="organization"
                      placeholder={t(chosenPlan ? chosenPlan.signup.orgHint : 'cf.orgPh')}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="up-metier">{t('cf.type')}</label>
                    <select
                      id="up-metier"
                      name="metier"
                      key={`metier-${chosenPlan?.signup.metier ?? 'any'}`}
                      defaultValue={chosenPlan ? chosenPlan.signup.metier : ''}
                    >
                      <option value="">{t('acct.metierAny')}</option>
                      {METIERS.map((key) => (
                        <option key={key} value={key}>{t(`opt.${key}`)}</option>
                      ))}
                    </select>
                    {chosenPlan && (
                      <p className="of-prefill-note">
                        <i className="ri-magic-line" aria-hidden="true"></i>
                        <span>{t('ofb.prefil')}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-grid">
                  <PaysSelect id="up-pays" value={pays} onChange={setPays} />
                  <div className="fld">
                    <label htmlFor="up-wilaya">{motDivision(pays, lang)}</label>
                    <select key={pays} id="up-wilaya" name="wilaya" defaultValue="">
                      <option value="">{motDivision(pays, lang, 'tous')}</option>
                      {regionsWith(pays).map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <label className="auth-check" htmlFor="up-accept">
                  <input id="up-accept" type="checkbox" name="accept" required />
                  <span>{t('acct.accept')}</span>
                </label>

                <button type="submit" className="cta" disabled={status === 'sending'}>
                  {status === 'sending' ? t('acct.submitting') : t('acct.submit')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </button>

                {status === 'error' && <p className="form-msg err">{formError}</p>}

                <p className="auth-alt">
                  <span>{t('acct.haveAccount')}</span>
                  <Link to="/compte/connexion">{t('acct.toSignin')}</Link>
                </p>
              </form>
            )}

            <AuthSide variant="up" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}