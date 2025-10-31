# Web Components Usage Guide

This document shows practical examples of how to use the web components in the CrOS Updates project.

## Available Components

1. **`<recovery-dropdown>`** - Recovery images dropdown with channel grouping
2. **`<version-card>`** - Chrome OS version display cards
3. **`<modal-dialog>`** - Accessible modal dialogs

---

## Recovery Dropdown Component

### Basic Usage (Device/Board Pages)

```javascript
// In device.11ty.js or board.11ty.js
<recovery-dropdown
  data-recoveries='${JSON.stringify(deviceData.recoveries || {})}'
  data-latest-version="${latestRecoveryVersion}"
  data-latest-url="${latestRecoveryURL}">
</recovery-dropdown>
```

### Flex Page Format

```javascript
// In flex.11ty.js
<recovery-dropdown
  data-recoveries='${JSON.stringify(recoveryData || [])}'
  data-latest-version="${latestRecoveryVersion}"
  data-latest-url="${latestRecoveryURL}"
  data-format="flex">
</recovery-dropdown>
```

### Data Format Examples

**Device/Board Format (Object with channel keys):**
```json
{
  "stable": [
    {"url": "https://...", "chromeVersion": "119.0.6045.159"},
    {"url": "https://...", "chromeVersion": "118.0.5993.117"}
  ],
  "beta": [
    {"url": "https://...", "chromeVersion": "120.0.6099.56"}
  ],
  "ltc": [],
  "ltr": [
    {"url": "https://...", "chromeVersion": "114.0.5735.243"}
  ]
}
```

**Flex Format (Array with channel property):**
```json
[
  {"url": "https://...", "chrome_version": "119", "channel": "stable"},
  {"url": "https://...", "chrome_version": "120", "channel": "beta"},
  {"url": "https://...", "chrome_version": "114", "channel": "ltr"}
]
```

### Integration with Pin Button

If you need to include a pin button alongside the recovery dropdown:

```html
<div class="recoveryDropdown">
  <div class="recoveryWrapper">
    <!-- Pin button -->
    <button class="pin-device-btn deviceHeaderBtn" data-device="${deviceKey}">
      <svg class="pin-icon">...</svg>
      <span class="pin-text">Pin</span>
    </button>

    <!-- Recovery dropdown component -->
    <recovery-dropdown
      show-button-only
      data-latest-version="${version}"
      data-latest-url="${url}">
    </recovery-dropdown>

    <!-- Dropdown toggle -->
    <button class="dropdownToggleBtn">▼</button>
  </div>

  <!-- Full dropdown content -->
  <recovery-dropdown
    data-recoveries='${JSON.stringify(recoveries)}'
    data-format="device">
  </recovery-dropdown>
</div>
```

---

## Version Card Component

### Basic Usage (4 Channel Cards)

```html
<div class="versionCardContainer">
  <version-card
    channel="stable"
    chrome-version="${device.servingStable?.chromeVersion || 'Unavailable'}"
    platform-version="${device.servingStable?.version || 'Unavailable'}">
  </version-card>

  <version-card
    channel="beta"
    chrome-version="${device.servingBeta?.chromeVersion || 'Unavailable'}"
    platform-version="${device.servingBeta?.version || 'Unavailable'}">
  </version-card>

  <version-card
    channel="dev"
    chrome-version="${device.servingDev?.chromeVersion || 'Unavailable'}"
    platform-version="${device.servingDev?.version || 'Unavailable'}">
  </version-card>

  <version-card
    channel="canary"
    chrome-version="${device.servingLongTermSupport?.chromeVersion || 'Unavailable'}"
    platform-version="${device.servingLongTermSupport?.version || 'Unavailable'}">
  </version-card>
</div>
```

### With Custom Styling (Pinned Devices)

```html
<!-- Custom class for pinned device cards -->
<version-card
  channel="stable"
  chrome-version="119.0.6045.159"
  platform-version="15633.69.0"
  custom-class="pinned-card flip-enabled">
</version-card>
```

```css
/* CSS targeting custom class */
.pinned-card {
  border: 2px solid #4285f4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pinned-card.flip-enabled {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
```

