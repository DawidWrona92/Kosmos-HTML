const TAU = Math.PI * 2;
const MAX_ORBIT = 700;
/* widok startowy: Słońce i planety do pasa planetoid */
const START_RADIUS = 250;
const MIN_TILT = .12;
const MAX_TILT = .95;
const MIN_ZOOM = .5;
const MAX_ZOOM = 260;
/* jedno ciągłe przybliżanie: od całej Drogi Mlecznej (GALAXY_MIN_ZOOM) po powierzchnię planety (MAX_ZOOM).
 * Galaktyka wyłania się wokół Słońca, gdy Układ Słoneczny kurczy się poniżej GALAXY_FADE_FROM. */
const GALAXY_MIN_ZOOM = .03;
const GALAXY_FADE_FROM = .14;
const MIN_SPEED = 1;
const MAX_SPEED = 30;
const DEFAULT_SPEED = 5;
const DAYS_PER_SPEED_UNIT = 1.2;
const BELT_INNER = 208;
const BELT_OUTER = 238;
const ASTEROID_COUNT = 850;
const ACT_SCALE = 2;

const byId = id => document.getElementById(id);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const lerp = (from, to, amount) => from + (to - from) * amount;
const smoothstep = amount => {const t = Math.min(1, Math.max(0, amount)); return t * t * (3 - 2 * t);};

const canvas = byId('space');
const ctx = canvas.getContext('2d');
const infoPanel = byId('info');
const dock = byId('dock');
const controlsPanel = byId('controls');
const compactQuery = window.matchMedia('(max-width:1200px)');
const speechSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function loadStored(key, fallback) {
 try {
  const value = window.localStorage.getItem(key);
  return value === null ? fallback : value;
 } catch (error) {
  return fallback;
 }
}

function saveStored(key, value) {
 try {window.localStorage.setItem(key, value);} catch (error) {}
}

