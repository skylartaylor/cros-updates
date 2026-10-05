import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { processGooglebookCatalog, formatCatalogDate } from '../lib/googlebook.js';
import { render as renderDevice } from '../content/googlebook.11ty.js';
import { render as renderPins } from '../content/devices-data.11ty.js';

const catalog = JSON.parse(fs.readFileSync(new URL('../src/data/googlebook-recovery.json', import.meta.url)));
const require = createRequire(import.meta.url);
const SearchIndex = require('../content/search-json.11ty.cjs');

test('Googlebook catalog keeps build semantics, safe downloads and distinct pin identities', () => {
  const devices = processGooglebookCatalog(catalog);
  assert.equal(devices.length, 5);
  const lapis = devices.find(device => device.codename === 'lapis');
  assert.equal(lapis.id, 'googlebook:lapis');
  assert.equal(lapis.latestRecovery.build, '16452207_CL3B.260622.271.R1');
  assert.equal(lapis.latestRecovery.downloadBytes, null);
  assert.equal(lapis.latestRecovery.imageBytes, 19069493760);
  assert.equal(devices.find(device => device.codename === 'mica').name, 'Dell XPS Googlebook');
  assert.equal(formatCatalogDate('2026-10-05'), 'Oct 5, 2026');
  for (const bad of [[], null, [{ ...catalog[0], device: '../lapis' }], [{ ...catalog[0], url: 'https://evil.example/recovery.zip' }]]) {
    assert.throws(() => processGooglebookCatalog(bad));
  }
});

test('multiple catalog entries retain other builds, deduplicate and prefer newest stable', () => {
  const base = catalog[0];
  const newer = { ...base, buildidentifier: '16452208_TEST', url: base.url.replace('16452207', '16452208') };
  const beta = { ...base, channel: 'BETA', dateupdated: '2026-10-06', url: base.url.replace('16452207', '16452209') };
  const [device] = processGooglebookCatalog([base, beta, newer, base]);
  assert.equal(device.recoveries.length, 3);
  assert.equal(device.latestRecovery.build, '16452208_TEST');
  assert.equal(device.recoveries[2].channel, 'beta');
});

test('shared search finds models and codenames once and preserves ChromeOS routes', () => {
  const crosBuilds = { devices: { lapis: { brandNames: ['Example Chromebook'] } }, boards: { octopus: {} } };
  const googlebooks = processGooglebookCatalog(catalog);
  const context = vm.createContext({});
  vm.runInContext(fs.readFileSync(new URL('../_includes/search.js', import.meta.url), 'utf8') + '\nthis.search = new DeviceSearch();', context);
  context.search.searchIndex = JSON.parse(new SearchIndex().render({ crosBuilds, googlebooks }));
  for (const query of ['asus', 'lapis', 'dell', 'mica', 'moonstone']) {
    const results = context.search.getSearchResults(query).filter(result => result.platform === 'googlebook');
    assert.equal(results.length, 1, query);
    assert.match(context.search.defaultResultTemplate(results[0]), /href="\/googlebook\//);
  }
  assert.equal(context.search.getSearchResults('googlebook').length, 5);
  assert.match(context.search.defaultResultTemplate(context.search.getSearchResults('chromebook')[0]), /href="\/device\/lapis"/);
  const pins = JSON.parse(renderPins({ crosBuilds, googlebooks }));
  assert.equal(pins.lapis.platform, 'chromeos');
  assert.equal(pins['googlebook:lapis'].platform, 'googlebook');
  assert.equal(pins['googlebook:lapis'].versions, undefined);
});

test('device pages link the right image, escape catalog names, and omit placeholder sizes and OTA cards', () => {
  const [device] = processGooglebookCatalog([{ ...catalog[0], name: 'ASUS <script>bad</script>' }]);
  const html = renderDevice({ googlebook: device, assetVersion: 'test' });
  assert.ok(html.includes(`href="${catalog[0].url}"`));
  assert.ok(html.includes('&lt;script&gt;bad&lt;/script&gt;'));
  assert.ok(!html.includes('<script>bad</script>'));
  assert.ok(!html.includes('versionCard'));
  assert.ok(!html.includes('ZIP ·'));
  assert.ok(html.includes('Live OS update versions aren’t tracked'));
  assert.ok(html.includes('MD5 checksum'));
});

test('download details come from each image and tolerate failures', async () => {
  const { addDownloadDetails } = await import('../lib/googlebook.js');
  const devices = [{ recoveries: [
    { url: 'https://dl.google.com/device/recovery/a/1/recovery.zip', downloadBytes: null },
    { url: 'https://dl.google.com/device/recovery/a/2/recovery.zip', downloadBytes: null },
    { url: 'https://dl.google.com/device/recovery/a/3/recovery.zip', downloadBytes: null },
  ] }];
  const requests = [];
  await addDownloadDetails(devices, async (url, options) => {
    requests.push(options.method);
    if (url.includes('/2/')) throw new Error('offline');
    if (url.includes('/3/')) return { ok: false, headers: new Headers() };
    return { ok: true, headers: new Headers({ 'content-length': '7728873477', 'last-modified': 'Mon, 05 Oct 2026 14:37:45 GMT' }) };
  });
  assert.deepEqual(requests, ['HEAD', 'HEAD', 'HEAD']);
  assert.equal(devices[0].recoveries[0].downloadBytes, 7728873477);
  assert.equal(devices[0].recoveries[0].published, '2026-10-05');
  assert.equal(devices[0].recoveries[1].downloadBytes, null);
  assert.equal(devices[0].recoveries[1].published, undefined);
  assert.equal(devices[0].recoveries[2].published, undefined);
});

test('OS version adds the Android release only for known build letters', async () => {
  const { osVersion } = await import('../lib/googlebook.js');
  assert.equal(osVersion('16452207_CL3B.260622.271.R1'), '17.CL3B.260622.271.R1');
  assert.equal(osVersion('17000000_DL1A.270101.001'), 'DL1A.270101.001');
  assert.equal(osVersion('16452207'), null);
});
