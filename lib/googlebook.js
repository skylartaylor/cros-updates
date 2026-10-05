export const GOOGLEBOOK_CATALOG_URL = 'https://dl.google.com/dl/edgedl/device/recovery/production_recovery.json';
export const RECOVERY_UTILITY_URL = 'https://chromewebstore.google.com/detail/device-recovery-utility/pocpnlppkickgojjlmhdmidojbmbodfm';
export const GOOGLEBOOK_UPDATE_HELP_URL = 'https://support.google.com/googlebook/answer/17436299?hl=en';

export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

export function formatCatalogDate(value) {
  if (!value) return 'Not provided';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${value}T00:00:00Z`));
}

// A distinct platform and identity keep Android build IDs out of ChromeOS
// version comparisons, and prevent codename collisions in saved pins.
export function processGooglebookCatalog(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error('Googlebook recovery catalog is empty or invalid');
  }
  const devices = new Map();
  for (const entry of entries) {
    const { device: codename, manufacturer, name, buildidentifier, url } = entry;
    if (!/^[a-z0-9][a-z0-9-]*$/.test(codename || '') || !manufacturer || !name || !buildidentifier) {
      throw new Error('Googlebook recovery entry is missing its identity or build');
    }
    const download = new URL(url);
    if (download.protocol !== 'https:' || download.hostname !== 'dl.google.com' ||
        download.username || download.password || !download.pathname.startsWith('/device/recovery/')) {
      throw new Error(`Unrecognized Googlebook recovery URL for ${codename}`);
    }
    const updated = /^\d{4}-\d{2}-\d{2}$/.test(entry.dateupdated || '') &&
      !Number.isNaN(Date.parse(entry.dateupdated)) ? entry.dateupdated : null;
    const recovery = {
      channel: String(entry.channel || 'UNKNOWN').toLowerCase(),
      build: String(buildidentifier),
      url: download.href,
      updated,
      target: entry.target || null,
      branch: entry.branch || null,
      md5: /^[a-f0-9]{32}$/i.test(entry.md5 || '') ? entry.md5 : null,
      imageBytes: Number.isSafeInteger(entry.filesize) && entry.filesize > 1 ? entry.filesize : null,
      // The launch catalog uses 1 as a placeholder; never show that as a size.
      downloadBytes: Number.isSafeInteger(entry.zipfilesize) && entry.zipfilesize > 1 ? entry.zipfilesize : null,
    };
    if (!devices.has(codename)) {
      const displayManufacturer = manufacturer.toLowerCase() === 'asus' ? 'ASUS' : manufacturer;
      const displayName = name.toLowerCase().startsWith(manufacturer.toLowerCase()) ? name : `${displayManufacturer} ${name}`;
      devices.set(codename, {
        id: `googlebook:${codename}`, platform: 'googlebook', codename,
        name: displayName, catalogName: name, manufacturer: displayManufacturer,
        url: `/googlebook/${codename}/`, recoveries: [],
      });
    }
    const device = devices.get(codename);
    if (!device.recoveries.some(item => item.url === recovery.url && item.channel === recovery.channel)) {
      device.recoveries.push(recovery);
    }
  }
  return [...devices.values()].map(device => {
    device.recoveries.sort((a, b) =>
      Number(b.channel === 'stable') - Number(a.channel === 'stable') ||
      (b.updated || '').localeCompare(a.updated || '') ||
      b.build.localeCompare(a.build, 'en', { numeric: true }));
    return { ...device, latestRecovery: device.recoveries[0] };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

// The catalog's ZIP size is a placeholder and its date is catalog-wide, so ask
// each download for its own. A failed request leaves those details out rather
// than failing the build.
export async function addDownloadDetails(devices, fetchImpl = fetch) {
  await Promise.all(devices.flatMap(device => device.recoveries).map(async recovery => {
    try {
      const response = await fetchImpl(recovery.url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
      if (!response.ok) return;
      const bytes = Number(response.headers.get('content-length'));
      if (Number.isSafeInteger(bytes) && bytes > 1) recovery.downloadBytes = bytes;
      const modified = new Date(response.headers.get('last-modified') || '');
      if (!Number.isNaN(modified.getTime())) recovery.published = modified.toISOString().slice(0, 10);
    } catch {
      // Keep whatever the catalog provided.
    }
  }));
  return devices;
}

// Android build IDs start with a letter for the platform release. Googlebook OS
// shows its version as "<release>.<build ID>", so add the release when the letter
// is one we have seen on a device image; otherwise show the build ID alone.
const ANDROID_RELEASE_BY_BUILD_LETTER = { C: 17 };

export function osVersion(build) {
  const buildId = String(build || '').split('_').slice(1).join('_');
  if (!buildId) return null;
  const release = ANDROID_RELEASE_BY_BUILD_LETTER[buildId[0]];
  return release ? `${release}.${buildId}` : buildId;
}

export function channelLabel(channel) {
  return channel === 'unknown' ? 'Channel not specified' : channel[0].toUpperCase() + channel.slice(1);
}

export function formatBytes(bytes) {
  return `${(bytes / 1024 ** 3).toFixed(1)} GiB`;
}

export function glowbar() {
  return '<span class="gb-glowbar" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
}

export function icon(name, className = '') {
  const paths = {
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4"/>',
    external: '<path d="M14 4h6v6m0-6L10 14M10 4H4v16h16v-6"/>',
    pin: '<path d="m9 3 6 0-1 6 4 4v2H6v-2l4-4-1-6Zm3 12v6"/>',
  };
  return `<svg${className ? ` class="${className}"` : ''} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}
