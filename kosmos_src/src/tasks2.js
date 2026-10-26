/* ---------- nowe zadania: po jednym dla każdego księżyca i obiektu galaktycznego ----------
 * Wszystkie są krótkie, dziecinne i śmieszne: mają buzie, charaktery i proste
 * sterowanie palcem (dotknij, przeciągnij, przytrzymaj). Rysują wyłącznie na actCtx. */

const rnd = (from, to) => from + Math.random() * (to - from);

/* buzia na okrągłym ciele; nastrój: smile, laugh, ouch, wow, sad, sleep, tongue */
function drawFace(c, x, y, r, mood = 'smile', t = 0, look = {x: 0, y: 0}) {
 const eyeX = r * .36, eyeY = -r * .16, eyeR = r * .2;
 c.save();
 c.translate(x, y);
 c.lineCap = 'round';
 c.lineJoin = 'round';
 const ink = '#2a1a1a';
 [-1, 1].forEach(side => {
  const ex = side * eyeX;
  if (mood === 'laugh' || mood === 'sleep' || mood === 'ouch') {
   c.strokeStyle = ink;
   c.lineWidth = Math.max(2, r * .07);
   c.beginPath();
   if (mood === 'laugh') c.arc(ex, eyeY + eyeR * .5, eyeR * .85, Math.PI * 1.1, Math.PI * 1.9);
   else if (mood === 'sleep') c.arc(ex, eyeY - eyeR * .3, eyeR * .85, Math.PI * .1, Math.PI * .9);
   else {
    c.moveTo(ex - side * eyeR * .9, eyeY - eyeR * .8);
    c.lineTo(ex + side * eyeR * .6, eyeY);
    c.lineTo(ex - side * eyeR * .9, eyeY + eyeR * .8);
   }
   c.stroke();
  } else {
   c.fillStyle = '#fff';
   c.beginPath(); c.ellipse(ex, eyeY, eyeR, eyeR * 1.15, 0, 0, TAU); c.fill();
   c.strokeStyle = 'rgba(40,20,20,.55)'; c.lineWidth = 1.4; c.stroke();
   c.fillStyle = ink;
   c.beginPath(); c.arc(ex + look.x * eyeR * .45, eyeY + look.y * eyeR * .45, eyeR * .55, 0, TAU); c.fill();
   c.fillStyle = '#fff';
   c.beginPath(); c.arc(ex + look.x * eyeR * .45 - eyeR * .18, eyeY + look.y * eyeR * .45 - eyeR * .2, eyeR * .17, 0, TAU); c.fill();
  }
 });
 c.fillStyle = 'rgba(255,110,140,.42)';
 [-1, 1].forEach(side => {c.beginPath(); c.ellipse(side * r * .62, r * .16, r * .14, r * .08, 0, 0, TAU); c.fill();});
 c.strokeStyle = ink;
 c.lineWidth = Math.max(2, r * .07);
 if (mood === 'smile') {
  c.beginPath(); c.arc(0, r * .08, r * .36, Math.PI * .15, Math.PI * .85); c.stroke();
 } else if (mood === 'laugh' || mood === 'tongue') {
  c.fillStyle = '#7a1f3d';
  c.beginPath(); c.arc(0, r * .12, r * .4, 0, Math.PI); c.closePath(); c.fill();
  c.fillStyle = '#ff6f9c';
  const tongue = r * (.2 + .05 * Math.sin(t * .02));
  c.beginPath(); c.ellipse(r * .08, r * .42, r * .16, tongue, 0, 0, TAU); c.fill();
 } else if (mood === 'ouch') {
  c.fillStyle = '#7a1f3d';
  c.beginPath(); c.ellipse(0, r * .38, r * .2, r * .13, 0, 0, TAU); c.fill();
 } else if (mood === 'wow') {
  c.fillStyle = '#7a1f3d';
  c.beginPath(); c.ellipse(0, r * .36, r * .15, r * .2, 0, 0, TAU); c.fill();
 } else if (mood === 'sad') {
  c.beginPath(); c.arc(0, r * .55, r * .3, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
 } else if (mood === 'sleep') {
  c.beginPath(); c.moveTo(-r * .12, r * .32); c.lineTo(r * .12, r * .32); c.stroke();
 }
 c.restore();
}

/* ziemniaczek: Fobos i Deimos */
function drawPotato(c, x, y, r, mood, t = 0, spin = 0) {
 c.save();
 c.translate(x, y);
 c.rotate(spin);
 const g = c.createRadialGradient(-r * .4, -r * .4, r * .1, 0, 0, r * 1.4);
 g.addColorStop(0, '#d6bfa6'); g.addColorStop(1, '#8a6f5c');
 c.fillStyle = g;
 c.beginPath();
 c.ellipse(0, 0, r * 1.3, r, 0, 0, TAU);
 c.fill();
 c.beginPath(); c.ellipse(r * .55, r * .55, r * .5, r * .42, .3, 0, TAU); c.fill();
 c.strokeStyle = 'rgba(70,40,30,.5)'; c.lineWidth = 1.5; c.stroke();
 c.fillStyle = 'rgba(80,55,45,.45)';
 c.beginPath(); c.arc(-r * .72, -r * .38, r * .34, 0, TAU); c.fill();
 c.restore();
 drawFace(c, x, y, r * .85, mood, t);
 c.fillStyle = '#fff';
 [-1, 1].forEach(side => {c.beginPath(); c.ellipse(x + side * r * .55, y + r * 1.02, r * .38, r * .17, 0, 0, TAU); c.fill();});
}

function createSimpleTask(cfg) {
 const {title, lead, width = 560, height = 340} = cfg;
 const bg = makeLayer(width, height);
 if (cfg.paintBg) cfg.paintBg(bg.ctx, width, height);
 else paintActStars(bg.ctx, width, height, cfg.stars || 90);
 let finished = false;
 let pressed = false;
 const api = {
  width, height,
  ok: () => fxPlay('ok'),
  miss: () => fxPlay('miss'),
  say: sayNow,
  log: logActivity,
  finish: text => {
   if (finished) return;
   finished = true;
   render();
   finishActivity(text || cfg.doneText);
  },
  get finished() {return finished;},
  get pressed() {return pressed;}
 };
 const state = cfg.init(api);
 function render() {
  actCtx.drawImage(bg.canvas, 0, 0, width, height);
  cfg.draw(actCtx, state, performance.now(), api);
 }
 return {
  title, lead, width, height,
  start: render,
  onDown: point => {pressed = true; if (!finished && cfg.down) cfg.down(state, point, api); render();},
  onMove: point => {if (!finished && cfg.move) cfg.move(state, point, api);},
  onUp: () => {pressed = false; if (!finished && cfg.up) cfg.up(state, api);},
  frame: dt => {
   if (!finished && cfg.update) cfg.update(state, Math.min(dt, .05), api);
   render();
  },
  repeatText: cfg.hint || lead,
  hintText: cfg.hint || lead,
  debug: () => cfg.debug(state)
 };
}

const doneBadge = (c, text, x, y) => {
 c.fillStyle = 'rgba(0,0,0,.5)';
 c.beginPath(); c.roundRect(x - 62, y - 17, 124, 26, 13); c.fill();
 c.fillStyle = '#fff'; c.font = '800 15px system-ui, sans-serif'; c.textAlign = 'center';
 c.fillText(text, x, y + 2);
};

/* ---------- Fobos: szybki ziemniaczek ---------- */

function createPhobosActivity() {
 const cx = 280, cy = 184, A = 205, B = 78;
 const pos = s => ({x: cx + Math.cos(s.ang) * A, y: cy + Math.sin(s.ang) * B});
 const lines = ['Hop! Jeden!', 'Aj! Dwa! Ale szybki!', 'Hihi, trzy! Przyspiesza!', 'Cztery! Jeszcze jeden!'];
 return createSimpleTask({
  title: '🥔 Złap Fobosa',
  lead: 'To Fobos, maleńki księżyc w kształcie ziemniaka. Okrąża Marsa tak szybko, że robi to trzy razy w ciągu jednej doby! Złap go pięć razy. Z każdym razem będzie coraz szybszy!',
  hint: 'Dotknij Fobosa, kiedy będzie blisko Ciebie. Jest bardzo szybki!',
  init: () => ({ang: 2.4, speed: 1, caught: 0, hurt: 0}),
  update(s, dt) {s.ang += s.speed * dt; s.hurt = Math.max(0, s.hurt - dt);},
  down(s, point, api) {
   const q = pos(s);
   if (Math.hypot(point.x - q.x, point.y - q.y) > 40) return;
   s.caught++;
   s.speed += .3;
   s.hurt = .6;
   api.ok();
   if (s.caught >= 5) api.finish('Złapałaś Fobosa pięć razy! Ten ziemniaczek okrąża Marsa trzy razy na dobę. Ma wielki krater Stickney i bardzo powoli zbliża się do Marsa. Za dziesiątki milionów lat rozpadnie się na kawałki!');
   else api.say(lines[s.caught - 1]);
  },
  draw(c, s, t) {
   c.strokeStyle = 'rgba(104,171,239,.35)'; c.lineWidth = 1.5; c.setLineDash([4, 7]);
   c.beginPath(); c.ellipse(cx, cy, A, B, 0, 0, TAU); c.stroke(); c.setLineDash([]);
   const q = pos(s);
   const behind = Math.sin(s.ang) < 0;
   const mood = s.hurt > 0 ? 'ouch' : (s.caught >= 3 ? 'wow' : 'laugh');
   if (behind) drawPotato(c, q.x, q.y, 15, mood, t, Math.sin(t * .008) * .2);
   drawActBall(c, 'mars', cx, cy, 64, '#d75a36', t * .00006);
   if (!behind) drawPotato(c, q.x, q.y, 19, mood, t, Math.sin(t * .008) * .2);
   if (s.hurt > 0) {
    c.font = '20px system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText('💫', q.x, q.y - 34);
   }
   doneBadge(c, `Złapany: ${s.caught} z 5`, 84, 28);
  },
  debug: s => ({...pos(s), caught: s.caught})
 });
}

/* ---------- Deimos: maleńki w ciemności ---------- */

function createDeimosActivity() {
 const width = 560, height = 340;
 const spot = {x: 372, y: 112};
 return createTorchActivity({
  title: '🔦 Znajdź maleńkiego Deimosa',
  lead: 'Deimos jest tak mały, że ma tylko kilkanaście kilometrów, jak niewielkie miasto. Zaświeć latarką i znajdź go wśród gwiazd. Przytrzymaj światło, aż się pokaże!',
  width, height,
  paintScene(c) {
   paintActStars(c, width, height, 190);
   drawActBall(c, 'mars', 60, 330, 160, '#d75a36', 0);
   drawPotato(c, spot.x, spot.y, 10, 'smile', 0, .3);
  },
  targets: [{
   center: {x: spot.x, y: spot.y},
   test: point => Math.hypot(point.x - spot.x, point.y - spot.y) < 30,
   mark: c => {c.strokeStyle = '#7ee787'; c.lineWidth = 4; c.beginPath(); c.arc(spot.x, spot.y, 24, 0, TAU); c.stroke();}
  }],
  torchRadius: 88, dwell: .5, hintAfter: 14,
  doneText: 'Znalazłaś Deimosa! To drugi, jeszcze mniejszy księżyc Marsa. Krąży wolniej niż Fobos, a z Marsa wygląda tylko jak jasna gwiazdka.'
 });
}

/* ---------- Io: pizza z wulkanami ---------- */

function createIoActivity() {
 const cx = 280, cy = 178, R = 110;
 const total = 8;
 return createSimpleTask({
  title: '🌋 Zatkaj wulkany Io',
  lead: 'Io wygląda jak pizza i ma ponad czterysta wulkanów! Wyrzucają fontanny siarki. Zatkaj palcem osiem wulkanów, zanim Io kichnie!',
  hint: 'Dotykaj dymiących wulkanów na Io, żeby je zatkać!',
  init: () => ({vents: [], timer: .3, plugged: 0, joy: 0}),
  update(s, dt) {
   s.timer -= dt;
   s.joy = Math.max(0, s.joy - dt);
   s.vents.forEach(vent => {vent.age += dt; if (vent.plug !== null) vent.plug += dt;});
   s.vents = s.vents.filter(vent => vent.plug === null || vent.plug < .8);
   if (s.timer <= 0 && s.vents.filter(vent => vent.plug === null).length < 3) {
    const angle = rnd(0, TAU), dist = rnd(.5, .86) * R;
    s.vents.push({x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist, dx: Math.cos(angle), dy: Math.sin(angle), age: 0, plug: null});
    s.timer = rnd(.7, 1.3);
   }
  },
  down(s, point, api) {
   const vent = s.vents.find(item => item.plug === null && Math.hypot(point.x - item.x, point.y - item.y) < 34);
   if (!vent) return;
   vent.plug = 0;
   s.plugged++;
   s.joy = .6;
   api.ok();
   if (s.plugged >= total) api.finish('Zatkałaś wszystkie wulkany! Na Io jest ich naprawdę ponad czterysta, to najbardziej wulkaniczne miejsce w Układzie Słonecznym. Siarka z wulkanów maluje Io na żółto, pomarańczowo i czerwono, jak pizzę!');
   else api.say(['Zatkane! Uff!', 'Mamy dwa!', 'Trzy! Io już nie kicha.', 'Cztery! Brawo!', 'Pięć! Jeszcze trochę!', 'Sześć!', 'Siedem! Został ostatni!'][s.plugged - 1] || 'Brawo!');
  },
  draw(c, s, t) {
   drawActBall(c, 'io', cx, cy, R, '#e8c07a', t * .00004);
   const active = s.vents.some(vent => vent.plug === null);
   drawFace(c, cx, cy + 6, R * .62, s.joy > 0 ? 'laugh' : (active ? 'wow' : 'smile'), t);
   s.vents.forEach(vent => {
    c.fillStyle = '#2a1408';
    c.beginPath(); c.ellipse(vent.x, vent.y, 9, 6, 0, 0, TAU); c.fill();
    if (vent.plug === null) {
     for (let k = 0; k < 18; k++) {
      const u = (vent.age * 1.5 + k / 18) % 1;
      const side = Math.sin(k * 12.9) * u * 16;
      c.fillStyle = `rgba(255,${210 - 90 * u | 0},50,${(1 - u) * .95})`;
      c.beginPath(); c.arc(vent.x + vent.dx * u * 62 - vent.dy * side, vent.y + vent.dy * u * 62 + vent.dx * side, 3.6 * (1 - u * .5), 0, TAU); c.fill();
     }
     c.strokeStyle = `rgba(255,229,138,${.4 + .4 * Math.sin(t * .01)})`; c.lineWidth = 2.5;
     c.beginPath(); c.arc(vent.x, vent.y, 16, 0, TAU); c.stroke();
    } else {
     const lift = Math.max(0, .3 - vent.plug) * 40;
     c.fillStyle = '#a8703a';
     c.beginPath(); c.arc(vent.x, vent.y - lift, 10, 0, TAU); c.fill();
     c.fillStyle = '#d69a5a';
     c.beginPath(); c.arc(vent.x - 3, vent.y - lift - 3, 4, 0, TAU); c.fill();
    }
   });
   doneBadge(c, `Zatkane: ${s.plugged} z ${total}`, 84, 28);
  },
  debug: s => ({vents: s.vents.filter(vent => vent.plug === null).map(vent => ({x: vent.x, y: vent.y})), plugged: s.plugged})
 });
}

/* ---------- Europa: kosmiczne rybki ---------- */

function drawSpaceFish(c, x, y, dir, type, t, scale = 1) {
 c.save();
 c.translate(x, y);
 c.scale(dir * scale, scale);
 const wag = Math.sin(t * .012 + x) * .25;
 const body = ['#ff9a3c', '#b878ff', '#5fd1a0'][type];
 const fin = ['#ffd27a', '#e3c4ff', '#b9f3dc'][type];
 c.fillStyle = fin;
 c.save(); c.translate(-22, 0); c.rotate(wag);
 c.beginPath(); c.moveTo(4, 0); c.lineTo(-18, -14); c.lineTo(-18, 14); c.closePath(); c.fill();
 c.restore();
 c.beginPath(); c.moveTo(-4, -12); c.lineTo(4, -24); c.lineTo(12, -12); c.closePath(); c.fill();
 c.fillStyle = body;
 c.beginPath(); c.ellipse(0, 0, 27, 16, 0, 0, TAU); c.fill();
 c.fillStyle = 'rgba(255,255,255,.28)';
 c.beginPath(); c.ellipse(-2, -6, 16, 5, 0, 0, TAU); c.fill();
 const eyes = type === 2 ? [[10, -4, 6], [18, 4, 4.6], [4, -9, 4]] : [[13, -3, 6.5]];
 eyes.forEach(([ex, ey, er]) => {
  c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill();
  c.fillStyle = '#1a1020'; c.beginPath(); c.arc(ex + er * .25, ey, er * .52, 0, TAU); c.fill();
 });
 c.strokeStyle = '#3a1a2a'; c.lineWidth = 2; c.lineCap = 'round';
 c.beginPath(); c.arc(21, 5, 5, .2, 1.9); c.stroke();
 if (type === 1) {
  c.strokeStyle = 'rgba(210,240,255,.85)'; c.lineWidth = 2.5; c.fillStyle = 'rgba(200,235,255,.2)';
  c.beginPath(); c.arc(14, -2, 17, 0, TAU); c.fill(); c.stroke();
 }
 if (type === 2) {
  c.strokeStyle = '#2f8f6a'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(4, -15); c.lineTo(2, -28); c.stroke();
  c.fillStyle = '#ffe34d'; c.beginPath(); c.arc(2, -29, 3.5, 0, TAU); c.fill();
 }
 c.restore();
}

function createEuropaActivity() {
 const W = 560, H = 340, iceBottom = 84;
 const hole = {x: 300, y: iceBottom - 2};
 const rodTip = {x: 218, y: 46};
 const total = 3;
 const bubbles = Array.from({length: 22}, () => ({x: rnd(0, W), y: rnd(iceBottom, H), r: rnd(1.5, 4), v: rnd(10, 26)}));
 return createSimpleTask({
  title: '🎣 Złów kosmiczną rybkę na Europie',
  lead: 'Pod lodem Europy jest ocean! Naukowcy nie wiedzą, czy ktoś w nim pływa, ale w zabawie możemy to sprawdzić. Dotykaj wody, a wędka pójdzie za Twoim palcem. Złów trzy kosmiczne rybki!',
  hint: 'Dotknij wody blisko rybki, a haczyk popłynie do niej!',
  paintBg(c) {
   const sea = c.createLinearGradient(0, iceBottom, 0, H);
   sea.addColorStop(0, '#0f5a7a'); sea.addColorStop(1, '#020c1c');
   c.fillStyle = sea; c.fillRect(0, 0, W, H);
  },
  init: api => ({hook: {x: 300, y: 150}, aim: {x: 300, y: 150}, fish: [], timer: .1, caught: 0, pulled: null, kinds: 0, shown: 0}),
  update(s, dt, api) {
   bubbles.forEach(b => {b.y -= b.v * dt; if (b.y < iceBottom) {b.y = H; b.x = rnd(0, W);}});
   s.timer -= dt;
   if (s.timer <= 0 && s.fish.length < 3) {
    const side = Math.random() < .5 ? -1 : 1;
    s.fish.push({x: side < 0 ? -40 : W + 40, y: rnd(130, H - 30), vx: -side * rnd(40, 70), type: s.kinds++ % 3, t: rnd(0, 6)});
    s.timer = rnd(1.2, 2.4);
   }
   s.fish.forEach(f => {f.t += dt; f.x += f.vx * dt; f.y += Math.sin(f.t * 2.4) * 16 * dt;});
   s.fish = s.fish.filter(f => f === (s.pulled && s.pulled.fish) || (f.x > -60 && f.x < W + 60));
   if (s.pulled) {
    const p = s.pulled;
    p.t += dt;
    const u = Math.min(1, p.t / 1.1);
    s.hook.x = p.start.x + (hole.x - p.start.x) * u;
    s.hook.y = p.start.y + (hole.y + 6 - p.start.y) * u;
    p.fish.x = s.hook.x + 24; p.fish.y = s.hook.y + 10;
    if (u >= 1) {
     s.fish = s.fish.filter(f => f !== p.fish);
     s.caught++;
     s.pulled = null;
     s.aim = {x: hole.x, y: 150};
     api.ok();
     if (s.caught >= total) api.finish('Złowiłaś trzy kosmiczne rybki! Pamiętaj, to tylko zabawa: nikt jeszcze nie wie, czy w oceanie Europy coś pływa. Ale pod jej lodem jest więcej wody niż we wszystkich oceanach Ziemi razem. Dlatego tam polecą sondy i będą szukać!');
     else api.say(s.caught === 1 ? 'Jest pierwsza rybka! Ale ma wielkie oczy!' : 'Druga rybka w wiaderku! Hihi!');
    }
    return;
   }
   const dx = s.aim.x - s.hook.x, dy = s.aim.y - s.hook.y, d = Math.hypot(dx, dy);
   const step = Math.min(d, 520 * dt);
   if (d > .5) {s.hook.x += dx / d * step; s.hook.y += dy / d * step;}
   const prey = s.fish.find(f => Math.hypot(s.hook.x - (f.x + Math.sign(f.vx) * 22), s.hook.y - f.y) < 26);
   if (prey) {prey.vx = 0; s.pulled = {fish: prey, t: 0, start: {x: s.hook.x, y: s.hook.y}}; api.ok();}
  },
  down(s, point) {if (!s.pulled) s.aim = {x: clamp(point.x, 24, W - 24), y: clamp(point.y, iceBottom + 26, H - 16)};},
  move(s, point, api) {if (!s.pulled && api.pressed) s.aim = {x: clamp(point.x, 24, W - 24), y: clamp(point.y, iceBottom + 26, H - 16)};},
  draw(c, s, t) {
   bubbles.forEach(b => {c.fillStyle = 'rgba(190,230,255,.35)'; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill();});
   s.fish.forEach(f => {if (!(s.pulled && s.pulled.fish === f)) drawSpaceFish(c, f.x, f.y, f.vx >= 0 ? 1 : -1, f.type, t);});
   if (s.pulled) drawSpaceFish(c, s.pulled.fish.x, s.pulled.fish.y, 1, s.pulled.fish.type, t * 3, 1.1);
   /* lód */
   const ice = c.createLinearGradient(0, 0, 0, iceBottom);
   ice.addColorStop(0, '#f3f9ff'); ice.addColorStop(1, '#a9c9e2');
   c.fillStyle = ice; c.fillRect(0, 0, W, iceBottom);
   c.strokeStyle = 'rgba(140,100,70,.55)'; c.lineWidth = 2;
   [[40, 20, 90, 60], [380, 10, 430, 70], [500, 30, 540, 55], [120, 70, 170, 40]].forEach(([a, b, d, e]) => {c.beginPath(); c.moveTo(a, b); c.lineTo((a + d) / 2 + 8, (b + e) / 2 - 6); c.lineTo(d, e); c.stroke();});
   c.fillStyle = '#031321'; c.beginPath(); c.ellipse(hole.x, hole.y, 34, 9, 0, 0, TAU); c.fill();
   /* wędkarz w hełmie */
   c.fillStyle = '#e8eef6'; c.beginPath(); c.ellipse(190, 66, 26, 20, 0, 0, TAU); c.fill();
   c.fillStyle = '#fff'; c.beginPath(); c.arc(190, 40, 24, 0, TAU); c.fill();
   c.fillStyle = 'rgba(90,150,210,.55)'; c.beginPath(); c.arc(190, 40, 18, 0, TAU); c.fill();
   drawFace(c, 190, 40, 17, s.pulled ? 'wow' : 'smile', t);
   c.strokeStyle = '#6b4423'; c.lineWidth = 3.5; c.lineCap = 'round';
   c.beginPath(); c.moveTo(196, 60); c.lineTo(rodTip.x, rodTip.y); c.stroke();
   /* żyłka */
   c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5;
   c.beginPath(); c.moveTo(rodTip.x, rodTip.y); c.lineTo(hole.x, hole.y); c.lineTo(s.hook.x, s.hook.y - 6); c.stroke();
   c.strokeStyle = '#ffe58a'; c.lineWidth = 3;
   c.beginPath(); c.moveTo(s.hook.x, s.hook.y - 6); c.lineTo(s.hook.x, s.hook.y + 4); c.arc(s.hook.x - 5, s.hook.y + 4, 5, 0, Math.PI); c.stroke();
   /* wiaderko */
   c.fillStyle = '#c8553d'; c.beginPath(); c.moveTo(440, 52); c.lineTo(500, 52); c.lineTo(490, 86); c.lineTo(450, 86); c.closePath(); c.fill();
   c.font = '18px system-ui, sans-serif'; c.textAlign = 'center';
   for (let k = 0; k < s.caught; k++) c.fillText('🐟', 456 + k * 18, 50);
   doneBadge(c, `Rybki: ${s.caught} z ${total}`, 486, 108);
  },
  debug: s => ({hook: {...s.hook}, fish: s.fish.map(f => ({x: f.x, y: f.y, dir: Math.sign(f.vx)})), caught: s.caught, pulled: !!s.pulled})
 });
}

/* ---------- Ganimedes: ustaw się od najmniejszego do największego ---------- */

function createGanymedeActivity() {
 const width = 560, height = 446;
 const scale = 70 / 5268;
 const rows = [
  {key: 'mercury', name: 'Merkury', km: 4879, color: '#9b8d7a'},
  {key: 'pluto', name: 'Pluton', km: 2377, color: '#c8a98c'},
  {key: 'ganymedes', name: 'Ganimedes', km: 5268, color: '#b09a7a'},
  {key: 'moon_photo', name: 'Księżyc', km: 3474, color: '#b9b9c4'}
 ].map(item => ({...item, r: item.km * scale, x: 0, y: 0, slot: null, shake: 0}));
 const order = [...rows].sort((first, second) => first.km - second.km);
 const gap = 22;
 const totalWidth = rows.reduce((sum, item) => sum + item.r * 2, 0) + gap * 3;
 const place = (list, baseline) => {
  let x = (width - totalWidth) / 2;
  list.forEach(item => {item.homeX = x + item.r; item.homeY = baseline - item.r; x += item.r * 2 + gap;});
 };
 place(rows, 215);
 const slots = [];
 {
  let x = (width - totalWidth) / 2;
  order.forEach(item => {slots.push({x: x + item.r, y: 405 - item.r}); x += item.r * 2 + gap;});
 }
 rows.forEach(item => {item.x = item.homeX; item.y = item.homeY;});
 return createSimpleTask({
  title: '📏 Ustaw księżyce według wielkości',
  lead: 'Oto czterech okrągłych kolegów: Pluton, Księżyc, Merkury i Ganimedes, największy księżyc w całym Układzie Słonecznym. Dotykaj ich po kolei, od najmniejszego do największego. Uważaj, dwóch jest prawie tej samej wielkości!',
  hint: 'Dotknij najmniejszego, który jeszcze stoi na górnej półce.',
  width, height,
  init: () => ({next: 0}),
  update(s, dt) {
   rows.forEach(item => {
    item.shake = Math.max(0, item.shake - dt);
    if (item.slot !== null) {
     const slot = slots[item.slot];
     item.x += (slot.x - item.x) * Math.min(1, dt * 6);
     item.y += (slot.y - item.y) * Math.min(1, dt * 6);
    }
   });
  },
  down(s, point, api) {
   const hit = rows.find(item => item.slot === null && Math.hypot(point.x - item.x, point.y - item.y) < item.r + 4);
   if (!hit) return;
   if (hit === order[s.next]) {
    hit.slot = s.next;
    s.next++;
    api.ok();
    if (s.next >= order.length) api.finish('Ustawiłaś wszystkich w dobrej kolejności! Największy jest Ganimedes, księżyc Jowisza. Jest większy nawet od planety Merkury! Merkury jest tylko cięższy, bo Ganimedes jest z lodu i skał.');
    else api.say(`${hit.name} to ${s.next}. Teraz dotknij następnego, trochę większego.`);
   } else {
    hit.shake = .5;
    api.miss();
    api.say(`${hit.name} jest większy. Poszukaj mniejszego!`);
   }
  },
  draw(c, s, t) {
   c.fillStyle = 'rgba(90,120,170,.55)';
   c.fillRect(30, 215, width - 60, 6);
   c.fillRect(30, 405, width - 60, 6);
   c.fillStyle = '#ffe58a'; c.font = '800 15px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('Tu są pomieszani', width / 2, 24);
   c.fillText('Tu stają od najmniejszego do największego', width / 2, 268);
   slots.forEach((slot, index) => {
    c.strokeStyle = 'rgba(143,184,232,.45)'; c.lineWidth = 2; c.setLineDash([5, 6]);
    c.beginPath(); c.arc(slot.x, slot.y, order[index].r, 0, TAU); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(143,184,232,.55)'; c.font = '800 28px system-ui, sans-serif';
    c.fillText(String(index + 1), slot.x, slot.y + 10);
   });
   rows.forEach(item => {
    const wobble = item.shake > 0 ? Math.sin(item.shake * 60) * 5 : 0;
    drawActBall(c, item.key, item.x + wobble, item.y, item.r, item.color, t * .00005);
    drawFace(c, item.x + wobble, item.y + item.r * .1, item.r * .6, item.shake > 0 ? 'ouch' : (item.slot !== null ? 'laugh' : 'smile'), t);
    c.fillStyle = '#fff'; c.font = '700 14px system-ui, sans-serif'; c.textAlign = 'center';
    c.fillText(item.name, item.x, item.slot === null ? 238 : 426);
   });
  },
  debug: () => ({rows: rows.map(item => ({name: item.name, x: item.x, y: item.y, r: item.r, slot: item.slot})), order: order.map(item => item.name)})
 });
}

/* ---------- Kallisto: najwięcej kraterów ---------- */

function createCallistoActivity() {
 const cx = 280, cy = 178, R = 108, total = 10;
 return createSimpleTask({
  title: '☄️ Kallisto i kosmiczny grad',
  lead: 'Kallisto ma więcej kraterów niż jakikolwiek inny księżyc! Rzucaj w nią kosmiczne kamyczki. Dotknij Kallisto dziesięć razy, a zobaczysz, jak powstają kratery. Auć!',
  hint: 'Dotykaj Kallisto, żeby w nią trafić kamyczkiem!',
  init: () => ({rocks: [], craters: [], hits: 0, ouch: 0}),
  update(s, dt, api) {
   s.ouch = Math.max(0, s.ouch - dt);
   s.rocks.forEach(rock => {rock.t += dt;});
   const landed = s.rocks.filter(rock => rock.t >= .35);
   s.rocks = s.rocks.filter(rock => rock.t < .35);
   landed.forEach(rock => {
    if (Math.hypot(rock.x - cx, rock.y - cy) > R - 8) return;
    s.craters.push({x: rock.x, y: rock.y, r: rnd(9, 17), t: 0});
    s.hits++;
    s.ouch = .45;
    api.ok();
    if (s.hits >= total) api.finish('Dziesięć kraterów! Kallisto jest cała w kraterach, bo jej powierzchnia jest bardzo stara i nic jej nie wygładziło. To jeden z najstarszych i najbardziej podziurawionych księżyców w Układzie Słonecznym. Potrzebuje dużo plasterków!');
    else if (s.hits === 3) api.say('Au! Kallisto ma już kilka dziur!');
    else if (s.hits === 7) api.say('Jeszcze trochę, Kallisto się trzyma!');
   });
   s.craters.forEach(crater => {crater.t += dt;});
  },
  down(s, point) {
   const edge = [[-30, rnd(0, 340)], [590, rnd(0, 340)], [rnd(0, 560), -30]][Math.floor(Math.random() * 3)];
   s.rocks.push({x: point.x, y: point.y, fromX: edge[0], fromY: edge[1], t: 0});
  },
  draw(c, s, t) {
   drawActBall(c, 'kallisto', cx, cy, R, '#8a7a66', 0);
   s.craters.forEach(crater => {
    c.fillStyle = 'rgba(30,22,16,.7)';
    c.beginPath(); c.ellipse(crater.x, crater.y, crater.r, crater.r * .8, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(235,225,210,.7)'; c.lineWidth = 2.5; c.stroke();
    if (crater.t > .6) {c.font = '16px system-ui, sans-serif'; c.textAlign = 'center'; c.fillStyle = '#000'; c.fillText('🩹', crater.x, crater.y + 6);}
   });
   drawFace(c, cx - 6, cy + 8, R * .5, s.ouch > 0 ? 'ouch' : (s.hits >= 7 ? 'sad' : 'smile'), t);
   s.rocks.forEach(rock => {
    const u = rock.t / .35;
    const x = rock.fromX + (rock.x - rock.fromX) * u, y = rock.fromY + (rock.y - rock.fromY) * u;
    c.strokeStyle = 'rgba(255,200,120,.6)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - (rock.x - rock.fromX) * .08, y - (rock.y - rock.fromY) * .08); c.lineTo(x, y); c.stroke();
    c.fillStyle = '#b88a5a'; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill();
   });
   doneBadge(c, `Kratery: ${s.hits} z ${total}`, 84, 28);
  },
  debug: s => ({cx, cy, R, hits: s.hits})
 });
}

/* ---------- Tytan: deszcz z metanu i parasol ---------- */

function createTitanActivity() {
 const width = 560, height = 340, total = 12;
 return createSimpleTask({
  title: '☔ Parasol dla Tytana',
  lead: 'Na Tytanie naprawdę pada deszcz, ale z metanu, a nie z wody! Tytan nie ma parasola. Przesuwaj palcem parasol i złap dwanaście kropel, zanim zmoczą Tytana!',
  hint: 'Przeciągnij parasol nad kropelki, żeby je złapać!',
  paintBg(c) {
   const sky = c.createLinearGradient(0, 0, 0, height);
   sky.addColorStop(0, '#6b3a12'); sky.addColorStop(.6, '#c27a28'); sky.addColorStop(1, '#e5a24a');
   c.fillStyle = sky; c.fillRect(0, 0, width, height);
   c.fillStyle = 'rgba(255,220,150,.12)';
   for (let i = 0; i < 9; i++) {c.beginPath(); c.ellipse(rnd(0, width), rnd(0, 150), rnd(60, 120), rnd(14, 26), 0, 0, TAU); c.fill();}
  },
  init: () => ({drops: [], umbrella: {x: 280, y: 150}, timer: .2, caught: 0, wet: 0}),
  update(s, dt, api) {
   s.wet = Math.max(0, s.wet - dt);
   s.timer -= dt;
   if (s.timer <= 0) {s.drops.push({x: rnd(40, width - 40), y: -10, v: rnd(110, 160)}); s.timer = rnd(.25, .5);}
   s.drops.forEach(drop => {drop.y += drop.v * dt;});
   s.drops = s.drops.filter(drop => {
    const u = s.umbrella;
    if (Math.abs(drop.x - u.x) < 52 && drop.y > u.y - 34 && drop.y < u.y - 4) {
     s.caught++;
     api.ok();
     if (s.caught >= total) api.finish('Złapałaś dwanaście kropel! Na Tytanie pada deszcz z metanu i płyną rzeki oraz są jeziora z metanu. To jedyne miejsce poza Ziemią, gdzie widać takie jeziora. Wylądowała tam sonda Huygens!');
    return false;
    }
    if (drop.y > 262 && Math.abs(drop.x - 280) < 66) {s.wet = .4; return false;}
    return drop.y < height + 10;
   });
  },
  down(s, point) {s.umbrella = {x: clamp(point.x, 40, width - 40), y: clamp(point.y, 70, 200)};},
  move(s, point, api) {if (api.pressed) s.umbrella = {x: clamp(point.x, 40, width - 40), y: clamp(point.y, 70, 200)};},
  draw(c, s, t) {
   drawActBall(c, 'tytan', 280, 345, 98, '#d9a55b', 0);
   drawFace(c, 280, 292, 48, s.wet > 0 ? 'ouch' : 'smile', t, {x: clamp((s.umbrella.x - 280) / 200, -1, 1), y: -.5});
   s.drops.forEach(drop => {
    c.fillStyle = 'rgba(255,238,170,.95)';
    c.beginPath(); c.moveTo(drop.x, drop.y - 9); c.quadraticCurveTo(drop.x + 6, drop.y + 2, drop.x, drop.y + 5); c.quadraticCurveTo(drop.x - 6, drop.y + 2, drop.x, drop.y - 9); c.fill();
   });
   const u = s.umbrella;
   c.fillStyle = '#e8283c';
   c.beginPath(); c.arc(u.x, u.y - 4, 52, Math.PI, TAU); c.closePath(); c.fill();
   c.strokeStyle = '#fff'; c.lineWidth = 2.5;
   [-.55, 0, .55].forEach(k => {c.beginPath(); c.moveTo(u.x, u.y - 56); c.quadraticCurveTo(u.x + k * 40, u.y - 30, u.x + k * 52, u.y - 4); c.stroke();});
   c.strokeStyle = '#4b2d12'; c.lineWidth = 4; c.lineCap = 'round';
   c.beginPath(); c.moveTo(u.x, u.y - 4); c.lineTo(u.x, u.y + 40); c.arc(u.x - 7, u.y + 40, 7, 0, Math.PI); c.stroke();
   doneBadge(c, `Krople: ${s.caught} z ${total}`, 84, 28);
  },
  debug: s => ({drops: s.drops.map(drop => ({x: drop.x, y: drop.y})), umbrella: {...s.umbrella}, caught: s.caught})
 });
}

/* ---------- Enceladus: łaskotki i gejzery ---------- */

function createEnceladusActivity() {
 const width = 560, height = 340, cx = 280, cy = 140, R = 100;
 const cracks = [-.74, -.26, .26, .74].map(k => ({x: cx + k * R * .9, y: cy + R * Math.sqrt(1 - (k * .9) ** 2) - 12, progress: 0, done: false}));
 return createSimpleTask({
  title: '🤭 Połaskocz Enceladusa',
  lead: 'Enceladus ma na dole cztery pęknięcia, z których tryskają fontanny lodu. To jego łaskotki! Przytrzymaj palec na każdym pęknięciu, aż Enceladus się roześmieje!',
  hint: 'Przytrzymaj palec na jednym z jasnych pęknięć na dole Enceladusa.',
  init: () => ({active: -1, sparks: []}),
  update(s, dt, api) {
   cracks.forEach((crack, index) => {
    if (crack.done) return;
    if (s.active === index) crack.progress += dt;
    else crack.progress = Math.max(0, crack.progress - dt * .8);
    if (crack.progress >= .9) {
     crack.done = true;
     api.ok();
     if (cracks.every(item => item.done)) api.finish('Enceladus śmieje się ze wszystkich pęknięć! Z jego fontann tryska woda zamarznięta w lód. Tworzy ona jeden z pierścieni Saturna. Sonda Cassini przeleciała przez te fontanny i zebrała próbki!');
     else api.say('Hihihi! Łaskocze! Jeszcze inne pęknięcie!');
    }
    if ((s.active === index || crack.done) && Math.random() < dt * 40) s.sparks.push({x: crack.x, y: crack.y, vx: rnd(-30, 30) + (crack.x - cx) * .6, vy: rnd(80, 150), life: 0});
   });
   s.sparks.forEach(sp => {sp.life += dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt;});
   s.sparks = s.sparks.filter(sp => sp.life < 1);
  },
  down(s, point) {s.active = cracks.findIndex(crack => !crack.done && Math.hypot(point.x - crack.x, point.y - crack.y) < 28);},
  move(s, point, api) {
   if (!api.pressed) return;
   s.active = cracks.findIndex(crack => !crack.done && Math.hypot(point.x - crack.x, point.y - crack.y) < 28);
  },
  up(s) {s.active = -1;},
  draw(c, s, t) {
   s.sparks.forEach(sp => {c.fillStyle = `rgba(200,235,255,${1 - sp.life})`; c.beginPath(); c.arc(sp.x, sp.y, 2.4, 0, TAU); c.fill();});
   drawActBall(c, 'enceladus', cx, cy, R, '#eef4fa', 0);
   const laugh = s.active >= 0 || cracks.some(crack => crack.done);
   drawFace(c, cx, cy - 12, R * .62, s.active >= 0 ? 'laugh' : (laugh ? 'smile' : 'smile'), t);
   cracks.forEach((crack, index) => {
    c.strokeStyle = crack.done ? '#7ee787' : '#7fd0ff'; c.lineWidth = 4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(crack.x - 10, crack.y - 8 + Math.abs(index - 1.5) * 3); c.lineTo(crack.x + 10, crack.y + 6); c.stroke();
    if (!crack.done) {
     const pulse = Math.sin(t * .008 + index) * .5 + .5;
     c.strokeStyle = `rgba(255,229,138,${.3 + .4 * pulse})`; c.lineWidth = 2.5;
     c.beginPath(); c.arc(crack.x, crack.y, 17 + pulse * 3, 0, TAU); c.stroke();
     if (crack.progress > .02) {
      c.strokeStyle = '#ffe58a'; c.lineWidth = 5;
      c.beginPath(); c.arc(crack.x, crack.y, 26, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, crack.progress / .9)); c.stroke();
     }
    }
   });
   doneBadge(c, `Łaskotki: ${cracks.filter(crack => crack.done).length} z 4`, 84, 28);
  },
  debug: () => ({cracks: cracks.map(crack => ({x: crack.x, y: crack.y, done: crack.done}))})
 });
}

/* ---------- Japetus: dwie buzie ---------- */

function createIapetusActivity() {
 const width = 560, height = 340, cx = 280, cy = 176, R = 118;
 const texture = textureOf('japetus');
 /* jasność mapy wzdłuż równika: ciemna i jasna strona Japetusa */
 const lumAt = lon => {
  if (!texture) return .5;
  let sum = 0;
  for (let k = -3; k <= 3; k++) {
   const l = lon + k * .12;
   const u = Math.floor((((l / TAU) % 1) + 1.5) % 1 * texture.width) % texture.width;
   for (const lat of [-.25, 0, .25]) {
    const v = Math.floor((.5 - lat / Math.PI) * texture.height);
    const px = texture.data[v * texture.width + u];
    sum += ((px & 255) + ((px >>> 8) & 255) + ((px >>> 16) & 255)) / 765;
   }
  }
  return sum / 21;
 };
 let lo = 1, hi = 0;
 for (let k = 0; k < 72; k++) {const l = lumAt(k / 72 * TAU - Math.PI); lo = Math.min(lo, l); hi = Math.max(hi, l);}
 const kindAt = rotation => {
  const l = lumAt(rotation);
  if (l < lo + (hi - lo) * .28) return 'dark';
  if (l > hi - (hi - lo) * .28) return 'bright';
  return null;
 };
 return createSimpleTask({
  title: '🌗 Dwie buzie Japetusa',
  lead: 'Japetus ma dwie buzie: jedna strona jest czarna jak węgiel, a druga biała jak śnieg! Kręć nim palcem i znajdź obie buzie. Przytrzymaj każdą chwilę na środku!',
  hint: 'Pokręć Japetusem palcem w lewo albo w prawo, aż na środku pojawi się ciemna albo jasna strona.',
  init: () => ({rotation: 0, last: null, hold: {dark: 0, bright: 0}, found: {dark: false, bright: false}, kind: null}),
  update(s, dt, api) {
   if (!api.pressed) s.rotation += dt * .32;
   s.kind = kindAt(s.rotation);
   ['dark', 'bright'].forEach(key => {
    if (s.found[key]) return;
    s.hold[key] = s.kind === key ? s.hold[key] + dt : Math.max(0, s.hold[key] - dt);
    if (s.hold[key] > .7) {
     s.found[key] = true;
     api.ok();
     if (s.found.dark && s.found.bright) api.finish('Znalazłaś obie buzie Japetusa! Jedna strona jest ciemna, bo pokrył ją ciemny pył, a druga jasna jak lód. Wokół Japetusa biegnie też wysoki grzbiet, przez który wygląda trochę jak orzech włoski.');
     else api.say(key === 'dark' ? 'To jest smutna, czarna buzia! Teraz znajdź tę wesołą, białą.' : 'To jest wesoła, biała buzia! Teraz znajdź tę ciemną.');
    }
   });
  },
  down(s, point) {s.last = point.x;},
  move(s, point, api) {if (api.pressed && s.last !== null) {s.rotation += (point.x - s.last) * .012; s.last = point.x;}},
  up(s) {s.last = null;},
  draw(c, s, t) {
   drawActBall(c, 'japetus', cx, cy, R, '#6e5f50', s.rotation);
   const mood = s.kind === 'dark' ? 'sad' : (s.kind === 'bright' ? 'laugh' : 'smile');
   drawFace(c, cx, cy + 4, R * .62, mood, t);
   doneBadge(c, `Buzie: ${(s.found.dark ? 1 : 0) + (s.found.bright ? 1 : 0)} z 2`, 84, 28);
   ['dark', 'bright'].forEach((key, i) => {
    if (s.hold[key] > .02 && !s.found[key]) {
     c.strokeStyle = '#ffe58a'; c.lineWidth = 6;
     c.beginPath(); c.arc(cx, cy, R + 12, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, s.hold[key] / .7)); c.stroke();
    }
   });
  },
  debug: s => ({rotation: s.rotation, kind: s.kind, found: {...s.found}, kindAt: rot => kindAt(rot), lo, hi})
 });
}

