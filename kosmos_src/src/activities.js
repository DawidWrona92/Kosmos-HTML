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

function drawActBall(c, key, cx, cy, radius, fallbackColor, rotation) {
 const globe = key && globeOf(key, 256, 0);
 if (globe) {
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

function createTorchActivity(config) {
 const {title, lead, width, height, paintScene, isReveal, revealMark, doneText, torchRadius = 90} = config;
 const scene = makeLayer(width, height);
 paintScene(scene.ctx, width, height);
 let found = false;
 let light = {x: width * .22, y: height * .28};
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (found) {
   if (revealMark) revealMark(actCtx);
   return;
  }
  const beam = actCtx.createRadialGradient(light.x, light.y, 0, light.x, light.y, torchRadius);
  beam.addColorStop(0, 'rgba(2,3,10,0)');
  beam.addColorStop(.55, 'rgba(2,3,10,.3)');
  beam.addColorStop(1, 'rgba(2,3,10,.97)');
  actCtx.fillStyle = beam;
  actCtx.fillRect(0, 0, width, height);
 };
 const move = point => {
  if (found) return;
  light = point;
  render();
  if (isReveal(point)) {
   found = true;
   fxPlay('ok');
   render();
   finishActivity(doneText);
  }
 };
 return {title, lead, width, height, start: render, onDown: move, onMove: move, onUp: () => {}, repeatText: lead};
}

/* ---------- silnik: wycieranie (Wenus, łazik) ---------- */

function createWipeActivity(config) {
 const {title, lead, width, height, paintScene, paintDust, probe, doneText, doneRatio = .08} = config;
 const scene = makeLayer(width, height);
 const dust = makeLayer(width, height);
 paintScene(scene.ctx, width, height);
 paintDust(dust.ctx, width, height);
 const probeCanvas = document.createElement('canvas');
 probeCanvas.width = Math.max(1, Math.round(probe.w * ACT_SCALE));
 probeCanvas.height = Math.max(1, Math.round(probe.h * ACT_SCALE));
 const probeCtx = probeCanvas.getContext('2d', {willReadFrequently: true});
 const dustAmount = () => {
  probeCtx.clearRect(0, 0, probeCanvas.width, probeCanvas.height);
  probeCtx.drawImage(dust.canvas, Math.round(probe.x * ACT_SCALE), Math.round(probe.y * ACT_SCALE), probeCanvas.width, probeCanvas.height, 0, 0, probeCanvas.width, probeCanvas.height);
  const data = probeCtx.getImageData(0, 0, probeCanvas.width, probeCanvas.height).data;
  let count = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 70) count++;
  return count;
 };
 const initial = dustAmount();
 let wiping = false;
 let lastPoint = null;
 let lastCheck = 0;
 let finished = false;
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  actCtx.drawImage(dust.canvas, 0, 0, width, height);
 };
 const wipe = point => {
  dust.ctx.strokeStyle = 'rgba(0,0,0,1)';
  dust.ctx.lineWidth = 44;
  dust.ctx.lineCap = 'round';
  dust.ctx.beginPath();
  dust.ctx.moveTo(lastPoint.x, lastPoint.y);
  dust.ctx.lineTo(point.x, point.y);
  dust.ctx.stroke();
  lastPoint = point;
  render();
  const now = performance.now();
  if (finished || now - lastCheck < 120) return;
  lastCheck = now;
  if (dustAmount() < initial * doneRatio) {
   finished = true;
   dust.ctx.clearRect(0, 0, width, height);
   render();
   finishActivity(doneText);
  }
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

/* ---------- zadania dla ciał niebieskich ---------- */

function createSunspotsActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 148;
 const scene = makeLayer(width, height);
 const sun = makeLayer(512, 512);
 paintSunSurface(sun.ctx, 512, true);
 scene.ctx.save();
 scene.ctx.beginPath();
 scene.ctx.arc(cx, cy, radius, 0, TAU);
 scene.ctx.clip();
 scene.ctx.drawImage(sun.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
 scene.ctx.restore();
 const spots = SUNSPOTS.map(spot => ({
  x: cx + (spot.x * 512 - 256) * (radius * 2 / 512),
  y: cy + (spot.y * 512 - 256) * (radius * 2 / 512),
  r: spot.r * radius * 2,
  found: false
 }));
 let done = false;
 const lead = 'Na Słońcu widać ciemne plamy. Znajdź wszystkie sześć!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  spots.forEach(spot => {
   if (spot.found) strokeHit(spot.x, spot.y, spot.r * 1.35, spot.r * 1.1, .3);
  });
 };
 const tap = point => {
  if (done) return;
  const spot = spots.find(item => !item.found && Math.hypot(point.x - item.x, point.y - item.y) <= item.r * 1.1);
  if (!spot) return;
  spot.found = true;
  fxPlay('ok');
  render();
  const foundCount = spots.filter(item => item.found).length;
  if (foundCount === spots.length) {
   done = true;
   finishActivity('Brawo! To plamy słoneczne. Są trochę chłodniejsze niż reszta Słońca, dlatego wyglądają na ciemno. Plamy pojawiają się i znikają, jak pogoda na Słońcu.');
  } else if (foundCount === 1) {
   sayNow('Tak! To plama słoneczna. Znajdź jeszcze kolejne.');
  }
 };
 return {title: '☀️ Znajdź plamy na Słońcu', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createMercuryActivity() {
 const width = 560, height = 340, cx = 280, cy = 176, radius = 138;
 const ice = {x: cx, y: cy - radius * .66, rx: radius * .3, ry: radius * .17};
 return createTorchActivity({
  title: '🔦 Znajdź lód na Merkurym',
  lead: 'Merkury jest bardzo ciemny. Zaświeć latarką i znajdź lód na biegunie!',
  width, height,
  paintScene(c) {
   paintActStars(c, width, height, 90);
   drawActBall(c, 'mercury', cx, cy, radius, '#9b8d7a');
   c.fillStyle = 'rgba(230,245,255,.92)';
   c.beginPath();
   c.ellipse(ice.x, ice.y, ice.rx, ice.ry, 0, 0, TAU);
   c.fill();
   c.fillStyle = 'rgba(160,200,230,.5)';
   c.beginPath();
   c.ellipse(ice.x, ice.y + ice.ry * .3, ice.rx * .7, ice.ry * .5, 0, 0, TAU);
   c.fill();
  },
  isReveal: point => ((point.x - ice.x) / (ice.rx * 1.2)) ** 2 + ((point.y - ice.y) / (ice.ry * 1.2)) ** 2 <= 1,
  doneText: 'Znalazłaś lód! W głębokich kraterach na biegunach Merkurego leży prawdziwy lód. Słońce tam nigdy nie zagląda, więc lód się nie topi. Znalazła go sonda MESSENGER.'
 });
}

function createVenusActivity() {
 const width = 560, height = 340;
 return createWipeActivity({
  title: '☁️ Zajrzyj pod chmury Wenus',
  lead: 'Wenus jest cała owinięta gęstymi chmurami. Przecieraj palcem, żeby zajrzeć pod spód!',
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
   c.fillStyle = 'rgba(90,40,8,.28)';
   c.fillRect(0, 0, width, height);
   c.fillStyle = 'rgba(70,25,8,.55)';
   [[80, 90, 34, 22], [420, 70, 44, 26], [300, 220, 52, 30], [150, 260, 30, 18], [490, 250, 36, 20]].forEach(([x, y, rx, ry]) => {
    c.beginPath();
    c.ellipse(x, y, rx, ry, 0, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(255,120,40,.35)';
    c.beginPath();
    c.arc(x, y - ry * .4, rx * .3, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(70,25,8,.55)';
   });
  },
  paintDust(c) {
   c.fillStyle = 'rgba(240,218,150,.97)';
   c.fillRect(0, 0, width, height);
   for (let i = 0; i < 30; i++) {
    c.fillStyle = i % 2 ? 'rgba(255,242,205,.5)' : 'rgba(205,165,95,.5)';
    c.beginPath();
    c.ellipse(Math.random() * width, Math.random() * height, 30 + Math.random() * 80, 12 + Math.random() * 34, Math.random() * .4, 0, TAU);
    c.fill();
   }
  },
  probe: {x: 0, y: 0, w: 140, h: 85},
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
  c.fillStyle = 'rgba(176,100,60,.95)';
  c.fillRect(0, 0, width, height);
  c.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 700; i++) {
   c.fillStyle = i % 2 ? 'rgba(225,160,110,.35)' : 'rgba(110,55,30,.3)';
   c.beginPath();
   c.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 2.4, 0, TAU);
   c.fill();
  }
  c.globalCompositeOperation = 'destination-out';
 };
 return createWipeActivity({
  title: '🧹 Wyczyść łazika',
  lead: 'Łazik Perseverance jest pokryty marsjańskim pyłem. Przesuwaj palcem po łaziku, żeby go odkurzyć.',
  width, height,
  paintScene, paintDust,
  probe: {x: 180, y: 90, w: 200, h: 180},
  doneText: 'Czyściutko! Łaziki mają panele słoneczne na grzbiecie. Pył zmniejsza ilość prądu, ale czasem pomaga wiatr — małe wiry, zwane diabłami pyłowymi, same zdmuchują kurz z paneli.'
 });
}

function createCeresActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 140;
 const spots = [
  {x: cx + radius * .12, y: cy + radius * .08, rx: 26, ry: 17, found: false},
  {x: cx - radius * .32, y: cy - radius * .28, rx: 14, ry: 9, found: false},
  {x: cx - radius * .05, y: cy + radius * .42, rx: 12, ry: 8, found: false}
 ];
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 90);
 drawActBall(scene.ctx, 'ceres', cx, cy, radius, '#9a948c');
 scene.ctx.fillStyle = 'rgba(40,36,34,.4)';
 [[cx - 60, cy + 40, 26], [cx + 70, cy - 50, 20], [cx - 10, cy - 70, 16]].forEach(([x, y, r]) => {
  scene.ctx.beginPath();
  scene.ctx.arc(x, y, r, 0, TAU);
  scene.ctx.fill();
 });
 spots.forEach(spot => {
  scene.ctx.fillStyle = 'rgba(255,255,255,.95)';
  scene.ctx.beginPath();
  scene.ctx.ellipse(spot.x, spot.y, spot.rx, spot.ry, -.2, 0, TAU);
  scene.ctx.fill();
  scene.ctx.fillStyle = 'rgba(255,255,240,.3)';
  scene.ctx.beginPath();
  scene.ctx.ellipse(spot.x, spot.y, spot.rx * 1.8, spot.ry * 1.8, -.2, 0, TAU);
  scene.ctx.fill();
 });
 let done = false;
 const lead = 'Na Ceres świecą tajemnicze jasne plamy. Znajdź wszystkie trzy!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  spots.forEach(spot => {
   if (spot.found) strokeHit(spot.x, spot.y, spot.rx + 8, spot.ry + 8, -.2);
  });
 };
 const tap = point => {
  if (done) return;
  const spot = spots.find(item => !item.found && ((point.x - item.x) / (item.rx * 1.05)) ** 2 + ((point.y - item.y) / (item.ry * 1.05)) ** 2 <= 1);
  if (!spot) return;
  spot.found = true;
  fxPlay('ok');
  render();
  if (spots.every(item => item.found)) {
   done = true;
   finishActivity('To słynne jasne plamy w kraterze Occator! To sól, która została po wyschnięciu słonej wody. Odkryła je sonda Dawn. Pod powierzchnią Ceres może być nawet słony ocean!');
  } else {
   sayNow('Tak! To jedna z jasnych plam. Znajdź jeszcze drugą.');
  }
 };
 return {title: '✨ Znajdź jasne plamy na Ceres', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createJupiterActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 142;
 const grs = {x: cx + radius * .3, y: cy + radius * .18, rx: radius * .22, ry: radius * .12};
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 60);
 drawActBall(scene.ctx, 'jupiter', cx, cy, radius, '#d5b18a');
 scene.ctx.save();
 scene.ctx.beginPath();
 scene.ctx.arc(cx, cy, radius, 0, TAU);
 scene.ctx.clip();
 scene.ctx.fillStyle = 'rgba(150,60,35,.28)';
 scene.ctx.beginPath();
 scene.ctx.ellipse(grs.x, grs.y, grs.rx * 1.4, grs.ry * 1.4, -.15, 0, TAU);
 scene.ctx.fill();
 scene.ctx.fillStyle = 'rgba(195,80,50,.85)';
 scene.ctx.beginPath();
 scene.ctx.ellipse(grs.x, grs.y, grs.rx, grs.ry, -.15, 0, TAU);
 scene.ctx.fill();
 scene.ctx.fillStyle = 'rgba(240,190,150,.5)';
 scene.ctx.beginPath();
 scene.ctx.ellipse(grs.x - grs.rx * .2, grs.y - grs.ry * .15, grs.rx * .4, grs.ry * .35, -.15, 0, TAU);
 scene.ctx.fill();
 scene.ctx.restore();
 let done = false;
 const lead = 'Na Jowiszu szaleje wielka czerwona burza. Znajdź ją!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (done) strokeHit(grs.x, grs.y, grs.rx + 8, grs.ry + 8, -.15);
 };
 const tap = point => {
  if (done) return;
  if (((point.x - grs.x) / grs.rx) ** 2 + ((point.y - grs.y) / grs.ry) ** 2 <= 1) {
   done = true;
   fxPlay('ok');
   render();
   finishActivity('To Wielka Czerwona Plama! To burza wielka jak cała Ziemia. Ludzie obserwują ją od ponad 150 lat, a wiatr w środku wieje szybciej niż najsilniejszy huragan.');
  }
 };
 return {title: '🔴 Znajdź Wielką Czerwoną Plamę', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createSaturnActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 100;
 const angle = -.35;
 const scene = makeLayer(width, height);
 paintActStars(scene.ctx, width, height, 80);
 drawActRing(scene.ctx, cx, cy, radius, angle, SATURN_BANDS, 'back');
 drawActBall(scene.ctx, 'saturn', cx, cy, radius, '#d9bd83');
 drawActRing(scene.ctx, cx, cy, radius, angle, SATURN_BANDS, 'front');
 let done = false;
 const lead = 'Saturn ma wspaniałe pierścienie. Dotknij któregoś!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (done) {
   actCtx.strokeStyle = '#7ee787';
   actCtx.lineWidth = 4;
   actCtx.beginPath();
   actCtx.ellipse(cx, cy, radius * 1.74, radius * 1.74 * .3, angle, 0, TAU);
   actCtx.stroke();
  }
 };
 const tap = point => {
  if (done) return;
  const dx = point.x - cx, dy = point.y - cy;
  const rx = dx * Math.cos(-angle) - dy * Math.sin(-angle);
  const ry = (dx * Math.sin(-angle) + dy * Math.cos(-angle)) / .3;
  const distance = Math.hypot(rx, ry);
  if (distance >= radius * 1.22 && distance <= radius * 2.45) {
   done = true;
   fxPlay('ok');
   render();
   finishActivity('To pierścienie Saturna! Składają się z miliardów kawałków lodu i skał — od ziarenek piasku po bryły wielkie jak dom. Są ogromne, a mają tylko około 10 metrów grubości!');
  }
 };
 return {title: '💍 Dotknij pierścieni Saturna', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createBeltActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 100);
 let seed = 42;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 const rocks = Array.from({length: 40}, () => ({
  x: 60 + random() * (width - 120),
  y: 40 + random() * (height - 80),
  r: 3 + random() * 6
 }));
 const ceres = {x: 120 + random() * (width - 240), y: 90 + random() * (height - 180), r: 13};
 let found = false;
 const lead = 'To pas planetoid — miliony skał między Marsem a Jowiszem. Największa skała to planeta karłowata Ceres. Znajdź ją i dotknij!';
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  rocks.forEach(rock => {
   actCtx.fillStyle = '#8d8781';
   actCtx.beginPath();
   actCtx.arc(rock.x, rock.y, rock.r, 0, TAU);
   actCtx.fill();
   actCtx.fillStyle = 'rgba(255,255,255,.18)';
   actCtx.beginPath();
   actCtx.arc(rock.x - rock.r * .3, rock.y - rock.r * .3, rock.r * .5, 0, TAU);
   actCtx.fill();
  });
  actCtx.fillStyle = '#9a948c';
  actCtx.beginPath();
  actCtx.arc(ceres.x, ceres.y, ceres.r, 0, TAU);
  actCtx.fill();
  actCtx.fillStyle = 'rgba(255,255,255,.9)';
  actCtx.beginPath();
  actCtx.arc(ceres.x + ceres.r * .25, ceres.y - ceres.r * .25, Math.max(1, ceres.r * .16), 0, TAU);
  actCtx.fill();
  if (found) strokeHit(ceres.x, ceres.y, ceres.r + 6, ceres.r + 6, 0);
 };
 const tap = point => {
  if (found) return;
  if (Math.hypot(point.x - ceres.x, point.y - ceres.y) <= ceres.r + 3) {
   found = true;
   fxPlay('ok');
   render();
   finishActivity('Brawo, to Ceres! Największa skała w pasie planetoid. Jest taka duża, że nazywamy ją planetą karłowatą. Ma w kraterach sól po dawnej słonej wodzie!');
  } else {
   const rock = rocks.find(r => Math.hypot(point.x - r.x, point.y - r.y) <= r.r + 4);
   if (rock) sayNow('To zwykła planetoida — mała skała. Ceres jest większa! Szukaj największej kuli.');
  }
 };
 return {title: '🪨 Znajdź Ceres w pasie planetoid', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

function createUranusActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 104;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 90);
 const globe = globeOf('uranus', 256, 0);
 if (globe) globe.render(0);
 let tilt = 0;
 let done = false;
 let startX = 0;
 const lead = 'Uran stoi prosto. Przeciągnij palcem w bok, żeby przewrócić go na bok — tak jak naprawdę leży!';
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  drawActRing(actCtx, cx, cy, radius, tilt, URANUS_BANDS, 'back');
  actCtx.save();
  actCtx.beginPath();
  actCtx.arc(cx, cy, radius, 0, TAU);
  actCtx.clip();
  if (globe) actCtx.drawImage(globe.canvas, cx - radius, cy - radius, radius * 2, radius * 2);
  else {
   const gradient = actCtx.createRadialGradient(cx - radius * .35, cy - radius * .4, radius * .1, cx, cy, radius * 1.2);
   gradient.addColorStop(0, '#7ed9e5');
   gradient.addColorStop(1, '#070b16');
   actCtx.fillStyle = gradient;
   actCtx.beginPath();
   actCtx.arc(cx, cy, radius, 0, TAU);
   actCtx.fill();
  }
  actCtx.restore();
  const shade = actCtx.createRadialGradient(cx - radius * .3, cy - radius * .3, radius * .1, cx, cy, radius * 1.1);
  shade.addColorStop(0, 'rgba(0,0,10,0)');
  shade.addColorStop(.7, 'rgba(0,0,10,.25)');
  shade.addColorStop(1, 'rgba(0,0,10,.6)');
  actCtx.fillStyle = shade;
  actCtx.beginPath();
  actCtx.arc(cx, cy, radius, 0, TAU);
  actCtx.fill();
  drawActRing(actCtx, cx, cy, radius, tilt, URANUS_BANDS, 'front');
  if (done) strokeHit(cx, cy, radius + 12, radius + 12, 0);
 };
 return {
  title: '🌀 Przewróć Urana na bok',
  lead, width, height,
  start: render,
  onDown: point => {startX = point.x;},
  onMove: point => {
   if (done) return;
   const delta = Math.max(0, startX - point.x);
   startX = Math.min(startX, point.x);
   tilt = clamp(tilt - delta / 260, -1.25, 0);
   render();
   if (tilt <= -1.05) {
    done = true;
    finishActivity('Uran leży na boku! Kręci się wokół Słońca jak toczona piłka. Naukowcy myślą, że dawno temu uderzyło w niego coś wielkiego i go przewróciło.');
   }
  },
  onUp: () => {},
  frame: done ? (dt, now) => {
   tilt = -1.15 + Math.sin(now * .002) * .04;
   render();
  } : undefined,
  repeatText: lead
 };
}

