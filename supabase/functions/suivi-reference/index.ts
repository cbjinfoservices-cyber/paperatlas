import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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

/**
 * Both references share one shape: a short family, a numeric stamp and a tail
 * — `DEV-2026-A1B2` for a subscription quote, `B2B-202611-1234` for a print
 * request. The shape is checked before the database is touched, so a stray
 * word never turns into a query.
 */
const REF_SHAPE = /^[A-Z0-9]{2,4}-[0-9]{4,8}-[A-Z0-9]{3,6}$/;

const DEVIS_COLUMNS =
  'reference, organisation, formule, formule_id, etablissements, marche, devise, rythme, montant_mensuel, montant_total, mise_en_route, statut, created_at, updated_at, relance_envoyee_at';

const DEMANDE_COLUMNS =
  'reference, dest_name, quantite, delai, statut, created_at, updated_at, traitee_at';

const DEVIS_STATUTS = ['recu', 'en_etude', 'confirme', 'expire'];
const DEMANDE_STATUTS = ['nouvelle', 'vue', 'traitee'];

type Row = Record<string, unknown>;

const pick = (row: Row, key: string) => {
  const value = row[key];
  return typeof value === 'string' ? value : '';
};

const stamp = (row: Row, key: string) => {
  const value = row[key];
  return typeof value === 'string' && value ? value : null;
};

function devisPayload(row: Row) {
  const raw = pick(row, 'statut');
  const sites = Number(row.etablissements);
  return {
    ok: true,
    kind: 'devis',
    reference: pick(row, 'reference'),
    statut: DEVIS_STATUTS.includes(raw) ? raw : 'recu',
    created: stamp(row, 'created_at'),
    updated: stamp(row, 'updated_at'),
    relance: stamp(row, 'relance_envoyee_at'),
    formule: pick(row, 'formule'),
    formuleId: pick(row, 'formule_id'),
    etablissements: Number.isFinite(sites) && sites > 0 ? Math.round(sites) : 1,
    marche: pick(row, 'marche'),
    devise: pick(row, 'devise'),
    rythme: pick(row, 'rythme'),
    montantMensuel: pick(row, 'montant_mensuel'),
    montantTotal: pick(row, 'montant_total'),
    /* The printed sheet addresses the contact: the structure and the day the
       subscription should start are read from the file, never guessed. */
    organisation: pick(row, 'organisation'),
    miseEnRoute: stamp(row, 'mise_en_route'),
  };
}

function demandePayload(row: Row) {
  const raw = pick(row, 'statut');
  return {
    ok: true,
    kind: 'demande',
    reference: pick(row, 'reference'),
    statut: DEMANDE_STATUTS.includes(raw) ? raw : 'nouvelle',
    created: stamp(row, 'created_at'),
    updated: stamp(row, 'updated_at'),
    traiteeAt: stamp(row, 'traitee_at'),
    atelier: pick(row, 'dest_name'),
    quantite: pick(row, 'quantite'),
    delai: pick(row, 'delai'),
  };
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

  const action = clean(body.action, 40) || 'lookup';
  if (action !== 'lookup') return json({ ok: false, error: 'unknown-action' }, 400);

  /* One field, one reference: spaces and underscores are read as dashes so a
     reference pasted with the wrong separator still arrives. */
  const reference = clean(body.reference, 40).toUpperCase().replace(/[\s_]+/g, '-');
  if (!reference) return json({ ok: false, error: 'empty' }, 200);
  if (!REF_SHAPE.test(reference)) return json({ ok: false, error: 'format' }, 200);

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const wantsDevis = reference.startsWith('DEV');
    const wantsDemande = reference.startsWith('B2B');

    if (!wantsDemande) {
      const { data, error } = await admin
        .from('paperatlas_devis_abonnement')
        .select(DEVIS_COLUMNS)
        .eq('reference', reference)
        .maybeSingle();
      if (error) return json({ ok: false, error: 'server' }, 500);
      if (data) return json(devisPayload(data as Row));
    }

    if (!wantsDevis) {
      const { data, error } = await admin
        .from('paperatlas_demandes_b2b')
        .select(DEMANDE_COLUMNS)
        .eq('reference', reference)
        .maybeSingle();
      if (error) return json({ ok: false, error: 'server' }, 500);
      if (data) return json(demandePayload(data as Row));
    }

    return json({ ok: false, error: 'notfound' }, 200);
  } catch {
    return json({ ok: false, error: 'server' }, 500);
  }
});