/* ---------- Reja: lodowa, ale brudna ---------- */

function createRheaActivity() {
 const width = 560, height = 340, cx = 280, cy = 172, R = 128;
 return createWipeActivity({
  title: '🧽 Wyszoruj lodową Reję',
  lead: 'Reja cała pokryła się ciemnym kurzem! Szoruj palcem, żeby zobaczyć, jaka jest naprawdę. Pod spodem jest czysty lód!',
  width, height,
  probe: {x: cx - R, y: cy - R, w: R * 2, h: R * 2},
  brush: 52,
  paintScene(c) {
   paintActStars(c, width, height, 90);
   drawActBall(c, 'reja', cx, cy, R, '#c8ccd4', .2);
  },
  paintDust(c) {
   c.fillStyle = 'rgba(52,44,46,.97)';
   c.beginPath(); c.arc(cx, cy, R + 1, 0, TAU); c.fill();
   c.fillStyle = 'rgba(90,76,72,.55)';
   for (let i = 0; i < 34; i++) {const a = rnd(0, TAU), d = rnd(0, R * .9); c.beginPath(); c.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rnd(5, 16), 0, TAU); c.fill();}
   c.strokeStyle = '#2a1f20'; c.lineWidth = 6; c.lineCap = 'round';
   [-1, 1].forEach(side => {c.beginPath(); c.moveTo(cx + side * 50 - 18, cy - 20); c.lineTo(cx + side * 50 + 18, cy - 20); c.stroke();});
   c.beginPath(); c.arc(cx, cy + 44, 26, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  },
  doneRatio: .12,
  doneText: 'Reja lśni czysta! To druga co do wielkości księżyc Saturna, zrobiona prawie cała z lodu wodnego. Ma mnóstwo kraterów, ale jest jasna i śliczna!'
 });
}

