/* ncPayEstimate — what a teenager's channel could pay.
   ==========================================================================
   These numbers go in front of a parent, so the tests are less about the
   arithmetic (it is three multiplications) and more about the claims: that it
   never says a channel is earning when it is not, that it never quotes a
   single figure, and that the under-18 rule is reported whether or not a
   channel is connected.
   ========================================================================== */
import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../nova.js', import.meta.url), 'utf8');

/* Pull the function and the two constants it closes over out of the shipped
   file, so this cannot pass against a copy that has drifted. */
function extract(name, endMarker) {
  const start = src.indexOf(name);
  assert.ok(start > 0, name + ' not found in nova.js');
  const end = src.indexOf(endMarker, start);
  assert.ok(end > start, 'end of ' + name + ' not found');
  return src.slice(start, end);
}
const consts = extract('const NC_YPP =', 'function ncPayEstimate');
const fn = extract('function ncPayEstimate', '\nwindow.ncPayEstimate');
const ncPayEstimate = new Function(consts + fn + '\nreturn ncPayEstimate;')();

const CHANNEL = {
  connected: true,
  created: '2024-02-10',
  subscribers: 640,
  totalViews: 184000,
  videoCount: 48
};

test('no channel connected returns no money at all', () => {
  const p = ncPayEstimate(null, 15);
  assert.equal(p.connected, false);
  assert.equal(p.monthLow, undefined);
  assert.equal(p.monthHigh, undefined);
  assert.equal(p.viewsPerMonth, undefined);
});

test('the age rule is reported with no channel connected', () => {
  /* The most useful thing this can tell a parent does not depend on YouTube. */
  const p = ncPayEstimate(null, 14);
  assert.equal(p.yearsTo18, 4);
  assert.equal(p.ownAccount, false);
});

test('18 and over can hold the account', () => {
  assert.equal(ncPayEstimate(CHANNEL, 18).ownAccount, true);
  assert.equal(ncPayEstimate(CHANNEL, 25).ownAccount, true);
  assert.equal(ncPayEstimate(CHANNEL, 25).yearsTo18, 0);
});

test('under 18 cannot, and the countdown is right', () => {
  const p = ncPayEstimate(CHANNEL, 15);
  assert.equal(p.ownAccount, false);
  assert.equal(p.yearsTo18, 3);
});

test('an unknown age never claims the account can be theirs', () => {
  const p = ncPayEstimate(CHANNEL, 0);
  assert.equal(p.ownAccount, false);
  assert.equal(p.yearsTo18, null);
});

test('the estimate is always a range, never one number', () => {
  const p = ncPayEstimate(CHANNEL, 15);
  assert.ok(p.monthHigh > p.monthLow, 'high must exceed low');
  assert.ok(p.yearHigh > p.yearLow);
  assert.equal(p.yearLow, p.monthLow * 12);
  assert.equal(p.yearHigh, p.monthHigh * 12);
});

test('views per month divides the lifetime by the months, not by 12', () => {
  const p = ncPayEstimate(CHANNEL, 15);
  const months = (Date.now() - Date.parse('2024-02-10')) / (30.44 * 86400000);
  assert.equal(p.viewsPerMonth, Math.round(184000 / months));
  /* and the money follows from it at the stated RPM */
  assert.ok(Math.abs(p.monthLow - p.viewsPerMonth / 1000 * p.rpm.low) < 1e-9);
});

test('a channel created today is not divided by zero months', () => {
  const p = ncPayEstimate({ connected: true, created: new Date().toISOString().slice(0, 10),
    subscribers: 5, totalViews: 300 }, 15);
  assert.ok(isFinite(p.viewsPerMonth), 'views per month must be a real number');
  assert.equal(p.months, 1, 'a brand new channel floors at one month');
});

test('a missing creation date does not produce Infinity', () => {
  const p = ncPayEstimate({ connected: true, subscribers: 5, totalViews: 300 }, 15);
  assert.ok(isFinite(p.viewsPerMonth));
  assert.ok(isFinite(p.monthHigh));
});

test('the subscriber gate is reported honestly on both sides', () => {
  const under = ncPayEstimate(CHANNEL, 15);
  assert.equal(under.subsMet, false);
  assert.equal(under.needSubs, 360);
  assert.equal(under.subsPct, 64);

  const over = ncPayEstimate(Object.assign({}, CHANNEL, { subscribers: 4200 }), 18);
  assert.equal(over.subsMet, true);
  assert.equal(over.needSubs, 0);
  assert.equal(over.subsPct, 100, 'the bar must not run past full');
});

test('a zero-view channel estimates zero, not a minimum', () => {
  const p = ncPayEstimate({ connected: true, created: '2024-01-01', subscribers: 0, totalViews: 0 }, 15);
  assert.equal(p.viewsPerMonth, 0);
  assert.equal(p.monthLow, 0);
  assert.equal(p.monthHigh, 0);
});

test('the RPM band starts low and is not a single point', () => {
  const p = ncPayEstimate(CHANNEL, 15);
  assert.ok(p.rpm.low > 0 && p.rpm.low <= 1, 'the low end should reflect a teen-audience channel');
  assert.ok(p.rpm.high > p.rpm.low);
});

test('the Partner Programme thresholds are the real ones', () => {
  assert.ok(/subs:\s*1000/.test(consts), 'YPP needs 1,000 subscribers');
  assert.ok(/watchHours:\s*4000/.test(consts), 'YPP needs 4,000 watch hours');
  assert.ok(/shortsViews:\s*10000000/.test(consts), 'or 10M Shorts views');
  assert.ok(/NC_ADSENSE_AGE = 18/.test(consts), 'AdSense is 18, not 13');
});