function createNeptuneActivity() {
 const width = 560, height = 340, cx = 280, cy = 170, radius = 110;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 80);
 drawActBall(bg.ctx, 'neptune', cx, cy, radius, '#356ce0');
 let caught = false;
 let angle = .8;
 const orbitX = radius * 1.9;
 const orbitY = radius * 1.9 * .55;
 const lead = 'Wokół Neptuna krąży jego księżyc Tryton. Jest nieco szybkawy! Dotknij go dokładnie, kiedy do Ciebie podejdzie.';
 /* Nereida i Proteusz — małe, krążą szybciej; ich dotknięcie to pudło z podpowiedzią */
 const decoys = [
  {r: 5, orbit: 1.45, speed: .0016, phase: 2.4, color: '#9fb0be'},
  {r: 4, orbit: 2.3, speed: .0012, phase: 5.1, color: '#8d99a8'}
 ];
 let missed = 0;
 const render = now => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(255,217,90,.25)';
  actCtx.lineWidth = 1.5;
  actCtx.setLineDash([4, 7]);
  actCtx.beginPath();
  actCtx.ellipse(cx, cy, orbitX, orbitY, 0, 0, TAU);
  actCtx.stroke();
  actCtx.setLineDash([]);
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
  for (const decoy of decoys) {
   const t = now === undefined ? frameTime : now;
   drawMoonDot(
    cx + Math.cos(t * decoy.speed + decoy.phase) * radius * decoy.orbit,
    cy + Math.sin(t * decoy.speed + decoy.phase) * radius * decoy.orbit * .55,
    decoy.r, decoy.color
   );
  }
  const tx = cx + Math.cos(angle) * orbitX;
  const ty = cy + Math.sin(angle) * orbitY;
  drawMoonDot(tx, ty, 9, '#f2e4ec');
  if (caught) strokeHit(tx, ty, 20, 20, 0);
 };
 const tryCatch = point => {
  if (caught) return false;
  const tx = cx + Math.cos(angle) * orbitX;
  const ty = cy + Math.sin(angle) * orbitY;
  for (const decoy of decoys) {
   const dx = cx + Math.cos(frameTime * decoy.speed + decoy.phase) * radius * decoy.orbit;
   const dy = cy + Math.sin(frameTime * decoy.speed + decoy.phase) * radius * decoy.orbit * .55;
   if (Math.hypot(point.x - dx, point.y - dy) <= decoy.r + 14) {
    missed++;
    fxPlay('miss');
    sayNow(missed === 1 ? 'Ojej, to mały Proteusz! Tryton jest większy i ma różowawy odcień.' : 'To znowu mały księżyc! Szukaj dużego, jasnego Trytona.');
    return false;
   }
  }
  if (Math.hypot(point.x - tx, point.y - ty) <= 30) {
   caught = true;
   fxPlay('ok');
   render();
   finishActivity('Złapałaś Trytona! To największy księżyc Neptuna. Jest tam strasznie zimno, a mimo to Tryton ma gejzery, które wyrzucają w górę lodowy pył.');
   return true;
  }
  return false;
 };
 return {
  title: '🎯 Złap Trytona',
  lead, width, height,
  start: render,
  onDown: tryCatch, onMove: tryCatch, onUp: () => {},
  frame: (dt, now) => {
   angle = now * .0009;
   render(now);
  },
  repeatText: lead
 };
}

