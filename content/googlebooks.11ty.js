import { escapeHTML as e, channelLabel, osVersion, glowbar, icon } from '../lib/googlebook.js';

export function data() {
  return {
    layout: 'base.njk', permalink: '/googlebooks/', googlebookPage: true,
    title: 'Googlebooks - Chrome OS Updates',
    description: 'Find your Googlebook, check its recovery build, and download an official recovery image from Google.',
  };
}

export function render({ googlebooks }) {
  return `<section class="gb-page gb-directory">
    <header class="gb-hero">
      <div class="gb-eyebrow">${glowbar()} DEVICE DIRECTORY</div>
      <h1>Googlebooks</h1>
      <p class="gb-lead">Official recovery images and build information for your Googlebook.</p>
      <div class="gb-hero-meta"><span>${googlebooks.length} devices</span><span>Googlebook OS</span><a href="https://googlebook.google/">Meet Googlebook ${icon('external')}</a></div>
    </header>

    <nav class="gb-device-list" aria-label="Googlebook devices">
      <div class="gb-list-labels" aria-hidden="true"><span>Device</span><span>Codename</span><span>Recovery version</span></div>
      ${googlebooks.map(device => {
        const recovery = device.latestRecovery;
        // Stable is the norm, so only call out the channel when it is something else.
        const channelTag = recovery.channel === 'stable' ? '' : ` <span class="gb-channel" data-channel="${e(recovery.channel)}">${e(channelLabel(recovery.channel))}</span>`;
        return `<a class="gb-device-row" href="${device.url}">
          <span class="gb-row-name">${e(device.name)}</span>
          <span class="gb-row-codename">${e(device.codename)}</span>
          <span class="gb-row-build"><span class="version-number">${e(osVersion(recovery.build) || recovery.build)}</span>${channelTag}</span>
        </a>`;
      }).join('')}
    </nav>
  </section>`;
}
