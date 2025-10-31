# Web Components Refactoring Plan

## Overview

This document outlines the plan to refactor duplicated code in the CrOS Updates project into vanilla web components.

## Components to Implement

### 1. Recovery Dropdown ✅ Priority
**Files affected:** 3 files with ~80% duplicate code
- `content/device.11ty.js` (lines 138-188)
- `content/board.11ty.js` (lines 103-156)
- `content/flex.11ty.js` (lines 56-123)

**Component:** `<recovery-dropdown>`

**Savings:** ~120 lines of duplicate code

### 2. Version Card ✅ Priority
**Files affected:** 4 files with 16+ instances
- `content/device.11ty.js` (lines 192-212)
- `content/flex.11ty.js` (lines 126-147)
- `content/board.11ty.js` (lines 64-91)
- `_includes/pinned-devices.js` (lines 99-124, 168-193)

**Component:** `<version-card>`

**Important:** Must support context-specific styling via custom classes/attributes

**Savings:** ~80 lines of duplicate code

### 3. Modal Dialog ✅ Priority
**Files affected:** 1 file with 3 similar implementations
- `public/js/app.js` (3 modals: columns, device names, recovery)

**Component:** `<modal-dialog>`

**Savings:** ~150 lines of duplicate modal logic

---

## Implementation Plan

### Phase 1: Setup (5 minutes)

1. Create components directory
   ```bash
   mkdir -p public/js/components
   ```

2. Create component files:
   - `public/js/components/recovery-dropdown.js`
   - `public/js/components/version-card.js`
   - `public/js/components/modal-dialog.js`

### Phase 2: Implement Components (30-45 minutes)

#### Recovery Dropdown
- [x] Extract recovery rendering logic
- [x] Handle stable/beta/ltc/ltr channels
- [x] Support both `chromeVersion` and `chrome_version` (Flex uses different property)
- [x] Maintain dropdown toggle functionality
- [x] Preserve accessibility (ARIA attributes)
- [x] Support "Latest" link

#### Version Card
- [x] Extract version card rendering
- [x] **Support custom CSS classes** via `custom-class` attribute
- [x] Support AUE styling (red text)
- [x] Handle all 4 channels (stable, beta, dev, canary)
- [x] Platform version display (optional)

#### Modal Dialog
- [x] Consolidate modal show/hide logic
- [x] Focus trapping
- [x] ARIA attributes
- [x] Escape key handling
- [x] Click outside to close
- [x] Custom events for open/close

### Phase 3: Update 11ty Files (20-30 minutes)

#### Recovery Dropdown Migration

**File: `content/device.11ty.js`**
```javascript
// Before (lines 138-188): ~50 lines of HTML string concatenation
// After:
<recovery-dropdown
  data-recoveries='${JSON.stringify(deviceData.recoveries || {})}'
  data-latest-version="${latestRecovery?.chromeVersion}"
  data-latest-url="${latestRecoveryUrl}">
</recovery-dropdown>
```

**File: `content/board.11ty.js`**
```javascript
// Same replacement pattern
```

**File: `content/flex.11ty.js`**
```javascript
// Same replacement pattern (uses chrome_version instead of chromeVersion)
```

#### Version Card Migration

**File: `content/device.11ty.js`**
```javascript
// Before (4 separate cards):
<div class="versionCard stable">
  <h1>Stable</h1>
  <h2>${formatVersion(...)}</h2>
  <h3><span>Platform:</span>${platformVersion}</h3>
</div>
// ... repeated 4 times

// After:
<version-card channel="stable"
  chrome-version="${device.stable.chrome.version}"
  platform-version="${device.stable.chrome.platform}">
</version-card>
<version-card channel="beta"
  chrome-version="${device.beta.chrome.version}"
  platform-version="${device.beta.chrome.platform}">
</version-card>
<version-card channel="dev"
  chrome-version="${device.dev.chrome.version}"
  platform-version="${device.dev.chrome.platform}">
</version-card>
<version-card channel="canary"
  chrome-version="${device.canary.chrome.version}"
  platform-version="${device.canary.chrome.platform}">
</version-card>
```

**File: `content/board.11ty.js`** (device cards)
```javascript
// Preserve context-specific styling
<version-card channel="stable"
  chrome-version="${device.stable.chrome.version}"
  custom-class="board-card"> <!-- Custom styling -->
</version-card>
```

**File: `_includes/pinned-devices.js`**
```javascript
// In createDeviceCard method
<version-card channel="stable"
  chrome-version="${versions.stable?.chrome?.version || 'N/A'}"
  custom-class="pinned-card"> <!-- Custom styling -->
</version-card>
```

#### Modal Dialog Migration

**File: `public/js/app.js`**

Replace modal setup code with component initialization:

```javascript
// Before: Lines 348-568 (modal.setup calls)
modal.setup('columnsModal', { onClose: () => {...} });
modal.setup('deviceNamesModal', { onClose: () => {...} });
modal.setup('recoveryModal', { onClose: () => {...} });

// After: Use web components in HTML, simplified JS
const columnsModal = document.querySelector('modal-dialog[modal-id="columns"]');
columnsModal.addEventListener('modal-closed', () => {...});
```

### Phase 4: Update HTML Templates (15 minutes)

Add component script tags to layouts:

**File: `_includes/layout.njk`** (or wherever scripts are loaded)
```html
<script src="/public/js/components/recovery-dropdown.js"></script>
<script src="/public/js/components/version-card.js"></script>
<script src="/public/js/components/modal-dialog.js"></script>
```

