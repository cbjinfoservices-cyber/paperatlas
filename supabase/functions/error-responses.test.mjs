import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

for (const name of ['demandes-b2b', 'devis-abonnement']) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(`./${name}/index.ts`, import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  );

  for (const [label, failure, detail] of [
    ['Supabase error', { code: '42501', message: 'permission denied for table' }, 'permission denied for table'],
    ['native error', new Error('network failure'), 'network failure'],
    ['unexpected value', null, 'unknown'],
  ]) {
    test(`${name}: ${label} is logged and returned as a CORS-enabled 500`, async () => {
      let handler;
      const logs = [];
      runInNewContext(outputText, {
        exports: {},
        require(specifier) {
          if (specifier === 'https://esm.sh/@supabase/supabase-js@2') {
            return {
              createClient: () => ({
                auth: { getUser: async () => { throw failure; } },
              }),
            };
          }
          if (specifier === '../_shared/mail.ts') return {};
          throw new Error(`Unexpected import: ${specifier}`);
        },
        Deno: {
          env: { get: () => 'test' },
          serve: (callback) => { handler = callback; },
        },
        console: { error: (...args) => logs.push(args) },
        Request,
        Response,
      });

      const response = await handler(new Request('https://example.test', {
        method: 'POST',
        headers: { Authorization: 'Bearer test', 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list' }),
      }));

      assert.equal(response.status, 500);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), '*');
      assert.deepEqual(await response.json(), { error: 'server', detail });
      assert.deepEqual(logs, [[`[${name}]`, failure]]);
    });
  }
}
