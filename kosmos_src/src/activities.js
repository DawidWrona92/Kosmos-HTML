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