/* ---------- Dione: smugi na ciemnej plamie ---------- */

function createDioneActivity() {
 return createGlobeHuntActivity({
  title: '🔭 Znajdź tajemnicze smugi Dione',
  lead: 'Dione obraca się powoli. Gdzieś na niej jest ciemna plama z jasnymi smugami, jakby ktoś narysował pazurkiem kota. Dotknij jej, kiedy się pokaże!',
  textureKey: 'dione', color: '#dde2ea', radius: 136, speed: -.34, startRotation: -.6, hintAfter: 12,
  targets: [{lon: 62, lat: -4, rho: .38, foundText: 'Jest! To jasne smugi na Dione. To tak naprawdę wysokie, lodowe klify, a ciemniejsza plama wokół to kurz.'}],
  doneText: 'Znalazłaś smugi Dione! To długie klify z lodu, wysokie nawet na kilometr. Dione jest jednym z księżyców Saturna, a sonda Cassini zrobiła jej wiele zdjęć.'
 });
}

/* ---------- Tytania i Oberon: ubieranie króla i królowej wróżek ---------- */

function createDressUpActivity(cfg) {
 const width = 560, height = 340, cx = 280, cy = 182, R = 92;
 const items = cfg.items.map((item, index) => ({...item, hx: index % 2 ? 484 : 76, hy: 80 + Math.floor(index / 2) * 0 + index * 78, x: 0, y: 0, placed: false}));
 items.forEach(item => {item.x = item.hx; item.y = item.hy;});
 let dragging = null, offset = {x: 0, y: 0};
 const snapOf = item => ({x: cx + item.snap.x, y: cy + item.snap.y});
 return createSimpleTask({
  title: cfg.title, lead: cfg.lead, hint: 'Przeciągnij ubranko na buzię albo głowę księżyca!', width, height,
  init: () => ({dance: 0}),
  update(s, dt) {s.dance = Math.max(0, s.dance - dt);},
  down(s, point) {
   dragging = items.find(item => !item.placed && Math.hypot(point.x - item.x, point.y - item.y) < 40) || null;
   if (dragging) offset = {x: dragging.x - point.x, y: dragging.y - point.y};
  },
  move(s, point) {if (dragging) {dragging.x = point.x + offset.x; dragging.y = point.y + offset.y;}},
  up(s, api) {
   if (!dragging) return;
   const item = dragging;
   dragging = null;
   const snap = snapOf(item);
   if (Math.hypot(item.x - snap.x, item.y - snap.y) < 62) {
    item.placed = true; item.x = snap.x; item.y = snap.y; s.dance = 1.2;
    api.ok();
    if (items.every(other => other.placed)) api.finish(cfg.doneText);
    else api.say(item.text);
   } else {
    api.miss();
    api.say(item.wrong || 'Tu nie pasuje. Spróbuj na głowie albo na buzi!');
    item.x = item.hx; item.y = item.hy;
   }
  },
  draw(c, s, t) {
   const sway = s.dance > 0 ? Math.sin(t * .02) * 7 : 0;
   drawActBall(c, cfg.textureKey, cx + sway, cy, R, cfg.color, t * .00004);
   drawFace(c, cx + sway, cy + 6, R * .6, s.dance > 0 ? 'laugh' : 'smile', t);
   items.forEach(item => {
    const bob = item.placed ? 0 : Math.sin(t * .004 + item.hy) * 3;
    c.font = `${item.size || 46}px system-ui, sans-serif`;
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#000';
    c.fillText(item.emoji, item.x + (item.placed ? sway : 0), item.y + bob);
    c.textBaseline = 'alphabetic';
    if (!item.placed) {c.fillStyle = '#cfe0f5'; c.font = '700 13px system-ui, sans-serif'; c.fillText(item.label, item.hx, item.hy + 42);}
   });
   doneBadge(c, `Ubranka: ${items.filter(item => item.placed).length} z ${items.length}`, 84, 28);
  },
  debug: () => ({items: items.map(item => ({x: item.x, y: item.y, hx: item.hx, hy: item.hy, snap: snapOf(item), placed: item.placed}))})
 });
}

