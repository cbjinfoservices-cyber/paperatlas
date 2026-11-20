import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage, siteUrl } from '../_shared/mail.ts';

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

type Statut = 'retenue' | 'refusee';

type Candidature = {
  id: string;
  user_id: string;
  offre_id: string;
  offre_titre: string;
  entreprise: string;
  entreprise_user_id: string | null;
  candidat_nom: string | null;
  candidat_email: string | null;
  statut: string;
  note_employeur: string | null;
};

const WORDING: Record<Statut, { subject: string; line: string; cta: string }> = {
  retenue: {
    subject: 'Votre candidature est retenue',
    line: 'vient de retenir votre candidature.',
    cta: 'Ouvrir mes candidatures',
  },
  refusee: {
    subject: 'Votre candidature n’a pas été retenue',
    line: 'a examiné votre candidature et ne la retient pas pour ce poste.',
    cta: 'Ouvrir mes candidatures',
  },
};

/**
 * Tells the candidate by e-mail that an employer settled their application.
 * The caller must be the employer who owns the application: the row is read with
 * the service role only after the JWT has been verified on an anon client.
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
  let statut = '';
  let note = '';
  try {
    const body = await req.json();
    candidatureId = typeof body?.candidatureId === 'string' ? body.candidatureId : '';
    statut = typeof body?.statut === 'string' ? body.statut : '';
    note = typeof body?.note === 'string' ? body.note.trim().slice(0, 400) : '';
  } catch {
    return reply({ code: 'InvalidParameter', message: 'candidatureId requis' }, 400);
  }
  if (!candidatureId) return reply({ code: 'InvalidParameter', message: 'candidatureId requis' }, 400);
  if (statut !== 'retenue' && statut !== 'refusee') {
    return reply({ code: 'OK', sent: false, reason: 'not-a-settlement' });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader) return reply({ code: 'Unauthorized' }, 401);

  /* Identity check only: this client never touches the database. */
  const auth = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData, error: userError } = await auth.auth.getUser();
  if (userError || !userData?.user) return reply({ code: 'Unauthorized' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: candidature, error: readError } = await admin
    .from('paperatlas_candidatures')
    .select('id, user_id, offre_id, offre_titre, entreprise, entreprise_user_id, candidat_nom, candidat_email, statut, note_employeur')
    .eq('id', candidatureId)
    .maybeSingle<Candidature>();

  if (readError) return reply({ code: 'ReadError', message: readError.message }, 500);
  if (!candidature) return reply({ code: 'NotFound' }, 404);
  if (candidature.entreprise_user_id !== userData.user.id) return reply({ code: 'Forbidden' }, 403);

  /* The address the candidate submitted with, else the one on their account. */
  let to = (candidature.candidat_email ?? '').trim();
  if (!to) {
    const { data: comptes } = await admin
      .from('paperatlas_comptes')
      .select('email')
      .eq('id', candidature.user_id)
      .maybeSingle<{ email: string | null }>();
    to = (comptes?.email ?? '').trim();
  }
  if (!to) return reply({ code: 'OK', sent: false, reason: 'no-recipient' });

  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail) return reply({ code: 'OK', sent: false, reason: 'email-not-configured' });
  const replyTo = mailCfg.replyTo;

  const site = siteUrl();
  const word = WORDING[statut as Statut];
  const candidate = (candidature.candidat_nom || '').trim();
  const hello = candidate ? `Bonjour ${candidate},` : 'Bonjour,';
  const employer = (candidature.entreprise || 'L’employeur').trim();
  /* The word the employer typed when shortlisting; falls back to the stored one. */
  const noteText = (note || (candidature.note_employeur ?? '').trim()).slice(0, 400);

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">${escapeHtml(hello)}</p>
    <p style="margin:0 0 16px"><strong>${escapeHtml(employer)}</strong> ${escapeHtml(word.line)}
      <br /><span style="color:#8a7f6f">Offre : ${escapeHtml(candidature.offre_titre)}</span></p>
    ${noteText
      ? `<blockquote style="margin:0 0 16px;padding:12px 16px;border-left:3px solid #e8822f;background:#faf6ef;border-radius:8px;color:#2c2620">
          <span style="display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a7f6f;margin-bottom:4px">Un mot de l’employeur</span>
          ${escapeHtml(noteText).replace(/\n/g, '<br />')}
        </blockquote>`
      : ''}
    ${statut === 'retenue'
      ? `<p style="margin:0 0 16px">L’employeur peut vous écrire dans la messagerie : surveillez votre boîte de réception sur PaperAtlas.</p>`
      : `<p style="margin:0 0 16px">Votre candidature reste enregistrée dans votre compte : d’autres offres vous attendent.</p>`}
    ${site
      ? `<p style="margin:0 0 16px"><a href="${escapeHtml(`${site}/compte#mes-candidatures`)}"
          style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
          ${escapeHtml(word.cta)}</a></p>`
      : ''}
    <p style="margin:0;font-size:12px;color:#8a7f6f">PaperAtlas · vous recevez cet e-mail parce que vous avez
      postulé à une offre sur la plateforme.</p>
  </div>`;

  const text = [
    hello,
    '',
    `${employer} ${word.line}`,
    `Offre : ${candidature.offre_titre}`,
    '',
    noteText ? `Un mot de l’employeur :\n${noteText}\n` : '',
    site ? `${word.cta} : ${site}/compte#mes-candidatures` : '',
  ].filter(Boolean).join('\n');

  const mailRes = await sendMailMessage({
    to,
    replyTo: replyTo || undefined,
    subject: `${word.subject} · ${candidature.offre_titre}`,
    html,
    text,
  });

  if (!mailRes.ok) {
    const detail = mailRes.detail ?? 'unknown';
    return reply({ code: 'EmailError', sent: false, message: detail.slice(0, 400) }, 502);
  }

  /* Le courriel est parti : le dossier en garde le jour, pour que l'employeur
     lise sur la candidature ce que le candidat a réellement reçu — et non la
     date de sa propre décision. Une écriture ratée ne défait pas l'envoi. */
  const sentAt = new Date().toISOString();
  try {
    await admin
      .from('paperatlas_candidatures')
      .update({ decision_envoyee_at: sentAt })
      .eq('id', candidature.id);
  } catch {
    /* silencieux : le courriel est déjà parti, la trace seule manque */
  }

  return reply({ code: 'OK', sent: true, sentAt });
});
