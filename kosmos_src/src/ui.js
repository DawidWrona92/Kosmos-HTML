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
  byId('planetType').textContent = 'Wybierz, o czym chcesz posłuchać';
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
 if (view.ring) {
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
 if (position) ripples.push({x: position.x, y: position.y, radius: position.radius, life: 0, max: .8});
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
 addRipple(target);
 renderInfo();
 readFrom(0, true);
}

function chooseMoon(target) {
 hasChosen = true;
 view.find = null;
 view.moon = target.moon;
 fxPlay('whoosh');
 factIndex = 0;
 markDiscovered(target.moon.id);
 addRipple(target);
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
 addRipple({x: target.x, y: target.y, radius: target.outer});
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
 setSelection(false, view.selected);
 view.zoomGoal = 1;
 view.angle = Math.atan2(Math.sin(view.angle), Math.cos(view.angle));
 view.angleGoal = 0;
 view.tiltGoal = defaultTilt();
 renderInfo();
}

function pickAt(clientX, clientY, pointerType) {
 const padding = pointerType === 'mouse' ? 10 : 22;
 if (view.following && !view.find && !view.moon && !view.ring) {
  for (const target of view.moonTargets) {
   if (Math.hypot(target.x - clientX, target.y - clientY) <= target.radius + padding * .5) {
    chooseMoon(target);
    return;
   }
  }
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
 if (view.following && bestIndex === view.selected && !view.find && hasChosen) return;
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
 renderNotebook();
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
 const all = [...bodies, ...finds, ...allMoons];
 const itemHtml = (item, done) => {
  const emoji = item.kind === undefined && item.parentId && item.size ? '🌙' : item.parentId ? '🛰️' : bodyEmoji(item);
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
