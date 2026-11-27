// ========================================================
// CUSTOM SELECT DROPDOWN — MODERN UI/UX ENHANCER
// Menggantikan popup <select> OS standar dengan dropdown menu modern
// sembari menjaga elemen <select> asli (id, value, onchange, options).
// ========================================================

(function () {
  const ENHANCED_FLAG = 'dhCustomSelectReady';

  function closeAllCustomSelects(exceptWrap) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.dh-select-wrap.open').forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove('open', 'open-upward');
      const trig = wrap.querySelector('.dh-select-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const menu = wrap.querySelector('.dh-select-menu');
      if (menu) menu.setAttribute('aria-hidden', 'true');
      const parentWrapper = typeof wrap.closest === 'function' ? wrap.closest('.input-wrapper') : null;
      if (parentWrapper) parentWrapper.classList.remove('is-select-open');
    });
  }

  function enhanceCustomSelect(selectEl) {
    if (!selectEl || selectEl.dataset[ENHANCED_FLAG] === '1') return;
    selectEl.dataset[ENHANCED_FLAG] = '1';

    const parent = selectEl.parentNode;
    if (!parent) return;

    const isInsideWrapper = parent.classList && parent.classList.contains('input-wrapper');
    const isChartDropdown = selectEl.classList && selectEl.classList.contains('chart-class-dropdown');

    const wrap = document.createElement('div');
    wrap.className = 'dh-select-wrap' + (isInsideWrapper ? ' in-wrapper' : ' is-standalone') + (isChartDropdown ? ' is-compact' : '');
    if (selectEl.id) wrap.dataset.forSelect = selectEl.id;

    parent.insertBefore(wrap, selectEl);
    wrap.appendChild(selectEl);

    if (isInsideWrapper) {
      parent.classList.add('has-custom-select');
    }

    selectEl.classList.add('dh-native-select-hidden');
    selectEl.tabIndex = -1;
    selectEl.setAttribute('aria-hidden', 'true');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dh-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (selectEl.id) trigger.id = selectEl.id + '_trigger';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'dh-select-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'dh-select-arrow';
    arrowSpan.setAttribute('aria-hidden', 'true');
    arrowSpan.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrowSpan);

    const menu = document.createElement('div');
    menu.className = 'dh-select-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-hidden', 'true');

    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    const getNativeVal = () => {
      const desc = typeof HTMLSelectElement !== 'undefined'
        ? Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
        : null;
      return desc && desc.get ? desc.get.call(selectEl) : selectEl.value;
    };

    const setNativeVal = (val) => {
      const desc = typeof HTMLSelectElement !== 'undefined'
        ? Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
        : null;
      if (desc && desc.set) desc.set.call(selectEl, val);
      else selectEl.value = val;
    };

    function rebuildOptions() {
      const options = Array.from(selectEl.options || []);
      const currentVal = getNativeVal();
      menu.innerHTML = '';

      options.forEach((opt) => {
        const optBtn = document.createElement('button');
        optBtn.type = 'button';
        optBtn.className = 'dh-select-option' + (opt.value === currentVal ? ' is-selected' : '');
        optBtn.setAttribute('role', 'option');
        optBtn.setAttribute('aria-selected', opt.value === currentVal ? 'true' : 'false');
        optBtn.dataset.value = opt.value;
        if (opt.disabled) optBtn.disabled = true;

        const textSpan = document.createElement('span');
        textSpan.className = 'dh-select-option-text';
        textSpan.textContent = opt.textContent || opt.label || opt.value;

        const checkSpan = document.createElement('span');
        checkSpan.className = 'dh-select-option-check';
        checkSpan.setAttribute('aria-hidden', 'true');
        checkSpan.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

        optBtn.appendChild(textSpan);
        optBtn.appendChild(checkSpan);

        optBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (opt.disabled) return;
          const prevVal = getNativeVal();
          setNativeVal(opt.value);
          syncDisplay();
          closeAllCustomSelects();
          trigger.focus();

          if (prevVal !== opt.value) {
            const ev = typeof Event === 'function'
              ? new Event('change', { bubbles: true })
              : { type: 'change' };
            if (typeof selectEl.dispatchEvent === 'function') {
              selectEl.dispatchEvent(ev);
            }
          }
        });

        menu.appendChild(optBtn);
      });
    }

    function syncDisplay() {
      const options = Array.from(selectEl.options || []);
      const currentVal = getNativeVal();
      const matched = options.find((o) => o.value === currentVal) || options[selectEl.selectedIndex] || options[0];
      labelSpan.textContent = matched ? (matched.textContent || matched.label || matched.value) : '';

      menu.querySelectorAll('.dh-select-option').forEach((btn) => {
        const isSel = btn.dataset.value === currentVal;
        btn.classList.toggle('is-selected', isSel);
        btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
      });
    }

    function openMenu() {
      closeAllCustomSelects(wrap);
      rebuildOptions();

      if (typeof trigger.getBoundingClientRect === 'function' && typeof window !== 'undefined') {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = (window.innerHeight || 800) - rect.bottom;
        const shouldOpenUpward = spaceBelow < 230 && rect.top > spaceBelow;
        wrap.classList.toggle('open-upward', shouldOpenUpward);
      }

      wrap.classList.add('open');
      if (isInsideWrapper) parent.classList.add('is-select-open');
      trigger.setAttribute('aria-expanded', 'true');
      menu.setAttribute('aria-hidden', 'false');

      const selectedOpt = menu.querySelector('.dh-select-option.is-selected');
      if (selectedOpt && typeof selectedOpt.scrollIntoView === 'function') {
        selectedOpt.scrollIntoView({ block: 'nearest' });
      }
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selectEl.disabled) return;
      if (wrap.classList.contains('open')) {
        closeAllCustomSelects();
      } else {
        openMenu();
      }
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (!wrap.classList.contains('open')) openMenu();
        const focusTarget = menu.querySelector('.dh-select-option.is-selected') || menu.querySelector('.dh-select-option:not(:disabled)');
        if (focusTarget && typeof focusTarget.focus === 'function') focusTarget.focus();
      } else if (e.key === 'Escape') {
        closeAllCustomSelects();
      }
    });

    menu.addEventListener('keydown', (e) => {
      const items = Array.from(menu.querySelectorAll('.dh-select-option:not(:disabled)'));
      if (!items.length) return;
      const curIdx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        items[(curIdx + 1) % items.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        items[(curIdx - 1 + items.length) % items.length].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeAllCustomSelects();
        trigger.focus();
      }
    });

    // Keep display synced if external JS sets selectEl.value directly
    if (typeof HTMLSelectElement !== 'undefined') {
      const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
      if (desc && desc.get && desc.set) {
        Object.defineProperty(selectEl, 'value', {
          configurable: true,
          get() {
            return desc.get.call(this);
          },
          set(val) {
            desc.set.call(this, val);
            syncDisplay();
          }
        });
      }
    }

    selectEl.addEventListener('change', syncDisplay);

    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(() => {
        rebuildOptions();
        syncDisplay();
      });
      observer.observe(selectEl, { childList: true, subtree: true, characterData: true });
    }

    rebuildOptions();
    syncDisplay();
  }

  function initAllCustomSelects() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('select.form-select, select.chart-class-dropdown, .input-wrapper > select').forEach(enhanceCustomSelect);
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      const inside = e.target && typeof e.target.closest === 'function' ? e.target.closest('.dh-select-wrap') : null;
      if (!inside) closeAllCustomSelects();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllCustomSelects);
    } else {
      initAllCustomSelects();
    }
  }

  if (typeof window !== 'undefined') {
    window.initAllCustomSelects = initAllCustomSelects;
    window.enhanceCustomSelect = enhanceCustomSelect;
    window.closeAllCustomSelects = closeAllCustomSelects;
  }
})();
