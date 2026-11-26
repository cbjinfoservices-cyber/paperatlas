import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { useLang } from '@/i18n/LangProvider';
import { supabase } from '@/lib/supabase';
import {
  currencyForCountry,
  providerSupportsLocalCurrency,
} from '../../../../supabase/functions/_shared/billingPricing';
import { planById, prixPlan, type PlanId } from '@/pages/offres/components/plans';

type Subscription = {
  id: string;
  prestataire: 'stripe' | 'paypal';
  formule: PlanId;
  statut: string;
  devise: string;
  montant: number;
  checkout_url: string | null;
  checkout_expire_a: string | null;
  essai_debut: string | null;
  essai_fin: string | null;
  periode_fin: string | null;
  annulation_fin_periode: boolean;
};

type Props = {
  planId: PlanId;
  pays: string;
  listingRevision: number;
};

export default function BillingSubscription({ planId, pays, listingRevision }: Props) {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [trialUsed, setTrialUsed] = useState(false);
  const [listingPublished, setListingPublished] = useState(false);
  const localCurrency = currencyForCountry(pays);
  const stripeAvailable = providerSupportsLocalCurrency('stripe', localCurrency);
  const paypalAvailable = providerSupportsLocalCurrency('paypal', localCurrency);
  const plan = planById(planId);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    const [{ data, error: loadError }, { data: trialRows, error: trialError }, { data: listing, error: listingError }] = await Promise.all([
      supabase
        .from('paperatlas_abonnements_paiement')
        .select('id,prestataire,formule,statut,devise,montant,checkout_url,checkout_expire_a,essai_debut,essai_fin,periode_fin,annulation_fin_periode,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('paperatlas_abonnements_paiement')
        .select('id')
        .eq('user_id', user.id)
        .not('essai_debut', 'is', null)
        .limit(1),
      supabase
        .from('paperatlas_entreprises')
        .select('id,publie')
        .eq('user_id', user.id)
        .maybeSingle(),
    ]);
    if (loadError || trialError || listingError) {
      console.error('billing-status-load-failed', loadError?.message ?? trialError?.message ?? listingError?.message);
      setError(t('bill.loadError'));
      setSubscription(null);
    } else {
      setSubscription(data as Subscription | null);
      setTrialUsed((trialRows ?? []).length > 0);
      setListingPublished(Boolean(listing?.publie));
    }
    setLoading(false);
  }, [user?.id, t]);

  useEffect(() => {
    void load();
  }, [load, listingRevision]);

  const beginCheckout = async (provider: 'stripe' | 'paypal') => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('billing-checkout', {
        body: { provider, planId },
      });
      if (invokeError) throw invokeError;
      if (typeof data?.url !== 'string') throw new Error('checkout-url-missing');
      window.location.assign(data.url);
    } catch (caught) {
      console.error('billing-checkout-request-failed', caught);
      setError(t('bill.checkoutError'));
      setBusy(false);
    }
  };

  const cancelSubscription = async () => {
    if (!window.confirm(t('bill.cancelConfirm'))) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { error: invokeError } = await supabase.functions.invoke('billing-cancel', { body: {} });
      if (invokeError) throw invokeError;
      setNotice(t('bill.cancelled'));
      await load();
    } catch (caught) {
      console.error('billing-cancel-request-failed', caught);
      setError(t('bill.cancelError'));
    } finally {
      setBusy(false);
    }
  };

  const statusText = (status: string) => {
    const key = `bill.status.${status}`;
    return t(key);
  };
  const endDate = subscription?.periode_fin
    ? new Intl.DateTimeFormat(lang, { dateStyle: 'medium' }).format(new Date(subscription.periode_fin))
    : '';
  const checkoutUsable = Boolean(
    subscription?.statut === 'pending'
      && subscription.checkout_url
      && subscription.checkout_expire_a
      && new Date(subscription.checkout_expire_a).getTime() > Date.now(),
  );
  const activeStatus = Boolean(subscription && ['trialing', 'active', 'past_due'].includes(subscription.statut));
  const accessUntil = subscription?.periode_fin ? new Date(subscription.periode_fin).getTime() : 0;
  const hasAccess = activeStatus
    || (subscription?.statut === 'canceled' && accessUntil > Date.now());
  const trialWasUsed = trialUsed;
  const subscriptionPlan = subscription ? planById(subscription.formule) : null;

  return (
    <section className="pro-card billing-subscription">
      <h2 className="pro-h">{t('bill.title')}</h2>
      <p className="auth-note">{t('bill.description')}</p>

      {loading ? (
        <p className="acct-loading">{t('acct.loading')}</p>
      ) : (
        <>
          {subscription && (
            <div className="auth-note" role="status">
              <strong>{statusText(subscription.statut)}</strong>
              <span>
                {' · '}{t('bill.plan')}: {subscriptionPlan ? t(subscriptionPlan.name) : subscription.formule}
                {' · '}{subscription.montant} {subscription.devise}
              </span>
              {endDate && <span>{' · '}{t('bill.until')} {endDate}</span>}
              {subscription.annulation_fin_periode && <span>{' · '}{t('bill.cancelAtEnd')}</span>}
            </div>
          )}

          {checkoutUsable && (
            <a className="cta" href={subscription?.checkout_url ?? undefined}>
              {t('bill.continueCheckout')}
              <i className="ri-arrow-right-line" aria-hidden="true"></i>
            </a>
          )}

          {!hasAccess && !checkoutUsable && (
            <>
              {!listingPublished && <p className="auth-note">{t('bill.publishProfile')}</p>}
              <p className="auth-note">
                {trialWasUsed ? t('bill.trialUsed') : t('bill.trial')}
                {plan && localCurrency && ` · ${prixPlan(plan, pays)} ${t(plan.per)}`}
              </p>
              <div className="acct-actions">
                {stripeAvailable && (
                  <button type="button" className="cta" disabled={busy || !plan || !listingPublished} onClick={() => void beginCheckout('stripe')}>
                    {busy ? t('bill.opening') : t('bill.payStripe')}
                  </button>
                )}
                {paypalAvailable && (
                  <button type="button" className="ghost-btn" disabled={busy || !plan || !listingPublished} onClick={() => void beginCheckout('paypal')}>
                    {busy ? t('bill.opening') : t('bill.payPaypal')}
                  </button>
                )}
                {!stripeAvailable && !paypalAvailable && <p className="auth-note">{t('bill.noProvider')}</p>}
              </div>
            </>
          )}

          {activeStatus && !subscription?.annulation_fin_periode && (
            <button type="button" className="ghost-btn" disabled={busy} onClick={() => void cancelSubscription()}>
              {busy ? t('bill.canceling') : t('bill.cancel')}
            </button>
          )}
        </>
      )}

      <div className="acct-actions">
        <button type="button" className="ghost-btn" disabled={loading || busy} onClick={() => void load()}>
          {t('bill.refresh')}
        </button>
        {notice && <span className="form-msg ok">{notice}</span>}
        {error && <span className="form-msg err">{error}</span>}
      </div>
    </section>
  );
}
