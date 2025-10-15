// Chrome OS Updates - Combined JavaScript

// =============================================================================
// SHARED UTILITIES
// =============================================================================

// Simple localStorage wrapper with JSON support
const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch storage event for cross-tab sync
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(value)
      }));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }
};

// Enhanced modal helper with full accessibility support
const modal = {
  previousFocus: null,
  focusableElements: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

  show(modalId, triggerElement = null) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      // Store the element that triggered the modal
      this.previousFocus = triggerElement || document.activeElement;

      // Set ARIA attributes
      modalEl.classList.add('show');
      modalEl.setAttribute('aria-hidden', 'false');
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');

      // Move focus to modal
      const firstFocusable = modalEl.querySelector(this.focusableElements);
      if (firstFocusable) {
        // Small delay to ensure modal is visible before focusing
        setTimeout(() => firstFocusable.focus(), 10);
      }

      // Trap focus within modal
      this.trapFocus(modalEl);
    }
  },

  hide(modalId) {
    const modalEl = document.getElementById(modalId);
    if (modalEl) {
      modalEl.classList.remove('show');
      modalEl.setAttribute('aria-hidden', 'true');

      // Return focus to the element that opened the modal
      if (this.previousFocus && this.previousFocus.focus) {
        this.previousFocus.focus();
      }
      this.previousFocus = null;

      // Remove focus trap listener
      this.removeFocusTrap(modalEl);
    }
  },

  trapFocus(modalEl) {
    const focusableContent = modalEl.querySelectorAll(this.focusableElements);
    const firstFocusable = focusableContent[0];
    const lastFocusable = focusableContent[focusableContent.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      // If shift + tab (going backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab key (going forwards)
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };

    // Store the handler so we can remove it later
    modalEl._focusTrapHandler = handleTabKey;
    document.addEventListener('keydown', handleTabKey);
  },

  removeFocusTrap(modalEl) {
    if (modalEl._focusTrapHandler) {
      document.removeEventListener('keydown', modalEl._focusTrapHandler);
      delete modalEl._focusTrapHandler;
    }
  },

  setup(modalId, options = {}) {
    const modalEl = document.getElementById(modalId);
    if (!modalEl) return;

    // Ensure modal has proper initial ARIA state
    modalEl.setAttribute('aria-hidden', 'true');

    // Click outside to close
    if (options.closeOnClickOutside !== false) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) this.hide(modalId);
      });
    }

    // Escape key to close
    if (options.closeOnEscape !== false) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('show')) {
          this.hide(modalId);
        }
      });
    }

    // Setup close button if provided
    if (options.closeButton) {
      const closeBtn = modalEl.querySelector(options.closeButton);
      closeBtn?.addEventListener('click', () => this.hide(modalId));
    }

    // Setup additional buttons
    if (options.buttons) {
      Object.entries(options.buttons).forEach(([selector, handler]) => {
        const btn = modalEl.querySelector(selector);
        btn?.addEventListener('click', handler);
      });
    }
  },

  // Helper for populating modal content
  setContent(modalId, selector, content) {
    const modal = document.getElementById(modalId);
    const element = modal?.querySelector(selector);
    if (element) element.innerHTML = content;
  },

  // Helper for updating modal title
  setTitle(modalId, title) {
    const modal = document.getElementById(modalId);
    const titleElement = modal?.querySelector('.modal-header h2');
    if (titleElement) titleElement.textContent = title;
  }
};

// DOM utilities
const dom = {
  ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  },

  toggleElements(selector, show, displayValue = 'block') {
    document.querySelectorAll(selector).forEach(el => {
      el.style.display = show ? displayValue : 'none';
    });
  },

  updateCheckboxes(states, prefix = 'toggle-') {
    Object.entries(states).forEach(([key, isEnabled]) => {
      const checkbox = document.getElementById(`${prefix}${key}`);
      if (checkbox) {
        checkbox.checked = isEnabled;
        const label = checkbox.closest('.column-option');
        label?.classList.toggle('disabled', !isEnabled);
      }
    });
  }
};

