/* ---------- zadania ---------- */

const activityOverlay = byId('activity');
const actCanvas = byId('actCanvas');
const actCtx = actCanvas.getContext('2d');
let activeActivity = null;
let activeItem = null;
let activeSlot = 0;

function makeLayer(width, height) {
 const layer = document.createElement('canvas');
 layer.width = width * ACT_SCALE;
 layer.height = height * ACT_SCALE;
 const layerCtx = layer.getContext('2d');
 layerCtx.setTransform(ACT_SCALE, 0, 0, ACT_SCALE, 0, 0);
 return {canvas: layer, ctx: layerCtx};
}

/* wykonane zadania (zapisywane w przeglądarce) */

const doneTasks = new Set();
try {
 JSON.parse(loadStored('kosmos3.tasks', '[]')).forEach(id => {
  if (knownIds.has(id)) doneTasks.add(id);
 });
} catch (error) {}

function taskKey(item, slot) { return slot ? `${item.id}#2` : item.id; }

function renderTaskbook() {
 byId('taskbook').textContent = `⭐ Zadania ${doneTasks.size} z ${TOTAL_TASKS}`;
}

function markTaskDone(id) {
 if (doneTasks.has(id)) return;
 doneTasks.add(id);
 saveStored('kosmos3.tasks', JSON.stringify([...doneTasks]));
 renderTaskbook();
}

function logActivity(text) {
 const line = document.createElement('p');
 line.textContent = text;
 const log = byId('actLog');
 log.insertBefore(line, log.firstChild);
 sayNow(text);
}

function finishActivity(text) {
 fxPlay('win');
 logActivity(text);
 if (activeItem) markTaskDone(taskKey(activeItem, activeSlot));
 byId('actDone').hidden = false;
}

function activityPoint(event) {
 const rect = actCanvas.getBoundingClientRect();
 return {
  x: (event.clientX - rect.left) * activeActivity.width / rect.width,
  y: (event.clientY - rect.top) * activeActivity.height / rect.height
 };
}

/* ---------- pomocnicze rysowanie ---------- */

function paintActStars(c, width, height, count) {
 c.fillStyle = '#05070f';
 c.fillRect(0, 0, width, height);
 c.fillStyle = '#fff';
 for (let i = 0; i < count; i++) {
  c.globalAlpha = .25 + Math.random() * .6;
  c.fillRect(Math.random() * width, Math.random() * height, 1.6, 1.6);
 }
 c.globalAlpha = 1;
}

/* zdjęcia całej tarczy (Ziemia, Księżyc) — to nie mapy, więc rysujemy je jak są */
const DISC_PHOTOS = {earth_photo: 1, moon_photo: 1, sun_photo: 1};

function drawActBall(c, key, cx, cy, radius, fallbackColor, rotation) {
 const photo = key && DISC_PHOTOS[key] ? imageOf(key) : null;
 const globe = key && !DISC_PHOTOS[key] ? globeOf(key, 256, 0, 'act') : null;
 if (photo) {
  c.save();
  c.beginPath();
  c.arc(cx, cy, radius, 0, TAU);
  c.clip();
  c.drawImage(photo, cx - radius * 1.02, cy - radius * 1.02, radius * 2.04, radius * 2.04);
  c.restore();
 } else if (globe) {
  globe.render(rotation || 0);
  c.save();
  c.beginPath();
  c.arc(cx, cy, radius, 0, TAU);
  c.clip();
  c.drawImage(globe.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
  c.restore();
 } else {
  const gradient = c.createRadialGradient(cx - radius * .35, cy - radius * .4, radius * .1, cx, cy, radius * 1.2);
  gradient.addColorStop(0, fallbackColor);
  gradient.addColorStop(1, '#070b16');
  c.fillStyle = gradient;
  c.beginPath();
  c.arc(cx, cy, radius, 0, TAU);
  c.fill();
 }
 const shade = c.createRadialGradient(cx - radius * .3, cy - radius * .3, radius * .1, cx, cy, radius * 1.1);
 shade.addColorStop(0, 'rgba(0,0,10,0)');
 shade.addColorStop(.7, 'rgba(0,0,10,.25)');
 shade.addColorStop(1, 'rgba(0,0,10,.6)');
 c.fillStyle = shade;
 c.beginPath();
 c.arc(cx, cy, radius, 0, TAU);
 c.fill();
}

const SATURN_BANDS = [{scale: 1.34, width: .2, color: 'rgba(150,128,96,.55)'}, {scale: 1.74, width: .46, color: 'rgba(222,200,150,.92)'}, {scale: 2.17, width: .26, color: 'rgba(190,168,124,.82)'}, {scale: 2.33, width: .03, color: 'rgba(210,190,150,.55)'}];
const URANUS_BANDS = [{scale: 1.55, width: .05, color: 'rgba(171,231,245,.55)'}, {scale: 1.78, width: .04, color: 'rgba(171,231,245,.4)'}];

function drawActRing(c, cx, cy, radius, angle, bands, half) {
 c.save();
 c.translate(cx, cy);
 c.rotate(angle);
 const start = half === 'back' ? Math.PI : 0;
 const ratio = .3;
 bands.forEach(band => {
  c.strokeStyle = band.color;
  c.lineWidth = Math.max(1.5, radius * band.width);
  c.beginPath();
  c.ellipse(0, 0, radius * band.scale, radius * band.scale * ratio, 0, start, start + Math.PI);
  c.stroke();
 });
 c.restore();
}

function strokeHit(cx, cy, rx, ry, rotation) {
 actCtx.strokeStyle = '#7ee787';
 actCtx.lineWidth = 4;
 actCtx.beginPath();
 actCtx.ellipse(cx, cy, rx, ry, rotation || 0, 0, TAU);
 actCtx.stroke();
}

/* ---------- silnik: latarka (Merkury, Pluton) ---------- */


/* ---------- silnik: wycieranie (Wenus, łazik) ---------- */


/* awaryjny łazik, gdyby zdjęcie Perseverance nie było dostępne */
function drawPerseveranceFallback(c, flat) {
 const fill = color => {c.fillStyle = flat ? '#000' : color;};
 c.lineCap = 'round';
 c.strokeStyle = flat ? '#000' : '#8a8a93';
 c.lineWidth = 9;
 [[150, 268, 215, 218], [280, 268, 280, 218], [410, 268, 345, 218]].forEach(([fromX, fromY, toX, toY]) => {
  c.beginPath();
  c.moveTo(fromX, fromY);
  c.lineTo(toX, toY);
  c.stroke();
 });
 for (const wheelX of [150, 280, 410]) {
  fill('#26262c');
  c.beginPath();
  c.arc(wheelX, 268, 32, 0, TAU);
  c.fill();
  if (!flat) {
   c.fillStyle = '#6d6d78';
   c.beginPath();
   c.arc(wheelX, 268, 14, 0, TAU);
   c.fill();
   c.strokeStyle = '#3b3b43';
   c.lineWidth = 3;
   for (let spoke = 0; spoke < 6; spoke++) {
    const spokeAngle = spoke * TAU / 6;
    c.beginPath();
    c.moveTo(wheelX + Math.cos(spokeAngle) * 14, 268 + Math.sin(spokeAngle) * 14);
    c.lineTo(wheelX + Math.cos(spokeAngle) * 30, 268 + Math.sin(spokeAngle) * 30);
    c.stroke();
   }
  }
 }
 fill('#cba84e');
 c.fillRect(185, 158, 190, 64);
 if (!flat) {
  c.strokeStyle = '#8e7430';
  c.lineWidth = 2;
  c.strokeRect(185, 158, 190, 64);
 }
 fill('#243a78');
 c.beginPath();
 c.moveTo(120, 162);
 c.lineTo(440, 162);
 c.lineTo(500, 124);
 c.lineTo(180, 124);
 c.closePath();
 c.fill();
 if (!flat) {
  c.strokeStyle = 'rgba(190,210,255,.55)';
  c.lineWidth = 1.5;
  for (let cell = 1; cell < 8; cell++) {
   c.beginPath();
   c.moveTo(120 + cell * 40, 162);
   c.lineTo(180 + cell * 40, 124);
   c.stroke();
  }
  c.beginPath();
  c.moveTo(150, 143);
  c.lineTo(470, 143);
  c.stroke();
 }
 fill('#9a9aa4');
 c.fillRect(300, 44, 10, 82);
 fill('#6e6e78');
 c.fillRect(283, 28, 44, 20);
 if (!flat) {
  c.fillStyle = '#111';
  c.beginPath();
  c.arc(293, 38, 6, 0, TAU);
  c.arc(317, 38, 6, 0, TAU);
  c.fill();
  c.fillStyle = '#7fd0ff';
  c.beginPath();
  c.arc(291, 36, 2, 0, TAU);
  c.arc(315, 36, 2, 0, TAU);
  c.fill();
 }
 fill('#d9d9df');
 c.beginPath();
 c.ellipse(222, 112, 24, 9, -.3, 0, TAU);
 c.fill();
 fill('#8a8a93');
 c.fillRect(220, 112, 4, 14);
 c.strokeStyle = flat ? '#000' : '#7d7d86';
 c.lineWidth = 7;
 c.beginPath();
 c.moveTo(375, 185);
 c.lineTo(420, 205);
 c.lineTo(445, 190);
 c.stroke();
}

/* ---------- pomocnicze: tekst, pytania wyboru, globus z punktami ---------- */

function wrapActText(c, text, x, y, maxWidth, lineHeight) {
 const words = text.split(' ');
 let line = '';
 let row = 0;
 words.forEach(word => {
  const test = line ? `${line} ${word}` : word;
  if (c.measureText(test).width > maxWidth && line) {
   c.fillText(line, x, y + row * lineHeight);
   line = word;
   row++;
  } else line = test;
 });
 if (line) c.fillText(line, x, y + row * lineHeight);
 return row + 1;
}

/* krótki quiz w płótnie zadania: pytanie + 3 duże przyciski z emoji */
function createActQuiz(config) {
 const {question, answers, correct, hints, width, height} = config;
 const wrong = new Set();
 const boxes = answers.map((answer, index) => ({x: width / 2 - 215 + index * 150, y: height - 138, w: 130, h: 104, index}));
 return {
  draw(c) {
   c.fillStyle = 'rgba(2,4,14,.82)';
   c.fillRect(0, 0, width, height);
   c.textAlign = 'center';
   c.fillStyle = '#ffe58a';
   c.font = '800 19px system-ui, sans-serif';
   wrapActText(c, question, width / 2, 52, width - 80, 26);
   boxes.forEach(box => {
    const bad = wrong.has(box.index);
    c.fillStyle = bad ? 'rgba(90,30,40,.7)' : 'rgba(30,60,120,.85)';
    c.strokeStyle = bad ? 'rgba(255,120,120,.6)' : 'rgba(143,184,232,.9)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.roundRect(box.x, box.y, box.w, box.h, 16);
    c.fill();
    c.stroke();
    c.fillStyle = '#fff';
    c.font = '34px system-ui, sans-serif';
    c.fillText(answers[box.index].emoji, box.x + box.w / 2, box.y + 46);
    c.font = '700 15px system-ui, sans-serif';
    c.fillText(answers[box.index].label, box.x + box.w / 2, box.y + 80);
   });
  },
  /* zwraca 'ok', 'bad' albo null (pudło) */
  tap(point) {
   const box = boxes.find(item => point.x >= item.x && point.x <= item.x + item.w && point.y >= item.y && point.y <= item.y + item.h);
   if (!box || wrong.has(box.index)) return null;
   if (box.index === correct) return 'ok';
   wrong.add(box.index);
   sayNow(hints[box.index] || 'Spróbuj jeszcze raz!');
   fxPlay('miss');
   return 'bad';
  }
 };
}

/* rzut punktu (długość, szerokość w stopniach) na tarczę globusa narysowanego bez nachylenia */
function globePoint(lonDeg, latDeg, rotation, cx, cy, radius) {
 const lon = lonDeg * Math.PI / 180 - rotation;
 const lat = latDeg * Math.PI / 180;
 return {
  x: cx + radius * Math.cos(lat) * Math.sin(lon),
  y: cy - radius * Math.sin(lat),
  depth: Math.cos(lat) * Math.cos(lon),
  squash: Math.max(.3, Math.abs(Math.cos(lon)))
 };
}

/* ---------- silnik: latarka (Merkury, Pluton) ----------
 * Trzeba oświetlić cel i przytrzymać światło chwilę (dwell), a nie tylko
 * przelecieć po nim palcem. Celów może być kilka. */

function createTorchActivity(config) {
 const {title, lead, width, height, paintScene, targets, doneText, torchRadius = 92, dwell = .55, hintAfter = 18} = config;
 const scene = makeLayer(width, height);
 paintScene(scene.ctx, width, height);
 let light = {x: width * .2, y: height * .3};
 let down = false;
 const progress = targets.map(() => 0);
 const found = targets.map(() => false);
 let finished = false;
 let sinceFind = 0;
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (!finished) {
   const beam = actCtx.createRadialGradient(light.x, light.y, 0, light.x, light.y, torchRadius);
   beam.addColorStop(0, 'rgba(2,3,10,0)');
   beam.addColorStop(.55, 'rgba(2,3,10,.3)');
   beam.addColorStop(1, 'rgba(2,3,10,.97)');
   actCtx.fillStyle = beam;
   actCtx.fillRect(0, 0, width, height);
  }
  targets.forEach((target, index) => {
   if (found[index] && target.mark) target.mark(actCtx);
  });
  /* podpowiedź: po dłuższej chwili miga mała gwiazdka przy szukanym celu */
  const pending = targets.findIndex((target, index) => !found[index] && target.center);
  if (!finished && sinceFind > hintAfter && pending >= 0) {
   const pulse = Math.sin(performance.now() * .006) * .5 + .5;
   actCtx.strokeStyle = `rgba(255,229,138,${.35 + .5 * pulse})`;
   actCtx.lineWidth = 3;
   actCtx.setLineDash([5, 6]);
   actCtx.beginPath();
   actCtx.arc(targets[pending].center.x, targets[pending].center.y, 26 + pulse * 6, 0, TAU);
   actCtx.stroke();
   actCtx.setLineDash([]);
  }
  actCtx.fillStyle = '#fff';
  actCtx.font = '800 16px system-ui, sans-serif';
  actCtx.textAlign = 'left';
  if (targets.length > 1) actCtx.fillText(`Znalezione: ${found.filter(Boolean).length} z ${targets.length}`, 14, 24);
  /* pierścień postępu: tyle, ile trzeba jeszcze poświecić */
  const best = Math.max(0, ...progress);
  if (!finished && down && best > .02) {
   actCtx.strokeStyle = 'rgba(255,229,138,.9)';
   actCtx.lineWidth = 4;
   actCtx.beginPath();
   actCtx.arc(light.x, light.y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, best / dwell));
   actCtx.stroke();
  }
 };
 const setLight = point => {light = point; render();};
 return {
  title, lead, width, height,
  start: render,
  onDown: point => {down = true; setLight(point);},
  onMove: point => {if (down) setLight(point);},
  onUp: () => {down = false;},
  frame: dt => {
   if (finished) return;
   sinceFind += dt;
   targets.forEach((target, index) => {
    if (found[index]) return;
    if (down && target.test(light)) progress[index] += dt;
    else progress[index] = Math.max(0, progress[index] - dt * 2);
    if (progress[index] >= dwell) {
     found[index] = true;
     sinceFind = 0;
     fxPlay('ok');
     if (found.every(Boolean)) {
      finished = true;
      render();
      finishActivity(doneText);
     } else {
      render();
      sayNow(target.foundText || 'Jest! Szukaj dalej.');
     }
    }
   });
   if (!finished) render();
  },
  repeatText: lead,
  debug: () => ({found: [...found], progress: [...progress], targets})
 };
}

