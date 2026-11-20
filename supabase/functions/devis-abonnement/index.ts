import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getMailConfig, sendMailMessage, siteUrl } from '../_shared/mail.ts';

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

/** A date the requester picked, kept only when it is a real calendar day. */
const cleanDate = (value: unknown): string => {
  const raw = clean(value, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : '';
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

type Lang = 'fr' | 'ar' | 'en';

const LANG_OF = (value: unknown): Lang => {
  const raw = clean(value, 4).toLowerCase();
  return raw === 'ar' || raw === 'en' ? raw : 'fr';
};

type MailKind = 'recap' | 'resend' | 'relance';

type Copy = {
  subject: string;
  relanceSubject: string;
  hello: string;
  intro: string;
  introResend: string;
  introRelance: string;
  refLine: string;
  amount: string;
  structure: string;
  startOn: string;
  plan: string;
  sites: string;
  market: string;
  rhythm: string;
  monthly: string;
  total: string;
  lines: string;
  next: string;
  nextRelance: string;
  account: string;
  follow: string;
  footer: string;
};

const COPY: Record<Lang, Copy> = {
  fr: {
    subject: 'Votre devis d’abonnement PaperAtlas',
    relanceSubject: 'Votre devis PaperAtlas vous attend toujours',
    hello: 'Bonjour',
    intro: 'Voici le récapitulatif du devis d’abonnement que vous venez de composer sur PaperAtlas.',
    introResend:
      'Voici de nouveau le récapitulatif de votre devis d’abonnement, comme vous l’avez demandé. Le montant et la référence sont inchangés.',
    introRelance:
      'Votre devis d’abonnement nous est parvenu il y a une semaine et attend encore votre retour. Il reste valable, avec ce montant :',
    refLine: 'Référence du dossier',
    amount: 'Montant de votre devis',
    structure: 'Structure',
    startOn: 'Mise en route souhaitée',
    plan: 'Formule',
    sites: 'Établissements',
    market: 'Marché',
    rhythm: 'Durée retenue',
    monthly: 'Total mensuel',
    total: 'Montant retenu',
    lines: 'Le détail',
    next: 'Un référent reprend votre demande et confirme ce montant avant toute facturation.',
    nextRelance:
      'Répondez simplement à cet e-mail si le devis vous convient, ou si le nombre d’établissements a changé : le montant sera réajusté.',
    account: 'Retrouver mes devis',
    follow: 'Suivre ce dossier',
    footer:
      'PaperAtlas · vous recevez cet e-mail parce qu’une demande de devis a été envoyée avec cette adresse.',
  },
  ar: {
    subject: 'عرض سعر الاشتراك الخاص بك على PaperAtlas',
    relanceSubject: 'عرض سعرك على PaperAtlas ما زال في انتظارك',
    hello: 'مرحبًا',
    intro: 'هذا ملخص عرض سعر الاشتراك الذي كوّنته للتو على PaperAtlas.',
    introResend: 'هذا ملخص عرض سعر اشتراكك مرة أخرى، كما طلبت. المبلغ والمرجع لم يتغيرا.',
    introRelance: 'وصلنا عرض سعر اشتراكك قبل أسبوع وما زال ينتظر ردّك. وهو صالح بهذا المبلغ:',
    refLine: 'مرجع الملف',
    amount: 'مبلغ عرض السعر',
    structure: 'المؤسسة',
    startOn: 'تاريخ بدء الاشتراك المطلوب',
    plan: 'الصيغة',
    sites: 'المؤسسات',
    market: 'السوق',
    rhythm: 'المدة المعتمدة',
    monthly: 'المجموع الشهري',
    total: 'المبلغ المعتمد',
    lines: 'التفصيل',
    next: 'يتولى مرافق طلبك ويؤكد هذا المبلغ قبل أي فاتورة.',
    nextRelance: 'أجب على هذا البريد إن كان العرض يناسبك، أو إن تغيّر عدد المؤسسات، وسيُعدّل المبلغ.',
    account: 'عرض عروضي',
    follow: 'تابع هذا الملف',
    footer: 'PaperAtlas · تستلم هذا البريد لأن طلب عرض سعر أُرسل بهذا العنوان.',
  },
  en: {
    subject: 'Your PaperAtlas subscription quote',
    relanceSubject: 'Your PaperAtlas quote is still waiting',
    hello: 'Hello',
    intro: 'Here is the summary of the subscription quote you just built on PaperAtlas.',
    introResend:
      'Here again is the summary of your subscription quote, as you asked. The amount and reference are unchanged.',
    introRelance:
      'Your subscription quote reached us a week ago and is still waiting for your reply. It remains valid, with this amount:',
    refLine: 'File reference',
    amount: 'Your quote amount',
    structure: 'Organisation',
    startOn: 'Desired start date',
    plan: 'Plan',
    sites: 'Establishments',
    market: 'Market',
    rhythm: 'Length retained',
    monthly: 'Monthly total',
    total: 'Retained amount',
    lines: 'The detail',
    next: 'A contact picks your request up and confirms this amount before any billing.',
    nextRelance:
      'Just reply to this email if the quote suits you, or if the number of establishments changed: the amount will be adjusted.',
    account: 'My quotes',
    follow: 'Follow this file',
    footer: 'PaperAtlas · you receive this email because a quote request was sent with this address.',
  },
};

type BulkCopy = {
  subject: string;
  intro: string;
  next: string;
  waiting: string;
};

/** The grouped recap: one mail for every overdue file the requester ticked. */
const BULK_COPY: Record<Lang, BulkCopy> = {
  fr: {
    subject: 'Vos devis en attente',
    intro:
      'Voici le récapitulatif groupé des devis qui attendent encore votre réponse. Un seul message, tous vos dossiers en cours.',
    next:
      'Répondez simplement à cet e-mail si l’un de ces devis vous convient, ou si le nombre d’établissements a changé : un référent reprend le dossier et confirme le montant.',
    waiting: 'en attente depuis {n} jours',
  },
  ar: {
    subject: 'عروضك في الانتظار',
    intro: 'هذا ملخص جماعي للعروض التي ما زالت تنتظر ردّك. رسالة واحدة لكل ملفاتك الجارية.',
    next: 'أجب على هذا البريد إن كان أحد هذه العروض يناسبك، أو إن تغيّر عدد المؤسسات: يتولى مرافق الملف ويؤكد المبلغ.',
    waiting: 'ينتظر منذ {n} يومًا',
  },
  en: {
    subject: 'Your quotes are waiting',
    intro:
      'Here is the grouped summary of the quotes still waiting for your reply. One single message, all your open files.',
    next:
      'Just reply to this email if one of these quotes suits you, or if the number of establishments changed: a contact picks the file up and confirms the amount.',
    waiting: 'waiting for {n} days',
  },
};

function makeReference() {
  const now = new Date();
  const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DEV-${now.getFullYear()}-${tail}`;
}

type Quote = {
  reference: string;
  nom: string;
  email: string;
  telephone: string;
  organisation: string;
  formule: string;
  formuleId: string;
  etablissements: number;
  marche: string;
  marcheCode: string;
  devise: string;
  rythme: string;
  montantMensuel: string;
  montantTotal: string;
  miseEnRoute: string;
  resume: string[];
  message: string;
  source: string;
  lang: Lang;
};

function readQuote(body: Record<string, unknown>): Quote | null {
  const nom = clean(body.nom, 120);
  const email = clean(body.email, 160);
  if (!nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

  const message = String(body.message ?? '').slice(0, 500);
  const sites = Number(body.etablissements);
  const resume = Array.isArray(body.resume)
    ? body.resume.map((line) => clean(line, 200)).filter(Boolean).slice(0, 12)
    : [];

  return {
    reference: clean(body.reference, 40) || makeReference(),
    nom,
    email,
    telephone: clean(body.telephone, 40),
    organisation: clean(body.organisation, 160),
    formule: clean(body.formule, 80),
    formuleId: clean(body.formuleId, 40),
    etablissements: Number.isFinite(sites) && sites > 0 ? Math.round(sites) : 1,
    marche: clean(body.marche, 80),
    marcheCode: clean(body.marcheCode, 8),
    devise: clean(body.devise, 8),
    /* « Trimestriel · 3 mois » already fills twenty characters: the length's
       own name must never be truncated, in French, English or Arabic. */
    rythme: clean(body.rythme, 60),
    montantMensuel: clean(body.montantMensuel, 40),
    montantTotal: clean(body.montantTotal, 40),
    miseEnRoute: cleanDate(body.miseEnRoute),
    resume,
    message,
    source: clean(body.source, 40),
    lang: LANG_OF(body.lang),
  };
}

type Row = Record<string, unknown>;

function quoteFromRow(row: Row, lang: Lang = 'fr'): Quote {
  const resumeRaw = typeof row.resume === 'string' ? row.resume : '';
  return {
    reference: clean(row.reference, 40) || makeReference(),
    nom: clean(row.nom, 120) || 'PaperAtlas',
    email: clean(row.email, 160),
    telephone: clean(row.telephone, 40),
    organisation: clean(row.organisation, 160),
    formule: clean(row.formule, 80),
    formuleId: clean(row.formule_id, 40),
    etablissements: Number(row.etablissements) > 0 ? Number(row.etablissements) : 1,
    marche: clean(row.marche, 80),
    marcheCode: clean(row.marche_code, 8),
    devise: clean(row.devise, 8),
    rythme: clean(row.rythme, 60),
    montantMensuel: clean(row.montant_mensuel, 40),
    montantTotal: clean(row.montant_total, 40),
    miseEnRoute: cleanDate(row.mise_en_route),
    resume: resumeRaw
      .split('|')
      .map((line) => clean(line, 200))
      .filter(Boolean)
      .slice(0, 12),
    message: '',
    source: clean(row.source, 40),
    lang,
  };
}

const LOCALES: Record<Lang, string> = { fr: 'fr-FR', ar: 'ar-DZ', en: 'en-GB' };

/** A calendar day picked in the form (« 2026-03-12 »), read in the language of
 *  the file. Read as a local day, so no timezone can show the day before. */
function longDate(iso: string, lang: Lang): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(LOCALES[lang], { dateStyle: 'long' }).format(date);
  } catch {
    return iso;
  }
}

function buildEmail(quote: Quote, siteUrl: string, kind: MailKind) {
  const copy = COPY[quote.lang];
  const accountLink = siteUrl ? `${siteUrl}/compte#mes-devis` : '';
  /* The reminder and the re-sent summary open the file directly: the reference
     travels in the link, so nobody has to copy it out of the mail. */
  const followLink =
    kind === 'relance' || kind === 'resend'
      ? siteUrl
        ? `${siteUrl}/suivi?ref=${encodeURIComponent(quote.reference)}`
        : ''
      : '';

  const intro =
    kind === 'resend' ? copy.introResend : kind === 'relance' ? copy.introRelance : copy.intro;
  const next = kind === 'relance' ? copy.nextRelance : copy.next;

  const rows: Array<[string, string]> = [
    [copy.structure, quote.organisation],
    [copy.plan, quote.formule],
    [copy.sites, String(quote.etablissements)],
    [copy.market, quote.marche],
    [copy.rhythm, quote.rythme],
    [copy.startOn, longDate(quote.miseEnRoute, quote.lang)],
    [copy.monthly, quote.montantMensuel],
  ].filter((row) => Boolean(row[1])) as Array<[string, string]>;

  const tail = quote.resume.filter(
    (line) => !rows.some(([, value]) => value && line.endsWith(value)),
  );

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">${escapeHtml(copy.hello)} ${escapeHtml(quote.nom)},</p>
    <p style="margin:0 0 20px">${escapeHtml(intro)}</p>
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(copy.refLine)}</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;letter-spacing:.04em;color:#b8621c">${escapeHtml(quote.reference)}</p>
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(copy.amount)}</p>
    <p style="margin:0 0 20px;font-size:26px;font-weight:700;color:#211d18">${escapeHtml(quote.montantTotal || quote.montantMensuel)}</p>
    <table style="border-collapse:collapse;margin:0 0 20px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#8a7f6f">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('\n')}
    </table>
    ${
      tail.length
        ? `<p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(copy.lines)}</p>
    <ul style="margin:0 0 20px;padding-inline-start:18px">
      ${tail.map((line) => `<li>${escapeHtml(line)}</li>`).join('\n')}
    </ul>`
        : ''
    }
    ${
      quote.message
        ? `<blockquote style="margin:0 0 20px;padding:10px 14px;border-left:3px solid #e8822f;background:#f7f1e6">
      ${escapeHtml(quote.message).replace(/\n/g, '<br />')}</blockquote>`
        : ''
    }
    <p style="margin:0 0 16px">${escapeHtml(next)}</p>
    ${
      followLink
        ? `<p style="margin:0 0 12px"><a href="${escapeHtml(followLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            ${escapeHtml(copy.follow)}</a></p>`
        : ''
    }
    ${
      accountLink
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;border:1px solid #e8822f;color:#b8621c;text-decoration:none;font-weight:600">
            ${escapeHtml(copy.account)}</a></p>`
        : ''
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}</p>
  </div>`;

  const text = [
    `${copy.hello} ${quote.nom},`,
    '',
    intro,
    '',
    `${copy.refLine} : ${quote.reference}`,
    `${copy.amount} : ${quote.montantTotal || quote.montantMensuel}`,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    '',
    ...tail,
    quote.message ? `\n${quote.message}` : '',
    '',
    next,
    followLink ? `${copy.follow} : ${followLink}` : '',
    accountLink ? `${copy.account} : ${accountLink}` : '',
  ]
    .filter((line) => Boolean(line))
    .join('\n');

  const subject = kind === 'relance' ? copy.relanceSubject : copy.subject;

  return { subject: `${subject} · ${quote.reference}`, html, text };
}

