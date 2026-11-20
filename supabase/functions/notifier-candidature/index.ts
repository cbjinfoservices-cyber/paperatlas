import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage } from '../_shared/mail.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const reply = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

type Candidature = {
  id: string;
  user_id: string;
  offre_id: string;
  offre_titre: string;
  entreprise: string;
  entreprise_user_id: string | null;
  candidat_nom: string | null;
  candidat_email: string | null;
  telephone: string | null;
  cv_url: string | null;
  cv_path: string | null;
  message: string;
};

type Lang = 'fr' | 'ar' | 'en';

/** La langue du visiteur : la notification part dans cette langue. */
const LANG_OF = (value: unknown): Lang => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return raw === 'ar' || raw === 'en' ? raw : 'fr';
};

/**
 * Le message de candidature, dans les trois langues du site. L'employeur le
 * reçoit dans la langue du candidat : c'est le visiteur qui a écrit, et la
 * phrase qui présente son profil reste la sienne.
 */
type Copy = {
  subject: string;
  hello: string;
  applied: string;
  onSite: string;
  phone: string;
  email: string;
  cv: string;
  cvOpen: string;
  message: string;
  cta: string;
  replyFallback: string;
  footer: string;
  ghostName: string;
  /** Les guillemets de la langue, autour du titre de l'offre : sans eux, le
      titre se lit comme deux mots accrochés après « votre offre ». */
  qOpen: string;
  qClose: string;
  /** La marque qui ferme le pied, quand la phrase ne la porte pas déjà. */
  mark: string;
};

const COPY: Record<Lang, Copy> = {
  fr: {
    /* Un téléphone montre une quarantaine de signes : « Nouvelle » poussait
       le titre de l'offre hors de la vue, alors que la notification en
       montre déjà la première ligne. */
    subject: 'Candidature',
    hello: 'Bonjour',
    applied: 'vient de postuler à votre offre',
    onSite: 'sur PaperAtlas.',
    phone: 'Téléphone',
    email: 'E-mail',
    cv: 'CV',
    /* La cellule ne répète plus le mot de la ligne : deux « CV » côte à côte
       dans une colonne étroite. */
    cvOpen: 'Ouvrir',
    message: 'Message',
    /* Le message vouvoie l'employeur partout ailleurs (« votre offre ») ;
       « mon espace » était la voix du candidat. */
    cta: 'Répondre depuis votre espace compte',
    /* Le nom mis entre guillemets existe à l'écran : la rubrique s'appelle
       « Candidatures », son onglet « Reçues » — le lecteur ne cherche plus un
       mot introuvable. La citation intérieure prend les guillemets anglais,
       sinon la phrase se ferme deux fois au même endroit. */
    replyFallback:
      'Répondez depuis votre espace compte, rubrique « Candidatures », onglet “Reçues”.',
    footer:
      'PaperAtlas · vous recevez cet e-mail parce qu’une candidature a été déposée sur l’une de vos offres.',
    ghostName: 'Un candidat',
    /* Les mêmes guillemets que dans la version texte : le titre de l'offre se
       lit comme un titre, dans les deux formes du message. */
    qOpen: '« ',
    qClose: ' »',
    mark: '',
  },
  ar: {
    subject: 'ترشيح جديد',
    hello: 'مرحبًا',
    applied: 'تقدّم للتوّ بترشيحه إلى عرضكم',
    onSite: 'على منصّة PaperAtlas',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    cv: 'السيرة الذاتية',
    /* Le libellé ne répète plus mot pour mot celui de la ligne : on ouvre un
       fichier, pas la ligne qui le nomme. */
    cvOpen: 'فتح الملف',
    message: 'الرسالة',
    /* Le message vouvoie au pluriel dès « عرضكم » : le bouton le suit. */
    cta: 'الردّ من مساحة حسابكم',
    replyFallback: 'أجيبوا من مساحة حسابكم، قسم « الترشيحات الواردة ».',
    /* L'arabe d'abord, la marque au bout : le point médian ne retourne plus. */
    footer: 'تصل إليكم هذه الرسالة لأن ترشيحًا أُرسل إلى أحد عروضكم.',
    ghostName: 'مرشح',
    qOpen: '«',
    qClose: '»',
    mark: 'PaperAtlas',
  },
  en: {
    /* Un téléphone montre une quarantaine de signes : « New » poussait le
       titre de l'offre hors de la vue, alors que la notification en montre
       déjà la première ligne. */
    subject: 'Application',
    hello: 'Hello',
    applied: 'has just applied to your offer',
    onSite: 'on PaperAtlas.',
    phone: 'Phone',
    /* Une seule orthographe du mot dans tout le message : le pied l'écrit
       déjà « email », et les deux se lisent en même temps. */
    email: 'Email',
    cv: 'CV',
    /* La cellule ne répète plus le mot de la ligne : deux « CV » côte à côte
       dans une colonne étroite. */
    cvOpen: 'Open',
    message: 'Message',
    /* Le message parle à l'employeur partout ailleurs (« your offer ») ;
       « my » était la voix du candidat. */
    cta: 'Reply from your account',
    replyFallback: 'Reply from your account, under “applications received”.',
    footer:
      'PaperAtlas · you receive this email because an application was sent to one of your offers.',
    ghostName: 'A candidate',
    /* Le titre de l'offre est entre guillemets anglais : posé nu après « your
       offer », il passe à la ligne et se détache de la phrase. */
    qOpen: '“',
    qClose: '”',
    mark: '',
  },
};

