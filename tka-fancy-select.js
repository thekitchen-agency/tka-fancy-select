/**
 * tka-fancy-select.js
 * Vanilla JavaScript implementation of TKA Fancy Select
 * A premium, accessible, and highly customizable select replacement.
 */

import './tka-fancy-select.css';

class TKAFancySelect {
  /**
   * @param {HTMLElement|string} selectElement - The original select element or a CSS selector
   * @param {Object} options - Configuration options
   */
  constructor(selectElement, options = {}) {
    this.selectEl = typeof selectElement === 'string' 
      ? document.querySelector(selectElement) 
      : selectElement;

    if (!this.selectEl || this.selectEl.tagName !== 'SELECT') {
      console.error('TKAFancySelect: Target element must be a valid <select> element.');
      return;
    }

    // Check if already initialized
    if (this.selectEl.tkaFancySelect) {
      return this.selectEl.tkaFancySelect;
    }

    this.isMultiple = this.selectEl.multiple;
    
    // Default options
    const defaults = {
      title: 'Select',
      selectAllText: 'Alle auswählen',
      resetText: 'Zurücksetzen',
      closeText: 'Schliessen',
      searchPlaceholder: 'Suchen...',
      noResultsText: 'Keine Ergebnisse gefunden',
      hasSearch: true,
      showActions: this.isMultiple,
      showCount: true,
      showTags: true,
      maxTags: 2,
      closeOnSelect: !this.isMultiple,
      dropdownZIndex: 9999
    };

    // Merge options correctly
    this.options = { ...defaults, ...options };

    this.isOpen = false;
    this.searchQuery = '';
    this.focusedIndex = -1; // For keyboard navigation
    this.dom = {};
    this.boundEvents = {};

    this.init();
    
    // Attach instance to the original element
    this.selectEl.tkaFancySelect = this;
  }

  /**
   * Initialize all selects with a specific attribute
   * @param {string} selector - CSS selector to find elements
   * @param {Object} options - Options to apply to all instances
   */
  static initAll(selector = 'select[data-tka-fancy-select]', options = {}) {
    const elements = document.querySelectorAll(selector);
    const instances = [];
    elements.forEach(el => {
      instances.push(new TKAFancySelect(el, options));
    });
    return instances;
  }

  init() {
    this.selectEl.classList.add('tka-fancy-select-hidden');
    this.buildWrapper();
    this.buildTrigger();
    this.buildDropdown();
    this.attachEvents();
    this.updateTriggerText();
    this.setupAria();
  }

  setupAria() {
    this.dom.trigger.setAttribute('role', 'combobox');
    this.dom.trigger.setAttribute('aria-haspopup', 'listbox');
    this.dom.trigger.setAttribute('aria-expanded', 'false');
    this.dom.trigger.setAttribute('aria-controls', `tfs-list-${this.instanceId()}`);
    
    this.dom.list.setAttribute('role', 'listbox');
    this.dom.list.id = `tfs-list-${this.instanceId()}`;
    
    if (this.isMultiple) {
      this.dom.list.setAttribute('aria-multiselectable', 'true');
    }
  }

  instanceId() {
    if (!this._instanceId) {
      this._instanceId = Math.random().toString(36).substr(2, 9);
    }
    return this._instanceId;
  }

  buildWrapper() {
    this.dom.wrapper = document.createElement('div');
    this.dom.wrapper.className = 'tka-fancy-select-wrapper';
    if (this.selectEl.disabled) this.dom.wrapper.classList.add('is-disabled');
    
    // Insert wrapper before original select and move select inside
    this.selectEl.parentNode.insertBefore(this.dom.wrapper, this.selectEl);
    this.dom.wrapper.appendChild(this.selectEl);
  }

  buildTrigger() {
    this.dom.trigger = document.createElement('div');
    this.dom.trigger.className = 'tka-fancy-select-trigger';
    this.dom.trigger.tabIndex = this.selectEl.disabled ? -1 : 0;

    this.dom.triggerText = document.createElement('span');
    this.dom.triggerText.className = 'tka-fancy-select-trigger-text';
    this.dom.triggerText.textContent = this.options.title;

    this.dom.triggerAction = document.createElement('div');
    this.dom.triggerAction.className = 'tka-fancy-select-trigger-action';

    this.dom.trigger.appendChild(this.dom.triggerText);
    this.dom.trigger.appendChild(this.dom.triggerAction);
    this.dom.wrapper.appendChild(this.dom.trigger);
  }