function createTitaniaActivity() {
 return createDressUpActivity({
  title: '👑 Ubierz królową Tytanię',
  lead: 'Tytania nosi imię królowej wróżek ze "Snu nocy letniej". Ubierz ją jak królową: załóż koronę, daj jej czarodziejską różdżkę i wianek z kwiatów. Przeciągaj ubranka na Tytanię!',
  textureKey: 'tytania', color: '#9fb4c0',
  items: [
   {emoji: '👑', label: 'korona', snap: {x: 0, y: -R_TOP}, text: 'Korona! Tytania wygląda jak prawdziwa królowa!'},
   {emoji: '🪄', label: 'różdżka', snap: {x: 100, y: 12}, text: 'Różdżka! Czary mary!'},
   {emoji: '🌺', label: 'kwiaty', snap: {x: 0, y: 84}, text: 'Piękny wianek z kwiatów!'}
  ],
  doneText: 'Tytania jest gotowa na bal! To największy księżyc Urana, ma ponad półtora tysiąca kilometrów szerokości. Ma też ogromne kaniony, a odkrył ją w 1787 roku William Herschel.'
 });
}

function createOberonActivity() {
 return createDressUpActivity({
  title: '🕶️ Ubierz króla Oberona',
  lead: 'Oberon nosi imię króla elfów, męża Tytanii. Jest bardzo daleko i mroźno, więc ubierz go na cały dzień: koronę, ciemne okulary i ciepły szalik. Przeciągaj ubranka na Oberona!',
  textureKey: 'oberon', color: '#7d8f9a',
  items: [
   {emoji: '👑', label: 'korona', snap: {x: 0, y: -R_TOP}, text: 'Korona na głowie króla!'},
   {emoji: '🕶️', label: 'okulary', snap: {x: 0, y: -8}, text: 'Ale z niego twardziel w okularach!'},
   {emoji: '🧣', label: 'szalik', snap: {x: 0, y: 78}, text: 'Szalik! Teraz nie zmarznie.'}
  ],
  doneText: 'Oberon jest gotowy! To drugi co do wielkości księżyc Urana. Ma wiele wielkich kraterów, a w niektórych z nich dno jest ciemne. Odkrył go William Herschel razem z Tytanią.'
 });
}
const R_TOP = 92;

