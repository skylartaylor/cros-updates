/**
 * Modal Dialog Web Component
 *
 * A reusable modal dialog with accessibility features:
 * - Focus trapping
 * - Escape key to close
 * - Click outside to close
 * - Proper ARIA attributes
 * - Focus return on close
 *
 * Usage:
 *   <modal-dialog modal-id="myModal" modal-title="My Title">
 *     <div slot="content">
 *       Modal content goes here
 *     </div>
 *   </modal-dialog>
 *
 *   // In JavaScript:
 *   const modal = document.querySelector('modal-dialog[modal-id="myModal"]');
 *   modal.show(triggerButton);
 *   modal.hide();
 *
 * Attributes:
 *   - modal-id: Unique identifier for the modal [required]
 *   - modal-title: Title to display in modal header [optional]
 *   - hide-close-button: If present, hides the X close button [optional]
 *   - close-on-outside-click: Enable/disable closing on outside click (default: true)
 *   - close-on-escape: Enable/disable closing on Escape key (default: true)
 *
 * Events:
 *   - modal-opened: Fired when modal opens
 *   - modal-closed: Fired when modal closes
 *
 * Slots:
 *   - content: Main modal content
 *   - footer: Optional footer content (buttons, etc.)
 */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.previousFocus = null;
    this.focusTrapHandler = null;
    this.escapeHandler = null;
    this.outsideClickHandler = null;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    // Clean up event listeners
    this.removeEventListeners();
  }

  render() {
    const modalId = this.getAttribute('modal-id') || 'modal';
    const title = this.getAttribute('modal-title') || '';
    const hideCloseButton = this.hasAttribute('hide-close-button');

    // Get slotted content
    const contentSlot = this.querySelector('[slot="content"]');
    const footerSlot = this.querySelector('[slot="footer"]');

    this.innerHTML = `
      <div class="modalOverlay" id="${modalId}" role="dialog" aria-modal="true" aria-hidden="true"
           ${title ? `aria-labelledby="${modalId}-title"` : ''}>
        <div class="modalContent" role="document">
          <div class="modal-header">
            ${title ? `<h2 id="${modalId}-title">${title}</h2>` : ''}
            ${!hideCloseButton ? `<button class="modalClose" aria-label="Close modal" type="button">&times;</button>` : ''}
          </div>
          <div class="modal-body">
            ${contentSlot ? contentSlot.outerHTML : '<slot name="content"></slot>'}
          </div>
          ${footerSlot ? `<div class="modal-footer">${footerSlot.outerHTML}</div>` : ''}
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const closeBtn = this.querySelector('.modalClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Set up escape key handler
    this.escapeHandler = (e) => {
      if (e.key === 'Escape' && this.isVisible()) {
        const closeOnEscape = this.getAttribute('close-on-escape') !== 'false';
        if (closeOnEscape) {
          this.hide();
        }
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    // Set up outside click handler
    const overlay = this.querySelector('.modalOverlay');
    if (overlay) {
      this.outsideClickHandler = (e) => {
        if (e.target === overlay) {
          const closeOnOutside = this.getAttribute('close-on-outside-click') !== 'false';
          if (closeOnOutside) {
            this.hide();
          }
        }
      };
      overlay.addEventListener('click', this.outsideClickHandler);
    }
  }

  removeEventListeners() {
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
    }
    if (this.outsideClickHandler) {
      const overlay = this.querySelector('.modalOverlay');
      if (overlay) {
        overlay.removeEventListener('click', this.outsideClickHandler);
      }
    }
    this.removeFocusTrap();
  }

  show(triggerElement = null) {
    // Store the element that triggered the modal
    this.previousFocus = triggerElement || document.activeElement;

    const overlay = this.querySelector('.modalOverlay');
    if (!overlay) return;

    // Show the modal
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');

    // Focus first focusable element
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      setTimeout(() => focusableElements[0].focus(), 10);
    }

    // Set up focus trap
    this.setupFocusTrap();

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('modal-opened', {
      bubbles: true,
      detail: { modalId: this.getAttribute('modal-id') }
    }));
  }

  hide() {
    const overlay = this.querySelector('.modalOverlay');
    if (!overlay) return;

    // Hide the modal
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden', 'true');

    // Remove focus trap
    this.removeFocusTrap();

    // Return focus to trigger element
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }
    this.previousFocus = null;

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('modal-closed', {
      bubbles: true,
      detail: { modalId: this.getAttribute('modal-id') }
    }));
  }

  isVisible() {
    const overlay = this.querySelector('.modalOverlay');
    return overlay && overlay.classList.contains('show');
  }

  setupFocusTrap() {
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    this.focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;
      if (!this.isVisible()) return;

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

    document.addEventListener('keydown', this.focusTrapHandler);
  }

  removeFocusTrap() {
    if (this.focusTrapHandler) {
      document.removeEventListener('keydown', this.focusTrapHandler);
      this.focusTrapHandler = null;
    }
  }

  getFocusableElements() {
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(this.querySelectorAll(selector));
  }

  // Helper methods for dynamic content
  setContent(content) {
    const body = this.querySelector('.modal-body');
    if (body) {
      body.innerHTML = content;
    }
  }

  setTitle(title) {
    const modalId = this.getAttribute('modal-id');
    const titleElement = this.querySelector(`#${modalId}-title`);
    if (titleElement) {
      titleElement.textContent = title;
    } else {
      // If no title element exists, update the attribute and re-render
      this.setAttribute('modal-title', title);
      this.render();
      this.setupEventListeners();
    }
  }

  // Convenience method to get modal by ID
  static get(modalId) {
    return document.querySelector(`modal-dialog[modal-id="${modalId}"]`);
  }
}

customElements.define('modal-dialog', ModalDialog);