/* ---- the file changes state: the requester is told, in his own language ---- */

type StatutMail = 'en_etude' | 'confirme' | 'expire';

const STATUTS_MAIL: StatutMail[] = ['en_etude', 'confirme', 'expire'];

type StatutWord = { subject: string; line: string; next: string; cta: string; badge: string };

const STATUT_COPY: Record<Lang, Record<StatutMail, StatutWord>> = {
  fr: {
    en_etude: {
      subject: 'Votre devis est pris en étude',
      line: 'Votre dossier vient de passer en étude : un référent vérifie le périmètre, le nombre d’établissements et le montant.',
      next: 'Aucune action n’est attendue de votre part : un message vous préviendra dès que le devis sera confirmé.',
      cta: 'Suivre ce dossier',
      badge: 'En étude',
    },
    confirme: {
      subject: 'Votre devis est confirmé',
      line: 'Votre devis est confirmé : le montant retenu est celui affiché ci-dessous, et il ne bouge plus sans votre accord.',
      next: 'Un référent revient vers vous pour la mise en route de l’abonnement et la facturation.',
      cta: 'Suivre ce dossier',
      badge: 'Confirmé',
    },
    expire: {
      subject: 'Votre devis a expiré',
      line: 'Votre devis a expiré sans réponse : le montant ci-dessous n’est plus engagé.',
      next: 'Vous pouvez en composer un nouveau quand vous voulez : le montant sera recalculé au tarif du jour.',
      cta: 'Suivre ce dossier',
      badge: 'Expiré',
    },
  },
  ar: {
    en_etude: {
      subject: 'عرض سعرك قيد الدراسة',
      line: 'انتقل ملفك إلى مرحلة الدراسة: يتحقق مرافق من النطاق وعدد المؤسسات والمبلغ.',
      next: 'لا يُطلب منك أي إجراء: ستصلك رسالة حين يُؤكد عرض السعر.',
      cta: 'تابع هذا الملف',
      badge: 'قيد الدراسة',
    },
    confirme: {
      subject: 'تم تأكيد عرض سعرك',
      line: 'تم تأكيد عرض سعرك: المبلغ المعتمد هو المبيّن أدناه، ولا يتغير دون موافقتك.',
      next: 'يعود إليك مرافق لبدء الاشتراك وإصدار الفاتورة.',
      cta: 'تابع هذا الملف',
      badge: 'مؤكد',
    },
    expire: {
      subject: 'انتهت صلاحية عرض سعرك',
      line: 'انتهت صلاحية عرض سعرك دون رد: المبلغ أدناه لم يعد ملزمًا.',
      next: 'يمكنك تكوين عرض جديد متى شئت: سيُعاد حساب المبلغ بسعر اليوم.',
      cta: 'تابع هذا الملف',
      badge: 'منتهٍ',
    },
  },
  en: {
    en_etude: {
      subject: 'Your quote is under review',
      line: 'Your file has just moved to review: a contact is checking the scope, the number of establishments and the amount.',
      next: 'Nothing is expected from you: a message will reach you as soon as the quote is confirmed.',
      cta: 'Follow this file',
      badge: 'Under review',
    },
    confirme: {
      subject: 'Your quote is confirmed',
      line: 'Your quote is confirmed: the retained amount is the one below, and it will not move without your agreement.',
      next: 'A contact comes back to you to start the subscription and the billing.',
      cta: 'Follow this file',
      badge: 'Confirmed',
    },
    expire: {
      subject: 'Your quote has expired',
      line: 'Your quote expired without a reply: the amount below is no longer committed.',
      next: 'You can build a new one whenever you like: the amount will be recalculated at the current rate.',
      cta: 'Follow this file',
      badge: 'Expired',
    },
  },
};