/* ---------- silnik: wycieranie (Wenus, łazik) ---------- */

function createWipeActivity(config) {
 const {title, lead, width, height, paintScene, paintDust, doneText, doneRatio = .1, brush = 46} = config;
 const probe = config.probe || {x: 0, y: 0, w: width, h: height};
 const SAMPLE = 4;
 const scene = makeLayer(width, height);
 const dust = makeLayer(width, height);
 paintScene(scene.ctx, width, height);
 paintDust(dust.ctx, width, height);
 dust.ctx.globalCompositeOperation = 'source-over';
 const probeCanvas = document.createElement('canvas');
 probeCanvas.width = Math.max(1, Math.round(probe.w * ACT_SCALE / SAMPLE));
 probeCanvas.height = Math.max(1, Math.round(probe.h * ACT_SCALE / SAMPLE));
 const probeCtx = probeCanvas.getContext('2d', {willReadFrequently: true});
 /* ile pyłu zostało w obszarze kontrolnym (alfa liczona w zmniejszonym obrazie) */
 const dustAmount = () => {
  probeCtx.clearRect(0, 0, probeCanvas.width, probeCanvas.height);
  probeCtx.drawImage(dust.canvas, probe.x * ACT_SCALE, probe.y * ACT_SCALE, probe.w * ACT_SCALE, probe.h * ACT_SCALE, 0, 0, probeCanvas.width, probeCanvas.height);
  const data = probeCtx.getImageData(0, 0, probeCanvas.width, probeCanvas.height).data;
  let sum = 0;
  for (let i = 3; i < data.length; i += 4) sum += data[i];
  return sum / 255;
 };
 const initial = Math.max(1, dustAmount());
 let wiping = false;
 let lastPoint = null;
 let lastCheck = 0;
 let finished = false;
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  actCtx.drawImage(dust.canvas, 0, 0, width, height);
  if (!finished) {
   const left = Math.round(Math.min(1, dustAmount() / initial) * 100);
   actCtx.fillStyle = 'rgba(0,0,0,.5)';
   actCtx.fillRect(width - 128, 8, 120, 24);
   actCtx.fillStyle = '#fff';
   actCtx.font = '700 15px system-ui, sans-serif';
   actCtx.textAlign = 'center';
   actCtx.fillText(`Do wytarcia: ${left}%`, width - 68, 25);
  }
 };
 const wipe = point => {
  dust.ctx.save();
  dust.ctx.globalCompositeOperation = 'destination-out';
  dust.ctx.strokeStyle = '#000';
  dust.ctx.lineWidth = brush;
  dust.ctx.lineCap = 'round';
  dust.ctx.beginPath();
  dust.ctx.moveTo(lastPoint.x, lastPoint.y);
  dust.ctx.lineTo(point.x, point.y);
  dust.ctx.stroke();
  dust.ctx.restore();
  lastPoint = point;
  const now = performance.now();
  if (finished || now - lastCheck < 100) {render(); return;}
  lastCheck = now;
  if (dustAmount() < initial * doneRatio) {
   finished = true;
   dust.ctx.clearRect(0, 0, width, height);
   render();
   finishActivity(doneText);
  } else render();
 };
 return {
  title, lead, width, height,
  start: render,
  onDown: point => {wiping = true; lastPoint = point; wipe(point);},
  onMove: point => {if (wiping) wipe(point);},
  onUp: () => {wiping = false;},
  repeatText: lead
 };
}

/* ---------- silnik: polowanie na obracającym się globusie (Ceres, Jowisz) ----------
 * Cele mają prawdziwe współrzędne na mapie powierzchni, więc obracają się razem
 * z globusem i widać je tylko wtedy, gdy są po stronie widocznej. Po znalezieniu
 * wszystkich celów pojawia się krótkie pytanie sprawdzające. */

function createGlobeHuntActivity(config) {
 const {title, lead, textureKey, color, width = 560, height = 340, radius = 140, speed = -.28, startRotation = 0, targets, quiz, doneText, hintAfter = 14} = config;
 const cx = width / 2, cy = height / 2;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 90);
 let rotation = startRotation;
 let elapsed = 0;
 const found = targets.map(() => false);
 let phase = 'hunt';
 let quizBox = null;
 let finished = false;
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  drawActBall(actCtx, textureKey, cx, cy, radius, color, rotation);
  const pulse = Math.sin(elapsed * 5) * .5 + .5;
  targets.forEach((target, index) => {
   const point = globePoint(target.lon, target.lat, rotation, cx, cy, radius);
   if (point.depth < .15) return;
   if (found[index]) {
    strokeHit(point.x, point.y, target.rho * radius * point.squash + 6, target.rho * radius + 6, 0);
   } else if (elapsed > hintAfter && phase === 'hunt') {
    actCtx.strokeStyle = `rgba(255,217,90,${.25 + .5 * pulse})`;
    actCtx.lineWidth = 3;
    actCtx.setLineDash([6, 6]);
    actCtx.beginPath();
    actCtx.ellipse(point.x, point.y, target.rho * radius * point.squash + 10 + pulse * 4, target.rho * radius + 10 + pulse * 4, 0, 0, TAU);
    actCtx.stroke();
    actCtx.setLineDash([]);
   }
  });
  actCtx.fillStyle = 'rgba(0,0,0,.5)';
  actCtx.fillRect(8, 8, 150, 24);
  actCtx.fillStyle = '#fff';
  actCtx.font = '700 15px system-ui, sans-serif';
  actCtx.textAlign = 'left';
  actCtx.fillText(`Znalezione: ${found.filter(Boolean).length} z ${targets.length}`, 16, 25);
  if (phase === 'quiz' && quizBox) quizBox.draw(actCtx);
 };
 const finish = () => {
  finished = true;
  finishActivity(doneText);
 };
 const tap = point => {
  if (finished) return;
  if (phase === 'quiz') {
   const result = quizBox.tap(point);
   if (result === 'ok') {
    fxPlay('ok');
    render();
    finish();
   } else render();
   return;
  }
  let hit = -1;
  targets.forEach((target, index) => {
   if (found[index]) return;
   const spot = globePoint(target.lon, target.lat, rotation, cx, cy, radius);
   if (spot.depth < .15) return;
   const rx = target.rho * radius * spot.squash + 8;
   const ry = target.rho * radius + 8;
   if (((point.x - spot.x) / rx) ** 2 + ((point.y - spot.y) / ry) ** 2 <= 1) hit = index;
  });
  if (hit < 0) return;
  found[hit] = true;
  fxPlay('ok');
  const allFound = found.every(Boolean);
  if (allFound && quiz) {
   phase = 'quiz';
   quizBox = createActQuiz({...quiz, width, height});
   render();
   const labels = quiz.answers.map(answer => answer.label);
   sayNow(`${targets[hit].foundText} ${quiz.question} Do wyboru: ${labels.slice(0, -1).join(', ')} albo ${labels[labels.length - 1]}.`);
  } else if (allFound) {
   render();
   finish();
  } else {
   render();
   sayNow(targets[hit].foundText);
  }
 };
 return {
  title, lead, width, height,
  start: render,
  onDown: tap, onMove: () => {}, onUp: () => {},
  frame: dt => {
   if (finished) return;
   elapsed += dt;
   if (phase === 'hunt') rotation += speed * dt;
   render();
  },
  repeatText: lead,
  debug: () => ({rotation, phase, cx, cy, radius, targets, found: [...found]})
 };
}

/* ---------- zadania dla ciał niebieskich ---------- */

const SUN_PHOTO_SPOTS = [
 {x: .252, y: .76, r: .07, text: 'To wielka grupa plam! W środku jest ciemne jądro, a dookoła jaśniejszy brzeg.'},
 {x: .826, y: .383, r: .055, text: 'To druga duża plama.'},
 {x: .7, y: .306, r: .04, text: 'To mała plama.'},
 {x: .552, y: .319, r: .04, text: 'Kolejna mała plama!'},
 {x: .474, y: .509, r: .04, text: 'Jest i ta mała plama pośrodku.'},
 {x: .347, y: .36, r: .04, text: 'I jeszcze jedna mała plama.'}
];

function createSunspotsActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 150;
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 70);
 const photo = imageOf('sun_photo');
 if (photo) {
  scene.ctx.save();
  scene.ctx.beginPath();
  scene.ctx.arc(cx, cy, radius, 0, TAU);
  scene.ctx.clip();
  scene.ctx.drawImage(photo, cx - radius, cy - radius, radius * 2, radius * 2);
  scene.ctx.restore();
 } else {
  const sun = makeLayer(512, 512);
  paintSunSurface(sun.ctx, 512, false);
  scene.ctx.save();
  scene.ctx.beginPath();
  scene.ctx.arc(cx, cy, radius, 0, TAU);
  scene.ctx.clip();
  scene.ctx.drawImage(sun.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
  scene.ctx.restore();
 }
 /* plamy z prawdziwego zdjęcia tarczy Słońca (położenia jako ułamki obrazu) */
 const spots = SUN_PHOTO_SPOTS.map(spot => ({
  x: cx + (spot.x - .5) * radius * 2,
  y: cy + (spot.y - .5) * radius * 2,
  r: Math.max(18, spot.r * radius * 2),
  found: false,
  text: spot.text
 }));
 let done = false;
 let elapsed = 0;
 const lead = `Na Słońcu są ciemne plamy. Znajdź wszystkie ${spots.length}! Są różnej wielkości, więc dobrze się rozejrzyj.`;
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  const pulse = Math.sin(elapsed * 5) * .5 + .5;
  const next = spots.find(item => !item.found);
  spots.forEach(spot => {
   if (spot.found) strokeHit(spot.x, spot.y, spot.r, spot.r, 0);
   else if (elapsed > 15 && spot === next) {
    actCtx.strokeStyle = `rgba(255,229,138,${.25 + .5 * pulse})`;
    actCtx.lineWidth = 3;
    actCtx.beginPath();
    actCtx.arc(spot.x, spot.y, spot.r + 4 + pulse * 5, 0, TAU);
    actCtx.stroke();
   }
  });
  actCtx.fillStyle = 'rgba(0,0,0,.5)';
  actCtx.fillRect(8, 8, 150, 24);
  actCtx.fillStyle = '#fff';
  actCtx.font = '700 15px system-ui, sans-serif';
  actCtx.textAlign = 'left';
  actCtx.fillText(`Znalezione: ${spots.filter(item => item.found).length} z ${spots.length}`, 16, 25);
 };
 const tap = point => {
  if (done) return;
  const spot = spots.find(item => !item.found && Math.hypot(point.x - item.x, point.y - item.y) <= item.r);
  if (!spot) return;
  spot.found = true;
  fxPlay('ok');
  render();
  const foundCount = spots.filter(item => item.found).length;
  if (foundCount === spots.length) {
   done = true;
   finishActivity('Brawo, znalazłaś wszystkie plamy! To plamy słoneczne. Są chłodniejsze niż reszta Słońca — mają około trzech i pół tysiąca stopni, a reszta ponad pięć tysięcy — dlatego wyglądają ciemno. Największa plama jest większa od Ziemi!');
  } else {
   sayNow(`${spot.text} Zostało jeszcze ${spots.length - foundCount}.`);
  }
 };
 return {
  title: '☀️ Znajdź plamy na Słońcu', lead, width, height,
  start: render, onDown: tap, onMove: () => {}, onUp: () => {},
  frame: dt => {if (!done) {elapsed += dt; render();}},
  repeatText: lead, spots
 };
}

