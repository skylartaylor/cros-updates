/**
 * Search Box Web Component
 *
 * Wraps the DeviceSearch class in a reusable web component with configuration options.
 * Encapsulates the HTML structure and initialization logic for device/board search.
 *
 * Usage:
 *   <!-- Homepage search (shows all results on focus) -->
 *   <search-box
 *     placeholder="Search devices, boards, or brands..."
 *     auto-show-results="true"
 *     auto-focus-unless-pinned="true">
 *   </search-box>
 *
 *   <!-- Header search (only shows results when typing) -->
 *   <search-box
 *     placeholder="Search..."
 *     auto-show-results="false"
 *     custom-class="header-search">
 *   </search-box>
 *
 * Attributes:
 *   - placeholder: Placeholder text for search input [default: "Search..."]
 *   - search-index-url: URL to fetch search index JSON [default: "/search.json"]
 *   - auto-show-results: Show all results on focus [default: "true"]
 *   - auto-focus: Auto-focus the input on mount [default: "false"]
 *   - auto-focus-unless-pinned: Only auto-focus if no pinned devices in localStorage [default: "false"]
 *   - custom-class: Additional CSS class for styling [optional]
 *   - debounce-delay: Debounce delay in ms [default: "150"]
 *
 * Events:
 *   - search-initialized: Fired when search index is loaded
 *   - search-query: Fired when user types (detail: {query})
 *   - search-result-selected: Fired when user selects a result (detail: {result})
 *
 * Methods:
 *   - focus(): Programmatically focus the search input
 *   - clear(): Clear the search input and hide results
 *   - getSearchInstance(): Get the underlying DeviceSearch instance
 */
class SearchBox extends HTMLElement {
  constructor() {
    super();
    this.searchInstance = null;
    this.searchInput = null;
    this.resultsContainer = null;
  }

  connectedCallback() {
    this.render();
    this.initializeSearch();
  }

  disconnectedCallback() {
    // Clean up if needed
    if (this.searchInstance) {
      // DeviceSearch handles its own cleanup
    }
  }

  render() {
    const placeholder = this.getAttribute('placeholder') || 'Search...';
    const customClass = this.getAttribute('custom-class') || '';

    // Generate unique IDs for this instance
    const uniqueId = `search-${Math.random().toString(36).substr(2, 9)}`;
    const inputId = `${uniqueId}-input`;
    const resultsId = `${uniqueId}-results`;

    this.innerHTML = `
      <div class="search-box-container ${customClass}">
        <input
          id="${inputId}"
          type="text"
          class="search-input"
          autocomplete="off"
          placeholder="${placeholder}"
          aria-label="${placeholder}"
          aria-autocomplete="list"
          aria-controls="${resultsId}"
          role="combobox"
          aria-expanded="false" />
        <div
          id="${resultsId}"
          class="search-results"
          role="listbox"
          aria-label="Search results">
        </div>
      </div>
    `;

    this.searchInput = this.querySelector(`#${inputId}`);
    this.resultsContainer = this.querySelector(`#${resultsId}`);
  }

  async initializeSearch() {
    const searchIndexUrl = this.getAttribute('search-index-url') || '/search.json';
    const debounceDelay = parseInt(this.getAttribute('debounce-delay') || '150');
    const autoShowResults = this.getAttribute('auto-show-results') !== 'false';

    // Check if DeviceSearch class is available
    if (typeof DeviceSearch === 'undefined') {
      console.error('DeviceSearch class not found. Make sure search.js is loaded before search-box.js');
      this.resultsContainer.innerHTML = '<p class="error">Search unavailable. Please reload the page.</p>';
      return;
    }

    // Create DeviceSearch instance
    this.searchInstance = new DeviceSearch({
      debounceDelay,
      renderResult: this.defaultResultTemplate.bind(this)
    });

    // Initialize with our elements
    await this.searchInstance.initialize(this.searchInput, this.resultsContainer);

    // Configure auto-show behavior
    if (!autoShowResults) {
      this.disableAutoShow();
    }

    // Handle auto-focus
    this.handleAutoFocus();

    // Dispatch initialized event
    this.dispatchEvent(new CustomEvent('search-initialized', {
      bubbles: true,
      detail: { searchInstance: this.searchInstance }
    }));

    // Add event listener to dispatch custom events
    this.searchInput.addEventListener('input', () => {
      this.dispatchEvent(new CustomEvent('search-query', {
        bubbles: true,
        detail: { query: this.searchInput.value }
      }));
    });
  }

  disableAutoShow() {
    // Override the DeviceSearch behavior to only show results when typing
    const originalShowAllResults = this.searchInstance.showAllResults.bind(this.searchInstance);
    this.searchInstance.showAllResults = () => {}; // Disable auto-show on focus

    const originalHandleInput = this.searchInstance.handleInput.bind(this.searchInstance);
    this.searchInstance.handleInput = () => {
      const query = this.searchInput.value.toLowerCase().trim();
      if (!query) {
        this.searchInstance.hideResults();
        return;
      }
      originalHandleInput();
    };
  }

  handleAutoFocus() {
    const autoFocus = this.hasAttribute('auto-focus');
    const autoFocusUnlessPinned = this.hasAttribute('auto-focus-unless-pinned');

    if (autoFocusUnlessPinned) {
      // Check localStorage for pinned devices
      try {
        const pinnedDevices = JSON.parse(localStorage.getItem('pinnedDevices') || '[]');
        if (pinnedDevices.length === 0) {
          // No pinned devices, so auto-focus
          this.focus();
        }
      } catch (e) {
        console.error('Error checking pinned devices:', e);
        // If there's an error, don't auto-focus to be safe
      }
    } else if (autoFocus) {
      // Always auto-focus
      this.focus();
    }
  }

  defaultResultTemplate(result) {
    const isDeviceKeyMatch = result.matchSource === 'key' && result.type === 'device';
    const tag = isDeviceKeyMatch
      ? `<span class="result-tag">Device</span>`
      : (result.type === 'board' ? `<span class="result-tag">Board</span>` : '');

    return `
      <a href="/${result.type}/${result.key}" class="result-item" role="option">
        <h2>${result.displayName} ${tag}</h2>
      </a>
    `;
  }

  // Public API methods

  /**
   * Focus the search input
   */
  focus() {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  /**
   * Clear the search input and hide results
   */
  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    if (this.searchInstance) {
      this.searchInstance.hideResults();
    }
  }

  /**
   * Get the underlying DeviceSearch instance for advanced usage
   */
  getSearchInstance() {
    return this.searchInstance;
  }

  /**
   * Show results programmatically
   */
  showResults() {
    if (this.searchInstance) {
      this.searchInstance.showResults();
    }
  }

  /**
   * Hide results programmatically
   */
  hideResults() {
    if (this.searchInstance) {
      this.searchInstance.hideResults();
    }
  }
}

customElements.define('search-box', SearchBox);
