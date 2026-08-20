/* The arithmetic behind the voice changer.
   ---------------------------------------------------------------------------
   A voice changer makes exactly two promises, and they pull against each
   other: the pitch moves, and the length does not. Getting one without the
   other is easy and useless — playing a clip faster raises the pitch and
   shortens it, which no longer fits the cut it was made for.

   So both halves are measured here, on a tone whose pitch is known exactly,
   at shifts up and down, rather than checked by ear on one example.
   --------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const V = require('../voice-changer.js');

const SR = 44100;

function sine(hz, seconds, sr = SR) {
  const n = Math.round(seconds * sr);
  const x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = Math.sin(2 * Math.PI * hz * i / sr) * 0.8;
  return x;
}

/* Pitch by autocorrelation over the middle of the signal.

   Counting zero crossings is the obvious way and it lies here. Overlapping
   grains meet at slightly different points in the wave's cycle, and each of
   those joins adds a crossing that is a join rather than a cycle — which reads
   as a pitch several percent higher than the one actually being played. This
   looks for the lag at which the signal best resembles itself, which a handful
   of joins do not move. */
function pitchOf(x, sr = SR) {
  const a = Math.floor(x.length * 0.25), b = Math.floor(x.length * 0.75);
  const seg = x.subarray(a, b);
  const lo = Math.floor(sr / 2000), hi = Math.min(Math.floor(sr / 50), seg.length - 1);
  const r = new Float64Array(hi + 1);
  for (let lag = lo; lag <= hi; lag++) {
    let s = 0, ea = 0, eb = 0;
    for (let i = 0; i + lag < seg.length; i++) {
      s += seg[i] * seg[i + lag];
      ea += seg[i] * seg[i]; eb += seg[i + lag] * seg[i + lag];
    }
    /* Normalised against both windows' own energy. Without this, longer lags
       compare fewer samples and score differently for reasons that have
       nothing to do with pitch. */
    r[lag] = (ea && eb) ? s / Math.sqrt(ea * eb) : 0;
  }
  let best = lo;
  for (let lag = lo; lag <= hi; lag++) if (r[lag] > r[best]) best = lag;
  /* Two periods correlate as well as one, which is how a pitch detector
     reports an octave too low. The true period is the earliest PEAK that is
     essentially as good as the best one — peaks only, because any lag on the
     rising slope towards the real peak also clears a threshold, and picking
     one of those reports a pitch a few percent high. */
  let lag = best;
  for (let i = lo + 1; i < best; i++)
    if (r[i] > r[i - 1] && r[i] >= r[i + 1] && r[i] >= r[best] * 0.9) { lag = i; break; }

  /* A parabola through the peak and its two neighbours, because the true
     period is rarely a whole number of samples. */
  const y0 = r[lag - 1] || 0, y1 = r[lag], y2 = r[lag + 1] || 0;
  const denom = y0 - 2 * y1 + y2;
  const adj = denom ? 0.5 * (y0 - y2) / denom : 0;
  return sr / (lag + Math.max(-0.5, Math.min(0.5, adj)));
}

const finite = (x) => Array.prototype.every.call(x, (v) => Number.isFinite(v));

test('the pitch moves by the amount asked for', () => {
  const src = sine(220, 0.8);
  for (const [semis, factor] of [[12, 2], [7, 1.4983], [-12, 0.5], [-5, 0.7492]]) {
    const got = pitchOf(V.shift(src, semis));
    const want = 220 * factor;
    assert.ok(Math.abs(got - want) / want < 0.06,
      `${semis} semitones: expected about ${want.toFixed(1)}Hz, measured ${got.toFixed(1)}Hz`);
  }
});

test('the length does not move at all', () => {
  /* The whole reason this is grains rather than one resample. A shifted clip
     that is shorter no longer lines up with the picture. */
  const src = sine(180, 1.3);
  for (const s of [-12, -7, -1, 0, 1, 7, 12])
    assert.equal(V.shift(src, s).length, src.length, `${s} semitones changed the length`);
});

