import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { passwordLinkTarget } from './passwordLink.ts';

test('invite and recovery links retain their tokens when redirected', () => {
  for (const type of ['invite', 'recovery']) {
    const location = { pathname: '/', search: '?lang=fr', hash: `#access_token=token&type=${type}` };
    assert.equal(
      passwordLinkTarget(location, '/'),
      `/compte/mot-de-passe?lang=fr#access_token=token&type=${type}`,
    );
  }
});

test('normal links, missing tokens and the destination itself are not redirected', () => {
  assert.equal(passwordLinkTarget({ pathname: '/', search: '', hash: '#type=signup&access_token=x' }, '/'), null);
  assert.equal(passwordLinkTarget({ pathname: '/', search: '', hash: '#type=invite' }, '/'), null);
  assert.equal(passwordLinkTarget({ pathname: '/app/compte/mot-de-passe', search: '', hash: '#type=recovery&access_token=x' }, '/app/'), null);
});
