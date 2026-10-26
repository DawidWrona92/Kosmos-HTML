
const view = {
 width: 0, height: 0, dpr: 1,
 free: {left: 0, top: 0, right: 0, bottom: 0},
 angle: 0, tilt: .32, angleGoal: null, tiltGoal: null,
 zoom: 1, zoomGoal: 1,
 following: false, carryX: 0, carryY: 0,
 selected: bodyIndex('earth'), find: null, moon: null, ring: null, galaxy: null,
 level: 0,
 targets: [], sunTarget: null, findTargets: [], moonTargets: [], ringTarget: null, galaxyTargets: []
};
let speed = clamp(parseFloat(loadStored('kosmos3.speed', String(DEFAULT_SPEED))) || DEFAULT_SPEED, MIN_SPEED, MAX_SPEED);
let playing = true;
let simDays = 0;
let moonDays = 0;
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
 return view.find || view.moon || view.ring || view.galaxy || bodies[view.selected];
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
 if (view.following && view.selected !== null && view.zoomGoal > MIN_ZOOM * 2) view.zoomGoal = focusGoal();
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
 if (body.kind === 'belt') {
  const phase = orbitPhase(body);
  return {x: Math.cos(phase) * body.orbit * scaleValue, y: Math.sin(phase) * body.orbit * scaleValue * view.tilt, distance: body.orbit};
 }
 if (body.kind === 'comet') {
  const state = cometState(body);
  return {x: state.x * scaleValue, y: state.y * scaleValue * view.tilt, distance: state.distance};
 }
 if (body.kind === 'moon') {
  const parentOffset = bodyOffset(bodies[bodyIndex(body.parentId)], scaleValue);
  const phase = body.startPhase + view.angle + moonDays / Math.max(Math.abs(body.period) * 30, 45) * TAU * Math.sign(body.period);
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
 if (body.kind === 'belt') return Math.max(16, (BELT_OUTER - BELT_INNER) * scaleValue * .3);
 return Math.max(3 + body.radius * .3, body.radius * scaleValue * 1.25);
}

function sunRadius(scaleValue) {
 return Math.max(13, bodies[0].radius * scaleValue);
}

function followTarget(scaleValue) {
 const body = bodies[view.selected];
 if (!view.following) return {x: 0, y: 0};
 if (body.kind === 'star') return {x: 0, y: 0};
 const offset = bodyOffset(body, scaleValue);
 return {x: -offset.x, y: -offset.y};
}

/* pozycja podzaznaczenia (księżyc/sonda/pierścień) względem Słońca — liczona z celów
 * ostatniej klatki i faktycznej pozycji Słońca w tej klatce, więc kamera dokładnie
 * centruje na obiekcie i jedzie z nim */
let lastParentScreen = null;
function subTargetOffset() {
 if (!lastParentScreen) return null;
 if (view.moon) {
  const target = view.moonTargets.find(item => item.moon === view.moon);
  if (target) return {x: target.x - lastParentScreen.x, y: target.y - lastParentScreen.y};
 }
 if (view.find) {
  const target = view.findTargets.find(item => item.find === view.find);
  if (target) return {x: target.x - lastParentScreen.x, y: target.y - lastParentScreen.y};
 }
 if (view.ring) {
  const ring = view.ringTarget;
  if (ring) return {x: ring.x - lastParentScreen.x, y: ring.y - lastParentScreen.y};
 }
 return null;
}

function computeFrame() {
 const scaleValue = fitScale() * view.zoom;
 const target = followTarget(scaleValue);
 const sub = subTargetOffset();
 const centerX = (view.free.left + view.free.right) / 2 + target.x + view.carryX;
 const centerY = (view.free.top + view.free.bottom) / 2 + target.y + view.carryY;
 let sunX = sub ? centerX - sub.x : centerX;
 let sunY = sub ? centerY - sub.y : centerY;
 /* oddalanie do galaktyki: środek kadru glisuje ze Słońca na środek Drogi Mlecznej */
 const pan = galaxyPanWeight();
 if (pan > 0) {
  const offset = sunGalaxyOffset();
  sunX += offset.x * pan;
  sunY += offset.y * pan;
 }
 return {scale: scaleValue, sunX, sunY};
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
 syncLevel();
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

function drawBackground(fade = 1) {
 ctx.fillStyle = '#020611';
 ctx.globalAlpha = fade;
 /* zapas przy rotacji roll — pokrywa rogi ekranu po obrocie sceny */
 ctx.fillRect(-view.width, -view.height, view.width * 3, view.height * 3);
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
  ctx.strokeStyle = `rgba(120,160,220,${.14 * depth * fade})`;
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
  ctx.globalAlpha = star.alpha * depth * fade;
  ctx.beginPath();
  ctx.arc(projected.screenX, projected.screenY, star.size, 0, TAU);
  ctx.fill();
  if (star.bright) {
   ctx.globalAlpha = star.alpha * depth * fade * .5;
   ctx.beginPath();
   ctx.arc(projected.screenX, projected.screenY, star.size * 2.4, 0, TAU);
   ctx.fill();
  }
 }
 ctx.globalAlpha = fade;
 const nebula = ctx.createRadialGradient(view.width * .42, view.height * .4, 0, view.width * .42, view.height * .4, Math.max(view.width, view.height) * .7);
 nebula.addColorStop(0, 'rgba(16,45,95,.18)');
 nebula.addColorStop(1, 'rgba(0,0,0,0)');
 ctx.fillStyle = nebula;
 ctx.fillRect(0, 0, view.width, view.height);
 ctx.globalAlpha = 1;
}

/* szara, pulsująca wskazówka nieodkrytego obiektu + znak zapytania —
 * „tu jest coś do odkrycia” (odkryte obiekty nie mają obwódki) */
