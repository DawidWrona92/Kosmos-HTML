/* ---------- interfejs ---------- */

let factIndex = 0;
let hasChosen = false;
let reading = false;

function escapeHtml(text) {
 return text.replace(/[&<>"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[char]));
}

function renderFact(highlightIndex) {
 const factElement = byId('fact');
 if (!hasChosen) {
  factElement.innerHTML = '<span class="s big">Dotknij planetę, Słońce albo kometę.</span>';
  byId('dots').innerHTML = '';
  return;
 }
 const item = currentItem();
 const sentences = sentencesOf(item.facts[factIndex]);
 factElement.innerHTML = sentences.map((sentence, index) => `<span class="s${index === highlightIndex ? ' now' : ''}">${escapeHtml(sentence)}</span>`).join(' ');
 byId('dots').innerHTML = item.facts.map((fact, index) => `<button class="dot${index === factIndex ? ' on' : ''}" data-fact="${index}" aria-label="Ciekawostka ${index + 1}"></button>`).join('');
}

function highlightSentence(index) {
 const parts = byId('fact').querySelectorAll('.s');
 parts.forEach((part, position) => part.classList.toggle('now', position === index));
}

function showFact(index, animate) {
 factIndex = index;
 renderFact(-1);
 if (animate !== false) {
  const factElement = byId('fact');
  factElement.classList.remove('pop');
  void factElement.offsetWidth;
  factElement.classList.add('pop');
 }
}

function setReading(value) {
 reading = value;
 const button = byId('readAgain');
 button.querySelector('.ico').textContent = value ? '⏹' : '🔊';
 button.querySelector('.lbl').textContent = value ? 'Cisza' : 'Jeszcze raz';
}

function readFrom(startIndex, withIntro) {
 const item = currentItem();
 const segments = [];
 if (withIntro) segments.push({text: item.intro || `${item.name}. ${item.type}.`, pause: 400, onStart: () => showFact(startIndex, true)});
 for (let index = startIndex; index < item.facts.length; index++) {
  segments.push({text: item.facts[index], onStart: () => showFact(index, true), onPart: highlightSentence});
 }
 setReading(true);
 speakSegments(segments, () => {
  setReading(false);
  highlightSentence(-1);
 });
}

function renderInfo() {
 infoPanel.classList.toggle('idle', !hasChosen);
 const icon = byId('planetIcon');
 if (!hasChosen) {
  byId('planetName').textContent = 'Mój Kosmos';
  byId('planetType').textContent = view.level < 0 ? 'Dotknij galaktykę, gwiazdę albo sondę' : 'Wybierz, o czym chcesz posłuchać';
  icon.textContent = '🚀';
  icon.style.background = 'radial-gradient(circle at 30% 28%,#6f9bff,#2c4fa3 55%,#0a1736)';
  icon.style.backgroundImage = '';
  byId('activityBtn').hidden = true;
  renderFact(-1);
  return;
 }
 const item = currentItem();
 const body = bodies[view.selected];
 byId('planetName').textContent = item.name;
 byId('planetType').textContent = item.type;
 icon.style.backgroundImage = '';
 if (view.galaxy) {
  icon.textContent = item.emoji || '✨';
  icon.style.background = 'radial-gradient(circle at 30% 28%,#8fa8e8,#3a4f8f 55%,#0a1736)';
 } else if (view.ring) {
  icon.textContent = '🪐';
  icon.style.background = 'radial-gradient(circle at 30% 28%,#e8d9b0,#b99a5f 55%,#5a4326)';
 } else if (view.moon) {
  icon.textContent = '🌙';
  icon.style.background = `radial-gradient(circle at 30% 28%,${lighten(view.moon.color, 1.4)},${view.moon.color} 48%,#060b18)`;
 } else if (view.find) {
  icon.textContent = '';
  icon.style.background = 'radial-gradient(circle at 30% 28%,#6f9bff,#2c4fa3 55%,#0a1736)';
  const sprite = item.sprite && imageOf(item.sprite);
  if (sprite) {
   icon.style.background = `#0b1c3a url(${ASSET_DATA[item.sprite]}) center/78% no-repeat`;
  } else icon.textContent = '🛰';
 } else {
  icon.textContent = body.kind === 'star' ? '☀️' : body.kind === 'moon' ? '🌙' : '';
  const photo = body.photo && ASSET_DATA[body.texture];
  icon.style.background = photo ? `url(${photo}) center/cover` : `radial-gradient(circle at 30% 28%,${lighten(body.color, 1.5)},${body.color} 48%,#060b18)`;
 }
 byId('activityBtn').hidden = !(item.activity || item.activity2);
 renderFact(-1);
}

function renderNotebook() {
 byId('notebook').textContent = `📓 Odkryto ${discovered.size} z ${TOTAL_ITEMS}`;
}

function renderControls() {
 const range = byId('speedRange');
 if (+range.value !== speed) range.value = speed;
 const playButton = byId('play');
 playButton.classList.toggle('active', !playing);
 playButton.querySelector('.ico').textContent = playing ? '⏸' : '▶️';
 playButton.querySelector('.lbl').textContent = playing ? 'Stop' : 'Start';
 const outBtn = byId('zoomOutBtn');
 const inBtn = byId('zoomInBtn');
 outBtn.hidden = view.following || view.level <= -2;
 inBtn.hidden = view.level >= 0;
}

function applySpeed(value) {
 speed = clamp(Math.round(value), MIN_SPEED, MAX_SPEED);
 saveStored('kosmos3.speed', String(speed));
 playing = true;
 renderControls();
}

function togglePlay() {
 playing = !playing;
 renderControls();
}

function markDiscovered(id) {
 if (discovered.has(id)) return;
 discovered.add(id);
 saveStored('kosmos2.discovered', JSON.stringify([...discovered]));
 renderNotebook();
}

function addRipple(position) {
 if (!position) return;
 const moon = position.moon;
 const find = position.find;
 const object = position.object;
 ripples.push({
  x: position.x, y: position.y, radius: position.radius, life: 0, max: .8,
  track: moon ? {kind: 'moon', id: moon.id} : find ? {kind: 'find', id: find.id} : object ? {kind: 'galaxy', id: object.id} : null
 });
}

function choose(index) {
 hasChosen = true;
 view.find = null;
 view.moon = null;
 view.ring = null;
 fxPlay('whoosh');
 setSelection(true, index);
 view.zoomGoal = followZoom(index);
 factIndex = 0;
 globeState.velocity = 0;
 markDiscovered(bodies[index].id);
 renderInfo();
 readFrom(0, true);
}

function chooseFind(target) {
 hasChosen = true;
 view.find = target.find;
 view.moon = null;
 view.ring = null;
 fxPlay('whoosh');
 factIndex = 0;
 markDiscovered(target.find.id);
 view.carryX = 0;
 view.carryY = 0;
 view.zoomGoal = clamp(followZoom(view.selected) * 1.4, MIN_ZOOM, MAX_ZOOM);
 renderInfo();
 readFrom(0, true);
}

function moonZoom(moon) {
 const parent = bodies[view.selected];
 const fit = fitScale();
 const moonUnit = Math.max(parent.radius * fit * 1.25 * moon.size * .6, .01);
 const orbitUnit = Math.max(parent.radius * fit * 1.25 * moon.moonOrbit, 1);
 const half = Math.min(view.free.right - view.free.left, view.free.bottom - view.free.top) / 2;
 /* planeta musi po przybliżeniu wciąż mieć radius >= 52 px, żeby księżyce i sondy były widoczne */
 const maxZoom = 52 / Math.max(parent.radius * fit * 1.25, .01);
 return clamp(Math.min(22 / moonUnit, (half - 60) / orbitUnit, maxZoom), MIN_ZOOM, MAX_ZOOM);
}

function chooseMoon(target) {
 hasChosen = true;
 view.find = null;
 view.ring = null;
 view.moon = target.moon;
 fxPlay('whoosh');
 factIndex = 0;
 markDiscovered(target.moon.id);
 view.carryX = 0;
 view.carryY = 0;
 view.zoomGoal = moonZoom(target.moon);
 renderInfo();
 readFrom(0, true);
}

function chooseRing(target) {
 hasChosen = true;
 view.find = null;
 view.moon = null;
 view.ring = target.ring;
 fxPlay('whoosh');
 factIndex = 0;
 markDiscovered(target.ring.id);
 view.carryX = 0;
 view.carryY = 0;
 view.zoomGoal = clamp(followZoom(view.selected) * .8, MIN_ZOOM, MAX_ZOOM);
 renderInfo();
 readFrom(0, true);
}

function resetView() {
 stopSpeech();
 setReading(false);
 hasChosen = false;
 view.find = null;
 view.moon = null;
 view.ring = null;
 view.galaxy = null;
 view.level = 0;
 /* kamera przypięta do Słońca — pierwszego obiektu */
 setSelection(true, 0);
 view.carryX = 0;
 view.carryY = 0;
 view.zoomGoal = clamp(focusRadius(bodies[0]) / (bodies[0].radius * fitScale()), 1, MAX_ZOOM);
 view.angle = Math.atan2(Math.sin(view.angle), Math.cos(view.angle));
 view.angleGoal = 0;
 view.tiltGoal = defaultTilt();
 renderInfo();
}

function zoomOutLevel() {
 if (view.level > -2) {
  view.level--;
  view.galaxy = null;
  hasChosen = false;
  view.moon = null;
  view.find = null;
  view.ring = null;
  if (view.level === 0) setSelection(false, view.selected);
  view.zoom = 1;
  view.zoomGoal = 1;
  view.carryX = 0;
  view.carryY = 0;
  renderInfo();
  renderControls();
  return true;
 }
 return false;
}

function zoomInLevel() {
 if (view.level < 0) {
  view.level++;
  view.galaxy = null;
  hasChosen = false;
  view.zoom = 1;
  view.zoomGoal = 1;
  view.carryX = 0;
  view.carryY = 0;
  renderInfo();
  renderControls();
  return true;
 }
 return false;
}

function chooseGalaxy(target) {
 hasChosen = true;
 view.find = null;
 view.moon = null;
 view.ring = null;
 view.galaxy = target.object;
 fxPlay('whoosh');
 factIndex = 0;
 markDiscovered(target.object.id);
 addRipple(target);
 renderInfo();
 readFrom(0, true);
}

function pickAt(clientX, clientY, pointerType) {
 const padding = pointerType === 'mouse' ? 10 : 22;
 if (view.level < 0) {
  let best = null;
  let bestRank = Infinity;
  for (const target of view.galaxyTargets) {
   const distance = Math.hypot(target.x - clientX, target.y - clientY);
   if (distance > target.radius + padding) continue;
   const rank = distance - target.radius;
   if (rank < bestRank) {bestRank = rank; best = target;}
  }
  if (best) chooseGalaxy(best);
  return;
 }
 if (view.following) {
  for (const target of view.moonTargets) {
   if (Math.hypot(target.x - clientX, target.y - clientY) <= target.radius + padding * .5) {
    if (view.moon === target.moon) {
     view.moon = null;
     factIndex = 0;
     view.zoomGoal = followZoom(view.selected);
     renderInfo();
     readFrom(0, false);
    } else chooseMoon(target);
    return;
   }
  }
  if (!view.moon) {
   const ring = view.ringTarget;
   if (ring && !ring.pressed) {
    ctx.save();
    ctx.translate(ring.x, ring.y);
    ctx.rotate(ring.angle);
    const dx = (clientX - ring.x) * Math.cos(-ring.angle) - (clientY - ring.y) * Math.sin(-ring.angle);
    const dy = (clientX - ring.x) * Math.sin(-ring.angle) + (clientY - ring.y) * Math.cos(-ring.angle);
    const radial = Math.hypot(dx, dy / ring.ratio);
    ctx.restore();
    const near = radial <= ring.outer + padding * .7 && radial >= ring.inner - padding * .7;
    const around = Math.abs(dy) <= ring.outer * ring.ratio + padding * .7;
    if (near && around) {
     chooseRing(ring);
     return;
    }
   }
  }
 }
 for (const target of view.findTargets) {
  if (Math.hypot(target.x - clientX, target.y - clientY) <= target.radius + padding * .5) {
   chooseFind(target);
   return;
  }
 }
 let bestIndex = null;
 let bestRank = Infinity;
 for (const target of view.targets) {
  const distance = Math.hypot(target.x - clientX, target.y - clientY);
  if (distance > Math.max(16, target.radius + padding)) continue;
  const rank = distance - target.radius;
  if (rank < bestRank) {bestRank = rank; bestIndex = target.index;}
 }
 if (view.sunTarget && Math.hypot(view.sunTarget.x - clientX, view.sunTarget.y - clientY) <= view.sunTarget.radius + 8) {
  if (bestIndex === null || view.sunTarget.radius > 30) bestIndex = 0;
 }
 if (bestIndex === null) return;
 if (view.following && bestIndex === view.selected && hasChosen) {
  if (view.find || view.moon || view.ring) {
   view.find = null;
   view.moon = null;
   view.ring = null;
   factIndex = 0;
   view.zoomGoal = followZoom(view.selected);
   renderInfo();
   readFrom(0, false);
  }
  return;
 }
 choose(bestIndex);
}

/* ---------- ustawienia dla rodzica ---------- */

function renderSettings() {
 const select = byId('voiceSelect');
 if (!select) return;
 const candidates = polishVoices();
 const active = currentVoice();
 byId('voiceInfo').textContent = !speech.supported
  ? 'Ta przeglądarka nie obsługuje czytania na głos.'
  : candidates.length ? '' : 'Na tym urządzeniu nie znaleziono polskiego głosu. Doinstaluj polski głos w ustawieniach systemu (zwykle: Ustawienia, Dostępność, Zamiana tekstu na mowę).';
 select.innerHTML = candidates.map(voice => `<option value="${escapeHtml(voice.name)}"${active && voice.name === active.name ? ' selected' : ''}>${escapeHtml(voice.name)}</option>`).join('');
 select.disabled = !candidates.length;
 byId('soundToggle').checked = speech.on;
 byId('fxToggle').checked = fx.on;
 byId('musicToggle').checked = music.on;
 byId('rateRange').value = speech.rate;
 byId('pitchRange').value = speech.pitch;
}

function openSettings() {
 renderSettings();
 byId('settings').hidden = false;
}

function closeSettings() {
 byId('settings').hidden = true;
 stopSpeech();
 setReading(false);
}

byId('gear').addEventListener('click', openSettings);
byId('settingsClose').addEventListener('click', closeSettings);
byId('voiceSelect').addEventListener('change', event => {
 speech.voiceName = event.target.value;
 saveStored('kosmos3.voice', speech.voiceName);
});
byId('rateRange').addEventListener('input', event => {
 speech.rate = parseFloat(event.target.value);
 saveStored('kosmos3.rate', String(speech.rate));
});
byId('pitchRange').addEventListener('input', event => {
 speech.pitch = parseFloat(event.target.value);
 saveStored('kosmos3.pitch', String(speech.pitch));
});
byId('soundToggle').addEventListener('change', event => setVoiceOn(event.target.checked));
byId('fxToggle').addEventListener('change', event => fxSetOn(event.target.checked));
byId('musicToggle').addEventListener('change', event => musicSetOn(event.target.checked));
byId('voiceTest').addEventListener('click', () => {
 const wasOn = speech.on;
 speech.on = true;
 sayNow('Cześć! Tak brzmi mój głos. Dotknij planetę, a opowiem Ci o niej coś ciekawego.', () => {speech.on = wasOn;});
});
byId('resetNotebook').addEventListener('click', () => {
 discovered.clear();
 saveStored('kosmos2.discovered', '[]');
 doneTasks.clear();
 saveStored('kosmos3.tasks', '[]');
 renderNotebook();
 renderTaskbook();
 if (activeItem && !activityOverlay.hidden) {
  byId('actDone').hidden = !doneTasks.has(taskKey(activeItem, activeSlot));
  byId('actSay').classList.toggle('done', doneTasks.has(taskKey(activeItem, activeSlot)));
 }
});

/* ---------- listy postępów (po kliknięciu w dzienniczek / zadania) ---------- */

function bodyEmoji(body) {
 switch (body.id) {
  case 'sun': return '☀️';
  case 'mercury': return '⚪';
  case 'venus': return '🟡';
  case 'earth': return '🌍';
  case 'moon': return '🌙';
  case 'mars': return '🔴';
  case 'ceres': return '🪨';
  case 'jupiter': return '🟤';
  case 'saturn': return '🪐';
  case 'uranus': return '🔵';
  case 'neptune': return '💙';
  case 'pluto': return '💗';
  case 'halley': return '☄️';
  default: return '🪐';
 }
}

function renderLists() {
 const all = [...bodies, ...finds, ...allMoons, ...allGalaxy];
 const itemHtml = (item, done) => {
  const emoji = item.emoji || (item.kind === undefined && item.parentId && item.size ? '🌙' : item.parentId ? '🛰️' : bodyEmoji(item));
  const label = done ? `${emoji} ${escapeHtml(item.name)}` : '❓ ???';
  return `<div class="listitem${done ? ' done' : ' locked'}"><span class="listico">${emoji}</span><span class="listlabel">${label}</span><span class="listcheck">✓</span></div>`;
 };
 const tasksDone = item => (!item.activity || doneTasks.has(item.id)) && (!item.activity2 || doneTasks.has(`${item.id}#2`));
 const withTasks = all.filter(item => item.activity || item.activity2);
 byId('discoverList').innerHTML = all.map(item => itemHtml(item, discovered.has(item.id))).join('');
 byId('taskList').innerHTML = withTasks.map(item => itemHtml(item, tasksDone(item))).join('');
}

function openLists() {
 renderLists();
 byId('lists').hidden = false;
}

function closeLists() {
 byId('lists').hidden = true;
}

byId('notebook').addEventListener('click', openLists);
byId('taskbook').addEventListener('click', openLists);
byId('listsClose').addEventListener('click', closeLists);