/** The private bucket holding candidate CVs. */
const CV_BUCKET = 'cvs-candidats';
/** Long enough that the employer can still open it from last week's mail. */
const CV_LINK_SECONDS = 60 * 60 * 24 * 7;

/**
 * Tells the employer by e-mail that an application just landed.
 * The caller must be the applicant: the candidature is read with the service
 * role only after the JWT has been verified on an anon client.
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return reply({ code: 'InvalidParameter', message: 'POST only' }, 405);

  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!url || !anonKey || !serviceKey) {
    return reply({ code: 'ConfigError', message: 'Supabase environment is incomplete' }, 500);
  }

  let candidatureId = '';
  let lang: Lang = 'fr';
  try {
    const body = await req.json();
    candidatureId = typeof body?.candidatureId === 'string' ? body.candidatureId : '';
    lang = LANG_OF(body?.lang);
  } catch {
    return reply({ code: 'InvalidParameter', message: 'candidatureId requis' }, 400);
  }
  if (!candidatureId) return reply({ code: 'InvalidParameter', message: 'candidatureId requis' }, 400);

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return reply({ code: 'Unauthorized' }, 401);

  /* Identity check only: this client never touches the database. */
  const auth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await auth.auth.getUser();
  if (userError || !userData?.user) return reply({ code: 'Unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: candidature, error: readError } = await admin
    .from('paperatlas_candidatures')
    .select('id, user_id, offre_id, offre_titre, entreprise, entreprise_user_id, candidat_nom, candidat_email, telephone, cv_url, cv_path, message')
    .eq('id', candidatureId)
    .maybeSingle<Candidature>();

  if (readError) return reply({ code: 'ReadError', message: readError.message }, 500);
  if (!candidature) return reply({ code: 'NotFound' }, 404);
  if (candidature.user_id !== userData.user.id) return reply({ code: 'Forbidden' }, 403);

  /* The CV lives in private storage: the mail carries a signed link, valid a
     week, never a public URL. Legacy rows still hold an open link. */
  let cvLink = (candidature.cv_url ?? '').trim();
  if (!cvLink && candidature.cv_path) {
    const { data: signed } = await admin.storage
      .from(CV_BUCKET)
      .createSignedUrl(candidature.cv_path, CV_LINK_SECONDS);
    cvLink = signed?.signedUrl ?? '';
  }

  /* Prefer the employer's own account, fall back to the offer's contact address. */
  let to = '';
  if (candidature.entreprise_user_id) {
    const { data: employeur } = await admin
      .from('paperatlas_comptes')
      .select('email')
      .eq('id', candidature.entreprise_user_id)
      .maybeSingle<{ email: string | null }>();
    to = (employeur?.email ?? '').trim();
  }
  if (!to) {
    const { data: annonce } = await admin
      .from('paperatlas_annonces')
      .select('email')
      .eq('id', candidature.offre_id)
      .maybeSingle<{ email: string | null }>();
    to = (annonce?.email ?? '').trim();
  }
  if (!to) return reply({ code: 'OK', sent: false, reason: 'no-recipient' });

  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail) return reply({ code: 'OK', sent: false, reason: 'email-not-configured' });

  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  const copy = COPY[lang];
  const applicant =
    (candidature.candidat_nom || candidature.candidat_email || copy.ghostName).trim();
  const subject = `${copy.subject} · ${candidature.offre_titre}`;

  /* Mêmes règles que le reçu B2B : l'arabe annonce son sens de lecture, prend
     une police arabophone, et perd l'interlettrage des capitales latines. */
  const rtl = lang === 'ar';
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
  /* La virgule qui suit la salutation est celle de la langue. */
  const comma = rtl ? '،' : ',';
  /* L'espace qui précède le deux-points est française : l'anglais ne la
     connaît pas, et rien ne la corrige dans la version texte. */
  const sep = lang === 'en' ? ': ' : ' : ';
  /* La teinte d'accent du site, celle que porte déjà le lien des pièces du
     reçu B2B : le lien du CV ne sort plus de la palette. */
  const ACCENT = '#b8621c';
  /* Une adresse de quarante signes ne doit pas élargir le tableau au-delà de
     l'écran : la cellule coupe le mot au lieu de pousser la colonne. */
  const valueStyle = 'word-break:break-word;overflow-wrap:anywhere;';

  /* Le nom et les coordonnées sont des suites latines posées dans un message
     arabe : isolées, elles ne retournent plus le début de la phrase, et le
     numéro ne commence plus par son dernier chiffre. */
  const isolated = (value: string) =>
    rtl ? `<bdi>${escapeHtml(value)}</bdi>` : escapeHtml(value);
  const isolatedText = (value: string) => (rtl ? `\u2066${value}\u2069` : value);

  const lines = [
    `<p style="margin:0 0 16px">${escapeHtml(copy.hello)}${comma}</p>`,
    `<p style="margin:0 0 16px"><strong>${isolated(applicant)}</strong> ${escapeHtml(copy.applied)}
      ${escapeHtml(copy.qOpen)}<strong>${escapeHtml(candidature.offre_titre)}</strong>${escapeHtml(copy.qClose)} ${escapeHtml(copy.onSite)}</p>`,
    `<table style="border-collapse:collapse;margin:0 0 16px;width:100%;max-width:520px">`,
    candidature.telephone
      ? `<tr><td style="${cellStyle}">${escapeHtml(copy.phone)}</td><td style="${valueStyle}">${isolated(candidature.telephone)}</td></tr>`
      : '',
    candidature.candidat_email
      ? `<tr><td style="${cellStyle}">${escapeHtml(copy.email)}</td><td style="${valueStyle}">${isolated(candidature.candidat_email)}</td></tr>`
      : '',
    /* Le lien du CV prend la couleur d'accent du site : c'était le seul endroit
       du message qui sortait de la palette, dans les trois langues. */
    cvLink
      ? `<tr><td style="${cellStyle}">${escapeHtml(copy.cv)}</td><td style="${valueStyle}"><a href="${escapeHtml(cvLink)}" style="color:${ACCENT}">${escapeHtml(copy.cvOpen)}</a></td></tr>`
      : '',
    `</table>`,
    `<p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;${labelStyle}">${escapeHtml(copy.message)}</p>`,
    `<blockquote style="margin:0 0 20px;padding:10px 14px;${quoteStyle}">
      ${escapeHtml(candidature.message).replace(/\n/g, '<br />')}</blockquote>`,
    site
      ? `<p style="margin:0 0 16px"><a href="${escapeHtml(`${site}/compte#mes-candidatures`)}"
          style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
          ${escapeHtml(copy.cta)}</a></p>`
      : `<p style="margin:0 0 16px">${escapeHtml(copy.replyFallback)}</p>`,
    `<p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}${
      copy.mark
        ? ` <bdi dir="ltr" style="white-space:nowrap">· ${escapeHtml(copy.mark)}</bdi>`
        : ''
    }</p>`,
  ];

  const html = `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:${font};font-size:14px;line-height:${
    rtl ? '1.8' : '1.6'
  };color:#211d18;text-align:${rtl ? 'right' : 'left'}">
    ${lines.filter(Boolean).join('\n')}
  </div>`;

  /* La salutation respire : en HTML ce sont deux paragraphes, alors qu'en
     texte brut le nom collait au « Bonjour, ». Le reçu B2B laisse déjà cette
     ligne vide entre les deux. */
  const corps = [
    `${isolatedText(applicant)} ${copy.applied} ${copy.qOpen}${candidature.offre_titre}${copy.qClose} ${copy.onSite}`,
    candidature.telephone ? `${copy.phone}${sep}${candidature.telephone}` : '',
    candidature.candidat_email ? `${copy.email}${sep}${candidature.candidat_email}` : '',
    cvLink ? `${copy.cv}${sep}${cvLink}` : '',
    '',
    candidature.message,
    /* Le pied ferme la version texte, avec la marque au bout : le point de la
       phrase tombe ainsi avant le nom latin, jamais après. */
    copy.mark ? `${copy.footer} · ${copy.mark}` : '',
  ].filter(Boolean);
  const text = [`${copy.hello}${comma}`, '', ...corps].join('\n');

  const mailRes = await sendMailMessage({
    to,
    replyTo: candidature.candidat_email || undefined,
    subject,
    html,
    text,
  });

  if (!mailRes.ok) {
    const detail = mailRes.detail ?? 'unknown';
    return reply({ code: 'EmailError', sent: false, message: detail.slice(0, 400) }, 502);
  }

  return reply({ code: 'OK', sent: true });
});
