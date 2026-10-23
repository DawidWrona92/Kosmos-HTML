const TAU = Math.PI * 2;
const MAX_ORBIT = 1080;
const MIN_TILT = .12;
const MAX_TILT = .95;
const MIN_ZOOM = .5;
const MAX_ZOOM = 260;
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

