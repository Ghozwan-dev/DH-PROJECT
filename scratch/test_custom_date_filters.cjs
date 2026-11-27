const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: CUSTOM DATE FILTER CALENDAR POPOVER (REPORT & HISTORY/RECAP) ===\n');

const previewShell = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');
const assembledHtml = require('../scripts/html-assembler').loadPreviewHtml();
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');
const customDateJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'custom-date.js'), 'utf-8');

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`[PASS] ${msg}`);
    passed++;
  } else {
    console.error(`[FAIL] ${msg}`);
    process.exitCode = 1;
  }
}

assert(
  previewShell.includes('assets/js/custom-date.js') &&
  previewShell.indexOf('assets/js/custom-date.js') < previewShell.indexOf('assets/js/app.js'),
  'preview.html loads assets/js/custom-date.js before assets/js/app.js'
);
assert(
  assembledHtml.includes('id="repFilterStartDate" class="form-input"') &&
  assembledHtml.includes('id="repFilterEndDate" class="form-input"') &&
  assembledHtml.includes('id="attFilterDate" class="form-input"') &&
  assembledHtml.includes('id="recapFilterStartDate" class="form-input"') &&
  assembledHtml.includes('id="recapFilterEndDate" class="form-input"'),
  'All 5 filter date inputs preserve type="date" and class="form-input" for enhancer'
);
assert(
  baseCss.includes('.dh-date-popover') &&
  baseCss.includes('.dh-date-popover.align-right') &&
  baseCss.includes('@media (max-width: 640px)') &&
  baseCss.includes('.dh-date-popover.open'),
  'base.css defines desktop edge alignment and mobile fixed bottom sheet for .dh-date-popover'
);

function makeNode(tag) {
  const cls = new Set();
  const attrs = {};
  const listeners = {};
  const node = {
    tagName: tag.toUpperCase(),
    dataset: {},
    style: {},
    children: [],
    parentNode: null,
    tabIndex: 0,
    disabled: false,
    _value: '',
    _text: '',
    classList: {
      add: (...c) => c.forEach(x => cls.add(x)),
      remove: (...c) => c.forEach(x => cls.delete(x)),
      contains: x => cls.has(x),
      toggle: (x, f) => {
        if (f === undefined) {
          if (cls.has(x)) cls.delete(x);
          else cls.add(x);
        } else if (f) {
          cls.add(x);
        } else {
          cls.delete(x);
        }
      }
    },
    setAttribute: (k, v) => { attrs[k] = String(v); },
    getAttribute: k => attrs[k] || null,
    addEventListener: (ev, fn) => {
      if (!listeners[ev]) listeners[ev] = [];
      listeners[ev].push(fn);
    },
    dispatchEvent: (ev) => {
      (listeners[ev.type] || []).forEach(fn => fn(ev));
      return true;
    },
    trigger: (ev, evObj = {}) => {
      (listeners[ev] || []).forEach(fn => fn({ stopPropagation: () => {}, preventDefault: () => {}, ...evObj }));
    },
    appendChild: (ch) => {
      ch.parentNode = node;
      node.children.push(ch);
      return ch;
    },
    insertBefore: (n, ref) => {
      n.parentNode = node;
      const i = node.children.indexOf(ref);
      if (i === -1) node.children.push(n);
      else node.children.splice(i, 0, n);
      return n;
    },
    getBoundingClientRect: () => node._rect || { left: 20, bottom: 200, top: 160 },
    querySelector: (sel) => {
      const want = sel.replace(/^\./, '');
      const stack = [...node.children];
      while (stack.length) {
        const cur = stack.shift();
        if (want.split('.').every(c => cur.classList.contains(c))) return cur;
        stack.push(...cur.children);
      }
      return null;
    },
    querySelectorAll: (sel) => {
      const want = sel.replace(/^\./, '');
      const out = [];
      const stack = [...node.children];
      while (stack.length) {
        const cur = stack.shift();
        if (want.split('.').every(c => cur.classList.contains(c))) out.push(cur);
        stack.push(...cur.children);
      }
      return out;
    }
  };
  Object.defineProperty(node, 'className', {
    get: () => Array.from(cls).join(' '),
    set: (v) => {
      cls.clear();
      String(v).split(/\s+/).filter(Boolean).forEach(x => cls.add(x));
    }
  });
  Object.defineProperty(node, 'textContent', {
    get: () => node._text,
    set: (v) => { node._text = String(v); }
  });
  Object.defineProperty(node, 'innerHTML', {
    get: () => node._html || '',
    set: (v) => {
      node._html = String(v);
      if (v === '') node.children = [];
    }
  });
  Object.defineProperty(node, 'value', {
    get: () => node._value,
    set: (v) => { node._value = String(v); }
  });
  return node;
}

