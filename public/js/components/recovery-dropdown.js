/**
 * Recovery Dropdown Web Component
 *
 * Displays a dropdown of recovery images grouped by channel (Stable, Beta, LTC, LTS).
 * Supports multiple data formats from device pages and Flex page.
 *
 * Usage:
 *   <recovery-dropdown
 *     data-recoveries='{"stable":[{url:"...",chromeVersion:"..."}],...}'
 *     data-latest-version="119.0.6045.159"
 *     data-latest-url="https://..."
 *     data-format="device">
 *   </recovery-dropdown>
 *
 * Attributes:
 *   - data-recoveries: JSON string of recovery data
 *   - data-latest-version: Version string for latest recovery button
 *   - data-latest-url: URL for latest recovery download
 *   - data-format: "device" (default) or "flex" - determines data structure
 *   - show-button-only: If present, only shows the recovery button without dropdown
 */
class RecoveryDropdown extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const recoveries = this.parseRecoveries();
    const latestVersion = this.getAttribute('data-latest-version');
    const latestUrl = this.getAttribute('data-latest-url');
    const hasRecoveries = this.hasAnyRecoveries(recoveries);
    const showButtonOnly = this.hasAttribute('show-button-only');

    // Don't render the recovery dropdown wrapper if this is button-only mode
    // (the pin button and recovery button are handled by parent)
    if (showButtonOnly) {
      this.innerHTML = this.renderButtonOnly(latestVersion, latestUrl, hasRecoveries);
      return;
    }

    this.innerHTML = `
      <div class="recoveryDropdown">
        <div class="recoveryWrapper${hasRecoveries ? '' : ' no-recoveries'}">
          ${this.renderLatestButton(latestVersion, latestUrl, hasRecoveries)}
          ${this.renderDropdownToggle(hasRecoveries)}
        </div>
        ${this.renderDropdownContent(recoveries, hasRecoveries)}
      </div>
    `;
  }

  parseRecoveries() {
    const rawData = this.getAttribute('data-recoveries');
    if (!rawData || rawData === 'null' || rawData === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(rawData);
    } catch (e) {
      console.error('Failed to parse recovery data:', e);
      return null;
    }
  }

  hasAnyRecoveries(recoveries) {
    if (!recoveries) return false;

    // Handle array format (Flex)
    if (Array.isArray(recoveries)) {
      return recoveries.length > 0;
    }

    // Handle object format (device/board)
    return Object.values(recoveries).some(arr => arr && arr.length > 0);
  }

  renderButtonOnly(version, url, hasRecoveries) {
    if (!hasRecoveries) {
      return `<span class="recoveryBtn deviceHeaderBtn disabled">No Recoveries</span>`;
    }
    return `<a class="recoveryBtn deviceHeaderBtn" href="${url}">&#x2B07; Recovery (${version})</a>`;
  }

  renderLatestButton(version, url, hasRecoveries) {
    if (!hasRecoveries) {
      return `<span class="recoveryBtn deviceHeaderBtn disabled">No Recoveries</span>`;
    }
    if (!url) return '';
    return `<a class="recoveryBtn deviceHeaderBtn" href="${url}">&#x2B07; Recovery (${version})</a>`;
  }

  renderDropdownToggle(hasRecoveries) {
    if (!hasRecoveries) return '';
    return `<button class="dropdownToggleBtn" aria-label="Show older recovery versions" aria-expanded="false">▼</button>`;
  }

  renderDropdownContent(recoveries, hasRecoveries) {
    if (!hasRecoveries) {
      return `
        <div class="dropdownContent">
          <div class="no-recoveries-message">No recovery images available for this device.</div>
        </div>
      `;
    }

    const format = this.getAttribute('data-format') || 'device';
    let content = '';

    if (format === 'flex') {
      content = this.renderFlexFormat(recoveries);
    } else {
      content = this.renderDeviceFormat(recoveries);
    }

    return `<div class="dropdownContent">${content}</div>`;
  }

  renderDeviceFormat(recoveries) {
    if (!recoveries) return '';

    const channels = [
      { key: 'stable', label: 'Stable', class: 'stable' },
      { key: 'beta', label: 'Beta', class: 'beta' },
      { key: 'ltc', label: 'LTC', class: 'ltc' },
      { key: 'ltr', label: 'LTS', class: 'ltr' }
    ];

    return channels.map(channel => {
      const channelRecoveries = recoveries[channel.key] || [];
      if (channelRecoveries.length === 0) return '';

      const links = channelRecoveries.map(recovery => {
        const version = recovery.chromeVersion || recovery.version;
        const displayName = `Chrome OS <strong>${version}</strong>`;
        return `<a href="${recovery.url}" class="recovery-link ${channel.class}">${displayName}</a>`;
      }).join('');

      return `
        <div class="recovery-channel-section">
          <div class="recovery-channel-header ${channel.class}">${channel.label}</div>
          ${links}
        </div>
      `;
    }).filter(Boolean).join('');
  }

  renderFlexFormat(recoveries) {
    if (!Array.isArray(recoveries) || recoveries.length === 0) return '';

    // Group recoveries by channel
    const channelGroups = {
      stable: [],
      beta: [],
      ltc: [],
      ltr: []
    };

    recoveries.forEach(recovery => {
      const channel = (recovery.channel || '').toLowerCase();
      if (channelGroups[channel]) {
        channelGroups[channel].push(recovery);
      } else {
        // Default to stable if no channel specified
        channelGroups.stable.push(recovery);
      }
    });

    const channels = [
      { key: 'stable', label: 'Stable', class: 'stable' },
      { key: 'beta', label: 'Beta', class: 'beta' },
      { key: 'ltc', label: 'LTC', class: 'ltc' },
      { key: 'ltr', label: 'LTS', class: 'ltr' }
    ];

    return channels.map(channel => {
      const channelRecoveries = channelGroups[channel.key] || [];
      if (channelRecoveries.length === 0) return '';

      // Sort by version (newest first)
      const sorted = channelRecoveries.sort((a, b) => {
        const aVer = parseInt(a.chrome_version?.split('.')[0] || '0');
        const bVer = parseInt(b.chrome_version?.split('.')[0] || '0');
        return bVer - aVer;
      });

      const links = sorted.map(recovery => {
        const majorVersion = recovery.chrome_version?.split('.')[0] || recovery.chrome_version;
        const displayName = `Chrome OS <strong>${majorVersion}</strong>`;
        return `<a href="${recovery.url}" class="recovery-link ${channel.class}" target="_blank" rel="noopener">${displayName}</a>`;
      }).join('');

      return `
        <div class="recovery-channel-section">
          <div class="recovery-channel-header ${channel.class}">${channel.label}</div>
          ${links}
        </div>
      `;
    }).filter(Boolean).join('');
  }

  setupEventListeners() {
    const button = this.querySelector('.dropdownToggleBtn');
    if (!button) return;

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = this.querySelector('.dropdownContent');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';

      button.setAttribute('aria-expanded', !isExpanded);
      content.classList.toggle('show');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        const button = this.querySelector('.dropdownToggleBtn');
        const content = this.querySelector('.dropdownContent');
        if (button && content) {
          button.setAttribute('aria-expanded', 'false');
          content.classList.remove('show');
        }
      }
    });

    // Keyboard support
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const content = this.querySelector('.dropdownContent');
        button.setAttribute('aria-expanded', 'false');
        content.classList.remove('show');
        button.focus();
      }
    });
  }
}

customElements.define('recovery-dropdown', RecoveryDropdown);
