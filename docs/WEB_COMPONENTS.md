# Web Components Guide for CrOS Updates

## Table of Contents
1. [What Are Web Components?](#what-are-web-components)
2. [Why Use Them in This Project?](#why-use-them-in-this-project)
3. [Identified Refactoring Opportunities](#identified-refactoring-opportunities)
4. [Getting Started Tutorial](#getting-started-tutorial)
5. [Component API Reference](#component-api-reference)

---

## What Are Web Components?

**Web Components** are a suite of browser-native technologies that let you create reusable, encapsulated custom HTML elements **without frameworks**. They work in all modern browsers with no build tools required.

### The Three Core Technologies

#### 1. Custom Elements
Create your own HTML tags with custom behavior:

```javascript
class GreetingCard extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute('name') || 'World';
    this.innerHTML = `<h1>Hello, ${name}!</h1>`;
  }
}

// Register the component
customElements.define('greeting-card', GreetingCard);
```

```html
<!-- Use it anywhere -->
<greeting-card name="Alice"></greeting-card>
<!-- Renders: <h1>Hello, Alice!</h1> -->
```

#### 2. Shadow DOM (Optional)
Provides encapsulation - styles and scripts don't leak out or in:

```javascript
class StyledButton extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        button { background: blue; color: white; }
      </style>
      <button><slot></slot></button>
    `;
  }
}
customElements.define('styled-button', StyledButton);
```

#### 3. Templates & Slots
Reusable HTML chunks:

```html
<template id="card-template">
  <div class="card">
    <h2><slot name="title">Default Title</slot></h2>
    <p><slot>Default content</slot></p>
  </div>
</template>
```

---

## Why Use Them in This Project?

### Current Problems

Your codebase has **significant code duplication**:

| Problem | Files Affected | Duplication |
|---------|---------------|-------------|
| Recovery dropdown HTML generation | `device.11ty.js`, `board.11ty.js`, `flex.11ty.js` | 80% identical (3 files) |
| Version card rendering | `device.11ty.js`, `flex.11ty.js`, `board.11ty.js`, `pinned-devices.js` | 16+ instances |
| Modal setup logic | `app.js` (3 different modals) | Similar patterns |

### Current Pattern (String Concatenation)

```javascript
// device.11ty.js - lines 138-188
let dropdownHTML = `<div class="recoveryDropdown">`;
dropdownHTML += `<div class="recoveryWrapper">`;
dropdownHTML += `<button class="dropdownToggleBtn">▼</button>`;
// ... 50+ lines of string concatenation
dropdownHTML += `</div></div>`;

// board.11ty.js - lines 103-156
// Same code copy-pasted here!

// flex.11ty.js - lines 56-123
// And again here!
```

**Issues:**
- ❌ Hard to maintain (change in 3 places)
- ❌ Error-prone (XSS risks)
- ❌ No type safety
- ❌ Difficult to test
- ❌ No reusability

### Web Component Solution

```javascript
// components/recovery-dropdown.js
class RecoveryDropdown extends HTMLElement {
  connectedCallback() {
    const recoveries = JSON.parse(this.getAttribute('data-recoveries'));
    this.render(recoveries);
  }

  render(recoveries) {
    // Single source of truth for recovery UI
    this.innerHTML = this.buildDropdown(recoveries);
  }
}
customElements.define('recovery-dropdown', RecoveryDropdown);
```

```html
<!-- Use everywhere with one line -->
<recovery-dropdown data-recoveries='${JSON.stringify(recoveries)}'></recovery-dropdown>
```

**Benefits:**
- ✅ Write once, use everywhere
- ✅ Easier to maintain
- ✅ Better encapsulation
- ✅ Testable in isolation
- ✅ No framework overhead
- ✅ Works with your existing 11ty + vanilla JS setup

---

## Identified Refactoring Opportunities

### Priority 1: Recovery Dropdown Component

**Current State:** Duplicated in 3 files with 80% identical code

**Files:**
- `content/device.11ty.js` (lines 138-188)
- `content/board.11ty.js` (lines 103-156)
- `content/flex.11ty.js` (lines 56-123)

**Duplicated Code:**
```javascript
const channels = [
  { key: 'stable', label: 'Stable', class: 'stable' },
  { key: 'beta', label: 'Beta', class: 'beta' },
  { key: 'ltc', label: 'LTC', class: 'ltc' },
  { key: 'ltr', label: 'LTS', class: 'ltr' }
];

channels.forEach(channel => {
  const channelRecoveries = recoveries[channel.key] || [];
  if (channelRecoveries.length > 0) {
    dropdownHTML += `<div class="recovery-channel-section">`;
    dropdownHTML += `<div class="recovery-channel-header ${channel.class}">${channel.label}</div>`;
    // ... build recovery links
  }
});
```

**Proposed Component:**
```javascript
// components/recovery-dropdown.js
class RecoveryDropdown extends HTMLElement {
  static get observedAttributes() {
    return ['data-recoveries', 'data-latest-version', 'data-latest-url'];
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const recoveries = JSON.parse(this.getAttribute('data-recoveries') || '{}');
    const latestVersion = this.getAttribute('data-latest-version');
    const latestUrl = this.getAttribute('data-latest-url');

    this.innerHTML = `
      <div class="recoveryDropdown">
        <div class="recoveryWrapper${this.hasRecoveries(recoveries) ? '' : ' no-recoveries'}">
          ${this.renderLatestLink(latestVersion, latestUrl)}
          ${this.renderDropdownButton(recoveries)}
        </div>
        ${this.renderDropdownContent(recoveries)}
      </div>
    `;
  }

  hasRecoveries(recoveries) {
    return Object.values(recoveries).some(arr => arr && arr.length > 0);
  }

  renderLatestLink(version, url) {
    if (!url) return '';
    return `<a href="${url}" class="latestLink" aria-label="Download latest recovery image (version ${version})">Latest</a>`;
  }

  renderDropdownButton(recoveries) {
    if (!this.hasRecoveries(recoveries)) return '';
    return `<button class="dropdownToggleBtn" aria-label="Show all recovery versions" aria-expanded="false">▼</button>`;
  }

  renderDropdownContent(recoveries) {
    if (!this.hasRecoveries(recoveries)) return '';

    const channels = [
      { key: 'stable', label: 'Stable', class: 'stable' },
      { key: 'beta', label: 'Beta', class: 'beta' },
      { key: 'ltc', label: 'LTC', class: 'ltc' },
      { key: 'ltr', label: 'LTS', class: 'ltr' }
    ];

    const sections = channels.map(channel => {
      const channelRecoveries = recoveries[channel.key] || [];
      if (channelRecoveries.length === 0) return '';

      return `
        <div class="recovery-channel-section">
          <div class="recovery-channel-header ${channel.class}">${channel.label}</div>
          ${channelRecoveries.map(recovery => `
            <a href="${recovery.url}" class="recovery-link">
              ${recovery.chromeVersion || recovery.chrome_version}
            </a>
          `).join('')}
        </div>
      `;
    }).filter(Boolean).join('');

    return `<div class="dropdownContent">${sections}</div>`;
  }

  setupEventListeners() {
    const button = this.querySelector('.dropdownToggleBtn');
    if (!button) return;

    button.addEventListener('click', () => {
      const content = this.querySelector('.dropdownContent');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', !isExpanded);
      content.classList.toggle('show');
    });
  }
}

customElements.define('recovery-dropdown', RecoveryDropdown);
```

**Usage in 11ty:**
```javascript
// device.11ty.js, board.11ty.js, flex.11ty.js
// Before: 50+ lines of string concatenation
// After:
const recoveryDropdown = `
  <recovery-dropdown
    data-recoveries='${JSON.stringify(recoveries)}'
    data-latest-version="${latestRecovery?.chromeVersion}"
    data-latest-url="${latestRecoveryUrl}">
  </recovery-dropdown>
`;
```

**Impact:**
- ✅ Eliminates ~120 lines of duplicated code
- ✅ Single source of truth for recovery UI
- ✅ Easier to add features (e.g., filter, search within recoveries)
- ✅ Consistent behavior across all pages

---

### Priority 2: Version Card Component

**Current State:** Repeated 16+ times across 4 files

**Files:**
- `content/device.11ty.js` (lines 192-212) - 4 cards per device
- `content/flex.11ty.js` (lines 126-147) - 4 cards for Flex
- `content/board.11ty.js` (lines 64-91) - multiple device cards
- `_includes/pinned-devices.js` (lines 99-124, 168-193) - dynamic cards

**Duplicated Pattern:**
```javascript
// Repeated ~16 times
<div class="versionCard stable">
  <h1>Stable</h1>
  <h2>${formatVersion(device.stable.chrome.version)}</h2>
  <h3><span>Platform:</span>${device.stable.chrome.platform}</h3>
</div>
```

**Proposed Component:**
```javascript
// components/version-card.js
class VersionCard extends HTMLElement {
  static get observedAttributes() {
    return ['channel', 'chrome-version', 'platform-version', 'is-aue'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const channel = this.getAttribute('channel') || 'stable';
    const chromeVersion = this.getAttribute('chrome-version') || 'N/A';
    const platformVersion = this.getAttribute('platform-version') || '';
    const isAue = this.hasAttribute('is-aue');

    const channelLabels = {
      stable: 'Stable',
      beta: 'Beta',
      dev: 'Dev',
      canary: 'Canary LT'
    };

    this.className = `versionCard ${channel}`;
    this.innerHTML = `
      <h1>${channelLabels[channel] || channel}</h1>
      <h2>${this.formatVersion(chromeVersion, isAue)}</h2>
      ${platformVersion ? `<h3><span>Platform:</span>${platformVersion}</h3>` : ''}
    `;
  }

  formatVersion(version, isAue) {
    if (isAue) return `<span style="color: red;">${version}</span>`;
    return version;
  }
}

customElements.define('version-card', VersionCard);
```

**Usage:**
```javascript
// Before (device.11ty.js):
<div class="versionCard stable">
  <h1>Stable</h1>
  <h2>${formatVersion(device.stable.chrome.version)}</h2>
  <h3><span>Platform:</span>${device.stable.chrome.platform}</h3>
</div>

// After:
<version-card
  channel="stable"
  chrome-version="${device.stable.chrome.version}"
  platform-version="${device.stable.chrome.platform}"
  ${isAue ? 'is-aue' : ''}>
</version-card>
```

**Impact:**
- ✅ Eliminates ~80 lines of duplicated code
- ✅ Dynamic updates (if version data changes)
- ✅ Consistent styling across all pages
- ✅ Easy to add features (tooltips, animations, etc.)

---

### Priority 3: Modal Dialog Component

**Current State:** 3 similar modal implementations with duplicated setup

**Files:**
- `public/js/app.js` (lines 348-568) - Column selection modal
- `public/js/app.js` (lines 571-634) - Device names modal
- `public/js/app.js` (lines 571-634) - Recovery versions modal

**Duplicated Pattern:**
```javascript
// Column modal setup
modal.setup('columnsModal', {
  onClose: () => { /* ... */ }
});

// Device names modal setup
modal.setup('deviceNamesModal', {
  onClose: () => { /* ... */ }
});

// Recovery modal setup
modal.setup('recoveryModal', {
  onClose: () => { /* ... */ }
});
```

**Proposed Component:**
```javascript
// components/modal-dialog.js
class ModalDialog extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupAccessibility();
  }

  render() {
    const title = this.getAttribute('title') || 'Modal';
    const modalId = this.getAttribute('modal-id') || 'modal';

    this.innerHTML = `
      <div class="modalOverlay" id="${modalId}Overlay" role="dialog"
           aria-modal="true" aria-labelledby="${modalId}Title">
        <div class="modalContent">
          <div class="modalHeader">
            <h2 id="${modalId}Title">${title}</h2>
            <button class="modalClose" aria-label="Close modal">×</button>
          </div>
          <div class="modalBody">
            <slot></slot>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const closeBtn = this.querySelector('.modalClose');
    const overlay = this.querySelector('.modalOverlay');

    closeBtn.addEventListener('click', () => this.hide());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) this.hide();
    });
  }

  setupAccessibility() {
    const overlay = this.querySelector('.modalOverlay');
    this.trapFocus(overlay);
  }

  show(triggerElement) {
    this.triggerElement = triggerElement;
    const overlay = this.querySelector('.modalOverlay');
    overlay.classList.add('show');

    // Focus first focusable element
    const firstFocusable = overlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();

    this.dispatchEvent(new CustomEvent('modal-opened'));
  }

  hide() {
    const overlay = this.querySelector('.modalOverlay');
    overlay.classList.remove('show');

    if (this.triggerElement) {
      this.triggerElement.focus();
    }

    this.dispatchEvent(new CustomEvent('modal-closed'));
  }

  isVisible() {
    return this.querySelector('.modalOverlay').classList.contains('show');
  }

  trapFocus(element) {
    element.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    });
  }
}

customElements.define('modal-dialog', ModalDialog);
```

**Usage:**
```html
<!-- Before: Complex modal.setup() calls in app.js -->
<!-- After: -->
<modal-dialog modal-id="columns" title="Select Columns">
  <div id="columnsContent">
    <!-- Column checkboxes -->
  </div>
</modal-dialog>

<modal-dialog modal-id="deviceNames" title="Device Names">
  <div id="deviceNamesContent"></div>
</modal-dialog>

<modal-dialog modal-id="recovery" title="Recovery Versions">
  <div id="recoveryContent"></div>
</modal-dialog>
```

```javascript
// Simplified JavaScript
document.querySelector('modal-dialog[modal-id="columns"]').show(triggerButton);
```

**Impact:**
- ✅ Eliminates ~150 lines of duplicated modal logic
- ✅ Consistent accessibility across all modals
- ✅ Easier to add new modals (just HTML, no JS setup)
- ✅ Better focus management

---

## Getting Started Tutorial

### Step 1: Create Your First Component

Let's create a simple component to understand the basics.

**File: `public/js/components/hello-world.js`**

```javascript
class HelloWorld extends HTMLElement {
  // Called when element is added to the DOM
  connectedCallback() {
    const name = this.getAttribute('name') || 'World';
    this.render(name);
  }

  render(name) {
    this.innerHTML = `
      <div class="hello-card">
        <h1>Hello, ${name}!</h1>
        <button>Click me</button>
      </div>
    `;

    // Add event listeners
    this.querySelector('button').addEventListener('click', () => {
      alert(`Hello from ${name}`);
    });
  }
}

// Register the component (tag name must contain a hyphen)
customElements.define('hello-world', HelloWorld);
```

**File: `test.html`**

```html
<!DOCTYPE html>
<html>
<head>
  <title>Web Component Test</title>
</head>
<body>
  <h1>Web Component Demo</h1>

  <!-- Use your component -->
  <hello-world name="Alice"></hello-world>
  <hello-world name="Bob"></hello-world>
  <hello-world></hello-world>

  <!-- Load the component -->
  <script src="/public/js/components/hello-world.js"></script>
</body>
</html>
```

**Result:** Three cards appear, each with a button that shows an alert.

---

### Step 2: Reactive Attributes

Components can react to attribute changes:

```javascript
class CounterButton extends HTMLElement {
  static get observedAttributes() {
    // Attributes to watch for changes
    return ['count'];
  }

  connectedCallback() {
    this.count = parseInt(this.getAttribute('count') || '0');
    this.render();
    this.setupListeners();
  }

  // Called when observed attributes change
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'count') {
      this.count = parseInt(newValue);
      this.render();
    }
  }

  render() {
    this.innerHTML = `
      <button class="counter-btn">
        Count: ${this.count}
      </button>
    `;
  }

  setupListeners() {
    this.querySelector('button').addEventListener('click', () => {
      this.count++;
      this.setAttribute('count', this.count); // Triggers attributeChangedCallback
    });
  }
}

customElements.define('counter-button', CounterButton);
```

```html
<counter-button count="5"></counter-button>
<!-- Clicking increments from 5 -->
```

---

### Step 3: Using Templates (More Efficient)

For better performance, use `<template>` tags:

```javascript
class UserCard extends HTMLElement {
  connectedCallback() {
    const template = document.getElementById('user-card-template');
    const content = template.content.cloneNode(true);

    // Fill in data
    content.querySelector('.user-name').textContent = this.getAttribute('name');
    content.querySelector('.user-email').textContent = this.getAttribute('email');

    this.appendChild(content);
  }
}

customElements.define('user-card', UserCard);
```

```html
<template id="user-card-template">
  <div class="card">
    <h3 class="user-name"></h3>
    <p class="user-email"></p>
  </div>
</template>

<user-card name="Alice" email="alice@example.com"></user-card>
```

---

### Step 4: Shadow DOM (Advanced)

Shadow DOM provides true encapsulation:

```javascript
class FancyButton extends HTMLElement {
  connectedCallback() {
    // Create shadow root
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        /* These styles ONLY apply inside this component */
        button {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          transform: scale(1.05);
        }
      </style>
      <button>
        <slot></slot> <!-- Content from outside goes here -->
      </button>
    `;
  }
}

customElements.define('fancy-button', FancyButton);
```

```html
<!-- Global CSS won't affect this button -->
<fancy-button>Click Me</fancy-button>
```

---

### Step 5: Integrating with 11ty

Web components work great with Eleventy's static generation:

**File: `content/device.11ty.js`**

```javascript
// In your 11ty template
const renderDevice = (device) => {
  return `
    <div class="device-page">
      <h1>${device.name}</h1>

      <!-- Use web components in generated HTML -->
      <div class="version-cards">
        <version-card
          channel="stable"
          chrome-version="${device.stable.chrome.version}"
          platform-version="${device.stable.chrome.platform}">
        </version-card>

        <version-card
          channel="beta"
          chrome-version="${device.beta.chrome.version}"
          platform-version="${device.beta.chrome.platform}">
        </version-card>
      </div>

      <recovery-dropdown
        data-recoveries='${JSON.stringify(device.recoveries)}'
        data-latest-url="${device.latestRecoveryUrl}">
      </recovery-dropdown>
    </div>

    <!-- Load components at the end -->
    <script src="/public/js/components/version-card.js"></script>
    <script src="/public/js/components/recovery-dropdown.js"></script>
  `;
};
```

**The Magic:**
1. Eleventy generates static HTML with custom elements
2. Browser loads the page (sees `<version-card>` etc.)
3. JavaScript loads and registers the components
4. Custom elements "upgrade" and render themselves

---

## Component API Reference

### Base Component Lifecycle

```javascript
class MyComponent extends HTMLElement {
  // LIFECYCLE METHODS (called by browser)

  constructor() {
    super();
    // Called when element is created
    // Don't modify DOM here (not attached yet)
  }

  connectedCallback() {
    // Called when element is added to DOM
    // BEST PLACE to render and setup
  }

  disconnectedCallback() {
    // Called when element is removed from DOM
    // Clean up event listeners, timers, etc.
  }

  adoptedCallback() {
    // Called when moved to new document
    // Rarely used
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // Called when observed attribute changes
    // Must declare static observedAttributes
  }

  // REQUIRED: Declare which attributes to observe
  static get observedAttributes() {
    return ['my-attr', 'another-attr'];
  }
}
```

### Common Patterns

#### Pattern 1: Simple Rendering
```javascript
class SimpleCard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div class="card">${this.getAttribute('content')}</div>`;
  }
}
```

#### Pattern 2: Data-Driven
```javascript
class DataList extends HTMLElement {
  connectedCallback() {
    const data = JSON.parse(this.getAttribute('data') || '[]');
    this.innerHTML = `
      <ul>
        ${data.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `;
  }
}
```

#### Pattern 3: Interactive
```javascript
class ToggleButton extends HTMLElement {
  connectedCallback() {
    this.isOn = this.hasAttribute('on');
    this.render();
    this.addEventListener('click', () => this.toggle());
  }

  toggle() {
    this.isOn = !this.isOn;
    this.render();
    this.dispatchEvent(new CustomEvent('toggle', {
      detail: { isOn: this.isOn }
    }));
  }

  render() {
    this.innerHTML = `<button>${this.isOn ? 'ON' : 'OFF'}</button>`;
  }
}
```

#### Pattern 4: Slots (Content Projection)
```javascript
class CardWrapper extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="card">
        <div class="header"><slot name="header"></slot></div>
        <div class="body"><slot></slot></div>
        <div class="footer"><slot name="footer"></slot></div>
      </div>
    `;
  }
}
```

```html
<card-wrapper>
  <span slot="header">My Title</span>
  <p>Main content goes here</p>
  <button slot="footer">Action</button>
</card-wrapper>
```

---

## Best Practices

### DO ✅

1. **Use semantic tag names with hyphens**
   ```javascript
   customElements.define('user-profile', UserProfile); // ✅
   customElements.define('userprofile', UserProfile);  // ❌ No hyphen
   ```

2. **Clean up in disconnectedCallback**
   ```javascript
   connectedCallback() {
     this.interval = setInterval(() => this.update(), 1000);
   }

   disconnectedCallback() {
     clearInterval(this.interval); // ✅ Prevent memory leaks
   }
   ```

3. **Use data attributes for complex data**
   ```html
   <my-component data-config='{"foo": "bar"}'></my-component>
   ```

4. **Emit custom events for communication**
   ```javascript
   this.dispatchEvent(new CustomEvent('item-selected', {
     bubbles: true,
     detail: { itemId: 123 }
   }));
   ```

5. **Progressive enhancement**
   ```html
   <!-- Works even if JS fails to load -->
   <user-card name="Alice">
     <div class="fallback">Alice (JavaScript disabled)</div>
   </user-card>
   ```

### DON'T ❌

1. **Don't manipulate DOM in constructor**
   ```javascript
   constructor() {
     super();
     this.innerHTML = '...'; // ❌ Not attached to DOM yet
   }
   ```

2. **Don't forget to call super()**
   ```javascript
   constructor() {
     super(); // ✅ Required
     // Your code...
   }
   ```

3. **Don't use global variables**
   ```javascript
   // Bad
   let componentData = {};

   // Good
   class MyComponent extends HTMLElement {
     connectedCallback() {
       this.data = {}; // Instance property
     }
   }
   ```

4. **Don't block the main thread**
   ```javascript
   // Bad
   connectedCallback() {
     for (let i = 0; i < 1000000; i++) { /* heavy work */ }
   }

   // Good
   async connectedCallback() {
     await this.loadDataAsync();
   }
   ```

---

## Testing Web Components

### Unit Testing Example (with Jest)

```javascript
// version-card.test.js
describe('VersionCard', () => {
  beforeEach(() => {
    // Register component
    require('./version-card.js');
  });

  test('renders with correct version', () => {
    document.body.innerHTML = `
      <version-card
        channel="stable"
        chrome-version="119.0.6045.159">
      </version-card>
    `;

    const card = document.querySelector('version-card');
    expect(card.querySelector('h2').textContent).toBe('119.0.6045.159');
  });

  test('updates when attribute changes', () => {
    const card = document.createElement('version-card');
    card.setAttribute('chrome-version', '120.0.0.0');
    document.body.appendChild(card);

    expect(card.querySelector('h2').textContent).toBe('120.0.0.0');

    card.setAttribute('chrome-version', '121.0.0.0');
    expect(card.querySelector('h2').textContent).toBe('121.0.0.0');
  });
});
```

---

## Migration Strategy

### Phase 1: Create Components (No Breaking Changes)

1. Create `public/js/components/` directory
2. Build components (recovery-dropdown, version-card, modal-dialog)
3. Load components in existing pages
4. Test components work alongside existing code

### Phase 2: Gradual Replacement

1. Replace one usage at a time (e.g., device.11ty.js recovery dropdown)
2. Test thoroughly
3. Move to next file (board.11ty.js, then flex.11ty.js)
4. Remove old string concatenation code

### Phase 3: Cleanup

1. Remove duplicated functions
2. Update documentation
3. Add component library docs

### Phase 4: Enhance (Optional)

1. Add Shadow DOM for true encapsulation
2. Create more components (search-box, device-card, etc.)
3. Add animations and transitions
4. Improve accessibility

---

## Resources

### Official Documentation
- [MDN Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Custom Elements Spec](https://html.spec.whatwg.org/multipage/custom-elements.html)
- [Shadow DOM Spec](https://dom.spec.whatwg.org/#shadow-trees)

### Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ (use polyfills if needed)

### Tools
- [webcomponents.org](https://www.webcomponents.org/) - Component examples
- [open-wc.org](https://open-wc.org/) - Best practices and tools
- [Lit](https://lit.dev/) - Lightweight library (if you want helpers)

---

## Questions?

Common questions developers ask:

**Q: Do I need a build tool?**
A: No! Web components work with plain JavaScript files. No webpack, no babel required.

**Q: Can I use them with my existing CSS?**
A: Yes! Without Shadow DOM, your global CSS applies normally. With Shadow DOM, you control what styles apply.

**Q: Are they slow?**
A: No! They're native browser features, often faster than framework components.

**Q: Can I use them with React/Vue later?**
A: Yes! Web components are framework-agnostic and work everywhere.

**Q: What about SEO?**
A: Since you're using 11ty for static generation, the HTML is pre-rendered. Perfect for SEO.

**Q: How do I share data between components?**
A: Use custom events, attributes, or a simple pub/sub pattern.

---

## Next Steps

1. Read the [Getting Started Tutorial](#getting-started-tutorial)
2. Try the "Hello World" example
3. Review the [Refactoring Opportunities](#identified-refactoring-opportunities)
4. Pick one component to implement (start with Version Card - easiest)
5. Test it thoroughly
6. Expand to other components

Happy component building! 🎉
