/**
 * Version Card Web Component
 *
 * Displays Chrome OS version information for a specific channel (Stable, Beta, Dev, Canary LT).
 * Supports custom styling classes for context-specific appearance.
 *
 * Usage:
 *   <version-card
 *     channel="stable"
 *     chrome-version="119.0.6045.159"
 *     platform-version="15633.69.0"
 *     custom-class="pinned-card"
 *     is-aue>
 *   </version-card>
 *
 * Attributes:
 *   - channel: Channel name (stable, beta, dev, canary) [required]
 *   - chrome-version: Chrome OS version string [required]
 *   - platform-version: Platform version string [optional]
 *   - custom-class: Additional CSS classes for custom styling [optional]
 *   - is-aue: Boolean flag to style as AUE (red text) [optional]
 *   - hide-platform: Hide the platform version line [optional]
 */
class VersionCard extends HTMLElement {
  static get observedAttributes() {
    return ['channel', 'chrome-version', 'platform-version', 'custom-class', 'is-aue'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Re-render when attributes change
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const channel = this.getAttribute('channel') || 'stable';
    const chromeVersion = this.getAttribute('chrome-version') || 'Unavailable';
    const platformVersion = this.getAttribute('platform-version');
    const customClass = this.getAttribute('custom-class') || '';
    const isAue = this.hasAttribute('is-aue');
    const hidePlatform = this.hasAttribute('hide-platform');

    const channelLabels = {
      stable: 'Stable',
      beta: 'Beta',
      dev: 'Dev',
      canary: 'Canary'
    };

    const label = channelLabels[channel.toLowerCase()] || channel;

    // Build class list: base class + channel + custom classes
    const classList = ['versionCard', channel.toLowerCase(), customClass]
      .filter(Boolean)
      .join(' ');

    // Apply classes to the custom element itself for easier styling
    this.className = classList;

    this.innerHTML = `
      <h1>${label}</h1>
      <h2>${this.formatVersion(chromeVersion, isAue)}</h2>
      ${!hidePlatform && platformVersion ? `<h3><span>Platform:</span>${platformVersion}</h3>` : ''}
    `;
  }

  formatVersion(version, isAue) {
    if (version === 'Unavailable' || version === 'N/A') {
      return version;
    }

    // Split version on underscore and style suffix differently
    const parts = version.split('_');
    let formattedVersion = version;

    if (parts.length > 1) {
      formattedVersion = `${parts[0]}<span class="version-suffix">_${parts.slice(1).join('_')}</span>`;
    }

    if (isAue) {
      return `<span style="color: red;">${formattedVersion}</span>`;
    }

    return formattedVersion;
  }
}

customElements.define('version-card', VersionCard);