/* ---------- silnik okrążeń: Tryton pod prąd, Charon w tańcu, mieszanie Drogi Mlecznej ---------- */

function createLapActivity(cfg) {
 const width = cfg.width || 560, height = cfg.height || 340;
 const center = cfg.center || {x: 280, y: 172};
 const dir = cfg.dir || 0;
 const laps = cfg.laps || 1;
 return createSimpleTask({
  title: cfg.title, lead: cfg.lead, hint: cfg.hint, width, height,
  paintBg: cfg.paintBg,
  init: () => ({angle: cfg.startAngle || 0, progress: 0, last: null, drag: false, scold: 0}),
  update(s, dt, api) {
   s.scold = Math.max(0, s.scold - dt);
   if (cfg.update) cfg.update(s, dt, api);
  },
  down(s, point) {
   const m = cfg.moverAt(s);
   if (Math.hypot(point.x - m.x, point.y - m.y) < (cfg.grab || 56)) {s.drag = true; s.last = Math.atan2(point.y - center.y, point.x - center.x);}
  },
  move(s, point, api) {
   if (!s.drag) return;
   const now = Math.atan2(point.y - center.y, point.x - center.x);
   let delta = now - s.last;
   while (delta > Math.PI) delta -= TAU;
   while (delta < -Math.PI) delta += TAU;
   s.last = now;
   s.angle = now;
   if (dir === 0) s.progress += Math.abs(delta);
   else {
    s.progress = Math.max(0, s.progress + delta * dir);
    if (delta * dir < -.05 && s.scold <= 0) {s.scold = 4; api.miss(); api.say(cfg.wrongText);}
   }
   if (s.progress >= laps * TAU) api.finish(cfg.doneText);
  },
  up(s) {s.drag = false;},
  draw(c, s, t) {
   cfg.draw(c, s, t);
   const u = Math.min(1, s.progress / (laps * TAU));
   c.fillStyle = 'rgba(255,255,255,.15)'; c.beginPath(); c.roundRect(180, 318, 200, 10, 5); c.fill();
   c.fillStyle = '#ffe58a'; c.beginPath(); c.roundRect(180, 318, Math.max(10, 200 * u), 10, 5); c.fill();
  },
  debug: s => ({center, orbit: cfg.orbit, dir, laps, angle: s.angle, progress: s.progress, mover: cfg.moverAt(s)})
 });
}