### AUE (Auto Update Expiration) Styling

```html
<!-- Red text for expired devices -->
<version-card
  channel="stable"
  chrome-version="109.0.5414.125"
  platform-version="15236.80.0"
  is-aue>
</version-card>
```

### Hide Platform Version

```html
<!-- Only show Chrome version, not platform -->
<version-card
  channel="stable"
  chrome-version="119.0.6045.159"
  hide-platform>
</version-card>
```

### Board Device Cards (Compact Version)

```html
<!-- For board landing pages -->
<version-card
  channel="stable"
  chrome-version="119.0.6045.159"
  custom-class="board-device-card compact">
</version-card>
```

---

## Modal Dialog Component

### Basic Modal

```html
<modal-dialog modal-id="exampleModal" modal-title="Example Modal">
  <div slot="content">
    <p>This is the modal content.</p>
  </div>
</modal-dialog>
```

```javascript
// Show the modal
const modal = document.querySelector('modal-dialog[modal-id="exampleModal"]');
const triggerButton = document.querySelector('#openModalBtn');
modal.show(triggerButton); // Focus returns to button on close

// Hide the modal
modal.hide();

// Or use the static getter
ModalDialog.get('exampleModal').show();
```

### Column Selection Modal (Table Page)

```html
<modal-dialog modal-id="columnsModal" modal-title="Select Columns">
  <div slot="content">
    <div class="checkbox-group">
      <label><input type="checkbox" id="brandCheckbox" checked> Brand Name</label>
      <label><input type="checkbox" id="deviceCheckbox" checked> Device Name</label>
      <label><input type="checkbox" id="stableCheckbox" checked> Stable</label>
      <!-- ... more checkboxes ... -->
    </div>
  </div>
  <div slot="footer">
    <button id="applyColumns" class="btn-primary">Apply</button>
  </div>
</modal-dialog>
```

```javascript
// Event handling
const modal = ModalDialog.get('columnsModal');

modal.addEventListener('modal-opened', () => {
  console.log('Modal opened');
});

modal.addEventListener('modal-closed', () => {
  console.log('Modal closed');
  // Save preferences, etc.
});

// Show modal on button click
document.querySelector('#columnsBtn').addEventListener('click', (e) => {
  modal.show(e.target);
});
```

### Device Names Modal (Dynamic Content)

```html
<modal-dialog modal-id="deviceNamesModal" modal-title="">
  <div slot="content" id="deviceNamesContent">
    <!-- Content populated dynamically -->
  </div>
</modal-dialog>
```

```javascript
// Populate content dynamically
const showDeviceNames = (deviceKey, deviceNames) => {
  const modal = ModalDialog.get('deviceNamesModal');

  // Set title
  modal.setTitle(`Device Names - ${deviceKey}`);

  // Set content
  const content = `
    <ul class="device-names-list">
      ${deviceNames.map(name => `<li>${name}</li>`).join('')}
    </ul>
  `;
  modal.setContent(content);

  modal.show();
};
```

### Recovery Versions Modal

```html
<modal-dialog modal-id="recoveryModal" modal-title="Recovery Versions">
  <div slot="content" id="recoveryContent">
    <!-- Populated when modal opens -->
  </div>
</modal-dialog>
```

```javascript
// Show recovery modal with device-specific data
const showRecoveryModal = (deviceKey, recoveries) => {
  const modal = ModalDialog.get('recoveryModal');

  // Build recovery list HTML
  const content = `
    <div class="recovery-list">
      ${Object.entries(recoveries).map(([channel, versions]) => `
        <div class="channel-group">
          <h3>${channel.toUpperCase()}</h3>
          <ul>
            ${versions.map(v => `
              <li><a href="${v.url}">${v.chromeVersion}</a></li>
            `).join('')}
          </ul>
        </div>
      `).join('')}
    </div>
  `;

  modal.setContent(content);
  modal.show();
};
```

### Modal Without Close Button

```html
<modal-dialog
  modal-id="confirmModal"
  modal-title="Confirm Action"
  hide-close-button>
  <div slot="content">
    <p>Are you sure you want to proceed?</p>
  </div>
  <div slot="footer">
    <button id="confirmYes">Yes</button>
    <button id="confirmNo">No</button>
  </div>
</modal-dialog>
```

