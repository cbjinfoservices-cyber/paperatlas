import { createRelay } from './relay.mjs';

const server = createRelay({
  username: process.env.SMTP_USERNAME,
  password: process.env.SMTP_PASSWORD,
  apiKey: process.env.BREVO_API_KEY,
  certPath: '/tls/tls.crt',
  keyPath: '/tls/tls.key',
});

server.listen(2525, '0.0.0.0', () => console.log('SMTP relay listening on port 2525'));
process.on('SIGTERM', () => server.close());
