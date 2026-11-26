import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TABLE = 'paperatlas_abonnements_paiement';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function dateValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function accessToken(base: string, clientId: string, clientSecret: string): Promise<string> {
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json();
  if (!response.ok || typeof data.access_token !== 'string') throw new Error('paypal-auth-failed');
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);

  const clientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? '';
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? '';
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID') ?? '';
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const mode = Deno.env.get('PAYPAL_MODE') === 'live' ? 'live' : 'sandbox';
  const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  if (!clientId || !clientSecret || !webhookId || !url || !serviceKey) {
    return json({ error: 'webhook-not-configured' }, 503);
  }

  let event: Record<string, any>;
  try {
    event = await req.json();
  } catch {
    return json({ error: 'invalid-event' }, 400);
  }

  let token: string;
  try {
    token = await accessToken(base, clientId, clientSecret);
  } catch (error) {
    console.error('paypal-webhook-auth-failed', error instanceof Error ? error.message : 'unknown-error');
    return json({ error: 'provider-auth-failed' }, 502);
  }

  const verification = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: req.headers.get('paypal-auth-algo'),
      cert_url: req.headers.get('paypal-cert-url'),
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  const verified = await verification.json();
  if (!verification.ok || verified.verification_status !== 'SUCCESS') {
    return json({ error: 'invalid-signature' }, 400);
  }

  const eventType = event.event_type;
  const supportedEvents = new Set([
    'BILLING.SUBSCRIPTION.ACTIVATED',
    'BILLING.SUBSCRIPTION.UPDATED',
    'BILLING.SUBSCRIPTION.CANCELLED',
    'BILLING.SUBSCRIPTION.EXPIRED',
    'BILLING.SUBSCRIPTION.SUSPENDED',
    'PAYMENT.SALE.COMPLETED',
    'PAYMENT.SALE.DENIED',
  ]);
  if (!supportedEvents.has(eventType)) return json({ received: true });

  const resource = event.resource ?? {};
  const subscriptionId = eventType.startsWith('PAYMENT.SALE.')
    ? resource.billing_agreement_id
    : resource.id;
  if (typeof subscriptionId !== 'string') return json({ received: true });

  const subscriptionResponse = await fetch(`${base}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subscription = await subscriptionResponse.json();
  if (!subscriptionResponse.ok) {
    console.error('paypal-webhook-subscription-read-failed', subscriptionResponse.status);
    return json({ error: 'subscription-read-failed' }, 502);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: existing, error: existingError } = await admin
    .from(TABLE)
    .select('id, user_id, formule, devise, montant, essai_jours_choisis, essai_debut, essai_fin, periode_fin')
    .eq('prestataire_abonnement_id', subscriptionId)
    .maybeSingle();
  if (existingError) {
    console.error('paypal-webhook-existing-read-failed', existingError.message);
    return json({ error: 'database-read-failed' }, 500);
  }
  if (!existing) {
    console.error('paypal-webhook-pending-subscription-missing', subscriptionId);
    return json({ error: 'subscription-record-missing' }, 500);
  }

  const start = dateValue(subscription.start_time);
  const trialDays = Number(existing.essai_jours_choisis ?? 0);
  const trialEnd = existing.essai_fin
    ?? (start && trialDays > 0
      ? new Date(new Date(start).getTime() + trialDays * 86400000).toISOString()
      : null);
  const saleCompleted = eventType === 'PAYMENT.SALE.COMPLETED';
  const rawStatus = String(subscription.status ?? '').toUpperCase();
  let status = 'incomplete';
  if (rawStatus === 'CANCELLED' || rawStatus === 'EXPIRED') status = 'canceled';
  else if (rawStatus === 'SUSPENDED' || eventType === 'PAYMENT.SALE.DENIED') status = 'past_due';
  else if (rawStatus === 'ACTIVE') {
    status = !saleCompleted && trialEnd && new Date(trialEnd).getTime() > Date.now()
      ? 'trialing'
      : 'active';
  }

  const periodEnd = dateValue(subscription.billing_info?.next_billing_time) ?? existing.periode_fin;
  const paymentCurrency = subscription.billing_info?.last_payment?.amount?.currency_code;
  const trialStart = status === 'trialing' ? start ?? new Date().toISOString() : existing.essai_debut;
  const values = {
    statut: status,
    devise: typeof paymentCurrency === 'string' ? paymentCurrency : existing.devise,
    prestataire_client_id: subscription.subscriber?.payer_id ?? null,
    essai_debut: trialStart,
    essai_fin: trialEnd,
    periode_debut: start ?? new Date().toISOString(),
    periode_fin: periodEnd,
    annulation_fin_periode: status === 'canceled',
    checkout_url: null,
    checkout_expire_a: null,
    updated_at: new Date().toISOString(),
  };
  const { error: updateError } = await admin.from(TABLE).update(values).eq('id', existing.id);
  if (updateError) {
    console.error('paypal-webhook-subscription-write-failed', updateError.message);
    return json({ error: 'database-write-failed' }, 500);
  }

  const hasAccess = ['trialing', 'active', 'past_due'].includes(status)
    || (status === 'canceled' && periodEnd !== null && new Date(periodEnd).getTime() > Date.now());
  const stillFeatured = hasAccess
    && periodEnd !== null
    && new Date(periodEnd).getTime() > Date.now();
  const { error: listingError } = await admin
    .from('paperatlas_entreprises')
    .update({ mise_en_avant_jusqu_a: stillFeatured ? periodEnd : null })
    .eq('user_id', existing.user_id);
  if (listingError) {
    console.error('paypal-webhook-listing-write-failed', listingError.message);
    return json({ error: 'directory-entitlement-write-failed' }, 500);
  }

  return json({ received: true });
});
