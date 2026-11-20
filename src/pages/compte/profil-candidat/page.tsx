import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { useSeo } from '@/hooks/useSeo';
import { useReveal } from '@/hooks/useReveal';
import { useAuth } from '@/auth/AuthProvider';
import { exempleTelephone, indicatifDe, paysDevine } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import PaysSelect from '@/components/feature/PaysSelect';
import PoseRestante from '@/components/feature/PoseRestante';
import CvField from '@/pages/compte/profil-candidat/components/CvField';
import ProTwinNote from '@/pages/compte/profil-candidat/components/ProTwinNote';
import AireCopyProfile from '@/components/feature/AireCopyProfile';

const METIERS = ['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'auteur', 'fournisseur'];

type Step = { key: string; label: string; done: boolean; href?: string };

/**
 * The candidate's own page: the four things an employer actually looks at
 * (trade, wilaya, a few lines, a CV) after the account was created.
 */
export default function ProfilCandidat() {
  useSeo({ page: 'compte', path: '/compte/profil-candidat' });
  const { t, lang } = useLang();
  useReveal();
  const { session, user, compte, loading, saveCompte } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  /* The country picks the region list below it, and the dialling prefix of the
     phone field. Guessed when the profile has none yet. */
  const [pays, setPays] = useState(() => compte?.pays || paysDevine());

  useEffect(() => {
    if (compte?.pays) setPays(compte.pays);
  }, [compte?.pays]);

  const email = compte?.email || user?.email || '';
  const initial = (compte?.nom || email || '?').trim().charAt(0).toUpperCase();

  const steps = useMemo<Step[]>(
    () => [
      { key: 'nom', label: t('candprof.stepName'), done: Boolean(compte?.nom?.trim()) },
      { key: 'metier', label: t('candprof.stepTrade'), done: Boolean(compte?.metier?.trim()) },
      { key: 'wilaya', label: t('candprof.stepWilaya'), done: Boolean(compte?.wilaya?.trim()) },
      { key: 'bio', label: t('candprof.stepBio'), done: Boolean(compte?.bio?.trim()) },
      { key: 'cv', label: t('candprof.stepCv'), done: Boolean(compte?.cv_path?.trim()) },
    ],
    [compte, t],
  );

  const done = steps.filter((step) => step.done).length;
  const percent = Math.round((done / steps.length) * 100);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setSaved(false);
    setError('');

    const metier = String(data.get('metier') || '').trim();

    const ok = await saveCompte({
      nom: String(data.get('nom') || '').trim() || null,
      telephone: String(data.get('telephone') || '').trim() || null,
      metier: metier || null,
      pays: String(data.get('pays') || '').trim() || pays,
      wilaya: String(data.get('wilaya') || '').trim() || null,
      titre: String(data.get('titre') || '').trim() || null,
      bio: String(data.get('bio') || '').trim() || null,
    });

    setSaving(false);
    if (ok) setSaved(true);
    else setError(t('acct.errSave'));
  };

  if (loading) {
    return (
      <>
        <Nav variant="page" />
        <main className="page-main" id="main-content" tabIndex={-1}>
          <section className="dir-body">
            <p className="acct-loading">
              <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
              {t('acct.loading')}
            </p>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!session) {
    return <Navigate to="/compte/connexion?next=/compte/profil-candidat" replace />;
  }

  return (
    <>
      <Nav variant="page" />
      <main className="page-main" id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t('candprof.stamp')}</p>
          <h1
            className="page-h1"
            dangerouslySetInnerHTML={{ __html: t('candprof.title') }}
          />
          <p className="lede">{t('candprof.lede')}</p>
          {/* Le repère de pose : le profil candidat dit son reste sur ses
              seules clés `candprof.`, avant que le candidat ne remplisse le
              formulaire. Il se tait quand tout est posé. */}
          <PoseRestante fichier="dict.recrutement.ts" prefixes={['candprof.']} />
        </section>

        <section className="dir-body">
          {compte && compte.role !== 'candidat' ? (
            <div className="pro-card cprof-gate">
              <h2 className="page-h2">{t('candprof.proTitle')}</h2>
              <p className="auth-note">{t('candprof.proText')}</p>
              <div className="acct-actions">
                <Link to="/compte/inscription/candidat" className="cta">
                  {t('candlist.joinCta')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
                <Link to="/compte" className="ghost-btn">
                  <i className="ri-arrow-left-line" aria-hidden="true"></i>
                  {t('acct.dossiers')}
                </Link>
              </div>
            </div>
          ) : !compte ? (
            <div className="pro-card">
              <p className="acct-loading">
                <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
                {t('acct.loading')}
              </p>
            </div>
          ) : (
            <div className="auth-grid">
              <form className="form-card auth-card" id="candidate-profile" onSubmit={onSubmit}>
                <div className="acct-head">
                  <div className="acct-id">
                    <span className="acct-avatar" aria-hidden="true">{initial}</span>
                    <div>
                      <h2>{compte.nom || email}</h2>
                      <p>{email}</p>
                    </div>
                  </div>
                  <span className="acct-role">
                    <i className="ri-user-smile-line" aria-hidden="true"></i>
                    {t('acct.role.candidat')}
                  </span>
                </div>

                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="pc-nom">{t('cand.name')}</label>
                    <input
                      id="pc-nom"
                      name="nom"
                      defaultValue={compte.nom ?? ''}
                      autoComplete="name"
                      placeholder={t('cand.namePh')}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="pc-phone" title={indicatifDe(pays)}>
                      {t('cand.phone')} · {indicatifDe(pays)}
                    </label>
                    <input
                      id="pc-phone"
                      type="tel"
                      name="telephone"
                      defaultValue={compte.telephone ?? ''}
                      autoComplete="tel"
                      placeholder={exempleTelephone(pays)}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="pc-metier">{t('cand.metier')}</label>
                    <select id="pc-metier" name="metier" defaultValue={compte.metier ?? ''}>
                      <option value="">{t('cand.metierAny')}</option>
                      {METIERS.map((key) => (
                        <option key={key} value={key}>{t(`opt.${key}`)}</option>
                      ))}
                    </select>
                  </div>
                  <PaysSelect id="pc-pays" name="pays" value={pays} onChange={setPays} />
                  <div className="fld">
                    <label htmlFor="pc-wilaya">
                      {motDivision(pays, lang)}
                    </label>
                    <select
                      key={pays}
                      id="pc-wilaya"
                      name="wilaya"
                      defaultValue={compte.wilaya ?? ''}
                    >
                      <option value="">{motDivision(pays, lang, 'tous')}</option>
                      {regionsWith(pays, compte.wilaya).map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="fld">
                  <label htmlFor="pc-titre">{t('candprof.headline')}</label>
                  <input
                    id="pc-titre"
                    name="titre"
                    defaultValue={compte.titre ?? ''}
                    placeholder={t('acct.candTitlePh')}
                  />
                </div>

                <div className="fld">
                  <label htmlFor="pc-bio">{t('cand.bio')}</label>
                  <textarea
                    id="pc-bio"
                    name="bio"
                    maxLength={500}
                    defaultValue={compte.bio ?? ''}
                    placeholder={t('cand.bioPh')}
                  />
                </div>

                <p className="auth-note">
                  <i className="ri-lock-line" aria-hidden="true"></i> {t('candprof.publicNote')}
                </p>

                <div className="acct-actions">
                  <button type="submit" className="cta" disabled={saving}>
                    {saving ? t('acct.saving') : t('candprof.save')}
                    <i className="ri-check-line" aria-hidden="true"></i>
                  </button>
                  {user?.id && (
                    <Link to={`/candidats/${user.id}`} className="ghost-btn">
                      <i className="ri-user-search-line" aria-hidden="true"></i>
                      {t('acct.viewPublic')}
                    </Link>
                  )}
                </div>

                {/* Le geste court de l'aire, posé sur la carte du profil public
                    qui vient de se remplir : il n'emporte que l'aire où il se
                    tient, ses pays et ses fiches — deux lignes, et le compte
                    des copies de cette aire sous le geste. */}
                <AireCopyProfile
                  pays={compte.pays}
                  nom={(compte.nom || email).trim()}
                  kind="profil"
                />

                {saved && <p className="form-msg ok">{t('acct.savedCand')}</p>}
                {error && <p className="form-msg err">{error}</p>}
              </form>

              <aside className="auth-side">
                <section className="pro-card">
                  <div className="cprof-meter-top">
                    <h2 className="pro-h">{t('candprof.progress')}</h2>
                    <strong className="cprof-meter-pct">{percent}%</strong>
                  </div>
                  <span
                    className="cprof-meter-bar"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t('candprof.progress')}
                  >
                    <i style={{ width: `${percent}%` }} />
                  </span>
                  <ul className="cprof-checks">
                    {steps.map((step) => (
                      <li key={step.key} data-done={step.done ? 'yes' : 'no'}>
                        <i
                          className={step.done ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'}
                          aria-hidden="true"
                        ></i>
                        <span>{step.label}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="auth-note cprof-meter-note">
                    {percent === 100 ? t('candprof.complete') : t('candprof.incomplete')}
                  </p>
                </section>

                <ProTwinNote nom={compte.nom ?? ''} wilaya={compte.wilaya ?? ''} />

                <section className="pro-card">
                  <h2 className="pro-h">{t('candprof.cvCard')}</h2>
                  <CvField
                    userId={compte.id}
                    path={compte.cv_path ?? null}
                    onSaved={(path) => saveCompte({ cv_path: path })}
                  />
                </section>

                <section className="pro-card">
                  <h2 className="pro-h">{t('acct.dossiers')}</h2>
                  <p className="auth-note">{t('candprof.sideText')}</p>
                  <ul className="deposit-links">
                    <li>
                      <Link to="/emplois">
                        <i className="ri-briefcase-4-line" aria-hidden="true"></i>
                        <span>{t('acct.applyShortcut')}</span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="/compte#mes-candidatures">
                        <i className="ri-inbox-archive-line" aria-hidden="true"></i>
                        <span>{t('acct.appl.sentTab')}</span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </li>
                    <li>
                      <Link to="/compte">
                        <i className="ri-settings-3-line" aria-hidden="true"></i>
                        <span>{t('candprof.back')}</span>
                        <i className="ri-arrow-right-line" aria-hidden="true"></i>
                      </Link>
                    </li>
                  </ul>
                </section>
              </aside>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}