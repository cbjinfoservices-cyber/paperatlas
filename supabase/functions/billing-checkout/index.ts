import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  currencyForCountry,
  PLAN_AMOUNTS_DZD,
  providerSupportsLocalCurrency,
  roundedLocalAmount,
  stripeMinorAmount,
  currencyExponent,
} from '../_shared/billingPricing.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const PLANS = {
  mensuel: 1,
  trimestriel: 3,
  semestre: 6,
  annee: 12,
} as const;

type PlanId = keyof typeof PLANS;
type Provider = 'stripe' | 'paypal';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && Object.hasOwn(PLANS, value);
}

function isProvider(value: unknown): value is Provider {
  return value === 'stripe' || value === 'paypal';
}

function paypalAmount(value: number, currency: string): string {
  const exponent = currencyExponent(currency);
  return value.toFixed(exponent);
}

function siteUrl(): string | null {
  const value = Deno.env.get('PUBLIC_SITE_URL');
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null;
    return url.origin;
  } catch {
    return null;
  }
}

async function paypalToken(base: string, clientId: string, secret: string): Promise<string> {
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!response.ok || typeof data.access_token !== 'string') {
    throw new Error('paypal-auth-failed');
  }
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const site = siteUrl();
  if (!supabaseUrl || !anonKey || !serviceKey || !site) {
    return json({ error: 'billing-server-not-configured' }, 503);
  }

  const authorization = req.headers.get('Authorization') ?? '';
  const token = authorization.replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'unauthorized' }, 401);

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: authData, error: authError } = await authClient.auth.getUser(token);
  const user = authData.user;
  if (authError || !user?.email || !user.email_confirmed_at) {
    return json({ error: 'verified-account-required' }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid-json' }, 400);
  }

  const provider = body.provider;
  const planId = body.planId;
  if (!isProvider(provider) || !isPlanId(planId)) {
    return json({ error: 'invalid-provider-or-plan' }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const [{ data: compte, error: compteError }, { data: listing, error: listingError }] =
    await Promise.all([
      admin.from('paperatlas_comptes').select('pays').eq('id', user.id).maybeSingle(),
      admin.from('paperatlas_entreprises').select('id, publie').eq('user_id', user.id).maybeSingle(),
    ]);

  if (compteError || listingError) {
    console.error('billing-account-read-failed', compteError?.message ?? listingError?.message);
    return json({ error: 'billing-account-read-failed' }, 500);
  }
  if (!listing?.publie) return json({ error: 'published-directory-profile-required' }, 409);
  if (typeof compte?.pays !== 'string' || !compte.pays.trim()) {
    return json({ error: 'saved-country-required' }, 422);
  }

  const currency = currencyForCountry(compte.pays).toUpperCase();
  if (!currency) return json({ error: 'country-currency-unsupported' }, 422);
  if (!providerSupportsLocalCurrency(provider, currency)) {
    return json({ error: 'provider-currency-unsupported', provider, currency }, 422);
  }

  const { data: current, error: currentError } = await admin
    .from('paperatlas_abonnements_paiement')
    .select('id')
    .eq('user_id', user.id)
    .in('statut', ['trialing', 'active', 'past_due'])
    .limit(1)
    .maybeSingle();
  if (currentError) {
    console.error('billing-subscription-read-failed', currentError.message);
    return json({ error: 'billing-subscription-read-failed' }, 500);
  }
  if (current) return json({ error: 'subscription-already-exists' }, 409);

  const now = new Date();
  const { data: pending, error: pendingError } = await admin
    .from('paperatlas_abonnements_paiement')
    .select('id, prestataire, formule, devise, checkout_url, checkout_expire_a')
    .eq('user_id', user.id)
    .eq('statut', 'pending')
    .limit(1)
    .maybeSingle();
  if (pendingError) {
    console.error('billing-pending-read-failed', pendingError.message);
    return json({ error: 'billing-pending-read-failed' }, 500);
  }
  if (pending) {
    const expires = pending.checkout_expire_a ? new Date(pending.checkout_expire_a).getTime() : 0;
    if (expires > now.getTime()) {
      if (pending.prestataire === provider && pending.formule === planId && pending.devise === currency && pending.checkout_url) {
        return json({ url: pending.checkout_url });
      }
      return json({ error: 'checkout-already-pending' }, 409);
    }
    const { error } = await admin
      .from('paperatlas_abonnements_paiement')
      .delete()
      .eq('id', pending.id)
      .eq('user_id', user.id);
    if (error) {
      console.error('billing-expired-checkout-cleanup-failed', error.message);
      return json({ error: 'billing-checkout-cleanup-failed' }, 500);
    }
  }

  const { data: settings, error: settingsError } = await admin
    .from('parametres_app')
    .select('essai_jours')
    .limit(1)
    .maybeSingle();
  const trialDays = Number(settings?.essai_jours);
  if (settingsError || !Number.isInteger(trialDays) || trialDays < 0 || trialDays > 90) {
    console.error('billing-trial-setting-invalid', settingsError?.message ?? 'invalid-value');
    return json({ error: 'billing-trial-setting-invalid' }, 500);
  }

  const { data: priorTrial, error: priorTrialError } = await admin
    .from('paperatlas_abonnements_paiement')
    .select('id')
    .eq('user_id', user.id)
    .not('essai_debut', 'is', null)
    .limit(1)
    .maybeSingle();
  if (priorTrialError) {
    console.error('billing-trial-history-read-failed', priorTrialError.message);
    return json({ error: 'billing-trial-history-read-failed' }, 500);
  }

  const amount = roundedLocalAmount(PLAN_AMOUNTS_DZD[planId], currency);
  const trial = priorTrial ? 0 : trialDays;
  const months = PLANS[planId];

  try {
    let checkoutUrl = '';
    let subscriptionId: string | null = null;
    let checkoutId: string | null = null;
    let expiresAt: string;

    if (provider === 'stripe') {
      const secret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
      if (!secret) return json({ error: 'stripe-not-configured' }, 503);

      const form = new URLSearchParams({
        mode: 'subscription',
        customer_email: user.email,
        success_url: `${site}/compte?billing=success`,
        cancel_url: `${site}/compte?billing=cancel`,
        'payment_method_collection': 'always',
        'line_items[0][price_data][currency]': currency.toLowerCase(),
        'line_items[0][price_data][unit_amount]': String(stripeMinorAmount(amount, currency)),
        'line_items[0][price_data][product_data][name]': 'PaperAtlas Premium',
        'line_items[0][price_data][recurring][interval]': 'month',
        'line_items[0][price_data][recurring][interval_count]': String(months),
        'subscription_data[metadata][account_id]': user.id,
        'subscription_data[metadata][plan_id]': planId,
        'subscription_data[metadata][currency]': currency,
        'subscription_data[metadata][amount]': String(amount),
      });
      if (trial > 0) {
        form.set('subscription_data[trial_period_days]', String(trial));
        form.set('subscription_data[trial_settings][end_behavior][missing_payment_method]', 'cancel');
      }

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: form,
      });
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string' || typeof data.id !== 'string') {
        console.error('stripe-checkout-create-failed', data.error?.code ?? response.status);
        return json({ error: 'provider-checkout-failed' }, 502);
      }
      checkoutUrl = data.url;
      checkoutId = data.id;
      expiresAt = new Date(Number(data.expires_at) * 1000).toISOString();
    } else {
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? '';
      const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? '';
      const productId = Deno.env.get('PAYPAL_PRODUCT_ID') ?? '';
      const mode = Deno.env.get('PAYPAL_MODE') === 'live' ? 'live' : 'sandbox';
      if (!clientId || !clientSecret || !productId) return json({ error: 'paypal-not-configured' }, 503);
      const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
      const accessToken = await paypalToken(base, clientId, clientSecret);
      const billingCycles = [];
      if (trial > 0) {
        billingCycles.push({
          frequency: { interval_unit: 'DAY', interval_count: trial },
          tenure_type: 'TRIAL',
          sequence: 1,
          total_cycles: 1,
          pricing_scheme: { fixed_price: { value: paypalAmount(0, currency), currency_code: currency } },
        });
      }
      billingCycles.push({
        frequency: { interval_unit: 'MONTH', interval_count: months },
        tenure_type: 'REGULAR',
        sequence: billingCycles.length + 1,
        total_cycles: 0,
        pricing_scheme: { fixed_price: { value: paypalAmount(amount, currency), currency_code: currency } },
      });

      const planResponse = await fetch(`${base}/v1/billing/plans`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          name: `PaperAtlas Premium ${months} mois ${currency}`,
          billing_cycles: billingCycles,
          payment_preferences: {
            auto_bill_outstanding: true,
            setup_fee_failure_action: 'CANCEL',
            payment_failure_threshold: 3,
          },
        }),
      });
      const plan = await planResponse.json();
      if (!planResponse.ok || typeof plan.id !== 'string') {
        console.error('paypal-plan-create-failed', plan.name ?? planResponse.status);
        return json({ error: 'provider-currency-or-plan-unsupported' }, 422);
      }

      const subscriptionResponse = await fetch(`${base}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          custom_id: user.id,
          application_context: {
            brand_name: 'PaperAtlas',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${site}/compte?billing=success`,
            cancel_url: `${site}/compte?billing=cancel`,
          },
        }),
      });
      const subscription = await subscriptionResponse.json();
      const approval = Array.isArray(subscription.links)
        ? subscription.links.find((link: { rel?: string }) => link.rel === 'approve')?.href
        : null;
      if (!subscriptionResponse.ok || typeof subscription.id !== 'string' || typeof approval !== 'string') {
        console.error('paypal-subscription-create-failed', subscription.name ?? subscriptionResponse.status);
        return json({ error: 'provider-checkout-failed' }, 502);
      }
      checkoutUrl = approval;
      subscriptionId = subscription.id;
      expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
    }

    const { error: insertError } = await admin.from('paperatlas_abonnements_paiement').insert({
      user_id: user.id,
      prestataire: provider,
      formule: planId,
      statut: 'pending',
      devise: currency,
      montant: amount,
      prestataire_abonnement_id: subscriptionId,
      session_paiement_id: checkoutId,
      checkout_url: checkoutUrl,
      checkout_expire_a: expiresAt,
      essai_jours_choisis: trial,
    });
    if (insertError) {
      console.error('billing-pending-create-failed', insertError.code ?? insertError.message);
      return json({ error: 'checkout-already-pending' }, 409);
    }

    return json({ url: checkoutUrl });
  } catch (error) {
    console.error('billing-checkout-failed', error instanceof Error ? error.message : 'unknown-error');
    return json({ error: 'provider-checkout-failed' }, 502);
  }
});
