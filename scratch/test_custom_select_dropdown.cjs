const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== TEST: CUSTOM MODERN SELECT DROPDOWN ===\n');

const previewShell = fs.readFileSync(path.join(__dirname, '..', 'preview.html'), 'utf-8');
const assembledHtml = require('../scripts/html-assembler').loadPreviewHtml();
const baseCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'base.css'), 'utf-8');
const customSelectJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'custom-select.js'), 'utf-8');

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
  previewShell.includes('assets/js/custom-select.js') &&
  previewShell.indexOf('assets/js/custom-select.js') < previewShell.indexOf('assets/js/app.js'),
  'preview.html loads assets/js/custom-select.js before assets/js/app.js'
);
assert(
  assembledHtml.includes('id="schFormDay"') && assembledHtml.includes('value="Senin"'),
  'Assembled HTML preserves #schFormDay native select options'
);
assert(
  baseCss.includes('.dh-select-menu') &&
  baseCss.includes('.dh-select-option.is-selected') &&
  baseCss.includes('.dh-select-wrap.open .dh-select-menu'),
  'base.css defines rounded elevated .dh-select-menu and emerald .is-selected state'
);

// Mock DOM to test enhanceCustomSelect interaction
function createMockNode(tag) {
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
    triggerListener: (evName, evObj = {}) => {
      (listeners[evName] || []).forEach(fn => fn({ stopPropagation: () => {}, preventDefault: () => {}, ...evObj }));
    },
    appendChild: (ch) => {
      ch.parentNode = node;
      node.children.push(ch);
      return ch;
    },
    insertBefore: (newNode, refNode) => {
      newNode.parentNode = node;
      const idx = node.children.indexOf(refNode);
      if (idx === -1) node.children.push(newNode);
      else node.children.splice(idx, 0, newNode);
      return newNode;
    },
    focus: () => {},
    closest: (sel) => {
      if (sel === '.input-wrapper' && cls.has('input-wrapper')) return node;
      if (node.parentNode && typeof node.parentNode.closest === 'function') return node.parentNode.closest(sel);
      return null;
    },
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

const wrapper = createMockNode('div');
wrapper.classList.add('input-wrapper');

const selectEl = createMockNode('select');
selectEl.id = 'schFormDay';
selectEl.className = 'form-select';
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];
selectEl.options = days.map((d) => {
  const opt = createMockNode('option');
  opt.value = d;
  opt.textContent = d;
  return opt;
});
selectEl._value = 'Senin';
selectEl.selectedIndex = 0;
wrapper.appendChild(selectEl);

let changeFired = 0;
selectEl.addEventListener('change', () => { changeFired++; });

const ctx = {
  console,
  Event: function (type) { this.type = type; },
  document: {
    readyState: 'complete',
    createElement: createMockNode,
    querySelectorAll: (sel) => {
      if (sel.includes('select.form-select')) return [selectEl];
      if (sel === '.dh-select-wrap.open') return wrapper.children.filter(c => c.classList.contains('dh-select-wrap') && c.classList.contains('open'));
      return [];
    },
    addEventListener: () => {}
  },
  window: { innerHeight: 800 }
};

vm.runInNewContext(customSelectJs, ctx);

const customWrap = wrapper.children.find(c => c.classList.contains('dh-select-wrap'));
const trigger = customWrap && customWrap.querySelector('.dh-select-trigger');
const label = customWrap && customWrap.querySelector('.dh-select-label');
const menu = customWrap && customWrap.querySelector('.dh-select-menu');

assert(
  wrapper.classList.contains('has-custom-select') &&
  !!customWrap && !!trigger && !!menu,
  'enhanceCustomSelect wraps #schFormDay cleanly with .dh-select-trigger and .dh-select-menu'
);
assert(
  label.textContent === 'Senin' && menu.children.length === 7,
  'Custom dropdown initializes with "Senin" selected and all 7 day options rendered'
);

trigger.triggerListener('click');
assert(
  customWrap.classList.contains('open') && wrapper.classList.contains('is-select-open'),
  'Clicking trigger opens .dh-select-menu and sets .is-select-open on wrapper'
);

const kamisBtn = menu.children.find(b => b.dataset.value === 'Kamis');
kamisBtn.triggerListener('click');
assert(
  selectEl.value === 'Kamis' &&
  label.textContent === 'Kamis' &&
  !customWrap.classList.contains('open') &&
  changeFired === 1,
  'Selecting "Kamis" updates select.value, updates trigger label, dispatches change, and closes menu'
);

console.log(`\n==============================================`);
console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
console.log(`==============================================`);