function createHeartActivity() {
 const width = 560, height = 340, cx = 280, cy = 172, radius = 138;
 const heartX = cx + radius * .18, heartY = cy - radius * .05, heartSize = radius * .52;
 const heart = heartPath(heartX, heartY, heartSize);
 return createTorchActivity({
  title: '💗 Znajdź serce Plutona',
  lead: 'Na Plutonie jest bardzo ciemno. Poruszaj palcem, żeby oświetlać powierzchnię, i znajdź wielkie serce.',
  width, height,
  paintScene(c) {
   paintActStars(c, width, height, 90);
   drawActBall(c, 'pluto', cx, cy, radius, '#c8a98c');
   c.save();
   c.beginPath();
   c.arc(cx, cy, radius, 0, TAU);
   c.clip();
   const fill = c.createLinearGradient(cx, cy - radius, cx, cy + radius);
   fill.addColorStop(0, 'rgba(255,246,230,.95)');
   fill.addColorStop(1, 'rgba(234,217,194,.9)');
   c.fillStyle = fill;
   c.fill(heart);
   c.restore();
  },
  /* wymaga trafienia blisko środka serca — elipsa ~45% rozmiaru serca */
  isReveal: point => ((point.x - heartX) / (heartSize * .55)) ** 2 + ((point.y - (heartY + heartSize * .15)) / (heartSize * .4)) ** 2 <= 1,
  revealMark(c) {
   c.strokeStyle = '#ffd95a';
   c.lineWidth = 4;
   c.stroke(heart);
  },
  doneText: 'Znalazłaś serce Plutona! To jasna równina Tombaugh Regio. Zdjęcia zrobiła sonda New Horizons w lipcu 2015 roku. Lewa część serca to wielka równina z zamarzniętego azotu. Azot to gaz, który jest też w naszym powietrzu — tylko na Plutonie jest tak zimno, że zamarzł.'
 });
}