// Accessibility: Live region announcements for screen readers
const announcer = {
  liveRegion: null,

  init() {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'visually-hidden';
      document.body.appendChild(this.liveRegion);
    }
  },

  announce(message, priority = 'polite') {
    this.init();
    this.liveRegion.setAttribute('aria-live', priority);
    // Clear and then set to ensure screen readers announce
    this.liveRegion.textContent = '';
    setTimeout(() => {
      this.liveRegion.textContent = message;
    }, 100);
  }
};

// =============================================================================
// DROPDOWN FUNCTIONALITY (device and board pages)
// =============================================================================

function initDropdown() {
  const toggle = document.querySelector('.dropdownToggleBtn');
  const dropdown = document.querySelector('.dropdownContent');

  if (!toggle || !dropdown) return;

  let currentIndex = -1;
  const links = dropdown.querySelectorAll('a[href]');

  // Set ARIA attributes
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-haspopup', 'true');
  dropdown.setAttribute('role', 'menu');
  links.forEach(link => link.setAttribute('role', 'menuitem'));

  function openDropdown() {
    dropdown.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    currentIndex = -1;
  }

  function closeDropdown() {
    dropdown.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
    currentIndex = -1;
  }

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('show');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  // Keyboard navigation for dropdown
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDropdown();
      if (links.length > 0) {
        currentIndex = 0;
        links[0].focus();
      }
    }
  });

  dropdown.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeDropdown();
      toggle.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % links.length;
      links[currentIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
      links[currentIndex].focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      currentIndex = 0;
      links[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      currentIndex = links.length - 1;
      links[currentIndex].focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!toggle.contains(event.target) && !dropdown.contains(event.target)) {
      closeDropdown();
    }
  });
}

// =============================================================================
// PIN DEVICE FUNCTIONALITY (device pages)
// =============================================================================

function initPinDevice() {
  const pinBtn = document.querySelector('.pin-device-btn');
  const deviceKeyElement = document.querySelector('[data-device-key]');
  const deviceKey = deviceKeyElement?.dataset.deviceKey;

  if (!pinBtn || !deviceKey) return;

  function updatePinState() {
    const pinnedDevices = storage.get('pinnedDevices', []);
    const isPinned = pinnedDevices.includes(deviceKey);
    
    pinBtn.classList.toggle('pinned', isPinned);
    pinBtn.querySelector('.pin-text').textContent = isPinned ? 'Unpin' : 'Pin';
  }

  updatePinState();

  pinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const pinnedDevices = storage.get('pinnedDevices', []);
    const isPinned = pinnedDevices.includes(deviceKey);

    if (isPinned) {
      pinnedDevices.splice(pinnedDevices.indexOf(deviceKey), 1);
      announcer.announce(`${deviceKey} unpinned`);
    } else {
      pinnedDevices.push(deviceKey);
      announcer.announce(`${deviceKey} pinned`);
    }

    storage.set('pinnedDevices', pinnedDevices);
    updatePinState();
  });
}

// =============================================================================
// TABLE MODAL FUNCTIONALITY (table page)
// =============================================================================