  buildDropdown() {
    this.dom.dropdown = document.createElement('div');
    this.dom.dropdown.className = 'tka-fancy-select-dropdown';

    // Header
    const header = document.createElement('div');
    header.className = 'tka-fancy-select-header';

    const title = document.createElement('div');
    title.className = 'tka-fancy-select-title';
    title.textContent = this.options.title;

    header.appendChild(title);

    if (this.options.showActions) {
      const actions = document.createElement('div');
      actions.className = 'tka-fancy-select-actions';

      this.dom.btnSelectAll = document.createElement('button');
      this.dom.btnSelectAll.type = 'button';
      this.dom.btnSelectAll.className = 'tka-fancy-select-action';
      this.dom.btnSelectAll.textContent = this.options.selectAllText;

      this.dom.btnReset = document.createElement('button');
      this.dom.btnReset.type = 'button';
      this.dom.btnReset.className = 'tka-fancy-select-action';
      this.dom.btnReset.textContent = this.options.resetText;

      actions.appendChild(this.dom.btnSelectAll);
      actions.appendChild(this.dom.btnReset);
      header.appendChild(actions);
    }

    // Search
    if (this.options.hasSearch) {
      this.dom.searchWrapper = document.createElement('div');
      this.dom.searchWrapper.className = 'tka-fancy-select-search';
      
      this.dom.searchInput = document.createElement('input');
      this.dom.searchInput.type = 'text';
      this.dom.searchInput.className = 'tka-fancy-select-search-input';
      this.dom.searchInput.placeholder = this.options.searchPlaceholder;
      this.dom.searchInput.setAttribute('aria-label', this.options.searchPlaceholder);
      
      this.dom.searchWrapper.appendChild(this.dom.searchInput);
    }

    // List
    this.dom.list = document.createElement('ul');
    this.dom.list.className = 'tka-fancy-select-list';

    this.renderOptions();

    // No Results
    this.dom.noResults = document.createElement('div');
    this.dom.noResults.className = 'tka-fancy-select-no-results';
    this.dom.noResults.textContent = this.options.noResultsText;
    this.dom.noResults.style.display = 'none';

    // Footer
    const footer = document.createElement('div');
    footer.className = 'tka-fancy-select-footer';

    this.dom.btnClose = document.createElement('button');
    this.dom.btnClose.type = 'button';
    this.dom.btnClose.className = 'tka-fancy-select-close';
    this.dom.btnClose.textContent = this.options.closeText;
    footer.appendChild(this.dom.btnClose);

    this.dom.dropdown.appendChild(header);
    if (this.options.hasSearch) {
      this.dom.dropdown.appendChild(this.dom.searchWrapper);
    }
    this.dom.dropdown.appendChild(this.dom.noResults);
    this.dom.dropdown.appendChild(this.dom.list);
    this.dom.dropdown.appendChild(footer);

    this.dom.wrapper.appendChild(this.dom.dropdown);
  }