function createTailActivity() {
 const width = 560, height = 340;
 const sun = {x: 96, y: 252, r: 34};
 const orbit = 178;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 110);
 let angle = -.6;
 let totalDrag = 0;
 let done = false;
 let dragging = false;
 const lead = 'Przeciągnij palcem kometę wokół Słońca. Zobacz, w którą stronę pokazuje jej ogon!';
 const render = now => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.strokeStyle = 'rgba(104,171,239,.35)';
  actCtx.lineWidth = 1.5;
  actCtx.setLineDash([4, 7]);
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, orbit, 0, TAU);
  actCtx.stroke();
  actCtx.setLineDash([]);
  const glow = actCtx.createRadialGradient(sun.x, sun.y, 4, sun.x, sun.y, sun.r * 2.6);
  glow.addColorStop(0, 'rgba(255,170,60,.5)');
  glow.addColorStop(1, 'rgba(255,170,60,0)');
  actCtx.fillStyle = glow;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r * 2.6, 0, TAU);
  actCtx.fill();
  const sg = actCtx.createRadialGradient(sun.x - 10, sun.y - 12, 2, sun.x, sun.y, sun.r);
  sg.addColorStop(0, '#fff3a0');
  sg.addColorStop(.6, '#ffb43a');
  sg.addColorStop(1, '#e06a1a');
  actCtx.fillStyle = sg;
  actCtx.beginPath();
  actCtx.arc(sun.x, sun.y, sun.r, 0, TAU);
  actCtx.fill();
  const cx = sun.x + Math.cos(angle) * orbit;
  const cy = sun.y + Math.sin(angle) * orbit;
  const dx = cx - sun.x, dy = cy - sun.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const tail = 130 * (1 + Math.sin(now * .003) * .07);
  [{color: 'rgba(170,225,255,.6)', spread: .13}, {color: 'rgba(255,232,180,.4)', spread: .24}].forEach(layer => {
   const endX = cx + ux * tail;
   const endY = cy + uy * tail;
   const nx = -uy, ny = ux;
   const grad = actCtx.createLinearGradient(cx, cy, endX, endY);
   grad.addColorStop(0, layer.color);
   grad.addColorStop(1, 'rgba(170,225,255,0)');
   actCtx.fillStyle = grad;
   actCtx.beginPath();
   actCtx.moveTo(cx + nx * 14, cy + ny * 14);
   actCtx.quadraticCurveTo(cx + ux * tail * .6 + nx * tail * layer.spread * .6, cy + uy * tail * .6 + ny * tail * layer.spread * .6, endX + nx * tail * layer.spread, endY + ny * tail * layer.spread);
   actCtx.lineTo(endX - nx * tail * layer.spread, endY - ny * tail * layer.spread);
   actCtx.quadraticCurveTo(cx + ux * tail * .6 - nx * tail * layer.spread * .6, cy + uy * tail * .6 - ny * tail * layer.spread * .6, cx - nx * 14, cy - ny * 14);
   actCtx.closePath();
   actCtx.fill();
  });
  const ng = actCtx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 15);
  ng.addColorStop(0, '#6b6157');
  ng.addColorStop(1, '#17120f');
  actCtx.fillStyle = ng;
  actCtx.beginPath();
  actCtx.arc(cx, cy, 14, 0, TAU);
  actCtx.fill();
  actCtx.fillStyle = 'rgba(0,0,0,.4)';
  [[-4, -3, 3], [5, 2, 2.4], [1, 6, 2]].forEach(([ox, oy, r]) => {
   actCtx.beginPath();
   actCtx.arc(cx + ox, cy + oy, r, 0, TAU);
   actCtx.fill();
  });
  if (done) strokeHit(cx, cy, 26, 26, 0);
 };
 const angleFrom = point => Math.atan2(point.y - sun.y, point.x - sun.x);
 const move = point => {
  if (!dragging || done) return;
  const next = angleFrom(point);
  let delta = next - angle;
  while (delta > Math.PI) delta -= TAU;
  while (delta < -Math.PI) delta += TAU;
  totalDrag += Math.abs(delta);
  angle = next;
  render(performance.now());
  if (totalDrag > 2.4) {
   done = true;
   finishActivity('Widzisz? Ogon zawsze wskazuje od Słońca! Odpycha go wiatr słoneczny. Nawet gdy kometa odlatuje, ogon jest przed nią — jak włosy, gdy biegniesz pod wiatr.');
  }
 };
 return {
  title: '☄️ Przeciągnij kometę',
  lead, width, height,
  start: () => render(performance.now()),
  onDown: point => {
   dragging = true;
   angle = angleFrom(point);
   render(performance.now());
  },
  onMove: move,
  onUp: () => {dragging = false;},
  frame: (dt, now) => {if (!done) render(now);},
  repeatText: lead
 };
}