### Phase 5: Testing (20 minutes)

Test each component:

1. **Recovery Dropdown**
   - [ ] Renders on device pages
   - [ ] Renders on board pages
   - [ ] Renders on flex page
   - [ ] Dropdown toggle works
   - [ ] "Latest" link appears when available
   - [ ] All channels display correctly
   - [ ] Accessibility (keyboard navigation, ARIA)

2. **Version Card**
   - [ ] Renders on device pages (4 cards)
   - [ ] Renders on flex page (4 cards)
   - [ ] Renders on board page (multiple devices)
   - [ ] Renders in pinned devices
   - [ ] Custom styling preserved
   - [ ] AUE styling works (red text)
   - [ ] Platform version shows/hides correctly

3. **Modal Dialog**
   - [ ] Columns modal opens/closes
   - [ ] Device names modal opens/closes
   - [ ] Recovery modal opens/closes
   - [ ] Focus trapping works
   - [ ] Escape key closes modal
   - [ ] Click outside closes modal
   - [ ] Focus returns to trigger element

### Phase 6: Cleanup (10 minutes)

Remove old code:

1. **Delete duplicate recovery rendering code** from:
   - `device.11ty.js` (lines 138-188)
   - `board.11ty.js` (lines 103-156)
   - `flex.11ty.js` (lines 56-123)

2. **Delete duplicate version card code** from:
   - `device.11ty.js` (lines 192-212)
   - `flex.11ty.js` (lines 126-147)
   - `board.11ty.js` (lines 64-91)
   - `pinned-devices.js` (card rendering sections)

3. **Simplify modal code** in `app.js`:
   - Remove old modal.setup() calls
   - Keep only modal utility object for backward compatibility

---

## Custom Styling Support for Version Cards

To preserve context-specific styling, the `<version-card>` component will support:

1. **Custom Classes**
   ```html
   <version-card custom-class="board-card"></version-card>
   ```
   Applied to the component's root element.

2. **Inline Styles**
   ```html
   <version-card style="border: 2px solid red;"></version-card>
   ```
   Component preserves any styles applied to the custom element.

3. **CSS Part Selectors** (advanced)
   ```css
   version-card::part(header) {
     background: blue;
   }
   ```
   For fine-grained styling control.

### Example: Pinned Device Card (Special Styling)

```html
<!-- Pinned device cards might need flip animation styling -->
<version-card
  channel="stable"
  chrome-version="119.0.6045.159"
  custom-class="pinned-card flip-enabled"
  data-device-key="eve">
</version-card>
```

```css
/* Existing CSS can target the custom class */
.pinned-card.flip-enabled {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}
```

---

## Migration Checklist

### Pre-Implementation
- [x] Create docs/WEB_COMPONENTS.md
- [x] Create docs/REFACTORING_PLAN.md
- [ ] Review existing code to identify all usages
- [ ] Backup current working code (git commit)

### Implementation
- [ ] Create components directory
- [ ] Implement recovery-dropdown.js
- [ ] Implement version-card.js
- [ ] Implement modal-dialog.js
- [ ] Test each component individually

### Integration
- [ ] Update device.11ty.js
- [ ] Update board.11ty.js
- [ ] Update flex.11ty.js
- [ ] Update table.11ty.js (if needed)
- [ ] Update pinned-devices.js
- [ ] Update app.js (modal logic)
- [ ] Add component scripts to layout templates

### Testing
- [ ] Test device pages
- [ ] Test board pages
- [ ] Test flex page
- [ ] Test table page
- [ ] Test pinned devices functionality
- [ ] Test all modals
- [ ] Test on mobile/responsive
- [ ] Test keyboard navigation
- [ ] Test screen reader accessibility

### Cleanup
- [ ] Remove old duplicate code
- [ ] Update comments and documentation
- [ ] Run build process
- [ ] Check for console errors
- [ ] Verify no visual regressions

### Deployment
- [ ] Commit changes
- [ ] Push to branch
- [ ] Create pull request
- [ ] Review and merge

---

## Estimated Time

- **Setup:** 5 minutes
- **Implementation:** 45 minutes
- **Integration:** 30 minutes
- **Testing:** 20 minutes
- **Cleanup:** 10 minutes

**Total:** ~2 hours

---

## Benefits After Refactoring

1. **Code Reduction:** ~350 lines of duplicate code removed
2. **Maintainability:** Single source of truth for each component
3. **Consistency:** Same UI/UX across all pages
4. **Testability:** Components can be tested in isolation
5. **Reusability:** Easy to add components to new pages
6. **Accessibility:** Centralized a11y improvements benefit all usages
7. **Performance:** Potentially faster (less code to parse)

---

## Rollback Plan

If issues arise:

1. Components are additive - old code still exists initially
2. Can disable components by removing script tags
3. Can revert individual file changes
4. Git commit before each major change

---

## Future Enhancements

After successful refactoring, consider:

1. **More Components:**
   - `<device-card>` - Full device card with settings
   - `<search-box>` - Search functionality
   - `<pinned-devices-grid>` - Pin management

2. **Advanced Features:**
   - Shadow DOM for true encapsulation
   - Animations/transitions
   - Lazy loading for performance
   - Component library documentation

3. **Developer Experience:**
   - TypeScript definitions
   - Component playground/storybook
   - Unit tests for each component
   - Visual regression tests
