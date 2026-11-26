import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { currencyExponent } from '../_shared/billingPricing.ts';

const TABLE = 'paperatlas_abonnements_paiement';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function sameHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

async function signatureValid(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = header.split(',').map((part) => part.split('=', 2));
  const timestamp = parts.find(([key]) => key === 't')?.[1];
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${timestamp}.${raw}`),
  );
  const expected = hex(new Uint8Array(signed));
  return signatures.some((signature) => sameHex(expected, signature));
}

function isoFromUnix(value: unknown): string | null {
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

function normalizedStatus(value: unknown): string {
  switch (value) {
    case 'trialing':
    case 'active':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
      return value;
    default:
      return 'incomplete';
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);

  const secret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
  const apiKey = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!secret || !apiKey || !url || !serviceKey) return json({ error: 'webhook-not-configured' }, 503);

  const raw = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';
  if (!(await signatureValid(raw, signature, secret))) {
    return json({ error: 'invalid-signature' }, 400);
  }

  let event: Record<string, any>;
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ error: 'invalid-event' }, 400);
  }

  const supportedEvents = new Set([
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.paid',
    'invoice.payment_failed',
  ]);
  if (!supportedEvents.has(event.type)) return json({ received: true });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const object = event.data?.object ?? {};
  let subscription = object;
  let sessionId: string | null = null;
  let subscriptionId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    sessionId = typeof object.id === 'string' ? object.id : null;
    subscriptionId = typeof object.subscription === 'string'
      ? object.subscription
      : object.subscription?.id ?? null;
    if (!subscriptionId) return json({ received: true });
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    subscription = await response.json();
    if (!response.ok) {
      console.error('stripe-webhook-subscription-read-failed', response.status);
      return json({ error: 'subscription-read-failed' }, 502);
    }
  } else if (event.type.startsWith('invoice.')) {
    subscriptionId = typeof object.subscription === 'string'
      ? object.subscription
      : object.subscription?.id ?? null;
    if (!subscriptionId) return json({ received: true });
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    subscription = await response.json();
    if (!response.ok) {
      console.error('stripe-webhook-subscription-read-failed', response.status);
      return json({ error: 'subscription-read-failed' }, 502);
    }
  } else {
    subscriptionId = typeof object.id === 'string' ? object.id : null;
  }

  if (!subscriptionId) return json({ received: true });
  const { data: existing, error: existingError } = await admin
    .from(TABLE)
    .select('id, user_id, formule, devise, montant, session_paiement_id, essai_debut, essai_fin')
    .eq('prestataire_abonnement_id', subscriptionId)
    .maybeSingle();
  if (existingError) {
    console.error('stripe-webhook-existing-read-failed', existingError.message);
    return json({ error: 'database-read-failed' }, 500);
  }

  const userId = subscription.metadata?.account_id ?? existing?.user_id;
  const planId = subscription.metadata?.plan_id ?? existing?.formule;
  if (typeof userId !== 'string' || typeof planId !== 'string') {
    console.error('stripe-webhook-metadata-missing', subscriptionId);
    return json({ error: 'subscription-metadata-missing' }, 400);
  }

  let pending = null;
  if (!existing) {
    const result = await admin
      .from(TABLE)
      .select('id')
      .eq('user_id', userId)
      .eq('statut', 'pending')
      .limit(1)
      .maybeSingle();
    if (result.error) {
      console.error('stripe-webhook-pending-read-failed', result.error.message);
      return json({ error: 'database-read-failed' }, 500);
    }
    pending = result.data;
  }

  const currentPeriodStart = isoFromUnix(subscription.current_period_start);
  const trialEnd = isoFromUnix(subscription.trial_end);
  const currentPeriodEnd = isoFromUnix(subscription.current_period_end)
    ?? trialEnd
    ?? existing?.periode_fin
    ?? null;
  const status = normalizedStatus(subscription.status);
  const trialStart = status === 'trialing'
    ? isoFromUnix(subscription.trial_start) ?? new Date().toISOString()
    : existing?.essai_debut ?? null;
  const values = {
    user_id: userId,
    prestataire: 'stripe',
    formule: planId,
    statut: status,
    devise: (subscription.currency ?? existing?.devise ?? 'DZD').toUpperCase(),
    montant: existing?.montant
      ?? Number(subscription.items?.data?.[0]?.price?.unit_amount ?? 0)
        / 10 ** currencyExponent(subscription.currency ?? existing?.devise ?? 'DZD'),
    prestataire_client_id: typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id ?? null,
    prestataire_abonnement_id: subscriptionId,
    session_paiement_id: sessionId ?? existing?.session_paiement_id ?? null,
    checkout_url: null,
    checkout_expire_a: null,
    essai_jours_choisis: trialEnd && trialStart
      ? Math.max(0, Math.round((new Date(trialEnd).getTime() - new Date(trialStart).getTime()) / 86400000))
      : existing?.essai_jours_choisis ?? 0,
    essai_debut: trialStart,
    essai_fin: trialEnd ?? existing?.essai_fin ?? null,
    periode_debut: currentPeriodStart,
    periode_fin: currentPeriodEnd,
    annulation_fin_periode: Boolean(subscription.cancel_at_period_end),
    updated_at: new Date().toISOString(),
  };

  const write = existing
    ? await admin.from(TABLE).update(values).eq('id', existing.id)
    : pending
      ? await admin.from(TABLE).update(values).eq('id', pending.id)
      : await admin.from(TABLE).insert(values);
  if (write.error) {
    console.error('stripe-webhook-subscription-write-failed', write.error.message);
    return json({ error: 'database-write-failed' }, 500);
  }

  const hasAccess = ['trialing', 'active', 'past_due'].includes(status)
    && currentPeriodEnd !== null
    && new Date(currentPeriodEnd).getTime() > Date.now();
  const { error: listingError } = await admin
    .from('paperatlas_entreprises')
    .update({ mise_en_avant_jusqu_a: hasAccess ? currentPeriodEnd : null })
    .eq('user_id', userId);
  if (listingError) {
    console.error('stripe-webhook-listing-write-failed', listingError.message);
    return json({ error: 'directory-entitlement-write-failed' }, 500);
  }

  return json({ received: true });
});
