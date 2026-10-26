/* Test end-to-end w prawdziwej przeglądarce (Playwright + Chromium).
 *
 * Uruchomienie:
 *   python3 kosmos_src/build.py
 *   node kosmos_src/tests/e2e_test.js
 *
 * Co sprawdza:
 *  - rozwiązuje wszystkie 28 zadań „palcem” (zdarzenia wskaźnika na płótnie),
 *  - sprawdza, że skróty nie zaliczają zadań (Merkury, Wenus, kwiz Ceres),
 *  - przechodzi 12 zadań z częściami sond na podstawie współrzędnych z danych,
 *  - zoom do galaktyki i z powrotem: ciągły, bez skoków środka kamery,
 *  - przeciąganie zmienia azymut i wysokość kamery,
 *  - brak błędów w konsoli.
 */
const path = require('path');
let chromium;
try { ({chromium} = require('playwright')); } catch (error) { ({chromium} = require('/opt/npm-tools/node_modules/playwright')); }

const BUILT = 'file://' + path.resolve(__dirname, '..', 'kosmos_dla_corki.html');
const failures = [];
const report = (ok, name, detail = '') => {
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures.push(name);
};

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1280, height: 760}});
  const page = await context.newPage();
  const errors = [];
  page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
  page.on('pageerror', error => errors.push('PAGEERROR ' + error.message));
  await page.addInitScript(() => {window.__KOSMOS_TEST__ = true;});
  await page.goto(BUILT);
  await page.waitForTimeout(1200);
  await page.click('#startButton').catch(() => {});

  await page.evaluate(() => {
    window.T = window.__KOSMOS_TEST__;
    window.canvasEl = document.getElementById('actCanvas');
    window.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    window.ev = (type, x, y) => {
      const a = T.getActive();
      const r = canvasEl.getBoundingClientRect();
      canvasEl.dispatchEvent(new PointerEvent(type, {clientX: r.left + x * r.width / a.width, clientY: r.top + y * r.height / a.height, pointerId: 1, bubbles: true, pointerType: 'mouse'}));
    };
    window.tap = (x, y) => {ev('pointerdown', x, y); ev('pointerup', x, y);};
    window.findItem = id => [...T.bodies, ...T.finds].find(item => item.id === id);
    window.openTask = (id, slot = 0) => {
      if (T.getActive()) T.closeActivity();
      T.openActivity(findItem(id), slot);
      return !!T.getActive();
    };
    window.isDone = (id, slot = 0) => T.doneTasks.has(slot ? id + '#2' : id);
  });

  /* ---------- zadania ---------- */
  const task = async (name, id, slot, fn) => {
    const opened = await page.evaluate(([i, s]) => openTask(i, s), [id, slot]);
    if (!opened) return report(false, name, 'nie otwarto');
    try { await page.evaluate(fn); } catch (error) { return report(false, name, error.message.slice(0, 160)); }
    await page.waitForTimeout(80);
    report(await page.evaluate(([i, s]) => isDone(i, s), [id, slot]), name);
  };
  const negative = async (name, id, fn) => {
    const wrong = await page.evaluate(async ([i, f]) => {
      const was = T.doneTasks.has(i);
      T.doneTasks.delete(i);
      openTask(i, 0);
      const result = await (new Function('return ' + f))()();
      if (was) T.doneTasks.add(i);
      return result;
    }, [id, fn.toString()]);
    report(!wrong, name);
    await page.evaluate(() => T.closeActivity());
  };

  await task('Słońce: plamy', 'sun', 0, async () => {T.getActive().spots.forEach(spot => tap(spot.x, spot.y));});
  await task('Merkury: lód', 'mercury', 0, async () => {
    for (const [x, y] of [[252, 77], [316, 90]]) {ev('pointerdown', x, y); await sleep(900); ev('pointerup', x, y);}
  });
  await negative('Merkury: szybki przelot nie zalicza', 'mercury', async () => {
    ev('pointerdown', 10, 10);
    for (let x = 100; x < 480; x += 20) {ev('pointermove', x, 77); await sleep(16);}
    ev('pointerup', 400, 77);
    return isDone('mercury', 0);
  });
  const wipe = async (id, rect) => {
    ev('pointerdown', rect.x, rect.y);
    for (let y = rect.y; y < rect.y + rect.h; y += 22) {
      const forward = Math.round((y - rect.y) / 22) % 2 === 0;
      for (let i = 0; i <= 24; i++) ev('pointermove', rect.x + (forward ? i : 24 - i) * rect.w / 24, y);
      await sleep(30);
    }
    ev('pointerup', 0, 0);
  };
  await page.evaluate(`window.wipe = ${wipe.toString()}`);
  await task('Wenus: chmury', 'venus', 0, async () => wipe('venus', {x: 0, y: 0, w: 560, h: 340}));
  await negative('Wenus: sam róg nie zalicza', 'venus', async () => {
    ev('pointerdown', 20, 20);
    for (let i = 0; i < 40; i++) {ev('pointermove', 20 + (i % 8) * 15, 20 + Math.floor(i / 8) * 15); await sleep(12);}
    ev('pointerup', 0, 0);
    return isDone('venus', 0);
  });
  await task('Mars: łazik', 'mars', 0, async () => wipe('mars', {x: 100, y: 20, w: 360, h: 300}));

  const hunt = async id => {
    for (let tries = 0; tries < 300; tries++) {
      const state = (() => {
        const d = T.getActive().debug();
        if (d.phase !== 'hunt') return 'quiz';
        const t = d.targets[0];
        const lon = t.lon * Math.PI / 180 - d.rotation, lat = t.lat * Math.PI / 180;
        if (Math.cos(lat) * Math.cos(lon) < .5) return false;
        tap(d.cx + d.radius * Math.cos(lat) * Math.sin(lon), d.cy - d.radius * Math.sin(lat));
        return true;
      })();
      if (state) break;
      await sleep(100);
    }
  };
  await page.evaluate(`window.hunt = ${hunt.toString()}`);
  await task('Ceres: plama + kwiz', 'ceres', 0, async () => {
    await hunt();
    tap(280 - 215 + 150 + 65, 340 - 138 + 50);          /* zła odpowiedź */
    await sleep(100);
    if (isDone('ceres', 0)) throw new Error('kwiz zaliczony po złej odpowiedzi');
    tap(280 - 215 + 65, 340 - 138 + 50);                /* dobra */
  });
  await task('Jowisz: Wielka Czerwona Plama', 'jupiter', 0, async () => {
    await hunt();
    tap(280 - 215 + 150 + 65, 340 - 138 + 50);
  });
  await task('Saturn: kawałki pierścieni', 'saturn', 0, async () => {
    const t0 = performance.now();
    while (performance.now() - t0 < 30000 && !isDone('saturn', 0)) {
      const a = T.getActive(), d = a.debug();
      const index = d.findIndex(c => !c.hidden && ((c.zone === 'inner' && a.caught.inner < a.need) || (c.zone === 'outer' && a.caught.outer < a.need)));
      if (index >= 0) tap(d[index].x, d[index].y);
      await sleep(40);
    }
  });
  await task('Pas planetoid: slalom', 'belt', 0, async () => {
    const a = T.getActive();
    ev('pointerdown', 26, 170);
    const t0 = performance.now();
    while (performance.now() - t0 < 90000 && !isDone('belt', 0)) {
      const {rocks, probe} = a;
      let best = null, bestScore = -1e9;
      for (let ang = -1.2; ang <= 1.2; ang += .1) {
        const tx = probe.x + Math.cos(ang) * 60, ty = probe.y + Math.sin(ang) * 60;
        if (ty < 8 || ty > 332) continue;
        let clear = 1e9;
        for (const r of rocks) for (const tt of [0, .15, .3]) {
          const px = probe.x + (tx - probe.x) * (tt / .3), py = probe.y + (ty - probe.y) * (tt / .3);
          clear = Math.min(clear, Math.hypot(r.x + r.vx * tt - px, r.y + r.vy * tt - py) - r.r);
        }
        const score = Math.min(clear, 30) * 3 + Math.cos(ang) * 25 - Math.abs(ang) * 4;
        if (score > bestScore) {bestScore = score; best = [tx, ty];}
      }
      if (best) ev('pointermove', best[0], best[1]);
      await sleep(30);
    }
    ev('pointerup', 0, 0);
  });
  await task('Uran: oś do Słońca', 'uranus', 0, async () => {
    const angle = -1.71 - Math.PI / 2;
    ev('pointerdown', 340 + 100 * Math.cos(angle), 170 + 100 * Math.sin(angle));
    await sleep(1000);
    ev('pointerup', 0, 0);
  });
  await task('Neptun: Tryton', 'neptune', 0, async () => {
    const t0 = performance.now();
    while (performance.now() - t0 < 20000 && !isDone('neptune', 0)) {
      const triton = T.getActive().debug();
      if (!triton.behind) tap(triton.x, triton.y);
      await sleep(30);
    }
  });
  await task('Pluton: serce', 'pluto', 0, async () => {
    const target = T.getActive().debug().targets[0];
    let point = null;
    for (let y = 0; y < 340 && !point; y += 4) for (let x = 0; x < 560; x += 4) if (target.test({x, y})) {point = {x, y}; break;}
    if (!point) throw new Error('brak punktu serca');
    ev('pointerdown', 30, 30);
    for (let x = 30; x <= point.x; x += 30) {ev('pointermove', x, 30 + (point.y - 30) * x / point.x); await sleep(16);}
    ev('pointermove', point.x, point.y);
    await sleep(900);
    ev('pointerup', 0, 0);
  });
  await task('Kometa: peryhelium i aphelium', 'halley', 0, async () => {
    ev('pointerdown', 400, 170);
    await sleep(100);
    ev('pointermove', 1, 171);
    await sleep(100);
    ev('pointerup', 0, 0);
  });
  await task('Księżyc: 5 różnic', 'moon', 0, async () => {
    [[320, 110], [470, 42], [148, 172], [445, 178], [40, 168]].forEach(([x, y], i) => tap(x, i % 2 ? y + 212 : y));
  });
  await task('Ziemia: pory roku', 'earth', 1, async () => {
    const a = T.getActive();
    let last = a.angleStart;
    for (const index of a.asks) {
      const angle = a.zones[index].angle;
      ev('pointerdown', a.sun.x + Math.cos(last) * a.orbit, a.sun.y + Math.sin(last) * a.orbit);
      ev('pointermove', a.sun.x + Math.cos(angle) * a.orbit, a.sun.y + Math.sin(angle) * a.orbit);
      ev('pointerup', 0, 0);
      last = angle;
      await sleep(50);
    }
  });
  await task('Jowisz: księżyce Galileusza', 'jupiter', 1, async () => {
    const t0 = performance.now();
    while (performance.now() - t0 < 15000 && !isDone('jupiter', 1)) {
      for (const moon of T.getActive().moons) tap(moon.x, moon.y);
      await sleep(30);
    }
  });
  await task('Słońce: kolejność planet', 'sun', 1, async () => {
    const a = T.getActive();
    for (let i = 0; i < 8; i++) {tap(a.chips[i].x, a.chips[i].y); tap(a.slots[i].x, a.slots[i].y);}
  });

  /* ---------- sondy: części ---------- */
  const probes = ['iss', 'parker', 'messenger', 'magellan', 'mro', 'dawn', 'juno', 'cassini', 'voyager2', 'newhorizons', 'ingenuity', 'giotto'];
  for (const id of probes) {
    await task(`Sonda ${id}: części`, id, 0, async () => {
      const a = T.getActive(), d = a.debug();
      for (const part of d.parts) {
        const need = Math.min(part.count || 1, part.hits.length);
        for (let i = 0; i < need; i++) {
          const [hx, hy] = part.hits[i];
          tap(d.imgRect.x + hx * d.imgRect.w, d.imgRect.y + hy * d.imgRect.h);
        }
      }
    });
  }
  await page.evaluate(() => {if (T.getActive()) T.closeActivity();});
  const total = await page.evaluate(() => ({done: T.doneTasks.size, all: T.TOTAL_TASKS}));
  report(total.done === total.all && total.all === 28, 'wszystkie zadania zaliczone', `${total.done}/${total.all}`);

  /* ---------- kamera: galaktyka ---------- */
  const state = () => page.evaluate(() => {
    const frame = T.computeFrame();
    return {zoom: T.view.zoom, level: T.view.level, alpha: T.galaxyAlpha(), sunX: frame.sunX, sunY: frame.sunY};
  });
  await page.mouse.move(640, 380);
  let previous = await state();
  let monotonic = true, maxJump = 0, sawGalaxy = false;
  for (let i = 0; i < 70; i++) {
    await page.mouse.wheel(0, 140);
    await page.waitForTimeout(60);
    const now = await state();
    if (now.zoom > previous.zoom * 1.001) monotonic = false;
    maxJump = Math.max(maxJump, Math.hypot(now.sunX - previous.sunX, now.sunY - previous.sunY));
    if (now.level === -1) sawGalaxy = true;
    previous = now;
  }
  await page.waitForTimeout(700);
  report(sawGalaxy, 'oddalanie dochodzi do galaktyki', `zoom ${previous.zoom.toFixed(3)}`);
  report(monotonic, 'oddalanie jest monotoniczne (bez „zacięć”)');
  report(maxJump < 700, 'środek kamery nie skacze przy oddalaniu', `max skok ${maxJump.toFixed(0)} px`);
  let backLevel = false;
  for (let i = 0; i < 90; i++) {
    await page.mouse.wheel(0, -140);
    await page.waitForTimeout(60);
    const now = await state();
    if (now.zoom < previous.zoom * .999) monotonic = false;
    previous = now;
    if (now.level === 0) backLevel = true;
  }
  report(backLevel && previous.level === 0, 'przybliżanie wraca do Układu Słonecznego', `level ${previous.level}`);
  await page.evaluate(() => {T.zoomOutLevel();});
  await page.waitForTimeout(2500);
  const far = await state();
  report(far.level === -1 && far.alpha > .9, 'przycisk „Oddal” prowadzi do galaktyki');
  await page.evaluate(() => {T.zoomInLevel();});
  await page.waitForTimeout(3500);
  const near = await state();
  report(near.level === 0 && near.alpha < .05, 'przycisk „Przybliż” wraca do układu');

  /* ---------- kamera: przeciąganie ---------- */
  await page.evaluate(() => {T.resetView();});
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => ({angle: T.view.angle, tilt: T.view.tilt}));
  await page.mouse.move(500, 380);
  await page.mouse.down();
  await page.mouse.move(600, 330, {steps: 8});
  await page.mouse.up();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => ({angle: T.view.angle, tilt: T.view.tilt}));
  report(Math.abs(after.angle - before.angle) > .1 && Number.isFinite(after.tilt) && Number.isFinite(after.angle), 'przeciąganie obraca kamerę', JSON.stringify(after));

  /* ---------- zbliżenie na księżyc ---------- */
  await page.evaluate(() => {T.choose(T.bodies.findIndex(body => body.id === 'jupiter'));});
  await page.waitForTimeout(3000);
  const planetRadius = await page.evaluate(() => T.view.moonTargets[0].radius);
  await page.evaluate(() => {T.chooseMoon(T.view.moonTargets[0]);});
  await page.waitForTimeout(3000);
  const moonRadius = await page.evaluate(() => T.view.moonTargets.find(target => target.moon === T.view.moon).radius);
  report(moonRadius > planetRadius * 2.5, 'wybór księżyca przybliża go', `promień ${planetRadius.toFixed(0)} -> ${moonRadius.toFixed(0)} px`);

  report(errors.length === 0, 'brak błędów w konsoli', errors.slice(0, 3).join(' | '));
  await browser.close();
  console.log(failures.length ? `PORAŻKI: ${failures.length}` : 'WSZYSTKO OK');
  process.exit(failures.length ? 1 : 0);
})();