/* ---------- Księżyc: znajdź różnice (scena z poprzedniej wersji) ---------- */

const MOON_DIFFS = [
 {id: 'flag', shape: 'circle', x: 343, y: 100, r: 36, text: 'Flaga. Na Księżycu nie ma powietrza, więc nie ma wiatru. Flaga nie powiewa, więc astronauci dali w niej poziomy drążek, żeby się rozpościerała.'},
 {id: 'earth', shape: 'circle', x: 470, y: 42, r: 30, text: 'Ziemia na niebie. Z Księżyca widać Ziemię jako dużą niebieską kulę. Z jednej strony Księżyca wisi ona prawie w jednym miejscu nieba.'},
 {id: 'steps', shape: 'circle', x: 168, y: 172, r: 50, text: 'Ślady butów. Na Księżycu nie ma wiatru ani deszczu, więc ślady astronautów mogą zostać tam bardzo, bardzo długo.'},
 {id: 'crater', shape: 'circle', x: 445, y: 178, r: 38, text: 'Krater. To ślad po uderzeniu meteorytu. Na Księżycu jest ich mnóstwo, bo nie ma atmosfery, która spaliłaby meteory.'},
 {id: 'sky', shape: 'sky', text: 'Niebo. Na Księżycu niebo jest czarne nawet w dzień, bo nie ma atmosfery, która rozprasza światło. Na Ziemi dlatego niebo jest niebieskie.'}
];

