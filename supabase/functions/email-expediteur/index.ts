import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** La seule adresse autorisée à lire l'état de l'expéditeur et à envoyer un
 *  test. Le serveur la vérifie : le bouton de la console n'est qu'un confort. */
const ADMIN_EMAIL = 'cbj.infoservices@gmail.com';

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const clean = (value: unknown, max = 160) =>
  String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const siteUrl = () => (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
const apiKey = () => (Deno.env.get('RESEND_API_KEY') ?? '').trim();
const domain = () => (Deno.env.get('RESEND_FROM_DOMAIN') ?? '').trim().replace(/^@/, '');
/** L'adresse de réponse, quand elle est posée séparément : les confirmations
 *  partent au nom de PaperAtlas, mais une réponse humaine atterrit dans la
 *  bonne boîte. */
const replyTo = () => (Deno.env.get('RESEND_REPLY_TO') ?? '').trim();

/** L'expéditeur commun à toutes les fonctions du site : le même nom, la même
 *  adresse, quelle que soit la confirmation envoyée. */
const expediteur = () => (domain() ? `PaperAtlas <noreply@${domain()}>` : '');

type Body = Record<string, unknown>;

async function callerEmail(req: Request): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!url || !anonKey || !token) return null;
  const auth = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await auth.auth.getUser(token);
  if (error) return null;
  return (data?.user?.email ?? '').toLowerCase() || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const mail = await callerEmail(req);
  if (!mail) return json({ error: 'unauthorized' }, 401);
  if (mail !== ADMIN_EMAIL.toLowerCase()) return json({ error: 'forbidden' }, 403);

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const action = clean(body.action, 40) || 'etat';
  const site = siteUrl();

  if (action === 'etat') {
    const hasKey = Boolean(apiKey());
    const hasDomain = Boolean(domain());
    return json({
      ok: true,
      configured: hasKey && hasDomain,
      key: hasKey,
      domain: domain(),
      from: expediteur(),
      replyTo: replyTo(),
      site,
      admin: ADMIN_EMAIL,
    });
  }

  if (action === 'test') {
    if (!apiKey() || !domain()) {
      return json({ ok: true, sent: false, reason: 'email-not-configured' });
    }

    const to = clean(body.to, 160).toLowerCase() || ADMIN_EMAIL;
    if (!isEmail(to)) return json({ error: 'invalid' }, 400);

    const subject = 'Test d’envoi · PaperAtlas';
    const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
      <p style="margin:0 0 16px">Bonjour,</p>
      <p style="margin:0 0 16px">Cet e-mail confirme que PaperAtlas peut écrire depuis
        <strong>${escapeHtml(expediteur())}</strong>. Les confirmations de devis, de demande B2B
        et de candidature partiront désormais sous ce nom.</p>
      <p style="margin:0 0 16px;color:#8a7f6f">Si vous lisez ce message, le domaine d’envoi est
        correctement vérifié.</p>
      <p style="margin:0;font-size:12px;color:#8a7f6f">PaperAtlas · message de vérification envoyé
        depuis la console d’administration.</p>
    </div>`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: expediteur(),
          to: [to],
          ...(replyTo() ? { reply_to: replyTo() } : {}),
          subject,
          html,
          text: `PaperAtlas peut écrire depuis ${expediteur()}. Ce message confirme que le domaine d’envoi est vérifié.`,
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        return json({ ok: true, sent: false, to, message: detail.slice(0, 300) });
      }
      return json({ ok: true, sent: true, to });
    } catch (err) {
      return json(
        { ok: true, sent: false, to, message: err instanceof Error ? err.message : 'unknown' },
        200,
      );
    }
  }

  /* Le test des e-mails d'authentification.
   *
   * Ceux-là ne partent pas d'ici : c'est Supabase Auth qui les écrit, par le
   * SMTP personnalisé du projet. La seule façon de prouver que ce SMTP porte
   * bien le nom de PaperAtlas est donc de demander un vrai message, puis de
   * le recevoir. On demande une réinitialisation pour l'adresse de
   * l'administration — jamais pour celle d'un tiers, et sans jamais lire ni
   * manipuler le jeton, qui reste chez Supabase. */
  if (action === 'test-auth') {
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    if (!url || !anonKey) {
      return json({ ok: true, sent: false, message: 'supabase-url-missing' });
    }

    const to = clean(body.to, 160).toLowerCase() || ADMIN_EMAIL;
    if (!isEmail(to)) return json({ error: 'invalid' }, 400);

    /* Deux clients séparés, comme partout : l'anonyme ne sert qu'à demander
       le message, il ne touche à aucune donnée. */
    const anon = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    try {
      const { error } = await anon.auth.resetPasswordForEmail(to, {
        redirectTo: site ? `${site}/compte/connexion` : undefined,
      });
      if (error) {
        return json({ ok: true, sent: false, to, message: error.message.slice(0, 300) });
      }
      return json({ ok: true, sent: true, to });
    } catch (err) {
      return json(
        { ok: true, sent: false, to, message: err instanceof Error ? err.message : 'unknown' },
        200,
      );
    }
  }

  /* Le test du rappel B2B.
   *
   * Ce message-là n'est pas écrit ici : c'est la fonction `rappel-b2b` qui
   * relance un atelier resté sans réponse. Il part pourtant par la même clé
   * et le même domaine, et il peut tomber seul — d'où ce test dédié, qui en
   *voie un exemple complet à l'adresse de l'administration, sans écrire à
   * aucun atelier et sans toucher aux demandes réelles.
   */
  if (action === 'test-b2b') {
    if (!apiKey() || !domain()) {
      return json({ ok: true, sent: false, reason: 'email-not-configured' });
    }

    const to = clean(body.to, 160).toLowerCase() || ADMIN_EMAIL;
    if (!isEmail(to)) return json({ error: 'invalid' }, 400);

    const site = siteUrl();
    const accountLink = site ? `${site}/compte#demandes-b2b` : '';
    const subject = 'Rappel B2B · exemple de test · PaperAtlas';
    const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a7f6f">Exemple de test</p>
      <p style="margin:0 0 16px">Bonjour,</p>
      <p style="margin:0 0 16px">Voici, tel qu'un atelier le reçoit, le rappel envoyé quand une demande B2B
        reste sans réponse depuis plus de 48 h. Aucun atelier n'a été contacté :
        les deux demandes ci-dessous sont des exemples.</p>
      <div style="margin:0 0 18px;padding:12px 14px;border-left:3px solid #e8822f;background:#f7f1e6">
        <p style="margin:0 0 4px;font-weight:700">PA-2041 · Imprimerie Exemple · Atelier de démonstration</p>
        <p style="margin:0 0 4px;font-size:13px;color:#8a7f6f">Reçue il y a 3 jours · contact@exemple.test · +213 000 00 00 00</p>
        <p style="margin:0 0 6px;font-size:13px">Quantité : 5 000 — Délai : 10 jours — Budget : à préciser</p>
        <p style="margin:0;font-size:13px;line-height:1.55">Bonjour, nous cherchons un atelier pour un catalogue de 32 pages, dos collé, papier couché 135 g.</p>
      </div>
      <p style="margin:0 0 16px">Un mot suffit souvent à ne pas perdre le client : dites simplement si le volume
        vous convient et sous quel délai.</p>
      ${accountLink ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}" style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">Ouvrir mes demandes B2B</a></p>` : ''}
      <p style="margin:0;font-size:12px;color:#8a7f6f">PaperAtlas · un seul rappel par demande.
        Vous pouvez couper les alertes e-mail depuis « Demandes B2B reçues » dans votre espace compte.</p>
      <p style="margin:14px 0 0;font-size:12px;color:#8a7f6f">Ce message est un test envoyé depuis la console d'administration.
        L'expéditeur ci-dessus est celui que recevront réellement les ateliers.</p>
    </div>`;
    const text = [
      'Exemple de test — rappel B2B envoyé aux ateliers.',
      '',
      'PA-2041 · Imprimerie Exemple · Atelier de démonstration',
      'Reçue il y a 3 jours · contact@exemple.test',
      'Quantité : 5 000 — Délai : 10 jours — Budget : à préciser',
      'Bonjour, nous cherchons un atelier pour un catalogue de 32 pages, dos collé.',
      '',
      accountLink ? `Ouvrir mes demandes B2B : ${accountLink}` : '',
      '',
      `Expéditeur réel : ${expediteur()} — aucun atelier n'a été contacté.`,
    ]
      .filter((line) => line !== '')
      .join('\n');

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: expediteur(),
          to: [to],
          ...(replyTo() ? { reply_to: replyTo() } : {}),
          subject,
          html,
          text,
        }),
      });
      if (!response.ok) {
        const detail = await response.text();
        return json({ ok: true, sent: false, to, message: detail.slice(0, 300) });
      }
      return json({ ok: true, sent: true, to });
    } catch (err) {
      return json(
        { ok: true, sent: false, to, message: err instanceof Error ? err.message : 'unknown' },
        200,
      );
    }
  }

  /* La vérification du domaine d'envoi, demandée à Resend lui-même.
   *
   * Jusqu'ici la console ne savait dire qu'une chose : un domaine est écrit
   * dans les secrets. Ce n'est pas la même chose qu'un domaine vérifié. Ici
   * on interroge la liste des domaines du compte Resend et on lit l'état de
   * celui que les envois utilisent : c'est la seule réponse qui engage.
   */
  if (action === 'verifier') {
    if (!apiKey()) {
      return json({ ok: true, checked: false, reason: 'no-key', domain: domain() });
    }
    if (!domain()) {
      return json({ ok: true, checked: false, reason: 'no-domain', domain: '' });
    }
    try {
      const response = await fetch('https://api.resend.com/domains', {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey()}` },
      });
      if (!response.ok) {
        const detail = await response.text();
        /* Une clé limitée à l'envoi ne peut pas lister les domaines : c'est un
           fait à dire, pas une panne de Resend. */
        const portee = response.status === 401 || response.status === 403;
        return json({
          ok: true,
          checked: false,
          reason: portee ? 'key-scope' : 'api',
          domain: domain(),
          message: detail.slice(0, 300),
        });
      }
      const payload = (await response.json()) as {
        data?: Array<{ name?: string; status?: string; region?: string }>;
      };
      const wanted = domain().toLowerCase();
      const trouve = (payload.data ?? []).find(
        (row) => (row.name ?? '').trim().toLowerCase() === wanted,
      );
      if (!trouve) {
        return json({
          ok: true,
          checked: true,
          found: false,
          verified: false,
          domain: domain(),
          status: 'absent',
        });
      }
      const etat = String(trouve.status ?? '').toLowerCase();
      return json({
        ok: true,
        checked: true,
        found: true,
        verified: etat === 'verified',
        domain: domain(),
        status: etat || 'unknown',
        region: trouve.region ?? '',
        checkedAt: new Date().toISOString(),
      });
    } catch (err) {
      return json({
        ok: true,
        checked: false,
        reason: 'network',
        domain: domain(),
        message: err instanceof Error ? err.message : 'unknown',
      });
    }
  }

  return json({ error: 'unknown-action' }, 400);
});