function drawUnknownHint(x, y, radius, pulseSeed) {
 const pulse = Math.sin(frameTime * .003 + pulseSeed) * .5 + .5;
 ctx.lineWidth = 1.5;
 ctx.strokeStyle = `rgba(178,192,214,${.14 + .3 * pulse})`;
 ctx.beginPath();
 ctx.arc(x, y, radius + 6 + pulse * 3, 0, TAU);
 ctx.stroke();
 /* wyraźny znak zapytania nad obiektem — rozmiar zależny od promienia */
 const markSize = clamp(radius * .45, 12, 26);
 ctx.save();
 ctx.globalAlpha = .55 + .35 * pulse;
 ctx.fillStyle = '#b8c8de';
 ctx.font = `800 ${markSize}px ui-rounded, system-ui, sans-serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('?', x, y - radius - markSize * .9 - pulse * 2);
 ctx.restore();
}

function drawAttention(x, y, radius, index) {
 if (!discovered.has(bodies[index].id)) drawUnknownHint(x, y, radius, index);
 if (index === view.selected && !view.moon && !view.find && !view.ring) {
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
 const map = imageOf('sun_map');
 if (map) {
  sunSurface = document.createElement('canvas');
  sunSurface.width = 512;
  sunSurface.height = 256;
  sunSurface.getContext('2d').drawImage(map, 0, 0, 512, 256);
  return sunSurface;
 }
 sunSurface = document.createElement('canvas');
 sunSurface.width = 512;
 sunSurface.height = 512;
 paintSunSurface(sunSurface.getContext('2d'), 512, true);
 return sunSurface;
}

/* globus Słońca z prawdziwej mapy fotosfery (2:1) — obraca się zgodnie z rotacją,
 * tak jak globusy planet; fallback: proceduralny granulat */
function sunGlobe() {
 const body = bodies[0];
 if (body._globeCache) return body._globeCache;
 const map = imageOf('sun_map');
 if (!map) return null;
 /* globeOf wymaga tekstury w textureOf (cache Uint32) — używamy globusa
  * z fizycznej mapy przez ten sam mechanizm co planety */
 const globe = globeOf('sun_map', 384, 0);
 body._globeCache = globe;
 return globe;
}

function drawSun(frame) {
 const radius = sunRadius(frame.scale);
 const x = frame.sunX;
 const y = frame.sunY;
 glow(x, y, radius, 'rgba(255,158,49,.32)');
 if (radius > 26) {
  const globe = sunGlobe();
  if (globe) {
   if (globe.lastRotation === undefined || Math.abs(globe.lastRotation - frameTime * .00001) > .0004) {
    globe.render(frameTime * .00001);
    globe.lastRotation = frameTime * .00001;
   }
   ctx.save();
   ctx.beginPath();
   ctx.arc(x, y, radius, 0, TAU);
   ctx.clip();
   ctx.drawImage(globe.canvas, x - radius, y - radius, radius * 2, radius * 2);
   ctx.restore();
  } else {
   ctx.save();
   ctx.beginPath();
   ctx.arc(x, y, radius, 0, TAU);
   ctx.clip();
   ctx.translate(x, y);
   ctx.rotate(frameTime * .000012);
   const tex = sunTexture();
   if (tex) {
    const texAspect = tex.height / tex.width;
    const drawW = radius * 2.84;
    ctx.drawImage(tex, -drawW / 2, -drawW * texAspect / 2, drawW, drawW * texAspect);
   } else paintSunSurface(ctx, radius * 2, true);
   ctx.restore();
  }
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
 ctx.lineWidth = 1.4;
 bodies.forEach((body, index) => {
  if (body.kind === 'star' || body.kind === 'moon') return;
  const selected = index === view.selected;
  ctx.strokeStyle = selected ? 'rgba(88,185,255,.85)' : 'rgba(120,180,245,.5)';
  ctx.setLineDash(body.kind === 'planet' || body.kind === 'belt' ? [] : [4, 6]);
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
  ctx.strokeStyle = index === view.selected ? 'rgba(88,185,255,.85)' : 'rgba(120,180,245,.5)';
  ctx.setLineDash([3, 5]);
  ctx.beginPath();
  ctx.ellipse(frame.sunX + parentOffset.x, frame.sunY + parentOffset.y, body.moonOrbit * frame.scale, body.moonOrbit * frame.scale * view.tilt, 0, 0, TAU);
  ctx.stroke();
 });
 ctx.setLineDash([]);
}

function drawAsteroids(frame) {
 ctx.fillStyle = '#a7a5a1';
 const beltItem = view.targets && view.targets.find(item => item.body.kind === 'belt');
 const focused = beltItem && view.following && view.selected === beltItem.index;
 if (focused) {
  /* przybliżenie pasa: wyraźniejsze skały i lekka mgiełka — widać, że to nie pusty pierścień */
  const spread = Math.max(1, frame.scale);
  ctx.save();
  ctx.globalAlpha = .12;
  ctx.strokeStyle = '#cfc9c0';
  ctx.lineWidth = (BELT_OUTER - BELT_INNER) * frame.scale;
  ctx.beginPath();
  ctx.ellipse(frame.sunX, frame.sunY, (BELT_INNER + BELT_OUTER) / 2 * frame.scale, (BELT_INNER + BELT_OUTER) / 2 * frame.scale * view.tilt, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
 }
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
 /* prawdziwy obraz pierścieni Saturna (600x600, zakres 1.11-2.27 R);
  * rysowany połówkami (tył przed planetą, przód po) z maską kątową */
 const photo = ring.photoKey && imageOf(ring.photoKey);
 if (photo) {
  /* obraz pierścieni to koło (widok z góry): spłaszczamy do elipsy o stosunku
   * pion/poziom = ratio, górna połowa elipsy = tył (rysowany przed planetą),
   * dolna = przód (po planecie) */
  const outer = 2.27;
  const w = radius * outer * 2;
  const h = w * ratio;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, 0, w / 2, h / 2, 0, start, start + Math.PI);
  ctx.clip();
  ctx.drawImage(photo, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.restore();
  return;
 }
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
 glow(x, y, radius * 1.1, 'rgba(190,235,255,.25)');
 /* jądro: nieregularna bryłka lodu i pyłu (jak zdjęcia z Giotto):
  * gładki kontur z niewielkimi wypukłościami + cieniowanie od Słońca */
 ctx.save();
 ctx.translate(x, y);
 ctx.rotate(.5);
 const body = ctx.createRadialGradient(-sunDirX * radius * .5, -sunDirY * radius * .5, radius * .15, 0, 0, radius * 1.05);
 body.addColorStop(0, '#8d857c');
 body.addColorStop(.45, '#5d544c');
 body.addColorStop(1, '#17120e');
 ctx.fillStyle = body;
 ctx.beginPath();
 let seed = 5;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 for (let step = 0; step <= 24; step++) {
  const angle = step / 24 * TAU;
  const squash = 1 + Math.sin(angle * 2 + 1.3) * .07 + Math.sin(angle * 3 + .4) * .05;
  const px = Math.cos(angle) * radius * squash;
  const py = Math.sin(angle) * radius * .8 * squash;
  if (step === 0) ctx.moveTo(px, py);
  else ctx.lineTo(px, py);
 }
 ctx.closePath();
 ctx.fill();
 /* fontanny pary — strumienie od strony Słońca */
 ctx.save();
 ctx.clip();
 ctx.strokeStyle = 'rgba(230,245,255,.5)';
 ctx.lineWidth = Math.max(1.2, radius * .07);
 for (let jet = 0; jet < 6; jet++) {
  const angle = Math.atan2(-sunDirY, -sunDirX) + (jet - 2.5) * .3 + (random() - .5) * .2;
  const length = radius * (.5 + random() * .6);
  ctx.beginPath();
  ctx.moveTo(Math.cos(angle) * radius * .5, Math.sin(angle) * radius * .4);
  ctx.lineTo(Math.cos(angle) * (radius * .5 + length), Math.sin(angle) * (radius * .4 + length));
  ctx.stroke();
 }
 ctx.restore();
 /* kraterki i ciemne plamy na powierzchni */
 ctx.fillStyle = 'rgba(0,0,0,.25)';
 [[-.3, -.2, .18], [.25, .3, .14], [.05, -.4, .12]].forEach(([ox, oy, size]) => {
  ctx.beginPath();
  ctx.arc(ox * radius, oy * radius * .8, size * radius, 0, TAU);
  ctx.fill();
 });
 ctx.restore();
}

function drawComet(item, frame) {
 const {x, y, radius, distance} = item;
 const directionX = x - frame.sunX;
 const directionY = y - frame.sunY;
 const length = Math.hypot(directionX, directionY) || 1;
 const unitX = directionX / length;
 const unitY = directionY / length;
 const zoomed = radius > 22;
 const nucleusRadius = zoomed ? Math.min(radius, 26) : Math.min(radius, 5);
 const activity = Math.pow(Math.max(0, 1 - distance / 950), .8);
 /* ogon zawsze od Słońca: jonowy (w±ski, prosty, niebieski) + py³owy (szerszy, ³agodnie zakrzywiony) */
 const tailLength = activity * 170 * clamp(frame.scale, .5, 1.5);
 if (tailLength > 3) {
  const normalX = -unitY;
  const normalY = unitX;
  const layers = [
   {color: 'rgba(170,225,255,.65)', curve: 0, endSpread: .14},
   {color: 'rgba(255,232,180,.4)', curve: .2, endSpread: .24}
  ];
  for (const layer of layers) {
   const endX = x + unitX * tailLength + normalX * tailLength * layer.curve;
   const endY = y + unitY * tailLength + normalY * tailLength * layer.curve;
   const baseSpread = nucleusRadius * 1.1;
   const endSpread = tailLength * layer.endSpread;
   const gradient = ctx.createLinearGradient(x, y, endX, endY);
   gradient.addColorStop(0, layer.color);
   gradient.addColorStop(1, 'rgba(170,225,255,0)');
   ctx.fillStyle = gradient;
   ctx.beginPath();
   ctx.moveTo(x + normalX * baseSpread, y + normalY * baseSpread);
   ctx.quadraticCurveTo(x + unitX * tailLength * .6 + normalX * endSpread * .6, y + unitY * tailLength * .6 + normalY * endSpread * .6, endX + normalX * endSpread, endY + normalY * endSpread);
   ctx.lineTo(endX - normalX * endSpread, endY - normalY * endSpread);
   ctx.quadraticCurveTo(x + unitX * tailLength * .6 - normalX * endSpread * .6, y + unitY * tailLength * .6 - normalY * endSpread * .6, x - normalX * baseSpread, y - normalY * baseSpread);
   ctx.closePath();
   ctx.fill();
  }
 }
 glow(x, y, Math.min(radius, 8) * (zoomed ? 2 : 1), 'rgba(190,235,255,.45)');
 /* zdjęcie jądra Halleya (model 3D ze Stellarium) przy przybliżeniu — fallback: rysunek */
 const nucleusPhoto = zoomed && imageOf('halley_nucleus');
 if (nucleusPhoto) {
  const size = nucleusRadius * 2.6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(.5);
  ctx.drawImage(nucleusPhoto, -size / 2, -size / 2, size, size);
  ctx.restore();
 } else if (zoomed) drawNucleus(x, y, nucleusRadius, -unitX, -unitY);
 else {
  ctx.fillStyle = '#eaf7ff';
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

/* skały pokazywane po przybliżeniu pasa planetoid — wyraźne bryły zamiast kilku kropek */
const beltField = Array.from({length: 70}, (value, index) => ({
 angle: Math.random() * TAU, distance: .1 + Math.sqrt(Math.random()) * 1.5, size: .05 + Math.random() * .12,
 speed: (.015 + Math.random() * .05) * (index % 2 ? 1 : -1), spin: Math.random() * TAU,
 shape: Array.from({length: 8}, () => .75 + Math.random() * .45), tone: 120 + Math.floor(Math.random() * 60)
}));

function drawBeltTarget(item) {
 /* widoczny „biegun” pasa — duży przezroczysty cel do kliknięcia; kropki rysuje drawAsteroids */
 if (view.following && view.selected === item.index && item.radius > 60) {
  const ratio = clamp(view.tilt, MIN_TILT, MAX_TILT);
  const time = frameTime * .001;
  beltField.forEach(rock => {
   const angle = rock.angle + time * rock.speed;
   const x = item.x + Math.cos(angle) * rock.distance * item.radius;
   const y = item.y + Math.sin(angle) * rock.distance * item.radius * (.35 + ratio * .6);
   const size = rock.size * item.radius;
   ctx.save();
   ctx.translate(x, y);
   ctx.rotate(rock.spin + time * rock.speed * 2);
   ctx.fillStyle = `rgb(${rock.tone},${rock.tone - 6},${rock.tone - 14})`;
   ctx.beginPath();
   rock.shape.forEach((factor, point) => {
    const around = point / rock.shape.length * TAU;
    if (point === 0) ctx.moveTo(Math.cos(around) * size * factor, Math.sin(around) * size * factor);
    else ctx.lineTo(Math.cos(around) * size * factor, Math.sin(around) * size * factor);
   });
   ctx.closePath();
   ctx.fill();
   ctx.fillStyle = 'rgba(255,255,255,.18)';
   ctx.beginPath();
   ctx.arc(-size * .25, -size * .25, size * .4, 0, TAU);
   ctx.fill();
   ctx.restore();
  });
 }
 drawAttention(item.x, item.y, item.radius, item.index);
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

/* orbity księżyców i sond wybranej planety — rysowane przed planetą, żeby jej nie przecinały */
function drawFocusOrbits(planetItems) {
 const parent = planetItems.find(item => item.index === view.selected);
 if (!parent || !view.following || parent.radius < 40) return;
 const mratio = clamp(view.tilt, MIN_TILT, MAX_TILT);
 ctx.save();
 ctx.lineWidth = 1.5;
 ctx.strokeStyle = 'rgba(150,190,235,.5)';
 ctx.setLineDash([2, 5]);
 (MOONS[parent.body.id] || []).forEach(moon => {
  ctx.save();
  ctx.translate(parent.x, parent.y);
  ctx.rotate(moon.tilt);
  ctx.beginPath();
  ctx.ellipse(0, 0, parent.radius * moon.moonOrbit, parent.radius * moon.moonOrbit * mratio, 0, 0, TAU);
  ctx.stroke();
  ctx.restore();
 });
 if (finds.some(find => find.parentId === parent.body.id)) {
  const geometry = findOrbitGeometry(parent);
  ctx.strokeStyle = 'rgba(255,217,90,.4)';
  ctx.setLineDash([3, 6]);
  ctx.beginPath();
  ctx.ellipse(parent.x, parent.y, geometry.horizontal, geometry.vertical, 0, 0, TAU);
  ctx.stroke();
 }
 ctx.restore();
}

function findOrbitGeometry(parent) {
 const freeWidth = view.free.right - view.free.left;
 const freeHeight = view.free.bottom - view.free.top;
 const spriteWidth = clamp(parent.radius * .25, 30, 110);
 const horizontal = Math.max(parent.radius * 1.15, Math.min(parent.radius * 1.7 + spriteWidth * .4, freeWidth / 2 - spriteWidth * .55));
 const vertical = Math.min(horizontal * .66 * (clamp(view.tilt, MIN_TILT, MAX_TILT) / .55), freeHeight / 2 - spriteWidth * .45);
 return {spriteWidth, horizontal, vertical};
}

function drawMoon(frame, parent, moon, parentX, parentY, parentRadius) {
 const moonRadius = Math.max(2.5, parentRadius * moon.size * .6);
 const orbit = parentRadius * moon.moonOrbit;
 const periodDays = Math.max(Math.abs(moon.period) * 30, 45);
 const mratio = clamp(view.tilt, MIN_TILT, MAX_TILT);
 const phase = moon.startPhase + view.angle + moonDays / periodDays * TAU * Math.sign(moon.period);
 const localX = Math.cos(phase) * orbit;
 const localY = Math.sin(phase) * orbit * mratio;
 const cosTilt = Math.cos(moon.tilt);
 const sinTilt = Math.sin(moon.tilt);
 const x = parentX + localX * cosTilt - localY * sinTilt;
 const y = parentY + localX * sinTilt + localY * cosTilt;
 const sunAngle = Math.atan2(frame.sunY - y, frame.sunX - x);
 drawMoonBody(x, y, moonRadius, moon, sunAngle);
 if (!discovered.has(moon.id)) drawUnknownHint(x, y, moonRadius + 1, moon.startPhase);
 /* nazwa tylko po odkryciu — drukowane litery dla czytelności */
 if (discovered.has(moon.id)) {
  ctx.fillStyle = '#dfeaf8';
  ctx.font = '800 12px ui-rounded, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(moon.name.toUpperCase(), x, y - moonRadius - 7);
 }
 view.moonTargets.push({moon, x, y, radius: moonRadius + 7});
}

/* obrót wybranego księżyca wokół własnej osi (reszta stoi w miejscu) */
const moonSpin = {};

function drawMoonBody(x, y, radius, moon, sunAngle) {
 const lumpy = moon.id === 'phobos' || moon.id === 'deimos';
 /* prawdziwa mapa księżyca (globus jak przy planetach), z fallbackiem na gradient */
 const globe = moon.texture && radius >= 5 ? globeOf(moon.texture, radius > 60 ? 256 : 128, 0) : null;
 if (globe) {
  const rotation = moon.startPhase + (moonSpin[moon.id] || 0);
  if (globe.lastRotation === undefined || Math.abs(globe.lastRotation - rotation) > .0004) {
   globe.render(rotation);
   globe.lastRotation = rotation;
  }
  ctx.save();
  ctx.beginPath();
  if (lumpy) ctx.ellipse(x, y, radius * 1.14, radius * .8, moon.startPhase % TAU, 0, TAU);
  else ctx.arc(x, y, radius, 0, TAU);
  ctx.clip();
  ctx.drawImage(globe.canvas, x - radius * 1.14, y - radius * 1.14, radius * 2.28, radius * 2.28);
  /* cieniowanie terminalatora od strony Słońca */
  const lightX = x + Math.cos(sunAngle) * radius * .4;
  const lightY = y + Math.sin(sunAngle) * radius * .4;
  const shade = ctx.createRadialGradient(lightX, lightY, radius * .3, x, y, radius * 1.12);
  shade.addColorStop(0, 'rgba(2,4,12,0)');
  shade.addColorStop(.55, 'rgba(2,4,12,.1)');
  shade.addColorStop(1, 'rgba(2,4,12,.7)');
  ctx.fillStyle = shade;
  if (lumpy) {ctx.beginPath(); ctx.ellipse(x, y, radius * 1.14, radius * .8, moon.startPhase % TAU, 0, TAU); ctx.fill();}
  else {ctx.beginPath(); ctx.arc(x, y, radius, 0, TAU); ctx.fill();}
  ctx.restore();
  return;
 }
 ctx.save();
 ctx.beginPath();
 if (lumpy) ctx.ellipse(x, y, radius * 1.14, radius * .8, moon.startPhase % TAU, 0, TAU);
 else ctx.arc(x, y, radius, 0, TAU);
 ctx.clip();
 ctx.translate(x, y);
 const lightX = Math.cos(sunAngle) * radius * .4;
 const lightY = Math.sin(sunAngle) * radius * .4;
 const gradient = ctx.createRadialGradient(lightX, lightY, radius * .12, 0, 0, radius * 1.3);
 gradient.addColorStop(0, lighten(moon.color, 1.5));
 gradient.addColorStop(.55, moon.color);
 gradient.addColorStop(1, lighten(moon.color, .5));
 ctx.fillStyle = gradient;
 ctx.fillRect(-radius * 1.3, -radius * 1.3, radius * 2.6, radius * 2.6);
 drawMoonDetail(radius, moon);
 const shade = ctx.createRadialGradient(lightX, lightY, radius * .3, 0, 0, radius * 1.12);
 shade.addColorStop(0, 'rgba(2,4,12,0)');
 shade.addColorStop(.55, 'rgba(2,4,12,.1)');
 shade.addColorStop(1, 'rgba(2,4,12,.7)');
 ctx.fillStyle = shade;
 ctx.fillRect(-radius * 1.3, -radius * 1.3, radius * 2.6, radius * 2.6);
 ctx.restore();
}

function drawMoonDetail(radius, moon) {
 const crater = (px, py, size) => {
  ctx.fillStyle = 'rgba(0,0,0,.2)';
  ctx.beginPath();
  ctx.arc(px * radius, py * radius, size * radius, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.14)';
  ctx.beginPath();
  ctx.arc(px * radius - size * radius * .3, py * radius - size * radius * .3, size * radius * .6, 0, TAU);
  ctx.fill();
 };
 switch (moon.id) {
  case 'io':
   [[-.25, -.2, .13], [.3, .1, .1], [.05, .4, .12], [-.35, .3, .08]].forEach(([px, py, size]) => {
    ctx.fillStyle = 'rgba(40,25,8,.45)';
    ctx.beginPath();
    ctx.arc(px * radius, py * radius, size * radius, 0, TAU);
    ctx.fill();
   });
   break;
  case 'europa':
   ctx.strokeStyle = 'rgba(150,95,60,.5)';
   ctx.lineWidth = Math.max(.7, radius * .05);
   [[-.6, -.5, .5, .2], [-.2, .3, .6, .6], [.1, -.6, .4, .1]].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath();
    ctx.moveTo(x1 * radius, y1 * radius);
    ctx.quadraticCurveTo((x1 + x2) / 2 * radius, (y1 + y2) / 2 * radius + radius * .15, x2 * radius, y2 * radius);
    ctx.stroke();
   });
   break;
  case 'ganymede':
   ctx.fillStyle = 'rgba(240,235,225,.22)';
   ctx.beginPath();
   ctx.arc(-.2 * radius, -.25 * radius, radius * .3, 0, TAU);
   ctx.arc(.3 * radius, .3 * radius, radius * .22, 0, TAU);
   ctx.fill();
   crater(.15, -.4, .09);
   break;
  case 'kallisto':
   [[-.3, -.25, .1], [.25, -.3, .08], [.4, .25, .11], [-.15, .35, .09], [.05, 0, .07], [-.45, .15, .06]].forEach(([px, py, size]) => crater(px, py, size));
   break;
  case 'tytan':
   ctx.fillStyle = 'rgba(255,225,170,.2)';
   ctx.beginPath();
   ctx.ellipse(0, 0, radius * .95, radius * .95, 0, 0, TAU);
   ctx.fill();
   break;
  case 'enceladus':
   ctx.strokeStyle = 'rgba(110,170,220,.55)';
   ctx.lineWidth = Math.max(.7, radius * .05);
   [-.18, 0, .18].forEach(px => {
    ctx.beginPath();
    ctx.moveTo(px * radius, radius * .35);
    ctx.quadraticCurveTo(px * radius * 1.6, radius * .55, px * radius, radius * .8);
    ctx.stroke();
   });
   break;
  case 'japetus': {
   const twoTone = ctx.createLinearGradient(-radius, 0, 0, 0);
   twoTone.addColorStop(0, 'rgba(22,16,10,.85)');
   twoTone.addColorStop(1, 'rgba(22,16,10,0)');
   ctx.fillStyle = twoTone;
   ctx.fillRect(-radius, -radius, radius, radius * 2);
   crater(.4, -.3, .08);
   break;
  }
  case 'tryton':
   ctx.fillStyle = 'rgba(245,205,195,.4)';
   ctx.beginPath();
   ctx.ellipse(0, radius * .5, radius * .6, radius * .3, 0, 0, TAU);
   ctx.fill();
   crater(-.3, -.2, .08);
   break;
  case 'phobos':
  case 'deimos':
   crater(-.3, -.1, .14);
   crater(.25, .2, .1);
   break;
  default:
   crater(-.25, -.15, .11);
   crater(.3, .25, .08);
 }
}

function drawFinds(items, frame) {
 view.findTargets = [];
 view.moonTargets = [];
 view.ringTarget = null;
 const parent = items[view.selected];
 if (!parent || !view.following || parent.radius < 40) {lastParentScreen = null; return;}
 lastParentScreen = {x: parent.x, y: parent.y};
 const parentId = parent.body.id;
 const list = finds.filter(find => find.parentId === parentId);
 const moonList = MOONS[parentId] || [];
 const freeWidth = view.free.right - view.free.left;
 const freeHeight = view.free.bottom - view.free.top;
 if (moonList.length) {
  moonList.forEach(moon => drawMoon(frame, parent, moon, parent.x, parent.y, parent.radius));
 }
 if (parent.body.ring && parent.body.id === 'saturn') {
  const outer = Math.max(...parent.body.ring.bands.map(band => band.scale + band.width / 2));
  const ringOuter = parent.radius * outer;
  const ratio = .16 + view.tilt * .42;
  const ringInner = parent.radius * Math.min(...parent.body.ring.bands.map(band => band.scale - band.width / 2));
  view.ringTarget = {ring: parent.body.ringInfo, x: parent.x, y: parent.y, inner: ringInner, outer: ringOuter, ratio, angle: parent.body.ring.angle};
 }
 if (!list.length) return;
 /* rozmiar sondy skaluje się z planetą (25% jej promienia, min 30 px) —
  * przy oddalaniu kamery sondy maleją razem z układem, zamiast rosnąć względem planety */
 const {spriteWidth, horizontal, vertical} = findOrbitGeometry(parent);
 list.forEach((find, order) => {
  const angle = frameTime * .00022 + view.angle + order * TAU / list.length + .6;
  const x = parent.x + Math.cos(angle) * horizontal;
  const y = parent.y + Math.sin(angle) * vertical;
  if (!discovered.has(find.id)) drawUnknownHint(x, y, spriteWidth * .6, order);
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
  /* nieodkryte obiekty mają nad sobą znak zapytania — podpis wędruje wyżej, żeby się nie nakładały */
  const hintLift = discovered.has(item.body.id) ? 0 : clamp(item.radius * .45, 12, 26) * 1.5;
  const labelY = item.y - item.radius - (isSelected ? 18 : 12) - hintLift;
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
  if (ripple.track) {
   const list = ripple.track.kind === 'moon' ? view.moonTargets : ripple.track.kind === 'find' ? view.findTargets : view.galaxyTargets;
   const current = list.find(target => (target.moon || target.find || target.object || {}).id === ripple.track.id);
   if (current) {ripple.x = current.x; ripple.y = current.y;}
  }
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
 const galaxy = galaxyAlpha();
 drawBackground();
 if (galaxy < 1) drawSolarScene(frame);
 else {
  view.targets = [];
  view.findTargets = [];
  view.moonTargets = [];
  view.ringTarget = null;
  view.sunTarget = null;
 }
 if (galaxy > 0) {
  /* przenikanie: tło + galaktyka narastają nad Układem Słonecznym */
  drawBackground(galaxy);
  drawGalaxyScene(frame, galaxy);
 } else {
  view.galaxyTargets = [];
  view.armTarget = null;
 }
 drawSelectionRing();
 drawRipples();
}

function drawSolarScene(frame) {
 const orbitFade = clamp((14 - view.zoom) / 6, 0, 1);
 if (orbitFade > 0) {
  ctx.save();
  ctx.globalAlpha = orbitFade;
  drawOrbits(frame);
  ctx.restore();
 }
 if (view.zoom < 40) drawAsteroids(frame);
 const items = [];
 bodies.forEach((body, index) => {
  if (body.kind === 'star') {items.push(null); return;}
  const offset = bodyOffset(body, frame.scale);
  items.push({body, index, x: frame.sunX + offset.x, y: frame.sunY + offset.y, radius: bodyRadius(body, frame.scale), distance: offset.distance});
 });
 const planetItems = items.filter(Boolean);
 view.targets = planetItems;
 drawFocusOrbits(planetItems);
 const behind = planetItems.filter(item => item.y < frame.sunY).sort((a, b) => a.y - b.y);
 const inFront = planetItems.filter(item => item.y >= frame.sunY).sort((a, b) => a.y - b.y);
 const paint = item => item.body.kind === 'comet' ? drawComet(item, frame) : item.body.kind === 'belt' ? drawBeltTarget(item) : drawPlanet(item, frame);
 behind.forEach(paint);
 drawSun(frame);
 inFront.forEach(paint);
 items[0] = view.sunTarget;
 drawFinds(items, frame);
 drawLabels(items);
}

/* złota obręcz wokół aktualnie zaznaczonego obiektu (planety, księżyca, sondy, pierścienia) —
 * rysowana co klatkę na aktualnej pozycji celu, więc zawsze trzyma się obiektu */
function drawSelectionRing() {
 let target = null;
 if (view.moon) target = view.moonTargets.find(item => item.moon === view.moon);
 else if (view.find) target = view.findTargets.find(item => item.find === view.find);
 else if (view.ring && view.ringTarget) target = {x: view.ringTarget.x, y: view.ringTarget.y, radius: view.ringTarget.outer};
 else if (view.galaxy) {
   const galactic = view.galaxyTargets.find(item => item.object === view.galaxy);
   if (galactic) target = {x: galactic.x, y: galactic.y, radius: galactic.radius};
 }
 if (!target) return;
 const pulse = Math.sin(frameTime * .004) * .5 + .5;
 ctx.lineWidth = 3;
 ctx.strokeStyle = `rgba(255,217,90,${.55 + .35 * pulse})`;
 ctx.beginPath();
 ctx.arc(target.x, target.y, target.radius + 6 + pulse * 3, 0, TAU);
 ctx.stroke();
 ctx.strokeStyle = 'rgba(255,217,90,.25)';
 ctx.lineWidth = 1.5;
 ctx.beginPath();
 ctx.arc(target.x, target.y, target.radius + 12 + pulse * 3, 0, TAU);
 ctx.stroke();
}

/* ---------- poziomy galaktyczne (Rami\u0119 Oriona, Droga Mleczna) ----------
 * Jeden, statyczny obraz galaktyki (render raz do bufora \u2014 bez migotania).
 * Poziom -2: ca\u0142a Droga Mleczna + Andromeda + Voyagery.
 * Poziom -1: wycinek tego samego obrazu wok\u00f3\u0142 pozycji S\u0142o\u0144ca (Rami\u0119 Oriona),
 * wi\u0119c S\u0142o\u0144ce jest dok\u0142adnie tam, gdzie by\u0142o w widoku ca\u0142ej galaktyki. */

const GALAXY_IMAGE_SIZE = 1024;
/* pozycja S\u0142o\u0144ca na obrazie galaktyki (u\u0142amek jej promienia) \u2014 Rami\u0119 Oriona,
 * oko\u0142o 26 000 lat \u015bwietlnych od centrum, na jednym z ramion spiralnych */
const SUN_GALAXY_POS = {x: .09, y: .48};
/* kierunek ramienia spiralnego w okolicy Słońca na obrazie (rad) */
const ARM_TANGENT = -.16;

let galaxyImage = null;

function buildGalaxyImage() {
 if (galaxyImage) return galaxyImage;
 /* prawdziwa wizja Drogi Mlecznej (NASA/JPL R. Hurt) — fallback: proceduralna spirala */
 const photo = imageOf('milky_way');
 if (photo) {
  galaxyImage = document.createElement('canvas');
  galaxyImage.width = GALAXY_IMAGE_SIZE;
  galaxyImage.height = GALAXY_IMAGE_SIZE;
  const photoCtx = galaxyImage.getContext('2d');
  photoCtx.drawImage(photo, 0, 0, GALAXY_IMAGE_SIZE, GALAXY_IMAGE_SIZE);
  /* miękka okrągła maska — znika kwadratowa krawędź zdjęcia */
  const half = GALAXY_IMAGE_SIZE / 2;
  const mask = photoCtx.createRadialGradient(half, half, half * .62, half, half, half);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  photoCtx.globalCompositeOperation = 'destination-in';
  photoCtx.fillStyle = mask;
  photoCtx.fillRect(0, 0, GALAXY_IMAGE_SIZE, GALAXY_IMAGE_SIZE);
  photoCtx.globalCompositeOperation = 'source-over';
  return galaxyImage;
 }
 galaxyImage = document.createElement('canvas');
 galaxyImage.width = GALAXY_IMAGE_SIZE;
 galaxyImage.height = GALAXY_IMAGE_SIZE;
 const c = galaxyImage.getContext('2d');
 const size = GALAXY_IMAGE_SIZE;
 const half = size / 2;
 const center = {x: half, y: half};
 let seed = 1234567;
 const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
 c.fillStyle = '#020409';
 c.fillRect(0, 0, size, size);
 /* rozmyte pasma py\u0142u mi\u0119dzy ramionami */
 const dustArms = 4;
 for (let arm = 0; arm < dustArms; arm++) {
  for (let step = 0; step < 90; step++) {
   const t = step / 90;
   const angle = arm * TAU / dustArms + t * 1.9 * TAU + .6;
   const radius = half * (.16 + t * .8);
   const spread = half * .1 * (0.4 + t);
   c.fillStyle = `rgba(10,8,20,${.16 * (1 - t * .5)})`;
   c.beginPath();
   c.arc(center.x + Math.cos(angle) * radius + (random() - .5) * spread,
         center.y + Math.sin(angle) * radius * .96 + (random() - .5) * spread,
         half * (.05 + random() * .06), 0, TAU);
   c.fill();
  }
 }
 /* gwiazdy ramion spiralnych \u2014 g\u0119sto\u015b\u0107 spada z promieniem */
 const starCount = 9000;
 for (let index = 0; index < starCount; index++) {
  const arm = Math.floor(random() * 2);
  const t = Math.pow(random(), .72);
  const angle = arm * Math.PI + t * 1.9 * TAU + .6 + (random() - .5) * (.5 + t * 1.5);
  const radius = half * (.1 + t * .88);
  const jitter = (random() - .5) * half * (.06 + t * .1);
  const x = center.x + Math.cos(angle) * radius + jitter;
  const y = center.y + Math.sin(angle) * radius * .96 + jitter * .9;
  const bright = random();
  c.fillStyle = bright > .93 ? 'rgba(255,240,210,1)' : bright > .8 ? 'rgba(220,235,255,1)' : 'rgba(190,210,240,.85)';
  c.globalAlpha = .35 + random() * .65;
  c.beginPath();
  c.arc(x, y, random() < .12 ? 1.6 : .8 + random() * .8, 0, TAU);
  c.fill();
 }
 c.globalAlpha = 1;
 /* m\u0142ode, niebieskie gromady gwiazd w ramionach */
 for (let cluster = 0; cluster < 40; cluster++) {
  const arm = Math.floor(random() * 2);
  const t = .3 + random() * .6;
  const angle = arm * Math.PI + t * 1.9 * TAU + .6 + (random() - .5) * .4;
  const radius = half * (.1 + t * .88);
  const x = center.x + Math.cos(angle) * radius;
  const y = center.y + Math.sin(angle) * radius * .96;
  const glow = c.createRadialGradient(x, y, 0, x, y, half * .05);
  glow.addColorStop(0, `rgba(140,180,255,${.25 + random() * .3})`);
  glow.addColorStop(1, 'rgba(140,180,255,0)');
  c.fillStyle = glow;
  c.beginPath();
  c.arc(x, y, half * .05, 0, TAU);
  c.fill();
 }
 /* dysk \u2014 \u0142agodne rozmycie gwiazd */
 const disk = c.createRadialGradient(center.x, center.y, half * .1, center.x, center.y, half);
 disk.addColorStop(0, 'rgba(255,240,215,.28)');
 disk.addColorStop(.35, 'rgba(235,225,255,.12)');
 disk.addColorStop(.75, 'rgba(190,205,240,.05)');
 disk.addColorStop(1, 'rgba(0,0,0,0)');
 c.fillStyle = disk;
 c.beginPath();
 c.arc(center.x, center.y, half, 0, TAU);
 c.fill();
 /* j\u0101dro \u2014 jasna wypuk\u0142o\u015b\u0107 z ciep\u0142ym \u015bwiat\u0142em */
 const bulge = c.createRadialGradient(center.x, center.y, 0, center.x, center.y, half * .22);
 bulge.addColorStop(0, 'rgba(255,248,225,.95)');
 bulge.addColorStop(.4, 'rgba(255,235,190,.5)');
 bulge.addColorStop(1, 'rgba(255,220,160,0)');
 c.fillStyle = bulge;
 c.beginPath();
 c.arc(center.x, center.y, half * .22, 0, TAU);
 c.fill();
 return galaxyImage;
}

/* ---------- galaktyka: ciągłe oddalanie zakotwiczone w Słońcu ----------
 * Nie ma przełączania poziomów. Gdy Układ Słoneczny kurczy się poniżej
 * GALAXY_FADE_FROM, wokół Słońca (które cały czas stoi w tym samym punkcie)
 * wyłania się obraz Drogi Mlecznej, a środek kadru płynnie przesuwa się
 * ze Słońca na środek galaktyki. Przybliżanie to dokładnie ten sam ruch
 * odwrócony — dlatego oddalanie i przybliżanie zawsze się zgadzają. */

function galaxyProgress(zoom = view.zoom) {
 return clamp(Math.log(GALAXY_FADE_FROM / zoom) / Math.log(GALAXY_FADE_FROM / GALAXY_MIN_ZOOM), 0, 1);
}
const galaxyAlpha = () => smoothstep(galaxyProgress() / .45);
const galaxyPanWeight = () => smoothstep((galaxyProgress() - .2) / .8);

/* połowa boku obrazu galaktyki w pikselach — rośnie proporcjonalnie do zoomu */
function galaxyScale() {
 const extent = Math.min(view.free.right - view.free.left, view.free.bottom - view.free.top) / 2;
 return extent * .8 * view.zoom / GALAXY_MIN_ZOOM;
}
const galaxyRotation = () => view.angle * .15;

/* wektor od środka galaktyki do Słońca, w pikselach, z uwzględnieniem obrotu */
function sunGalaxyOffset() {
 const scale = galaxyScale();
 const rotation = galaxyRotation();
 const cos = Math.cos(rotation), sin = Math.sin(rotation);
 return {x: (cos * SUN_GALAXY_POS.x - sin * SUN_GALAXY_POS.y) * scale, y: (sin * SUN_GALAXY_POS.x + cos * SUN_GALAXY_POS.y) * scale};
}

function drawGalaxyScene(frame, alpha) {
 view.galaxyTargets = [];
 view.armTarget = null;
 const image = buildGalaxyImage();
 const scale = galaxyScale();
 const rotation = galaxyRotation();
 const sun = {x: frame.sunX, y: frame.sunY};
 const offset = sunGalaxyOffset();
 const center = {x: sun.x - offset.x, y: sun.y - offset.y};
 /* obraz galaktyki jest dodawany do tła (czarne tło zdjęcia nic nie zmienia,
  * więc nie widać krawędzi kwadratu, a gwiazdy tła prześwitują) */
 ctx.save();
 ctx.globalCompositeOperation = 'lighter';
 ctx.globalAlpha = alpha;
 ctx.translate(center.x, center.y);
 ctx.rotate(rotation);
 ctx.drawImage(image, -scale, -scale, scale * 2, scale * 2);
 ctx.restore();
 /* Andromeda — leży poza Drogą Mleczną, w tym samym układzie współrzędnych */
 const andromeda = {x: center.x + scale * .95, y: center.y - scale * .85, half: scale * .3};
 const andromedaPhoto = imageOf('andromeda');
 ctx.save();
 ctx.globalCompositeOperation = 'lighter';
 ctx.globalAlpha = alpha;
 ctx.translate(andromeda.x, andromeda.y);
 ctx.rotate(rotation * -.7);
 ctx.drawImage(andromedaPhoto || image, -andromeda.half, -andromeda.half, andromeda.half * 2, andromeda.half * 2);
 ctx.restore();
 if (alpha <= .5) return;
 const labelAlpha = clamp((alpha - .5) / .5, 0, 1);
 /* Ramię Oriona — krótka odnoga spiralna, w której leży Słońce; klikalna elipsa wzdłuż ramienia */
 const arm = GALAXY_OBJECTS.orion_arm[1];
 const armAngle = ARM_TANGENT + rotation;
 const armLength = scale * .36;
 const armWidth = Math.max(scale * .075, 11);
 const armPath = new Path2D();
 armPath.ellipse(sun.x, sun.y, armLength, armWidth, armAngle, 0, TAU);
 const armCos = Math.cos(armAngle), armSin = Math.sin(armAngle);
 const armHalfX = Math.hypot(armLength * armCos, armWidth * armSin);
 const armHalfY = Math.hypot(armLength * armSin, armWidth * armCos);
 armPath._bbox = {left: sun.x - armHalfX, right: sun.x + armHalfX, top: sun.y - armHalfY, bottom: sun.y + armHalfY};
 ctx.save();
 ctx.globalAlpha = labelAlpha;
 if (!discovered.has(arm.id)) {
  const pulse = Math.sin(frameTime * .003) * .5 + .5;
  ctx.fillStyle = `rgba(140,190,255,${.1 + .12 * pulse})`;
  ctx.strokeStyle = `rgba(160,200,255,${.3 + .35 * pulse})`;
  ctx.lineWidth = 2;
  ctx.fill(armPath);
  ctx.stroke(armPath);
 } else {
  ctx.strokeStyle = 'rgba(160,200,255,.28)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 6]);
  ctx.stroke(armPath);
  ctx.setLineDash([]);
 }
 ctx.font = '800 15px ui-rounded, system-ui, sans-serif';
 ctx.fillStyle = '#dbe9ff';
 /* podpis przy prawym końcu ramienia, poza elipsą i poza podpisami sond */
 const armLabelX = sun.x + armCos * (armLength + 10);
 const armLabelY = sun.y + armSin * (armLength + 10) + 5;
 ctx.textAlign = 'left';
 ctx.fillText('Ramię Oriona', armLabelX, armLabelY);
 ctx.restore();
 view.armTarget = {object: arm, path: armPath, x: armLabelX, y: armLabelY, radius: armLength};
 /* znaczniki: Słońce, Voyagery (tuż obok Słońca), środek galaktyki i Andromeda */
 const solar = GALAXY_OBJECTS.orion_arm[0];
 const voyagers = GALAXY_OBJECTS.milky_way.slice(2);
 const marks = [
  {object: GALAXY_OBJECTS.milky_way[0], x: center.x, y: center.y, radius: Math.max(26, scale * .07), emoji: '🌌', label: 'Droga Mleczna', sub: 'nasza galaktyka', above: true},
  {object: GALAXY_OBJECTS.milky_way[1], x: andromeda.x, y: andromeda.y, radius: Math.max(24, andromeda.half * .3), emoji: '🌀', label: 'Galaktyka Andromedy', sub: '2,5 miliona lat świetlnych'},
  {object: voyagers[0], x: sun.x + 34, y: sun.y - 34, radius: 15, emoji: '🛰️', label: 'Voyager 1', side: 'right'},
  {object: voyagers[1], x: sun.x + 34, y: sun.y + 34, radius: 15, emoji: '🛰️', label: 'Voyager 2', side: 'right'},
  {object: solar, x: sun.x, y: sun.y, radius: Math.max(20, scale * .05), emoji: '☀️', label: solar.name, side: 'left'}
 ];
 for (const mark of marks) {
  ctx.save();
  ctx.globalAlpha = labelAlpha;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '800 22px system-ui, sans-serif';
  ctx.fillText(mark.emoji, mark.x, mark.y + 8);
  ctx.restore();
  if (!discovered.has(mark.object.id)) drawUnknownHint(mark.x, mark.y, mark.radius + 1, mark.x);
  ctx.save();
  ctx.globalAlpha = labelAlpha;
  ctx.font = '700 12px ui-rounded, system-ui, sans-serif';
  ctx.fillStyle = '#e6f1ff';
  ctx.shadowColor = 'rgba(0,0,10,.9)';
  ctx.shadowBlur = 5;
  if (mark.side === 'right') {
   ctx.textAlign = 'left';
   ctx.fillText(mark.label, mark.x + mark.radius + 6, mark.y + 4);
  } else if (mark.side === 'left') {
   ctx.textAlign = 'right';
   ctx.fillText(mark.label, mark.x - mark.radius - 6, mark.y + 4);
  } else {
   ctx.textAlign = 'center';
   const first = mark.above ? mark.y - mark.radius - (mark.sub ? 22 : 10) : mark.y + mark.radius + 14;
   /* podpis nie wychodzi poza ekran */
   const half = Math.max(ctx.measureText(mark.label).width, mark.sub ? ctx.measureText(mark.sub).width : 0) / 2 + 8;
   const labelX = clamp(mark.x, Math.min(half, view.width / 2), Math.max(view.width - half, view.width / 2));
   ctx.fillText(mark.label, labelX, first);
   if (mark.sub) {
    ctx.fillStyle = '#c3d6ee';
    ctx.fillText(mark.sub, labelX, first + 14);
   }
  }
  ctx.restore();
  view.galaxyTargets.push({object: mark.object, x: mark.x, y: mark.y, radius: mark.radius});
 }
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
   /* pinch to ten sam ciągły zoom co kółko myszy — bez przełączania poziomów */
   const next = clamp(gesture.startZoom * pointerDistance() / gesture.startDistance, GALAXY_MIN_ZOOM, MAX_ZOOM);
   view.zoomGoal = next;
   view.zoom = next;
  }
  return;
 }
 const deltaX = event.clientX - gesture.startX;
 const deltaY = event.clientY - gesture.startY;
 if (!gesture.moved && Math.abs(deltaX) + Math.abs(deltaY) > 8) gesture.moved = true;
 if (!gesture.moved) return;
 /* przeciąganie obraca kamerę wokół punktu, na którym stoi kadr: deltaX = azymut,
  * deltaY = wysokość. Działa tak samo przy Słońcu, planecie, księżycu i w galaktyce —
  * przy zaznaczonej planecie to ona zostaje w środku, a Słońce i reszta układu
  * krążą wokół niej, więc kamera naprawdę „krąży po sferze”. */
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
 if (pointers.size === 1 && finished && finished.kind === 'pinch') {
  const [remaining] = [...pointers.values()];
  gesture = {kind: 'drag', startX: remaining.x, startY: remaining.y, angle: view.angle, tilt: view.tilt, rotation: rotationOf(bodies[view.selected]), moved: true};
  return;
 }
 if (pointers.size === 0) gesture = null;
}
canvas.addEventListener('pointerup', endPointer);
canvas.addEventListener('pointercancel', endPointer);

canvas.addEventListener('wheel', event => {
 event.preventDefault();
 const delta = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY;
 /* oddalanie z podzaznaczenia: najpierw wróć do planety */
 if (delta > 0 && view.following && (view.moon || view.find || view.ring)) {
  const planetZoom = followZoom(view.selected);
  if (view.zoomGoal <= planetZoom * 1.05) {
   view.moon = null;
   view.find = null;
   view.ring = null;
   view.carryX = 0;
   view.carryY = 0;
   view.zoomGoal = planetZoom;
   factIndex = 0;
   renderInfo();
   readFrom(0, false);
   fxPlay('whoosh');
   return;
  }
  view.zoomGoal = planetZoom;
  return;
 }
 /* jeden ciągły zoom: planeta -> Układ Słoneczny -> Droga Mleczna i z powrotem */
 view.zoomGoal = clamp(view.zoomGoal * Math.exp(-delta * .0018), GALAXY_MIN_ZOOM, MAX_ZOOM);
}, {passive: false});

