import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * La liste des adresses autorisees a ouvrir la console. Elle vit dans les
 * secrets de la fonction (ADMIN_EMAILS, separees par des virgules) et, a
 * defaut, garde l'adresse du proprietaire du site : la console n'est jamais
 * ouverte a un membre ordinaire, meme connecte.
 */
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || 'cbj.infoservices@gmail.com')
  .split(/[,\s;]+/)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

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

/** Les seuls etats qu'une annonce peut prendre sur le tableau du site. */
const STATUTS_ANNONCE = new Set(['publie', 'en_attente', 'refuse']);

/** Les rubriques que le formulaire de depot propose, famille par famille : la
 *  console ne peut ecrire qu'une valeur que le formulaire accepterait, et
 *  jamais une rubrique de l'autre famille que celle du depot. */
const RUBRIQUES_FAMILLE: Record<string, Set<string>> = {
  annonce: new Set(['materiel', 'papier', 'service', 'recherche']),
  offre: new Set(['cdi', 'cdd', 'stage', 'freelance']),
};

/** Les seuls roles qu'un compte peut porter. La console n'accorde qu'eux :
 *  une valeur inconnue ne s'ecrit jamais en base. */
const ROLES_COMPTE = new Set(['admin', 'pro', 'membre']);

type Body = Record<string, unknown>;

/**
 * L'identite de l'appelant est lue dans l'en-tete, jamais dans le corps : la
 * console ne fait jamais confiance a ce que le navigateur pretend etre.
 */
async function callerEmail(req: Request): Promise<string | null> {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await authClient.auth.getUser(token);
  if (error) return null;
  return data?.user?.email?.toLowerCase() ?? null;
}

/**
 * Le tableau de bord entier en une seule reponse : les abonnes, les comptes, les
 * annonces, les conversations et les reglages. Chaque section est lue sur sa
 * table, sans jointure fragile — le rapprochement se fait a plat.
 */
