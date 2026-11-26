import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

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
  if (!response.ok || typeof data.access_token !== 'string') throw new Error('paypal-auth-failed');
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method-not-allowed' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !anonKey || !serviceKey) return json({ error: 'billing-server-not-configured' }, 503);

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return json({ error: 'unauthorized' }, 401);
  const auth = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: authData, error: authError } = await auth.auth.getUser(token);
  if (authError || !authData.user) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: subscription, error: readError } = await admin
    .from('paperatlas_abonnements_paiement')
    .select('id, prestataire, prestataire_abonnement_id, statut, periode_fin, annulation_fin_periode')
    .eq('user_id', authData.user.id)
    .in('statut', ['trialing', 'active', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readError) {
    console.error('billing-cancel-read-failed', readError.message);
    return json({ error: 'billing-subscription-read-failed' }, 500);
  }
  if (!subscription?.prestataire_abonnement_id) return json({ error: 'no-active-subscription' }, 404);
  if (subscription.annulation_fin_periode) return json({ error: 'already-canceling' }, 409);

  try {
    if (subscription.prestataire === 'stripe') {
      const secret = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
      if (!secret) return json({ error: 'stripe-not-configured' }, 503);
      const form = new URLSearchParams({ cancel_at_period_end: 'true' });
      const response = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscription.prestataire_abonnement_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: form,
        },
      );
      const data = await response.json();
      if (!response.ok) {
        console.error('stripe-cancel-failed', data.error?.code ?? response.status);
        return json({ error: 'provider-cancel-failed' }, 502);
      }
    } else {
      const clientId = Deno.env.get('PAYPAL_CLIENT_ID') ?? '';
      const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET') ?? '';
      const mode = Deno.env.get('PAYPAL_MODE') === 'live' ? 'live' : 'sandbox';
      if (!clientId || !clientSecret) return json({ error: 'paypal-not-configured' }, 503);
      const base = mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
      const accessToken = await paypalToken(base, clientId, clientSecret);
      const response = await fetch(
        `${base}/v1/billing/subscriptions/${subscription.prestataire_abonnement_id}/cancel`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Member requested cancellation' }),
        },
      );
      if (!response.ok) {
        console.error('paypal-cancel-failed', response.status);
        return json({ error: 'provider-cancel-failed' }, 502);
      }
    }

    const { error: updateError } = await admin
      .from('paperatlas_abonnements_paiement')
      .update({
        statut: subscription.prestataire === 'paypal' ? 'canceled' : subscription.statut,
        annulation_fin_periode: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
    if (updateError) {
      console.error('billing-cancel-save-failed', updateError.message);
      return json({ error: 'billing-cancel-save-failed' }, 500);
    }

    return json({ ok: true, accessUntil: subscription.periode_fin });
  } catch (error) {
    console.error('billing-cancel-failed', error instanceof Error ? error.message : 'unknown-error');
    return json({ error: 'provider-cancel-failed' }, 502);
  }
});
