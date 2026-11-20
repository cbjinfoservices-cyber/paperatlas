export type MailProvider = 'brevo' | 'resend';

export type MailConfig = {
  provider: MailProvider | null;
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromHeader: string;
  replyTo: string;
};

export function getMailConfig(): MailConfig {
  const brevoKey = (Deno.env.get('BREVO_API_KEY') ?? '').trim();
  const resendKey = (Deno.env.get('RESEND_API_KEY') ?? '').trim();
  const provider: MailProvider | null = brevoKey ? 'brevo' : resendKey ? 'resend' : null;
  const apiKey = brevoKey || resendKey;

  const domain = (
    Deno.env.get('MAIL_FROM_DOMAIN') ??
    Deno.env.get('BREVO_FROM_DOMAIN') ??
    Deno.env.get('RESEND_FROM_DOMAIN') ??
    ''
  )
    .trim()
    .replace(/^@/, '');

  const explicitFrom = (
    Deno.env.get('MAIL_FROM_EMAIL') ??
    Deno.env.get('BREVO_FROM_EMAIL') ??
    ''
  ).trim();

  const fromEmail = explicitFrom || (domain ? `noreply@${domain}` : '');
  const fromHeader = fromEmail ? `PaperAtlas <${fromEmail}>` : '';

  const replyTo = (
    Deno.env.get('MAIL_REPLY_TO') ??
    Deno.env.get('BREVO_REPLY_TO') ??
    Deno.env.get('RESEND_REPLY_TO') ??
    ''
  ).trim();

  return { provider, apiKey, domain, fromEmail, fromHeader, replyTo };
}

export async function sendMailMessage(params: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<{ ok: boolean; status?: number; detail?: string }> {
  const cfg = getMailConfig();
  if (!cfg.provider || !cfg.apiKey || !cfg.fromEmail) {
    return { ok: false, detail: 'email-not-configured' };
  }

  const effectiveReplyTo = (params.replyTo ?? cfg.replyTo).trim();

  try {
    if (cfg.provider === 'brevo') {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': cfg.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'PaperAtlas', email: cfg.fromEmail },
          to: [{ email: params.to }],
          ...(effectiveReplyTo ? { replyTo: { email: effectiveReplyTo } } : {}),
          subject: params.subject,
          htmlContent: params.html,
          ...(params.text ? { textContent: params.text } : {}),
        }),
      });
      if (!response.ok) {
        return { ok: false, status: response.status, detail: await response.text() };
      }
      return { ok: true, status: response.status };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: cfg.fromHeader,
        to: [params.to],
        ...(effectiveReplyTo ? { reply_to: effectiveReplyTo } : {}),
        subject: params.subject,
        html: params.html,
        ...(params.text ? { text: params.text } : {}),
      }),
    });
    if (!response.ok) {
      return { ok: false, status: response.status, detail: await response.text() };
    }
    return { ok: true, status: response.status };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : 'network',
    };
  }
}

export type DomainCheckResult = {
  provider: MailProvider | null;
  configured: boolean;
  key: boolean;
  domain: string;
  checked: boolean;
  found: boolean;
  verified: boolean;
  status: string;
  reason?: string;
  message?: string;
  region?: string;
};

export async function verifySenderDomain(): Promise<DomainCheckResult> {
  const cfg = getMailConfig();
  const base: DomainCheckResult = {
    provider: cfg.provider,
    configured: Boolean(cfg.apiKey && cfg.domain),
    key: Boolean(cfg.apiKey),
    domain: cfg.domain,
    checked: false,
    found: false,
    verified: false,
    status: '',
  };

  if (!cfg.apiKey || !cfg.provider) {
    return { ...base, reason: 'no-key' };
  }
  if (!cfg.domain) {
    return { ...base, reason: 'no-domain' };
  }

  try {
    if (cfg.provider === 'brevo') {
      const response = await fetch('https://api.brevo.com/v3/senders/domains', {
        method: 'GET',
        headers: {
          'api-key': cfg.apiKey,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        const detail = await response.text();
        const portee = response.status === 401 || response.status === 403;
        return {
          ...base,
          reason: portee ? 'key-scope' : 'api',
          status: portee ? 'key-scope' : 'api',
          message: detail.slice(0, 300),
        };
      }
      const payload = (await response.json()) as {
        domains?: Array<{ domain_name?: string; verified?: boolean; authenticated?: boolean }>;
      };
      const wanted = cfg.domain.toLowerCase();
      const found = (payload.domains ?? []).find(
        (row) => (row.domain_name ?? '').trim().toLowerCase() === wanted,
      );
      if (!found) {
        return { ...base, checked: true, found: false, verified: false, status: 'absent' };
      }
      const verified = Boolean(found.verified || found.authenticated);
      return {
        ...base,
        checked: true,
        found: true,
        verified,
        status: verified ? 'verified' : 'pending',
      };
    }

    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: { Authorization: `Bearer ${cfg.apiKey}` },
    });
    if (!response.ok) {
      const detail = await response.text();
      const portee = response.status === 401 || response.status === 403;
      return {
        ...base,
        reason: portee ? 'key-scope' : 'api',
        status: portee ? 'key-scope' : 'api',
        message: detail.slice(0, 300),
      };
    }
    const payload = (await response.json()) as {
      data?: Array<{ name?: string; status?: string; region?: string }>;
    };
    const wanted = cfg.domain.toLowerCase();
    const trouve = (payload.data ?? []).find(
      (row) => (row.name ?? '').trim().toLowerCase() === wanted,
    );
    if (!trouve) {
      return { ...base, checked: true, found: false, verified: false, status: 'absent' };
    }
    const etat = String(trouve.status ?? '').toLowerCase();
    return {
      ...base,
      checked: true,
      found: true,
      verified: etat === 'verified',
      status: etat || 'unknown',
      region: trouve.region ?? '',
    };
  } catch (err) {
    return {
      ...base,
      reason: 'network',
      status: 'network',
      message: err instanceof Error ? err.message : 'unknown',
    };
  }
}