async function overview(admin: ReturnType<typeof createClient>) {
  const [abonnements, comptes, annonces, conversations, parametres, demandesEnAttente] =
    await Promise.all([
      admin
        .from('abonnements')
        .select(
          'id, artisan_id, entreprise, email, metier, ville, offre, statut, montant_mensuel, canal_paiement, date_debut, date_echeance, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(300),
      admin
        .from('paperatlas_comptes')
        .select(
          'id, email, nom, organisme, metier, wilaya, telephone, pays, formule, etablissements, role, role_changed_at, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(300),
      admin
        .from('paperatlas_annonces')
        .select('id, kind, rubrique, titre, organisation, budget, wilaya, pays, email, telephone, statut, created_at')
        .order('created_at', { ascending: false })
        .limit(300),
      admin
        .from('paperatlas_conversations')
        .select('id, kind, sujet, nom_a, nom_b, user_a, user_b, last_message, last_at, created_at')
        .order('last_at', { ascending: false, nullsFirst: false })
        .limit(120),
      admin
        .from('parametres_app')
        .select('id, essai_jours, suivi_appel_heures, updated_by, updated_at')
        .limit(1),
      /* Les demandes encore dans la file : le compte s'affiche sur l'onglet,
         sans ouvrir la section. */
      admin
        .from('demandes_formulaires')
        .select('id', { count: 'exact', head: true })
        .eq('traitee', false),
    ]);

  const failure =
    abonnements.error ||
    comptes.error ||
    annonces.error ||
    conversations.error ||
    parametres.error ||
    demandesEnAttente.error;
  if (failure) throw new Error(failure.message);

  return {
    abonnements: abonnements.data ?? [],
    comptes: comptes.data ?? [],
    annonces: annonces.data ?? [],
    conversations: conversations.data ?? [],
    parametres: (parametres.data ?? [])[0] ?? null,
    demandesEnAttente: demandesEnAttente.count ?? 0,
  };
}

/** Un fil ouvert : ses messages, dans l'ordre, et les adresses de ses membres. */
async function thread(admin: ReturnType<typeof createClient>, conversationId: string) {
  if (!conversationId) throw new Error('no-conversation');

  const { data: conversation, error: conversationError } = await admin
    .from('paperatlas_conversations')
    .select('id, kind, sujet, nom_a, nom_b, user_a, user_b, created_at')
    .eq('id', conversationId)
    .maybeSingle();
  if (conversationError) throw conversationError;
  if (!conversation) throw new Error('not-found');

  const { data: messages, error: messagesError } = await admin
    .from('paperatlas_messages')
    .select('id, conversation_id, sender_id, corps, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(400);
  if (messagesError) throw messagesError;

  /* Les deux participants, lus a part : la conversation ne stocke que des
     identifiants, et la console doit nommer qui parle. */
  const ids = [conversation.user_a, conversation.user_b].filter(Boolean) as string[];
  let membres: Array<{ id: string; email: string | null; nom: string | null }> = [];
  if (ids.length > 0) {
    const { data: rows, error: membersError } = await admin
      .from('paperatlas_comptes')
      .select('id, email, nom')
      .in('id', ids);
    if (membersError) throw membersError;
    membres = (rows ?? []) as typeof membres;
  }

  return { conversation, messages: messages ?? [], membres };
}

/**
 * Le rythme de chaque fil, mesure cote serveur : la console doit voir dormir
 * les conversations sans ouvrir chaque fil un par un. La regle est celle du
 * site — seuls les changements de camp comptent, les messages envoyes
 * d'affilee ne sont pas des reponses.
 */
function paceParFil(
  rows: Array<{ conversation_id: string; sender_id: string; created_at: string }>,
): Record<string, number> {
  const groups = new Map<string, Array<{ conversation_id: string; sender_id: string; created_at: string }>>();
  rows.forEach((row) => {
    const list = groups.get(row.conversation_id);
    if (list) list.push(row);
    else groups.set(row.conversation_id, [row]);
  });

  const out: Record<string, number> = {};
  groups.forEach((list, id) => {
    let total = 0;
    let count = 0;
    for (let i = 1; i < list.length; i += 1) {
      const previous = list[i - 1];
      const current = list[i];
      if (previous.sender_id === current.sender_id) continue;
      const from = new Date(previous.created_at).getTime();
      const to = new Date(current.created_at).getTime();
      if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) continue;
      total += to - from;
      count += 1;
    }
    if (count > 0) out[id] = total / count;
  });
  return out;
}

/** Le rythme des fils demandes, en une seule lecture des messages. */
async function paces(admin: ReturnType<typeof createClient>, ids: unknown) {
  const wanted = (Array.isArray(ids) ? ids : [])
    .map((value) => clean(value, 60))
    .filter((value) => /^[0-9a-fA-F-]{8,60}$/.test(value))
    .slice(0, 200);
  if (wanted.length === 0) return {};

  const { data, error } = await admin
    .from('paperatlas_messages')
    .select('conversation_id, sender_id, created_at')
    .in('conversation_id', wanted)
    .order('created_at', { ascending: true })
    .limit(5000);
  if (error) throw error;

  return paceParFil((data ?? []) as Array<{
    conversation_id: string;
    sender_id: string;
    created_at: string;
  }>);
}

/**
 * La fiche d'un compte : son identite, ses abonnements, les depots qu'il a
 * faits et les demandes B2B qu'il a envoyees. Le rapprochement se fait sur son
 * identifiant et, a defaut, sur son adresse : un abonnement enregistre avant
 * la creation du compte n'a pas encore de lien.
 */
async function compteFiche(
  admin: ReturnType<typeof createClient>,
  compteId: string,
  email: string,
) {
  const mail = email.trim().toLowerCase();
  /* Seule une adresse simple entre dans le filtre : une valeur portant une
     virgule ou une parenthese casserait l'expression et changerait le sens de
     la lecture. */
  const adresseSur = /^[a-z0-9@._+-]+$/.test(mail) ? mail : '';

  const champsCompte =
    'id, email, nom, organisme, metier, wilaya, telephone, pays, formule, etablissements, role, role_changed_at, created_at';

  let compte: Record<string, unknown> | null = null;
  if (compteId) {
    const { data, error } = await admin
      .from('paperatlas_comptes')
      .select(champsCompte)
      .eq('id', compteId)
      .maybeSingle();
    if (error) throw error;
    compte = (data as Record<string, unknown> | null) ?? null;
  }
  if (!compte && adresseSur) {
    const { data, error } = await admin
      .from('paperatlas_comptes')
      .select(champsCompte)
      .eq('email', adresseSur)
      .maybeSingle();
    if (error) throw error;
    compte = (data as Record<string, unknown> | null) ?? null;
  }

  const compteRow = compte as { id?: string; email?: string | null } | null;
  const address = String(compteRow?.email || adresseSur || '').toLowerCase();

  /* Les deux clés possibles, l'une ou l'autre : jamais les deux à la fois dans
     la même ligne de filtre, puisqu'un dépôt rattaché à l'identifiant peut
     porter une autre adresse. Chaque table nomme sa colonne de rattachement :
     un abonnement garde `artisan_id`, un dépôt et une demande gardent
     `user_id`. */
  const filtreDe = (colonne: string) => {
    const parts: string[] = [];
    if (compteRow?.id) parts.push(`${colonne}.eq.${compteRow.id}`);
    if (adresseSur) parts.push(`email.eq.${adresseSur}`);
    return parts.join(',');
  };
  const ouAbonnement = filtreDe('artisan_id');
  const ouCompte = filtreDe('user_id');

  const vides = { abonnements: [], annonces: [], demandes: [] };
  if (!ouCompte) return { compte, ...vides };

  const [abonnements, annonces, demandes] = await Promise.all([
    (ouAbonnement
      ? admin
          .from('abonnements')
          .select(
            'id, artisan_id, entreprise, email, metier, ville, offre, statut, montant_mensuel, canal_paiement, date_debut, date_echeance, created_at',
          )
          .or(ouAbonnement)
          .order('created_at', { ascending: false })
          .limit(60)
      : Promise.resolve({ data: [], error: null })),
    admin
      .from('paperatlas_annonces')
      .select('id, kind, rubrique, titre, organisation, budget, wilaya, pays, email, telephone, statut, created_at')
      .or(ouCompte)
      .order('created_at', { ascending: false })
      .limit(120),
    admin
      .from('paperatlas_demandes_b2b')
      .select('id, reference, dest_name, nom, email, organisme, quantite, delai, budget, message, statut, created_at')
      .or(ouCompte)
      .order('created_at', { ascending: false })
      .limit(120),
  ]);

  const failure = abonnements.error || annonces.error || demandes.error;
  if (failure) throw new Error(failure.message);

  return {
    compte,
    abonnements: abonnements.data ?? [],
    annonces: annonces.data ?? [],
    demandes: demandes.data ?? [],
  };
}

/** Les periodes offertes au-dessus du compteur : le mois en cours, les trente
 *  derniers jours, ou l'historique entier. */
const PERIODES = new Set(['mois', 'jours30', 'tout']);

/** Le premier instant d'une periode, en ISO — `null` quand elle ne borne rien,
 *  c'est-a-dire pour « tout ». */
function debutPeriode(periode: string): string | null {
  if (periode === 'jours30') {
    return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (periode === 'mois') {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  }
  return null;
}

type DemandeRow = {
  id: number;
  type: string;
  nom: string | null;
  email: string | null;
  telephone: string | null;
  champs: Record<string, unknown> | null;
  traitee: boolean | null;
  created_at: string;
};

/** Une demande ramenee a ce que la console et le classeur affichent : le sujet
 *  lu dans `champs`, le message borne a cinq cents signes. */
function aplatir(row: DemandeRow) {
  const champs = row.champs ?? {};
  return {
    id: row.id,
    nom: row.nom,
    email: row.email,
    telephone: row.telephone,
    sujet: clean(champs.sujet, 80),
    profil: clean(champs.profil, 80),
    organisation: clean(champs.organisation, 160),
    message: String(champs.message ?? '').slice(0, 500),
    traitee: Boolean(row.traitee),
    created_at: row.created_at,
  };
}

/** Les demandes d'une periode, lues page par page : une seule requete
 *  s'arreterait au plafond de lignes du serveur, et le compteur mentirait. */
async function lireDemandes(
  admin: ReturnType<typeof createClient>,
  depuis: string | null,
  plafond = 3000,
) {
  const PAGE = 500;
  const out: DemandeRow[] = [];
  for (let from = 0; from < plafond; from += PAGE) {
    let query = admin
      .from('demandes_formulaires')
      .select('id, type, nom, email, telephone, champs, traitee, created_at')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (depuis) query = query.gte('created_at', depuis);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as unknown as DemandeRow[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/**
 * Les demandes du formulaire de contact, comptees par sujet sur la periode
 * lue. Le sujet est range dans la colonne `champs` au moment de l'envoi : le
 * compteur le lit la, et n'a jamais a relire le message pour deviner de quoi
 * il s'agit. Chaque sujet porte deux chiffres : recues, et restant a traiter.
 */
async function demandesForm(admin: ReturnType<typeof createClient>, periode: string) {
  const toutes = await lireDemandes(admin, debutPeriode(periode));

  const tally = new Map<string, { n: number; reste: number }>();
  let aTraiter = 0;
  let traitees = 0;
  toutes.forEach((row) => {
    const sujet = clean((row.champs ?? {}).sujet, 80);
    const ligne = tally.get(sujet) ?? { n: 0, reste: 0 };
    ligne.n += 1;
    if (row.traitee) traitees += 1;
    else {
      ligne.reste += 1;
      aTraiter += 1;
    }
    tally.set(sujet, ligne);
  });

  const parSujet = [...tally.entries()]
    .map(([sujet, ligne]) => ({ sujet, n: ligne.n, reste: ligne.reste }))
    .sort((a, b) => b.n - a.n || a.sujet.localeCompare(b.sujet));

  return {
    total: toutes.length,
    aTraiter,
    traitees,
    parSujet,
    rows: toutes.slice(0, 80).map(aplatir),
  };
}

/** Le classeur des demandes : toute la periode, pas seulement les quatre-vingts
 *  lignes de la console — le secretariat recoit la file entiere. */
async function demandesExport(admin: ReturnType<typeof createClient>, periode: string) {
  const toutes = await lireDemandes(admin, debutPeriode(periode));
  return toutes.map(aplatir);
}

/** Un jour, en millisecondes. */
const JOUR_MS = 24 * 60 * 60 * 1000;

/** Le lundi de la semaine d'une date, a minuit UTC : les barres se rangent du
 *  lundi au dimanche, quel que soit le fuseau de lecture. */
function lundiDe(date: Date): Date {
  const jour = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const decalage = (jour.getUTCDay() + 6) % 7;
  jour.setUTCDate(jour.getUTCDate() - decalage);
  return jour;
}

/** Le nombre de semaines que la vue montre sous le compteur. */
const SEMAINES_VUE = 8;

/**
 * La vue par semaine : les huit dernieres semaines, une barre chacune, et le
 * mois en cours compare au precedent. La fenetre est fixe, independante du
 * filtre de periode : elle repond a « est-ce que ca monte ? », pas a « qu'ai-je
 * recu ce mois-ci ? ».
 */
async function demandesSemaines(admin: ReturnType<typeof createClient>) {
  const now = new Date();
  const cetteSemaine = lundiDe(now);
  const premierLundi = new Date(cetteSemaine.getTime() - (SEMAINES_VUE - 1) * 7 * JOUR_MS);
  const debutMois = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const debutMoisPrecedent = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  );

  /* On lit depuis la plus ancienne des deux bornes : le mois precedent peut
     commencer avant la premiere barre. */
  const depuis = new Date(Math.min(premierLundi.getTime(), debutMoisPrecedent.getTime()));
  const toutes = await lireDemandes(admin, depuis.toISOString(), 8000);

  const semaines = Array.from({ length: SEMAINES_VUE }, (_, index) => {
    const debut = new Date(premierLundi.getTime() + index * 7 * JOUR_MS);
    return { debut: debut.toISOString().slice(0, 10), n: 0 };
  });

  let mois = 0;
  let moisPrecedent = 0;
  toutes.forEach((row) => {
    const stamp = new Date(row.created_at).getTime();
    if (!Number.isFinite(stamp)) return;
    const index = Math.floor(
      (lundiDe(new Date(stamp)).getTime() - premierLundi.getTime()) / (7 * JOUR_MS),
    );
    if (index >= 0 && index < SEMAINES_VUE) semaines[index].n += 1;
    if (stamp >= debutMois.getTime()) mois += 1;
    else if (stamp >= debutMoisPrecedent.getTime()) moisPrecedent += 1;
  });

  return { semaines, mois, moisPrecedent };
}

/** Le seul geste d'ecriture des demandes : dire qu'une ligne est traitee, ou
 *  la remettre dans la file. Rien d'autre ne bouge, ni le message ni le sujet. */
async function demandeEtat(
  admin: ReturnType<typeof createClient>,
  rawId: unknown,
  traitee: boolean,
) {
  const id = Number(String(rawId ?? '').trim());
  if (!Number.isInteger(id) || id <= 0) throw new Error('invalid');

  const { data, error } = await admin
    .from('demandes_formulaires')
    .update({ traitee })
    .eq('id', id)
    .select('id, traitee')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not-found');
  return data;
}

/**
 * Ouvre ou retire une annonce du tableau : c'est la seule ecriture de la
 * console, et elle ne touche qu'a l'etat, jamais au contenu depose.
 */
async function annonceStatut(
  admin: ReturnType<typeof createClient>,
  id: string,
  statut: string,
) {
  if (!id || !STATUTS_ANNONCE.has(statut)) throw new Error('invalid');

  const { data, error } = await admin
    .from('paperatlas_annonces')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, statut')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not-found');
  return data;
}

/**
 * La correction d'une rubrique deposee hors de sa famille : la console ne peut
 * ecrire qu'une rubrique que le formulaire de depot propose pour ce type-la.
 * Rien d'autre ne bouge — ni le titre, ni le texte, ni l'etat de relecture.
 */
async function annonceRubrique(
  admin: ReturnType<typeof createClient>,
  id: string,
  kind: string,
  rubrique: string,
) {
  const type = clean(kind, 20).toLowerCase();
  const valeur = clean(rubrique, 30).toLowerCase();
  const famille = RUBRIQUES_FAMILLE[type];
  if (!id || !famille || !famille.has(valeur)) throw new Error('invalid');

  const { data, error } = await admin
    .from('paperatlas_annonces')
    .update({ rubrique: valeur, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, kind, rubrique')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not-found');
  return data;
}

/**
 * Le seul geste d'ecriture sur un role : promouvoir un compte administrateur,
 * ou le ramener a un role ordinaire. Rien d'autre ne bouge — ni l'adresse, ni
 * la formule, ni les donnees. Un compte ne peut pas retirer son propre role
 * admin : il se fermerait la console a lui-meme.
 */
async function compteRole(
  admin: ReturnType<typeof createClient>,
  rawId: unknown,
  rawRole: unknown,
  caller: string,
) {
  const id = clean(rawId, 60);
  const role = clean(rawRole, 20).toLowerCase();
  if (!id || !ROLES_COMPTE.has(role)) throw new Error('invalid');

  const { data: cible, error: lecture } = await admin
    .from('paperatlas_comptes')
    .select('id, email, role')
    .eq('id', id)
    .maybeSingle();
  if (lecture) throw lecture;
  if (!cible) throw new Error('not-found');

  /* Le compte appelant garde toujours son role admin : la console ne se
     referme pas sur celui qui la tient. */
  const cibleMail = String((cible as { email?: string | null }).email ?? '')
    .trim()
    .toLowerCase();
  if (cibleMail && cibleMail === caller && role !== 'admin') throw new Error('self');

  /* L'instant de la promotion se note sur la ligne : la console et le
     classeur peuvent dater le geste, sans le deduire d'une autre colonne qui
     bouge pour d'autres raisons. */
  const { data, error } = await admin
    .from('paperatlas_comptes')
    .update({ role, role_changed_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, role, role_changed_at')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('not-found');
  return data;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const email = await callerEmail(req);
  if (!email) return json({ error: 'unauthorized' }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  /* L'autorisation tient a la liste des secrets et, a defaut, au role
     « admin » porte par le compte : un compte promu en base ouvre la console
     sans qu'il faille recopier son adresse dans les secrets de la fonction. */
  let authorized = ADMIN_EMAILS.includes(email);
  if (!authorized) {
    try {
      const { data: compte } = await admin
        .from('paperatlas_comptes')
        .select('role')
        .ilike('email', email)
        .maybeSingle();
      authorized = String(compte?.role ?? '').toLowerCase() === 'admin';
    } catch {
      authorized = false;
    }
  }
  if (!authorized) return json({ error: 'forbidden' }, 403);

  const action = clean(body.action, 40) || 'overview';

  try {
    if (action === 'overview') {
      return json({ ok: true, ...(await overview(admin)) });
    }
    if (action === 'paces') {
      return json({ ok: true, paces: await paces(admin, body.conversationIds) });
    }
    if (action === 'thread') {
      return json({ ok: true, ...(await thread(admin, clean(body.conversationId, 60))) });
    }
    if (action === 'compte') {
      const fiche = await compteFiche(
        admin,
        clean(body.compteId, 60),
        clean(body.email, 160),
      );
      return json({ ok: true, ...fiche });
    }
    if (action === 'demandes-form') {
      const periode = clean(body.periode, 20);
      return json({
        ok: true,
        ...(await demandesForm(admin, PERIODES.has(periode) ? periode : 'tout')),
      });
    }
    if (action === 'demandes-export') {
      const periode = clean(body.periode, 20);
      return json({
        ok: true,
        rows: await demandesExport(admin, PERIODES.has(periode) ? periode : 'tout'),
      });
    }
    if (action === 'demandes-semaines') {
      return json({ ok: true, ...(await demandesSemaines(admin)) });
    }
    if (action === 'demande-etat') {
      const updated = await demandeEtat(admin, body.id, body.traitee === true);
      return json({ ok: true, demande: updated });
    }
    if (action === 'annonce') {
      const updated = await annonceStatut(admin, clean(body.id, 60), clean(body.statut, 20));
      return json({ ok: true, annonce: updated });
    }
    if (action === 'annonce-rubrique') {
      const updated = await annonceRubrique(
        admin,
        clean(body.id, 60),
        clean(body.kind, 20),
        clean(body.rubrique, 30),
      );
      return json({ ok: true, annonce: updated });
    }
    if (action === 'role-set') {
      const updated = await compteRole(admin, body.compteId, body.role, email);
      return json({ ok: true, compte: updated });
    }
    return json({ error: 'unknown-action' }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const status =
      message === 'invalid'
        ? 400
        : message === 'self'
          ? 409
          : message === 'not-found'
            ? 404
            : 500;
    return json({ error: message }, status);
  }
});
