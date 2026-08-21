/* The maths behind motion transfer.
   ---------------------------------------------------------------------------
   The one promise this feature makes is that the character keeps its own
   proportions. Copying the video's joint positions straight across is the
   obvious build and it is wrong: it stretches the character into the shape of
   whoever was filmed, so a tall dancer turns a short character into a giraffe.
   Only the ANGLES come from the video; bone lengths stay the character's.

   That promise is a property, not an example, so it is tested as one — every
   bone, in every frame, at any pose the video happens to be in.
   --------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const M = require('../motion-transfer.js');

/* A character with deliberately odd proportions: stumpy legs, long arms.
   Anything that quietly substitutes the video's proportions will show up here
   as bones that are no longer these lengths. */
const REST = {
  head: [100, 20], neck: [100, 60], hip: [100, 140],
  shoulderL: [70, 65], shoulderR: [130, 65],
  handL: [30, 130], handR: [170, 130],
  footL: [85, 190], footR: [115, 190]
};
const BOX = { w: 200, h: 200 };

/* A pose in the video's 0..1 space. Proportions here are nothing like REST's —
   that is the point. */
function frameAt(k) {
  const sway = Math.sin(k) * 0.12;
  return {
    head: [0.5 + sway * 0.4, 0.06],
    neck: [0.5 + sway * 0.3, 0.20],
    hip: [0.5 + sway * 0.1, 0.55],
    shoulderL: [0.40 + sway * 0.3, 0.22], shoulderR: [0.60 + sway * 0.3, 0.22],
    handL: [0.28 + sway, 0.46], handR: [0.72 + sway, 0.46],
    footL: [0.44, 0.97], footR: [0.56, 0.97]
  };
}

const lens = M.boneLengths(REST);
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

test('every bone keeps the character\'s own length, in every pose', () => {
  for (let k = 0; k < 30; k++) {
    const posed = M.pose(frameAt(k), REST, lens, BOX, 1);
    for (const [a, b] of M.CHAIN) {
      const want = lens[a + '>' + b];
      const got = dist(posed[a], posed[b]);
      assert.ok(Math.abs(got - want) < 1e-9,
        `bone ${a}>${b} at k=${k}: expected ${want.toFixed(4)}, got ${got.toFixed(4)}`);
    }
  }
});

test('the pose is the video\'s, not the character\'s rest pose', () => {
  /* The guarantee above would also hold if the code ignored the video and
     returned REST unchanged, so this pins the other half: the angles move. */
  const a = M.pose(frameAt(0), REST, lens, BOX, 1);
  const b = M.pose(frameAt(3), REST, lens, BOX, 1);
  let moved = 0;
  for (const k of Object.keys(a)) if (dist(a[k], b[k]) > 0.5) moved++;
  assert.ok(moved >= 4, `expected several joints to move between poses, ${moved} did`);
});

test('bone direction follows the video, not the rest pose', () => {
  /* An arm raised in the video must come out raised, whatever the character's
     arm was doing at rest. */
  const f = frameAt(0);
  f.handL = [f.shoulderL[0] - 0.02, f.shoulderL[1] - 0.30];   // straight up
  const posed = M.pose(f, REST, lens, BOX, 1);
  assert.ok(posed.handL[1] < posed.shoulderL[1],
    'hand should be above the shoulder when the video raises it');
});

test('travel controls how far the character wanders', () => {
  const f = frameAt(0);
  f.hip = [0.9, 0.55];                       // subject far to the right
  const pinned = M.pose(f, REST, lens, BOX, 0);
  const following = M.pose(f, REST, lens, BOX, 1);
  assert.deepEqual(pinned.hip, REST.hip, 'travel 0 should keep the hip at rest');
  assert.ok(following.hip[0] > pinned.hip[0] + 20, 'travel 1 should move it right');
  /* And the proportions survive either way. */
  for (const [a, b] of M.CHAIN)
    assert.ok(Math.abs(dist(following[a], following[b]) - lens[a + '>' + b]) < 1e-9);
});

test('short gaps are interpolated, long ones hold', () => {
  const A = frameAt(0), B = frameAt(6);
  const short = M.fillGaps([A, null, null, B], 8);
  assert.ok(short.every(Boolean), 'a two-frame gap should be filled');
  /* The filled frames sit between the two ends rather than snapping to one. */
  const midX = short[1].hip[0];
  assert.ok(midX > Math.min(A.hip[0], B.hip[0]) - 1e-9 &&
            midX < Math.max(A.hip[0], B.hip[0]) + 1e-9, 'filled frame should be between');

  const longGap = M.fillGaps([A, null, null, null, null, B], 2);
  assert.ok(longGap.every(Boolean), 'a long gap still yields frames rather than holes');
});

