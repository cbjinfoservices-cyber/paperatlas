import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage, siteUrl } from '../_shared/mail.ts';

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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** A request still waiting after this many hours earns one reminder, once. */
const DELAY_HOURS = 48;

type LateRow = {
  id: string;
  reference: string;
  dest_id: string;
  dest_name: string;
  nom: string;
  organisme: string | null;
  email: string;
  telephone: string | null;
  quantite: string | null;
  delai: string | null;
  budget: string | null;
  message: string;
  statut: string;
  created_at: string;
  rappel_at: string | null;
  snooze_at: string | null;
};

const days = (iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const hours = Math.floor((Date.now() - then) / 3600000);
  if (hours < 48) return `${hours} h`;
  return `${Math.floor(hours / 24)} jours`;
};

function buildHtml(name: string, rows: LateRow[], accountLink: string) {
  const items = rows
    .map((row) => {
      const facts: Array<[string, string]> = [
        ['Quantité', row.quantite ?? ''],
        ['Délai', row.delai ?? ''],
        ['Budget', row.budget ?? ''],
      ].filter((entry) => Boolean(entry[1])) as Array<[string, string]>;

      return `<div style="margin:0 0 18px;padding:12px 14px;border-left:3px solid #e8822f;background:#f7f1e6">
        <p style="margin:0 0 4px;font-weight:700">${escapeHtml(row.reference)} · ${escapeHtml(
          row.organisme ? `${row.nom} · ${row.organisme}` : row.nom,
        )}</p>
        <p style="margin:0 0 4px;font-size:13px;color:#8a7f6f">Reçue il y a ${escapeHtml(days(row.created_at))} ·
          ${escapeHtml(row.email)}${row.telephone ? ` · ${escapeHtml(row.telephone)}` : ''}</p>
        ${
          facts.length
            ? `<p style="margin:0 0 6px;font-size:13px">${facts
                .map(([label, value]) => `${escapeHtml(label)} : ${escapeHtml(value)}`)
                .join(' — ')}</p>`
            : ''
        }
        <p style="margin:0;font-size:13px;line-height:1.55">${escapeHtml(row.message).replace(/\n/g, '<br />')}</p>
      </div>`;
    })
    .join('\n');

  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">Bonjour,</p>
    <p style="margin:0 0 16px">${
      rows.length === 1 ? 'Une demande B2B' : `${rows.length} demandes B2B`
    } adressée${rows.length === 1 ? '' : 's'} à <strong>${escapeHtml(
      name,
    )}</strong> attend${rows.length === 1 ? '' : 'ent'} encore votre réponse depuis plus de 48 h.</p>
    ${items}
    <p style="margin:0 0 16px">Un mot suffit souvent à ne pas perdre le client : dites simplement si le volume
      vous convient et sous quel délai.</p>
    ${
      accountLink
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            Ouvrir mes demandes B2B</a></p>`
        : ''
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">PaperAtlas · un seul rappel par demande — celui-ci repart uniquement
      si vous aviez vous-même reporté la demande à une date ultérieure.
      Vous pouvez couper les alertes e-mail depuis « Demandes B2B reçues » dans votre espace compte.</p>
  </div>`;
}

function buildText(name: string, rows: LateRow[], accountLink: string) {
  const head =
    rows.length === 1
      ? `Une demande B2B adressée à ${name} attend votre réponse depuis plus de 48 h.`
      : `${rows.length} demandes B2B adressées à ${name} attendent votre réponse depuis plus de 48 h.`;

  const body = rows
    .map((row) =>
      [
        `- ${row.reference} · ${row.organisme ? `${row.nom} · ${row.organisme}` : row.nom} (il y a ${days(row.created_at)})`,
        `  ${row.email}${row.telephone ? ` · ${row.telephone}` : ''}`,
        row.quantite ? `  Quantité : ${row.quantite}` : '',
        row.delai ? `  Délai : ${row.delai}` : '',
        row.budget ? `  Budget : ${row.budget}` : '',
        `  ${row.message}`,
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');

  return [head, '', body, '', accountLink ? `Ouvrir mes demandes B2B : ${accountLink}` : '']
    .filter((line) => line !== '')
    .join('\n');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);

  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail) return json({ ok: true, skipped: 'no-mail-config' });

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const cutoff = new Date(Date.now() - DELAY_HOURS * 3600 * 1000).toISOString();

  /* Only the requests that nobody handled yet. Whether a given row is due for a
     reminder is decided below: a workshop can push one back to a later date. */
  const { data: late, error } = await admin
    .from('paperatlas_demandes_b2b')
    .select(
      'id, reference, dest_id, dest_name, nom, organisme, email, telephone, quantite, delai, budget, message, statut, created_at, rappel_at, snooze_at',
    )
    .in('statut', ['nouvelle', 'vue'])
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(400);

  if (error) return json({ error: 'query', detail: error.message }, 500);

  const now = Date.now();
  const rows = ((late ?? []) as LateRow[]).filter((row) => {
    /* Pushed back to a later date: the workshop asked for silence until then. */
    if (row.snooze_at) {
      const until = new Date(row.snooze_at).getTime();
      if (!Number.isFinite(until) || until > now) return false;
    }
    if (!row.rappel_at) return true;
    /* Already reminded, but the workshop then pushed it back: the new date earns
       one fresh reminder, no more. */
    if (!row.snooze_at) return false;
    return new Date(row.rappel_at).getTime() < new Date(row.snooze_at).getTime();
  });
  if (rows.length === 0) return json({ ok: true, sent: 0, workshops: 0 });

  const destIds = Array.from(new Set(rows.map((row) => row.dest_id).filter(Boolean)));
  const { data: comptes, error: compteError } = await admin
    .from('paperatlas_comptes')
    .select('email, entreprise_id, b2b_alertes_email')
    .in('entreprise_id', destIds);
  if (compteError) return json({ error: 'comptes', detail: compteError.message }, 500);

  /* One mailbox per workshop, and only when the workshop kept its alerts on. */
  const inbox = new Map<string, string>();
  (
    comptes as Array<{
      email: string | null;
      entreprise_id: string | null;
      b2b_alertes_email: boolean | null;
    }> | null
  )?.forEach((compte) => {
    const key = (compte.entreprise_id ?? '').trim();
    const mail = (compte.email ?? '').trim();
    if (compte.b2b_alertes_email === false) return;
    if (key && mail && !inbox.has(key)) inbox.set(key, mail);
  });

  const site = siteUrl();
  const accountLink = site ? `${site}/compte#demandes-b2b` : '';

  const byDest = new Map<string, LateRow[]>();
  rows.forEach((row) => {
    const list = byDest.get(row.dest_id) ?? [];
    list.push(row);
    byDest.set(row.dest_id, list);
  });

  /* Reminded whatever happens on the mail side: a request is never chased twice
     for the same reason. Clearing the push-back date ends the silence. */
  const stamp = async (ids: string[]) => {
    if (ids.length === 0) return;
    await admin
      .from('paperatlas_demandes_b2b')
      .update({ rappel_at: new Date().toISOString(), snooze_at: null })
      .in('id', ids);
  };

  let sent = 0;
  const silent: string[] = [];

  for (const [destId, list] of byDest) {
    const to = inbox.get(destId);
    const ids = list.map((row) => row.id);

    /* No mailbox, or alerts switched off: nothing to send, but still stamped so
       the sweep does not keep coming back to the same rows every hour. */
    if (!to) {
      silent.push(destId);
      await stamp(ids);
      continue;
    }

    const name = String(list[0].dest_name ?? 'votre atelier');
    const res = await sendMailMessage({
      to,
      subject:
        list.length === 1
          ? `Rappel · demande B2B en attente · ${list[0].reference}`
          : `Rappel · ${list.length} demandes B2B en attente`,
      html: buildHtml(name, list, accountLink),
      text: buildText(name, list, accountLink),
    });
    if (!res.ok && res.detail === 'network') {
      /* Network hiccup: leave the rows unstamped so the next run retries them. */
      continue;
    }
    if (res.ok) sent += 1;
    await stamp(ids);
  }

  return json({ ok: true, sent, workshops: byDest.size, silent: silent.length, rows: rows.length });
});