function createTritonActivity() {
 const center = {x: 280, y: 172}, orbit = 120;
 const others = [0, 2.1, 4.2];
 const moverAt = s => ({x: center.x + Math.cos(s.angle) * orbit * 1.45, y: center.y + Math.sin(s.angle) * orbit * .66});
 return createLapActivity({
  title: '↩️ Tryton pod prąd',
  lead: 'Wszystkie wielkie księżyce krążą wokół planety w tę samą stronę. Tryton jako jedyny biegnie pod prąd! Kręć nim dookoła Neptuna w przeciwną stronę niż małe księżyce, tam, gdzie wskazują strzałki z tyłu.',
  hint: 'Pociągnij Trytona dookoła Neptuna, w przeciwną stronę niż małe księżyce.',
  center, orbit, dir: -1, laps: 1, startAngle: 0, ringGap: 62, grab: 58,
  wrongText: 'Hej, w drugą stronę! Tryton biegnie pod prąd, odwrotnie niż inne księżyce.',
  moverAt,
  doneText: 'Tryton biegnie pod prąd! To jedyny wielki księżyc, który krąży wokół planety w przeciwną stronę, niż ona się obraca. Pewnie Neptun złapał go, gdy Tryton wędrował sam przez kosmos. Są na nim lodowe gejzery, które odkryła sonda Voyager 2!',
  draw(c, s, t) {
   c.strokeStyle = 'rgba(104,171,239,.4)'; c.lineWidth = 1.5; c.setLineDash([4, 7]);
   c.beginPath(); c.ellipse(center.x, center.y, orbit * 1.45, orbit * .66, 0, 0, TAU); c.stroke(); c.setLineDash([]);
   const drawSmall = () => others.forEach((phase, index) => {
    const a = phase + t * .0006;
    const x = center.x + Math.cos(a) * orbit * 1.45, y = center.y + Math.sin(a) * orbit * .66;
    c.fillStyle = ['#b9b9c4', '#c9a98c', '#9fb4c0'][index];
    c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill();
    drawFace(c, x, y, 7, 'smile', t);
    c.save(); c.translate(x, y); c.rotate(Math.atan2(orbit * .66 * Math.cos(a), -orbit * 1.45 * Math.sin(a)));
    c.fillStyle = '#ffe58a'; c.font = '700 16px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('➜', 22, 0); c.textBaseline = 'alphabetic'; c.restore();
   });
   drawSmall();
   drawActBall(c, 'neptune', center.x, center.y, 56, '#356ce0', t * .00004);
   const m = moverAt(s);
   drawTritonKid(m.x, m.y, 20, t);
   c.fillStyle = '#fff'; c.font = '800 13px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('Tryton', m.x, m.y + 48);
  }
 });
}

function createCharonActivity() {
 const center = {x: 280, y: 172}, orbit = 96;
 const parts = s => {
  const cx = center.x + Math.cos(s.angle) * orbit * 1.35, cy = center.y + Math.sin(s.angle) * orbit * .8;
  const px = center.x - Math.cos(s.angle) * orbit * .22 * 1.35, py = center.y - Math.sin(s.angle) * orbit * .22 * .8;
  return {charon: {x: cx, y: cy}, pluto: {x: px, y: py}};
 };
 return createLapActivity({
  title: '💃 Zatańcz z Plutonem',
  lead: 'Pluton i jego księżyc Charon wciąż patrzą sobie w oczy, jak para tancerzy! Złap Charona i zakręć nim dookoła Plutona. Pluton się trochę zakręci razem z nim. Zrób półtora obrotu!',
  hint: 'Złap małego Charona i prowadź go dookoła Plutona w kółko.',
  center, orbit, dir: 0, laps: 1.5, startAngle: -2.2, ringGap: 60, grab: 52,
  moverAt: s => parts(s).charon,
  doneText: 'Brawo, to był piękny taniec! Charon jest tak duży w porównaniu z Plutonem, że oba krążą wokół wspólnego punktu poza Plutonem. Zawsze zwrócone są do siebie tą samą stroną. Dlatego mówi się, że to prawie podwójna planeta karłowata!',
  draw(c, s, t) {
   const p = parts(s);
   c.strokeStyle = 'rgba(104,171,239,.35)'; c.lineWidth = 1.5; c.setLineDash([4, 7]);
   c.beginPath(); c.ellipse(center.x, center.y, orbit * 1.35, orbit * .8, 0, 0, TAU); c.stroke(); c.setLineDash([]);
   drawActBall(c, 'pluto', p.pluto.x, p.pluto.y, 44, '#c8a98c', s.angle + Math.PI);
   const look = {x: Math.cos(s.angle), y: Math.sin(s.angle)};
   drawFace(c, p.pluto.x, p.pluto.y + 4, 30, s.drag ? 'laugh' : 'smile', t, look);
   drawActBall(c, 'charon', p.charon.x, p.charon.y, 26, '#b8b0aa', 0);
   drawFace(c, p.charon.x, p.charon.y + 2, 18, s.drag ? 'laugh' : 'smile', t, {x: -look.x, y: -look.y});
   c.fillStyle = '#fff'; c.font = '800 13px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('Charon', p.charon.x, p.charon.y + 42);
   c.fillText('Pluton', p.pluto.x, p.pluto.y + 62);
  }
 });
}

function createMilkyWayActivity() {
 const center = {x: 280, y: 172}, orbit = 118;
 const moverAt = s => ({x: center.x + Math.cos(s.angle) * orbit, y: center.y + Math.sin(s.angle) * orbit});
 return createLapActivity({
  title: '🥛 Zamieszaj Drogę Mleczną',
  lead: 'Nasza galaktyka nazywa się Drogą Mleczną, bo dawni ludzie myśleli, że to rozlane mleko na niebie. Złap łyżeczkę i zamieszaj nią dwa razy dookoła, tak aż galaktyka się zakręci!',
  hint: 'Złap łyżeczkę i kręć nią kółka dookoła galaktyki.',
  center, orbit, dir: 0, laps: 2, startAngle: -1.2, ringGap: 52, grab: 56,
  paintBg: (c, w, h) => {const g = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, 260); g.addColorStop(0, '#0d1a3a'); g.addColorStop(1, '#02040c'); c.fillStyle = g; c.fillRect(0, 0, w, h); paintActStarsOn(c, w, h);},
  moverAt,
  doneText: 'Zamieszałaś Drogę Mleczną! Ta wielka spirala to nasz dom: ma setki miliardów gwiazd, a Układ Słoneczny mieszka w jednym z jej ramion. Galaktyka naprawdę się kręci. Jeden obrót zajmuje Słońcu około dwustu pięćdziesięciu milionów lat!',
  draw(c, s, t) {
   const img = imageOf('milky_way');
   c.save();
   c.translate(center.x, center.y);
   c.rotate(s.progress * .85);
   c.beginPath(); c.arc(0, 0, 100, 0, TAU); c.clip();
   if (img) c.drawImage(img, -104, -104, 208, 208);
   else {c.fillStyle = '#6f8ad8'; c.fillRect(-100, -100, 200, 200);}
   c.restore();
   drawFace(c, center.x, center.y + 2, 34, s.drag ? 'laugh' : 'smile', t);
   const m = moverAt(s);
   c.save();
   c.translate(m.x, m.y); c.rotate(s.angle + Math.PI / 2 + .6);
   c.strokeStyle = '#d8d8e8'; c.lineWidth = 5; c.lineCap = 'round';
   c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 46); c.stroke();
   c.fillStyle = '#e8e8f4'; c.beginPath(); c.ellipse(0, -8, 13, 19, 0, 0, TAU); c.fill();
   c.restore();
  }
 });
}

function paintActStarsOn(c, width, height) {
 c.fillStyle = '#fff';
 for (let i = 0; i < 90; i++) {c.globalAlpha = .25 + Math.random() * .6; c.fillRect(Math.random() * width, Math.random() * height, 1.6, 1.6);}
 c.globalAlpha = 1;
}

/* ---------- Merkury: uratuj lodowy kostek ---------- */