function buildStatutEmail(quote: Quote, siteUrl: string, statut: StatutMail) {
  const copy = COPY[quote.lang];
  const word = STATUT_COPY[quote.lang][statut];
  const follow = siteUrl ? `${siteUrl}/suivi?ref=${encodeURIComponent(quote.reference)}` : '';
  const amount = quote.montantTotal || quote.montantMensuel;

  const rows: Array<[string, string]> = [
    [copy.plan, quote.formule],
    [copy.sites, String(quote.etablissements)],
    [copy.market, quote.marche],
    [copy.rhythm, quote.rythme],
    [copy.monthly, quote.montantMensuel],
  ].filter((row) => Boolean(row[1])) as Array<[string, string]>;

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">${escapeHtml(copy.hello)} ${escapeHtml(quote.nom)},</p>
    <p style="margin:0 0 8px">${escapeHtml(word.line)}</p>
    <p style="margin:0 0 20px;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#b8621c">${escapeHtml(word.badge)}</p>
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(copy.refLine)}</p>
    <p style="margin:0 0 20px;font-size:22px;font-weight:700;letter-spacing:.04em;color:#b8621c">${escapeHtml(quote.reference)}</p>
    <p style="margin:0 0 6px;color:#8a7f6f;font-size:12px;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(copy.amount)}</p>
    <p style="margin:0 0 20px;font-size:26px;font-weight:700;color:#211d18">${escapeHtml(amount)}</p>
    <table style="border-collapse:collapse;margin:0 0 20px">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:2px 12px 2px 0;color:#8a7f6f">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('\n')}
    </table>
    <p style="margin:0 0 16px">${escapeHtml(word.next)}</p>
    ${
      follow
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(follow)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            ${escapeHtml(word.cta)}</a></p>`
        : ''
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}</p>
  </div>`;

  const text = [
    `${copy.hello} ${quote.nom},`,
    '',
    word.line,
    '',
    `${copy.refLine} : ${quote.reference}`,
    `${copy.amount} : ${amount}`,
    '',
    ...rows.map(([label, value]) => `${label} : ${value}`),
    '',
    word.next,
    follow ? `${word.cta} : ${follow}` : '',
  ]
    .filter((line) => Boolean(line))
    .join('\n');

  return { subject: `${word.subject} · ${quote.reference}`, html, text };
}

