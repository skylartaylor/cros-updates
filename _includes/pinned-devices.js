// Pinned Devices Component
class PinnedDevicesManager {
  constructor() {
    this.container = document.getElementById('pinned-devices-container');
    this.grid = document.getElementById('pinned-devices-grid');
    this.devicesData = null;
    this.pinnedDevices = [];
    this.deviceChannelSettings = {};
    this.originalPlaceholder = null;
  }

  async initialize() {
    // Load device data
    try {
      const response = await fetch('/devices-data.json');
      this.devicesData = await response.json();
    } catch (error) {
      console.error('Failed to load device data:', error);
      return;
    }

    // Store reference to original placeholder before replacing it
    this.originalPlaceholder = this.grid.querySelector('.pinned-devices-placeholder')?.cloneNode(true);
    
    // Load settings from localStorage
    this.loadSettings();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Initial render
    this.renderPinnedDevices();
    
    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', (e) => {
      if (e.key === 'pinnedDevices') {
        this.loadSettings();
        this.renderPinnedDevices();
      }
    });
  }

  loadSettings() {
    // Load pinned devices
    const stored = localStorage.getItem('pinnedDevices');
    this.pinnedDevices = stored ? JSON.parse(stored) : [];
    
    // Load per-device channel settings
    const deviceSettings = localStorage.getItem('deviceChannelSettings');
    this.deviceChannelSettings = deviceSettings ? JSON.parse(deviceSettings) : {};
    
    // Ensure each pinned device has channel settings
    this.pinnedDevices.forEach(deviceKey => {
      if (!this.deviceChannelSettings[deviceKey]) {
        this.deviceChannelSettings[deviceKey] = {
          stable: true,
          beta: true,
          dev: true,
          canary: true
        };
      }
    });
  }

  saveDeviceChannelSettings() {
    localStorage.setItem('deviceChannelSettings', JSON.stringify(this.deviceChannelSettings));
  }

  setupEventListeners() {
    // Global settings are now removed - settings are per device
  }

  toggleDeviceChannel(deviceKey, channel) {
    if (!this.deviceChannelSettings[deviceKey]) {
      this.deviceChannelSettings[deviceKey] = {
        stable: true,
        beta: true,
        dev: true,
        canary: true
      };
    }
    
    this.deviceChannelSettings[deviceKey][channel] = !this.deviceChannelSettings[deviceKey][channel];
    this.saveDeviceChannelSettings();
    this.updateDeviceCard(deviceKey);
  }

  updateDeviceCard(deviceKey) {
    const card = this.grid.querySelector(`[data-device="${deviceKey}"]`);
    if (!card) return;

    const device = this.devicesData[deviceKey];
    if (!device) return;

    const deviceChannels = this.deviceChannelSettings[deviceKey];
    const versionList = card.querySelector('.version-list');
    
    if (versionList && deviceChannels) {
      versionList.innerHTML = `
        ${deviceChannels.stable ? `
          <div class="version-row">
            <span class="channel-name stable">STABLE</span>
            <span class="version-number">${this.formatVersion(device.versions.stable.chromeVersion)}</span>
          </div>
        ` : ''}
        ${deviceChannels.beta ? `
          <div class="version-row">
            <span class="channel-name beta">BETA</span>
            <span class="version-number">${this.formatVersion(device.versions.beta.chromeVersion)}</span>
          </div>
        ` : ''}
        ${deviceChannels.dev ? `
          <div class="version-row">
            <span class="channel-name dev">DEV</span>
            <span class="version-number">${this.formatVersion(device.versions.dev.chromeVersion)}</span>
          </div>
        ` : ''}
        ${deviceChannels.canary ? `
          <div class="version-row">
            <span class="channel-name canary">CANARY</span>
            <span class="version-number">${this.formatVersion(device.versions.canary.chromeVersion)}</span>
          </div>
        ` : ''}
      `;
    }
  }

  formatVersion(version) {
    if (!version) return 'N/A';
    const parts = version.split('_');
    if (parts.length > 1) {
      return `${parts[0]}<span class="version-suffix">_${parts.slice(1).join('_')}</span>`;
    }
    return version;
  }

  createDeviceCard(deviceKey) {
    const device = this.devicesData[deviceKey];
    if (!device) return null;

    const deviceChannels = this.deviceChannelSettings[deviceKey] || {
      stable: true,
      beta: true,
      dev: true,
      canary: true
    };

    const card = document.createElement('div');
    card.className = `pinned-device-card ${device.isAue ? 'is-aue' : ''}`;
    card.setAttribute('data-device', deviceKey);

    card.innerHTML = `
      <!-- Main content -->
      <div class="card-main-content">
        <div class="pinned-device-header">
          <h3>
            <a href="/device/${deviceKey}">${deviceKey}</a>
            ${device.isAue ? '<span class="aue-badge">EOL</span>' : ''}
          </h3>
          <button class="device-settings-btn" data-device="${deviceKey}" aria-label="Configure ${deviceKey}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="version-list">
          ${deviceChannels.stable ? `
            <div class="version-row">
              <span class="channel-name stable">STABLE</span>
              <span class="version-number">${this.formatVersion(device.versions.stable.chromeVersion)}</span>
            </div>
          ` : ''}
          ${deviceChannels.beta ? `
            <div class="version-row">
              <span class="channel-name beta">BETA</span>
              <span class="version-number">${this.formatVersion(device.versions.beta.chromeVersion)}</span>
            </div>
          ` : ''}
          ${deviceChannels.dev ? `
            <div class="version-row">
              <span class="channel-name dev">DEV</span>
              <span class="version-number">${this.formatVersion(device.versions.dev.chromeVersion)}</span>
            </div>
          ` : ''}
          ${deviceChannels.canary ? `
            <div class="version-row">
              <span class="channel-name canary">CANARY</span>
              <span class="version-number">${this.formatVersion(device.versions.canary.chromeVersion)}</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Settings content (hidden by default) -->
      <div class="card-settings-content" style="display: none;">
        <div class="settings-header">
          <h3>Settings</h3>
          <button class="settings-back-btn" aria-label="Back to device info">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12,19 5,12 12,5"/>
            </svg>
          </button>
        </div>
        
        <div class="settings-content">
          <h4>Visible Channels</h4>
          <div class="channel-toggles">
            <div class="channel-toggle">
              <label><input type="checkbox" data-channel="stable" ${deviceChannels.stable ? 'checked' : ''}> STABLE</label>
            </div>
            <div class="channel-toggle">
              <label><input type="checkbox" data-channel="beta" ${deviceChannels.beta ? 'checked' : ''}> BETA</label>
            </div>
            <div class="channel-toggle">
              <label><input type="checkbox" data-channel="dev" ${deviceChannels.dev ? 'checked' : ''}> DEV</label>
            </div>
            <div class="channel-toggle">
              <label><input type="checkbox" data-channel="canary" ${deviceChannels.canary ? 'checked' : ''}> CANARY</label>
            </div>
          </div>
          
          <div class="settings-actions">
            <button class="unpin-device-btn" data-device="${deviceKey}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Unpin Device
            </button>
          </div>
        </div>
      </div>
    `;

    // Card flip functionality
    const settingsBtn = card.querySelector('.device-settings-btn');
    const backBtn = card.querySelector('.settings-back-btn');
    const mainContent = card.querySelector('.card-main-content');
    const settingsContent = card.querySelector('.card-settings-content');
    
    settingsBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.style.display = 'none';
      settingsContent.style.display = 'block';
    });

    backBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      settingsContent.style.display = 'none';
      mainContent.style.display = 'block';
    });

    // Add channel toggle functionality
    const checkboxes = card.querySelectorAll('.channel-toggles input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const channel = e.target.dataset.channel;
        this.toggleDeviceChannel(deviceKey, channel);
      });
    });

    // Add unpin functionality
    const unpinBtn = card.querySelector('.unpin-device-btn');
    unpinBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.unpinDevice(deviceKey);
    });

    return card;
  }

  unpinDevice(deviceKey) {
    const index = this.pinnedDevices.indexOf(deviceKey);
    if (index > -1) {
      this.pinnedDevices.splice(index, 1);
      localStorage.setItem('pinnedDevices', JSON.stringify(this.pinnedDevices));
      
      // Fade out and re-render
      this.grid.classList.remove('loaded');
      setTimeout(() => {
        this.renderPinnedDevices();
      }, 150);
    }
  }

  renderPinnedDevices() {
    if (!this.devicesData) return;

    if (this.pinnedDevices.length === 0) {
      // Restore the original placeholder by clearing and re-adding it
      this.grid.innerHTML = '';
      if (this.originalPlaceholder) {
        this.grid.appendChild(this.originalPlaceholder.cloneNode(true));
      }
      this.grid.classList.add('loaded');
      return;
    }

    // Replace placeholder with pinned device cards
    this.grid.innerHTML = '';

    this.pinnedDevices.forEach(deviceKey => {
      const card = this.createDeviceCard(deviceKey);
      if (card) {
        this.grid.appendChild(card);
      }
    });

    // Add the loaded class for fade-in
    this.grid.classList.add('loaded');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Add js class for progressive enhancement
    document.documentElement.classList.add('js');
    const manager = new PinnedDevicesManager();
    manager.initialize();
  });
} else {
  // Add js class for progressive enhancement
  document.documentElement.classList.add('js');
  const manager = new PinnedDevicesManager();
  manager.initialize();
}