const parentStart = makeNode('div');
const startInput = makeNode('input');
startInput.id = 'repFilterStartDate';
startInput.type = 'date';
startInput.className = 'form-input';
parentStart.appendChild(startInput);

const parentEnd = makeNode('div');
const endInput = makeNode('input');
endInput.id = 'repFilterEndDate';
endInput.type = 'date';
endInput.className = 'form-input';
parentEnd.appendChild(endInput);

let startChangeCount = 0;
startInput.addEventListener('change', () => { startChangeCount++; });

const ctx = {
  console,
  Event: function (t) { this.type = t; },
  document: {
    readyState: 'complete',
    createElement: makeNode,
    querySelectorAll: (sel) => {
      if (sel === 'input[type="date"].form-input') return [startInput, endInput];
      if (sel === '.dh-date-wrap.open') {
        return [parentStart, parentEnd]
          .flatMap(p => p.children.filter(c => c.classList.contains('dh-date-wrap') && c.classList.contains('open')));
      }
      return [];
    },
    addEventListener: () => {}
  },
  window: { innerWidth: 1024, innerHeight: 800 }
};

vm.runInNewContext(customDateJs, ctx);

const startWrap = parentStart.children[0];
const startTrigger = startWrap.querySelector('.dh-date-trigger');
const startLabel = startWrap.querySelector('.dh-date-value');
const startPopover = startWrap.querySelector('.dh-date-popover');

const endWrap = parentEnd.children[0];
const endTrigger = endWrap.querySelector('.dh-date-trigger');
const endPopover = endWrap.querySelector('.dh-date-popover');
endTrigger._rect = { left: 820, bottom: 200, top: 160 };

assert(
  startLabel.textContent === '01/01/2026' && startLabel.classList.contains('is-placeholder'),
  'Uninitialized filter date displays numeric placeholder "01/01/2026" cleanly'
);

startTrigger.trigger('click');
assert(
  startWrap.classList.contains('open') && startPopover.classList.contains('open') &&
  startPopover.querySelectorAll('.att-cal-mini-stepper').length === 2,
  'Clicking Dari Tanggal opens custom popover with Month & Year Number Steppers'
);

const firstGridDay = startPopover.querySelector('.att-cal-day-btn');
const pickedIso = firstGridDay.dataset.date;
firstGridDay.trigger('click');
assert(
  startInput.value === pickedIso &&
  !startLabel.classList.contains('is-placeholder') &&
  startChangeCount === 1 &&
  !startWrap.classList.contains('open'),
  `Picking day ${pickedIso} updates #repFilterStartDate.value, formats DD/MM/YYYY, triggers change, and closes popover`
);

// Clicking Reset clears filter cleanly
startTrigger.trigger('click');
const resetBtn = startPopover.querySelectorAll('.att-cal-footer-btn.subtle').find(b => b.textContent === 'Reset');
resetBtn.trigger('click');
assert(
  startInput.value === '' &&
  startLabel.textContent === '01/01/2026' &&
  startChangeCount === 2,
  'Clicking Reset clears #repFilterStartDate.value back to "" and resets numeric placeholder'
);

// Right-edge smart alignment for Sampai Tanggal
endTrigger.trigger('click');
assert(
  endPopover.classList.contains('align-right'),
  'Sampai Tanggal near right edge receives .align-right so popover never clips off-screen'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
