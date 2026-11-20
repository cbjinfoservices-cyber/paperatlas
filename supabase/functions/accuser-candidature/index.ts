import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage } from '../_shared/mail.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

/** Les adresses autorisées à renvoyer l'accusé d'un candidat : les secrets de
 *  la fonction, et à défaut l'adresse du propriétaire du site — la même liste
 *  que la console d'administration. */
const ADMIN_EMAILS = (Deno.env.get('ADMIN_EMAILS') || 'cbj.infoservices@gmail.com')
  .split(/[,\s;]+/)
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

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

type Lang = 'fr' | 'ar' | 'en';

const LANG_OF = (value: unknown): Lang => {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : '';
  return raw === 'ar' || raw === 'en' ? raw : 'fr';
};

/** Une ligne du journal des renvois : la date est celle du serveur, jamais
 *  celle du navigateur. */
type Journal = {
  candidatureId: string;
  destinataire: string;
  auteur: string | null;
  declencheur: 'depot' | 'renvoi';
  candidatNom: string | null;
  offreTitre: string | null;
  entreprise: string | null;
  statut: 'envoye' | 'echec';
  motif: string | null;
};

/** Le journal ne fait jamais échouer un envoi : une trace perdue se vaut
 *  mieux qu'un accusé qui ne part pas. */
async function journaliser(admin: SupabaseClient, entry: Journal) {
  try {
    await admin.from('paperatlas_accuse_renvois').insert({
      candidature_id: entry.candidatureId,
      destinataire: entry.destinataire,
      auteur: entry.auteur,
      declencheur: entry.declencheur,
      candidat_nom: entry.candidatNom,
      offre_titre: entry.offreTitre,
      entreprise: entry.entreprise,
      statut: entry.statut,
      motif: entry.motif,
      sent_at: new Date().toISOString(),
    });
  } catch {
    /* rien à faire : le journal n'est pas le geste */
  }
}

type Candidature = {
  id: string;
  user_id: string;
  offre_titre: string;
  entreprise: string;
  candidat_nom: string | null;
  candidat_email: string | null;
  accuse_at: string | null;
  created_at: string;
};

type Copy = {
  subject: string;
  hello: string;
  lead: (nom: string, titre: string, entreprise: string) => string;
  what: string;
  deposited: string;
  reference: string;
  cta: string;
  fallback: string;
  footer: string;
  qOpen: string;
  qClose: string;
  mark: string;
  locale: string;
  rtl: boolean;
};