function createMercuryActivity() {
 const width = 560, height = 340, cx = 320, cy = 184, R = 120;
 const crater = {x: cx + 24, y: cy - R * .8, rx: 46, ry: 17};
 const home = [{x: cx - 90, y: cy + 4}, {x: cx - 52, y: cy + 62}];
 const meltTime = 7;
 return createSimpleTask({
  title: '🧊 Uratuj lodowy kostek na Merkurym',
  lead: 'Na Merkurym jest strasznie gorąco, a lodowe kostki się topią! Ale przy biegunie są głębokie, ciemne kratery, w których Słońce nigdy nie świeci. Przeciągnij kostki do ciemnego krateru, zanim się roztopią!',
  hint: 'Złap kostkę lodu palcem i przeciągnij ją do ciemnego krateru na górze Merkurego.',
  width, height,
  init: () => ({cubes: home.map((h, index) => ({x: h.x, y: h.y, melt: index * .3, safe: false})), drag: null, offset: {x: 0, y: 0}, saved: 0, puddle: 0}),
  update(s, dt, api) {
   s.puddle = Math.max(0, s.puddle - dt);
   s.cubes.forEach((cube, index) => {
    if (cube.safe) return;
    cube.melt += dt / meltTime;
    if (cube.melt >= 1) {
     cube.melt = 0; cube.x = home[index].x; cube.y = home[index].y; s.puddle = 2.5;
     if (s.drag === cube) s.drag = null;
     api.miss(); api.say('Ojej, kostek się roztopił! Nowy już biegnie. Szybciej do ciemnego krateru!');
    }
   });
  },
  down(s, point) {
   const cube = s.cubes.find(item => !item.safe && Math.hypot(point.x - item.x, point.y - item.y) < 40);
   if (cube) {s.drag = cube; s.offset = {x: cube.x - point.x, y: cube.y - point.y};}
  },
  move(s, point) {if (s.drag) {s.drag.x = point.x + s.offset.x; s.drag.y = point.y + s.offset.y;}},
  up(s, api) {
   const cube = s.drag;
   s.drag = null;
   if (!cube) return;
   if (((cube.x - crater.x) / (crater.rx + 22)) ** 2 + ((cube.y - crater.y) / (crater.ry + 26)) ** 2 <= 1) {
    cube.safe = true; cube.melt = 0;
    cube.x = crater.x + (s.saved ? 24 : -22); cube.y = crater.y + 2;
    s.saved++;
    api.ok();
    if (s.saved >= s.cubes.length) api.finish('Uratowałaś lód! W głębokich kraterach na biegunach Merkurego naprawdę leży lód, bo Słońce tam nigdy nie zagląda. Znalazła go sonda MESSENGER. Na Merkurym w dzień jest ponad czterysta stopni, a w cieniu jest mróz!');
    else api.say('Brr, jak tu zimno i przyjemnie! Kostek jest uratowany. Został jeszcze jeden!');
   }
  },
  draw(c, s, t) {
   const glare = c.createRadialGradient(-30, 170, 20, -30, 170, 330);
   glare.addColorStop(0, 'rgba(255,190,70,.55)'); glare.addColorStop(1, 'rgba(255,190,70,0)');
   c.fillStyle = glare; c.fillRect(0, 0, width, height);
   const sunGrad = c.createRadialGradient(24, 160, 8, 36, 170, 62);
   sunGrad.addColorStop(0, '#fff3a0'); sunGrad.addColorStop(.6, '#ffb43a'); sunGrad.addColorStop(1, '#e8741a');
   c.fillStyle = sunGrad; c.beginPath(); c.arc(36, 170, 54, 0, TAU); c.fill();
   drawFace(c, 36, 172, 40, 'laugh', t);
   c.fillStyle = '#ffe58a'; c.font = '800 13px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('Słońce, ale gorąco!', 62, 250);
   drawActBall(c, 'mercury', cx, cy, R, '#9b8d7a', .4);
   c.fillStyle = '#05060c';
   c.beginPath(); c.ellipse(crater.x, crater.y, crater.rx, crater.ry, 0, 0, TAU); c.fill();
   c.strokeStyle = 'rgba(120,190,255,.7)'; c.lineWidth = 2.5; c.stroke();
   c.fillStyle = '#cfe9ff'; c.font = '700 13px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('ciemny krater, tu jest zimno', crater.x, crater.y - 28);
   if (s.puddle > 0) {c.fillStyle = 'rgba(150,200,255,.5)'; c.beginPath(); c.ellipse(home[0].x, home[0].y + 24, 30, 8, 0, 0, TAU); c.fill();}
   s.cubes.forEach(cube => {
    const size = 36 * (1 - .55 * cube.melt);
    c.fillStyle = cube.safe ? '#dff4ff' : '#bfe3ff';
    c.strokeStyle = '#6fb0e0'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(cube.x - size / 2, cube.y - size / 2, size, size, 8); c.fill(); c.stroke();
    drawFace(c, cube.x, cube.y + 2, size * .5, cube.safe ? 'laugh' : (cube.melt > .5 ? 'wow' : 'ouch'), t);
    if (!cube.safe) {
     c.fillStyle = 'rgba(130,200,255,.9)';
     for (let k = 0; k < 2; k++) {const drip = (t * .002 + k * .5) % 1; c.beginPath(); c.arc(cube.x + (k ? 14 : -14), cube.y + size / 2 + drip * 14, 2.6, 0, TAU); c.fill();}
    } else {c.font = '14px system-ui, sans-serif'; c.fillText('❄️', cube.x, cube.y - size / 2 - 4);}
   });
   doneBadge(c, `Uratowane: ${s.saved} z 2`, 84, 28);
  },
  debug: s => ({cubes: s.cubes.map(cube => ({x: cube.x, y: cube.y, safe: cube.safe})), crater})
 });
}

/* ---------- Ramię Oriona: gdzie mieszka Słońce? ---------- */

function createOrionActivity() {
 const width = 560, height = 340;
 const sun = {x: 352, y: 148};
 return createTorchActivity({
  title: '🔦 Gdzie mieszka nasze Słońce?',
  lead: 'To fragment Ramienia Oriona w naszej galaktyce, pełen gwiazd. Wśród nich mieszka nasze Słońce, takie żółte i uśmiechnięte! Zaświeć latarką i je znajdź. Przytrzymaj światło na Słońcu!',
  width, height,
  paintScene(c) {
   const g = c.createLinearGradient(0, 0, width, height);
   g.addColorStop(0, '#05070f'); g.addColorStop(.5, '#14183a'); g.addColorStop(1, '#05070f');
   c.fillStyle = g; c.fillRect(0, 0, width, height);
   const colors = ['#cfe0ff', '#ffffff', '#ffd9a0', '#ff9c7a', '#9db8ff'];
   for (let i = 0; i < 320; i++) {
    const along = Math.random(), across = (Math.random() + Math.random() - 1) * 90;
    const x = along * width, y = height * (.8 - along * .6) + across;
    c.globalAlpha = .35 + Math.random() * .6;
    c.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    c.beginPath(); c.arc(x, y, Math.random() < .08 ? 2.8 : rnd(.6, 1.6), 0, TAU); c.fill();
   }
   c.globalAlpha = 1;
   const glow = c.createRadialGradient(sun.x, sun.y, 1, sun.x, sun.y, 22);
   glow.addColorStop(0, 'rgba(255,230,120,.9)'); glow.addColorStop(1, 'rgba(255,230,120,0)');
   c.fillStyle = glow; c.beginPath(); c.arc(sun.x, sun.y, 22, 0, TAU); c.fill();
   c.fillStyle = '#ffd53a'; c.beginPath(); c.arc(sun.x, sun.y, 7, 0, TAU); c.fill();
   drawFace(c, sun.x, sun.y, 7, 'smile');
  },
  targets: [{
   center: {x: sun.x, y: sun.y},
   test: point => Math.hypot(point.x - sun.x, point.y - sun.y) < 28,
   mark: c => {c.strokeStyle = '#7ee787'; c.lineWidth = 4; c.beginPath(); c.arc(sun.x, sun.y, 20, 0, TAU); c.stroke();}
  }],
  torchRadius: 92, dwell: .5, hintAfter: 14,
  doneText: 'Znalazłaś nasze Słońce! Mieszka w niewielkiej odnodze galaktyki, którą nazywamy Ramieniem Oriona. To tylko jedna z setek miliardów gwiazd w Drodze Mlecznej!'
 });
}

/* ---------- Andromeda: przytulenie dwóch galaktyk ---------- */

function createAndromedaActivity() {
 return createSimpleTask({
  title: '🤗 Andromeda przytula Drogę Mleczną',
  lead: 'Galaktyka Andromedy to nasza największa sąsiadka i wcale nie jest nieśmiała: leci w naszą stronę! Przeciągnij Andromedę do Drogi Mlecznej i pozwól im się przytulić.',
  hint: 'Złap Andromedę palcem i przeciągnij ją do Drogi Mlecznej.',
  init: () => ({mw: {x: 150, y: 176, r: 72}, an: {x: 440, y: 176, r: 80}, drag: false, off: {x: 0, y: 0}, hug: 0}),
  down(s, point) {
   if (s.hug) return;
   if (Math.hypot(point.x - s.an.x, point.y - s.an.y) < s.an.r + 8) {s.drag = true; s.off = {x: s.an.x - point.x, y: s.an.y - point.y};}
  },
  move(s, point) {if (s.drag && !s.hug) {s.an.x = clamp(point.x + s.off.x, 80, 520); s.an.y = clamp(point.y + s.off.y, 80, 262);}},
  up(s) {s.drag = false;},
  update(s, dt, api) {
   if (!s.hug && Math.hypot(s.mw.x - s.an.x, s.mw.y - s.an.y) < s.mw.r + s.an.r + 12) {s.hug = .001; s.drag = false; api.ok();}
   if (s.hug) {
    s.hug += dt;
    const mid = {x: (s.mw.x + s.an.x) / 2, y: (s.mw.y + s.an.y) / 2};
    s.mw.x += (mid.x - 34 - s.mw.x) * Math.min(1, dt * 3); s.mw.y += (mid.y - s.mw.y) * Math.min(1, dt * 3);
    s.an.x += (mid.x + 34 - s.an.x) * Math.min(1, dt * 3); s.an.y += (mid.y - s.an.y) * Math.min(1, dt * 3);
    if (s.hug > 2.2) api.finish('Przytulone! Naprawdę Andromeda leci w naszą stronę. Za jakieś cztery do pięciu miliardów lat zderzy się z Drogą Mleczną i obie zrobią jedną wielką galaktykę. Ale spokojnie, gwiazdy są tak daleko od siebie, że prawie nie wpadną na siebie!');
   }
  },
  draw(c, s, t) {
   const drawGalaxy = (g, key, spin) => {
    c.save(); c.translate(g.x, g.y); c.rotate(spin);
    c.beginPath(); c.arc(0, 0, g.r, 0, TAU); c.clip();
    const img = imageOf(key);
    if (img) c.drawImage(img, -g.r * 1.05, -g.r * 1.05, g.r * 2.1, g.r * 2.1);
    else {c.fillStyle = '#6f8ad8'; c.fillRect(-g.r, -g.r, g.r * 2, g.r * 2);}
    c.restore();
    c.strokeStyle = 'rgba(180,200,255,.45)'; c.lineWidth = 2; c.beginPath(); c.arc(g.x, g.y, g.r, 0, TAU); c.stroke();
   };
   drawGalaxy(s.mw, 'milky_way', t * .0002);
   drawGalaxy(s.an, 'andromeda', -t * .00012);
   const mood = s.hug ? 'laugh' : (s.drag ? 'wow' : 'smile');
   drawFace(c, s.mw.x, s.mw.y + 4, 34, mood, t, {x: 1, y: 0});
   drawFace(c, s.an.x, s.an.y + 4, 36, mood, t, {x: -1, y: 0});
   c.fillStyle = '#fff'; c.font = '800 13px system-ui, sans-serif'; c.textAlign = 'center';
   c.fillText('Droga Mleczna', s.mw.x, s.mw.y + s.mw.r + 20);
   c.fillText('Andromeda', s.an.x, s.an.y + s.an.r + 20);
   if (s.hug) {
    c.font = '26px system-ui, sans-serif';
    for (let k = 0; k < 4; k++) {const u = (t * .0008 + k / 4) % 1; c.globalAlpha = 1 - u; c.fillText('💞', (s.mw.x + s.an.x) / 2 + Math.sin(k * 2.3) * 40, (s.mw.y + s.an.y) / 2 - 60 - u * 70);}
    c.globalAlpha = 1;
   }
  },
  debug: s => ({mw: {...s.mw}, an: {...s.an}, hug: s.hug})
 });
}

/* ---------- Voyager 1: czerwony kabel do czerwonego gniazdka ---------- */

