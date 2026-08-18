/* The date formatter behind every Analytics query.
   ---------------------------------------------------------------------------
   This exists because of one bug that only appeared east of Greenwich. The
   year chart builds its range from local calendar parts — new Date(y, m, 1) is
   local midnight on the 1st — and then formatted it with toISOString(), which
   converts to UTC first. At UTC+1 that turns the 1st into 23:00 on the last
   day of the previous month, so the string came out a day early and YouTube
   refused the request:

     Date range (2025-07-31) in field parameters.start-date does not align to
     chosen date dimension.

   With the `month` dimension the start date has to be the first of a month.
   The failure was invisible in UTC and in the Americas, so it could not be
   found by running the page where it was written — hence tests that pin the
   timezone rather than trusting the machine's own.
   --------------------------------------------------------------------------- */
import { test } from 'node:test';
import assert from 'node:assert';

/* Kept in step with analytics.html by hand — the page is a single HTML file
   with no module boundary to import across. If that function changes, this
   copy has to change with it, and the tests below are what notice. */
function ymd(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

/* The range the monthly trend asks for: whole months, ending with last month,
   because the current one is partial and a half-height bar at the end of a
   trend line reads as a collapse. */
function yearRange(now) {
  const end = new Date(now.getFullYear(), now.getMonth(), 0);
  const start = new Date(end.getFullYear(), end.getMonth() - 11, 1);
  return { start: ymd(start), end: ymd(end) };
}

/* Node reads TZ per Date construction, so setting it inside a test is enough
   to move the whole calendar. These five span both sides of Greenwich and the
   half-hour offset that catches formatters assuming whole hours. */
const ZONES = ['UTC', 'Europe/Lisbon', 'Europe/Berlin', 'Asia/Tokyo',
               'Asia/Kolkata', 'America/New_York', 'Pacific/Auckland'];

function inZone(tz, fn) {
  const was = process.env.TZ;
  process.env.TZ = tz;
  try { return fn(); } finally { process.env.TZ = was; }
}

test('ymd never shifts a day, in any timezone', () => {
  for (const tz of ZONES) {
    inZone(tz, () => {
      /* Local midnight on the 1st is the case that broke: it is the value
         furthest from UTC in the losing direction. */
      assert.equal(ymd(new Date(2025, 7, 1)), '2025-08-01', tz);
      assert.equal(ymd(new Date(2026, 0, 1)), '2026-01-01', tz);   // year boundary
      assert.equal(ymd(new Date(2026, 6, 31)), '2026-07-31', tz);  // month end
      assert.equal(ymd(new Date(2024, 1, 29)), '2024-02-29', tz);  // leap day
    });
  }
});

test('ymd pads single-digit months and days', () => {
  assert.equal(ymd(new Date(2026, 0, 5)), '2026-01-05');
  assert.equal(ymd(new Date(2026, 8, 9)), '2026-09-09');
});

test('the year range starts on the first of a month, in any timezone', () => {
  for (const tz of ZONES) {
    inZone(tz, () => {
      /* The exact day the bug was reported on. */
      const r = yearRange(new Date(2026, 7, 18));
      assert.equal(r.start, '2025-08-01', tz + ' start');
      assert.equal(r.end, '2026-07-31', tz + ' end');
      /* The rule YouTube actually enforces for the `month` dimension, stated
         rather than implied by the two strings above. */
      assert.ok(/-01$/.test(r.start), tz + ': start must be the 1st, got ' + r.start);
    });
  }
});

test('the year range is twelve whole months whatever month it is run in', () => {
  for (let m = 0; m < 12; m++) {
    const r = yearRange(new Date(2026, m, 15));
    assert.ok(/-01$/.test(r.start), 'month ' + m + ' start ' + r.start);
    const s = new Date(r.start + 'T00:00:00Z'), e = new Date(r.end + 'T00:00:00Z');
    const months = (e.getUTCFullYear() - s.getUTCFullYear()) * 12 +
                   (e.getUTCMonth() - s.getUTCMonth());
    assert.equal(months, 11, 'month ' + m + ': expected 12 months inclusive');
    /* And it must never reach into the current month, which is still running. */
    assert.ok(e < new Date(2026, m, 1), 'month ' + m + ' ends before the current month');
  }
});

test('the range never ends in the future', () => {
  const now = new Date();
  const r = yearRange(now);
  assert.ok(r.end < ymd(now), 'range ends ' + r.end + ', today is ' + ymd(now));
});