const COPY: Record<Lang, Copy> = {
  fr: {
    subject: 'Candidature reçue',
    hello: 'Bonjour',
    lead: (nom, titre, entreprise) =>
      `${nom}, votre candidature pour ${titre} chez ${entreprise} est bien arrivée.`,
    what:
      'Ce message est votre accusé de réception. L’employeur a été prévenu : il lira votre dossier depuis son espace compte. Vous recevrez un courriel dès qu’une décision sera prise.',
    deposited: 'Déposée le',
    reference: 'Référence',
    cta: 'Suivre ma candidature',
    fallback: 'Retrouvez cette candidature dans votre espace compte, rubrique « Candidatures ».',
    footer:
      'PaperAtlas · vous recevez cet e-mail parce que vous avez déposé une candidature sur l’une de nos offres.',
    qOpen: '« ',
    qClose: ' »',
    mark: '',
    locale: 'fr-FR',
    rtl: false,
  },
  ar: {
    subject: 'وصل ترشيحكم',
    hello: 'مرحبًا',
    lead: (nom, titre, entreprise) =>
      `${nom}، وصلنا ترشيحكم إلى ${titre} لدى ${entreprise}.`,
    what:
      'هذه الرسالة هي إشعار الاستلام. أُشعر المشغّل، وسيقرأ ملفكم من مساحة حسابه. وستصلكم رسالة بمجرد اتخاذ القرار.',
    deposited: 'أُودع في',
    reference: 'المرجع',
    cta: 'متابعة ترشيحي',
    fallback: 'تجدون هذا الترشيح في مساحة حسابكم، قسم «الترشحات».',
    footer: 'تصل إليكم هذه الرسالة لأنكم أودعتم ترشيحًا على أحد عروضنا.',
    qOpen: '«',
    qClose: '»',
    mark: 'PaperAtlas',
    locale: 'ar-DZ-u-nu-latn',
    rtl: true,
  },
  en: {
    subject: 'Application received',
    hello: 'Hello',
    lead: (nom, titre, entreprise) =>
      `${nom}, your application for ${titre} at ${entreprise} has arrived.`,
    what:
      'This message is your acknowledgement of receipt. The employer has been notified and will read your file from their account. You will receive an email as soon as a decision is taken.',
    deposited: 'Sent on',
    reference: 'Reference',
    cta: 'Follow my application',
    fallback: 'Find this application in your account, under “Applications”.',
    footer:
      'PaperAtlas · you receive this email because you sent an application to one of our offers.',
    qOpen: '“',
    qClose: '”',
    mark: '',
    locale: 'en-GB',
    rtl: false,
  },
};

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

  const auth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await auth.auth.getUser();
  if (userError || !userData?.user) return reply({ code: 'Unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: candidature, error: readError } = await admin
    .from('paperatlas_candidatures')
    .select('id, user_id, offre_titre, entreprise, candidat_nom, candidat_email, accuse_at, created_at')
    .eq('id', candidatureId)
    .maybeSingle<Candidature>();

  if (readError) return reply({ code: 'ReadError', message: readError.message }, 500);
  if (!candidature) return reply({ code: 'NotFound' }, 404);

  /* Le candidat renvoie le sien ; l'administration peut relancer celui d'un
     autre, quand le premier courriel n'est pas parti. Le droit se lit sur
     l'adresse de l'appelant, puis sur le rôle du compte — jamais sur une
     valeur envoyée par le navigateur. */
  if (candidature.user_id !== userData.user.id) {
    const mail = (userData.user.email ?? '').trim().toLowerCase();
    let autorise = ADMIN_EMAILS.includes(mail);
    if (!autorise) {
      const { data: compteRole } = await admin
        .from('paperatlas_comptes')
        .select('role')
        .ilike('email', mail)
        .maybeSingle<{ role: string | null }>();
      autorise = String(compteRole?.role ?? '').toLowerCase() === 'admin';
    }
    if (!autorise) return reply({ code: 'Forbidden' }, 403);
  }

  if (candidature.accuse_at) {
    return reply({ code: 'OK', sent: false, reason: 'already-acknowledged', accuseAt: candidature.accuse_at });
  }

  /* L'auteur et le déclencheur se lisent sur l'appelant : le candidat qui
     dépose son dossier, ou l'administration qui relance celui d'un autre.
     Rien de tout cela ne vient du navigateur. */
  const auteurMail = (userData.user.email ?? '').trim().toLowerCase() || null;
  const trace = {
    candidatureId: candidature.id,
    auteur: auteurMail,
    declencheur: (candidature.user_id === userData.user.id ? 'depot' : 'renvoi') as
      | 'depot'
      | 'renvoi',
    candidatNom: candidature.candidat_nom,
    offreTitre: candidature.offre_titre,
    entreprise: candidature.entreprise,
  };

  let to = (candidature.candidat_email ?? '').trim();
  if (!to) {
    const { data: compte } = await admin
      .from('paperatlas_comptes')
      .select('email')
      .eq('id', candidature.user_id)
      .maybeSingle<{ email: string | null }>();
    to = (compte?.email ?? '').trim();
  }
  if (!to) {
    await journaliser(admin, {
      ...trace,
      destinataire: '',
      statut: 'echec',
      motif: 'no-recipient',
    });
    return reply({ code: 'OK', sent: false, reason: 'no-recipient' });
  }

  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail) {
    await journaliser(admin, {
      ...trace,
      destinataire: to,
      statut: 'echec',
      motif: 'email-not-configured',
    });
    return reply({ code: 'OK', sent: false, reason: 'email-not-configured' });
  }

  const site = (Deno.env.get('SITE_URL') ?? '').replace(/\/+$/, '');
  const copy = COPY[lang];
  const nom = (candidature.candidat_nom || '').split(' ')[0].trim() || copy.hello;
  const titre = `${copy.qOpen}${candidature.offre_titre}${copy.qClose}`;
  const entreprise = candidature.entreprise || 'PaperAtlas';
  const deposited = new Intl.DateTimeFormat(copy.locale, {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(candidature.created_at));
  const ref = candidature.id.slice(0, 8).toUpperCase();
  const subject = `${copy.subject} · ${candidature.offre_titre}`;

  const font = copy.rtl
    ? "'Segoe UI',Tahoma,'Noto Naskh Arabic','Geeza Pro','Traditional Arabic',Arial,sans-serif"
    : 'Helvetica,Arial,sans-serif';
  const cellStyle = copy.rtl
    ? 'padding:2px 0 2px 14px;color:#8a7f6f'
    : 'padding:2px 14px 2px 0;color:#8a7f6f';
  const quoteStyle = copy.rtl
    ? 'border-right:3px solid #e8822f;background:#f7f1e6'
    : 'border-left:3px solid #e8822f;background:#f7f1e6';
  const comma = copy.rtl ? '،' : ',';
  const isolated = (value: string) => (copy.rtl ? `<bdi>${escapeHtml(value)}</bdi>` : escapeHtml(value));

  const html = `<div dir="${copy.rtl ? 'rtl' : 'ltr'}" style="font-family:${font};font-size:14px;line-height:${
    copy.rtl ? '1.8' : '1.6'
  };color:#211d18;text-align:${copy.rtl ? 'right' : 'left'}">
    <p style="margin:0 0 16px">${escapeHtml(copy.hello)}${comma}</p>
    <p style="margin:0 0 16px">${isolated(copy.lead(nom, titre, entreprise))}</p>
    <blockquote style="margin:0 0 18px;padding:10px 14px;${quoteStyle}">${escapeHtml(copy.what)}</blockquote>
    <table style="border-collapse:collapse;margin:0 0 16px;width:100%;max-width:520px">
      <tr><td style="${cellStyle}">${escapeHtml(copy.deposited)}</td><td style="word-break:break-word">${isolated(deposited)}</td></tr>
      <tr><td style="${cellStyle}">${escapeHtml(copy.reference)}</td><td style="word-break:break-word">${escapeHtml(ref)}</td></tr>
    </table>
    ${
      site
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(`${site}/compte#mes-candidatures`)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            ${escapeHtml(copy.cta)}</a></p>`
        : `<p style="margin:0 0 16px">${escapeHtml(copy.fallback)}</p>`
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}${
      copy.mark ? ` <bdi dir="ltr" style="white-space:nowrap">· ${escapeHtml(copy.mark)}</bdi>` : ''
    }</p>
  </div>`;

  const text = [
    `${copy.hello}${comma}`,
    '',
    copy.lead(nom, titre, entreprise),
    '',
    copy.what,
    '',
    `${copy.deposited}: ${deposited}`,
    `${copy.reference}: ${ref}`,
    '',
    site ? `${copy.cta} — ${site}/compte#mes-candidatures` : copy.fallback,
    '',
    copy.mark ? `${copy.footer} · ${copy.mark}` : copy.footer,
  ].join('\n');

  const mailRes = await sendMailMessage({
    to,
    subject,
    html,
    text,
  });

  if (!mailRes.ok) {
    const detail = mailRes.detail ?? 'unknown';
    await journaliser(admin, {
      ...trace,
      destinataire: to,
      statut: 'echec',
      motif: 'email-error',
    });
    return reply({ code: 'EmailError', sent: false, message: detail.slice(0, 400) }, 502);
  }

  /* Le courriel est parti : le journal l'écrit avec son destinataire réel. */
  await journaliser(admin, {
    ...trace,
    destinataire: to,
    statut: 'envoye',
    motif: null,
  });

  const accuseAt = new Date().toISOString();
  const { error: updateError } = await admin
    .from('paperatlas_candidatures')
    .update({ accuse_at: accuseAt })
    .eq('id', candidature.id)
    .is('accuse_at', null);
  if (updateError) return reply({ code: 'OK', sent: true, accuseAt: null, warning: updateError.message });

  return reply({ code: 'OK', sent: true, accuseAt });
});