async function sendMail(quote: Quote, kind: MailKind): Promise<boolean> {
  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail || !quote.email) return false;

  const site = siteUrl();
  const mail = buildEmail(quote, site, kind);

  const res = await sendMailMessage({
    to: quote.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  return res.ok;
}

async function sendStatutMail(quote: Quote, statut: StatutMail): Promise<boolean> {
  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail || !quote.email) return false;

  const site = siteUrl();
  const mail = buildStatutEmail(quote, site, statut);

  const res = await sendMailMessage({
    to: quote.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  return res.ok;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * The grouped recap: every ticked file in one single mail, each line carrying
 * its reference, its amount and how long it has been waiting. One message for
 * ten dossiers, instead of ten messages for one reader.
 */
async function sendBulkMail(rows: Row[], to: string): Promise<boolean> {
  const mailCfg = getMailConfig();
  if (!mailCfg.apiKey || !mailCfg.fromEmail || !to || !rows.length) return false;

  const site = siteUrl();
  const lang = LANG_OF(rows[0]?.lang);
  const copy = COPY[lang];
  const bulk = BULK_COPY[lang];
  const accountLink = site ? `${site}/compte#mes-devis` : '';

  const items = rows.map((row) => {
    const quote = quoteFromRow(row, lang);
    const sentAt = new Date(clean(row.created_at, 40)).getTime();
    const days = Number.isFinite(sentAt) ? Math.max(0, Math.floor((Date.now() - sentAt) / DAY)) : 0;
    return { quote, days };
  });

  const nom = items[0]?.quote.nom ?? '';
  const follow = (reference: string) =>
    site ? `${site}/suivi?ref=${encodeURIComponent(reference)}` : '';

  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6;color:#211d18">
    <p style="margin:0 0 16px">${escapeHtml(copy.hello)} ${escapeHtml(nom)},</p>
    <p style="margin:0 0 18px">${escapeHtml(bulk.intro)}</p>
    <table style="border-collapse:collapse;width:100%;margin:0 0 20px">
      ${items
        .map(({ quote, days }) => {
          const amount = quote.montantTotal || quote.montantMensuel || '—';
          /* La durée retenue se lit sous la référence, entre la formule et le
             nombre d'établissements : le destinataire sait sur quelle longueur
             chaque dossier est parti, sans ouvrir le site. */
          const detail = [
            quote.formule,
            quote.rythme,
            quote.etablissements ? `${quote.etablissements}` : '',
          ]
            .filter(Boolean)
            .map((part) => escapeHtml(part))
            .join(' · ');
          const link = follow(quote.reference);
          const ref = escapeHtml(quote.reference);
          return `<tr>
            <td style="padding:7px 12px 7px 0;border-bottom:1px solid #ece5d8;vertical-align:top">
              ${
                link
                  ? `<a href="${escapeHtml(link)}" style="color:#b8621c;font-weight:700;text-decoration:none">${ref}</a>`
                  : `<strong>${ref}</strong>`
              }
              <div style="font-size:12px;color:#8a7f6f">${detail}</div>
            </td>
            <td style="padding:7px 0;border-bottom:1px solid #ece5d8;text-align:right;vertical-align:top;white-space:nowrap">
              <strong>${escapeHtml(amount)}</strong>
              <div style="font-size:12px;color:#8a7f6f">${escapeHtml(
                bulk.waiting.replace('{n}', String(days)),
              )}</div>
            </td>
          </tr>`;
        })
        .join('\n')}
    </table>
    <p style="margin:0 0 16px">${escapeHtml(bulk.next)}</p>
    ${
      accountLink
        ? `<p style="margin:0 0 16px"><a href="${escapeHtml(accountLink)}"
            style="display:inline-block;padding:10px 18px;border-radius:999px;background:#e8822f;color:#453020;text-decoration:none;font-weight:600">
            ${escapeHtml(copy.account)}</a></p>`
        : ''
    }
    <p style="margin:0;font-size:12px;color:#8a7f6f">${escapeHtml(copy.footer)}</p>
  </div>`;

  const text = [
    `${copy.hello} ${nom},`,
    '',
    bulk.intro,
    '',
    ...items.map(({ quote, days }) => {
      const amount = quote.montantTotal || quote.montantMensuel || '—';
      /* La version texte porte la même durée que la version HTML : le
         récapitulatif groupé se lit de la même façon dans les deux. */
      const tete = [quote.reference, quote.rythme, amount].filter(Boolean).join(' · ');
      return `${tete} · ${bulk.waiting.replace('{n}', String(days))}`;
    }),
    '',
    bulk.next,
    accountLink ? `${copy.account} : ${accountLink}` : '',
    copy.footer,
  ]
    .filter((line) => Boolean(line))
    .join('\n');

  const subject = `${bulk.subject} · ${items.length} ${
    lang === 'fr' ? 'dossiers' : lang === 'ar' ? 'ملفات' : 'files'
  }`;

  const res = await sendMailMessage({
    to,
    subject,
    html,
    text,
  });
  return res.ok;
}

async function callerOf(req: Request) {
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const authClient = createClient(SUPABASE_URL, ANON_KEY);
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return null;
  return {
    id: data.user.id,
    email: clean(data.user.email, 160).toLowerCase(),
  };
}

const LIST_COLUMNS =
  'reference, formule, etablissements, marche, devise, rythme, montant_total, montant_mensuel, statut, statut_notifie, statut_notifie_at, lang, created_at, relance_envoyee_at, recap_groupe_at';

const FULL_COLUMNS =
  'reference, user_id, nom, email, organisation, formule, formule_id, etablissements, marche, marche_code, devise, rythme, montant_mensuel, montant_total, mise_en_route, resume, message, source, statut, statut_notifie, statut_notifie_at, lang, created_at, relance_envoyee_at';

const SEPT_JOURS = 7 * 24 * 60 * 60 * 1000;

/**
 * The reminder. A file still « Reçu » a week after it was sent gets a second
 * message, with the same reference and the same amount. It leaves once and
 * only once: the date is written on the file, and a file already opened
 * (en étude, confirmé, expiré) is never chased.
 */
async function runRelance(
  admin: ReturnType<typeof createClient>,
  caller: { id: string; email: string },
): Promise<number> {
  const cutoff = new Date(Date.now() - SEPT_JOURS).toISOString();
  const filter = caller.email
    ? `user_id.eq.${caller.id},email.ilike.${caller.email}`
    : `user_id.eq.${caller.id}`;

  const { data, error } = await admin
    .from('paperatlas_devis_abonnement')
    .select(FULL_COLUMNS)
    .eq('statut', 'recu')
    .is('relance_envoyee_at', null)
    .lt('created_at', cutoff)
    .or(filter)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error || !data?.length) return 0;

  let sent = 0;
  for (const row of data as Row[]) {
    const quote = quoteFromRow(row, LANG_OF(row.lang));
    const ok = await sendMail(quote, 'relance');
    if (!ok) continue;
    const { error: mark } = await admin
      .from('paperatlas_devis_abonnement')
      .update({ relance_envoyee_at: new Date().toISOString() })
      .eq('reference', quote.reference)
      .is('relance_envoyee_at', null);
    if (!mark) sent += 1;
  }
  return sent;
}

/**
 * The state of a file is settled by the contact who follows it, in the base.
 * Every read of the requester's files checks whether the state moved since the
 * last message: the state already announced is written on the row, so nothing
 * is said twice, and a message that could not leave stays pending.
 */
async function runStatuts(
  admin: ReturnType<typeof createClient>,
  rows: Row[],
): Promise<number> {
  let sent = 0;
  for (const row of rows) {
    const statut = clean(row.statut, 20) as StatutMail;
    if (!STATUTS_MAIL.includes(statut)) continue;
    if (clean(row.statut_notifie, 20) === statut) continue;

    const quote = quoteFromRow(row, LANG_OF(row.lang));
    if (!quote.email) continue;

    const ok = await sendStatutMail(quote, statut);
    if (!ok) continue;

    /* The date of the message is written with the state it announced, so the
       requester can see in « Mon compte » what has already reached him. */
    const { error: mark } = await admin
      .from('paperatlas_devis_abonnement')
      .update({ statut_notifie: statut, statut_notifie_at: new Date().toISOString() })
      .eq('reference', quote.reference)
      .or(`statut_notifie.is.null,statut_notifie.neq.${statut}`);
    if (!mark) sent += 1;
  }
  return sent;
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

  const action = clean(body.action, 40) || 'submit';

  try {
    const caller = await callerOf(req);
    const userId = caller?.id ?? null;

    if (action === 'list' || action === 'latest' || action === 'resend' || action === 'resend-bulk') {
      if (!caller) return json({ error: 'unauthorized' }, 401);
    }

    if (action === 'list') {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);

      /* The rows as « Mon compte » reads them: own account first, then the
         files sent with the same address before it was signed in. */
      const readRows = async () => {
        const { data, error } = await admin
          .from('paperatlas_devis_abonnement')
          .select(LIST_COLUMNS)
          .eq('user_id', caller!.id)
          .order('created_at', { ascending: false })
          .limit(60);
        if (error) return { rows: null, error };

        let rows = (data ?? []) as Array<{ reference: string; created_at: string }>;
        if (caller!.email) {
          const { data: byMail } = await admin
            .from('paperatlas_devis_abonnement')
            .select(LIST_COLUMNS)
            .is('user_id', null)
            .ilike('email', caller!.email)
            .order('created_at', { ascending: false })
            .limit(60);
          const known = new Set(rows.map((row) => row.reference));
          const extra = ((byMail ?? []) as Array<{ reference: string; created_at: string }>).filter(
            (row) => !known.has(row.reference),
          );
          if (extra.length) {
            rows = [...rows, ...extra].sort((a, b) =>
              a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0,
            );
          }
        }
        return { rows, error: null };
      };

      const first = await readRows();
      if (first.error || !first.rows) {
        return json({ error: 'read', detail: first.error?.message ?? 'read' }, 500);
      }
      let rows = first.rows;

      let relance = 0;
      try {
        relance = await runRelance(admin, caller!);
      } catch {
        relance = 0;
      }

      let statuts = 0;
      try {
        statuts = await runStatuts(admin, rows as Row[]);
      } catch {
        statuts = 0;
      }

      /* A message that left during this very request wrote its date on the
         file: the list is read again so the date on screen is the real one. */
      if (statuts > 0 || relance > 0) {
        const again = await readRows();
        if (again.rows) rows = again.rows;
      }

      return json({ ok: true, devis: rows, relance, statuts });
    }

    if (action === 'latest') {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const filter = caller!.email
        ? `user_id.eq.${caller!.id},email.ilike.${caller!.email}`
        : `user_id.eq.${caller!.id}`;

      /* The strip on « Offres » lets the visitor read it through one state, so
         the files are read as a short list: the newest file of each state is
         taken from it, and the counters on the chips are counted on the very
         same rows — never on a number the strip cannot show. */
      const readRecent = async () => {
        const { data, error } = await admin
          .from('paperatlas_devis_abonnement')
          .select(LIST_COLUMNS)
          .or(filter)
          .order('created_at', { ascending: false })
          .limit(60);
        if (error) return { rows: null, error };
        return { rows: (data ?? []) as Row[], error: null };
      };

      const first = await readRecent();
      if (first.error || !first.rows) {
        return json({ error: 'read', detail: first.error?.message ?? 'read' }, 500);
      }
      let rows = first.rows;

      let relance = 0;
      try {
        relance = await runRelance(admin, caller!);
      } catch {
        /* the reminder never blocks the strip */
      }

      let statuts = 0;
      try {
        statuts = await runStatuts(admin, rows);
      } catch {
        statuts = 0;
      }

      /* A message that left during this request changed the file: the list is
         read again, so the strip shows what is really written in the base. */
      if (statuts > 0 || relance > 0) {
        const again = await readRecent();
        if (again.rows) rows = again.rows;
      }

      return json({ ok: true, devis: rows[0] ?? null, recent: rows });
    }

    if (action === 'resend') {
      const reference = clean(body.reference, 40);
      if (!reference) return json({ error: 'reference' }, 400);

      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data, error } = await admin
        .from('paperatlas_devis_abonnement')
        .select(FULL_COLUMNS)
        .eq('reference', reference)
        .maybeSingle();
      if (error) return json({ error: 'read', detail: error.message }, 500);
      if (!data) return json({ error: 'notfound' }, 404);

      const row = data as Row;
      const owner = clean(row.user_id, 64);
      const ownerMail = clean(row.email, 160).toLowerCase();
      const mine = owner === caller!.id || (!!caller!.email && ownerMail === caller!.email);
      if (!mine) return json({ error: 'forbidden' }, 403);

      const quote = quoteFromRow(row, LANG_OF(row.lang));
      quote.email = ownerMail;
      const emailed = await sendMail(quote, 'resend');
      if (emailed) {
        await admin
          .from('paperatlas_devis_abonnement')
          .update({ email_envoye: true })
          .eq('reference', reference);
      }
      return json({ ok: true, emailed });
    }

    if (action === 'resend-bulk') {
      const asked = Array.isArray(body.references)
        ? body.references.map((value) => clean(value, 40)).filter(Boolean).slice(0, 50)
        : [];
      if (!asked.length) return json({ error: 'references' }, 400);

      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data, error } = await admin
        .from('paperatlas_devis_abonnement')
        .select(FULL_COLUMNS)
        .in('reference', asked);
      if (error) return json({ error: 'read', detail: error.message }, 500);

      /* Only the caller's own files leave: own account first, then the files
         sent with the same address before it was signed in. */
      const mine = new Map<string, Row>();
      (data ?? []).forEach((raw) => {
        const row = raw as Row;
        const reference = clean(row.reference, 40);
        const owner = clean(row.user_id, 64);
        const ownerMail = clean(row.email, 160).toLowerCase();
        const allowed = owner
          ? owner === caller!.id
          : !!caller!.email && ownerMail === caller!.email;
        if (allowed && reference) mine.set(reference, row);
      });

      /* The order of the ticks is kept, so the mail reads like the list. */
      const ordered = asked
        .map((reference) => mine.get(reference))
        .filter((row): row is Row => Boolean(row));
      if (!ordered.length) return json({ error: 'notfound' }, 404);

      const to = caller!.email || clean(ordered[0].email, 160).toLowerCase();
      const emailed = await sendBulkMail(ordered, to);
      /* The day the group left is written on every file it carried: the list
         and the strip can then show that badge instead of guessing from the
         single reminders, which are a different promise. */
      const sentAt = emailed ? new Date().toISOString() : null;
      if (sentAt) {
        const refs = ordered.map((row) => clean(row.reference, 40)).filter(Boolean);
        if (refs.length) {
          await admin
            .from('paperatlas_devis_abonnement')
            .update({ recap_groupe_at: sentAt })
            .in('reference', refs);
        }
      }
      return json({ ok: true, emailed, count: ordered.length, sentAt });
    }

    if (action !== 'submit') return json({ error: 'unknown-action' }, 400);

    const quote = readQuote(body);
    if (!quote) return json({ error: 'invalid' }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { error } = await admin.from('paperatlas_devis_abonnement').insert({
      reference: quote.reference,
      user_id: userId,
      nom: quote.nom,
      email: quote.email,
      telephone: quote.telephone || null,
      organisation: quote.organisation || null,
      formule: quote.formule,
      formule_id: quote.formuleId || null,
      etablissements: quote.etablissements,
      marche: quote.marche || null,
      marche_code: quote.marcheCode || null,
      devise: quote.devise || null,
      rythme: quote.rythme || null,
      montant_mensuel: quote.montantMensuel || null,
      montant_total: quote.montantTotal || null,
      mise_en_route: quote.miseEnRoute || null,
      resume: quote.resume.join(' | '),
      message: quote.message || null,
      source: quote.source || null,
      lang: quote.lang,
      statut_notifie: 'recu',
    });

    if (error) return json({ error: 'insert', detail: error.message }, 500);

    let emailed = false;
    try {
      emailed = await sendMail(quote, 'recap');
    } catch {
      emailed = false;
    }

    if (emailed) {
      /* The recap that left at sending is the first message the file carries:
         its date is kept, so « Mon compte » starts the record there. */
      await admin
        .from('paperatlas_devis_abonnement')
        .update({ email_envoye: true, statut_notifie_at: new Date().toISOString() })
        .eq('reference', quote.reference);
    }

    return json({ ok: true, reference: quote.reference, emailed });
  } catch (err) {
    return json({ error: 'server', detail: err instanceof Error ? err.message : 'unknown' }, 500);
  }
});
