// ========================================================
// CUSTOM DATE CALENDAR STEPPER — REPORT & FILTER ENHANCER
// Menggantikan popup <input type="date"> standar pada filter laporan/riwayat
// dengan kalender stepper Bulan & Tahun modern (Desktop & Mobile).
// ========================================================

(function () {
  const ENHANCED_FLAG = 'dhCustomDateReady';
  const PLACEHOLDER_NUMERIC = '01/01/2026';
  const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function parseIsoParts(iso) {
    if (!iso || typeof iso !== 'string') return null;
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { year, month, day };
  }

  function formatIsoParts(y, m, d) {
    return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function getTodayIso() {
    const n = new Date();
    return formatIsoParts(n.getFullYear(), n.getMonth() + 1, n.getDate());
  }

  function formatDisplayDmy(iso) {
    const p = parseIsoParts(iso);
    return p ? `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${String(p.year).padStart(4, '0')}` : '';
  }

  function closeAllCustomDates(exceptWrap) {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.dh-date-wrap.open').forEach((wrap) => {
      if (wrap === exceptWrap) return;
      wrap.classList.remove('open');
      const trig = wrap.querySelector('.dh-date-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      const pop = wrap.querySelector('.dh-date-popover');
      if (pop) {
        pop.classList.remove('open', 'open-upward', 'align-right');
        pop.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function enhanceCustomDateInput(inputEl) {
    if (!inputEl || inputEl.dataset[ENHANCED_FLAG] === '1') return;
    inputEl.dataset[ENHANCED_FLAG] = '1';

    const parent = inputEl.parentNode;
    if (!parent) return;

    const wrap = document.createElement('div');
    wrap.className = 'dh-date-wrap';
    if (inputEl.id) wrap.dataset.forInput = inputEl.id;

    parent.insertBefore(wrap, inputEl);
    wrap.appendChild(inputEl);

    inputEl.classList.add('dh-native-date-hidden');
    inputEl.tabIndex = -1;
    inputEl.setAttribute('aria-hidden', 'true');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'dh-date-trigger';
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    if (inputEl.id) trigger.id = inputEl.id + '_trigger';

    const valueSpan = document.createElement('span');
    valueSpan.className = 'dh-date-value is-placeholder';
    valueSpan.textContent = PLACEHOLDER_NUMERIC;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'dh-date-icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';

    trigger.appendChild(valueSpan);
    trigger.appendChild(iconSpan);

    const popover = document.createElement('div');
    popover.className = 'att-calendar-popover dh-date-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-hidden', 'true');

    wrap.appendChild(trigger);
    wrap.appendChild(popover);

    const now = new Date();
    const viewState = {
      year: now.getFullYear(),
      month: now.getMonth()
    };

    const getNativeVal = () => {
      const desc = typeof HTMLInputElement !== 'undefined'
        ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
        : null;
      return desc && desc.get ? desc.get.call(inputEl) : inputEl.value;
    };

    const setNativeVal = (val) => {
      const desc = typeof HTMLInputElement !== 'undefined'
        ? Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
        : null;
      if (desc && desc.set) desc.set.call(inputEl, val);
      else inputEl.value = val;
    };

    function syncDisplay() {
      const iso = getNativeVal();
      const dmy = formatDisplayDmy(iso);
      if (dmy) {
        valueSpan.textContent = dmy;
        valueSpan.classList.remove('is-placeholder');
      } else {
        valueSpan.textContent = PLACEHOLDER_NUMERIC;
        valueSpan.classList.add('is-placeholder');
      }
    }

    function applySelectedIso(iso) {
      const prev = getNativeVal();
      setNativeVal(iso);
      syncDisplay();
      closeAllCustomDates();
      if (prev !== iso) {
        const ev = typeof Event === 'function'
          ? new Event('change', { bubbles: true })
          : { type: 'change' };
        if (typeof inputEl.dispatchEvent === 'function') {
          inputEl.dispatchEvent(ev);
        }
      }
    }

    function renderPopover(stepDir) {
      const selectedIso = getNativeVal();
      const todayIso = getTodayIso();

      const firstWeekday = new Date(viewState.year, viewState.month, 1).getDay();
      const daysInMonth = new Date(viewState.year, viewState.month + 1, 0).getDate();
      const prevMonthDays = new Date(viewState.year, viewState.month, 0).getDate();

      const cells = [];
      for (let i = firstWeekday - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m = viewState.month === 0 ? 12 : viewState.month;
        const y = viewState.month === 0 ? viewState.year - 1 : viewState.year;
        cells.push({ day: d, iso: formatIsoParts(y, m, d), outside: true });
      }
      for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ day: d, iso: formatIsoParts(viewState.year, viewState.month + 1, d), outside: false });
      }
      const trailing = (7 - (cells.length % 7)) % 7;
      for (let d = 1; d <= trailing; d++) {
        const m = viewState.month === 11 ? 1 : viewState.month + 2;
        const y = viewState.month === 11 ? viewState.year + 1 : viewState.year;
        cells.push({ day: d, iso: formatIsoParts(y, m, d), outside: true });
      }

      const monthAnim = stepDir === 'month-up' ? ' att-step-roll-up' : (stepDir === 'month-down' ? ' att-step-roll-down' : '');
      const yearAnim = stepDir === 'year-up' ? ' att-step-roll-up' : (stepDir === 'year-down' ? ' att-step-roll-down' : '');

      popover.innerHTML = '';

      const steppersBar = document.createElement('div');
      steppersBar.className = 'att-cal-steppers-bar';

      const monthBox = document.createElement('div');
      monthBox.className = 'att-cal-mini-stepper';
      const btnPrevM = document.createElement('button');
      btnPrevM.type = 'button';
      btnPrevM.className = 'att-cal-step-btn';
      btnPrevM.setAttribute('aria-label', 'Bulan sebelumnya');
      btnPrevM.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>';
      btnPrevM.addEventListener('click', (e) => {
        e.stopPropagation();
        const d = new Date(viewState.year, viewState.month - 1, 1);
        viewState.year = d.getFullYear();
        viewState.month = d.getMonth();
        renderPopover('month-down');
      });

      const mValWrap = document.createElement('span');
      mValWrap.className = 'att-cal-step-value-wrap';
      const mVal = document.createElement('span');
      mVal.className = 'att-cal-step-value' + monthAnim;
      mVal.textContent = MONTHS_FULL[viewState.month];
      mValWrap.appendChild(mVal);

      const btnNextM = document.createElement('button');
      btnNextM.type = 'button';
      btnNextM.className = 'att-cal-step-btn';
      btnNextM.setAttribute('aria-label', 'Bulan berikutnya');
      btnNextM.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>';
      btnNextM.addEventListener('click', (e) => {
        e.stopPropagation();
        const d = new Date(viewState.year, viewState.month + 1, 1);
        viewState.year = d.getFullYear();
        viewState.month = d.getMonth();
        renderPopover('month-up');
      });

      monthBox.appendChild(btnPrevM);
      monthBox.appendChild(mValWrap);
      monthBox.appendChild(btnNextM);

      const yearBox = document.createElement('div');
      yearBox.className = 'att-cal-mini-stepper is-year';
      const btnPrevY = document.createElement('button');
      btnPrevY.type = 'button';
      btnPrevY.className = 'att-cal-step-btn';
      btnPrevY.setAttribute('aria-label', 'Kurangi tahun');
      btnPrevY.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      btnPrevY.addEventListener('click', (e) => {
        e.stopPropagation();
        viewState.year -= 1;
        renderPopover('year-down');
      });

      const yValWrap = document.createElement('span');
      yValWrap.className = 'att-cal-step-value-wrap';
      const yVal = document.createElement('span');
      yVal.className = 'att-cal-step-value' + yearAnim;
      yVal.textContent = String(viewState.year);
      yValWrap.appendChild(yVal);

      const btnNextY = document.createElement('button');
      btnNextY.type = 'button';
      btnNextY.className = 'att-cal-step-btn';
      btnNextY.setAttribute('aria-label', 'Tambah tahun');
      btnNextY.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
      btnNextY.addEventListener('click', (e) => {
        e.stopPropagation();
        viewState.year += 1;
        renderPopover('year-up');
      });

      yearBox.appendChild(btnPrevY);
      yearBox.appendChild(yValWrap);
      yearBox.appendChild(btnNextY);

      steppersBar.appendChild(monthBox);
      steppersBar.appendChild(yearBox);
      popover.appendChild(steppersBar);

      const wdRow = document.createElement('div');
      wdRow.className = 'att-cal-weekdays';
      wdRow.innerHTML = '<span>Min</span><span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span>';
      popover.appendChild(wdRow);

      const grid = document.createElement('div');
      grid.className = 'att-cal-days-grid';
      cells.forEach((c) => {
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';
        dayBtn.className = 'att-cal-day-btn' +
          (c.outside ? ' is-outside' : '') +
          (c.iso === todayIso ? ' is-today' : '') +
          (c.iso === selectedIso ? ' is-selected' : '');
        dayBtn.dataset.date = c.iso;
        dayBtn.textContent = String(c.day);
        dayBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          applySelectedIso(c.iso);
        });
        grid.appendChild(dayBtn);
      });
      popover.appendChild(grid);

      const footer = document.createElement('div');
      footer.className = 'att-cal-footer';

      const btnClear = document.createElement('button');
      btnClear.type = 'button';
      btnClear.className = 'att-cal-footer-btn subtle';
      btnClear.textContent = 'Reset';
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        applySelectedIso('');
      });

      const rightBtns = document.createElement('div');
      rightBtns.style.display = 'inline-flex';
      rightBtns.style.gap = '6px';

      const btnClose = document.createElement('button');
      btnClose.type = 'button';
      btnClose.className = 'att-cal-footer-btn subtle';
      btnClose.textContent = 'Tutup';
      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllCustomDates();
      });

      const btnToday = document.createElement('button');
      btnToday.type = 'button';
      btnToday.className = 'att-cal-footer-btn primary';
      btnToday.textContent = 'Hari Ini';
      btnToday.addEventListener('click', (e) => {
        e.stopPropagation();
        applySelectedIso(todayIso);
      });

      rightBtns.appendChild(btnClose);
      rightBtns.appendChild(btnToday);
      footer.appendChild(btnClear);
      footer.appendChild(rightBtns);
      popover.appendChild(footer);
    }

    function openPopover() {
      closeAllCustomDates(wrap);
      const curParts = parseIsoParts(getNativeVal());
      if (curParts) {
        viewState.year = curParts.year;
        viewState.month = curParts.month - 1;
      } else {
        const curNow = new Date();
        viewState.year = curNow.getFullYear();
        viewState.month = curNow.getMonth();
      }

      renderPopover();

      if (typeof trigger.getBoundingClientRect === 'function' && typeof window !== 'undefined') {
        const rect = trigger.getBoundingClientRect();
        const spaceBelow = (window.innerHeight || 800) - rect.bottom;
        const overflowRight = rect.left + 292 > (window.innerWidth || 1200) - 16;
        popover.classList.toggle('open-upward', spaceBelow < 320 && rect.top > spaceBelow);
        popover.classList.toggle('align-right', overflowRight);
      }

      wrap.classList.add('open');
      popover.classList.add('open');
      popover.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (inputEl.disabled) return;
      if (wrap.classList.contains('open')) closeAllCustomDates();
      else openPopover();
    });

    popover.addEventListener('click', (e) => e.stopPropagation());

    if (typeof HTMLInputElement !== 'undefined') {
      const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      if (desc && desc.get && desc.set) {
        Object.defineProperty(inputEl, 'value', {
          configurable: true,
          get() { return desc.get.call(this); },
          set(val) {
            desc.set.call(this, val);
            syncDisplay();
          }
        });
      }
    }

    inputEl.addEventListener('change', syncDisplay);
    syncDisplay();
  }

  function initAllCustomDates() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('input[type="date"].form-input').forEach(enhanceCustomDateInput);
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      const inside = e.target && typeof e.target.closest === 'function' ? e.target.closest('.dh-date-wrap') : null;
      if (!inside) closeAllCustomDates();
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAllCustomDates);
    } else {
      initAllCustomDates();
    }
  }

  if (typeof window !== 'undefined') {
    window.initAllCustomDates = initAllCustomDates;
    window.enhanceCustomDateInput = enhanceCustomDateInput;
    window.closeAllCustomDates = closeAllCustomDates;
  }
})();
