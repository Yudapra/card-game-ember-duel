// Ember Duel — audio: every sound is synthesized with WebAudio.
//
// No audio files ship with the game: each effect is a few oscillators and
// a gain envelope, built in code. The module is silent until the player
// first interacts (browsers require a gesture), and M toggles mute.

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, type, vol, when = 0, slideTo = null) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  playCard() { tone(520, 0.09, 'triangle', 0.16); tone(780, 0.1, 'triangle', 0.12, 0.05); },
  hit() { tone(160, 0.16, 'sawtooth', 0.2, 0, 70); tone(90, 0.12, 'square', 0.1); },
  shield() { tone(880, 0.12, 'sine', 0.14); tone(1320, 0.14, 'sine', 0.08, 0.04); },
  heal() { tone(660, 0.14, 'sine', 0.14); tone(990, 0.18, 'sine', 0.12, 0.08); },
  burn() { tone(220, 0.2, 'sawtooth', 0.1, 0, 440); },
  draw() { tone(440, 0.06, 'triangle', 0.1); tone(587, 0.06, 'triangle', 0.1, 0.05); },
  turn() { tone(392, 0.1, 'triangle', 0.12); },
  bad() { tone(196, 0.12, 'square', 0.08); },
  draft() { tone(523, 0.1, 'triangle', 0.14); tone(659, 0.1, 'triangle', 0.14, 0.07); tone(784, 0.16, 'triangle', 0.14, 0.14); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.16, i * 0.11)); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.26, 'triangle', 0.14, i * 0.13)); },
};
