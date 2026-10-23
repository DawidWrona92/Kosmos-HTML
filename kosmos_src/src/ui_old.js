/* ---------- interfejs ---------- */

function renderFact() {
 const item = currentItem();
 const factElement = byId('fact');
 factElement.textContent = item.facts[factIndex];
 factElement.classList.remove('pop');
 void factElement.offsetWidth;
 factElement.classList.add('pop');
 byId('dots').innerHTML = item.facts.map((fact, index) => `<i class="${index === factIndex ? 'on' : ''}"></i>`).join('');
}

function renderInfo() {
 const item = currentItem();
 const body = bodies[view.selected];
 byId('planetName').textContent = item.name;
 byId('planetType').textContent = item.type;
 const icon = byId('planetIcon');
 if (view.find) {
  icon.textContent = view.find.icon;
  icon.style.background = 'radial-gradient(circle at 30% 28%,#6f9bff,#2c4fa3 55%,#0a1736)';
 } else {
  icon.textContent = '';
  icon.style.background = `radial-gradient(circle at 30% 28%,${lighten(body.color, 1.5)},${body.color} 48%,#060b18)`;
 }
 const chips = item.chips.map(chip => `<span class="chip">${chip}</span>`);
 if (!view.find && finds.some(find => find.parentId === body.id && !discovered.has(find.id))) chips.push('<span class="chip hint">🛰 Znajdź sondę! Przybliż</span>');
 byId('chips').innerHTML = chips.join('');
 byId('activityBtn').hidden = !!view.find || !body.activity;
 byId('focusBtn').classList.toggle('active', view.following);
 renderFact();
}

function renderNotebook() {
 byId('notebook').textContent = `📓 Odkryto ${discovered.size} z ${TOTAL_ITEMS}`;
}

function renderControls() {
 document.querySelectorAll('[data-speed]').forEach(button => button.classList.toggle('active', playing && +button.dataset.speed === speed));
 const playButton = byId('play');
 playButton.classList.toggle('active', !playing);
 playButton.querySelector('.ico').textContent = playing ? '⏸' : '▶️';
 playButton.querySelector('.lbl').textContent = playing ? 'Stop' : 'Start';
 const soundButton = byId('sound');
 soundButton.querySelector('.ico').textContent = soundOn ? '🔊' : '🔇';
 soundButton.querySelector('.lbl').textContent = soundOn ? 'Głos' : 'Cisza';
 soundButton.classList.toggle('active', !soundOn);
}

function applySpeed(value) {
 speed = value;
 playing = true;
 renderControls();
}

function togglePlay() {
 playing = !playing;
 renderControls();
}

function toggleSound() {
 soundOn = !soundOn;
 saveStored('kosmos2.sound', soundOn ? '1' : '0');
 if (!soundOn && speechSupported) window.speechSynthesis.cancel();
 renderControls();
 if (soundOn) speakItem(true);
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
 const wrapped = ((index % bodies.length) + bodies.length) % bodies.length;
 view.find = null;
 setSelection(view.following, wrapped);
 if (view.following) view.zoomGoal = followZoom(wrapped);
 factIndex = 0;
 markDiscovered(bodies[wrapped].id);
 renderInfo();
 addRipple(wrapped === 0 ? view.sunTarget : view.targets.find(target => target.index === wrapped));
 speakItem(false);
}

function chooseFind(target) {
 view.find = target.find;
 factIndex = 0;
 markDiscovered(target.find.id);
 renderInfo();
 addRipple(target);
 speakItem(false);
}

function nextFact() {
 factIndex = (factIndex + 1) % currentItem().facts.length;
 renderFact();
 speakItem(false);
}

function focusSelected() {
 view.find = null;
 setSelection(true, view.selected);
 view.zoomGoal = followZoom(view.selected);
 renderInfo();
}

function resetView() {
 setSelection(false, view.selected);
 view.zoomGoal = 1;
 view.angle = Math.atan2(Math.sin(view.angle), Math.cos(view.angle));
 view.angleGoal = 0;
 view.tiltGoal = defaultTilt();
 renderInfo();
}

function pickAt(clientX, clientY, pointerType) {
 const padding = pointerType === 'mouse' ? 10 : 22;
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
 if (bestIndex === null && view.sunTarget && Math.hypot(view.sunTarget.x - clientX, view.sunTarget.y - clientY) <= view.sunTarget.radius + 8) bestIndex = 0;
 if (bestIndex !== null) choose(bestIndex);
}

