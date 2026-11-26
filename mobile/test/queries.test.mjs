import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';
import { conversations, publishedListings, searchDirectory } from '../src/queries.ts';
import { directoryMapHtml, mapLocations } from '../src/directory-map-html.ts';
import { wilayaMapPoints } from '../src/wilaya-map.ts';
import directoryData from '../src/directory-data.json' with { type: 'json' };

function mockBackend() {
  const requests = [];
  const db = createClient('https://paperatlas.invalid', 'test-key', {
    auth: { persistSession: false },
    global: {
      fetch: async input => {
        requests.push(new URL(input));
        return Response.json([]);
      },
    },
  });
  return { db, requests, signal: new AbortController().signal };
}

test('directory searches Unicode names without treating punctuation as a filter', async () => {
  const { db, requests, signal } = mockBackend();
  await searchDirectory(db, '  مطبعة, (Étoile)_% ', signal);
  assert.equal(requests[0].pathname, '/rest/v1/paperatlas_membres');
  assert.equal(requests[0].searchParams.get('role'), 'eq.pro');
  assert.match(requests[0].searchParams.get('or'), /nom\.ilike\.%مطبعة%Étoile%/u);
  assert.equal(requests[0].searchParams.get('or').split(',').length, 5);
});

test('job offers never include unpublished or non-job posts', async () => {
  const { db, requests, signal } = mockBackend();
  await publishedListings(db, 'offre', signal);
  assert.equal(requests[0].searchParams.get('kind'), 'eq.offre');
  assert.equal(requests[0].searchParams.get('statut'), 'eq.publie');
});

test('listing filters apply category and location before the result limit', async () => {
  const { db, requests, signal } = mockBackend();
  await publishedListings(db, 'offre', signal, { category: 'cdi', country: 'DZ', region: 'El, Harrach' });
  const params = requests[0].searchParams;
  assert.equal(params.get('rubrique'), 'eq.cdi');
  assert.deepEqual(params.getAll('or'), [
    '(pays.eq.DZ,pays.is.null,pays.eq.)',
    '(wilaya.ilike.%El%Harrach%,commune.ilike.%El%Harrach%)',
  ]);
  assert.equal(params.get('statut'), 'eq.publie');
  assert.equal(params.get('limit'), '60');
});

test('member search combines text and location without mixing their OR clauses', async () => {
  const { db, requests, signal } = mockBackend();
  await searchDirectory(db, 'atelier', signal, { country: 'TN', region: 'Grand Tunis' });
  const params = requests[0].searchParams;
  assert.equal(params.get('pays'), 'eq.TN');
  assert.equal(params.get('wilaya'), 'ilike.%Grand%Tunis%');
  assert.match(params.get('or'), /nom\.ilike\.%atelier%/);
});

test('the inbox requests only threads involving the current account', async () => {
  const { db, requests, signal } = mockBackend();
  const user = '13ec8e42-79ed-411d-aa15-98cefe6a7acd';
  await conversations(db, user, signal);
  assert.equal(requests[0].searchParams.get('or'), `(user_a.eq.${user},user_b.eq.${user})`);
});

test('mobile geographic data ships no establishment fixtures', () => {
  assert.deepEqual(Object.keys(directoryData).sort(), ['countries', 'wilayas']);
  assert.ok(directoryData.countries.length > 0);
  assert.ok(Object.keys(directoryData.wilayas).length > 0);
});

test('the map groups co-located establishments and does not invent missing coordinates', () => {
  const locations = mapLocations([
    { name: 'Atelier A', lat: 36.7, lng: 3.1 },
    { name: 'Atelier B', lat: 36.7, lng: 3.1 },
    { name: 'Sans coordonnées' },
    { name: 'Hors carte', lat: 100, lng: 0 },
  ]);
  assert.deepEqual(locations, [{ lat: 36.7, lng: 3.1, names: ['Atelier A', 'Atelier B'] }]);
  const html = directoryMapHtml(mapLocations([{ name: 'Atelier </script>', lat: 0, lng: 0 }]));
  assert.ok(html.includes('Atelier \\u003c/script>'));
  assert.ok(!html.includes('Atelier </script>'));
});

test('members and publications are grouped at known wilaya centers without guessing locations', () => {
  const rows = [
    { name: 'Membre', pays: 'DZ', wilaya: ' BEJAIA ' },
    { name: 'Offre', pays: null, wilaya: 'Béjaïa' },
    { name: 'Autre pays', pays: 'TN', wilaya: 'Béjaïa' },
    { name: 'Sans wilaya', pays: 'DZ', wilaya: null },
    { name: 'Wilaya inconnue', pays: 'DZ', wilaya: 'Inconnue' },
  ];
  assert.deepEqual(mapLocations(wilayaMapPoints(rows)), [
    { ...directoryData.wilayas['Béjaïa'], names: ['Membre', 'Offre'] },
  ]);
});
