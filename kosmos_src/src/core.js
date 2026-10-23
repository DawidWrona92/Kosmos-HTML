
const view = {
 width: 0, height: 0, dpr: 1,
 free: {left: 0, top: 0, right: 0, bottom: 0},
 angle: 0, tilt: .32, angleGoal: null, tiltGoal: null,
 zoom: 1, zoomGoal: 1,
 following: false, carryX: 0, carryY: 0,
 selected: bodyIndex('earth'), find: null,
 targets: [], sunTarget: null, findTargets: []
};
let speed = clamp(parseFloat(loadStored('kosmos3.speed', String(DEFAULT_SPEED))) || DEFAULT_SPEED, MIN_SPEED, MAX_SPEED);
let playing = true;
let simDays = 0;
let lastFrameTime = performance.now();
let frameTime = lastFrameTime;

const asteroids = Array.from({length: ASTEROID_COUNT}, () => {
 const orbit = BELT_INNER + Math.random() * (BELT_OUTER - BELT_INNER);
 return {phase: Math.random() * TAU, orbit, period: 1300 + (orbit - BELT_INNER) * 20, size: .5 + Math.random() * 1.7, alpha: .15 + Math.random() * .55};
});
const ripples = [];

/* ---------- pamięć przeglądarki ---------- */

const discovered = new Set();
try {
 JSON.parse(loadStored('kosmos2.discovered', '[]')).forEach(id => {
  if (knownIds.has(id)) discovered.add(id);
 });
} catch (error) {}
//__SPEECH__

function currentItem() {
 return view.find || bodies[view.selected];
}

/* ---------- układ okna i obszar sceny ---------- */

function layout() {
 const compact = compactQuery.matches;
 const free = {left: 0, top: compact ? 76 : 84, right: view.width, bottom: view.height};
 if (compact) {
  const dockRect = dock.getBoundingClientRect();
  if (dockRect.width < view.width * .7) free.right = dockRect.left - 12;
  else free.bottom = dockRect.top - 8;
 } else {
  free.left = 175;
  free.right = infoPanel.getBoundingClientRect().left - 16;
  free.bottom = controlsPanel.getBoundingClientRect().top - 8;
 }
 if (free.right - free.left < 200) free.right = free.left + 200;
 if (free.bottom - free.top < 140) free.bottom = free.top + 140;
 view.free = free;
 if (view.following && view.selected !== null) view.zoomGoal = followZoom(view.selected);
}

function defaultTilt() {
 const width = view.free.right - view.free.left;
 const height = view.free.bottom - view.free.top;
 return width / height < 1 ? .5 : .32;
}

function resize() {
 view.width = window.innerWidth;
 view.height = window.innerHeight;
 view.dpr = Math.min(window.devicePixelRatio || 1, 2);
 canvas.width = Math.round(view.width * view.dpr);
 canvas.height = Math.round(view.height * view.dpr);
 ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
 layout();
}

/* ---------- rzutowanie i kamera ---------- */

function fitScale() {
 const halfWidth = (view.free.right - view.free.left) / 2 - 10;
 const halfHeight = (view.free.bottom - view.free.top) / 2 - 10;
 const extent = MAX_ORBIT + 16;
 return Math.max(.15, Math.min(halfWidth / extent, halfHeight / (extent * view.tilt)));
}

function orbitPhase(body) {
 return body.startPhase + simDays / body.period * TAU + view.angle;
}

function cometPoint(body, eccentricAnomaly) {
 const semiMinor = body.semiMajor * Math.sqrt(1 - body.eccentricity * body.eccentricity);
 const x = body.semiMajor * (Math.cos(eccentricAnomaly) - body.eccentricity);
 const y = semiMinor * Math.sin(eccentricAnomaly);
 const rotation = body.perihelionAngle + view.angle;
 return {
  x: x * Math.cos(rotation) - y * Math.sin(rotation),
  y: x * Math.sin(rotation) + y * Math.cos(rotation),
  distance: Math.hypot(x, y)
 };
}

function cometState(body) {
 let meanAnomaly = (body.startAnomaly + simDays / body.period * TAU) % TAU;
 if (meanAnomaly > Math.PI) meanAnomaly -= TAU;
 let eccentric = meanAnomaly + body.eccentricity * Math.sin(meanAnomaly);
 for (let step = 0; step < 8; step++) {
  eccentric -= (eccentric - body.eccentricity * Math.sin(eccentric) - meanAnomaly) / (1 - body.eccentricity * Math.cos(eccentric));
 }
 return cometPoint(body, eccentric);
}

function bodyOffset(body, scaleValue) {
 if (body.kind === 'star') return {x: 0, y: 0, distance: 0};
 if (body.kind === 'comet') {
  const state = cometState(body);
  return {x: state.x * scaleValue, y: state.y * scaleValue * view.tilt, distance: state.distance};
 }
 if (body.kind === 'moon') {
  const parentOffset = bodyOffset(bodies[bodyIndex(body.parentId)], scaleValue);
  const phase = orbitPhase(body);
  return {
   x: parentOffset.x + Math.cos(phase) * body.moonOrbit * scaleValue,
   y: parentOffset.y + Math.sin(phase) * body.moonOrbit * scaleValue * view.tilt,
   distance: parentOffset.distance
  };
 }
 const phase = orbitPhase(body);
 return {x: Math.cos(phase) * body.orbit * scaleValue, y: Math.sin(phase) * body.orbit * scaleValue * view.tilt, distance: body.orbit};
}

function bodyRadius(body, scaleValue) {
 return Math.max(3 + body.radius * .3, body.radius * scaleValue * 1.25);
}