function createMercuryActivity() {
 const width = 560, height = 340, cx = 280, cy = 176, radius = 138;
 const ice = [
  {x: cx - radius * .2, y: cy - radius * .72, rx: radius * .2, ry: radius * .09, text: 'Jest! To lód w ciemnym kraterze. Szukaj drugiego.'},
  {x: cx + radius * .26, y: cy - radius * .62, rx: radius * .15, ry: radius * .075, text: 'Jest drugi!'}
 ];
 return createTorchActivity({
  title: '🔦 Znajdź lód na Merkurym',
  lead: 'Merkury jest bardzo ciemny. Zaświeć latarką i znajdź lód w kraterach przy biegunie. Przytrzymaj światło na lodzie, aż się zaświeci!',
  width, height,
  paintScene(c) {
   paintActStars(c, width, height, 90);
   drawActBall(c, 'mercury', cx, cy, radius, '#9b8d7a');
   ice.forEach(patch => {
    c.fillStyle = 'rgba(210,235,250,.9)';
    c.beginPath();
    c.ellipse(patch.x, patch.y, patch.rx, patch.ry, 0, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(120,170,215,.55)';
    c.beginPath();
    c.ellipse(patch.x, patch.y + patch.ry * .25, patch.rx * .7, patch.ry * .55, 0, 0, TAU);
    c.fill();
   });
  },
  targets: ice.map(patch => ({
   center: {x: patch.x, y: patch.y},
   test: point => ((point.x - patch.x) / (patch.rx * 2.2)) ** 2 + ((point.y - patch.y) / (patch.ry * 3.4)) ** 2 <= 1,
   mark: c => {c.strokeStyle = '#7ee787'; c.lineWidth = 4; c.beginPath(); c.ellipse(patch.x, patch.y, patch.rx + 8, patch.ry + 8, 0, 0, TAU); c.stroke();},
   foundText: patch.text
  })),
  doneText: 'Znalazłaś lód! W głębokich kraterach na biegunach Merkurego leży prawdziwy lód. Słońce tam nigdy nie zagląda, więc lód się nie topi. Znalazła go sonda MESSENGER.'
 });
}

function createVenusActivity() {
 const width = 560, height = 340;
 return createWipeActivity({
  title: '☁️ Zajrzyj pod chmury Wenus',
  lead: 'Wenus jest cała owinięta gęstymi chmurami. Przecieraj palcem, żeby zajrzeć pod spód — wytrzyj prawie cały obrazek!',
  width, height,
  paintScene(c) {
   const img = imageOf('venus_surface');
   if (img) {
    const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    c.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
   } else {
    const g = c.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#d9a44e');
    g.addColorStop(1, '#8a4a1e');
    c.fillStyle = g;
    c.fillRect(0, 0, width, height);
   }
  },
  paintDust(c) {
   const clouds = imageOf('venus_clouds');
   if (clouds) {
    const scale = Math.max(width / clouds.naturalWidth, height / clouds.naturalHeight);
    const dw = clouds.naturalWidth * scale, dh = clouds.naturalHeight * scale;
    c.drawImage(clouds, (width - dw) / 2, (height - dh) / 2, dw, dh);
   } else {
    c.fillStyle = 'rgba(240,218,150,.97)';
    c.fillRect(0, 0, width, height);
   }
  },
  doneRatio: .1,
  doneText: 'Świetnie! Pod chmurami Wenus jest gorąca, skalista powierzchnia z wulkanami. Chmury składają się z kwasu, więc sonda Magellan użyła radaru, żeby zajrzeć przez nie — dokładnie tak, jak Ty teraz!'
 });
}

function createRoverActivity() {
 const width = 560, height = 340;
 const roverRect = () => {
  const img = imageOf('perseverance');
  if (!img) return null;
  const scale = Math.min((width - 60) / img.naturalWidth, (height - 70) / img.naturalHeight);
  const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
  return {x: (width - dw) / 2, y: height - dh - 14, w: dw, h: dh};
 };
 const paintScene = c => {
  const sky = c.createLinearGradient(0, 0, 0, 215);
  sky.addColorStop(0, '#c98f6b');
  sky.addColorStop(1, '#efc19a');
  c.fillStyle = sky;
  c.fillRect(0, 0, width, 215);
  const ground = c.createLinearGradient(0, 215, 0, height);
  ground.addColorStop(0, '#b4603a');
  ground.addColorStop(1, '#7b3b22');
  c.fillStyle = ground;
  c.fillRect(0, 215, width, height - 215);
  c.fillStyle = 'rgba(70,30,15,.45)';
  [[60, 310, 26, 8], [500, 300, 34, 10], [90, 240, 14, 5], [470, 250, 18, 6]].forEach(([x, y, w, h]) => {
   c.beginPath();
   c.ellipse(x, y, w, h, 0, 0, TAU);
   c.fill();
  });
  const rect = roverRect();
  if (rect) c.drawImage(imageOf('perseverance'), rect.x, rect.y, rect.w, rect.h);
  else drawPerseveranceFallback(c, false);
 };
 const paintDust = c => {
  const rect = roverRect();
  if (rect) c.drawImage(imageOf('perseverance'), rect.x, rect.y, rect.w, rect.h);
  else drawPerseveranceFallback(c, true);
  c.globalCompositeOperation = 'source-in';
  c.fillStyle = 'rgba(176,100,60,.96)';
  c.fillRect(0, 0, width, height);
  c.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 700; i++) {
   c.fillStyle = i % 2 ? 'rgba(225,160,110,.35)' : 'rgba(110,55,30,.3)';
   c.beginPath();
   c.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 2.4, 0, TAU);
   c.fill();
  }
 };
 const rect = roverRect() || {x: 110, y: 28, w: 400, h: 280};
 return createWipeActivity({
  title: '🧹 Wyczyść łazika',
  lead: 'Łazik Perseverance jest cały pokryty marsjańskim pyłem. Przesuwaj palcem po łaziku, aż będzie czyściutki — nie zapomnij o kołach i kamerze!',
  width, height,
  paintScene, paintDust,
  probe: {x: rect.x, y: rect.y, w: rect.w, h: rect.h},
  brush: 40,
  doneRatio: .08,
  doneText: 'Czyściutko! Pył na Marsie jest wszędzie i osiada na kamerach oraz narzędziach łazika. Na szczęście marsjański wiatr czasem sam go zdmuchuje. Małe wiry, zwane diabłami pyłowymi, czyściły nawet panele słoneczne starszych łazików — Spirita i Opportunity.'
 });
}

function createCeresActivity() {
 return createGlobeHuntActivity({
  title: '✨ Znajdź jasne plamy na Ceres',
  lead: 'Ceres się obraca. Na jej powierzchni świecą tajemnicze, bardzo jasne plamy. Dotknij ich, kiedy się pokażą!',
  textureKey: 'ceres', color: '#9a948c', radius: 140, speed: -.3, startRotation: 1.5,
  targets: [{lon: -119.5, lat: 20, rho: .17, foundText: 'Jest! To krater Occator z jasnymi plamami.'}],
  quiz: {
   question: 'Z czego są te jasne plamy?',
   answers: [{emoji: '🧂', label: 'Z soli'}, {emoji: '🍬', label: 'Z cukru'}, {emoji: '🔦', label: 'Z latarek'}],
   correct: 0,
   hints: ['', 'Cukier nie leży na Ceres! To coś, co zostaje po wyschnięciu słonej wody.', 'Nikt tam nie zostawił latarek! To coś, co zostaje po wyschnięciu słonej wody.']
  },
  doneText: 'Tak, to sól! Jasne plamy w kraterze Occator zostały po wyschnięciu słonej wody. Odkryła je sonda Dawn. Pod powierzchnią Ceres może być nawet słony ocean!'
 });
}

function createJupiterActivity() {
 return createGlobeHuntActivity({
  title: '🔴 Znajdź Wielką Czerwoną Plamę',
  lead: 'Jowisz kręci się bardzo szybko. Gdzieś na nim szaleje wielka, czerwona burza. Znajdź ją i dotknij!',
  textureKey: 'jupiter', color: '#d5b18a', radius: 142, speed: -.42, startRotation: 2.4,
  targets: [{lon: -48, lat: -21, rho: .2, foundText: 'Jest! To Wielka Czerwona Plama.'}],
  quiz: {
   question: 'Ta burza jest ogromna. Jak duża jest Wielka Czerwona Plama?',
   answers: [{emoji: '🏙️', label: 'Jak miasto'}, {emoji: '🌍', label: 'Jak Ziemia'}, {emoji: '🏠', label: 'Jak dom'}],
   correct: 1,
   hints: ['Dużo, dużo większa! Zmieściłaby się w niej cała planeta, na której mieszkamy.', '', 'Dużo, dużo większa! Zmieściłaby się w niej cała planeta, na której mieszkamy.']
  },
  doneText: 'Tak! Wielka Czerwona Plama to burza wielka jak cała Ziemia. Ludzie obserwują ją od ponad 150 lat, a wiatr w jej środku wieje szybciej niż w najsilniejszym huraganie.'
 });
}

function createSaturnActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 84;
 const angle = -.3;
 const ratio = .3;
 const need = 3;
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 80);
 drawActRing(scene.ctx, cx, cy, radius, angle, SATURN_BANDS, 'back');
 drawActBall(scene.ctx, 'saturn', cx, cy, radius, '#d9bd83');
 drawActRing(scene.ctx, cx, cy, radius, angle, SATURN_BANDS, 'front');
 let seed = 7;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 /* kawałki lodu krążą po orbitach — bliżej Saturna szybciej (prawo Keplera) */
 const makeChunk = zone => {
  const scale = zone === 'inner' ? 1.3 + random() * .3 : zone === 'outer' ? 2.0 + random() * .3 : 1.65 + random() * .3;
  return {
   zone, scale, phase: random() * TAU, speed: .9 / Math.pow(scale, 1.5),
   size: 5 + random() * 5, shape: Array.from({length: 7}, () => .7 + random() * .5),
   tint: random() < .5 ? '#f2f6fb' : '#cdb7a0'
  };
 };
 const chunks = [];
 for (let i = 0; i < 10; i++) chunks.push(makeChunk('inner'));
 for (let i = 0; i < 12; i++) chunks.push(makeChunk('outer'));
 for (let i = 0; i < 8; i++) chunks.push(makeChunk('mid'));
 const caught = {inner: 0, outer: 0};
 let done = false;
 let time = 0;
 const lead = 'Pierścienie Saturna to miliardy kawałków lodu, które krążą wokół planety. Złap 3 kawałki blisko Saturna i 3 kawałki daleko od niego!';
 const position = chunk => {
  const a = chunk.phase + time * chunk.speed;
  const ex = Math.cos(a) * radius * chunk.scale;
  const ey = Math.sin(a) * radius * chunk.scale * ratio;
  return {
   x: cx + ex * Math.cos(angle) - ey * Math.sin(angle),
   y: cy + ex * Math.sin(angle) + ey * Math.cos(angle),
   back: Math.sin(a) < 0
  };
 };
 const hidden = (chunk, pos) => pos.back && Math.hypot(pos.x - cx, pos.y - cy) < radius;
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  chunks.forEach(chunk => {
   const pos = position(chunk);
   if (hidden(chunk, pos)) return;
   actCtx.save();
   actCtx.translate(pos.x, pos.y);
   actCtx.fillStyle = chunk.tint;
   actCtx.beginPath();
   chunk.shape.forEach((factor, index) => {
    const a = index / chunk.shape.length * TAU;
    const px = Math.cos(a) * chunk.size * factor;
    const py = Math.sin(a) * chunk.size * factor;
    if (index === 0) actCtx.moveTo(px, py);
    else actCtx.lineTo(px, py);
   });
   actCtx.closePath();
   actCtx.fill();
   actCtx.strokeStyle = 'rgba(40,50,70,.55)';
   actCtx.lineWidth = 1;
   actCtx.stroke();
   actCtx.restore();
  });
  actCtx.font = '800 16px system-ui, sans-serif';
  actCtx.textAlign = 'left';
  actCtx.fillStyle = caught.inner >= need ? '#7ee787' : '#ffe58a';
  actCtx.fillText(`Blisko Saturna: ${caught.inner} z ${need}`, 14, 26);
  actCtx.fillStyle = caught.outer >= need ? '#7ee787' : '#ffe58a';
  actCtx.fillText(`Daleko od Saturna: ${caught.outer} z ${need}`, 14, 46);
 };
 const tap = point => {
  if (done) return;
  let best = null;
  let bestDistance = Infinity;
  chunks.forEach(chunk => {
   const pos = position(chunk);
   if (hidden(chunk, pos)) return;
   const distance = Math.hypot(point.x - pos.x, point.y - pos.y);
   if (distance <= chunk.size + 13 && distance < bestDistance) {best = chunk; bestDistance = distance;}
  });
  if (!best) return;
  if (best.zone === 'mid' || caught[best.zone] >= need) {
   fxPlay('miss');
   sayNow(best.zone === 'mid' ? 'To kawałek ze środka pierścieni. Szukaj takiego tuż przy Saturnie albo bardzo daleko od niego.' : 'Tych już masz dość. Poszukaj kawałków z drugiej strony.');
   return;
  }
  caught[best.zone]++;
  fxPlay('ok');
  const index = chunks.indexOf(best);
  chunks[index] = makeChunk(best.zone);
  render();
  if (caught.inner >= need && caught.outer >= need) {
   done = true;
   finishActivity('Świetnie! Złapałaś kawałki lodu z dwóch stron pierścieni. Widziałaś, że te blisko Saturna pędzą szybciej, a te daleko płyną wolno? Pierścienie są ogromne, ale mają tylko około dziesięciu metrów grubości!');
  } else if (caught.inner === need) sayNow('Masz już trzy z bliska! Teraz złap trzy z daleka.');
  else if (caught.outer === need) sayNow('Masz już trzy z daleka! Teraz złap trzy z bliska.');
  else sayNow('Złapany! To kawałek lodu.');
 };
 return {
  title: '💍 Złap kawałki pierścieni Saturna', lead, width, height,
  start: render, onDown: tap, onMove: () => {}, onUp: () => {},
  frame: dt => {if (!done) {time += dt; render();}},
  repeatText: lead, chunks, caught, need,
  debug: () => chunks.map(chunk => ({...position(chunk), zone: chunk.zone, hidden: hidden(chunk, position(chunk))}))
 };
}