function initTableModal() {
  const modalElement = document.getElementById('columnsModal');
  if (!modalElement) return; // Not on table page

  // Configuration
  const CONFIG = {
    columns: {
      stableVersion: true,
      betaVersion: true,
      devVersion: true,
      canaryVersion: true,
      ltsVersion: false,
      ltcVersion: false,
      brandNames: true,
      releaseVersion: false,
      androidVersion: false,
      kernelVersion: false,
      architecture: false,
      recovery: false,
    },
    filters: {
      showEol: true,
      versionShading: false,
      platformVersions: false,
      popupDeviceNames: false,
    }
  };

  // State management
  const state = {
    savedColumns: storage.get("tableColumnsVisibility", CONFIG.columns),
    savedFilters: storage.get("tableFilters", CONFIG.filters),
    tempColumns: {},
    tempFilters: {}
  };

  // DOM Elements
  const elements = {
    toggleButton: document.getElementById("toggleColumnsButton"),
    applyButton: document.getElementById("applyColumns"),
    cancelButton: document.getElementById("cancelColumns"),
    showAllButton: document.getElementById("showAllColumns"),
    resetButton: document.getElementById("resetDefaults"),
    closeDeviceNamesBtn: document.getElementById('closeDeviceNames')
  };

  if (!elements.toggleButton) return; // Safety check

  // Modal setup
  modal.setup('columnsModal', {
    closeOnClickOutside: true,
    closeOnEscape: true,
    closeButton: '.modal-close'
  });

  modal.setup('deviceNamesModal', {
    closeOnClickOutside: true,
    closeOnEscape: true,
    closeButton: '.modal-close',
    buttons: {
      '#closeDeviceNames': () => modal.hide('deviceNamesModal')
    }
  });

  modal.setup('recoveryModal', {
    closeOnClickOutside: true,
    closeOnEscape: true,
    closeButton: '.modal-close',
    buttons: {
      '#closeRecovery': () => modal.hide('recoveryModal')
    }
  });

  // Apply functions
  function applyColumnVisibility(columnStates) {
    Object.entries(columnStates).forEach(([key, isVisible]) => {
      dom.toggleElements(`.${key}`, isVisible, "table-cell");
    });
  }

  function applyFilters(filterStates) {
    // EOL devices
    dom.toggleElements('.eol-device', filterStates.showEol, 'table-row');

    // Board headers visibility
    document.querySelectorAll('.boardHeader').forEach(header => {
      let hasVisibleDevices = false;
      let nextRow = header.nextElementSibling;

      while (nextRow && !nextRow.classList.contains('boardHeader')) {
        if (nextRow.style.display !== 'none') {
          if (!nextRow.classList.contains('eol-device') || filterStates.showEol) {
            hasVisibleDevices = true;
            break;
          }
        }
        nextRow = nextRow.nextElementSibling;
      }

      header.style.display = hasVisibleDevices ? 'table-row' : 'none';
    });

    // Version shading and popup device names - shared table wrapper
    const tableWrapper = document.querySelector('.tablePageWrapper');
    const headerContainer = document.querySelector('.tableHeaderContainer');
    
    if (tableWrapper) {
      tableWrapper.classList.toggle('version-shading-enabled', filterStates.versionShading);
      tableWrapper.classList.toggle('popup-device-names-mode', filterStates.popupDeviceNames);
      
      if (headerContainer) {
        headerContainer.classList.toggle('version-shading-enabled', filterStates.versionShading);
      }
    }

    // Platform versions
    dom.toggleElements('.platform-version', filterStates.platformVersions);
    
    // Device names popup mode
    dom.toggleElements('.brand-names-full', !filterStates.popupDeviceNames, 'inline');
    dom.toggleElements('.brand-names-view-btn', filterStates.popupDeviceNames, 'inline-flex');
  }

  function hasHiddenColumns() {
    return Object.values(state.tempColumns).some(isVisible => !isVisible);
  }

  function updateShowAllButton() {
    elements.showAllButton.style.display = hasHiddenColumns() ? "block" : "none";
  }

  function resetTempState() {
    state.tempColumns = {...state.savedColumns};
    state.tempFilters = {...state.savedFilters};
    dom.updateCheckboxes(state.tempColumns);
    dom.updateCheckboxes(state.tempFilters);
    updateShowAllButton();
  }

  function saveState() {
    Object.assign(state.savedColumns, state.tempColumns);
    Object.assign(state.savedFilters, state.tempFilters);
    applyColumnVisibility(state.savedColumns);
    applyFilters(state.savedFilters);
    storage.set("tableColumnsVisibility", state.savedColumns);
    storage.set("tableFilters", state.savedFilters);
  }

  // Event listeners
  elements.toggleButton.addEventListener("click", (e) => {
    resetTempState();
    modal.show('columnsModal', e.currentTarget);
  });

  elements.cancelButton.addEventListener("click", () => modal.hide('columnsModal'));

  elements.showAllButton.addEventListener("click", () => {
    Object.keys(state.tempColumns).forEach(key => {
      state.tempColumns[key] = true;
    });
    dom.updateCheckboxes(state.tempColumns);
    updateShowAllButton();
  });

  elements.resetButton.addEventListener("click", () => {
    state.tempColumns = {...CONFIG.columns};
    state.tempFilters = {...CONFIG.filters};
    dom.updateCheckboxes(state.tempColumns);
    dom.updateCheckboxes(state.tempFilters);
    updateShowAllButton();
  });

  elements.applyButton.addEventListener("click", () => {
    saveState();
    modal.hide('columnsModal');
    // Announce the changes to screen readers
    const visibleCount = Object.values(state.savedColumns).filter(v => v).length;
    announcer.announce(`Table settings applied. ${visibleCount} columns visible.`);
  });

  // Checkbox event delegation
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('column-checkbox')) {
      const key = e.target.id.replace("toggle-", "");
      state.tempColumns[key] = e.target.checked;
      
      const label = e.target.closest('.column-option');
      label?.classList.toggle('disabled', !e.target.checked);
      updateShowAllButton();
    }
    
    if (e.target.classList.contains('filter-checkbox')) {
      const key = e.target.id.replace("toggle-", "");
      state.tempFilters[key] = e.target.checked;
      
      const label = e.target.closest('.column-option');
      label?.classList.toggle('disabled', !e.target.checked);
    }
  });

  // Device names popup functionality
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.brand-names-view-btn');
    if (!btn) return;

    const deviceKey = btn.dataset.deviceKey;
    const cell = btn.closest('td');
    const deviceNamesData = cell?.dataset.deviceNames;
    
    try {
      const deviceNames = JSON.parse(deviceNamesData || '[]');
      const content = !deviceNames.length 
        ? '<p style="text-align: center; color: var(--color-text-secondary);">No device names available</p>'
        : `<h3>${deviceKey}</h3><ul>${deviceNames.map(name => `<li>${name}</li>`).join('')}</ul>`;
      
      modal.setContent('deviceNamesModal', '#deviceNamesContent', content);
      modal.show('deviceNamesModal', btn);
    } catch (error) {
      console.error('Error parsing device names:', error);
    }
  });

  // Recovery popup functionality
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.recovery-view-btn');
    if (!btn) return;

    const deviceKey = btn.dataset.deviceKey;
    const recoveriesData = btn.dataset.recoveries;
    
    try {
      const recoveries = JSON.parse(recoveriesData || '{}');
      
      let content = '';
      
      // Handle new recoveries format
      if (recoveries && Object.keys(recoveries).length > 0) {
        const channels = [
          { key: 'stable', label: 'Stable', class: 'stable' },
          { key: 'beta', label: 'Beta', class: 'beta' },
          { key: 'ltc', label: 'LTC', class: 'ltc' },
          { key: 'ltr', label: 'LTR', class: 'ltr' }
        ];
        
        // Create two columns: stable on left, others on right
        content += `<div class="recovery-column-stable">`;
        const stableRecoveries = recoveries.stable || [];
        if (stableRecoveries.length > 0) {
          content += `<div class="recovery-channel-section">`;
          content += `<h4 class="recovery-channel-header stable">Stable</h4>`;
          stableRecoveries.forEach(recovery => {
            const version = recovery.chromeVersion || recovery.version;
            content += `<a href="${recovery.url}" target="_blank" class="recovery-link">Chrome OS ${version}</a>`;
          });
          content += `</div>`;
        }
        content += `</div>`;
        
        content += `<div class="recovery-column-others">`;
        ['beta', 'ltc', 'ltr'].forEach(channelKey => {
          const channel = channels.find(c => c.key === channelKey);
          const channelRecoveries = recoveries[channelKey] || [];
          if (channelRecoveries.length > 0) {
            content += `<div class="recovery-channel-section">`;
            content += `<h4 class="recovery-channel-header ${channel.class}">${channel.label}</h4>`;
            channelRecoveries.forEach(recovery => {
              const version = recovery.chromeVersion || recovery.version;
              content += `<a href="${recovery.url}" target="_blank" class="recovery-link">Chrome OS ${version}</a>`;
            });
            content += `</div>`;
          }
        });
        content += `</div>`;
      }
      
      
      if (content === '') {
        content = '<p style="text-align: center; color: var(--color-text-secondary);">No recovery images available</p>';
      }
      
      modal.setTitle('recoveryModal', `Recovery Images for ${deviceKey}`);
      modal.setContent('recoveryModal', '#recoveryContent', content);
      modal.show('recoveryModal', btn);
    } catch (error) {
      console.error('Error parsing recovery data:', error);
    }
  });

  // Initialize
  applyColumnVisibility(state.savedColumns);
  applyFilters(state.savedFilters);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

dom.ready(() => {
  // Initialize functionality based on what exists on the page
  initDropdown();      // Device and board pages
  initPinDevice();     // Device pages only
  initTableModal();    // Table page only
});