test('a tape-speed resample changes the length, which is why it is separate', () => {
  /* Kept as its own function precisely so nobody reaches for it by accident
     when they meant shift(). */
  const src = sine(180, 1);
  assert.equal(V.resample(src, 2).length, Math.round(src.length / 2));
  assert.equal(V.resample(src, 0.5).length, Math.round(src.length * 2));
});

test('no shift is a straight copy, not an almost-copy', () => {
  const src = sine(300, 0.2);
  const out = V.shift(src, 0);
  assert.equal(out.length, src.length);
  for (let i = 0; i < src.length; i++) assert.equal(out[i], src[i]);
});

test('the level survives the shift instead of fading at the ends', () => {
  /* The overlap-add windows only sum flat in the middle. Without dividing by
     the window weight the first and last forty milliseconds fade, which sounds
     like a bad edit on every single clip. */
  const src = sine(220, 0.6);
  const out = V.shift(src, 5);
  const rms = (x, a, b) => {
    let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i];
    return Math.sqrt(s / (b - a));
  };
  const mid = rms(out, out.length * 0.4 | 0, out.length * 0.6 | 0);
  const head = rms(out, 200, 1200);
  const tail = rms(out, out.length - 1200, out.length - 200);
  assert.ok(head > mid * 0.55, `start faded: ${head.toFixed(3)} vs ${mid.toFixed(3)}`);
  assert.ok(tail > mid * 0.55, `end faded: ${tail.toFixed(3)} vs ${mid.toFixed(3)}`);
});

test('silence stays silence rather than becoming NaN', () => {
  /* normalize() divides by the peak. A silent clip has a peak of zero, and the
     obvious version of that line fills the buffer with NaN — which plays as a
     click loud enough to hurt. */
  const quiet = new Float32Array(4096);
  for (const out of [V.shift(quiet, 7), V.normalize(quiet), V.drive(quiet, 0.5),
                     V.ringMod(quiet, SR, 55, 1), V.apply(quiet, SR, 'robot')]) {
    assert.ok(finite(out), 'produced a non-finite sample');
    assert.ok(Array.prototype.every.call(out, (v) => v === 0), 'invented sound from silence');
  }
});

test('every voice runs, stays finite and stays inside the rails', () => {
  const src = sine(200, 0.35);
  for (const p of V.PRESETS) {
    const out = V.apply(src, SR, p.id);
    assert.ok(out.length >= src.length, `${p.id} came back shorter`);
    assert.ok(finite(out), `${p.id} produced a non-finite sample`);
    let peak = 0;
    for (const v of out) peak = Math.max(peak, Math.abs(v));
    assert.ok(peak <= 1.0001, `${p.id} clipped at ${peak}`);
    assert.ok(peak > 0.05, `${p.id} came out silent`);
  }
});

test('every voice has a name and a plain-words description', () => {
  /* The panel lists these; a preset with no description is a button nobody
     can guess the meaning of. */
  const ids = new Set();
  for (const p of V.PRESETS) {
    assert.ok(p.id && p.name && p.about, `${p.id} is missing a field`);
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.equal(V.preset(p.id), p);
  }
  assert.equal(V.preset('nope'), null);
});

test('the phone filter throws away what a phone throws away', () => {
  const rumble = sine(60, 0.4);
  const speech = sine(1000, 0.4);
  const level = (x) => {
    let s = 0; for (let i = x.length * 0.3 | 0; i < x.length * 0.7; i++) s += x[i] * x[i];
    return Math.sqrt(s / (x.length * 0.4));
  };
  const cutRumble = level(V.band(rumble, SR, 300, 3400)) / level(rumble);
  const keptSpeech = level(V.band(speech, SR, 300, 3400)) / level(speech);
  assert.ok(cutRumble < 0.15, `60Hz should be gone, ${cutRumble.toFixed(3)} left`);
  assert.ok(keptSpeech > 0.7, `1kHz should survive, only ${keptSpeech.toFixed(3)} left`);
});

