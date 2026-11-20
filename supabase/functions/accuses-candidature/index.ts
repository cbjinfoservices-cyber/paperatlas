import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** La même liste que la console : les adresses des secrets, et à défaut
 *  l'adresse du propriétaire du site. */
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || 'cbj.infoservices@gmail.com')
  .split(/[,\s;]+/)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** Le délai au-delà duquel un accusé qui n'est pas parti devient un rappel
 *  pour l'administration : une journée pleine, pas une approximation. */
const DELAI_RAPPEL_MS = 24 * 60 * 60 * 1000;

type Renvoi = {
  id: string;
  candidature_id: string;
  destinataire: string;
  auteur: string | null;
  declencheur: string | null;
  candidat_nom: string | null;
  offre_titre: string | null;
  entreprise: string | null;
  statut: string | null;
  motif: string | null;
  sent_at: string;
};

type Ligne = {
  id: string;
  offre_titre: string | null;
  entreprise: string | null;
  candidat_nom: string | null;
  candidat_email: string | null;
  statut: string | null;
  created_at: string;
  accuse_at: string | null;
};

/** L'adresse de l'appelant, lue avec le client anonyme : ce client ne sert
 *  qu'à vérifier le jeton, jamais à lire les données. */
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
  return (data?.user?.email ?? '').trim().toLowerCase() || null;
}

/**
 * L'état de l'envoi, lu chez Resend : la clé et le domaine des secrets, puis le
 * domaine tel que Resend le vérifie. La pastille de l'en-tête s'en sert d'un
 * onglet à l'autre pour dire, sans ouvrir les Paramètres, qu'aucun accusé ne
 * peut partir tant que ce domaine n'est pas vérifié.
 */
async function etatEnvoi() {
  const key = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
  const domaine = (Deno.env.get('RESEND_FROM_DOMAIN') ?? '').trim().replace(/^@/, '');
  const base = {
    configured: Boolean(key && domaine),
    key: Boolean(key),
    domain: domaine,
    checked: false,
    found: false,
    verified: false,
    status: '',
  };
  if (!key || !domaine) return base;

  try {
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!response.ok) {
      return {
        ...base,
        status: response.status === 401 || response.status === 403 ? 'key-scope' : 'api',
      };
    }
    const payload = (await response.json()) as {
      data?: Array<{ name?: string; status?: string }>;
    };
    const wanted = domaine.toLowerCase();
    const trouve = (payload.data ?? []).find(
      (row) => (row.name ?? '').trim().toLowerCase() === wanted,
    );
    if (!trouve) return { ...base, checked: true, status: 'absent' };
    const etat = String(trouve.status ?? '').toLowerCase();
    return {
      ...base,
      checked: true,
      found: true,
      verified: etat === 'verified',
      status: etat || 'unknown',
    };
  } catch {
    return { ...base, status: 'network' };
  }
}

/** Le début du jour courant, en UTC : les trois compteurs se lisent sur la
 *  même journée, celle que la base enregistre. */
function debutDuJour(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !serviceKey) {
    return json({ ok: false, error: 'supabase-env-missing' }, 500);
  }

  const mail = await callerEmail(req);
  if (!mail) return json({ ok: false, error: 'unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  /* L'autorisation tient à la liste des secrets et, à défaut, au rôle
     « admin » porté par le compte : un compte promu en base lit ces
     compteurs sans qu'on recopie son adresse dans les secrets. */
  let authorized = ADMIN_EMAILS.includes(mail);
  if (!authorized) {
    try {
      const { data: compte } = await admin
        .from('paperatlas_comptes')
        .select('role')
        .ilike('email', mail)
        .maybeSingle();
      authorized = String(compte?.role ?? '').toLowerCase() === 'admin';
    } catch {
      authorized = false;
    }
  }
  if (!authorized) return json({ ok: false, error: 'forbidden' }, 403);

  const { data, error } = await admin
    .from('paperatlas_candidatures')
    .select('id, offre_titre, entreprise, candidat_nom, candidat_email, statut, created_at, accuse_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return json({ ok: false, error: error.message }, 500);

  /* L'historique des renvois : qui a écrit, à qui, quand, et si le courriel
     est vraiment parti. Les plus récents d'abord, bornés pour que la console
     ne tire pas un journal entier à chaque ouverture. */
  const { data: journal, error: journalError } = await admin
    .from('paperatlas_accuse_renvois')
    .select(
      'id, candidature_id, destinataire, auteur, declencheur, candidat_nom, offre_titre, entreprise, statut, motif, sent_at',
    )
    .order('sent_at', { ascending: false })
    .limit(60);

  if (journalError) {
    /* Le journal est un complément : son absence ne doit pas fermer la file
       des renvois. */
    console.error('journal des renvois illisible', journalError.message);
  }

  const lignes = (data ?? []) as Ligne[];
  const debut = debutDuJour();
  const limiteRappel = new Date(Date.now() - DELAI_RAPPEL_MS).toISOString();

  const envoyes = lignes.filter((row) => Boolean(row.accuse_at));
  const enAttente = lignes.filter((row) => !row.accuse_at);
  const partisAujourdhui = envoyes.filter((row) => (row.accuse_at ?? '') >= debut);

  /* Les accusés qui attendent depuis plus d'un jour : le rappel de la console,
     et le plus ancien pour dire depuis quand il traîne. */
  const enRetard = enAttente.filter((row) => row.created_at < limiteRappel);
  const plusAncienEnAttente = enAttente.reduce<string | null>((best, row) => {
    if (!best) return row.created_at;
    return row.created_at < best ? row.created_at : best;
  }, null);

  /* La part du journal qui touche la file du jour : le nombre de candidatures
     encore en attente qui ont déjà connu au moins une tentative. */
  const renvois = (journal ?? []) as Renvoi[];
  const tentativesFile = new Set(
    renvois.filter((row) => row.statut === 'echec').map((row) => row.candidature_id),
  ).size;

  /* La file du renvoi : la plus ancienne d'abord, celle qui attend depuis le
     plus longtemps se traite la première. */
  const pending = enAttente
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 40)
    .map((row) => ({
      id: row.id,
      offre_titre: row.offre_titre ?? '',
      entreprise: row.entreprise ?? '',
      candidat_nom: row.candidat_nom ?? '',
      candidat_email: row.candidat_email ?? '',
      statut: row.statut ?? '',
      created_at: row.created_at,
    }));

  /* La porte de l'envoi : la même vérification que la carte des Paramètres,
     lue ici pour que l'en-tête de la console puisse la porter. */
  const gate = await etatEnvoi();

  return json({
    ok: true,
    gate,
    total: lignes.length,
    sent: envoyes.length,
    waiting: enAttente.length,
    today: partisAujourdhui.length,
    pending,
    dayStart: debut,
    /* Le rappel : combien d'accusés dépassent la journée, le plus ancien, et
       le seuil qui a servi à les compter. */
    overdue: enRetard.length,
    oldestWaitingAt: plusAncienEnAttente,
    reminderAt: limiteRappel,
    /* Les dernières lignes du journal des renvois, dans l'ordre de lecture. */
    history: renvois,
    attemptCount: tentativesFile,
  });
});
