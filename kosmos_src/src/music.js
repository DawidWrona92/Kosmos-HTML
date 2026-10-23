/* ---------- muzyka w tle (Web Audio, syntezowana — bez plików) ----------
 * Delikatny pad akordowy (C - Am - F - G) plus pojedyncze, ciche
 * "gwiazdki". Startuje dopiero po pierwszym kliknięciu (gest użytkownika).
 */

const MUSIC_CHORDS = [
 [[261.63, 'C3'], [329.63, 'E3'], [392, 'G3'], [523.25, 'C4']],
 [[220, 'A2'], [329.63, 'E3'], [440, 'A3'], [523.25, 'C4']],
 [[174.61, 'F2'], [261.63, 'C3'], [349.23, 'F3'], [440, 'A3']],
 [[196, 'G2'], [293.66, 'D3'], [392, 'G3'], [493.88, 'B3']]
];
const MUSIC_TWINKLE = [1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];
const MUSIC_CHORD_SECONDS = 7.5;

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
   const peak = (voice === 3 ? .05 : .11) / (1 + voice * .15);
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
 if (Math.random() < .3) {
  const freq = MUSIC_TWINKLE[Math.floor(Math.random() * MUSIC_TWINKLE.length)];
  const start = now + Math.random() * 1.2;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = freq;
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(.045, start + .05);
  gain.gain.exponentialRampToValueAtTime(.0001, start + 1.6);
  oscillator.connect(gain);
  gain.connect(music.master);
  oscillator.start(start);
  oscillator.stop(start + 1.8);
 }
}

function musicStart() {
 if (!music.on || music.playing) return;
 const context = fxContext();
 if (!context) return;
 if (context.state === 'suspended') context.resume().catch(() => {});
 music.master = context.createGain();
 music.master.gain.value = 0;
  music.master.gain.exponentialRampToValueAtTime(.05, context.currentTime + 1.2);
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
