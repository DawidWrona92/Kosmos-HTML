/* ---------- zadania ---------- */

const activityOverlay = byId('activity');
const actCanvas = byId('actCanvas');
const actCtx = actCanvas.getContext('2d');
let activeActivity = null;

function makeLayer(width, height) {
 const layer = document.createElement('canvas');
 layer.width = width * ACT_SCALE;
 layer.height = height * ACT_SCALE;
 const layerCtx = layer.getContext('2d');
 layerCtx.setTransform(ACT_SCALE, 0, 0, ACT_SCALE, 0, 0);
 return {canvas: layer, ctx: layerCtx};
}

function logActivity(text) {
 const line = document.createElement('p');
 line.textContent = text;
 byId('actLog').insertBefore(line, byId('actLog').firstChild);
 if (soundOn) speak(text);
}

function drawRover(c, flat) {
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

function createRoverActivity() {
 const width = 560;
 const height = 340;
 const scene = makeLayer(width, height);
 const dust = makeLayer(width, height);
 const probe = document.createElement('canvas');
 probe.width = 140;
 probe.height = 85;
 const probeCtx = probe.getContext('2d', {willReadFrequently: true});
 const sky = scene.ctx.createLinearGradient(0, 0, 0, 215);
 sky.addColorStop(0, '#c98f6b');
 sky.addColorStop(1, '#efc19a');
 scene.ctx.fillStyle = sky;
 scene.ctx.fillRect(0, 0, width, 215);
 const ground = scene.ctx.createLinearGradient(0, 215, 0, height);
 ground.addColorStop(0, '#b4603a');
 ground.addColorStop(1, '#7b3b22');
 scene.ctx.fillStyle = ground;
 scene.ctx.fillRect(0, 215, width, height - 215);
 scene.ctx.fillStyle = 'rgba(70,30,15,.45)';
 [[60, 310, 26, 8], [500, 300, 34, 10], [90, 240, 14, 5], [470, 250, 18, 6]].forEach(([x, y, w, h]) => {
  scene.ctx.beginPath();
  scene.ctx.ellipse(x, y, w, h, 0, 0, TAU);
  scene.ctx.fill();
 });
 drawRover(scene.ctx, false);
 drawRover(dust.ctx, true);
 dust.ctx.globalCompositeOperation = 'source-in';
 dust.ctx.fillStyle = 'rgba(176,100,60,.94)';
 dust.ctx.fillRect(0, 0, width, height);
 dust.ctx.globalCompositeOperation = 'source-atop';
 for (let speck = 0; speck < 900; speck++) {
  dust.ctx.fillStyle = speck % 2 ? 'rgba(225,160,110,.35)' : 'rgba(110,55,30,.3)';
  dust.ctx.beginPath();
  dust.ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 2.4, 0, TAU);
  dust.ctx.fill();
 }
 dust.ctx.globalCompositeOperation = 'destination-out';

 const dustAmount = () => {
  probeCtx.clearRect(0, 0, 140, 85);
  probeCtx.drawImage(dust.canvas, 0, 0, 140, 85);
  const data = probeCtx.getImageData(0, 0, 140, 85).data;
  let count = 0;
  for (let index = 3; index < data.length; index += 4) if (data[index] > 70) count++;
  return count;
 };
 const initialDust = dustAmount();
 let wiping = false;
 let lastPoint = null;
 let lastCheck = 0;
 let finished = false;

 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  actCtx.drawImage(dust.canvas, 0, 0, width, height);
 };
 const wipe = point => {
  dust.ctx.lineWidth = 40;
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
  if (dustAmount() < initialDust * .07) {
   finished = true;
   dust.ctx.clearRect(0, 0, width, height);
   render();
   logActivity('Czysto! Łaziki Spirit i Opportunity miały panele słoneczne. Pył zmniejszał ilość prądu, ale czasem pomagał wiatr: małe wiry zwane diabłami pyłowymi zdmuchiwały kurz z paneli. Dzięki temu łazik Opportunity, zaplanowany na 90 dni, pracował na Marsie ponad 14 lat!');
  }
 };
 return {
  title: '🧽 Wyczyść łazika',
  lead: 'Łazik jest pokryty marsjańskim pyłem. Przesuwaj palcem po łaziku, żeby odkurzyć panele i kamery.',
  width, height,
  start: render,
  onDown: point => {wiping = true; lastPoint = point; wipe(point);},
  onMove: point => {if (wiping) wipe(point);},
  onUp: () => {wiping = false;}
 };
}

