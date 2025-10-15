class DeviceSearch {
  constructor(options = {}) {
    this.searchInput = null;
    this.resultsContainer = null;
    this.selectedIndex = -1;
    this.searchIndex = [];
    this.onResultClick = options.onResultClick || null;
    this.renderResult = options.renderResult || this.defaultResultTemplate;
    this.debounceTimer = null;
    this.debounceDelay = options.debounceDelay || 150;
  }

  async initialize(searchInput, resultsContainer) {
    [this.searchInput, this.resultsContainer] = [searchInput, resultsContainer];
    await this.loadSearchIndex();
    this.setupEventListeners();
  }

  async loadSearchIndex() {
    try {
      const response = await fetch("/search.json");
      if (!response.ok) throw new Error("Failed to load search index");
      this.searchIndex = await response.json();
    } catch (error) {
      console.error("Error loading search index:", error);
      this.resultsContainer.innerHTML = "<p>Error loading search index.</p>";
    }
  }

  setupEventListeners() {
    document.addEventListener('click', e => {
      if (!this.resultsContainer.contains(e.target) && e.target !== this.searchInput) {
        this.hideResults();
      }
    });

    this.searchInput.addEventListener('keydown', this.handleKeydown.bind(this));
    this.searchInput.addEventListener('input', this.handleInput.bind(this));
    this.searchInput.addEventListener('focus', () => this.showAllResults(true));
    this.searchInput.addEventListener('click', () => {
      if (!this.resultsContainer.classList.contains('show')) {
        this.showAllResults(true);
      }
    });
  }

  handleKeydown(e) {
    const items = this.resultsContainer.querySelectorAll('.result-item');
    const keyActions = {
      ArrowDown: () => {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % items.length;
      },
      ArrowUp: () => {
        e.preventDefault();
        this.selectedIndex = this.selectedIndex <= 0 ? items.length - 1 : this.selectedIndex - 1;
      },
      Enter: () => {
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const selectedItem = items[this.selectedIndex];
          this.onResultClick ? this.onResultClick(selectedItem) : selectedItem.click();
        }
      },
      Escape: () => this.hideResults()
    };

    if (keyActions[e.key]) {
      keyActions[e.key]();
      this.updateSelection(items);
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      const isSelected = index === this.selectedIndex;
      item.classList.toggle('selected', isSelected);
      item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      if (isSelected) {
        item.scrollIntoView({ block: 'nearest' });
        // Announce to screen readers
        item.setAttribute('aria-live', 'polite');
      } else {
        item.removeAttribute('aria-live');
      }
    });
  }

  handleInput() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const query = this.searchInput.value.toLowerCase().trim();
      if (!query) return this.showAllResults(true);
      this.renderResults(this.getSearchResults(query), query);
    }, this.debounceDelay);
  }

  getSearchResults(query) {
    const results = [];
    
    this.searchIndex.forEach(item => {
      if (item.type === "device") {
        this.processDeviceItem(item, query, results);
      } else {
        this.processNonDeviceItem(item, query, results);
      }
    });

    return this.sortResults(results, query);
  }

  processDeviceItem(item, query, results) {
    // Search brandNames
    if (item.brandNames) {
      item.brandNames.forEach(brandName => {
        const brandNameLower = brandName.toLowerCase();
        const exactMatch = brandNameLower.split(/[-_\s]/).some(word => word === query);

        if (exactMatch || brandNameLower.includes(query)) {
          results.push({
            ...item,
            displayName: brandName,
            matchType: exactMatch ? 'exact' : 'partial',
            matchSource: 'brand'
          });
        }
      });
    }

    // Search key (board name itself)
    const keyLower = item.key.toLowerCase();
    if (keyLower.includes(query)) {
      const exactMatch = keyLower.split(/[-_\s]/).some(word => word === query);
      results.push({
        ...item,
        displayName: item.key,
        matchType: exactMatch ? 'exact' : 'partial',
        matchSource: 'key'
      });
    }
  }

  processNonDeviceItem(item, query, results) {
    const key = item.key?.toLowerCase() || "";
    const exactMatch = key.split(/[-_\s]/).some(word => word === query);
    
    if (exactMatch || key.includes(query)) {
      results.push({
        ...item,
        displayName: item.key,
        matchType: exactMatch ? 'exact' : 'partial'
      });
    }
  }

  sortResults(results, query) {
    return results.sort((a, b) => {
      if (query) {
        // Prioritize exact matches
        if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
        if (a.matchType !== 'exact' && b.matchType === 'exact') return 1;

        // Prioritize device keys over brand names
        if (a.matchSource === 'key' && b.matchSource !== 'key') return -1;
        if (a.matchSource !== 'key' && b.matchSource === 'key') return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }

  defaultResultTemplate(result) {
    const isDeviceKeyMatch = result.matchSource === 'key' && result.type === 'device';
    const tag = isDeviceKeyMatch
      ? `<span class="result-tag">Device</span>`
      : (result.type === 'board' ? `<span class="result-tag">Board</span>` : '');

    return `
      <a href="/${result.type}/${result.key}" class="result-item">
        <h2>${result.displayName} ${tag}</h2>
      </a>
    `;
  }

  renderResults(results, query) {
    const count = results.length;
    const announcement = count === 0
      ? "No results found"
      : `${count} result${count !== 1 ? 's' : ''} found`;

    // Use DocumentFragment for efficient DOM batching
    const fragment = document.createDocumentFragment();

    if (results.length) {
      results.forEach(result => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = this.renderResult(result, query);
        // Append the first child (the actual result element) to the fragment
        if (tempDiv.firstElementChild) {
          fragment.appendChild(tempDiv.firstElementChild);
        }
      });
    } else {
      const noResults = document.createElement("p");
      noResults.className = "no-results";
      noResults.setAttribute("role", "status");
      noResults.textContent = "No results found.";
      fragment.appendChild(noResults);
    }

    // Clear and update in a single reflow
    this.resultsContainer.innerHTML = '';
    this.resultsContainer.appendChild(fragment);

    // Announce to screen readers
    this.resultsContainer.setAttribute('role', 'region');
    this.resultsContainer.setAttribute('aria-label', announcement);

    this.selectedIndex = -1;
    this.showResults();
  }

  showResults() {
    this.resultsContainer.classList.add('show');
  }

  hideResults() {
    this.resultsContainer.classList.remove('show');
    this.selectedIndex = -1;
  }

  showAllResults(alphabetizeAll = true) {
    const allResults = this.searchIndex.flatMap(item => {
      if (item.type === "device" && item.brandNames) {
        const brands = item.brandNames.map(brandName => ({
          ...item,
          displayName: brandName,
          matchSource: 'brand'
        }));

        // Add the key itself as a searchable item
        const keyEntry = {
          ...item,
          displayName: item.key,
          matchSource: 'key'
        };

        return [...brands, keyEntry];
      } else {
        return [{
          ...item,
          displayName: item.key
        }];
      }
    });

    this.renderResults(this.sortResults(allResults, !alphabetizeAll));
  }
}