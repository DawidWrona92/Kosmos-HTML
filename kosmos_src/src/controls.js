/* ---------- sterowanie ---------- */

byId('speedRange').addEventListener('input', event => applySpeed(+event.target.value));
byId('play').addEventListener('click', togglePlay);
byId('zoomOutBtn').addEventListener('click', () => {if (zoomOutLevel()) fxPlay('whoosh');});
byId('zoomInBtn').addEventListener('click', () => {if (zoomInLevel()) fxPlay('whoosh');});
byId('readAgain').addEventListener('click', () => {
 if (reading) {
  stopSpeech();
  setReading(false);
  highlightSentence(-1);
 } else if (hasChosen) readFrom(0, true);
});
document.querySelectorAll('[data-home]').forEach(button => button.addEventListener('click', resetView));
let activitySlot = 0;
byId('activityBtn').addEventListener('click', () => {
 const item = currentItem();
 if (!item.activity && !item.activity2) return;
 activitySlot = item.activity && !doneTasks.has(item.id) ? 0 : item.activity2 ? 1 : 0;
 openActivity(item, activitySlot);
});
byId('fact').addEventListener('click', () => {
 if (!hasChosen) return;
 readFrom((factIndex + 1) % currentItem().facts.length, false);
});
byId('dots').addEventListener('click', event => {
 const dot = event.target.closest('[data-fact]');
 if (dot) readFrom(+dot.dataset.fact, false);
});
byId('startButton').addEventListener('click', () => {
 byId('start').hidden = true;
 musicStart();
 sayNow('Cześć! Dotknij którąś planetę, a opowiem Ci o niej coś ciekawego.');
});

window.addEventListener('keydown', event => {
 const target = event.target;
 if (!byId('lists').hidden) {
  if (event.key === 'Escape') closeLists();
  return;
 }
 if (!byId('settings').hidden) {
  if (event.key === 'Escape') closeSettings();
  return;
 }
 if (!activityOverlay.hidden) {
  if (event.key === 'Escape') closeActivity();
  return;
 }
 if (event.key === 'Escape') resetView();
 else if (event.key === ' ' && !(target && target.closest && target.closest('button'))) {
  event.preventDefault();
  togglePlay();
 }
});

window.addEventListener('resize', resize);
if ('ResizeObserver' in window) {
 const observer = new ResizeObserver(layout);
 observer.observe(infoPanel);
 observer.observe(dock);
}
if (!speech.supported) byId('readAgain').hidden = true;

/* ---------- pętla ---------- */

function frameLoop(now) {
 const dt = clamp((now - lastFrameTime) / 1000, 0, .1);
 lastFrameTime = now;
 frameTime = now;
 if (playing && speed > 0) {
  simDays += dt * speed * DAYS_PER_SPEED_UNIT;
  moonDays += Math.min(dt * speed * DAYS_PER_SPEED_UNIT, dt * 4);
 }
 updateCamera(dt);
 if (view.following && view.selected !== null && Math.abs(view.zoom / view.zoomGoal - 1) < .35) {
  const spinBody = bodies[view.selected];
  if (spinBody.texture && !spinBody.photo && !(gesture && gesture.moved)) globeState.rotation[spinBody.id] = rotationOf(spinBody) + dt * .06;
 }
 for (let index = ripples.length - 1; index >= 0; index--) {
  ripples[index].life += dt;
  if (ripples[index].life >= ripples[index].max) ripples.splice(index, 1);
 }
 draw();
 if (activeActivity && activeActivity.frame) activeActivity.frame(dt, now);
 requestAnimationFrame(frameLoop);
}

resize();
view.tilt = defaultTilt();
/* start: kamera przypięta do Słońca */
setSelection(true, 0);
view.zoom = view.zoomGoal = clamp(focusRadius(bodies[0]) / (bodies[0].radius * fitScale()), 1, MAX_ZOOM);
renderInfo();
renderNotebook();
renderControls();
setReading(false);
requestAnimationFrame(frameLoop);
})();
</script>
</body>
</html>
