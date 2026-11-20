import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage } from '../_shared/mail.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

type Lang = 'fr' | 'ar' | 'en';

/** The language the visitor used: the receipt leaves in that one. */
const LANG_OF = (value: unknown): Lang => {
  const raw = clean(value, 4).toLowerCase();
  return raw === 'ar' || raw === 'en' ? raw : 'fr';
};

const STATUTS = new Set(['nouvelle', 'vue', 'traitee']);

/* Les deux pièces d'un dossier de marché vivent dans un bucket privé : le
   dépôt se fait par une place signée, la lecture par un lien signé refait à
   chaque ouverture. Aucun fichier n'est jamais public. */
const PIECES_BUCKET = 'marches-pieces';
/* Le plafond du bucket, dit ici aussi : le serveur ne fabrique pas de place
   pour un fichier qu'il refusera ensuite. */
const PIECE_MAX_BYTES = 5 * 1024 * 1024;

/** Une place de dépôt ne vaut que pour un PDF, et le chemin le dit. */
const PIECE_PATH = /^dossiers\/[a-z0-9-]+\.pdf$/;

/** Ce que deux pièces pèsent au plus, et ce que le serveur en accepte. */
function piecePaths(body: Body) {
  const read = (value: unknown) => {
    const path = clean(value, 160);
    return PIECE_PATH.test(path) ? path : null;
  };
  return { cdc: read(body.pieceCdcPath), bordereau: read(body.pieceBordereauPath) };
}

/**
 * Un lien signé, d'une heure pour la boîte, d'une semaine pour un e-mail : le
 * bucket est privé, c'est la seule façon d'ouvrir une pièce.
 */
async function signedPieceUrl(
  admin: ReturnType<typeof createClient>,
  path: string | null | undefined,
  seconds: number,
) {
  if (!path) return '';
  try {
    const { data, error } = await admin.storage
      .from(PIECES_BUCKET)
      .createSignedUrl(path, seconds);
    if (error || !data?.signedUrl) return '';
    return data.signedUrl;
  } catch {
    return '';
  }
}

/**
 * Une pièce du dossier, avec son genre : le nom français sert à l'alerte de
 * l'atelier, la langue du reçu lui donne le sien. Le lien ne change pas.
 */
type PieceLink = {
  kind: 'cdc' | 'bordereau';
  label: string;
  url: string;
  path: string;
};

/**
 * Les pièces d'un dossier, nommées et ouvertes : les deux documents du guichet,
 * chacun avec son lien. Un chemin qui n'ouvre rien est simplement omis, plutôt
 * que d'envoyer un lien mort.
 */
async function pieceLinks(
  admin: ReturnType<typeof createClient>,
  cdc: string | null,
  bordereau: string | null,
  seconds: number,
): Promise<PieceLink[]> {
  const out: PieceLink[] = [];
  if (cdc) {
    const url = await signedPieceUrl(admin, cdc, seconds);
    if (url) out.push({ kind: 'cdc', label: 'Cahier des charges', url, path: cdc });
  }
  if (bordereau) {
    const url = await signedPieceUrl(admin, bordereau, seconds);
    if (url) out.push({ kind: 'bordereau', label: 'Bordereau des prix', url, path: bordereau });
  }
  return out;
}

/**
 * Les liens de la boîte, faits en un seul appel pour tous les dossiers lus :
 * deux cents demandes ne doivent pas coûter quatre cents signatures.
 */
async function attachPieceLinks(
  admin: ReturnType<typeof createClient>,
  rows: unknown[],
): Promise<unknown[]> {
  const list = (rows ?? []) as Array<Record<string, unknown>>;
  if (list.length === 0) return list;
  const paths = Array.from(
    new Set(
      list
        .flatMap((row) => [row.piece_cdc_path, row.piece_bordereau_path])
        .filter((path): path is string => typeof path === 'string' && path.length > 0),
    ),
  );
  if (paths.length === 0) return list;
  const links = new Map<string, string>();
  try {
    const { data, error } = await admin.storage
      .from(PIECES_BUCKET)
      .createSignedUrls(paths, 3600);
    if (!error && data) {
      (data as Array<{ path: string | null; signedUrl: string | null }>).forEach((entry) => {
        if (entry.path && entry.signedUrl) links.set(entry.path, entry.signedUrl);
      });
    }
  } catch {
    /* Un stockage qui tousse ne doit pas fermer la boîte : la fiche se lit
       sans ses pièces, elle ne disparaît pas. */
  }
  return list.map((row) => ({
    ...row,
    piece_cdc_url:
      typeof row.piece_cdc_path === 'string' ? links.get(row.piece_cdc_path) ?? null : null,
    piece_bordereau_url:
      typeof row.piece_bordereau_path === 'string'
        ? links.get(row.piece_bordereau_path) ?? null
        : null,
  }));
}

/* The closing reasons are stored as keys, never as labels: the workshop can
   switch language without losing the reason it saved as its default. */
const MOTIFS = new Set(['devis', 'client', 'hors', 'delai', 'sansSuite']);

/** The monthly objective is a whole percentage, and nothing else. */
function readObjectif(value: unknown): number | null {
  const num = Number(value);
  if (value === null || value === undefined || !Number.isFinite(num)) return null;
  if (num < 1 || num > 100) return null;
  return Math.round(num);
}

/**
 * The workshop wait threshold: whole days a month may make people wait on
 * average before it is flagged. Null means « use the default week ».
 */
function readWaitGoal(value: unknown): number | null {
  const num = Number(value);
  if (value === null || value === undefined || !Number.isFinite(num)) return null;
  if (num < 1 || num > 90) return null;
  return Math.round(num);
}

/** The threshold that applies when the workshop set none: one week. */
const DEFAULT_WAIT_GOAL_DAYS = 7;

/** Same threshold as the reminder sweep: the two must never disagree. */
const LATE_HOURS = 48;

/** The second threshold: past a whole week, a wait becomes an urgency. */
const WEEK_HOURS = 7 * 24;

type Body = Record<string, unknown>;

