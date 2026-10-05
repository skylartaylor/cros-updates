import { escapeHTML as e, formatCatalogDate, formatBytes, channelLabel, osVersion, glowbar, icon, RECOVERY_UTILITY_URL, GOOGLEBOOK_UPDATE_HELP_URL } from '../lib/googlebook.js';

export function data() {
  return {
    layout: 'base.njk', googlebookPage: true,
    pagination: { data: 'googlebooks', size: 1, alias: 'googlebook' },
    permalink: data => data.googlebook.url,
    eleventyComputed: {
      title: data => `${data.googlebook.codename} - Chrome OS Updates`,
      description: data => `Official recovery download and build information for ${data.googlebook.name}, codename ${data.googlebook.codename}.`,
    },
  };
}

export function render({ googlebook: device, assetVersion }) {
  const recovery = device.latestRecovery;
  const splitBuild = build => {
    const [number, ...rest] = build.split('_');
    return { number, suffix: rest.join('_') };
  };
  const build = splitBuild(recovery.build);
  const published = item => item.published ? `<time datetime="${item.published}">${e(formatCatalogDate(item.published))}</time>` : '';
  // The identifier and target repeat what the heading already shows.
  const fields = [
    ['Release branch', recovery.branch],
    ['Image size, unzipped', recovery.imageBytes ? formatBytes(recovery.imageBytes) : null],
    ['MD5 checksum', recovery.md5],
  ].filter(([, value]) => value);
  return `<article class="gb-page gb-detail" data-device-key="${device.id}">
    <header class="gb-device-hero">
      <div><div class="gb-eyebrow">${glowbar()} GOOGLEBOOK</div><h1>${e(device.name)}</h1><p class="gb-device-subtitle">Googlebook OS <span aria-hidden="true">/</span> <code>${e(device.codename)}</code></p></div>
      <button class="gb-pin pin-device-btn" data-device="${device.id}" aria-label="Pin device to homepage" aria-pressed="false">${icon('pin', 'pin-icon')} <span class="pin-text">Pin</span></button>
    </header>

    <section class="gb-recovery-card" aria-labelledby="gb-recovery-title">
        <div class="gb-recovery-heading"><h2 id="gb-recovery-title">Latest recovery image</h2><span class="gb-channel" data-channel="${e(recovery.channel)}">${e(channelLabel(recovery.channel))}</span></div>
        <div class="gb-recovery-summary"><div class="gb-build-number">${e(osVersion(recovery.build) || build.number)}</div>
        ${osVersion(recovery.build) ? `<p class="gb-build-release">Build ${e(build.number)}</p>` : ''}
        ${recovery.published ? `<p class="gb-recovery-date">Published ${published(recovery)}</p>` : ''}
        </div><div class="gb-recovery-actions"><a class="gb-download" href="${e(recovery.url)}">${icon('download')} Download recovery <span>ZIP${recovery.downloadBytes ? ` · ${formatBytes(recovery.downloadBytes)}` : ''}</span></a>
        <p class="gb-download-note">Official image · Downloads directly from Google</p><a class="gb-text-link" href="${RECOVERY_UTILITY_URL}">Recovery Utility ${icon('external')}</a></div>
        ${fields.length ? `<dl class="gb-image-details">${fields.map(([label, value]) => `<div><dt>${label}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>` : ''}
    </section>
    <p class="gb-update-note">Live OS update versions aren’t tracked here yet. <a href="${GOOGLEBOOK_UPDATE_HELP_URL}">Check for updates on your device ${icon('external')}</a></p>

    ${device.recoveries.length > 1 ? `<section class="gb-more-recoveries" aria-labelledby="gb-more-title">
      <h2 id="gb-more-title">Other recovery images</h2>
      ${device.recoveries.slice(1).map(item => {
        const itemBuild = splitBuild(item.build);
        const details = [published(item), item.downloadBytes ? formatBytes(item.downloadBytes) : ''].filter(Boolean).join(' · ');
        return `<a class="gb-recovery-row" href="${e(item.url)}">
          <span class="gb-channel" data-channel="${e(item.channel)}">${e(channelLabel(item.channel))}</span>
          <span class="version-number">${e(osVersion(item.build) || itemBuild.number)}</span>
          <span class="gb-recovery-row-details">${details}</span>
          <span class="gb-recovery-row-action">${icon('download')} Download</span>
        </a>`;
      }).join('')}
    </section>` : ''}
  </article><script src="/public/js/app.js?v=${assetVersion}"></script>`;
}