/* slalom przez pas planetoid: skały są daleko od siebie, ale się ruszają */
function createBeltActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 100);
 let seed = 99;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 const rocks = Array.from({length: 13}, () => {
  const angle = random() * TAU;
  const speed = 14 + random() * 26;
  return {
   x: 90 + random() * (width - 180), y: 20 + random() * (height - 40),
   r: 9 + random() * 11, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
   shape: Array.from({length: 9}, () => .8 + random() * .35), spin: random() * TAU
  };
 });
 const start = {x: 26, y: height / 2};
 const probe = {x: start.x, y: start.y};
 let target = null;
 let hits = 0;
 let done = false;
 let slow = 1;
 let shield = 0;
 const lead = 'Pas planetoid to miliony skał, które krążą między Marsem a Jowiszem. Poprowadź sondę palcem z lewej strony na prawą — nie uderz w żadną skałę!';
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.fillStyle = 'rgba(80,220,120,.16)';
  actCtx.fillRect(width - 36, 0, 36, height);
  actCtx.fillStyle = 'rgba(80,140,255,.16)';
  actCtx.fillRect(0, 0, 36, height);
  actCtx.font = '800 12px system-ui, sans-serif';
  actCtx.fillStyle = '#9fe8b0';
  actCtx.textAlign = 'right';
  actCtx.fillText('META', width - 4, 20);
  actCtx.fillStyle = '#9fc4ff';
  actCtx.textAlign = 'left';
  actCtx.fillText('START', 4, 20);
  rocks.forEach(rock => {
   actCtx.save();
   actCtx.translate(rock.x, rock.y);
   actCtx.rotate(rock.spin);
   actCtx.fillStyle = '#8d8781';
   actCtx.beginPath();
   rock.shape.forEach((factor, index) => {
    const a = index / rock.shape.length * TAU;
    const px = Math.cos(a) * rock.r * factor;
    const py = Math.sin(a) * rock.r * factor;
    if (index === 0) actCtx.moveTo(px, py);
    else actCtx.lineTo(px, py);
   });
   actCtx.closePath();
   actCtx.fill();
   actCtx.fillStyle = 'rgba(255,255,255,.16)';
   actCtx.beginPath();
   actCtx.arc(-rock.r * .25, -rock.r * .25, rock.r * .45, 0, TAU);
   actCtx.fill();
   actCtx.restore();
  });
  if (!shield || Math.floor(shield * 8) % 2) {
   const glowRing = actCtx.createRadialGradient(probe.x, probe.y, 2, probe.x, probe.y, 26);
   glowRing.addColorStop(0, 'rgba(255,229,138,.55)');
   glowRing.addColorStop(1, 'rgba(255,229,138,0)');
   actCtx.fillStyle = glowRing;
   actCtx.beginPath();
   actCtx.arc(probe.x, probe.y, 26, 0, TAU);
   actCtx.fill();
   actCtx.fillStyle = '#3b6fd8';
   actCtx.fillRect(probe.x - 17, probe.y - 4, 11, 8);
   actCtx.fillRect(probe.x + 6, probe.y - 4, 11, 8);
   actCtx.fillStyle = '#e4c77a';
   actCtx.fillRect(probe.x - 6, probe.y - 6, 12, 12);
   actCtx.fillStyle = '#fff';
   actCtx.fillRect(probe.x - 2, probe.y - 2, 4, 4);
  }
 };
 const crash = () => {
  hits++;
  fxPlay('miss');
  /* odbicie w tył i chwila ochrony, zamiast powrotu na start */
  probe.x = Math.max(start.x, probe.x - 90);
  shield = 1.6;
  if (hits >= 2) slow = Math.max(.35, slow * .75);
  sayNow(hits === 1 ? 'Ups! Skała cię odepchnęła. Nic się nie stało, leć dalej i omijaj skały.' : 'Znowu skała! Skały zwolniły, spróbuj jeszcze raz.');
 };
 return {
  title: '🪨 Przeleć przez pas planetoid', lead, width, height,
  start: render,
  onDown: point => {target = point;},
  onMove: point => {if (target) target = point;},
  onUp: () => {target = null;},
  frame: dt => {
   if (done) return;
   rocks.forEach(rock => {
    rock.x += rock.vx * dt * slow;
    rock.y += rock.vy * dt * slow;
    rock.spin += dt * .3;
    if (rock.x < 60 || rock.x > width - 60) rock.vx *= -1;
    if (rock.y < rock.r || rock.y > height - rock.r) rock.vy *= -1;
    rock.x = clamp(rock.x, 56, width - 56);
    rock.y = clamp(rock.y, rock.r, height - rock.r);
   });
   if (target) {
    const dx = target.x - probe.x, dy = target.y - probe.y;
    const distance = Math.hypot(dx, dy);
    const step = Math.min(distance, 200 * dt);
    if (distance > 1) {
     probe.x += dx / distance * step;
     probe.y += dy / distance * step;
    }
   }
   shield = Math.max(0, shield - dt);
   if (!shield && rocks.some(rock => Math.hypot(rock.x - probe.x, rock.y - probe.y) < rock.r * .9 + 6)) crash();
   if (probe.x >= width - 34) {
    done = true;
    render();
    finishActivity('Udało się! Przeleciałaś przez cały pas planetoid. Widzisz, ile jest wolnego miejsca? Skały są od siebie bardzo daleko, dlatego sondy bez trudu przelatują przez pas planetoid.');
    return;
   }
   render();
  },
  repeatText: lead, rocks, probe
 };
}

function createUranusActivity() {
 const width = 560, height = 340, cx = 340, cy = 170, radius = 92;
 const sun = {x: 46, y: 170};
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 90);
 /* Słońce po lewej i promień światła w stronę Urana */
 const glow = bg.ctx.createRadialGradient(sun.x, sun.y, 4, sun.x, sun.y, 120);
 glow.addColorStop(0, 'rgba(255,200,90,.95)');
 glow.addColorStop(.35, 'rgba(255,160,50,.4)');
 glow.addColorStop(1, 'rgba(255,160,50,0)');
 bg.ctx.fillStyle = glow;
 bg.ctx.beginPath();
 bg.ctx.arc(sun.x, sun.y, 120, 0, TAU);
 bg.ctx.fill();
 bg.ctx.fillStyle = '#ffd25a';
 bg.ctx.beginPath();
 bg.ctx.arc(sun.x, sun.y, 26, 0, TAU);
 bg.ctx.fill();
 bg.ctx.strokeStyle = 'rgba(255,215,120,.25)';
 bg.ctx.lineWidth = 2;
 bg.ctx.setLineDash([3, 8]);
 bg.ctx.beginPath();
 bg.ctx.moveTo(sun.x + 30, sun.y);
 bg.ctx.lineTo(cx - radius * 1.8, cy);
 bg.ctx.stroke();
 bg.ctx.setLineDash([]);
 bg.ctx.fillStyle = '#ffe9a8';
 bg.ctx.font = '800 16px system-ui, sans-serif';
 bg.ctx.textAlign = 'center';
 bg.ctx.fillText('Słońce', sun.x, sun.y + 48);
 const target = -1.71;          /* oś Urana jest pochylona o około 98° */
 const globe = globeOf('uranus', 256, 0, 'act');
 if (globe) globe.render(0);
 let tilt = 0;                  /* obrót osi względem pionu */
 let dragging = false;
 let hold = 0;
 let done = false;
 let elapsed = 0;
 const lead = 'Uran leży na boku! Obróć go palcem tak, żeby jego biegun, czyli koniec osi, patrzył prosto na Słońce po lewej stronie.';
 const normalize = value => {
  let result = value;
  while (result > Math.PI) result -= TAU;
  while (result <= -Math.PI) result += TAU;
  return result;
 };
 /* oś pozioma (biegun do Słońca albo od Słońca) mieści się w tolerancji */
 const aligned = () => Math.abs(Math.abs(normalize(tilt)) - Math.abs(target)) < .2;
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  drawActRing(actCtx, cx, cy, radius, tilt, URANUS_BANDS, 'back');
  actCtx.save();
  actCtx.translate(cx, cy);
  actCtx.rotate(tilt);
   actCtx.beginPath();
  actCtx.arc(0, 0, radius, 0, TAU);
  actCtx.clip();
  if (globe) {
   actCtx.drawImage(globe.canvas, -radius, -radius, radius * 2, radius * 2);
  } else {
   const gradient = actCtx.createRadialGradient(-radius * .35, -radius * .4, radius * .1, 0, 0, radius * 1.2);
   gradient.addColorStop(0, '#7ed9e5');
   gradient.addColorStop(1, '#070b16');
   actCtx.fillStyle = gradient;
   actCtx.fillRect(-radius, -radius, radius * 2, radius * 2);
  }
  actCtx.restore();
  const shade = actCtx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  shade.addColorStop(0, 'rgba(0,0,10,0)');
  shade.addColorStop(.55, 'rgba(0,0,10,.3)');
  shade.addColorStop(1, 'rgba(0,0,10,.75)');
  actCtx.fillStyle = shade;
  actCtx.beginPath();
  actCtx.arc(cx, cy, radius, 0, TAU);
  actCtx.fill();
  drawActRing(actCtx, cx, cy, radius, tilt, URANUS_BANDS, 'front');
  /* oś obrotu z kropkami na biegunach */
  actCtx.save();
  actCtx.translate(cx, cy);
  actCtx.rotate(tilt);
  actCtx.strokeStyle = aligned() ? '#7ee787' : 'rgba(255,255,255,.7)';
  actCtx.lineWidth = 3;
  actCtx.beginPath();
  actCtx.moveTo(0, -radius * 1.45);
  actCtx.lineTo(0, radius * 1.45);
  actCtx.stroke();
  actCtx.fillStyle = aligned() ? '#7ee787' : '#ffe58a';
  actCtx.beginPath();
  actCtx.arc(0, -radius * 1.45, 8, 0, TAU);
  actCtx.fill();
  actCtx.beginPath();
  actCtx.arc(0, radius * 1.45, 8, 0, TAU);
  actCtx.fill();
  actCtx.restore();
  if (!done && !dragging) {
   actCtx.fillStyle = 'rgba(255,255,255,.7)';
   actCtx.font = '700 15px system-ui, sans-serif';
   actCtx.textAlign = 'center';
   actCtx.fillText('Przeciągnij kropkę na biegunie', cx, height - 14);
  }
  if (done) strokeHit(cx, cy, radius + 14, radius + 14, 0);
 };
 const setFrom = point => {
  const angle = Math.atan2(point.y - cy, point.x - cx);
  tilt = normalize(angle + Math.PI / 2);
  render();
 };
 const finish = () => {
  done = true;
  tilt = Math.sign(normalize(tilt) || -1) * Math.abs(target);
  render();
  finishActivity('Uran leży na boku! Jego oś jest pochylona prawie jak stół. Przez to jeden biegun przez 42 lata dostaje światło, a potem 42 lata siedzi w ciemności. Naukowcy myślą, że dawno temu uderzyło w niego coś wielkiego i go przewróciło.');
 };
 return {
  title: '🌀 Przewróć Urana na bok',
  lead, width, height,
  start: render,
  onDown: point => {dragging = true; setFrom(point);},
  onMove: point => {if (dragging && !done) setFrom(point);},
  onUp: () => {dragging = false;},
  frame: dt => {
   elapsed += dt;
   if (done) {
    tilt = Math.sign(tilt || -1) * (Math.abs(target) + Math.sin(elapsed * 2) * .03);
    render();
    return;
   }
   if (dragging && aligned()) hold += dt;
   else hold = 0;
   if (hold > .6) {finish(); return;}
   render();
  },
  repeatText: lead
 };
}

