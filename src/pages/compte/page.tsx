import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Footer } from '@/pages/home/components/SiteChrome';
import { useLang } from '@/i18n/LangProvider';
import { localeFor } from '@/i18n/localize';
import { useAuth } from '@/auth/AuthProvider';
import PaysSelect from '@/components/feature/PaysSelect';
import BrandSeal from '@/components/feature/BrandSeal';
import '@/styles/brand.css';
import { exempleTelephone, indicatifDe, paysDevine } from '@/lib/pays';
import { motDivision } from '@/lib/division';
import { regionsWith } from '@/lib/regions';
import MyListings from '@/pages/compte/components/MyListings';
import MyApplications from '@/pages/compte/components/MyApplications';
import MyB2bRequests from '@/pages/compte/components/MyB2bRequests';
import MyDevisAbonnement from '@/pages/compte/components/MyDevisAbonnement';
import BusinessListingManager from '@/pages/compte/components/BusinessListingManager';
import BillingSubscription from '@/pages/compte/components/BillingSubscription';
import DossierLinks from '@/pages/compte/components/DossierLinks';
import AuthorLinker from '@/pages/compte/components/AuthorLinker';
import AireCopyProfile from '@/components/feature/AireCopyProfile';
import B2bSummary from '@/pages/compte/components/B2bSummary';
import PlanTally from '@/pages/compte/components/PlanTally';
import PlanJournal from '@/pages/compte/components/PlanJournal';
import { supabase } from '@/lib/supabase';
import PlanPills from '@/pages/offres/components/PlanPills';
import DevisAbonnement from '@/components/feature/DevisAbonnement';
import { planById, planCardHref, isPlanId, prixPlan, type PlanId } from '@/pages/offres/components/plans';
import { isAdminEmail } from '@/pages/admin/components/adminTypes';
import { peekJournalFilter, peekJournalMonth } from '@/lib/journalFilter';
import './dashboard.css';

const METIERS = ['imprimerie', 'edition', 'librairie', 'faconnage', 'agence', 'auteur', 'fournisseur', 'admin'];