function createVoyager1Activity() {
 const width = 560, height = 340;
 const colors = [{name: 'czerwony', hex: '#e8283c'}, {name: 'niebieski', hex: '#2f7de8'}, {name: 'zielony', hex: '#2fb45a'}];
 const rows = [96, 176, 256];
 const socketOrder = [1, 2, 0];
 const sockets = socketOrder.map((colorIndex, index) => ({x: 478, y: rows[index], color: colorIndex, taken: false}));
 const plugs = colors.map((color, index) => ({color: index, x: 120, y: rows[index], hx: 120, hy: rows[index], placed: false}));
 let dragging = null, offset = {x: 0, y: 0};
 return createSimpleTask({
  title: '🔌 Podłącz kable w Voyagerze 1',
  lead: 'Voyager 1 jest tak daleko, że jego kable się poluzowały! Pomóż mu: podłącz każdy kabel do gniazdka w tym samym kolorze. Czerwony do czerwonego, niebieski do niebieskiego i zielony do zielonego!',
  hint: 'Złap kolorową wtyczkę i przeciągnij ją do gniazdka w tym samym kolorze.',
  init: () => ({joy: 0, spark: 0}),
  update(s, dt) {s.joy += dt; s.spark = Math.max(0, s.spark - dt);},
  down(s, point) {
   dragging = plugs.find(plug => !plug.placed && Math.hypot(point.x - plug.x, point.y - plug.y) < 34) || null;
   if (dragging) offset = {x: dragging.x - point.x, y: dragging.y - point.y};
  },
  move(s, point) {if (dragging) {dragging.x = point.x + offset.x; dragging.y = point.y + offset.y;}},
  up(s, api) {
   if (!dragging) return;
   const plug = dragging;
   dragging = null;
   const socket = sockets.find(item => !item.taken && Math.hypot(plug.x - item.x, plug.y - item.y) < 40);
   if (socket && socket.color === plug.color) {
    socket.taken = true; plug.placed = true; plug.x = socket.x - 8; plug.y = socket.y;
    api.ok();
    if (plugs.every(item => item.placed)) api.finish('Wszystkie kable działają! Voyager 1 wystartował w 1977 roku i jest dziś najdalej od Ziemi ze wszystkich rzeczy zrobionych przez ludzi. Wiezie złotą płytę z pozdrowieniami w wielu językach, na wypadek gdyby ktoś go kiedyś znalazł!');
    else api.say(`${colors[plug.color].name} do ${colors[plug.color].name}! Pasuje!`);
   } else {
    if (socket) {s.spark = .5; api.miss(); api.say(`Bzzzt! Ten kabel jest ${colors[plug.color].name}. Szukaj ${colors[plug.color].name}ego gniazdka!`);}
    plug.x = plug.hx; plug.y = plug.hy;
   }
  },
  draw(c, s, t) {
   /* satelita */
   c.fillStyle = '#d7dde8'; c.beginPath(); c.ellipse(450, 52, 74, 36, 0, Math.PI, TAU); c.fill();
   c.strokeStyle = '#9aa6ba'; c.lineWidth = 3; c.stroke();
   c.fillStyle = '#7f8a9c'; c.beginPath(); c.roundRect(364, 52, 166, 252, 18); c.fill();
   c.strokeStyle = '#aab4c6'; c.lineWidth = 3; c.stroke();
   const allDone = plugs.every(plug => plug.placed);
   drawFace(c, 447, 46, 30, allDone ? 'laugh' : (s.spark > 0 ? 'ouch' : 'sad'), t);
   c.fillStyle = '#e0b43a'; c.beginPath(); c.arc(395, 290, 13, 0, TAU); c.fill();
   c.strokeStyle = '#8a6a1a'; c.lineWidth = 2; c.beginPath(); c.arc(395, 290, 7, 0, TAU); c.stroke();
   c.fillStyle = '#cfe0f5'; c.font = '700 11px system-ui, sans-serif'; c.textAlign = 'left'; c.fillText('złota płyta', 412, 294);
   sockets.forEach(socket => {
    c.fillStyle = '#12161e'; c.beginPath(); c.arc(socket.x, socket.y, 20, 0, TAU); c.fill();
    c.strokeStyle = colors[socket.color].hex; c.lineWidth = 5; c.stroke();
    if (socket.taken) {c.fillStyle = colors[socket.color].hex; c.globalAlpha = .55 + .4 * Math.sin(t * .008); c.beginPath(); c.arc(socket.x + 34, socket.y, 5, 0, TAU); c.fill(); c.globalAlpha = 1;}
   });
   /* zasilacz z lewej i kable */
   c.fillStyle = '#3a4252'; c.beginPath(); c.roundRect(4, 60, 34, 220, 10); c.fill();
   plugs.forEach((plug, index) => {
    const ax = 38, ay = rows[index];
    c.strokeStyle = colors[plug.color].hex; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(ax, ay); c.bezierCurveTo(ax + 90, ay + 30, plug.x - 90, plug.y - 30, plug.x - 14, plug.y); c.stroke();
    c.fillStyle = colors[plug.color].hex; c.beginPath(); c.roundRect(plug.x - 16, plug.y - 14, 32, 28, 7); c.fill();
    c.fillStyle = '#e8eaf0'; c.fillRect(plug.x + 14, plug.y - 8, 10, 4); c.fillRect(plug.x + 14, plug.y + 4, 10, 4);
    if (!plug.placed) {c.strokeStyle = `rgba(255,255,255,${.35 + .3 * Math.sin(t * .006 + index)})`; c.lineWidth = 2; c.beginPath(); c.roundRect(plug.x - 20, plug.y - 18, 40, 36, 9); c.stroke();}
   });
   if (s.spark > 0) {c.font = '26px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('⚡', 440, 190);}
   doneBadge(c, `Podłączone: ${plugs.filter(plug => plug.placed).length} z 3`, 90, 28);
  },
  debug: () => ({plugs: plugs.map(plug => ({color: plug.color, x: plug.x, y: plug.y, placed: plug.placed})), sockets: sockets.map(socket => ({color: socket.color, x: socket.x, y: socket.y}))})
 });
}

/* ---------- Voyager 2: skieruj antenę na Ziemię ---------- */

function createVoyager2Activity() {
 const width = 560, height = 340, cx = 280, cy = 178;
 const earth = {x: 96, y: 66};
 const target = Math.atan2(earth.y - cy, earth.x - cx);
 const diff = (a, b) => {let d = (a - b) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return Math.abs(d);};
 return createSimpleTask({
  title: '📡 Skieruj antenę Voyagera 2 na Ziemię',
  lead: 'Voyager 2 jest bardzo, bardzo daleko od domu. Żeby wysłać wiadomość, musi wycelować talerz anteny dokładnie w Ziemię, która stąd jest maleńką niebieską kropką. Obracaj antenę palcem, aż trafisz!',
  hint: 'Wskaż palcem maleńką niebieską kropkę, czyli Ziemię. Antena obróci się w tę stronę.',
  init: () => ({angle: .6, hold: 0, sent: 0, idle: 0}),
  update(s, dt, api) {
   s.idle += dt;
   if (s.sent) {s.sent += dt; if (s.sent > 2.4) api.finish('Wiadomość poleciała do domu! Voyager 2 jest tak daleko, że sygnał leci do Ziemi ponad osiemnaście godzin. Dlatego jego antena musi celować bardzo dokładnie. Voyager 2 wyleciał z naszego Układu Słonecznego w 2018 roku!'); return;}
   if (diff(s.angle, target) < .17) s.hold += dt; else s.hold = Math.max(0, s.hold - dt);
   if (s.hold > .7) {s.sent = .001; api.ok(); api.say('Cześć, Ziemio! Tu Voyager, wszystko dobrze!');}
  },
  down(s, point) {if (!s.sent) s.angle = Math.atan2(point.y - cy, point.x - cx);},
  move(s, point, api) {if (api.pressed && !s.sent) s.angle = Math.atan2(point.y - cy, point.x - cx);},
  draw(c, s, t) {
   const aimed = diff(s.angle, target) < .17;
   c.strokeStyle = aimed ? 'rgba(126,231,135,.8)' : 'rgba(255,229,138,.35)'; c.lineWidth = 2; c.setLineDash([6, 8]);
   c.beginPath(); c.moveTo(cx + Math.cos(s.angle) * 60, cy + Math.sin(s.angle) * 60); c.lineTo(cx + Math.cos(s.angle) * 520, cy + Math.sin(s.angle) * 520); c.stroke(); c.setLineDash([]);
   const glow = c.createRadialGradient(earth.x, earth.y, 1, earth.x, earth.y, 22 + (s.idle > 12 ? 6 * Math.sin(t * .006) : 0));
   glow.addColorStop(0, 'rgba(110,180,255,.9)'); glow.addColorStop(1, 'rgba(110,180,255,0)');
   c.fillStyle = glow; c.beginPath(); c.arc(earth.x, earth.y, 24, 0, TAU); c.fill();
   c.fillStyle = '#6fb4ff'; c.beginPath(); c.arc(earth.x, earth.y, 4, 0, TAU); c.fill();
   if (s.idle > 12 || s.sent) {c.fillStyle = '#cfe0f5'; c.font = '700 13px system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('Ziemia', earth.x, earth.y + 24);}
   /* sygnał */
   if (s.sent) for (let k = 0; k < 4; k++) {
    const u = ((s.sent * .8) + k / 4) % 1;
    const dist = 60 + u * (Math.hypot(earth.x - cx, earth.y - cy) - 60);
    c.strokeStyle = `rgba(126,231,135,${1 - u})`; c.lineWidth = 3;
    c.beginPath(); c.arc(cx, cy, dist, s.angle - .3, s.angle + .3); c.stroke();
   }
   /* satelita */
   c.save();
   c.translate(cx, cy); c.rotate(s.angle);
   c.strokeStyle = '#8a93a6'; c.lineWidth = 4; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-90, 0); c.stroke();
   c.fillStyle = '#e8eef8'; c.strokeStyle = '#8a93a6'; c.lineWidth = 3;
   c.beginPath(); c.moveTo(34, -46); c.quadraticCurveTo(-6, 0, 34, 46); c.quadraticCurveTo(12, 0, 34, -46); c.fill(); c.stroke();
   c.beginPath(); c.ellipse(34, 0, 9, 46, 0, 0, TAU); c.fillStyle = '#cfd8e8'; c.fill(); c.stroke();
   c.strokeStyle = '#8a93a6'; c.lineWidth = 3; c.beginPath(); c.moveTo(8, 0); c.lineTo(50, 0); c.stroke();
   c.fillStyle = '#ffd53a'; c.beginPath(); c.arc(52, 0, 4, 0, TAU); c.fill();
   c.restore();
   c.fillStyle = '#7f8a9c'; c.beginPath(); c.arc(cx, cy, 24, 0, TAU); c.fill();
   c.strokeStyle = '#aab4c6'; c.lineWidth = 3; c.stroke();
   drawFace(c, cx, cy + 2, 20, s.sent ? 'laugh' : (aimed ? 'wow' : 'smile'), t, {x: Math.cos(s.angle), y: Math.sin(s.angle)});
  },
  debug: s => ({angle: s.angle, target, earth, cx, cy, sent: s.sent})
 });
}
