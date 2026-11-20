import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * Enregistre une demande du formulaire de contact pour pouvoir la compter par
 * sujet. Le message part toujours vers les formulaires de la plateforme ; cette
 * fonction ne fait qu'en garder une ligne rangee, pour le tableau de bord.
 *
 * L'ecriture se fait avec la cle de service : la table n'ouvre aucune ecriture
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const nom = clean(body.nom, 120);
  const email = clean(body.email, 160);
  const sujet = clean(body.sujet, 80);
  const profil = clean(body.profil, 80);
  const organisation = clean(body.organisation, 160);
  const message = String(body.message ?? '').slice(0, 500);

  if (!nom || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: 'invalid' }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { error } = await admin.from('demandes_formulaires').insert({
    type: 'contact',
    nom,
    email,
    telephone: '',
    champs: { sujet, profil, organisation, message, source: 'accueil-contact' },
    traitee: false,
  });

  if (error) return json({ error: error.message }, 500);
  return json({ ok: true });
});