function drawMoonScene(c, top, original) {
 c.save();
 c.translate(0, top);
 c.beginPath();
 c.rect(0, 0, 560, 200);
 c.clip();
 if (original) {
  c.fillStyle = '#02030a';
  c.fillRect(0, 0, 560, 200);
  c.fillStyle = '#fff';
  [[40, 30], [120, 70], [200, 25], [270, 60], [390, 20], [520, 80], [90, 100], [430, 90], [300, 15], [560, 40]].forEach(([x, y]) => c.fillRect(x, y, 2, 2));
 } else {
  const sky = c.createLinearGradient(0, 0, 0, 130);
  sky.addColorStop(0, '#3f86dc');
  sky.addColorStop(1, '#a9d4f7');
  c.fillStyle = sky;
  c.fillRect(0, 0, 560, 200);
 }
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
 if (original) crater(445, 178, 36, 10);
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
   c.ellipse(120 + step * 17, step % 2 ? 176 : 168, 6, 2.6, 0, 0, TAU);
   c.fill();
  }
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
 scene.ctx.fillStyle = '#020611';
 scene.ctx.fillRect(0, 200, width, 12);
 const lead = 'Te dwa obrazki różnią się pięcioma szczegółami. Dotknij miejsca, w którym coś się nie zgadza. Obrazek 1 pokazuje prawdziwy Księżyc.';
 const marks = diff => {
  actCtx.strokeStyle = '#ffd95a';
  actCtx.lineWidth = 4;
  [0, 212].forEach(offsetY => {
   actCtx.beginPath();
   if (diff.shape === 'circle') actCtx.arc(diff.x, diff.y + offsetY, diff.r, 0, TAU);
   else actCtx.rect(6, offsetY + 6, 548, 90);
   actCtx.stroke();
  });
 };
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  actCtx.font = '700 14px system-ui, sans-serif';
  actCtx.fillStyle = 'rgba(0,0,0,.55)';
  actCtx.fillRect(8, 172, 78, 22);
  actCtx.fillRect(8, 384, 78, 22);
  actCtx.fillStyle = '#fff';
  actCtx.fillText('Obrazek 1', 14, 188);
  actCtx.fillText('Obrazek 2', 14, 400);
  MOON_DIFFS.filter(diff => found.has(diff.id)).forEach(marks);
 };
 const tap = point => {
  if (point.y > 200 && point.y < 212) return;
  const localY = point.y >= 212 ? point.y - 212 : point.y;
  const hit = MOON_DIFFS.find(diff => {
   if (diff.shape === 'circle') return Math.hypot(point.x - diff.x, localY - diff.y) <= diff.r;
   return localY < 105;
  });
  if (!hit || found.has(hit.id)) return;
  found.add(hit.id);
  fxPlay('ok');
  render();
  if (found.size === MOON_DIFFS.length) {
   finishActivity(`Znaleziono ${found.size} z ${MOON_DIFFS.length}. ${hit.text} Znalazłaś wszystkie różnice! Prawdziwy Księżyc wygląda jak Obrazek 1.`);
  } else {
   logActivity(`Znaleziono ${found.size} z ${MOON_DIFFS.length}. ${hit.text}`);
  }
 };
 return {title: '🌙 Księżyc: znajdź 5 różnic', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}

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
  frame: (dt, now) => {if (!finished) render();}
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
 if (planet.ring) drawActRing(c, x, y, radius, 0, SATURN_BANDS, 'back');
 drawActBall(c, planet.key, x, y, radius, planet.color, 0);
 if (planet.ring) drawActRing(c, x, y, radius, 0, SATURN_BANDS, 'front');
}