test('an echo is longer than what went in, and decays', () => {
  const src = sine(300, 0.2);
  const out = V.echo(src, SR, 0.1, 0.5, 0.5);
  assert.ok(out.length > src.length, 'the tail should extend past the source');
  const late = out.subarray(src.length + SR * 0.05);
  let peak = 0;
  for (const v of late) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak > 0.001, 'there should BE a tail');
  assert.ok(peak < 0.5, 'the tail should be quieter than the source');
});

test('drive makes it louder without letting it past the rails', () => {
  const src = sine(200, 0.2);
  const out = V.drive(src, 0.8);
  let peakIn = 0, peakOut = 0, rmsIn = 0, rmsOut = 0;
  for (let i = 0; i < src.length; i++) {
    peakIn = Math.max(peakIn, Math.abs(src[i]));
    peakOut = Math.max(peakOut, Math.abs(out[i]));
    rmsIn += src[i] * src[i]; rmsOut += out[i] * out[i];
  }
  assert.ok(peakOut <= 1.0001, `drive clipped at ${peakOut}`);
  assert.ok(Math.sqrt(rmsOut) > Math.sqrt(rmsIn), 'saturation should raise the average level');
});

test('the WAV header describes the data that follows it', () => {
  /* A wrong byte here gives a file that every player refuses, with no clue
     which of the twelve fields is wrong. */
  const n = 1000;
  const buf = V.wav([new Float32Array(n), new Float32Array(n)], 48000);
  const v = new DataView(buf);
  const str = (o, len) => Array.from({ length: len }, (_, i) => String.fromCharCode(v.getUint8(o + i))).join('');
  assert.equal(str(0, 4), 'RIFF');
  assert.equal(str(8, 4), 'WAVE');
  assert.equal(str(12, 4), 'fmt ');
  assert.equal(str(36, 4), 'data');
  assert.equal(v.getUint16(22, true), 2, 'channel count');
  assert.equal(v.getUint32(24, true), 48000, 'sample rate');
  assert.equal(v.getUint16(34, true), 16, 'bit depth');
  assert.equal(v.getUint32(28, true), 48000 * 2 * 2, 'byte rate');
  assert.equal(v.getUint16(32, true), 4, 'block align');
  assert.equal(v.getUint32(40, true), n * 2 * 2, 'data size');
  assert.equal(buf.byteLength, 44 + n * 2 * 2, 'total file size');
  assert.equal(v.getUint32(4, true), 36 + n * 2 * 2, 'RIFF size');
});

test('samples land at the right numbers, including the ends of the range', () => {
  const buf = V.wav([new Float32Array([0, 1, -1, 0.5, 2, -2])], SR);
  const v = new DataView(buf);
  assert.equal(v.getInt16(44, true), 0);
  assert.equal(v.getInt16(46, true), 32767);
  assert.equal(v.getInt16(48, true), -32768);
  assert.equal(v.getInt16(50, true), 16383);       // 0.5 * 32767
  /* Anything past the rails is held at them rather than wrapping — a wrap
     turns the loudest moment of a clip into a burst of noise. */
  assert.equal(v.getInt16(52, true), 32767);
  assert.equal(v.getInt16(54, true), -32768);
});

test('a clip shorter than one grain still comes back shifted', () => {
  /* Grains are 2048 samples; a 20ms blip is smaller than that, and the naive
     loop returns an empty buffer for it. */
  const tiny = sine(400, 0.02);
  const out = V.shift(tiny, 12);
  assert.equal(out.length, tiny.length);
  assert.ok(finite(out));
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  assert.ok(peak > 0.1, 'a short clip came back silent');
});

test('an empty clip is handled rather than crashing the panel', () => {
  const none = new Float32Array(0);
  assert.equal(V.shift(none, 7).length, 0);
  assert.equal(V.normalize(none).length, 0);
  assert.equal(V.apply(none, SR, 'monster').length, 0);
});