function createHeartActivity() {
 const width = 560;
 const height = 340;
 const centerX = 280;
 const centerY = 170;
 const planetRadiusValue = 150;
 const heart = heartPath(325, 168, 62);
 const scene = makeLayer(width, height);
 const sc = scene.ctx;
 sc.fillStyle = '#02030a';
 sc.fillRect(0, 0, width, height);
 for (let star = 0; star < 90; star++) {
  sc.fillStyle = `rgba(255,255,255,${.2 + Math.random() * .6})`;
  sc.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
 }
 const body = sc.createRadialGradient(centerX - 50, centerY - 50, 10, centerX, centerY, planetRadiusValue);
 body.addColorStop(0, '#d9bfa4');
 body.addColorStop(.7, '#a88468');
 body.addColorStop(1, '#5e4636');
 sc.fillStyle = body;
 sc.beginPath();
 sc.arc(centerX, centerY, planetRadiusValue, 0, TAU);
 sc.fill();
 sc.save();
 sc.beginPath();
 sc.arc(centerX, centerY, planetRadiusValue, 0, TAU);
 sc.clip();
 sc.fillStyle = 'rgba(70,38,32,.7)';
 sc.beginPath();
 sc.ellipse(200, 190, 62, 86, .1, 0, TAU);
 sc.fill();
 sc.fillStyle = 'rgba(90,55,45,.5)';
 [[250, 90, 26, 14], [380, 250, 34, 18], [150, 110, 22, 12], [430, 120, 20, 14]].forEach(([x, y, w, h]) => {
  sc.beginPath();
  sc.ellipse(x, y, w, h, 0, 0, TAU);
  sc.fill();
 });
 const heartFill = sc.createLinearGradient(260, 110, 390, 230);
 heartFill.addColorStop(0, '#fff6e6');
 heartFill.addColorStop(1, '#ead9c2');
 sc.fillStyle = heartFill;
 sc.fill(heart);
 sc.restore();

 let found = false;
 let light = {x: 110, y: 80};
 const render = () => {
  actCtx.drawImage(scene.canvas, 0, 0, width, height);
  if (found) {
   actCtx.strokeStyle = '#ffd95a';
   actCtx.lineWidth = 4;
   actCtx.stroke(heart);
   return;
  }
  const beam = actCtx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 75);
  beam.addColorStop(0, 'rgba(2,3,10,0)');
  beam.addColorStop(.6, 'rgba(2,3,10,.12)');
  beam.addColorStop(1, 'rgba(2,3,10,.985)');
  actCtx.fillStyle = beam;
  actCtx.fillRect(0, 0, width, height);
 };
 const move = point => {
  if (found) return;
  light = point;
  render();
  if (actCtx.isPointInPath(heart, point.x * ACT_SCALE, point.y * ACT_SCALE)) {
   found = true;
   render();
   logActivity('Znalazłaś serce Plutona! To jasna równina Tombaugh Regio. Zdjęcia zrobiła sonda New Horizons w lipcu 2015 roku. Lewa część serca to wielka równina z zamarzniętego azotu. Azot to gaz, który jest też w naszym powietrzu, tylko na Plutonie jest tak zimno, że zamarzł.');
  }
 };
 return {
  title: '💗 Znajdź serce Plutona',
  lead: 'Na Plutonie jest bardzo ciemno. Poruszaj palcem, żeby oświetlać powierzchnię, i znajdź wielkie serce.',
  width, height,
  start: render,
  onDown: move,
  onMove: move,
  onUp: () => {}
 };
}

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
  render();
  const summary = found.size === MOON_DIFFS.length ? ' Znalazłaś wszystkie różnice! Prawdziwy Księżyc wygląda jak Obrazek 1.' : '';
  logActivity(`Znaleziono ${found.size} z ${MOON_DIFFS.length}. ${hit.text}${summary}`);
 };
 return {
  title: '🌙 Księżyc: znajdź 5 różnic',
  lead: 'Te dwa obrazki różnią się pięcioma szczegółami. Dotknij miejsca, w którym coś się nie zgadza. Obrazek 1 pokazuje prawdziwy Księżyc.',
  width, height,
  start: render,
  onDown: tap,
  onMove: () => {},
  onUp: () => {}
 };
}

const activityFactories = {moon: createMoonActivity, rover: createRoverActivity, heart: createHeartActivity};

function activityPoint(event) {
 const rect = actCanvas.getBoundingClientRect();
 return {
  x: (event.clientX - rect.left) * activeActivity.width / rect.width,
  y: (event.clientY - rect.top) * activeActivity.height / rect.height
 };
}

function openActivity(kind) {
 const factory = activityFactories[kind];
 if (!factory) return;
 if (speechSupported) window.speechSynthesis.cancel();
 activeActivity = factory();
 byId('actTitle').textContent = activeActivity.title;
 byId('actLead').textContent = activeActivity.lead;
 byId('actLog').innerHTML = '';
 actCanvas.width = activeActivity.width * ACT_SCALE;
 actCanvas.height = activeActivity.height * ACT_SCALE;
 actCtx.setTransform(ACT_SCALE, 0, 0, ACT_SCALE, 0, 0);
 activityOverlay.hidden = false;
 activityOverlay.scrollTop = 0;
 activeActivity.start();
}

function closeActivity() {
 activeActivity = null;
 activityOverlay.hidden = true;
 if (speechSupported) window.speechSynthesis.cancel();
}

actCanvas.addEventListener('pointerdown', event => {
 if (!activeActivity) return;
 try {actCanvas.setPointerCapture(event.pointerId);} catch (error) {}
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

