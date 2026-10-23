/* Test diagnostyczny zamrożenia pętli animacji po kliknięciu planety.
 * Symuluje realny scenariusz: pickAt (klik) + ręczne kręcenie pętlą
 * requestAnimationFrame, co smoke_test pomiędzy (on tam nie symuluje rAF).
 * Uruchomienie: node kosmos_src/tests/repro_freeze.js (po build.py)
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BUILT = path.join(ROOT, 'kosmos_dla_corki.html');


function makeCtx() {
  const gradient = {addColorStop() {}};
  const target = {};
  let imageDataCalls = 0;
  return new Proxy(target, {
    get(t, prop) {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return () => gradient;
      if (prop === 'getImageData') return (x, y, w, h) => {
        const alpha = Math.max(0, 255 - 70 * imageDataCalls++);
        const data = new Uint8ClampedArray(Math.max(4, Math.round(w) * Math.round(h) * 4));
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 200; data[i + 1] = 200; data[i + 2] = 200; data[i + 3] = alpha;
        }
        return {data};
      };
      if (prop === 'createImageData') return (w, h) => ({data: new Uint8ClampedArray(Math.max(4, Math.round(w) * Math.round(h) * 4))});
      if (prop === 'measureText') return () => ({width: 10});
      if (prop === 'isPointInPath') return () => true;
      if (prop in t) return t[prop];
      return () => {};
    },
    set(t, prop, value) { t[prop] = value; return true; }
  });
}

function makeEl(id) {
  const el = {
    id, hidden: false, textContent: '', innerHTML: '', value: '', checked: false,
    disabled: false, style: {}, dataset: {}, scrollTop: 0, firstChild: null,
    handlers: {}, offsetWidth: 0,
    classList: {toggle() {}, add() {}, remove() {}, contains: () => false},
    addEventListener(type, fn) { (el.handlers[type] = el.handlers[type] || []).push(fn); },
    removeEventListener() {},
    appendChild() {}, insertBefore() {},
    querySelector: () => makeEl('q'),
    querySelectorAll: () => [],
    closest: () => null,
    getBoundingClientRect: () => ({left: 0, top: 0, right: 800, bottom: 600, width: 800, height: 600}),
    setPointerCapture() {},
    getContext: () => makeCtx()
  };
  return el;
}

const elements = {};
const byId = id => elements[id] || (elements[id] = makeEl(id));

class FakeImage {
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
  set src(value) { this._src = value; this.complete = true; this.naturalWidth = 100; this.naturalHeight = 100; }
  get src() { return this._src; }
}
class FakeUtterance { constructor(text) { this.text = text; } }

const rafQueue = [];
const windowObj = {
  innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  matchMedia: () => ({matches: false, addEventListener() {}}),
  localStorage: {getItem: () => null, setItem() {}, removeItem() {}},
  speechSynthesis: {
    speaking: false, pending: false, cancel() {},
    speak(u) { if (u && u.onend) setTimeout(() => u.onend(), 0); },
    getVoices: () => [{name: 'Zosia', lang: 'pl-PL'}],
    addEventListener() {}
  },
  SpeechSynthesisUtterance: FakeUtterance,
  Image: FakeImage,
  Path2D: class { moveTo() {} bezierCurveTo() {} quadraticCurveTo() {} closePath() {} },
  addEventListener() {},
  requestAnimationFrame: fn => { rafQueue.push(fn); return rafQueue.length; },
  __KOSMOS_TEST__: true
};

const sandbox = {
  window: windowObj,
  document: {
    getElementById: byId,
    querySelectorAll: () => [],
    createElement: tag => makeEl(tag),
    addEventListener() {},
    body: makeEl('body')
  },
  performance,
  localStorage: windowObj.localStorage,
  speechSynthesis: windowObj.speechSynthesis,
  SpeechSynthesisUtterance: FakeUtterance,
  Image: FakeImage,
  Path2D: windowObj.Path2D,
  requestAnimationFrame: windowObj.requestAnimationFrame,
  setTimeout, clearTimeout, console
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const html = fs.readFileSync(BUILT, 'utf-8');
const match = html.match(/<script>\n([\s\S]*)<\/script>/);
vm.runInContext(match[1], sandbox, {filename: 'app.js'});

const t = windowObj.__KOSMOS_TEST__;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function runFrames(count) {
  let now = performance.now();
  for (let frame = 0; frame < count; frame++) {
    now += 16;
    const callbacks = rafQueue.splice(0);
    if (!callbacks.length) throw new Error(`pętla nie zarejestrowała rAF po ${frame} klatkach`);
    callbacks.forEach(fn => fn(now));
  }
}

(async () => {
  await sleep(50);
  let failures = 0;
  /* każdą planetę klikamy jak użytkownik i kręcimy pętlą do pełnego przybliżenia,
   * aż radius >= 40 (wtedy rysują się księżyce i sondy — ścieżka drawMoon/drawFinds) */
  for (const body of t.bodies) {
    if (body.kind === 'star') continue;
    try {
      t.resetView();
      t.draw();
      const target = t.view.targets.find(item => item.body.id === body.id);
      t.pickAt(target.x, target.y, 'mouse');
      /* 400 klatek ≈ 6,5 s — zoom dochodzi do celu, radius przekracza 40 */
      runFrames(400);
      t.draw();
      const radius = t.view.targets.find(item => item.body.id === body.id).radius;
      console.log(`OK   ${body.id} (radius ${radius.toFixed(0)}, księżyce: ${t.view.moonTargets.length}, sondy: ${t.view.findTargets.length})`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${body.id}: ${error.message}`);
      console.error(error.stack.split('\n').slice(0, 4).join('\n'));
    }
  }
  /* dodatkowo: klik w księżyc i sondę przy pełnym zoomie (Jowisz) */
  try {
    t.resetView();
    t.draw();
    const target = t.view.targets.find(item => item.body.id === 'jupiter');
    t.pickAt(target.x, target.y, 'mouse');
    runFrames(400);
    t.draw();
    if (t.view.moonTargets.length) {
      const moon = t.view.moonTargets[0];
      t.pickAt(moon.x, moon.y, 'mouse');
      runFrames(60);
      console.log('OK   klik w księżyc Jowisza');
    }
  } catch (error) {
    failures++;
    console.error(`FAIL klik w księżyc: ${error.message}`);
  }
  process.exit(failures ? 1 : 0);
})();
