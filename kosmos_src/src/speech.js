/* ---------- lektor ---------- */

const speech = {
 supported: speechSupported,
 on: loadStored('kosmos3.sound', '1') === '1',
 rate: clamp(parseFloat(loadStored('kosmos3.rate', '.9')) || .9, .6, 1.3),
 pitch: clamp(parseFloat(loadStored('kosmos3.pitch', '1.05')) || 1.05, .7, 1.5),
 voiceName: loadStored('kosmos3.voice', ''),
 voices: [],
 gen: 0,
 holder: null
};

/* stan ostrzeżenia dla rodzica (używa go ui.js) */
let voiceWarnDismissed = false;
let voicesSettled = false;

const FEMALE_VOICE = /zosia|zofia|ewa\b|paulina|agnieszka|maja\b|ola\b|ada\b|sabina|monika|kasia|natalia|joanna|iwona|krystyna|google polski|female|kobiet/i;
const MALE_VOICE = /marek|krzysztof|jacek|adam\b|piotr|jakub|bartosz|stefan|janusz|tomasz|zbigniew|\bmale\b|m[eę]sk/i;

function polishVoices() {
 return speech.voices.filter(voice => /^pl/i.test(voice.lang) || /polish|polski/i.test(voice.name));
}

function voiceScore(voice) {
 const name = voice.name || '';
 let score = 0;
 if (/natural|neural|online/i.test(name)) score += 6;
 if (/premium|enhanced|wavenet|studio|siri/i.test(name)) score += 4;
 if (FEMALE_VOICE.test(name)) score += 5;
 if (MALE_VOICE.test(name)) score -= 20;
 if (/google/i.test(name)) score += 1;
 if (/^pl[-_]PL$/i.test(voice.lang)) score += 1;
 return score;
}

function currentVoice() {
 const candidates = polishVoices();
 if (!candidates.length) return null;
 const saved = candidates.find(voice => voice.name === speech.voiceName);
 if (saved) return saved;
 return [...candidates].sort((first, second) => voiceScore(second) - voiceScore(first))[0];
}

function refreshVoices() {
 if (!speech.supported) return;
 try {speech.voices = window.speechSynthesis.getVoices() || [];} catch (error) {speech.voices = [];}
 if (typeof renderSettings === 'function') renderSettings();
}

function stopSpeech() {
 speech.gen++;
 if (!speech.supported) return;
 try {window.speechSynthesis.cancel();} catch (error) {}
}

function sentencesOf(text) {
 const parts = text.match(/[^.!?…]+[.!?…]+["”»]?|[^.!?…]+$/g) || [text];
 return parts.map(part => part.trim()).filter(Boolean);
}

function speakPart(text, generation, onDone) {
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.lang = 'pl-PL';
 utterance.rate = speech.rate;
 utterance.pitch = speech.pitch;
 const voice = currentVoice();
 if (voice) {
  utterance.voice = voice;
  utterance.lang = voice.lang;
 }
 let finished = false;
 let timer = 0;
 const finish = () => {
  if (finished) return;
  finished = true;
  clearTimeout(timer);
  if (generation === speech.gen) onDone();
 };
 timer = setTimeout(finish, Math.max(3500, text.length * 150 / speech.rate));
 utterance.onend = finish;
 utterance.onerror = finish;
 speech.holder = utterance;
 try {window.speechSynthesis.speak(utterance);} catch (error) {finish();}
}

/* segmenty: {text, pause, onStart(), onPart(indeks)}; lektor czyta zdanie po zdaniu */
function speakSegments(segments, onAllDone) {
 stopSpeech();
 const generation = speech.gen;
 if (!speech.on || !speech.supported || !segments.length) {
  if (segments.length && segments[0].onStart) segments[0].onStart();
  if (onAllDone) onAllDone();
  return;
 }
 let segmentIndex = 0;
 const nextSegment = () => {
  if (generation !== speech.gen) return;
  if (segmentIndex >= segments.length) {
   if (onAllDone) onAllDone();
   return;
  }
  const segment = segments[segmentIndex++];
  if (segment.onStart) segment.onStart();
  const parts = sentencesOf(segment.text);
  let partIndex = 0;
  const nextPart = () => {
   if (generation !== speech.gen) return;
   if (partIndex >= parts.length) {
    setTimeout(nextSegment, segment.pause === undefined ? 700 : segment.pause);
    return;
   }
   if (segment.onPart) segment.onPart(partIndex);
   speakPart(parts[partIndex++], generation, nextPart);
  };
  nextPart();
 };
 let busy = false;
 try {busy = window.speechSynthesis.speaking || window.speechSynthesis.pending;} catch (error) {}
 if (busy) setTimeout(nextSegment, 140);
 else nextSegment();
}

function sayNow(text, onDone) {
 speakSegments([{text, pause: 0}], onDone);
}

function setVoiceOn(value) {
 speech.on = value;
 saveStored('kosmos3.sound', value ? '1' : '0');
 if (!value) stopSpeech();
}

if (speech.supported) {
 refreshVoices();
 try {window.speechSynthesis.addEventListener('voiceschanged', refreshVoices);} catch (error) {window.speechSynthesis.onvoiceschanged = refreshVoices;}
}