function createOrderActivity() {
 const width = 760, height = 470;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 120);
 const slots = ORDER_PLANETS.map((planet, index) => ({x: 70 + index * 90, y: 120, r: 24, planet: null}));
 const chips = ORDER_PLANETS.map((planet, planetIndex) => ({...planet, planetIndex, x: 0, y: 0, r: 24, homeX: 0, homeY: 0, slot: null}));
 [3, 0, 6, 1, 7, 2, 5, 4].forEach((planetIndex, column) => {
  chips[planetIndex].x = chips[planetIndex].homeX = 70 + column * 90;
  chips[planetIndex].y = chips[planetIndex].homeY = 340;
 });
 let selected = null;
 const lead = 'Dotknij planetę, a potem dotknij jej miejsca. Ułóż wszystkie planety po kolei — od tej najbliżej Słońca do tej najdalej.';
 const render = () => {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  actCtx.textAlign = 'center';
  actCtx.font = '800 30px system-ui, sans-serif';
  actCtx.fillStyle = '#ffd95a';
  actCtx.fillText('☀️', width / 2, 56);
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

function createSeasonsActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 90);
 const sun = {x: 185, y: 170, r: 28};
 const orbit = 115;
 const zones = [
  {angle: -Math.PI / 2, emoji: '🌸', name: 'Wiosna', text: 'Wiosna — przyroda budzi się do życia, drzewa kwitną, a ptaki śpiewają.'},
  {angle: 0, emoji: '☀️', name: 'Lato', text: 'Lato — jest najcieplej. To czas wakacji i kąpieli w jeziorze!'},
  {angle: Math.PI / 2, emoji: '🍂', name: 'Jesień', text: 'Jesień — liście na drzewach robią się kolorowe i opadają.'},
  {angle: Math.PI, emoji: '❄️', name: 'Zima', text: 'Zima — jest zimno, czasem pada śnieg i można lepić bałwana!'}
 ];
 const angleStart = -Math.PI / 2;
 let angle = angleStart;
 let dragging = false;
 const done = new Set();
 const lead = 'Przeciągnij Ziemię wokół Słońca. Zatrzymaj ją w każdej porze roku — wiosną, latem, jesienią i zimą!';
 const angleDiff = (a, b) => {
  let delta = Math.abs(a - b) % TAU;
  return Math.min(delta, TAU - delta);
 };
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
   const lx = sun.x + Math.cos(zone.angle) * (orbit + 38);
   const ly = sun.y + Math.sin(zone.angle) * (orbit + 30);
   actCtx.textAlign = 'center';
   actCtx.font = '700 15px system-ui, sans-serif';
   actCtx.fillStyle = done.has(index) ? '#7ee787' : '#e6f1ff';
   actCtx.fillText(`${zone.emoji} ${zone.name}${done.has(index) ? ' ✓' : ''}`, lx, ly);
  });
  const ex = sun.x + Math.cos(angle) * orbit;
  const ey = sun.y + Math.sin(angle) * orbit;
  drawActBall(actCtx, null, ex, ey, 13, '#268de0', 0);
  actCtx.strokeStyle = 'rgba(255,255,255,.85)';
  actCtx.lineWidth = 2;
  actCtx.beginPath();
  actCtx.moveTo(ex - Math.sin(.35) * 22, ey - Math.cos(.35) * 22);
  actCtx.lineTo(ex + Math.sin(.35) * 22, ey + Math.cos(.35) * 22);
  actCtx.stroke();
 };
 const checkZones = () => {
  zones.forEach((zone, index) => {
   if (!done.has(index) && angleDiff(angle, zone.angle) < .42) {
    done.add(index);
    fxPlay('ok');
    logActivity(`${zone.emoji} ${zone.name}! ${zone.text}`);
    render();
    if (done.size === zones.length) {
     finishActivity('Brawo! Znalazłaś wszystkie pory roku. Są one dlatego, że Ziemia krąży wokół Słońca i jej oś jest trochę przechylona. Raz jedna półkula Ziemi jest bardziej skierowana do Słońca, a raz druga.');
    }
   }
  });
 };
 return {
  title: '🌍 Pory roku',
  lead, width, height,
  start: render,
  onDown: point => {
   const ex = sun.x + Math.cos(angle) * orbit;
   const ey = sun.y + Math.sin(angle) * orbit;
   if (Math.hypot(point.x - ex, point.y - ey) > 30) return;
   dragging = true;
  },
  onMove: point => {
   if (!dragging) return;
   angle = Math.atan2(point.y - sun.y, point.x - sun.x);
   render();
   checkZones();
  },
  onUp: () => {dragging = false;},
  repeatText: lead,
  sun, orbit, zones, angleStart
 };
}