function sunRadius(scaleValue) {
 return Math.max(13, bodies[0].radius * scaleValue);
}

function followTarget(scaleValue) {
 const body = bodies[view.selected];
 if (!view.following || body.kind === 'star') return {x: 0, y: 0};
 const offset = bodyOffset(body, scaleValue);
 return {x: -offset.x, y: -offset.y};
}

function computeFrame() {
 const scaleValue = fitScale() * view.zoom;
 const target = followTarget(scaleValue);
 return {
  scale: scaleValue,
  sunX: (view.free.left + view.free.right) / 2 + target.x + view.carryX,
  sunY: (view.free.top + view.free.bottom) / 2 + target.y + view.carryY
 };
}

function focusRadius(body) {
 const base = Math.min(view.free.right - view.free.left, view.free.bottom - view.free.top);
 if (body.kind === 'comet') return base * .11;
 if (body.ring) {
  const outer = Math.max(...body.ring.bands.map(band => band.scale + band.width / 2));
  return base * .4 / outer;
 }
 return base * .3;
}

function followZoom(index) {
 const body = bodies[index];
 const unit = body.kind === 'star' ? body.radius * fitScale() : body.radius * fitScale() * 1.25;
 return clamp(focusRadius(body) / unit, 1.8, MAX_ZOOM);
}

function setSelection(following, index) {
 const scaleValue = fitScale() * view.zoom;
 const before = followTarget(scaleValue);
 const panX = before.x + view.carryX;
 const panY = before.y + view.carryY;
 view.following = following;
 view.selected = index;
 const after = followTarget(scaleValue);
 view.carryX = panX - after.x;
 view.carryY = panY - after.y;
}

function updateCamera(dt) {
 const easing = 1 - Math.exp(-dt * 7);
 view.zoom = Math.exp(Math.log(view.zoom) + (Math.log(view.zoomGoal) - Math.log(view.zoom)) * easing);
 if (Math.abs(view.zoom / view.zoomGoal - 1) < .0005) view.zoom = view.zoomGoal;
 if (view.angleGoal !== null) {
  view.angle += (view.angleGoal - view.angle) * easing;
  if (Math.abs(view.angleGoal - view.angle) < .002) {view.angle = view.angleGoal; view.angleGoal = null;}
 }
 if (view.tiltGoal !== null) {
  view.tilt += (view.tiltGoal - view.tilt) * easing;
  if (Math.abs(view.tiltGoal - view.tilt) < .002) {view.tilt = view.tiltGoal; view.tiltGoal = null;}
 }
 const decay = Math.exp(-dt * 6);
 view.carryX *= decay;
 view.carryY *= decay;
}

/* ---------- rysowanie ---------- */

function lighten(hex, factor) {
 const value = parseInt(hex.slice(1), 16);
 const red = Math.round(Math.min(255, ((value >> 16) & 255) * factor));
 const green = Math.round(Math.min(255, ((value >> 8) & 255) * factor));
 const blue = Math.round(Math.min(255, (value & 255) * factor));
 return `rgb(${red},${green},${blue})`;
}

function glow(x, y, radius, color) {
 const gradient = ctx.createRadialGradient(x, y, Math.max(1, radius * .2), x, y, radius * 3.8);
 gradient.addColorStop(0, color);
 gradient.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.fillStyle = gradient;
 ctx.beginPath();
 ctx.arc(x, y, radius * 3.8, 0, TAU);
 ctx.fill();
}

function heartPath(centerX, centerY, size) {
 const path = new Path2D();
 path.moveTo(centerX, centerY + size * .9);
 path.bezierCurveTo(centerX - size * 1.3, centerY + size * .2, centerX - size * .9, centerY - size * .9, centerX, centerY - size * .35);
 path.bezierCurveTo(centerX + size * .9, centerY - size * .9, centerX + size * 1.3, centerY + size * .2, centerX, centerY + size * .9);
 path.closePath();
 return path;
}