```javascript
// Manual close handling
document.querySelector('#confirmYes').addEventListener('click', () => {
  // Do action
  ModalDialog.get('confirmModal').hide();
});

document.querySelector('#confirmNo').addEventListener('click', () => {
  ModalDialog.get('confirmModal').hide();
});
```

### Disable Outside Click/Escape Close

```html
<modal-dialog
  modal-id="forcedModal"
  modal-title="Required Action"
  close-on-outside-click="false"
  close-on-escape="false">
  <div slot="content">
    <p>You must complete this action.</p>
  </div>
</modal-dialog>
```

---

## Loading Components

### In 11ty Layout Template

Add to your `_includes/layout.njk` or similar layout file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ... head content ... -->
</head>
<body>
  {{ content | safe }}

  <!-- Load components before your main app.js -->
  <script src="/public/js/components/recovery-dropdown.js"></script>
  <script src="/public/js/components/version-card.js"></script>
  <script src="/public/js/components/modal-dialog.js"></script>

  <!-- Then load main application -->
  <script src="/public/js/app.js"></script>
</body>
</html>
```

### Load Order Matters

Components must be loaded **before** you use them in JavaScript:

```html
<!-- ✅ CORRECT -->
<script src="/public/js/components/modal-dialog.js"></script>
<script>
  // This works - component is already defined
  ModalDialog.get('myModal').show();
</script>

<!-- ❌ INCORRECT -->
<script>
  // This fails - component not defined yet
  ModalDialog.get('myModal').show();
</script>
<script src="/public/js/components/modal-dialog.js"></script>
```

---

## Styling Components

### Targeting Components with CSS

```css
/* Style the version card component itself */
version-card {
  display: block;
  margin: 10px;
}

/* Style content inside version card */
version-card h1 {
  font-size: 18px;
  color: #333;
}

/* Target specific channels */
version-card.stable {
  border-left: 4px solid #34a853;
}

version-card.beta {
  border-left: 4px solid #fbbc04;
}

