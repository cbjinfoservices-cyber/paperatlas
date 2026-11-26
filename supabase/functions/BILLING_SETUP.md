# Subscription checkout setup

1. Apply the billing and directory table definitions from `supabase/schema.sql` to the linked Supabase project.
2. Set `PUBLIC_SITE_URL` to the canonical HTTPS origin of the app.
3. Configure server-only Supabase Function secrets:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_PRODUCT_ID`
   - `PAYPAL_WEBHOOK_ID`
   - `PAYPAL_MODE` (`sandbox` by default; set to `live` only after end-to-end testing)
4. Configure Stripe to send `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and
   `invoice.payment_failed` to `/functions/v1/billing-stripe-webhook`.
5. Configure PayPal's subscription events to `/functions/v1/billing-paypal-webhook`.
   The function verifies every webhook against PayPal before applying an entitlement.
6. Deploy `billing-checkout`, `billing-cancel`, `billing-stripe-webhook`, and
   `billing-paypal-webhook` with the Supabase CLI. The webhook functions have JWT
   verification disabled in `supabase/config.toml`; their provider signatures remain required.

The checkout endpoint calculates the amount from the signed-in member's saved country and
the server-side tariff table. It rejects currencies not allowlisted for a provider and never
falls back to USD. PayPal Subscriptions' current REST currency reference does not list any
currency used by PaperAtlas's Arab-country price table, so its checkout button remains hidden
until PayPal confirms local-currency recurring billing support.

Each account gets one trial. A payment method is collected by the provider before the 14-day
trial starts; the first charge then renews at the selected one-, three-, six-, or twelve-month
term. Configure provider secrets through the Supabase secret manager, never in the browser,
repository, or chat.