test('a track with nobody in it stays empty rather than inventing a pose', () => {
  const out = M.fillGaps([null, null, null], 8);
  assert.deepEqual(out, [null, null, null]);
});

test('smoothing reduces jitter without dragging the pose off course', () => {
  /* A jittering hand: same place every frame, plus noise. */
  const noisy = [];
  for (let i = 0; i < 40; i++) {
    const f = frameAt(0);
    f.handL = [0.30 + (i % 2 ? 0.02 : -0.02), 0.46];
    noisy.push(f);
  }
  const jitterOf = (fr) => {
    let sum = 0;
    for (let i = 1; i < fr.length; i++) sum += Math.abs(fr[i].handL[0] - fr[i - 1].handL[0]);
    return sum / (fr.length - 1);
  };
  const before = jitterOf(noisy);
  const after = jitterOf(M.smooth(noisy, 0.6));
  assert.ok(after < before * 0.7, `jitter should drop: ${before.toFixed(4)} -> ${after.toFixed(4)}`);
  /* And it must still be near the true position, not lagging halfway to zero. */
  const last = M.smooth(noisy, 0.6)[39].handL[0];
  assert.ok(Math.abs(last - 0.30) < 0.02, `smoothed value drifted to ${last}`);
});

test('smoothing off is a no-op', () => {
  const fr = [frameAt(0), frameAt(1)];
  assert.deepEqual(M.smooth(fr, 0), fr);
});

test('playback interpolates between baked frames', () => {
  const track = { fps: 10, duration: 1, frames: [frameAt(0), frameAt(2), frameAt(4)] };
  const baked = M.bake(track, REST, BOX, { smooth: 0 });
  const a = M.sample(baked, 0);
  const half = M.sample(baked, 0.05);          // between frame 0 and 1
  const b = M.sample(baked, 0.1);
  assert.ok(dist(a.handL, b.handL) > 0.01, 'the two ends should differ');
  const straddles = (v, p, q) => v >= Math.min(p, q) - 1e-9 && v <= Math.max(p, q) + 1e-9;
  assert.ok(straddles(half.handL[0], a.handL[0], b.handL[0]),
    'a sample halfway should land between its neighbours');
});

test('sampling past the end holds the last frame rather than throwing', () => {
  const track = { fps: 10, duration: 0.2, frames: [frameAt(0), frameAt(1)] };
  const baked = M.bake(track, REST, BOX, { smooth: 0 });
  const last = M.sample(baked, 99);
  assert.ok(last && last.hip, 'should still return a pose');
  for (const [a, b] of M.CHAIN)
    assert.ok(Math.abs(dist(last[a], last[b]) - lens[a + '>' + b]) < 1e-6);
});

test('nine() refuses a partial detection', () => {
  /* Half a skeleton posed onto a character is worse than no frame at all: the
     missing joints would collapse to a point and the limb would snap. */
  const full = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5 }));
  assert.ok(M.nine(full), 'a full set should map');
  const partial = full.slice();
  partial[15] = null;                       // one wrist missing
  assert.equal(M.nine(partial), null);
});

test('bone lengths come out of the character, not a constant', () => {
  const tall = Object.assign({}, REST, { footL: [85, 400], footR: [115, 400] });
  const a = M.boneLengths(REST), b = M.boneLengths(tall);
  assert.ok(b['hip>footL'] > a['hip>footL'] * 2, 'a longer leg should measure longer');
  assert.equal(a['neck>head'], b['neck>head'], 'untouched bones should be unchanged');
});

test('the module exports the clock the panel calls', () => {
  /* The panel at the bottom of motion-transfer.js is a SEPARATE closure and
     cannot see anything in the module's. It reaches for the tick() scheduler
     through this export, and when it was reached for directly instead, the
     file still parsed and still loaded — then threw "tick is not defined" the
     moment Play was pressed. Nothing caught it, because the browser checks all
     stop at "Loading the pose model…": MediaPipe's CDN is blocked here, so no
     automated run had ever got as far as pressing Play.

     This is the cheap half of that lesson. The other half is a panel test with
     setProvider() standing in for the model, which is what actually exercises
     the code the CDN hides. */
  assert.equal(typeof M.tick, 'function', 'NCMotion.tick must stay exported');
  assert.equal(typeof M.setProvider, 'function', 'setProvider is how the model is stubbed');
  assert.equal(typeof M.limits, 'object');
});