/* ---------- Jowisz (zadanie 2): księżyce Galileusza ---------- */

const GALILEAN_MOONS = [
 {name: 'Io', color: '#e8c07a', radius: 7, orbit: 108, period: 12, phase: .5, text: 'ma ponad 400 wulkanów! Wyrzucają one siarkę, która maluje Io na żółto i pomarańczowo.'},
 {name: 'Europa', color: '#d8e4f0', radius: 6, orbit: 138, period: 18, phase: 2.1, text: 'pod grubą skorupą lodu może być ocean wody. A gdzie jest woda, tam może być życie!'},
 {name: 'Ganimedes', color: '#b09a7a', radius: 9, orbit: 168, period: 26, phase: 4, text: 'to największy księżyc w całym Układzie Słonecznym — większy nawet od planety Merkury!'},
 {name: 'Kallisto', color: '#8a7a66', radius: 7, orbit: 198, period: 36, phase: 1.2, text: 'jest cały pokryty kraterami. To jeden z najstarszych księżyców Jowisza.'}
];

function createGalileanActivity() {
 const width = 560, height = 340;
 const bg = makeLayer(width, height);
 paintActStars(bg.ctx, width, height, 100);
 const center = {x: 280, y: 170};
 const jupiterRadius = 62;
 const moons = GALILEAN_MOONS.map(moon => ({...moon, x: 0, y: 0}));
 const found = new Set();
 const lead = 'To Jowisz i cztery jego wielkie księżyce, które odkrył Galileusz. Dotykaj każdy księżyc, żeby go złapać i poznać!';
 const place = now => {
  moons.forEach(moon => {
   const angle = moon.phase + now * .00028 * (36 / moon.period);
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
   actCtx.font = '700 12px system-ui, sans-serif';
   actCtx.fillStyle = found.has(index) ? '#7ee787' : '#e6f1ff';
   actCtx.fillText(moon.name, moon.x, moon.y - moon.radius - 6);
   if (found.has(index)) strokeHit(moon.x, moon.y, moon.radius + 5, moon.radius + 5, 0);
  });
 };
 const tap = point => {
  const index = moons.findIndex(moon => Math.hypot(point.x - moon.x, point.y - moon.y) <= moon.radius + 12);
  if (index < 0 || found.has(index)) return;
  found.add(index);
  fxPlay('ok');
  render();
  logActivity(`${moons[index].name} ${moons[index].text}`);
  if (found.size === moons.length) {
   finishActivity('Złapałaś wszystkie cztery księżyce! Io, Europa, Ganimedes i Kallisto. Galileusz zobaczył je w 1610 roku przez pierwszy teleskop — to były pierwsze księżyce odkryte przez człowieka, oprócz naszego Księżyca!');
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
 activeActivity.start();
 const opening = activeActivity.openingAsk ? `${activeActivity.lead} ${activeActivity.openingAsk}` : activeActivity.lead;
 sayNow(opening);
}

function closeActivity() {
 activeActivity = null;
 activeItem = null;
 activeSlot = 0;
 activityOverlay.hidden = true;
 stopSpeech();
}

actCanvas.addEventListener('pointerdown', event => {
 if (!activeActivity) return;
 try {actCanvas.setPointerCapture(event.pointerId);} catch (error) {}
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

if (window.__KOSMOS_TEST__) window.__KOSMOS_TEST__ = {openActivity, closeActivity, getActive: () => activeActivity, bodies, finds, doneTasks, PARTS, MOONS, allMoons, allGalaxy, GALAXY_OBJECTS, view, draw, pickAt, zoomOutLevel, zoomInLevel, discovered, resetView};