/* wesoły Tryton: okrągła buzia z rękami i nogami, które machają, i wystawionym językiem */
function drawTritonKid(x, y, radius, time) {
 const wave = Math.sin(time * .012);
 const wave2 = Math.sin(time * .012 + Math.PI);
 actCtx.save();
 actCtx.translate(x, y);
 actCtx.rotate(Math.sin(time * .006) * .12);
 actCtx.strokeStyle = '#f6dce8';
 actCtx.lineWidth = Math.max(3, radius * .22);
 actCtx.lineCap = 'round';
 /* ręce */
 [[-1, wave], [1, wave2]].forEach(([side, swing]) => {
  const handX = side * radius * (1.55 + .15 * swing);
  const handY = -radius * (.55 + .8 * swing);
  actCtx.beginPath();
  actCtx.moveTo(side * radius * .85, radius * .1);
  actCtx.lineTo(handX, handY);
  actCtx.stroke();
  actCtx.fillStyle = '#fff1f6';
  actCtx.beginPath();
  actCtx.arc(handX, handY, radius * .26, 0, TAU);
  actCtx.fill();
 });
 /* nogi */
 [[-1, wave2], [1, wave]].forEach(([side, swing]) => {
  const footX = side * radius * (.55 + .25 * swing);
  const footY = radius * (1.65 + .15 * swing);
  actCtx.beginPath();
  actCtx.moveTo(side * radius * .4, radius * .85);
  actCtx.lineTo(footX, footY);
  actCtx.stroke();
  actCtx.fillStyle = '#d98aa8';
  actCtx.beginPath();
  actCtx.ellipse(footX + side * radius * .12, footY + radius * .08, radius * .3, radius * .16, 0, 0, TAU);
  actCtx.fill();
 });
 /* głowa */
 const skin = actCtx.createRadialGradient(-radius * .3, -radius * .35, radius * .1, 0, 0, radius * 1.1);
 skin.addColorStop(0, '#fff6fa');
 skin.addColorStop(1, '#e7c3d3');
 actCtx.fillStyle = skin;
 actCtx.beginPath();
 actCtx.arc(0, 0, radius, 0, TAU);
 actCtx.fill();
 actCtx.strokeStyle = 'rgba(120,60,90,.45)';
 actCtx.lineWidth = 2;
 actCtx.stroke();
 /* oczy */
 [-1, 1].forEach(side => {
  actCtx.fillStyle = '#fff';
  actCtx.beginPath();
  actCtx.ellipse(side * radius * .36, -radius * .22, radius * .22, radius * .26, 0, 0, TAU);
  actCtx.fill();
  actCtx.strokeStyle = 'rgba(60,30,50,.6)';
  actCtx.lineWidth = 1.5;
  actCtx.stroke();
  actCtx.fillStyle = '#2a1a2a';
  actCtx.beginPath();
  actCtx.arc(side * radius * .36 + wave * radius * .05, -radius * .2, radius * .11, 0, TAU);
  actCtx.fill();
 });
 /* zadowolone rumieńce */
 actCtx.fillStyle = 'rgba(255,120,150,.45)';
 [-1, 1].forEach(side => {
  actCtx.beginPath();
  actCtx.ellipse(side * radius * .62, radius * .12, radius * .15, radius * .09, 0, 0, TAU);
  actCtx.fill();
 });
 /* buzia roześmiana i język */
 actCtx.fillStyle = '#7a1f3d';
 actCtx.beginPath();
 actCtx.arc(0, radius * .22, radius * .42, 0, Math.PI);
 actCtx.closePath();
 actCtx.fill();
 const tongue = radius * (.3 + .06 * Math.sin(time * .02));
 actCtx.fillStyle = '#ff6f9c';
 actCtx.beginPath();
 actCtx.ellipse(radius * .1, radius * .5, radius * .17, tongue, 0, 0, TAU);
 actCtx.fill();
 actCtx.strokeStyle = 'rgba(160,30,80,.55)';
 actCtx.lineWidth = 1.5;
 actCtx.beginPath();
 actCtx.moveTo(radius * .1, radius * .48);
 actCtx.lineTo(radius * .1, radius * .48 + tongue * .8);
 actCtx.stroke();
 actCtx.restore();
}

function createNeptuneActivity() {
 const width = 560, height = 340, cx = 280, cy = 172, radius = 70;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 80);
 const planetLayer = makeLayer(width, height);
 drawActBall(planetLayer.ctx, 'neptune', cx, cy, radius, '#356ce0');
 const orbitX = 205, orbitY = 100;
 const tritonRadius = 26;
 const speed = .00055;
 let caught = false;
 let started = performance.now();
 let lastTalk = 0;
 let lastHint = 0;
 let missed = 0;
 const lead = 'Wokół Neptuna krąży wesoły księżyc Tryton. Znajdź kulkę, która macha rękami i nogami i pokazuje język, i dotknij jej! Po niebie przelatują komety, ale to nie one.';
 /* Tryton krąży w przeciwną stronę niż Neptun się obraca — kąt maleje */
 const tritonAt = now => {
  const angle = -(now - started) * speed + 1.2;
  return {x: cx + Math.cos(angle) * orbitX, y: cy + Math.sin(angle) * orbitY, behind: Math.sin(angle) < 0};
 };
 const hiddenBehind = (point, behind) => behind && Math.hypot(point.x - cx, point.y - cy) < radius + 2;
 /* małe księżyce, które nie są Trytonem */
 const decoys = [
  {name: 'Proteusz', r: 5, orbit: 1.35, speed: .0009, phase: 2.4, color: '#9fb0be'},
  {name: 'Nereida', r: 4, orbit: 2.45, speed: .0005, phase: 5.1, color: '#8d99a8'}
 ];
 const decoyPos = (decoy, now) => ({
  x: cx + Math.cos(now * decoy.speed + decoy.phase) * radius * decoy.orbit * 1.1,
  y: cy + Math.sin(now * decoy.speed + decoy.phase) * radius * decoy.orbit * .55
 });
 /* komety przelatujące przez scenę */
 const comets = [];
 let nextComet = 1200;
 const spawnComet = now => {
  const fromLeft = Math.random() < .5;
  const y = 30 + Math.random() * (height - 60);
  const slope = (Math.random() - .5) * 90;
  const velocity = 110 + Math.random() * 90;
  comets.push({x: fromLeft ? -30 : width + 30, y, vx: fromLeft ? velocity : -velocity, vy: slope, r: 7 + Math.random() * 4});
  nextComet = now + 1500 + Math.random() * 1600;
 };
 const drawComet = comet => {
  const length = 70;
  const norm = Math.hypot(comet.vx, comet.vy);
  const tx = comet.x - comet.vx / norm * length, ty = comet.y - comet.vy / norm * length;
  const tail = actCtx.createLinearGradient(comet.x, comet.y, tx, ty);
  tail.addColorStop(0, 'rgba(190,235,255,.85)');
  tail.addColorStop(1, 'rgba(190,235,255,0)');
  actCtx.strokeStyle = tail;
  actCtx.lineWidth = comet.r * 1.6;
  actCtx.lineCap = 'round';
  actCtx.beginPath();
  actCtx.moveTo(comet.x, comet.y);
  actCtx.lineTo(tx, ty);
  actCtx.stroke();
  actCtx.fillStyle = '#eaf6ff';
  actCtx.beginPath();
  actCtx.arc(comet.x, comet.y, comet.r, 0, TAU);
  actCtx.fill();
 };
 const drawMoonDot = (mx, my, r, color) => {
  actCtx.fillStyle = color;
  actCtx.beginPath();
  actCtx.arc(mx, my, r, 0, TAU);
  actCtx.fill();
  actCtx.fillStyle = 'rgba(0,0,20,.25)';
  actCtx.beginPath();
  actCtx.arc(mx + r * .25, my + r * .25, r * .7, 0, TAU);
  actCtx.fill();
 };
 const render = now => {
  const t = now === undefined ? performance.now() : now;
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(255,217,90,.3)';
  actCtx.lineWidth = 1.5;
  actCtx.setLineDash([4, 7]);
  actCtx.beginPath();
  actCtx.ellipse(cx, cy, orbitX, orbitY, 0, 0, TAU);
  actCtx.stroke();
  actCtx.setLineDash([]);
  const triton = tritonAt(t);
  if (triton.behind) drawTritonKid(triton.x, triton.y, tritonRadius, t);
  actCtx.drawImage(planetLayer.canvas, 0, 0, width, height);
  decoys.forEach(decoy => {
   const pos = decoyPos(decoy, t);
   drawMoonDot(pos.x, pos.y, decoy.r, decoy.color);
  });
  if (!triton.behind) drawTritonKid(triton.x, triton.y, tritonRadius, t);
  comets.forEach(drawComet);
  /* po dłuższej chwili bez trafienia — pulsująca obręcz wokół Trytona */
  if (!caught && t - started > 14000 && !hiddenBehind(triton, triton.behind)) {
   const pulse = Math.sin(t * .006) * .5 + .5;
   actCtx.strokeStyle = `rgba(255,217,90,${.5 + .4 * pulse})`;
   actCtx.lineWidth = 3;
   actCtx.beginPath();
   actCtx.arc(triton.x, triton.y, tritonRadius * 2 + pulse * 5, 0, TAU);
   actCtx.stroke();
  }
  if (caught) strokeHit(triton.x, triton.y, tritonRadius * 2, tritonRadius * 2, 0);
 };
 const talk = (text, t) => {
  if (t - lastTalk < 5000) return;
  lastTalk = t;
  sayNow(text);
 };
 const tap = point => {
  if (caught) return;
  const t = performance.now();
  const triton = tritonAt(t);
  if (!hiddenBehind(triton, triton.behind) && Math.hypot(point.x - triton.x, point.y - (triton.y + tritonRadius * .3)) <= tritonRadius * 2.1) {
   caught = true;
   fxPlay('ok');
   render(t);
   finishActivity('Złapałaś Trytona! To największy księżyc Neptuna. Krąży w przeciwną stronę, niż Neptun się obraca. Jest tam strasznie zimno, a mimo to Tryton ma gejzery, które wyrzucają w górę lodowy pył. I jak się śmiał!');
   return;
  }
  for (const comet of comets) {
   if (Math.hypot(point.x - comet.x, point.y - comet.y) <= comet.r + 20) {
    fxPlay('miss');
    talk('To kometa! Ona tylko przelatuje. Szukaj kulki, która macha rękami i pokazuje język.', t);
    return;
   }
  }
  for (const decoy of decoys) {
   const pos = decoyPos(decoy, t);
   if (Math.hypot(point.x - pos.x, point.y - pos.y) <= decoy.r + 16) {
    missed++;
    fxPlay('miss');
    talk(`To mały księżyc ${decoy.name}. Tryton jest większy i się śmieje!`, t);
    return;
   }
  }
 };
 return {
  title: '🎯 Złap wesołego Trytona',
  lead, width, height,
  start: () => {started = performance.now(); nextComet = started + 1200; render(started);},
  onDown: tap, onMove: () => {}, onUp: () => {},
  frame: (dt, now) => {
   if (now >= nextComet) spawnComet(now);
   comets.forEach(comet => {comet.x += comet.vx * dt; comet.y += comet.vy * dt;});
   for (let index = comets.length - 1; index >= 0; index--) {
    if (comets[index].x < -60 || comets[index].x > width + 60 || comets[index].y < -60 || comets[index].y > height + 60) comets.splice(index, 1);
   }
   render(now);
  },
  repeatText: lead,
  debug: () => {const triton = tritonAt(performance.now()); return {x: triton.x, y: triton.y + tritonRadius * .3, behind: hiddenBehind(triton, triton.behind), comets: comets.length};}
 };
}

function createHeartActivity() {
 const width = 560, height = 340, cx = 280, cy = 172, radius = 138;
 const rotation = -.95;
 /* Tombaugh Regio: środek serca na mapie to ok. 7° długości i 18° szerokości */
 const heartAt = () => globePoint(7, 18, rotation, cx, cy, radius);
 const pos = heartAt();
 const heartRx = radius * .3 * Math.max(.5, pos.squash), heartRy = radius * .32;
 return createTorchActivity({
  title: '💗 Znajdź serce Plutona',
  lead: 'Na Plutonie jest bardzo ciemno. Poruszaj palcem, żeby oświetlać powierzchnię. Gdzieś jest wielka, jasna równina w kształcie serca. Przytrzymaj na niej światło!',
  width, height,
  paintScene(c) {
   paintActStars(c, width, height, 90);
   drawActBall(c, 'pluto', cx, cy, radius, '#c8a98c', rotation);
  },
  targets: [{
   center: {x: pos.x, y: pos.y},
   test: point => ((point.x - pos.x) / heartRx) ** 2 + ((point.y - pos.y) / heartRy) ** 2 <= 1,
   mark: c => {c.strokeStyle = '#ffd95a'; c.lineWidth = 4; c.beginPath(); c.ellipse(pos.x, pos.y, heartRx + 14, heartRy + 14, 0, 0, TAU); c.stroke();}
  }],
  torchRadius: 100,
  doneText: 'Znalazłaś serce Plutona! To jasna równina Tombaugh Regio. Zdjęcia zrobiła sonda New Horizons w lipcu 2015 roku. Lewa część serca to wielka równina z zamarzniętego azotu. Azot to gaz, który jest też w naszym powietrzu — tylko na Plutonie jest tak zimno, że zamarzł.'
 });
}