  renderOptions() {
    this.dom.list.innerHTML = '';
    const options = Array.from(this.selectEl.options);

    options.forEach((opt, index) => {
      const li = document.createElement('li');
      li.className = 'tka-fancy-select-item';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
      if (opt.selected) li.classList.add('is-selected');
      if (opt.disabled) {
        li.classList.add('is-disabled');
        li.setAttribute('aria-disabled', 'true');
      }
      li.dataset.index = index;

      const checkbox = document.createElement('div');
      checkbox.className = 'tka-fancy-select-checkbox';
      checkbox.innerHTML = `<svg class="tka-fancy-select-checkmark" viewBox="0 0 16 16"><path d="M3.5 8.5L6.5 11.5L12.5 4.5"></path></svg>`;

      const label = document.createElement('span');
      label.className = 'tka-fancy-select-label';
      label.textContent = opt.text;

      li.appendChild(checkbox);
      li.appendChild(label);

      if (this.options.showCount === true && opt.dataset.count) {
        const count = document.createElement('span');
        count.className = 'tka-fancy-select-count';
        count.textContent = opt.dataset.count;
        li.appendChild(count);
      }

      if (!opt.disabled && !this.selectEl.disabled) {
        li.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleOption(index);
        });
      }
      
      this.dom.list.appendChild(li);
    });
  }

  attachEvents() {
    if (this.selectEl.disabled) return;

    this.boundEvents.handleTriggerClick = (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    };
    this.dom.trigger.addEventListener('click', this.boundEvents.handleTriggerClick);

    this.boundEvents.handleTriggerActionClick = (e) => {
      e.stopPropagation();
      if (this.isMultiple && this.dom.wrapper.classList.contains('has-selection')) {
        this.setAll(false);
      } else {
        this.toggleDropdown();
      }
    };
    this.dom.triggerAction.addEventListener('click', this.boundEvents.handleTriggerActionClick);

    this.boundEvents.handleCloseClick = (e) => {
      e.stopPropagation();
      this.closeDropdown();
    };
    this.dom.btnClose.addEventListener('click', this.boundEvents.handleCloseClick);

    if (this.options.showActions) {
      this.boundEvents.handleSelectAllClick = (e) => {
        e.stopPropagation();
        this.setAll(true);
      };
      this.dom.btnSelectAll.addEventListener('click', this.boundEvents.handleSelectAllClick);

      this.boundEvents.handleResetClick = (e) => {
        e.stopPropagation();
        this.setAll(false);
      };
      this.dom.btnReset.addEventListener('click', this.boundEvents.handleResetClick);
    }

    if (this.options.hasSearch) {
      this.dom.searchInput.addEventListener('click', (e) => e.stopPropagation());
      this.boundEvents.handleSearchInput = (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.filterOptions();
      };
      this.dom.searchInput.addEventListener('input', this.boundEvents.handleSearchInput);
    }

    this.boundEvents.handleKeydown = (e) => this.handleKeydown(e);
    this.dom.wrapper.addEventListener('keydown', this.boundEvents.handleKeydown);

    this.boundEvents.handleOutsideClick = (e) => {
      if (this.isOpen && !this.dom.wrapper.contains(e.target)) {
        this.closeDropdown();
      }
    };
    document.addEventListener('click', this.boundEvents.handleOutsideClick);
  }

  handleKeydown(e) {
    if (!this.isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.openDropdown();
      }
      return;
    }

    const visibleItems = Array.from(this.dom.list.querySelectorAll('.tka-fancy-select-item:not([style*="display: none"])'));
    if (visibleItems.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.focusedIndex = (this.focusedIndex + 1) % visibleItems.length;
        this.updateFocus(visibleItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.focusedIndex = (this.focusedIndex - 1 + visibleItems.length) % visibleItems.length;
        this.updateFocus(visibleItems);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.focusedIndex > -1 && visibleItems[this.focusedIndex]) {
          const originalIndex = visibleItems[this.focusedIndex].dataset.index;
          this.toggleOption(parseInt(originalIndex));
        }
        break;
      case 'Escape':
        this.closeDropdown();
        this.dom.trigger.focus();
        break;
      case 'Tab':
        this.closeDropdown();
        break;
    }
  }

  updateFocus(visibleItems) {
    this.dom.list.querySelectorAll('.tka-fancy-select-item').forEach(el => el.classList.remove('is-focused'));
    if (visibleItems[this.focusedIndex]) {
      const item = visibleItems[this.focusedIndex];
      item.classList.add('is-focused');
      item.scrollIntoView({ block: 'nearest' });
      this.dom.trigger.setAttribute('aria-activedescendant', item.id || '');
    }
  }

  filterOptions() {
    const items = this.dom.list.querySelectorAll('.tka-fancy-select-item');
    let hasResults = false;

    items.forEach(item => {
      const text = item.querySelector('.tka-fancy-select-label').textContent.toLowerCase();
      if (text.includes(this.searchQuery)) {
        item.style.display = '';
        hasResults = true;
      } else {
        item.style.display = 'none';
      }
    });

    this.dom.noResults.style.display = hasResults ? 'none' : 'block';
    this.focusedIndex = -1;
    this.updateFocus([]);
  }

  toggleDropdown() {
    this.isOpen ? this.closeDropdown() : this.openDropdown();
  }

  openDropdown() {
    if (this.selectEl.disabled || this.isOpen) return;

    // Close any other open fancy selects first
    document.querySelectorAll('.tka-fancy-select-wrapper.is-open').forEach(el => {
      if (el !== this.dom.wrapper && el.tkaFancySelect) {
        el.tkaFancySelect.closeDropdown();
      }
    });

    this.isOpen = true;
    this.dom.wrapper.classList.add('is-open');
    this.dom.wrapper.style.zIndex = this.options.dropdownZIndex;
    this.dom.trigger.setAttribute('aria-expanded', 'true');
    this.focusedIndex = -1;
    
    if (this.options.hasSearch) {
      setTimeout(() => this.dom.searchInput.focus(), 100);
    }

    this.emit('open');
  }

  closeDropdown() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    this.dom.wrapper.classList.remove('is-open');
    this.dom.wrapper.style.zIndex = '';
    this.dom.trigger.setAttribute('aria-expanded', 'false');
    
    if (this.options.hasSearch) {
      this.searchQuery = '';
      this.dom.searchInput.value = '';
      this.filterOptions();
    }

    this.emit('close');
  }

  toggleOption(index) {
    const options = Array.from(this.selectEl.options);
    if (options[index].disabled) return;
    
    if (this.isMultiple) {
      options[index].selected = !options[index].selected;
    } else {
      this.selectEl.selectedIndex = index;
      if (this.options.closeOnSelect) {
        this.closeDropdown();
        this.dom.trigger.focus();
      }
    }

    this.refresh();
    this.triggerChangeEvent();
    this.emit('change', { index, selected: options[index].selected });
  }

  setAll(selected) {
    if (!this.isMultiple) return;
    
    const options = Array.from(this.selectEl.options);
    options.forEach(opt => {
        if (!opt.disabled) opt.selected = selected;
    });

    this.refresh();
    this.triggerChangeEvent();
    this.emit('change', { all: selected });
  }

  /**
   * Sync the UI with the original select element
   */
  refresh() {
    this.renderOptions();
    this.updateTriggerText();
  }

  updateTriggerText() {
    const selectedOptions = Array.from(this.selectEl.options).filter(opt => opt.selected);
    const count = selectedOptions.length;

    if (count > 0) {
      this.dom.wrapper.classList.add('has-selection');
      
      if (this.isMultiple && this.options.showTags) {
        this.dom.triggerText.innerHTML = '';
        const tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'tka-fancy-select-tags';

        const max = this.options.maxTags;
        selectedOptions.slice(0, max).forEach(opt => {
          const tag = document.createElement('span');
          tag.className = 'tka-fancy-select-tag';
          tag.textContent = opt.text;
          tagsWrapper.appendChild(tag);
        });

        if (count > max) {
          const more = document.createElement('span');
          more.className = 'tka-fancy-select-tag tka-fancy-select-tag-more';
          more.textContent = `+${count - max}`;
          tagsWrapper.appendChild(more);
        }

        this.dom.triggerText.appendChild(tagsWrapper);
      } else {
        this.dom.triggerText.textContent = count === 1 ? selectedOptions[0].text : `${count} ausgewählt`;
      }

      if (this.isMultiple) {
        this.dom.triggerAction.innerHTML = '<div class="tka-fancy-select-clear-icon"></div>';
        this.dom.triggerAction.setAttribute('aria-label', this.options.resetText);
      } else {
        this.dom.triggerAction.innerHTML = '<div class="tka-fancy-select-chevron"></div>';
      }
    } else {
      this.dom.wrapper.classList.remove('has-selection');
      this.dom.triggerText.textContent = this.options.title;
      this.dom.triggerAction.innerHTML = '<div class="tka-fancy-select-chevron"></div>';
    }
  }

  triggerChangeEvent() {
    const event = new Event('change', { bubbles: true });
    this.selectEl.dispatchEvent(event);
  }

  /**
   * Emit a custom event
   */
  emit(name, detail = {}) {
    const event = new CustomEvent(`tfs:${name}`, {
      bubbles: true,
      detail: { ...detail, instance: this }
    });
    this.dom.wrapper.dispatchEvent(event);
  }

  /**
   * Destroy the instance and restore the original select
   */
  destroy() {
    // Remove event listeners
    this.dom.trigger.removeEventListener('click', this.boundEvents.handleTriggerClick);
    this.dom.triggerAction.removeEventListener('click', this.boundEvents.handleTriggerActionClick);
    this.dom.btnClose.removeEventListener('click', this.boundEvents.handleCloseClick);
    if (this.options.showActions) {
      this.dom.btnSelectAll.removeEventListener('click', this.boundEvents.handleSelectAllClick);
      this.dom.btnReset.removeEventListener('click', this.boundEvents.handleResetClick);
    }
    if (this.options.hasSearch) {
      this.dom.searchInput.removeEventListener('input', this.boundEvents.handleSearchInput);
    }
    this.dom.wrapper.removeEventListener('keydown', this.boundEvents.handleKeydown);
    document.removeEventListener('click', this.boundEvents.handleOutsideClick);

    // Unwrap the select
    this.selectEl.classList.remove('tka-fancy-select-hidden');
    this.dom.wrapper.parentNode.insertBefore(this.selectEl, this.dom.wrapper);
    this.dom.wrapper.remove();

    // Clean up reference
    delete this.selectEl.tkaFancySelect;
  }
}

// Export as ES module or Global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TKAFancySelect;
} else if (typeof define === 'function' && define.amd) {
  define(() => TKAFancySelect);
} else {
  window.TKAFancySelect = TKAFancySelect;
}