/* Target custom classes */
version-card.pinned-card {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Recovery dropdown */
recovery-dropdown .dropdownContent {
  max-height: 400px;
  overflow-y: auto;
}

/* Modal styling */
modal-dialog .modalOverlay {
  background: rgba(0, 0, 0, 0.5);
}

modal-dialog .modalContent {
  background: white;
  border-radius: 8px;
  max-width: 600px;
}
```

### CSS Variables for Theming

```css
/* Define theme colors */
:root {
  --stable-color: #34a853;
  --beta-color: #fbbc04;
  --dev-color: #ea4335;
  --canary-color: #4285f4;
}

/* Use in component styling */
version-card.stable h1 {
  color: var(--stable-color);
}
```

---

## Migration Examples

### Before: String Concatenation

```javascript
// Old device.11ty.js (lines 192-212)
<div class="versionCardContainer">
  <div class="versionCard stable">
    <h1>Stable</h1>
    <h2>${formatVersion(deviceData.servingStable?.chromeVersion) || "Unavailable"}</h2>
    <h3><span>Platform:</span>${deviceData.servingStable?.version || "Unavailable"}</h3>
  </div>
  <div class="versionCard beta">
    <h1>Beta</h1>
    <h2>${formatVersion(deviceData.servingBeta?.chromeVersion) || "Unavailable"}</h2>
    <h3><span>Platform:</span>${deviceData.servingBeta?.version || "Unavailable"}</h3>
  </div>
  <!-- ... 2 more cards ... -->
</div>
```

### After: Web Components

```javascript
// New device.11ty.js
<div class="versionCardContainer">
  <version-card channel="stable"
    chrome-version="${deviceData.servingStable?.chromeVersion || 'Unavailable'}"
    platform-version="${deviceData.servingStable?.version || 'Unavailable'}">
  </version-card>
  <version-card channel="beta"
    chrome-version="${deviceData.servingBeta?.chromeVersion || 'Unavailable'}"
    platform-version="${deviceData.servingBeta?.version || 'Unavailable'}">
  </version-card>
  <!-- ... 2 more cards ... -->
</div>
```

**Benefits:**
- ✅ Shorter, cleaner code
- ✅ Consistent rendering
- ✅ Easier to maintain
- ✅ Single source of truth

---

## Debugging Components

### Check if Component is Registered

```javascript
// In browser console
console.log(customElements.get('version-card')); // Should show VersionCard class

// Check all custom elements on page
document.querySelectorAll('*').forEach(el => {
  if (el.tagName.includes('-')) {
    console.log(el.tagName, el);
  }
});
```

### Component Not Rendering?

1. **Check script is loaded:**
   ```javascript
   console.log(customElements.get('version-card')); // undefined = not loaded
   ```

2. **Check for JavaScript errors:**
   - Open browser DevTools → Console
   - Look for errors about JSON parsing, attributes, etc.

3. **Verify data format:**
   ```javascript
   const component = document.querySelector('version-card');
   console.log(component.getAttribute('chrome-version')); // Check attribute value
   ```

4. **Check element exists in DOM:**
   ```javascript
   console.log(document.querySelectorAll('version-card')); // How many?
   ```

### Modal Not Opening?

```javascript
// Check modal exists
const modal = ModalDialog.get('myModal');
console.log(modal); // null = doesn't exist

// Check if visible
console.log(modal.isVisible()); // true/false

// Manually show
modal.show();
```

---

## Testing Components

### Manual Testing Checklist

**Version Card:**
- [ ] Renders all 4 channels correctly
- [ ] Shows "Unavailable" for missing data
- [ ] Platform version displays correctly
- [ ] AUE styling (red text) works
- [ ] Custom classes are applied
- [ ] Responsive on mobile

**Recovery Dropdown:**
- [ ] Latest recovery button appears
- [ ] Dropdown toggle works
- [ ] All channels group correctly
- [ ] Recovery links are correct
- [ ] "No recoveries" message shows when empty
- [ ] Works on device, board, and flex pages
- [ ] Keyboard navigation works
- [ ] Closes when clicking outside

**Modal Dialog:**
- [ ] Opens with correct content
- [ ] Close button works
- [ ] Escape key closes modal
- [ ] Click outside closes modal
- [ ] Focus traps inside modal
- [ ] Focus returns to trigger element
- [ ] Keyboard tab navigation works
- [ ] Screen reader announces modal

---

## Browser Compatibility

All components use vanilla web components APIs supported in:

- ✅ Chrome/Edge 67+
- ✅ Firefox 63+
- ✅ Safari 10.1+
- ❌ IE 11 (requires polyfills)

### Polyfill for Older Browsers (if needed)

```html
<!-- Add before component scripts -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.8.0/webcomponents-loader.js"></script>
```

---

## Performance Considerations

### Lazy Loading Components

If components are only used on certain pages:

```javascript
// Only load version cards on device/board pages
if (document.querySelector('.versionCardContainer')) {
  import('/public/js/components/version-card.js');
}
```

### Reducing Reflows

Components render once on connection. Changing attributes triggers re-render:

```javascript
// ❌ Triggers 3 re-renders
card.setAttribute('chrome-version', '119.0.6045.159');
card.setAttribute('platform-version', '15633.69.0');
card.setAttribute('channel', 'stable');

// ✅ Create element with all attributes at once
const card = document.createElement('version-card');
card.setAttribute('channel', 'stable');
card.setAttribute('chrome-version', '119.0.6045.159');
card.setAttribute('platform-version', '15633.69.0');
document.body.appendChild(card); // Renders once
```

---

## Future Enhancements

Potential improvements for later:

1. **Shadow DOM** - True style encapsulation
2. **Animations** - Smooth transitions for modals and dropdowns
3. **Templates** - Use `<template>` tags for better performance
4. **TypeScript Definitions** - Type safety for component APIs
5. **Unit Tests** - Automated testing for each component
6. **Storybook** - Component documentation/playground

---

## Questions?

See the main [WEB_COMPONENTS.md](./WEB_COMPONENTS.md) guide for more information about web components concepts and the [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) for implementation details.