/* kometa na eliptycznej orbicie: ogon rośnie blisko Słońca i znika daleko od niego */
function createTailActivity() {
 const width = 560, height = 340;
 const sun = {x: 300, y: 170, r: 28};
 const a = 170, e = .6;
 const p = a * (1 - e * e);
 const perihelion = a * (1 - e), aphelion = a * (1 + e);
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 110);
 let theta = Math.PI * .6;
 let dragging = false;
 let nearDone = false, farDone = false, done = false;
 const distanceAt = angle => p / (1 + e * Math.cos(angle));
 const lead = 'Przeciągnij kometę po jej orbicie wokół Słońca. Znajdź miejsce, gdzie ogon jest najdłuższy, i miejsce, gdzie ogon prawie znika!';
 const ghost = (angle, label, ok) => {
  const r = distanceAt(angle);
  const x = sun.x + Math.cos(angle) * r, y = sun.y + Math.sin(angle) * r;
  actCtx.strokeStyle = ok ? '#7ee787' : 'rgba(255,229,138,.7)';
  actCtx.lineWidth = 2;
  actCtx.setLineDash([4, 5]);
  actCtx.beginPath();
  actCtx.arc(x, y, 22, 0, TAU);
  actCtx.stroke();
  actCtx.setLineDash([]);
  actCtx.fillStyle = ok ? '#7ee787' : '#ffe58a';
  actCtx.font = '700 14px system-ui, sans-serif';
  actCtx.textAlign = 'center';
  actCtx.fillText(label, clamp(x, 58, width - 58), y + (Math.sin(angle) > 0 ? 38 : -30));
 };
 const render = now => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(104,171,239,.35)';
  actCtx.lineWidth = 1.5;
  actCtx.setLineDash([4, 7]);
  actCtx.beginPath();
  for (let step = 0; step <= 120; step++) {
   const angle = step / 120 * TAU;
   const r = distanceAt(angle);
   const px = sun.x + Math.cos(angle) * r, py = sun.y + Math.sin(angle) * r;
   if (step === 0) actCtx.moveTo(px, py);
   else actCtx.lineTo(px, py);
  }
  actCtx.stroke();
  actCtx.setLineDash([]);
  ghost(0, 'najbliżej Słońca', nearDone);
  ghost(Math.PI, 'najdalej od Słońca', farDone);
  const glow = actCtx.createRadialGradient(sun.x, sun.y, 4, sun.x, sun.y, sun.r * 2.6);
  glow.addColorStop(0, 'rgba(255,170,60,.5)');
  glow.addColorStop(1, 'rgba(255,170,60,0)');
  actCtx.fillStyle = glow;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r * 2.6, 0, TAU);
  actCtx.fill();
  const sg = actCtx.createRadialGradient(sun.x - 8, sun.y - 10, 2, sun.x, sun.y, sun.r);
  sg.addColorStop(0, '#fff3a0');
  sg.addColorStop(.6, '#ffb43a');
  sg.addColorStop(1, '#e06a1a');
  actCtx.fillStyle = sg;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r, 0, TAU);
  actCtx.fill();
  const r = distanceAt(theta);
  const cxp = sun.x + Math.cos(theta) * r, cyp = sun.y + Math.sin(theta) * r;
  const ux = Math.cos(theta), uy = Math.sin(theta);
  /* ogon rośnie, gdy kometa jest blisko Słońca, i znika daleko od niego */
  const activity = clamp(1 - (r - perihelion) / (aphelion * .55 - perihelion), 0, 1);
  const tail = 150 * activity * (1 + Math.sin((now || 0) * .003) * .05);
  if (tail > 4) {
   [{color: 'rgba(170,225,255,.6)', spread: .13}, {color: 'rgba(255,232,180,.4)', spread: .24}].forEach(layer => {
    const endX = cxp + ux * tail, endY = cyp + uy * tail;
    const nx = -uy, ny = ux;
    const grad = actCtx.createLinearGradient(cxp, cyp, endX, endY);
    grad.addColorStop(0, layer.color);
    grad.addColorStop(1, 'rgba(170,225,255,0)');
    actCtx.fillStyle = grad;
    actCtx.beginPath();
    actCtx.moveTo(cxp + nx * 11, cyp + ny * 11);
    actCtx.quadraticCurveTo(cxp + ux * tail * .6 + nx * tail * layer.spread * .6, cyp + uy * tail * .6 + ny * tail * layer.spread * .6, endX + nx * tail * layer.spread, endY + ny * tail * layer.spread);
    actCtx.lineTo(endX - nx * tail * layer.spread, endY - ny * tail * layer.spread);
    actCtx.quadraticCurveTo(cxp + ux * tail * .6 - nx * tail * layer.spread * .6, cyp + uy * tail * .6 - ny * tail * layer.spread * .6, cxp - nx * 11, cyp - ny * 11);
    actCtx.closePath();
    actCtx.fill();
   });
  }
  const ng = actCtx.createRadialGradient(cxp - 3, cyp - 3, 1, cxp, cyp, 11);
  ng.addColorStop(0, '#8a8074');
  ng.addColorStop(1, '#17120f');
  actCtx.fillStyle = ng;
  actCtx.beginPath();
  actCtx.arc(cxp, cyp, 10, 0, TAU);
  actCtx.fill();
  if (done) strokeHit(cxp, cyp, 24, 24, 0);
 };
 const move = point => {
  if (!dragging || done) return;
  theta = Math.atan2(point.y - sun.y, point.x - sun.x);
  const r = distanceAt(theta);
  if (!nearDone && r < perihelion * 1.25) {
   nearDone = true;
   fxPlay('ok');
   sayNow('Tak! Blisko Słońca jest ciepło, lód paruje i ogon robi się bardzo długi. Teraz znajdź miejsce najdalej od Słońca.');
  }
  if (!farDone && r > aphelion * .86) {
   farDone = true;
   fxPlay('ok');
   sayNow('Tak! Daleko od Słońca jest zimno, lód nie paruje i ogona prawie nie ma.');
  }
  if (nearDone && farDone && !done) {
   done = true;
   render(performance.now());
   finishActivity('Widzisz? Ogon zawsze wskazuje od Słońca, bo odpycha go wiatr słoneczny. Blisko Słońca jest długi, a daleko znika. Nawet gdy kometa odlatuje, ogon leci przed nią — jak włosy, gdy biegniesz pod wiatr.');
   return;
  }
  render(performance.now());
 };
 return {
  title: '☄️ Przeciągnij kometę',
  lead, width, height,
  start: () => render(performance.now()),
  onDown: point => {dragging = true; move(point);},
  onMove: move,
  onUp: () => {dragging = false;},
  frame: (dt, now) => {if (!done) render(now);},
  repeatText: lead, theta: () => theta
 };
}

/* ---------- Księżyc: znajdź różnice ---------- */

const MOON_DIFFS = [
 {id: 'flag', x: 343, y: 118, r: 42, text: 'Flaga. Na Księżycu nie ma powietrza, więc nie ma wiatru. Flaga nie powiewa, więc astronauci dali w niej poziomy drążek, żeby się rozpościerała.'},
 {id: 'earth', x: 470, y: 42, r: 30, text: 'Ziemia na niebie. Z Księżyca widać Ziemię jako dużą, niebieską kulę. Wisi prawie w jednym miejscu, bo Księżyc zawsze zwraca ku nam tę samą stronę.'},
 {id: 'steps', x: 148, y: 172, r: 52, text: 'Ślady butów. Na Księżycu nie ma wiatru ani deszczu, więc ślady astronautów mogą zostać tam bardzo, bardzo długo.'},
 {id: 'crater', x: 445, y: 178, r: 38, text: 'Krater. To ślad po uderzeniu meteorytu. Na Księżycu jest ich mnóstwo, bo nie ma atmosfery, która spaliłaby meteory.'},
 {id: 'rock', x: 40, y: 168, r: 30, text: 'Głaz. Na Księżycu leży mnóstwo kamieni, bo nie ma deszczu ani wiatru, które by je wygładziły.'}
];

function drawMoonScene(c, top, original) {
 c.save();
 c.translate(0, top);
 c.beginPath();
 c.rect(0, 0, 560, 200);
 c.clip();
 c.fillStyle = '#02030a';
 c.fillRect(0, 0, 560, 200);
 c.fillStyle = '#fff';
 [[40, 30], [120, 70], [200, 25], [270, 60], [390, 20], [520, 80], [90, 100], [430, 90], [300, 15], [550, 40]].forEach(([x, y]) => c.fillRect(x, y, 2, 2));
 const ground = c.createLinearGradient(0, 128, 0, 200);
 ground.addColorStop(0, '#9a9aa2');
 ground.addColorStop(1, '#5a5a62');
 c.fillStyle = ground;
 c.beginPath();
 c.moveTo(0, 140);
 c.quadraticCurveTo(140, 122, 280, 134);
 c.quadraticCurveTo(420, 146, 560, 128);
 c.lineTo(560, 200);
 c.lineTo(0, 200);
 c.closePath();
 c.fill();
 const crater = (x, y, w, h) => {
  c.fillStyle = 'rgba(40,40,48,.5)';
  c.beginPath();
  c.ellipse(x, y, w, h, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(210,210,220,.45)';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y - 1, w, h, 0, Math.PI, TAU);
  c.stroke();
 };
 crater(90, 172, 34, 9);
 crater(360, 184, 44, 11);
 crater(520, 160, 24, 7);
 /* lądownik */
 c.fillStyle = '#c9a24b';
 c.fillRect(55, 105, 50, 32);
 c.fillStyle = '#e8e8ee';
 c.fillRect(62, 96, 36, 10);
 c.strokeStyle = '#d0d0d8';
 c.lineWidth = 3;
 [[60, 137, 40, 160], [100, 137, 122, 160], [80, 137, 80, 160]].forEach(([fromX, fromY, toX, toY]) => {
  c.beginPath();
  c.moveTo(fromX, fromY);
  c.lineTo(toX, toY);
  c.stroke();
 });
 /* astronauta */
 c.fillStyle = '#9a9aa4';
 c.fillRect(212, 110, 10, 28);
 c.fillStyle = '#f4f4f8';
 c.fillRect(221, 108, 28, 34);
 c.fillRect(223, 140, 10, 26);
 c.fillRect(237, 140, 10, 26);
 c.fillStyle = '#6a6a74';
 c.fillRect(222, 164, 12, 6);
 c.fillRect(236, 164, 12, 6);
 c.fillStyle = '#f4f4f8';
 c.beginPath();
 c.arc(235, 94, 15, 0, TAU);
 c.fill();
 const visor = c.createLinearGradient(225, 86, 245, 102);
 visor.addColorStop(0, '#f6d77a');
 visor.addColorStop(1, '#a8742a');
 c.fillStyle = visor;
 c.beginPath();
 c.ellipse(238, 94, 9, 8, 0, 0, TAU);
 c.fill();
 c.strokeStyle = '#f4f4f8';
 c.lineWidth = 8;
 c.lineCap = 'round';
 c.beginPath();
 c.moveTo(249, 116);
 c.lineTo(268, 126);
 c.stroke();
 /* różnice — tylko na Obrazku 1 */
 if (original) {
  c.strokeStyle = '#d8d8e0';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(320, 150);
  c.lineTo(320, 82);
  c.moveTo(320, 84);
  c.lineTo(366, 84);
  c.stroke();
  c.fillStyle = '#ffffff';
  c.fillRect(320, 85, 46, 28);
  c.fillStyle = '#d23a3a';
  [86, 93, 100, 107].forEach(stripeY => c.fillRect(320, stripeY, 46, 3.5));
  c.fillStyle = '#243a8a';
  c.fillRect(320, 85, 20, 14);
  const planet = c.createRadialGradient(464, 36, 2, 470, 42, 22);
  planet.addColorStop(0, '#9ad0ff');
  planet.addColorStop(1, '#2a62c0');
  c.fillStyle = planet;
  c.beginPath();
  c.arc(470, 42, 20, 0, TAU);
  c.fill();
  c.fillStyle = '#4eaa69';
  c.beginPath();
  c.ellipse(464, 40, 8, 6, -.4, 0, TAU);
  c.ellipse(476, 50, 6, 8, .5, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.75)';
  c.beginPath();
  c.ellipse(472, 33, 9, 3, .2, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(30,30,38,.6)';
  for (let step = 0; step < 6; step++) {
   c.beginPath();
   c.ellipse(105 + step * 17, step % 2 ? 176 : 168, 6, 2.6, 0, 0, TAU);
   c.fill();
  }
  crater(445, 178, 36, 10);
  /* głaz */
  c.fillStyle = '#6f6f78';
  c.beginPath();
  c.moveTo(18, 178); c.lineTo(26, 158); c.lineTo(44, 152); c.lineTo(58, 166); c.lineTo(52, 180);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(255,255,255,.2)';
  c.beginPath();
  c.moveTo(26, 158); c.lineTo(44, 152); c.lineTo(40, 164);
  c.closePath();
  c.fill();
 }
 c.restore();
}

function createMoonActivity() {
 const width = 560;
 const height = 412;
 const found = new Set();
 const scene = makeLayer(width, height);
 drawMoonScene(scene.ctx, 0, true);
 drawMoonScene(scene.ctx, 212, false);
 scene.ctx.fillStyle = '#1a2238';
 scene.ctx.fillRect(0, 200, width, 12);
 const lead = 'Te dwa obrazki różnią się pięcioma szczegółami. Dotknij miejsca, w którym coś się nie zgadza.';
 const marks = diff => {
  actCtx.strokeStyle = '#ffd95a';
  actCtx.lineWidth = 4;
  [0, 212].forEach(offsetY => {
   actCtx.beginPath();
   actCtx.arc(diff.x, diff.y + offsetY, diff.r, 0, TAU);
   actCtx.stroke();
  });
 };
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  actCtx.font = '700 15px system-ui, sans-serif';
  actCtx.textAlign = 'left';
  actCtx.fillStyle = 'rgba(0,0,0,.55)';
  actCtx.fillRect(8, 172, 78, 22);
  actCtx.fillRect(8, 384, 78, 22);
  actCtx.fillStyle = '#fff';
  actCtx.fillText('Obrazek 1', 14, 188);
  actCtx.fillText('Obrazek 2', 14, 400);
  actCtx.textAlign = 'right';
  actCtx.fillText(`Znalezione: ${found.size} z ${MOON_DIFFS.length}`, width - 12, 188);
  MOON_DIFFS.filter(diff => found.has(diff.id)).forEach(marks);
 };
 const tap = point => {
  if (point.y > 200 && point.y < 212) return;
  const localY = point.y >= 212 ? point.y - 212 : point.y;
  const hit = MOON_DIFFS.find(diff => Math.hypot(point.x - diff.x, localY - diff.y) <= diff.r);
  if (!hit || found.has(hit.id)) return;
  found.add(hit.id);
  fxPlay('ok');
  render();
  if (found.size === MOON_DIFFS.length) {
   finishActivity(`Znaleziono ${found.size} z ${MOON_DIFFS.length}. ${hit.text} Znalazłaś wszystkie różnice!`);
  } else {
   logActivity(`Znaleziono ${found.size} z ${MOON_DIFFS.length}. ${hit.text}`);
  }
 };
 return {title: '🌙 Księżyc: znajdź 5 różnic', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createSeasonsActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 90);
 const sun = {x: 280, y: 190, r: 26};
 const orbit = 96;
 const zones = [
  {angle: -Math.PI / 2, emoji: '🌸', name: 'Wiosna', ask: 'wiosna', text: 'Wiosna — przyroda budzi się do życia, drzewa kwitną, a ptaki śpiewają.'},
  {angle: 0, emoji: '☀️', name: 'Lato', ask: 'lato', text: 'Lato — jest najcieplej, bo północna część Ziemi jest przechylona w stronę Słońca. To czas wakacji i kąpieli w jeziorze!'},
  {angle: Math.PI / 2, emoji: '🍂', name: 'Jesień', ask: 'jesień', text: 'Jesień — liście na drzewach robią się kolorowe i opadają.'},
  {angle: Math.PI, emoji: '❄️', name: 'Zima', ask: 'zima', text: 'Zima — jest zimno, bo północna część Ziemi jest odwrócona od Słońca. Czasem pada śnieg i można lepić bałwana!'}
 ];
 /* kolejność pytań: lato, zima, wiosna, jesień */
 const asks = [1, 3, 0, 2];
 let askIndex = 0;
 const angleStart = -Math.PI / 2;
 let angle = angleStart;
 let dragging = false;
 const done = new Set();
 const lead = 'Ziemia krąży wokół Słońca i jej oś jest przechylona. Przeciągnij Ziemię w miejsce, o które zapytam, i puść palec. Zacznijmy od lata!';
 const angleDiff = (a, b) => {
  const delta = Math.abs(a - b) % TAU;
  return Math.min(delta, TAU - delta);
 };
 const askText = () => `Gdzie w Polsce jest teraz ${zones[asks[askIndex]].ask}? Przeciągnij tam Ziemię.`;
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(104,171,239,.35)';
  actCtx.lineWidth = 1.5;
  actCtx.setLineDash([4, 7]);
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, orbit, 0, TAU);
  actCtx.stroke();
  actCtx.setLineDash([]);
  const glow = actCtx.createRadialGradient(sun.x, sun.y, 4, sun.x, sun.y, sun.r * 2.4);
  glow.addColorStop(0, 'rgba(255,170,60,.5)');
  glow.addColorStop(1, 'rgba(255,170,60,0)');
  actCtx.fillStyle = glow;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r * 2.4, 0, TAU);
  actCtx.fill();
  const sg = actCtx.createRadialGradient(sun.x - 8, sun.y - 9, 2, sun.x, sun.y, sun.r);
  sg.addColorStop(0, '#fff3a0');
  sg.addColorStop(.6, '#ffb43a');
  sg.addColorStop(1, '#e06a1a');
  actCtx.fillStyle = sg;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r, 0, TAU);
  actCtx.fill();
  zones.forEach((zone, index) => {
   const lx = sun.x + Math.cos(zone.angle) * (orbit + 62);
   const ly = sun.y + Math.sin(zone.angle) * (orbit + 42) + 5;
   actCtx.textAlign = 'center';
   actCtx.font = '700 15px system-ui, sans-serif';
   actCtx.fillStyle = done.has(index) ? '#7ee787' : '#e6f1ff';
   actCtx.fillText(`${zone.emoji} ${zone.name}${done.has(index) ? ' ✓' : ''}`, lx, ly);
  });
  const ex = sun.x + Math.cos(angle) * orbit;
  const ey = sun.y + Math.sin(angle) * orbit;
  drawActBall(actCtx, 'earth_photo', ex, ey, 17, '#268de0', 0);
  /* oś Ziemi pochylona zawsze w tę samą stronę — biegun północny (żółta kropka) wskazuje „w lewo, w górę” */
  const tx = Math.sin(.4) * 28, ty = Math.cos(.4) * 28;
  actCtx.strokeStyle = 'rgba(255,255,255,.85)';
  actCtx.lineWidth = 2;
  actCtx.beginPath();
  actCtx.moveTo(ex + tx, ey + ty);
  actCtx.lineTo(ex - tx, ey - ty);
  actCtx.stroke();
  actCtx.fillStyle = '#ffe58a';
  actCtx.beginPath();
  actCtx.arc(ex - tx, ey - ty, 3.5, 0, TAU);
  actCtx.fill();
  if (done.size < zones.length) {
   actCtx.fillStyle = '#ffe58a';
   actCtx.font = '800 15px system-ui, sans-serif';
   actCtx.textAlign = 'center';
   actCtx.fillText(askText(), width / 2, 24);
  }
 };
 const release = () => {
  if (!dragging) return;
  dragging = false;
  const zoneIndex = zones.findIndex(zone => angleDiff(angle, zone.angle) < .5);
  if (zoneIndex < 0) return;
  const asked = asks[askIndex];
  if (zoneIndex === asked) {
   done.add(zoneIndex);
   fxPlay('ok');
   askIndex++;
   render();
   if (askIndex >= asks.length) {
    finishActivity(`${zones[zoneIndex].text} Brawo, ustawiłaś Ziemię we wszystkich porach roku! Pory roku są dlatego, że Ziemia krąży wokół Słońca, a jej oś jest przechylona. Raz bardziej do Słońca zwrócona jest północ, a raz południe.`);
   } else {
    logActivity(`${zones[zoneIndex].text} Teraz: ${askText()}`);
   }
  } else {
   fxPlay('miss');
   sayNow(`Tu jest ${zones[zoneIndex].ask}. ${askText()}`);
  }
 };
 return {
  title: '🌍 Pory roku',
  lead, width, height,
  start: render,
  onDown: point => {
   const ex = sun.x + Math.cos(angle) * orbit;
   const ey = sun.y + Math.sin(angle) * orbit;
   if (Math.hypot(point.x - ex, point.y - ey) > 34) return;
   dragging = true;
  },
  onMove: point => {
   if (!dragging) return;
   angle = Math.atan2(point.y - sun.y, point.x - sun.x);
   render();
  },
  onUp: release,
  repeatText: lead,
  sun, orbit, zones, angleStart, asks
 };
}

