/* ---------- efekty dźwiękowe (Web Audio, syntezowane — bez plików) ---------- */

const fx = {
 on: loadStored('kosmos3.fx', '1') === '1',
 ctx: null
};

function fxContext() {
 if (fx.ctx) return fx.ctx;
 try {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  fx.ctx = new AudioContextClass();
 } catch (error) {
  fx.ctx = null;
 }
 return fx.ctx;
}

function fxPlay(kind) {
 if (!fx.on) return;
 const context = fxContext();
 if (!context) return;
 if (context.state === 'suspended') context.resume().catch(() => {});
 const now = context.currentTime;
 const master = context.createGain();
 master.gain.value = .16;
 master.connect(context.destination);
 const tone = (type, freq, start, duration, peak, slideTo) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, now + start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + start + duration);
  gain.gain.setValueAtTime(.0001, now + start);
  gain.gain.exponentialRampToValueAtTime(peak, now + start + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, now + start + duration);
  oscillator.connect(gain);
  gain.connect(master);
  oscillator.start(now + start);
  oscillator.stop(now + start + duration + .05);
 };
 const noise = (start, duration, peak, filterFreq) => {
  const length = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.setValueAtTime(peak, now + start);
  gain.gain.exponentialRampToValueAtTime(.0001, now + start + duration);
  const filter = context.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(now + start);
  source.stop(now + start + duration + .05);
 };
 switch (kind) {
  case 'tap':
   tone('triangle', 520, 0, .09, .5);
   break;
  case 'ok':
   tone('sine', 660, 0, .14, .5);
   tone('sine', 990, .07, .18, .35);
   break;
  case 'miss':
   tone('sawtooth', 220, 0, .12, .25, 160);
   break;
  case 'win':
   tone('sine', 523, 0, .16, .4);
   tone('sine', 659, .12, .16, .4);
   tone('sine', 784, .24, .22, .4);
   tone('sine', 1047, .36, .4, .3);
   break;
  case 'whoosh':
   noise(0, .22, .3, 900);
   tone('sine', 300, 0, .2, .12, 120);
   break;
  case 'pop':
   tone('sine', 880, 0, .1, .4, 1320);
   break;
  case 'twinkle':
   tone('sine', 1568, 0, .12, .3);
   tone('sine', 2093, .05, .14, .2);
   break;
 }
}

function fxSetOn(value) {
 fx.on = value;
 saveStored('kosmos3.fx', value ? '1' : '0');
 if (value) fxPlay('tap');
}