function drawBackground() {
 ctx.fillStyle = '#020611';
 ctx.fillRect(0, 0, view.width, view.height);
 /* projekcja sferyczna: gwiazdy leżą na odległej sferze niebieskiej i
  * obracają się razem z ruchem kamery (view.angle / view.tilt), więc przy
  * przesuwaniu nie wyglądają jak nieruchoma warstwa UI; przy oddalaniu
  * delikatnie uciekają na zewnątrz (lekka paralaksa względem centrum) */
 const centerX = (view.free.left + view.free.right) / 2;
 const centerY = (view.free.top + view.free.bottom) / 2;
 const radius = Math.hypot(view.free.right - view.free.left, view.free.bottom - view.free.top) * .75;
 const cosA = Math.cos(-view.angle), sinA = Math.sin(-view.angle);
 const tilt = view.tilt;
 const project = star => {
  const rx = star.x * cosA - star.y * sinA;
  const ry = star.x * sinA + star.y * cosA;
  const screenX = centerX + rx * radius;
  const screenY = centerY - star.z * radius * (1 - (1 - tilt) * .4) - ry * radius * (1 - tilt) * .6;
  return {screenX, screenY, depth: star.z * tilt + ry * (1 - tilt)};
 };
 const depth = .25 + .35 * (1 - tilt) + .4 * Math.min(1, Math.max(0, Math.log2(view.zoom + 1) / 8));
 for (const constellation of SKY_CONSTELLATIONS) {
  ctx.strokeStyle = `rgba(120,160,220,${.14 * depth})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  let drawing = false;
  for (const [a, b] of constellation.lines) {
   const first = project(SKY_STARS[a]);
   const second = project(SKY_STARS[b]);
   if (first.depth <= 0 || second.depth <= 0) {drawing = false; continue;}
   if (!drawing) {ctx.moveTo(first.screenX, first.screenY); drawing = true;}
   ctx.lineTo(second.screenX, second.screenY);
  }
  ctx.stroke();
 }
 ctx.fillStyle = '#c4e3ff';
 for (const star of SKY_STARS) {
  const projected = project(star);
  if (projected.depth <= 0) continue;
  if (projected.screenX < -8 || projected.screenX > view.width + 8 || projected.screenY < -8 || projected.screenY > view.height + 8) continue;
  ctx.globalAlpha = star.alpha * depth;
  ctx.beginPath();
  ctx.arc(projected.screenX, projected.screenY, star.size, 0, TAU);
  ctx.fill();
  if (star.bright) {
   ctx.globalAlpha = star.alpha * depth * .5;
   ctx.beginPath();
   ctx.arc(projected.screenX, projected.screenY, star.size * 2.4, 0, TAU);
   ctx.fill();
  }
 }
 ctx.globalAlpha = 1;
 ctx.globalAlpha = 1;
 const nebula = ctx.createRadialGradient(view.width * .42, view.height * .4, 0, view.width * .42, view.height * .4, Math.max(view.width, view.height) * .7);
 nebula.addColorStop(0, 'rgba(16,45,95,.18)');
 nebula.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.fillStyle = nebula;
 ctx.fillRect(0, 0, view.width, view.height);
}

function drawAttention(x, y, radius, index) {
 if (!discovered.has(bodies[index].id)) {
  const pulse = Math.sin(frameTime * .003 + index) * .5 + .5;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = `rgba(255,226,110,${.1 + .25 * pulse})`;
  ctx.beginPath();
  ctx.arc(x, y, radius + 7 + pulse * 4, 0, TAU);
  ctx.stroke();
 }
 if (index === view.selected && !view.find && !view.following) {
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#4cbaff';
  ctx.beginPath();
  ctx.arc(x, y, radius + 5, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(39,144,255,.28)';
  ctx.beginPath();
  ctx.arc(x, y, radius + 10, 0, TAU);
  ctx.stroke();
 }
}

const SUNSPOTS = [
 {x: .32, y: .38, r: .028, tilt: .3}, {x: .58, y: .3, r: .022, tilt: -.5}, {x: .7, y: .58, r: .026, tilt: .9},
 {x: .42, y: .68, r: .02, tilt: 1.4}, {x: .24, y: .56, r: .018, tilt: -.9}, {x: .52, y: .5, r: .016, tilt: .1},
 {x: .78, y: .4, r: .015, tilt: 2.}, {x: .36, y: .2, r: .017, tilt: -1.7}, {x: .62, y: .74, r: .019, tilt: .6},
 {x: .18, y: .34, r: .014, tilt: 1.1}
];
let sunSurface = null;

function paintSunSurface(c, size, withSpots) {
 const gradient = c.createRadialGradient(size * .42, size * .4, size * .02, size / 2, size / 2, size * .54);
 gradient.addColorStop(0, '#fff2a6');
 gradient.addColorStop(.4, '#ffc63a');
 gradient.addColorStop(.8, '#ff8a1c');
 gradient.addColorStop(1, '#d4521a');
 c.fillStyle = gradient;
 c.fillRect(0, 0, size, size);
 let seed = 11;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 for (let granule = 0; granule < 2600; granule++) {
  const granuleX = random() * size;
  const granuleY = random() * size;
  const granuleSize = size * (.006 + random() * .018);
  c.fillStyle = random() < .5 ? 'rgba(255,244,180,.11)' : 'rgba(190,60,10,.1)';
  c.beginPath();
  c.arc(granuleX, granuleY, granuleSize, 0, TAU);
  c.fill();
 }
 if (!withSpots) return;
 c.lineCap = 'round';
 for (const spot of SUNSPOTS) {
  const spotX = spot.x * size;
  const spotY = spot.y * size;
  const spotSize = spot.r * size;
  /* półcień (penumbra) — jaśniejsza otoczka */
  c.fillStyle = 'rgba(140,55,12,.32)';
  c.beginPath();
  c.ellipse(spotX, spotY, spotSize * 2.1, spotSize * 1.7, spot.tilt, 0, TAU);
  c.fill();
  /* włókna półcienia — krótkie promieniste kreseczki */
  c.strokeStyle = 'rgba(120,40,8,.28)';
  c.lineWidth = Math.max(1, spotSize * .22);
  for (let fiber = 0; fiber < 8; fiber++) {
   const angle = fiber / 8 * TAU + spot.tilt;
   const from = spotSize * 1.15;
   const to = spotSize * 1.9;
   c.beginPath();
   c.moveTo(spotX + Math.cos(angle) * from, spotY + Math.sin(angle) * from * .85);
   c.lineTo(spotX + Math.cos(angle) * to, spotY + Math.sin(angle) * to * .85);
   c.stroke();
  }
  /* umbra — ciemne jądro plamy */
  c.fillStyle = 'rgba(35,12,4,.9)';
  c.beginPath();
  c.ellipse(spotX, spotY, spotSize, spotSize * .8, spot.tilt, 0, TAU);
  c.fill();
 }
 c.lineCap = 'butt';
}

function sunTexture() {
 if (sunSurface) return sunSurface;
 sunSurface = document.createElement('canvas');
 sunSurface.width = 512;
 sunSurface.height = 512;
 paintSunSurface(sunSurface.getContext('2d'), 512, true);
 return sunSurface;
}

function drawSun(frame) {
 const radius = sunRadius(frame.scale);
 const x = frame.sunX;
 const y = frame.sunY;
 glow(x, y, radius, 'rgba(255,158,49,.32)');
 if (radius > 38) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();
  ctx.translate(x, y);
  ctx.rotate(frameTime * .000012);
  ctx.drawImage(sunTexture(), -radius * 1.42, -radius * 1.42, radius * 2.84, radius * 2.84);
  ctx.restore();
  const limb = ctx.createRadialGradient(x, y, radius * .6, x, y, radius);
  limb.addColorStop(0, 'rgba(120,20,0,0)');
  limb.addColorStop(1, 'rgba(120,20,0,.45)');
  ctx.fillStyle = limb;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  if (radius > 90) {
   ctx.lineCap = 'round';
   [[-.7, .16, 1], [.5, .12, .8], [2.2, .2, 1.1], [3.7, .14, .9]].forEach(([angle, spread, height], index) => {
    const wave = 1 + Math.sin(frameTime * .0012 + index * 2) * .08;
    const inner = radius * .995;
    const outer = radius * (1 + .16 * height * wave);
    const fromX = x + Math.cos(angle - spread) * inner;
    const fromY = y + Math.sin(angle - spread) * inner;
    const toX = x + Math.cos(angle + spread) * inner;
    const toY = y + Math.sin(angle + spread) * inner;
    const tipX = x + Math.cos(angle) * outer;
    const tipY = y + Math.sin(angle) * outer;
    ctx.strokeStyle = 'rgba(255,110,40,.75)';
    ctx.lineWidth = Math.max(2, radius * .018);
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.quadraticCurveTo(tipX + (fromX - toX) * .3, tipY + (fromY - toY) * .3, toX, toY);
    ctx.stroke();
   });
  }
 } else {
  const gradient = ctx.createRadialGradient(x - radius * .25, y - radius * .3, 1, x, y, radius);
  gradient.addColorStop(0, '#fff8b0');
  gradient.addColorStop(.35, '#ffc94d');
  gradient.addColorStop(.78, '#ff851e');
  gradient.addColorStop(1, '#c63e13');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
 }
 ctx.strokeStyle = 'rgba(255,193,89,.25)';
 ctx.lineWidth = 1;
 ctx.beginPath();
 ctx.arc(x, y, radius + 4, 0, TAU);
 ctx.stroke();
 drawAttention(x, y, radius + 3, 0);
 view.sunTarget = {body: bodies[0], index: 0, x, y, radius};
}

function drawOrbits(frame) {
 ctx.lineWidth = 1;
 bodies.forEach((body, index) => {
  if (body.kind === 'star' || body.kind === 'moon') return;
  const selected = index === view.selected;
  ctx.strokeStyle = selected ? 'rgba(88,185,255,.6)' : 'rgba(104,171,239,.29)';
  ctx.setLineDash(body.kind === 'planet' ? [] : [4, 6]);
  ctx.beginPath();
  if (body.kind === 'comet') {
   for (let step = 0; step <= 120; step++) {
    const point = cometPoint(body, step / 120 * TAU);
    const pointX = frame.sunX + point.x * frame.scale;
    const pointY = frame.sunY + point.y * frame.scale * view.tilt;
    if (step === 0) ctx.moveTo(pointX, pointY);
    else ctx.lineTo(pointX, pointY);
   }
  } else {
   ctx.ellipse(frame.sunX, frame.sunY, body.orbit * frame.scale, body.orbit * frame.scale * view.tilt, 0, 0, TAU);
  }
  ctx.stroke();
 });
 bodies.forEach((body, index) => {
  if (body.kind !== 'moon') return;
  const parentOffset = bodyOffset(bodies[bodyIndex(body.parentId)], frame.scale);
  ctx.strokeStyle = index === view.selected ? 'rgba(88,185,255,.6)' : 'rgba(104,171,239,.29)';
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.ellipse(frame.sunX + parentOffset.x, frame.sunY + parentOffset.y, body.moonOrbit * frame.scale, body.moonOrbit * frame.scale * view.tilt, 0, 0, TAU);
  ctx.stroke();
 });
 ctx.setLineDash([]);
}

function drawAsteroids(frame) {
 ctx.fillStyle = '#a7a5a1';
 for (const rock of asteroids) {
  const phase = rock.phase + simDays / rock.period * TAU + view.angle;
  const x = frame.sunX + Math.cos(phase) * rock.orbit * frame.scale;
  const y = frame.sunY + Math.sin(phase) * rock.orbit * frame.scale * view.tilt;
  if (x < -4 || x > view.width + 4 || y < -4 || y > view.height + 4) continue;
  ctx.globalAlpha = rock.alpha;
  ctx.beginPath();
  ctx.arc(x, y, clamp(rock.size * frame.scale * .8, .6, 3), 0, TAU);
  ctx.fill();
 }
 ctx.globalAlpha = 1;
}

function drawRing(x, y, radius, ring, half) {
 const start = half === 'back' ? Math.PI : 0;
 const ratio = .16 + view.tilt * .42;
 ctx.save();
 ctx.translate(x, y);
 ctx.rotate(ring.angle);
 for (const band of ring.bands) {
  ctx.strokeStyle = band.color;
  ctx.lineWidth = Math.max(1.5, radius * band.width);
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * band.scale, radius * band.scale * ratio, 0, start, start + Math.PI);
  ctx.stroke();
 }
 ctx.restore();
}

function drawSurface(x, y, radius, body) {
 switch (body.surface) {
  case 'earth':
   ctx.fillStyle = '#4eaa69';
   ctx.beginPath();
   ctx.ellipse(x - radius * .18, y - radius * .12, radius * .32, radius * .2, -.4, 0, TAU);
   ctx.fill();
   ctx.beginPath();
   ctx.ellipse(x + radius * .3, y + radius * .22, radius * .23, radius * .33, .7, 0, TAU);
   ctx.fill();
   ctx.fillStyle = '#d9e6c4';
   ctx.beginPath();
   ctx.ellipse(x - radius * .05, y - radius * .7, radius * .22, radius * .12, 0, 0, TAU);
   ctx.fill();
   break;
  case 'jupiter':
  case 'saturn':
   ctx.strokeStyle = body.surface === 'jupiter' ? 'rgba(114,71,39,.4)' : 'rgba(120,91,54,.48)';
   ctx.lineWidth = Math.max(1, radius * .16);
   for (let band = -2; band <= 2; band++) {
    ctx.beginPath();
    ctx.moveTo(x - radius, y + band * radius * .3);
    ctx.lineTo(x + radius, y + band * radius * .3);
    ctx.stroke();
   }
   if (body.surface === 'jupiter') {
    ctx.fillStyle = 'rgba(160,70,40,.75)';
    ctx.beginPath();
    ctx.ellipse(x + radius * .3, y + radius * .5, radius * .2, radius * .1, 0, 0, TAU);
    ctx.fill();
   }
   break;
  case 'mars':
   ctx.fillStyle = '#6e3425';
   ctx.beginPath();
   ctx.arc(x + radius * .3, y - radius * .1, radius * .19, 0, TAU);
   ctx.fill();
   break;
  case 'ceres':
   ctx.fillStyle = 'rgba(40,36,34,.35)';
   ctx.beginPath();
   ctx.arc(x - radius * .3, y + radius * .2, radius * .25, 0, TAU);
   ctx.fill();
   ctx.fillStyle = 'rgba(255,255,255,.9)';
   ctx.beginPath();
   ctx.arc(x + radius * .25, y - radius * .2, Math.max(.8, radius * .14), 0, TAU);
   ctx.fill();
   break;
  case 'pluto':
   ctx.fillStyle = 'rgba(70,40,34,.55)';
   ctx.beginPath();
   ctx.ellipse(x - radius * .55, y + radius * .1, radius * .4, radius * .55, 0, 0, TAU);
   ctx.fill();
   if (radius >= 6) {
    ctx.fillStyle = '#f3e6d3';
    ctx.fill(heartPath(x + radius * .22, y - radius * .02, radius * .42));
   }
   break;
 }
}

function drawNucleus(x, y, radius, sunDirX, sunDirY) {
 glow(x, y, radius * .9, 'rgba(190,235,255,.3)');
 const rotation = .5;
 const localSunX = sunDirX * Math.cos(-rotation) - sunDirY * Math.sin(-rotation);
 const localSunY = sunDirX * Math.sin(-rotation) + sunDirY * Math.cos(-rotation);
 let seed = 5;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 const count = 20;
 const shape = [];
 for (let step = 0; step < count; step++) {
  const angle = step / count * TAU;
  const wobble = .86 + random() * .26;
  shape.push({x: Math.cos(angle) * radius * 1.3 * wobble, y: Math.sin(angle) * radius * .78 * wobble});
 }
 ctx.save();
 ctx.translate(x, y);
 ctx.rotate(rotation);
 ctx.beginPath();
 shape.forEach((point, step) => {
  const next = shape[(step + 1) % count];
  const midX = (point.x + next.x) / 2;
  const midY = (point.y + next.y) / 2;
  if (step === 0) ctx.moveTo(midX, midY);
  else ctx.quadraticCurveTo(point.x, point.y, midX, midY);
 });
 const first = shape[0];
 const second = shape[1];
 ctx.quadraticCurveTo(first.x, first.y, (first.x + second.x) / 2, (first.y + second.y) / 2);
 ctx.closePath();
 const body = ctx.createRadialGradient(localSunX * radius * .6, localSunY * radius * .5, radius * .1, 0, 0, radius * 1.5);
 body.addColorStop(0, '#5d544c');
 body.addColorStop(.55, '#28221e');
 body.addColorStop(1, '#0a0807');
 ctx.fillStyle = body;
 ctx.fill();
 ctx.save();
 ctx.clip();
 for (let crater = 0; crater < 14; crater++) {
  const angle = random() * TAU;
  const distance = random() * radius * .8;
  const craterSize = radius * (.06 + random() * .13);
  const craterX = Math.cos(angle) * distance * 1.2;
  const craterY = Math.sin(angle) * distance * .7;
  ctx.fillStyle = 'rgba(0,0,0,.35)';
  ctx.beginPath();
  ctx.ellipse(craterX, craterY, craterSize, craterSize * .8, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,175,160,.14)';
  ctx.beginPath();
  ctx.ellipse(craterX - craterSize * .2, craterY - craterSize * .2, craterSize * .7, craterSize * .5, 0, 0, TAU);
  ctx.fill();
 }
 ctx.restore();
 ctx.lineCap = 'round';
 for (let jet = 0; jet < 5; jet++) {
  const angle = Math.atan2(localSunY, localSunX) + (jet - 2) * .38;
  const startX = Math.cos(angle) * radius * 1.05;
  const startY = Math.sin(angle) * radius * .7;
  const length = radius * (.35 + random() * .35);
  const gradient = ctx.createLinearGradient(startX, startY, startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
  gradient.addColorStop(0, 'rgba(210,240,255,.8)');
  gradient.addColorStop(1, 'rgba(210,240,255,0)');
  ctx.strokeStyle = gradient;
  ctx.lineWidth = Math.max(2, radius * .06);
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(startX + Math.cos(angle) * length, startY + Math.sin(angle) * length);
  ctx.stroke();
 }
 ctx.restore();
}

function drawComet(item, frame) {
 const {x, y, radius, distance} = item;
 const directionX = x - frame.sunX;
 const directionY = y - frame.sunY;
 const length = Math.hypot(directionX, directionY) || 1;
 const unitX = directionX / length;
 const unitY = directionY / length;
 const normalX = -unitY;
 const normalY = unitX;
 const zoomed = radius > 22;
 /* jądro: małe i ciemne, coma: duża, jasna otoczka — proporcja jak w naturze */
 const nucleusRadius = zoomed ? Math.min(radius, 34) : Math.min(radius, 4);
 const comaRadius = nucleusRadius * (zoomed ? 3.2 : 7.5);
 const activity = Math.pow(Math.max(0, 1 - distance / 950), .8);
 const tailLength = activity * 170 * (zoomed ? 4.2 : clamp(frame.scale, .5, 1.5));
 /* ogon jonowy — wąski, prosty, niebieskawy; ogon pyłowy — szerszy, lekko zakrzywiony, żółtawy */
 if (tailLength > 4) {
  const ionEndX = x + unitX * tailLength;
  const ionEndY = y + unitY * tailLength;
  const ionSpread = comaRadius * .55;
  const ionEndSpread = tailLength * .05;
  let ionGradient = ctx.createLinearGradient(x, y, ionEndX, ionEndY);
  ionGradient.addColorStop(0, 'rgba(150,215,255,.85)');
  ionGradient.addColorStop(.5, 'rgba(120,190,255,.35)');
  ionGradient.addColorStop(1, 'rgba(120,190,255,0)');
  ctx.fillStyle = ionGradient;
  ctx.beginPath();
  ctx.moveTo(x + normalX * ionSpread, y + normalY * ionSpread);
  ctx.quadraticCurveTo(x + unitX * tailLength * .55 + normalX * ionEndSpread * .7, y + unitY * tailLength * .55 + normalY * ionEndSpread * .7, ionEndX + normalX * ionEndSpread, ionEndY + normalY * ionEndSpread);
  ctx.lineTo(ionEndX - normalX * ionEndSpread, ionEndY - normalY * ionEndSpread);
  ctx.quadraticCurveTo(x + unitX * tailLength * .55 - normalX * ionEndSpread * .7, y + unitY * tailLength * .55 - normalY * ionEndSpread * .7, x - normalX * ionSpread, y - normalY * ionSpread);
  ctx.closePath();
  ctx.fill();
  const curve = tailLength * .22;
  const dustEndX = x + unitX * tailLength * .78 + normalX * curve;
  const dustEndY = y + unitY * tailLength * .78 + normalY * curve;
  const dustSpread = comaRadius * 1.2;
  const dustEndSpread = tailLength * .22;
  let dustGradient = ctx.createLinearGradient(x, y, dustEndX, dustEndY);
  dustGradient.addColorStop(0, 'rgba(255,225,170,.6)');
  dustGradient.addColorStop(.6, 'rgba(255,205,130,.25)');
  dustGradient.addColorStop(1, 'rgba(255,205,130,0)');
  ctx.fillStyle = dustGradient;
  ctx.beginPath();
  ctx.moveTo(x + normalX * dustSpread, y + normalY * dustSpread);
  ctx.quadraticCurveTo(x + unitX * tailLength * .4 + normalX * (dustEndSpread * .5 + curve * .4), y + unitY * tailLength * .4 + normalY * (dustEndSpread * .5 + curve * .4), dustEndX + normalX * dustEndSpread, dustEndY + normalY * dustEndSpread);
  ctx.lineTo(dustEndX - normalX * dustEndSpread, dustEndY - normalY * dustEndSpread);
  ctx.quadraticCurveTo(x + unitX * tailLength * .4 - normalX * (dustEndSpread * .5 + curve * .4), y + unitY * tailLength * .4 - normalY * (dustEndSpread * .5 + curve * .4), x - normalX * dustSpread, y - normalY * dustSpread);
  ctx.closePath();
  ctx.fill();
 }
 /* coma — rozmyta, jasna otoczka, lekko przesunięta od Słońca */
 const comaCenterX = x + unitX * comaRadius * .18;
 const comaCenterY = y + unitY * comaRadius * .18;
 const coma = ctx.createRadialGradient(comaCenterX, comaCenterY, comaRadius * .1, comaCenterX, comaCenterY, comaRadius);
 coma.addColorStop(0, 'rgba(240,250,255,.95)');
 coma.addColorStop(.45, 'rgba(190,230,255,.55)');
 coma.addColorStop(1, 'rgba(150,210,255,0)');
 ctx.fillStyle = coma;
 ctx.beginPath();
 ctx.arc(comaCenterX, comaCenterY, comaRadius, 0, TAU);
 ctx.fill();
 /* jądro */
 if (zoomed) drawNucleus(x, y, nucleusRadius, -unitX, -unitY);
 else {
  const nucleus = ctx.createRadialGradient(x - nucleusRadius * .35, y - nucleusRadius * .35, nucleusRadius * .2, x, y, nucleusRadius * 1.1);
  nucleus.addColorStop(0, '#8a8177');
  nucleus.addColorStop(1, '#241f1c');
  ctx.fillStyle = nucleus;
  ctx.beginPath();
  ctx.arc(x, y, nucleusRadius, 0, TAU);
  ctx.fill();
 }
 drawAttention(x, y, radius, item.index);
}

const START_ROTATION = {pluto: .2, jupiter: -.85, mars: .3, ceres: 1.1, mercury: 2.2};
const globeState = {rotation: {}, velocity: 0};

function rotationOf(body) {
 if (globeState.rotation[body.id] === undefined) globeState.rotation[body.id] = START_ROTATION[body.id] || 0;
 return globeState.rotation[body.id];
}

function shadeBall(x, y, radius, frame) {
 const deltaX = frame.sunX - x;
 const deltaY = frame.sunY - y;
 const length = Math.hypot(deltaX, deltaY) || 1;
 const gradient = ctx.createRadialGradient(x + deltaX / length * radius * .55, y + deltaY / length * radius * .55, radius * .12, x, y, radius * 1.12);
 gradient.addColorStop(0, 'rgba(0,0,6,0)');
 gradient.addColorStop(.5, 'rgba(0,0,6,.16)');
 gradient.addColorStop(.82, 'rgba(0,0,8,.55)');
 gradient.addColorStop(1, 'rgba(0,0,10,.85)');
 ctx.fillStyle = gradient;
 ctx.beginPath();
 ctx.arc(x, y, radius, 0, TAU);
 ctx.fill();
}

function drawTexturedBall(body, x, y, radius, frame) {
 if (body.photo) {
  const photo = imageOf(body.texture);
  if (!photo) return false;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();
  ctx.drawImage(photo, x - radius * 1.02, y - radius * 1.02, radius * 2.04, radius * 2.04);
  ctx.restore();
  return true;
 }
 const pixelRadius = radius * view.dpr;
 const size = pixelRadius > 240 ? 512 : pixelRadius > 130 ? 384 : pixelRadius > 60 ? 256 : 160;
 const globe = globeOf(body.texture, size, body.tilt);
 if (!globe) return false;
 const rotation = rotationOf(body);
 if (globe.lastRotation === undefined || Math.abs(globe.lastRotation - rotation) > .0004) {
  globe.render(rotation);
  globe.lastRotation = rotation;
 }
 ctx.save();
 ctx.beginPath();
 ctx.arc(x, y, radius, 0, TAU);
 ctx.clip();
 ctx.drawImage(globe.canvas, x - radius, y - radius, radius * 2, radius * 2);
 ctx.restore();
 shadeBall(x, y, radius, frame);
 return true;
}

function drawPlanet(item, frame) {
 const {body, index, x, y, radius} = item;
 glow(x, y, radius, body.color + '35');
 if (body.ring) drawRing(x, y, radius, body.ring, 'back');
 const textured = body.texture && radius >= 9 && drawTexturedBall(body, x, y, radius, frame);
 if (!textured) {
  const gradient = ctx.createRadialGradient(x - radius * .4, y - radius * .45, radius * .04, x + radius * .12, y + radius * .12, radius * 1.25);
  gradient.addColorStop(0, lighten(body.color, 1.55));
  gradient.addColorStop(.5, body.color);
  gradient.addColorStop(1, '#070b16');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();
  drawSurface(x, y, radius, body);
  ctx.restore();
 }
 if (body.ring) drawRing(x, y, radius, body.ring, 'front');
 drawAttention(x, y, radius, index);
}

function drawProbeIcon(x, y, size, angle) {
 ctx.save();
 ctx.translate(x, y);
 ctx.rotate(angle);
 ctx.fillStyle = '#3b6fd8';
 ctx.fillRect(-size * 1.7, -size * .35, size * 1.1, size * .7);
 ctx.fillRect(size * .6, -size * .35, size * 1.1, size * .7);
 ctx.fillStyle = '#e4c77a';
 ctx.fillRect(-size * .6, -size * .6, size * 1.2, size * 1.2);
 ctx.restore();
}

function drawProbeSprite(find, x, y, width) {
 const image = find.sprite ? imageOf(find.sprite) : null;
 if (image) {
  const height = width * image.naturalHeight / image.naturalWidth;
  ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
  return;
 }
 if (find.draw && PROBE_BOX[find.draw]) {
  const height = width * .8;
  ctx.save();
  ctx.translate(x - width / 2, y - height / 2);
  PROBE_BOX[find.draw](ctx, width, height);
  ctx.restore();
  return;
 }
 drawProbeIcon(x, y, width / 5, 0);
}

function drawFinds(items) {
 view.findTargets = [];
 const parent = items[view.selected];
 if (!parent || !view.following || parent.radius < 40) return;
 const list = finds.filter(find => find.parentId === parent.body.id);
 const freeWidth = view.free.right - view.free.left;
 const freeHeight = view.free.bottom - view.free.top;
 const spriteWidth = clamp(Math.min(freeWidth, freeHeight) * .17, 52, 110);
 const horizontal = Math.max(parent.radius * 1.15, Math.min(parent.radius * 1.7 + spriteWidth * .4, freeWidth / 2 - spriteWidth * .55));
 const vertical = Math.min(horizontal * .66, freeHeight / 2 - spriteWidth * .45);
 ctx.strokeStyle = 'rgba(255,217,90,.22)';
 ctx.lineWidth = 1;
 ctx.setLineDash([3, 6]);
 ctx.beginPath();
 ctx.ellipse(parent.x, parent.y, horizontal, vertical, 0, 0, TAU);
 ctx.stroke();
 ctx.setLineDash([]);
 list.forEach((find, order) => {
  const angle = frameTime * .00022 + order * TAU / list.length + .6;
  const x = parent.x + Math.cos(angle) * horizontal;
  const y = parent.y + Math.sin(angle) * vertical;
  if (!discovered.has(find.id)) {
   const pulse = Math.sin(frameTime * .004) * .5 + .5;
   ctx.strokeStyle = `rgba(255,226,110,${.3 + .5 * pulse})`;
   ctx.lineWidth = 2;
   ctx.beginPath();
   ctx.arc(x, y, spriteWidth * .6 + pulse * 4, 0, TAU);
   ctx.stroke();
  }
  drawProbeSprite(find, x, y, spriteWidth);
  view.findTargets.push({find, x, y, radius: spriteWidth * .6});
 });
}

function drawLabels(items) {
 const fontSize = compactQuery.matches ? 12 : 14;
 const placed = [];
 const ordered = [...items].sort((a, b) => (b.index === view.selected) - (a.index === view.selected));
 ctx.textAlign = 'center';
 ctx.textBaseline = 'alphabetic';
 for (const item of ordered) {
  const isSelected = item.index === view.selected;
  ctx.font = `${isSelected ? 800 : 700} ${fontSize}px ui-rounded, system-ui, sans-serif`;
  const width = ctx.measureText(item.body.name).width;
  const labelY = item.y - item.radius - (isSelected ? 18 : 12);
  const box = {left: item.x - width / 2 - 3, right: item.x + width / 2 + 3, top: labelY - fontSize, bottom: labelY + 3};
  const collides = placed.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top);
  if (collides && !isSelected) continue;
  placed.push(box);
  ctx.fillStyle = isSelected ? '#ffe58a' : '#e6f1ff';
  ctx.fillText(item.body.name, item.x, labelY);
 }
}

function drawRipples() {
 for (const ripple of ripples) {
  const progress = ripple.life / ripple.max;
  ctx.globalAlpha = clamp(1 - progress, 0, 1) * .8;
  ctx.strokeStyle = '#ffe58a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ripple.x, ripple.y, ripple.radius + progress * 46, 0, TAU);
  ctx.stroke();
 }
 ctx.globalAlpha = 1;
}

function draw() {
 const frame = computeFrame();
 drawBackground();
 if (view.zoom < 14) drawOrbits(frame);
 if (view.zoom < 40) drawAsteroids(frame);
 const items = [];
 bodies.forEach((body, index) => {
  if (body.kind === 'star') {items.push(null); return;}
  const offset = bodyOffset(body, frame.scale);
  items.push({body, index, x: frame.sunX + offset.x, y: frame.sunY + offset.y, radius: bodyRadius(body, frame.scale), distance: offset.distance});
 });
 const planetItems = items.filter(Boolean);
 view.targets = planetItems;
 const behind = planetItems.filter(item => item.y < frame.sunY).sort((a, b) => a.y - b.y);
 const inFront = planetItems.filter(item => item.y >= frame.sunY).sort((a, b) => a.y - b.y);
 const paint = item => item.body.kind === 'comet' ? drawComet(item, frame) : drawPlanet(item, frame);
 behind.forEach(paint);
 drawSun(frame);
 inFront.forEach(paint);
 items[0] = view.sunTarget;
 drawFinds(items);
 drawLabels(items);
 drawRipples();
}

//__UI__

/* ---------- gesty na scenie ---------- */

const pointers = new Map();
let gesture = null;

function pointerDistance() {
 const [first, second] = [...pointers.values()];
 return Math.hypot(first.x - second.x, first.y - second.y) || 1;
}

canvas.addEventListener('pointerdown', event => {
 try {canvas.setPointerCapture(event.pointerId);} catch (error) {}
 pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
 if (pointers.size === 1) {
  gesture = {kind: 'drag', startX: event.clientX, startY: event.clientY, angle: view.angle, tilt: view.tilt, rotation: rotationOf(bodies[view.selected]), moved: false};
 } else if (pointers.size === 2) {
  gesture = {kind: 'pinch', startDistance: pointerDistance(), startZoom: view.zoomGoal};
 }
});

canvas.addEventListener('pointermove', event => {
 if (!pointers.has(event.pointerId)) return;
 pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
 if (!gesture) return;
 if (gesture.kind === 'pinch') {
  if (pointers.size >= 2) {
   view.zoomGoal = clamp(gesture.startZoom * pointerDistance() / gesture.startDistance, MIN_ZOOM, MAX_ZOOM);
   view.zoom = view.zoomGoal;
  }
  return;
 }
 const deltaX = event.clientX - gesture.startX;
 const deltaY = event.clientY - gesture.startY;
 if (!gesture.moved && Math.abs(deltaX) + Math.abs(deltaY) > 8) gesture.moved = true;
 if (!gesture.moved) return;
 if (view.following) {
  const spinBody = bodies[view.selected];
  if (spinBody.texture && !spinBody.photo) globeState.rotation[spinBody.id] = gesture.rotation - deltaX / Math.max(40, focusRadius(spinBody));
  return;
 }
 view.angleGoal = null;
 view.tiltGoal = null;
 view.angle = gesture.angle - deltaX * .006;
 view.tilt = clamp(gesture.tilt + deltaY * .003, MIN_TILT, MAX_TILT);
});

function endPointer(event) {
 if (!pointers.has(event.pointerId)) return;
 const finished = gesture;
 pointers.delete(event.pointerId);
 if (finished && finished.kind === 'drag' && !finished.moved && event.type === 'pointerup') pickAt(event.clientX, event.clientY, event.pointerType);
 gesture = null;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', event => {
 event.preventDefault();
 const delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
 view.zoomGoal = clamp(view.zoomGoal * Math.exp(-delta * .0015), MIN_ZOOM, MAX_ZOOM);
}, {passive: false});