/* ---------- Jowisz (zadanie 2): księżyce Galileusza ---------- */

const GALILEAN_MOONS = [
 {name: 'Io', color: '#e8c07a', radius: 8, orbit: 108, period: 12, phase: .5, ordinal: 'najbliższy', text: 'ma ponad 400 wulkanów! Wyrzucają one siarkę, która maluje Io na żółto i pomarańczowo.'},
 {name: 'Europa', color: '#d8e4f0', radius: 7, orbit: 138, period: 18, phase: 2.1, ordinal: 'drugi od Jowisza', text: 'pod grubą skorupą lodu może być ocean wody. A gdzie jest woda, tam może być życie!'},
 {name: 'Ganimedes', color: '#b09a7a', radius: 10, orbit: 168, period: 26, phase: 4, ordinal: 'trzeci od Jowisza', text: 'to największy księżyc w całym Układzie Słonecznym — większy nawet od planety Merkury!'},
 {name: 'Kallisto', color: '#8a7a66', radius: 8, orbit: 198, period: 36, phase: 1.2, ordinal: 'najdalszy', text: 'jest cały pokryty kraterami. To jeden z najstarszych księżyców Jowisza.'}
];

function createGalileanActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 100);
 const center = {x: 280, y: 170};
 const jupiterRadius = 58;
 const moons = GALILEAN_MOONS.map(moon => ({...moon, x: 0, y: 0}));
 const found = new Set();
 let next = 0;
 const lead = 'To Jowisz i cztery jego wielkie księżyce, które odkrył Galileusz. Łap je po kolei — od tego, który jest najbliżej Jowisza, do tego, który jest najdalej!';
 const place = now => {
  moons.forEach(moon => {
   const angle = moon.phase + now * .0002 * (36 / moon.period);
   moon.x = center.x + Math.cos(angle) * moon.orbit;
   moon.y = center.y + Math.sin(angle) * moon.orbit * .55;
  });
 };
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(104,171,239,.25)';
  actCtx.lineWidth = 1;
  actCtx.setLineDash([3, 6]);
  moons.forEach(moon => {
   actCtx.beginPath();
   actCtx.ellipse(center.x, center.y, moon.orbit, moon.orbit * .55, 0, 0, TAU);
   actCtx.stroke();
  });
  actCtx.setLineDash([]);
  drawActBall(actCtx, 'jupiter', center.x, center.y, jupiterRadius, '#d5b18a', 0);
  moons.forEach((moon, index) => {
   const gradient = actCtx.createRadialGradient(moon.x - moon.radius * .35, moon.y - moon.radius * .4, moon.radius * .2, moon.x, moon.y, moon.radius * 1.2);
   gradient.addColorStop(0, moon.color);
   gradient.addColorStop(1, '#070b16');
   actCtx.fillStyle = gradient;
   actCtx.beginPath();
   actCtx.arc(moon.x, moon.y, moon.radius, 0, TAU);
   actCtx.fill();
   actCtx.textAlign = 'center';
   actCtx.font = '700 14px system-ui, sans-serif';
   actCtx.fillStyle = found.has(index) ? '#7ee787' : '#e6f1ff';
   actCtx.fillText(found.has(index) ? moon.name : '?', moon.x, moon.y - moon.radius - 6);
   if (found.has(index)) strokeHit(moon.x, moon.y, moon.radius + 5, moon.radius + 5, 0);
  });
  if (found.size < moons.length) {
   actCtx.fillStyle = '#ffe58a';
   actCtx.font = '800 15px system-ui, sans-serif';
   actCtx.textAlign = 'center';
   actCtx.fillText(`Teraz złap księżyc: ${moons[next].ordinal}`, width / 2, 24);
  }
 };
 const tap = point => {
  let index = -1;
  let best = Infinity;
  moons.forEach((moon, i) => {
   const distance = Math.hypot(point.x - moon.x, point.y - moon.y);
   if (distance <= moon.radius + 14 && distance < best) {index = i; best = distance;}
  });
  if (index < 0 || found.has(index)) return;
  if (index !== next) {
   fxPlay('miss');
   sayNow(index > next ? `To nie ten. Ten krąży dalej od Jowisza. Szukaj księżyca na najmniejszej orbicie, którego jeszcze nie złapałaś.` : 'Ten już masz. Szukaj kolejnego, dalej od Jowisza.');
   return;
  }
  found.add(index);
  next++;
  fxPlay('ok');
  render();
  logActivity(`${moons[index].name} ${moons[index].text}`);
  if (found.size === moons.length) {
   finishActivity('Złapałaś wszystkie cztery księżyce w dobrej kolejności! Io, Europa, Ganimedes i Kallisto. Galileusz zobaczył je w 1610 roku przez pierwszy teleskop. Im bliżej Jowisza, tym szybciej księżyc krąży!');
  }
 };
 return {
  title: '🪐 Księżyce Galileusza',
  lead, width, height,
  start: () => {place(performance.now()); render();},
  onDown: tap,
  onMove: () => {},
  onUp: () => {},
  frame: (dt, now) => {place(now); render();},
  repeatText: lead,
  moons
 };
}














/* ---------- Księżyc: znajdź różnice (scena z poprzedniej wersji) ---------- */




/* ---------- zadanie dla sond: znajdź części ---------- */

function createPartsActivity(item) {
 const spec = PARTS[item.sprite || item.draw];
 const width = 560, height = 340;
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 80);
 let imgRect = null;
 const drawSource = () => {
  const image = spec.image ? imageOf(spec.image) : null;
  if (image) {
   const scale = Math.min((width - 60) / image.naturalWidth, (height - 60) / image.naturalHeight);
   const dw = image.naturalWidth * scale, dh = image.naturalHeight * scale;
   imgRect = {x: (width - dw) / 2, y: (height - dh) / 2, w: dw, h: dh};
   scene.ctx.drawImage(image, imgRect.x, imgRect.y, dw, dh);
   return;
  }
  if (spec.draw && PROBE_BOX[spec.draw]) {
   const box = makeLayer(300, 240);
   PROBE_BOX[spec.draw](box.ctx, 300, 240);
   const scale = Math.min((width - 60) / 300, (height - 60) / 240);
   const dw = 300 * scale, dh = 240 * scale;
   imgRect = {x: (width - dw) / 2, y: (height - dh) / 2, w: dw, h: dh};
   scene.ctx.drawImage(box.canvas, imgRect.x, imgRect.y, dw, dh);
  }
 };
 drawSource();
 let partIndex = 0;
 let foundHits = new Set();
 let finished = false;
 const lead = `To sonda ${item.name}. Dotykaj jej części, o które pytam.`;
 const render = () => {
  if (!imgRect) drawSource();
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (finished || !imgRect || partIndex >= spec.parts.length) return;
  const part = spec.parts[partIndex];
  const pulse = Math.sin(performance.now() * .005) * .5 + .5;
  part.hits.forEach(([hx, hy, hr], index) => {
   const px = imgRect.x + hx * imgRect.w;
   const py = imgRect.y + hy * imgRect.h;
   const pr = hr * imgRect.w;
   if (foundHits.has(index)) {
    actCtx.strokeStyle = '#7ee787';
    actCtx.lineWidth = 4;
    actCtx.beginPath();
    actCtx.arc(px, py, pr + 7, 0, TAU);
    actCtx.stroke();
   } else {
    actCtx.strokeStyle = `rgba(255,217,90,${.4 + .45 * pulse})`;
    actCtx.lineWidth = 3;
    actCtx.setLineDash([7, 7]);
    actCtx.beginPath();
    actCtx.arc(px, py, pr + 10 + pulse * 4, 0, TAU);
    actCtx.stroke();
    actCtx.setLineDash([]);
   }
  });
 };
 const tap = point => {
  if (finished || !imgRect || partIndex >= spec.parts.length) return;
  const part = spec.parts[partIndex];
  const px = point.x - imgRect.x;
  const py = point.y - imgRect.y;
  if (px < 0 || py < 0 || px > imgRect.w || py > imgRect.h) return;
  const hitIndex = part.hits.findIndex(([hx, hy, hr]) => Math.hypot(px - hx * imgRect.w, py - hy * imgRect.h) <= hr * imgRect.w);
  if (hitIndex < 0 || foundHits.has(hitIndex)) return;
  foundHits.add(hitIndex);
  fxPlay('ok');
  render();
  const need = Math.min(part.count || 1, part.hits.length);
  if (foundHits.size >= need) {
   partIndex++;
   foundHits = new Set();
   if (partIndex >= spec.parts.length) {
    finished = true;
    spec.parts.forEach(donePart => donePart.hits.forEach(([hx, hy, hr]) => {
     actCtx.strokeStyle = '#7ee787';
     actCtx.lineWidth = 4;
     actCtx.beginPath();
     actCtx.arc(imgRect.x + hx * imgRect.w, imgRect.y + hy * imgRect.h, hr * imgRect.w + 7, 0, TAU);
     actCtx.stroke();
    }));
    finishActivity(`Brawo! Znasz już wszystkie części sondy. ${part.ok}`);
   } else {
    const next = spec.parts[partIndex];
    activity.repeatText = `${lead} ${next.ask}`;
    speakSegments([{text: part.ok, pause: 500}, {text: next.ask}]);
    render();
   }
  } else {
   sayNow('Dobrze! Znajdź jeszcze jedno takie miejsce.');
  }
 };
 const activity = {
  title: `🛰️ Poznaj sondę: ${item.name}`,
  lead,
  width, height,
  repeatText: lead,
  start: render,
  onDown: tap,
  onMove: () => {},
  onUp: () => {},
  frame: (dt, now) => {if (!finished) render();},
  debug: () => ({imgRect, partIndex, parts: spec.parts})
 };
 const first = spec.parts[0];
 if (first) {
  activity.openingAsk = first.ask;
  activity.repeatText = `${lead} ${first.ask}`;
 }
 return activity;
}

