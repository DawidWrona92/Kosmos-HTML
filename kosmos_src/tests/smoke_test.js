/* Test dymny (smoke test) zbudowanej aplikacji.
 *
 * Uruchomienie:
 *   python3 kosmos_src/build.py
 *   node kosmos_src/tests/smoke_test.js
 *
 * Test buduje w Node kompletny mock DOM (canvas przez Proxy, Image jako
 * natychmiast "załadowane" obrazki, speechSynthesis z jednym polskim głosem),
 * uruchamia całą aplikację i przechodzi wszystkie 23 zadania do końca,
 * sprawdzając że każde zostaje oznaczone jako wykonane.
 *
 * Uwaga: mock getImageData zwraca alfy malejące z każdym wywołaniem, dzięki
 * czemu zadania typu "wycieranie" mogą się zakończyć.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const BUILT = path.join(ROOT, 'kosmos_dla_corki.html');

/* ---------- mock płótna 2d ---------- */

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
          data[i] = 200;
          data[i + 1] = 200;
          data[i + 2] = 200;
          data[i + 3] = alpha;
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

/* ---------- mock elementu DOM ---------- */

function makeEl(id) {
  const el = {
    id,
    hidden: false,
    textContent: '',
    innerHTML: '',
    value: '',
    checked: false,
    disabled: false,
    style: {},
    dataset: {},
    scrollTop: 0,
    firstChild: null,
    handlers: {},
    classList: {toggle() {}, add() {}, remove() {}, contains: () => false},
    addEventListener(type, fn) { (el.handlers[type] = el.handlers[type] || []).push(fn); },
    removeEventListener() {},
    appendChild() {},
    insertBefore() {},
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

/* ---------- mock przeglądarki ---------- */

class FakeImage {
  constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; }
  set src(value) {
    this._src = value;
    this.complete = true;
    this.naturalWidth = 100;
    this.naturalHeight = 100;
  }
  get src() { return this._src; }
}

class FakeUtterance {
  constructor(text) { this.text = text; }
}

const windowObj = {
  innerWidth: 1280,
  innerHeight: 800,
  devicePixelRatio: 1,
  matchMedia: () => ({matches: false, addEventListener() {}}),
  localStorage: {getItem: () => null, setItem() {}, removeItem() {}},
  speechSynthesis: {
    speaking: false,
    pending: false,
    cancel() {},
    speak(u) { if (u && u.onend) setTimeout(() => u.onend(), 0); },
    getVoices: () => [{name: 'Zosia', lang: 'pl-PL'}],
    addEventListener() {}
  },
  SpeechSynthesisUtterance: FakeUtterance,
  Image: FakeImage,
  Path2D: class { moveTo() {} bezierCurveTo() {} quadraticCurveTo() {} closePath() {} },
  addEventListener() {},
  requestAnimationFrame: () => 0,
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
  requestAnimationFrame: () => 0,
  setTimeout,
  clearTimeout,
  console
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

/* ---------- uruchomienie aplikacji ---------- */

if (!fs.existsSync(BUILT)) {
  console.error(`Brak pliku ${BUILT} — najpierw uruchom: python3 kosmos_src/build.py`);
  process.exit(1);
}
const html = fs.readFileSync(BUILT, 'utf-8');
const match = html.match(/<script>\n([\s\S]*)<\/script>/);
if (!match) {
  console.error('Nie znaleziono bloku <script> w zbudowanym pliku.');
  process.exit(1);
}
try {
  vm.runInContext(match[1], sandbox, {filename: 'app.js'});
} catch (error) {
  console.error('START APLIKACJI NIEUDANY:', error.stack);
  process.exit(1);
}
console.log('start aplikacji OK');

const t = windowObj.__KOSMOS_TEST__;
if (!t) {
  console.error('Brak hooka testowego (window.__KOSMOS_TEST__).');
  process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/* ---------- przejście wszystkich zadań ---------- */

const items = [...t.bodies, ...t.finds];
const jobs = [];
for (const item of items) {
  if (item.activity) jobs.push([item, 0]);
  if (item.activity2) jobs.push([item, 1]);
}
let failures = 0;

function gridClicks(act, step = 10) {
  for (let y = 0; y <= act.height; y += step) {
    for (let x = 0; x <= act.width; x += step) {
      act.onDown({x, y});
      act.onUp();
      if (t.doneTasks.size && itemDone()) return true;
    }
  }
  return itemDone();
}
let currentItemId = null;
function itemDone() {
  return currentItemId && t.doneTasks.has(currentItemId);
}

async function complete(item, slot = 0) {
  currentItemId = slot ? `${item.id}#2` : item.id;
  t.openActivity(item, slot);
  const act = t.getActive();
  if (!act) throw new Error('aktywność nie została utworzona');
  const kind = slot ? item.activity2 : item.activity;
  if (kind === 'venus' || kind === 'rover') {
    // wycieranie: siatka przeciągnięć; test czeka między krokami, bo aplikacja
    // sprawdza ilość pozostałego brudu nie częściej niż co 120 ms
    act.onDown({x: 0, y: 0});
    let guard = 0;
    while (!itemDone() && guard++ < 12) {
      for (let y = 0; y <= act.height; y += 24) {
        for (let x = 0; x <= act.width; x += 24) act.onMove({x, y});
      }
      await sleep(140);
    }
    act.onUp();
  } else if (kind === 'uranus') {
    act.onDown({x: act.width / 2, y: act.height / 2});
    for (let x = act.width / 2; x <= act.width; x += 8) act.onMove({x, y: act.height / 2});
    act.onUp();
  } else if (kind === 'tail') {
    act.onDown({x: 96 + 178, y: 252});
    for (let a = 0; a < 2.6; a += .04) act.onMove({x: 96 + Math.cos(a) * 178, y: 252 + Math.sin(a) * 178});
    act.onUp();
  } else if (kind === 'moon') {
    const diffs = [
      {x: 343, y: 100}, {x: 470, y: 42}, {x: 168, y: 172}, {x: 445, y: 178}, {x: 280, y: 50}
    ];
    for (const d of diffs) {
      act.onDown({x: d.x, y: d.y});
      act.onUp();
      act.onDown({x: d.x, y: d.y + 212});
      act.onUp();
    }
  } else if (kind === 'neptune') {
    // Tryton siedzi w miejscu wynikającym z czasu ostatniej klatki
    if (act.frame) act.frame(.016, 5000);
    const angle = 5000 * .0016;
    act.onDown({x: 280 + Math.cos(angle) * 209, y: 170 + Math.sin(angle) * 114.95});
    act.onUp();
  } else if (kind === 'parts') {
    // klikamy dokładnie w hit areas kolejnych części (różne miejsca przy count > 1)
    // imgRect liczymy tak samo jak aplikacja: obraz „contain” w 560x340 z marginesem 60
    const spec = t.PARTS[item.sprite || item.draw];
    const src = spec.image ? {w: 100, h: 100} : {w: 300, h: 240}; // wymiary jak w mocku / jak rysuje PROBE_BOX
    const scale = Math.min((560 - 60) / src.w, (340 - 60) / src.h);
    const rect = {x: (560 - src.w * scale) / 2, y: (340 - src.h * scale) / 2, w: src.w * scale, h: src.h * scale};
    for (const part of spec.parts) {
      const need = Math.min(part.count || 1, part.hits.length);
      for (let hit = 0; hit < need; hit++) {
        const [hx, hy] = part.hits[hit];
        act.onDown({x: rect.x + hx * rect.w, y: rect.y + hy * rect.h});
        act.onUp();
        await sleep(0);
      }
    }
  } else if (kind === 'order') {
    // klikamy chip planety (dół), potem jej slot (góra) — po kolei 1..8
    for (let i = 0; i < act.slots.length; i++) {
      const chip = act.chips.find(c => c.planetIndex === i);
      const slot = act.slots[i];
      act.onDown({x: chip.x, y: chip.y});
      act.onUp();
      act.onDown({x: slot.x, y: slot.y});
      act.onUp();
    }
  } else if (kind === 'seasons') {
    // przeciągamy Ziemię kolejno przez cztery strefy pór roku
    const startX = act.sun.x + Math.cos(act.angleStart) * act.orbit;
    const startY = act.sun.y + Math.sin(act.angleStart) * act.orbit;
    act.onDown({x: startX, y: startY});
    for (const zone of act.zones) {
      act.onMove({x: act.sun.x + Math.cos(zone.angle) * act.orbit, y: act.sun.y + Math.sin(zone.angle) * act.orbit});
    }
    act.onUp();
  } else if (kind === 'galilean') {
    // pozycje księżyców ustawia frame(), klikamy w każdy środek
    if (act.frame) act.frame(.016, 5000);
    for (const moon of act.moons) {
      act.onDown({x: moon.x, y: moon.y});
      act.onUp();
    }
  } else {
    // znajdź-klik (sunspots, mercury, ceres, jupiter, saturn, heart):
    // klikamy gęstą siatką, aż zadanie się skończy
    gridClicks(act, 10);
  }
  if (act.frame) act.frame(.016, performance.now() + 100);
  t.closeActivity();
  currentItemId = null;
  if (!t.doneTasks.has(slot ? `${item.id}#2` : item.id)) throw new Error('zadanie nie zostało oznaczone jako wykonane');
}

(async () => {
  for (const [item, slot] of jobs) {
    try {
      await complete(item, slot);
      console.log(`OK   ${item.id}${slot ? ' (zadanie 2)' : ''} (${slot ? item.activity2 : item.activity})`);
    } catch (error) {
      failures++;
      console.error(`FAIL ${item.id}${slot ? ' (zadanie 2)' : ''} (${slot ? item.activity2 : item.activity}): ${error.message}`);
    }
  }
  const doneCount = t.doneTasks.size;
  console.log(`wykonanych zadań: ${doneCount}/${jobs.length}`);
  if (doneCount !== jobs.length) {
    console.error(`OCZEKIWANO ${jobs.length} wykonanych zadań`);
    failures++;
  }

  /* ---------- poziomy galaktyczne: Ramię Oriona i Droga Mleczna ---------- */

  t.resetView();
  if (!t.zoomOutLevel()) { console.error('FAIL nie weszło na poziom -1 (Ramię Oriona)'); failures++; }
  else {
    t.draw();
    const armTargets = t.view.galaxyTargets;
    if (armTargets.length !== 2) { console.error(`FAIL Ramię Oriona: oczekiwano 2 obiektów, jest ${armTargets.length}`); failures++; }
    for (const target of armTargets) {
      try {
        t.pickAt(target.x, target.y, 'mouse');
        if (!t.discovered.has(target.object.id)) throw new Error('nie oznaczono jako odkryte');
        console.log(`OK   galaktyka ${target.object.id}`);
      } catch (error) {
        failures++;
        console.error(`FAIL galaktyka ${target.object.id}: ${error.message}`);
      }
    }
  }
  if (!t.zoomOutLevel()) { console.error('FAIL nie weszło na poziom -2 (Droga Mleczna)'); failures++; }
  else {
    t.draw();
    const galaxyTargets = t.view.galaxyTargets;
    if (galaxyTargets.length !== 4) { console.error(`FAIL Droga Mleczna: oczekiwano 4 obiektów, jest ${galaxyTargets.length}`); failures++; }
    for (const target of galaxyTargets) {
      try {
        t.pickAt(target.x, target.y, 'mouse');
        if (!t.discovered.has(target.object.id)) throw new Error('nie oznaczono jako odkryte');
        console.log(`OK   galaktyka ${target.object.id}`);
      } catch (error) {
        failures++;
        console.error(`FAIL galaktyka ${target.object.id}: ${error.message}`);
      }
    }
  }
  if (t.zoomOutLevel()) { console.error('FAIL zoomOutLevel poniżej -2 powinien zwrócić false'); failures++; }
  t.resetView();
  if (t.view.level !== 0) { console.error('FAIL resetView nie wrócił na poziom 0'); failures++; }

  const discoveredCount = t.discovered.size;
  const expectedGalaxy = t.allGalaxy.length; // 6 obiektów galaktycznych klikniętych powyżej
  if (discoveredCount < expectedGalaxy) {
    console.error(`FAIL odkryto tylko ${discoveredCount}, oczekiwano co najmniej ${expectedGalaxy} (galaktyczne)`);
    failures++;
  }

  /* ---------- regresja: rysowanie planety z księżycami (drawMoon) ---------- */

  t.resetView();
  const jupiterIndex = t.bodies.findIndex(body => body.id === 'jupiter');
  t.view.following = true;
  t.view.selected = jupiterIndex;
  t.view.zoom = 30;
  t.view.zoomGoal = 30;
  try {
    for (let frame = 0; frame < 3; frame++) t.draw();
    if (!t.view.moonTargets.length) throw new Error('brak celów księżyców po rysowaniu Jowisza');
    console.log(`OK   rysowanie Jowisza z księżycami (${t.view.moonTargets.length} księżyce)`);
  } catch (error) {
    failures++;
    console.error(`FAIL rysowanie planety z księżycami: ${error.message}`);
  }
  t.resetView();

  if (failures) {
    console.error(`PORAŻKI: ${failures}`);
    process.exit(1);
  }
  console.log(`WSZYSTKIE ${jobs.length} ZADANIA + POZIOMY GALAKTYCZNE PRZESZŁY`);
})();