export default function Compte() {
  const { t, lang } = useLang();
  const { session, user, compte, loading, compteError, saveCompte, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEstablishment = Boolean(compte && compte.role !== 'candidat');
  const SettingsContainer = isEstablishment ? 'details' : 'div';
  const navigationSearch = new URLSearchParams(location.search);
  navigationSearch.set('lang', lang);
  const [quoteOpened, setQuoteOpened] = useState(false);
  const [journalRequested] = useState(() =>
    Boolean(new URLSearchParams(location.search).get('journal')
      || new URLSearchParams(location.search).get('jm')
      || peekJournalFilter() || peekJournalMonth()),
  );

  // Existing deep links must also reveal panels that start collapsed.
  useEffect(() => {
    if (!isEstablishment) return;
    const params = new URLSearchParams(location.search);
    const targetId = location.hash.slice(1)
      || (params.has('journal') || params.has('jm') ? 'journal-formules' : '');
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    for (let node: HTMLElement | null = target; node; node = node.parentElement) {
      if (node instanceof HTMLDetailsElement && !node.open) node.open = true;
    }
    target.scrollIntoView({ block: 'start' });
  }, [isEstablishment, location.hash, location.search]);

  /* The country picks the regions offered right below it; the profile loads
     after the first render, so the state follows the row once it arrives. */
  const [pays, setPays] = useState(() => compte?.pays || paysDevine());

  useEffect(() => {
    if (compte?.pays) setPays(compte.pays);
  }, [compte?.pays]);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [listingRevision, setListingRevision] = useState(0);
  /** Bumped by the twelve-month counter, so the box opens on that exact cut. */
  const [gapJump, setGapJump] = useState(0);
  /** Asked by the correction chip: the box opens on that month's corrections. */
  const [clearedJump, setClearedJump] = useState<{ month: string } | null>(null);
  /** Bumped by the ploughed counter, so the box opens on the 3+ times fiches. */
  const [reworkJump, setReworkJump] = useState(0);
  /** Bumped by the forgotten counter, so the box opens on the stale fiches. */
  const [staleJump, setStaleJump] = useState(0);
  /** Bumped by the undocumented counter, so the box opens on the fiches owing a reason. */
  const [undocJump, setUndocJump] = useState(0);
  /** Asked by a delay chip: the trend opens framed on that very month. */
  const [slowJump, setSlowJump] = useState<{ month: string; nonce: number } | null>(null);
  /** Bumped by the year chip: the trend opens filtered on the months in fault. */
  const [belowJump, setBelowJump] = useState(0);
  /** Bumped by the « en retard » counter: the box opens on that very cut. */
  const [lateJump, setLateJump] = useState(0);
  /** Bumped by the cumulated-weeks cell: same cut, read from the oldest end. */
  const [lateOldestJump, setLateOldestJump] = useState(0);
  /** Bumped by the week counter: that cut alone, longest wait first. */
  const [weekJump, setWeekJump] = useState(0);
  /** Bumped by the « jamais ouvertes » counter: the reminder’s misses alone. */
  const [neverJump, setNeverJump] = useState(0);
  /**
   * Bumped by the wait counter: the twelve-month table opens, sorted on its days
   * waited column — the count and the months it counts, one click apart.
   */
  const [waitTableJump, setWaitTableJump] = useState(0);
  /**
   * Asked by the longest month of the year: the box opens on the closures of
   * that very month, fiche by fiche — the depth and the fiches behind it, one
   * click apart.
   */
  const [waitMonthJump, setWaitMonthJump] = useState<{ month: string; nonce: number } | null>(
    null,
  );
  /**
   * Bumped by the threshold recall: the workshop panel comes up on the setting
   * the wait counter measures against.
   */
  const [goalJump, setGoalJump] = useState(0);
  /** Asked by the reference under the weeks: that one request, ringed. */
  const [focusJump, setFocusJump] = useState<{ ref: string; nonce: number } | null>(null);
  /** Asked by the reference under the never-opened count: that one miss, ringed. */
  const [neverFocusJump, setNeverFocusJump] = useState<{
    ref: string;
    nonce: number;
  } | null>(null);

  const email = compte?.email || user?.email || '';
  /* The plan lives on the account itself, so it survives a change of device
     and can be moved to another formula from here. The value written at
     sign-up by the card is used until the profile row arrives. */
  const storedPlan = compte?.formule ?? (typeof user?.user_metadata?.formule === 'string' ? user.user_metadata.formule : null);
  const [formule, setFormule] = useState<PlanId>(() => (isPlanId(storedPlan) ? storedPlan : 'mensuel'));
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [planError, setPlanError] = useState('');
  /** Bumped after a move, so the journal reads the new line back. */
  const [journalKey, setJournalKey] = useState(0);

  useEffect(() => {
    if (isPlanId(compte?.formule)) setFormule(compte.formule);
  }, [compte?.formule]);

  const chosenPlan = planById(formule);
  const initial = (compte?.nom || email || '?').trim().charAt(0).toUpperCase();

  /* Everything an employer reads before answering is filled in. */
  const candReady = Boolean(
    compte?.metier?.trim() && compte?.wilaya?.trim() && compte?.bio?.trim() && compte?.cv_path?.trim(),
  );

  const memberSince = (() => {
    if (!compte?.created_at) return '';
    const date = new Date(compte.created_at);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat(localeFor(lang), { dateStyle: 'long' }).format(date);
  })();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setSaved(false);
    setError('');

    /* The formula is written as soon as it is picked: no second save to
       remember, and the reminder above follows the new choice. */
    const patch: Parameters<typeof saveCompte>[0] = {
      nom: String(data.get('nom') || '').trim() || null,
      organisme: String(data.get('organisme') || '').trim() || null,
      metier: String(data.get('metier') || '').trim() || null,
      wilaya: String(data.get('wilaya') || '').trim() || null,
      pays: String(data.get('pays') || '').trim() || null,
      telephone: String(data.get('telephone') || '').trim() || null,
      formule,
    };
    /* The candidate details (trade, wilaya, bio, CV) live on « Mon profil candidat ». */
    const ok = await saveCompte(patch);
    setSaving(false);
    if (ok) setSaved(true);
    else setError(t('acct.errSave'));
  };

  const pickPlan = async (id: PlanId) => {
    if (id === formule) return;
    /* The previous formula is kept before the write: it is what the journal
       names as the starting point of the move. */
    const before = formule;
    setFormule(id);
    setPlanSaved(false);
    setPlanError('');
    setPlanSaving(true);
    const ok = await saveCompte({ formule: id });
    setPlanSaving(false);
    if (ok) {
      setPlanSaved(true);
      if (user?.id) {
        /* One short line in the journal: who moved, from which plan to which,
           and when. Written after the change, never instead of it. */
        const { error: journalError } = await supabase
          .from('paperatlas_formules_journal')
          .insert({
            compte_id: user.id,
            nom: compte?.nom ?? null,
            organisme: compte?.organisme ?? null,
            formule_avant: before,
            formule_apres: id,
            /* The length retained at the moment of the move travels with the
               line, so the journal says which length is now paid. */
            rythme: id,
          });
        if (!journalError) setJournalKey((n) => n + 1);
      }
    } else {
      setFormule(before);
      setPlanError(t('acct.errSave'));
    }
  };

  const onSignOut = async () => {    await signOut();
    navigate('/', { replace: true });
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

  if (!session) return <Navigate to="/compte/connexion" replace />;

  /* The admin address lands straight on the console after sign-in. */
  if (isAdminEmail(user?.email || compte?.email)) return <Navigate to="/admin" replace />;

  const planChoice = (
    <div className="of-plan-change">
      <div className="of-plan-change-head">
        {!isEstablishment && <h3>{t('ofp.change')}</h3>}
        {planSaving && (
          <span className="of-plan-change-state" role="status">
            <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
            {t('acct.saving')}
          </span>
        )}
        {!planSaving && planSaved && (
          <span className="of-plan-change-state is-done" role="status">
            <i className="ri-check-line" aria-hidden="true"></i>
            {t('acct.saved')}
          </span>
        )}
      </div>
      <PlanPills
        name="formule-choice"
        value={formule}
        disabled={planSaving}
        pays={pays}
        label={t('ofp.pickOn')}
        hint={t('ofp.changeHint')}
        onChange={(id) => void pickPlan(id)}
      />
      {planError && <p className="form-msg err" role="alert">{planError}</p>}
    </div>
  );

  const planControls = (
    <>
      {chosenPlan && (isEstablishment ? (
        <div className="acct-plan-summary">
          <span className="acct-dashboard-icon" aria-hidden="true"><i className={chosenPlan.icon}></i></span>
          <div>
            <span className="acct-dashboard-label">{t('acct.dashboard.selectedPlan')}</span>
            <strong>{t(chosenPlan.name)}</strong>
            <span>{prixPlan(chosenPlan, pays, t)} {t(chosenPlan.per)}</span>
          </div>
          <Link to={planCardHref(formule, pays)} className="ghost-link">
            {t('ofp.viewCard')}
            <i className="ri-arrow-right-line" aria-hidden="true"></i>
          </Link>
        </div>
      ) : (
        <div className="of-plan-banner of-plan-banner--recall">
          <span className="of-plan-banner-icon" aria-hidden="true"><i className={chosenPlan.icon}></i></span>
          <div className="of-plan-banner-main">
            <span className="of-plan-banner-badge">{t('ofb.badge')}</span>
            <p className="of-plan-banner-title">
              {t('ofb.yourPlan')} <strong>{t(chosenPlan.name)}</strong>
              <span className="of-plan-banner-price">— {prixPlan(chosenPlan, pays, t)} {t(chosenPlan.per)}</span>
              <span className="of-plan-banner-duree" title={t('ofb.dureeTip')}>
                <i className="ri-calendar-check-line" aria-hidden="true"></i>
                {chosenPlan.mois === 1 ? t('ofb.duree1') : t('ofb.dureeN').replace('{n}', String(chosenPlan.mois))}
              </span>
            </p>
            <p className="of-plan-banner-hint">{t('ofb.hint')}</p>
          </div>
          <div className="of-plan-banner-actions">
            <Link to={planCardHref(formule, pays)} className="of-plan-banner-link">
              <span className="whitespace-nowrap">{t('ofp.viewCard')}</span>
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </Link>
          </div>
        </div>
      ))}
      {isEstablishment ? (
        <details className="acct-dashboard-disclosure">
          <summary>
            <i className="ri-calendar-line" aria-hidden="true"></i>
            <span>{t('ofp.change')}</span>
            <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
          </summary>
          {planChoice}
        </details>
      ) : planChoice}
    </>
  );

  return (
    <>
      <Nav variant="page" />
      <main className={`page-main${isEstablishment ? ' acct-dashboard' : ''}`} id="main-content" tabIndex={-1}>
        <section className="dir-hero">
          <p className="stamp">{t(isEstablishment ? 'acct.dashboard.title' : 'acct.stamp')}</p>
          {/* Le même cachet qu'à l'entrée du site, posé à côté du nom du
              membre : on sait chez qui on est avant de lire la salutation. */}
          <div className="acct-hero-name">
            <BrandSeal className="acct-hero-seal" />
            <h1 className="page-h1">
              {isEstablishment ? compte?.organisme || compte?.nom || email : `${t('acct.hello')} ${compte?.nom || email || ''}`}
            </h1>
          </div>
          <p className="lede">{t(isEstablishment ? 'acct.dashboard.intro' : 'acct.sub')}</p>
          {isEstablishment && (
            <div className="acct-dashboard-actions">
              <Link to="/messages" className="ghost-btn">
                <i className="ri-message-3-line" aria-hidden="true"></i>
                {t('acct.msgOpen')}
              </Link>
              <Link to="/deposer" className="cta">
                {t('acct.toDeposit')}
                <i className="ri-add-line" aria-hidden="true"></i>
              </Link>
            </div>
          )}
        </section>

        <section className="dir-body">
          {isEstablishment && (
            <nav className="acct-dashboard-nav" aria-label={t('acct.dashboard.navigation')}>
              {[
                ['acct-summary', 'ri-dashboard-line', 'acct.dashboard.overview'],
                ['account-establishment', 'ri-building-4-line', 'acct.dashboard.establishment'],
                ['account-activity', 'ri-inbox-archive-line', 'acct.dashboard.activity'],
                ['account-subscription', 'ri-bank-card-line', 'acct.dashboard.subscription'],
                ['account-settings', 'ri-settings-3-line', 'acct.dashboard.settings'],
              ].map(([id, icon, label]) => (
                <Link
                  key={id}
                  to={{ pathname: location.pathname, search: `?${navigationSearch}`, hash: `#${id}` }}
                  aria-current={location.hash === `#${id}` || (!location.hash && id === 'acct-summary') ? 'location' : undefined}
                >
                  <i className={icon} aria-hidden="true"></i>
                  {t(label)}
                </Link>
              ))}
            </nav>
          )}
          {isEstablishment && (
            <B2bSummary
              compact
              enabled={Boolean(session)}
              onOpenGap={() => setGapJump((n) => n + 1)}
              /* A new object on every click, so the box reacts even when the
                 same month is asked twice in a row. */
              onOpenCleared={(month) => setClearedJump({ month })}
              onOpenRework={() => setReworkJump((n) => n + 1)}
              onOpenStale={() => setStaleJump((n) => n + 1)}
              onOpenUndoc={() => setUndocJump((n) => n + 1)}
              onOpenSlow={(month) =>
                setSlowJump((prev) => ({ month, nonce: (prev?.nonce ?? 0) + 1 }))
              }
              onOpenBelow={() => setBelowJump((n) => n + 1)}
              /* The late counter is the same door as the bar's reminder: the box
                 opens on the late requests, oldest one ringed. */
              onOpenLate={() => setLateJump((n) => n + 1)}
              /* The depth of the backlog is its own door: the same late cut, but
                 walked from the oldest request — the list says what has slept
                 longest instead of what arrived last. */
              onOpenLateOldest={() => setLateOldestJump((n) => n + 1)}
              /* The width of the urgency is its own door, right before the weeks
                 that say its depth: the requests past seven days, alone. */
              onOpenWeek={() => setWeekJump((n) => n + 1)}
              /* The misses of the shortcut get their own door: the requests the
                 reminder went past without them ever being opened. */
              onOpenNever={() => setNeverJump((n) => n + 1)}
              /* The wait counter opens the twelve-month table already sorted on
                 its days waited column: the figure leads to the months behind
                 it, not to another list of requests. */
              onOpenWait={() => setWaitTableJump((n) => n + 1)}
              /* The longest month is a shorter door than the counter beside it:
                 not the table that names it, the closures themselves. */
              onOpenMonth={(month) =>
                setWaitMonthJump((prev) => ({ month, nonce: (prev?.nonce ?? 0) + 1 }))
              }
              /* The threshold itself is a door: the panel where the number is
                 chosen stands right behind the number that recalls it. */
              onOpenGoal={() => setGoalJump((n) => n + 1)}
              /* The reference under the weeks is a shorter door than its number:
                 it points at that one request instead of opening the cut. */
              onFocusRequest={(ref) =>
                setFocusJump((prev) => ({ ref, nonce: (prev?.nonce ?? 0) + 1 }))
              }
              /* And under the never-opened count, its oldest reference: a
                 shorter door still, pointing at that one miss inside the cut. */
              onFocusNever={(ref) =>
                setNeverFocusJump((prev) => ({ ref, nonce: (prev?.nonce ?? 0) + 1 }))
              }
            />
          )}
          {isEstablishment && compte && (
            <>
              <details className="pro-card acct-dashboard-disclosure acct-establishment" id="account-establishment">
                <summary>
                  <span className="acct-dashboard-icon" aria-hidden="true"><i className="ri-building-4-line"></i></span>
                  <span>
                    <strong>{t('acct.dashboard.establishment')}</strong>
                    <small>{t('acct.dashboard.establishmentHint')}</small>
                  </span>
                  <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                </summary>
                <BusinessListingManager onSaved={() => setListingRevision((revision) => revision + 1)} />
              </details>

              <section className="acct-dashboard-group" id="account-activity" aria-labelledby="account-activity-title">
                <header className="acct-dashboard-section-head">
                  <div>
                    <h2 id="account-activity-title">{t('acct.dashboard.activity')}</h2>
                    <p>{t('acct.dashboard.activityHint')}</p>
                  </div>
                  <Link to="/demande-b2b" className="ghost-link">
                    {t('nav.b2b')}
                    <i className="ri-arrow-right-line" aria-hidden="true"></i>
                  </Link>
                </header>
                <MyB2bRequests
                  openGapAll={gapJump}
                  openCleared={clearedJump}
                  openRework={reworkJump}
                  openStale={staleJump}
                  openUndoc={undocJump}
                  openSlow={slowJump}
                  openBelow={belowJump}
                  openLateAsk={lateJump}
                  openLateOldestAsk={lateOldestJump}
                  openWeekAsk={weekJump}
                  openNeverAsk={neverJump}
                  focusAsk={focusJump}
                  neverFocusAsk={neverFocusJump}
                  openWaitAsk={waitTableJump}
                  openMonthAsk={waitMonthJump}
                  openGoalAsk={goalJump}
                />
                <details className="pro-card acct-dashboard-disclosure">
                  <summary>
                    <i className="ri-megaphone-line" aria-hidden="true"></i>
                    <span>{t('acct.mine.title')}</span>
                    <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                  </summary>
                  <MyListings />
                </details>
                <details className="pro-card acct-dashboard-disclosure">
                  <summary>
                    <i className="ri-briefcase-line" aria-hidden="true"></i>
                    <span>{t('acct.appl.title')}</span>
                    <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                  </summary>
                  <MyApplications />
                </details>
              </section>

              <section className="acct-dashboard-group" id="account-subscription" aria-labelledby="account-subscription-title">
                <header className="acct-dashboard-section-head">
                  <div>
                    <h2 id="account-subscription-title">{t('acct.dashboard.subscription')}</h2>
                    <p>{t('acct.dashboard.subscriptionHint')}</p>
                  </div>
                </header>
                <div className="pro-card acct-subscription-panel">
                  {planControls}
                  <BillingSubscription planId={formule} pays={pays} listingRevision={listingRevision} />
                  <details
                    className="acct-dashboard-disclosure"
                    id="devis-abonnement"
                    onToggle={(event) => {
                      if (event.currentTarget.open) setQuoteOpened(true);
                    }}
                  >
                    <summary>
                      <i className="ri-file-add-line" aria-hidden="true"></i>
                      <span>{t('dv.acctTitle')}</span>
                      <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                    </summary>
                    <p className="auth-note">{t('dv.acctSub')}</p>
                    {quoteOpened && <DevisAbonnement
                      source="compte"
                      formuleInitiale={formule}
                      nom={compte.nom ?? ''}
                      email={email}
                      org={compte.organisme ?? ''}
                    />}
                  </details>
                  <details className="acct-dashboard-disclosure">
                    <summary>
                      <i className="ri-file-list-3-line" aria-hidden="true"></i>
                      <span>{t('dv.listTitle')}</span>
                      <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                    </summary>
                    <MyDevisAbonnement />
                  </details>
                  <details className="acct-dashboard-disclosure" open={journalRequested}>
                    <summary>
                      <i className="ri-history-line" aria-hidden="true"></i>
                      <span>{t('ofj.title')}</span>
                      <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                    </summary>
                    <PlanJournal refreshKey={journalKey} />
                  </details>
                  <details className="acct-dashboard-disclosure">
                    <summary>
                      <i className="ri-pie-chart-line" aria-hidden="true"></i>
                      <span>{t('ofp.tallyTitle')}</span>
                      <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
                    </summary>
                    <PlanTally mine={formule} />
                  </details>
                </div>
              </section>
            </>
          )}

          <SettingsContainer
            className={isEstablishment ? 'pro-card acct-dashboard-disclosure acct-settings' : undefined}
            id={isEstablishment ? 'account-settings' : undefined}
          >
            {isEstablishment && (
              <summary>
                <span className="acct-dashboard-icon" aria-hidden="true"><i className="ri-settings-3-line"></i></span>
                <span>
                  <strong>{t('acct.dashboard.settings')}</strong>
                  <small>{t('acct.dashboard.settingsHint')}</small>
                </span>
                <i className="ri-arrow-down-s-line acct-disclosure-chevron" aria-hidden="true"></i>
              </summary>
            )}
            <div className="auth-grid">
            {!compte ? (
              <div className="form-card auth-card">
                <p className="acct-loading">
                  <i className="ri-loader-4-line is-spin" aria-hidden="true"></i>
                  {t('acct.loading')}
                </p>
                {compteError && (
                  <>
                    <p className="form-msg err">{t('acct.errLoad')}</p>
                    <button type="button" className="ghost-btn" onClick={() => window.location.reload()}>
                      {t('acct.retry')}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <form className="form-card auth-card" id="account-profile" onSubmit={onSubmit}>
                <div className="acct-head">
                  <div className="acct-id">
                    <span className="acct-avatar" aria-hidden="true">{initial}</span>
                    <div>
                      <h2>{compte.nom || email}</h2>
                      <p>{email}</p>
                    </div>
                  </div>
                  <div className="acct-meta">
                    <span className="acct-role">
                      <i className={compte.role === 'candidat' ? 'ri-user-smile-line' : 'ri-building-4-line'} aria-hidden="true"></i>
                      {compte.role === 'candidat' ? t('acct.role.candidat') : t('acct.role.pro')}
                    </span>
                    {memberSince && (
                      <span className="acct-member-since">
                        <span>{t('acct.member')}</span>
                        <time dateTime={compte.created_at ?? undefined}>{memberSince}</time>
                      </span>
                    )}
                  </div>
                </div>

                {!isEstablishment && planControls}

                <div className="form-grid">
                  <div className="fld">
                    <label htmlFor="ac-nom">{t('acct.name')}</label>
                    <input id="ac-nom" name="nom" defaultValue={compte.nom ?? ''} autoComplete="name" placeholder={t('acct.namePh')} />
                  </div>
                  <div className="fld">
                    <label htmlFor="ac-phone" title={indicatifDe(pays)}>
                      {t('dep.phone')} · {indicatifDe(pays)}
                    </label>
                    <input
                      id="ac-phone"
                      type="tel"
                      name="telephone"
                      defaultValue={compte.telephone ?? ''}
                      autoComplete="tel"
                      placeholder={exempleTelephone(pays)}
                    />
                  </div>
                  <div className="fld">
                    <label htmlFor="ac-org">{t('cf.org')}</label>
                    <input id="ac-org" name="organisme" defaultValue={compte.organisme ?? ''} autoComplete="organization" placeholder={t('cf.orgPh')} />
                  </div>
                  <div className="fld">
                    <label htmlFor="ac-metier">{t('cf.type')}</label>
                    <select id="ac-metier" name="metier" defaultValue={compte.metier ?? ''}>
                      <option value="">{t('acct.metierAny')}</option>
                      {METIERS.map((key) => (
                        <option key={key} value={key}>{t(`opt.${key}`)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid">
                  <PaysSelect id="ac-pays" value={pays} onChange={setPays} />
                  <div className="fld">
                    <label htmlFor="ac-wilaya">{motDivision(pays, lang)}</label>
                    <select key={pays} id="ac-wilaya" name="wilaya" defaultValue={compte.wilaya ?? ''}>
                      <option value="">{motDivision(pays, lang, 'tous')}</option>
                      {regionsWith(pays, compte.wilaya).map((w) => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                {compte.role === 'candidat' && (
                  <div className="cand-block cand-teaser">
                    <div className="cand-teaser-top">
                      <span className="cand-teaser-icon" aria-hidden="true">
                        <i className="ri-user-star-line"></i>
                      </span>
                      <div className="cand-teaser-txt">
                        <strong>{t('acct.candPanelTitle')}</strong>
                        <p>{t('acct.candPanelText')}</p>
                      </div>
                      <span className="cand-teaser-state" data-done={candReady ? 'yes' : 'no'}>
                        {candReady ? t('acct.candPanelDone') : t('acct.candPanelTodo')}
                      </span>
                    </div>
                    <Link to="/compte/profil-candidat" className="cta cand-teaser-cta">
                      {t('acct.candPanelCta')}
                      <i className="ri-arrow-right-line" aria-hidden="true"></i>
                    </Link>
                    {/* Le geste court de l'aire, posé sur la carte de mon propre
                        profil public : il n'emporte que l'aire où il se tient,
                        ses pays et ses fiches, comme sur la fiche d'un atelier. */}
                    <AireCopyProfile
                      pays={compte.pays}
                      nom={(compte.nom || email).trim()}
                      kind="profil"
                    />
                  </div>
                )}

                <p className="auth-note">
                  <i className="ri-lock-line" aria-hidden="true"></i> {t('acct.emailFixed')}
                </p>

                <div className="acct-actions">
                  <button type="submit" className="cta" disabled={saving}>
                    {saving ? t('acct.saving') : t('acct.save')}
                    <i className="ri-check-line" aria-hidden="true"></i>
                  </button>
                  {compte.role === 'candidat' && user?.id && (
                    <Link
                      to={`/candidats/${user.id}`}
                      className="ghost-btn acct-public"
                      title={t('acct.viewPublicHint')}
                    >
                      <i className="ri-user-search-line" aria-hidden="true"></i>
                      {t('acct.viewPublic')}
                    </Link>
                  )}
                  <button type="button" className="ghost-btn" onClick={onSignOut}>
                    <i className="ri-logout-box-r-line" aria-hidden="true"></i>
                    {t('acct.signout')}
                  </button>
                </div>

                {saved && <p className="form-msg ok">{t('acct.saved')}</p>}
                {error && <p className="form-msg err">{error}</p>}
              </form>
            )}

            <aside className="auth-side">
              {!isEstablishment && <PlanTally mine={formule} />}
              {!isEstablishment && <PlanJournal refreshKey={journalKey} />}

              <section className="pro-card">
                <h2 className="pro-h">{t('acct.au.card')}</h2>
                <p className="auth-note">{t('acct.au.cardText')}</p>
                {/* Le compte désigne lui-même la plume qu'il signe : c'est ce
                    lien qui ouvre le bouton « Écrire » de sa fiche. */}
                <AuthorLinker />
              </section>

              <section className="pro-card">
                <h2 className="pro-h">{t('acct.dossiers')}</h2>
                <p className="auth-note">{t('acct.dossiersText')}</p>
                {/* Les dossiers de l'espace : la console n'apparaît que pour
                    l'adresse autorisée — un membre ordinaire ne voit pas même
                    la porte —, et la liste se pilote au clavier. */}
                <DossierLinks
                  doors={[
                    ...(isAdminEmail(email)
                      ? [{ to: '/admin', icon: 'ri-shield-keyhole-line', label: t('ad.title') }]
                      : []),
                    { to: '/annuaire', icon: 'ri-map-2-line', label: t('acct.toDirectory') },
                    { to: '/deposer', icon: 'ri-megaphone-line', label: t('acct.toDeposit') },
                    { to: '/demande-b2b', icon: 'ri-store-2-line', label: t('nav.b2b') },
                    { to: '/candidats', icon: 'ri-group-line', label: t('candlist.all') },
                  ]}
                />
              </section>

              <section className="pro-card">
                <h2 className="pro-h">{t('acct.security')}</h2>
                <p className="auth-note">{t('acct.securityText')}</p>
                <Link to="/compte/connexion" className="ghost-link">
                  {t('acct.reset.stamp')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </section>

              <section className="pro-card">
                <h2 className="pro-h">{t('acct.msgCard')}</h2>
                <p className="auth-note">{t('acct.msgCardText')}</p>
                <Link to="/messages" className="ghost-link">
                  {t('acct.msgOpen')}
                  <i className="ri-arrow-right-line" aria-hidden="true"></i>
                </Link>
              </section>
            </aside>
            </div>
          </SettingsContainer>
          {!isEstablishment && <MyApplications />}
        </section>
      </main>
      <Footer />
    </>
  );
}