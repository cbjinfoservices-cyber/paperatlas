import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage } from '../_shared/mail.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * Reçoit les formulaires publics du site — contact (accueil) et demande de
 * devis (annuaire) — et les range dans `demandes_formulaires`, d'où la console
 * les lit et les compte par sujet. Un e-mail de notification part ensuite vers
 * la boîte de l'éditeur (secret MAIL_NOTIFY_TO, à défaut l'adresse de réponse),
 * avec l'adresse du visiteur en « répondre à ».
 *
 * L'écriture se fait avec la cle de service : la table n'ouvre aucune ecriture
 * au navigateur, et la lecture reste tenue par les policies de la console.
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const clean = (value: unknown, max = 300) =>
  String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Au plus cinq demandes par adresse et par heure : de quoi écrire plusieurs
 *  fois, pas de quoi inonder la boîte de l'éditeur. */
const MAX_PAR_HEURE = 5;

const TYPES = new Set(['contact', 'devis']);

const LIBELLE_TYPE: Record<string, string> = {
  contact: 'Nouveau message',
  devis: 'Demande de devis',
};

/** Les champs libres d'un formulaire : des clés sobres, des valeurs bornées. */
function readChamps(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>).slice(0, 40)) {
    const cle = key.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40);
    if (!cle) continue;
    out[cle] = String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, 600);
  }
  return out;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  /* Champ piège rempli : c'est un robot. Réponse « ok » sans rien écrire. */
  if (clean(body.company_alt, 200) || clean(body.website_alt, 200)) {
    return json({ ok: true, notified: false });
  }

  const type = TYPES.has(clean(body.type, 20)) ? clean(body.type, 20) : 'contact';
  const nom = clean(body.nom, 120);
  const email = clean(body.email, 160).toLowerCase();
  const telephone = clean(body.telephone, 40);

  if (!nom || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'invalid' }, 400);
  }

  const champs =
    type === 'devis'
      ? { ...readChamps(body.champs), sujet: 'devis', source: 'annuaire-devis' }
      : {
          sujet: clean(body.sujet, 80),
          profil: clean(body.profil, 80),
          organisation: clean(body.organisation, 160),
          message: String(body.message ?? '').slice(0, 500),
          source: 'accueil-contact',
        };

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  const depuis = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('demandes_formulaires')
    .select('id', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', depuis);
  if ((count ?? 0) >= MAX_PAR_HEURE) return json({ error: 'rate' }, 429);

  const { error } = await admin.from('demandes_formulaires').insert({
    type,
    nom,
    email,
    telephone,
    champs,
    traitee: false,
  });
  if (error) return json({ error: error.message }, 500);

  /* La ligne est écrite : la demande n'est jamais perdue. La notification est
     un confort — un échec d'envoi ne fait pas échouer le formulaire. */
  const notifyTo = (Deno.env.get('MAIL_NOTIFY_TO') || getMailConfig().replyTo || 'contact@paperatlas.net').trim();
  const lignes = [
    ['Nom', nom],
    ['E-mail', email],
    ['Téléphone', telephone],
    ...Object.entries(champs).filter(([cle]) => cle !== 'source').map(([cle, valeur]) => [cle, valeur]),
  ].filter(([, valeur]) => valeur);

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 12px"><strong>${escapeHtml(LIBELLE_TYPE[type])}</strong> reçu depuis paperatlas.net.</p>
    <table style="border-collapse:collapse">${lignes
      .map(
        ([cle, valeur]) =>
          `<tr><td style="padding:4px 14px 4px 0;color:#8a7f6f;vertical-align:top">${escapeHtml(cle)}</td><td style="padding:4px 0">${escapeHtml(valeur)}</td></tr>`,
      )
      .join('')}</table>
    <p style="margin:16px 0 0;font-size:12px;color:#8a7f6f">Répondez à ce message pour écrire directement à ${escapeHtml(nom)}.</p>
  </div>`;
  const text = [`${LIBELLE_TYPE[type]} reçu depuis paperatlas.net.`, '', ...lignes.map(([cle, valeur]) => `${cle} : ${valeur}`)].join('\n');

  const sent = await sendMailMessage({
    to: notifyTo,
    replyTo: email,
    subject: `${LIBELLE_TYPE[type]} · ${nom}`,
    html,
    text,
  });

  return json({ ok: true, notified: sent.ok });
});