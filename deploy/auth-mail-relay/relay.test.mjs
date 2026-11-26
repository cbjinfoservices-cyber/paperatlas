import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createConnection } from 'node:net';
import { after, before, test } from 'node:test';
import nodemailer from 'nodemailer';
import getTLSOptions from 'smtp-server/lib/tls-options.js';
import { createRelay } from './relay.mjs';

const directory = mkdtempSync(join(tmpdir(), 'paperatlas-relay-test-'));
const certPath = join(directory, 'cert.pem');
const keyPath = join(directory, 'key.pem');
const { cert, key } = getTLSOptions();
writeFileSync(certPath, cert);
writeFileSync(keyPath, key);
const sent = [];
let status = 201;
const server = createRelay({
  username: 'test',
  password: 'a'.repeat(40),
  apiKey: 'test-api-key',
  certPath,
  keyPath,
  send: async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return { ok: status < 300, status };
  },
});
let port;
before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  port = server.server.address().port;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  rmSync(directory, { recursive: true, force: true });
});

function transport(password = 'a'.repeat(40)) {
  return nodemailer.createTransport({
    host: '127.0.0.1', port, requireTLS: true,
    tls: { rejectUnauthorized: false }, auth: { user: 'test', pass: password },
  });
}

test('preserves the message and envelope recipients through STARTTLS', async () => {
  await transport().sendMail({
    from: 'PaperAtlas <noreply@paperatlas.net>',
    to: 'first@example.com, second@example.com',
    subject: 'Invitation',
    text: 'Votre invitation',
    html: '<p>Votre invitation</p>',
  });
  assert.deepEqual(sent[0].to, [{ email: 'first@example.com' }, { email: 'second@example.com' }]);
  assert.equal(sent[0].sender.email, 'noreply@paperatlas.net');
  assert.equal(sent[0].subject, 'Invitation');
  assert.equal(sent[0].textContent.trim(), 'Votre invitation');
  assert.equal(sent[0].htmlContent.trim(), '<p>Votre invitation</p>');
});

test('rejects invalid credentials and unauthorized senders', async () => {
  await assert.rejects(transport('wrong').sendMail({
    from: 'noreply@paperatlas.net', to: 'first@example.com', subject: 'Test', text: 'Test',
  }), /535/);
  await assert.rejects(transport().sendMail({
    from: 'other@example.com', to: 'first@example.com', subject: 'Test', text: 'Test',
  }), /553/);
  assert.equal(sent.length, 1);
});

test('rejects authentication before TLS', async () => {
  const socket = createConnection({ host: '127.0.0.1', port });
  let transcript = '';
  let step = 0;
  await new Promise((resolve, reject) => {
    socket.on('error', reject);
    socket.on('data', (data) => {
      transcript += data.toString();
      if (step === 0 && transcript.includes('220 ')) {
        step = 1;
        socket.write('EHLO test.example\r\n');
      } else if (step === 1 && transcript.includes('250 SIZE')) {
        step = 2;
        socket.write('AUTH PLAIN\r\n');
      } else if (step === 2 && transcript.includes('538 ')) {
        resolve();
      }
    });
  });
  socket.destroy();
  assert.match(transcript, /STARTTLS/);
  assert.match(transcript, /538 /);
});

test('rejects attachments rather than dropping them', async () => {
  await assert.rejects(transport().sendMail({
    from: 'noreply@paperatlas.net', to: 'first@example.com', subject: 'Test',
    text: 'Test', attachments: [{ filename: 'test.txt', content: 'attachment' }],
  }), /554/);
  assert.equal(sent.length, 1);
});

test('does not report success when the provider rejects the message', async () => {
  status = 403;
  await assert.rejects(transport().sendMail({
    from: 'noreply@paperatlas.net', to: 'first@example.com', subject: 'Test', text: 'Test',
  }), /451/);
});
