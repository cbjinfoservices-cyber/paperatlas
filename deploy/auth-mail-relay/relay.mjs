import { timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createSecureContext } from 'node:tls';
import { simpleParser } from 'mailparser';
import { SMTPServer } from 'smtp-server';

const MAX_BYTES = 256 * 1024;
const SENDER = 'noreply@paperatlas.net';

function equalSecret(actual, expected) {
  const left = Buffer.from(actual);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function smtpError(message, responseCode = 451) {
  return Object.assign(new Error(message), { responseCode });
}

export async function forwardMessage(stream, session, { apiKey, send = fetch }) {
  const message = await simpleParser(stream, {
    skipHtmlToText: true,
    skipTextToHtml: true,
    skipImageLinks: true,
  });
  if (stream.sizeExceeded) throw smtpError('Message too large', 552);
  if (message.attachments.length || message.from?.value.length !== 1 ||
      message.from.value[0].address?.toLowerCase() !== SENDER ||
      !message.subject || (!message.html && !message.text) ||
      (message.replyTo && message.replyTo.value.length !== 1)) {
    throw smtpError('Unsupported message', 554);
  }
  const sender = message.from.value[0];
  const replyTo = message.replyTo?.value[0];
  if (replyTo && !replyTo.address) throw smtpError('Invalid reply-to', 554);
  const payload = {
    sender: { email: SENDER, ...(sender.name ? { name: sender.name } : {}) },
    to: session.envelope.rcptTo.map(({ address }) => ({ email: address })),
    subject: message.subject,
    ...(message.html ? { htmlContent: message.html } : {}),
    ...(message.text ? { textContent: message.text } : {}),
    ...(replyTo ? { replyTo: { email: replyTo.address, ...(replyTo.name ? { name: replyTo.name } : {}) } } : {}),
  };
  const response = await send('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    console.error(`Brevo rejected message: HTTP ${response.status}`);
    throw smtpError('Mail provider rejected message');
  }
}

export function createRelay({ username, password, apiKey, certPath, keyPath, send }) {
  if (!username || !apiKey || !certPath || !keyPath || !password || password.length < 32) {
    throw new Error('Missing relay configuration or SMTP password shorter than 32 characters');
  }
  const readCertificate = () => ({
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
  });
  const server = new SMTPServer({
    ...readCertificate(),
    name: 'paperatlas.net',
    SNICallback(_hostname, callback) {
      try {
        callback(null, createSecureContext(readCertificate()));
      } catch (error) {
        callback(error);
      }
    },
    authMethods: ['PLAIN', 'LOGIN'],
    authOptional: false,
    allowInsecureAuth: false,
    size: MAX_BYTES,
    maxClients: 10,
    socketTimeout: 30000,
    onConnect(session, callback) {
      console.log(`Connection from ${session.remoteAddress}`);
      callback();
    },
    onAuth(auth, _session, callback) {
      if (equalSecret(auth.username, username) && equalSecret(auth.password, password)) {
        console.log('AUTH accepted');
        callback(null, { user: username });
      } else {
        console.error('AUTH rejected');
        callback(smtpError('Invalid credentials', 535));
      }
    },
    onMailFrom(address, _session, callback) {
      if (address.address.toLowerCase() !== SENDER) console.error('MAIL FROM rejected: unexpected sender');
      callback(address.address.toLowerCase() === SENDER ? null : smtpError('Invalid sender', 553));
    },
    onRcptTo(_address, session, callback) {
      callback(session.envelope.rcptTo.length < 10 ? null : smtpError('Too many recipients', 452));
    },
    onData(stream, session, callback) {
      forwardMessage(stream, session, { apiKey, send }).then(
        () => {
          console.log(`Message accepted by Brevo for ${session.envelope.rcptTo.length} recipient(s)`);
          callback();
        },
        (error) => {
          if (!error.responseCode) console.error('Mail forwarding failed:', error.name);
          callback(error.responseCode ? error : smtpError('Mail provider unavailable'));
        },
      );
    },
  });
  server.on('error', (error) => console.error('SMTP server error:', error.message));
  return server;
}