/* ---------- Słońce (zadanie 2): ułóż planety po kolei ---------- */

const ORDER_PLANETS = [
 {key: 'mercury', color: '#9b8d7a', name: 'Merkury'},
 {key: 'venus_clouds', color: '#d7a75d', name: 'Wenus'},
 {key: 'earth_photo', color: '#268de0', name: 'Ziemia'},
 {key: 'mars', color: '#d75a36', name: 'Mars'},
 {key: 'jupiter', color: '#d5b18a', name: 'Jowisz'},
 {key: 'saturn', color: '#d9bd83', name: 'Saturn', ring: true},
 {key: 'uranus', color: '#7ed9e5', name: 'Uran'},
 {key: 'neptune', color: '#356ce0', name: 'Neptun'}
];

function drawActPlanet(c, planet, x, y, radius) {
 const ballRadius = planet.ring ? radius * .6 : radius;
 if (planet.ring) drawActRing(c, x, y, ballRadius, 0, SATURN_BANDS, 'back');
 drawActBall(c, planet.key, x, y, ballRadius, planet.color, 0);
 if (planet.ring) drawActRing(c, x, y, ballRadius, 0, SATURN_BANDS, 'front');
}

function createOrderActivity() {
 const width = 600, height = 420;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 120);
 const slots = ORDER_PLANETS.map((planet, index) => ({x: 50 + index * 71, y: 115, r: 27, planet: null}));
 const chips = ORDER_PLANETS.map((planet, planetIndex) => ({...planet, planetIndex, x: 0, y: 0, r: 27, homeX: 0, homeY: 0, slot: null}));
 [3, 0, 6, 1, 7, 2, 5, 4].forEach((planetIndex, column) => {
  chips[planetIndex].x = chips[planetIndex].homeX = 50 + column * 71;
  chips[planetIndex].y = chips[planetIndex].homeY = 320;
 });
 let selected = null;
 let lastHintAt = 0;
 const lead = 'Dotknij planetę, a potem dotknij jej miejsca. Ułóż wszystkie planety po kolei — od tej najbliżej Słońca do tej najdalej.';
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.textAlign = 'center';
  actCtx.font = '800 30px system-ui, sans-serif';
  actCtx.fillStyle = '#ffd95a';
  actCtx.fillText('☀️', 30, 44);
  actCtx.strokeStyle = 'rgba(255,217,90,.5)';
  actCtx.lineWidth = 3;
  actCtx.setLineDash([8, 8]);
  actCtx.beginPath();
  actCtx.moveTo(56, 38);
  actCtx.lineTo(width - 40, 38);
  actCtx.stroke();
  actCtx.setLineDash([]);
  actCtx.beginPath();
  actCtx.moveTo(width - 52, 28);
  actCtx.lineTo(width - 36, 38);
  actCtx.lineTo(width - 52, 48);
  actCtx.stroke();
  actCtx.font = '700 13px system-ui, sans-serif';
  actCtx.fillStyle = '#ffe58a';
  actCtx.textAlign = 'left';
  actCtx.fillText('najbliżej Słońca', 70, 30);
  actCtx.textAlign = 'right';
  actCtx.fillText('najdalej', width - 62, 30);
  actCtx.textAlign = 'center';
  slots.forEach((slot, index) => {
   actCtx.font = '800 16px system-ui, sans-serif';
   actCtx.fillStyle = '#8fb8e8';
   actCtx.fillText(String(index + 1), slot.x, slot.y - slot.r - 10);
   if (!slot.planet) {
    actCtx.strokeStyle = 'rgba(143,184,232,.4)';
    actCtx.lineWidth = 2;
    actCtx.setLineDash([5, 5]);
    actCtx.beginPath();
    actCtx.arc(slot.x, slot.y, slot.r, 0, TAU);
    actCtx.stroke();
    actCtx.setLineDash([]);
   }
  });
  /* chipy są jedynym źródłem rysowania — slot tylko zaznacza zajętość, więc nie ma klonów */
  chips.forEach(chip => {
   drawActPlanet(actCtx, chip, chip.x, chip.y, chip.r);
   actCtx.font = '700 13px system-ui, sans-serif';
   actCtx.fillStyle = '#e6f1ff';
   actCtx.fillText(chip.name.toUpperCase(), chip.x, chip.y + chip.r + 17);
   if (chip === selected) {
    actCtx.strokeStyle = '#ffd95a';
    actCtx.lineWidth = 3;
    actCtx.beginPath();
    actCtx.arc(chip.x, chip.y, chip.r + 6, 0, TAU);
    actCtx.stroke();
   }
  });
 };
 const releaseSelection = () => {
  if (!selected) return;
  const chip = selected;
  if (chip.fromSlot) {
   chip.fromSlot.planet = chip;
   chip.slot = chip.fromSlot;
   chip.x = chip.fromSlot.x;
   chip.y = chip.fromSlot.y;
  } else if (!chip.slot) {
   chip.x = chip.homeX;
   chip.y = chip.homeY;
  }
  chip.fromSlot = null;
  selected = null;
 };
 const tap = point => {
  const chip = chips.find(c => Math.hypot(point.x - c.x, point.y - c.y) <= c.r + 12);
  if (chip) {
   if (selected === chip) {
    releaseSelection();
    render();
    return;
   }
   releaseSelection();
   selected = chip;
   chip.fromSlot = chip.slot || null;
   if (chip.slot) {
    chip.slot.planet = null;
    chip.slot = null;
   }
   fxPlay('tap');
   render();
   return;
  }
  const slot = slots.find(s => Math.hypot(point.x - s.x, point.y - s.y) <= s.r + 12);
  if (!slot || !selected) return;
  const moving = selected;
  if (slot.planet) {
   const other = slot.planet;
   other.slot = null;
   if (moving.fromSlot) {
    other.slot = moving.fromSlot;
    moving.fromSlot.planet = other;
    other.x = moving.fromSlot.x;
    other.y = moving.fromSlot.y;
   } else {
    other.x = other.homeX;
    other.y = other.homeY;
   }
  }
  moving.slot = slot;
  slot.planet = moving;
  moving.x = slot.x;
  moving.y = slot.y;
  moving.fromSlot = null;
  const slotIndex = slots.indexOf(slot);
  fxPlay(slotIndex === moving.planetIndex ? 'ok' : 'pop');
  if (slotIndex !== moving.planetIndex && performance.now() - lastHintAt > 4000) {
   lastHintAt = performance.now();
   sayNow(`${moving.name} leży ${moving.planetIndex < slotIndex ? 'bliżej Słońca, przesuń ją w lewo' : 'dalej od Słońca, przesuń ją w prawo'}.`);
  }
  selected = null;
  render();
  if (slots.every((s, index) => s.planet && s.planet.planetIndex === index)) {
   finishActivity('Świetnie! Planety są we właściwej kolejności: Merkury, Wenus, Ziemia, Mars, Jowisz, Saturn, Uran i Neptun. A Ceres i Pluton to planety karłowate — też krążą wokół Słońca, ale są malutkie.');
  }
 };
 return {
  title: '☀️ Ułóż planety po kolei',
  lead, width, height,
  start: render,
  onDown: tap,
  onMove: () => {},
  onUp: () => {},
  repeatText: lead,
  slots, chips
 };
}

/* ---------- Ziemia (zadanie 2): pory roku ---------- */


/* ---------- Jowisz (zadanie 2): księżyce Galileusza ---------- */



/* ---------- rejestr i sterowanie ---------- */

const activityFactories = {
 sunspots: createSunspotsActivity,
 mercury: createMercuryActivity,
 venus: createVenusActivity,
 moon: createMoonActivity,
 rover: createRoverActivity,
 ceres: createCeresActivity,
 jupiter: createJupiterActivity,
 saturn: createSaturnActivity,
 uranus: createUranusActivity,
 neptune: createNeptuneActivity,
 heart: createHeartActivity,
 tail: createTailActivity,
 belt: createBeltActivity,
 order: createOrderActivity,
 seasons: createSeasonsActivity,
 galilean: createGalileanActivity
};

/* gdy dziecko długo nic nie robi, lektor powtarza polecenie */
let lastActivityTouch = 0;
setInterval(() => {
 if (!activeActivity || activityOverlay.hidden || !activeItem) return;
 if (doneTasks.has(taskKey(activeItem, activeSlot))) return;
 if (performance.now() - lastActivityTouch < 25000) return;
 lastActivityTouch = performance.now();
 sayNow(activeActivity.hintText || activeActivity.repeatText || activeActivity.lead);
}, 5000);

function openActivity(item, slot = 0) {
 const kind = slot ? item.activity2 : item.activity;
 if (!item || !kind || activeActivity) return;
 stopSpeech();
 setReading(false);
 highlightSentence(-1);
 const factory = kind === 'parts' ? () => createPartsActivity(item) : activityFactories[kind];
 if (!factory) return;
 activeItem = item;
 activeSlot = slot;
 activeActivity = factory();
 byId('actTitle').textContent = activeActivity.title;
 byId('actLead').textContent = activeActivity.lead;
 byId('actLog').innerHTML = '';
 byId('actDone').hidden = !doneTasks.has(taskKey(item, slot));
 byId('actSay').classList.toggle('done', doneTasks.has(taskKey(item, slot)));
 actCanvas.width = activeActivity.width * ACT_SCALE;
 actCanvas.height = activeActivity.height * ACT_SCALE;
 actCtx.setTransform(ACT_SCALE, 0, 0, ACT_SCALE, 0, 0);
 activityOverlay.hidden = false;
 activityOverlay.scrollTop = 0;
 lastActivityTouch = performance.now();
 activeActivity.start();
 const opening = activeActivity.openingAsk ? `${activeActivity.lead} ${activeActivity.openingAsk}` : activeActivity.lead;
 sayNow(opening);
}

function closeActivity() {
 const closing = activeItem;
 activeActivity = null;
 activeItem = null;
 activeSlot = 0;
 activityOverlay.hidden = true;
 stopSpeech();
 if (closing && typeof updateActivityLabel === 'function') updateActivityLabel(closing);
}

actCanvas.addEventListener('pointerdown', event => {
 if (!activeActivity) return;
 try {actCanvas.setPointerCapture(event.pointerId);} catch (error) {}
 lastActivityTouch = performance.now();
 fxPlay('tap');
 activeActivity.onDown(activityPoint(event));
});
actCanvas.addEventListener('pointermove', event => {
 if (activeActivity) activeActivity.onMove(activityPoint(event));
});
actCanvas.addEventListener('pointerup', () => {
 if (activeActivity) activeActivity.onUp();
});
actCanvas.addEventListener('pointercancel', () => {
 if (activeActivity) activeActivity.onUp();
});
byId('actClose').addEventListener('click', closeActivity);
byId('actSay').addEventListener('click', () => {
 if (!activeActivity) return;
 const item = activeItem;
 const slot = activeSlot;
 closeActivity();
 openActivity(item, slot);
});

renderTaskbook();

if (window.__KOSMOS_TEST__) window.__KOSMOS_TEST__ = {openActivity, closeActivity, getActive: () => activeActivity, bodies, finds, doneTasks, PARTS, MOONS, allMoons, allGalaxy, GALAXY_OBJECTS, view, draw, pickAt, zoomOutLevel, zoomInLevel, discovered, resetView, syncLevel, galaxyAlpha, computeFrame, followZoom, updateCamera, TOTAL_TASKS, choose, chooseMoon, chooseFind, chooseRing, moonZoom, fitScale};
