/* ---------- zadania ---------- */

const activityOverlay = byId('activity');
const actCanvas = byId('actCanvas');
const actCtx = actCanvas.getContext('2d');
let activeActivity = null;
let activeItem = null;

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

function renderTaskbook() {
 byId('taskbook').textContent = `⭐ Zadania ${doneTasks.size} z ${TOTAL_ITEMS}`;
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
 logActivity(text);
 if (activeItem) markTaskDone(activeItem.id);
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
 const lead = 'Na Słońcu widać ciemne plamy. Znajdź wszystkie cztery!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  spots.forEach(spot => {
   if (spot.found) strokeHit(spot.x, spot.y, spot.r * 1.35, spot.r * 1.1, .3);
  });
 };
 const tap = point => {
  if (done) return;
  const spot = spots.find(item => !item.found && Math.hypot(point.x - item.x, point.y - item.y) <= item.r * 1.4);
  if (!spot) return;
  spot.found = true;
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
  {x: cx + radius * .12, y: cy + radius * .08, rx: 30, ry: 20, found: false},
  {x: cx - radius * .32, y: cy - radius * .28, rx: 16, ry: 11, found: false}
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
 const lead = 'Na Ceres świecą tajemnicze jasne plamy. Znajdź obie!';
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  spots.forEach(spot => {
   if (spot.found) strokeHit(spot.x, spot.y, spot.rx + 8, spot.ry + 8, -.2);
  });
 };
 const tap = point => {
  if (done) return;
  const spot = spots.find(item => !item.found && ((point.x - item.x) / (item.rx * 1.3)) ** 2 + ((point.y - item.y) / (item.ry * 1.3)) ** 2 <= 1);
  if (!spot) return;
  spot.found = true;
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
  if (((point.x - grs.x) / (grs.rx * 1.3)) ** 2 + ((point.y - grs.y) / (grs.ry * 1.3)) ** 2 <= 1) {
   done = true;
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
   render();
   finishActivity('To pierścienie Saturna! Składają się z miliardów kawałków lodu i skał — od ziarenek piasku po bryły wielkie jak dom. Są ogromne, a mają tylko około 10 metrów grubości!');
  }
 };
 return {title: '💍 Dotknij pierścieni Saturna', lead, width, height, start: render, onDown: tap, onMove: () => {}, onUp: () => {}, repeatText: lead};
}
