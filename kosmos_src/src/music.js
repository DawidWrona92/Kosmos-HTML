/* ---------- muzyka w tle (Web Audio, syntezowana — bez plików) ----------
 * Wesoły, majorowy pad (C - F - G - C) ze skoczną melodią-gwiazdką
 * w tonacji C-dur. Startuje dopiero po pierwszym kliknięciu.
 */

const MUSIC_CHORDS = [
 [[261.63, 'C3'], [329.63, 'E3'], [392, 'G3'], [523.25, 'C4']],
 [[174.61, 'F2'], [220, 'A2'], [349.23, 'F3'], [523.25, 'C4']],
 [[196, 'G2'], [246.94, 'B2'], [392, 'G3'], [587.33, 'D4']],
 [[261.63, 'C3'], [329.63, 'E3'], [392, 'G3'], [659.25, 'E4']]
];
const MUSIC_TWINKLE = [1046.5, 1174.66, 1318.51, 1396.91, 1567.98, 1760, 2093];
const MUSIC_CHORD_SECONDS = 6.5;

const music = {
 on: loadStored('kosmos3.music', '1') === '1',
 playing: false,
 master: null,
 timer: null,
 nextChordTime: 0,
 chordIndex: 0
};

function musicTick() {
 const context = fxContext();
 if (!context || !music.playing) return;
 const now = context.currentTime;
 if (music.nextChordTime < now + 1.5) {
  const chord = MUSIC_CHORDS[music.chordIndex % MUSIC_CHORDS.length];
  music.chordIndex++;
  chord.forEach(([freq], voice) => {
   const oscillator = context.createOscillator();
   const gain = context.createGain();
   oscillator.type = voice === 3 ? 'triangle' : 'sine';
   oscillator.frequency.value = freq;
   const peak = (voice === 3 ? .075 : .16) / (1 + voice * .15);
   gain.gain.setValueAtTime(.0001, music.nextChordTime);
   gain.gain.exponentialRampToValueAtTime(peak, music.nextChordTime + 1.4);
   gain.gain.setValueAtTime(peak, music.nextChordTime + MUSIC_CHORD_SECONDS - 1.8);
   gain.gain.exponentialRampToValueAtTime(.0001, music.nextChordTime + MUSIC_CHORD_SECONDS);
   oscillator.connect(gain);
   gain.connect(music.master);
   oscillator.start(music.nextChordTime);
   oscillator.stop(music.nextChordTime + MUSIC_CHORD_SECONDS + .1);
  });
  music.nextChordTime += MUSIC_CHORD_SECONDS;
 }
 /* weso\u0142a melodia: kr\u00f3tka, skoczna nutka (dzwoneczek) w tonacji, cz\u0119\u015bciej */
 if (Math.random() < .55) {
  const freq = MUSIC_TWINKLE[Math.floor(Math.random() * MUSIC_TWINKLE.length)];
  const start = now + Math.random() * 1.2;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.11, start + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, start + .9);
  oscillator.connect(gain);
  gain.connect(music.master);
  oscillator.start(start);
  oscillator.stop(start + 1.1);
  /* czasem druga nutka zaraz po pierwszej \u2014 skoczny motivek */
  if (Math.random() < .5) {
   const secondFreq = MUSIC_TWINKLE[Math.floor(Math.random() * MUSIC_TWINKLE.length)];
   const osc2 = context.createOscillator();
   const gain2 = context.createGain();
   osc2.type = 'triangle';
   osc2.frequency.value = secondFreq;
   gain2.gain.setValueAtTime(.0001, start + .28);
   gain2.gain.exponentialRampToValueAtTime(.09, start + .3);
   gain2.gain.exponentialRampToValueAtTime(.0001, start + 1.1);
   osc2.connect(gain2);
   gain2.connect(music.master);
   osc2.start(start + .28);
   osc2.stop(start + 1.3);
  }
 }
}

function musicStart() {
 if (!music.on || music.playing) return;
 const context = fxContext();
 if (!context) return;
 if (context.state === 'suspended') context.resume().catch(() => {});
 music.master = context.createGain();
 music.master.gain.value = 0;
  music.master.gain.exponentialRampToValueAtTime(.11, context.currentTime + 1.2);
 music.master.connect(context.destination);
 music.nextChordTime = context.currentTime + .3;
 music.chordIndex = 0;
 music.playing = true;
 music.timer = setInterval(musicTick, 300);
}

function musicStop() {
 if (!music.playing) return;
 music.playing = false;
 clearInterval(music.timer);
 music.timer = null;
 const context = fxContext();
 if (music.master && context) {
  const master = music.master;
  music.master = null;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setValueAtTime(master.gain.value, context.currentTime);
  master.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .6);
  setTimeout(() => master.disconnect(), 800);
 } else music.master = null;
}

function musicSetOn(value) {
 music.on = value;
 saveStored('kosmos3.music', value ? '1' : '0');
 if (value) musicStart();
 else musicStop();
}
