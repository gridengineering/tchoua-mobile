const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function setup(response) {
  let enqueued = 0, cached = 0;
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(__dirname + '/client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const storage = { getItem: async () => null };
  vm.runInNewContext(source, {
    module, exports: module.exports,
    require: name => name.includes('async-storage') ? storage : {
      cacheGet: async () => { cached++; return { data: { secret: true } }; },
      cacheSet: async () => {}, enqueueMutation: async () => { enqueued++; },
    },
    fetch: async () => response, console,
  });
  return { api: module.exports, counters: () => ({ enqueued, cached }) };
}
test('403 does not expose cached data', async () => {
  const { api, counters } = setup({ ok: false, status: 403 });
  await assert.rejects(api.apiGet('/private'), error => error.status === 403);
  assert.equal(counters().cached, 0);
});
test('rejected mutation is never queued for replay', async () => {
  const { api, counters } = setup({ ok: false, status: 409, text: async () => 'Conflit' });
  await assert.rejects(api.apiPost('/payment', {}), error => error.status === 409);
  assert.equal(counters().enqueued, 0);
});
test('ARP validation exposes missing dependencies without queuing', async () => {
  const { api, counters } = setup({ ok: false, status: 422, json: async () => ({ error: 'Prérequis manquants', missing: ['D12'] }) });
  await assert.rejects(api.apiOnline('/associations/a/arp', {}), error => error.message.includes('D12'));
  assert.equal(counters().enqueued, 0);
});
