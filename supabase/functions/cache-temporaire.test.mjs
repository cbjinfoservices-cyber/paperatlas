import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

const { outputText } = ts.transpileModule(
  readFileSync(new URL('./_shared/cacheTemporaire.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
);
const sandbox = { exports: {} };
runInNewContext(outputText, sandbox);
const { creerCacheTemporaire } = sandbox.exports;

function horloge(start = 0) {
  let now = start;
  return { now: () => now, avance: (ms) => { now += ms; } };
}

test('returns the cached value until the TTL expires', async () => {
  const temps = horloge();
  let appels = 0;
  const lire = creerCacheTemporaire({
    ttlMs: 1000,
    charger: async () => { appels += 1; return appels; },
    valide: () => true,
    maintenant: temps.now,
  });

  assert.equal(await lire(null), 1);
  temps.avance(999);
  assert.equal(await lire(null), 1);
  temps.avance(1);
  assert.equal(await lire(null), 2);
  assert.equal(appels, 2);
});

test('does not cache values rejected by the validator', async () => {
  let appels = 0;
  const lire = creerCacheTemporaire({
    ttlMs: 1000,
    charger: async () => { appels += 1; return appels === 1 ? NaN : 7; },
    valide: (valeur) => Number.isInteger(valeur),
  });

  assert.ok(Number.isNaN(await lire(null)));
  assert.equal(await lire(null), 7);
  assert.equal(await lire(null), 7);
  assert.equal(appels, 2);
});

test('propagates loader errors without caching them', async () => {
  let appels = 0;
  const lire = creerCacheTemporaire({
    ttlMs: 1000,
    charger: async () => {
      appels += 1;
      if (appels === 1) throw new Error('database unavailable');
      return 3;
    },
    valide: () => true,
  });

  await assert.rejects(lire(null), /database unavailable/);
  assert.equal(await lire(null), 3);
  assert.equal(appels, 2);
});