function reference() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${`${now.getMonth() + 1}`.padStart(2, '0')}`;
  const tail = Math.floor(1000 + Math.random() * 9000);
  return `B2B-${stamp}-${tail}`;
}

type NewRow = { dest_id: string; dest_name: string } & Record<string, unknown>;

type Requester = {
  nom: string;
  email: string;
  telephone: string;
  organisme: string;
  quantite: string;
  delai: string;
  budget: string;
  message: string;
  /** « tirage » for a large run, « marche » for a public tender. */
  nature: string;
  /** La langue du visiteur : le reçu part dans cette langue. */
  lang: Lang;
  /** Les deux PDF déposés, nommés par leur chemin dans le bucket privé. */
  pieceCdc: string | null;
  pieceBordereau: string | null;
};

/** The two usages of the same counter: only the wording of the mail differs. */
const isTender = (who: Requester) => who.nature === 'marche';

/**
 * Prevents an e-mail problem from failing the request itself.
 */
async function notifyWorkshops(
  admin: ReturnType<typeof createClient>,
  ref: string,
  rows: NewRow[],
  who: Requester,
  pieces: Array<{ label: string; url: string }> = [],
): Promise<number> {
  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail) return 0;

  const destIds = Array.from(new Set(rows.map((row) => row.dest_id))).filter(Boolean);
  if (destIds.length === 0) return 0;

  const { data: comptes, error } = await admin
    .from('paperatlas_comptes')
    .select('email, entreprise_id, b2b_alertes_email')
    .in('entreprise_id', destIds);
  if (error || !comptes) return 0;

  /* A workshop that switched the alerts off still receives the request in its
     inbox — it simply does not get the mail. */
  const inbox = new Map<string, string>();
  (
    comptes as Array<{
      email: string | null;
      entreprise_id: string | null;
      b2b_alertes_email: boolean | null;
    }>
  ).forEach((compte) => {
    const key = (compte.entreprise_id ?? '').trim();
    const mail = (compte.email ?? '').trim();
    if (compte.b2b_alertes_email === false) return;
    if (key && mail && !inbox.has(key)) inbox.set(key, mail);
  });
  if (inbox.size === 0) return 0;

  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  const accountLink = site ? `${site}/compte#demandes-b2b` : '';

  const tender = isTender(who);

  const facts: Array<[string, string]> = [
    ['Nature', tender ? 'Marché public' : ''],
    ['Demandeur', who.organisme ? `${who.nom} · ${who.organisme}` : who.nom],
    ['E-mail', who.email],
    ['Téléphone', who.telephone],
    [tender ? 'Lot / volume' : 'Quantité', who.quantite],
    [tender ? 'Date limite de remise' : 'Délai', who.delai],
    [tender ? 'Montant estimé' : 'Budget', who.budget],
    [pieces.length > 0 ? 'Pièces jointes' : '', pieces.map((item) => item.label).join(' · ')],
  ].filter((entry) => Boolean(entry[1])) as Array<[string, string]>;

  const buildHtml = (destName: string) => `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">Bonjour,</p>
    <p style="margin:0 0 16px">${tender ? 'Un nouvel appel d’offres public vient d’arriver pour' : 'Une nouvelle demande B2B vient d’arriver pour'}
      <strong>${escapeHtml(destName)}</strong> sur PaperAtlas.</p>
    <p style="margin:0 0 16px">Référence <strong>${escapeHtml(ref)}</strong></p>
    <table style="border-collapse:collapse;margin:0 0 16px">
      ${facts
        .map(
          ([label, value]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#8a7f6f">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('\n')}
    </table>
    ${
      pieces.length > 0
        ? `<p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">Les pièces du dossier</p>
          <ul style="margin:0 0 20px;padding-inline-start:18px">
            ${pieces
              .map(
                (item) =>
                  `<li style="margin:0 0 4px"><a href="${escapeHtml(item.url)}" style="color:#b8621c">${escapeHtml(item.label)}</a> <span style="color:#8a7f6f;font-size:12px">(PDF)</span></li>`,
              )
              .join('\n')}
          </ul>`
        : ''
    }
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${tender ? 'Le dossier du marché' : 'Le besoin'}</p>
    <blockquote style="margin:0 0 20px;padding:10px 14px;border-left:3px solid #e8822f;background:#f7f1e6">
      ${escapeHtml(who.message).replace(/\n/g, '<br />')}</blockquote>
    ${
      accountLink
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            Répondre dans mon espace compte</a></p>`
        : `<p style="margin:0 0 16px">Répondez depuis votre espace compte, rubrique « Demandes B2B reçues ».</p>`
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">PaperAtlas · vous recevez cet e-mail parce qu’une demande B2B
      a été adressée à l’une de vos annonces.</p>
  </div>`;

  const buildText = (destName: string) =>
    [
      `${tender ? 'Nouvel appel d’offres public' : 'Nouvelle demande B2B'} pour ${destName} (référence ${ref}).`,
      `${who.nom}${who.organisme ? ` · ${who.organisme}` : ''}`,
      `E-mail : ${who.email}`,
      who.telephone ? `Téléphone : ${who.telephone}` : '',
      who.quantite ? `${tender ? 'Lot / volume' : 'Quantité'} : ${who.quantite}` : '',
      who.delai ? `${tender ? 'Date limite de remise' : 'Délai'} : ${who.delai}` : '',
      who.budget ? `${tender ? 'Montant estimé' : 'Budget'} : ${who.budget}` : '',
      pieces.length > 0 ? `Pièces jointes : ${pieces.map((item) => item.label).join(' · ')}` : '',
      ...pieces.map((item) => `- ${item.label} (PDF) : ${item.url}`),
      '',
      who.message,
      accountLink ? `Répondre : ${accountLink}` : '',
    ]
      .filter(Boolean)
      .join('\n');

  const sends = rows
    .filter((row) => inbox.has(row.dest_id))
    .map(async (row) => {
      const to = inbox.get(row.dest_id) as string;
      const destName = String(row.dest_name ?? 'votre atelier');
      const res = await sendMailMessage({
        to,
        replyTo: who.email || undefined,
        subject: `${tender ? 'Nouveau marché public' : 'Nouvelle demande B2B'} · ${destName} · ${ref}`,
        html: buildHtml(destName),
        text: buildText(destName),
      });
      return res.ok;
    });

  const settled = await Promise.allSettled(sends);
  return settled.filter((entry) => entry.status === 'fulfilled' && entry.value).length;
}

/**
 * The receipt copy, in the three languages of the site. The workshop alert
 * keeps the house wording; this one follows the visitor, because it is his
 * message and he must be able to read it without translating.
 */
type ReceiptCopy = {
  hello: string;
  subjectTender: string;
  subjectRequest: string;
  startTender: string;
  startRequest: string;
  keep: string;
  docWordTender: string;
  docWordRequest: string;
  workshops: string;
  nature: string;
  tender: string;
  lot: string;
  quantity: string;
  deadline: string;
  delay: string;
  amount: string;
  budget: string;
  attachments: string;
  /** Le nom de chaque pièce, dans la langue du reçu. */
  pieceCdc: string;
  pieceBordereau: string;
  docTender: string;
  docRequest: string;
  reply: string;
  replyTender: string;
  cta: string;
  footer: string;
  /** Le mot qui précède la référence, dans la version texte brut. */
  refLabel: string;
};

const RECEIPT: Record<Lang, ReceiptCopy> = {
  fr: {
    hello: 'Bonjour',
    /* L'objet ne répète plus la première ligne : un téléphone les montre
       l'une sous l'autre, et la même phrase s'y lisait deux fois de suite.
       Il reste court — une quarantaine de signes — pour que la référence,
       qui est justement ce qu'on veut garder, ne sorte pas de la vue. */
    subjectTender: 'Marché public déposé',
    subjectRequest: 'Demande B2B envoyée',
    /* L'objet dit le dépôt, le corps dit la réception : deux voix, un seul
       acte. « a bien été reçu » remplace « a bien été déposé », pour que
       l'objet et le corps du marché ne nomment plus deux choses différentes. */
    startTender: 'Votre dossier de marché public a bien été reçu',
    startRequest: 'Nous avons bien reçu votre demande B2B',
    /* Plus de deux-points qui tend la main à la référence : la ligne suivante
       la porte déjà. « échanges » traduisait « exchanges » mot à mot. */
    keep: 'Conservez cette référence, elle identifie votre {what} dans toutes nos correspondances.',
    docWordTender: 'dossier',
    docWordRequest: 'demande',
    workshops: 'Ateliers sollicités',
    /* Un mot seul ne dit rien dans un tableau à deux colonnes sur téléphone. */
    nature: 'Type de demande',
    tender: 'Marché public',
    /* « volume » se lisait comme un volume d'impression, pas comme un lot. */
    lot: 'Lot / quantité',
    quantity: 'Quantité',
    deadline: 'Date limite de remise',
    delay: 'Délai',
    amount: 'Montant estimé',
    budget: 'Budget',
    /* Seul libellé au possessif : en capitales espacées, il se coupait sur
       deux lignes. */
    attachments: 'Pièces jointes',
    pieceCdc: 'Cahier des charges',
    pieceBordereau: 'Bordereau des prix',
    docTender: 'Le dossier déposé',
    docRequest: 'Votre message',
    reply:
      'Chaque atelier vous répond directement, par e-mail ou par téléphone, généralement sous 48 h ouvrées',
    /* « avis » seul restait vague, et le tiret ouvrait une ligne repliée. */
    replyTender:
      ' — la date limite annoncée dans l’avis de marché reste celle qui compte',
    /* Le message vouvoie partout (« Conservez », « votre dossier ») : le
       bouton ne passe plus au « mes ». */
    cta: 'Suivre vos demandes',
    refLabel: 'Référence',
    /* On ne dépose pas « avec » une adresse : quatre lignes de gris 12 px
       sur téléphone, autant les écrire juste. */
    footer:
      'PaperAtlas · vous recevez cet e-mail parce qu’une demande a été envoyée depuis cette adresse. Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.',
  },
  ar: {
    hello: 'مرحبًا',
    subjectTender: 'تم تسجيل إيداع صفقتك العمومية',
    subjectRequest: 'تم إرسال طلب B2B الخاص بك',
    startTender: 'تم استلام ملف الصفقة العمومية الخاص بك',
    startRequest: 'تم إرسال طلب B2B الخاص بك بنجاح',
    keep: 'احفظ هذا المرجع، فهو يعرّف {what} في جميع مراسلاتنا:',
    docWordTender: 'ملفك',
    docWordRequest: 'طلبك',
    workshops: 'الورشات المخاطَبة',
    nature: 'نوع الطلب',
    tender: 'صفقة عمومية',
    lot: 'الحصة (الكمية)',
    quantity: 'الكمية',
    deadline: 'آخر أجل لإيداع العروض',
    delay: 'المهلة',
    amount: 'المبلغ التقديري',
    budget: 'الميزانية',
    attachments: 'مرفقاتك',
    pieceCdc: 'دفتر الشروط',
    pieceBordereau: 'جدول الأسعار',
    docTender: 'الملف الذي أودعته',
    docRequest: 'رسالتك',
    reply: 'تردّ عليك كل ورشة مباشرة، بالبريد أو بالهاتف، عادةً خلال ٤٨ ساعة عمل',
    replyTender: ' — تذكّر آخر أجل لإيداع العروض المذكور في الإعلان',
    cta: 'متابعة طلباتي',
    refLabel: 'المرجع',
    footer:
      'تصلك هذه الرسالة لأن طلب B2B أُودع بهذا العنوان. إن لم تكن أنت مصدر هذا الطلب، تجاهل هذه الرسالة. · PaperAtlas',
  },
  en: {
    hello: 'Hello',
    /* L'objet et la première ligne ne disent plus la même phrase deux fois de
       suite, et le marché parle du même verbe que le corps du message. */
    subjectTender: 'Your tender submission has been received',
    subjectRequest: 'Your B2B request has been sent',
    startTender: 'Your public tender file has been received',
    startRequest: 'We have received your B2B request',
    /* Plus de deux-points qui tend la main à la référence : la ligne suivante
       la porte déjà. */
    keep: 'Keep this reference: it identifies your {what} in all our correspondence.',
    docWordTender: 'file',
    docWordRequest: 'request',
    workshops: 'Workshops contacted',
    /* Un mot seul ne dit rien sur téléphone ; le libellé nomme enfin l'objet
       du tableau. */
    nature: 'Request type',
    tender: 'Public tender',
    /* « volume » se lisait comme un volume d'impression, pas comme un lot. */
    lot: 'Lot / quantity',
    quantity: 'Quantity',
    deadline: 'Submission deadline',
    /* Un tirage a un délai d'exécution, pas une date limite ; la colonne du
       marché garde « Submission deadline ». */
    delay: 'Turnaround',
    amount: 'Estimated amount',
    budget: 'Budget',
    /* Seul libellé au possessif : en capitales espacées, il se coupait sur
       deux lignes. */
    attachments: 'Attachments',
    pieceCdc: 'Terms of reference',
    pieceBordereau: 'Price schedule',
    docTender: 'The file you submitted',
    docRequest: 'Your message',
    reply:
      'Each workshop answers you directly, by e-mail or phone, usually within 48 working hours',
    /* « notice » seul restait vague, et le tiret ouvrait une ligne repliée. */
    replyTender: ' — the deadline stated in the contract notice still applies',
    cta: 'Follow my requests',
    refLabel: 'Reference',
    /* « filed » est du jargon de greffe, et la phrase disait que la demande
       avait été déposée « avec » cette adresse. */
    footer:
      'PaperAtlas · you receive this email because a B2B request was sent from this address. If you did not send it, simply ignore this message.',
  },
};

/**
 * Receipt: the requester gets the reference straight away, in his own inbox.
 * Same rule as the workshop alert — a mail problem never fails the request.
 */
async function confirmRequester(
  ref: string,
  rows: NewRow[],
  who: Requester,
  pieces: Array<{ kind?: string; label: string; url: string }> = [],
): Promise<boolean> {
  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail || !who.email) return false;

  const workshops = rows.map((row) => String(row.dest_name ?? '')).filter(Boolean);
  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  const accountLink = site ? `${site}/compte#demandes-b2b` : '';

  const tender = isTender(who);
  /* The receipt leaves in the language the visitor used, never the workshop's:
     it is his own message coming back to him. */
  const copy = RECEIPT[LANG_OF(who.lang)];

  /* Le nom d'une pièce est celui de la langue du reçu : « Cahier des charges »
     n'a pas sa place au milieu d'un message arabe. Le genre du document voyage
     avec le lien ; l'alerte de l'atelier, elle, garde le mot de la maison. */
  const pieceLabel = (item: { kind?: string; label: string }) =>
    item.kind === 'bordereau'
      ? copy.pieceBordereau
      : item.kind === 'cdc'
        ? copy.pieceCdc
        : item.label;

  const recap: Array<[string, string]> = [
    [copy.nature, tender ? copy.tender : ''],
    [tender ? copy.lot : copy.quantity, who.quantite],
    [tender ? copy.deadline : copy.delay, who.delai],
    [tender ? copy.amount : copy.budget, who.budget],
  ].filter((entry) => Boolean(entry[1])) as Array<[string, string]>;

  /* What the reference identifies: a file or a request, said in the same
     sentence, so the wording never falls back on a half-translated phrase. */
  const docWord = tender ? copy.docWordTender : copy.docWordRequest;

  /* L'arabe se met en page de droite à gauche : le message annonce son sens de
     lecture, sa police est arabophone, et l'interlettrage prévu pour les
     capitales latines disparaît — il écarte les lettres arabes jusqu'à casser
     le tracé continu. Sans le sens de lecture, la barre de citation reste à
     gauche, les libellés du tableau sont rembourrés du mauvais côté, et le
     point final tombe du côté opposé à la phrase. */
  const rtl = LANG_OF(who.lang) === 'ar';
  const font = rtl
    ? "'Segoe UI',Tahoma,'Noto Naskh Arabic','Geeza Pro','Traditional Arabic',Arial,sans-serif"
    : 'Helvetica,Arial,sans-serif';
  const labelStyle = rtl
    ? 'font-weight:600;'
    : 'letter-spacing:.08em;text-transform:uppercase;';
  const cellStyle = rtl
    ? 'padding:2px 0 2px 14px;color:#8a7f6f'
    : 'padding:2px 14px 2px 0;color:#8a7f6f';
  const quoteStyle = rtl
    ? 'border-right:3px solid #e8822f;background:#f7f1e6'
    : 'border-left:3px solid #e8822f;background:#f7f1e6';
  /* La virgule qui suit le prénom est celle de la langue, pas celle du clavier. */
  const comma = rtl ? '،' : ',';
  /* L'espace qui précède le deux-points est française : l'anglais ne la
     connaît pas, et rien ne la corrige dans la version texte. */
  const sep = LANG_OF(who.lang) === 'en' ? ': ' : ' : ';
  /* La teinte d'accent du site, portée par le lien de chaque pièce. */
  const ACCENT = '#b8621c';
  /* Une adresse longue ne doit pas élargir le tableau au-delà de l'écran : la
     cellule coupe le mot au lieu de pousser la colonne. */
  const valueStyle = 'word-break:break-word;overflow-wrap:anywhere;';

  const html = `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:${font};font-size:14px;line-height:${
    rtl ? '1.8' : '1.6'
  };color:#211d18;text-align:${rtl ? 'right' : 'left'}">
    <p style="margin:0 0 16px">${escapeHtml(copy.hello)}${who.nom ? ` ${escapeHtml(who.nom)}` : ''}${comma}</p>
    <p style="margin:0 0 16px">${escapeHtml(tender ? copy.startTender : copy.startRequest)}.
      ${escapeHtml(copy.keep.replace('{what}', docWord))}</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;${
      rtl ? '' : 'letter-spacing:.04em;'
    }color:#b8621c">${escapeHtml(ref)}</p>
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;${labelStyle}">${escapeHtml(copy.workshops)}</p>
    <ul style="margin:0 0 20px;padding-inline-start:18px">
      ${workshops.map((name) => `<li>${escapeHtml(name)}</li>`).join('\n')}
    </ul>
    ${
      recap.length
        ? `<table style="border-collapse:collapse;margin:0 0 20px;width:100%;max-width:520px">
            ${recap
              .map(
                ([label, value]) =>
                  `<tr><td style="${cellStyle}">${escapeHtml(label)}</td><td style="${valueStyle}">${escapeHtml(value)}</td></tr>`,
              )
              .join('\n')}
          </table>`
        : ''
    }
    ${
      pieces.length > 0
        ? `<p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;${labelStyle}">${escapeHtml(copy.attachments)}</p>
          <ul style="margin:0 0 20px;padding-inline-start:18px">
            ${pieces
              .map(
                (item) =>
                  `<li style="margin:0 0 4px"><a href="${escapeHtml(item.url)}" style="color:${ACCENT}">${escapeHtml(pieceLabel(item))}</a> <span style="color:#8a7f6f;font-size:12px">(PDF)</span></li>`,
              )
              .join('\n')}
          </ul>`
        : ''
    }
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;${labelStyle}">${escapeHtml(tender ? copy.docTender : copy.docRequest)}</p>
    <blockquote style="margin:0 0 20px;padding:10px 14px;${quoteStyle}">
      ${escapeHtml(who.message).replace(/\n/g, '<br />')}</blockquote>
    <p style="margin:0 0 16px">${escapeHtml(
      tender ? `${copy.reply}${copy.replyTender}` : copy.reply,
    )}.</p>
    ${
      accountLink
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            ${escapeHtml(copy.cta)}</a></p>`
        : ''
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}</p>
  </div>`;

  const text = [
    `${copy.hello}${who.nom ? ` ${who.nom}` : ''}${comma}`,
    '',
    `${tender ? copy.startTender : copy.startRequest}.`,
    `${copy.keep.replace('{what}', docWord)}`,
    `${copy.refLabel}${sep}${ref}`,
    '',
    `${copy.workshops} :`,
    ...workshops.map((name) => `- ${name}`),
    '',
    ...recap.map(([label, value]) => `${label}${sep}${value}`),
    '',
    ...(pieces.length > 0
      ? [
          `${copy.attachments} :`,
          ...pieces.map((item) => `- ${pieceLabel(item)} (PDF)${sep}${item.url}`),
          '',
        ]
      : []),
    `${tender ? copy.docTender : copy.docRequest} :`,
    who.message,
    '',
    `${tender ? `${copy.reply}${copy.replyTender}` : copy.reply}.`,
    accountLink ? `${copy.cta}${sep}${accountLink}` : '',
  ]
    .filter((line) => line !== '')
    .join('\n');

  const res = await sendMailMessage({
    to: who.email,
    subject: `${tender ? copy.subjectTender : copy.subjectRequest} · ${ref}`,
    html,
    text,
  });
  return res.ok;
}

/**
 * Public: a visitor posts a B2B request to one or more workshops.
 * When the visitor happens to be signed in, the request is also attached to the
 * account so it shows up in the « sent » tab.
 */
async function submit(body: Body, userId: string | null) {
  const nom = clean(body.nom, 120);
  const email = clean(body.email, 160);
  const message = clean(body.message, 500);
  const targets = Array.isArray(body.targets) ? body.targets : [];
  /* The same counter serves a large run and a public tender. The nature travels
     with the row, so the workshop inbox can tell the two apart at a glance. */
  const nature = clean(body.nature, 20) === 'marche' ? 'marche' : 'tirage';
  /* Les deux pièces du dossier, déjà déposées dans le bucket privé par leur
     place signée. Un chemin qui ne ressemble pas à une place refusée par ce
     serveur est simplement ignoré : la demande part, sans la pièce. */
  const pieces = piecePaths(body);

  if (!nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return json({ error: 'invalid' }, 400);
  }
  if (targets.length === 0) return json({ error: 'no-target' }, 400);
  if (targets.length > 6) return json({ error: 'too-many' }, 400);

  const ref = reference();
  const rows: NewRow[] = targets
    .map((entry) => {
      const item = (entry ?? {}) as Body;
      return { id: clean(item.id, 80), name: clean(item.name, 160) };
    })
    .filter((item) => item.id && item.name)
    .map((item) => ({
      reference: ref,
      dest_id: item.id,
      dest_name: item.name,
      user_id: userId,
      nom,
      email,
      telephone: clean(body.telephone, 40) || null,
      organisme: clean(body.organisme, 160) || null,
      quantite: clean(body.quantite, 120) || null,
      delai: clean(body.delai, 120) || null,
      budget: clean(body.budget, 120) || null,
      message,
      nature,
      /* Un tirage n'a pas de pièces : les colonnes restent vides plutôt que de
         porter un document que personne n'a demandé à déposer. */
      piece_cdc_path: nature === 'marche' ? pieces.cdc : null,
      piece_bordereau_path: nature === 'marche' ? pieces.bordereau : null,
      statut: 'nouvelle',
    }));

  if (rows.length === 0) return json({ error: 'no-target' }, 400);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { error } = await admin.from('paperatlas_demandes_b2b').insert(rows);
  if (error) return json({ error: 'insert', detail: error.message }, 500);

  /* The inbox is already served, so a mail problem never fails the request. */
  const who: Requester = {
    nom,
    email,
    telephone: clean(body.telephone, 40),
    organisme: clean(body.organisme, 160),
    quantite: clean(body.quantite, 120),
    delai: clean(body.delai, 120),
    budget: clean(body.budget, 120),
    message,
    nature,
    lang: LANG_OF(body.lang),
    pieceCdc: nature === 'marche' ? pieces.cdc : null,
    pieceBordereau: nature === 'marche' ? pieces.bordereau : null,
  };

  /* Les pièces sont ouvertes aux deux bouts : une semaine dans les e-mails,
     le temps que l'atelier et le demandeur les ouvrent. */
  let links: PieceLink[] = [];
  try {
    links = await pieceLinks(admin, who.pieceCdc, who.pieceBordereau, 7 * 24 * 3600);
  } catch {
    links = [];
  }

  let notified = 0;
  let confirmed = false;
  try {
    notified = await notifyWorkshops(admin, ref, rows, who, links);
  } catch {
    notified = 0;
  }
  try {
    confirmed = await confirmRequester(ref, rows, who, links);
  } catch {
    confirmed = false;
  }

  return json({
    ok: true,
    reference: ref,
    count: rows.length,
    notified,
    confirmed,
    /* Combien de pièces ont vraiment été jointes : le formulaire peut alors le
       dire au déposant au lieu de le laisser deviner. */
    pieces: links.length,
  });
}

/** Reads the caller identity from the Authorization header, never from the body. */
async function callerId(req: Request) {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await authClient.auth.getUser(token);
  if (error) return null;
  return data?.user?.id ?? null;
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

  const action = clean(body.action, 40) || 'submit';

  try {
    if (action === 'submit') {
      return await submit(body, await callerId(req));
    }

    /* Place de dépôt d'une pièce : ouverte comme le dépôt d'un dossier — un
       acheteur public n'a pas de compte — mais fermée à tout le reste. Le
       serveur choisit le chemin, et le jeton ne vaut que pour ce seul fichier,
       une seule fois. Aucune lecture n'est ouverte sur le bucket. */
    if (action === 'pieceSlot') {
      const kind = clean(body.kind, 20) === 'bordereau' ? 'bordereau' : 'cdc';
      const salt = Array.from(crypto.getRandomValues(new Uint8Array(6)))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
      const path = `dossiers/${Date.now()}-${kind}-${salt}.pdf`;
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data, error } = await admin.storage
        .from(PIECES_BUCKET)
        .createSignedUploadUrl(path, { upsert: false });
      if (error || !data?.token) return json({ error: 'slot' }, 500);
      return json({
        ok: true,
        path: data.path ?? path,
        token: data.token,
        max: PIECE_MAX_BYTES,
      });
    }

    /* Everything below belongs to a signed-in member. */
    const userId = await callerId(req);
    if (!userId) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    if (action === 'list') {
      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select(
          'entreprise_id, b2b_alertes_email, b2b_motif_defaut, b2b_objectif_motif, b2b_wait_goal_days',
        )
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      const alertesEmail = (compte?.b2b_alertes_email as boolean | null) ?? true;
      const rawMotif = (compte?.b2b_motif_defaut as string | null) ?? null;
      const motifDefaut = rawMotif && MOTIFS.has(rawMotif) ? rawMotif : null;
      const objectif = readObjectif(compte?.b2b_objectif_motif);
      /* The wait threshold lives next to the target: the strip, the table and
         the export all read this one number, so they cannot diverge. */
      const waitGoalDays =
        readWaitGoal(
          (compte as { b2b_wait_goal_days: number | null } | null)?.b2b_wait_goal_days,
        ) ?? DEFAULT_WAIT_GOAL_DAYS;

      let received: unknown[] = [];
      if (entrepriseId) {
        const { data, error } = await admin
          .from('paperatlas_demandes_b2b')
          .select('*')
          .eq('dest_id', entrepriseId)
          .order('created_at', { ascending: false })
          .limit(200);
        if (error) throw error;
        received = data ?? [];
      }

      const { data: sent, error: sentError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(200);
      if (sentError) throw sentError;

      /* Les deux pièces de chaque dossier, ouvertes pour cette lecture seule :
         un lien d'une heure, refait à chaque ouverture de la boîte. */
      const receivedWithPieces = await attachPieceLinks(admin, received);
      const sentWithPieces = await attachPieceLinks(admin, sent ?? []);

      /* The target is history, not a single value: an old month must be read
         against the threshold that was in force back then. Oldest first, so the
         site can walk the months in order. */
      const { data: historyRows, error: historyError } = await admin
        .from('paperatlas_b2b_objectif_historique')
        .select('objectif, changed_at')
        .eq('compte_id', userId)
        .order('changed_at', { ascending: true })
        .limit(120);
      if (historyError) throw historyError;
      const objectifHistory = (
        (historyRows ?? []) as Array<{ objectif: number | null; changed_at: string }>
      ).map((entry) => ({ objectif: readObjectif(entry.objectif), changed_at: entry.changed_at }));

      return json({
        ok: true,
        entrepriseId,
        alertesEmail,
        motifDefaut,
        objectif,
        objectifHistory,
        waitGoalDays,
        received: receivedWithPieces,
        sent: sentWithPieces,
      });
    }

    if (action === 'statut') {
      const id = clean(body.id, 60);
      const statut = clean(body.statut, 20);
      if (!id || !STATUTS.has(statut)) return json({ error: 'invalid' }, 400);

      const { data: compte } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      /* The reason is the workshop own trace: it only makes sense on a handled
         request, and reopening clears it so the record never lies. */
      const motif = statut === 'traitee' ? clean(body.motif, 200) || null : null;
      const now = new Date().toISOString();

      /* A close or a reopen gives the trace now: any earlier erasure of a bulk
         catch-up is settled, so the counters never read a correction twice. */
      const { error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({
          statut,
          motif,
          motif_lot_at: null,
          motif_lot_cleared: null,
          motif_lot_clear_at: null,
          updated_at: now,
        })
        .eq('id', id)
        .eq('dest_id', entrepriseId);
      if (error) throw error;

      if (statut === 'traitee') {
        /* Stamp the first handling only: editing the reason later must not
           shift the average response time the workshop is measured on. */
        const { error: stampError } = await admin
          .from('paperatlas_demandes_b2b')
          .update({ traitee_at: now })
          .eq('id', id)
          .eq('dest_id', entrepriseId)
          .is('traitee_at', null);
        if (stampError) throw stampError;
      } else {
        const { error: clearError } = await admin
          .from('paperatlas_demandes_b2b')
          .update({ traitee_at: null })
          .eq('id', id)
          .eq('dest_id', entrepriseId);
        if (clearError) throw clearError;
      }

      return json({ ok: true, motif });
    }

    /* Opening a batch puts it to « vue »: reading is a fact, not a guess.
       Only the rows still « nouvelle » and owned by this workshop move. */
    if (action === 'vues') {
      const ids = Array.isArray(body.ids)
        ? (body.ids as unknown[]).map((id) => clean(id, 60)).filter(Boolean).slice(0, 200)
        : [];
      if (ids.length === 0) return json({ ok: true, ids: [] });

      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      const { data: done, error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({ statut: 'vue', updated_at: new Date().toISOString() })
        .eq('dest_id', entrepriseId)
        .eq('statut', 'nouvelle')
        .in('id', ids)
        .select('id');
      if (error) throw error;

      const moved = ((done ?? []) as Array<{ id: string }>).map((row) => row.id);
      return json({ ok: true, ids: moved });
    }

    /* One click empties the badge: everything not yet handled becomes handled. */
    if (action === 'traiterTout') {
      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      const now = new Date().toISOString();
      const { data: done, error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({ statut: 'traitee', traitee_at: now, updated_at: now })
        .eq('dest_id', entrepriseId)
        .neq('statut', 'traitee')
        .select('id');
      if (error) throw error;

      return json({ ok: true, count: (done ?? []).length });
    }

    /* Puts a request aside until a chosen date: it stops counting as late and
       stops being chased, then comes back on its own. `until` null clears it. */
    if (action === 'snooze') {
      const id = clean(body.id, 60);
      if (!id) return json({ error: 'invalid' }, 400);

      const raw = clean(body.until, 40);
      let until: string | null = null;
      if (raw) {
        const day = new Date(`${raw.slice(0, 10)}T23:59:59`);
        if (Number.isNaN(day.getTime())) return json({ error: 'invalid' }, 400);
        until = day.toISOString();
      }

      const { data: compte } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      const { error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({ snooze_at: until, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('dest_id', entrepriseId);
      if (error) throw error;

      return json({ ok: true, snooze_at: until });
    }

    /* Lightweight pulse for the header badge and the account summary: how many
       requests still wait, and how many have been waiting for over 48 h. */
    if (action === 'count') {
      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id, b2b_objectif_motif, b2b_wait_goal_days')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      const objectif = readObjectif(compte?.b2b_objectif_motif);
      /* The workshop threshold, read once: the counter below and the strip that
         shows it must speak of the same number of days. */
      const waitGoalDays =
        readWaitGoal(
          (compte as { b2b_wait_goal_days: number | null } | null)?.b2b_wait_goal_days,
        ) ?? DEFAULT_WAIT_GOAL_DAYS;
      if (!entrepriseId) {
        return json({
          ok: true,
          todo: 0,
          late: 0,
          veryLate: 0,
          lateWeeks: 0,
          lateOldest: null,
          lateOldestRef: null,
          lateOldestId: null,
          never: 0,
          neverOldestRef: null,
          objectif,
          waitGoalDays,
          entrepriseId: null,
        });
      }

      const { data: open, error } = await admin
        .from('paperatlas_demandes_b2b')
        .select('id, reference, statut, created_at, snooze_at, rappel_at')
        .eq('dest_id', entrepriseId)
        .in('statut', ['nouvelle', 'vue'])
        .limit(500);
      if (error) throw error;

      const now = Date.now();
      const rows = (open ?? []) as Array<{
        id: string;
        reference: string;
        statut: string;
        created_at: string;
        snooze_at: string | null;
        rappel_at: string | null;
      }>;
      const todo = rows.filter((row) => row.statut === 'nouvelle').length;
      const lateRows = rows.filter((row) => {
        const age = now - new Date(row.created_at).getTime();
        if (!Number.isFinite(age) || age < LATE_HOURS * 3600 * 1000) return false;
        if (!row.snooze_at) return true;
        return new Date(row.snooze_at).getTime() <= now;
      });
      const late = lateRows.length;
      /* The misses of the shortcut, on the very same rows: still « nouvelle »
         although the reminder has already been through their wait — a reminder
         was sent, or the wait is past 48 h. Deliberately narrower than « à
         traiter », which also holds the fresh arrivals; this is the reminder's
         own miss, counted whole so the strip and the chip agree. */
      const neverRows = rows.filter((row) => {
        if (row.statut !== 'nouvelle') return false;
        if (row.rappel_at) return true;
        const age = now - new Date(row.created_at).getTime();
        if (!Number.isFinite(age) || age < LATE_HOURS * 3600 * 1000) return false;
        if (!row.snooze_at) return true;
        return new Date(row.snooze_at).getTime() <= now;
      });
      const never = neverRows.length;
      /* The oldest of those misses, named: under the count the strip shows a
         face, and a door — that one request can be opened on its own. Read on
         the very rows the count rests on, so the figure and its reference can
         never describe two different requests. */
      const oldestNever = neverRows.reduce<(typeof neverRows)[number] | null>(
        (oldest, row) => {
          const at = new Date(row.created_at).getTime();
          if (!Number.isFinite(at)) return oldest;
          if (!oldest) return row;
          const kept = new Date(oldest.created_at).getTime();
          return at < kept ? row : oldest;
        },
        null,
      );
      const neverOldestRef = oldestNever?.reference ?? null;
      /* Counted on exactly the same rows as the 48 h delay: a second threshold,
         never a second source. Past a week the reminder stops saying « waiting »
         and starts saying « urgent » — the number alone could not tell them
         apart. */
      const veryLate = lateRows.filter((row) => {
        const age = now - new Date(row.created_at).getTime();
        return Number.isFinite(age) && age >= WEEK_HOURS * 3600 * 1000;
      }).length;
      /* Every open wait added up, in whole weeks: three requests sleeping ten
         days each are four weeks of accumulated lateness, not one. Read on the
         very same rows as the two counts above, so the figures can never tell
         two different stories about the same backlog. */
      const lateWeeks = Math.floor(
        lateRows.reduce((sum, row) => {
          const age = now - new Date(row.created_at).getTime();
          return Number.isFinite(age) && age > 0 ? sum + age : sum;
        }, 0) /
          (WEEK_HOURS * 3600 * 1000),
      );
      /* Which day the oldest one dates from: next to the count, the bar can say
         « since when » — a reminder that never stays anonymous. Read on exactly
         the same rows as the count, so the number and its date can never
         disagree. */
      /* The whole oldest row is kept, not only its date: the reminder is a
         door as well, and it must be able to name the very request it opens
         so the inbox can point at it instead of landing on a bare list. */
      const oldestLate = lateRows.reduce<(typeof lateRows)[number] | null>((oldest, row) => {
        const at = new Date(row.created_at).getTime();
        if (!Number.isFinite(at)) return oldest;
        if (!oldest) return row;
        const kept = new Date(oldest.created_at).getTime();
        return at < kept ? row : oldest;
      }, null);
      const lateOldest = oldestLate
        ? new Date(oldestLate.created_at).toISOString()
        : null;
      const lateOldestRef = oldestLate?.reference ?? null;
      const lateOldestId = oldestLate?.id ?? null;

      /* Average reply delay: reception → first pass to « traitée », in hours.
         Only handled rows that carry the stamp can be measured. */
      const { data: handled, error: handledError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('created_at, traitee_at')
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .not('traitee_at', 'is', null)
        .limit(500);
      if (handledError) throw handledError;

      const delays: number[] = [];
      ((handled ?? []) as Array<{ created_at: string; traitee_at: string | null }>).forEach((row) => {
        const from = new Date(row.created_at).getTime();
        const to = new Date(row.traitee_at ?? '').getTime();
        if (!Number.isFinite(from) || !Number.isFinite(to)) return;
        const diff = to - from;
        if (diff < 0) return;
        delays.push(diff);
      });
      const treated = delays.length;
      const avgMs = treated > 0 ? delays.reduce((sum, value) => sum + value, 0) / treated : 0;
      const avgHours = treated > 0 ? Math.round((avgMs / 3600000) * 10) / 10 : null;

      /* Reason breakdown of the month still running, and of the month before:
         the workshop reads at a glance what it closed with, and whether it is
         moving. Grouped on the handling date — the month it actually answered.
         Raw wording only: the site recognises the reason in every language. */
      const today = new Date();
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const firstOfPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString();
      const { data: monthRows, error: monthError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('created_at, traitee_at, motif, motif_lot_at')
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .gte('traitee_at', firstOfPrev)
        .limit(1000);
      if (monthError) throw monthError;

      const monthCut = new Date(firstOfMonth).getTime();
      const current: Array<{ delay: number; motif: string; lot: boolean }> = [];
      const previous: Array<{ delay: number; motif: string; lot: boolean }> = [];
      (
        (monthRows ?? []) as Array<{
          created_at: string;
          traitee_at: string | null;
          motif: string | null;
          motif_lot_at: string | null;
        }>
      ).forEach((row) => {
        const from = new Date(row.created_at).getTime();
        const to = new Date(row.traitee_at ?? '').getTime();
        if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return;
        const motif = row.motif ?? '';
        /* A reason that was caught up in bulk is part of the documented share,
           but the strip must be able to say which slice of it was rebuilt. */
        const lot = Boolean(row.motif_lot_at) && Boolean(motif.trim());
        (to >= monthCut ? current : previous).push({ delay: to - from, motif, lot });
      });

      const meanHours = (list: Array<{ delay: number }>) =>
        list.length > 0
          ? Math.round((list.reduce((sum, item) => sum + item.delay, 0) / list.length / 3600000) * 10) /
            10
          : null;

      /* The twelve-month backlog of the summary strip: closures of the same
         sliding window the inbox reads, but counted on every row — the strip is
         what the member reads without opening the box, so it cannot be a slice
         of the 200 loaded requests. Grouped on the handling date, like the rest. */
      const windowStart = new Date(
        today.getFullYear(),
        today.getMonth() - 11,
        1,
      ).toISOString();
      const { data: windowRows, error: windowError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('motif, traitee_at')
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .gte('traitee_at', windowStart)
        .limit(2000);
      if (windowError) throw windowError;

      const windowClosures = (windowRows ?? []) as Array<{
        motif: string | null;
        traitee_at: string | null;
      }>;
      const gap12 = windowClosures.filter((row) => !(row.motif ?? '').trim()).length;

      /* The thresholds of the window, so every month of it is judged against the
         target of its own time. The strip can then carry the very share of the
         year the table below states, counted on the whole inbox instead of the
         two hundred loaded rows. */
      const { data: goalRows, error: goalError } = await admin
        .from('paperatlas_b2b_objectif_historique')
        .select('objectif, changed_at')
        .eq('compte_id', userId)
        .order('changed_at', { ascending: true })
        .limit(120);
      if (goalError) throw goalError;
      const goalHistory = (
        (goalRows ?? []) as Array<{ objectif: number | null; changed_at: string }>
      )
        .map((entry) => ({
          objectif: readObjectif(entry.objectif),
          at: new Date(entry.changed_at).getTime(),
        }))
        .filter((entry) => Number.isFinite(entry.at))
        .sort((a, b) => a.at - b.at);

      /* The target in force that month: the last change recorded before it
         ended. With no history at all, today's target applies everywhere. */
      const goalOfMonth = (key: string) => {
        if (goalHistory.length === 0) return objectif;
        const [year, month] = key.split('-').map(Number);
        /* Day 0 of the following month is the last day of this one. */
        const end = new Date(year, month || 1, 0, 23, 59, 59, 999).getTime();
        let value = goalHistory[0].objectif;
        for (const entry of goalHistory) {
          if (entry.at > end) break;
          value = entry.objectif;
        }
        return value;
      };

      const yearKeyOf = (date: Date) =>
        `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
      const yearBuckets = new Map<string, { total: number; documented: number }>();
      windowClosures.forEach((row) => {
        const to = new Date(row.traitee_at ?? '').getTime();
        if (!Number.isFinite(to)) return;
        const key = yearKeyOf(new Date(to));
        const bucket = yearBuckets.get(key) ?? { total: 0, documented: 0 };
        bucket.total += 1;
        if ((row.motif ?? '').trim()) bucket.documented += 1;
        yearBuckets.set(key, bucket);
      });

      /* Only a month that closed something, and that had a target in force, is
         judged: an empty month is not a month under its target. */
      let yearJudged = 0;
      let yearBelow = 0;
      for (let back = 11; back >= 0; back -= 1) {
        const key = yearKeyOf(new Date(today.getFullYear(), today.getMonth() - back, 1));
        const bucket = yearBuckets.get(key);
        if (!bucket || bucket.total === 0) continue;
        const goal = goalOfMonth(key);
        if (goal === null) continue;
        yearJudged += 1;
        if (Math.round((bucket.documented / bucket.total) * 100) < goal) yearBelow += 1;
      }

      /* The corrections of the month: catch-ups that were erased after the fact.
         Counted on every row and on the day of the erasure, like the month
         review — the strip says how many traces were taken back this month,
         right next to the part that came from a bulk catch-up. */
      const { data: clearedRows, error: clearedError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('motif')
        .eq('dest_id', entrepriseId)
        .not('motif_lot_clear_at', 'is', null)
        .gte('motif_lot_clear_at', firstOfMonth)
        .limit(1000);
      if (clearedError) throw clearedError;
      const monthCleared = ((clearedRows ?? []) as Array<{ motif: string | null }>).filter(
        (row) => !(row.motif ?? '').trim(),
      ).length;

      /* The fiches taken back more than twice, over the whole inbox: a
         correction made before the counter existed is credited with a single
         round, so an old fiche can never pass this threshold — the strip says
         how many traces were ploughed, it does not invent them. */
      const { count: reworkCount, error: reworkError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('id', { count: 'exact', head: true })
        .eq('dest_id', entrepriseId)
        .gte('motif_lot_clear_count', 3);
      if (reworkError) throw reworkError;

      /* The forgotten traces, over the whole inbox: fiches corrected then left
         alone for over thirty days. Counted on every row and on the day of the
         erasure, so the strip can show their number without opening the box. */
      const staleCutoff = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
      const { count: staleCount, error: staleError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('id', { count: 'exact', head: true })
        .eq('dest_id', entrepriseId)
        .not('motif_lot_clear_at', 'is', null)
        .lte('motif_lot_clear_at', staleCutoff);
      if (staleError) throw staleError;

      /* The missing trace, over the whole inbox: closures that still owe a
         reason. Read on every row, not on the 200 loaded requests, so the
         strip never contradicts the list its chip opens. */
      const { data: undocRows, error: undocError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('motif')
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .limit(2000);
      if (undocError) throw undocError;
      const undoc = ((undocRows ?? []) as Array<{ motif: string | null }>).filter(
        (row) => !(row.motif ?? '').trim(),
      ).length;

      /* The slowest month of the year, as the account strip names it: the month
         whose average reply time grew the most against the one before, over the
         last twelve months. Read on measurable closures only, and one month
         earlier is fetched too, so the oldest shown month has a comparison
         point instead of a guess. */
      const delayWindowStart = new Date(
        today.getFullYear(),
        today.getMonth() - 12,
        1,
      ).toISOString();
      const { data: delayWindowRows, error: delayWindowError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('created_at, traitee_at')
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .gte('traitee_at', delayWindowStart)
        .limit(2000);
      if (delayWindowError) throw delayWindowError;

      const delayMonthOf = (date: Date) =>
        `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`;
      const delayBuckets = new Map<string, { sum: number; count: number }>();
      (
        (delayWindowRows ?? []) as Array<{ created_at: string; traitee_at: string | null }>
      ).forEach((row) => {
        const from = new Date(row.created_at).getTime();
        const to = new Date(row.traitee_at ?? '').getTime();
        if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return;
        const key = delayMonthOf(new Date(to));
        const bucket = delayBuckets.get(key) ?? { sum: 0, count: 0 };
        bucket.sum += to - from;
        bucket.count += 1;
        delayBuckets.set(key, bucket);
      });
      const monthDelay = (key: string) => {
        const bucket = delayBuckets.get(key);
        return bucket && bucket.count > 0 ? bucket.sum / bucket.count / 3600000 : null;
      };
      /* `count` travels with the month: a rise measured on one or two closures
         can be named, but the strip has to be able to say how thin it is. */
      let slowMonth: {
        key: string;
        deltaHours: number;
        avgHours: number;
        count: number;
      } | null = null;
      for (let back = 11; back >= 0; back -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth() - back, 1);
        const key = delayMonthOf(date);
        const before = delayMonthOf(new Date(date.getFullYear(), date.getMonth() - 1, 1));
        const nowDelay = monthDelay(key);
        const prevDelay = monthDelay(before);
        if (nowDelay === null || prevDelay === null) continue;
        const diff = nowDelay - prevDelay;
        if (diff <= 0) continue;
        if (slowMonth === null || diff > slowMonth.deltaHours) {
          slowMonth = {
            key,
            deltaHours: Math.round(diff * 10) / 10,
            avgHours: Math.round(nowDelay * 10) / 10,
            /* The sample behind that average, on this very month. */
            count: delayBuckets.get(key)?.count ?? 0,
          };
        }
      }

      /* The other side of the year, on the very rows above: how many months
         made people wait over a week on average. Same mechanics as the share of
         the year — a count, the months it can be judged on, nothing invented:
         only a month whose closures could be measured at all enters. Read on
         whole days, the very clock of the « Average days waited » column, so the
         strip and the table can never tell two stories about one month. */
      const waitBuckets = new Map<string, { days: number; count: number }>();
      (
        (delayWindowRows ?? []) as Array<{ created_at: string; traitee_at: string | null }>
      ).forEach((row) => {
        const from = new Date(row.created_at).getTime();
        const to = new Date(row.traitee_at ?? '').getTime();
        if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) return;
        const key = delayMonthOf(new Date(to));
        const bucket = waitBuckets.get(key) ?? { days: 0, count: 0 };
        bucket.days += Math.floor((to - from) / 86400000);
        bucket.count += 1;
        waitBuckets.set(key, bucket);
      });
      let waitJudged = 0;
      let waitOver = 0;
      /* The month that made people wait longest, named beside the count: the
         same buckets, the same whole days, so the strip cannot name a month the
         table would rank elsewhere. Only a month that really made people wait
         can win — a month of same-day closures is not « the longest » just
         because nothing else closed. A tie goes to the older month. */
      let waitMonth: { key: string; days: number; count: number } | null = null;
      let waitMonthRaw = 0;
      for (let back = 11; back >= 0; back -= 1) {
        const key = delayMonthOf(new Date(today.getFullYear(), today.getMonth() - back, 1));
        const bucket = waitBuckets.get(key);
        if (!bucket || bucket.count <= 0) continue;
        waitJudged += 1;
        const days = bucket.days / bucket.count;
        if (days > waitGoalDays) waitOver += 1;
        if (days <= 0) continue;
        /* The loop walks oldest first, so a strict comparison keeps the older
           month when two of them waited exactly as long. */
        if (days > waitMonthRaw) {
          waitMonthRaw = days;
          waitMonth = {
            key,
            days: Math.round(days * 10) / 10,
            count: bucket.count,
          };
        }
      }

      return json({
        ok: true,
        todo,
        late,
        veryLate,
        /* How many whole weeks of waiting the backlog adds up to: next to the
           48 h counter, the strip says how deep it ran, not only how wide. */
        lateWeeks: Number.isFinite(lateWeeks) && lateWeeks > 0 ? lateWeeks : 0,
        /* The day the oldest waiting request dates from: the bar names it under
           the reminder instead of leaving the delay without a face. Its
           reference travels with it, so the reminder can open the box on that
           very request rather than on the whole batch. */
        lateOldest,
        lateOldestRef,
        lateOldestId,
        /* Next to the backup counters: how many requests the reminder went past
           without them ever being opened — the size of the cut its chip opens. */
        never,
        /* Right under that count: the reference of its oldest miss, so the
           figure of absence has a face the workshop can open. */
        neverOldestRef,
        treated,
        avgHours,
        monthMotifs: current.map((item) => item.motif),
        /* Of this month's documented closures, the ones whose reason was caught
           up in bulk: the strip reads the real trace, not the total. */
        monthLot: current.filter((item) => item.lot).length,
        monthDocumented: current.filter((item) => item.motif.trim()).length,
        /* The corrections of the month, next to the catch-ups: the strip reads
           both faces of the same trace without opening the box. */
        monthCleared,
        /* Next to the corrections: how many fiches were ploughed, not just
           corrected — counted on every row, not on the 200 loaded requests. */
        rework3: reworkCount ?? 0,
        /* Next to them, the opposite cut: the corrections nobody came back to.
           A fiche reworked three times is still counted here once left alone. */
        stale30: staleCount ?? 0,
        /* Next to the two correction counters: how many closures still owe a
           reason at all — the size of the missing trace, whole inbox. */
        undoc,
        /* Same raw wording for the month before: the site compares the share of
           closures that carry a reason, month against month. */
        prevMotifs: previous.map((item) => item.motif),
        monthAvgHours: meanHours(current),
        /* The weight behind that average: only the closures that could really be
           measured (reception before closure). Same list as the mean, so the
           figure and its sample can never disagree. */
        monthDelayCount: current.length,
        prevDelayCount: previous.length,
        monthCount: current.length,
        prevAvgHours: meanHours(previous),
        prevCount: previous.length,
        objectif,
        entrepriseId,
        gap12,
        /* The months of the same window judged against their own threshold, and
           how many fell short: the share of the year, at the top of the page. */
        yearBelow: { judged: yearJudged, below: yearBelow },
        /* The wait threshold of the window, counted on the same rows: how many
           months made people wait over a week on average, and on how many
           measurable months that rests. */
        waitOver: { judged: waitJudged, over: waitOver },
        waitGoalDays,
        /* The month that made people wait longest over the same window: the
           strip names it next to the slowest month, read on the very column of
           days waited the table shows. */
        waitMonth,
        /* Next to the gap: the month that slowed down the most over the year,
           so the strip names it instead of waiting for a sort in the CSV. */
        slowMonth,
      });
    }

    /* Corrects the reason of an already handled request, without reopening it:
       the status and the handling date stay exactly where they are, so the
       average reply time is never rewritten by a late fix. */
    if (action === 'motif') {
      const id = clean(body.id, 60);
      const motif = clean(body.motif, 200) || null;
      if (!id) return json({ error: 'invalid' }, 400);

      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      const { data: row, error: readError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('id, statut')
        .eq('id', id)
        .eq('dest_id', entrepriseId)
        .maybeSingle();
      if (readError) throw readError;
      if (!row) return json({ error: 'not-found' }, 404);
      if ((row as { statut: string }).statut !== 'traitee') {
        return json({ error: 'not-handled' }, 409);
      }

      /* Given by hand, so the closure carries a trace again: an earlier erasure
         no longer describes it and must stop being counted. */
      const { error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({
          motif,
          motif_lot_at: null,
          motif_lot_cleared: null,
          motif_lot_clear_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('dest_id', entrepriseId);
      if (error) throw error;

      return json({ ok: true, motif });
    }

    /* Erases a bulk catch-up: the reason filled in bulk goes away, so the
       closure owes one again. The erasure is stamped, so the month review can
       say how many corrections were made — the trace is not just removed, the
       fact that it was removed is kept. The handling date never moves. */
    if (action === 'clearLot') {
      const id = clean(body.id, 60);
      if (!id) return json({ error: 'invalid' }, 400);

      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      /* Which reason was erased is kept: the CSV can then say which one gets
         corrected the most, instead of losing it with the erased label. The
         number of corrections is kept too: a fiche corrected three times is not
         the same work as one corrected once, and the inbox can rank them. */
      const { data: current, error: readError } = await admin
        .from('paperatlas_demandes_b2b')
        .select('motif, motif_lot_clear_count')
        .eq('id', id)
        .eq('dest_id', entrepriseId)
        .maybeSingle();
      if (readError) throw readError;
      const previous = current as {
        motif: string | null;
        motif_lot_clear_count: number | null;
      } | null;
      const erased = String(previous?.motif ?? '').trim();
      const before = Number(previous?.motif_lot_clear_count ?? 0);
      /* The counter survives a reason given back by hand: the fiche really was
         taken back that many times, and that fact does not expire. */
      const clearCount = Number.isFinite(before) && before > 0 ? before + 1 : 1;

      const now = new Date().toISOString();
      const { error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({
          motif: null,
          motif_lot_at: null,
          motif_lot_cleared: erased || null,
          motif_lot_clear_at: now,
          motif_lot_clear_count: clearCount,
          updated_at: now,
        })
        .eq('id', id)
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee');
      if (error) throw error;

      return json({
        ok: true,
        motif: null,
        motif_lot_cleared: erased || null,
        motif_lot_clear_at: now,
        motif_lot_clear_count: clearCount,
      });
    }

    /* Fills a missing reason on several closures at once — without ever
       reopening a request, and without moving the handling date: the reply
       delay the workshop is measured on stays exactly where it was. */
    if (action === 'motifLot') {
      const motif = clean(body.motif, 200) || null;
      if (!motif) return json({ error: 'invalid' }, 400);
      const ids = Array.isArray(body.ids)
        ? (body.ids as unknown[]).map((id) => clean(id, 60)).filter(Boolean).slice(0, 200)
        : [];
      if (ids.length === 0) return json({ ok: true, count: 0, ids: [] });

      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      const { data: done, error } = await admin
        .from('paperatlas_demandes_b2b')
        .update({
          motif,
          motif_lot_at: new Date().toISOString(),
          /* Filled again: the closure carries a trace once more, so an earlier
             erasure stops being counted. */
          motif_lot_cleared: null,
          motif_lot_clear_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('dest_id', entrepriseId)
        .eq('statut', 'traitee')
        .in('id', ids)
        .select('id');
      if (error) throw error;

      const touched = ((done ?? []) as Array<{ id: string }>).map((row) => row.id);
      return json({ ok: true, count: touched.length, ids: touched });
    }

    /* Undo of a bulk fill: each closure goes back to the reason it carried
       before — most often none at all. Same guarantees as the fill itself: the
       request stays handled and the handling date never moves. */
    if (action === 'motifRetour') {
      const raw = Array.isArray(body.entries) ? body.entries : [];
      const entries = raw
        .map((entry) => {
          const item = (entry ?? {}) as Body;
          return { id: clean(item.id, 60), motif: clean(item.motif, 200) || null };
        })
        .filter((item) => item.id)
        .slice(0, 200);
      if (entries.length === 0) return json({ ok: true, count: 0, entries: [] });

      const { data: compte, error: compteError } = await admin
        .from('paperatlas_comptes')
        .select('entreprise_id')
        .eq('id', userId)
        .maybeSingle();
      if (compteError) throw compteError;

      const entrepriseId = (compte?.entreprise_id as string | null) ?? null;
      if (!entrepriseId) return json({ error: 'no-card' }, 403);

      /* One update per distinct reason value: an undo stays a handful of calls. */
      const groups = new Map<string, string[]>();
      entries.forEach((entry) => {
        const key = entry.motif === null ? '\u0000none' : entry.motif;
        const ids = groups.get(key) ?? [];
        ids.push(entry.id);
        groups.set(key, ids);
      });

      const now = new Date().toISOString();
      const restored: string[] = [];
      for (const [key, ids] of groups) {
        const motif = key === '\u0000none' ? null : key;
        const { data: done, error } = await admin
          .from('paperatlas_demandes_b2b')
          .update({ motif, motif_lot_at: null, updated_at: now })
          .eq('dest_id', entrepriseId)
          .eq('statut', 'traitee')
          .in('id', ids)
          .select('id');
        if (error) throw error;
        ((done ?? []) as Array<{ id: string }>).forEach((row) => restored.push(row.id));
      }

      const touched = new Set(restored);
      return json({
        ok: true,
        count: restored.length,
        entries: entries.filter((entry) => touched.has(entry.id)),
      });
    }

    /* The monthly target for documented closures, kept per workshop: below it,
       the site warns that the trace of the month is not good enough. Every
       change is also written to the history, so a past month is never judged
       against a threshold the workshop had not chosen yet. */
    if (action === 'objectif') {
      const raw = body.value;
      let value: number | null = null;
      if (raw !== null && raw !== undefined && raw !== '') {
        const num = Number(raw);
        if (!Number.isFinite(num) || num < 1 || num > 100) {
          return json({ error: 'invalid' }, 400);
        }
        value = Math.round(num);
      }

      const { data: compte, error: readError } = await admin
        .from('paperatlas_comptes')
        .select('b2b_objectif_motif')
        .eq('id', userId)
        .maybeSingle();
      if (readError) throw readError;
      const before = readObjectif(
        (compte as { b2b_objectif_motif: number | null } | null)?.b2b_objectif_motif,
      );

      const { error } = await admin
        .from('paperatlas_comptes')
        .update({ b2b_objectif_motif: value, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;

      const now = Date.now();
      const rows: Array<{ compte_id: string; objectif: number | null; changed_at: string }> = [];

      /* First change ever: keep the previous threshold too, one second earlier,
         so the months before it are still read against what was in force then.
         Without it, a single entry would retroactively rewrite their target. */
      const { data: existing, error: existingError } = await admin
        .from('paperatlas_b2b_objectif_historique')
        .select('id')
        .eq('compte_id', userId)
        .limit(1);
      if (existingError) throw existingError;
      if ((existing ?? []).length === 0 && before !== value) {
        rows.push({
          compte_id: userId,
          objectif: before,
          changed_at: new Date(now - 1000).toISOString(),
        });
      }

      rows.push({ compte_id: userId, objectif: value, changed_at: new Date(now).toISOString() });

      const { error: historyWriteError } = await admin
        .from('paperatlas_b2b_objectif_historique')
        .insert(rows);
      if (historyWriteError) throw historyWriteError;

      return json({ ok: true, objectif: value });
    }

    /* The wait threshold, kept per account next to the target: above it, a
       month is flagged in the strip, in the twelve-month table and in the
       export. `null` puts the default week back. */
    if (action === 'waitGoal') {
      const raw = body.value;
      let value: number | null = null;
      if (raw !== null && raw !== undefined && raw !== '') {
        const num = Number(raw);
        if (!Number.isFinite(num) || num < 1 || num > 90) {
          return json({ error: 'invalid' }, 400);
        }
        value = Math.round(num);
      }

      const { error } = await admin
        .from('paperatlas_comptes')
        .update({ b2b_wait_goal_days: value, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;

      return json({
        ok: true,
        waitGoalDays: value ?? DEFAULT_WAIT_GOAL_DAYS,
      });
    }

    /* The reason a workshop closes most requests with, kept per account so it
       does not have to be picked again on every single request. */
    if (action === 'motifDefaut') {
      const raw = clean(body.motif, 20);
      const motif = raw && MOTIFS.has(raw) ? raw : null;
      if (raw && !motif) return json({ error: 'invalid' }, 400);

      const { error } = await admin
        .from('paperatlas_comptes')
        .update({ b2b_motif_defaut: motif, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      return json({ ok: true, motif });
    }

    /* The workshop decides, per account, whether it wants the e-mail alert. */
    if (action === 'alerts') {
      const enabled = body.enabled !== false;
      const { error } = await admin
        .from('paperatlas_comptes')
        .update({ b2b_alertes_email: enabled, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      return json({ ok: true, enabled });
    }

    if (action === 'link') {
      const entrepriseId = clean(body.entrepriseId, 80) || null;
      const { error } = await admin
        .from('paperatlas_comptes')
        .update({ entreprise_id: entrepriseId, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        const taken = /duplicate|unique/i.test(`${error.code} ${error.message}`);
        return json({ error: taken ? 'no-card' : 'link', detail: error.message }, taken ? 409 : 500);
      }
      return json({ ok: true, entrepriseId });
    }

    return json({ error: 'unknown-action' }, 400);
  } catch (err) {
    return json({ error: 'server', detail: err instanceof Error ? err.message : 'unknown' }, 500);
  }
});
